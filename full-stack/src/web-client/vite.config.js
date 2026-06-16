import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteStaticCopy } from "vite-plugin-static-copy"
import path from "path"

const PUBLIC_PORT = 5775
const LOCAL_PORT = 5776

const CURRENT_PORT_VIEW = LOCAL_PORT

const jassubWorkerPathSrc = path.resolve(__dirname, "..", "node_modules", "jassub", "dist", "wasm")
const jassubWorkerPathDst = path.join("jassub")

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(),
        viteStaticCopy({
            targets: [
                {
                    src: path.join(jassubWorkerPathSrc, "jassub-worker.wasm"),
                    dest: jassubWorkerPathDst,
                    rename: { stripBase: true }
                },
                {
                    src: path.join(jassubWorkerPathSrc, "jassub-worker.js"),
                    dest: jassubWorkerPathDst, 
                    rename: { stripBase: true }
                },
                {
                    src: path.join(jassubWorkerPathSrc, "jassub-worker-modern.wasm"),
                    dest: jassubWorkerPathDst,
                    rename: { stripBase: true }
                },
                {
                    src: "TODO.md",
                    dest: "jassub"
                }

            ],
        })
    ],
    server: {
        host: true, // Exposes the server to your local network
        fs: {
            allow: [".."]
        },
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
        outDir: path.resolve(__dirname, "..", "..", "dist", "web-client"),

        // Optional: If you want to empty the folder before building
        // (Vite does this by default if the folder is inside your project root)
        emptyOutDir: true,
    },
})
