import { DEFAULT_PORTS } from "../../shared/PORTS.js"

export const ACCESS_TYPE = Object.freeze({
    LOCAL: "LOCAL", // LOCAL IS FOR ADMIN DASHBOARD
    PUBLIC: "PUBLIC", // PUBLIC IS FOR MEMBER DASHBOARD
})

export const PORTS = Object.freeze({
    LOCAL: DEFAULT_PORTS.LOCAL_PORT,
    PUBLIC: DEFAULT_PORTS.PUBLIC_PORT,
})

// eslint-disable-next-line no-undef
export const DEV_ACCESS_TYPE = __IS_DEV__ ? (__IS_ADMIN_VIEW__ ? ACCESS_TYPE.LOCAL : ACCESS_TYPE.PUBLIC) : undefined
