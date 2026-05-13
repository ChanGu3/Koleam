const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class TitleFavorite extends ModelExtension {
    static #models = null

    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleFavorite.init(
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
                titleID: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: models.Title,
                        key: "id",
                    },
                    onDelete: "CASCADE",
                },
            },
            {
                sequelize,
                modelName: `${TitleFavorite.name}`,
            }
        )

        TitleFavorite.#models = models

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        TitleFavorite.belongsTo(models.Title, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleFavorite.belongsTo(models.Member, {
            foreignKey: "email",
            sourceKey: "email",
            onDelete: "CASCADE",
        })
        return
    }

    //
    // Member Exists in DB true otherwise false
    //
    static async #Exists(email, titleID) {
        const instance = await TitleFavorite.findOne({
            where: {
                email: email,
                titleID: titleID,
            },
        })
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created AnimeFavorite
    //
    static AddToDB(email, titleID) {
        return new Promise(async (resolve, reject) => {
            if (await this.#Exists(email, titleID)) {
                Logging.LogWarning(`email & titleID pair exists`)
                reject(new Error(`${email} already has this ${titleID}`))
                return
            }

            try {
                const newTitleFavorite = await TitleFavorite.build({
                    email: email,
                    titleID: titleID,
                })

                await newTitleFavorite.validate()

                await newTitleFavorite.save()

                resolve(newTitleFavorite)
            } catch (err) {
                Logging.LogError(`could not add ${TitleFavorite.name} to database ${email}|${titleID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveFromDB(email, titleID) {
        return new Promise(async (resolve, reject) => {
            if (!(await this.#Exists(email, titleID))) {
                Logging.LogWarning(`email & titleID pair does not exist`)
                reject(new Error(`${email} is already not having ${titleID} as a favorite`))
                return
            }

            try {
                await TitleFavorite.destroy({
                    where: {
                        email: email,
                        titleID: titleID,
                    },
                })

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${TitleFavorite.name} from database ${email}|${titleID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByEmailANDTitleID(email, titleID, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                query = {}
                if (transaction) {
                    query.transaction = transaction
                }

                query.attributes = {
                    exclude: ["createdAt", "updatedAt"],
                    include: ["email", "titleID"],
                }

                query.where = {
                    email: email,
                    titleID: titleID,
                }

                const titleFavorites = await TitleFavorite.findOne(query)

                if (titleFavorites) {
                    const { titleID, ...rest } = titleFavorites.toJSON()

                    const titleData = await TitleFavorite.#models.Title.GetByID(titleID, transaction)

                    resolve({ titleData, ...rest })
                } else {
                    reject(new Error(`does not exist in database email:${email}|titleID:${titleID}`))
                }
            } catch (err) {
                Logging.LogError(`could not get ${TitleFavorite.name} from database using email:${email}|titleID:${titleID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetAllByEmail(email, { limit, offset }, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                query = {
                    where: {
                        email: email,
                    },
                }
                if (transaction) {
                    query.transaction = transaction
                }
                if (limit) {
                    query.limit = limit
                }
                if (offset) {
                    query.offset = offset
                }

                const titleFavorites = await TitleFavorite.findAll(query)
                resolve(
                    await titleFavorites.map(async (element) => {
                        const { createdAt, updatedAt, titleID, ...rest } = element.toJSON()

                        const titleData = await TitleFavorite.#models.Title.GetByID(titleID, transaction)

                        return { titleData, ...rest }
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get list of ${TitleFavorite.name} from database using email:${email} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.TitleFavorite = TitleFavorite
