const { DataTypes, Op } = require("sequelize")
const cron = require("node-cron")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

function GetNewExpDate() {
    newDate = new Date()
    newDate.setDate(newDate.getDate() + 31)
    newDate.setHours(0, 0, 0, 0)
    return newDate
}

class Session extends ModelExtension {
    static SESSION_ROLES = Object.freeze({
        MEMBER: "MEMBER",
        ADMIN: "ADMIN",
    })

    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        Session.init(
            {
                id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
                loginName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                userRole: {
                    type: DataTypes.ENUM,
                    values: Object.values(Session.SESSION_ROLES),
                    allowNull: false,
                },
                expDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: () => {
                        return GetNewExpDate()
                    },
                },
            },
            {
                sequelize,
                modelName: `${Session.name}`,
            }
        )

        cron.schedule("0 0 * * *", async () => {
            try {
                const dateNow = new Date()
                const deletedCount = await Session.destroy({
                    where: { expDate: { [Op.lt]: dateNow } },
                })
                Logging.LogProcess(`Purged ${deletedCount} sessions.`)
            } catch (err) {
                Logging.LogError(`Cron Purge Failed: ${err.message}`)
            }
        })

        return
    }

    static async #Exists(id) {
        const instance = await Session.findByPk(id)
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: session
    //
    static AddToDB(id, loginName, userRole) {
        return new Promise(async (resolve, reject) => {
            try {
                // if id exists dont add just return and warn
                if (await this.#Exists(id)) {
                    Logging.LogWarning(`Did not add ${id} to DB the id already exists in session table`)
                    resolve(Session.findByPk(id))
                    return
                }

                const newSession = Session.build({
                    id,
                    loginName,
                    expDate: GetNewExpDate(),
                    userRole,
                })

                newSession.validate()

                newSession.save()

                resolve(newSession)
            } catch (err) {
                Logging.LogError(`Could not build session for ${loginName} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> string: session Login Name
    //
    static GetLoginName(id) {
        return new Promise(async (resolve, reject) => {
            const session = await Session.findByPk(id)

            if (session) {
                resolve(session.loginName)
            } else {
                reject(new Error(errormsg.sessionDoesNotExist))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> string: session User Role
    //
    static GetUserRole(id) {
        return new Promise(async (resolve, reject) => {
            const session = await Session.findByPk(id)

            if (session) {
                resolve(session.userRole)
            } else {
                reject(new Error(errormsg.sessionDoesNotExist))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: session
    //
    static LogExistingSession(id) {
        return new Promise(async (resolve, reject) => {
            if (this.#Exists(id)) {
                try {
                    Session.update(
                        {
                            expDate: GetNewExpDate(),
                        },
                        {
                            where: {
                                id: id,
                            },
                        }
                    )

                    const session = await Session.findByPk(id)

                    resolve(session)
                } catch (err) {
                    Logging.LogError(`Could Not Log Session For ${id} --- ${err}`)
                    reject(new Error(errormsg.fallback))
                }
            } else {
                reject(new Error(errormsg.sessionDoesNotExist))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: session
    //
    static UpdateSessionID(oldID, newID) {
        return new Promise(async (resolve, reject) => {
            if (await this.#Exists(oldID)) {
                try {
                    await Session.update({ id: newID, expDate: GetNewExpDate() }, { where: { id: oldID } })

                    resolve(await Session.findByPk(newID))
                } catch (err) {
                    Logging.LogError(`Could Not Update Session For ${oldID} --- ${err}`)
                    reject(new Error(errormsg.fallback))
                }
            } else {
                reject(new Error(errormsg.sessionDoesNotExist))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveByID(id) {
        return new Promise(async (resolve, reject) => {
            try {
                await Session.destroy({ where: { id: id } })
                resolve()
            } catch (err) {
                reject(new Error(errormsg.sessionDoesNotExist))
            }
        })
    }
}

module.exports.Session = Session
