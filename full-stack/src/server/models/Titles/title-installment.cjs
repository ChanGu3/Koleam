const path = require("path")
const { DataTypes, fn, col, literal } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { uploads } = require("../../server-uploads.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class TitleInstallment extends ModelExtension {
    static #models = null

    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleInstallment.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                },
                titleID: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: models.Title,
                        key: "id",
                    },
                    onDelete: "CASCADE",
                },
                label: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                isSeason: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                installmentNum: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: `${TitleInstallment.name}`,
                indexes: [
                    {
                        unique: true,
                        fields: ["titleID", "installmentNum"],
                    },
                ],
            }
        )

        TitleInstallment.#models = models

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        TitleInstallment.belongsTo(models.Title, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallment.hasMany(models.TitleInstallmentStream, {
            foreignKey: "installmentID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        return
    }

    static async #Exists(id) {
        const title = await TitleInstallment.findByPk(id)
        return title ? true : false
    }

    static #TitleDirPath(titleInstallment) {
        return path.join(titleInstallment.titleID, titleInstallment.id)
    }

    static #CreateDirectory(titleInstallment) {
        return new Promise(async (resolve, reject) => {
            try {
                const dirName = this.#TitleDirPath(titleInstallment)
                await uploads.mkDir(dirName)
                resolve(dirName)
            } catch (err) {
                Logging.LogError(`${TitleInstallment.name} directory creation could not be resolved for id:${titleInstallment.id} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static #DeleteDirectory(titleInstallment) {
        return new Promise(async (resolve, reject) => {
            try {
                const dirName = this.#TitleDirPath(titleInstallment)
                await uploads.recursiveDirDeleteInTitles(dirName)
                resolve(dirName)
            } catch (err) {
                Logging.LogError(`${TitleInstallment.name} directory removal could not be resolved for id:${titleInstallment.id} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static AddToDB(titleID, label, isSeason) {
        return new Promise(async (resolve, reject) => {
            try {
                const titleInstallment = await TitleInstallment.build({
                    titleID: titleID,
                    label: label,
                    isSeason: isSeason,
                    installmentNum: await TitleInstallment.count({
                        where: {
                            titleID: titleID,
                        },
                    }),
                })

                await titleInstallment.validate()

                await titleInstallment.save()

                await this.#CreateDirectory(titleInstallment)
                resolve(titleInstallment)
            } catch (err) {
                Logging.LogError(`could not add ${TitleInstallment.name} to database ${label} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static UpdateInDB(id, { label = null, installmentNumber = null, isSeason = null } = {}, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const installment = await TitleInstallment.GetByID(id)
                if (!(await uploads.doesTitlesPathExist(this.#TitleDirPath(installment)))) {
                    await this.#CreateDirectory(installment)
                    Logging.LogWarning(`directory does not exist forced re-creation of directory for installment called ${installment.title}`)
                }

                const updateValues = {}
                if (label) {
                    updateValues.label = label
                }

                if (isSeason !== null && isSeason !== undefined) {
                    updateValues.isSeason = isSeason
                }

                const query = {}
                query.where = { id }
                if (transaction) {
                    query.transaction = transaction
                }

                if (installmentNumber !== null && installmentNumber !== undefined) {
                    if (installmentNumber < 0) {
                        reject(new Error(`installmentNumber must be a non-negative number`))
                    }

                    updateValues.installmentNum = installmentNumber
                    const installmentToChange = await TitleInstallment.GetByID(id)
                    const installmentToChangeOldNum = installmentToChange.installmentNum
                    await TitleInstallment.update({ installmentNum: -1 }, { where: { id: installmentToChange.id }, transaction })

                    if (installmentNumber > installmentToChangeOldNum) {
                        for (let i = installmentToChangeOldNum + 1; i <= installmentNumber; i++) {
                            const nextInstallment = await TitleInstallment.GetAll({ titleID: installmentToChange.titleID, installmentNum: i }, transaction)
                            if (nextInstallment[0]) {
                                const nextUpdateValues = { installmentNum: i - 1 }
                                const nextQuery = {
                                    where: {
                                        id: nextInstallment[0].id,
                                    },
                                    transaction,
                                }
                                await TitleInstallment.update(nextUpdateValues, nextQuery)
                            }
                        }
                    } else if (installmentNumber < installmentToChangeOldNum) {
                        for (let i = installmentToChangeOldNum - 1; i >= installmentNumber; i--) {
                            const nextInstallment = await TitleInstallment.GetAll({ titleID: installmentToChange.titleID, installmentNum: i })
                            if (nextInstallment[0]) {
                                const nextUpdateValues = { installmentNum: i + 1 }
                                const nextQuery = {
                                    where: {
                                        id: nextInstallment[0].id,
                                    },
                                    transaction,
                                }
                                await TitleInstallment.update(nextUpdateValues, nextQuery)
                            }
                        }
                    }
                }

                await TitleInstallment.update(updateValues, query)

                resolve()
            } catch (err) {
                Logging.LogError(`could not update ${TitleInstallment.name} in database ${id} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static RemoveFromDB(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.#Exists(id)) {
                    const installment = await TitleInstallment.findByPk(id)
                    const dirName = this.#TitleDirPath(installment)

                    await TitleInstallment.destroy({
                        where: {
                            id: installment.id,
                        },
                    })

                    for (let i = installment.installmentNum; i < (await TitleInstallment.count({ where: { titleID: installment.titleID } })); i++) {
                        const nextInstallment = await TitleInstallment.GetAll({ titleID: installment.titleID, installmentNum: i + 1 })
                        if (nextInstallment[0]) {
                            const updateValues = { installmentNum: i }
                            const query = {
                                where: {
                                    id: nextInstallment[0].id,
                                },
                            }
                            await TitleInstallment.update(updateValues, query)
                        }
                    }

                    if (await uploads.doesTitlesPathExist(dirName)) {
                        this.#DeleteDirectory(installment)
                    }
                } else {
                    Logging.LogWarning(`${TitleInstallment.name} with id:${id} does not exists so removing is unnecessary`)
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${TitleInstallment.name} from database ${id} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GET_STREAMS_INCLUDE(isPlural = false) {
        const titleInstallmentStreamName = TitleInstallment.#models.TitleInstallmentStream.getTableName()

        return [
            [
                literal(`(
                SELECT COUNT(*)
                FROM ${titleInstallmentStreamName} AS tis
                WHERE tis.installmentID = TitleInstallment${isPlural ? "s" : ""}.id
            )`),
                "streams_count",
            ],
        ]
    }

    static GetByID(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.#Exists(id)) {
                    const installment = await TitleInstallment.findOne({
                        where: {
                            id: id,
                        },
                        include: [
                            {
                                model: TitleInstallment.#models.TitleInstallmentStream,
                                required: false,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"],
                                    include: ["id", "installmentID", "titleID", "label", /* "streamNumber", */ "synopsis", "releaseDate"].concat(
                                        TitleInstallment.#models.TitleInstallmentStream.GET_STREAMLIKES_INCLUDE(true),
                                        TitleInstallment.#models.TitleInstallmentStream.GET_WATCHHISTORY_INCLUDE(true),
                                        TitleInstallment.#models.TitleInstallmentStream.GET_STREAM_ORDER_NUMBER_BY_REALEASE_DATE_INCLUDE(true)
                                    ),
                                },
                                order: [[literal("order_number_by_release_date"), "ASC"]],
                            },
                        ],
                        attributes: {
                            include: ["id", "titleID", "label", "isSeason", "installmentNum"].concat(TitleInstallment.GET_STREAMS_INCLUDE(false)),
                        },
                        group: [col("TitleInstallment.id")],
                    })
                    const { createdAt: c1, updatedAt: u1, ...rest } = installment.toJSON()
                    resolve(rest)
                } else {
                    reject(new Error(`could not get ${TitleInstallment.name} with id: ${id}`))
                }
            } catch (err) {
                Logging.LogError(`could not get ${TitleInstallment.name} with id: ${id} --- ${err}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetAll({ titleID = null, installmentNum = null, limit = 10, offset = 0 } = {}, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const query = {
                    limit: limit,
                    offset: offset,
                    order: [["installmentNum", "ASC"]],
                    where: {},
                }

                if (transaction) {
                    query.transaction = transaction
                }

                if (titleID) {
                    query.where.titleID = titleID
                }

                if (installmentNum) {
                    query.where.installmentNum = installmentNum
                }

                query.include = [
                    {
                        model: TitleInstallment.#models.TitleInstallmentStream,
                        required: false,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: ["id", "installmentID", "titleID", "label", /* "streamNumber", */ "synopsis", "releaseDate"].concat(
                                TitleInstallment.#models.TitleInstallmentStream.GET_STREAMLIKES_INCLUDE(true),
                                TitleInstallment.#models.TitleInstallmentStream.GET_WATCHHISTORY_INCLUDE(true),
                                TitleInstallment.#models.TitleInstallmentStream.GET_STREAM_ORDER_NUMBER_BY_REALEASE_DATE_INCLUDE(true)
                            ),
                        },
                        order: [[literal("order_number_by_release_date"), "ASC"]],
                    },
                ]

                query.attributes = {
                    include: ["id", "titleID", "label", "isSeason", "installmentNum"].concat(TitleInstallment.GET_STREAMS_INCLUDE(false)),
                }

                let installmentList = null
                if (titleID && installmentNum) {
                    installmentList = await TitleInstallment.findOne(query)
                    const { createdAt: c1, updatedAt: u1, ...rest } = installmentList.toJSON()
                    resolve([rest])
                } else {
                    installmentList = await TitleInstallment.findAll(query)
                    resolve(
                        installmentList.map((element) => {
                            const { createdAt: c1, updatedAt: u1, ...rest } = element.toJSON()
                            return rest
                        })
                    )
                }
            } catch (err) {
                Logging.LogError(`could not get all ${TitleInstallment.name} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }
}

module.exports.TitleInstallment = TitleInstallment
