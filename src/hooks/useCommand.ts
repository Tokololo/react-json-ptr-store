import { Store } from "@tokololo/json-ptr-store";
import React from "react";
import { useStoreTrigger } from "./useStore";
import { getGlobalStore } from "../store";

export const useSendCommand = (store?: Store) => {

    const _store = React.useMemo(() => store || getGlobalStore(), [store]);

    return (ptr: string, value?: any) => 
        _store.set([{ ptr: `/command${ptr}`, value: { value } }]);        

}

export const useTriggerCommand = <T>(
    ptr: string,
    cb: (val: T) => void,
    deps: React.DependencyList = [],
    store?: Store
) => {

    const _store = React.useMemo(() => store || getGlobalStore(), [store]);

    useStoreTrigger<{ value: T }>(
        `/command${ptr}`,
        _store,
        res => {
            if (res) {                
                cb(res.value);
                _store.del([`/command${ptr}`], { nextTick: true });
            }
        },
        'strict',
        undefined,
        [ptr, store, ...deps]
    );

}