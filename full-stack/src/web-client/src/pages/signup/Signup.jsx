import "../../tailwind.css";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavbarOS from "../../components/NavbarOS.jsx";
import FooterOS from "../../components/FooterOS.jsx";
import ErrorMsg from "../../Helpers/errormsg.mjs";
import Validate from "../../Helpers/Validations.mjs";

//
// Server Fetch Sign In
//
async function AttemptSignUp(email, password, errorRef, navigate) {
  try {
    const response = await fetch("/api/authentify/signup", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      if (response.status === 200) {
        navigate("/auth/signup/success");
      }
    } else {
      if (response.status === 502 || response.status === 400) {
        const data = await response.json();
        errorRef.current.innerHTML = data.error;
      } else {
        errorRef.current.innerHTML = ErrorMsg.fallback;
      }
    }
  } catch (err) {
    errorRef.current.innerHTML = ErrorMsg.connection;
  }
}

function Signup() {
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordAgainRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    document.title = "Sign Up - OtakuStream";
  }, []);

  async function ValidateSignUp() {
    errorRef.current.innerHTML = "";
    await new Promise((resolve) => setTimeout(resolve, 1000 * 0.25));

    if (!Validate.Email(emailRef.current.value)) {
      errorRef.current.innerHTML = ErrorMsg.wrongFormatEmail;
      return false;
    }

    if (
      !Validate.PasswordLength(passwordRef.current.value) &&
      !Validate.PasswordLength(passwordAgainRef.current.value)
    ) {
      errorRef.current.innerHTML = ErrorMsg.passwordWrongLength;
      return false;
    }

    if (passwordRef.current.value !== passwordAgainRef.current.value) {
      errorRef.current.innerHTML = ErrorMsg.passwordDontMatch;
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
            <p className="text-os-white font-semibold text-xl">
              Create An Account
            </p>
            <p className="md:w-[65%] text-center text-os-white font-thin text-sm">
              Enter your email and create a password by typing it in twice to
              sign up as a Otaku Stream Member!
            </p>
          </div>
          <form
            id="signinForm"
            name="signinForm"
            className="w-full flex flex-col space-y-4 items-center justify-center"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await ValidateSignUp()) {
                AttemptSignUp(
                  emailRef.current.value,
                  passwordRef.current.value,
                  errorRef,
                  navigate,
                );
              }
            }}
            method="post"
          >
            <input
              ref={emailRef}
              id="email"
              name="email"
              autoComplete="email"
              className="w-full border-os-blue-tertiary border-2 rounded-sm px-2 py-1 text-os-white placeholder:text-os-white/80  placeholder:font-thin"
              type="text"
              placeholder="Email"
            />
            <input
              ref={passwordRef}
              id="password"
              name="password"
              autoComplete="new-password"
              className="w-full border-os-blue-tertiary border-2 rounded-sm px-2 py-1 text-os-white placeholder:text-os-white/80 placeholder:font-thin"
              type="password"
              placeholder="Password"
            />
            <input
              ref={passwordAgainRef}
              id="passwordagain"
              name="passwordagain"
              autoComplete="new-password"
              className="w-full border-os-blue-tertiary border-2 rounded-sm px-2 py-1 text-os-white placeholder:text-os-white/80  placeholder:font-thin"
              type="password"
              placeholder="Password Again"
            />
            <button
              className="w-full bg-os-blue-primary hover:bg-os-blue-tertiary active:bg-os-blue-secondary rounded-sm p-1.5 font-semibold cursor-pointer"
              type="submit"
            >
              Sign Up
            </button>
          </form>

          {/* Error Catching Placement */}
          <p
            ref={errorRef}
            id="error"
            className="text-os-error-hot-pink font-semibold text-sm"
          ></p>

          <div className="flex flex-row w-full items-center justify-center">
            <div className="w-[10%] mt-0.5 border-b-1 border-os-white"></div>
            <p className="px-2 text-os-dark-secondary text-xs">
              already have an account?
            </p>
            <div className="w-[10%] mt-0.5 border-b-1 border-os-white"></div>
          </div>
          <a
            className="text-os-blue-secondary hover:text-os-blue-tertiary active:text-os-blue-tertiary text-sm"
            href="/auth/signin"
          >
            Sign In?
          </a>
          <p
            className="md:w-[70%] text-xs text-center text-os-white "
            href="/auth/signin"
          >
            By clicking Sign up, you agree to our{" "}
            <a
              className="text-os-dark-secondary hover:underline cursor-pointer"
              href="#"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="text-os-dark-secondary hover:underline cursor-pointer"
              href="#"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default Signup;
