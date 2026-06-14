import { UserCog, Key } from "lucide-react"
import usePopup from "../../../Popup/usePopup.jsx"
import { useState } from "react"
import useAdmin from "../../../hooks/useAdmin.jsx"
import { UsernamePopupFill, PasswordPopupFill } from "./AdminSettingsPopupComponents.jsx"
import AccountSettingModule from "../../../components/Settings/AccountSettingsModule.jsx"

function AdminAccountPage() {
    const { PopupComponent } = usePopup()
    const [isUsernameOpen, SetIsUsernameOpen] = useState(false)
    const [isPasswordOpen, SetIsPasswordOpen] = useState(false)
    const { adminAccountData } = useAdmin()

    return (
        <main className="w-full mt-24 items-center justify-center flex flex-col gap-y-4 ">
            <p className="text-s-white text-xl">Account Settings</p>
            <AccountSettingModule
                Icon={UserCog}
                label={"Username"}
                onClick={() => SetIsUsernameOpen(true)}
                value={adminAccountData?.username}
            />
            <PopupComponent
                isOpen={isUsernameOpen}
                onClose={() => {
                    SetIsUsernameOpen(false)
                }}
            >
                <UsernamePopupFill />
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

export default AdminAccountPage
