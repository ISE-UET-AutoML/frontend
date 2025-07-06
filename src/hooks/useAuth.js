import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import { logoutLabelStudio } from 'src/api/labelProject';
import { Ls } from 'dayjs';
import { LsAxios } from 'src/api/axios';
import { axios } from 'axios';
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
				const csrfToken = cookies.get('csrftoken');

				fetch('http://127.0.0.1:8080/user/logout/', {
				method: 'POST',
				credentials: 'include', // Quan trọng: để gửi cookie
				headers: {
					'X-CSRFToken': csrfToken,
					'Content-Type': 'application/json',
				},
				}).finally(() => {
				res();
				});
			});
		},
		/*logout() {
			try {
                // Gọi API để logout khỏi Label Studio trước
                logoutLabelStudio();
                console.log("Successfully logged out from Label Studio.");
            } catch (error) {
                console.error("Could not log out from Label Studio, but proceeding anyway:", error);
            }

            setAuthed(false);
            cookies.remove('accessToken', { path: '/' });
            cookies.remove('refreshToken', { path: '/' });
            cookies.remove('Authorization', { path: '/' });
            cookies.remove('x-user-id', { path: '/' });
            
            window.location.reload();
        },*/
	};
}

export function AuthProvider({ children }) {
	const auth = useAuth();

	return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export default useAuth;

export function AuthConsumer() {
	return React.useContext(authContext);
}
