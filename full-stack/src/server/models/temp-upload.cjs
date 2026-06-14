const { DataTypes, Op } = require("sequelize")
const cron = require("node-cron")
const { Logging, errormsg } = require("../server-logging.cjs")
const { ModelExtension } = require("./model-extension.cjs")
const { uploads } = require("../server-uploads.cjs")
const path = require("path")

class TempUpload extends ModelExtension {
    static GetNewExpDate() {
        newDate = new Date()
        newDate.setDate(newDate.getDate() + 1)
        newDate.setHours(0, 0, 0, 0)
        return newDate
    }

    static GetExtension(filename) {
        return path.extname(filename).toLowerCase()
    }

    static GetFilename(id, extension) {
        if (!extension || (extension && extension == "")) {
            return `${id}`
        }

        return `${id}.${extension}`
    }

    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TempUpload.init(
            {
                id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    primaryKey: true,
                },
                originalFilename: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                fileSize: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                fileSizeDownloaded: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                chunkSize: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                chunkNum: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                expDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: `${TempUpload.name}`,
            }
        )

        cron.schedule("0 0 * * *", async () => {
            const expiredUploads = await TempUpload.GetAllExpired()

            for (const upload of expiredUploads) {
                try {
                    await TempUpload.RemoveByID(upload.id)
                } catch (err) {
                    Logging.LogError(`Could not remove expired upload with id ${upload.id} --- ${err}`)
                }
            }

            Logging.LogProcess(`Purged All Uploads Past 24 HR upload window ${dateNow}`)
        })
        return
    }

    static async #Exists(id) {
        const instance = await TempUpload.findByPk(id)
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: session
    //
    static AddToDB(originalFilename, fileSize, chunkSize) {
        return new Promise(async (resolve, reject) => {
            try {
                const newSession = TempUpload.build({
                    originalFilename: originalFilename,
                    fileSize: fileSize,
                    fileSizeDownloaded: 0,
                    chunkSize: chunkSize,
                    chunkNum: 0,
                    expDate: TempUpload.GetNewExpDate(),
                })

                newSession.validate()

                newSession.save()

                resolve(newSession)
            } catch (err) {
                Logging.LogError(`Could not build temp upload for ${originalFilename} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> TempUpload[]: all expired uploads
    //
    static GetAllExpired() {
        return new Promise(async (resolve, reject) => {
            try {
                const expiredUploads = await TempUpload.findAll({
                    where: {
                        expDate: {
                            [Op.lt]: new Date(),
                        },
                    },
                })

                resolve(expiredUploads)
            } catch (err) {
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: TempUpload
    //
    //
    static GetByID(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const upload = await TempUpload.findByPk(id)

                if (upload) {
                    resolve(upload)
                } else {
                    reject(new Error(errormsg.uploadDoesNotExist))
                }
            } catch (err) {
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: TempUpload with updated chunk info
    //
    static ApplyChunkToDB(id, buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!TempUpload.#Exists(id)) {
                    reject(new Error(`temp upload with id ${id} does not exist`))
                }

                const instance = await TempUpload.GetByID(id)

                if (instance.fileSizeDownloaded === instance.fileSize) {
                    reject(new Error(`upload with id ${id} has already been fully uploaded`))
                }

                if (buffer.length != instance.chunkSize && instance.fileSizeDownloaded + buffer.length != instance.fileSize) {
                    reject(new Error(`the expected chunck size is ${instance.chunkSize} but received ${buffer.length}`))
                }

                uploads.temp.uploadChuckToTempFile(uploads.temp.GetFilename(instance.id, TempUpload.GetExtension(instance.originalFilename)), buffer)

                instance.fileSizeDownloaded += buffer.length
                instance.chunkNum += 1
                instance.expDate = TempUpload.GetNewExpDate()

                await upload.save()

                resolve(instance)
            } catch (err) {
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveByID(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const instance = await GetByID(id)
                await uploads.temp.deleteTempFile(TempUpload.GetFilename(instance.id, TempUpload.GetExtension(instance.originalFilename)))
                await TempUpload.destroy({ where: { id: id } })
                resolve()
            } catch (err) {
                reject(new Error("could not remove temp upload"))
            }
        })
    }
}

module.exports.TempUpload = TempUpload
