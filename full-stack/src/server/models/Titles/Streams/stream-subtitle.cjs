const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../../server-logging.cjs")
const events = require("../../../server-events.cjs")
const { ModelExtension } = require("../../model-extension.cjs")
const { uploads_video } = require("../../../server-uploads-video.cjs")

class StreamSubtitle extends ModelExtension {
    static #models = null

    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        StreamSubtitle.init(
            {
                streamID: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: models.TitleInstallmentStream,
                        key: "id",
                    },
                    onDelete: "CASCADE",
                    primaryKey: true,
                },
                label: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
                language: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                codec_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                profile: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                avg_frame_rate: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                start_time: {
                    type: DataTypes.FLOAT,
                    allowNull: true,
                },
                duration: {
                    type: DataTypes.FLOAT,
                    allowNull: true,
                },
                bit_rate: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                isCC: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                isDownloaded: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
            },
            {
                sequelize,
                modelName: `${StreamSubtitle.name}`,
            }
        )

        StreamSubtitle.#models = models

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        StreamSubtitle.belongsTo(models.TitleInstallmentStream, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        return
    }

    static async #Exists(streamID, label) {
        const streamSubtitle = await StreamSubtitle.findOne({
            where: {
                streamID: streamID,
                label: label,
            },
        })
        return streamSubtitle ? true : false
    }

    static GetSubtitleUpdateProgressEventName(streamID, label) {
        return `streamsubtitle-${streamID}-${label}-render-progress`
    }

    static #OnRenderCycle(progress, streamSubtitle) {
        const streamSubtitleData = streamSubtitle.toJSON()
        events.emit(StreamSubtitle.GetSubtitleUpdateProgressEventName(streamSubtitle.streamID, streamSubtitle.label), { progress, streamSubtitleData })
    }

    static async #OnRenderCycleComplete(streamSubtitle) {
        streamSubtitle.isDownloaded = true
        await streamSubtitle.save()
    }

    static AddToDB(mediaInputFilePath, streamIndex, { streamID, label, isCC } = {}, transaction = null, onProgress = (progress) => {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await StreamSubtitle.#models.TitleInstallmentStream.GetByID(streamID, transaction)

                const subtitleData = await uploads_video.getFileSubtitleDetails(mediaInputFilePath, streamIndex)

                const streamSubtitle = await StreamSubtitle.build({
                    streamID: streamID,
                    label: label,
                    language: subtitleData?.tags?.language || "und",
                    codec_name: subtitleData.codec_name,
                    profile: subtitleData.profile,
                    avg_frame_rate: subtitleData.avg_frame_rate,
                    start_time: subtitleData.start_time,
                    duration: subtitleData.duration,
                    bit_rate: subtitleData.bit_rate,
                    isDownloaded: false,
                    isCC: isCC,
                })

                await streamSubtitle.validate()

                await streamSubtitle.save()

                try {
                    await uploads_video.writeSubtitle(
                        mediaInputFilePath,
                        stream.titleID,
                        stream.installmentID,
                        stream.label,
                        label,
                        streamIndex,
                        (progress) => {
                            StreamSubtitle.#OnRenderCycle(progress, streamSubtitle)
                            onProgress(progress)
                            return
                        },
                        () => StreamSubtitle.#OnRenderCycleComplete(streamSubtitle).then()
                    )
                } catch (err) {
                    await streamSubtitle.destroy()
                    reject(err)
                }

                // when using a transaction it is assumed master file is not written to automatically.
                if (!transaction) {
                    await StreamSubtitle.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                }

                resolve(streamSubtitle)
            } catch (err) {
                Logging.LogError(`could not add ${StreamSubtitle.name} to database ${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static UpdateInDB(streamID, current_label, { mediaInputFilePath = null, streamIndex = null } = {}, { label, isCC } = {}, transaction = null, onProgress = (progress) => {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await StreamSubtitle.#models.TitleInstallmentStream.GetByID(streamID, transaction)

                const streamSubtitlePre = await StreamSubtitle.GetByStreamIDAndLabel(streamID, current_label, transaction)

                if (!streamSubtitlePre.isDownloaded) {
                    reject(new Error(`cannot update ${StreamSubtitle.name} with streamID:${streamID} label:${current_label} because subtitle has not finished downloading yet`))
                }

                const query = {}
                query.where = {}
                query.where.streamID = streamID
                query.where.label = current_label
                if (transaction) {
                    query.transaction = transaction
                }

                const update_values = {}
                if (label) {
                    update_values.label = label
                }

                if (isCC) {
                    update_values.isCC = isCC
                }

                let subtitleData = {}

                if (mediaInputFilePath && streamIndex) {
                    subtitleData = await uploads_video.getFileSubtitleDetails(mediaInputFilePath, streamIndex)

                    if (!subtitleData) {
                        throw new Error("could not get subtitle data from input file")
                    }

                    update_values.language = subtitleData.tags?.language || "und"
                    update_values.codec_name = subtitleData.codec_name
                    update_values.profile = subtitleData.profile
                    update_values.avg_frame_rate = subtitleData.avg_frame_rate
                    update_values.start_time = subtitleData.start_time
                    update_values.duration = subtitleData.duration
                    update_values.bit_rate = subtitleData.bit_rate
                    update_values.isDownloaded = false

                    const subData = await StreamSubtitle.GetByStreamIDAndLabel(streamID, current_label)
                    await uploads_video.deleteSubtitle(stream.titleID, stream.installmentID, stream.label, subData.label, subData.codec_name)
                }

                await StreamSubtitle.update(update_values, query)
                const streamSubtitle = await StreamSubtitle.findOne({
                    where: { streamID: streamID, label: label ? label : current_label },
                    transaction: transaction,
                })
                if (mediaInputFilePath && streamIndex) {
                    await uploads_video.writeSubtitle(
                        mediaInputFilePath,
                        stream.titleID,
                        stream.installmentID,
                        stream.label,
                        label ? label : current_label,
                        streamIndex,
                        (progress) => {
                            StreamSubtitle.#OnRenderCycle(progress, streamSubtitle)
                            onProgress(progress)
                            return
                        },
                        () => StreamSubtitle.#OnRenderCycleComplete(streamSubtitle).then()
                    )

                    // when using a transaction it is assumed master file is not written to automatically.
                    if (!transaction) {
                        await StreamSubtitle.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                    }
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not update ${StreamSubtitle.name} in database ${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static RemoveFromDB(streamID, label) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await StreamSubtitle.#Exists(streamID, label)) {
                    const stream = await StreamSubtitle.#models.TitleInstallmentStream.GetByID(streamID)
                    const subData = await StreamSubtitle.GetByStreamIDAndLabel(streamID, label)
                    await uploads_video.deleteSubtitle(stream.titleID, stream.installmentID, stream.label, label, subData.codec_name)

                    await StreamSubtitle.destroy({
                        where: {
                            streamID: streamID,
                            label: label,
                        },
                    })

                    await StreamSubtitle.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                } else {
                    Logging.LogWarning(`${StreamSubtitle.name} with id:${streamID} does not exists so removing is unnecessary`)
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${StreamSubtitle.name} from database id:${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByStreamIDAndLabel(streamID, label, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await StreamSubtitle.#Exists(streamID, label)) {
                    const default_query = {
                        where: {
                            streamID: streamID,
                            label: label,
                        },
                    }
                    if (transaction) {
                        default_query.transaction = transaction
                    }

                    const original_stream_subtitle_data = await StreamSubtitle.findOne({
                        ...default_query,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                    })

                    resolve(original_stream_subtitle_data.toJSON())
                } else {
                    reject(new Error(`could not get ${StreamSubtitle.name} with id:${streamID}`))
                }
            } catch (err) {
                Logging.LogError(`could not get ${StreamSubtitle.name} with id:${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.StreamSubtitle = StreamSubtitle
