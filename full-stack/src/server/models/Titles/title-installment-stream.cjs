const path = require("path")
const { DataTypes } = require("sequelize")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { uploads } = require("../../server-uploads.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class TitleInstallmentStream extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        TitleInstallmentStream.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    allowNull: false,
                    primaryKey: true,
                },
                installmentID: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: models.TitleInstallment,
                        key: "id",
                    },
                    onDelete: "CASCADE",
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
                streamNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                synopsis: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                releaseDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: `${TitleInstallmentStream.name}`,
                indexes: [
                    {
                        unique: true,
                        fields: ["installmentID", "label"],
                    },
                    {
                        unique: true,
                        fields: ["installmentID", "streamNumber"],
                    },
                ],
            }
        )

        return
    }

    /**
     * @override
     */
    static async Connect_Associations({ sequelize, models }) {
        TitleInstallmentStream.belongsTo(models.Title, {
            foreignKey: "titleID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallmentStream.belongsTo(models.TitleInstallment, {
            foreignKey: "installmentID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallmentStream.hasMany(models.TitleInstallmentStreamLike, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        TitleInstallmentStream.hasMany(models.TitleInstallmentStreamWatchHistory, {
            foreignKey: "streamID",
            sourceKey: "id",
            onDelete: "CASCADE",
        })

        return
    }

    static async #Exists(id) {
        const stream = await TitleInstallmentStream.findByPk(id)
        return stream ? true : false
    }

    static #TitleStreamDirPath(titleStream) {
        return path.join(titleStream.titleID, titleStream.installmentID, titleStream.label)
    }

    static #CreateDirectory(titleStream) {
        return new Promise(async (resolve, reject) => {
            try {
                const dirName = this.#TitleStreamDirPath(titleStream)
                await uploads.mkDir(dirName)
                resolve(dirName)
            } catch (err) {
                Logging.LogError(`${TitleInstallmentStream.name} directory creation could not be resolved for title:${titleStream.title} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static #RenameDirectory(oldTitleStream, newTitleStream) {
        return new Promise(async (resolve, reject) => {
            try {
                const oldRelativePath = this.#TitleStreamDirPath(oldTitleStream)
                const newRelativePath = this.#TitleStreamDirPath(newTitleStream)
                await uploads.rnDir(oldRelativePath, newRelativePath)
                resolve(newRelativePath)
            } catch (err) {
                Logging.LogError(`${TitleInstallmentStream.name} directory renaming could not be resolved for title:${oldTitleStream.title} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static #DeleteDirectory(titleStream) {
        return new Promise(async (resolve, reject) => {
            try {
                const dirName = this.#TitleStreamDirPath(titleStream)
                await uploads.recursiveDirDeleteInTitles(dirName)
                resolve(dirName)
            } catch (err) {
                Logging.LogError(`${TitleInstallmentStream.name} directory removal could not be resolved for title:${titleStream.title} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    static AddToDB(titleID, installmentID, label, streamNumber, synopsis, releaseDate) {
        return new Promise(async (resolve, reject) => {
            try {
                const titleStream = await TitleInstallmentStream.build({
                    installmentID: installmentID,
                    label: label,
                    streamNumber: streamNumber,
                    synopsis: synopsis,
                    releaseDate: releaseDate,
                    titleID: titleID,
                })

                await titleStream.validate()

                await titleStream.save()

                await this.#CreateDirectory(titleStream)
                resolve(titleStream)
            } catch (err) {
                Logging.LogError(`could not add ${TitleInstallmentStream.name} to database ${label} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static UpdateInDB(id, { label = null, synopsis = null, releaseDate = null, streamNumber = null }, transaction = null) {
        return new Promise(async (resolve, reject) => {
            let renameDirectory = false
            let newTitleStream = null
            let oldTitleStream = null
            try {
                oldTitleStream = await TitleInstallmentStream.GetByID(id)
                if (!(await uploads.doesTitlesPathExist(this.#TitleStreamDirPath(oldTitleStream)))) {
                    await this.#CreateDirectory(oldTitleStream)
                    Logging.LogWarning(`directory does not exist had to re-create directory for stream called ${oldTitleStream.title}`)
                }

                const updateValues = {}
                if (label) {
                    updateValues.label = label
                }
                if (synopsis) {
                    updateValues.synopsis = synopsis
                }
                if (releaseDate) {
                    updateValues.releaseDate = releaseDate
                }

                const query = {}
                query.where = {}
                query.where.id = id
                if (transaction) {
                    query.transaction = transaction
                }

                if (updateValues.label) {
                    newTitleStream = await TitleInstallmentStream.GetByID(oldTitleStream.id, transaction)
                    await this.#RenameDirectory(oldTitleStream, newTitleStream)
                    renameDirectory = true
                }

                if (streamNumber) {
                    if (streamNumber > (await TitleInstallmentStream.count({ where: { installmentID: installment.installmentID } }))) {
                        reject(new Error(`streamNumber ${streamNumber} is greater than the number of streams for the installment with id:${installment.installmentID}`))
                    }

                    updateValues.streamNumber = streamNumber

                    const requiredChangedStream = await TitleInstallmentStream.GetAll({ installmentID: oldTitleStream.installmentID, streamNumber: streamNumber }, transaction)
                    const requiredChangedQuery = {}
                    requiredChangedQuery.where = {}
                    requiredChangedQuery.where.id = requiredChangedStream.id
                    if (transaction) {
                        requiredChangedQuery.transaction = transaction
                    }
                    await TitleInstallmentStream.update({ streamNumber: -1 }, requiredChangedQuery)
                    await requiredChangedStream.reload({ transaction: transaction })

                    await TitleInstallmentStream.update(updateValues, query)

                    if (updateValues.streamNumber > oldTitleStream.streamNumber) {
                        await TitleInstallmentStream.UpdateInDB(requiredChangedStream.id, { streamNumber: streamNumber - 1 }, transaction)
                    } else if (updateValues.streamNumber < oldTitleStream.streamNumber) {
                        await TitleInstallmentStream.UpdateInDB(requiredChangedStream.id, { streamNumber: streamNumber + 1 }, transaction)
                    }
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not update ${TitleInstallmentStream.name} in database ${id} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
                if (renameDirectory) {
                    await this.#RenameDirectory(newTitleStream, oldTitleStream)
                }
            }
        })
    }

    static RemoveFromDB(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.#Exists(id)) {
                    const titleStream = await TitleInstallmentStream.findOne({
                        where: {
                            id: id,
                        },
                    })
                    const dirName = this.#TitleStreamDirPath(titleStream)

                    await TitleInstallmentStream.destroy({
                        where: {
                            id: id,
                        },
                    })

                    if (await uploads.doesTitlesPathExist(dirName)) {
                        this.#DeleteDirectory(titleStream)
                    }
                } else {
                    Logging.LogWarning(`${TitleInstallmentStream.name} with id:${id} does not exists so removing is unnecessary`)
                }

                resolve()
            } catch (err) {
                Logging.LogError(`could not remove ${TitleInstallmentStream.name} from database id:${id} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetByID(id, transaction = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (await this.#Exists(id)) {
                    const default_query = {
                        where: {
                            id: id,
                        },
                    }
                    if (transaction) {
                        default_query.transaction = transaction
                    }

                    default_query.group = [col("TitleInstallmentStream.id")]

                    const original_title_installment_data = await TitleInstallmentStream.findOne({
                        where: default_query.where,
                        transaction: default_query.transaction,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: ["id", "installmentID", "titleID", "label", "streamNumber", "synopsis", "releaseDate"],
                        },
                        group: default_query.group,
                    })

                    const stream_like_title_installment_data = await TitleInstallmentStream.findOne({
                        where: default_query.where,
                        transaction: default_query.transaction,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: [[fn("COUNT", col("TitleInstallmentStreamLike.id")), "likes_count"]],
                        },
                        group: default_query.group,
                        include: [
                            {
                                model: "TitleInstallmentStreamLike",
                                required: false,
                            },
                        ],
                    })

                    const watch_history_title_installment_data = await TitleInstallmentStream.findOne({
                        where: default_query.where,
                        transaction: default_query.transaction,
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                            include: [[fn("COUNT", col("TitleInstallmentStreamWatchHistory.id")), "watch_history_count"]],
                        },
                        group: default_query.group,
                        include: [
                            {
                                model: "TitleInstallmentStreamWatchHistory",
                                required: false,
                            },
                        ],
                    })

                    resolve({ ...original_title_installment_data.toJSON(), ...stream_like_title_installment_data.toJSON(), ...watch_history_title_installment_data.toJSON() })
                } else {
                    reject(new Error(`could not get ${TitleInstallmentStream.name} with id:${id}`))
                }
            } catch (err) {
                Logging.LogError(`could not get ${TitleInstallmentStream.name} with id:${id} --- ${err}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetAll({ limit, offset }, installmentID = null, isStreamNumberDesc = false) {
        return new Promise(async (resolve, reject) => {
            try {
                // -----------------
                // -----------------

                const default_query = {
                    group: [col("TitleInstallmentStream.id")],
                    order: [["streamNumber", isStreamNumberDesc ? "DESC" : "ASC"]],
                }

                if (installmentID) {
                    default_query.where.installmentID = installmentID
                }
                if (transaction) {
                    default_query.transaction = transaction
                }
                if (limit) {
                    default_query.limit = limit
                }
                if (offset) {
                    default_query.offset = offset
                }

                const original_title_installment_data_list = await TitleInstallmentStream.findOne({
                    where: default_query.where,
                    transaction: default_query.transaction,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: ["id", "installmentID", "titleID", "label", "streamNumber", "synopsis", "releaseDate"],
                    },
                    group: default_query.group,
                })

                const stream_like_title_installment_data_list = await TitleInstallmentStream.findOne({
                    where: default_query.where,
                    transaction: default_query.transaction,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: [[fn("COUNT", col("TitleInstallmentStreamLike.id")), "likes_count"]],
                    },
                    group: default_query.group,
                    include: [
                        {
                            model: "TitleInstallmentStreamLike",
                            required: false,
                        },
                    ],
                })

                const watch_history_title_installment_data_list = await TitleInstallmentStream.findOne({
                    where: default_query.where,
                    transaction: default_query.transaction,
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                        include: [[fn("COUNT", col("TitleInstallmentStreamWatchHistory.id")), "watch_history_count"]],
                    },
                    group: default_query.group,
                    include: [
                        {
                            model: "TitleInstallmentStreamWatchHistory",
                            required: false,
                        },
                    ],
                })

                resolve(
                    original_title_installment_data_list.map((element, index) => {
                        const { createdAt, updatedAt, ...rest } = element.toJSON()
                        return { ...rest, ...stream_like_title_installment_data_list[index].toJSON(), ...watch_history_title_installment_data_list[index].toJSON() }
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get list of ${TitleInstallmentStream.name} --- ${err}`)
                reject({ error: err.message })
            }
        })
    }
}

module.exports.TitleInstallmentStream = TitleInstallmentStream
