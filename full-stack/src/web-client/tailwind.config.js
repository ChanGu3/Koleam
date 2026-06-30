export default {
    content: [
        "./index.html", // Look for classes in your main HTML file
        "./src/**/*.{js,ts,jsx,tsx}", // Look for classes in all JS/TS/React files in /src
    ],
    theme: {
        extend: {
            colors: {
                "s-white": "var(--color-s-white)",
                "s-primary": "var(--color-s-primary)",
                "s-secondary": "var(--color-s-secondary)",
                "s-tertiary": "var(--color-s-tertiary)",
                "s-dark-primary": "var(--color-s-dark-primary)",
                "s-dark-secondary": "var(--color-s-dark-secondary)",
                "s-dark-tertiary": "var(--color-s-dark-tertiary)",
                "s-link-visited": "var(--color-s-link-visited)",
                "s-error": "var(--color-s-error)",
                "s-success": "var(--color-s-success)",
            },
            boxShadow: {
                // You can name these whatever makes sense for your project
                sharp: "4px 4px 0px 0px rgba(0,0,0,1)",
                "sharp-lg": "8px 8px 0px 0px rgba(0,0,0,1)",
                "sharp-left": "-4px 4px 0px 0px rgba(0,0,0,1)",
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
                "heart-beat-keyframe": {
                    "0%": { opacity: "1", transform: "scale(1)" },
                    "25%": { opacity: "0.75", transform: "scale(1.25)" },
                    "50%": { opacity: "0.5", transform: "scale(1)" },
                    "75%": { opacity: "0.75", transform: "scale(1.25)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
            animation: {
                "fade-in": "fade-in-keyframe 0.8s ease-out forwards",
                "fade-out": "fade-out-keyframe 0.8s ease-in forwards",
                "fill-from-left": "fill-from-left-keyframe 7.5s linear forwards",
                "heart-beat": "heart-beat-keyframe 1.0s ease-in-out infinite",
            },
        },
    },
    plugins: [],
}
