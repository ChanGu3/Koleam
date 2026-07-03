const { DataTypes, Sequelize } = require("sequelize")
const { Logging, errormsg } = require("../../../server-logging.cjs")
const { ModelExtension } = require("../../model-extension.cjs")

class TitleInstallmentStreamWatchHistory extends ModelExtension {
    static #models = null

    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleInstallmentStreamWatchHistory.init(
            {
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: models.Member,
                        key: "email",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                streamID: {
                    type: DataTypes.UUIDV4,
                    primaryKey: true,
                    allowNull: false,
                    references: {
                        model: models.TitleInstallmentStream,
                        key: "id",
                    },
                    onDelete: "CASCADE",
                },
                lastTimeStampInSeconds: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    defaultValue: 0,
                },
                dateLastWatched: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: `${TitleInstallmentStreamWatchHistory.name}`,
            }
        )

        TitleInstallmentStreamWatchHistory.#models = models

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize: _s, models }) {
        TitleInstallmentStreamWatchHistory.belongsTo(models.Member, {
            foreignKey: "email",
            targetKey: "email",
        })

        TitleInstallmentStreamWatchHistory.belongsTo(models.TitleInstallmentStream, {
            foreignKey: "streamID",
            targetKey: "id",
        })
        return
    }

    //
    // Member Exists in DB true otherwise false
    //
    static async Exists(email, streamID) {
        const instance = await TitleInstallmentStreamWatchHistory.findOne({
            where: {
                email: email,
                streamID: streamID,
            },
        })
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created TitleWatchHistory
    //
    static async AddToDB(email, streamID) {
        if (await this.Exists(email, streamID)) {
            Logging.LogWarning(`email, streamID pair exists`)
            throw new Error(`${email} already has ${streamID} added`)
        }

        try {
            const newWatchHistory = await TitleInstallmentStreamWatchHistory.build({
                email: email,
                streamID: streamID,
            })

            await newWatchHistory.validate()

            await newWatchHistory.save()

            return newWatchHistory
        } catch (err) {
            Logging.LogError(`could not add ${TitleInstallmentStreamWatchHistory.name} to database ${email}|${streamID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveFromDB(email, streamID) {
        if (!(await this.Exists(email, streamID))) {
            Logging.LogWarning(`email, streamID, pair does not exist`)
            throw new Error(`${email} has not watched stream with id:${streamID}`)
        }

        try {
            await TitleInstallmentStreamWatchHistory.destroy({
                where: {
                    email: email,
                    streamID: streamID,
                },
            })
        } catch (err) {
            Logging.LogError(
                `could not remove ${TitleInstallmentStreamWatchHistory.name} from database ${email}|${streamID} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> instance: updated StreamWatchHistory
    //
    static async UpdateDB(email, streamID, { lastTimeStampInSeconds = undefined } = {}) {
        try {
            if (await this.Exists(email, streamID)) {
                await TitleInstallmentStreamWatchHistory.update(
                    {
                        dateLastWatched: new Date(),
                        lastTimeStampInSeconds,
                    },
                    {
                        where: {
                            email: email,
                            streamID: streamID,
                        },
                    }
                )
            } else {
                const msg = `could not update date of ${TitleInstallmentStreamWatchHistory.name} with streamID:${streamID} does not exist`
                Logging.LogError(msg)
                throw new Error(msg)
            }
        } catch (err) {
            Logging.LogError(
                `could not update date of ${TitleInstallmentStreamWatchHistory.name} with streamID:${streamID} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }

    static async GetWatchHistoryByEmail(
        email,
        { orderByDescDateLastedWatched = false, latestStreamPerSeries = false, titleID = null, limit = 10, offset = 0 } = {},
        transaction = null
    ) {
        try {
            const default_query = {
                where: {
                    email: email,
                },
                limit: limit,
                offset: offset,
            }

            let orderList = latestStreamPerSeries || orderByDescDateLastedWatched ? ["dateLastWatched", "DESC"] : undefined
            if (orderList) {
                default_query.order = [orderList]
            }

            // get a single stream that was the most recently watched of that title series
            if (latestStreamPerSeries) {
                default_query.group = ["titleID"]
            }

            const original_title_installment_watch_history_query = {
                where: default_query.where,
                group: default_query.group,
                order: default_query.order,
                attributes: {
                    exclude: ["createdAt", "updatedAt", "email"],
                    include: [
                        "email",
                        "streamID",
                        latestStreamPerSeries
                            ? [Sequelize.fn("MAX", Sequelize.col("dateLastWatched")), "dateLastWatched"]
                            : "dateLastWatched",
                        "lastTimeStampInSeconds",
                    ],
                },
                include: [
                    {
                        model: TitleInstallmentStreamWatchHistory.#models.TitleInstallmentStream,
                        required: true,
                        attributes: [],
                    },
                ],
            }

            // if titleID is provided we can get the watch history of specific titles
            if (titleID) {
                original_title_installment_watch_history_query.include[0].where.titleID = titleID
            }

            const original_title_installment_watch_history = await TitleInstallmentStreamWatchHistory.findAll(
                original_title_installment_watch_history_query
            )

            return await Promise.all(
                original_title_installment_watch_history.map(async (element, _index) => {
                    const { streamID, ...rest } = element.toJSON()
                    const streamData = await TitleInstallmentStreamWatchHistory.#models.TitleInstallmentStream.GetByID(
                        streamID,
                        transaction
                    )
                    return { ...rest, ...streamData }
                })
            )
        } catch (err) {
            Logging.LogError(
                `could not get list of ${TitleInstallmentStreamWatchHistory.name} from database by using email:${email} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }

    static async GetWatchHistoryByEmailANDStreamID(email, streamID, transaction = null) {
        try {
            if (await this.Exists(email, streamID)) {
                const default_query = {
                    where: {
                        email: email,
                        streamID: streamID,
                    },
                }

                if (transaction) {
                    default_query.transaction = transaction
                }

                const original_title_installment_watch_history = await TitleInstallmentStreamWatchHistory.findOne({
                    where: default_query.where,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: ["email", "streamID", "dateLastWatched", "lastTimeStampInSeconds"],
                    },
                    transaction: default_query.transaction,
                })

                const { streamID: _streamID, ...rest } = original_title_installment_watch_history.toJSON()
                const streamData = await TitleInstallmentStreamWatchHistory.#models.TitleInstallmentStream.GetByID(streamID, transaction)

                return { ...rest, ...streamData }
            } else {
                const msg = `could not get ${TitleInstallmentStreamWatchHistory.name} with email:${email} and streamID:${streamID} does not exist`
                Logging.LogError(msg)
                throw new Error(msg)
            }
        } catch (err) {
            Logging.LogError(
                `could not get stream in ${TitleInstallmentStreamWatchHistory.name} from the database ${email}|${streamID} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }
}

module.exports.TitleInstallmentStreamWatchHistory = TitleInstallmentStreamWatchHistory
