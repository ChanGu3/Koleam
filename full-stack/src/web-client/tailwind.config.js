export default {
  content: [
    "./index.html", // Look for classes in your main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Look for classes in all JS/TS/React files in /src
  ],
  theme: {
    extend: {
      colors: {
        koleam: "",
        "os-white": "#F8F8FF",
        "os-blue-primary": "#87CEEB",
        "os-blue-secondary": "#59CFFF",
        "os-blue-tertiary": "#429ABE",
        "os-dark-primary": "#1A1A1A",
        "os-dark-secondary": "#777777",
        "os-dark-tertiary": "#0F0F0F",
        "os-visited-purple": "#9333EA",
        "os-error-hot-pink": "#BE185D",
      },
      backgroundImage: {
        koleam: "",
        "os-vignette":
          "radial-gradient(ellipse at center, #00000000 0%, #0F0F0F 100%)",
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
};
