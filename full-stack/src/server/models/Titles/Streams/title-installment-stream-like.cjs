const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../../server-logging.cjs")
const { ModelExtension } = require("../../model-extension.cjs")

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
    static async Connect_Associations({ sequelize: _s, models }) {
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
    static async Exists(email, streamID) {
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
    static async AddToDB(email, streamID) {
        if (await this.Exists(email, streamID)) {
            Logging.LogWarning(`email, streamID pair exists`)
            throw new Error(`${email} already has ${streamID} liked`)
        }

        try {
            const newTitleInstallmentStreamLike = await TitleInstallmentStreamLike.build({
                email: email,
                streamID: streamID,
            })

            await newTitleInstallmentStreamLike.validate()

            await newTitleInstallmentStreamLike.save()

            return newTitleInstallmentStreamLike
        } catch (err) {
            Logging.LogError(`could not add ${TitleInstallmentStreamLike.name} to database ${email}|${streamID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveFromDB(email, streamID) {
        if (!(await this.Exists(email, streamID))) {
            Logging.LogWarning(`email, streamID pair does not exist`)
            throw new Error(`${email} already does not have ${streamID} liked`)
        }

        try {
            await TitleInstallmentStreamLike.destroy({
                where: {
                    email: email,
                    streamID: streamID,
                },
            })
        } catch (err) {
            Logging.LogError(`could not remove ${TitleInstallmentStreamLike.name} from database ${email}|${streamID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async GetAllByStreamID(streamID, { limit = 10, offset = 0 } = {}) {
        try {
            const streamLikes = await TitleInstallmentStreamLike.findAll({
                where: {
                    streamID: streamID,
                    limit: limit,
                    offset: offset,
                },
            })

            if (streamLikes) {
                return streamLikes.map((element) => {
                    const { createdAt: _c, updatedAt: _u, ...rest } = element.toJSON()
                    return rest
                })
            } else {
                throw new Error(`no likes exist for the streamID:${streamID}`)
            }
        } catch (err) {
            Logging.LogError(
                `could not get list of ${TitleInstallmentStreamLike.name} from database using streamID:${streamID} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }

    static async GetCountByStreamID(streamID) {
        try {
            const streamLikes = await TitleInstallmentStreamLike.findAll({
                where: {
                    streamID: streamID,
                },
            })

            if (streamLikes) {
                return streamLikes.length
            } else {
                throw new Error(`no likes exist for the streamID:${streamID}`)
            }
        } catch (err) {
            Logging.LogError(
                `could not get list of ${TitleInstallmentStreamLike.name} from database using streamID:${streamID} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }

    static async GetByEmailANDStreamID(email, streamID) {
        try {
            const streamLikes = await TitleInstallmentStreamLike.findOne({
                where: {
                    email: email,
                    streamID: streamID,
                },
                attributes: { exclude: ["createdAt", "updatedAt"] },
            })
            if (streamLikes) {
                return streamLikes.toJSON()
            } else {
                throw new Error(`email:${email} doesn't have streamID:${streamID} liked`)
            }
        } catch {
            throw new Error(errormsg.fallback)
        }
    }
}

module.exports.TitleInstallmentStreamLike = TitleInstallmentStreamLike
