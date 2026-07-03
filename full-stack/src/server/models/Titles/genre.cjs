const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class Genre extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models: _m }) {
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
    static async Connect_Associations({ sequelize: _s, models }) {
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
    static async AddToDB(name) {
        if (await this.Exists(name)) {
            Logging.LogWarning(`genre exists no need to add ${name} to database with the same name`)
            throw `genre exists no need to add ${name} to database with the same name`
        }

        try {
            const newGenre = Genre.build({
                name: name,
            })

            await newGenre.validate()

            await newGenre.save()

            return newGenre
        } catch (err) {
            Logging.LogError(`could not add genre to database ${name} --- ${err.message}`)
            throw null
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveFromDB(name) {
        if (!(await this.Exists(name))) {
            Logging.LogWarning(`name does not exist`)
            throw new Error(`${name} is already a genre in the database`)
        }

        try {
            await Genre.destroy({
                where: {
                    name: name,
                },
            })
        } catch (err) {
            Logging.LogError(`could not remove ${Genre.name} from database ${name} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async GetByGenre(name) {
        try {
            if (await this.Exists(name)) {
                const existingGenre = await Genre.findByPk(name)
                const { createdAt: _c, updatedAt: _u, ...rest } = existingGenre.toJSON()
                return rest
            } else {
                Logging.LogError(`could not get genre from database ${name} `)
                throw new Error(errormsg.genreDoesNotExist)
            }
        } catch (err) {
            Logging.LogError(`could not get genre from database ${name} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async GetAll({ limit = 10, offset = 0 } = {}) {
        try {
            const allGenre = await Genre.findAll({
                order: [["name", "ASC"]],
                limit: limit === Infinity ? undefined : limit,
                offset,
            })
            return allGenre.map((element) => {
                const { createdAt: _c, updatedAt: _u, ...rest } = element.toJSON()
                return rest
            })
        } catch (err) {
            Logging.LogError(`could not get all genre from database --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async DefaultSetup() {
        try {
            const list = await this.GetAll()
            if (list.length > 0) {
                return list
            } else {
                const genres = [
                    "Action",
                    "Adventure",
                    "Comedy",
                    "Drama",
                    "Fantasy",
                    "Romance",
                    "Sports",
                    "Sci-Fi",
                    "Supernatural",
                    "Thriller",
                ]

                genres.forEach(async (value, _index) => {
                    await this.AddToDB(value)
                })

                return await this.GetAll()
            }
        } catch (err) {
            Logging.LogError(`could not setup genre properly --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }
}

module.exports.Genre = Genre
