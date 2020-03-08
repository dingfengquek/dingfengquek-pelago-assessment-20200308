export interface Ok<T> {
    isOk: true;
    ok: T;
}

export interface Err<E> {
    isOk: false;
    err: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(ok: T): Ok<T> => ({ isOk: true, ok });
export const err = <E>(err: E): Err<E> => ({ isOk: false, err });
