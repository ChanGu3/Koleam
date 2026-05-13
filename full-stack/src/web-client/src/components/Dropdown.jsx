import { useEffect, useState, useRef } from "react";
import "../tailwind.css";

function ToggleOptions(optionsRef) {
  if (optionsRef.current.classList.contains("hidden")) {
    optionsRef.current.classList.remove("hidden");
  } else {
    optionsRef.current.classList.add("hidden");
  }
}

function Dropdown({
  imgSrc,
  classNameMain,
  classNameDropdown,
  optionList = [
    { title: "Option 1", titleright: "right 1", onClick: () => {} },
    { title: "Option 2", titleright: "right 2", onClick: () => {} },
    { title: "Option 3", onClick: () => {} },
  ],
}) {
  if (optionList.length == 0) {
    return <></>;
  }

  const dropDownComponent = useRef();
  const optionsRef = useRef();
  const optionListRef = useRef([]);
  const [currSelectedOption, SetCurrSelectedOption] = useState(null);
  const [currOptionText, SetCurrOptionText] = useState();

  useEffect(() => {
    SetCurrSelectedOption(optionListRef.current[0]);
    SetCurrOptionText(optionList[0].title);

    document.addEventListener("mousedown", OnMouseDown);

    return () => {
      document.removeEventListener("mousedown", OnMouseDown);
    };
  }, []);

  function OnMouseDown(event) {
    if (
      !dropDownComponent.current.contains(event.target) &&
      !optionsRef.current.classList.contains("hidden")
    ) {
      ToggleOptions(optionsRef);
    }
  }

  function UnselectOption(optionRef) {
    SetCurrSelectedOption(null);
  }

  function SelectOption(optionRef) {
    UnselectOption(currSelectedOption);
    SetCurrSelectedOption(optionRef);
    SetCurrOptionText(optionRef.innerHTML);
    ToggleOptions(optionsRef);
  }

  return (
    <>
      <div
        ref={dropDownComponent}
        className={`relative rounded-xs flex flex-col justify-start ${classNameMain}`}
      >
        <button
          onClick={() => {
            ToggleOptions(optionsRef);
          }}
          type="button"
          className="flex flex-row justify-between items-center gap-x-2 cursor-pointer py-3 px-2 max-w-[100%]"
        >
          <p className="text-os-white font-bold truncate w-[100%] text-start text-sm">
            {currOptionText}
          </p>
          <img className="w-4" src={imgSrc} alt="dropdown-icon"></img>
        </button>
        <div
          ref={optionsRef}
          className={`absolute left-0 z-100 w-[100%] hidden flex flex-col gap-y-1.5 max-h-52 overflow-y-auto ${classNameDropdown}`}
        >
          {optionList.map((option, index) => {
            return (
              <button
                onClick={() => {
                  SelectOption(optionListRef.current[index]);
                  optionList[index].onClick();
                }}
                type="button"
                key={index}
                className={`flex flex-row justify-between w-[100%] py-3 px-2 text-start text-sm font-semibold cursor-pointer hover:bg-os-blue-secondary active:bg-os-blue-secondary ${optionListRef.current[index] === currSelectedOption ? "text-white" : "text-os-dark-secondary"}`}
              >
                <span
                  className={`truncate w-[75%]`}
                  ref={(el) => {
                    optionListRef.current[index] = el;
                  }}
                >
                  {option.title}
                </span>
                <span className={`text-xs italic whitespace-nowrap`}>
                  {option.titleright}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Dropdown;
