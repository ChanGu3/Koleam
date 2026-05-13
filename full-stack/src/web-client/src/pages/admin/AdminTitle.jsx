import React, { useEffect, useRef, useState } from "react"
import "./AdminAnime.css"

//unction GetGenere()

function InputCollection({
    inputName,
    titleName,
    currentChosenOptionsList,
    SetCurrentChosenOptionList,
    variableNameToAccess = "value",
    availableOptionsList = null,
    SetAvailableOptionsList = null,
    isSelect = true,
}) {
    const [currentValue, SetCurrentValue] = useState(``)

    useEffect(() => {
        if (isSelect) {
            if (currentChosenOptionsList && availableOptionsList != null && SetAvailableOptionsList != null) {
                const theAvailableOptions = availableOptionsList.filter((el) => {
                    return !currentChosenOptionsList.find((currEl) => el[variableNameToAccess] === currEl[variableNameToAccess])
                })
                if (theAvailableOptions.length !== availableOptionsList.length) {
                    SetAvailableOptionsList(theAvailableOptions)
                }
            }
        }
    }, [availableOptionsList, currentChosenOptionsList])

    function AddToCurrentOptions() {
        if (isSelect) {
            if (
                currentValue !== `` &&
                !currentChosenOptionsList.find((currEl) => {
                    return currEl[variableNameToAccess] === currentValue
                })
            ) {
                let newAvailableOptionsList = availableOptionsList
                newAvailableOptionsList = newAvailableOptionsList.filter((avOP) => {
                    return avOP[variableNameToAccess] !== currentValue
                })
                SetAvailableOptionsList(newAvailableOptionsList)

                const newCurrentOptionsList = currentChosenOptionsList
                newCurrentOptionsList.push({ [variableNameToAccess]: currentValue })
                SetCurrentChosenOptionList(newCurrentOptionsList)

                SetCurrentValue(``)
            }
        } else {
            if (
                currentValue !== `` &&
                !currentChosenOptionsList.find((currEl) => {
                    return currEl[variableNameToAccess] === currentValue
                })
            ) {
                const newCurrentOptionsList = currentChosenOptionsList
                newCurrentOptionsList.push({ [variableNameToAccess]: currentValue })
                SetCurrentChosenOptionList(newCurrentOptionsList)

                SetCurrentValue(``)
            } else {
                alert(`the input ${titleName} cannot have the same value or be empty`)
            }
        }
    }

    function RemoveFromCurrentOptions(value) {
        if (isSelect) {
            if (
                !availableOptionsList.find((currEl) => {
                    currEl[variableNameToAccess] === value
                })
            ) {
                let newCurrentOptionsList = currentChosenOptionsList
                newCurrentOptionsList = newCurrentOptionsList.filter((currOP) => {
                    return currOP[variableNameToAccess] !== value
                })
                SetCurrentChosenOptionList(newCurrentOptionsList)

                const newAvailableOptionsList = availableOptionsList
                newAvailableOptionsList.push({ [variableNameToAccess]: value })
                SetAvailableOptionsList(newAvailableOptionsList)
            }
        } else {
            let newCurrentOptionsList = currentChosenOptionsList
            newCurrentOptionsList = newCurrentOptionsList.filter((currOP) => {
                return currOP[variableNameToAccess] !== value
            })
            SetCurrentChosenOptionList(newCurrentOptionsList)
        }
    }

    return (
        <div className="my-4">
            <div className="flex flex-col justify-start my-4 w-full">
                <label className="text-start" htmlFor={inputName}>
                    {titleName}:
                </label>
                <div className="flex flex-row itemscenter gap-4 w-full">
                    {isSelect ? (
                        <select
                            name={inputName}
                            className="text-sm font-bold bg-os-blue-secondary hover:bg-os-blue-secondary/80 rounded-xs px-2 py-1 overflow-scroll focus:outline-none cursor-pointer"
                            value={currentValue}
                            onChange={(event) => {
                                console.log(event.target.value)
                                SetCurrentValue(event.target.value)
                            }}>
                            <option className="bg-os-blue-secondary/40 text-os-white font-bold" value={``} disabled>
                                Select {titleName}
                            </option>
                            {availableOptionsList
                                ? availableOptionsList.map((avOp) => {
                                      return (
                                          <option key={avOp[variableNameToAccess]} value={avOp[variableNameToAccess]} className="font-semibold">
                                              {avOp[variableNameToAccess]}
                                          </option>
                                      )
                                  })
                                : ""}
                        </select>
                    ) : (
                        <input
                            name={inputName}
                            type="text"
                            placeholder={`${titleName.toLowerCase()}...`}
                            value={currentValue}
                            onChange={(event) => SetCurrentValue(event.target.value)}
                            className=""
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            AddToCurrentOptions()
                        }}
                        className="text-sm bg-os-blue-secondary hover:bg-os-blue-secondary/70 active:bg-os-blue-secondary/50 rounded-xs px-3 py-1 cursor-pointer max-h-8 font-semibold">
                        Add
                    </button>
                </div>
            </div>
            <div name="currentpicks" className="w-full flex justify-start">
                {currentChosenOptionsList ? (
                    <div className="grid grid-flow-rows grid-cols-3 gap-2">
                        {currentChosenOptionsList.map((currOp) => {
                            return (
                                <div key={currOp[variableNameToAccess]} className="flex flex-row bg-os-blue-primary px-0.5 py-1.5 rounded-md w-32 max-w-32">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            RemoveFromCurrentOptions(currOp[variableNameToAccess])
                                        }}
                                        className="cursor-pointer px-1.75 py-0.5 mx-1 text-xs ring-1 rounded-md bg-os-blue-tertiary hover:bg-os-blue-tertiary/80 active:bg-os-blue-tertiary/60 font-bold">
                                        X
                                    </button>
                                    <p className="truncate text-sm mx-1 text-os-dark-primary font-semibold">{currOp[variableNameToAccess]}</p>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    ""
                )}
            </div>
        </div>
    )
}

function ConfirmDelete({ onClose, editAnimeData }) {
    useEffect(() => {
        document.body.classList.add("overflow-hidden")
    }, [])

    async function DeleteAnime() {
        try {
            const formData = new FormData()
            formData.append("animeID", editAnimeData.anime.id)

            const res = await fetch("/api/anime", {
                method: "DELETE",
                body: formData,
            })

            if (res.ok) {
                const data = await res.json()

                if (data && data.success) {
                    alert(data.success)
                    onClose(true)
                    return
                } else if (data && data.error) {
                    alert(data.error)
                }
            } else {
                alert(`we couldn\'t delete ${editAnimeData.anime.title} sorry - server error`)
            }
        } catch (err) {
            alert("something went wrong trying to delete data")
        }

        onClose(false)
    }

    return (
        <div
            className="admin-anime-modal-overlay"
            onClick={() => {
                onClose(false)
                document.body.classList.remove("overflow-hidden")
            }}>
            <div className="admin-anime-modal ring-1" onClick={(e) => e.stopPropagation()}>
                <h1 className="w-full text-center font-bold text-2xl py-1 px-2">Delete Anime</h1>
                <p className="w-full text-center font-semibold text-sm py-1 px-2 max-w-64">
                    are you sure you want to delete this anime. all data will be erased likes, favorites, etc...{" "}
                    <span className="text-red-500 font-bold">THIS IS NOT REVERSIBLE</span>.
                </p>
                <div className="flex flex-row justify-between items-center mx-6 mt-6 mb-2">
                    <button
                        type="button"
                        className="rounded-sm bg-red-700 hover:bg-red-700/80 active:bg-red-700/60 px-2 py-1 cursor-pointer"
                        onClick={() => {
                            DeleteAnime()
                            onClose()
                            document.body.classList.remove("overflow-hidden")
                        }}>
                        Yes
                    </button>
                    <button
                        type="button"
                        className="rounded-sm bg-os-blue-tertiary hover:bg-os-blue-tertiary/80 active:bg-os-blue-tertiary/60 px-2 py-1 cursor-pointer"
                        onClick={() => {
                            onClose()
                            document.body.classList.remove("overflow-hidden")
                        }}>
                        No
                    </button>
                </div>
            </div>
        </div>
    )
}

function UploadEditModal({ onClose, editAnimeData }) {
    const [currOtherTranslationList, SetCurrOtherTranslationList] = useState(null)
    const [currGenreList, SetCurrGenreList] = useState(null)
    const [AvaGenreList, SetAvaGenreList] = useState(null)
    const [newAnimeCover, SetNewAnimeCover] = useState(null)
    const [newAnimeStreamCover, SetNewAnimeStreamCover] = useState(null)
    const [showConfirmDelete, SetShowConfirmDelete] = useState(false)

    const formRef = useRef(null)

    useEffect(() => {
        fetch("/api/anime/genre")
            .then((res) => {
                if (res.ok) {
                    return res.json()
                } else {
                    alert("Something Went Wrong Try Again Later")
                    onClose()
                }
            })
            .then((data) => {
                if (data && !data.error) {
                    SetAvaGenreList(data)
                } else {
                    alert("Something Went Wrong Try Again Later")
                    onClose()
                }
            })
            .catch((err) => {
                alert("Something Went Wrong Try Again Later")
                onClose()
            })

        if (editAnimeData) {
            SetCurrGenreList(
                editAnimeData.anime.genres.map((genre) => {
                    return { name: genre }
                })
            )
            SetCurrOtherTranslationList(
                editAnimeData.anime.otherTranslations.map((value) => {
                    return { value: value }
                })
            )
        } else {
            SetCurrGenreList([])
            SetCurrOtherTranslationList([])
        }
    }, [])

    function ValidateAnime(anime) {
        if (anime.title === "") {
            alert("anime title cannot be empty")
            return false
        }

        if (anime.description === "") {
            alert("anime description cannot be empty")
            return false
        }

        if (anime.copyright === "") {
            alert("copyright cannot be empty")
            return false
        }

        if (anime.originalTranslation === "") {
            alert("originalTranslation cannot be empty")
            return false
        }

        if (!editAnimeData) {
            if (!newAnimeCover) {
                alert("must add a cover file to the anime")
                return false
            }
        }

        return true
    }

    function ValidateAnimeStream(animeStream) {
        if (animeStream.title === "") {
            alert("movie title cannot be empty")
            return false
        }

        if (animeStream.synopsis === "") {
            alert("movie synopsis cannot be empty")
            return false
        }

        if (!animeStream.releaseDate) {
            alert("must add a date when movie was released")
            return false
        } else {
            let streamReleaseDateObj = new Date(animeStream.releaseDate)
            if (streamReleaseDateObj > new Date()) {
                alert("release date must be before or the current date")
                return false
            }
            streamReleaseDateObj.setDate(streamReleaseDateObj.getDate())
            animeStream.releaseDate = streamReleaseDateObj
        }

        if (!editAnimeData) {
            if (!newAnimeStreamCover) {
                alert("must add a cover file to the movie")
                return false
            }
        }

        return true
    }

    function OnSave(form) {
        // Anime
        const anime = {}
        const { animeTitle, animeDescription, animeCopyright, animeOriginalTranslation } = form
        const currGenreList1 = currGenreList.map((el) => {
            return el.name
        })
        const otherTranslations = currOtherTranslationList.map((el) => {
            return el.value
        })
        if (editAnimeData) {
            anime.id = editAnimeData.anime.id
        }
        anime.title = animeTitle.value
        anime.description = animeDescription.value
        anime.copyright = animeCopyright.value
        anime.originalTranslation = animeOriginalTranslation.value
        anime.otherTranslations = otherTranslations
        anime.genres = currGenreList1
        if (!ValidateAnime(anime)) {
            return
        }

        // Movie
        const stream = {}
        const { streamTitle, streamSynopsis, streamReleaseDate } = form
        if (editAnimeData) {
            stream.id = editAnimeData.stream.id
            stream.installmentID = editAnimeData.stream.installmentID
        }
        stream.title = streamTitle.value
        stream.synopsis = streamSynopsis.value
        stream.releaseDate = streamReleaseDate.value
        if (!ValidateAnimeStream(stream)) {
            return
        }

        const formData = new FormData()
        formData.append("animeCover", newAnimeCover)
        formData.append("animeStreamCover", newAnimeStreamCover)
        formData.append("anime", JSON.stringify(anime))
        formData.append("stream", JSON.stringify(stream))

        if (editAnimeData) {
            fetch(`/api/anime`, {
                method: "PUT",
                body: formData,
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        return res.json()
                    }
                })
                .then((data) => {
                    if (data && data.success) {
                        alert(data.success)
                    } else if (data && data.error) {
                        alert(data.error)
                    }
                })
                .catch((err) => {
                    alert("something went wrong")
                })
        } else {
            fetch(`/api/anime`, {
                method: "POST",
                body: formData,
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        return res.json()
                    }
                })
                .then((data) => {
                    if (data && data.success) {
                        alert(data.success)
                        onClose()
                    } else if (data && data.error) {
                        alert(data.error)
                    }
                })
                .catch((err) => {
                    alert("something went wrong")
                })
        }
    }

    return (
        <>
            <div
                className="admin-anime-modal-overlay"
                onClick={() => {
                    onClose()
                }}>
                <div className="admin-anime-modal" onClick={(e) => e.stopPropagation()}>
                    <h2 className="admin-anime-modal-title">{editAnimeData ? "Edit" : "Upload"}</h2>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            OnSave(event.target)
                        }}
                        className="admin-anime-modal-form">
                        <div className="admin-anime-modal-section">
                            <h3>Anime</h3>
                            <label>
                                Title:
                                <input name="animeTitle" type="text" placeholder="anime title..." defaultValue={editAnimeData ? editAnimeData.anime.title : ""} />
                            </label>
                            <label>
                                Description:
                                <textarea name="animeDescription" placeholder="description..." defaultValue={editAnimeData ? editAnimeData.anime.description : ""} />
                            </label>
                            <label>
                                Copyright:
                                <input name="animeCopyright" type="text" placeholder="copyright name..." defaultValue={editAnimeData ? editAnimeData.anime.copyright : ""} />
                            </label>
                            <label>
                                Original Translation:
                                <input
                                    name="animeOriginalTranslation"
                                    type="text"
                                    placeholder="original translation..."
                                    defaultValue={editAnimeData ? editAnimeData.anime.originalTranslation : ""}
                                />
                            </label>
                            <InputCollection
                                isSelect={false}
                                inputName={"otherTranslation"}
                                titleName={"Other Translation"}
                                currentChosenOptionsList={currOtherTranslationList}
                                SetCurrentChosenOptionList={SetCurrOtherTranslationList}
                                variableNameToAccess={"value"}
                            />
                            {AvaGenreList && currGenreList ? (
                                <InputCollection
                                    inputName={"genres"}
                                    titleName={"Genres"}
                                    currentChosenOptionsList={currGenreList}
                                    SetCurrentChosenOptionList={SetCurrGenreList}
                                    variableNameToAccess={"name"}
                                    availableOptionsList={AvaGenreList}
                                    SetAvailableOptionsList={SetAvaGenreList}
                                />
                            ) : (
                                ""
                            )}
                            <label>
                                {editAnimeData ? "Upload New" : ""} Cover File:
                                <input
                                    name="animeCoverFile"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        SetNewAnimeCover(event.target.files[0])
                                    }}
                                />{" "}
                                <p className="text-xs font-thin text-os-blue-tertiary">Preview:</p>{" "}
                                <img
                                    src={newAnimeCover ? URL.createObjectURL(newAnimeCover) : editAnimeData ? editAnimeData.anime.coverHREF : null}
                                    className="aspect-video w-64 rounded-sm ring-3 ring-os-dark-tertiary m-1"></img>{" "}
                            </label>
                        </div>
                        <hr style={{ margin: "24px 0", borderColor: "#4ec3fa" }} />
                        <div className="admin-anime-modal-section">
                            <h3>Movie</h3>
                            <label>
                                Title:
                                <input name="streamTitle" type="text" placeholder="movie title..." defaultValue={editAnimeData ? editAnimeData.stream.title : ""} />
                            </label>
                            <label>
                                Synopsis:
                                <textarea name="streamSynopsis" placeholder="synopsis..." defaultValue={editAnimeData ? editAnimeData.stream.synopsis : ""} />
                            </label>
                            <label>
                                Release Date:
                                <input name="streamReleaseDate" type="date" defaultValue={editAnimeData ? editAnimeData.stream.releaseDate.split("T")[0] : ""} />
                            </label>
                            <label>
                                {editAnimeData ? "Upload New" : ""} Cover File:
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        SetNewAnimeStreamCover(event.target.files[0])
                                    }}
                                />{" "}
                                <p className="text-xs font-thin text-os-blue-tertiary">Preview:</p>{" "}
                                <img
                                    src={newAnimeStreamCover ? URL.createObjectURL(newAnimeStreamCover) : editAnimeData ? editAnimeData.stream.coverHREF : null}
                                    className="aspect-video w-64 rounded-sm ring-3 ring-os-dark-tertiary m-1"></img>{" "}
                            </label>
                        </div>
                        <div className="admin-anime-modal-actions">
                            <button type="button" onClick={onClose}>
                                Close
                            </button>
                            <button type="submit">Save</button>
                        </div>
                        {editAnimeData && (
                            <button
                                type="button"
                                className="mt-8 rounded-sm bg-red-700 hover:bg-red-700/80 active:bg-red-700/60 px-2 py-1 cursor-pointer"
                                onClick={() => {
                                    SetShowConfirmDelete(true)
                                }}>
                                Delete
                            </button>
                        )}
                    </form>
                </div>
            </div>
            {showConfirmDelete && (
                <ConfirmDelete
                    onClose={(isDeleted) => {
                        SetShowConfirmDelete(false)
                        if (isDeleted) {
                            onClose()
                        }
                    }}
                    editAnimeData={editAnimeData}
                />
            )}
        </>
    )
}

