const { DataTypes, Op, fn, col, literal } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { uploads } = require("../../server-uploads.cjs")
const { ModelExtension } = require("../model-extension.cjs")
const { FILM_RATING } = require("../../../shared/title-constants.js")

class Title extends ModelExtension {
    static #models = null

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
                    allowNull: true,
                },
                originalTranslation: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                filmSuitability: {
                    type: DataTypes.ENUM,
                    values: Object.values(FILM_RATING),
                    allowNull: true,
                    defaultValue: null,
                },
                filmAgeMin: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    defaultValue: null,
                },
            },
            {
                sequelize,
                modelName: `${Title.name}`,
            }
        )

        Title.#models = models

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

        Title.hasMany(models.TitleContentAdvisory, {
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

    static AddToDB(label, description = null, copyright = null, originalTranslation, filmSuitability = null, filmAgeMin = null, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const title = await Title.build(
                    {
                        label: label,
                        description: description,
                        copyright: copyright,
                        originalTranslation: originalTranslation,
                        filmSuitability: filmSuitability,
                        filmAgeMin: filmAgeMin,
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

    static UpdateInDB(
        id,
        { label = undefined, description = undefined, copyright = undefined, originalTranslation = undefined, filmSuitability = undefined, filmAgeMin = undefined } = {},
        transaction = null
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                const title = await Title.GetByID(id)
                if (!(await uploads.doesTitlesPathExist(this.#TitleDirPath(title)))) {
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
                if (filmAgeMin) {
                    updateValues.filmAgeMin = filmAgeMin
                }

                if (filmSuitability) {
                    updateValues.filmSuitability = filmSuitability
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

                    if (await uploads.doesTitlesPathExist(dirName)) {
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

    static GET_INSTALLMENT_INCLUDE() {
        const titleInstallmentTableName = Title.#models.TitleInstallment.getTableName()
        const titleInstallmentStreamsTableName = Title.#models.TitleInstallmentStream.getTableName()

        return [
            // Total Installments Count
            [
                literal(`(
                SELECT COUNT(*)
                FROM ${titleInstallmentTableName} AS ti
                WHERE ti.titleId = Title.id
            )`),
                "installments_count",
            ],
            // Season Installment Count
            [
                literal(`(
                SELECT COUNT(*)
                FROM ${titleInstallmentTableName} AS ti
                WHERE ti.titleId = Title.id AND ti.isSeason = true
            )`),
                "seasons_count",
            ],
            [
                literal(`(
                SELECT COUNT(*)
                FROM ${titleInstallmentTableName} AS ti
                WHERE ti.titleId = Title.id AND ti.isSeason = false
            )`),
                "movie_group_count",
            ],
            // Movies Count
            [
                literal(`(
                SELECT COUNT(*)
                FROM ${titleInstallmentTableName} as ti INNER JOIN ${titleInstallmentStreamsTableName} AS tis
                ON ti.id = tis.installmentID
                WHERE ti.titleId = Title.id AND ti.isSeason = true
            )`),
                "stream_episodes_count",
            ],
            // Episodes Count
            [
                literal(`(
                SELECT COUNT(*)
                FROM ${titleInstallmentTableName} as ti INNER JOIN ${titleInstallmentStreamsTableName} AS tis
                ON ti.id = tis.installmentID
                WHERE ti.titleId = Title.id AND ti.isSeason = false
            )`),
                "stream_movies_count",
            ],
        ]
    }
    static GET_OTHERTRANSLATIONS_INCLUDE() {
        const titleOtherTranslationsTableName = Title.#models.TitleOtherTranslation.getTableName()
        return [
            // ALL OTHER TRANSLATIONS
            [
                literal(`(
                SELECT GROUP_CONCAT(tot.translation)
                FROM ${titleOtherTranslationsTableName} AS tot
                WHERE tot.titleId = Title.id
            )`),
                "all_other_translations",
            ],
        ]
    }
    static GET_RATINGS_INCLUDE() {
        const titleRatingsTableName = Title.#models.TitleRating.getTableName()
        return [
            [
                literal(`(
                SELECT COUNT(CASE WHEN tr.rating = 1 THEN 1 END)
                FROM ${titleRatingsTableName} AS tr
                WHERE tr.titleId = Title.id
            )`),
                "rating_1_count",
            ],
            [
                literal(`(
                SELECT COUNT(CASE WHEN tr.rating = 2 THEN 1 END)
                FROM ${titleRatingsTableName} AS tr
                WHERE tr.titleId = Title.id
            )`),
                "rating_2_count",
            ],
            [
                literal(`(
                SELECT COUNT(CASE WHEN tr.rating = 3 THEN 1 END)
                FROM ${titleRatingsTableName} AS tr
                WHERE tr.titleId = Title.id
            )`),
                "rating_3_count",
            ],
            [
                literal(`(
                SELECT COUNT(CASE WHEN tr.rating = 4 THEN 1 END)
                FROM ${titleRatingsTableName} AS tr
                WHERE tr.titleId = Title.id
            )`),
                "rating_4_count",
            ],
            [
                literal(`(
                SELECT COUNT(CASE WHEN tr.rating = 5 THEN 1 END)
                FROM ${titleRatingsTableName} AS tr
                WHERE tr.titleId = Title.id
            )`),
                "rating_5_count",
            ],
            [
                literal(`(
                SELECT AVG(tr.rating)
                FROM ${titleRatingsTableName} AS tr
                WHERE tr.titleId = Title.id
            )`),
                "rating_average",
            ],
            [
                literal(`(
                SELECT COUNT(tr.email)
                FROM ${titleRatingsTableName} AS tr
                WHERE tr.titleId = Title.id
            )`),
                "rating_count",
            ],
        ]
    }
    static GET_GENRES_INCLUDE() {
        const titleGenresTableName = Title.#models.TitleGenre.getTableName()
        return [
            [
                literal(`(
                SELECT GROUP_CONCAT(tg.genre)
                FROM ${titleGenresTableName} AS tg
                WHERE tg.titleId = Title.id
            )`),
                "all_genres",
            ],
        ]
    }

    static GET_FAVORITES_INCLUDE() {
        const titleFavoritesTableName = Title.#models.TitleFavorite.getTableName()
        return [
            [
                literal(`(
                SELECT COUNT(tf.email)
                FROM ${titleFavoritesTableName} AS tf
                WHERE tf.titleId = Title.id
            )`),
                "favorite_count",
            ],
        ]
    }
    static GET_CONTENT_ADVISORIES_INCLUDE() {
        const titleContentAdvisoriesTableName = Title.#models.TitleContentAdvisory.getTableName()
        return [
            [
                literal(`(
                SELECT GROUP_CONCAT(tcd.contentAdvisory)
                FROM ${titleContentAdvisoriesTableName} AS tcd
                WHERE tcd.titleId = Title.id
            )`),
                "all_content_advisories",
            ],
        ]
    }

    static GetByID(id, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.Exists(id)) {
                    const default_query = {
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
                            include: ["id", "label", "description", "copyright", "originalTranslation"].concat(
                                Title.GET_INSTALLMENT_INCLUDE(),
                                Title.GET_OTHERTRANSLATIONS_INCLUDE(),
                                Title.GET_RATINGS_INCLUDE(),
                                Title.GET_GENRES_INCLUDE(),
                                Title.GET_FAVORITES_INCLUDE(),
                                Title.GET_CONTENT_ADVISORIES_INCLUDE()
                            ),
                        },
                        group: default_query.group,
                    })

                    const { createdAt: c1, updatedAt: u1, all_other_translations, all_genres, all_content_advisories, ...rest1 } = original_title_data.toJSON()
                    const all_title_data = {
                        ...rest1,
                        all_other_translations: all_other_translations ? all_other_translations.split(",") : [],
                        all_genres: all_genres ? all_genres.split(",") : [],
                        all_content_advisories: all_content_advisories ? all_content_advisories.split(",") : [],
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

    static GetAll({ getNewestReleases = false, limit = 10, offset = 0, search = undefined, genereFilter = [] } = {}, transaction = null) {
        return new Promise(async (resolve, reject) => {
            const newestReleasesShowing = 6

            try {
                const default_query = {
                    where: {},
                    include: [],
                    order: [],
                    having: {},
                    group: [col("Title.id")],
                }

                if (transaction) {
                    default_query.transaction = transaction
                }

                if (getNewestReleases) {
                    default_query.order.push(["createdAt", "ASC"])
                }

                if (genereFilter && genereFilter.length > 0) {
                    default_query.include.push({
                        model: Title.#models.TitleGenre,
                        required: true,
                        attributes: [],
                        where: {
                            genre: {
                                [Op.in]: genereFilter,
                            },
                        },
                    })
                }

                if (search) {
                    default_query.where.label = { [Op.like]: `%${search}%` }
                }

                default_query.limit = getNewestReleases ? newestReleasesShowing : limit

                default_query.offset = getNewestReleases ? 0 : offset

                const original_title_data = await Title.findAll({
                    where: default_query.where,
                    include: default_query.include,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: ["id", "label", "description", "copyright", "originalTranslation"].concat(
                            this.GET_INSTALLMENT_INCLUDE(),
                            this.GET_OTHERTRANSLATIONS_INCLUDE(),
                            this.GET_RATINGS_INCLUDE(),
                            this.GET_GENRES_INCLUDE(),
                            this.GET_FAVORITES_INCLUDE(),
                            Title.GET_CONTENT_ADVISORIES_INCLUDE()
                        ),
                    },
                    group: default_query.group,
                    having: default_query.having,
                    order: default_query.order,
                    limit: default_query.limit,
                    offset: default_query.offset,
                })

                resolve(
                    original_title_data.map((element, index) => {
                        const { createdAt: c1, updatedAt: u1, all_other_translations, all_genres, all_content_advisories, ...rest1 } = element.toJSON()
                        const all_title_data = {
                            ...rest1,
                            all_other_translations: all_other_translations ? all_other_translations.split(",") : [],
                            all_genres: all_genres ? all_genres.split(",") : [],
                            all_content_advisories: all_content_advisories ? all_content_advisories.split(",") : [],
                        }
                        return all_title_data
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
