const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class TitleOtherTranslation extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleOtherTranslation.init(
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
                translation: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
            },
            {
                sequelize,
                modelName: `${TitleOtherTranslation.name}`,
            }
        )

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        TitleOtherTranslation.belongsTo(models.Title, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })
        return
    }

    //
    // Member Exists in DB true otherwise false
    //
    static async Exists(titleID, translation, transaction = null) {
        const instance = await TitleOtherTranslation.findOne({
            where: {
                titleID: titleID,
                translation: translation,
            },
            transaction,
        })
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created title other translation
    //
    static AddToDB(titleID, translation, transaction = null) {
        return new Promise(async (resolve, reject) => {
            if (await this.Exists(titleID, translation, transaction)) {
                Logging.LogWarning(`titleID & translation pair exists`)
                reject(new Error(`title already has this translation`))
                return
            }

            try {
                const newTitleOtherTranslation = await TitleOtherTranslation.build({
                    titleID: titleID,
                    translation: translation,
                })

                await newTitleOtherTranslation.validate()

                if (transaction) {
                    await newTitleOtherTranslation.save({ transaction })
                } else {
                    await newTitleOtherTranslation.save()
                }

                resolve(newTitleOtherTranslation)
            } catch (err) {
                Logging.LogError(`could not add ${TitleOtherTranslation.name} to database ${titleID}|${translation} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveFromDB(titleID, translation) {
        return new Promise(async (resolve, reject) => {
            if (!(await this.Exists(titleID, translation))) {
                Logging.LogWarning(`titleID & translation pair does not exist exists`)
                reject(new Error(`${titleID} is already not having ${translation} not as a translation`))
                return
            }

            try {
                await TitleOtherTranslation.destroy({
                    where: {
                        titleID: titleID,
                        translation: translation,
                    },
                })

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${TitleOtherTranslation.name} from database ${titleID}|${translation} --- ${err.message}`)
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

                const deleted = await TitleOtherTranslation.destroy(query)
                resolve()
            } catch (err) {
                Logging.LogError(`could not remove all ${TitleOtherTranslation.name} from database by ${titleID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetAllByTitleID(titleID) {
        return new Promise(async (resolve, reject) => {
            try {
                const titleOtherTranslations = await TitleOtherTranslation.findAll({
                    where: {
                        titleID: titleID,
                    },
                })
                resolve(
                    titleOtherTranslations.map((element) => {
                        const { animeID, createdAt, updatedAt, ...rest } = element.toJSON()
                        return rest
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get list of ${TitleOtherTranslation.name} from database using animeID:${titleID} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetAllByGenre(translation) {
        return new Promise(async (resolve, reject) => {
            try {
                const titleOtherTranslations = await TitleOtherTranslation.findAll({
                    where: {
                        translation: translation,
                    },
                })
                resolve(titleOtherTranslations)
            } catch (err) {
                Logging.LogError(`could not get list of ${TitleOtherTranslation.name} from database using translation:${translation} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByTitleTranslation(titleID, translation) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.Exists(titleID, translation)) {
                    const titleGenre = await TitleOtherTranslation.findOne({
                        where: {
                            titleID: titleID,
                            translation: translation,
                        },
                    })
                    resolve(titleGenre)
                } else {
                    Logging.LogWarning(`${TitleOtherTranslation.name} does not exist ${titleID}|${translation} --- ${err.message}`)
                    reject(new Error(errormsg.titleOtherTranslationDoesNotExist))
                }
            } catch (err) {
                Logging.LogError(`could not get ${TitleOtherTranslation.name} from database ${titleID}|${translation} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.TitleOtherTranslation = TitleOtherTranslation
