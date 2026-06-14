import SeriesModule from "../../components/modules/SeriesModule.jsx"
import { FetchTitleBySearchQuery } from "../../services/Titles/FetchTitle.js"
import { useEffect, useState } from "react"
import { WindowVerticalQueryScrollable } from "../../components/Scrollable.jsx"

const searchGetLimit = 8

function Search() {
    const [currentSearchQuery, SetCurrentSearchQuery] = useState("")
    const [newSearchQuery, SetNewSearchQuery] = useState("")

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            SetNewSearchQuery(currentSearchQuery)
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [currentSearchQuery])

    useEffect(() => {
        document.title = "Search"
    }, [])

    return (
        <>
            <main className="w-full mt-24 flex flex-col items-center">
                <div className="mb-12 w-full flex flex-col justify-center items-center gap-y-4">
                    <form
                        id="searchform"
                        name="searchform"
                        method="GET"
                        className="flex flex-row justify-center items-center w-full"
                    >
                        <input
                            value={currentSearchQuery}
                            onChange={(event) => {
                                SetCurrentSearchQuery(event.target.value)
                            }}
                            id="search"
                            name="search"
                            className="px-2 py-1 w-64 md:w-132 border-s-secondary border-1 md:border-2 rounded-sm text-s-white font-bold placeholder:text-s-white/80 placeholder:font-semibold"
                            type="text"
                            placeholder="Search"
                        />
                    </form>
                    <div className="flex flex-col justify-center items-center gap-y-1">
                        <p className="text-s-white text-sm md:text-md font-bold">search for that title!</p>
                    </div>
                </div>
                <div className="w-72 sm:w-132 md:w-180 lg:w-260 xl:w-320">
                    <WindowVerticalQueryScrollable
                        className=""
                        queryKey={["DISCOVER", "SEARCH", newSearchQuery]}
                        queryFn={async ({ pageParam = 0 }) => await FetchTitleBySearchQuery(newSearchQuery, searchGetLimit, pageParam)}
                        getNextPageParam={(lastPage, allPages) => (lastPage && lastPage.length === searchGetLimit ? allPages.length * searchGetLimit : undefined)}
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
                        columnGap={{ x: 8, y: 8 }}
                    />
                </div>
            </main>
        </>
    )
}

export default Search
