const FILM_RATING = Object.freeze({
    G: "G",
    PG: "PG",
    PG13: "PG13",
    R: "R",
})

const CONTENT_ADVISORIES = Object.freeze({
    VIOLENCE: "Violence",
    ALOCHOL_USE: "Alcohol Use",
    DRUG_USE: "Drug Use",
    SMOKING: "Smoking",
    SEXUAL_CONTENT: "Sexual Content",
    STRONG_LANGUAGE: "Strong Language",
})

const GENRES = Object.freeze({
    ACTION: "Action",
    ADVENTURE: "Adventure",
    ANIMATION: "Animation",
    BIOGRAPHY: "Biography",
    COMEDY: "Comedy",
    CRIME: "Crime",
    DOCUMENTARY: "Documentary",
    DRAMA: "Drama",
    FAMILY: "Family",
    FANTASY: "Fantasy",
    HISTORY: "History",
    HORROR: "Horror",
    MUSIC: "Music",
    MUSICAL: "Musical",
    MYSTERY: "Mystery",
    ROMANCE: "Romance",
    SCI_FI: "Sci-Fi",
    SPORT: "Sport",
    THRILLER: "Thriller",
    WAR: "War",
    WESTERN: "Western",
})

module.exports = {
    FILM_RATING,
    CONTENT_ADVISORIES,
    GENRES,
}
