import "../tailwind.css";
import { useEffect, useState } from "react";
import NavbarOS from "../components/NavbarOS.jsx";
import FooterOS from "../components/FooterOS.jsx";

import SeriesModule from "../components/SeriesModule.jsx";
import { useParams } from "react-router-dom";

const startingLimit = 8;

function CategoryResult({ isGenre, isAZ }) {
  const { genre } = useParams();

  const [limit, SetLimit] = useState(startingLimit);
  const [animeList, SetAnimeList] = useState(null);

  async function LoadGenre() {
    const fetchURL = `/api/anime?genres=${genre}&limit=${limit}&isAZ=${isAZ}`;

    try {
      const response = await fetch(fetchURL, {
        method: "GET",
      });

      if (response.ok) {
        if (response.status === 200) {
          const newAnimeList = await response.json();
          SetAnimeList(newAnimeList);
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
    document.title = `Discover ${genre} - OtakuStream`;

    if (isGenre) {
      // Checking if genre exists otherwise redirect
      fetch(`/api/anime/genre`, {
        method: "GET",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            navigate("/404");
          }
        })
        .then((data) => {
          if (data) {
            if (data.some((data) => data.name !== genre)) {
              navigate("/404");
            }
          } else {
            navigate("/404");
          }
        })
        .catch((err) => {
          navigate("/404");
        });
    }

    LoadGenre();
  }, []);

  useEffect(() => {
    if (animeList !== null) {
      LoadGenre();
    }
  }, [limit]);

  return (
    <>
      <NavbarOS />
      <main className="w-full mt-8 flex flex-col items-center">
        <div>
          <div className="flex flex-col justify-center">
            <p className="w-full text-os-blue-tertiary text-xs md:text-2xl font-semibold">
              {isAZ && genre === undefined
                ? "A-Z"
                : genre
                  ? genre.toUpperCase()
                  : "..."}
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

export default CategoryResult;
