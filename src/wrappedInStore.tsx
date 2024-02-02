import React, { PropsWithChildren } from 'react';
import { Store, strictnessType } from '@tokololo/json-ptr-store';

let STORE: Store | undefined;

const createGlobalStore = (
    initial?: { [prop: string]: any },
    flags?: {
        next_tick?: boolean,
        strictness?: strictnessType
    }) => {

    STORE = STORE || new Store(initial, flags);
    return STORE;

}

export const GlobalStoreContext = React.createContext<Store>(createGlobalStore());

export const PageStoreContext = React.createContext<Store>(new Store());

export const wrappedInGlobalStore: React.FC<PropsWithChildren> = ({ children }) =>
    <GlobalStoreContext.Provider
        value={createGlobalStore()}>
        {children}
    </GlobalStoreContext.Provider>;

