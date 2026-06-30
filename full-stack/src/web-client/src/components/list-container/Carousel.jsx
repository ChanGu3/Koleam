import { useState, useEffect, useCallback, useRef } from "react"
import { FileQuestionMark } from "lucide-react"
import ImageUI from "../ImageUI.jsx"
import { Link } from "react-router-dom"

// Object Data Of Carousel Item
export const CarouselItemObject = function (logoImage, description, src, href) {
    this.logoImage = logoImage
    this.description = description
    this.src = src
    this.href = href

    return this
}

// Carousel Item Containing image
function CarouselItem({ index, item, currCarouselIndex, prevCarouselIndex }) {
    return (
        <Link
            // FIX: Using a unique identifier like item.href or a combination ensures
            // React doesn't misalign elements during transitions
            key={`${item.href}-${index}`}
            className={`absolute inset-0 w-full h-full block ${
                index === currCarouselIndex
                    ? "animate-fade-in z-40" // Brought active item to the top z-index
                    : index === prevCarouselIndex
                      ? "animate-fade-out z-30"
                      : "hidden -z-10"
            }`}
            to={{ pathname: item.href }}
        >
            <div className="z-50 absolute left-14 sm:left-18 md:left-28 bottom-24 bg-s-dark-tertiary/40 rounded-sm p-1 w-48 md:w-lg flex flex-col justify-start">
                <p className="md:p-1 text-s-white font-bold text-lf md:text-4xl">{item.logoImage}</p>
                <p className="p-0.5 md:p-2 text-s-white/95 font-semibold text-[6px] md:text-xs h-7.5 md:h-18 line-clamp-3 md:line-clamp-4">{item.description}</p>
            </div>
            <div className="absolute flex justify-center w-full h-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-30 mask-[linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]">
                <div className="absolute w-full h-full object-cover object-top self-center">
                    <ImageUI
                        Src={item.src}
                        Fallback={FileQuestionMark}
                    />
                </div>
            </div>
        </Link>
    )
}

// Carousel Item Loading Box
function CarouselSelect({ index, SlideToElement, currCarouselIndex, SlideRight }) {
    return (
        <button
            type="button"
            onClick={() => SlideToElement(index)}
            className={`border-s-dark-tertiary border-1 cursor-pointer rounded-xs bg-s-dark-secondary hover:bg-s-white/75 ${index === currCarouselIndex ? "w-full" : "w-[55%]"}`}
        >
            <div
                className={`origin-left h-full w-full ${index === currCarouselIndex ? "bg-s-white hover:bg-s-white/75 animate-fill-from-left" : "w-1/4"}`}
                // FIX: Guarded to ensure only the active indicator can trigger the next slide transition
                onAnimationEnd={() => {
                    if (index === currCarouselIndex) {
                        SlideRight()
                    }
                }}
            ></div>
        </button>
    )
}

/* Main Carousel */
function Carousel({ carouselList = [], includeSideButtons = false }) {
    const [{ currCarouselIndex, prevCarouselIndex }, SetCarouselIndexes] = useState({
        currCarouselIndex: 0,
        prevCarouselIndex: -1,
    })

    const carouselMaxCount = 6
    const currentCarouselData = carouselList.slice(0, carouselMaxCount + 1)

    // Use a ref to keep track of the absolute latest state to avoid stale closures in event handlers
    const stateRef = useRef(currCarouselIndex)
    stateRef.current = currCarouselIndex

    const SlideToElement = useCallback((index) => {
        SetCarouselIndexes((prev) => ({
            currCarouselIndex: index,
            prevCarouselIndex: prev.currCarouselIndex,
        }))
    }, [])

    const SlideLeft = useCallback(() => {
        const current = stateRef.current
        current !== 0 ? SlideToElement(current - 1) : SlideToElement(currentCarouselData.length - 1)
    }, [currentCarouselData.length, SlideToElement])

    const SlideRight = useCallback(() => {
        const current = stateRef.current
        current !== currentCarouselData.length - 1 ? SlideToElement(current + 1) : SlideToElement(0)
    }, [currentCarouselData.length, SlideToElement])

    const showControls = currentCarouselData.length > 1
    const showCarousel = currentCarouselData.length > 0

    if (!showCarousel) return null

    return (
        <div
            id="indicators-carousel"
            className="relative w-full h-full"
        >
            {/* */}
            <div
                id="carousel-wrapper"
                className="relative min-h-80 md:min-h-120 lg:min-h-146 xl:min-h-164 2xl:min-h-200 3xl:min-h-224 md:overflow-hidden"
            >
                {currentCarouselData.map((item, index) => (
                    <CarouselItem
                        key={`${item.href}-${index}`}
                        index={index}
                        item={item}
                        currCarouselIndex={currCarouselIndex}
                        prevCarouselIndex={prevCarouselIndex}
                    />
                ))}
            </div>

            {/**/}
            {showControls && (
                <div
                    id="slider-indicators"
                    className="py-1 px-2 absolute z-50 flex justify-between bottom-10 left-12 sm:left-16 md:left-26 rounded-sm gap-x-2 min-w-44 sm:min-w-72 min-h-6 md:min-h-8"
                >
                    {currentCarouselData.map((item, index) => (
                        <CarouselSelect
                            key={index}
                            index={index}
                            currCarouselIndex={currCarouselIndex}
                            SlideToElement={SlideToElement}
                            SlideRight={SlideRight}
                        />
                    ))}
                </div>
            )}

            {/**/}
            {includeSideButtons && showControls && (
                <>
                    <button
                        id="left-slider"
                        type="button"
                        onClick={SlideLeft}
                        className="bg-s-dark-tertiary/25 hover:bg-s-dark-tertiary/40 absolute top-0 inset-s-0 z-50 flex items-center justify-center h-full p-3 md:p-6 cursor-pointer group focus:outline-none"
                    >
                        {/* SVG Content */}
                        <span className="sr-only">Previous</span>
                    </button>
                    <button
                        id="right-slider"
                        type="button"
                        onClick={SlideRight}
                        className="bg-s-dark-tertiary/25 hover:bg-s-dark-tertiary/40 rounded-xs absolute top-0 inset-e-0 z-50 flex items-center justify-center h-full p-3 md:p-6 cursor-pointer group focus:outline-none"
                    >
                        {/* SVG Content */}
                        <span className="sr-only">Next</span>
                    </button>
                </>
            )}
        </div>
    )
}

export default Carousel
