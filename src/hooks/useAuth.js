import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import { logoutLabelStudio } from 'src/api/labelProject';

const authContext = React.createContext();

function useAuth() {
	const [authed, setAuthed] = useState(false);
	const cookies = new Cookies();

	const writeCookies = ({ accessToken, refreshToken, userId }) => {
		const cookieOptions = {
			// path: '/',
			// secure: true,
			// sameSite: 'none',
		};
		if (process.env.REACT_APP_DOMAIN_NAME) {
			cookieOptions.domain = process.env.REACT_APP_DOMAIN_NAME;
		}

		console.log('accessToken', accessToken);
		console.log('refreshToken', refreshToken);
		console.log('x-user-id', userId)
		console.log('cookieOptions', cookieOptions);

		cookies.set('accessToken', `<Bearer> ${accessToken}`, cookieOptions);
		cookies.set('Authorization', `<Bearer> ${accessToken}`, cookieOptions);
		cookies.set('x-user-id', userId, cookieOptions);

		if (refreshToken) {
			cookies.set('refreshToken', refreshToken, cookieOptions);
		}

		console.log('Cookies after setting:', cookies.getAll());
	};

	// Helper function để verify cookies đã được set
	const verifyCookies = () => {
		const accessToken = cookies.get('accessToken');
		const authorization = cookies.get('Authorization');
		const userId = cookies.get('x-user-id');
		const refreshToken = cookies.get('refreshToken');

		console.log('Verifying cookies:', { accessToken: !!accessToken, authorization: !!authorization, userId: !!userId, refreshToken: !!refreshToken });

		return accessToken && authorization && userId && refreshToken;
	};

	return {
		authed,
		refresh() {
			return new Promise((res) => {
				const isAuthenticated = verifyCookies();
				setAuthed(isAuthenticated);
				res(isAuthenticated);
			});
		},

		login({ accessToken, refreshToken, userId }) {
			return new Promise((res, rej) => {
				try {
					// Set cookies
					writeCookies({ accessToken, refreshToken, userId });

					// Verify cookies đã được set với retry mechanism
					const verifyWithRetry = (attempts = 0) => {
						const isVerified = verifyCookies();

						if (isVerified) {
							console.log('Cookies verified successfully');
							setAuthed(true);
							res(true);
						} else if (attempts < 3) {
							console.log(`Cookie verification failed, retrying... (${attempts + 1}/3)`);
							// Retry sau 50ms
							setTimeout(() => verifyWithRetry(attempts + 1), 50);
						} else {
							console.error('Failed to verify cookies after 3 attempts');
							rej(new Error('Failed to set authentication cookies'));
						}
					};

					// Bắt đầu verify
					setTimeout(() => verifyWithRetry(), 10);

				} catch (error) {
					console.error('Login error:', error);
					rej(error);
				}
			});
		},

		async logout() {
			const cleanupAndRedirect = () => {
				console.log("Đang tiến hành logout khỏi hệ thống chính...");
				const cookies = new Cookies();
				cookies.remove('accessToken', { path: '/' });
				cookies.remove('refreshToken', { path: '/' });
				cookies.remove('Authorization', { path: '/' });
				cookies.remove('x-user-id', { path: '/' });

				setAuthed(false);
				window.location.reload();
			};

			try {
				console.log("Đang thử đăng xuất khỏi Label Studio...");
				await logoutLabelStudio();
				console.log("Yêu cầu logout khỏi Label Studio đã hoàn tất.");
			} catch (error) {
				console.error("Logout khỏi Label Studio thất bại, nhưng vẫn tiếp tục:", error);
			} finally {
				console.log("Đang tiến hành đăng xuất khỏi hệ thống chính..........................................");
				cleanupAndRedirect();
			}
		},
	};
}

export function AuthProvider({ children }) {
	const auth = useAuth();

	return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export default function AuthConsumer() {
	return React.useContext(authContext);
}