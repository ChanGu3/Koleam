const path = require("path")
const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class Genre extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        Genre.init(
            {
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
            },
            {
                sequelize,
                modelName: `${Genre.name}`,
            }
        )

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        Genre.hasMany(models.TitleGenre, {
            foreignKey: "genre",
            otherKey: "name",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        })
        return
    }

    //
    //  Genre Exists in DB true otherwise false
    //
    static async Exists(name) {
        const instance = await Genre.findByPk(name)
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created Genre
    //
    static AddToDB(name) {
        return new Promise(async (resolve, reject) => {
            if (await this.Exists(name)) {
                Logging.LogWarning(`genre exists no need to add ${name} to database with the same name`)
                reject(`genre exists no need to add ${name} to database with the same name`)
                return
            }

            try {
                const newGenre = Genre.build({
                    name: name,
                })

                await newGenre.validate()

                await newGenre.save()

                resolve(newGenre)
            } catch (err) {
                Logging.LogError(`could not add genre to database ${name} --- ${err.message}`)
                reject()
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveFromDB(name) {
        return new Promise(async (resolve, reject) => {
            if (!(await this.Exists(name))) {
                Logging.LogWarning(`name does not exist`)
                reject(new Error(`${name} is already a genre in the database`))
                return
            }

            try {
                await Genre.destroy({
                    where: {
                        name: name,
                    },
                })

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${Genre.name} from database ${name} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByGenre(name) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.Exists(name)) {
                    const existingGenre = await Genre.findByPk(name)
                    const { createdAt, updatedAt, ...rest } = existingGenre.toJSON()
                    resolve(rest)
                } else {
                    Logging.LogError(`could not get genre from database ${name} --- ${err.message}`)
                    reject(new Error(errormsg.genreDoesNotExist))
                }
            } catch (err) {
                Logging.LogError(`could not get genre from database ${name} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetAll({ limit = 10, offset = 0 } = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const allGenre = await Genre.findAll({
                    order: [["name", "ASC"]],
                    limit: limit === Infinity ? undefined : limit,
                    offset,
                })
                resolve(
                    allGenre.map((element) => {
                        const { createdAt, updatedAt, ...rest } = element.toJSON()
                        return rest
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get all genre from database --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static DefaultSetup() {
        return new Promise(async (resolve, reject) => {
            try {
                const list = await this.GetAll()
                if (list.length > 0) {
                    resolve(list)
                } else {
                    const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance", "Sports", "Sci-Fi", "Supernatural", "Thriller"]

                    genres.forEach(async (value, index) => {
                        await this.AddToDB(value)
                    })

                    resolve(await this.GetAll())
                }
            } catch (err) {
                Logging.LogError(`could not setup genre properly --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.Genre = Genre
