import "../tailwind.css";
import { useEffect, useState } from "react";
import NavbarOS from "../components/NavbarOS.jsx";
import FooterOS from "../components/FooterOS.jsx";

/* Carousel Import */
import Carousel from "../components/Carousel.jsx";
import { CarouselItemObject } from "../components/Carousel.jsx";

import Slider from "../components/Slider.jsx";

import SeriesModule from "../components/SeriesModule.jsx";
import StreamModule from "../components/StreamModule.jsx";

function Home() {
  const [recentAnimeStreamWatchList, SetRecentAnimeStreamWatchList] =
    useState(null);
  const [recentlyUploadedList, SetRecentlyUploadedList] = useState(null);
  const [shuffledAnimeList, SetShuffledAnimeList] = useState(null);

  useEffect(() => {
    document.title = "Home - OtakuStream";

    async function TryGetHistory() {
      try {
        const response = await fetch(
          `/api/authorize/member/anime/stream/history?latestStreamPerSeries=true`,
          {
            method: "GET",
          },
        );

        if (response.ok) {
          if (response.status === 200) {
            const data = await response.json();
            if (data.error === undefined) {
              SetRecentAnimeStreamWatchList(data);
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    TryGetHistory();

    async function TryGetCarousel() {
      try {
        const response = await fetch(
          `/api/anime?limit=7&getNewestReleases=true`,
          {
            method: "GET",
          },
        );

        if (response.ok) {
          if (response.status === 200) {
            const newRecentlyUploaded = await response.json();
            SetRecentlyUploadedList(newRecentlyUploaded);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    TryGetCarousel();

    async function TryGetSeriesShuffle() {
      try {
        const response = await fetch(`/api/anime?shuffle=true`, {
          method: "GET",
        });

        if (response.ok) {
          if (response.status === 200) {
            const newAnimeShuffle = await response.json();
            SetShuffledAnimeList(newAnimeShuffle);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    TryGetSeriesShuffle();
  }, []);

  return (
    <>
      <NavbarOS />
      <main>
        <Slider
          title="Continue Watching"
          sliderList={
            recentAnimeStreamWatchList
              ? recentAnimeStreamWatchList.map((streamAnime, index) => {
                  return (
                    <StreamModule
                      key={streamAnime.streamID}
                      isMovie={streamAnime.isMovie}
                      animeTitle={streamAnime.animeTitle}
                      streamTitle={streamAnime.title}
                      streamImageSrc={streamAnime.coverHREF}
                      streamDescription={streamAnime.synopsis}
                      dateReleased={(() => {
                        if (streamAnime) {
                          return `${new Date(streamAnime.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`;
                        } else {
                          return "";
                        }
                      })()}
                      href={`/stream/${streamAnime.streamID}/${streamAnime.title}`}
                      seasonNum={streamAnime.installmentSeasonNum}
                      episodeNum={streamAnime.streamNumber}
                    />
                  );
                })
              : []
          }
        />

        <Carousel
          key={recentlyUploadedList ? recentlyUploadedList.length : 0}
          carouselList={
            recentlyUploadedList
              ? recentlyUploadedList.map((recentlyUploaded) => {
                  const object = new CarouselItemObject(
                    recentlyUploaded.title,
                    recentlyUploaded.description,
                    recentlyUploaded.coverHREF,
                    `/series/${recentlyUploaded.id}/${recentlyUploaded.title}`,
                  );
                  return object;
                })
              : []
          }
        />

        <Slider
          title="Series Shuffle"
          sliderList={
            shuffledAnimeList
              ? shuffledAnimeList.map((anime, index) => {
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
              : []
          }
        />
      </main>
      <FooterOS />
    </>
  );
}

export default Home;
