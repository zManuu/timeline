export const EmptyProject: IProject = {
    leftEnd: Date.now(),
    entries: [],
    connections: [],
    zoomLevel: 10
}

export function isIProject(obj: unknown): obj is IProject {
    if (!obj
        || typeof obj != 'object'
        || !('leftEnd' in obj)
        || !('entries' in obj)
        || !('connections' in obj)
        || !('zoomLevel' in obj))
        return false
    return true
}