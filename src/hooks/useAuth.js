import React, { useState } from 'react';
import Cookies from 'universal-cookie';

const authContext = React.createContext();

function useAuth() {
	const [authed, setAuthed] = useState(false);
	const cookies = new Cookies();

	const writeCookies = ({ accessToken, refreshToken, userId }) => {
		const cookieOptions = {
			// path: '/',
			// sameSite: 'lax', // Hỗ trợ môi trường HTTP và bảo vệ CSRF
			// maxAge: 24 * 60 * 60, // Cookie sống 1 ngày
			path: '/',
			secure: true,
			sameSite: 'none',
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
		console.log(cookies)
		if (refreshToken) {
			cookies.set('refreshToken', refreshToken, cookieOptions);
		}
	};

	return {
		authed,
		refresh() {
			return new Promise((res) => {
				setAuthed(
					cookies.get('accessToken') && cookies.get('refreshToken') && cookies.get('Authorization') && cookies.get('x-user-id')
				);
				res();
			});
		},
		login({ accessToken, refreshToken, userId }) {
			return new Promise((res) => {
				writeCookies({ accessToken, refreshToken, userId });
				setAuthed(true);
				res();
			});
		},
		logout() {
			return new Promise((res) => {
				setAuthed(false);
				cookies.remove('accessToken', { path: '/' });
				cookies.remove('refreshToken', { path: '/' });
				cookies.remove('Authorization', { path: '/'});
				cookies.remove('x-user-id', { path: '/'});
				res();
			});
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
