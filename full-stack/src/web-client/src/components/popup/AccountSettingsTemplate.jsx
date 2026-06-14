import ButtonUI from "../../components/ButtonUI.jsx"
import ConfirmationUI from "../../components/ConfirmationUI.jsx"

export function PopupFillTemplate({ children, label, onSave, isLoading, msg, isError }) {
    return (
        <PopupFillTemplateBones label={label}>
            <div className="w-full h-full">{children}</div>
            <div className="my-6 w-full flex flex-col items-center justify-center gap-y-4">
                <ConfirmationUI
                    msg={msg}
                    isError={isError}
                />
                <ButtonUI
                    className="w-18 h-8 rounded-sm"
                    isLoading={isLoading}
                    label={"Save"}
                    onClick={onSave}
                />
            </div>
        </PopupFillTemplateBones>
    )
}

export function PopupFillTemplateBones({ children, label }) {
    return (
        <div className="bg-s-dark-primary p-2 rounded-sm border border-s-white shadow-lg w-72  md:w-132 min-h-32 flex flex-col items-center justify-between">
            <p className="text-s-white font-bold text-xl text-center mb-4">{label}</p>
            {children}
        </div>
    )
}
