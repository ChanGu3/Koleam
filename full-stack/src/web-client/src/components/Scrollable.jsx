import React, { useRef, useEffect } from "react"
import { useVirtualizer, useWindowVirtualizer } from "@tanstack/react-virtual"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMediaQuery } from "react-responsive"
import { DefaultSpinner } from "./Spinners"
import { OctagonX } from "lucide-react"

function LoadingItemRenderer({ isALoadingItem, ItemRenderer, index, allItems }) {
    return (
        <>
            {/* Render a loading indicator for the fake extra row, otherwise render the data */}
            {isALoadingItem ? (
                <DefaultSpinner className="py-10" />
            ) : (
                <ItemRenderer
                    dataItem={allItems[index]}
                    index={index}
                />
            )}
        </>
    )
}

function DefaultEmptyRenderer({ EmptyRenderer = null }) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-s-dark-tertiary/50 rounded-lg py-2">
            {EmptyRenderer ? (
                <EmptyRenderer />
            ) : (
                <div className="flex flex-row gap-2 text-lg text-s-secondary">
                    <p>Empty</p> <OctagonX className="w-8 h-8 text-s-secondary" />
                </div>
            )}
        </div>
    )
}

/**
 * @param {({index: number, dataItem: any}) => React.JSX.Element} ItemRenderer - function that takes in an index and returns a react component to render for that index
 * @param {{sm:number, md:number, lg: number, xl: number}} columnsCount - number of columns to render in the scrollable, default is 1 (for vertical scroll), if more than 1, it will render in a grid format with the specified number of columns
 * @param { boolean } isWindowVirtualizer - when true uses the windowVirtualizer instead of the normal one (NOTE: when this is enabled the Cuttoff height and width are disabled) JUST USE WindowVerticalQueryScrollable COMPONENT INSTEAD OF THIS ONE FOR WINDOW VIRTUALIZER USES THIS COMPONENT ANYWAYS
 */
export function VerticalQueryScrollable({
    className = "",
    queryKey,
    queryFn,
    getNextPageParam,
    columnsCount = { default: 1, sm: undefined, md: undefined, lg: undefined, xl: undefined }, // can specify different column counts for different screen sizes by passing in an object with keys xs, sm, md, lg, xl and values for each key representing the number of columns for that screen size
    columnGap = { x: 0, y: 0 },
    fixedRowHeight = undefined,
    ItemRenderer,
    pxCutoffHeight = 250,
    pxCutoffWidth = 250,
    isWindowVirtualizer = false,
}) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey,
        queryFn, // fetch(`/api/anime?offset=${pageParam}&limit=20`).then((res) => res.json())
        getNextPageParam,
    })

    const allItems = data ? data.pages.flatMap((page) => page) : []

    function OnVirtualScrollEnd() {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }

    return (
        <VerticalScrollable
            className={className}
            ItemRenderer={({ index }) => {
                const isLoaderRow = index > allItems.length - 1

                return (
                    <LoadingItemRenderer
                        isALoadingItem={isLoaderRow}
                        ItemRenderer={ItemRenderer}
                        index={index}
                        allItems={allItems}
                    />
                )
            }}
            itemCount={hasNextPage ? allItems.length + 1 : allItems.length}
            fixedRowHeight={fixedRowHeight}
            onVirtualScrollEnd={OnVirtualScrollEnd}
            pxCutoffHeight={pxCutoffHeight}
            pxCutoffWidth={pxCutoffWidth}
            columnsCount={columnsCount}
            columnGap={columnGap}
            isWindowVirtualizer={isWindowVirtualizer}
        />
    )
}

/**
 * @param {({index: number}) => React.JSX.Element} ItemRenderer - function that takes in an index and returns a react component to render for that index
 * @param { function } onVirtualScrollEnd - callback function that is called when the user scrolls to the end of the list (index of last item is rendered)
 * @param {{sm:number, md:number, lg: number, xl: number}} columnsCount - number of columns to render in the scrollable, default is 1 (for vertical scroll), if more than 1, it will render in a grid format with the specified number of columns
 * @param { boolean } isWindowVirtualizer - when true uses the windowVirtualizer instead of the normal one (NOTE: when this is enabled the Cuttoff height and width are disabled) JUST USE WindowVerticalScrollable COMPONENT INSTEAD OF THIS ONE FOR WINDOW VIRTUALIZER USES THIS COMPONENT ANYWAYS
 */
