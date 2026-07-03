const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class TitleRating extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleRating.init(
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
                rating: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    validate: {
                        min: 1,
                        max: 5,
                    },
                },
            },
            {
                sequelize,
                modelName: `${TitleRating.name}`,
            }
        )
        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize: _s, models }) {
        TitleRating.belongsTo(models.Title, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleRating.belongsTo(models.Member, {
            foreignKey: "email",
            sourceKey: "email",
            onDelete: "CASCADE",
        })
        return
    }

    //
    // Member Exists in DB true otherwise false
    //
    static async Exists(email, titleID) {
        const instance = await TitleRating.findOne({
            where: {
                email: email,
                titleID: titleID,
            },
        })
        return instance ? true : false
    }

    //
    //
    // reject --> string: error msg
    // resolve --> instance: created Member
    //
    // rating must be a INTEGER within [1,5]
    static async AddToDB(email, titleID, rating) {
        if (await this.Exists(email, titleID)) {
            Logging.LogWarning(`email & titleID pair exists`)
            throw new Error(`${email} already has this ${titleID}`)
        }

        try {
            const newTitleRate = await TitleRating.build({
                email: email,
                titleID: titleID,
                rating: rating,
            })

            await newTitleRate.validate()

            await newTitleRate.save()

            return newTitleRate
        } catch (err) {
            Logging.LogError(`could not add  ${TitleRating.name} to database ${email}|${titleID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveFromDB(email, titleID) {
        if (!(await this.Exists(email, titleID))) {
            Logging.LogWarning(`email & titleID pair does not exist`)
            throw new Error(`${email} does not have a rating for ${titleID}`)
        }

        try {
            await TitleRating.destroy({
                where: {
                    email: email,
                    titleID: titleID,
                },
            })

            return
        } catch (err) {
            Logging.LogError(`could not remove ${TitleRating.name} from database ${email}|${titleID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async UpdateDB(email, titleID, { rating = undefined } = {}) {
        if (!(await this.Exists(email, titleID))) {
            Logging.LogWarning(`email & titleID pair does not exist`)
            throw new Error(`${email} does not have a rating for ${titleID}`)
        }

        try {
            await TitleRating.update(
                {
                    rating: rating,
                },
                {
                    where: {
                        email: email,
                        titleID: titleID,
                    },
                }
            )

            return
        } catch (err) {
            Logging.LogError(`could not update ${TitleRating.name} from database ${email}|${titleID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async GetAllByTitleID(titleID, { limit = 10, offset = 0 } = {}) {
        try {
            const titleRatings = await TitleRating.findAll({
                where: {
                    titleID: titleID,
                    limit: limit,
                    offset: offset,
                },
            })

            return titleRatings.map((element) => {
                return element.toJSON()
            })
        } catch (err) {
            Logging.LogError(`could not get list of ${TitleRating.name} from database using titleID:${titleID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> instance: single found TitleRating
    //
    static async etByEmailANDTitleID(email, titleID) {
        try {
            const titleRating = await TitleRating.findOne({
                where: {
                    email: email,
                    titleID: titleID,
                },
            })

            if (titleRating) {
                return titleRating.toJSON()
            } else {
                throw new Error(`email:${email} has not rated titleID:${titleID}`)
            }
        } catch (err) {
            Logging.LogError(`could not get ${TitleRating.name} from database using email:${email}|titleID:${titleID} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    /**
     * reject --> string: error msg
     * resolve --> instance: multiple found TitleRating rows Title rating Data
     *
     * @deprecated this is only useful in cases where we do not get the title data themselves as they include the rating data for a title now using the Title model gets. ( USE MODEL Title )
     */
    static async GetTitleRatingData(titleID) {
        const titleRatingList = await this.GetAllByTitleID(titleID)

        const rateData = {}

        rateData.count = titleRatingList.length
        rateData.rate1Count = 0
        rateData.rate2Count = 0
        rateData.rate3Count = 0
        rateData.rate4Count = 0
        rateData.rate5Count = 0
        rateData.avg = 0

        let ratingTotal = 0

        titleRatingList.forEach((element) => {
            ratingTotal = ratingTotal + element.rating
            rateData[`rate${element.rating}Count`] = rateData[`rate${element.rating}Count`] + 1
        })

        if (titleRatingList.length > 0) {
            rateData.avg = ratingTotal / titleRatingList.length
        }

        return rateData
    }
}

module.exports.TitleRating = TitleRating
