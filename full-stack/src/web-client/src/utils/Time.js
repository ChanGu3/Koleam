function getTimeNowWithSecondChange(seconds) {
    const now = new Date()

    now.setSeconds(now.getSeconds() + seconds)

    return now
}

function getCalendarDateAndTime(date) {
    if (date === undefined || date instanceof Date === false || isNaN(date.getTime())) {
        return null
    }

    const year = date.getFullYear()
    const monthAbrv = date.toLocaleString(undefined, { month: "short" })
    const day = String(date.getDate()).padStart(2, "0")

    const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })

    return `${time} - [${monthAbrv} ${day}, ${year}]`
}

function runOnTheMinute(onNewMinute = () => {}) {
    const now = new Date()

    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    setTimeout(() => {
        // 1. Fire the function immediately at the top of the minute
        onNewMinute()

        // 2. Now that we are perfectly synced, set an interval for exactly 60 seconds
        setInterval(onNewMinute, 60000)
    }, msUntilNextMinute)
}

export { getTimeNowWithSecondChange, getCalendarDateAndTime, runOnTheMinute }
