import "../tailwind.css";
import { use, useEffect, useState } from "react";
import { ShortenCountAsString } from "../Helpers/documentfunction.mjs";

function LikeButton({ streamID }) {
  if (streamID == null || streamID == undefined) {
    return <></>;
  }

  const [isLiked, SetIsLiked] = useState(null);
  const [totalLikeCount, SetTotalLikeCount] = useState(0);
  const [isAuthorized, SetIsAuthorized] = useState(false);

  function UpdateLikeCount() {
    // ALL LIKES
    fetch(`/api/title/stream/${streamID}/like`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        if (data) {
          SetTotalLikeCount((prev) => data.length);
        }
      })
      .catch((err) => {});
  }

  useEffect(() => {
    // AUTHORIZATION
    fetch(`/api/authorize/member`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          SetIsAuthorized(true);
        }
      })
      .catch((err) => {});

    UpdateLikeCount();

    // USER SPECIFIC LIKE
    fetch(`/api/authorize/member/title/like/${streamID}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          SetIsLiked(true);
        } else {
          SetIsLiked(false);
        }
      })
      .catch((err) => {
        SetIsLiked(false);
      });
  }, []);

  function ToggleLike() {
    const theMethod = isLiked ? "DELETE" : "POST";

    fetch(`/api/authorize/member/title/like/${streamID}`, {
      method: theMethod,
    })
      .then((response) => {
        if (response.ok) {
          SetIsLiked(!isLiked);
        }
      })
      .catch((err) => {})
      .finally(() => {
        UpdateLikeCount();
      });
  }

  return (
    <button
      onClick={() => {
        if (isAuthorized) {
          ToggleLike();
        }
      }}
      className="flex flex-row gap-x-1 items-center"
    >
      <svg
        className={`text-os-blue-secondary w-8 md:w-10 ${isAuthorized ? "cursor-pointer" : ""}`}
        viewBox="0 0 24 24"
        fill={`${isLiked ? "currentColor" : "none"}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 10V20M8 10L4 9.99998V20L8 20M8 10L13.1956 3.93847C13.6886 3.3633 14.4642 3.11604 15.1992 3.29977L15.2467 3.31166C16.5885 3.64711 17.1929 5.21057 16.4258 6.36135L14 9.99998H18.5604C19.8225 9.99998 20.7691 11.1546 20.5216 12.3922L19.3216 18.3922C19.1346 19.3271 18.3138 20 17.3604 20L8 20"
          stroke="#F8F8FF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-os-white font-semibold text-sm md:text-lg">
        {ShortenCountAsString(totalLikeCount)}
      </p>
    </button>
  );
}

export default LikeButton;
