import "../tailwind.css";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavbarOS from "../components/NavbarOS.jsx";
import FooterOS from "../components/FooterOS.jsx";
import ErrorMsg from "../Helpers/errormsg.mjs";
import Validate from "../Helpers/Validations.mjs";

//
// Server Fetch Sign In
//
async function AttemptSignin(email, password, error, homeNavigate) {
  try {
    const response = await fetch("/api/authentify/signin", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      if (response.status === 200) {
        homeNavigate("/");
      }
    } else {
      if (response.status === 400) {
        const data = await response.json();
        error.innerHTML = data.error;
        error.classList.remove("hidden");
      } else {
        error.innerHTML = ErrorMsg.fallback;
        error.classList.remove("hidden");
      }
    }
  } catch (err) {
    error.innerHTML = ErrorMsg.connection;
    error.classList.remove("hidden");
  }
}

function Signin() {
  const email = useRef(null);
  const password = useRef(null);
  const error = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign In - OtakuStream";
  }, []);

  async function ValidateSignin(email) {
    error.current.classList.add("hidden");
    await new Promise((resolve) => setTimeout(resolve, 1000 * 0.25));

    if (!Validate.Email(email)) {
      error.current.innerHTML = ErrorMsg.wrongFormatEmail;
      error.current.classList.remove("hidden");
      return false;
    }

    return true;
  }

  return (
    <>
      <NavbarOS />
      <main className="flex flex-col items-center justify-center mt-20 space-y-20">
        <p className="font-bold text-3xl text-os-blue-primary">Otaku Stream</p>
        <div className="flex flex-col justify-center items-center space-y-6 w-65 md:w-100">
          <div className="flex flex-col items-center space-y-1 w-full">
            <p className="text-os-white font-semibold text-xl">Sign In</p>
            <p className="md:w-[55%] text-center text-os-white font-thin text-sm">
              Enter Your email and password to access your account!
            </p>
          </div>

          {/* Sign In Form */}
          <form
            id="signinForm"
            name="signinForm"
            className="w-full flex flex-col space-y-4 items-center justify-center"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await ValidateSignin(email.current.value)) {
                await AttemptSignin(
                  email.current.value,
                  password.current.value,
                  error.current,
                  navigate,
                );
              }
            }}
            method="post"
          >
            <input
              ref={email}
              id="email"
              name="email"
              autoComplete="email"
              className="w-full border-os-blue-secondary border-2 rounded-sm px-2 py-1 text-os-white placeholder:text-os-white/80  placeholder:font-thin"
              type="text"
              placeholder="Email"
            />
            <input
              ref={password}
              id="password"
              name="password"
              autoComplete="current-password"
              className="w-full border-os-blue-secondary border-2 rounded-sm px-2 py-1 text-os-white placeholder:text-os-white/80  placeholder:font-thin"
              type="password"
              placeholder="Password"
            />
            <button
              className="w-full bg-os-blue-primary hover:bg-os-blue-secondary active:bg-os-blue-tertiary rounded-sm p-1.5 font-semibold cursor-pointer"
              type="submit"
            >
              Sign In
            </button>
          </form>

          {/* Error Catching Placement */}
          <p
            ref={error}
            id="error"
            className="text-os-error-hot-pink font-semibold text-sm hidden"
          ></p>

          <div className="flex flex-row w-full items-center justify-center">
            <div className="w-[10%] mt-0.5 border-b-1 border-os-white"></div>
            <p className="px-2 text-os-dark-secondary text-[10px] md:text-xs">
              don't have an account or need help?
            </p>
            <div className="w-[10%] mt-0.5 border-b-1 border-os-white"></div>
          </div>
          <a
            className="text-os-blue-tertiary hover:text-os-blue-secondary active:text-os-blue-secondary text-sm"
            href="/auth/forgot-password"
          >
            Forgot Password?
          </a>
          <a
            className="text-os-blue-tertiary hover:text-os-blue-secondary active:text-os-blue-secondary text-sm"
            href="/auth/signup"
          >
            Sign Up?
          </a>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default Signin;
