const { DataTypes, Op } = require("sequelize")
const bcrypt = require("bcrypt")
const { HashPassword, saltRounds } = require("./util.cjs")
const { Logging, errormsg } = require("../../server-logging.cjs")
const { ModelExtension } = require("../model-extension.cjs")
const { validatePassword, validateEmail, validePasswordFailMsg } = require("../../../shared/Validations/account-validations")

class Member extends ModelExtension {
    /**
     * @override
     */
    static async Initialize({ sequelize, models: _m }) {
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

    static async GetAll({ limit = 10, offset = 0, search = null } = {}) {
        try {
            const querys = {
                where: {},
            }
            if (limit) {
                querys.limit = limit
            }
            if (offset) {
                querys.offset = offset
            }

            if (search) {
                querys.where.email = {
                    [Op.like]: `%${search}%`,
                }
            }

            const members = await Member.findAll(querys)

            return members.map((element) => {
                const { password: _, ...rest } = element.toJSON()
                return rest
            })
        } catch (err) {
            Logging.LogError(`could not get all members --- ${err}`)
            throw { error: err.message }
        }
    }

    //
    // reject --> null
    // resolve --> instance: Member
    //
    static async GetByEmail(email) {
        const emailLower = email.toLowerCase()
        if (await Member.Exists(emailLower)) {
            const member = await Member.findByPk(emailLower)
            const { password: _p, ...rest } = member.toJSON()
            return rest
        } else {
            throw null
        }
    }

    //
    // reject --> string: error msg
    // resolve --> instance: created Member
    //
    static async AddToDB(email, password) {
        const emailLower = email.toLowerCase()

        if (await Member.Exists(emailLower)) {
            throw new Error(errormsg.emailExists)
        }

        if (validatePassword(password) === false) {
            throw new Error("Invalid password format")
        }

        try {
            const hash = await HashPassword(password, saltRounds)

            const newMember = Member.build({
                email: emailLower,
                password: hash,
            })

            await newMember.validate()

            await newMember.save()

            return newMember
        } catch (err) {
            Logging.LogError(`Could Not Add Member To Database ${email} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> nothing
    //
    static async RemoveByEmail(email) {
        try {
            await Member.destroy({ where: { email: email } })
            return
        } catch {
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> instance: authorized Member
    //
    static async Authentification(email, password) {
        const emailLower = email.toLowerCase()

        if (await Member.Exists(emailLower)) {
            const existingUser = await Member.findByPk(emailLower)
            if (existingUser) {
                try {
                    if (await bcrypt.compare(password, existingUser.password)) {
                        return existingUser
                    } else {
                        throw new Error(errormsg.memberAuthentificationFail)
                    }
                } catch (err) {
                    Logging.LogError(`Could Not Hash ${email} --- ${err.message}`)
                    throw new Error(errormsg.fallback)
                }
            } else {
                throw new Error(errormsg.memberAuthentificationFail)
            }
        } else {
            throw new Error(errormsg.memberAuthentificationFail)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> instance: updated Member
    //
    static async UpdateEmail(oldEmail, newEmail) {
        const oldEmailLower = oldEmail.toLowerCase()
        const newEmailLower = newEmail.toLowerCase()

        try {
            // Check if old email exists
            if (!(await Member.Exists(oldEmailLower))) {
                Logging.LogError(`User not found ${oldEmail} to ${newEmail}`)
                throw new Error("User not found")
            }

            // Check if new email already exists
            if (await Member.Exists(newEmailLower)) {
                Logging.LogError(`New email already exists ${oldEmail} to ${newEmail}`)
                throw new Error("New email already exists")
            }

            if (validateEmail(newEmailLower) === false) {
                Logging.LogError(`Invalid email format ${oldEmail} to ${newEmail}`)
                throw new Error("Invalid email format")
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

            return { success: "Successfully updated email" }
        } catch (err) {
            Logging.LogError(`Could Not Update Email ${oldEmail} to ${newEmail} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }

    //
    // reject --> string: error msg
    // resolve --> instance: updated Member
    //
    static async UpdatePassword(email, currentPassword, newPassword) {
        const emailLower = email.toLowerCase()

        try {
            // Check if user exists
            if (!(await Member.Exists(emailLower))) {
                throw new Error("User not found")
            }

            const existingMember = await Member.findByPk(emailLower)

            // Verify current password
            if (!(await bcrypt.compare(currentPassword, existingMember.password))) {
                new Error("Current password is incorrect")
            }

            if (validatePassword(newPassword) === false) {
                new Error(validePasswordFailMsg)
            }

            // Hash new password
            const newHash = await HashPassword(newPassword, saltRounds)

            // Update password
            existingMember.password = newHash
            await existingMember.save()

            return existingMember
        } catch (err) {
            Logging.LogError(`Could Not Update Password for ${email} --- ${err.message}`)
            throw new Error(errormsg.fallback)
        }
    }
}

module.exports.Member = Member
