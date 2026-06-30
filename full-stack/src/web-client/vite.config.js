import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteStaticCopy } from "vite-plugin-static-copy"
import path from "path"
import { DEV_PORT } from "./dev/constants.js"

const CURRENT_PORT_VIEW = DEV_PORT

const nodeModulesPathSrc = path.resolve(__dirname, "..", "node_modules")

// octopus libass-wasm subtitles
const libasswasmWorkerPathSrc = path.resolve(nodeModulesPathSrc, "libass-wasm", "dist", "js")
const jassubWorkerPathDst = path.join("libasswasm")

const ffmpegWorkerPathSrc = path.resolve(nodeModulesPathSrc, "@ffmpeg", "core", "dist", "esm")
const ffmpegWorkerPathDst = path.join("ffmpegwasm")

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: path.join(libasswasmWorkerPathSrc, "subtitles-octopus-worker.js"),
                    dest: jassubWorkerPathDst,
                    rename: { stripBase: true },
                },
                {
                    src: path.join(libasswasmWorkerPathSrc, "subtitles-octopus-worker-legacy.js"),
                    dest: jassubWorkerPathDst,
                    rename: { stripBase: true },
                },
                {
                    src: path.join(libasswasmWorkerPathSrc, "subtitles-octopus-worker.wasm"),
                    dest: jassubWorkerPathDst,
                    rename: { stripBase: true },
                },
                {
                    src: path.join(ffmpegWorkerPathSrc, "ffmpeg-core.js"),
                    dest: ffmpegWorkerPathDst,
                    rename: { stripBase: true },
                },
                {
                    src: path.join(ffmpegWorkerPathSrc, "ffmpeg-core.wasm"),
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
})
