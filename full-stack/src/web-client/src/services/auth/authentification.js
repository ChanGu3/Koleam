import { validateEmail, validatePassword, validateUsername } from "../../../../shared/Validations/account-validations"

/**
 * @param {string} routeName
 * routeName for signing out
 *
 * @returns {Promise<boolean>}
 * true when successfully signed out
 */
export async function SignOut(routeName) {
    try {
        const respond = await fetch(`/api/authentify/signout/${routeName}`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            credentials: "include",
        })

        if (respond.ok && respond.status === 200) {
            return true
        } else {
            const errorData = await respond.json()
            throw new Error(errorData.error)
        }
    } catch (error) {
        throw error
    }

    return false
}

/**
 * @returns {Promise<boolean>}
 * true when successfully signed out
 */
export async function MemberSignOut() {
    return await SignOut("member")
}

/**
 * @param {string} email
 * email for signing in
 *
 * @param {string} password
 * password for signing in
 *
 * @returns {Promise<boolean>}
 * true when successfully signed in
 *
 * @throws {Error} when email or password format is invalid
 */
export async function MemberSignIn(email, password) {
    try {
        if (validateEmail(email) === false) {
            throw new Error("Invalid email format")
        }
        if (validatePassword(password) === false) {
            throw new Error("Invalid password format")
        }

        const response = await fetch(`/api/authentify/signin/member`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        })

        if (response.ok && response.status === 200) {
            return true
        } else {
            const errorData = await response.json()
            throw new Error(errorData.error)
        }
    } catch (error) {
        throw error
    }

    return false
}

/**
 * @param {string} email
 * email for signing up
 *
 * @param {string} password
 * password for signing up
 *
 * @returns {Promise<boolean>}
 * true when successfully signed up
 *
 * @throws {Error} when email or password format is invalid
 *
 */
export async function MemberSignUp(email, password, passwordAgain) {
    try {
        if (validateEmail(email) === false) {
            throw new Error("Invalid email format")
        }
        if (validatePassword(password) === false) {
            throw new Error("password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, and one number")
        }
        if (password !== passwordAgain) {
            throw new Error("Passwords do not match")
        }

        const response = await fetch(`/api/authentify/signup/member`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        })

        if (response.ok && response.status === 200) {
            return true
        } else {
            const errorData = await response.json()
            throw new Error(errorData.error)
        }
    } catch (error) {
        throw error
    }

    return false
}

/**
 * @returns {Promise<boolean>}
 * true when successfully signed out
 */
export async function AdminSignOut() {
    return await SignOut("admin")
}

/**
 * @param {string} username
 * username for signing in
 *
 * @param {string} password
 * password for signing in
 *
 * @returns {Promise<boolean>}
 * true when successfully signed in
 *
 * @throws {Error} when username or password format is invalid
 *
 */
export async function AdminSignIn(username, password) {
    try {
        if (validateUsername(username) === false) {
            throw new Error("Invalid username format")
        }
        if (validatePassword(password) === false) {
            throw new Error("Invalid password format")
        }

        const response = await fetch(`/api/authentify/signin/admin`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password }),
        })

        if (response.ok && response.status === 200) {
            return true
        } else {
            const errorData = await response.json()
            throw new Error(errorData.error)
        }
    } catch (error) {
        throw error
    }

    return false
}
