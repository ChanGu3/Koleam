import { useEffect } from "react"

import { useMemberGetWatchHistory } from "../../hooks/useStream.jsx"
import useMember from "../../hooks/useMember.jsx"
import Slider from "../../components/list-container/Slider.jsx"
import StreamModule from "../../components/modules/StreamModule.jsx"
import { DefaultSpinner } from "../../components/Spinners.jsx"
import { Smile } from "lucide-react"
import { HorizontalQueryScrollable } from "../../components/Scrollable.jsx"
import SeriesModule from "../../components/modules/SeriesModule.jsx"
import { FetchMemberFavorites } from "../../services/account/member.js"
import { useNavigate } from "react-router-dom"
import { FULL_ROUTES, ACCESS_TYPE } from "../../constants.js"
import useUIConfig from "../../hooks/useUIConfig.jsx"
import LoadingPage from "../other/LoadingPage.jsx"

const FavoritesLoadingMax = 12

function SafeSpacePage() {
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const { memberIsSignedIn } = useMember()
    const navigate = useNavigate()

    const { data: dataWatchHistory, error: isErrorWatchHistory, isLoading: isLoadingWatchHistory } = useMemberGetWatchHistory(12, 0, memberIsSignedIn)

    useEffect(() => {
        document.title = "Safe Space"

        if (memberIsSignedIn !== null && !memberIsSignedIn) {
            navigate(FULL_ROUTES.NOT_FOUND)
        }
    }, [])

    // prevents naviagation when signed in and renders
    if (CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC && (memberIsSignedIn === null || !memberIsSignedIn)) {
        return <LoadingPage />
    }

    return (
        <>
            <main className="w-full mt-8">
                <div className="flex flex-col justify-center items-center gap-y-2">
                    <p className="text-s-white text-4xl">Cozy</p>
                    <p className="text-s-white text-sm flex flex-row gap-2">
                        enjoy your safe space <Smile />
                    </p>
                </div>
                {isLoadingWatchHistory ? (
                    <DefaultSpinner className="py-10" />
                ) : isErrorWatchHistory ? (
                    <></>
                ) : (
                    <Slider
                        title="Continue Watching"
                        sliderList={
                            dataWatchHistory
                                ? dataWatchHistory.map((stream, index) => {
                                      return (
                                          <StreamModule
                                              key={stream.id}
                                              isMovie={!stream.TitleInstallment.isSeason}
                                              titleLabel={stream.Title.label}
                                              label={stream.label}
                                              srcIMG={`/api/title/stream/${stream.id}/thumbnail.jpg`}
                                              description={stream.synopsis}
                                              dateReleased={(() => {
                                                  if (stream) {
                                                      return `${new Date(stream.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
                                                  } else {
                                                      return ""
                                                  }
                                              })()}
                                              href={`/stream/${stream.id}/${stream.label}`}
                                              installmentLabel={stream.TitleInstallment.label}
                                              streamNumber={stream.streamNumber}
                                          />
                                      )
                                  })
                                : []
                        }
                    />
                )}
                {/* IN THE FUTURE MAKE THIS A SLIDER AND REPLACE ALL SLIDERS WITH THIS LOGIC AND ADD SLIDER BUTTONS FOR NOW JUST DO THIS */}
                <div className="px-14 md:px-28 mb-4 flex flex-col">
                    <p className="py-2 md:py-4 w-full text-s-tertiary text-xs md:text-2xl font-semibold">Favorites</p>
                    <HorizontalQueryScrollable
                        queryKey={["USER", "FAVORITES"]}
                        queryFn={async ({ pageParam = 0 }) => await FetchMemberFavorites(FavoritesLoadingMax, pageParam)}
                        getNextPageParam={(lastPage, allPages) => (lastPage.length === FavoritesLoadingMax ? allPages.length * FavoritesLoadingMax : undefined)}
                        pxCutoffHeight={null}
                        pxCutoffWidth={null}
                        ItemRenderer={({ index, dataItem }) => {
                            return (
                                <SeriesModule
                                    key={dataItem.titleID}
                                    titleID={dataItem.titleID}
                                    label={dataItem.Title.label}
                                    imageSrc={`api/title/${dataItem.titleID}/cover.jpg`}
                                    seasonNum={dataItem.Title.seasons_count}
                                    episodeNum={dataItem.Title.stream_episodes_count}
                                    movieNum={dataItem.Title.stream_movies_count}
                                    description={dataItem.Title.description}
                                    href={`/title/${dataItem.titleID}/${dataItem.Title.label}`}
                                />
                            )
                        }}
                        rowsGap={{ x: 32, y: 32 }}
                        rowsCount={{ sm: 2 }}
                    />
                </div>
            </main>
        </>
    )
}

export default SafeSpacePage
