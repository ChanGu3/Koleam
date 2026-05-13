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
async function deleteTitleInstallmentStreamThumbnail(titleID, installmentID, streamID) {
    return deleteTitleFile(path.join(titleID, installmentID, streamID), THUMBNAIL_FILENAME)
}

//
// uploads title installment stream thumbnail
//
async function uploadTitleInstallmentStreamThumbnail(titleID, installmentID, streamID, buffer) {
    return uploadTitleFile(path.join(titleID, installmentID, streamID), THUMBNAIL_FILENAME, buffer)
}

const uploads_image = {
    deleteTitleCover,
    uploadTitleCover,
    deleteTitleInstallmentStreamThumbnail,
    uploadTitleInstallmentStreamThumbnail,
}

module.exports.uploads_image = uploads_image
