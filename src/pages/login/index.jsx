import React from 'react';
import { message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import * as auth from 'src/api/auth';
import logo from 'src/assets/images/logo.png';
import useAuth from 'src/hooks/useAuth';
import { validateEmail, validatePassword } from 'src/utils/validate';
import { PATHS } from 'src/constants/paths';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { state } = useLocation();

    const onLogin = async (credential) => {
        try {
            const { data } = await auth.login(credential);
            if (data.user && data.user.email) {
                localStorage.setItem('email', data.user.email);
            }

            login({ accessToken: data.access_token, refreshToken: data.refresh_token, userId: data.user.id }).then(() => {
                navigate(state?.path || PATHS.PROJECTS, { replace: true });
            });

            if(data.user && data.user.ls_token){
                const labelStudioBaseUrl = process.env.REACT_APP_LABEL_STUDIO_URL || 'http://127.0.0.1:8080';
                const labelStudioLoginUrl = `${labelStudioBaseUrl}/user/login?user_token=${data.user.ls_token}`;
                window.open(labelStudioLoginUrl, '_blank', 'noreferrer');
            }
        } catch (error) {
            console.error(error);
            message.error(error.message || 'Login failed. Please try again.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const credential = { email, password };

        if (!validateEmail(credential.email)) {
            return message.error('Email is invalid.');
        }

        if (!validatePassword(credential.password)) {
            return message.error('Password is invalid.');
        }

        onLogin(credential);
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div 
                    className="absolute inset-0 animate-gradient-slow"
                    style={{
                        background: 'linear-gradient(135deg, #C2E9FB 0%, #E0D1F7 100%)'
                    }}
                >
                </div>
            </div>

            {/* Login Form Container */}
            <div className="relative z-10 w-full max-w-md px-4 space-y-6">
                <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
                    <div className="text-center space-y-6">
                        <img
                            src={logo}
                            width={150}
                            className="mx-auto transform hover:scale-105 transition-transform duration-300"
                            alt="logo"
                        />
                        <h3 className="text-gray-800 text-3xl font-bold">
                            Welcome Back
                        </h3>
                        <p className="text-gray-600">
                            Sign in to continue to your account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="mt-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                placeholder="Enter your password"
                            />
                        </div>
                        <button 
                            className="w-full py-3 px-4 text-black font-medium bg-gradient-to-r from-[#C2E9FB] to-[#E0D1F7] hover:from-[#E0D1F7] hover:to-[#C2E9FB] rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        Don't have an account?{' '}
                        <a
                            href="/signup"
                            className="font-medium text-blue-500 hover:text-blue-600 transition-colors duration-300"
                        >
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
