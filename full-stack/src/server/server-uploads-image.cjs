const path = require("path")

//
// deletes title cover
//
async function deleteTitleCover(titleID) {
    return deleteTitleFile(titleID, COVER_FILENAME)
}

//
// uploads title cover
//
async function uploadTitleCover(titleID, buffer) {
    return uploadTitleFile(titleID, COVER_FILENAME, buffer)
}

//
// deletes title installment stream thumbnail
//
async function deleteTitleInstallmentStreamThumbnail(titleID, installmentID, streamLabel) {
    return deleteTitleFile(path.join(titleID, installmentID, streamLabel), THUMBNAIL_FILENAME)
}

//
// uploads title installment stream thumbnail
//
async function uploadTitleInstallmentStreamThumbnail(titleID, installmentID, streamLabel, buffer) {
    return uploadTitleFile(path.join(titleID, installmentID, streamLabel), THUMBNAIL_FILENAME, buffer)
}

const uploads_image = {
    deleteTitleCover,
    uploadTitleCover,
    deleteTitleInstallmentStreamThumbnail,
    uploadTitleInstallmentStreamThumbnail,
}

module.exports.uploads_image = uploads_image
