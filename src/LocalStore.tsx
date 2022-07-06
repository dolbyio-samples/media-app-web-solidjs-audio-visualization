/**
 * LocalStore.tsx
 * @project dolbyio-demo
 * @author Samson Sham <samson.sham@dolby.com>
 */
import { createEffect } from "solid-js";
import { createStore, SetStoreFunction, Store } from "solid-js/store";

// Solidjs Store integrated with localStorage
export default function createLocalStore<T>(
    name: string,
    init: T
): [Store<T>, SetStoreFunction<T>] {
    const localState = localStorage.getItem(name);
    const [state, setState] = createStore<T>(
        init,
        localState ? JSON.parse(localState) : init
    );
    // Whenever store value is changed, update localStorage
    createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
    return [state, setState];
}