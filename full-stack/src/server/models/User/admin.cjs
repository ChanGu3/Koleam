const { DataTypes } = require("sequelize")
const bcrypt = require("bcrypt")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { HashPassword, saltRounds } = require("./util.cjs")
const { ModelExtension } = require("../model-extension.cjs")
const { validatePassword } = require("../../../shared/Validations/account-validations")

class Admin extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models: _ }) {
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
    static async AddToDB(username, password) {
        if (await this.Exists(username)) {
            Logging.LogError(`${username} ${errormsg.usernameExists}`)
            throw new Error(`${username} is already an admin`)
        }

        if (validatePassword(password) === false) {
            throw new Error("Invalid password format")
        }

        const hash = await HashPassword(password, saltRounds)

        try {
            const newAdmin = Admin.build({
                username,
                password: hash,
            })

            await newAdmin.validate()

            await newAdmin.save()

            return newAdmin
        } catch (err) {
            Logging.LogError(`Could Not Add Admin To Database ${username} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveByUsername(username) {
        try {
            const adminList = await Admin.findAll()
            if (adminList.length <= 1) {
                throw new Error("Cannot delete the last admin account create a new account before deleting this one")
            }

            await Admin.destroy({ where: { username: username } })
            return
        } catch {
            throw new Error(errormsg.fallback)
        }
    }

    static async GetAll({ limit = 10, offset = 0 }) {
        try {
            const querys = {}
            if (limit) {
                querys.limit = limit
            }
            if (offset) {
                querys.offset = offset
            }
            const admins = await Admin.findAll(querys)

            return admins.map((element) => {
                const { password: _p, ...rest } = element.toJSON()
                return rest
            })
        } catch (err) {
            Logging.LogError(`could not get all admins --- ${err}`)
            throw { error: err.message }
        }
    }

    //
    // reject --> null
    // resolve --> instance: Admin
    //
    static async GetByUsername(username) {
        if (await Admin.Exists(username)) {
            const admin = await Admin.findByPk(username)
            const { password: _p, ...rest } = admin.toJSON()
            return rest
        } else {
            throw null
        }
    }

    //
    // reject --> string: error msg
    // resolve --> instance: authenticated Admin
    //
    static async Authentification(username, password) {
        if (await Admin.Exists(username)) {
            const existingAdmin = await Admin.findByPk(username)
            if (existingAdmin) {
                try {
                    if (await bcrypt.compare(password, existingAdmin.password)) {
                        return existingAdmin
                    } else {
                        throw new Error(errormsg.adminAuthentificationFail)
                    }
                } catch (err) {
                    Logging.LogError(`Could Not Hash ${username} --- ${err.message}`)
                    throw new Error(errormsg.fallback)
                }
            } else {
                throw new Error(errormsg.adminAuthentificationFail)
            }
        } else {
            throw new Error(errormsg.adminAuthentificationFail)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> instance: updated Admin
    //
    static async UpdateUsername(oldUsername, newUsername) {
        try {
            // Check if old username exists to update the correct account
            if (!(await Admin.Exists(oldUsername))) {
                Logging.LogError(`User not found ${oldUsername} to ${newUsername}`)
                throw new Error("User not found")
            }

            const existingAdmin = await Admin.findByPk(oldUsername)

            // Check if new username already exists
            if (await Admin.Exists(newUsername)) {
                Logging.LogError(`New username already exists ${oldUsername} to ${newUsername}`)
                throw new Error("New username already exists")
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

            return existingAdmin
        } catch (err) {
            Logging.LogError(`Could not update username ${oldUsername} to ${newUsername} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> instance: updated Admin
    //
    static async UpdatePassword(username, currentPassword, newPassword) {
        try {
            // Check if user exists
            if (!(await Admin.Exists(username))) {
                throw new Error("User not found")
            }

            const existingAdmin = await Admin.findByPk(username)

            // Verify current password
            if (!(await bcrypt.compare(currentPassword, existingAdmin.password))) {
                throw new Error("Current password is incorrect")
            }

            if (validatePassword(newPassword) === false) {
                throw new Error("Invalid password format")
            }

            // Hash new password
            const newHash = await HashPassword(newPassword, saltRounds)

            // Update password
            existingAdmin.password = newHash
            await existingAdmin.save()

            return existingAdmin
        } catch (err) {
            Logging.LogError(`Could Not Update Password for ${username} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async UpdatePasswordByAdmin(username, newPassword) {
        try {
            // Check if user exists
            if (!(await Admin.Exists(username))) {
                throw new Error("User not found")
            }

            const existingAdmin = await Admin.findByPk(username)

            if (validatePassword(newPassword) === false) {
                throw new Error("Invalid password format")
            }

            // Hash new password
            const newHash = await HashPassword(newPassword, saltRounds)

            // Update password
            existingAdmin.password = newHash
            await existingAdmin.save()

            return existingAdmin
        } catch (err) {
            Logging.LogError(`Could Not Update Password for ${username} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    static async DefaultSetup() {
        try {
            const adminDefault = { username: "username", password: "Password*0" }
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
