import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import "./ForgotPassword.css"

// TODO: Make this only when i do the email provider setup on the backend which probably wont come for the first release adn if not setup anyways would need a
// other reliable way to reset password maybe using known things about self idk anyways... lost password = good luck! lol

function ForgotPassword() {
    useEffect(() => {
        document.title = "Forgot Password - OtakuStream"
    }, [])

    return (
        <main className="main-fp">
            <div className="main-container">
                <header className="text-center">
                    <h1 className="stream-title">Otaku Stream</h1>
                </header>

                <div className="form-container">
                    <h2 className="card-title text-center">Forgot Password</h2>
                    <p className="card-subtitle text-center">Enter your email address and we'll send you a reset link</p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            console.log("Reset link requested!")
                        }}
                    >
                        <div className="mb-3">
                            <label
                                htmlFor="email"
                                className="form-label"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Enter your email address"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-custom w-100"
                        >
                            Send Reset Link
                        </button>
                    </form>

                    <hr />

                    <div className="text-center">
                        <Link
                            to="/auth/signin"
                            className="back-link"
                        >
                            &larr; Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ForgotPassword
