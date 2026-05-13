const { DataTypes } = require("sequelize")
const bcrypt = require("bcrypt")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { HashPassword, saltRounds } = require("./util.cjs")
const adminDefault = { username: "username", password: "password" }
const { ModelExtension } = require("../model-extension.cjs")

class Admin extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        Admin.init(
            {
                username: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    validate: {
                        isAlphanumeric: true,
                    },

                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    validate: {
                        len: [7, Infinity],
                    },
                },
            },
            {
                sequelize,
                modelName: `${Admin.name}`,
            }
        )
        return
    }

    //
    // Admin Exists in DB true otherwise false
    //
    static async Exists(username) {
        const instance = await Admin.findByPk(username)
        return instance ? true : false
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created Admin
    //
    static AddToDB(username, password) {
        return new Promise(async (resolve, reject) => {
            if (await this.Exists(username)) {
                Logging.LogError(`${username} is already an admin`)
                reject(new Error(`${username} is already an admin`))
                return
            }

            const hash = await HashPassword(password, saltRounds)

            try {
                const newAdmin = Admin.build({
                    username,
                    password: hash,
                })

                await newAdmin.validate()

                await newAdmin.save()

                resolve(newAdmin)
            } catch (err) {
                Logging.LogError(`Could Not Add Admin To Database ${username} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveByUsername(username) {
        return new Promise(async (resolve, reject) => {
            try {
                await Admin.destroy({ where: { username: username } })
                resolve()
            } catch (err) {
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static GetAll({ limit, offset }) {
        return new Promise(async (resolve, reject) => {
            try {
                const querys = {}
                if (limit) {
                    querys.limit = limit
                }
                if (offset) {
                    querys.offset = offset
                }
                const admins = await Admin.findAll(querys)

                resolve(
                    admins.map((element) => {
                        const { password, ...rest } = element.toJSON()
                        return rest
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get all admins --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    //
    // reject --> null
    // resolve --> instance: Admin
    //
    static GetByUsername(username) {
        return new Promise(async (resolve, reject) => {
            if (await Admin.Exists(username)) {
                const admin = await Admin.findByPk(username)
                const { password, ...rest } = admin.toJSON()
                resolve(rest)
            } else {
                reject(null)
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: authenticated Admin
    //
    static Authentification(username, password) {
        return new Promise(async (resolve, reject) => {
            if (await Admin.Exists(username)) {
                const existingAdmin = await Admin.findByPk(username)
                if (existingAdmin) {
                    try {
                        if (await bcrypt.compare(password, existingAdmin.password)) {
                            resolve(existingAdmin)
                        } else {
                            reject(new Error(errormsg.authentificationFail))
                        }
                    } catch (err) {
                        Logging.LogError(`Could Not Hash ${username} --- ${err.message}`)
                        reject(new Error(errormsg.fallback))
                    }
                } else {
                    reject(new Error(errormsg.authentificationFail))
                }
            } else {
                reject(new Error(errormsg.authentificationFail))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: updated Admin
    //
    static UpdateUsername(oldUsername, newUsername) {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if old username exists to update the correct account
                if (!(await Admin.Exists(oldUsername))) {
                    Logging.LogError(`User not found ${oldUsername} to ${newUsername}`)
                    reject(new Error("User not found"))
                    return
                }

                const existingAdmin = await Admin.findByPk(oldUsername)

                // Check if new username already exists
                if (await Admin.Exists(newUsername)) {
                    Logging.LogError(`New username already exists ${oldUsername} to ${newUsername}`)
                    reject(new Error("New username already exists"))
                    return
                }

                // Update email
                await Admin.update(
                    {
                        username: newUsername,
                    },
                    {
                        where: {
                            username: oldUsername,
                        },
                    }
                )

                existingAdmin.reload()

                resolve(existingAdmin)
            } catch (err) {
                Logging.LogError(`Could not update username ${oldUsername} to ${newUsername} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: updated Admin
    //
    static UpdatePassword(username, currentPassword, newPassword) {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if user exists
                if (!(await Admin.Exists(username))) {
                    reject(new Error("User not found"))
                    return
                }

                const existingAdmin = await Admin.findByPk(username)

                // Verify current password
                if (!(await bcrypt.compare(currentPassword, existingAdmin.password))) {
                    reject(new Error("Current password is incorrect"))
                    return
                }

                // Hash new password
                const newHash = await HashPassword(newPassword, saltRounds)

                // Update password
                existingAdmin.password = newHash
                await existingAdmin.save()

                resolve(existingAdmin)
            } catch (err) {
                Logging.LogError(`Could Not Update Password for ${username} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    static async DefaultSetup() {
        try {
            const adminList = await Admin.findAll()

            if (adminList.length <= 0) {
                await this.AddToDB(adminDefault.username, adminDefault.password)
                Logging.LogProcess(`admin account created using default`)
                Logging.LogProcess(`|default admin credentials| username: ${adminDefault.username} - password: ${adminDefault.password}`)
            } else {
                Logging.LogProcess(`attempted to create default admin account but an existing account already exists in the database`)
            }
        } catch (err) {
            Logging.LogError(`${err}`)
            throw new Error(err.message)
        }
    }
}

module.exports.Admin = Admin