export function VerticalScrollable({
    className = "",
    ItemRenderer,
    EmptyRenderer = null,
    itemCount,
    columnsCount = { default: 1, sm: undefined, md: undefined, lg: undefined, xl: undefined }, // can specify different column counts for different screen sizes by passing in an object with keys xs, sm, md, lg, xl and values for each key representing the number of columns for that screen size
    columnGap = { x: 0, y: 0 },
    fixedRowHeight = undefined,
    pxCutoffHeight = 250,
    pxCutoffWidth = 250,
    onVirtualScrollEnd = null,
    isWindowVirtualizer = false,
}) {
    const parentRef = useRef(null)
    const [parentOffset, setParentOffset] = React.useState(0)

    // Evaluate Tailwind Breakpoints
    const [currentColSize, SetCurrentColSize] = React.useState(1)
    const isSm = useMediaQuery({ minWidth: 640 })
    const isMd = useMediaQuery({ minWidth: 768 })
    const isLg = useMediaQuery({ minWidth: 1024 })
    const isXl = useMediaQuery({ minWidth: 1280 })

    const isGridable = currentColSize > 1
    const rowCount = isGridable ? Math.ceil(itemCount / currentColSize) : itemCount

    useEffect(() => {
        if (parentRef.current) {
            setParentOffset(parentRef.current.offsetTop)
        }
    }, [])

    let rowVirtualizer = null
    let rootDivClassname = ""
    let rootDivStyle = {}

    if (isWindowVirtualizer) {
        rowVirtualizer = useWindowVirtualizer({
            count: rowCount,
            estimateSize: () => (fixedRowHeight ? fixedRowHeight : 50),
            overscan: 5,
            scrollMargin: parentOffset,
        })

        rootDivClassname = "w-full"
    } else {
        rowVirtualizer = useVirtualizer({
            count: rowCount,
            getScrollElement: () => parentRef.current,
            estimateSize: () => (fixedRowHeight ? fixedRowHeight : 50),
            overscan: 5,
        })

        rootDivClassname = "overflow-y-auto overflow-x-hidden pr-2"
        rootDivStyle.height = `${pxCutoffHeight}px`
        rootDivStyle.width = pxCutoffWidth ? `${pxCutoffWidth}px` : "auto"
    }

    const virtualItems = rowVirtualizer.getVirtualItems()

    useEffect(() => {
        if (onVirtualScrollEnd) {
            const lastRenderedItem = virtualItems[virtualItems.length - 1]
            if (!lastRenderedItem) return

            const isLastItem = lastRenderedItem.index >= rowCount - 1
            if (isLastItem && onVirtualScrollEnd) {
                onVirtualScrollEnd()
            }
        }
    }, [virtualItems, rowCount, onVirtualScrollEnd])

    useEffect(() => {
        const tempCurrentSize =
            isXl && columnsCount.xl !== undefined
                ? columnsCount.xl
                : isLg && columnsCount.lg !== undefined
                  ? columnsCount.lg
                  : isMd && columnsCount.md !== undefined
                    ? columnsCount.md
                    : isSm && columnsCount.sm !== undefined
                      ? columnsCount.sm
                      : columnsCount.default
        if (tempCurrentSize !== currentColSize) {
            SetCurrentColSize(tempCurrentSize)
        }
    }, [isSm, isMd, isLg, isXl, currentColSize])

    if (itemCount === 0) {
        return <DefaultEmptyRenderer EmptyRenderer={EmptyRenderer} />
    }

    return (
        <>
            <div
                ref={parentRef}
                tabIndex={0}
                className={`${className} ${rootDivClassname} focus:outline-none`}
                style={rootDivStyle}
            >
                <div
                    className={`w-full relative`}
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                    }}
                >
                    {virtualItems.map((virtualRow) => {
                        if (isGridable) {
                            const items = []
                            for (let i = 0; i < currentColSize; i++) {
                                const itemIndex = virtualRow.index * currentColSize + i
                                if (itemIndex < itemCount) {
                                    items.push(
                                        <div
                                            key={itemIndex}
                                            className="w-full flex justify-center"
                                        >
                                            <ItemRenderer index={itemIndex} />
                                        </div>
                                    )
                                }
                            }
                            return (
                                <div
                                    key={virtualRow.index}
                                    ref={fixedRowHeight ? null : rowVirtualizer.measureElement}
                                    data-index={fixedRowHeight ? null : virtualRow.index}
                                    className="top-0 left-0 absolute w-full grid"
                                    style={{
                                        transform: `translateY(${isWindowVirtualizer ? virtualRow.start - rowVirtualizer.options.scrollMargin : virtualRow.start}px)`,
                                        height: fixedRowHeight ? `${virtualRow.size}px` : "auto",
                                        columnGap: `${columnGap.x}px`,
                                        gridTemplateColumns: `repeat(${currentColSize}, minmax(0, 1fr))`,
                                        paddingTop: `${columnGap.y}px`,
                                    }}
                                >
                                    {items}
                                </div>
                            )
                        } else {
                            return (
                                <div
                                    key={virtualRow.index}
                                    ref={fixedRowHeight ? null : rowVirtualizer.measureElement}
                                    data-index={fixedRowHeight ? null : virtualRow.index}
                                    className="top-0 left-0 absolute w-full"
                                    style={{
                                        transform: `translateY(${isWindowVirtualizer ? virtualRow.start - rowVirtualizer.options.scrollMargin : virtualRow.start}px)`,
                                        height: fixedRowHeight ? `${virtualRow.size}px` : "auto",
                                        paddingTop: `${columnGap.y}px`,
                                    }}
                                >
                                    <ItemRenderer index={virtualRow.index} />
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
        </>
    )
}

/**
 * @param {({index: number}) => React.JSX.Element} ItemRenderer - function that takes in an index and returns a react component to render for that index
 * @param { function } onVirtualScrollEnd - callback function that is called when the user scrolls to the end of the list
 * @param {{sm:number, md:number, lg: number, xl: number}} columnsCount - number of columns to render in the scrollable
 */
export function WindowVerticalScrollable({
    className = "",
    ItemRenderer,
    EmptyRenderer = null,
    itemCount,
    columnsCount = { default: 1, sm: undefined, md: undefined, lg: undefined, xl: undefined },
    columnGap = { x: 0, y: 0 },
    fixedRowHeight = undefined,
    onVirtualScrollEnd = null,
}) {
    return (
        <VerticalScrollable
            className={className}
            ItemRenderer={ItemRenderer}
            EmptyRenderer={EmptyRenderer}
            itemCount={itemCount}
            columnsCount={columnsCount}
            columnGap={columnGap}
            fixedRowHeight={fixedRowHeight}
            pxCutoffHeight={null}
            pxCutoffWidth={null}
            onVirtualScrollEnd={onVirtualScrollEnd}
            isWindowVirtualizer={true}
        />
    )
}

/**
 * @param {({index: number, dataItem: any}) => React.JSX.Element} ItemRenderer - function that takes in an index and returns a react component to render for that index
 * @param {{sm:number, md:number, lg: number, xl: number}} columnsCount - number of columns to render in the scrollable, default is 1 (for vertical scroll), if more than 1, it will render in a grid format with the specified number of columns
 */
export function WindowVerticalQueryScrollable({
    className = "",
    queryKey,
    queryFn,
    getNextPageParam,
    columnsCount = { default: 1, sm: undefined, md: undefined, lg: undefined, xl: undefined }, // can specify different column counts for different screen sizes by passing in an object with keys xs, sm, md, lg, xl and values for each key representing the number of columns for that screen size
    columnGap = { x: 0, y: 0 },
    fixedRowHeight = undefined,
    ItemRenderer,
}) {
    return (
        <VerticalQueryScrollable
            className={className}
            queryKey={queryKey}
            queryFn={queryFn}
            getNextPageParam={getNextPageParam}
            ItemRenderer={ItemRenderer}
            fixedRowHeight={fixedRowHeight}
            pxCutoffHeight={null}
            pxCutoffWidth={null}
            columnsCount={columnsCount}
            columnGap={columnGap}
            isWindowVirtualizer={true}
        />
    )
}

/**
 * @param {({index: number}) => React.JSX.Element} ItemRenderer - function that takes in an index and returns a react component to render for that index
 * @param { function } onVirtualScrollEnd - callback function that is called when the user scrolls to the end of the list (index of last item is rendered)
 * @param {{sm:number, md:number, lg: number, xl: number}} rowsCount - number of rows to render in the scrollable, default is 1 (for vertical scroll), if more than 1, it will render in a grid format with the specified number of columns
 */
export function HorizontalScrollable({
    className = "",
    ItemRenderer,
    EmptyRenderer = null,
    itemCount,
    rowsCount = { default: 1, sm: undefined, md: undefined, lg: undefined, xl: undefined }, // can specify different row counts for different screen sizes by passing in an object with keys xs, sm, md, lg, xl and values for each key representing the number of columns for that screen size
    rowsGap = { x: 0, y: 0 },
    fixedColumnWidth = undefined,
    pxCutoffHeight = 250,
    pxCutoffWidth = 250,
    onVirtualScrollEnd = null,
}) {
    const parentRef = useRef(null)

    // Evaluate Tailwind Breakpoints
    const [currentRowSize, SetCurrentRowSize] = React.useState(1)
    const isSm = useMediaQuery({ minWidth: 640 })
    const isMd = useMediaQuery({ minWidth: 768 })
    const isLg = useMediaQuery({ minWidth: 1024 })
    const isXl = useMediaQuery({ minWidth: 1280 })

    const isGridable = currentRowSize > 1
    const colCount = isGridable ? Math.ceil(itemCount / currentRowSize) : itemCount

    let rowVirtualizer = null
    let rootDivClassname = ""
    let rootDivStyle = {}

    rowVirtualizer = useVirtualizer({
        count: colCount,
        getScrollElement: () => parentRef.current,
        estimateSize: () => (fixedColumnWidth ? fixedColumnWidth : 50),
        overscan: 5,
        horizontal: true,
    })

    rootDivClassname = "overflow-x-auto overflow-y-hidden pb-2"
    rootDivStyle.height = pxCutoffHeight ? `${pxCutoffHeight}px` : "auto"
    rootDivStyle.width = pxCutoffWidth ? `${pxCutoffWidth}px` : "auto"

    const virtualItems = rowVirtualizer.getVirtualItems()

    useEffect(() => {
        if (onVirtualScrollEnd) {
            const lastRenderedItem = virtualItems[virtualItems.length - 1]
            if (!lastRenderedItem) return

            const isLastItem = lastRenderedItem.index >= colCount - 1
            if (isLastItem && onVirtualScrollEnd) {
                onVirtualScrollEnd()
            }
        }
    }, [virtualItems, colCount, onVirtualScrollEnd])

    useEffect(() => {
        const tempCurrentSize =
            isXl && rowsCount.xl !== undefined
                ? rowsCount.xl
                : isLg && rowsCount.lg !== undefined
                  ? rowsCount.lg
                  : isMd && rowsCount.md !== undefined
                    ? rowsCount.md
                    : isSm && rowsCount.sm !== undefined
                      ? rowsCount.sm
                      : rowsCount.default
        if (tempCurrentSize !== currentRowSize) {
            SetCurrentRowSize(tempCurrentSize)
        }
    }, [isSm, isMd, isLg, isXl, currentRowSize])

    if (itemCount === 0) {
        return <DefaultEmptyRenderer EmptyRenderer={EmptyRenderer} />
    }

    return (
        <>
            <div
                ref={parentRef}
                tabIndex={0}
                className={`${rootDivClassname} ${className} focus:outline-none`}
                style={rootDivStyle}
            >
                <div
                    className={`h-full grid`}
                    style={{
                        width: `${rowVirtualizer.getTotalSize()}px`,
                    }}
                >
                    {virtualItems.map((virtualRow) => {
                        if (isGridable) {
                            const items = []
                            for (let i = 0; i < currentRowSize; i++) {
                                const itemIndex = virtualRow.index * currentRowSize + i
                                if (itemIndex < itemCount) {
                                    items.push(
                                        <div
                                            key={itemIndex}
                                            className="h-full flex justify-center"
                                        >
                                            <ItemRenderer index={itemIndex} />
                                        </div>
                                    )
                                }
                            }
                            return (
                                <div
                                    key={virtualRow.index}
                                    ref={fixedColumnWidth ? null : rowVirtualizer.measureElement}
                                    data-index={fixedColumnWidth ? null : virtualRow.index}
                                    className="col-start-1 row-start-1 justify-self-start h-full grid"
                                    style={{
                                        transform: `translateX(${virtualRow.start}px)`,
                                        width: fixedColumnWidth ? `${virtualRow.size}px` : "auto",
                                        rowGap: `${rowsGap.y}px`,
                                        gridTemplateRows: `repeat(${currentRowSize}, minmax(0, 1fr))`,
                                        paddingRight: `${rowsGap.x}px`,
                                    }}
                                >
                                    {items}
                                </div>
                            )
                        } else {
                            return (
                                <div
                                    key={virtualRow.index}
                                    ref={fixedColumnWidth ? null : rowVirtualizer.measureElement}
                                    data-index={fixedColumnWidth ? null : virtualRow.index}
                                    className="col-start-1 row-start-1 justify-self-start h-full"
                                    style={{
                                        transform: `translateX(${virtualRow.start}px)`,
                                        width: fixedColumnWidth ? `${virtualRow.size}px` : "auto",
                                        paddingRight: `${rowsGap.y}px`,
                                    }}
                                >
                                    <ItemRenderer index={virtualRow.index} />
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
        </>
    )
}
/**
 * @param {({index: number}) => React.JSX.Element} ItemRenderer - function that takes in an index and returns a react component to render for that index
 * @param { function } onVirtualScrollEnd - callback function that is called when the user scrolls to the end of the list (index of last item is rendered)
 * @param {{sm:number, md:number, lg: number, xl: number}} rowsCount - number of rows to render in the scrollable, default is 1 (for vertical scroll), if more than 1, it will render in a grid format with the specified number of columns
 */
export function HorizontalQueryScrollable({
    className = "",
    queryKey,
    queryFn,
    getNextPageParam,
    ItemRenderer,
    EmptyRenderer = null,
    rowsCount = { default: 1, sm: undefined, md: undefined, lg: undefined, xl: undefined }, // can specify different row counts for different screen sizes by passing in an object with keys xs, sm, md, lg, xl and values for each key representing the number of columns for that screen size
    rowsGap = { x: 0, y: 0 },
    fixedColumnWidth = undefined,
    pxCutoffHeight = 250,
    pxCutoffWidth = 250,
}) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey,
        queryFn,
        getNextPageParam,
    })

    const allItems = data ? data.pages.flatMap((page) => page) : []

    function OnVirtualScrollEnd() {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }

    return (
        <HorizontalScrollable
            className={className}
            ItemRenderer={({ index }) => {
                const isLoaderCol = index > allItems.length - 1

                return (
                    <LoadingItemRenderer
                        isALoadingItem={isLoaderCol}
                        ItemRenderer={ItemRenderer}
                        index={index}
                        allItems={allItems}
                    />
                )
            }}
            itemCount={hasNextPage ? allItems.length + 1 : allItems.length}
            fixedColumnWidth={fixedColumnWidth}
            onVirtualScrollEnd={OnVirtualScrollEnd}
            pxCutoffHeight={pxCutoffHeight}
            pxCutoffWidth={pxCutoffWidth}
            rowsCount={rowsCount}
            EmptyRenderer={EmptyRenderer}
            rowsGap={rowsGap}
        />
    )
}

/**
 * Defaults to vertical scroll with no horizontal scroll, but can be changed by passing in props
 */
function GenericScrollable({ className, children, isVertical = true, isHorizontal = false }) {
    let overflowClass = ""

    overflowClass += isVertical ? "overflow-y-auto " : "overflow-y-hidden "
    overflowClass += isHorizontal ? "overflow-x-auto " : "overflow-x-hidden "

    return <div className={`${className} ${overflowClass}`}>{children}</div>
}

export default GenericScrollable
