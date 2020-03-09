export class ArrayValueHashMap<K extends string, V> {
    state: { [key: string]: readonly V[] } = {};
    constructor() {}
    addOne(key: K, value: V) {
        if (!(key in this.state)) {
            this.state[key] = [];
        }
        this.state[key] = this.state[key].concat([value]);
    }
    get(key: K): readonly V[] {
        return key in this.state ?
            this.state[key] :
            [];
    }
}
