type PrependTuple<A, T extends Array<any>> = A extends undefined
    ? T
    : ((a: A, ...b: T) => void) extends (...a: infer I) => void
    ? I
    : [];

type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
    ? undefined
    : ((...b: T) => void) extends (a: any, ...b: infer I) => void
    ? I
    : [];

type FirstFromTuple<T extends any[]> = T['length'] extends 0 ? undefined : T[0];

type NumberToTuple<N extends number, L extends Array<any> = []> = {
    true: L;
    false: NumberToTuple<N, PrependTuple<1, L>>;
}[L['length'] extends N ? 'true' : 'false'];
