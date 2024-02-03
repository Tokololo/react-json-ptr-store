import { Store } from '@tokololo/json-ptr-store';

let STORE: Store | undefined;

export type strictnessType = 'isEqualRemoveUndefinedSorted' | 'isEqualRemoveUndefined' | 'isEqual' | 'strict' | 'none';
export interface IStoreFlags<Strictness extends string = strictnessType> {
    nextTick?: boolean,
    strictness?: Strictness
}
export interface IStoreFlags<Strictness extends string = strictnessType> {
    nextTick?: boolean,
    strictness?: Strictness
}

/**
 * Get or create the singleton global store. Parameters only take effect during initial creation.
 * @param initial Optional initial value
 * @param flags Optional flags { nextTick?: boolean; strictness?: Strictness;}. Custom strictness to be used with custom comparer.
 * @param comparer Optional supplemental comparer function to use with custom strictness flag.
 * @returns The global Store
 */
export const getGlobalStore = (
    initial?: {[prop: string]: any },
    flags?: IStoreFlags<strictnessType>,
    comparer?: <Stricktness extends string = strictnessType>(obj1: any, obj2: any, strictness: Stricktness) => boolean) => {

    STORE = STORE || new Store(initial, flags, comparer);
    return STORE;

}