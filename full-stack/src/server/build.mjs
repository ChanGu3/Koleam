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
    external: ["pg-hstore", "bcrypt", "sqlite3"],
})

async function copAndCleanPackageJsonForProduction() {
    const pkgData = JSON.parse(await fs.readFile(pkgPath, "utf-8"))

    delete pkgData.devDependencies
    delete pkgData.scripts.dev
    delete pkgData.scripts.build
    delete pkgData.scripts.clean
    delete pkgData.scripts.start
    pkgData.scripts.start = "npm i & node server-main.cjs"

    // 3. Write the cleaned JSON back to the file
    await fs.writeFile(pkgBuildPath, JSON.stringify(pkgData, null, 2))
}

await copAndCleanPackageJsonForProduction()
await env.CreateDefaultEnvFile(true)
