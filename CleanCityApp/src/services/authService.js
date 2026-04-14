import api from './api'

const AUTH_LOGIN_PATH = import.meta.env.VITE_AUTH_LOGIN_PATH || '/Auth/login'
const AUTH_REGISTER_PATH = import.meta.env.VITE_AUTH_REGISTER_PATH || '/Auth/register'
const AUTH_PROFILE_PATH = import.meta.env.VITE_AUTH_PROFILE_PATH || '/Auth/profile'
const AUTH_LOGOUT_PATH = import.meta.env.VITE_AUTH_LOGOUT_PATH || ''

const unwrapPayload = (data) => data?.data || data?.result || data?.payload || data

const pickAccessToken = (data) =>
	unwrapPayload(data)?.access_token ||
	unwrapPayload(data)?.accessToken ||
	unwrapPayload(data)?.token ||
	unwrapPayload(data)?.jwt ||
	unwrapPayload(data)?.idToken ||
	data?.access_token ||
	data?.accessToken ||
	data?.token ||
	data?.jwt ||
	null

const pickUser = (data) => {
	const payload = unwrapPayload(data)

	if (payload?.user) return payload.user
	if (payload?.account) return payload.account
	if (payload?.profile) return payload.profile
	if (payload && typeof payload === 'object' && pickAccessToken(payload)) return null
	if (data?.user) return data.user

	return payload && typeof payload === 'object' ? payload : null
}

export const normalizeAuthResponse = (data) => ({
	accessToken: pickAccessToken(data),
	user: pickUser(data),
	raw: data,
})

export const normalizeProfileResponse = (data) => pickUser(data) || unwrapPayload(data) || data

/**
 * @param {{ username: string, password: string }} credentials
 */
export const login = (credentials) =>
	api.post(AUTH_LOGIN_PATH, {
		userName: credentials.username,
		username: credentials.username,
		password: credentials.password,
	}, {
		skipAuthRedirect: true,
	})

/**
 * @param {{ fullName: string, userName: string, email: string, password: string, phoneNumber?: string, dob?: string }} data
 */
export const register = (data) =>
	api.post(AUTH_REGISTER_PATH, {
		fullName: data.fullName,
		userName: data.userName,
		email: data.email,
		phoneNumber: data.phoneNumber || '',
		dob: data.dob || null,
		password: data.password,
	})

export const logout = () => (AUTH_LOGOUT_PATH ? api.post(AUTH_LOGOUT_PATH) : Promise.resolve(null))

export const getProfile = () => api.get(AUTH_PROFILE_PATH)
