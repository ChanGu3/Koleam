import { useEffect, useState, useRef } from "react"
import "../tailwind.css"
import { VerticalScrollable } from "./Scrollable"

function ToggleOptions(optionsRef) {
    if (optionsRef.current.classList.contains("hidden")) {
        optionsRef.current.classList.remove("hidden")
    } else {
        optionsRef.current.classList.add("hidden")
    }
}

function Dropdown({
    classNameMain,
    classNameDropdown,
    optionList = [
        { title: "Option 1", titleright: "right 1", onClick: () => {} },
        { title: "Option 2", titleright: "right 2", onClick: () => {} },
        { title: "Option 3", onClick: () => {} },
    ],
    ToggleIcon,
    iconClassName = "",
    pxCutoffHeight = 50,
}) {
    if (optionList.length == 0) {
        return <></>
    }

    const dropDownComponent = useRef()
    const optionsButtonRef = useRef()
    const optionsRef = useRef()
    const [currSelectedOptionIndex, SetCurrSelectedOptionIndex] = useState(0)
    const [currOptionText, SetCurrOptionText] = useState()

    useEffect(() => {
        SetCurrSelectedOptionIndex(0)
        SetCurrOptionText(optionList[0].title)

        document.addEventListener("mousedown", OnMouseDown)

        return () => {
            document.removeEventListener("mousedown", OnMouseDown)
        }
    }, [])

    function OnMouseDown(event) {
        if (!dropDownComponent.current.contains(event.target) && !optionsRef.current.classList.contains("hidden")) {
            ToggleOptions(optionsRef)
        }
    }

    function UnselectOption(optionRef) {
        SetCurrSelectedOptionIndex(null)
    }

    function SelectOption(optionRef, index) {
        UnselectOption(currSelectedOptionIndex)
        SetCurrSelectedOptionIndex(index)
        SetCurrOptionText(optionList[index].title)
        ToggleOptions(optionsRef)
    }

    return (
        <>
            <div
                ref={dropDownComponent}
                className={`relative rounded-xs flex flex-col justify-start ${classNameMain}`}
            >
                <button
                    ref={optionsButtonRef}
                    onClick={() => {
                        ToggleOptions(optionsRef)
                    }}
                    type="button"
                    className="flex flex-row justify-between items-center gap-x-2 cursor-pointer py-3 px-2 max-w-[100%]"
                >
                    <p className="text-s-white font-bold truncate w-full text-start text-sm">{currOptionText}</p>
                    <ToggleIcon className={`${iconClassName} w-4 text-s-white`} />
                </button>
                <div
                    ref={optionsRef}
                    className={`absolute left-0 z-100 w-full hidden flex-col max-h-52 overflow-y-auto ${classNameDropdown}`}
                >
                    <VerticalScrollable
                        className={""}
                        itemCount={optionList.length}
                        columnsCount={1}
                        columnGap={{ x: 0, y: 0 }}
                        onVirtualScrollEnd={() => {}}
                        pxCutoffHeight={pxCutoffHeight}
                        pxCutoffWidth={null}
                        ItemRenderer={({ index }) => {
                            return (
                                <button
                                    onClick={(event) => {
                                        SelectOption(event.target, index)
                                        optionList[index].onClick()
                                    }}
                                    type="button"
                                    key={index}
                                    className={`border-b-2 border-s-darl-primary flex flex-row justify-between w-full py-3 px-2 text-start text-sm font-semibold cursor-pointer hover:bg-s-secondary active:bg-s-secondary ${index === currSelectedOptionIndex ? "text-white" : "text-s-dark-secondary"}`}
                                >
                                    <span className={`truncate w-[75%]`}>{optionList[index].title}</span>
                                    <span className={`text-xs italic whitespace-nowrap`}>{optionList[index].titleright}</span>
                                </button>
                            )
                        }}
                    />
                </div>
            </div>
        </>
    )
}

export default Dropdown
