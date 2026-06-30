import { CircleX } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export const EVENT_FLAGS = Object.freeze({
    ERROR: 1,
    WARNING: 2,
    REGULAR: 4,
    SUCCESS: 8,
    // first 4 bits reserved for type
})

function EventErrorUI({ id, message, eventFlag, onClose = (id) => {}, closeCountDown = null }) {
    const ENDING_TIME = 1

    const component = useRef(null)
    const [isTransitionOpacity0, setIsTransitionOpacity0] = useState(false)
    const component_id = useRef(id)
    const [componentCloseCountdown, setComponentCloseCountdown] = useState(closeCountDown)
    const intervalRef = useRef(null)

    function DoCountdown() {
        return setInterval(() => {
            if (ENDING_TIME < componentCloseCountdown) {
                setComponentCloseCountdown((prev) => prev - 1)
            } else {
                OnEnd()
            }
        }, 1000)
    }

    function OnEnd() {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setComponentCloseCountdown(null)
        setIsTransitionOpacity0(true)
        setTimeout(() => {
            if (component) {
                onClose(component_id.current)
            }
        }, 300)
    }

    useEffect(() => {
        if (componentCloseCountdown !== null && !intervalRef.current) {
            intervalRef.current = DoCountdown()
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [componentCloseCountdown])

    const eventName =
        eventFlag && !!(eventFlag & EVENT_FLAGS.ERROR) ? "ERROR" : !!(eventFlag & EVENT_FLAGS.WARNING) ? "WARNING" : !!(eventFlag & EVENT_FLAGS.SUCCESS) ? "SUCCESS" : ""
    const isEventNonRegular = eventFlag && !(eventFlag & EVENT_FLAGS.REGULAR)
    const backgroundColor =
        eventFlag && !!(eventFlag & EVENT_FLAGS.ERROR)
            ? "bg-pink-800"
            : !!(eventFlag & EVENT_FLAGS.WARNING)
              ? "bg-amber-500"
              : !!(eventFlag & EVENT_FLAGS.SUCCESS)
                ? "bg-green-600"
                : "bg-gray-500"

    return (
        <div
            ref={component}
            className={`rounded-sm px-3 py-2 flex flex-row justify-between items-center ${backgroundColor} transition-all duration-300 ease-in-out
                    ${isTransitionOpacity0 ? "opacity-0 invisible" : "opacity-100 visible"} gap-1`}
        >
            <p className="text-white text-[10px] w-full wrap-break-word line-clamp-2">
                <span className="select-none text-xs">
                    {eventName}
                    {isEventNonRegular && ": "}
                </span>
                {message}
            </p>
            <div className="flex flex-row items-center justify-center gap-1">
                {componentCloseCountdown && <p className="text-white text-[10px] select-none">[{componentCloseCountdown}]</p>}
                <button
                    onClick={OnEnd}
                    className={"cursor-pointer"}
                >
                    <CircleX className="text-s-white" />
                </button>
            </div>
        </div>
    )
}

export default EventErrorUI
