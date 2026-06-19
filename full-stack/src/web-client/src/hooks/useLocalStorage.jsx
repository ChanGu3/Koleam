import { useContext } from "react"
import { LocalStorageContext } from "../contexts/LocalStorageCTX.jsx"

/** * Hook for accessing UI configuration values from the LocalStorageCTX.
 * @returns {{ video: {isAutoPlay: boolean, SetIsAutoPlay: function, quality: { height: number }, SetQuality: function, audio: { name: string }, SetAudio: function, subtitle: { name: string }, SetSubtitle: function, volume: number, SetVolume: function, muted: boolean, SetMuted: function}}}
         } }
 * @throws Will throw an error if used outside of a LocalStorageCTX provider.
 */
function useLocalStorage() {
    const localStorage = useContext(LocalStorageContext)

    if (localStorage === undefined) {
        throw new Error(`${useLocalStorage.name} must be used within a ${LocalStorageContext.name} Provider`)
    }

    return localStorage
}

export default useLocalStorage
