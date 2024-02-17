import React, { useMemo } from "react";
import { Observable, of, skip as _skip, switchMap, tap } from "rxjs";
import { useObservable } from "./useObservable";
import { IStoreFlags, IStorePtr, Store, strictnessType } from "@tokololo/json-ptr-store";
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
 * @param comparer Optional supplemental comparer function to use with custom strictness flag.
 * @returns The created store
 */
export const useStore = (
    initial?: { [prop: string]: any },
    flags?: IStoreFlags,
    comparer?: <Stricktness extends string = strictnessType>(obj1: any, obj2: any, strictness: Stricktness) => boolean
) => {

    const store = React.useMemo(() => new Store(initial, flags, comparer), []);

    React.useEffect(() => {
        return () => store?.destroy();
    }, []);

    return store;

}

/**
 * Hook that subscribes to the store at a json pointer value
 * @param ptr The json ptr into the store state
 * @param store The store to use. If undefined defaults to the global store
 * @param defaultValue The default value to set the value to
 * @param initialValue The initial value to return on the first render
 * @param strictness The strictness compare type
 * @returns The value at the json ptr
 */
export const useStoreGet = <T = any>(
    ptr: string,
    store?: Store,
    defaultValue?: T,
    initialValue?: T,
    strictness: strictnessType = 'none'): T | undefined => {

    const _store = useMemo(() => store || getGlobalStore(), [store]);
    const [val] = useObservable<T>(() =>
        typeof defaultValue !== 'undefined' ?
            of(defaultValue).pipe(
                tap(value => _store.set([{ ptr, value }], { nextTick: false })),
                switchMap(() => _store.get(ptr, strictness))
            ) :
            _store.get(ptr, strictness), [ptr, store, strictness], initialValue);

    return val;

}

/**
 * Hook to transform a json pointer store subscription
 * @param ptr The json ptr into the store state
 * @param observable The observable to transform
 * @param store The store to use. If undefined defaults to the global store
 * @param defaultValue The default value to set the value to
 * @param initialValue The initial value to return on the first render
 * @param strictness The strictness compare type
 * @param deps The dependency list to guard the observable
 * @returns The value at the json ptr transformed
 */
export const useStoreTransform = <IN = any, OUT = any>(
    ptr: string,
    observable: (observable: Observable<IN | undefined>) => Observable<OUT | undefined>,
    store?: Store,
    defaultValue?: IN,
    initialValue?: OUT,
    strictness: strictnessType = 'none',
    deps: React.DependencyList = []): OUT | undefined => {

    const _store = useMemo(() => store || getGlobalStore(), [store]);
    const [val] = useObservable<OUT | undefined>(() =>
        observable(
            typeof defaultValue !== 'undefined' ?
                of(defaultValue).pipe(
                    tap(value => _store.set([{ ptr, value }], { nextTick: false })),
                    switchMap(() => _store.get<IN>(ptr, strictness))
                ) :
                _store.get<IN>(ptr, strictness)), [ptr, store, strictness, ...deps], initialValue);

    return val;

}

/**
 * Hook to set a store value
 * @param data The IStorePtr array to set
 * @param store The store to use. If undefined defaults to the global store
 * @param deps The dependency list to guard the data array
 * @param delUnmount Delete the set pointers on unmount. @TODO move above deps on major version update.
 */
export const useStoreSet = (
    data: IStorePtr[],
    store?: Store,
    deps: React.DependencyList = [],
    delUnmount?: boolean) => {

    React.useEffect(() => {
        const ptrs = data.map(d => d.ptr);
        const _store = store || getGlobalStore();
        _store.set(data);
        return () => {
            if (delUnmount)
                _store.del(ptrs);
        }
    }, [store, ...deps]);

}

/**
 * Hook to call a callback when a value at a json pointer changes
 * @param ptr The ptr into the store state
 * @param cb The callback function to run
 * @param store The store to use. If undefined defaults to the global store
 * @param strictness The strictness compare type
 * @param skip The total number of initial tiggers to skip. Defaults to 1.
 * @param deps The dependency list to guard the callback
 */
export const useStoreTrigger = <T>(
    ptr: string,
    cb: (value: T | undefined) => void,
    store?: Store,
    strictness: strictnessType = 'none',
    skip: number = 1,
    deps: React.DependencyList | undefined = []): void => {

    React.useEffect(() => {

        const _store = store || getGlobalStore();
        const sub = _store.get(ptr, strictness)
            .pipe(_skip(skip)).subscribe(cb);

        return () => sub.unsubscribe();

    }, [ptr, store, strictness, skip, ...deps]);

}