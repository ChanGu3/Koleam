// TODO: THIS FILE IS SO LARGE IT NEEDS TO BE SPLIT INTO MUTIPLE FILES WHILE MAKING PERFORMANCE IMPROVEMENTS I JUST DONT WANT TO DO IT AS OF NOW ALSO SOME STUFF IS
// BECOMING MORE DOWNGRAFED IN QUALITY BECAUSE IM GETTING TIRED AND COULDNT CARE LESS TO DO IT UNLESS IM MOTIVATED TO DO SO YEP
import { useQueryClient } from "@tanstack/react-query"
import { GridLoader } from "react-spinners"
import { useState, useEffect, useRef, useId, useMemo } from "react"
import { HorizontalScrollable, WindowVerticalQueryScrollable } from "../../components/Scrollable.jsx"
import { FetchTitleBySearchQuery } from "../../services/Titles/FetchTitle.js"
import ImageUI from "../../components/ImageUI.jsx"
import {
    FileQuestionMark,
    Binoculars,
    Pen,
    FilePlus,
    Asterisk,
    ChevronDown,
    Trash,
    Trash2,
    Check,
    Plus,
    Wrench,
    ArrowUp,
    ArrowDown,
    List,
    Image,
    PenLine,
    BadgeX,
    CircleX,
    PenTool,
    CheckCircle,
    CircleCheck,
    Circle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import SearchBarUI from "../../components/SearchBarUI.jsx"
import ButtonUI from "../../components/ButtonUI.jsx"
import usePopup from "../../Popup/usePopup.jsx"
import ISO6391 from "iso-639-1"
import { FILM_RATING, CONTENT_ADVISORIES, GENRES } from "../../../../shared/title-constants.js"
import { useDeleteGenre, useGetGenres, useAddGenre } from "../../hooks/useGenre.jsx"
import { useAddTitle, useUpdateTitle, useGetTitleCoverVersion, useDeleteTitle, getCoverTitleURL } from "../../hooks/useTitle.jsx"
import useEventError from "../../ErrorEvents/useEventError.jsx"
import ConfirmationPopup from "../../components/popup/ConfirmationPopup.jsx"
import { useGetIntallmentsByTitleID, useAddInstallment, useUpdateInstallment, useDeleteInstallment } from "../../hooks/useInstallment.jsx"
import {
    getThumbnailURL,
    useGetThumbnailCoverVersion,
    getM3u8URL,
    useGetM3u8Version,
    useDeleteStream,
    useAddStream,
    useUpdateStream,
    useGetStreamByID,
    useAddVideoRender,
    useUpdateVideoRender,
    useDeleteVideoRender,
    useAddAudioRender,
    useUpdateAudioRender,
    useDeleteAudioRender,
    useAddSubtitleRender,
    useUpdateSubtitleRender,
    useDeleteSubtitleRender,
    useStreamAudioRenderInfo,
    useStreamSubtitleRenderInfo,
    useStreamVideoRenderInfo,
    invalidateAddingStreamQueries,
} from "../../hooks/useStream.jsx"
import { getSeriesTime, getInputCalendarValue } from "../../utils/Time.js"
import { ShortenCountAsString } from "../../utils/DocumentFunction.mjs"
import { DefaultSpinner } from "../../components/Spinners.jsx"
import VideoPlayer from "../../components/media/VideoPlayer.jsx"
import { FetchSubtitleByStreamIDLabelExt } from "../../services/Titles/FetchStream.js"
import {
    getExtensionFromSubtitleCodec,
    validateFileExtension,
    FILE_TYPES,
    valid_video_extensions,
    valid_audio_extensions,
    valid_subtitle_extensions,
} from "../../../../shared/extensions.js"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"
import { TempFileUpload } from "../../services/FetchFile.js"

function SeperateIntoAddAndDelete(existingList, newList) {
    const data = {
        add: newList.filter((data) => {
            return !existingList.includes(data)
        }),
        delete: existingList.filter((data) => {
            return !newList.includes(data)
        }),
    }
    return data
}

function AdminManageTitles() {
    const searchGetLimit = 8
    const [newSearchQuery, SetNewSearchQuery] = useState("")
    const { PopupComponent } = usePopup()

    const [addTitlePopupOpen, SetAddTitlePopupOpen] = useState(false)
    const [addMiscPopupOpen, SetAddMiscPopupOpen] = useState(false)
    const [editTitlePopupOpen, SetEditTitlePopupOpen] = useState(false)
    const [editTitleData, SetEditTitleData] = useState({})

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [newSearchQuery])

    return (
        <>
            <div className="flex flex-col justify-center items-center relative">
                <div className="w-72 md:w-2xl lg:w-4xl xl:w-6xl">
                    <WindowVerticalQueryScrollable
                        className="w-full"
                        queryKey={["TITLE", "ADMINISTRATION", "SEARCH", newSearchQuery]}
                        queryFn={async ({ pageParam = 0 }) => await FetchTitleBySearchQuery(newSearchQuery, searchGetLimit, pageParam)}
                        getNextPageParam={(lastPage, allPages) => (lastPage && lastPage.length === searchGetLimit ? allPages.length * searchGetLimit : undefined)}
                        ItemRenderer={({ index, dataItem }) => {
                            return (
                                <TitleSlot
                                    key={dataItem.id}
                                    titleData={dataItem}
                                    onEdit={(titleData) => {
                                        SetEditTitleData(titleData)
                                        SetEditTitlePopupOpen((prev) => !prev)
                                    }}
                                />
                            )
                        }}
                        columnsCount={{ default: 1 }}
                        columnGap={{ x: 0, y: 24 }}
                    />
                </div>
            </div>
            <div className="absolute inset-0 left-0 w-full h-full pointer-events-none">
                <div className="fixed w-full h-32 flex flex-col md:flex-row justify-center items-center bg-s-dark-tertiary/50 backdrop-blur-sm py-2 bottom-0 pointer-events-auto gap-y-2 md:gap-x-2">
                    <SearchBarUI
                        placeholder={"Search Titles..."}
                        setSearchQuery={SetNewSearchQuery}
                        className={"w-[90%] md:w-lg h-10 border-2 rounded-lg px-2 py-1 bg-s-dark-primary"}
                    />
                    <div className={"flex flex-row gap-x-2"}>
                        <TitleButton
                            Icon={Wrench}
                            label={"Add Misc."}
                            onClick={() => SetAddMiscPopupOpen((prev) => !prev)}
                        />
                        <TitleButton
                            Icon={FilePlus}
                            label={"Add Title"}
                            onClick={() => SetAddTitlePopupOpen((prev) => !prev)}
                        />
                    </div>
                </div>
            </div>

            {addTitlePopupOpen && (
                <AddTitlePopup
                    isOpen={addTitlePopupOpen}
                    onClose={() => {
                        SetAddTitlePopupOpen((prev) => !prev)
                    }}
                    PopupComponent={PopupComponent}
                />
            )}

            {addMiscPopupOpen && (
                <AddTitleMiscPopup
                    isOpen={addMiscPopupOpen}
                    onClose={() => SetAddMiscPopupOpen((prev) => !prev)}
                    PopupComponent={PopupComponent}
                />
            )}

            {editTitleData && editTitlePopupOpen && (
                <EditTitlePopup
                    isOpen={editTitlePopupOpen}
                    onClose={() => {
                        SetEditTitleData(null)
                        SetEditTitlePopupOpen((prev) => !prev)
                    }}
                    PopupComponent={PopupComponent}
                    titleData={editTitleData}
                />
            )}
        </>
    )
}

