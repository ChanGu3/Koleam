//TODO in the future create universal dropdown

import { ShortenCountAsString } from "../../utils/DocumentFunction.mjs"
import { useRef, useState, useEffect } from "react"
import { Star, Triangle } from "lucide-react"

/**
 * @param {number[]} ratings_count counts of specific rating for a title
 * [0 index = rating 1 count etc]
 */
function RatingDropdown({ total_rating_count, rating_average, ratings_count = [] }) {
    {
        /* Dropdown Star Rating */
    }
    const ratingDropDownRef = useRef(null)
    const ratingButtonRef = useRef(null)
    const [isStarDroppedDown, SetIsStarDroppedDown] = useState(false)

    useEffect(() => {
        document.addEventListener("mousedown", OnMouseDown)

        return () => {
            document.removeEventListener("mousedown", OnMouseDown)
        }
    }, [])

    function OnMouseDown(event) {
        if (!ratingDropDownRef.current.contains(event.target) && !ratingButtonRef.current.contains(event.target)) {
            SetIsStarDroppedDown(false)
        }
    }

    const ratings = []
    for (let i = 0; i < ratings_count.length; i++) {
        let percentage = 0
        if (total_rating_count > 0) {
            percentage = ((ratings_count[i] / total_rating_count) * 100).toFixed(0)
        }
        ratings.push(
            <div
                key={`rating_${i + 1}_count`}
                className="flex flex-row items-center gap-x-2 md:py-1 px-1 md:px-2"
            >
                <div className="flex flex-row items-center justify-center gap-0.5">
                    <Star
                        className="place-self-center w-3 md:w-6 text-s-secondary"
                        fill="currentColor"
                    />
                    <p className="text-[10px] md:text-sm text-s-secondary font-semibold text-center">{i + 1}</p>
                </div>
                <div className="rounded-xs bg-s-dark-secondary/70 w-[55%] h-1 md:h-2">
                    <div
                        className={`rounded-xs h-1 md:h-2 bg-s-secondary`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <p className="text-[10px] md:text-sm text-s-secondary font-semibold">{percentage}%</p>
            </div>
        )
    }

    return (
        <div className={`relative flex flex-col justify-center items-center select-none`}>
            <div
                ref={ratingButtonRef}
                onClick={() => {
                    SetIsStarDroppedDown(!isStarDroppedDown)
                }}
                className="flex flex-row items-center justify-between gap-x-2 cursor-pointer bg-s-dark-tertiary/40 hover:bg-s-dark-tertiary/70 px-2 py-1 h-6 md:h-10 w-24 md:w-38"
            >
                <div className="flex flex-row items-center gap-x-0.5">
                    <Star
                        fill="currentColor"
                        className="place-self-center w-3 md:w-6 text-s-secondary"
                    />
                    <p className="text-s-white text-xs md:text-lg font-bold">
                        {`${rating_average ? rating_average.toFixed(1) : 0}`} {`(${ShortenCountAsString(total_rating_count)})`}
                    </p>
                </div>
                <Triangle
                    fill="currentColor"
                    className={`text-s-white w-2 md:w-4 ${isStarDroppedDown ? "" : "rotate-180"} self-center`}
                />
            </div>
            <div
                ref={ratingDropDownRef}
                className={`absolute flex flex-col justify-center top-6 md:top-10 -left-5.5 md:-left-10.5 w-36 md:w-60 bg-s-dark-tertiary/90 py-1 ${isStarDroppedDown ? "" : "hidden"} z-100`}
            >
                {ratings}
            </div>
        </div>
    )
}

export default RatingDropdown
