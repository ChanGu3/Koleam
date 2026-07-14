import { defineConfig, normalizePath } from "vite"
import react from "@vitejs/plugin-react"
import { viteStaticCopy } from "vite-plugin-static-copy"
import path from "path"
import { DEFAULT_PORTS } from "../shared/PORTS.js"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nodeModulesPathSrc = path.resolve(__dirname, "..", "node_modules")

// octopus libass-wasm subtitles
const libasswasmWorkerPathSrc = path.resolve(nodeModulesPathSrc, "libass-wasm", "dist", "js")
const jassubWorkerPathDst = "libasswasm"

// ffmpeg probe extracting stream data from media files
const ffmpegWorkerPathSrc = path.resolve(nodeModulesPathSrc, "@ffmpeg", "core", "dist", "esm")
const ffmpegWorkerPathDst = "ffmpegwasm"

export default defineConfig(({ mode }) => {
    const isAdminView = mode === "admin"
    const CURRENT_PORT_VIEW = isAdminView ? DEFAULT_PORTS.LOCAL_PORT : DEFAULT_PORTS.PUBLIC_PORT

    return {
        define: {
            __IS_DEV__: true,
            __IS_ADMIN_VIEW__: mode === "admin",
        },
        plugins: [
            react(),
            viteStaticCopy({
                targets: [
                    {
                        src: normalizePath(path.join(libasswasmWorkerPathSrc, "subtitles-octopus-worker.js")),
                        dest: jassubWorkerPathDst,
                        rename: { stripBase: true },
                    },
                    {
                        src: normalizePath(path.join(libasswasmWorkerPathSrc, "subtitles-octopus-worker-legacy.js")),
                        dest: jassubWorkerPathDst,
                        rename: { stripBase: true },
                    },
                    {
                        src: normalizePath(path.join(libasswasmWorkerPathSrc, "subtitles-octopus-worker.wasm")),
                        dest: jassubWorkerPathDst,
                        rename: { stripBase: true },
                    },
                    {
                        src: normalizePath(path.join(ffmpegWorkerPathSrc, "ffmpeg-core.js")),
                        dest: ffmpegWorkerPathDst,
                        rename: { stripBase: true },
                    },
                    {
                        src: normalizePath(path.join(ffmpegWorkerPathSrc, "ffmpeg-core.wasm")),
                        dest: ffmpegWorkerPathDst,
                        rename: { stripBase: true },
                    },
                ],
            }),
        ],
        optimizeDeps: {
            exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util", "@ffmpeg/core"],
        },
        server: {
            host: false, // Exposes the server to your local network
            fs: {
                allow: [".."],
            },
            proxy: {
                "/api": {
                    target: `http://localhost:${CURRENT_PORT_VIEW}`,
                    changeOrigin: true,
                    secure: false,
                },
            },
            headers: {
                "Cross-Origin-Opener-Policy": "same-origin",
                "Cross-Origin-Embedder-Policy": "require-corp",
            },
        },
        build: {
            // Relative to the project root
            outDir: path.resolve(__dirname, "..", "..", "dist", "web-client"),
            emptyOutDir: true,
        },
    }
})
