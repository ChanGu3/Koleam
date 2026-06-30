import { useContext } from "react"
import { EventErrorContext } from "./EventErrorContext.jsx"

/**
 * @returns {{ addError({message, eventFlag}) }}
 * @throws Will throw an error if used outside of a EventErrorCTX provider.
 */
function useEventError() {
    const eventErrorData = useContext(EventErrorContext)

    if (eventErrorData === undefined) {
        throw new Error(`${useEventError.name} must be used within a ${EventErrorContext.name} Provider`)
    }

    return eventErrorData
}

export default useEventError
