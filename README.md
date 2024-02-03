
# What is react-json-ptr-store?
React-json-ptr-store is a reactive store/state that uses json-ptr-store  to manage state. State is set and retrieved via json-pointers.
> Please look at documentation for [json-ptr-store](https://github.com/Tokololo/json-ptr-store).
# How to use
## Creating a store
There are two stores you can create:
The first is the global singleton store that is available application-wide. You can create/access it in two ways:

    const store = getGlobalStore();

Parameters are as follows:

 - initial?: {[prop: string]:  any }, 
 - flags?: IStoreFlags<strictnessType>, 
 - comparer?: <Stricktness  extends  string = strictnessType>(obj1:  any, obj2:  any, strictness:  Stricktness) => boolean)

the meaning of which you can check on the json-ptr-store documentation. Parameters only take effect the very first time it is passed in. The above method of creating/accessing a store should be at the top of your App.js file, outside of the react functional code.

    const store useGlobalStore();

Same construction parameters as getGlobalStore(). As it is a hook is should be called within you React code in App.js file.

The second store is a section store (for use on individual pages if you like). It is created as follows:

    const store = useStore();

I takes the same three parameters. It is to be used with Context as follows:

    <SectionStoreContext.Provider value={store}>
    ...
    </SectionStoreContext.Provider>;

Code within your SectionStoreContext tree can then access the store as follows:

    const store = useContext(SectionStoreContext);
## Setting values
You set values in your store in three ways:

During store creation.

Inside hooks and event callback code as follows:

    const onClick = () => { 
      store.set([{ptr: '/pages/home/title', value: 'My Title'}]);
    }

Inside your React  rendering code as follows: 

    useStoreSet(store, [{ptr: '/pages/home/title', value: 'My Title'}]); 
Parameters are as follows:

 - store: Store,  
 - data: { ptr:  string, value:  any }[],  
 - deps: React.DependencyList  = []

The third parameter is a dependency array that you need to manage.
## Slicing values
You slice values inside hooks and callback code as follows:

    const value = store.Slice<string>('/pages/home/title');
Parameters are as follows:

 - ptr: string,  
 - clone?: boolean,  
 - defaultValue?: T

## Subscribing to values:
You subscribe to values inside your react rendering code as follows:

    const title = useStoreGet<string>('/pages/home/title', store);

Parameters are as follows:
 - ptr: string, 
 - store: Store, 
 - defaultValue?: T, 
 - initialValue?: T,
 - strictness: strictnessType = 'none'

### 

    const title = useStoreTransform<string, string>(
        '/pages/home/title', 
        store,
        o => o.pipe(map(title => title.toLocalUppercase())));

Parameters are as follows:

 - ptr: string,   
 - store: Store, 
 - observable: (observable: Observable<IN>) => Observable<OUT>, 
 - observableDeps: React.DependencyList  = [], 
 - defaultValue?: IN, 
 - initialValue?: OUT, 
 - strictness: strictnessType = 'none'

Note the third parameter which is an observable that you can pipe to tranform, or even tap for side-effects
###

    useStoreTrigger(
      '/pages/home/title',  
      store,
      (value) => {
      ...
      });
Parameters are as follows:

 - ptr: string, 
 - store: Store,
 - cb: (value: T | undefined) => void,
 - strictness: strictnessType = 'none',
 - skip: number = 1,
 - deps:  React.DependencyList  |  undefined  = []
## Side-effects
Side-effects are performed:
in hooks and callback code as follows:

    useEffect(() => {
       store.set('/pages/home/title', 'My Title');
    }, []);

in useStoreTransform as shown above

in useStoreTrigger cb code

outside of your react code if it is to be done to the global store as follows:

    const userPrefs = await(...);
    const store = getGlobalStore();
    store.set([{ptr: '/pages/home/api_data/getUserPrefs', value: userPrefs}]);
Using useObservable:

    const [data] = useObservable(() => userDataObservable(session_uid), [session_uid]);

Parameters are as follows:

 - observableGenerator: () => Observable<T>,
 - deps: DependencyList,
 - defaultValue: T | undefined = undefined

useObservable can be used with store.get() directly and also with other observables, promises and dom event code. It is the ideal mechanism for fetch.

inside commands

    useTriggerCommand(
       `/submitted_user/${props.id}`, 
       _ => setBlurred(),
    [props.id, setBlurred]);

## Commands
The store provides an simple yet effective commands interface. Commands are handy when you need to send the same values and be notified every time and to run side-effect. 

useStoreGet will update values depending on the strictness you implement and it will always provide a new reference for arrays and object literals to react so as to ensure re-rendering takes place. Under the hood that is provided by useObservable. For simple values like numbers and string that is not the case and will not be a problem for re-rendering as your intention would be not to re-render if a string stays the same. 

Command on the other hand will trigger for every command that it receives, even if its simple value it passes is the same and you can then decide what to do with the values. It is used as follows:

    useTriggerCommand(
       `/submitted_user/${props.id}`, 
       _ => setBlurred(),
    [props.id, setBlurred]);

Parameters are as follows:

 - ptr: string,
 - cb: (val: T) => void,
 - deps: DependencyList = [],
 - store?: Store

If not store is passed in it defaults to the global store
###

    const sendCommand = useSendCommand();
    const onClicked = (id: string, data: IUserData) => {
    	sendCommand(`/users/${id}`, data);
    }
Parameters are as follows for useSendCommand:

 - store?: Store
If no store is provided it defaults to the global store

useSendCommand return a function with parameters as follows:
 - ptr: string,  
 - value?: any

## Observables
The store works with observables so you can combine, tranform, slice and dice as you requirements demand to great compexity not shown here.

## Strict mode
If any store function gives issues please disable strict mode during development.
