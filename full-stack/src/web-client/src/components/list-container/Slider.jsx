import { useState, useEffect, useRef } from "react"
import { useMediaQuery } from "react-responsive"
import "../../tailwind.css"

function SliderItem({ index, component, sliderItems }) {
    return (
        <>
            <div
                ref={(el) => (sliderItems.current[index] = el)}
                className="relative"
            >
                <div
                    name="overlay"
                    className="absolute bg-s-dark-primary/80 inset-0 z-10 rounded-sm hidden"
                ></div>
                <div
                    name="component"
                    className="p-1"
                >
                    {component}
                </div>
            </div>
        </>
    )
}

/*
            document.getElementById('left-slider').classList.add('hidden');
            document.getElementById('right-slider').classList.add('hidden');
*/

/* Main Slider */
function Slider({ sliderList, title }) {
    if (sliderList === undefined) {
        return null
    }

    if (sliderList.length === 0) {
        return null
    }

    const fixedLeftOffset = 60
    const fixedLeftOffsetLG = 120

    const indicatorsSlider = useRef(null)
    const sliderWrapper = useRef(null)
    const sliderItems = useRef([])

    const [currFirstItemIndex, SetCurrFirstItemIndex] = useState(() => {
        return 0
    })
    const [{ leftOffset, leftOffsetLG }, SetLeftOffset] = useState({
        leftOffset: 0,
        leftOffsetLG: 0,
    })
    const [totalWidthOfItems, SetTotalWidthOfItems] = useState(() => {
        return 0
    })

    const isMD = useMediaQuery({ minWidth: 768 })

    function IsElementInViewport(el) {
        const sliderOffset = (isMD ? 32 : 16) + 4

        const rect = el.getBoundingClientRect()

        return rect.left >= 0 && rect.right <= document.documentElement.clientWidth - sliderOffset
    }

    function DetectCurrentItemWidth() {
        const el = sliderItems.current[0]

        const style = getComputedStyle(el)
        const marginLeft = parseFloat(style.marginLeft)
        const marginRight = parseFloat(style.marginRight)
        const width = el.getBoundingClientRect().width

        SetLeftOffset({
            leftOffset: fixedLeftOffset - marginLeft,
            leftOffsetLG: fixedLeftOffsetLG - marginLeft,
        })
        SetTotalWidthOfItems(width + marginLeft + marginRight)
    }

    function HandleTranistionEnd() {
        let isInViewport = false

        sliderItems.current.forEach((element, index) => {
            isInViewport = IsElementInViewport(element)
            if (isInViewport) {
                const { overlay, component } = element.getElementsByTagName("div")
                //overlay.classList.remove('p-3');
                //component.classList.remove('p-3');
                overlay.classList.remove("hidden")
                overlay.classList.add("hidden")
            } else {
                const { overlay, component } = element.getElementsByTagName("div")
                //overlay.classList.add('p-3');
                //component.classList.add('p-3');
                overlay.classList.remove("hidden")
            }
        })
    }

    useEffect(() => {
        DetectCurrentItemWidth()

        window.addEventListener("resize", HandleTranistionEnd)

        return () => {
            window.removeEventListener("resize", HandleTranistionEnd)
        }
    }, [currFirstItemIndex, isMD])

    function SlideLeft() {
        currFirstItemIndex !== 0 ? SlideItemsAsFirst(currFirstItemIndex - 1) : SlideItemsAsFirst(sliderList.length - 1)
    }

    function SlideRight() {
        if (IsElementInViewport(sliderItems.current[sliderItems.current.length - 1])) {
            SlideItemsAsFirst(0)
            return
        }
        SlideItemsAsFirst(currFirstItemIndex + 1)
    }

    function SlideItemsAsFirst(index) {
        SetCurrFirstItemIndex(index)
    }

    const padding = 8 // padding from first item
    let gapSize = 0
    let trueLeftOffset = 0
    let translateX = 0
    if (isMD) // LG
    {
        trueLeftOffset = leftOffsetLG
        gapSize = 16
    } else {
        trueLeftOffset = leftOffset
        gapSize = 10
    }

    translateX = trueLeftOffset - padding / 2 + totalWidthOfItems * -currFirstItemIndex

    if (currFirstItemIndex !== 0) {
        translateX = translateX - gapSize * currFirstItemIndex
    }

    return (
        <>
            <div
                id="indicators-slider"
                className="my-8 md:my-12 overflow-hidden"
            >
                <p className="mx-15 md:mx-28 py-1 md:py-2 md:p-2 w-full text-s-tertiary text-xs md:text-2xl font-semibold">{title}</p>

                <div
                    ref={indicatorsSlider}
                    className="relative w-full"
                    data-carousel="static"
                >
                    {/* <!-- Carousel wrapper -->*/}
                    <div
                        ref={sliderWrapper}
                        id="slider-wrapper"
                        className={`relative w-full flex flex-row gap-[10px] md:gap-[16px] transition-transform duration-300`}
                        onTransitionEnd={HandleTranistionEnd}
                        style={{ transform: `translateX(${translateX}px)` }}
                    >
                        {sliderList.map((component, index) => {
                            return (
                                <SliderItem
                                    key={index}
                                    index={index}
                                    component={component}
                                    sliderItems={sliderItems}
                                />
                            )
                        })}
                    </div>

                    {/*<!-- Slider controls -->*/}
                    <button
                        id="left-slider"
                        type="button"
                        onClick={SlideLeft}
                        className="bg-s-dark-tertiary/25 hover:bg-s-dark-tertiary/40 absolute rounded-xl top-0 start-0 z-30 flex items-center justify-center h-full p-4 md:p-6 cursor-pointer group focus:outline-none"
                    >
                        <span className="inline-flex items-center justify-center w-5 h-5 md:w-10 md:h-10 rounded-full bg-s-tertiary/50 group-hover:bg-s-tertiary/80">
                            <svg
                                className="w-2 h-2 md:w-4 md:h-4 text-os-white dark:text-gray-800 rtl:rotate-180"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 6 10"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 1 1 5l4 4"
                                />
                            </svg>
                            <span className="sr-only">Previous</span>
                        </span>
                    </button>
                    <button
                        id="right-slider"
                        type="button"
                        onClick={SlideRight}
                        className="bg-s-dark-tertiary/25 hover:bg-s-dark-tertiary/40 rounded-xl absolute top-0 end-0 z-30 flex items-center justify-center h-full p-4 md:p-6 cursor-pointer group focus:outline-none"
                        data-carousel-next
                    >
                        <span className="inline-flex items-center justify-center w-5 h-5 md:w-10 md:h-10 rounded-full bg-s-tertiary/50 group-hover:bg-s-tertiary/80">
                            <svg
                                className="w-2 h-2 md:w-4 md:h-4 text-s-white dark:text-gray-800 rtl:rotate-180"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 6 10"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 9 4-4-4-4"
                                />
                            </svg>
                            <span className="sr-only">Next</span>
                        </span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Slider
