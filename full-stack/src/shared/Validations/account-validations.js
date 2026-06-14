export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    return usernameRegex.test(username)
}

export const validePasswordFailMsg = "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&), and must not contain spaces."
/**
 * @param {string} password
 */
export function validatePassword(password) {
    if (password.length < 8 || password.includes(" ") || !password.match(/[A-Z]/) || !password.match(/[a-z]/) || !password.match(/[0-9]/) || !password.match(/[@$!%*?&]/)) {
        return false
    }

    return true
}

export function validateFileName(filename) {
    const fileNameRegex = /^[a-zA-Z0-9_-]+$/
    return fileNameRegex.test(filename)
}
