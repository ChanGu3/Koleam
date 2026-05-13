import "../tailwind.css";
import { useEffect } from "react";
import NavbarOS from "../components/NavbarOS.jsx";
import FooterOS from "../components/FooterOS.jsx";

import Slider from "../components/Slider.jsx";
import StreamModule from "../components/StreamModule.jsx";

function SafeSpace({ email }) {
  useEffect(() => {
    document.title = "Safe Space - OtakuStream";
  }, []);

  return (
    <>
      <NavbarOS />
      <main className="w-full mt-8">
        <div className="flex flex-col justify-center items-center gap-y-2">
          <p className="text-os-white text-4xl">Hey {email}</p>
          <p className="text-os-white text-sm">enjoy your safe space (:</p>
        </div>
        <Slider
          title="Continue Watching..."
          sliderList={[
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
          ]}
        />
        <Slider
          title="Favorites..."
          sliderList={[
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
            <StreamModule
              isMovie={true}
              animeTitle="AnimeTitle"
              streamTitle="MovieTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
            />,
            <StreamModule
              isMovie={false}
              animeTitle="AnimeTitle"
              streamTitle="EpisodeTitle"
              streamImageSrc="/jpeg/Test.jpeg"
              streamDescription="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur"
              dateReleased="05/04/25"
              href="#"
              seasonNum="2"
              episodeNum="7"
            />,
          ]}
        />
      </main>
      <FooterOS />
    </>
  );
}

export default SafeSpace;
