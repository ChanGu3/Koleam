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
    static async Connect_Associations({ sequelize: _s, models }) {
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
    static async AddToDB(titleID, genre, transaction = null) {
        if (await this.Exists(titleID, genre, transaction)) {
            Logging.LogWarning(`titleID & genre pair exists`)
            throw new Error(`title already has this genre`)
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

            return newTitleGenre
        } catch (err) {
            Logging.LogError(`could not add TitleGenre to database ${titleID}|${genre} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    //
    //
    static async GetAllByTitleID(titleID, { limit = 10, offset = 0 } = {}) {
        try {
            const titleGenres = await TitleGenre.findAll({
                where: {
                    titleID: titleID,
                },
                limit: limit,
                offset: offset,
            })
            return titleGenres.map((element) => {
                return element.toJSON()
            })
        } catch (err) {
            Logging.LogError(`could not get list of ${TitleGenre.name} from database using titleID:${titleID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    //
    //
    static async GetAllByGenre(genre, { limit = 10, offset = 0 } = {}) {
        try {
            const titleGenres = await TitleGenre.findAll({
                where: {
                    genre: genre,
                },
                limit: limit,
                offset: offset,
            })
            return titleGenres.map((element) => {
                return element.toJSON()
            })
        } catch (err) {
            Logging.LogError(`could not get list of ${TitleGenre.name} from database using genre:${genre} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async GetByTitleIDAndGenre(titleID, genre) {
        try {
            if (await this.Exists(titleID, genre)) {
                const titleGenre = await TitleGenre.findOne({
                    where: {
                        titleID: titleID,
                        genre: genre,
                    },
                })
                return titleGenre.toJSON()
            } else {
                Logging.LogWarning(`${TitleGenre.name} does not exist ${titleID}|${genre}`)
                throw new Error(errormsg.titleGenreDoesNotExist)
            }
        } catch (err) {
            Logging.LogError(`could not get ${TitleGenre.name} from database ${titleID}|${genre} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveAllByTitleIDFromDB(titleID, transaction = null) {
        try {
            const query = {}
            query.where = {}
            query.where.titleID = titleID
            if (transaction) {
                query.transaction = transaction
            }

            await TitleGenre.destroy(query)
        } catch (err) {
            Logging.LogError(`could not remove all ${TitleGenre.name} from database by ${titleID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveByTitleIDAndGenreFromDB(titleID, genre, transaction = null) {
        try {
            const query = {}
            query.where = {}
            query.where.titleID = titleID
            query.where.genre = genre
            if (transaction) {
                query.transaction = transaction
            }

            await TitleGenre.destroy(query)
        } catch (err) {
            Logging.LogError(
                `could not remove ${TitleGenre.name} from database by titleID ${titleID} and genre ${genre} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }
}

module.exports.TitleGenre = TitleGenre
