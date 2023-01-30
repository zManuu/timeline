import * as iconDir from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'

export const importedIcons: string[] = []

export function importIcon(icon: string) {
    if (importedIcons.includes(icon))
        return

    const fullIconName = `fa${icon.charAt(0).toUpperCase() + icon.slice(1)}`
    // @ts-ignore
    const iconObj = iconDir[fullIconName]

    library.add(iconObj)
    importedIcons.push(icon)
}

export function importIcons(...icons: string[]) {
    for (const icon of icons) {
        importIcon(icon)
    }
}