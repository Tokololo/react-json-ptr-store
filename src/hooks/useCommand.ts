import { Store } from "@tokololo/json-ptr-store";
import { DependencyList, useContext } from "react";
import { useStoreTrigger } from "./useStore";
import { GlobalStoreContext } from "../wrappedInStore";

export const useSendCommand = (store?: Store) => {

    const gStore = useContext(GlobalStoreContext);

    return (ptr: string, value?: any) =>
        (store || gStore).set([{ ptr: `/command${ptr}`, value: { value } }]);

}

export const useTriggerCommand = <T>(
    ptr: string,
    cb: (val: T) => void,
    deps: DependencyList = [],
    store?: Store
) => {

    const gStore = useContext(GlobalStoreContext);

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