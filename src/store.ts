import React from 'react';
import { Store } from '@tokololo/json-ptr-store';

const STORE = new Store();

export const getGlobalStore = STORE;

export const PageStoreContext = React.createContext<Store>(new Store());

export const useGlobalStore = () => STORE;
