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
                isCC: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
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

    static async Exists(streamID, label, isCC) {
        const streamSubtitle = await StreamSubtitle.findOne({
            where: {
                streamID: streamID,
                label: label,
                isCC: isCC,
            },
        })
        return streamSubtitle ? true : false
    }

    static GetSubtitleUpdateProgressEventName(streamID, label, isCC) {
        return `streamsubtitle-${streamID}-${label}${isCC ? "-CC" : ""}-render-progress`
    }

    static #OnRenderCycle(progress, streamSubtitle) {
        const streamSubtitleData = streamSubtitle.toJSON()
        events.emit(StreamSubtitle.GetSubtitleUpdateProgressEventName(streamSubtitle.streamID, streamSubtitle.label, streamSubtitle.isCC), { progress, streamSubtitleData })
    }

    static async #OnRenderCycleComplete(streamSubtitle) {
        streamSubtitle.isDownloaded = true
        await streamSubtitle.save()
        events.emit(StreamSubtitle.GetSubtitleUpdateProgressEventName(streamSubtitle.streamID, streamSubtitle.label, streamSubtitle.isCC), {
            progress: { percent: 100, percentAllRes: 100 },
            streamSubtitleData: streamSubtitle.toJSON(),
        })
    }

    static async AddToDB(mediaInputFilePath, streamIndex, { streamID, label, isCC } = {}, transaction = null, onProgress = (progress) => {}) {
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

            const subtitle = await streamSubtitle.save()

            uploads_video
                .writeSubtitle(
                    label,
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
                .then(async () => {
                    // when using a transaction it is assumed master file is not written to automatically.
                    if (!transaction) {
                        await StreamSubtitle.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                    }
                })
                .catch((err) => {
                    streamSubtitle.destroy().then()
                    Logging.LogError(`${err.message}`)
                })

            return streamSubtitle
        } catch (err) {
            Logging.LogError(`could not add ${StreamSubtitle.name} to database ${streamID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async UpdateInDB(
        streamID,
        current_label,
        current_CC,
        { mediaInputFilePath = null, streamIndex = null } = {},
        { label, isCC } = {},
        transaction = null,
        onProgress = (progress) => {}
    ) {
        try {
            const stream = await StreamSubtitle.#models.TitleInstallmentStream.GetByID(streamID, transaction)

            const streamSubtitlePre = await StreamSubtitle.GetByStreamIDAndLabelAndIsCC(streamID, current_label, current_CC, transaction)

            if (!streamSubtitlePre.isDownloaded) {
                reject(new Error(`cannot update ${StreamSubtitle.name} with streamID:${streamID} label:${current_label} because subtitle has not finished downloading yet`))
            }

            const query = {}
            query.where = {}
            query.where.streamID = streamID
            query.where.label = current_label
            query.where.isCC = current_CC
            if (transaction) {
                query.transaction = transaction
            }

            let update_values = {}
            if (label) {
                update_values.label = label
            }

            if (isCC !== undefined && isCC !== null) {
                update_values.isCC = isCC
            }

            if (label || (isCC !== undefined && isCC !== null)) {
                await StreamSubtitle.update({ ...update_values }, query)
                update_values = {}
                if (label) {
                    await uploads_video.renameSubtitle(stream.titleID, stream.installmentID, stream.label, current_label, label, streamSubtitlePre.codec_name)
                }
                // when using a transaction it is assumed master file is not written to automatically.
                if (!transaction) {
                    await StreamSubtitle.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                }
            }

            let subtitleData = {}

            if (mediaInputFilePath && streamIndex) {
                uploads_video
                    .getFileSubtitleDetails(mediaInputFilePath, streamIndex)
                    .then(async (subtitleData) => {
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

                        const subData = await StreamSubtitle.GetByStreamIDAndLabelAndIsCC(streamID, current_label, current_CC, transaction)
                        await uploads_video.deleteSubtitle(stream.titleID, stream.installmentID, stream.label, subData.label, subData.codec_name)

                        await StreamSubtitle.update(update_values, query)
                        const streamSubtitle = await StreamSubtitle.findAll({
                            where: { streamID: streamID, label: label ? label : current_label, isCC: isCC !== undefined && isCC !== null ? isCC : current_CC },
                            transaction: transaction,
                        })

                        if (!streamSubtitle[0]) {
                            throw new Error(
                                `could not get ${StreamSubtitle.name} with streamID:${streamID} label:${label ? label : current_label} isCC:${isCC !== undefined && isCC !== null ? isCC : current_CC}`
                            )
                        }

                        await uploads_video.writeSubtitle(
                            label ? label : current_label,
                            mediaInputFilePath,
                            stream.titleID,
                            stream.installmentID,
                            stream.label,
                            label ? label : current_label,
                            streamIndex,
                            (progress) => {
                                StreamSubtitle.#OnRenderCycle(progress, streamSubtitle[0])
                                onProgress(progress)
                                return
                            },
                            () => StreamSubtitle.#OnRenderCycleComplete(streamSubtitle[0]).then()
                        )

                        // when using a transaction it is assumed master file is not written to automatically.
                        if (!transaction) {
                            await StreamSubtitle.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                        }
                    })
                    .catch((err) => {
                        Logging.LogError(`${err.message}`)
                    })
            }

            return
        } catch (err) {
            Logging.LogError(`could not update ${StreamSubtitle.name} in database ${streamID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static RemoveFromDB(streamID, label, isCC) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await StreamSubtitle.Exists(streamID, label, isCC)) {
                    const stream = await StreamSubtitle.#models.TitleInstallmentStream.GetByID(streamID)
                    const subData = await StreamSubtitle.GetByStreamIDAndLabelAndIsCC(streamID, label, isCC)
                    await uploads_video.deleteSubtitle(label, stream.titleID, stream.installmentID, stream.label, label, subData.codec_name)

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

    static GetByStreamIDAndLabelAndIsCC(streamID, label, isCC, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await StreamSubtitle.Exists(streamID, label, isCC)) {
                    const default_query = {
                        where: {
                            streamID: streamID,
                            label: label,
                            isCC: isCC,
                        },
                    }
                    if (transaction) {
                        default_query.transaction = transaction
                    }

                    const original_stream_subtitle_data = await StreamSubtitle.findAll({
                        ...default_query,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                    })

                    if (!original_stream_subtitle_data[0]) {
                        reject(new Error(`could not get ${StreamSubtitle.name} with id:${streamID}, label:${label}, isCC:${isCC}`))
                    }

                    resolve(original_stream_subtitle_data[0].toJSON())
                } else {
                    reject(new Error(`could not get ${StreamSubtitle.name} with id:${streamID}, label ${label}, isCC:${isCC}`))
                }
            } catch (err) {
                Logging.LogError(`could not get ${StreamSubtitle.name} with id:${streamID}, label:${label}, isCC:${isCC} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.StreamSubtitle = StreamSubtitle
