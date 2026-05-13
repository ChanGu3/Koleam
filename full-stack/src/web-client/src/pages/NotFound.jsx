import "../tailwind.css";
import { useEffect } from "react";
import NavbarOS from "../components/NavbarOS.jsx";
import FooterOS from "../components/FooterOS.jsx";

function NotFound() {
  useEffect(() => {
    document.title = "404 - OtakuStream";
  }, []);

  return (
    <>
      <NavbarOS />
      <main className="mt-32 w-full flex flex-col items-center">
        <div className="min-w-65 flex flex-row justify-center gap-x-8">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 md:w-12 md:h-12 animate-bounce bg-os-blue-tertiary inset-ring inset-ring-os-white rounded-full flex items-center justify-center text-os-white text-xs md:text-3xl font-semibold select-none">
              ?
            </div>
            <img
              src={"/png/brand-tv-logo.png"}
              className="w-24 h-24 md:w-64 md:h-64 pointer-events-none select-none"
            ></img>
          </div>
          <div className="mt-6 md:mt-36 flex flex-col justify-between">
            <div className="">
              <p className="text-os-white font-bold text-center text-sm md:text-2xl select-none">
                404 Not Found
              </p>
              <p className="text-os-dark-secondary font-semibold text-xs md:text-lg select-none">
                where are you going?
              </p>
            </div>
            <a className="w-full flex justify-center mb-2 md:mb-8" href="/">
              <div className="bg-os-blue-tertiary hover:bg-os-blue-tertiary/80 active:bg-os-blue-tertiary/60 rounded-xs p-2 inset-ring-2 inset-ring-os-white font-semibold text-sm md:text-lg text-center text-os-white select-none">
                Go Home!
              </div>
            </a>
          </div>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default NotFound;
