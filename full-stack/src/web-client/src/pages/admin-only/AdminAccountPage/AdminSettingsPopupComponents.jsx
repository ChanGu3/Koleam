import { PopupFillTemplate, PopupFillTemplateBones } from "../../../components/popup/AccountSettingsTemplate.jsx"
import { useState } from "react"
import useAdmin from "../../../hooks/useAdmin.jsx"
import { SettingInput } from "../../../components/Settings/SettingInput.jsx"

export function UsernamePopupFill({}) {
    const { adminAccountData } = useAdmin()

    return (
        <PopupFillTemplateBones label={"Contact Admin For Change Request"}>
            <SettingInput
                label={"Username"}
                value={adminAccountData?.username}
                onChange={(value) => {}}
                autoComplete={"username"}
                placeholder={"Username"}
                isSecret={false}
                disabled={true}
            />
        </PopupFillTemplateBones>
    )
}

export function PasswordPopupFill() {
    const [currentPassword, SetCurrentPassword] = useState("")
    const [newPassword, SetNewPassword] = useState("")
    const [newPasswordAgain, SetNewPasswordAgain] = useState("")
    const { changePassword } = useAdmin()
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
