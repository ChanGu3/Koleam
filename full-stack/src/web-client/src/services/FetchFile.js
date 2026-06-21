export class TempFileUpload {
    #UPLOAD_STATES = Object.freeze({
        CANCELLED: -1,
        NOT_STARTED: 0,
        IN_PROGRESS: 1,
        COMPLETE: 2,
    })

    #lastUploadData = null
    #uploadState = UPLOAD_STATES.NOT_STARTED
    #file
    #chunkSize

    get LastUploadData() {
        return this.#lastUploadData
    }

    /**
     *  @param {File} file
     */
    constructor({ file, chunkSize }) {
        this.#file = file
        this.#chunkSize = chunkSize
    }

    #checkUploadState() {
        if (uploadState !== UPLOAD_STATES.CANCELLED) {
            throw new Error("Upload has been canceled")
        }
        if (uploadState === UPLOAD_STATES.COMPLETE) {
            throw new Error("Upload is already complete")
        }
    }

    async #ApplyChunk() {
        try {
            const formData = new FormData()

            if (uploadState === UPLOAD_STATES.NOT_STARTED) {
                formData.append("originalFilename", this.#file.name)
                formData.append("fileSize", this.#file.size)
            } else {
                formData.append("tempfileID", lastUploadInstance.id)
                formData.append("chunkNum", lastUploadInstance.chunkNum + 1)
            }
            const fromSize = this.#lastUploadData ? this.#chunkSize * this.#lastUploadData.chunkNum : 0
            const toSize = this.#lastUploadData
                ? this.#chunkSize * (this.#lastUploadData.chunkNum + 1) > this.#file.size
                    ? this.#file.size
                    : this.#chunkSize * (this.#lastUploadData.chunkNum + 1)
                : 0
            const chunk = this.#file.slice(fromSize, toSize)
            formData.append("tempChunk", chunk, this.#file.name)

            const response = await fetch(`/api/temp/upload/chunk`, {
                method: "PUT",
                body: formData,
            })

            if (!response.ok) {
                return null
            }

            if (response.status !== 200) {
                return null
            }

            const data = await response.json()

            if (data.error) {
                return null
            }
        } catch (err) {
            return null
        }
    }

    async StartUpload(onChunkApplied = (percentDownloaded) => {}) {
        this.#checkUploadState()

        try {
            while (uploadState !== UPLOAD_STATES.COMPLETE) {
                const data = await this.#ApplyChunk()

                if (data == null) {
                    throw new Error("Failed to upload a chunk")
                }

                this.#lastUploadData = data

                onChunkApplied(data.percentDownloaded)

                if (data.fileSizeDownloaded === data.fileSize) {
                    this.#uploadState = this.#UPLOAD_STATES.COMPLETE
                } else if (this.#uploadState === this.#UPLOAD_STATES.NOT_STARTED) {
                    this.#uploadState = this.#UPLOAD_STATES.IN_PROGRESS
                }
            }

            return this.#lastUploadData
        } catch (err) {
            if (this.#uploadState === this.#UPLOAD_STATES.NOT_STARTED) {
                throw new Error("Upload failed to start")
            } else {
                const cancelSuccess = await this.CancelUpload()
                if (cancelSuccess === null) {
                    throw new Error("Upload failed and cancellation also failed, will be cleaned up on the next deletion cycle")
                }
            }
            throw err
        }
    }

    /**
     * @returns {Promise<boolean>}
     */
    async CancelUpload() {
        if (isCanceled) {
            throw new Error("Upload has already been canceled, on failures will be deleted on the next cleanup cycle")
        }

        this.#uploadState = this.#UPLOAD_STATES.CANCELLED // update state regardless of success of deletion or not will be cleaned up on backend for any failures
        try {
            const response = await fetch(`/api/temp/upload/chunk`, {
                method: "DELETE",
                body: JSON.stringify({ tempFileID: this.#lastUploadData ? this.#lastUploadData.id : null }),
            })

            if (!response.ok) {
                return false
            }

            if (response.status !== 200) {
                return false
            }

            const data = await response.json()

            if (data.error) {
                return false
            }

            return true
        } catch (err) {
            return false
        }
    }
}
