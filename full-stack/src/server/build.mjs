import { build } from "esbuild"
import fs from "fs/promises"
const { env } = await import("./server-environment.cjs")

const pkgPath = "./package.json"
const pkgBuildPath = "../../dist/server/package.json"

await build({
    entryPoints: ["./server-main.cjs"],
    bundle: true,
    platform: "node",
    outfile: "../../dist/server/server-main.cjs",
    external: ["pg-hstore", "bcrypt", "sqlite3", "ffmpeg-static", "ffprobe-static"],
    keepNames: true, // keeps sequelize out of trouble if i want to disable this would just have to switch completely to variables instead of strings
    minify: true,
})

async function copAndCleanPackageJsonForProduction() {
    const pkgData = JSON.parse(await fs.readFile(pkgPath, "utf-8"))

    delete pkgData.devDependencies
    delete pkgData.scripts.dev
    delete pkgData.scripts.build
    delete pkgData.scripts.clean
    delete pkgData.scripts.start
    pkgData.scripts.start = "node server-main.cjs"

    await fs.writeFile(pkgBuildPath, JSON.stringify(pkgData, null, 2))
}

await copAndCleanPackageJsonForProduction()
await env.CreateDefaultEnvFile(true)
