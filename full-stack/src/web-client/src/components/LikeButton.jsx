import "../tailwind.css"
import { useEffect, useState } from "react"
import { ShortenCountAsString } from "../utils/DocumentFunction.mjs" //"../Helpers/documentfunction.mjs";
import useMember from "../hooks/useMember.jsx"
import { useMemberGetLike, useMemberUpdateLike } from "../hooks/useStream.jsx"
import { ThumbsUp } from "lucide-react"

function LikeButton({ streamID, totalLikeCount }) {
    const { memberIsSignedIn } = useMember()

    const { data: memberLike, error: isErrorMemberLike, isLoading: isLoadingMemberLike } = useMemberGetLike(streamID, memberIsSignedIn)
    const { mutate: updateMemberLike } = useMemberUpdateLike(streamID)

    if (!memberIsSignedIn || streamID == null || streamID == undefined) {
        return <></>
    }

    return (
        <button
            onClick={() => {
                updateMemberLike()
            }}
            className={` flex flex-row gap-x-1 items-center`}
        >
            <ThumbsUp
                fill={`${memberLike ? "currentColor" : "none"}`}
                className={`text-os-blue-secondary w-8 md:w-10 ${memberIsSignedIn ? "cursor-pointer" : ""}`}
            />
            <p className="text-os-white font-semibold text-sm md:text-lg">{ShortenCountAsString(totalLikeCount)}</p>
        </button>
    )
}

export default LikeButton
