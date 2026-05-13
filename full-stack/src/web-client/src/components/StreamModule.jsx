import "../tailwind.css";

function SeriesModule({
  isMovie,
  animeTitle,
  streamTitle,
  streamImageSrc,
  streamDescription,
  dateReleased,
  href,
  seasonNum,
  episodeNum,
}) {
  const episodeInfo = isMovie ? `` : `S${seasonNum} | E${episodeNum}`;
  const streamInfo = isMovie
    ? `${streamTitle}`
    : `${episodeInfo} - ${streamTitle}`;

  return (
    <>
      <div className="w-32 md:w-56 h-auto relative">
        <a href={href} className="relative flex flex-col space-y-0.5 group">
          <img src={streamImageSrc} className="rounded-xs aspect-video"></img>
          <div className="absolute top-0 left-0 rounded-xs aspect-video w-full group-active:bg-os-dark-secondary/30"></div>
          <div className="flex flex-col">
            <p className="font-semibold text-[10px] md:text-xs text-os-dark-secondary group-active:underline">
              {animeTitle}
            </p>
            <p className="font-semibold text-[8px] md:text-[10px] text-os-white group-active:underline">
              {streamInfo}
            </p>
          </div>
        </a>

        {/* --HOVERING-- Discover */}
        <div className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none md:pointer-events-auto md:hover:opacity-100">
          <div className="absolute top-0 left-0 w-full h-full bg-os-dark-tertiary flex flex-col px-2 py-1">
            <div className="w-full flex flex-row justify-between">
              <p className="text-os-dark-secondary text-[10px] italic font-semibold truncate w-1/2">
                {animeTitle}
              </p>
              <p className="text-os-dark-secondary text-[8px] italic font-semibold truncate">
                <span className="text-os-blue-secondary font-bold">
                  Released:
                </span>{" "}
                {dateReleased}
              </p>
            </div>
            <div className="w-full border-[0.5px] border-os-dark-secondary rounded-xs"></div>
            <p className="py-1 text-os-white text-[16px] italic font-semibold truncate">
              {streamInfo}
            </p>
            <div className="w-full border-[0.5px] border-os-dark-secondary rounded-xs"></div>
            <div className="my-1 w-full">
              <p className="w-full text-[10px] h-4 truncate text-os-blue-secondary font-bold">
                Synapsis:
              </p>
              <p className="w-full text-[10px] text-os-white h-8 line-clamp-2">
                {streamDescription}
              </p>
            </div>
            <div className="p-2 w-full h-auto flex justify-center">
              <a
                href={href}
                className="text-lg text-os-blue-tertiary hover:text-os-blue-tertiary/60 active:text-os-blue-tertiary/80 font-semibold"
              >
                {">"} Play {episodeInfo}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SeriesModule;
