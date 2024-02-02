import { isArray, isPlainObject } from "lodash";
import { useCallback, useEffect, useState, DependencyList } from "react";
import { Observable } from 'rxjs';

const newRef = (val?: any) => {

    if (isArray(val)) return [...val];
    if (isPlainObject(val)) return { ...val };
    return val;

}

export const useObservable = <T>(
    observableGenerator: () => Observable<T>,
    deps: DependencyList,
    defaultValue: T | undefined = undefined
): [T | undefined, any, boolean] => {

    const [value, setValue] = useState<T | undefined>(defaultValue);
    const [error, setError] = useState<any>();
    const [complete, setComplete] = useState<boolean>(false);

    const cb = useCallback(observableGenerator, deps);

    useEffect(() => {

        setValue(defaultValue);
        setError(undefined);
        setComplete(false);

        const sub = cb().subscribe({
            next: (data: T) => {
                setValue((v) => v === data ? newRef(data) : data);
                setError(undefined);
            },
            error: (err: any) => {
                setValue(undefined);
                setError(err);
            },
            complete: () => setComplete(true)
        });

        return () => sub.unsubscribe();

    }, [cb]);

    return [value, error, complete];

};