function TitleSlot({ titleData: { id, label, seasons_count, stream_episodes_count, stream_movies_count, ...rest }, onEdit = (titleData) => {} }) {
    const { data: coverVersion } = useGetTitleCoverVersion(id)
    const navigate = useNavigate()

    const sharedClassName = "rounded-xl"

    return (
        <div className={`${sharedClassName} w-full h-36 md:h-56 relative outline-2 outline-s-tertiary/75 overflow-hidden select-none shadow-lg shadow-black`}>
            <div className={`w-full h-full bg-black/80 relative`}>
                <ImageUI
                    className={`${sharedClassName} absolute inset w-fit h-fit mask-[linear-gradient(159deg,transparent,rgba(0,0,0,0.3)_25%,black_50%,black_50%,rgba(0,0,0,0.3)_75%,transparent)]`}
                    Src={getCoverTitleURL(id, coverVersion)}
                    Fallback={FileQuestionMark}
                />
                <div className={`absolute inset-0 w-full h-full bg-black/40`}></div>
            </div>
            <div className="left-0 top-0 absolute px-4 py-3 w-full h-full flex flex-col justify-between ">
                <p className="text-s-white font-mono text-lg md:text-3xl">{label}</p>
                <div className="flex flex-row w-full h-full">
                    <div className="flex flex-col py-2 gap-1 w-[60%] md:w-[80%] self-end">
                        <div className="flex flex-row gap-x-2">
                            <TitleSlotText
                                label="Seasons"
                                value={seasons_count}
                            />
                            <TitleSlotText
                                label="Episodes"
                                value={stream_episodes_count}
                            />
                        </div>
                        <TitleSlotText
                            label="Movies"
                            value={stream_movies_count}
                        />
                    </div>
                    <div className="flex flex-col gap-y-4 md:gap-y-8 h-full w-[40%] md:w-[20%]">
                        <TitleSlotButton
                            label="Edit"
                            Icon={Pen}
                            onClick={() => onEdit({ id, label, seasons_count, stream_episodes_count, stream_movies_count, ...rest })}
                            className="h-full"
                        />
                        <TitleSlotButton
                            label="View"
                            Icon={Binoculars}
                            onClick={() => navigate({ pathname: `/title/${id}/${label}` })}
                            className="h-[50%]"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function TitleSlotText({ label, value }) {
    return (
        <p className="text-s-secondary italic flex text-center gap-1 text-xs md:text-sm flex-row items-center bg-black/30 rounded-sm w-fit px-1 py-1 w-">
            {label}: <span className="text-sm md:text-md text-s-white">{value}</span>
        </p>
    )
}

function TitleSlotButton({ label, onClick, className = "", Icon }) {
    return (
        <ButtonUI
            onClick={onClick}
            className={`${className} cursor-pointer bg-s-dark-secondary/50 hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90 rounded-sm`}
            label={
                <span className="text-s-white text-xs md:text-sm font-semibold flex flex-row items-center justify-center gap-2">
                    <Icon size={16} />
                    {label}
                </span>
            }
        ></ButtonUI>
    )
}

function TitlePopupTemplate({ isOpen, onClose, children }) {
    const { PopupComponent } = usePopup()

    return (
        <PopupComponent
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="w-[95lvw] max-h-[85vh] p-4 overflow-y-auto bg-s-dark-primary/80 rounded-sm inset-shadow-sm inset-shadow-s-dark-tertiary shadow-2xl shadow-s-dark-secondary outline-2 outline-s-dark-tertiary/75">
                <div className="flex flex-col w-full p-2 ">{children}</div>
            </div>
        </PopupComponent>
    )
}

function TitleForm({
    formLabel = "Add Title",
    originalCoverFileUrl = null,
    setSelectedCoverFile,
    selectedTitleName,
    setSelectedTitleName,
    selectedOriginalTranslation,
    setSelectedOriginalTranslation,
    selectedFilmAgeMinimum,
    setSelectedFilmAgeMinimum,
    selectedFilmSuitability,
    setSelectedFilmSuitability,
    selectedDescription,
    setSelectedDescription,
    selectedCopyright,
    setSelectedCopyright,
    selectedContentAdvisories,
    setSelectedContentAdvisories,
    selectedOtherTranslations,
    setSelectedOtherTranslations,
    unselectedGenres,
    setUnselectedGenres,
    selectedGenres,
    setSelectedGenres,
    submitLabel = "Confirm Add",
    onSubmit = () => {},
    isLoadingSubmit = null,
}) {
    const languageNames = ISO6391.getAllNativeNames()
    const suitabilites = Object.values(FILM_RATING)
    const [unselectedOtherTranslations, setUnselectedOtherTranslations] = useState(languageNames)
    const [unselectedContentAdvisories, setUnselectedContentAdvisories] = useState(Object.values(CONTENT_ADVISORIES))

    return (
        <div className="flex flex-col w-full h-full gap-6">
            <PopupTabTitle
                label={formLabel}
                className={`h-fit w-full`}
            />
            <PopupTab className="flex lg:hidden">
                <TitleButton
                    isLoading={isLoadingSubmit}
                    className={`self-center`}
                    Icon={Check}
                    label={submitLabel}
                    onClick={() => onSubmit()}
                />
            </PopupTab>
            <div className="w-full h-full flex flex-col lg:flex-row gap-6">
                <div className="flex flex-col lg:w-[40%] gap-6">
                    {/* Cover File */}
                    <PopupTab
                        className={`w-full gap-1`}
                        label={"Title Cover"}
                    >
                        <InputImageFile
                            className="bg-s-white/20 p-1 rounded-xs"
                            required={true}
                            onFileChange={(file) => {
                                setSelectedCoverFile(file)
                            }}
                            originalImageUrl={originalCoverFileUrl}
                        />
                    </PopupTab>
                    <PopupTab
                        className={`h-full w-full gap-2`}
                        label={""}
                    >
                        <InputText
                            value={selectedTitleName}
                            onChange={(value) => setSelectedTitleName(value)}
                            className="bg-s-white/20 p-1 rounded-xs"
                            required={true}
                            placeholder={"Title Name"}
                        />
                        <InputSelect
                            value={selectedOriginalTranslation}
                            onChange={(value) => setSelectedOriginalTranslation(value)}
                            className="bg-s-white/20 p-1 rounded-xs"
                            required={true}
                            allowSelfInput={true}
                            placeholder={"Original Translation"}
                            options={languageNames}
                        />
                        <InputText
                            value={selectedFilmAgeMinimum}
                            onChange={(value) => setSelectedFilmAgeMinimum(value)}
                            className="bg-s-white/20 p-1 rounded-xs"
                            placeholder={"Film Age Minimum"}
                            numberOnly={true}
                        />
                        <InputSelect
                            value={selectedFilmSuitability}
                            onChange={(value) => setSelectedFilmSuitability(value)}
                            className="bg-s-white/20 p-1 rounded-xs"
                            placeholder={"Film Suitability"}
                            options={suitabilites}
                        />
                        <InputText
                            value={selectedCopyright}
                            onChange={(value) => setSelectedCopyright(value)}
                            className="bg-s-white/20 p-1 rounded-xs"
                            placeholder={"Copyright"}
                        />
                    </PopupTab>
                </div>
                <div className="flex  lg:w-[60%] flex-col gap-6">
                    <PopupTab className="hidden lg:flex">
                        <TitleButton
                            isLoading={isLoadingSubmit}
                            className={`self-center hidden lg:block`}
                            Icon={Check}
                            label={submitLabel}
                            onClick={() => onSubmit()}
                        />
                    </PopupTab>
                    <PopupTab className={`gap-3 h-full`}>
                        <InputSelectMulti
                            className="bg-s-white/20 p-1 rounded-xs"
                            placeholder={`Genres`}
                            options={unselectedGenres}
                            setOptions={setUnselectedGenres}
                            currentSelectedOptions={selectedGenres}
                            setCurrentSelectedOptions={setSelectedGenres}
                        />
                        <InputSelectMulti
                            className="bg-s-white/20 p-1 rounded-xs"
                            placeholder={`Other Translations`}
                            options={unselectedOtherTranslations}
                            setOptions={setUnselectedOtherTranslations}
                            currentSelectedOptions={selectedOtherTranslations}
                            setCurrentSelectedOptions={setSelectedOtherTranslations}
                            allowSelfInput={true}
                        />
                        <InputSelectMulti
                            className="bg-s-white/20 p-1 rounded-xs"
                            placeholder={`Content Advisories`}
                            options={unselectedContentAdvisories}
                            setOptions={setUnselectedContentAdvisories}
                            currentSelectedOptions={selectedContentAdvisories}
                            setCurrentSelectedOptions={setSelectedContentAdvisories}
                            allowSelfInput={true}
                        />
                    </PopupTab>
                </div>
            </div>
            <PopupTab>
                <InputTextArea
                    className="bg-s-white/20 p-1 rounded-xs h-64"
                    placeholder={`Description`}
                    value={selectedDescription}
                    onChange={(value) => setSelectedDescription(value)}
                />
            </PopupTab>
        </div>
    )
}

function InstallmentInfoForm({ formLabel = "Edit Installment", isLoading = null, onClick = () => {}, label, setLabel, installmentType, setInstallmentType, resetOnClick = false }) {
    return (
        <div className="flex flex-col gap-2 bg-s-white/20 p-2">
            <p className="flex items-center justify-center text-s-white font-bold text-sm">{formLabel}</p>
            <InputText
                required={true}
                placeholder="Label"
                value={label}
                onChange={setLabel}
            />
            <InputSelect
                value={installmentType}
                onChange={setInstallmentType}
                options={["Season", "Movie"]}
                placeholder="Installment Type"
                required={true}
            />
            <TitleButton
                className="w-fit self-center px-8 py-3"
                label="Submit"
                isLoading={isLoading}
                onClick={() => {
                    onClick()
                    if (resetOnClick) {
                        setLabel("")
                        setInstallmentType("")
                    }
                }}
            />
        </div>
    )
}

function InstallmentForm({
    installments = [],
    formLabel = "Edit Installments",
    onEditInstallmentOrder = (item, index, newIndex) => true, // true if the installment order is successfully updated, false if not
    isLoadingEditInstallmentOrder = null,
    onAddInstallment = ({ label, isSeason }) => {},
    isLoadingAddInstallment = null,
    onEditInstallment = ({ installmentID, label, isSeason }) => {},
    isLoadingEditInstallment = null,
    onDeleteInstallment = async ({ item }) => true,
    isLoadingDeleteInstallment = null,
    onDeleteStream = async ({ item }) => {},
    isLoadingDeleteStream = null,
    onEditStream = (item, installment) => {},
    onAddStream = (installment) => {},
}) {
    const { PopupComponent } = usePopup()
    const [isDeleteInstallmentConfirmationOpen, setIsDeleteInstallmentConfirmationOpen] = useState(false)
    const [currenInstallmentForDeletion, setCurrentInstallmentForDeletion] = useState(null)
    const [isDeleteStreamConfirmationOpen, setIsDeleteStreamConfirmationOpen] = useState(false)
    const [currentStreamForDeletion, setCurrentStreamForDeletion] = useState(null)
    const [deletionPromise, setDeletionPromise] = useState({ resolve: () => {} })

    const [selectedInstallments, setSelectedInstallments] = useState(installments)
    const [selectedInstallmentID, setSelectedInstallmentID] = useState(null)

    const selectedInstallment = installments && installments.find((item) => item.id === selectedInstallmentID)

    useEffect(() => {
        setSelectedInstallments(installments)
    }, [installments])

    useEffect(() => {
        if (selectedInstallment) {
            setSelectedInstallmentLabel(selectedInstallment.label)
            setSelectedInstallmentType(selectedInstallment.isSeason ? "Season" : "Movie")
        }
    }, [selectedInstallment])

    // editing installment
    const [selectedInstallmentLabel, setSelectedInstallmentLabel] = useState((selectedInstallment && selectedInstallment.label) || "")
    const [selectedInstallmentType, setSelectedInstallmentType] = useState(selectedInstallment ? (selectedInstallment.isSeason ? "Season" : "Movie") : "")

    // adding installment
    const [newInstallmentLabel, setNewInstallmentLabel] = useState("")
    const [newInstallmentType, setNewInstallmentType] = useState("")

    return (
        <div className="flex flex-col w-full h-full gap-6">
            <PopupTabTitle
                label={formLabel}
                className={`h-fit w-full`}
            />
            {selectedInstallments && selectedInstallments.length > 0 && (
                <div className="w-full h-full flex flex-col lg:flex-row gap-6">
                    <div className="flex flex-col gap-6 lg:w-[45%]">
                        <PopupTab className="w-full">
                            <OrderedList
                                className="w-full h-64"
                                ItemElement={({ item }) => {
                                    return (
                                        <p className="flex flex-row gap-1 w-full h-full text-xs md:text-sm text-s-white justify-between items-center select-none">
                                            <span className="font-bold">{item.label}</span>
                                            <span className="flex flex-row gap-1 text-[10px] font-thin">
                                                <span className="bg-gray-50/20 p-1 w-12 truncate text-center ">{item.isSeason ? "Season" : "Movie"}</span>
                                                <span className="bg-gray-50/20 p-1 w-14 truncate text-center hidden lg:flex">Streams: {item.streams_count}</span>
                                            </span>
                                        </p>
                                    )
                                }}
                                items={selectedInstallments}
                                setItems={(items) => {
                                    setSelectedInstallments(items)
                                }}
                                isSelectable={true}
                                onSelectedItem={(item) => {
                                    setSelectedInstallmentID(item.id)
                                }}
                                onRemoveItem={async (item) => {
                                    setCurrentInstallmentForDeletion(item)
                                    setIsDeleteInstallmentConfirmationOpen(true)
                                    return new Promise((resolve) => {
                                        setDeletionPromise({ resolve })
                                    })
                                }}
                                onReleaseItem={async (item, index, newIndex) => {
                                    const isUpdated = await onEditInstallmentOrder(item, index, newIndex)
                                    return isUpdated
                                }}
                                isLoading={isLoadingEditInstallmentOrder || isLoadingDeleteInstallment}
                            />
                        </PopupTab>
                        <PopupTab className="w-full h-full">
                            {selectedInstallmentID && (
                                <InstallmentInfoForm
                                    label={selectedInstallmentLabel}
                                    setLabel={setSelectedInstallmentLabel}
                                    installmentType={selectedInstallmentType}
                                    setInstallmentType={setSelectedInstallmentType}
                                    isLoading={isLoadingEditInstallment}
                                    onClick={() => {
                                        onEditInstallment({
                                            installmentID: selectedInstallmentID,
                                            label: selectedInstallmentLabel,
                                            isSeason: selectedInstallmentType === "Season",
                                        })
                                    }}
                                />
                            )}
                        </PopupTab>
                    </div>
                    <div className="lg:w-[55%] h-144 flex flex-col gap-2">
                        <PopupTab className="w-full h-[80%] overflow-y-auto">
                            {selectedInstallmentID &&
                                selectedInstallment &&
                                selectedInstallment.TitleInstallmentStreams.map((item) => (
                                    <InstallmentStreamItem
                                        key={item.id}
                                        item={item}
                                        onDelete={(item) => {
                                            setCurrentStreamForDeletion(item)
                                            setIsDeleteStreamConfirmationOpen(true)
                                        }}
                                        onEdit={(item) => {
                                            onEditStream(item, selectedInstallment)
                                        }}
                                    />
                                ))}
                        </PopupTab>
                        <PopupTab className="w-full h-[20%] overflow-y-auto flex items-center justify-center">
                            <TitleButton
                                className={""}
                                label={"Add Stream"}
                                onClick={() => {
                                    onAddStream(selectedInstallment)
                                }}
                                Icon={Plus}
                            />
                        </PopupTab>
                    </div>
                </div>
            )}
            <PopupTab className="w-full">
                <InstallmentInfoForm
                    formLabel={"Add Installment"}
                    label={newInstallmentLabel}
                    setLabel={setNewInstallmentLabel}
                    installmentType={newInstallmentType}
                    setInstallmentType={setNewInstallmentType}
                    onClick={() => {
                        onAddInstallment({ label: newInstallmentLabel, isSeason: newInstallmentType === "Season" })
                    }}
                    isLoading={isLoadingAddInstallment}
                    resetOnClick={true}
                />
            </PopupTab>

            {currenInstallmentForDeletion && (
                <PopupComponent
                    onClose={() => {
                        deletionPromise.resolve(false)
                        setCurrentInstallmentForDeletion(null)
                        setIsDeleteInstallmentConfirmationOpen(false)
                    }}
                    isOpen={isDeleteInstallmentConfirmationOpen}
                    className={"flex items-center justify-center"}
                >
                    <ConfirmationPopup
                        label={
                            <span>
                                Are you sure you want to delete this installment{" "}
                                <span className="font-bold text-s-primary text-lg truncate">{currenInstallmentForDeletion.label}</span>? This will remove all data including streams
                                and cannot be undone.
                            </span>
                        }
                        leftButton={{
                            label: "Cancel",
                            onClick: () => {
                                deletionPromise.resolve(false)
                                setCurrentInstallmentForDeletion(null)
                                setIsDeleteInstallmentConfirmationOpen(false)
                            },
                        }}
                        rightButton={{
                            label: "Delete",
                            onClick: async () => {
                                const isDeleted = await onDeleteInstallment({ item: currenInstallmentForDeletion })
                                deletionPromise.resolve(isDeleted)
                                setCurrentInstallmentForDeletion(null)
                                setIsDeleteInstallmentConfirmationOpen(false)
                            },
                            isImportant: true,
                        }}
                    />
                </PopupComponent>
            )}

            {currentStreamForDeletion && (
                <PopupComponent
                    onClose={() => {
                        setCurrentStreamForDeletion(null)
                        setIsDeleteStreamConfirmationOpen(false)
                    }}
                    isOpen={isDeleteStreamConfirmationOpen}
                    className={"flex items-center justify-center"}
                >
                    <ConfirmationPopup
                        label={
                            <span>
                                Are you sure you want to delete this stream <span className="font-bold text-s-primary text-lg truncate">{currentStreamForDeletion.label}</span>?
                                This will remove all data for this stream are you sure?
                            </span>
                        }
                        leftButton={{
                            label: "Cancel",
                            onClick: () => {
                                setCurrentStreamForDeletion(null)
                                setIsDeleteStreamConfirmationOpen(false)
                            },
                        }}
                        rightButton={{
                            label: "Delete",
                            onClick: async () => {
                                await onDeleteStream({ item: currentStreamForDeletion })
                                setCurrentStreamForDeletion(null)
                                setIsDeleteStreamConfirmationOpen(false)
                            },
                            isImportant: true,
                            isLoading: isLoadingDeleteStream,
                        }}
                    />
                </PopupComponent>
            )}
        </div>
    )
}

function InstallmentStreamItem({ item, onEdit = (item) => {}, onDelete = (item) => {} }) {
    const { data: coverVersion } = useGetThumbnailCoverVersion(item.id)

    return (
        <div className="flex flex-row gap-1 w-full h-24 text-xs md:text-sm text-s-white justify-between items-center select-none bg-s-dark-primary rounded-xs p-2 my-2">
            <div className="aspect-3/2 w-32 rounded-xs border-2 border-s-white inset-shadow-xs inset-shadow-black">
                <ImageUI
                    Fallback={Image}
                    Src={getThumbnailURL(item.id, coverVersion)}
                    className=""
                />
            </div>
            <p className="flex flex-row items-center w-full justify-between">
                <span className="font-bold">{item.label}</span>
                <span className="flex-col gap-1 w-28  text-[10px] font-thin hidden md:flex">
                    <span className="bg-gray-50/20 p-1 w-full truncate text-center ">Likes: {ShortenCountAsString(item.likes_count)}</span>
                    <span className="bg-gray-50/20 p-1 w-full truncate text-center ">Released: {getSeriesTime(item.releaseDate)}</span>
                </span>
            </p>
            <div className="flex flex-row gap-1">
                <TitleButton
                    Icon={PenLine}
                    onClick={() => {
                        onEdit(item)
                    }}
                />
                <TitleButton
                    Icon={BadgeX}
                    onClick={async () => {
                        onDelete(item)
                    }}
                    className={"bg-red-400/90 hover:bg-red-400/70 active:bg-red-400/50"}
                    defaultColor={false}
                />
            </div>
        </div>
    )
}

function StreamForm({
    formLabel = "Add Stream",
    streamName,
    setStreamName,
    synopsis,
    setSynopsis,
    releaseDate,
    setReleaseDate,
    originalCoverFileUrl = null,
    setStreamThumbnail,
    onSubmit = () => {},
    isLoadingSubmit = null,
    children = null,
}) {
    return (
        <div className="flex flex-col w-full h-full p-4 gap-6">
            <PopupTabTitle
                label={formLabel}
                className={`h-fit w-full`}
            />

            <div className="w-full h-full flex flex-col lg:flex-row gap-6">
                <div className={`flex flex-col ${children ? "lg:w-[60%]" : "w-full"} h-fit lg:h-full gap-6`}>
                    <PopupTab className="flex flex-col gap-3">
                        <InputImageFile
                            className="bg-s-white/20 p-1 rounded-xs"
                            required={true}
                            onFileChange={(file) => {
                                setStreamThumbnail(file)
                            }}
                            originalImageUrl={originalCoverFileUrl}
                        />
                        <InputText
                            value={streamName}
                            onChange={(value) => setStreamName(value)}
                            className="bg-s-white/20 p-1 rounded-xs"
                            required={true}
                            placeholder={"Stream Name"}
                        />
                        <InputDatePicker
                            className="bg-s-white/20 p-1 rounded-xs"
                            required={true}
                            placeholder="Release Date"
                            onChange={setReleaseDate}
                            value={releaseDate}
                        />
                        <InputTextArea
                            className="bg-s-white/20 p-1 rounded-xs h-64"
                            placeholder={`Synopsis`}
                            value={synopsis}
                            onChange={(value) => setSynopsis(value)}
                        />
                        <TitleButton
                            isLoading={isLoadingSubmit}
                            className={`self-center`}
                            Icon={Check}
                            label={"Submit"}
                            onClick={() => onSubmit()}
                        />
                    </PopupTab>
                </div>
                {children && <PopupTab className="lg:w-[80%]">{children}</PopupTab>}
            </div>
        </div>
    )
}

function SubtitleForm({ subtitleName, setSubtitleName, isCC, setIsCC, onSubmit = () => {}, isLoadingSubmit = null, isStandalone = true }) {
    return (
        <div className="flex flex-col gap-2 bg-s-dark-primary py-4 px-8 rounded-sm">
            {isStandalone && <p className="text-center text-s-white font-semibold">Update Subtitle Info</p>}
            <InputText
                onChange={setSubtitleName}
                value={subtitleName}
                placeholder="Subtitle Name/Language"
            />
            <InputSelect
                placeholder="Is Closed Caption (CC)"
                onChange={(value) => {
                    value === "True" ? setIsCC(true) : setIsCC(false)
                }}
                value={isCC ? "True" : "False"}
                options={["True", "False"]}
            />
            {isStandalone && (
                <TitleButton
                    isLoading={isLoadingSubmit}
                    onClick={onSubmit}
                    label="Submit"
                    Icon={Check}
                />
            )}
        </div>
    )
}

function AudioForm({ audioName, setAudioName, onSubmit = () => {}, isLoadingSubmit = null, isStandalone = true }) {
    return (
        <div className="flex flex-col gap-2 bg-s-dark-primary py-4 px-8 rounded-sm">
            {isStandalone && <p className="text-center text-s-white font-semibold">Update Audio Info</p>}
            <InputText
                onChange={setAudioName}
                value={audioName}
                placeholder="Audio Name/Language"
            />
            {isStandalone && (
                <TitleButton
                    isLoading={isLoadingSubmit}
                    onClick={onSubmit}
                    label="Submit"
                    Icon={Check}
                />
            )}
        </div>
    )
}

function NoMedia({ mediaType }) {
    return (
        <div className="flex flex-col gap-2 items-center justify-center p-2 rounded-sm bg-s-dark-secondary/75 w-full">
            <CircleX size={36} />
            <p className="text-s-white font-semibold text-lg">No {mediaType} exists for this media file.</p>
        </div>
    )
}

function MediaContainer({ children, label }) {
    return (
        <div className="flex flex-col w-full h-fit p-2 bg-s-primary ">
            <p className="font-bold text-xl text-center p-2">{label}</p>
            <div className="flex flex-col gap-4 self-center">{children}</div>
        </div>
    )
}

function UploadMediaForm({ streamID, existingMedia: { video, audios, subtitles }, file, fileType, onClose = () => {} }) {
    const { addError } = useEventError()
    const queryClient = useQueryClient()
    const uploadID = useId()
    const [isLoadingFFmpeg, setLoadingFFmpeg] = useState(true)
    const [isLoadingMediaFile, setIsLoadingMediaFile] = useState(true)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [mediaFailure, setMediaFailure] = useState(!file && !fileType)
    const [mediaFailureMessage, setMediaFailureMessage] = useState(null)

    const [videoMedia, setVideoMedia] = useState(null)
    const [audioMedia, setAudioMedia] = useState(null)
    const [subtitleMedia, setSubtitleMedia] = useState(null)

    const [selectedVideoMedia, setSelectedVideoMedia] = useState(null)
    const [selectedAudioMedia, setSelectedAudioMedia] = useState(null)
    const [selectedSubtitleMedia, setSelectedSubtitleMedia] = useState(null)

    useEffect(() => {
        if (!file || !fileType) {
            setMediaFailure(true)
            console.warn("No file or fileType provided to UploadMediaForm, cannot upload media")
        }
    }, [file, fileType])

    function CancelUpload() {
        tempFileUpload.current &&
            tempFileUpload.current
                .CancelUpload()
                .then(() => {
                    addError("Successfully Force Cancelled Upload On Server", 8)
                })
                .catch((err) => {
                    addError(`${err.message}`, 1)
                })
    }

    const tempFileUpload = useRef(null)
    const isInitialized = useRef(false)
    const ffmpegRef = useRef(new FFmpeg())

    useEffect(() => {
        if (isInitialized.current) return

        isInitialized.current = true
        const ffmpeg = ffmpegRef.current

        async function RunAll() {
            await ffmpeg.load({
                coreURL: "/ffmpegwasm/ffmpeg-core.js",
                wasmURL: "/ffmpegwasm/ffmpeg-core.wasm",
            })
            setLoadingFFmpeg(false)
            await LoadMedia(ffmpeg)
            StartUpload().then()
        }

        async function LoadMedia(ffmpeg) {
            try {
                const tempJSONFilename = `${uploadID}_probe_data.json`
                const filename = `${uploadID}_${file.name.toLowerCase()}`

                const array8 = await fetchFile(file)
                await ffmpeg.writeFile(filename, array8)
                await ffmpeg.ffprobe(["-v", "error", "-show_format", "-show_streams", "-print_format", "json", filename, "-o", tempJSONFilename])

                const fileData = await ffmpeg.readFile(tempJSONFilename)
                const jsonString = new TextDecoder().decode(fileData)
                const probeData = JSON.parse(jsonString)

                try {
                    await ffmpeg.deleteFile(filename)
                    await ffmpeg.deleteFile(tempJSONFilename)
                } catch (err) {
                    // already deleted
                }

                if (!probeData || !probeData.streams || probeData.streams.length <= 0) {
                    throw new Error("No streams exist in the media file select another file to upload")
                }

                let tempVideoMedia = null
                let tempAudioMedia = []
                let tempSubtitleMedia = []

                probeData.streams.forEach((stream, index) => {
                    const label = stream.tags && (stream.tags.title ? stream.tags.title : stream.tags.language ? stream.tags.language : `${stream.codec_type} ${index + 1}`)
                    if (!tempVideoMedia && stream.codec_type === "video") {
                        tempVideoMedia = { videoIndex: 0 }
                    } else if (stream.codec_type === "audio") {
                        tempAudioMedia.push({ audioIndex: tempAudioMedia.length, label: label, probeIndex: index })
                    } else if (stream.codec_type === "subtitle") {
                        let isCC = stream.disposition && (stream.disposition["captions"] === 1 || stream.disposition["hearing_impaired"] === 1)
                        const title = stream.tags && stream.tags.title ? stream.tags.title.toLowerCase() : ""
                        isCC = isCC || title.includes("sdh") || title.includes("cc") || title.includes("closed caption")
                        tempSubtitleMedia.push({ subtitleIndex: tempSubtitleMedia.length, label: label, isCC: isCC, probeIndex: index })
                    }
                })

                setVideoMedia(tempVideoMedia)
                setAudioMedia(tempAudioMedia.length > 0 ? tempAudioMedia : null)
                setSubtitleMedia(tempSubtitleMedia.length > 0 ? tempSubtitleMedia : null)
                setSelectedVideoMedia(true)
                setSelectedAudioMedia(new Array(tempAudioMedia.length).fill(true))
                setSelectedSubtitleMedia(new Array(tempSubtitleMedia.length).fill(true))
                return
            } catch (error) {
                throw error
            }
        }

        async function StartUpload() {
            tempFileUpload.current = new TempFileUpload(file, 1024 * 1024 * 5)

            tempFileUpload.current
                .StartUpload((percentDownloaded) => {
                    setUploadProgress(percentDownloaded)
                    if (percentDownloaded >= 100) {
                        setIsLoadingMediaFile(false)
                    }
                })
                .catch((error) => {
                    setMediaFailure(true)
                    addError(`${error.message}`, 1)
                    setMediaFailureMessage(`${error.message}`)
                    console.error(error)
                    CancelUpload()
                })
        }

        RunAll().catch((err) => {
            setMediaFailureMessage(err.message)
            setMediaFailure(true)
        })

        return () => {
            setMediaFailure(false)

            if (tempFileUpload.current) {
                try {
                    tempFileUpload.current.CancelUpload({ force: false })
                } catch (e) {}
                tempFileUpload.current = null
            }

            const ffmpeg = ffmpegRef.current
            if (ffmpeg.loaded) {
                ffmpeg.terminate()
            }
        }
    }, [])

    function isAllInfoFilled() {
        let isAllFilled = true
        if (subtitleMedia) {
            subtitleMedia.forEach((item, index) => {
                if (selectedSubtitleMedia[index] && (item.label === null || item.label === undefined || item.label === "" || !item.isCC === undefined || item.isCC === null)) {
                    isAllFilled = false
                }
            })
        }

        if (audioMedia) {
            audioMedia.forEach((item, index) => {
                if (selectedAudioMedia[index] && (item.label === null || item.label === undefined || item.label === "")) {
                    isAllFilled = false
                }
            })
        }

        return isAllFilled
    }

    const { mutateAsync: addSubtitleRender, isPending: isPendingAddSubtitleRender } = useAddSubtitleRender({
        invalidateQueries: false,
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const { mutateAsync: addAudioRender, isPending: isPendingAddAudioRender } = useAddAudioRender({
        invalidateQueries: false,
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const { mutateAsync: addVideoRender, isPending: isPendingAddVideoRender } = useAddVideoRender({
        invalidateQueries: false,
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const { mutateAsync: updateVideoRender, isPending: isPendingUpdateVideoRender } = useUpdateVideoRender({
        invalidateQueries: false,
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })

    async function SubmitMedia() {
        const allSelectedInfoIsFilled = isAllInfoFilled()
        if (!allSelectedInfoIsFilled) {
            addError("All stream media must be completely filled before submitting renders", 1)
            return
        }

        if (subtitleMedia) {
            for (const [index, item] of subtitleMedia.entries()) {
                if (selectedSubtitleMedia[index]) {
                    try {
                        await addSubtitleRender({
                            streamID: streamID,
                            streamIndexSubtitleOnly: item.subtitleIndex,
                            isCC: item.isCC,
                            label: item.label,
                            tempFileID: tempFileUpload.current.LastUploadData.id,
                        })
                    } catch (err) {}
                }
            }
        }

        if (audioMedia) {
            for (const [index, item] of audioMedia.entries()) {
                if (selectedAudioMedia[index]) {
                    try {
                        await addAudioRender({
                            streamID: streamID,
                            streamIndexAudioOnly: item.audioIndex,
                            label: item.label,
                            tempFileID: tempFileUpload.current.LastUploadData.id,
                        })
                    } catch (err) {}
                }
            }
        }

        if (videoMedia) {
            try {
                if (video) {
                    await updateVideoRender({ streamID: streamID, tempFileID: tempFileUpload.current.LastUploadData.id })
                } else {
                    await addVideoRender({ streamID: streamID, tempFileID: tempFileUpload.current.LastUploadData.id })
                }
            } catch (err) {}
        }

        const audiosToInvalidate = audioMedia ? audioMedia.filter((_, index) => selectedAudioMedia[index]) : []
        const subtitlesToInvalidate = subtitleMedia ? subtitleMedia.filter((_, index) => selectedSubtitleMedia[index]) : []
        invalidateAddingStreamQueries(queryClient, streamID, audiosToInvalidate, subtitlesToInvalidate)

        onClose()
    }

    return (
        <div className="flex flex-col  gap-6 shadow-sharp-left shadow-black/70 bg-s-dark-primary w-[80lvw] h-fit max-h-[80vh] rounded-sm px-2 py-4 overflow-y-auto">
            <p className="text-center text-s-white font-semibold text-2xl w-[60lvw] self-center p-1 rounded-xs">Stream Media Upload</p>

            {isLoadingFFmpeg && !mediaFailure ? (
                <div className="flex flex-col gap-4 p-2">
                    <DefaultSpinner size={{ sm: 32, md: 48 }} />
                    <p className="text-center text-s-white text-md md:text-lg">wait a moment getting file info</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col p-2 items-center justify-center gap-6 w-full">
                        {isLoadingMediaFile && !mediaFailure ? (
                            <>
                                <p className="flex flex-col gap-1 text-center text-s-error md:w-[55lvw]">
                                    <span className="font-bold">ATTENTION!</span> The media file is currently uploading to the server you must wait until the file has been
                                    completely uploaded. This warning will disapear once the upload has finished, then you can submit the media you would like to add to this
                                    stream!
                                </p>
                                <div className="flex flex-col p-8 gap-4">
                                    <DefaultSpinner
                                        size={{ sm: 32, md: 48 }}
                                        SpinnerComponent={GridLoader}
                                    />
                                    <p className="text-center text-s-white text-md md:text-lg xl:text-xl ">
                                        <span className="font-semibold">{uploadProgress.toFixed(2)}%</span>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className={`flex flex-col items-center justify-center gap-4 py-8 rounded-lg ${mediaFailure ? "bg-s-error/15" : "bg-s-success/15"}`}>
                                {mediaFailure ? (
                                    <CircleX
                                        className="text-s-white"
                                        size={64}
                                    />
                                ) : (
                                    <CheckCircle
                                        className="text-s-white"
                                        size={64}
                                    />
                                )}
                                <p className={`text-center w-[55lvw] ${mediaFailure ? "text-s-error" : "text-s-success"} px-4 py-1`}>
                                    {mediaFailure
                                        ? `${mediaFailureMessage ? mediaFailureMessage : "The upload has failed you can safely back out of this upload. Please try again or select a different file."}`
                                        : "The upload has completed. Before submitting make sure you have selected only the media streams from the file you want uploaded to the stream. A video file will replace the video currently attached to this stream!"}
                                </p>
                            </div>
                        )}
                    </div>
                    {!mediaFailure && (
                        <div className="flex flex-col items-center justify-center gap-4 w-full ">
                            <p className={`text-center md:w-[45lvw] text-sm text-s-white px-4 py-1`}>
                                You may unselect the stream media down below if you don't want to upload it with the others. Some streams may not be auto populated as you want it.
                                so You may want to modify the attributes while you wait!
                            </p>
                            {/* VIDEO */}
                            <MediaContainer label="Video Stream Media">
                                {videoMedia ? (
                                    <InputBox
                                        isChecked={selectedVideoMedia}
                                        setIsChecked={setSelectedVideoMedia}
                                        className="bg-s-dark-secondary/50 p-2 rounded-sm"
                                    >
                                        <p className="text-s-white font-semibold p-2 rounded-sm">Include Video?</p>
                                    </InputBox>
                                ) : (
                                    <NoMedia mediaType={"video"}></NoMedia>
                                )}
                            </MediaContainer>

                            {/* Subtitle */}
                            <MediaContainer label="Subtitle Stream Media">
                                {subtitleMedia ? (
                                    subtitleMedia.map((item, index) => {
                                        return (
                                            <InputBox
                                                key={index}
                                                isChecked={selectedSubtitleMedia[index]}
                                                setIsChecked={(value) => {
                                                    setSelectedSubtitleMedia((prev) => {
                                                        const newArray = [...prev]
                                                        newArray[index] = value
                                                        return newArray
                                                    })
                                                }}
                                                className="bg-s-dark-secondary/50 p-2 rounded-sm"
                                            >
                                                <SubtitleForm
                                                    subtitleName={item.label}
                                                    setSubtitleName={(value) => {
                                                        setSubtitleMedia((prev) => {
                                                            const newArray = [...prev]
                                                            newArray[index].label = value
                                                            return newArray
                                                        })
                                                    }}
                                                    isCC={item.isCC}
                                                    setIsCC={(value) => {
                                                        setSubtitleMedia((prev) => {
                                                            const newArray = [...prev]
                                                            newArray[index].isCC = value
                                                            return newArray
                                                        })
                                                    }}
                                                    isStandalone={false}
                                                />
                                                <p className="text-s-white font-semibold p-1 rounded-sm">
                                                    Probed Stream Index: <span className="font-bold">[{item.probeIndex}]</span>
                                                </p>
                                            </InputBox>
                                        )
                                    })
                                ) : (
                                    <NoMedia mediaType={"subtitle"}></NoMedia>
                                )}
                            </MediaContainer>

                            {/* Audio */}
                            <MediaContainer label="Audio Stream Media">
                                {audioMedia ? (
                                    audioMedia.map((item, index) => {
                                        return (
                                            <InputBox
                                                key={index}
                                                isChecked={selectedAudioMedia[index]}
                                                setIsChecked={(value) => {
                                                    setSelectedAudioMedia((prev) => {
                                                        const newArray = [...prev]
                                                        newArray[index] = value
                                                        return newArray
                                                    })
                                                }}
                                                className="bg-s-dark-secondary/50 p-2 rounded-sm"
                                            >
                                                <AudioForm
                                                    audioName={item.label}
                                                    setAudioName={(value) => {
                                                        setAudioMedia((prev) => {
                                                            const newArray = [...prev]
                                                            newArray[index].label = value
                                                            return newArray
                                                        })
                                                    }}
                                                    isStandalone={false}
                                                />
                                                <p className="text-s-white font-semibold p-1 rounded-sm">
                                                    Probed Stream Index: <span className="font-bold">[{item.probeIndex}]</span>
                                                </p>
                                            </InputBox>
                                        )
                                    })
                                ) : (
                                    <NoMedia mediaType={"audio"}></NoMedia>
                                )}
                            </MediaContainer>

                            <div className="flex flex-row gap-4 items-center justify-center w-full">
                                {!isPendingAddVideoRender && !isPendingAddAudioRender && !isPendingAddSubtitleRender && !isPendingUpdateVideoRender && (
                                    <TitleButton
                                        label={"Cancel Media Upload"}
                                        onClick={() => {
                                            CancelUpload()
                                            onClose()
                                        }}
                                    />
                                )}

                                {!isLoadingMediaFile && (
                                    <TitleButton
                                        label={"Submit Selected Media"}
                                        onClick={async () => {
                                            await SubmitMedia()
                                        }}
                                        isLoading={isPendingAddVideoRender || isPendingAddAudioRender || isPendingAddSubtitleRender || isPendingUpdateVideoRender}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function StreamFormPlusSubtitle({ subtitle, onEdit = () => {}, onDelete = () => {} }) {
    const [subtitleProgress, setSubtitleProgress] = useState(null)
    /*
    Removed To Save Performance 
    const eventSource = useStreamSubtitleRenderInfo(
        subtitle.streamID,
        subtitle.label,
        subtitle.isCC,
        () => {
            setSubtitleProgress(0)
        },
        (data) => {
            if (data.progress) {
                setSubtitleProgress(data.progress.percent)
            }
        },
        () => {
            setSubtitleProgress(null)
        },
        () => {
            setSubtitleProgress(null)
        },
        subtitle.isDownloaded
    )
  */
    return (
        <div
            key={`${subtitle.label}-${subtitle.isCC}`}
            className="flex flex-row gap-2 items-center justify-between bg-s-dark-primary/80 p-2 rounded-sm"
        >
            <div className="text-s-white font-semibold flex flex-row gap-3 items-center justify-between">
                <p className="flex flex-row gap-1">
                    {subtitle.label}
                    <span className="text-s-tertiary">{subtitle.isCC && " (CC)"}</span>
                </p>
                {subtitleProgress && (
                    <div className="flex flex-row gap-1">
                        <DefaultSpinner />
                        {subtitleProgress.toFixed(2)}%
                    </div>
                )}
            </div>
            <div className="flex flex-row gap-1">
                <TitleButton
                    onClick={() => {
                        onEdit()
                    }}
                    isLoading={false}
                    Icon={PenTool}
                />
                <TitleButton
                    className={"bg-red-400/90 hover:bg-red-400/70 active:bg-red-400/50"}
                    defaultColor={false}
                    onClick={() => {
                        onDelete()
                    }}
                    isLoading={false}
                    Icon={Trash}
                />
            </div>
        </div>
    )
}

function StreamFormPlusAudio({ audio, onEdit = () => {}, onDelete = () => {} }) {
    const [audioProgress, setAudioProgress] = useState(null)
    /*
        Removed To Save Performance 
    const eventSource = useStreamAudioRenderInfo(
        audio.streamID,
        audio.label,
        () => {
            setAudioProgress(0)
        },
        (data) => {
            if (data.progress) {
                setAudioProgress(data.progress.percent)
            }
        },
        () => {
            setAudioProgress(null)
        },
        () => {
            setAudioProgress(null)
        },
        audio.isDownloaded
    )
*/
    return (
        <div
            key={audio.label}
            className="flex flex-row gap-2 items-center justify-between bg-s-dark-primary/80 p-2 rounded-sm"
        >
            <div className="text-s-white font-semibold flex flex-col lg:flex-row gap-3">
                {audio.label}
                {audioProgress && (
                    <div className="flex flex-row gap-1">
                        <DefaultSpinner />
                        {audioProgress.toFixed(2)}%
                    </div>
                )}
            </div>
            <div className="flex flex-row gap-1">
                <TitleButton
                    onClick={() => {
                        onEdit()
                    }}
                    isLoading={false}
                    Icon={PenTool}
                />
                <TitleButton
                    className={"bg-red-400/90 hover:bg-red-400/70 active:bg-red-400/50"}
                    defaultColor={false}
                    onClick={() => {
                        onDelete()
                    }}
                    isLoading={false}
                    Icon={Trash}
                />
            </div>
        </div>
    )
}

function StreamFormPlusVideo({ video, onDelete = () => {} }) {
    const [videoProgress, setVideoProgress] = useState(null)
    const eventSource = useStreamVideoRenderInfo(
        video?.streamID,
        () => {
            setVideoProgress(0)
        },
        (data) => {
            if (data.progress) {
                setVideoProgress(data.progress.percentAllRes)
            }
        },
        () => {
            setVideoProgress(null)
        },
        () => {
            setVideoProgress(null)
        },
        video ? video?.isDownloaded : true
    )

    return (
        <div
            className={`flex flex-col items-center justify-center gap-1 ${videoProgress ? "bg-s-white/40" : video ? "bg-s-success/80" : "bg-s-error/80"} text-s-white font-semibold p-2 rounded-sm`}
        >
            {videoProgress ? (
                <>
                    <DefaultSpinner size={{ default: 64 }} />
                    <p className="text-s-dark-tertiary">
                        Processing Video Render: <span className="font-bold">{videoProgress.toFixed(2)}%</span>
                    </p>
                </>
            ) : (
                <>
                    <p>{video ? "Video Is Uploaded!" : "No Video Uploaded"}</p>
                    {video ? <Check size={36}></Check> : <CircleX size={36}></CircleX>}
                    {video && (
                        <TitleButton
                            className={"bg-red-400/90 hover:bg-red-400/70 active:bg-red-400/50"}
                            defaultColor={false}
                            label="Delete"
                            onClick={() => {
                                onDelete()
                            }}
                            Icon={Trash}
                        />
                    )}
                </>
            )}
        </div>
    )
}

function StreamFormPlus({
    currentEditStream,
    formLabel = "Edit Stream",
    streamName,
    setStreamName,
    synopsis,
    setSynopsis,
    releaseDate,
    setReleaseDate,
    setStreamThumbnail,
    onSubmit = async () => {},
    isLoadingSubmit = null,
}) {
    const { PopupComponent } = usePopup()
    const { addError } = useEventError()
    const { data: thumbnailVersion } = useGetThumbnailCoverVersion(currentEditStream.id)
    const { data: m3u8Version } = useGetM3u8Version(currentEditStream.id)
    const { data: streamData } = useGetStreamByID(currentEditStream.id)

    const [thumbnailHasBeenChanged, setThumbnailHasBeenChanged] = useState(false)
    const [subtitles, setSubtitles] = useState(streamData ? streamData.StreamSubtitles : [])
    const [audios, setAudios] = useState(streamData ? streamData.StreamAudios : [])

    useEffect(() => {
        if (streamData) {
            setSubtitles(streamData.StreamSubtitles)
            setAudios(streamData.StreamAudios)
        }
    }, [streamData])

    function checkChanges() {
        if (streamName !== currentEditStream.label) {
            return true
        }

        if (synopsis !== currentEditStream.synopsis) {
            return true
        }

        if (releaseDate !== getInputCalendarValue(currentEditStream.releaseDate)) {
            return true
        }

        if (thumbnailHasBeenChanged) {
            return true
        }

        return false
    }

    function OnSubmit() {
        onSubmit()
    }

    const oldSubtitleLabel = useRef(null)
    const oldSubtitleIsCC = useRef(null)
    const [editSubtitleLabel, setEditSubtitleLabel] = useState(null)
    const [editIsCC, setEditIsCC] = useState(null)
    const [openEditSubtitlePopup, setOpenEditSubtitlePopup] = useState(false)
    const { mutateAsync: updateSubtitleRender, isPending: isPendingUpdateSubtitleRender } = useUpdateSubtitleRender({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })

    const oldAudioLabel = useRef(null)
    const [editAudioLabel, setEditAudioLabel] = useState(null)
    const [openEditAudioPopup, setOpenEditAudioPopup] = useState(false)
    const { mutateAsync: updateAudioRender, isPending: isPendingUpdateAudioRender } = useUpdateAudioRender({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })

    const [openDeleteVideoPopup, setOpenDeleteVideoPopup] = useState(false)
    const { mutateAsync: deleteVideoRender, isPending: isPendingDeleteVideoRender } = useDeleteVideoRender({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const [deleteSubtitleData, setDeleteSubtitleData] = useState(null)
    const [openDeleteSubtitlePopup, setOpenDeleteSubtitlePopup] = useState(false)
    const { mutateAsync: deleteSubtitleRender, isPending: isPendingDeleteSubtitleRender } = useDeleteSubtitleRender({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const [deleteAudioData, setDeleteAudioData] = useState(null)
    const [openDeleteAudioPopup, setOpenDeleteAudioPopup] = useState(false)
    const { mutateAsync: deleteAudioRender, isPending: isPendingDeleteAudioRender } = useDeleteAudioRender({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })

    const [currentMediaFile, setCurrentMediaFile] = useState(null)
    const [fileType, setFileType] = useState()
    const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false)

    return (
        <div className="flex flex-col w-full h-full p-4 gap-6">
            <StreamForm
                formLabel={formLabel}
                streamName={streamName}
                setStreamName={setStreamName}
                synopsis={synopsis}
                setSynopsis={setSynopsis}
                releaseDate={releaseDate}
                setReleaseDate={setReleaseDate}
                originalCoverFileUrl={getThumbnailURL(currentEditStream.id, thumbnailVersion)}
                setStreamThumbnail={(file) => {
                    setStreamThumbnail(file)
                    if (file) {
                        setThumbnailHasBeenChanged(true)
                    } else {
                        setThumbnailHasBeenChanged(false)
                    }
                }}
                isLoadingSubmit={isLoadingSubmit}
                onSubmit={OnSubmit}
            >
                {streamData && (
                    <>
                        <div className="bg-s-dark-secondary/80 w-full p-2 rounded-xs">
                            <StreamFormPlusVideo
                                video={streamData?.StreamVideo}
                                onDelete={() => {
                                    setOpenDeleteVideoPopup(true)
                                }}
                            />
                        </div>
                        <div className="flex flex-col justify-center h-full gap-2">
                            <div className="m-2 p-2  bg-s-dark-secondary/80 rounded-sm flex flex-col gap-2">
                                <p className="text-s-primary text-center font-semibold">Subtitles</p>
                                <div className="flex flex-col gap-2 overflow-y-auto h-40 p-2">
                                    {subtitles.map((subtitle) => {
                                        return (
                                            <StreamFormPlusSubtitle
                                                key={`${subtitle.label}-${subtitle.isCC}`}
                                                subtitle={subtitle}
                                                onEdit={() => {
                                                    oldSubtitleLabel.current = subtitle.label
                                                    oldSubtitleIsCC.current = subtitle.isCC
                                                    setEditSubtitleLabel(subtitle.label)
                                                    setEditIsCC(subtitle.isCC)
                                                    setOpenEditSubtitlePopup(true)
                                                }}
                                                onDelete={() => {
                                                    setDeleteSubtitleData(subtitle)
                                                    setOpenDeleteSubtitlePopup(true)
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="m-2 p-2  bg-s-dark-secondary/80 rounded-sm flex flex-col gap-2">
                                <p className="text-s-primary text-center font-semibold">Audio</p>
                                <div className="flex flex-col gap-2 overflow-y-auto h-40 p-2">
                                    {audios.map((audio) => {
                                        return (
                                            <StreamFormPlusAudio
                                                key={`${audio.label}`}
                                                audio={audio}
                                                onEdit={() => {
                                                    oldAudioLabel.current = audio.label
                                                    setEditAudioLabel(audio.label)
                                                    setOpenEditAudioPopup(true)
                                                }}
                                                onDelete={() => {
                                                    setDeleteAudioData(audio)
                                                    setOpenDeleteAudioPopup(true)
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </StreamForm>
            <InputMediaFile
                onClick={(e) => {
                    if (checkChanges()) {
                        e.preventDefault()
                        alert("Please submit changes to Stream before uploading new media files")
                        return
                    }
                }}
                onFileChange={(file) => {
                    const filename = file.name.toLowerCase()
                    if (validateFileExtension(filename, valid_subtitle_extensions)) {
                        setFileType(FILE_TYPES.SUBTITLE)
                        setCurrentMediaFile(file)
                        setIsMediaPopupOpen(true)
                        return
                    }

                    if (validateFileExtension(filename, valid_audio_extensions)) {
                        setFileType(FILE_TYPES.AUDIO)
                        setCurrentMediaFile(file)
                        setIsMediaPopupOpen(true)
                        return
                    }

                    if (validateFileExtension(filename, valid_video_extensions)) {
                        setFileType(FILE_TYPES.VIDEO)
                        setCurrentMediaFile(file)
                        setIsMediaPopupOpen(true)
                        return
                    }

                    addError("Invalid file type! Please Select Only Within the Acceptable Types", 1)
                }}
            />
            {streamData && (
                <div className="p-4 bg-s-dark-secondary/80 border-2 border-s-dark-tertiary/50 flex flex-col gap-4">
                    <p className="self-center text-s-white text-2xl font-bold underline">Completely Downloaded Stream Preview</p>
                    <div className="max-w-[50lvw] w-full aspect-video h-fit self-center">
                        <VideoPlayer
                            src={getM3u8URL(streamData.id, m3u8Version)}
                            onChangeSubtitle={async (currentSubtitle) => {
                                if (!currentSubtitle) {
                                    return null
                                }
                                const subtitleData = streamData?.StreamSubtitles.find((el) => el.label === currentSubtitle.name)
                                if (!subtitleData) {
                                    return null
                                }
                                const ext = getExtensionFromSubtitleCodec(subtitleData.codec_name)
                                if (ext !== "ssa" && ext !== "ass") {
                                    return null
                                }

                                const content = await FetchSubtitleByStreamIDLabelExt(streamData?.id, currentSubtitle.name, ext)

                                return content
                            }}
                        />
                    </div>
                </div>
            )}

            <PopupComponent
                onClose={() => setOpenDeleteVideoPopup(false)}
                isOpen={openDeleteVideoPopup}
                className={"flex items-center justify-center"}
            >
                <ConfirmationPopup
                    label={"Are you sure you want to delete the video for this stream? This action cannot be undone."}
                    leftButton={{ label: "Cancel", onClick: () => setOpenDeleteVideoPopup(false) }}
                    rightButton={{
                        label: "Delete",
                        onClick: async () => {
                            await deleteVideoRender({ streamID: streamData.id })
                            setOpenDeleteVideoPopup(false)
                        },
                        isLoading: isPendingDeleteVideoRender,
                        isImportant: true,
                    }}
                />
            </PopupComponent>

            {deleteSubtitleData && (
                <PopupComponent
                    onClose={() => {
                        setOpenDeleteSubtitlePopup(false)
                    }}
                    isOpen={openDeleteSubtitlePopup}
                    className={"flex items-center justify-center"}
                >
                    <ConfirmationPopup
                        label={
                            <span>
                                Are you sure you want to delete subtitle<span className="text-s-primary font-bold">{` ${deleteSubtitleData.label} `}</span>for this stream? This
                                action cannot be undone.
                            </span>
                        }
                        leftButton={{ label: "Cancel", onClick: () => setOpenDeleteSubtitlePopup(false) }}
                        rightButton={{
                            label: "Delete",
                            onClick: async () => {
                                await deleteSubtitleRender({ streamID: streamData.id, label: deleteSubtitleData.label, isCC: deleteSubtitleData.isCC })
                                setOpenDeleteSubtitlePopup(false)
                            },
                            isLoading: isPendingDeleteAudioRender,
                            isImportant: true,
                        }}
                    />
                </PopupComponent>
            )}

            {deleteAudioData && (
                <PopupComponent
                    onClose={() => setOpenDeleteAudioPopup(false)}
                    isOpen={openDeleteAudioPopup}
                    className={"flex items-center justify-center"}
                >
                    <ConfirmationPopup
                        label={
                            <span>
                                Are you sure you want to delete audio<span className="text-s-primary font-bold">{` ${deleteAudioData.label} `}</span>for this stream? This action
                                cannot be undone.
                            </span>
                        }
                        leftButton={{ label: "Cancel", onClick: () => setOpenDeleteAudioPopup(false) }}
                        rightButton={{
                            label: "Delete",
                            onClick: async () => {
                                await deleteAudioRender({ streamID: streamData.id, label: deleteAudioData.label })
                                setOpenDeleteAudioPopup(false)
                            },
                            isLoading: isPendingDeleteSubtitleRender,
                            isImportant: true,
                        }}
                    />
                </PopupComponent>
            )}

            {openEditAudioPopup && (
                <PopupComponent
                    onClose={() => {
                        setEditAudioLabel(null)
                        oldAudioLabel.current = null
                        setOpenEditAudioPopup(false)
                    }}
                    isOpen={openEditAudioPopup}
                    className={"flex items-center justify-center"}
                >
                    <AudioForm
                        audioName={editAudioLabel}
                        setAudioName={setEditAudioLabel}
                        onSubmit={async () => {
                            await updateAudioRender({ streamID: streamData.id, label: oldAudioLabel.current, newLabel: editAudioLabel })
                            setEditAudioLabel(null)
                            oldAudioLabel.current = null
                            setOpenEditAudioPopup(false)
                        }}
                        isLoadingSubmit={isPendingUpdateAudioRender}
                    />
                </PopupComponent>
            )}

            {openEditSubtitlePopup && (
                <PopupComponent
                    onClose={() => {
                        setEditSubtitleLabel(null)
                        setEditIsCC(null)
                        oldSubtitleLabel.current = null
                        oldSubtitleIsCC.current = null
                        setOpenEditSubtitlePopup(false)
                    }}
                    isOpen={openEditSubtitlePopup}
                    className={"flex items-center justify-center"}
                >
                    <SubtitleForm
                        subtitleName={editSubtitleLabel}
                        setSubtitleName={setEditSubtitleLabel}
                        isCC={editIsCC}
                        setIsCC={setEditIsCC}
                        onSubmit={async () => {
                            await updateSubtitleRender({
                                streamID: streamData.id,
                                label: oldSubtitleLabel.current,
                                newLabel: editSubtitleLabel,
                                isCC: oldSubtitleIsCC.current,
                                newIsCC: editIsCC,
                            })
                            setEditSubtitleLabel(null)
                            setEditIsCC(null)
                            oldSubtitleLabel.current = null
                            oldSubtitleIsCC.current = null
                            setOpenEditSubtitlePopup(false)
                        }}
                        isLoadingSubmit={isPendingUpdateSubtitleRender}
                    />
                </PopupComponent>
            )}

            {currentMediaFile && (
                <PopupComponent
                    onClose={() => {
                        setIsMediaPopupOpen(false)
                        setCurrentMediaFile(null)
                        setFileType(null)
                    }}
                    isOpen={isMediaPopupOpen}
                    className={""}
                >
                    <UploadMediaForm
                        streamID={streamData.id}
                        existingMedia={{ video: streamData?.StreamVideo, audios: streamData?.StreamAudios, subtitles: streamData?.StreamSubtitles }}
                        file={currentMediaFile}
                        fileType={fileType}
                        onClose={() => {
                            setIsMediaPopupOpen(false)
                            setCurrentMediaFile(null)
                            setFileType(null)
                        }}
                    />
                </PopupComponent>
            )}
        </div>
    )
}

function AddTitlePopup({ isOpen, onClose = (isSuccess) => {} }) {
    const [selectedCoverFile, setSelectedCoverFile] = useState(null)
    const [selectedTitleName, setSelectedTitleName] = useState("")
    const [selectedOriginalTranslation, setSelectedOriginalTranslation] = useState("")
    const [selectedFilmAgeMinimum, setSelectedFilmAgeMinimum] = useState("")
    const [selectedFilmSuitability, setSelectedFilmSuitability] = useState("")
    const [selectedDescription, setSelectedDescription] = useState("")
    const [selectedCopyright, setSelectedCopyright] = useState("")
    const [selectedContentAdvisories, setSelectedContentAdvisories] = useState([])
    const [selectedOtherTranslations, setSelectedOtherTranslations] = useState([])
    const [unselectedGenres, setUnselectedGenres] = useState([])
    const [selectedGenres, setSelectedGenres] = useState([])

    const { data: dataGenres, isSuccess: isSuccessGenres } = useGetGenres("inf")
    const genresFlattened = useMemo(() => {
        if (dataGenres && dataGenres.pages) {
            return dataGenres.pages.flatMap((page) => page).flatMap((genre) => genre.name)
        }

        return []
    }, [dataGenres])
    useEffect(() => {
        if (isSuccessGenres && genresFlattened) {
            setUnselectedGenres(genresFlattened)
        }
    }, [isSuccessGenres, genresFlattened])

    const { mutate: addTitle, isPending: isPendingAddTitle } = useAddTitle({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: () => {
            OnClosePopup(true)
        },
    })

    const { addError } = useEventError()

    function OnClosePopup(isSuccess) {
        onClose(isSuccess)
    }

    function onSubmit() {
        addTitle({
            label: selectedTitleName,
            originalTranslation: selectedOriginalTranslation,
            description: selectedDescription,
            copyright: selectedCopyright,
            filmSuitability: selectedFilmSuitability,
            filmAgeMin: selectedFilmAgeMinimum,
            genres: selectedGenres,
            otherTranslations: selectedOtherTranslations,
            contentAdvisories: selectedContentAdvisories,
            titleCover: selectedCoverFile,
        })
    }

    return (
        <TitlePopupTemplate
            isOpen={isOpen}
            onClose={() => {
                OnClosePopup(false)
            }}
        >
            <TitleForm
                originalCoverFileUrl={null}
                setSelectedCoverFile={setSelectedCoverFile}
                selectedTitleName={selectedTitleName}
                setSelectedTitleName={setSelectedTitleName}
                selectedOriginalTranslation={selectedOriginalTranslation}
                setSelectedOriginalTranslation={setSelectedOriginalTranslation}
                selectedFilmAgeMinimum={selectedFilmAgeMinimum}
                setSelectedFilmAgeMinimum={setSelectedFilmAgeMinimum}
                selectedFilmSuitability={selectedFilmSuitability}
                setSelectedFilmSuitability={setSelectedFilmSuitability}
                selectedDescription={selectedDescription}
                setSelectedDescription={setSelectedDescription}
                selectedCopyright={selectedCopyright}
                setSelectedCopyright={setSelectedCopyright}
                selectedContentAdvisories={selectedContentAdvisories}
                setSelectedContentAdvisories={setSelectedContentAdvisories}
                selectedOtherTranslations={selectedOtherTranslations}
                setSelectedOtherTranslations={setSelectedOtherTranslations}
                unselectedGenres={unselectedGenres}
                setUnselectedGenres={setUnselectedGenres}
                selectedGenres={selectedGenres}
                setSelectedGenres={setSelectedGenres}
                onSubmit={onSubmit}
                isLoadingSubmit={isPendingAddTitle}
            />
        </TitlePopupTemplate>
    )
}

function EditTitlePopup({ isOpen, onClose, titleData }) {
    const { PopupComponent } = usePopup()

    const { data: coverVersion } = useGetTitleCoverVersion(titleData.id)
    const { addError } = useEventError()

    // TITLE ONLY FORM
    const [selectedCoverFile, setSelectedCoverFile] = useState(null)
    const [selectedTitleName, setSelectedTitleName] = useState(titleData.label)
    const [selectedOriginalTranslation, setSelectedOriginalTranslation] = useState(titleData.originalTranslation || [])
    const [selectedFilmAgeMinimum, setSelectedFilmAgeMinimum] = useState(titleData.filmAgeMin || [])
    const [selectedFilmSuitability, setSelectedFilmSuitability] = useState(titleData.filmSuitability || [])
    const [selectedDescription, setSelectedDescription] = useState(titleData.description || [])
    const [selectedCopyright, setSelectedCopyright] = useState(titleData.copyright || [])
    const [selectedContentAdvisories, setSelectedContentAdvisories] = useState(titleData.all_content_advisories || [])
    const [selectedOtherTranslations, setSelectedOtherTranslations] = useState(titleData.all_other_translations || [])
    const [selectedGenres, setSelectedGenres] = useState(titleData.all_genres || [])

    const [unselectedGenres, setUnselectedGenres] = useState([])

    const { data: dataGenres, isSuccess: isSuccessGenres } = useGetGenres("inf")
    const genresFlattened = useMemo(() => {
        if (dataGenres && dataGenres.pages) {
            return dataGenres.pages.flatMap((page) => page).flatMap((genre) => genre.name)
        }

        return []
    }, [dataGenres])
    useEffect(() => {
        if (isSuccessGenres && genresFlattened) {
            setUnselectedGenres(genresFlattened)
        }
    }, [isSuccessGenres, genresFlattened])

    const { mutate: updateTitle, isPending: isPendingUpdateTitle } = useUpdateTitle({
        onError: (error) => {
            addError(error.message, 1)
            OnClosePopup()
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const { mutate: deleteTitle, isPending: isPendingDeleteTitle } = useDeleteTitle({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })

    function onSubmitTitleEdit() {
        const genreData = SeperateIntoAddAndDelete(titleData.all_genres, selectedGenres)
        const otherTranslationData = SeperateIntoAddAndDelete(titleData.all_other_translations, selectedOtherTranslations)
        const contentAdvisoryData = SeperateIntoAddAndDelete(titleData.all_content_advisories, selectedContentAdvisories)

        updateTitle({
            titleID: titleData.id,
            label: titleData.label !== selectedTitleName ? selectedTitleName : null,
            originalTranslation: titleData.originalTranslation !== selectedOriginalTranslation ? selectedOriginalTranslation : null,
            description: titleData.description !== selectedDescription ? selectedDescription : null,
            copyright: titleData.copyright !== selectedCopyright ? selectedCopyright : null,
            filmSuitability: titleData.filmSuitability !== selectedFilmSuitability ? selectedFilmSuitability : null,
            filmAgeMin: titleData.filmAgeMin !== selectedFilmAgeMinimum ? selectedFilmAgeMinimum : null,
            listData: {
                add: { genres: genreData.add, otherTranslations: otherTranslationData.add, contentAdvisories: contentAdvisoryData.add },
                delete: { genres: genreData.delete, otherTranslations: otherTranslationData.delete, contentAdvisories: contentAdvisoryData.delete },
            },
            titleCover: selectedCoverFile,
        })
    }
    // TITLE ONLY FORM END

    // ** INSTALLMENT FORM
    const { data: installments, error: isErrorTitleInstallments, isLoading: isLoadingTitleInstallments } = useGetIntallmentsByTitleID(titleData.id)
    const { mutate: addInstallment, isPending: isPendingAddInstallment } = useAddInstallment({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const { mutateAsync: editInstallment, isPending: isPendingEditInstallment } = useUpdateInstallment({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const { mutateAsync: deleteInstallment, isPending: isPendingDeleteInstallment } = useDeleteInstallment({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const { mutateAsync: deleteStream, isPending: isPendingDeleteStream } = useDeleteStream({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })

    // ** INSTALLMENT FORM END

    // ** STREAMS FORM
    const [addOrEditInstallmentID, setInstallmentID] = useState(null)

    const { mutateAsync: addStream, isPending: isPendingAddStream } = useAddStream({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })
    const { mutateAsync: editStream, isPending: isPendingEditStream } = useUpdateStream({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess: (data) => {
            addError(data.success, 8)
        },
    })

    // add form
    const [isAddStreamOpen, setIsAddStreamOpen] = useState(false)
    const [addSreamName, setAddStreamName] = useState("")
    const [addSynopsis, setAddSynopsis] = useState("")
    const [addReleaseDate, setAddReleaseDate] = useState("")
    const [addStreamThumbnail, setAddStreamThumbnail] = useState(null)

    // edit form
    const [isEditStreamOpen, setIsEditStreamOpen] = useState(false)
    const [currentEditStream, setCurrentEditStream] = useState(null)
    const [editStreamName, setEditStreamName] = useState("")
    const [editSynopsis, setEditSynopsis] = useState("")
    const [editReleaseDate, setEditReleaseDate] = useState("")
    const [editStreamThumbnail, setEditStreamThumbnail] = useState(null)

    useEffect(() => {
        if (currentEditStream) {
            setEditStreamName(currentEditStream.label)
            setEditSynopsis(currentEditStream.synopsis)
            setEditReleaseDate(getInputCalendarValue(currentEditStream.releaseDate))
        }
    }, [currentEditStream])

    // ** STREAMS FORM END

    // ALL
    const [isConfirmationOpen, setIsConfirmationOpen] = useState()

    function onDeleteTitle() {
        deleteTitle(titleData.id)
        onClose()
    }

    function OnClosePopup() {
        onClose()
    }

    const PAGES = Object.freeze({
        TITLE: 0,
        INSTALLMENT: 1,
        STREAM: 2,
    })
    const [currentPage, SetCurrentPage] = useState(PAGES.TITLE)

    // ALL END
    return (
        <>
            <TitlePopupTemplate
                isOpen={isOpen}
                onClose={OnClosePopup}
            >
                <div className="mb-6 flex flex-col-reverse lg:flex-row lg:justify-between items-center gap-4">
                    <div className={"flex flex-row"}>
                        <TitleSwitchFormsButton
                            disabled={currentPage === PAGES.TITLE}
                            label={"Title"}
                            onClick={() => SetCurrentPage(PAGES.TITLE)}
                        />
                        <TitleSwitchFormsButton
                            disabled={currentPage === PAGES.INSTALLMENT}
                            label={"Installment"}
                            onClick={() => SetCurrentPage(PAGES.INSTALLMENT)}
                        />
                    </div>
                    <TitleButton
                        isLoading={isPendingDeleteTitle}
                        onClick={() => setIsConfirmationOpen(true)}
                        defaultColor={false}
                        Icon={Trash}
                        className="bg-red-600/50 hover:bg-red-600/70 active:bg-red-600/90"
                        label="Delete Title"
                    />
                </div>
                {currentPage === PAGES.TITLE && (
                    <TitleForm
                        formLabel={"Edit Title"}
                        originalCoverFileUrl={getCoverTitleURL(titleData.id, coverVersion)}
                        setSelectedCoverFile={setSelectedCoverFile}
                        selectedTitleName={selectedTitleName}
                        setSelectedTitleName={setSelectedTitleName}
                        selectedOriginalTranslation={selectedOriginalTranslation}
                        setSelectedOriginalTranslation={setSelectedOriginalTranslation}
                        selectedFilmAgeMinimum={selectedFilmAgeMinimum}
                        setSelectedFilmAgeMinimum={setSelectedFilmAgeMinimum}
                        selectedFilmSuitability={selectedFilmSuitability}
                        setSelectedFilmSuitability={setSelectedFilmSuitability}
                        selectedDescription={selectedDescription}
                        setSelectedDescription={setSelectedDescription}
                        selectedCopyright={selectedCopyright}
                        setSelectedCopyright={setSelectedCopyright}
                        selectedContentAdvisories={selectedContentAdvisories}
                        setSelectedContentAdvisories={setSelectedContentAdvisories}
                        selectedOtherTranslations={selectedOtherTranslations}
                        setSelectedOtherTranslations={setSelectedOtherTranslations}
                        unselectedGenres={unselectedGenres}
                        setUnselectedGenres={setUnselectedGenres}
                        selectedGenres={selectedGenres}
                        setSelectedGenres={setSelectedGenres}
                        submitLabel={"Confirm Edit"}
                        onSubmit={onSubmitTitleEdit}
                        isLoadingSubmit={isPendingUpdateTitle}
                    />
                )}
                {currentPage === PAGES.INSTALLMENT && (
                    <InstallmentForm
                        installments={installments}
                        onAddInstallment={({ label, isSeason }) => {
                            addInstallment({ titleID: titleData.id, label, isSeason })
                        }}
                        isLoadingAddInstallment={isPendingAddInstallment}
                        onEditInstallment={async ({ installmentID, label, isSeason }) => {
                            await editInstallment({ installmentID, label, isSeason })
                        }}
                        isLoadingEditInstallment={isPendingEditInstallment}
                        onDeleteInstallment={async ({ item }) => {
                            const result = await deleteInstallment({ installmentID: item.id })
                            const isDelete = result && !!result.success
                            return isDelete
                        }}
                        isLoadingDeleteInstallment={isPendingDeleteInstallment}
                        onDeleteStream={async ({ item }) => {
                            await deleteStream({ streamID: item.id })
                        }}
                        isLoadingDeleteStream={isPendingDeleteStream}
                        onEditInstallmentOrder={async (item, index, newIndex) => {
                            const result = await editInstallment({ installmentID: item.id, installmentNumber: newIndex })
                            const isUpdated = result && !!result.success
                            return isUpdated
                        }}
                        isLoadingEditInstallmentOrder={isPendingEditInstallment}
                        onEditStream={(item, installment) => {
                            setCurrentEditStream(item)
                            setInstallmentID(installment.id)
                            setIsEditStreamOpen(true)
                        }}
                        onAddStream={(installment) => {
                            setInstallmentID(installment.id)
                            setIsAddStreamOpen(true)
                        }}
                    />
                )}
            </TitlePopupTemplate>

            {isConfirmationOpen && (
                <PopupComponent
                    onClose={() => setIsConfirmationOpen(false)}
                    isOpen={isConfirmationOpen}
                    className={"flex items-center justify-center"}
                >
                    <ConfirmationPopup
                        label={"Are you sure you want to delete this title?"}
                        leftButton={{ label: "Cancel", onClick: () => setIsConfirmationOpen(false) }}
                        rightButton={{ label: "Delete", onClick: () => onDeleteTitle(), isLoading: isPendingDeleteTitle, isImportant: true }}
                    />
                </PopupComponent>
            )}

            {currentEditStream && (
                <TitlePopupTemplate
                    onClose={() => {
                        setCurrentEditStream(null)
                        setIsEditStreamOpen(false)
                        setStreamName(null)
                        setSynopsis(null)
                        setReleaseDate(null)
                        setStreamThumbnail(null)
                    }}
                    isOpen={isEditStreamOpen}
                >
                    <StreamFormPlus
                        formLabel={"Edit Stream"}
                        streamName={editStreamName}
                        setStreamName={setEditStreamName}
                        synopsis={editSynopsis}
                        setSynopsis={setEditSynopsis}
                        releaseDate={editReleaseDate}
                        setReleaseDate={setEditReleaseDate}
                        setStreamThumbnail={setEditStreamThumbnail}
                        isLoadingSubmit={isPendingEditStream}
                        onSubmit={async () => {
                            await editStream({
                                streamID: currentEditStream?.id,
                                titleID: titleData.id,
                                installmentID: addOrEditInstallmentID,
                                label: editStreamName,
                                synopsis: editSynopsis,
                                releaseDate: editReleaseDate,
                                streamThumbnail: editStreamThumbnail,
                            })
                        }}
                        currentEditStream={currentEditStream}
                    />
                </TitlePopupTemplate>
            )}

            {isAddStreamOpen && (
                <TitlePopupTemplate
                    onClose={() => setIsAddStreamOpen(false)}
                    isOpen={isAddStreamOpen}
                >
                    <StreamForm
                        formLabel={"Add Stream"}
                        streamName={addSreamName}
                        setStreamName={setAddStreamName}
                        synopsis={addSynopsis}
                        setSynopsis={setAddSynopsis}
                        releaseDate={addReleaseDate}
                        setReleaseDate={setAddReleaseDate}
                        originalCoverFileUrl={null}
                        setStreamThumbnail={setAddStreamThumbnail}
                        isLoadingSubmit={isPendingAddStream}
                        onSubmit={async () => {
                            await addStream({
                                titleID: titleData.id,
                                installmentID: addOrEditInstallmentID,
                                label: addSreamName,
                                synopsis: addSynopsis,
                                releaseDate: addReleaseDate,
                                streamThumbnail: addStreamThumbnail,
                            })
                            setIsAddStreamOpen(false)
                        }}
                    />
                </TitlePopupTemplate>
            )}
        </>
    )
}

function TitleMiscForm({ selectedGenres, setSelectedGenres, unselectedGenres, setUnselectedGenres, submitLabel = "Submit Changes", onSubmit = () => {}, isLoadingSubmit = null }) {
    return (
        <div className="flex flex-col w-full h-full gap-6">
            <PopupTabTitle
                label={"Add Miscellaneous"}
                className={`h-fit w-full`}
            />
            <PopupTab className="">
                <TitleButton
                    isLoading={isLoadingSubmit}
                    className={`self-center`}
                    Icon={Check}
                    label={submitLabel}
                    onClick={() => onSubmit()}
                />
            </PopupTab>
            <PopupTab className={`gap-3 h-full`}>
                <InputSelectMulti
                    className="bg-s-white/20 p-1 rounded-xs"
                    placeholder={`Genres`}
                    options={unselectedGenres}
                    setOptions={setUnselectedGenres}
                    currentSelectedOptions={selectedGenres}
                    setCurrentSelectedOptions={setSelectedGenres}
                    allowSelfInput={true}
                />
            </PopupTab>
        </div>
    )
}

function AddTitleMiscPopup({ isOpen, onClose }) {
    const { addError } = useEventError()

    const { data: dataGenres, isSuccess } = useGetGenres("inf")

    const dataFlattened = useMemo(() => {
        if (dataGenres && dataGenres.pages) {
            return dataGenres.pages.flatMap((page) => page).flatMap((genre) => genre.name)
        }

        return []
    }, [dataGenres])

    const [selectedGenres, setSelectedGenres] = useState([])
    const [unselectedGenres, setUnselectedGenres] = useState([].concat(Object.values(GENRES)))

    useEffect(() => {
        if (isSuccess && dataFlattened) {
            setSelectedGenres(dataFlattened)
        }
    }, [isSuccess, dataFlattened])

    const { mutate: addGenre, isPending: isPendingAddGenre } = useAddGenre({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess(data) {
            addError(data.success, 8)
        },
    })

    const { mutate: deleteGenre, isPending: isPendingDeleteGenre } = useDeleteGenre({
        onError: (error) => {
            addError(error.message, 1)
        },
        onSuccess(data) {
            addError(data.success, 8)
        },
    })

    function OnClosePopup() {
        onClose()
    }

    function onSubmit() {
        const genreData = SeperateIntoAddAndDelete(dataFlattened, selectedGenres)

        for (const name of genreData.add) {
            addGenre({ name })
        }

        for (const name of genreData.delete) {
            deleteGenre(name)
        }

        onClose()
    }

    return (
        <TitlePopupTemplate
            isOpen={isOpen}
            onClose={OnClosePopup}
        >
            <TitleMiscForm
                selectedGenres={selectedGenres}
                setSelectedGenres={setSelectedGenres}
                unselectedGenres={unselectedGenres}
                setUnselectedGenres={setUnselectedGenres}
                isLoadingSubmit={isPendingAddGenre || isPendingDeleteGenre}
                onSubmit={onSubmit}
            />
        </TitlePopupTemplate>
    )
}

function TitleButton({ Icon, label, onClick, className = "", isLoading, defaultColor = true, disabled = false }) {
    return (
        <ButtonUI
            isLoading={isLoading}
            className={`${className} ${defaultColor && `${disabled ? "pointer-events-none" : ""} bg-s-tertiary/50 hover:bg-s-tertiary/70 active:bg-s-tertiary/90`} px-4 py-2 md:px-6 md:py-4 rounded-md inset-shadow-sm inset-shadow-s-dark-tertiary  text-s-white font-semibold flex flex-row justify-center items-center gap-x-2`}
            label={
                <div className="flex flex-row items-center gap-x-1 md:gap-x-2 text-sm md:text-md">
                    {Icon && <Icon />}
                    {label}
                </div>
            }
            onClick={onClick}
            disabled={disabled}
        />
    )
}

function TitleSwitchFormsButton({ Icon, label, onClick, className = "", isLoading, disabled = false }) {
    return (
        <ButtonUI
            className={`${className} ${disabled ? "bg-black/80" : "bg-gray-500/50 hover:bg-gray-500/70 active:bg-gray-500/90"} rounded-sm px-4 py-2 h-12 w-24 text-xs`}
            Icon={Icon}
            label={label}
            onClick={onClick}
            isLoading={isLoading}
            disabled={disabled}
        />
    )
}

function PopupTabTitle({ className = "", label }) {
    return (
        <PopupTab className={`${className} items-center justify-center py-3 bg-s-tertiary inset-shadow-s-dark-tertiary outline-s-dark-tertiary`}>
            <p className="font-bold text-s-white text-center text-2xl text-shadow-xs text-shadow-black">{label}</p>
        </PopupTab>
    )
}

function PopupTab({ className = "", children, label = null }) {
    return (
        <div className={`${className} bg-s-dark-tertiary inset-shadow-xs inset-shadow-s-white flex flex-col outline-2 outline-s-white rounded-xs p-3`}>
            {label && <p className="w-full text-center font-semibold text-s-white bg-s-primary/50 px-2 py-1 rounded-xs">{label}</p>}
            {children}
        </div>
    )
}

// TODO: NEED TO MOVE THE INPUTS INTO THEIR OWN FILE OR FOLDER IDC RIGHT NOW SO CLOSE TO BEING FINISHED

function InputImageFile({ className = "", originalImageUrl = null, onFileChange = (file) => {}, required = false }) {
    const [selectedFile, setSelectedFile] = useState(null)
    const inputRef = useRef(null)

    return (
        <div
            onClick={(e) => {
                inputRef.current.click()
            }}
            className={`${className} flex flex-col gap-2 md:gap-3 items-center justify-center w-full h-full relative`}
        >
            {required && <Asterisk className={"absolute right-0 top-0 text-red-500"} />}
            <div className="w-32 mt-4">
                <ImageUI
                    className="text-s-white aspect-video"
                    Src={selectedFile ? URL.createObjectURL(selectedFile) : originalImageUrl}
                    Fallback={FileQuestionMark}
                />
            </div>
            {selectedFile && <p className="truncate text-s-tertiary text-xs md:text-sm font-thin">{selectedFile.name}</p>}
            <div
                onClick={(e) => {
                    if (selectedFile) {
                        e.stopPropagation()
                        setSelectedFile(null)
                        onFileChange(null)
                    }
                }}
                className="select-none flex flex-row w-fit bg-s-dark-secondary/50 hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90 rounded-sm px-2 py-1 text-s-white text-sm md:text-md font-semibold cursor-pointer gap-1"
            >
                <input
                    ref={inputRef}
                    className="truncate w-0 h-0 opacity-0 absolute"
                    type="file"
                    accept="image/png, image/jpeg"
                    required={required}
                    onChange={(e) => {
                        const file = e.target.files[0]
                        setSelectedFile(file)
                        onFileChange(file)
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    placeholder="Select Image"
                />
                <p className="">{selectedFile ? "Remove New Image" : "Select Image"}</p>
                {required && !selectedFile && <p className="text-[9px] self-end text-red-500">Required</p>}
            </div>
        </div>
    )
}

function InputMediaFile({ className = "", onClick = (e) => {}, onFileChange = (file) => {} }) {
    const inputRef = useRef(null)

    return (
        <div
            onClick={() => {
                inputRef.current.click()
            }}
            className="gap-2 md:gap-3 flex flex-col items-center justify-center bg-s-dark-tertiary/50 hover:bg-s-dark-tertiary/70 active:bg-s-dark-tertiary/90 py-22 px-2 rounded-sm"
        >
            <p className="text-center w-[65lvw] text-s-tertiary text-sm md:text-md font-semibold">
                Click here to select a media file to upload Subtitles and Audios to the Stream or a Replace/Add a Video to the Stream
            </p>
            <div className="select-none flex flex-row w-fit bg-s-dark-secondary/50 hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90 rounded-sm px-2 py-1 text-s-white text-sm md:text-md font-semibold cursor-pointer gap-1">
                <p className="">Select Media File</p>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".srt, .vtt, .ass, .sub, .ssa, audio/mpeg, .mp3, audio/wav, .wav, .m4a, .mka, video/mp4, .mp4, video/webm, .webm, video/x-matroska, .mkv"
                    className="truncate opacity-0 absolute"
                    onChange={(e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        onFileChange(file)
                        e.stopPropagation()
                        e.preventDefault()
                        return
                    }}
                    onClick={(e) => {
                        onClick(e)
                    }}
                />
            </div>
        </div>
    )
}

function InputText({ className = "", value, onChange, placeholder = "", required = false, numberOnly = false, numberOnlyMin = null, numberOnlyMax = null }) {
    return (
        <div className={`${className} flex flex-col gap-1 w-full relative`}>
            <p className="text-s-white text-xs md:text-sm font-medium">{placeholder}</p>
            <input
                className="w-full bg-s-dark-secondary/50 hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90 rounded-sm px-2 py-2 text-s-white text-sm md:text-md font-semibold my-1 outline outline-s-white"
                type={`${numberOnly ? "number" : "text"}`}
                min={numberOnlyMin}
                max={numberOnlyMax}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {required && <Asterisk className={"absolute right-0 text-red-500 top-0"} />}
        </div>
    )
}

function InputTextArea({ className = "", value, onChange, placeholder = "", required = false }) {
    return (
        <div className={`${className} flex flex-col gap-1 w-full relative`}>
            <p className="text-s-white text-xs md:text-sm font-medium">{placeholder}</p>
            <textarea
                className="w-full h-full bg-s-dark-secondary/50 hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90 rounded-sm px-2 py-2 text-s-white text-sm md:text-md font-semibold my-1 outline outline-s-white resize-none"
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {required && <Asterisk className={"absolute right-0 text-red-500 top-0"} />}
        </div>
    )
}

function InputDatePicker({ className = "", value, onChange, placeholder = "", required = false }) {
    return (
        <div className={`${className} flex flex-col gap-1 w-full relative`}>
            <p className="text-s-white text-xs md:text-sm font-medium">{placeholder}</p>
            <input
                className="w-full bg-s-dark-secondary/50 hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90 rounded-sm px-2 py-2 text-s-white text-sm md:text-md font-semibold my-1 outline outline-s-white"
                type={"date"}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {required && <Asterisk className={"absolute right-0 text-red-500 top-0"} />}
        </div>
    )
}

function InputSelect({ className = "", value, onChange, placeholder = "", required = false, allowSelfInput = false, options = [], children, onEnter = (e) => {} }) {
    const datalistId = useId()

    return (
        <div className={`${className} flex flex-col gap-1 w-full relative`}>
            <p className="text-s-white text-xs md:text-sm font-medium">{placeholder}</p>
            {required && <Asterisk className={"absolute right-0 text-red-500 top-0"} />}
            {allowSelfInput ? (
                <div>
                    <input
                        className="w-full bg-s-dark-secondary/50 hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90 rounded-sm px-2 py-2 text-s-white text-sm md:text-md font-semibold my-1 outline outline-s-white"
                        placeholder={placeholder}
                        list={`${datalistId}`}
                        id={`input-${datalistId}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                onEnter(e)
                            }
                        }}
                    />

                    <ChevronDown
                        size={14}
                        className=" absolute top-11 right-2 text-s-white"
                    />

                    <datalist id={`${datalistId}`}>
                        {options.map((option, index) => (
                            <option
                                key={index}
                                value={option}
                            >
                                {option}
                            </option>
                        ))}
                    </datalist>
                </div>
            ) : (
                <select
                    className={`${value === "" ? "text-s-white/60" : "text-s-white"}  w-full bg-s-dark-secondary/50 hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90 rounded-sm px-2 py-2 text-sm md:text-md font-semibold my-1 outline outline-s-white`}
                    required={required}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option
                        default
                        value=""
                        disabled
                    >
                        Select Option
                    </option>
                    {options.map((option, index) => (
                        <option
                            key={index}
                            value={option}
                        >
                            {option}
                        </option>
                    ))}
                </select>
            )}
            {children}
        </div>
    )
}

function InputSelectMulti({
    className = "",
    placeholder = "",
    required = false,
    allowSelfInput = false,
    options,
    setOptions,
    currentSelectedOptions,
    setCurrentSelectedOptions,
    onError = ({ message }) => {},
    onClickCurrentSelectedOption = (option, index) => {},
}) {
    const [value, SetValue] = useState("")

    useEffect(() => {
        setOptions((prev) => prev.sort())
    }, [options])

    useEffect(() => {
        setOptions((prev) => prev.filter((option) => !currentSelectedOptions.includes(option)))
        setCurrentSelectedOptions((prev) => prev.sort())
    }, [currentSelectedOptions])

    function OnChange(newValue) {
        if (!allowSelfInput) {
            onSelectOption(newValue)
            SetValue("")
        } else {
            SetValue(newValue)
        }
    }

    function onSelectOption(option) {
        if (option === "") {
            onError({ message: "Option cannot be empty" })
            return
        }

        if (currentSelectedOptions.includes(option)) {
            onError({ message: "Option already selected" })
            return
        }

        setOptions(options.filter((value) => value !== option))
        setCurrentSelectedOptions([...currentSelectedOptions, option])

        SetValue("")
    }

    function onRemoveOption(option) {
        setOptions([...options, option])
        setCurrentSelectedOptions(currentSelectedOptions.filter((value) => value !== option))
    }

    return (
        <InputSelect
            className={className}
            value={value}
            placeholder={placeholder}
            required={required}
            allowSelfInput={allowSelfInput}
            options={options}
            onChange={OnChange}
            onEnter={(e) => {
                onSelectOption(value)
            }}
        >
            <div className="flex flex-row gap-2">
                {allowSelfInput && (
                    <div className="flex flex-row items-center gap-2">
                        <button
                            onClick={() => {
                                onSelectOption(value)
                            }}
                            className="px-2 py-1 bg-s-dark-secondary rounded-xs flex flex-row justify-between items-center cursor-pointer hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90"
                        >
                            <Plus />
                        </button>
                    </div>
                )}
                <HorizontalScrollable
                    className="px-2 pt-3 pb-1 bg-s-dark-tertiary/75 rounded-xs"
                    itemCount={currentSelectedOptions ? currentSelectedOptions.length : 0}
                    ItemRenderer={({ index }) => {
                        const option = currentSelectedOptions[index]
                        return (
                            <div
                                onClick={() => {
                                    onClickCurrentSelectedOption(option, index)
                                }}
                                className="relative w-38 h-8 bg-s-dark-secondary flex items-center justify-center pr-8 p-3 rounded-sm hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90 cursor-pointer"
                            >
                                <p className="truncate text-s-white text-xs md:text-sm font-semibold">{option}</p>
                                <button
                                    onClick={() => onRemoveOption(option)}
                                    className="absolute right-1 text-s-white cursor-pointer"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        )
                    }}
                    pxCutoffHeight={100}
                    pxCutoffWidth={null}
                    rowsGap={{ x: 12, y: 0 }}
                    rowsCount={{ default: 2, sm: 2 }}
                />
            </div>
        </InputSelect>
    )
}

function InputBox({ isChecked, setIsChecked, children, required = false, className = "" }) {
    return (
        <div className={`${className} w-fit flex flex-col md:flex-row items-center justify-between gap-2 p-2 cursor-pointer`}>
            <button onClick={() => setIsChecked(!isChecked)}>
                {isChecked ? (
                    <CircleCheck size={32} />
                ) : (
                    <Circle
                        size={32}
                        className="text-s-white/50 hover:text-s-white/70 active:text-s-white/90"
                    />
                )}
            </button>
            {children}
        </div>
    )
}

/**
 * A item in items must have a unique ID under { id }
 *
 *
 * NOTE: index does not work here keys will be based on the item.id if index is used render memory refrences we identify a moved item as different and re render everything causing issues
 */
function OrderedList({
    className = "",
    ItemElement,
    items,
    isSelectable = false,
    onReleaseItem = async (item, index, newIndex) => true, // successful release of item, return false to reset the what you see list back to original
    onSelectedItem = (item) => {},
    onRemoveItem = async (item, index) => true,
    isLoading = null,
}) {
    const [whatTheySeeItems, setWhatTheySeeItems] = useState(items)
    const [currentlySelectedItem, setCurrentlySelectedItem] = useState((isSelectable && items && items[0]) || null)

    useEffect(() => {
        setWhatTheySeeItems(items)
    }, [items])

    useEffect(() => {
        if (currentlySelectedItem) {
            onSelectedItem(currentlySelectedItem)
        }
    }, [currentlySelectedItem])

    const grabbedIndexRef = useRef(null)
    const [currentGrabbedItem, setCurrentGrabbedItem] = useState(null)

    const elementRef = useRef(null)
    const [size, setSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        if (!elementRef.current) return
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                })
            }
        })
        observer.observe(elementRef.current)

        return () => {
            observer.disconnect()
        }
    }, [])

    function onItemGrab(grabbedItem, grabbedIndex) {
        grabbedIndexRef.current = grabbedIndex
        setCurrentGrabbedItem({ item: grabbedItem, index: grabbedIndex })
    }

    async function onItemRelease(item, newIndex) {
        grabbedIndexRef.current = null
        setCurrentGrabbedItem(null)
        const isSuccessfulRelease = await onReleaseItem(item, items.indexOf(item), newIndex)
        if (!isSuccessfulRelease) {
            setWhatTheySeeItems(items)
        }
    }

    const [isRemovingItem, setIsRemovingItem] = useState()
    function onItemRemove(item, index) {
        if (isSelectable) {
            if (currentlySelectedItem && currentlySelectedItem.id === item.id && whatTheySeeItems.length > 0) {
                if (index === 0) {
                    setCurrentlySelectedItem(whatTheySeeItems[1])
                } else {
                    setCurrentlySelectedItem(whatTheySeeItems[index - 1])
                }
            }
        }
    }

    function OnEnterItem(enteredIndex) {
        if (enteredIndex == grabbedIndexRef.current) {
            return
        }
        if (currentGrabbedItem && grabbedIndexRef.current !== null && grabbedIndexRef.current !== enteredIndex) {
            const currentIndex = grabbedIndexRef.current

            grabbedIndexRef.current = enteredIndex
            setWhatTheySeeItems((prevList) => {
                const newList = [...prevList]

                const temp = newList[currentIndex]
                newList[currentIndex] = newList[enteredIndex]
                newList[enteredIndex] = temp

                return newList
            })
        }
    }

    return (
        <div
            ref={elementRef}
            className={`${className} relative flex flex-col gap-2 bg-s-white/20 p-3 rounded-xs overflow-y-auto overflow-x-hidden`}
        >
            {whatTheySeeItems &&
                whatTheySeeItems.map((item, index) => (
                    <OrderedListItem
                        key={item.id}
                        item={item}
                        index={index}
                        style={{ width: size.width }}
                        ItemElement={ItemElement}
                        onGrab={(item, index) => {
                            onItemGrab(item, index)
                        }}
                        onRelease={(item, index) => {
                            const newIndex = index
                            onItemRelease(item, newIndex)
                        }}
                        useArrows={false}
                        onEnter={(index) => {
                            OnEnterItem(index)
                        }}
                        onClick={(item, index) => {
                            if (isSelectable) {
                                setCurrentlySelectedItem(item)
                            }
                        }}
                        isClickDisabled={isSelectable && currentlySelectedItem && currentlySelectedItem.id === item.id}
                        onRemove={async (item, index) => {
                            if (isRemovingItem) {
                                return
                            }

                            setIsRemovingItem(true)
                            const itemRemove = await onRemoveItem(item, index)
                            if (itemRemove) {
                                onItemRemove(item, index)
                            }
                            setIsRemovingItem(false)
                        }}
                    />
                ))}

            {isLoading && (
                <div className="absolute inset-0 flex flex-row items-center justify-center w-full h-full bg-black/60">
                    <DefaultSpinner className={"w-8 h-8 text-s-white"} />
                </div>
            )}
        </div>
    )
}

function OrderedListItem({
    style = {},
    ItemElement,
    item,
    index,
    onClick = (item, index) => {},
    onRemove = (item, index) => {},
    isRemoving = false,
    onMoveUp = () => {},
    onMoveDown = () => {},
    onGrab = (item, index) => {},
    onRelease = (item, index) => {},
    useArrows = true,
    onEnter = (index) => {},
    isClickDisabled = false,
}) {
    const elementRef = useRef(null)
    const [isGrabbed, setIsGrabbed] = useState(false)
    const [size, setSize] = useState({ width: 0, height: 0 })

    // ON ENTER FOR TOUCH SCREEN
    const [isInside, setIsInside] = useState(false)
    const prevUnderElement = useRef(null)

    useEffect(() => {
        function handleExit() {
            if (isInside) {
                setIsInside(false)
            }
        }

        if (elementRef.current) {
            elementRef.current.addEventListener("CUSTOM-TOUCHEXIT", handleExit)
        }

        return () => {
            if (elementRef.current) {
                elementRef.current.removeEventListener("CUSTOM-TOUCHEXIT", handleExit)
            }
        }
    }, [isInside])

    function handleTouchMove(e) {
        const touch = e.touches[0]
        if (touch) {
            // this will initialy be called when the user is dragging the element, but we want to check if the user is dragging over an element not this one
            if (isGrabbed) {
                const elementsFromPoint = document.elementsFromPoint(touch.clientX, touch.clientY)

                const underElement = elementsFromPoint.find((el) => !elementRef.current.contains(el))
                if (prevUnderElement.current && prevUnderElement.current !== underElement) {
                    prevUnderElement.current.dispatchEvent(new CustomEvent("CUSTOM-TOUCHEXIT", { bubbles: true, cancelable: true }))
                }
                underElement?.dispatchEvent(new TouchEvent("touchmove", { bubbles: true, cancelable: true, touches: e.touches }))

                prevUnderElement.current = underElement
                return
            }

            // this will catch that dispatchEvent from the previous dragged element and cause this element to be "entered" by the dragged element however since the top is still
            // the dragged element, we just look for the first element that matches the element that was dispatched
            const elementsFromPoint = document.elementsFromPoint(touch.clientX, touch.clientY)

            const elementOnStylist = elementsFromPoint.find((el) => elementRef.current.contains(el))

            if (elementOnStylist && elementRef.current.contains(elementOnStylist)) {
                if (!isInside) {
                    setIsInside(true)
                    onEnter(index)
                }
            } else {
                if (isInside) {
                    setIsInside(false)
                }
            }
        }
    }

    // ON ENTER FOR TOUCH SCREEN END

    function ElementRepositionMouse(e) {
        elementRef.current.style.left = `${e.clientX - 25}px`
        elementRef.current.style.top = `${e.clientY}px`
    }

    function ElementRepositionTouch(e) {
        const touch = e.touches[0]
        if (touch) {
            elementRef.current.style.left = `${touch.clientX - 25}px`
            elementRef.current.style.top = `${touch.clientY}px`
        }
    }

    useEffect(() => {
        if (!elementRef.current) return

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                })
            }
        })
        observer.observe(elementRef.current)

        return () => {
            observer.disconnect()
        }
    }, [])

    useEffect(() => {
        function handleMouseMove(e) {
            ElementRepositionMouse(e)
        }

        function handleTouchMove(e) {
            ElementRepositionTouch(e)
        }

        if (isGrabbed) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("touchmove", handleTouchMove)
            document.addEventListener("mouseup", OnRelease)
            document.addEventListener("touchend", OnRelease)
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("touchmove", handleTouchMove)
            document.removeEventListener("mouseup", OnRelease)
            document.removeEventListener("touchend", OnRelease)
        }
    }, [isGrabbed, ElementRepositionMouse])

    function OnMouseGrab(e) {
        e.preventDefault()
        setIsGrabbed(true)
        ElementRepositionMouse(e)
        onGrab(item, index)
    }

    function OnTouchGrab(e) {
        e.preventDefault()
        setIsGrabbed(true)
        ElementRepositionTouch(e)
        onGrab(item, index)
    }

    function OnRelease(e) {
        e.preventDefault()
        setIsGrabbed(false)
        onRelease(item, index)
    }

    return (
        <>
            <div
                onTouchMove={handleTouchMove}
                onClick={(e) => {
                    onClick(item, index)
                }}
                onMouseEnter={(e) => {
                    onEnter(index)
                }}
                ref={elementRef}
                key={item.id}
                style={{ zIndex: isGrabbed ? 100 : 0, ...style }}
                className={`${isGrabbed ? "fixed -translate-y-1/2 pointer-events-none bg-s-dark-secondary/90" : `${isClickDisabled ? "bg-s-dark-primary/90" : "bg-s-dark-secondary/50 hover:bg-s-dark-secondary/70 active:bg-s-dark-secondary/90"}`} flex flex-row items-center justify-between gap-2 rounded-sm px-2 py-1`}
            >
                {!useArrows && (
                    <button
                        onTouchStart={OnTouchGrab}
                        onMouseDown={OnMouseGrab}
                        className={`p-3 rounded-xs flex flex-row justify-between items-center hover:bg-s-dark-secondary/90 active:bg-s-dark-tertiary/30 ${isGrabbed ? "cursor-grabbing" : "cursor-grab"}`}
                    >
                        <List size={14} />
                    </button>
                )}
                <div className="flex flex-row w-full h-full">
                    <ItemElement
                        item={item}
                        index={index}
                    />
                </div>
                <div className="flex flex-row gap-2 h-fit justify-center items-center">
                    {useArrows && (
                        <>
                            <button
                                onClick={onMoveUp}
                                className="px-2 py-1 rounded-xs flex flex-row justify-between items-center hover:bg-s-dark-secondary/90 active:bg-s-dark-tertiary/30"
                            >
                                <ArrowUp size={14} />
                            </button>
                            <button
                                onClick={onMoveDown}
                                className="px-2 py-1 rounded-xs flex flex-row justify-between items-center hover:bg-s-dark-secondary/90 active:bg-s-dark-tertiary/30"
                            >
                                <ArrowDown size={14} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            onRemove(item, index)
                        }}
                        className="p-2 bg-s-tertiary rounded-xs flex flex-row justify-between items-center cursor-pointer hover:bg-s-tertiary/70 active:bg-s-tertiary/90"
                    >
                        {isRemoving ? <DefaultSpinner className="text-s-white py-0 w-full h-full" /> : <Trash2 size={14} />}
                    </button>
                </div>
            </div>
            {isGrabbed && (
                <div
                    style={{ width: size.width, height: size.height }}
                    className={`mt-2`}
                ></div>
            )}
        </>
    )
}

export default AdminManageTitles

// TODO: this file is getting ridiculous i should have just made different pages insread of so many pop ups I dont wnat to re-do so lol who cares for now I like it
