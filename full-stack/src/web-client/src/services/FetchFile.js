import { ERROR_MESSAGES } from "../../../shared/log-messages.js"

export class TempFileUpload {
    static #UPLOAD_STATES = Object.freeze({
        CANCELLED: -1,
        NOT_STARTED: 0,
        IN_PROGRESS: 1,
        COMPLETE: 2,
    })

    #lastUploadData = null
    #uploadState = TempFileUpload.#UPLOAD_STATES.NOT_STARTED
    #file
    #chunkSize

    #firstUploadResolve
    #firstUpload = new Promise((resolve) => {
        this.#firstUploadResolve = resolve
    })

    get LastUploadData() {
        return this.#lastUploadData
    }

    /**
     *  @param {File} file
     */
    constructor(file, chunkSize) {
        this.#file = file
        this.#chunkSize = chunkSize
    }

    #checkUploadState() {
        if (this.#uploadState === TempFileUpload.#UPLOAD_STATES.CANCELLED) {
            throw new Error("Upload has been canceled")
        }
        if (this.#uploadState === TempFileUpload.#UPLOAD_STATES.COMPLETE) {
            throw new Error("Upload is already complete")
        }
    }

    async #ApplyChunk() {
        try {
            const formData = new FormData()

            if (this.#uploadState === TempFileUpload.#UPLOAD_STATES.IN_PROGRESS) {
                formData.append("chunkData", JSON.stringify({ tempfileID: this.#lastUploadData.id, chunkNum: this.#lastUploadData.chunkNum + 1 }))
                const fromSize = this.#chunkSize * this.#lastUploadData.chunkNum
                const toSize = this.#lastUploadData
                    ? this.#chunkSize * (this.#lastUploadData.chunkNum + 1) > this.#file.size
                        ? this.#file.size
                        : this.#chunkSize * (this.#lastUploadData.chunkNum + 1)
                    : this.#chunkSize
                const chunk = this.#file.slice(fromSize, toSize)
                formData.append("tempChunk", chunk, this.#file.name)
            } else {
                formData.append("fileData", JSON.stringify({ originalFilename: this.#file.name, fileSize: this.#file.size, bufferSizeHandshake: this.#chunkSize }))
            }

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

            return data
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async StartUpload(onChunkApplied = (percentDownloaded) => {}) {
        this.#checkUploadState()

        try {
            while (this.#uploadState !== TempFileUpload.#UPLOAD_STATES.COMPLETE) {
                const data = await this.#ApplyChunk()

                if (this.#uploadState === TempFileUpload.#UPLOAD_STATES.NOT_STARTED) {
                    this.#firstUploadResolve()
                }

                if (data == null) {
                    throw new Error("Failed to upload a chunk")
                }

                if (data.data) {
                    this.#lastUploadData = data.data
                }

                if (this.#lastUploadData && this.#lastUploadData.percentDownloaded) {
                    onChunkApplied(this.#lastUploadData.percentDownloaded)
                }

                if (this.#lastUploadData.fileSizeDownloaded >= this.#lastUploadData.fileSize) {
                    this.#uploadState = TempFileUpload.#UPLOAD_STATES.COMPLETE
                } else if (this.#uploadState === TempFileUpload.#UPLOAD_STATES.NOT_STARTED) {
                    this.#uploadState = TempFileUpload.#UPLOAD_STATES.IN_PROGRESS
                }
            }

            return this.#lastUploadData
        } catch (err) {
            if (this.#uploadState === TempFileUpload.#UPLOAD_STATES.NOT_STARTED) {
                throw new Error("Upload failed to start")
            } else {
                await this.CancelUpload()
            }
            throw err
        }
    }

    /**
     * @returns {Promise<boolean>}
     */
    async CancelUpload({ force = true } = {}) {
        await this.#firstUpload // wait for the first upload to complete before attempting to cancel, if it hasn't completed yet

        if (this.#uploadState === TempFileUpload.#UPLOAD_STATES.NOT_STARTED) {
            console.warn("Upload has not started yet, nothing to cancel")
        }

        if (!force && this.#uploadState === TempFileUpload.#UPLOAD_STATES.COMPLETE) {
            throw new Error("Upload has been completed, if you still want to delete the file after completion, set force to true")
        }

        if (this.#uploadState === TempFileUpload.#UPLOAD_STATES.CANCELLED) {
            throw new Error("Upload has already been canceled, on failures will be deleted on the next cleanup cycle")
        }

        this.#uploadState = TempFileUpload.#UPLOAD_STATES.CANCELLED // update state regardless of success of deletion or not will be cleaned up on backend for any failures
        let data = null
        try {
            const response = await fetch(`/api/temp/upload/chunk`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempfileID: this.#lastUploadData.id }),
            })

            data = await response.json()
        } catch (err) {
            throw Error(ERROR_MESSAGES.SHARED.unexpected)
        }

        if (data && data.error) {
            throw Error(data.error)
        }

        return data
    }
}
