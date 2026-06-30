import { useEffect, useState } from "react"
import { LocalStorageContext } from "./createContext/LocalStorageContext.jsx"

function useLocalStorageZ(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(`Error reading localStorage for ${key}`, error)
            return initialValue
        }
    })

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue))
        } catch (error) {
            console.error(`Error setting localStorage for ${key}`, error)
        }
    }, [key, storedValue])

    return [storedValue, setStoredValue]
}

export function LocalStorageCTX({ children }) {
    const [isAutoPlay, SetIsAutoPlay] = useLocalStorageZ("isAutoPlay", false)
    const [quality, SetQuality] = useLocalStorageZ("quality", { height: "auto" })
    const [audio, SetAudio] = useLocalStorageZ("audio", { name: "default" })
    const [subtitle, SetSubtitle] = useLocalStorageZ("subtitle", { name: "none" })
    const [volume, SetVolume] = useLocalStorageZ("volume", 0.45)
    const [muted, SetMuted] = useLocalStorageZ("muted", false)

    const value = {
        video: {
            isAutoPlay,
            SetIsAutoPlay,
            quality,
            SetQuality,
            audio,
            SetAudio,
            subtitle,
            SetSubtitle,
            volume,
            SetVolume,
            muted,
            SetMuted,
        },
    }

    return <LocalStorageContext.Provider value={value}>{children}</LocalStorageContext.Provider>
}
