import { useEffect, useState, useRef } from "react"

import { useParams, useNavigate, data } from "react-router-dom"
import Dropdown from "../components/Dropdown.jsx"
import StreamModule2 from "../components/modules/StreamModule2.jsx"
import FavoriteButton from "../components/FavoriteButton.jsx"

import useMember from "../hooks/useMember.jsx"
import ImageUI from "../components/ImageUI.jsx"
import { FileQuestionMark, Funnel, Play, Triangle } from "lucide-react"
import { DefaultSpinner } from "../components/Spinners.jsx"
import { useGetIntallmentsByTitleID } from "../hooks/useInstallment.jsx"
import { useGetTitleByID, useMemberGetRating, useMemberUpdateRating } from "../hooks/useTitle.jsx"
import { FILLED_ROUTES, FULL_ROUTES } from "../constants.js"
import { Link } from "react-router-dom"
import RatingStars from "../components/title/RatingStars.jsx"
import RatingDropdown from "../components/title/RatingDropdown.jsx"

function TitleDetailsPage() {
    const { titleID, label } = useParams()
    const navigate = useNavigate()

    // Member Data
    const { memberIsSignedIn } = useMember()
    const { data: memberRating, error: isErrorMemberRating, isLoading: isLoadingMemberRating } = useMemberGetRating(titleID, memberIsSignedIn)
    const { mutate: SetCurrentRating } = useMemberUpdateRating(titleID)
    // Title Data
    const { data: title, error: isErrorTitle, isLoading: isLoadingTitle } = useGetTitleByID(titleID)
    const { data: installments, error: isErrorTitleInstallments, isLoading: isLoadingTitleInstallments } = useGetIntallmentsByTitleID(titleID)
    const [mostRecentWatchedStreamData, SetMostRecentWatchedStreamData] = useState(null)

    const [currentInstallmentIndex, SetCurrentInstallmentIndex] = useState(0)
    const [streamListGrid, SetStreamListGrid] = useState()
    const [isOldest, SetIsOldest] = useState(false)
    const [isShowingDetails, SetIsShowingDetails] = useState(false)

    // Gets the Basic Title Data
    useEffect(() => {
        document.title = `${label}`

        if (title && isErrorTitle) {
            navigate(FULL_ROUTES.NOT_FOUND)
        }
    }, [title])

    // Gets the Installments Data along with their streams
    useEffect(() => {
        if (installments && installments[0]) {
            SetStreamListGrid(installments[0].TitleInstallmentStreams)
        }
        if (memberIsSignedIn && installments && installments[0] && installments[0].TitleInstallmentStreams[0]) {
            const installment1stream1 = installments[0].TitleInstallmentStreams[0]
            SetMostRecentWatchedStreamData({ installment: installments[0], stream: installment1stream1 })
        }
    }, [installments, memberIsSignedIn])

    function OnRatingChange(rating) {
        if (memberRating && rating === memberRating.rating) {
            rating = 0
        }

        SetCurrentRating(rating)
    }

    function ChangeStreamListGrid(index) {
        SetCurrentInstallmentIndex(index)
        SortByToggled(installments[index].TitleInstallmentStreams)
    }

    function ToggleOldest() {
        SetIsOldest(!isOldest)
    }

    function SortByToggled(streamList) {
        if (isOldest) {
            SetStreamListGrid([...streamList].sort((animeStreamA, animeStreamB) => animeStreamB.streamNumber - animeStreamA.streamNumber))
        } else {
            SetStreamListGrid([...streamList].sort((animeStreamA, animeStreamB) => animeStreamA.streamNumber - animeStreamB.streamNumber))
        }
    }

    useEffect(() => {
        if (streamListGrid) {
            SortByToggled(streamListGrid)
        }
    }, [isOldest])

    useEffect(() => {
        if (isErrorTitle || (!title && !isLoadingTitle)) {
            navigate(FULL_ROUTES.NOT_FOUND)
        }
    }, [title])

    if (isLoadingTitle || !title) {
        return (
            <DefaultSpinner
                size={{ default: 50 }}
                className="w-full h-full"
            />
        )
    }

    return (
        <>
            <main>
                <div className="relative w-full h-48 md:h-86">
                    {/* Title Cover Image*/}
                    <div className="object-cover object-top w-full h-full mask-b-from-55% mask-b-to-100%">
                        <ImageUI
                            Src={`/api/title/${title.id}/cover.jpg`}
                            Fallback={FileQuestionMark}
                        ></ImageUI>
                    </div>

                    {/* Rating & Title Label*/}
                    <div className={`absolute justify-center items-center px-16 md:w-auto top-20 md:left-20 md:top-20 flex flex-row md:flex-col w-full gap-4 md:gap-3`}>
                        <p className="text-lg md:text-4xl text-s-white font-bold my-0.5 text-center bg-black/30 rounded-sm px-4 py-2">{title ? `${title.label}` : ``}</p>

                        <div className="flex flex-col items-center gap-4">
                            {/* Star Ratings */}
                            {memberIsSignedIn && (
                                <RatingStars
                                    starsCount={5}
                                    currentRating={memberRating ? memberRating.rating : 0}
                                    onRatingChange={OnRatingChange}
                                />
                            )}
                            {/* Rating Dropdown */}
                            <RatingDropdown
                                total_rating_count={title ? title.rating_count : 0}
                                rating_average={title ? title.rating_average : 0}
                                ratings_count={title ? [title.rating_1_count, title.rating_2_count, title.rating_3_count, title.rating_4_count, title.rating_5_count] : []}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-4 md:px-8 flex flex-col md:flex-row gap-x-4 w-full">
                    {/* Description */}
                    <div className="mt-16 md:mx-4 flex flex-col md:w-[85%]">
                        <p className="text-s-secondary text-sm font-semibold py-1 underline underline-offset-4">Description:</p>
                        <p className={`whitespace-pre-wrap text-s-white text-xs w-[100%] ${isShowingDetails ? "" : "line-clamp-4"}`}>{title ? title.description : ""}</p>

                        {/* DIVIDER */}
                        <div className={`border-2 border-s-dark-secondary w-45 self-center my-8 ${isShowingDetails ? "" : "hidden"}`}></div>

                        <div className={`w-full flex flex-col justify-start gap-y-2 ${isShowingDetails ? "" : "hidden"}`}>
                            <p
                                id="originaltranslation"
                                className="text-s-dark-secondary text-xs break-words whitespace-normal"
                            >
                                <span className="text-s-white">Original Translation:</span> {title ? title.originalTranslation : ""}
                            </p>
                            <p
                                id="othertranslation"
                                className={`text-s-dark-secondary text-xs break-words whitespace-normal`}
                            >
                                <span className="text-s-white">Other Translation:</span>{" "}
                                {title && title.all_other_translations.length > 0
                                    ? title.all_other_translations.map((el, index) => {
                                          return (
                                              <span
                                                  className="mx-0.25"
                                                  key={index}
                                              >
                                                  {" "}
                                                  {el}{" "}
                                              </span>
                                          )
                                      })
                                    : "None"}
                            </p>
                            {/*<p id="subtitles" className="text-os-dark-secondary text-xs  break-words whitespace-normal"><span className="text-os-white">Subtitles:</span> Japanese, English, Español, Korean (Hangugeo), Mandarin</p>*/}
                            {/*<p id="contentadvisory" className="text-os-dark-secondary text-xs  break-words whitespace-normal"><span className="text-os-white">Content Advisory:</span> 13+, None</p>*/}
                            <p
                                id="categories"
                                className="text-s-dark-secondary text-xs break-words whitespace-normal"
                            >
                                <span className="text-s-white">Genres:</span>
                                {title && title.all_genres.length > 0
                                    ? title.all_genres.map((genre, index) => {
                                          return (
                                              <Link
                                                  key={index}
                                                  className="text-s-tertiary active:text-s-tertiary/80 hover:underline mx-1"
                                                  to={{ pathname: FILLED_ROUTES.DISCOVER_GENRE(genre) }}
                                              >
                                                  {genre}
                                              </Link>
                                          )
                                      })
                                    : "None"}
                            </p>
                            <p
                                id="seriescopyright"
                                className="text-s-primary text-xs break-words whitespace-normal"
                            >
                                &copy; {title ? title.copyright : ""}
                            </p>
                        </div>
                        <div className="w-full my-2 flex flex-row justify-end">
                            <button
                                onClick={() => {
                                    SetIsShowingDetails(!isShowingDetails)
                                }}
                                type="button"
                                className="text-s-tertiary text-sm text-end cursor-pointer mt-2"
                            >
                                {isShowingDetails ? "Less Details" : "More Details"}
                            </button>
                        </div>
                        <div className="border border-s-dark-secondary w-[100%]"></div>
                    </div>

                    {/* Season/Movie/Episodes */}
                    <div className="flex flex-col w-full">
                        {/* Favorites & Continue Watching */}
                        <div className=" my-6 md:my-0 flex flex-row gap-2 bottom-0 right-0 justify-between w-full h-12">
                            {/* CW */}
                            {mostRecentWatchedStreamData && (
                                <Link
                                    to={{ pathname: FILLED_ROUTES.STREAM_PAGE(mostRecentWatchedStreamData.stream.id, mostRecentWatchedStreamData.stream.label) }}
                                    className={`px-2 w-full md:w-fit flex flex-row justify-start items-center gap-2 bg-s-secondary py-1 group ${mostRecentWatchedStreamData ? "" : "hidden"}`}
                                >
                                    <Play
                                        fill={"currentColor"}
                                        className="group-hover:animate-heart-beat  text-s-white group-hover:text-s-white w-6 lg:w-8"
                                    />
                                    <p className="text-s-white text-sm lg:text-lg font-semibold truncate">
                                        <span>{"Start Watching"}:</span>{" "}
                                        <span>
                                            {`${mostRecentWatchedStreamData.installment.label} - ${mostRecentWatchedStreamData.installment.isSeason ? `Episode:` : `Movie:`}
                                        ${mostRecentWatchedStreamData.stream.streamNumber}`}
                                        </span>
                                    </p>
                                </Link>
                            )}

                            <FavoriteButton
                                className="w-12"
                                titleID={title.id}
                            />
                        </div>

                        <div className="flex flex-row justify-between w-full md:my-6">
                            {/* Season/Movie Chose */}
                            <Dropdown
                                classNameMain="max-w-[65%] w-[65%] bg-s-dark-tertiary border-s-secondary border-b"
                                classNameDropdown="bg-s-dark-tertiary border-s-secondary border-b"
                                optionList={
                                    installments
                                        ? installments.map((installment, index) => {
                                              return {
                                                  title: installment.label,
                                                  titleright: `${installment.isSeason ? "Episodes" : "Movies"} ${installment.streams_count}`,
                                                  onClick: () => {
                                                      ChangeStreamListGrid(index)
                                                  },
                                              }
                                          })
                                        : []
                                }
                                iconClassName="rotate-180"
                                ToggleIcon={Triangle}
                                pxCutoffHeight={140}
                            />

                            {/* Filter */}
                            <Dropdown
                                classNameMain="max-w-[25%] w-[25%] bg-s-dark-tertiary border-s-secondary border-b"
                                classNameDropdown="bg-s-dark-tertiary  border-s-secondary border-b"
                                optionList={
                                    installments
                                        ? installments.length
                                            ? [
                                                  {
                                                      title: "Newest",
                                                      onClick: () => {
                                                          ToggleOldest()
                                                      },
                                                  },
                                                  {
                                                      title: "Oldest",
                                                      onClick: () => {
                                                          ToggleOldest()
                                                      },
                                                  },
                                              ]
                                            : []
                                        : []
                                }
                                ToggleIcon={Funnel}
                                pxCutoffHeight={92}
                            />
                        </div>

                        <div className="grid grid-flow-row grid-cols-2 xl:grid-cols-3 lg:p-0 gap-x-8 gap-y-6 md:gap-y-8 mt-8 md:mt-0">
                            {streamListGrid
                                ? streamListGrid.map((streamItem, index) => {
                                      return (
                                          <StreamModule2
                                              key={index}
                                              episodeNum={streamItem.streamNumber}
                                              isMovie={installments && installments[currentInstallmentIndex].isSeason ? false : true}
                                              streamTitle={streamItem.label}
                                              streamImageSrc={`${`/api/title/stream/${streamItem.id}/thumbnail.jpg`}`}
                                              dateReleased={(() => {
                                                  if (streamItem) {
                                                      return `${new Date(streamItem.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
                                                  } else {
                                                      return ""
                                                  }
                                              })()}
                                              href={FILLED_ROUTES.STREAM_PAGE(streamItem.id, streamItem.label)}
                                          />
                                      )
                                  })
                                : ""}
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default TitleDetailsPage