function AdminTitle() {
    const [animeList, setAnimeList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [limit] = useState(8)
    const [offset, setOffset] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [editAnimeData, SetEditAnimeData] = useState(null)

    const fetchTitle = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/authorize/admin/analytics/title/streams?limit=${limit}&offset=${offset}`, { credentials: "include" })
            const data = await res.json()
            setAnimeList(data || [])
        } catch (e) {
            setError("Failed to load anime")
        } finally {
            setLoading(false)
        }
    }

    async function fetchEditAnimeData(animeID, animeStreamID) {
        try {
            const newEditAnimeData = {}

            const resAnime = await fetch(`/api/anime/${animeID}`)
            newEditAnimeData.anime = await resAnime.json()

            if (newEditAnimeData.anime.error) {
                alert(newEditAnimeData.anime.error)
                return
            }

            const resStream = await fetch(`/api/anime/stream/${animeStreamID}`)
            newEditAnimeData.stream = await resStream.json()

            if (newEditAnimeData.stream.error) {
                alert(newEditAnimeData.anime.error)
                return
            }

            SetEditAnimeData(newEditAnimeData)
            setShowModal(true)
        } catch (err) {
            alert("Server Error Try Again Later")
            return
        }
    }

    useEffect(() => {
        document.title = "Anime [Upload & Edit & Delete] - OtakuStream"
        document.body.classList.remove("bg-os-dark-primary")
        document.body.classList.add("bg-[#181a1b]")
    }, [])

    useEffect(() => {
        if (!showModal) {
            fetchTitle()
        }
        // eslint-disable-next-line
    }, [offset, showModal])

    return (
        <div className="admin-anime-container">
            <h2>Anime Movies</h2>
            <button className="admin-anime-upload-btn" onClick={() => setShowModal(true)}>
                Upload
            </button>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <table className="admin-anime-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {animeList.map((a, i) => (
                            <tr key={i}>
                                <td>{a.releaseDate ? a.releaseDate.split("T")[0] : ""}</td>
                                <td>
                                    <a className="hover:text-os-blue-tertiary" href={`/stream/${a.id}/${a.title}`}>
                                        {a.title}
                                    </a>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            fetchEditAnimeData(a.animeID, a.id)
                                        }}
                                        className="admin-anime-edit-btn">
                                        EDIT
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div className="flex flex-row items-center justify-center">
                <button
                    className={`admin-members-more-btn ${offset > 0 ? `` : `hidden`}`}
                    onClick={() => {
                        if (offset > 0) {
                            setOffset(offset - limit)
                        }
                    }}>
                    Go Back
                </button>
                <p className="flex flex-row gap-x-2 m-4 text-sm font-semibold text-center">
                    Page <span className="text-os-blue-tertiary">{offset / limit + 1}</span>
                </p>
                <button
                    className={`admin-members-more-btn ${animeList.length < limit ? `hidden` : ""}`}
                    onClick={() => {
                        if (!(animeList.length < limit)) {
                            setOffset(offset + limit)
                        }
                    }}>
                    View more
                </button>
            </div>
            {showModal && (
                <UploadEditModal
                    editAnimeData={editAnimeData}
                    onClose={() => {
                        setShowModal(false)
                        SetEditAnimeData(null)
                    }}
                />
            )}
        </div>
    )
}

export default AdminTitle
