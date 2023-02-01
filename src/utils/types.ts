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
    id: number
    type: INotificationType
    text: string
    startMs: number
    msLeft: number
}

interface INotificationType {
    color: string
    darkerColor: string
    icon: string
}