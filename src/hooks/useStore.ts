import React from "react";
import { Observable, of, skip as _skip, switchMap, tap } from "rxjs";
import { useObservable } from "./useObservable";
import { Store, IStoreFlags, strictnessType } from "@tokololo/json-ptr-store";
import { getGlobalStore } from "../store";

/**
 * Hook to retrieve the singleton global store. Parameters only take effect during initial creation.
 * @param initial Optional initial value
 * @param flags Optional flags { nextTick?: boolean; strictness?: Strictness;}. Custom strictness to be used with custom comparer.
 * @param comparer Optional supplemental comparer function to use with custom strictness flag.
 * @returns The singleton global store
 */
export const useGlobalStore = (
    initial?: { [prop: string]: any },
    flags?: IStoreFlags<strictnessType>,
    comparer?: <Stricktness extends string = strictnessType>(obj1: any, obj2: any, strictness: Stricktness) => boolean
) => getGlobalStore(initial, flags, comparer);

/**
 * Section store context to use on pages etc.
 */
export const SectionStoreContext = React.createContext<Store>(new Store());

/**
 * Hook to create a store
 * @param initial 
 * @param flags 
 * @param deps 
 * @returns 
 */
export const useStore = (
    initial?: { [prop: string]: any },
    flags?: IStoreFlags
) => {

    const store = React.useMemo(() => new Store(initial, flags), []);

    React.useEffect(() => {
        return () => store?.destroy();
    }, []);

    return store;

}

/**
 * Hook that subscribes to the store at a json pointer value
 * @param ptr 
 * @param store 
 * @param defaultValue 
 * @param initialValue 
 * @param strictness 
 * @returns 
 */
export const useStoreGet = <T = any>(
    ptr: string,
    store: Store,
    defaultValue?: T,
    initialValue?: T,
    strictness: strictnessType = 'none'): T | undefined => {

    const [val] = useObservable<T>(() =>
        typeof defaultValue !== 'undefined' ?
            of(defaultValue).pipe(
                tap(value => store.set([{ ptr, value }], { nextTick: false })),
                switchMap(() => store.get(ptr, strictness))
            ) :
            store.get(ptr, strictness), [ptr, store], initialValue);

    return val;

}

/**
 * Hook to transform a json pointer store subscription
 * @param ptr 
 * @param store 
 * @param observable 
 * @param observableDeps 
 * @param defaultValue 
 * @param initialValue 
 * @param strictness 
 * @returns 
 */
export const useStoreTransform = <IN = any, OUT = any>(
    ptr: string,
    store: Store,
    observable: (observable: Observable<IN>) => Observable<OUT>,
    observableDeps: React.DependencyList = [],
    defaultValue?: IN,
    initialValue?: OUT,
    strictness: strictnessType = 'none'): OUT | undefined => {

    const [val] = useObservable<OUT | undefined>(() =>
        observable(
            typeof defaultValue !== 'undefined' ?
                of(defaultValue).pipe(
                    tap(value => store.set([{ ptr, value }], { nextTick: false })),
                    switchMap(() => store.get<IN>(ptr, strictness))
                ) :
                store.get<IN>(ptr, strictness)), [ptr, store, ...observableDeps], initialValue);

    return val;

}

/**
 * Hook to set a store value
 * @param store 
 * @param data 
 * @param deps 
 */
export const useStoreSet = (store: Store, data: { ptr: string, value: any }[], deps: React.DependencyList = []) => {

    React.useEffect(() => {
        store.set(data);
    }, [...deps]);

}

/**
 * Hook to call a callback when a value at a json pointer changes
 * @param ptr 
 * @param store 
 * @param cb 
 * @param strictness 
 * @param _skip 
 * @param deps 
 */
export const useStoreTrigger = <T>(
    ptr: string,
    store: Store,
    cb: (value: T | undefined) => void,
    strictness: strictnessType = 'none',
    skip: number = 1,
    deps: React.DependencyList | undefined = []): void => {

    React.useEffect(() => {

        const sub = store.get(ptr, strictness)
            .pipe(_skip(skip)).subscribe(cb);

        return () => sub.unsubscribe();

    }, [ptr, ...deps]);

}