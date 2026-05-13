const { DataTypes, Op, fn, col, literal } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { uploads } = require("../../server-uploads.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class Title extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        Title.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                    allowNull: false,
                },
                label: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                copyright: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                originalTranslation: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: `${Title.name}`,
            }
        )

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        Title.hasMany(models.TitleInstallment, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        Title.hasMany(models.TitleOtherTranslation, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        Title.hasMany(models.TitleRating, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        Title.hasMany(models.TitleGenre, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        Title.hasMany(models.TitleFavorite, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        return
    }

    static async Exists(id) {
        const title = await Title.findByPk(id)
        return title ? true : false
    }

    static #TitleDirPath(title) {
        return `${title.id}`
    }

    static #CreateDirectory(title) {
        return new Promise(async (resolve, reject) => {
            try {
                const dirName = this.#TitleDirPath(title)
                await uploads.mkDir(dirName)
                resolve(dirName)
            } catch (err) {
                Logging.LogError(`title directory creation could not be resolved for id:${title.id} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static #DeleteDirectory(title) {
        return new Promise(async (resolve, reject) => {
            try {
                const dirName = this.#TitleDirPath(title)
                await uploads.recursiveDirDeleteInTitles(dirName)
                resolve(dirName)
            } catch (err) {
                Logging.LogError(`title directory removal could not be resolved for id:${title.id} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static AddToDB(label, description, copyright, originalTranslation, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const title = await Title.build(
                    {
                        label: label,
                        description: description,
                        copyright: copyright,
                        originalTranslation: originalTranslation,
                    },
                    { transaction: transaction }
                )

                await title.validate({ transaction: transaction })
                await title.save({ transaction: transaction })

                await this.#CreateDirectory(title)

                resolve(title)
            } catch (err) {
                Logging.LogError(`could not add title to database ${label} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static UpdateInDB(id, { label = undefined, description = undefined, copyright = undefined, originalTranslation = undefined }, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const title = await Title.GetByID(id)
                if (!(await uploads.doesAnimePathExist(this.#TitleDirPath(title)))) {
                    await this.#CreateDirectory(title)
                    Logging.LogWarning(`directory does not exist had to re-create directory for title called ${title.title}`)
                }

                const updateValues = {}
                if (label) {
                    updateValues.label = label
                }
                if (description) {
                    updateValues.description = description
                }
                if (copyright) {
                    updateValues.copyright = copyright
                }
                if (originalTranslation) {
                    updateValues.originalTranslation = originalTranslation
                }

                const query = {}
                query.where = {}
                query.where.id = id
                if (transaction) {
                    query.transaction = transaction
                }

                await Title.update(updateValues, query)

                resolve()
            } catch (err) {
                Logging.LogError(`could not update title in database ${id} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static RemoveFromDB(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.Exists(id)) {
                    const title = await Title.findByPk(id)
                    const dirName = this.#TitleDirPath(title)

                    await Title.destroy({
                        where: {
                            id: title.id,
                        },
                    })

                    if (await uploads.doesAnimePathExist(dirName)) {
                        this.#DeleteDirectory(title)
                    }
                } else {
                    Logging.LogWarning(`title with id:${id} does not exists so removing is unnecessary`)
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove title from database ${id} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByID(id, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.Exists(id)) {
                    default_query = {
                        where: {
                            id: id,
                        },
                        group: [col("Title.id")],
                    }

                    if (transaction) {
                        default_query.transaction = transaction
                    }

                    const original_title_data = await Title.findOne({
                        where: default_query.where,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: ["id", "label", "description", "copyright", "originalTranslation"],
                        },
                        group: default_query.group,
                    })

                    const installment_title_data = await Title.findOne({
                        where: default_query.where,
                        include: [
                            {
                                model: "TitleInstallment",
                                required: false,
                            },
                        ],
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: [
                                [fn("COUNT", col("TitleInstallment.id")), "installments_count"],
                                [fn("COUNT", col("CASE WHEN TitleInstallment.isSeason = true THEN 1 END")), "season_count"],
                                [fn("COUNT", col("CASE WHEN TitleInstallment.isSeason = false THEN 1 END")), "movie_count"],
                            ],
                        },
                        group: default_query.group,
                    })

                    const other_translations_title_data = await Title.findOne({
                        where: default_query.where,
                        include: [
                            {
                                model: "TitleOtherTranslation",
                                required: false,
                            },
                        ],
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: [[fn("GROUP_CONCAT", col("TitleOtherTranslation.translation")), "all_other_translations"]],
                        },
                        group: default_query.group,
                    })

                    const rating_title_data = await Title.findOne({
                        where: default_query.where,
                        include: [
                            {
                                model: "TitleRating",
                                required: false,
                            },
                        ],
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: [
                                [fn("COUNT", literal("CASE WHEN TitleRating.rating = 1 THEN 1 END")), "rating_1_count"],
                                [fn("COUNT", literal("CASE WHEN TitleRating.rating = 2 THEN 1 END")), "rating_2_count"],
                                [fn("COUNT", literal("CASE WHEN TitleRating.rating = 3 THEN 1 END")), "rating_3_count"],
                                [fn("COUNT", literal("CASE WHEN TitleRating.rating = 4 THEN 1 END")), "rating_4_count"],
                                [fn("COUNT", literal("CASE WHEN TitleRating.rating = 5 THEN 1 END")), "rating_5_count"],
                                [fn("AVG", col("TitleRating.rating")), "rating_average"],
                                [fn("COUNT", col("TitleRating.id")), "rating_count"],
                            ],
                        },
                        group: default_query.group,
                    })

                    const genre_title_data = await Title.findOne({
                        where: default_query.where,
                        include: [
                            {
                                model: "TitleGenre",
                                required: false,
                            },
                        ],
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: [[fn("GROUP_CONCAT", col("TitleGenre.genre")), "all_genres"]],
                        },
                        group: default_query.group,
                    })

                    const favorite_title_data = await Title.findOne({
                        where: default_query.where,
                        include: [
                            {
                                model: "TitleFavorite",
                                required: false,
                            },
                        ],
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: [[fn("COUNT", col("TitleFavorite.email")), "favorite_count"]],
                        },
                        group: default_query.group,
                    })

                    all_title_data = {
                        ...original_title_data.toJSON(),
                        ...installment_title_data.toJSON(),
                        ...other_translations_title_data.toJSON(),
                        ...rating_title_data.toJSON(),
                        ...genre_title_data.toJSON(),
                        ...favorite_title_data.toJSON(),
                    }

                    resolve(all_title_data)
                } else {
                    Logging.LogError(`could not get title with id: ${id}`)
                    reject({ error: `could not get title with id: ${id}` })
                }
            } catch (err) {
                Logging.LogError(`could not get title with id: ${id} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static GetAll({ getNewestReleases = false, limit = 10, offset = 0, search = undefined, genereFilter = [], transaction = null } = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const default_query = {}

                if (transaction) {
                    default_query.transaction = transaction
                }

                default_query.order = {}
                if (getNewestReleases) {
                    default_query.order.push(["createdAt", "ASC"])
                }

                default_query.having = {}
                if (genereFilter.length > 0) {
                    default_query.having.all_genres = { [Op.in]: genereFilter }
                }

                default_query.where = {
                    id: id,
                }

                default_query.group = [col("Title.id")]

                default_query.search = search ? { label: { [Op.like]: `%${search}%` } } : undefined

                default_query.limit = getNewestReleases ? 6 : limit

                defgault_query.offset = getNewestReleases ? 0 : offset

                const original_title_data = await Title.findAll({
                    where: default_query.where,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: ["id", "label", "description", "copyright", "originalTranslation"],
                    },
                    group: default_query.group,
                    having: default_query.having,
                    order: default_query.order,
                    limit: default_query.limit,
                    offset: default_query.offset,
                    include: default_query.search,
                })

                const installment_title_data = await Title.findAll({
                    where: default_query.where,
                    include: [
                        {
                            model: "TitleInstallment",
                            required: false,
                        },
                    ],
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: [
                            [fn("COUNT", col("TitleInstallment.id")), "installments_count"],
                            [fn("COUNT", col("CASE WHEN TitleInstallment.isSeason = true THEN 1 END")), "season_count"],
                            [fn("COUNT", col("CASE WHEN TitleInstallment.isSeason = false THEN 1 END")), "movie_count"],
                        ],
                    },
                    group: default_query.group,
                    having: default_query.having,
                    order: default_query.order,
                    limit: default_query.limit,
                    offset: default_query.offset,
                    search: default_query.search,
                })

                const other_translations_title_data = await Title.findAll({
                    where: default_query.where,
                    include: [
                        {
                            model: "TitleOtherTranslation",
                            required: false,
                        },
                    ],
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: [[fn("GROUP_CONCAT", col("TitleOtherTranslation.translation")), "all_other_translations"]],
                    },
                    group: default_query.group,
                    having: default_query.having,
                    order: default_query.order,
                    limit: default_query.limit,
                    offset: default_query.offset,
                    search: default_query.search,
                })

                const rating_title_data = await Title.findAll({
                    where: default_query.where,
                    include: [
                        {
                            model: "TitleRating",
                            required: false,
                        },
                    ],
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: [
                            [fn("COUNT", literal("CASE WHEN TitleRating.rating = 1 THEN 1 END")), "rating_1_count"],
                            [fn("COUNT", literal("CASE WHEN TitleRating.rating = 2 THEN 1 END")), "rating_2_count"],
                            [fn("COUNT", literal("CASE WHEN TitleRating.rating = 3 THEN 1 END")), "rating_3_count"],
                            [fn("COUNT", literal("CASE WHEN TitleRating.rating = 4 THEN 1 END")), "rating_4_count"],
                            [fn("COUNT", literal("CASE WHEN TitleRating.rating = 5 THEN 1 END")), "rating_5_count"],
                            [fn("AVG", col("TitleRating.rating")), "rating_average"],
                            [fn("COUNT", col("TitleRating.id")), "rating_count"],
                        ],
                    },
                    group: default_query.group,
                    having: default_query.having,
                    order: default_query.order,
                    limit: default_query.limit,
                    offset: default_query.offset,
                    search: default_query.search,
                })

                const genre_title_data = await Title.findAll({
                    where: default_query.where,
                    include: [
                        {
                            model: "TitleGenre",
                            required: false,
                        },
                    ],
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: [[fn("GROUP_CONCAT", col("TitleGenre.genre")), "all_genres"]],
                    },
                    group: default_query.group,
                    having: default_query.having,
                    order: default_query.order,
                    limit: default_query.limit,
                    offset: default_query.offset,
                    search: default_query.search,
                })

                const favorite_title_data = await Title.findAll({
                    where: default_query.where,
                    include: [
                        {
                            model: "TitleFavorite",
                            required: false,
                        },
                    ],
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: [[fn("COUNT", col("TitleFavorite.email")), "favorite_count"]],
                    },
                    group: default_query.group,
                    having: default_query.having,
                    order: default_query.order,
                    limit: default_query.limit,
                    offset: default_query.offset,
                    search: default_query.search,
                })

                resolve(
                    original_title_data.map((element, index) => {
                        return {
                            ...element.toJSON(),
                            ...installment_title_data[index].toJSON(),
                            ...other_translations_title_data[index].toJSON(),
                            ...rating_title_data[index].toJSON(),
                            ...genre_title_data[index].toJSON(),
                            ...favorite_title_data[index].toJSON(),
                        }
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get all titles --- ${err}`)
                reject({ error: err.message })
            }
        })
    }
}

module.exports.Title = Title
