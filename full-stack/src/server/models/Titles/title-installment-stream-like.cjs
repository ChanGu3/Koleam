const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class TitleInstallmentStreamLike extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleInstallmentStreamLike.init(
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
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: models.TitleStream,
                        key: "id",
                    },
                    onDelete: "CASCADE",
                },
            },
            {
                sequelize,
                modelName: `${TitleInstallmentStreamLike.name}`,
            }
        )

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        TitleInstallmentStreamLike.belongsTo(models.Member, {
            foreignKey: "email",
            targetKey: "email",
            onDelete: "CASCADE",
        })

        TitleInstallmentStreamLike.belongsTo(models.TitleInstallmentStream, {
            foreignKey: "streamID",
            targetKey: "id",
            onDelete: "CASCADE",
        })
        return
    }

    //
    // Member Exists in DB true otherwise false
    //
    static async #Exists(email, streamID) {
        const instance = await TitleInstallmentStreamLike.findOne({
            where: {
                email: email,
                streamID: streamID,
            },
        })
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created instance
    //
    static AddToDB(email, streamID) {
        return new Promise(async (resolve, reject) => {
            if (await this.#Exists(email, streamID)) {
                Logging.LogWarning(`email, streamID pair exists`)
                reject(new Error(`${email} already has ${streamID} liked`))
                return
            }

            try {
                const newTitleInstallmentStreamLike = await TitleInstallmentStreamLike.build({
                    email: email,
                    streamID: streamID,
                })

                await newTitleInstallmentStreamLike.validate()

                await newTitleInstallmentStreamLike.save()

                resolve(newTitleInstallmentStreamLike)
            } catch (err) {
                Logging.LogError(`could not add ${TitleInstallmentStreamLike.name} to database ${email}|${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveFromDB(email, streamID) {
        return new Promise(async (resolve, reject) => {
            if (!(await this.#Exists(email, streamID))) {
                Logging.LogWarning(`email, streamID pair does not exist`)
                reject(new Error(`${email} already does not have ${streamID} liked`))
                return
            }

            try {
                await TitleInstallmentStreamLike.destroy({
                    where: {
                        email: email,
                        streamID: streamID,
                    },
                })

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${TitleInstallmentStreamLike.name} from database ${email}|${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetAllByStreamID(streamID) {
        return new Promise(async (resolve, reject) => {
            try {
                const streamLikes = await TitleInstallmentStreamLike.findAll({
                    where: {
                        streamID: streamID,
                    },
                })

                if (streamLikes) {
                    resolve(
                        streamLikes.map((element) => {
                            const { createdAt, updatedAt, ...rest } = element.toJSON()
                            return rest
                        })
                    )
                } else {
                    reject(new Error(`no likes exist for the streamID:${streamID}`))
                }
            } catch (err) {
                Logging.LogError(`could not get list of ${TitleInstallmentStreamLike.name} from database using streamID:${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetCountByStreamID(streamID) {
        return new Promise(async (resolve, reject) => {
            try {
                const streamLikes = await TitleInstallmentStreamLike.findAll({
                    where: {
                        streamID: streamID,
                    },
                })

                if (streamLikes) {
                    resolve(streamLikes.length)
                } else {
                    reject(new Error(`no likes exist for the streamID:${streamID}`))
                }
            } catch (err) {
                Logging.LogError(`could not get list of ${TitleInstallmentStreamLike.name} from database using streamID:${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByEmailANDStreamID(email, streamID) {
        return new Promise(async (resolve, reject) => {
            try {
                const streamLikes = await TitleInstallmentStreamLike.findOne({
                    where: {
                        email: email,
                        streamID: streamID,
                    },
                })
                if (streamLikes) {
                    resolve(streamLikes.toJSON())
                } else {
                    reject(new Error(`email:${email} doesn't have streamID:${streamID} liked`))
                }
            } catch (err) {
                Logging.LogError(`could not get ${TitleInstallmentStreamLike.name} from database using email:${email}|streamID:${streamID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.TitleInstallmentStreamLike = TitleInstallmentStreamLike
