import { Store } from "@tokololo/json-ptr-store";
import { DependencyList } from "react";
import { useGlobalStore, useStoreTrigger } from "./useStore";

export const useSendCommand = (store?: Store) => {

    const gStore = useGlobalStore();

    return (ptr: string, value?: any) =>
        (store || gStore).set([{ ptr: `/command${ptr}`, value: { value } }]);

}

export const useTriggerCommand = <T>(
    ptr: string,
    cb: (val: T) => void,
    deps: DependencyList = [],
    store?: Store
) => {

    const gStore = useGlobalStore();

    useStoreTrigger<{ ptr: string, value: any }>(
        `/command${ptr}`,
        (store || gStore),
        res => {
            if (res) {
                cb(res.value);
                (store || gStore).del([`/command${ptr}`], { nextTick: true });
            }
        },
        'strict',
        undefined,
        deps
    );

}