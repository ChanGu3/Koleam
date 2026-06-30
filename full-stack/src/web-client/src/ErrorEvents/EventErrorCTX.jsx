import { useState, useRef, useCallback, useEffect } from "react"
import EventErrorUI, { EVENT_FLAGS } from "./EventErrorUI.jsx"
import { EventErrorContext } from "./EventErrorContext.jsx"

export function EventErrorCTX({ children }) {
    const errorCounter = useRef(0)
    const [errors, SetErrors] = useState([])
    const scrollRef = useRef(null)

    function addError(message = "Something Went Wrong", eventFlag = EVENT_FLAGS.ERROR) {
        errorCounter.current += 1
        const newError = { id: errorCounter.current, message, eventFlag }
        SetErrors((prevErrors) => [...prevErrors, newError])
    }

    useEffect(() => {
        if (scrollRef.current) {
            // scroll to the bottom to show the latest error
            const { scrollHeight } = scrollRef.current
            scrollRef.current.scrollTo({ top: scrollHeight, behavior: "smooth" })
        }
    }, [errors])

    const removeError = useCallback((id) => {
        SetErrors((currentErrors) =>
            currentErrors.filter((error) => {
                return error.id !== id
            })
        )
    }, [])

    return (
        <EventErrorContext.Provider value={{ addError }}>
            {errors && errors.length > 0 && (
                <div style={{ zIndex: 10000000 }}>
                    <div
                        ref={scrollRef}
                        style={{ zIndex: 100000000, width: 256, height: 48 * 2 }}
                        className={"fixed top-18 left-2 overflow-y-auto flex flex-col gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"}
                    >
                        {errors.map((error) => (
                            <EventErrorUI
                                key={error.id}
                                id={error.id}
                                message={`${error.message}`}
                                eventFlag={error.eventFlag}
                                onClose={removeError}
                                closeCountDown={14}
                            />
                        ))}
                    </div>
                </div>
            )}
            {children}
        </EventErrorContext.Provider>
    )
}
