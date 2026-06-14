import "../tailwind.css"
import { useEffect, useRef, useState } from "react"
import { Heart } from "lucide-react"
import { useMemberGetFavorite, useMemberUpdateFavorite } from "../hooks/useTitle.jsx"
import useMember from "../hooks/useMember.jsx"

function FavoriteButton({ titleID, className = "" }) {
    const { memberIsSignedIn } = useMember()

    const { data: isFavorite, error: isErrorFavorite, isLoading: isLoadingFavorite } = useMemberGetFavorite(titleID, memberIsSignedIn)
    const { mutate: updateFavorite } = useMemberUpdateFavorite(titleID)

    return (
        <button
            type="button"
            onClick={() => {
                updateFavorite()
            }}
            className={`${className} bg-s-secondary flex items-center justify-center cursor-pointer ${memberIsSignedIn ? "" : "hidden"}`}
        >
            <Heart
                fill={isFavorite ? "currentColor" : "none"}
                className={`text-s-white p-0.75 hover:p-0`}
            />
        </button>
    )
}

export default FavoriteButton
