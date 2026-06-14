import { PopupFillTemplate } from "../../../components/popup/AccountSettingsTemplate.jsx"
import { useEffect, useState } from "react"
import useMember from "../../../hooks/useMember.jsx"
import { SettingInput } from "../../../components/Settings/SettingInput.jsx"

export function EmailPopupFill({}) {
    const [email, SetEmail] = useState("")
    const { memberAccountData, changeEmail } = useMember()
    const [isLoading, SetIsLoading] = useState(false)
    const [msg, SetMSG] = useState()

    useEffect(() => {
        SetEmail(memberAccountData?.email || "")
    }, [memberAccountData?.email])

    function onSave() {
        changeEmail(email, SetIsLoading)
            .then()
            .catch((error) => {
                SetMSG(error.message)
            })
    }

    return (
        <PopupFillTemplate
            label={"Change Email"}
            isLoading={isLoading}
            onSave={onSave}
            msg={msg}
        >
            <SettingInput
                label={"Email"}
                value={email}
                onChange={(value) => {
                    SetEmail(value)
                }}
                autoComplete={"email"}
                placeholder={"Email"}
                isSecret={false}
            />
        </PopupFillTemplate>
    )
}

export function PasswordPopupFill() {
    const [currentPassword, SetCurrentPassword] = useState("")
    const [newPassword, SetNewPassword] = useState("")
    const [newPasswordAgain, SetNewPasswordAgain] = useState("")
    const { changePassword } = useMember()
    const [isLoading, SetIsLoading] = useState(false)
    const [msg, SetMSG] = useState()
    const [isError, SetIsError] = useState()

    function onSave() {
        changePassword(currentPassword, newPassword, newPasswordAgain, SetIsLoading)
            .then(() => {
                SetCurrentPassword("")
                SetNewPassword("")
                SetNewPasswordAgain("")
                SetIsError(false)
                SetMSG("Password Changed Successfully (=")
            })
            .catch((error) => {
                SetIsError(true)
                SetMSG(error.message)
            })
    }

    return (
        <PopupFillTemplate
            label={"Change Password"}
            isLoading={isLoading}
            onSave={onSave}
            msg={msg}
            isError={isError}
        >
            <div className="flex flex-col gap-y-4">
                <SettingInput
                    label={"Password"}
                    value={currentPassword}
                    onChange={(value) => {
                        SetCurrentPassword(value)
                    }}
                    autoComplete={"password"}
                    placeholder={"Password"}
                    isSecret={true}
                />
                <SettingInput
                    label={"New Password"}
                    value={newPassword}
                    onChange={(value) => {
                        SetNewPassword(value)
                    }}
                    autoComplete={"password"}
                    placeholder={"New Password"}
                    isSecret={true}
                />
                <SettingInput
                    label={"New Password Again"}
                    value={newPasswordAgain}
                    onChange={(value) => {
                        SetNewPasswordAgain(value)
                    }}
                    autoComplete={"password"}
                    placeholder={"New Password Again"}
                    isSecret={true}
                />
            </div>
        </PopupFillTemplate>
    )
}
