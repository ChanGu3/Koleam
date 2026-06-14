import "../../tailwind.css"
import { useEffect } from "react"

import SeriesModule from "../../components/modules/SeriesModule.jsx"
import { useParams } from "react-router-dom"
import { FetchTitleAZ, FetchTitleByGenre } from "../../services/Titles/FetchTitle.js"
import { WindowVerticalQueryScrollable } from "../../components/Scrollable.jsx"
import { FetchGenre } from "../../services/Titles/FetchGenre.js"
import { useNavigate } from "react-router-dom"

const categoryGetLimit = 8

function CategoryResult({ isGenre = false, isAZ = false }) {
    const { genre } = useParams()
    const generUPPER = genre ? genre.toUpperCase() : undefined
    const navigate = useNavigate()

    let queryKey = ""
    let queryFn = null
    if (isGenre) {
        queryKey = ["DISCOVER", "GENRE", generUPPER]
        queryFn = async ({ pageParam = 0 }) => await FetchTitleByGenre([genre], categoryGetLimit, pageParam)
    } else if (isAZ) {
        queryKey = ["DISCOVER", "A-Z"]
        queryFn = async ({ pageParam = 0 }) => await FetchTitleAZ(categoryGetLimit, pageParam)
    }

    useEffect(() => {
        if (isGenre) {
            FetchGenre(genre)
                .then((data) => {
                    if (data.error) {
                        navigate("/404")
                    }
                })
                .catch((err) => {
                    navigate("/404")
                })

            document.title = `${generUPPER} - Genre`
        } else if (isAZ) {
            document.title = "A-Z"
        }
    }, [genre])

    return (
        <>
            <main className="w-full flex justify-center items-center flex-col">
                <div className="w-full px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-18 mt-8 mb-8 flex flex-col items-center">
                    <p className="text-s-tertiary text-xl md:text-4xl font-semibold">{isAZ && genre === undefined ? "A-Z" : genre ? generUPPER : "..."}</p>
                </div>
                <div className="w-72 sm:w-132 md:w-180 lg:w-260 xl:w-320">
                    <WindowVerticalQueryScrollable
                        className=""
                        queryKey={queryKey}
                        queryFn={queryFn}
                        getNextPageParam={(lastPage, allPages) => (lastPage && lastPage.length === categoryGetLimit ? allPages.length * categoryGetLimit : undefined)}
                        pxCutoffHeight={128}
                        ItemRenderer={({ index, dataItem }) => {
                            return (
                                <SeriesModule
                                    key={dataItem.id}
                                    titleID={dataItem.id}
                                    label={dataItem.label}
                                    imageSrc={`/api/title/${dataItem.id}/cover.jpg`}
                                    seasonNum={dataItem.seasons_count}
                                    episodeNum={dataItem.stream_episodes_count}
                                    movieNum={dataItem.stream_movies_count}
                                    description={dataItem.description}
                                    href={`/title/${dataItem.id}/${dataItem.label}`}
                                />
                            )
                        }}
                        columnsCount={{ default: 2, sm: 3, md: 2, lg: 3, xl: 4 }}
                        columnGap={{ x: 12, y: 16 }}
                    />
                </div>
            </main>
        </>
    )
}

export default CategoryResult
