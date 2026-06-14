import { Eye, EyeClosed } from "lucide-react"
import { useState } from "react"

function InputUI({ value, onChange, autoComplete, className = "", placeholder = "", isSecret = false, disabled = false }) {
    const [showSecret, SetShowSecret] = useState(false)

    return (
        <div className={`${className} relative`}>
            <input
                value={value}
                onChange={(event) => {
                    onChange(event.target.value)
                }}
                autoComplete={autoComplete}
                className={`w-full relative text-s-white placeholder:text-s-white/80 [&:-webkit-autofill]:[-webkit-text-fill-color:var(--color-s-white)] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s] focus:outline-none ${isSecret ? "pr-8" : ""}`}
                type={isSecret && !showSecret ? "password" : "text"}
                placeholder={placeholder}
                disabled={disabled}
            />
            {isSecret && (
                <div
                    className="absolute right-0 top-1/2 px-2 -translate-y-1/2 cursor-pointer h-full flex items-center justify-center"
                    onClick={() => {
                        SetShowSecret(!showSecret)
                    }}
                >
                    {showSecret ? (
                        <Eye
                            className="text-s-white/80"
                            size={18}
                        />
                    ) : (
                        <EyeClosed
                            className="text-s-white/80"
                            size={18}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export function AuthInputUI({ value, onChange, autoComplete, placeholder = "", isSecret = false }) {
    return (
        <InputUI
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            className={"border-2 w-full rounded-sm px-2 py-1 border-s-tertiary"}
            placeholder={placeholder}
            isSecret={isSecret}
        />
    )
}

export default InputUI
