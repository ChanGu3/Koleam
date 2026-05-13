import "../tailwind.css";
import { useEffect } from "react";
import NavbarOS from "../components/NavbarOS.jsx";
import FooterOS from "../components/FooterOS.jsx";

function About() {
  useEffect(() => {
    document.title = "About - OtakuStream";
  }, []);

  return (
    <>
      <NavbarOS />
      <main className="bg-linear-to-b from-os-blue-tertiary/70 to-transparent">
        {/* Title */}
        <div className="mt-8 w-full flex flex-col items-center">
          <a className="flex flex-row items-center gap-x-1" href="/">
            <img
              src={"/png/brand-tv-logo.png"}
              className="w-10 h-10 md:w-16 md:h-16"
            ></img>
            <p className="text-os-white font-bold text-xl md:text-5xl pb-1.5">
              OtakuStream
              <span className="text-xs md:text-xl font-semibold">/About</span>
            </p>
          </a>
        </div>

        <div className="mt-8 w-full flex flex-col items-center">
          <div className="w-[80%] md:w-180 bg-os-dark-tertiary rounded-xs shadow-lg shadow-black inset-ring-3 inset-ring-os-dark-secondary px-3 py-2">
            <div className="w-full flex flex-col">
              <p className="text-os-blue-secondary font-semibold md:text-lg my-0.5 md:my-1">
                Our Mission!
              </p>
              <p className="text-os-white font-semibold text-xs md:text-sm my-1">
                We are Otaku Stream! We want to provide anime to as many people
                as possible. This dream can be achieved in many ways but we
                chose a more ad friendly approach. We are people who love anime
                just as much as you and want it to be a easier and a more cozier
                experience. Remove the nuance and bring in the anime charm
                everyone loves. Can’t wait to see what you discover in our
                catalog!
              </p>
            </div>
          </div>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default About;
