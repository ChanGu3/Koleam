const ERROR_MESSAGES = Object.freeze({
    USER: {
        offline: "Could not connect to the server",
        server_offline: "Servers are down try again later",
    },
    SERVER: {},
    SHARED: {
        unexpected: "Some unexpected error occured please try again later",
    },
})

if (typeof module !== "undefined" && module.exports) {
    module.exports = { ERROR_MESSAGES }
}

export { ERROR_MESSAGES }
