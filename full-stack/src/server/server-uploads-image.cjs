const path = require("path")
const { uploads } = require("./server-uploads.cjs")

//
// deletes title cover
//
async function deleteTitleCover(titleID) {
    return uploads.deleteTitleFile(titleID, uploads.COVER_FILENAME)
}

//
// uploads title cover
//
async function uploadTitleCover(titleID, buffer) {
    return uploads.uploadTitleFile(titleID, uploads.COVER_FILENAME, buffer)
}

//
// deletes title installment stream thumbnail
//
async function deleteTitleInstallmentStreamThumbnail(titleID, installmentID, streamLabel) {
    return uploads.deleteTitleFile(path.join(titleID, installmentID, streamLabel), uploads.THUMBNAIL_FILENAME)
}

//
// uploads title installment stream thumbnail
//
async function uploadTitleInstallmentStreamThumbnail(titleID, installmentID, streamLabel, buffer) {
    return uploads.uploadTitleFile(path.join(titleID, installmentID, streamLabel), uploads.THUMBNAIL_FILENAME, buffer)
}

const uploads_image = {
    deleteTitleCover,
    uploadTitleCover,
    deleteTitleInstallmentStreamThumbnail,
    uploadTitleInstallmentStreamThumbnail,
}

module.exports.uploads_image = uploads_image
