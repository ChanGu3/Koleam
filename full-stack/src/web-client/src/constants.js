export const COPYRIGHT_NAME = "Koleam"

export const ACCESS_TYPE = Object.freeze({
    LOCAL: "LOCAL", // LOCAL IS FOR ADMIN DASHBOARD
    PUBLIC: "PUBLIC", // PUBLIC IS FOR STREAMING AND MEMBER DASHBOARD
})

export const BASE_ROUTES = Object.freeze({
    DISCOVER: "discover",
    AUTH: "auth",
    STREAM: "stream",
    TITLE: "title",
})

export const FULL_ROUTES = Object.freeze({
    HOME: "/",
    NOT_FOUND: "/404",
    ABOUT: `/${COPYRIGHT_NAME.toLowerCase()}/about`,
    DISCOVER_SEARCH: `/${BASE_ROUTES.DISCOVER}/search`,
    DISCOVER_GENRE: `/${BASE_ROUTES.DISCOVER}/genre/:genre`,
    DISCOVER_A_Z: `/${BASE_ROUTES.DISCOVER}/A-Z`,
    SIGN_IN: `/${BASE_ROUTES.AUTH}/signin`,
    SIGN_UP: `/${BASE_ROUTES.AUTH}/signup`,
    SIGN_UP_SUCCESS: `/${BASE_ROUTES.AUTH}/signup/success`,
    SIGN_OUT: `/${BASE_ROUTES.AUTH}/forgot-password`,
    STREAM_PAGE: `/${BASE_ROUTES.STREAM}/:streamId/:streamLabel`,
    TITLE_PAGE: `/${BASE_ROUTES.TITLE}/:titleId/:titleLabel`,
    TITLE_FAVORITES: `/${BASE_ROUTES.TITLE}/favorites`,
})

export const FILLED_ROUTES = Object.freeze({
    DISCOVER_GENRE: (genre) => FULL_ROUTES.DISCOVER_GENRE.replace(":genre", genre),
    STREAM_PAGE: (streamId, streamLabel) => FULL_ROUTES.STREAM_PAGE.replace(":streamId", streamId).replace(":streamLabel", streamLabel),
    TITLE_PAGE: (titleId, titleLabel) => FULL_ROUTES.TITLE_PAGE.replace(":titleId", titleId).replace(":titleLabel", titleLabel),
})

export const Z_INDEX = Object.freeze({
    DEFAULT: 100,
    POPUP: 200,
    NAVBAR: 1000,
})
