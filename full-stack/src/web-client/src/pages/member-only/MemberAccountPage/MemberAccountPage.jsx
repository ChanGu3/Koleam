import { Mail, Key } from "lucide-react"
import usePopup from "../../../Popup/usePopup.jsx"
import { useState } from "react"
import useMember from "../../../hooks/useMember.jsx"
import { EmailPopupFill, PasswordPopupFill } from "./MemberSettingsPopupComponents.jsx"
import AccountSettingModule from "../../../components/Settings/AccountSettingsModule.jsx"

function MemberAccountPage() {
    const { PopupComponent } = usePopup()
    const [isEmailOpen, SetIsEmailOpen] = useState(false)
    const [isPasswordOpen, SetIsPasswordOpen] = useState(false)
    const { memberAccountData } = useMember()

    return (
        <main className="w-full mt-24 items-center justify-center flex flex-col gap-y-4 ">
            <p className="text-s-white text-xl">Account Settings</p>
            <AccountSettingModule
                Icon={Mail}
                label={"Email"}
                onClick={() => SetIsEmailOpen(true)}
                value={memberAccountData?.email}
            />
            <PopupComponent
                isOpen={isEmailOpen}
                onClose={() => {
                    SetIsEmailOpen(false)
                }}
            >
                <EmailPopupFill />
            </PopupComponent>
            <AccountSettingModule
                Icon={Key}
                label={"Password"}
                onClick={() => SetIsPasswordOpen(true)}
            />
            <PopupComponent
                isOpen={isPasswordOpen}
                onClose={() => SetIsPasswordOpen(false)}
            >
                <PasswordPopupFill />
            </PopupComponent>
        </main>
    )
}

export default MemberAccountPage
