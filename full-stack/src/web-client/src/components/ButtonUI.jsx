import { DefaultSpinner } from "./Spinners"

function ButtonUI({ label, onClick, isFormButton = false, className = "", isLoading = undefined, disabled = false }) {
    return (
        <button
            className={`${className} cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={onClick}
            disabled={disabled}
            type={isFormButton ? "submit" : "button"}
        >
            {isLoading ? <DefaultSpinner className="text-s-white py-0 w-full h-full" /> : <p className={"text-s-white"}>{label}</p>}
        </button>
    )
}

export default ButtonUI
