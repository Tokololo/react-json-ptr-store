import { Store } from "@tokololo/json-ptr-store";
import React from "react";
import { useStoreTrigger } from "./useStore";
import { getGlobalStore } from "../store";

/**
 * Create a send command interface
 * @param store The store to use. If undefined defaults to the global store
 * @returns A function to invoke to send a command
 */
export const useSendCommand = (store?: Store) => {

    const _store = React.useMemo(() => store || getGlobalStore(), [store]);

    return (ptr: string, value?: any) => 
        _store.set([{ ptr: `/command${ptr}`, value: { value } }]);        

}

/**
 * Set a trigger on a command
 * @param ptr The json ptr into the store state
 * @param cb The callback function to run
 * @param store The store to use. If undefined defaults to the global store
 * @param deps The dependency list to guard the callback
 */
export const useTriggerCommand = <T>(
    ptr: string,
    cb: (val: T) => void,    
    store?: Store,
    deps: React.DependencyList = [],
) => {

    const _store = React.useMemo(() => store || getGlobalStore(), [store]);

    useStoreTrigger<{ value: T }>(
        `/command${ptr}`,      
        res => {
            if (res) {                
                cb(res.value);
                _store.del([`/command${ptr}`], { nextTick: true });
            }
        },
        _store,
        'strict',
        undefined,
        [ptr, store, ...deps]
    );

}