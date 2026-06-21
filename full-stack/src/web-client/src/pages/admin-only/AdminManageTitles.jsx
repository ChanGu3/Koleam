import { WindowVerticalScrollable } from "../../components/Scrollable.jsx"

function AdminManageTitles() {
    return <div className="w-72 sm:w-132 md:w-180 lg:w-260 xl:w-320"></div>
}

function temp() {
    return (
        <WindowVerticalScrollable
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
    )
}
export default AdminManageTitles
