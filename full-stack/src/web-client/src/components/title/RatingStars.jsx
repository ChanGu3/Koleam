import { Star } from "lucide-react"
import { useEffect, useState } from "react"

function RatingStars({ starsCount = 5, currentRating = 0, onRatingChange = (starValue) => {} }) {
    const [rating, SetRating] = useState(currentRating)
    const [hoverRating, SetHoverRating] = useState(0)

    useEffect(() => {
        SetRating(currentRating)
    }, [currentRating])

    return (
        <div className="flex flex-row">
            {new Array(starsCount).fill(0).map((value, index) => {
                const starValue = index + 1
                const isHoverFilled = starValue <= hoverRating
                const isMemberFilled = starValue <= rating

                const isFilled = isHoverFilled || isMemberFilled
                return (
                    <button
                        key={starValue}
                        type="button"
                        onClick={() => {
                            onRatingChange(starValue)
                        }}
                        onMouseEnter={() => SetHoverRating(starValue)}
                        onMouseLeave={() => SetHoverRating(0)}
                        className="cursor-pointer"
                    >
                        <Star
                            fill={isFilled ? "currentColor" : "none"}
                            className={`md:w-10 md:h-10 transition-colors ${isFilled ? `${isHoverFilled ? "text-s-secondary" : "text-s-white"}` : "text-s-white hover:text-s-secondary"}`}
                        />
                    </button>
                )
            })}
        </div>
    )
}

export default RatingStars
