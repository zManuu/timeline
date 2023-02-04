interface IProject {
    leftEnd: number
    entries: IEntry[]
    connections: IConnection[],
    zoomLevel: number
}

interface IEntry {
    id: number
    title: string
    timeStamp: number
    comment?: string
    color?: string
}

interface IConnection {
    from: number
    to: number
    color?: string
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