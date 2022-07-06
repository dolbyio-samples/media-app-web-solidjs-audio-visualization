/**
 * EncodingSettingsModel.tsx
 * @project dolbyio-demo
 * @author Samson Sham <samson.sham@dolby.com>
 */
import { createSignal, createRoot } from 'solid-js';

interface GraphTime {
    imgSrc: string,
    time: number
}

function EncodingSettingsModel() {
    const [duration, setDuration] = createSignal<number>(0);
    const [audioUrl, setAudioUrl] = createSignal<string>();
    const [audio, setAudio] = createSignal<File>();
    const graphTimeline = new Map<string, GraphTime>();

    return { duration, setDuration, audio, setAudio, audioUrl, setAudioUrl, graphTimeline };
}
export default createRoot(EncodingSettingsModel);