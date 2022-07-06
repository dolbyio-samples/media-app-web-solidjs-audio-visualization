/**
 * App.tsx
 * @project dolbyio-demo
 * @author Samson Sham <samson.sham@dolby.com>
 */
import { Component, createSignal } from 'solid-js';
import EncodingSettingsModel from './EncodingSettingsModel';
import DolbyIOAPIs, {DOLBYIO_JOB_STATUS} from './DolbyIO';
import Waveform from './Waveform';
import logo from './assets/2020_DolbyIO_Horiz_White-L.png';
import styles from './App.module.css';
import Annotations, {AnnotationsEventDispatcher} from './Annotations';

enum MEDIA {
    AUDIO,
    IMAGE,
}
enum APP_STATE {
    WAITING,
    UPLOADING,
    UPLOADED,
    ENCODING,
    ENCODED,
    ERROR
}

const App: Component = () => {
    const [progress, setProgress] = createSignal(0);
    const [state, setState] = createSignal(APP_STATE.WAITING);
    const {setAudio, audio, setAudioUrl, audioUrl} = EncodingSettingsModel;
    const DolbyIO = DolbyIOAPIs();

    function onSelectFile(type: MEDIA, event: Event) {
        const {files} = event.target as HTMLInputElement;
        const file = files && files[0];
        if (!file) return;
        if (!(event.target as HTMLInputElement).accept.split(",").map(s => s.trim()).includes(file.type)) return console.error("Invalid file type");

        switch(type) {
            case MEDIA.AUDIO:
                setAudio(file);
                uploadMedia();
                break;
            case MEDIA.IMAGE:
                AnnotationsEventDispatcher.dispatchEvent(new CustomEvent('image', {detail: file}));
                break;
        }
    }
    function uploadMedia() {
        changeState();  // enter UPLOADING state
        return DolbyIO.uploadMedia(audio(), ({loaded, total}) => setProgress((Math.floor((loaded/total)*100))))
        .then(url => {
            setAudioUrl(url);
            changeState();  // enter UPLOADED state
        })
        .catch(() => changeState(APP_STATE.ERROR));
    }
    function enhanceMedia() {
        setProgress(0);
        changeState();
        return DolbyIO.enhanceMedia(audioUrl(), (progress, status) => {
            switch(status) {
                case DOLBYIO_JOB_STATUS.PENDING:
                case DOLBYIO_JOB_STATUS.RUNNING:
                    return setProgress(progress);
                case DOLBYIO_JOB_STATUS.SUCCESS:
                    return changeState();
                case DOLBYIO_JOB_STATUS.FAILURE:
                    return changeState(APP_STATE.ERROR);
            }
        });
    }
    // State machine
    function changeState(forceState?: APP_STATE) {
        if (forceState) setState(forceState);
        switch(state()) {
            case APP_STATE.WAITING:
                return setState(APP_STATE.UPLOADING);
            case APP_STATE.UPLOADING:
                return setState(APP_STATE.UPLOADED);
            case APP_STATE.UPLOADED:
                return setState(APP_STATE.ENCODING);
            case APP_STATE.ENCODING:
                return setState(APP_STATE.ENCODED);
        }
    }
    function statusText() {
        switch(state()) {
            case APP_STATE.WAITING:
                return (<p>Please upload audio</p>);
            case APP_STATE.UPLOADING:
                return (<p><code>Uploading...{progress()}%</code></p>);
            case APP_STATE.UPLOADED:
                return (<p>Add image to annotate or start Enhancement</p>);
            case APP_STATE.ENCODING:
                return (<p><code>Enhancement...{progress()}%</code></p>);
            case APP_STATE.ENCODED:
                return (<p>Enhancement completed! Please wait for download...</p>);
            default: return (<p>Something went wrong :\(</p>);
        }
    }
    function userInput() {
        switch(state()) {
            case APP_STATE.WAITING:
                return (<div class={styles.inputFields}>Audio: <input type="file" onChange={[onSelectFile, MEDIA.AUDIO]} accept="audio/wav, audio/aac, audio/mpeg, audio/ogg, audio/webm, audio/x-m4a" /></div>);
            case APP_STATE.UPLOADED:
                return (<div class={styles.multiInputs}>
                    <div class={styles.inputFields}>Image: <input type="file" onChange={[onSelectFile, MEDIA.IMAGE]} accept="image/jpeg, image/png, image/webp" /></div>
                    <button onClick={enhanceMedia}>Enhance</button>
                </div>);
            default: return (<></>);
        }
    }
    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <img src={logo} alt="logo" />
                <div class={styles.userInterface}>
                    {statusText()}
                    {userInput()}
                </div>
            </header>
            <Annotations />
            <Waveform />
        </div>
    );
};

export default App;
