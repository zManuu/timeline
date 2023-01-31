interface IProject {
    name?: string
    startTime?: number
    entries: IEntry
}

interface IEntry {
    id: number
    title: string
    comment?: string
    timeStamp: number
}

interface INotification {
    _id: number
    type: number
    text: string
    startMs: number
    msLeft: number
}