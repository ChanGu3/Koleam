const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class TitleGenre extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleGenre.init(
            {
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
                genre: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    references: {
                        model: models.Genre,
                        key: "name",
                    },
                    onDelete: "CASCADE",
                },
            },
            {
                sequelize,
                modelName: `${TitleGenre.name}`,
            }
        )

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        TitleGenre.belongsTo(models.Title, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleGenre.belongsTo(models.Genre, {
            foreignKey: "genre",
            sourceKey: "genre",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        })
        return
    }

    //
    // Member Exists in DB true otherwise false
    //
    static async Exists(titleID, genre, transaction = null) {
        const instance = await TitleGenre.findOne({
            where: {
                titleID: titleID,
                genre: genre,
            },
            transaction: transaction,
        })
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created title genre
    //
    static AddToDB(titleID, genre, transaction = null) {
        return new Promise(async (resolve, reject) => {
            if (await this.Exists(titleID, genre, transaction)) {
                Logging.LogWarning(`titleID & genre pair exists`)
                reject(new Error(`title already has this genre`))
                return
            }

            try {
                const newTitleGenre = await TitleGenre.build({
                    titleID: titleID,
                    genre: genre,
                })

                await newTitleGenre.validate()

                if (transaction) {
                    await newTitleGenre.save({ transaction })
                } else {
                    await newTitleGenre.save()
                }

                resolve(newTitleGenre)
            } catch (err) {
                Logging.LogError(`could not add TitleGenre to database ${titleID}|${genre} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    //
    //
    static GetAllByTitleID(titleID) {
        return new Promise(async (resolve, reject) => {
            try {
                const titleGenres = await TitleGenre.findAll({
                    where: {
                        titleID: titleID,
                    },
                })
                resolve(
                    titleGenres.map((element) => {
                        return element.toJSON()
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get list of ${TitleGenre.name} from database using titleID:${titleID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    //
    //
    static GetAllByGenre(genre) {
        return new Promise(async (resolve, reject) => {
            try {
                const titleGenres = await TitleGenre.findAll({
                    where: {
                        genre: genre,
                    },
                })
                resolve(
                    titleGenres.map((element) => {
                        return element.toJSON()
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get list of ${TitleGenre.name} from database using genre:${genre} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByAnimeGenre(titleID, genre) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.Exists(titleID, genre)) {
                    const titleGenre = await TitleGenre.findOne({
                        where: {
                            titleID: titleID,
                            genre: genre,
                        },
                    })
                    resolve(titleGenre.toJSON())
                } else {
                    Logging.LogWarning(`${TitleGenre.name} does not exist ${titleID}|${genre} --- ${err.message}`)
                    reject(new Error(errormsg.titleGenreDoesNotExist))
                }
            } catch (err) {
                Logging.LogError(`could not get ${TitleGenre.name} from database ${titleID}|${genre} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveAllByTitleIDFromDB(titleID, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = {}
                query.where = {}
                query.where.titleID = titleID
                if (transaction) {
                    query.transaction = transaction
                }

                const deleted = await TitleGenre.destroy(query)
                resolve()
            } catch (err) {
                Logging.LogError(`could not remove all ${TitleGenre.name} from database by ${titleID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveByTitleIDAndGenreFromDB(titleID, genre, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = {}
                query.where = {}
                query.where.titleID = titleID
                query.where.genre = genre
                if (transaction) {
                    query.transaction = transaction
                }

                const deleted = await TitleGenre.destroy(query)
                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${TitleGenre.name} from database by titleID ${titleID} and genre ${genre} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.TitleGenre = TitleGenre
