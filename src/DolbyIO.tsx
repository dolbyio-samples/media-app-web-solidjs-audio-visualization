/**
 * DolbyIO.tsx
 * @project dolbyio-demo
 * @author Samson Sham <samson.sham@dolby.com>
 */
import axios, { AxiosError } from 'axios';
import createLocalStore from './LocalStore';
import { blobToSHA256 } from 'file-to-sha256';
import fileDownload from 'js-file-download';

// Take in environmental variables
const CONSUMER_KEY = import.meta.env.VITE_CONSUMER_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_CONSUMER_SECRET;

const API_BASE = import.meta.env.VITE_API_BASE || "https://api.dolby.com/";
const OAUTH_API = "media/oauth2/token";
const ENHANCE_API = "media/enhance";
const INGEST_API = "media/input";
const EGRESS_API = "media/output";
const DLB_SCHEME = "dlb://";

interface DolbyIOStore {
    accessToken?: string
}
type onUploadProgressType = ({loaded, total} : {loaded: number, total: number}) => void;
type onProgressType = (progress: number, status: string) => void;

export default function DolbyIOAPIs() {
    console.assert(CONSUMER_KEY !== void 0, "[DolbyIOAPIs] CONSUMER_KEY is not specified");
    console.assert(CONSUMER_SECRET !== void 0, "[DolbyIOAPIs] CONSUMER_SECRET is not specified");
    const [store, setStore] = createLocalStore("dolbyio", {} as DolbyIOStore);
    // Lazy singleton accessor
    async function accessToken() {
        if (store.accessToken) return store.accessToken;
        return renewAccessToken();
    }
    // Ajax call to renew access token, at the same time storing it in localStorage
    async function renewAccessToken() {
        const newAccessToken = await obtainAccessToken();
        setStore("accessToken", newAccessToken);
        return newAccessToken;
    }

    /**
     * Public API functions
     */
    async function uploadMedia(file?: File, onUploadProgress?: onUploadProgressType) {
        if (!file) return;
        return uploadMediaToDolbyIO({
            file,
            accessToken: await accessToken(),
            renewAccessToken,
            onUploadProgress
        });
    }
    async function enhanceMedia(audioUrl?: string, onProgress?: onProgressType) {
        if (!audioUrl) throw "File not uploaded";
        return enhanceMediaUsingDolbyIO({
            audioUrl,
            onProgress,
            accessToken: await accessToken(),
            renewAccessToken,
        });
    }

    return {
        uploadMedia,
        enhanceMedia,
    };
}

/**
 * Private methods
 */

interface probeJobArg {
    jobId: string,
    accessToken: string,
    intervalSec?: number,
    onProgress?: onProgressType,
}
export const DOLBYIO_JOB_STATUS = {
    PENDING: "Pending",
    RUNNING: "Running",
    SUCCESS: "Success",
    FAILURE: "Failed",
}
// Constantly probe for job status at intervalSec until job is finalized (Success or Failure)
async function probeJob(arg : probeJobArg): Promise<void> {
    const {jobId, accessToken, onProgress, intervalSec = 5} = arg;
    return axios({
        url: (new URL(ENHANCE_API, API_BASE)).toString(),
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        params: {
            'job_id': jobId
        },
    })
    .then(response => response.data)
    .then(data => {
        const {progress, status} = data;
        // Calling feedback function to report progress & status
        if (onProgress) onProgress(progress, status);
        switch(status) {
            // Continue probing if state is Pending or Running
            case DOLBYIO_JOB_STATUS.PENDING:
            case DOLBYIO_JOB_STATUS.RUNNING:
                return new Promise((resolve) => setTimeout(resolve, intervalSec*1000))
                    .then(() => probeJob(arg));
            // Otherwise quit probing
            case DOLBYIO_JOB_STATUS.SUCCESS:
                return;
            default:
                throw new Error(JSON.stringify(data));
        }
    });
}

interface DolbyIOInterface {
    accessToken: string, 
    renewAccessToken: () => Promise<string>, 
}

