import * as iconDir from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

export const importedIcons: string[] = []

export function importIcon(icon: string) {
    if (importedIcons.includes(icon))
        return
    
    // @ts-ignore
    library.add(iconDir[`fa${icon.charAt(0).toUpperCase() + icon.slice(1)}`])
    importedIcons.push(icon)
}