/**
 * Waveform.tsx
 * @project dolbyio-demo
 * @author Samson Sham <samson.sham@dolby.com>
 */
import { Component, createEffect, onCleanup, onMount } from 'solid-js';
import WaveSurfer from 'wavesurfer.js';
import EncodingSettingsModel from './EncodingSettingsModel';
import styles from './App.module.css';

const Waveform: Component = () => {
    const { audio, setDuration } = EncodingSettingsModel;

    let container!: HTMLDivElement, // Auto-referenced by the returning JSX
        wavesurfer: WaveSurfer;

    // Used for handling browser window resizing
    function responsiveHandler() {
        if (!wavesurfer) return;
        wavesurfer.setHeight(Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) * 2);
    }
    onMount(() => {
        wavesurfer = WaveSurfer.create({
            container,
            waveColor: 'violet',
            progressColor: 'purple',
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) * 2,
            responsive: true,
            interact: false,
        });
        // Obtain duration after waveform is ported
        wavesurfer.on('ready', () => {
            const duration = wavesurfer.getDuration();
            setDuration(duration);
        });
        window.addEventListener('resize', responsiveHandler);
    });
    onCleanup(() => window.removeEventListener('resize', responsiveHandler));

    createEffect(() => {
        const file = audio();
        if (file && wavesurfer) wavesurfer.loadBlob(file);
    });

    return <div ref={container} class={styles.waveContainer}></div>;
};
export default Waveform;