interface EnhanceMediaArg extends DolbyIOInterface {
    audioUrl: string,
    onProgress?: onProgressType,
}
async function enhanceMediaUsingDolbyIO(arg: EnhanceMediaArg): Promise<void> {
    const {audioUrl, onProgress, accessToken, renewAccessToken} = arg;
    const output = audioUrl.replace(/\.[^.]+$/, "-enhanced$&");
    // Start encoding Job
    return axios({
        method: 'POST',
        url: (new URL(ENHANCE_API, API_BASE)).toString(),
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        data: {
            input: audioUrl,
            output,
        },
    })
    .then(response => response.data.job_id)
    // Track encoding progress
    .then(jobId => probeJob({
        jobId,
        accessToken,
        onProgress,
    }))
    // Download Media
    .then(() => downloadMedia(output, accessToken, audioUrl.replace(DLB_SCHEME, "")))
    // Handle token expiration
    .catch((error: AxiosError) => {
        if (isAccessTokenExpired(error)) {
            return renewAccessToken()
            .then(newAccessToken => enhanceMediaUsingDolbyIO({...arg, accessToken: newAccessToken}));
        }
        throw error;
    });
}
async function downloadMedia(outputUrl: string, accessToken: string, outputFilename: string) {
    return axios({
        url: (new URL(EGRESS_API, API_BASE)).toString(),
        params: {
            url: outputUrl,
        },
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    // Since previous request uses Authorization header
    // the header is mistakenly carried on by browser redirection 
    // causes conflicting Authorization mechanics
    // a hack is required
    .catch(error => {
        // Expecting HTTP 400 Bad Request from AWS
        if (error.response.status !== 400) throw error;
        const url = error.request.responseURL;  // Presigned URL
        return axios({
            url,
            responseType: 'blob',
        });
    })
    .then(response => response.data)
    // Trigger file download from browser
    .then(file => fileDownload(file, outputFilename));
}

interface UploadMediaArg extends DolbyIOInterface{
    file: File,
    onUploadProgress?: onUploadProgressType,
}
async function uploadMediaToDolbyIO(arg: UploadMediaArg): Promise<string> {
    const {file, onUploadProgress, accessToken, renewAccessToken} = arg;
    // Calculate SHA256 hash to avoid filename collisions or violations
    const fileHash = await blobToSHA256(file);
    const url = `${DLB_SCHEME}${fileHash}.${file.name.split('.').pop()}`;
    // Obtain Presigned URL
    return axios({
        method: 'POST',
        url: (new URL(INGEST_API, API_BASE)).toString(),
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        data: {
            url,
        },
    })
    .then(response => response.data.url)
    .then(url => axios({
        method: 'PUT',
        url,
        data: file,
        onUploadProgress,
    }))
    .then(() => url)
    // Handle token expiration
    .catch(error => {
        if (isAccessTokenExpired(error)) {
            return renewAccessToken()
            .then(newAccessToken => uploadMediaToDolbyIO({...arg, accessToken: newAccessToken}));
        }
        throw error;
    });
}

// Cautions: This method should be implemented on the backend to secure the Key & Secret
async function obtainAccessToken(): Promise<string> {
    // Encode string to base64
    const base64APIKey = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
    // Dolby.io only accepts 'x-www-form-urlencoded' for this particular request
    return axios({
        method: 'POST',
        url: (new URL(OAUTH_API, API_BASE)).toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${base64APIKey}`
        },
        data: new URLSearchParams({
            grant_type: 'client_credentials',
        }).toString(),
    })
    .then(response => response.data.access_token);
}

interface DolbyIOAPIError {
    type: string,
    title: string,
    status: number,
    instance: string,
    detail: string,
}
function isAccessTokenExpired(error: AxiosError) {
    if (!error.response) throw error;
    if (error.response.status !== 401) throw error;
    /**
     * {
            "type": "/problems/access-token-expired",
            "title": "Authentication Failure",
            "status": 401,
            "instance" : "/media/jobs",
            "detail" : "Access Token expired"
        }
     */
    if (!error.response.data || (error.response.data as DolbyIOAPIError).type !== "/problems/access-token-expired") throw error;
    return true
}
