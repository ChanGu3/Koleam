import { GetSavedColorTheme } from "./src/services/ui-config/ColorTheme.cjs"

const DEFAULT_COLOR_THEME = Object.freeze({
    WHITE: "#F8F8FF",
    PRIMARY: "#87CEEB",
    SECONDARY: "#59CFFF",
    TERTIARY: "#429ABE",
    "DARK-PRIMARY": "#1A1A1A",
    "DARK-SECONDARY": "#777777",
    "DARK-TERTIARY": "#0F0F0F",
    "LINK-VISITED": "#9333EA",
    ERROR: "#BE185D",
})

const savedColorTheme = await GetSavedColorTheme()

const SELECTED_COLOR_THEME = {
    WHITE: !!savedColorTheme ? savedColorTheme.WHITE : DEFAULT_COLOR_THEME.WHITE,
    PRIMARY: !!savedColorTheme ? savedColorTheme.PRIMARY : DEFAULT_COLOR_THEME.PRIMARY,
    SECONDARY: !!savedColorTheme ? savedColorTheme.SECONDARY : DEFAULT_COLOR_THEME.SECONDARY,
    TERTIARY: !!savedColorTheme ? savedColorTheme.TERTIARY : DEFAULT_COLOR_THEME.TERTIARY,
    "DARK-PRIMARY": !!savedColorTheme ? savedColorTheme["DARK-PRIMARY"] : DEFAULT_COLOR_THEME["DARK-PRIMARY"],
    "DARK-SECONDARY": !!savedColorTheme ? savedColorTheme["DARK-SECONDARY"] : DEFAULT_COLOR_THEME["DARK-SECONDARY"],
    "DARK-TERTIARY": !!savedColorTheme ? savedColorTheme["DARK-TERTIARY"] : DEFAULT_COLOR_THEME["DARK-TERTIARY"],
    "LINK-VISITED": !!savedColorTheme ? savedColorTheme["LINK-VISITED"] : DEFAULT_COLOR_THEME["LINK-VISITED"],
    ERROR: !!savedColorTheme ? savedColorTheme.ERROR : DEFAULT_COLOR_THEME.ERROR,
}

export default {
    content: [
        "./index.html", // Look for classes in your main HTML file
        "./src/**/*.{js,ts,jsx,tsx}", // Look for classes in all JS/TS/React files in /src
    ],
    theme: {
        extend: {
            colors: {
                "s-white": SELECTED_COLOR_THEME.WHITE,
                "s-primary": SELECTED_COLOR_THEME.PRIMARY,
                "s-secondary": SELECTED_COLOR_THEME.SECONDARY,
                "s-tertiary": SELECTED_COLOR_THEME.TERTIARY,
                "s-dark-primary": SELECTED_COLOR_THEME["DARK-PRIMARY"],
                "s-dark-secondary": SELECTED_COLOR_THEME["DARK-SECONDARY"],
                "s-dark-tertiary": SELECTED_COLOR_THEME["DARK-TERTIARY"],
                "s-link-visited": SELECTED_COLOR_THEME["LINK-VISITED"],
                "s-error": SELECTED_COLOR_THEME.ERROR,
            },
            backgroundImage: {
                vignette: "radial-gradient(ellipse at center, #00000000 0%, #0F0F0F 100%)",
            },
            keyframes: {
                "fade-in-keyframe": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "fade-out-keyframe": {
                    "0%": { opacity: "1" },
                    "100%": { opacity: "0" },
                },
                "fill-from-left-keyframe": {
                    "0%": { transform: "scaleX(0)" },
                    "100%": { transform: "scaleX(1)" },
                },
            },
            animation: {
                "fade-in": "fade-in-keyframe 0.8s ease-out forwards",
                "fade-out": "fade-out-keyframe 0.8s ease-in forwards",
                "fill-from-left": "fill-from-left-keyframe 7.5s linear forwards",
            },
        },
    },
    plugins: [],
}
