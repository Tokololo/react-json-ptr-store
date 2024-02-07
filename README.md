
# What is react-json-ptr-store?
React-json-ptr-store is a reactive store/state that uses json-ptr-store  to manage state. State is set and retrieved via json-pointers.
> Please look at documentation for [json-ptr-store](https://www.npmjs.com/package/@tokololo/json-ptr-store).
> This is the engine that powers [react-json-ptr-form](https://www.npmjs.com/package/@tokololo/react-json-ptr-form).
# How to use
## Creating a store
There are two types of stores you can create.

 The first is the global singleton store that is available application-wide. You can create/access it in three ways:

    const store = getGlobalStore();
    const store = useGlobalStore();
    implicitly

Parameters are as follows:

 - initial?: {[prop:  string]:  any }, 
 - flags?: IStoreFlags<strictnessType>, 
 - comparer?: <Stricktness  extends  string = strictnessType>(obj1:  any, obj2:  any, strictness:  Stricktness) => boolean)
the meaning of which you can check on the json-ptr-store documentation. Parameters only take effect the very first time it is passed in. 

getGlobalStore should be at the top of your App.js file, outside of the react functional code.
useGlobalStore should be inside your react function code inside yoru App.js file.

The second store is a section store (for use on individual pages if you like). It is created as follows:

    const store = useStore();

Parameters are as follows:

 - initial?: {[prop:  string]:  any }, 
 - flags?: IStoreFlags<strictnessType>, 
 - comparer?: <Stricktness  extends  string = strictnessType>(obj1:  any, obj2:  any, strictness:  Stricktness) => boolean)

It is to be used with Context as follows:

    <SectionStoreContext.Provider value={store}>
    ...
    </SectionStoreContext.Provider>;

Code within your SectionStoreContext tree can then access the store as follows:

    const store = useContext(SectionStoreContext);
## Setting values
You set values in your store in three ways:

Firstly during store creation.

Secondly inside hooks and event callback code as follows:

    const onClick = () => { 
      store.set([{ptr: '/pages/home/title', value: 'My Title'}]);
    }

Lastly inside your React  rendering code as follows: 

    useStoreSet([{ptr: '/pages/home/title', value: 'My Title'}], store); 
Parameters are as follows:

 - data: { ptr:  string, value:  any }[],  
 - store?:  Store,  
 - deps:  React.DependencyList  = []

If you do not provide a store for the second parameter it defaults to the global store. The third parameter is a dependency array that you need to manage should you wish to change the data array.
## Slicing values
You slice values inside hooks and callback code as follows:

    const value = store.Slice<string>('/pages/home/title');
Parameters are as follows:

 - ptr:  string,  
 - clone?:  boolean,  
 - defaultValue?:  T

## Subscribing to values
You subscribe to values inside your react rendering code as follows:

    const title = useStoreGet<string>('/pages/home/title', store);

Parameters are as follows:
 - ptr:  string, 
 - store?:  Store, 
 - defaultValue?:  T, 
 - initialValue?:  T,
 - strictness:  strictnessType  =  'none'
 
If you do not provide a store for the second parameter it defaults to the global store.
### 

    const title = useStoreTransform<string, string>(
        '/pages/home/title',         
        o => o.pipe(map(title => title.toLocalUppercase())),
        store);

Parameters are as follows:

 - ptr:  string,   
 - observable: (observable: Observable<IN>) =>  Observable<OUT>, 
 - store?:  Store, 
 - defaultValue?:  IN, 
 - initialValue?:  OUT, 
 - strictness:  strictnessType  =  'none',
 - deps: React.DependencyList  = [], 

If you do not provide a value for the store it defaults to the global store. Note the second parameter which is an observable that you can pipe to tranform, or even tap for side-effects.
Use the deps dependency list to manage dependencies inside the observable.
###

    useStoreTrigger(
      '/pages/home/title',        
      (value) => {
      ...
      },
      store);
Parameters are as follows:

 - ptr:  string,  
 - cb: (value:  T  |  undefined) =>  void,
 - store?:  Store,
 - strictness:  strictnessType  =  'none',
 - skip:  number  =  1,
 - deps:  React.DependencyList  |  undefined  = []

If you do not provide a value for the store it defaults to the global store. Note the second parameter which is a callback that you can use to run side-effects.
Use the deps dependency list to manage dependencies inside the callback.

## Side-effects
Side-effects are performed:

in hooks and callback code as follows:

    useEffect(() => {
       store.set('/pages/home/title', 'My Title');
    }, []);

in useStoreTransform observable using tap

in useStoreTrigger cb code

outside of your react code if it is to be done to the global store as follows:

    const userPrefs = await(...);
    const store = getGlobalStore();
    store.set([{ptr: '/pages/home/api_data/getUserPrefs', value: userPrefs}]);
Using useObservable:

    const [data] = useObservable(() => userDataObservable(session_uid).pipe(tap(user => console.log('run effect here'))), [session_uid]);

Parameters are as follows:

 - observableGenerator: () =>  Observable<T>,
 - deps:  DependencyList,
 - defaultValue:  T  |  undefined  =  undefined

useObservable can be used with store.get() directly and also with other observables, promises and dom event code. It is the ideal mechanism for fetch.

Inside commands

    useTriggerCommand(
       `/submitted_user/${props.id}`, 
       _ =>  setBlurred(),
    [props.id, setBlurred]);

## Commands
The store provides an simple yet effective commands interface. Commands are handy when you need to send the same values and be notified every time and to run side-effects. 

useStoreGet will update values depending on the strictness you implement and it will always provide a new reference for arrays and object literals to React so as to ensure re-rendering takes place. Under the hood that is provided by useObservable. For simple values like numbers and strings that is not the case and will not be a problem for re-rendering as your intention would be not to re-render if a simple value stays the same. 

Command on the other hand will trigger for every command that it receives, even if its simple value it passes is the same. It is used as follows:

    useTriggerCommand(
       `/submitted_user/${props.id}`, 
       _ =>  setBlurred(),
    [setBlurred]);

Parameters are as follows:

 - ptr:  string,
 - cb: (val:  T) =>  void, 
 - store?:  Store,
 - deps:  DependencyList  = [],

If you do not provide a value for the store it defaults to the global store. Note the second parameter which is a callback that you can use to run side-effects.
Use the deps dependency list to manage dependencies inside the callback.
###

    const sendCommand = useSendCommand();
    const onClicked = (id: string, data: IUserData) => {
    	sendCommand(`/users/${id}`, data);
    }
Parameters are as follows for useSendCommand:

 - store?:  Store
 
If you do not provide a value for the store it defaults to the global store.
useSendCommand returns a function that you call with parameters as follows:
 - ptr:  string,  
 - value?:  any
###

    const sendCommandFn = useSendCommand();
    sendCommandFn('/pages/home'/heading', 'Hello World'));


## Observables
The store works with observables so you can combine, tranform, slice and dice as you requirements demand to great compexity not shown here.





