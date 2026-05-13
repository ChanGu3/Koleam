import "../tailwind.css";

function SeriesModule2({
  isMovie,
  streamTitle,
  streamImageSrc,
  dateReleased,
  href,
  episodeNum = 0,
  flipBottomText = false,
}) {
  const streamInfo = isMovie
    ? `${streamTitle}`
    : `E${episodeNum} - ${streamTitle}`;

  return (
    <>
      <div className="relative">
        <a href={href} className="relative flex flex-col space-y-0.5 group">
          <img
            src={streamImageSrc}
            className="rounded-xs aspect-video object-cover"
          ></img>
          <div className="absolute top-0 left-0 rounded-xs aspect-video w-full group-hover:bg-os-dark-secondary/30 group-active:bg-os-dark-secondary/50"></div>
          <div
            className={`flex flex-col ${flipBottomText ? "md:flex-row-reverse" : "md:flex-row"} justify-between `}
          >
            <p className="font-semibold text-xs md:text-lg text-os-white group-active:underline group-hover:underline truncate">
              {streamInfo}
            </p>
            <p className="text-os-dark-secondary text-[6px] md:text-[8px] italic font-semibold whitespace-nowrap">
              <span className="text-os-blue-secondary font-bold ">
                Released:
              </span>{" "}
              {dateReleased}
            </p>
          </div>
        </a>
      </div>
    </>
  );
}

export default SeriesModule2;
