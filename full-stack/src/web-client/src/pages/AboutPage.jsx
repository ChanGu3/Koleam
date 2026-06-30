import "../tailwind.css"
import { useEffect } from "react"
import { COPYRIGHT_NAME } from "../constants.js"
import { Info } from "lucide-react"

function AboutPage() {
    useEffect(() => {
        document.title = "About"
    }, [])

    return (
        <>
            <main className="pt-16 bg-linear-to-b from-s-tertiary/70 to-transparent">
                {/* Title */}
                <div className="mt-8 w-full flex flex-col items-center">
                    <div className="flex flex-row justify-center items-center gap-x-1">
                        <Info className="text-s-white w-6 h-6 md:w-12 md:h-12" />
                        <p className="text-s-white font-bold text-xl md:text-5xl pb-1.5">
                            {COPYRIGHT_NAME}
                            <span className="text-xs md:text-xl font-semibold">/About</span>
                        </p>
                    </div>
                </div>

                <Block
                    label="Our Mission"
                    description={`
                        To bring a simple and clean user friendly experience to the Self-Video-Streaming service 
                        for local networks with possible public setups. We hope to provide a 
                        quality and peformance experience for users who want to stream their media 
                        content across their local network without the hassle of complicated setups 
                        and configurations. Thanks for reading and enjoy streaming your media content!
                        Its still a work in progress but it'll all work out lol.`}
                />
                <Block
                    label="Support"
                    description={`For any help with using the service, please refer to our GitHub repository's README for guides and troubleshooting. If you still need help, please contact us as soon as possible so we can get back to you!`}
                />
                <Block
                    label="Contributing"
                    description={`
                        Pease feel free to create an issue on the repository and mention your working on something and the details of what your changing. Once you do create a pull request on our GitHub repository! Make sure you create that issue first as a notice that a pull request is being made. We welcome any contributions, whether it's bug fixes, new features, or documentation improvements. Make sure that each pull requests are as simple specific as possible for an easy review and merge. Warning your work may be rejected regardless of time put in this is why issues are important as to give us time to respond to your work before you waste your time gettings started on something we may not want or need. Let's work together to make this project even better!`}
                />
                <Block
                    label="Contact Us"
                    description={`
                        If you have any questions or concerns, please feel free to create an issue on our GitHub repository`}
                />
            </main>
        </>
    )
}

function Block({ label, description }) {
    return (
        <div className="mt-8 w-full flex flex-col items-center">
            <div className="w-[80%] md:w-180 bg-s-dark-primary rounded-xs shadow-lg shadow-black inset-ring-3 inset-ring-s-dark-secondary px-3 py-2">
                <div className="w-full flex flex-col">
                    <p className="text-s-secondary font-semibold md:text-lg my-0.5 md:my-1">{label}</p>
                    <p className="text-s-white font-semibold text-xs md:text-sm my-1">{description}</p>
                </div>
            </div>
        </div>
    )
}

export default AboutPage
