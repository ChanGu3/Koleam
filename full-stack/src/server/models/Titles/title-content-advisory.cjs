const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class TitleContentAdvisory extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleContentAdvisory.init(
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
                contentAdvisory: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
            },
            {
                sequelize,
                modelName: `${TitleContentAdvisory.name}`,
            }
        )

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize: _s, models }) {
        TitleContentAdvisory.belongsTo(models.Title, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })
        return
    }

    //
    // content advisory exists in DB true otherwise false
    //
    static async Exists(titleID, contentAdvisory, transaction = null) {
        const instance = await TitleContentAdvisory.findOne({
            where: {
                titleID: titleID,
                contentAdvisory: contentAdvisory,
            },
            transaction: transaction,
        })
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created title genre
    //
    static async AddToDB(titleID, contentAdvisory, transaction = null) {
        if (await this.Exists(titleID, contentAdvisory, transaction)) {
            Logging.LogWarning(`titleID & content advisory pair exists`)
            throw new Error(`title already has this genre`)
        }

        try {
            const newTitleContentAdvisory = await TitleContentAdvisory.build({
                titleID: titleID,
                contentAdvisory: contentAdvisory,
            })

            await newTitleContentAdvisory.validate()

            if (transaction) {
                await newTitleContentAdvisory.save({ transaction })
            } else {
                await newTitleContentAdvisory.save()
            }

            return newTitleContentAdvisory
        } catch (err) {
            Logging.LogError(`could not add ${TitleContentAdvisory.name} to database ${titleID}|${contentAdvisory} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    //
    //
    static async GetAllByTitleID(titleID, { limit = 10, offset = 0 } = {}) {
        try {
            const titleContentAdvisories = await TitleContentAdvisory.findAll({
                where: {
                    titleID: titleID,
                },
                limit: limit,
                offset: offset,
            })
            return titleContentAdvisories.map((element) => {
                return element.toJSON()
            })
        } catch (err) {
            Logging.LogError(`could not get list of ${TitleContentAdvisory.name} from database using titleID:${titleID} --- ${err.message}`)
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

            await TitleContentAdvisory.destroy(query)
        } catch (err) {
            Logging.LogError(`could not remove all ${TitleContentAdvisory.name} from database by ${titleID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveByTitleIDAndContentAdvsoryFromDB(titleID, contentAdvisory, transaction = null) {
        try {
            const query = {}
            query.where = {}
            query.where.titleID = titleID
            query.where.contentAdvisory = contentAdvisory
            if (transaction) {
                query.transaction = transaction
            }

            await TitleContentAdvisory.destroy(query)
        } catch (err) {
            Logging.LogError(
                `could not remove ${TitleContentAdvisory.name} from database by titleID ${titleID} and contentAdvisory ${contentAdvisory} --- ${err.message}`
            )
            throw new Error(errormsg.fallback)
        }
    }
}

module.exports.TitleContentAdvisory = TitleContentAdvisory
