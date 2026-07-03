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
    static async Connect_Associations({ sequelize: _s, models }) {
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
    static async AddToDB(titleID, translation, transaction = null) {
        if (await this.Exists(titleID, translation, transaction)) {
            Logging.LogWarning(`titleID & translation pair exists`)
            throw new Error(`title already has this translation`)
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

            return newTitleOtherTranslation
        } catch (err) {
            Logging.LogError(`could not add ${TitleOtherTranslation.name} to database ${titleID}|${translation} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveFromDB(titleID, translation) {
        if (!(await this.Exists(titleID, translation))) {
            Logging.LogWarning(`titleID & translation pair does not exist exists`)
            throw new Error(`${titleID} is already not having ${translation} not as a translation`)
        }

        try {
            await TitleOtherTranslation.destroy({
                where: {
                    titleID: titleID,
                    translation: translation,
                },
            })
        } catch (err) {
            Logging.LogError(`could not remove ${TitleOtherTranslation.name} from database ${titleID}|${translation} --- ${err.message}`)
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

            await TitleOtherTranslation.destroy(query)
        } catch (err) {
            Logging.LogError(`could not remove all ${TitleOtherTranslation.name} from database by ${titleID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async GetAllByTitleID(titleID, { limit = 10, offset = 0 } = {}) {
        try {
            const titleOtherTranslations = await TitleOtherTranslation.findAll({
                where: {
                    titleID: titleID,
                    limit: limit,
                    offset: offset,
                },
            })
            return titleOtherTranslations.map((element) => {
                const { titleID: _t, createdAt: _c, updatedAt: _u, ...rest } = element.toJSON()
                return rest
            })
        } catch (err) {
            Logging.LogError(
                `could not get list of ${TitleOtherTranslation.name} from database using titleID:${titleID} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }

    static async GetAllByTranslation(translation, { limit = 10, offset = 0 } = {}) {
        try {
            const titleOtherTranslations = await TitleOtherTranslation.findAll({
                where: {
                    translation: translation,
                    limit: limit,
                    offset: offset,
                },
            })
            return titleOtherTranslations
        } catch (err) {
            Logging.LogError(
                `could not get list of ${TitleOtherTranslation.name} from database using translation:${translation} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }

    static async GetByTitleTranslation(titleID, translation) {
        try {
            if (await this.Exists(titleID, translation)) {
                const titleGenre = await TitleOtherTranslation.findOne({
                    where: {
                        titleID: titleID,
                        translation: translation,
                    },
                })
                return titleGenre
            } else {
                Logging.LogWarning(`${TitleOtherTranslation.name} does not exist ${titleID}|${translation}`)
                throw new Error(errormsg.titleOtherTranslationDoesNotExist)
            }
        } catch (err) {
            Logging.LogError(`could not get ${TitleOtherTranslation.name} from database ${titleID}|${translation} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }
}

module.exports.TitleOtherTranslation = TitleOtherTranslation
