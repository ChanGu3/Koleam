import FooterOS from "../components/FooterOS";
import NavbarOS from "../components/NavbarOS";
import SeriesModule from "../components/SeriesModule";
import "../tailwind.css";
import { useEffect, useState, useRef } from "react";

const startingLimit = 8;

function Search() {
  const searchInputRef = useRef(null);
  const [limit, SetLimit] = useState(startingLimit); // add 4 to limit every load more
  const [animeList, SetAnimeList] = useState(null);
  const [previousSearchQuery, SetPreviousSearchQuery] = useState(null);

  async function SearchAndPopulateAnime(searchQuery) {
    try {
      const response = await fetch(
        `/api/anime?search=${searchQuery}&limit=${limit}`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        if (response.status === 200) {
          const newAnimeList = await response.json();
          SetAnimeList(newAnimeList);
          SetPreviousSearchQuery(searchQuery);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function LoadMore() {
    SetLimit(limit + startingLimit);
  }

  useEffect(() => {
    document.title = "Search - OtakuStream";
  }, []);

  useEffect(() => {
    if (animeList !== null) {
      SearchAndPopulateAnime(searchInputRef.current.value);
    }
  }, [limit]);

  useEffect(() => {
    if (previousSearchQuery !== searchInputRef.current.valuel) {
      SetLimit(startingLimit);
    }
  }, [previousSearchQuery]);

  return (
    <>
      <NavbarOS />
      <main className="w-full mt-24 flex flex-col items-center">
        <div className="mb-12 w-full flex flex-col justify-center items-center gap-y-4">
          <form
            id="searchform"
            name="searchform"
            method="GET"
            onSubmit={(event) => {
              event.preventDefault();
              SearchAndPopulateAnime(searchInputRef.current.value);
            }}
            className="flex flex-row justify-center items-center gap-x-2 md:gap-x-4 w-full"
          >
            <button
              id="searchicon"
              name="searchicon"
              type="submit"
              className="cursor-pointer"
            >
              <img
                className="min-w-6 w-6 md:min-w-7 md:w-7"
                src="/magnifying-glass-zoom-svgrepo-com.svg"
                alt="search-icon"
              ></img>
            </button>
            <input
              ref={searchInputRef}
              onChange={() => {
                SearchAndPopulateAnime(searchInputRef.current.value);
              }}
              id="search"
              name="search"
              className="p-1 md:p-2 w-[50%] border-os-blue-secondary border-1 md:border-2 rounded-sm text-os-white font-bold placeholder:text-os-white/80 placeholder:font-semibold"
              type="text"
              placeholder="Search"
            />
          </form>
          <div className="flex flex-col justify-center items-center gap-y-1">
            <p className="text-os-white text-sm md:text-md font-bold">
              search our anime catolog!
            </p>
            <p className="text-os-white text-xs md:text-sm font-semibold text-center w-[90%]">
              enter what's on your mind in this search bar and we’ll get it for
              you
            </p>
          </div>
        </div>
        <div className={`${animeList ? "" : "hidden"}`}>
          <div className="flex flex-col justify-center">
            <p className="w-full text-os-blue-tertiary text-xs md:text-2xl font-semibold">
              Search Results
            </p>
            <div className="my-2 grid grid-flow-row grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-6">
              {animeList
                ? animeList.map((anime, index) => {
                    return (
                      <SeriesModule
                        key={anime.id}
                        animeID={anime.id}
                        title={anime.title}
                        imageSrc={anime.coverHREF}
                        seasonNum={anime.installments.seasons}
                        episodeNum={anime.installments.list.reduce(
                          (accum, installment) => accum + installment.episodes,
                          0,
                        )}
                        movieNum={anime.installments.movies}
                        description={anime.description}
                        href={`/series/${anime.id}/${anime.title}`}
                      />
                    );
                  })
                : ""}
            </div>
          </div>
          <div
            className={`my-4 w-full flex flex-row justify-center ${animeList ? (animeList.length < limit ? "hidden" : "") : ""}`}
          >
            <button
              type="button"
              onClick={() => {
                LoadMore();
              }}
              className="font-semibold text-md text-os-blue-tertiary hover:text-os-blue-tertiary/60 cursor-pointer"
            >
              Load More...
            </button>
          </div>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default Search;
