
# What is react-json-ptr-store?
React-json-ptr-store is a [rxjs](https://www.npmjs.com/package/rxjs) reactive store that uses [json-ptr-store](https://github.com/Tokololo/json-ptr-store#readme) to manage state. State is set and retrieved via [json pointers](https://datatracker.ietf.org/doc/html/rfc6901). It is intuitive, minimalist yet powerful.
> Please look at documentation for [json-ptr-store](https://github.com/Tokololo/json-ptr-store#readme).  
> For the latest documentation please consult the repo  [readme](https://github.com/Tokololo/react-json-ptr-store#readme).  
> If you like react-json-ptr-store also have a look at [react-json-ptr-form](https://github.com/Tokololo/react-json-ptr-form#readme).
# How to use
## Create a store
There are two types of stores you can create.

 The **first** is the global singleton store that is available application-wide. You can create/access it in three ways:

    const store = getGlobalStore();
    const store = useGlobalStore();
    implicitly

Parameters are as follows:

 - initial?: {[prop:  string]:  any }, 
 - flags?: IStoreFlags<strictnessType>, 
 - comparer?: <Stricktness  extends  string = strictnessType>(obj1:  any, obj2:  any, strictness:  Stricktness) => boolean)  
the meaning of which you can check on the json-ptr-store documentation. Parameters only take effect the very first time it is passed in. 

getGlobalStore should be at the top of your App.js file, outside of the react functional code.
useGlobalStore should be inside your react function code inside your App.js file.

The **second** store is a section store (for use on individual pages if you like). It is created as follows:

    const store = useStore();

Parameters are as follows:

 - initial?: {[prop:  string]:  any }, 
 - flags?: IStoreFlags<strictnessType>, 
 - comparer?: <Stricktness  extends  string = strictnessType>(obj1:  any, obj2:  any, strictness:  Stricktness) => boolean)

It is to be used with Context as follows:

    const store = useStore();
    <SectionStoreContext.Provider value={store}>
      ...
    </SectionStoreContext.Provider>;

Code within your SectionStoreContext tree can then access the store as follows:

    const store = useContext(SectionStoreContext);
## Set values
You set values in your store in four ways:

**Firstly** during store creation.

**Secondly** inside hooks and event callback code as follows:

    const onClick = () => { 
      store.set([{ptr: '/pages/home/title', value: 'My Title'}]);
    }

**Thirdly** inside your React  rendering code as follows: 

    useStoreSet([{ptr: '/pages/home/title', value: 'My Title'}], store); 
Parameters are as follows:

 - data: { ptr:  string, value:  any }[],  
 - store?:  Store,  
 - deps:  React.DependencyList  = []

If you do not provide a store for the second parameter it defaults to the global store. The third parameter is a dependency array that you need to manage should you wish to change the data array.

**Lastly** when subscribing via a get you have the option of setting a default value.
## Slice values
You slice values inside hooks and callback code as follows:

    const value = store.Slice<string>('/pages/home/title');
Parameters are as follows:

 - ptr:  string,  
 - clone?:  boolean,  
 - defaultValue?:  T

## Subscribe to values
You subscribe to values inside your react rendering code as follows:

    const title = useStoreGet<string>('/pages/home/title', store);

Parameters are as follows:
 - ptr:  string, 
 - store?:  Store, 
 - defaultValue?:  T, 
 - initialValue?:  T,
 - strictness:  strictnessType  =  'none'
 
If you do not provide a store for the second parameter it defaults to the global store. Use defaultValue to initialise the value at that ptr. Use initialValue to return that value during the first render.

A typical use case for setting initialValue is for lists, ie:

    const myList = useStoreGet<string[]>(
	    '/data/myList', 
	    store,
	    undefined, // No defaultValue as there is already data
	    []);       // Set to an empty array for first render

A typical use case for setting defaultValue involves setting initialValue to the same as in:

    const items: string[] = ["Your free coupon"];
    const myAddedItems = useStoreGet<string[]>(
	    '/data/myAddedItems', 
	    store,
	    items,  // will take effect on next render
	    items); // return on first render
If you cannot set a default and want the actual value on the first render you can always set the initialValue to a slice at that ptr:

    const myList = useStoreGet<string[]>(
        '/data/myList', 
        store,
        undefined,
        store.slice<string[]>('/data/myList'));

## Subscribe and transform values
You can transform values as you subscribe to them:

    const title = useStoreTransform<string, string>(
        '/pages/home/title',         
        o => o.pipe(map(title => title.toLocaleUppercase())),
        store);
You can also filter and run side-effects via tap:

     const showAlert = useStoreTransform<LedgerLines[], boolean>(
         '/ledger/lines',         
          o => o.pipe(
              map(lines => lines.reduce((acc, cur) => acc + cur.total, 0)),
              tap(total => store.set([{ptr: '/ledger/total', value: total }])),
              filter(total => total > MAX_ALLOWED),
              map(total => true)
          )
     ), store);
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


## Trigger callback code
You can subscribe to values and trigger callback code:

    useStoreTrigger(
      '/pages/home/title',        
      (value) => {
          document.title = value;
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
## Complex subscription
You can also directly retrieve an observable into the store. 

    const obs = store.get<User>('/users/534');
You need to manually subscribe to the observable and you can clean up after the observable when you are done, though the store will eventually clean up after itself should it go out of scope.
In addition, if you use the preferred method of subscribing to the observable via `useObservable` it will be taken care of automatically and timeously.

You can then use them as you would any observable, ie.:

    const [userColor] = useObservable<COLOR>(
      () => store.get(`/users/${id}`).pipe(
        switchMap(user => store.get(`/colors/${user.color}`))
      )
    ), [id]);

## Commands
The store provides an simple yet effective commands interface. Commands are handy when you need to send the same values and be notified every time and to run side-effects. 

useStoreGet will update values depending on the strictness you implement and it will always provide a new reference for arrays and object literals to React so as to ensure re-rendering takes place. Under the hood that is provided by useObservable. For scalar values like numbers and strings that is not the case and will not be a problem for re-rendering as your intention would be not to re-render if a scalar value stays the same. 

Command on the other hand will trigger for every command that it receives, even if its scalar value it passes is the same. It is used as follows:

    useTriggerCommand<User>(
       '/submitted_user', 
       user => addToList(user),
    [addToList]);

Parameters are as follows:

 - ptr:  string,
 - cb: (val:  T) =>  void, 
 - store?:  Store,
 - deps:  DependencyList  = [],

If you do not provide a value for the store it defaults to the global store. Note the second parameter which is a callback that you can use to run side-effects.
Use the deps dependency list to manage dependencies inside the callback.
###

    const sendCommand = useSendCommand();
    const onSubmitted = (user: User) => {
       sendCommand('/submitted_user', user);
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

## Side-effects
Side-effects are performed:

### in hooks and callback code

    useEffect(() => {
       store.set('/pages/home/title', 'My Title');
    }, []);

### in useStoreTransform observable using tap, switchMap etc.

    useStoreTransform<string, string>(
      '/pages/home/title', 
      o => o.pipe(tap(title => runMySideEffect(title))), 
      store);

### in useStoreTrigger cb code

    useStoreTrigger(
      '/pages/home/title', 
      (value) => { 
        mySideEffect(value);
      }, store);

### outside of your react code if it is to be done to the global store

    const userPrefs = await(...);
    const store = getGlobalStore();
    store.set([{ptr: '/pages/home/api_data/getUserPrefs', value: userPrefs}]);

### using useObservable

    const [data] = useObservable(() => 
      userDataObservable(session_uid)
        .pipe(tap(user => console.log('run effect here'))), 
      [session_uid]);

Parameters are as follows:

 - observableGenerator: () =>  Observable<T>,
 - deps:  DependencyList,
 - defaultValue:  T  |  undefined  =  undefined

useObservable takes an observable generator function as its first parameter. This is just a function that returns an observable. Each time the deps dependency list changes the generator function is rerun so as to generate a new observable that has the new dependencies in scope.

useObservable can be used with store.get() directly and also with other observables, promises and dom event code.

    const userPrefs = useObservable(() => 
      defer(() => from(fetch(`http://myserver.com/userPrefs/${id}`))), 
    [id]);  // when id changes the observable will run again   

    const total = useObservable(() => combineLatest([  
        store.get<number>('/total1'),  
        store.get<number>('/total2')  
      ]).pipe(  
        map(([total1, total2]) => total1 + total2)
      ),  
    []);

### inside Commands

    useTriggerCommand(
       `/submitted_user/${props.id}`, 
       _ => setBlurred(),
    [props.id, setBlurred]);

## Observables
The store works with observables so you can combine, tranform, slice and dice as you requirements demand to great compexity not shown here.
# Change Log
## version 2.0.3
 - Update json-ptr-store to version 1.1.5 which removed undefined set limitation