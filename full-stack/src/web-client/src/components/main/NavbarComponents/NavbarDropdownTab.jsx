import { useRef, useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

/**
 * @param {vectorOffset} vectorOffset - { x: number, y: number } - This is the offset of the dropdown from the top left of the tab
 */
function NavbarDropdownTab({ className = "", dropdownClassName = "", label, id, children: dropdown, vectorOffset = { x: 0, y: 0 }, isDropdownStartLeft = true }) {
    const dropdownRef = useRef(null)
    const tabRef = useRef(null)
    const [isDropped, SetIsDropped] = useState(false)

    useEffect(() => {
        document.addEventListener("mouseup", OnMouseDown)

        return () => {
            document.removeEventListener("mouseup", OnMouseDown)
        }
    }, [])

    useEffect(() => {
        if (isDropped) {
            document.body.classList.add("overflow-hidden")
        } else {
            document.body.classList.remove("overflow-hidden")
        }
    }, [isDropped])

    function OnMouseDown(event) {
        if (!tabRef.current.contains(event.target)) {
            SetIsDropped(false)
        }
    }

    const dropDownStyles = {
        left: `${vectorOffset.x}px`,
        top: `${vectorOffset.y}px`,
    }

    if (!isDropdownStartLeft) {
        delete dropDownStyles.left
        dropDownStyles.right = `${vectorOffset.x}px`
    }

    return (
        <>
            <div className={`${className} relative h-full ${isDropped ? "z-101" : "z-99"} `}>
                {/* --- Tab --- */}
                <button
                    ref={tabRef}
                    id={id}
                    name={id}
                    className={`${isDropped ? "bg-gray-700" : ""} rounded-xs px-2 flex flex-row items-center justify-center space-x-1 cursor-pointer hover:bg-gray-500 active:bg-gray-700 h-full`}
                    type="button"
                    onClick={() => SetIsDropped(!isDropped)}
                >
                    <div className="flex flex-row items-center gap-2">
                        {label}
                        {isDropped ? (
                            <ChevronUp
                                className="text-s-white"
                                size={16}
                            />
                        ) : (
                            <ChevronDown
                                className="text-s-white"
                                size={16}
                            />
                        )}
                    </div>
                </button>

                {/* --- Dropdown --- */}
                <div
                    ref={dropdownRef}
                    id={`${id}dropdown`}
                    name={`${id}dropdown`}
                    className={`${dropdownClassName} absolute rounded-xs bg-s-tertiary py-2 flex-col gap-y-2 lg:gap-y-0 lg:flex-row ${isDropped ? "flex" : "hidden"}`}
                    style={dropDownStyles}
                >
                    {dropdown}
                </div>
            </div>

            {/* --- Dark Overlay --- */}
            <div
                id="darkoverlay"
                className={`fixed bg-black/30 w-full h-screen z-100 ${isDropped ? "" : "hidden"}`}
            ></div>
        </>
    )
}

export default NavbarDropdownTab
