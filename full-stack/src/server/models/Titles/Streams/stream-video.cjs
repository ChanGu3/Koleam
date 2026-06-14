const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../../server-logging.cjs")
const events = require("../../../server-events.cjs")
const { ModelExtension } = require("../../model-extension.cjs")
const { uploads_video } = require("../../../server-uploads-video.cjs")

class StreamVideo extends ModelExtension {
    static #models = null

    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        StreamVideo.init(
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
                width: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                height: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                codec_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                bit_rate: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                profile: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                level: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                avg_frame_rate: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                duration: {
                    type: DataTypes.FLOAT,
                    allowNull: true,
                },
                pix_fmt: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                color_space: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                start_time: {
                    type: DataTypes.FLOAT,
                    allowNull: true,
                },
                display_aspect_ratio: {
                    type: DataTypes.STRING,
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
                modelName: `${StreamVideo.name}`,
            }
        )

        StreamVideo.#models = models

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        StreamVideo.belongsTo(models.TitleInstallmentStream, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        return
    }

    static async #Exists(streamID) {
        const streamVideo = await StreamVideo.findByPk(streamID)
        return streamVideo ? true : false
    }

    static GetVideoUpdateProgressEventName(streamID) {
        return `streamvideo-${streamID}-render-progress`
    }

    static async #OnRenderCycle(progress, streamVideo) {
        const streamVideoData = streamVideo.toJSON()
        events.emit(StreamVideo.GetVideoUpdateProgressEventName(streamVideo.streamID), { progress, streamVideoData })
    }

    static async #OnRenderCycleComplete(streamVideo) {
        streamVideo.isDownloaded = true
        await streamVideo.save()
    }

    // TODO: in the future for writing media to disk maybe just get the details before writing the video oh well for now this is something id need to do for each media extension model
    static AddToDB(mediaInputFilePath, { streamID } = {}, transaction = null, onProgress = (progress) => {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await StreamVideo.#models.TitleInstallmentStream.GetByID(streamID, transaction)
                const videoData = await uploads_video.getFileVideoDetails(mediaInputFilePath)

                const streamVideo = await StreamVideo.build({
                    streamID: streamID,
                    width: videoData.width,
                    height: videoData.height,
                    codec_name: videoData.codec_name,
                    bit_rate: videoData.bit_rate,
                    profile: videoData.profile,
                    level: videoData.level,
                    avg_frame_rate: videoData.avg_frame_rate,
                    duration: videoData.duration,
                    pix_fmt: videoData.pix_fmt,
                    color_space: videoData.color_space,
                    start_time: videoData.start_time,
                    display_aspect_ratio: videoData.display_aspect_ratio,
                    isDownloaded: false,
                })

                await streamVideo.validate()

                await streamVideo.save({ transaction: transaction })

                try {
                    await uploads_video.writeVideo(
                        mediaInputFilePath,
                        stream.titleID,
                        stream.installmentID,
                        stream.label,
                        (progress) => {
                            StreamVideo.#OnRenderCycle(progress, streamVideo)
                            onProgress(progress)
                            return
                        },
                        () => StreamVideo.#OnRenderCycleComplete(streamVideo)
                    )
                } catch (err) {
                    await streamVideo.destroy({ transaction: transaction })
                    reject(err)
                }

                // when using a transaction it is assumed master file is not written to automatically.
                if (!transaction) {
                    await StreamVideo.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                }

                resolve(streamVideo)
            } catch (err) {
                Logging.LogError(`could not add ${StreamVideo.name} to database ${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static UpdateInDB(streamID, mediaInputFilePath, transaction = null, onProgress = (progress) => {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await StreamVideo.#models.TitleInstallmentStream.GetByID(streamID, transaction)
                const videoData = await uploads_video.getFileVideoDetails(mediaInputFilePath)
                const streamVideoPre = await StreamVideo.GetByStreamID(streamID, transaction)

                if (!streamVideoPre.isDownloaded) {
                    reject(new Error(`cannot update ${StreamVideo.name} with streamID:${streamID} because video has not finished downloading yet`))
                }

                const query = {}
                query.where = {}
                query.where.streamID = streamID
                if (transaction) {
                    query.transaction = transaction
                }

                await StreamVideo.update(
                    {
                        width: videoData.width,
                        height: videoData.height,
                        codec_name: videoData.codec_name,
                        bit_rate: videoData.bit_rate,
                        profile: videoData.profile,
                        level: videoData.level,
                        avg_frame_rate: videoData.avg_frame_rate,
                        duration: videoData.duration,
                        pix_fmt: videoData.pix_fmt,
                        color_space: videoData.color_space,
                        start_time: videoData.start_time,
                        display_aspect_ratio: videoData.display_aspect_ratio,
                        isDownloaded: false,
                    },
                    query
                )

                const streamVideo = await StreamVideo.findOne({
                    where: { streamID: streamID },
                    transaction: transaction,
                })
                try {
                    await uploads_video.writeVideo(
                        mediaInputFilePath,
                        stream.titleID,
                        stream.installmentID,
                        stream.label,
                        (progress) => {
                            StreamVideo.#OnRenderCycle(progress, streamVideo)
                            onProgress(progress)
                            return
                        },
                        () => StreamVideo.#OnRenderCycleComplete(streamVideo)
                    )
                } catch (err) {
                    await uploads_video.deleteVideo(stream.titleID, stream.installmentID, stream.label)
                }

                // when using a transaction it is assumed master file is not written to automatically.
                if (!transaction) {
                    await StreamVideo.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not update ${StreamVideo.name} in database ${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static RemoveFromDB(streamID) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.#Exists(streamID)) {
                    const stream = await StreamVideo.#models.TitleInstallmentStream.GetByID(streamID)
                    await uploads_video.deleteVideo(stream.titleID, stream.installmentID, stream.label)

                    await StreamVideo.destroy({
                        where: {
                            streamID: streamID,
                        },
                    })

                    await StreamVideo.#models.TitleInstallmentStream.RewriteMediaMasterFile(streamID)
                } else {
                    Logging.LogWarning(`${StreamVideo.name} with id:${streamID} does not exists so removing is unnecessary`)
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${StreamVideo.name} from database id:${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByStreamID(streamID, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.#Exists(streamID)) {
                    const default_query = {
                        where: {
                            streamID: streamID,
                        },
                    }
                    if (transaction) {
                        default_query.transaction = transaction
                    }

                    const original_stream_video_data = await StreamVideo.findOne({
                        ...default_query,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                    })

                    resolve(original_stream_video_data.toJSON())
                } else {
                    reject(new Error(`could not get ${StreamVideo.name} with id:${streamID}`))
                }
            } catch (err) {
                Logging.LogError(`could not get ${StreamVideo.name} with id:${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.StreamVideo = StreamVideo
