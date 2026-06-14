const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../../server-logging.cjs")
const events = require("../../../server-events.cjs")
const { ModelExtension } = require("../../model-extension.cjs")
const { uploads_video } = require("../../../server-uploads-video.cjs")

class StreamAudio extends ModelExtension {
    static #models = null

    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        StreamAudio.init(
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
                sample_fmt: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                sample_rate: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                channels: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                channel_layout: {
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
                modelName: `${StreamAudio.name}`,
            }
        )

        StreamAudio.#models = models

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        StreamAudio.belongsTo(models.TitleInstallmentStream, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        return
    }

    static async #Exists(streamID, label) {
        const streamAudio = await StreamAudio.findOne({
            where: {
                streamID: streamID,
                label: label,
            },
        })
        return streamAudio ? true : false
    }

    static GetAudioUpdateProgressEventName(streamID, label) {
        return `streamaudio-${streamID}-${label}-render-progress`
    }

    static async #OnRenderCycle(progress, streamAudio) {
        const streamAudioData = streamAudio.toJSON()
        events.emit(StreamAudio.GetAudioUpdateProgressEventName(streamAudio.streamID, streamAudio.label), { progress, streamAudioData })
    }

    static async #OnRenderCycleComplete(streamAudio) {
        streamAudio.isDownloaded = true
        await streamAudio.save()
    }

    static AddToDB(mediaInputFilePath, streamIndex, { streamID, label } = {}, transaction = null, onProgress = (progress) => {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await StreamAudio.#models.TitleInstallmentStream.GetByID(streamID, transaction)

                const audioData = await uploads_video.getFileAudioDetails(mediaInputFilePath, streamIndex)

                const streamAudio = await StreamAudio.build({
                    streamID: streamID,
                    label: label,
                    language: audioData?.tags?.language || "und",
                    codec_name: audioData.codec_name,
                    profile: audioData.profile,
                    sample_fmt: audioData.sample_fmt,
                    sample_rate: audioData.sample_rate,
                    channels: audioData.channels,
                    channel_layout: audioData.channel_layout,
                    avg_frame_rate: audioData.avg_frame_rate,
                    start_time: audioData.start_time,
                    duration: audioData.duration,
                    bit_rate: audioData.bit_rate,
                    isDownloaded: false,
                })

                await streamAudio.validate()

                await streamAudio.save()

                try {
                    await uploads_video.writeAudio(
                        mediaInputFilePath,
                        stream.titleID,
                        stream.installmentID,
                        stream.label,
                        label,
                        streamIndex,
                        (progress) => {
                            StreamAudio.#OnRenderCycle(progress, streamAudio)
                            onProgress(progress)
                            return
                        },
                        () => StreamAudio.#OnRenderCycleComplete(streamAudio)
                    )
                } catch (err) {
                    await streamAudio.destroy()
                    reject(err)
                }

                // when using a transaction it is assumed master file is not written to automatically.
                if (!transaction) {
                    await StreamAudio.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                }

                resolve(streamAudio)
            } catch (err) {
                Logging.LogError(`could not add ${StreamAudio.name} to database ${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static UpdateInDB(streamID, current_label, { mediaInputFilePath = null, streamIndex = 0 } = {}, { label } = {}, transaction = null, onProgress = (progress) => {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await StreamAudio.#models.TitleInstallmentStream.GetByID(streamID, transaction)

                const streamAudioPre = await StreamAudio.GetByStreamIDAndLabel(streamID, current_label, transaction)

                if (!streamAudioPre.isDownloaded) {
                    reject(new Error(`cannot update ${StreamAudio.name} with streamID:${streamID} label:${current_label} because audio has not finished downloading yet`))
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

                let audioData = {}
                if (mediaInputFilePath) {
                    audioData = await uploads_video.getFileAudioDetails(mediaInputFilePath, streamIndex)

                    if (!audioData) {
                        throw new Error("could not get audio data from input file")
                    }

                    update_values.language = audioData?.tags?.language || "und"
                    update_values.codec_name = audioData.codec_name
                    update_values.profile = audioData.profile
                    update_values.sample_fmt = audioData.sample_fmt
                    update_values.sample_rate = audioData.sample_rate
                    update_values.channels = audioData.channels
                    update_values.channel_layout = audioData.channel_layout
                    update_values.avg_frame_rate = audioData.avg_frame_rate
                    update_values.start_time = audioData.start_time
                    update_values.duration = audioData.duration
                    update_values.bit_rate = audioData.bit_rate
                    update_values.isDownloaded = false

                    await uploads_video.deleteAudio(stream.titleID, stream.installmentID, stream.label, current_label)
                }

                await StreamAudio.update(update_values, query)
                const streamAudio = await StreamAudio.findOne({
                    where: { streamID: streamID, label: label ? label : current_label },
                    transaction: transaction,
                })
                if (mediaInputFilePath) {
                    await uploads_video.writeAudio(
                        mediaInputFilePath,
                        stream.titleID,
                        stream.installmentID,
                        stream.label,
                        label ? label : current_label,
                        streamIndex,
                        (progress) => {
                            StreamAudio.#OnRenderCycle(progress, streamAudio)
                            onProgress(progress)
                            return
                        },
                        () => StreamAudio.#OnRenderCycleComplete(streamAudio)
                    )

                    // when using a transaction it is assumed master file is not written to automatically.
                    if (!transaction) {
                        await StreamAudio.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                    }
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not update ${StreamAudio.name} in database ${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static RemoveFromDB(streamID, label) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await StreamAudio.#Exists(streamID, label)) {
                    const stream = await StreamAudio.#models.TitleInstallmentStream.GetByID(streamID)
                    await uploads_video.deleteAudio(stream.titleID, stream.installmentID, stream.label, label)

                    await StreamAudio.destroy({
                        where: {
                            streamID: streamID,
                            label: label,
                        },
                    })

                    await StreamAudio.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                } else {
                    Logging.LogWarning(`${StreamAudio.name} with id:${streamID} does not exists so removing is unnecessary`)
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${StreamAudio.name} from database id:${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByStreamIDAndLabel(streamID, label, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.#Exists(streamID, label)) {
                    const default_query = {
                        where: {
                            streamID: streamID,
                            label: label,
                        },
                    }
                    if (transaction) {
                        default_query.transaction = transaction
                    }

                    const original_stream_audio_data = await StreamAudio.findOne({
                        ...default_query,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                    })

                    resolve(original_stream_audio_data.toJSON())
                } else {
                    reject(new Error(`could not get ${StreamAudio.name} with id:${streamID}`))
                }
            } catch (err) {
                Logging.LogError(`could not get ${StreamAudio.name} with id:${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.StreamAudio = StreamAudio
