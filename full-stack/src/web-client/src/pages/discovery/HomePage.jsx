import "../../tailwind.css"
import { useEffect } from "react"

/* Carousel Import */
import Carousel, { CarouselItemObject } from "../../components/list-container/Carousel.jsx"

import Slider from "../../components/list-container/Slider.jsx"

import SeriesModule from "../../components/modules/SeriesModule.jsx"
import StreamModule from "../../components/modules/StreamModule.jsx"
import { useQuery } from "@tanstack/react-query"
import { DefaultSpinner } from "../../components/Spinners.jsx"
import { FetchGetCarousel, FetchGetSeriesShuffle } from "../../services/Titles/FetchTitle.js"
import { FILLED_ROUTES } from "../../constants.js"
import useMember from "../../hooks/useMember.jsx"
import { useMemberGetWatchHistory } from "../../hooks/useStream.jsx"

function HomePage() {
    const { memberisSignedIn } = useMember()

    const {
        data: dataCarousel,
        error: isErrorCarousel,
        isLoading: isLoadingCarousel,
    } = useQuery({
        queryKey: ["HOME", "CAROUSEL"],
        queryFn: async () => await FetchGetCarousel(7, 0),
    })

    const { data: dataWatchHistory, error: isErrorWatchHistory, isLoading: isLoadingWatchHistory, refetch: refetchWatchHistory } = useMemberGetWatchHistory(0, 12, memberisSignedIn)

    const {
        data: dataShuffle,
        error: isErrorShuffle,
        isLoading: isLoadingShuffle,
    } = useQuery({
        queryKey: ["HOME", "SHUFFLE"],
        queryFn: async () => await FetchGetSeriesShuffle(15),
    })

    useEffect(() => {
        document.title = "Home"
    }, [])

    useEffect(() => {
        if (memberisSignedIn) {
            refetchWatchHistory()
        }
    }, [memberisSignedIn])

    return (
        <>
            {isLoadingCarousel ? (
                <DefaultSpinner className="py-10" />
            ) : isErrorCarousel ? (
                <></>
            ) : (
                <Carousel
                    key={dataCarousel ? dataCarousel.length : 0}
                    carouselList={
                        dataCarousel
                            ? dataCarousel.map((titleItem) => {
                                  return new CarouselItemObject(
                                      titleItem.label,
                                      titleItem.description,
                                      `api/title/${titleItem.id}/cover.jpg`,
                                      FILLED_ROUTES.TITLE_PAGE(titleItem.id, titleItem.label)
                                  )
                              })
                            : []
                    }
                />
            )}
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
                                          streamNumber={stream.order_number_by_release_date}
                                      />
                                  )
                              })
                            : []
                    }
                />
            )}
            {isLoadingShuffle ? (
                <DefaultSpinner className="py-10" />
            ) : isErrorShuffle ? (
                <></>
            ) : (
                <Slider
                    title="Titles Shuffle"
                    sliderList={
                        dataShuffle
                            ? dataShuffle.map((titleItem, index) => {
                                  return (
                                      <SeriesModule
                                          key={titleItem.id}
                                          titleID={titleItem.id}
                                          label={titleItem.label}
                                          seasonNum={titleItem.seasons_count}
                                          episodeNum={titleItem.stream_episodes_count}
                                          movieNum={titleItem.stream_movies_count}
                                          description={titleItem.description}
                                      />
                                  )
                              })
                            : []
                    }
                />
            )}
        </>
    )
}

export default HomePage
