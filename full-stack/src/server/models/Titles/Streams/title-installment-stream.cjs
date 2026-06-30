const path = require("path")
const { DataTypes, literal, col } = require("sequelize")
const { Logging, errormsg } = require("../../../server-logging.cjs")
const { uploads } = require("../../../server-uploads.cjs")
const { ModelExtension } = require("../../model-extension.cjs")
const { uploads_video } = require("../../../server-uploads-video.cjs")

class TitleInstallmentStream extends ModelExtension {
    static #models = null

    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleInstallmentStream.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                },
                installmentID: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: models.TitleInstallment,
                        key: "id",
                    },
                    onDelete: "CASCADE",
                },
                titleID: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: models.Title,
                        key: "id",
                    },
                    onDelete: "CASCADE",
                },
                label: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                /*
                streamNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    min: {
                        args: [-1],
                        msg: "Quantity must be greater than -1.",
                    },
                },
                */
                synopsis: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                releaseDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: `${TitleInstallmentStream.name}`,
                indexes: [
                    {
                        unique: true,
                        fields: ["installmentID", "label"],
                    },
                    /*
                    {
                        unique: true,
                        fields: ["installmentID", "streamNumber"],
                    },
                    */
                ],
            }
        )

        TitleInstallmentStream.#models = models

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        TitleInstallmentStream.belongsTo(models.Title, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallmentStream.belongsTo(models.TitleInstallment, {
            foreignKey: "installmentID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallmentStream.hasMany(models.TitleInstallmentStreamLike, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallmentStream.hasMany(models.TitleInstallmentStreamWatchHistory, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallmentStream.hasOne(models.StreamVideo, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallmentStream.hasMany(models.StreamAudio, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallmentStream.hasMany(models.StreamSubtitle, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        return
    }

    static async #Exists(id) {
        const stream = await TitleInstallmentStream.findByPk(id)
        return stream ? true : false
    }

    static #TitleStreamDirPath(titleStream) {
        return path.join(titleStream.titleID, titleStream.installmentID, titleStream.label)
    }

    static #CreateDirectory(titleStream) {
        return new Promise(async (resolve, reject) => {
            try {
                const dirName = this.#TitleStreamDirPath(titleStream)
                await uploads.mkDir(dirName)
                resolve(dirName)
            } catch (err) {
                Logging.LogError(`${TitleInstallmentStream.name} directory creation could not be resolved for title:${titleStream.title} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static #RenameDirectory(oldTitleStream, newTitleStream) {
        return new Promise(async (resolve, reject) => {
            try {
                const oldRelativePath = this.#TitleStreamDirPath(oldTitleStream)
                const newRelativePath = this.#TitleStreamDirPath(newTitleStream)
                await uploads.rnDir(oldRelativePath, newRelativePath)
                resolve(newRelativePath)
            } catch (err) {
                Logging.LogError(`${TitleInstallmentStream.name} directory renaming could not be resolved for title:${oldTitleStream.title} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static #DeleteDirectory(titleStream) {
        return new Promise(async (resolve, reject) => {
            try {
                const dirName = this.#TitleStreamDirPath(titleStream)
                await uploads.recursiveDirDeleteInTitles(dirName)
                resolve(dirName)
            } catch (err) {
                Logging.LogError(`${TitleInstallmentStream.name} directory removal could not be resolved for title:${titleStream.title} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static RewriteMediaMasterFile(streamID) {
        return new Promise(async (resolve, reject) => {
            try {
                const titleStream = await TitleInstallmentStream.GetByID(streamID, true)

                const videoStreams = []
                const audioStreams = []
                const subtitleStreams = []

                if (titleStream && titleStream.StreamVideo) {
                    const videoResolutions = uploads.media.videoResolutions
                    const videoResolutionsHeight = uploads.media.videoResolutionsHeight
                    const indexRes = videoResolutionsHeight.findIndex((res) => res > titleStream.StreamVideo.height) - 1

                    const videoBandwidths = uploads.media.videoBandwidths
                    for (let i = indexRes; i >= 0; i--) {
                        videoStreams.push({
                            bandwidth: videoBandwidths[videoResolutionsHeight[i]],
                            resolution: `${videoResolutions[i]}`,
                            uri: `video/${videoResolutionsHeight[i]}/video_playlist.m3u8`,
                        })
                    }
                }

                if (titleStream && titleStream.StreamAudios) {
                    let audioIndex = 0
                    for (const audioStream of titleStream.StreamAudios.sort((a, b) => a.language.localeCompare(b.language))) {
                        audioStreams.push({
                            lang: audioStream.language,
                            name: audioStream.label,
                            default: audioIndex === 0,
                            uri: `audio/${encodeURIComponent(audioStream.label)}/audio_playlist.m3u8`,
                        })
                        audioIndex++
                    }
                }

                if (titleStream && titleStream.StreamSubtitles) {
                    let subtitleIndex = 0
                    for (const subtitleStream of titleStream.StreamSubtitles.sort((a, b) => a.language.localeCompare(b.language))) {
                        subtitleStreams.push({
                            lang: subtitleStream.language,
                            name: subtitleStream.label,
                            default: subtitleIndex === 0,
                            uri: `subs/${encodeURIComponent(subtitleStream.label)}.m3u8`,
                            isCC: subtitleStream.isCC,
                        })
                        subtitleIndex++
                    }
                }

                await uploads_video.writeMasterPlaylist(videoStreams, audioStreams, subtitleStreams, titleStream.titleID, titleStream.installmentID, titleStream.label)

                resolve()
            } catch (err) {
                reject(new Error(`could not rewrite master playlist --- ${err.message}`))
            }
        })
    }

    static AddToDB(titleID, installmentID, label, streamNumber, synopsis, releaseDate) {
        return new Promise(async (resolve, reject) => {
            try {
                const titleStream = await TitleInstallmentStream.build({
                    installmentID: installmentID,
                    label: label,
                    // streamNumber: streamNumber,
                    synopsis: synopsis,
                    releaseDate: releaseDate,
                    titleID: titleID,
                })

                await titleStream.validate()

                await titleStream.save()

                await this.#CreateDirectory(titleStream)
                resolve(titleStream)
            } catch (err) {
                Logging.LogError(`could not add ${TitleInstallmentStream.name} to database ${label} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static UpdateInDB(id, { label = null, synopsis = null, releaseDate = null, streamNumber = null } = {}, transaction = null) {
        return new Promise(async (resolve, reject) => {
            let renameDirectory = false
            let newTitleStream = null
            let oldTitleStream = null
            try {
                oldTitleStream = await TitleInstallmentStream.GetByID(id)
                if (!(await uploads.doesTitlesPathExist(this.#TitleStreamDirPath(oldTitleStream)))) {
                    await this.#CreateDirectory(oldTitleStream)
                    Logging.LogWarning(`directory does not exist had to re-create directory for stream called ${oldTitleStream.title}`)
                }

                const updateValues = {}
                if (label) {
                    updateValues.label = label
                }
                if (synopsis) {
                    updateValues.synopsis = synopsis
                }
                if (releaseDate) {
                    updateValues.releaseDate = releaseDate
                }

                const query = {}
                query.where = {}
                query.where.id = id
                if (transaction) {
                    query.transaction = transaction
                }

                if (streamNumber) {
                    // this will be for updating all the streamNumber after updating to one within the list
                    // TODO: I DONT REALLY NEED THIS FOR THIS RIGHT NOW WILL IN THE FUTURE FOR INSTALLMENT AS WELL ILLL JUST BE USING RELEASE DATE FOR NOW
                }

                await TitleInstallmentStream.update(updateValues, query)

                if (updateValues.label) {
                    newTitleStream = await TitleInstallmentStream.GetByID(oldTitleStream.id, null, transaction)
                    await this.#RenameDirectory(oldTitleStream, newTitleStream)
                    renameDirectory = true
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not update ${TitleInstallmentStream.name} in database ${id} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
                if (renameDirectory) {
                    await this.#RenameDirectory(newTitleStream, oldTitleStream)
                }
            }
        })
    }

    static RemoveFromDB(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.#Exists(id)) {
                    const titleStream = await TitleInstallmentStream.findOne({
                        where: {
                            id: id,
                        },
                    })
                    const dirName = this.#TitleStreamDirPath(titleStream)

                    await TitleInstallmentStream.destroy({
                        where: {
                            id: id,
                        },
                    })

                    if (await uploads.doesTitlesPathExist(dirName)) {
                        this.#DeleteDirectory(titleStream)
                    }
                } else {
                    Logging.LogWarning(`${TitleInstallmentStream.name} with id:${id} does not exists so removing is unnecessary`)
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${TitleInstallmentStream.name} from database id:${id} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GET_STREAMLIKES_INCLUDE(isTablePlural = false) {
        return [
            // Total Installments Count
            [
                literal(`(
                SELECT COUNT(*)
                FROM TitleInstallmentStreamLikes AS tisl
                WHERE tisl.streamID = TitleInstallmentStream${isTablePlural ? "s" : ""}.id
            )`),
                "likes_count",
            ],
        ]
    }

    static GET_WATCHHISTORY_INCLUDE(isTablePlural = false) {
        return [
            // Total Installments Count
            [
                literal(`(
                SELECT COUNT(*)
                FROM TitleInstallmentStreamWatchHistories AS tiswh
                WHERE tiswh.streamID = TitleInstallmentStream${isTablePlural ? "s" : ""}.id
            )`),
                "watch_history_count",
            ],
        ]
    }

    static GET_STREAM_ORDER_NUMBER_BY_REALEASE_DATE_INCLUDE(isTablePlural = false) {
        const tableName = TitleInstallmentStream.getTableName()
        return [
            [
                literal(`(
                SELECT row_index 
                FROM (
                    SELECT 
                        "id", 
                        ROW_NUMBER() OVER (PARTITION BY "installmentID" ORDER BY "releaseDate" ASC) as row_index
                    FROM ${tableName}
                ) AS "subquery"
                WHERE "subquery"."id" = TitleInstallmentStream${isTablePlural ? "s" : ""}."id"
            )`),
                "order_number_by_release_date",
            ],
        ]
    }

    static GetByID(id, includeMediaData = false, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.#Exists(id)) {
                    const default_query = {
                        where: {
                            id: id,
                        },
                    }
                    if (transaction) {
                        default_query.transaction = transaction
                    }

                    default_query.include = [
                        {
                            model: TitleInstallmentStream.#models.Title,
                            required: true,
                            attributes: { exclude: ["createdAt", "updatedAt", "id"] },
                        },
                        {
                            model: TitleInstallmentStream.#models.TitleInstallment,
                            required: true,
                            attributes: { exclude: ["createdAt", "updatedAt", "id"] },
                        },
                    ]

                    if (includeMediaData) {
                        default_query.include.push({
                            model: TitleInstallmentStream.#models.StreamVideo,
                            required: false,
                            attributes: { exclude: ["createdAt", "updatedAt"] },
                        })

                        default_query.include.push({
                            model: TitleInstallmentStream.#models.StreamAudio,
                            required: false,
                            separate: true,
                            attributes: { exclude: ["createdAt", "updatedAt"] },
                        })

                        default_query.include.push({
                            model: TitleInstallmentStream.#models.StreamSubtitle,
                            required: false,
                            separate: true,
                            attributes: { exclude: ["createdAt", "updatedAt"] },
                        })
                    }

                    const original_title_installment_data = await TitleInstallmentStream.findOne({
                        where: default_query.where,
                        transaction: default_query.transaction,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: ["id", "installmentID", "titleID", "label", /* "streamNumber", */ "synopsis", "releaseDate"].concat(
                                TitleInstallmentStream.GET_STREAMLIKES_INCLUDE(false),
                                TitleInstallmentStream.GET_WATCHHISTORY_INCLUDE(false),
                                TitleInstallmentStream.GET_STREAM_ORDER_NUMBER_BY_REALEASE_DATE_INCLUDE(false)
                            ),
                        },
                        include: default_query.include,
                    })

                    const { ...rest } = original_title_installment_data.toJSON()

                    const title_installment_stream_data = { ...rest }

                    resolve(title_installment_stream_data)
                } else {
                    reject(new Error(`could not get ${TitleInstallmentStream.name} with id:${id}`))
                }
            } catch (err) {
                Logging.LogError(`could not get ${TitleInstallmentStream.name} with id:${id} --- ${err}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetAll({ limit = 10, offset = 0, installmentID = null, isStreamNumberDesc = false }, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                // -----------------
                // -----------------

                const default_query = {
                    order: [["streamNumber", isStreamNumberDesc ? "DESC" : "ASC"]],
                }

                if (installmentID) {
                    default_query.where.installmentID = installmentID
                }
                if (transaction) {
                    default_query.transaction = transaction
                }
                if (limit) {
                    default_query.limit = limit
                }
                if (offset) {
                    default_query.offset = offset
                }

                const original_title_installment_data_list = await TitleInstallmentStream.findAll({
                    where: default_query.where,
                    transaction: default_query.transaction,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: ["id", "installmentID", "titleID", "label", /* "streamNumber", */ "synopsis", "releaseDate"].concat(
                            TitleInstallmentStream.GET_STREAMLIKES_INCLUDE(false),
                            TitleInstallmentStream.GET_WATCHHISTORY_INCLUDE(false),
                            TitleInstallmentStream.GET_STREAM_ORDER_NUMBER_BY_REALEASE_DATE_INCLUDE(false)
                        ),
                    },
                })

                resolve(
                    original_title_installment_data_list.map((element, index) => {
                        return element.toJSON()
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get list of ${TitleInstallmentStream.name} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }
}

module.exports.TitleInstallmentStream = TitleInstallmentStream
