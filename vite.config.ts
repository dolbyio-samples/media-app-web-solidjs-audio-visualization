/**
 * vite.config.ts
 * @project dolbyio-demo
 * @author Samson Sham <samson.sham@dolby.com>
 */
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
    plugins: [solidPlugin()],
    build: {
        target: 'esnext',
        polyfillDynamicImport: false,
    },
});
