import ButtonUI from "../ButtonUI"

function ConfirmationPopup({
    label = null,
    leftButton: { onClick: leftButtonOnClick, label: leftButtonLabel, isLoading: leftButtonIsLoading = false, isImportant: leftButtonIsImportant = false },
    rightButton: { onClick: rightButtonOnClick, label: rightButtonLabel, isLoading: rightButtonIsLoading = false, isImportant: rightButtonIsImportant = false },
}) {
    return (
        <div className="flex flex-col bg-s-dark-primary h-56 w-72 rounded-lg">
            <div className="h-full">
                <p className={`text-s-white font-semibold text-center mt-10 px-2`}>{label}</p>
            </div>
            <div className="flex flex-row justify-between w-full px-10 py-4">
                <ConfirmationButton
                    onClick={leftButtonOnClick}
                    label={leftButtonLabel}
                    isImportant={leftButtonIsImportant}
                    isLoading={leftButtonIsLoading}
                />
                <ConfirmationButton
                    onClick={rightButtonOnClick}
                    label={rightButtonLabel}
                    isImportant={rightButtonIsImportant}
                    isLoading={rightButtonIsLoading}
                />
            </div>
        </div>
    )
}

export default ConfirmationPopup

function ConfirmationButton({ className = "", onClick, label, isLoading = false, isImportant = false }) {
    return (
        <ButtonUI
            label={label}
            onClick={onClick}
            className={`${className} py-2 px-3 rounded-sm ${isImportant ? "bg-red-400/65 hover:bg-red-400/90 active:bg-red-400/90" : "bg-s-primary/65 hover:bg-s-primary/90 active:bg-s-primary/90"}`}
            isLoading={isLoading}
        />
    )
}
