import React from 'react';
import { message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import * as auth from 'src/api/auth';
import useAuth from 'src/hooks/useAuth';
import { validateEmail, validatePassword } from 'src/utils/validate';
import { PATHS } from 'src/constants/paths';
import BackgroundShapes from 'src/components/landing/BackgroundShapes';
import TextCubeCanvas from 'src/components/login/TextCubeCanvas';
import LoginCard from 'src/components/login/LoginCard';

// moved TextCubeCanvas to src/components/login/TextCubeCanvas

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { state } = useLocation();
    const [sizeHalf, setSizeHalf] = React.useState(220);
    const [offsetX, setOffsetX] = React.useState(-260);

    React.useEffect(() => {
        const compute = () => {
            const w = window.innerWidth || 1280;
            if (w >= 1920) {
                setSizeHalf(360);
                setOffsetX(-380);
            } else if (w >= 1536) { // 2xl
                setSizeHalf(320);
                setOffsetX(-340);
            } else if (w >= 1280) { // xl
                setSizeHalf(280);
                setOffsetX(-310);
            } else if (w >= 1024) { // lg
                setSizeHalf(240);
                setOffsetX(-290);
            } else {
                setSizeHalf(200);
                setOffsetX(-240);
            }
        };
        compute();
        window.addEventListener('resize', compute);
        return () => window.removeEventListener('resize', compute);
    }, []);

    const onLogin = async (credential) => {
        try {
            const { data } = await auth.login(credential);
            message.success('Login successfully');
            try {
                await login({
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    userId: data.user.id,
                    user: data.user
                });

                console.log('Authentication state updated successfully');

                setTimeout(() => {
                    console.log('Attempting navigation...');
                    const targetPath = state?.path || PATHS.PROJECTS;
                    navigate(targetPath, { replace: true });

                    setTimeout(() => {
                        if (window.location.pathname !== targetPath) {
                            console.log('Navigate failed, using window.location');
                            window.location.href = targetPath;
                        }
                    }, 500);
                }, 200);

            } catch (authError) {
                console.error('Authentication failed:', authError);
                message.error('Authentication failed. Please try again.');
            }
            console.log('Login response:', data);
            if (data.user && data.user.ls_token) {
                console.log("Found ls_token, redirecting to Label Studio...");
                const labelStudioBaseUrl = process.env.REACT_APP_LABEL_STUDIO_URL || 'http://127.0.0.1:8080';
                const labelStudioLoginUrl = `${labelStudioBaseUrl}/user/login?user_token=${data.user.ls_token}`;
                fetch(labelStudioLoginUrl, { credentials: 'include' })
                    .then(response => response.json())
                    .then(lsResponse => {
                        if (lsResponse.status === 'success') {
                            console.log("Successfully logged into Label Studio.");
                        } else {
                            console.error("Failed to log into Label Studio.", lsResponse);
                        }
                    })
                    .catch(error => {
                        console.error("Error during Label Studio background login:", error);
                    });

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
        const credential = {
            email,
            password,
        };

        if (!validateEmail(credential.email)) {
            return message.error('Email is invalid.');
        }

        if (!validatePassword(credential.password)) {
            return message.error('Password is invalid.');
        }

        onLogin(credential);
    };

    return (
        <>
            <main className="w-full h-screen" style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#01000A' }}>
                <style>{`
                    body, html { 
                        background-color: #01000A !important;
                        overflow: hidden !important;
                        height: 100vh !important;
                        width: 100vw !important;
                    }
                `}</style>
                <div className="relative w-full h-full">
                    <BackgroundShapes 
                        width="100%" 
                        height="100%"
                        shapes={[
                            { id: 'loginBlue', shape: 'circle', size: '520px', gradient: { type: 'radial', shape: 'ellipse', colors: ['#5C8DFF 0%', '#5C8DFF 35%', 'transparent 75%'] }, opacity: 0.45, blur: '220px', position: { top: '10%', right: '-140px' }, transform: 'none' },
                            { id: 'loginCyan', shape: 'rounded', size: '420px', gradient: { type: 'radial', shape: 'circle', colors: ['#40FFFF 0%', '#40FFFF 55%', 'transparent 40%'] }, opacity: 0.30, blur: '180px', position: { top: '5%', left: '-120px' }, transform: 'none' },
                            { id: 'loginWarm', shape: 'rounded', size: '520px', gradient: { type: 'radial', shape: 'circle', colors: ['#FFAF40 0%', '#FFAF40 50%', 'transparent 85%'] }, opacity: 0.20, blur: '220px', position: { bottom: '-10%', left: '50%' }, transform: 'translate(-50%, 0%)' }
                        ]}
                    />
                    {/* Full-screen background cube layer */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <TextCubeCanvas 
                            shapeType='icosahedron'
                            offsetX={offsetX}
                            rollSpeed={0.005}
                            mouseMaxYaw={0.6}
                            mouseMaxPitch={0.6}
                            followEasing={0.08}
                            sizeHalf={sizeHalf}
                            cameraZ={420}
                            focalLength={360}
                        />
                    </div>
                    <div className="relative z-10 w-full h-full flex items-center justify-center px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 2xl:gap-32 items-center w-full max-w-6xl">
                            {/* spacer column on large screens to keep layout balance */}
                            <div className="hidden lg:block" />

                            {/* Login Card */}
                            <LoginCard handleLogin={handleLogin} />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Login;
