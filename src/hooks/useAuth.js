import React, { useState, useEffect, useCallback } from 'react'
import Cookies from 'universal-cookie'
import { logoutLabelStudio } from 'src/api/labelProject'
import { getMe } from 'src/api/user'

const authContext = React.createContext()

function useAuth() {
	const [authed, setAuthed] = useState(false)
	const [user, setUser] = useState(null)
	const cookies = new Cookies()

	const writeCookies = ({ accessToken, refreshToken, userId }) => {
		const cookieOptions = {
			path: '/',
			// secure: true,
			// sameSite: 'none',
		}
		if (process.env.REACT_APP_DOMAIN_NAME) {
			cookieOptions.domain = process.env.REACT_APP_DOMAIN_NAME
		}

		console.log('accessToken', accessToken)
		console.log('refreshToken', refreshToken)
		console.log('x-user-id', userId)
		console.log('cookieOptions', cookieOptions)

		// Store raw token; header builder will add Bearer
		cookies.set('accessToken', accessToken, cookieOptions)
		cookies.set('x-user-id', userId, cookieOptions)

		if (refreshToken) {
			cookies.set('refreshToken', refreshToken, cookieOptions)
		}

		console.log('Cookies after setting:', cookies.getAll())
	}

	// Helper function để verify cookies đã được set
	const verifyCookies = () => {
		const accessToken = cookies.get('accessToken')
		const userId = cookies.get('x-user-id')
		const refreshToken = cookies.get('refreshToken')

		console.log('Verifying cookies:', {
			accessToken: !!accessToken,
			userId: !!userId,
			refreshToken: !!refreshToken,
		})

		return Boolean(accessToken && userId)
	}

	const refresh = useCallback(() => {
		return new Promise(async (res) => {
			const isAuthenticated = verifyCookies()
			setAuthed(isAuthenticated)
			if (isAuthenticated) {
				try {
					const { data } = await getMe()
					setUser(data)
				} catch (e) {
					console.error('Failed to fetch current user (/me):', e)
					setUser(null)
				}
			} else {
				setUser(null)
			}
			res(isAuthenticated)
		})
	}, [])

	const login = useCallback(
		({ accessToken, refreshToken, userId, user: userPayload }) => {
			return new Promise((res, rej) => {
				try {
					// Set cookies
					writeCookies({ accessToken, refreshToken, userId })

					// Verify cookies đã được set với retry mechanism
					const verifyWithRetry = (attempts = 0) => {
						const isVerified = verifyCookies()

						if (isVerified) {
							console.log('Cookies verified successfully')
							setAuthed(true)
							if (userPayload) {
								setUser(userPayload)
							} else {
								// Best-effort fetch user profile
								getMe()
									.then(({ data }) => setUser(data))
									.catch(() => setUser({ id: userId }))
							}
							res(true)
						} else if (attempts < 3) {
							console.log(
								`Cookie verification failed, retrying... (${attempts + 1}/3)`
							)
							// Retry sau 50ms
							setTimeout(() => verifyWithRetry(attempts + 1), 50)
						} else {
							console.error(
								'Failed to verify cookies after 3 attempts'
							)
							rej(
								new Error(
									'Failed to set authentication cookies'
								)
							)
						}
					}

					// Bắt đầu verify
					setTimeout(() => verifyWithRetry(), 10)
				} catch (error) {
					console.error('Login error:', error)
					rej(error)
				}
			})
		},
		[]
	)

	const logout = useCallback(() => {
		return new Promise((resolve, reject) => {
			console.log('logging out...')

			logoutLabelStudio()
				.then(() => {
					console.log('Yêu cầu logout khỏi Label Studio đã hoàn tất.')
				})
				.catch((error) => {
					console.error(
						'Logout khỏi Label Studio thất bại, nhưng vẫn tiếp tục:',
						error
					)
					// Không reject, vẫn tiếp tục
				})
				.finally(() => {
					console.log('Đang tiến hành logout khỏi hệ thống chính...')

					cookies.remove('accessToken', { path: '/' })
					cookies.remove('refreshToken', { path: '/' })
					cookies.remove('Authorization', { path: '/' })
					cookies.remove('x-user-id', { path: '/' })

					setAuthed(false)
					setUser(null)

					// Nếu muốn reload thì đặt đây, nhưng sẽ dừng mọi logic sau đó
					// window.location.reload();

					// Nếu không reload, bạn có thể resolve để cho phép điều hướng:
					resolve()
				})
		})
	}, [])

	return {
		authed,
		user,
		refresh,
		login,
		logout,
	}
}

export function AuthProvider({ children }) {
	const auth = useAuth()
	return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

export default function AuthConsumer() {
	return React.useContext(authContext)
}
