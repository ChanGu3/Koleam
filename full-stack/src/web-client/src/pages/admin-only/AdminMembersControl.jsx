import React, { useState, useEffect, use } from "react"
import { VerticalQueryScrollable } from "../../components/Scrollable"
import { FetchAllMembers } from "../../services/FetchMembers.js"
import ButtonUI from "../../components/ButtonUI"
import { useDeleteMember } from "../../hooks/useMember"
import usePopup from "../../Popup/usePopup"
import SearchBarUI from "../../components/SearchBarUI.jsx"

const MEMBER_FETCH_LIMIT = 8

function AdminMembersControl() {
    const { PopupComponent } = usePopup()
    const [isPopupOpen, SetIsPopupOpen] = useState(false)
    const [selectedMember, SetSelectedMember] = useState(null)
    const [searchQuery, SetSearchQuery] = useState("")

    useEffect(() => {
        document.title = "Administration - Members"
    }, [])

    const { mutate: deleteMember, isLoading: isDeletingMember } = useDeleteMember()

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mx-6">
                <p className="text-s-tertiary text-md md:text-lg text-center font-semibold">List of Members</p>
                <SearchBarUI
                    className={
                        "px-2 py-2 my-3 mx-8 md:mx-0 border-s-secondary border md:border-2 rounded-sm text-xs md:text-sm placeholder:text-xs md:placeholder:text-md w-full md:w-80"
                    }
                    placeholder={"Search Member By Email"}
                    setSearchQuery={SetSearchQuery}
                />
            </div>
            <VerticalQueryScrollable
                className="border-2 border-s-white/25 rounded-sm px-2 md:p-4 mx-6 inset-shadow-sm inset-shadow-s-dark-tertiary"
                queryKey={["ADMINISTRATION", "MODERATION", "MEMBERS", searchQuery]}
                queryFn={async ({ pageParam = 0 }) => await FetchAllMembers(MEMBER_FETCH_LIMIT, pageParam, searchQuery)}
                getNextPageParam={(lastPage, allPages) => (lastPage && lastPage.length === MEMBER_FETCH_LIMIT ? allPages.length * MEMBER_FETCH_LIMIT : undefined)}
                pxCutoffHeight={500}
                pxCutoffWidth={null}
                ItemRenderer={({ index, dataItem }) => {
                    return (
                        <AdministrationBarTemplate>
                            <div className="flex flex-row gap-2 justify-between items-center min-w-0 w-full">
                                <p className="text-xs font-semibold text-s-primary flex flex-col md:flex-row items-start md:items-center flex-1 min-w-0">
                                    <span className="text-sm md:text-lg font-normal text-s-white/75 truncate w-full md:w-auto text-left">{dataItem.email}</span>
                                    <span className="shrink-0">/email</span>
                                </p>
                                <ButtonUI
                                    className="px-2 py-1.5 rounded-xs text-sm bg-s-primary hover:bg-s-tertiary active:bg-s-secondary shrink-0"
                                    label={"DELETE?"}
                                    onClick={() => {
                                        SetIsPopupOpen(true)
                                        SetSelectedMember(dataItem)
                                    }}
                                />
                            </div>
                        </AdministrationBarTemplate>
                    )
                }}
                columnsCount={{ default: 1 }}
                columnGap={{ x: 0, y: 16 }}
            />
            <PopupComponent
                isOpen={isPopupOpen}
                onClose={() => {
                    SetIsPopupOpen(false)
                    SetSelectedMember("")
                }}
                title={"Delete Member?"}
            >
                <div className="bg-s-dark-secondary px-2 md:px-12 py-4 rounded-xs">
                    <div className="w-64 flex flex-col">
                        <p className="text-s-white text-sm text-center font-bold">Are you sure you want to delete this member?</p>
                        <p className="text-xs text-center my-3 text-s-error/75 font-semibold">
                            WARNING: deleting <span className="text-s-primary">{selectedMember && selectedMember.email}</span> removes all the data collected through this
                            application associated with the account please make sure this ACTION is respected by both you and the member.
                        </p>
                    </div>
                    <div className="flex flex-row justify-between mx-8 gap-x-2 py-2">
                        <ButtonUI
                            label={"Cancel"}
                            className={"px-3 py-1 rounded-sm bg-s-secondary/75 hover:bg-s-secondary"}
                            onClick={() => {
                                SetIsPopupOpen(false)
                            }}
                        />
                        <ButtonUI
                            label={"Delete"}
                            className={"px-3 py-1 rounded-sm bg-s-error hover:bg-s-error/75"}
                            onClick={() => {
                                deleteMember(selectedMember.email)
                                SetIsPopupOpen(false)
                            }}
                            disabled={isDeletingMember}
                        />
                    </div>
                </div>
            </PopupComponent>
        </div>
    )
}

function AdministrationBarTemplate({ children }) {
    return <div className="bg-s-dark-secondary/65 rounded-sm p-2 md:py-3 md:px-3 border border-s-white w-full">{children}</div>
}

export default AdminMembersControl
