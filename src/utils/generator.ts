export function generateItems<T>(count: number, fn: (i: number) => T): T[] {
    const res: T[] = []
    for (let i=0; i<count; i++) {
        res.push(fn(i))
    }
    return res
}