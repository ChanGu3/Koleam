// TODO: CATEGORY PAGE FOR TONS OF CATEGORIES

import "../tailwind.css"
import { useEffect } from "react"
import NavbarOS from "../components/NavbarOS.jsx"
import FooterOS from "../components/FooterOS.jsx"
import CategoryModule from "../components/CategoryModule.jsx"

function Categories({ typeTitle, categoryList }) {
    useEffect(() => {
        document.title = `${typeTitle} - OtakuStream`
    }, [])

    return (
        <>
            <NavbarOS />
            <main className="w-full mt-8 flex flex-col items-center gap-8 md:gap-16">
                <p className="w-full text-os-blue-primary text-xl md:text-5xl font-bold text-center">{typeTitle}!</p>
                <div className="flex flex-col justify-center">
                    <div className="my-2 grid grid-flow-row grid-cols-2 md:grid-cols-3 gap-x-8 md:gap-x-22 gap-y-8 md:gap-y-16">
                        <CategoryModule
                            title="Slice Of Life"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                        <CategoryModule
                            title="CategoryName"
                            imageSrc="/jpeg/Test.jpeg"
                            href="#"
                        />
                    </div>
                </div>
            </main>
            <FooterOS />
        </>
    )
}

export default Categories
