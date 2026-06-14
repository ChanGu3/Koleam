import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const PUBLIC_PORT = 5775
const LOCAL_PORT = 5776

const CURRENT_PORT_VIEW = LOCAL_PORT

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Exposes the server to your local network
        proxy: {
            "/api": {
                target: `http://localhost:${CURRENT_PORT_VIEW}`,
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
