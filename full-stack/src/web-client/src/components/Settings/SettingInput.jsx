import InputUI from "../../components/InputUI.jsx"

export function SettingInput({ value, onChange, autoComplete, label, placeholder = "", isSecret = false, disabled = false }) {
    return (
        <div>
            <p className="text-s-white font-bold">{label}</p>
            <InputUI
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                className={"border border-s-white rounded-sm pl-2 py-2 bg-s-dark-secondary"}
                placeholder={placeholder}
                isSecret={isSecret}
                disabled={disabled}
            />
        </div>
    )
}
