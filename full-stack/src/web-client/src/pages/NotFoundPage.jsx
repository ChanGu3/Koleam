import "../tailwind.css"
import { useEffect } from "react"
import { TriangleAlert } from "lucide-react"
import { FULL_ROUTES } from "../constants"
import { Link } from "react-router-dom"

function NotFoundPage() {
    useEffect(() => {
        document.title = "404 - Not Found"
    }, [])

    return (
        <>
            <main className="mt-32 w-full flex flex-col items-center">
                <div className="min-w-65 flex flex-col md:flex-row justify-center items-center gap-x-8">
                    <div className="flex flex-col items-center">
                        <TriangleAlert className="w-8 h-8 md:w-32 md:h-32 animate-bounce flex items-center justify-center text-s-tertiary text-xs md:text-3xl font-semibold select-none" />
                    </div>
                    <div className="md:mb-4 flex flex-col justify-between">
                        <div className="py-4">
                            <p className="text-s-white font-bold text-center text-sm md:text-2xl select-none">404 Not Found</p>
                            <p className="text-s-dark-secondary font-semibold text-center text-xs md:text-lg select-none">you are now lost...</p>
                        </div>
                        <Link
                            className="w-full flex justify-center mb-2 md:mb-8"
                            to={{ pathname: FULL_ROUTES.HOME }}
                        >
                            <div className="bg-s-tertiary hover:bg-s-tertiary/80 active:bg-s-tertiary/60 rounded-xs p-2 inset-ring-2 inset-ring-s-white font-semibold text-sm md:text-lg text-center text-s-white select-none">
                                Go Home!
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </>
    )
}

export default NotFoundPage
