/**
 * index.tsx
 * @project dolbyio-demo
 * @author Samson Sham <samson.sham@dolby.com>
 */
/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';

render(() => <App />, document.getElementById('root') as HTMLElement);
