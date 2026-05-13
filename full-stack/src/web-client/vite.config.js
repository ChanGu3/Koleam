import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const PORT = 3000

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                target: `http://localhost:${PORT}`, // Allows Express backend Path /api
                changeOrigin: true,
                secure: false,
            },
            "/dev": {
                target: `http://localhost:${PORT}`, // Allows Express backend Path /dev
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        // Relative to the project root
        outDir: "../../dist/web-client",

        // Optional: If you want to empty the folder before building
        // (Vite does this by default if the folder is inside your project root)
        emptyOutDir: true,
    },
})
