const { DataTypes } = require("sequelize")
const bcrypt = require("bcrypt")
const { HashPassword, saltRounds } = require("./util.cjs")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")

class Member extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models }) {
        Member.init(
            {
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    validate: {
                        isEmail: true,
                    },
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
                modelName: `${Member.name}`,
            }
        )
        return
    }

    //
    // Member Exists in DB true otherwise false
    //
    static async Exists(email) {
        const emailLower = email.toLowerCase()
        const instance = await Member.findByPk(emailLower)
        return instance ? true : false
    }

    static GetAll({ limit, offset, search = null }) {
        return new Promise(async (resolve, reject) => {
            try {
                const querys = {}
                if (limit) {
                    querys.limit = limit
                }
                if (offset) {
                    querys.offset = offset
                }

                if (search) {
                    query.where.email = {
                        [Op.like]: `%${search}%`,
                    }
                }

                const members = await Member.findAll(querys)

                resolve(
                    members.map((element) => {
                        const { password, ...rest } = element.toJSON()
                        return rest
                    })
                )
            } catch (err) {
                Logging.LogError(`could not get all members --- ${err}`)
                reject({ error: err.message })
            }
        })
    }

    //
    // reject --> null
    // resolve --> instance: Member
    //
    static GetByEmail(email) {
        return new Promise(async (resolve, reject) => {
            const emailLower = email.toLowerCase()
            if (await Member.Exists(emailLower)) {
                const member = await Member.findByPk(emailLower)
                const { password, ...rest } = member.toJSON()
                resolve(rest)
            } else {
                reject(null)
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created Member
    //
    static AddToDB(email, password) {
        return new Promise(async (resolve, reject) => {
            const emailLower = email.toLowerCase()

            if (await Member.Exists(emailLower)) {
                reject(new Error(errormsg.emailExists))
                return
            }

            try {
                const hash = await HashPassword(password, saltRounds)

                const newMember = Member.build({
                    email: emailLower,
                    password: hash,
                })

                await newMember.validate()

                await newMember.save()

                resolve(newMember)
            } catch (err) {
                Logging.LogError(`Could Not Add Member To Database ${email} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static RemoveByEmail(email) {
        return new Promise(async (resolve, reject) => {
            try {
                await Member.destroy({ where: { email: email } })
                resolve()
            } catch (err) {
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: authorized Member
    //
    static Authentification(email, password) {
        return new Promise(async (resolve, reject) => {
            const emailLower = email.toLowerCase()

            if (await Member.Exists(emailLower)) {
                const existingUser = await Member.findByPk(emailLower)
                if (existingUser) {
                    try {
                        if (await bcrypt.compare(password, existingUser.password)) {
                            resolve(existingUser)
                        } else {
                            reject(new Error(errormsg.authentificationFail))
                        }
                    } catch (err) {
                        Logging.LogError(`Could Not Hash ${email} --- ${err.message}`)
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
    // resolve --> instance: updated Member
    //
    static UpdateEmail(oldEmail, newEmail, password) {
        return new Promise(async (resolve, reject) => {
            const oldEmailLower = oldEmail.toLowerCase()
            const newEmailLower = newEmail.toLowerCase()

            try {
                // Check if old email exists and password is correct
                if (!(await Member.Exists(oldEmailLower))) {
                    Logging.LogError(`User not found ${oldEmail} to ${newEmail}`)
                    reject(new Error("User not found"))
                    return
                }

                const existingMember = await Member.findByPk(oldEmailLower)
                if (!(await bcrypt.compare(password, existingMember.password))) {
                    Logging.LogError(`Current password is incorrect ${oldEmail} to ${newEmail}`)
                    reject(new Error("Current password is incorrect"))
                    return
                }

                // Check if new email already exists
                if (await Member.Exists(newEmailLower)) {
                    Logging.LogError(`New email already exists ${oldEmail} to ${newEmail}`)
                    reject(new Error("New email already exists"))
                    return
                }

                // Update email
                await Member.update(
                    {
                        email: newEmail,
                    },
                    {
                        where: {
                            email: oldEmail,
                        },
                    }
                )

                resolve(existingMember)
            } catch (err) {
                Logging.LogError(`Could Not Update Email ${oldEmail} to ${newEmail} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }

    //
    // reject --> string: error msg
    // resolve --> instance: updated Member
    //
    static UpdatePassword(email, currentPassword, newPassword) {
        return new Promise(async (resolve, reject) => {
            const emailLower = email.toLowerCase()

            try {
                // Check if user exists
                if (!(await Member.Exists(emailLower))) {
                    reject(new Error("User not found"))
                    return
                }

                const existingMember = await Member.findByPk(emailLower)

                // Verify current password
                if (!(await bcrypt.compare(currentPassword, existingMember.password))) {
                    reject(new Error("Current password is incorrect"))
                    return
                }

                // Hash new password
                const newHash = await HashPassword(newPassword, saltRounds)

                // Update password
                existingMember.password = newHash
                await existingMember.save()

                resolve(existingMember)
            } catch (err) {
                Logging.LogError(`Could Not Update Password for ${email} --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            }
        })
    }
}

module.exports.Member = Member
