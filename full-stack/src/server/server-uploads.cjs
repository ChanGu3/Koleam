// all files created are located relative to this file

const minimist = require("minimist")
const argv = minimist(process.argv.slice(2))
const isDev = argv.dev === true || argv.d === true

const { Logging, errormsg } = require("./server-logging.cjs")
const path = require("path")
const fs = require("fs").promises

const pathDatabase = path.join(__dirname, "data", "database")

const pathUploads = path.join(__dirname, "data", "uploads")
const pathTitles = path.join(pathUploads, "titles")

const relativePathUpload = path.join("uploads")
const relativePathTitles = path.join(relativePathUpload, "titles")

const hrefPathTitle = "/uploads/titles"

const COVER_FILENAME = "cover.jpg"
const THUMBNAIL_FILENAME = "thumbnail.jpg"

function getTitlePath(relativePath) {
    return path.join(pathTitles, relativePath)
}

function getUploadPath(relativePath) {
    return path.join(pathUploads, relativePath)
}

//
// true or false if found
//
async function doesTitlesPathExist(relativePath = "") {
    try {
        const fullPath = path.join(pathTitles, relativePath)
        await fs.access(fullPath)
        return true
    } catch (err) {
        //Logging.LogWarning(`could not find if path ${dirpath} exists in uploads`);
        return false
    }
}

//
// true or false if found
//
async function doesUploadsPathExist(relativePat = "") {
    try {
        const fullPath = path.join(pathUploads, relativePath)
        await fs.access(fullPath)
        return true
    } catch (err) {
        //Logging.LogWarning(`could not find if path ${dirpath} exists in uploads`);
        return false
    }
}

//
// dirpath should be a path starting from upload so to make a directory in upload called hello just do "test" nested must be path.join("test","child");
//
async function mkDir(relativePath) {
    try {
        if (!(await doesTitlesPathExist(relativePath))) {
            const fullPath = path.join(pathTitles, relativePath)
            await fs.mkdir(fullPath, { recursive: true })
            return relativePath
        }
    } catch (err) {
        Logging.LogError(`could not make directory for ${relativePath} ${err}`)
        throw new Error(`${err}`)
    }
}

//
// rename a directory
//
async function rnDir(prevRelativePath, relativePath) {
    try {
        if (await doesTitlesPathExist(prevRelativePath)) {
            const oldFullPath = path.join(pathTitles, prevRelativePath)
            const newFullPath = path.join(pathTitles, relativePath)
            await fs.rename(oldFullPath, newFullPath)
            return relativePath
        }
    } catch (err) {
        Logging.LogError(`could not rename directory from ${prevRelativePath} to ${relativePath} ${err}`)
        throw new Error(`${err}`)
    }
}

//
// deletes a directory recursively
//
async function recursiveDirDeleteInTitles(relativePath) {
    try {
        if (!relativePath.includes(".") && relativePath.length !== 0 && (await doesTitlesPathExist(relativePath))) {
            const fullpath = path.join(pathTitles, relativePath)
            await fs.rm(fullpath, { recursive: true, force: true })
        } else {
            Logging.LogError(`could not delete path ${relativePath} --- ${err}`)
        }
    } catch (err) {
        Logging.LogError(`could not delete path ${relativePath} --- ${err}`)
        throw new Error(`${err}`)
    }
}

//
// deletes title cover
//
async function deleteTitleFile(relativePath, filename) {
    try {
        if (await doesTitlesPathExist(path.join(relativePath))) {
            const fullPath = path.join(pathTitles, relativePath, filename)
            await fs.rm(fullPath, { force: true })
            return fullPath
        } else {
            return "file does not exist"
        }
    } catch (err) {
        Logging.LogError(`could not delete from relativepath:${relativePath} --- ${err}`)
        throw new Error(`${err}`)
    }
}

//
// uploads title cover
//
async function uploadTitleFile(relativePath, filename, buffer) {
    try {
        if (await doesTitlesPathExist(relativePath)) {
            const fullPath = path.join(pathTitles, relativePath, filename)
            await fs.writeFile(fullPath, buffer, { flush: true })
            return fullPath
        }
    } catch (err) {
        Logging.LogError(`could not upload file to relativepath:${relativePath} --- ${err}`)
        throw new Error(`${err}`)
    }
}

// TODO GENERAL VIDEO FILE UPLOAD FUNCTION SPLITE SECONDS AND SUCH

const uploads = {
    pathDatabase,
    mkDir,
    rnDir,
    relativePathTitles,
    doesTitlesPathExist,
    doesUploadsPathExist,
    recursiveDirDeleteInTitles,
    getUploadPath,
    getTitlePath,
    deleteTitleFile,
    uploadTitleFile,
    hrefPathTitle,
    COVER_FILENAME,
    THUMBNAIL_FILENAME,
}

module.exports.uploads = uploads

if (isDev) {
    const pathDevImages = path.join(__dirname, "dev", "images")

    //
    // Clears the Title Folder in Uploads leaving it empty
    //
    async function clearEntireTitlesFolder() {
        try {
            // safety check to make sure . is not used to delete files outside of the title folder
            if (!pathTitles.includes(".")) {
                if (await doesTitlesPathExist()) {
                    await fs.rm(pathTitles, { recursive: true, force: true })
                    Logging.LogDev(`title folder successfully cleared`)
                }
                await fs.mkdir(pathTitles, { recursive: true })
                Logging.LogDev(`title folder successfully created`)
            } else {
                Logging.LogDev(`could not clear title folder`)
            }
        } catch (err) {
            Logging.LogDev(`could not clear title folder --- ${err}`)
        }
    }

    //
    // ONLY COPIES FROM A SPECIFIC FOLDER IN DEV
    //
    async function copyImageFileToTitlePath(existingFileName, relativePath) {
        try {
            await fs.copyFile(path.join(pathDevImages, existingFileName), path.join(pathTitles, relativePath))
        } catch (err) {
            Logging.LogError(`could not copy file to title path:${relativePath} | ${err}`)
        }
    }

    const uploadsDev = {
        clearEntireTitlesFolder,
        copyImageFileToTitlePath,
    }

    module.exports.uploadsDev = uploadsDev
}
