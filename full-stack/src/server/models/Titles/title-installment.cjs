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
        const anime = await TitleInstallment.findByPk(id)
        return anime ? true : false
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
                await uploads.recursiveDirDeleteInAnime(dirName)
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

    static UpdateInDB(id, { label = null, installmentNum = null, isSeason = null } = {}, transaction = null) {
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

                if (isSeason) {
                    updateValues.isSeason = isSeason
                }

                const query = {}
                query.where = {}
                query.where.id = id
                if (transaction) {
                    query.transaction = transaction
                }

                if (installmentNum) {
                    if (installmentNum > (await TitleInstallment.count({ where: { titleID: installment.titleID } }))) {
                        reject(new Error(`installmentNum ${installmentNum} is greater than the number of installments for title with id:${installment.titleID}`))
                    }

                    updateValues.installmentNum = installmentNum

                    const requiredChangedInstallment = await TitleInstallment.GetAll({ titleID: installment.titleID, installmentNum: installmentNum }, transaction)
                    const requiredChangedQuery = {}
                    requiredChangedQuery.where = {}
                    requiredChangedQuery.where.id = requiredChangedInstallment.id
                    if (transaction) {
                        requiredChangedQuery.transaction = transaction
                    }
                    await TitleInstallment.update({ installmentNum: -1 }, requiredChangedQuery)
                    await requiredChangedInstallment.reload({ transaction: transaction })

                    await TitleInstallment.update(updateValues, query)

                    if (updateValues.installmentNum > installment.installmentNum) {
                        await TitleInstallment.UpdateInDB(requiredChangedInstallment.id, { installmentNum: installmentNum - 1 }, transaction)
                    } else if (updateValues.installmentNum < installment.installmentNum) {
                        await TitleInstallment.UpdateInDB(requiredChangedInstallment.id, { installmentNum: installmentNum + 1 }, transaction)
                    }
                }

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
        return [
            [
                literal(`(
                SELECT COUNT(*)
                FROM TitleInstallmentStreams AS tis
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
                                required: true,
                                attributes: {
                                    exclude: ["createdAt", "updatedAt"],
                                    include: ["id", "installmentID", "titleID", "label", "streamNumber", "synopsis", "releaseDate"].concat(
                                        TitleInstallment.#models.TitleInstallmentStream.GET_STREAMLIKES_INCLUDE(true),
                                        TitleInstallment.#models.TitleInstallmentStream.GET_WATCHHISTORY_INCLUDE(true)
                                    ),
                                },
                                order: ["streamNumber", "ASC"],
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
                    where: {},
                }
                query.order = []
                query.order.push(["createdAt", "ASC"])

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
                        required: true,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: ["id", "installmentID", "titleID", "label", "streamNumber", "synopsis", "releaseDate"].concat(
                                TitleInstallment.#models.TitleInstallmentStream.GET_STREAMLIKES_INCLUDE(true),
                                TitleInstallment.#models.TitleInstallmentStream.GET_WATCHHISTORY_INCLUDE(true)
                            ),
                            order: ["streamNumber", "ASC"],
                        },
                    },
                ]

                query.attributes = {
                    include: ["id", "titleID", "label", "isSeason", "installmentNum"].concat(TitleInstallment.GET_STREAMS_INCLUDE(false)),
                }

                query.group = [col("id")]

                const installmentList = await TitleInstallment.findAll(query)

                resolve(
                    installmentList.map((element) => {
                        const { createdAt: c1, updatedAt: u1, ...rest } = element.toJSON()
                        return rest
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get all ${TitleInstallment.name} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }
}

module.exports.TitleInstallment = TitleInstallment
