const BACKEND_URL = 'http://localhost:3001'

// BASE AUTH
const AUTH_URL = '/api/auth'
// BASE FACENET
const IMAGE_URL = '/api/image'

export const REGISTER_URL =         BACKEND_URL + AUTH_URL + '/register'
export const LOGIN_URL =            BACKEND_URL + AUTH_URL + '/login'
export const LOGOUT_URL =           BACKEND_URL + AUTH_URL + '/logout'

export const GET_IMAGE_URL =        BACKEND_URL + IMAGE_URL + '/get/from/url'
export const GET_PROFILE_PIC =      BACKEND_URL + IMAGE_URL + '/get/profile/pic'
export const GET_SIMILARITY_URL =   BACKEND_URL + IMAGE_URL + '/get/matches'