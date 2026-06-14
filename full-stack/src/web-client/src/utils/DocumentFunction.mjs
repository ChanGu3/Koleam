export function IsElementInViewport(el, rOffset = 0, lOffset = 0) {
    const rect = el.getBoundingClientRect()

    return rect.left >= 0 + lOffset && rect.right <= document.documentElement.clientWidth - rOffset
}

//
// Summary: Takes a number and turns it into a prefix of (Ex: 10K or 10M)
//          when longer then 999.
//
export function ShortenCountAsString(value) {
    if (isNaN(value) || isFinite(value)) {
        return value
    }

    return value > 999999 ? (value / 1000000).toFixed(1).toString() + "M" : value > 999 ? (value / 1000).toFixed(1).toString() + "K" : value.toString()
}

const DocumentFunction = {
    IsElementInViewport,
    ShortenCountAsString,
}

export default DocumentFunction
