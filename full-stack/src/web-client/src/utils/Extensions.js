function ValidateFileExtension(fileName = "", allowedExtensions = []) {
    const fileExtension = fileName.split(".").pop().toLowerCase()
    return allowedExtensions.includes(fileExtension)
}

export { ValidateFileExtension }
