import "../../tailwind.css";
import { useEffect } from "react";
import NavbarOS from "../../components/NavbarOS.jsx";
import FooterOS from "../../components/FooterOS.jsx";

function SignupSuccess() {
  useEffect(() => {
    document.title = "Sign-Up-Success - OtakuStream";
  }, []);

  return (
    <>
      <NavbarOS />
      <main className="flex flex-col items-center justify-center mt-20 space-y-20">
        <p className="font-bold text-3xl text-os-blue-primary">Otaku Stream</p>
        <div className="flex flex-col justify-center items-center space-y-6 w-65 md:w-100">
          <p className="text-center text-os-blue-tertiary font-bold text-lg md:text-2xl">
            Account Created Successfully!
          </p>

          <div className="flex flex-col items-center space-y-1 w-full">
            <p className="text-os-white font-semibold text-md md:text-lg">
              Join Us As A Premium Member!
            </p>
            <p className="md:w-[65%] text-center text-os-white  font-thin text-xs md:text-sm">
              Watch anime interrupted! ad free!!!
            </p>
          </div>

          <a
            className="w-full bg-os-blue-primary hover:bg-os-blue-secondary active:bg-os-blue-tertiary rounded-sm p-1.5 font-semibold text-center"
            href="/settings/membership"
          >
            Go Premium?
          </a>
          <a
            className="w-full bg-os-blue-primary hover:bg-os-blue-secondary active:bg-os-blue-tertiary rounded-sm p-1.5 font-semibold text-center"
            href="/"
          >
            Skip
          </a>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default SignupSuccess;
