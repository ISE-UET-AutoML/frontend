import { useState, useEffect } from 'react';
import logo from 'src/assets/images/logo.png';
import { validatePassword } from 'src/utils/validate';
import { signup } from 'src/api/auth';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import BackgroundShapes from 'src/components/landing/BackgroundShapes';
import TextCubeCanvas from 'src/components/login/TextCubeCanvas';

const SignUp = () => {
	const navigate = useNavigate();
	const [sizeHalf, setSizeHalf] = useState(220);
	const [offsetX, setOffsetX] = useState(-260);

	// Responsive 3D shape sizing
	useEffect(() => {
		const compute = () => {
			const w = window.innerWidth || 1280;
			if (w >= 1920) {
				setSizeHalf(360);
				setOffsetX(-380);
			} else if (w >= 1536) { // 2xl
				setSizeHalf(320);z
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

	const [formState, setFormState] = useState({
		email: {
			value: '',
			error: '',
			touched: false,
		},
		password: {
			value: '',
			error: '',
			touched: false,
		},
		confirmPassword: {
			value: '',
			error: '',
			touched: false,
		},
		full_name: {
			value: '',
			error: '',
			touched: false,
		},
	});

	const handleSignUp = async (e) => {
		e.preventDefault();

		const formData = new FormData(e.target);
		const email = formData.get('email');
		const password = formData.get('password');
		const full_name = formData.get('full_name');

		try {
			const response = await signup({ full_name, email, password });

			if (response) {
				message.success('Đăng ký tài khoản thành công!');
				console.log('Đăng ký thành công:', response);
				navigate('/login', { replace: true });
			}
		} catch (error) {
			// Ngăn chặn error propagation
			if (error.response?.status === 400 && error.response?.data?.error) {
				if (error.response.data.error === "Đã có người sử dụng email này.") {
					setFormState(prev => ({
						...prev,
						email: {
							...prev.email,
							error: error.response.data.error,
							touched: true,
							value: email
						}
					}));
					message.warning('Email này đã được sử dụng, vui lòng chọn email khác.');
				} else {
					message.warning(error.response.data.error);
				}
			} else {
				message.error('Có lỗi xảy ra, vui lòng thử lại sau.');
			}
			// Quan trọng: không throw lại error để tránh uncaught error
		}
	};

	const handlePasswordChange = (event) => {
		const password = event.target.value;
		if (!validatePassword(password)) {
			setFormState((prevState) => ({
				...prevState,
				password: {
					...prevState.password,
					error: 'Password must be at least 8 characters',
					touched: true,
				},
			}));
		} else if (
			formState.confirmPassword.value !== password &&
			formState.confirmPassword.touched
		) {
			setFormState((prevState) => ({
				...prevState,
				password: {
					value: password,
				},
				confirmPassword: {
					error: 'Passwords do not match',
					value: formState.confirmPassword.value,
					touched: true,
				},
			}));
		} else {
			setFormState((prevState) => ({
				...prevState,
				password: {
					value: password,
					error: '',
					touched: true,
				},
				confirmPassword: {
					error: '',
					touched: true,
				},
			}));
		}
	};

	const handleConfirmPasswordChange = (event) => {
		const confirmPassword = event.target.value;
		if (formState.password.value !== confirmPassword) {
			setFormState((prevState) => ({
				...prevState,
				confirmPassword: {
					value: confirmPassword,
					error: 'Passwords do not match',
					touched: true,
				},
			}));
		} else {
			setFormState((prevState) => ({
				...prevState,
				confirmPassword: {
					value: confirmPassword,
					error: '',
					touched: true,
				},
			}));
		}
	};

	const handleEmailChange = (event) => {
		const email = event.target.value;
		setFormState(prev => ({
			...prev,
			email: {
				value: email,
				error: '',
				touched: true
			}
		}));
	};

	return (
		<>
			<style>{`
				body, html {
					background-color: #01000A !important;
					font-family: 'Poppins', sans-serif !important;
					overflow: hidden !important;
					height: 100vh !important;
					width: 100vw !important;
				}
				input[type="password"]::placeholder {
					color: rgba(255, 255, 255, 0.5) !important;
				}
			`}</style>
			<main className="w-full h-screen" style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#01000A' }}>
				<div className="relative w-full h-full">
					<BackgroundShapes 
						width="100%" 
						height="100%"
						shapes={[
							{ id: 'signupBlue', shape: 'circle', size: '520px', gradient: { type: 'radial', shape: 'ellipse', colors: ['#5C8DFF 0%', '#5C8DFF 35%', 'transparent 75%'] }, opacity: 0.45, blur: '220px', position: { top: '10%', right: '-140px' }, transform: 'none' },
							{ id: 'signupCyan', shape: 'rounded', size: '420px', gradient: { type: 'radial', shape: 'circle', colors: ['#40FFFF 0%', '#40FFFF 55%', 'transparent 40%'] }, opacity: 0.30, blur: '180px', position: { top: '5%', left: '-120px' }, transform: 'none' },
							{ id: 'signupWarm', shape: 'rounded', size: '520px', gradient: { type: 'radial', shape: 'circle', colors: ['#FFAF40 0%', '#FFAF40 50%', 'transparent 85%'] }, opacity: 0.20, blur: '220px', position: { bottom: '-10%', left: '50%' }, transform: 'translate(-50%, 0%)' }
						]}
					/>
					
					{/* Full-screen background shape layer */}
					<div className="absolute inset-0 z-0 pointer-events-none">
						<TextCubeCanvas 
							shapeType='cube'
							offsetX={offsetX}
							rollSpeed={0.008}
							mouseMaxYaw={0.8}
							mouseMaxPitch={0.8}
							followEasing={0.06}
							sizeHalf={sizeHalf}
							cameraZ={450}
							focalLength={380}
							initialYaw={-0.4}
							initialPitch={0.25}
							baseSpinYaw={-0.004}
							baseSpinPitch={0.003}
							glowColor='rgba(101, 255, 160, 0.9)'
						/>
					</div>

					<div className="relative z-10 w-full h-full flex items-center justify-center px-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 2xl:gap-32 items-center w-full max-w-6xl">
							{/* Left side - spacer for 3D shape */}
							<div className="hidden lg:block" />

							{/* Right side - Signup Form */}
							<div className="w-full max-w-md mx-auto lg:mx-0">
								{/* Form Card - Matching LoginCard styling */}
								<div className="w-full">
									<div className="backdrop-blur-xl rounded-2xl p-8 border border-white/10" style={{ background: 'rgba(255,255,255,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
										<div className="text-center">
											<img
												src="/PrimaryLogo.svg"
												width={150}
												className="mx-auto"
												alt="ASTRAL"
											/>
											<div className="mt-6 space-y-2">
												<h3 className="text-white text-2xl font-semibold">Create Account</h3>
												<p className="text-white/60 text-sm">Join us and start your journey</p>
											</div>
										</div>
										<form onSubmit={handleSignUp} className="space-y-5 mt-8">
											<div>
												<label className="font-medium text-white/80">Full Name</label>
												<input
													type="text"
													name="full_name"
													required
													className="w-full mt-2 px-3 py-2 text-white placeholder-white/50 bg-white/10 outline-none border border-white/20 focus:border-white/40 shadow-sm rounded-2xl"
													placeholder="Your full name"
												/>
											</div>
											<div>
												<label className="font-medium text-white/80">Email</label>
												<input
													type="email"
													name="email"
													value={formState.email.value}
													onChange={handleEmailChange}
													required
													className={`w-full mt-2 px-3 py-2 text-white placeholder-white/50 bg-white/10 outline-none border shadow-sm rounded-2xl ${
														formState.email.error 
															? 'border-red-400/50 focus:border-red-400/70' 
															: 'border-white/20 focus:border-white/40'
													}`}
													placeholder="you@example.com"
												/>
												{formState.email.touched && formState.email.error && (
													<p className="text-red-400 text-sm mt-1">
														{formState.email.error}
													</p>
												)}
											</div>
											<div>
												<label className="font-medium text-white/80">Password</label>
												<input
													type="password"
													name="password"
													required
													onChange={handlePasswordChange}
													className="w-full mt-2 px-3 py-2 text-white placeholder-white/50 bg-white/10 outline-none border border-white/20 focus:border-white/40 shadow-sm rounded-2xl"
													placeholder="••••••••"
												/>
												{formState.password.touched && formState.password.error && (
													<p className="text-red-400 text-sm mt-1">
														{formState.password.error}
													</p>
												)}
											</div>
											<div>
												<label className="font-medium text-white/80">Confirm Password</label>
												<input
													type="password"
													name="confirmPassword"
													required
													onChange={handleConfirmPasswordChange}
													className="w-full mt-2 px-3 py-2 text-white placeholder-white/50 bg-white/10 outline-none border border-white/20 focus:border-white/40 shadow-sm rounded-2xl"
													placeholder="••••••••"
												/>
												{formState.confirmPassword.touched && formState.confirmPassword.error && (
													<p className="text-red-400 text-sm mt-1">
														{formState.confirmPassword.error}
													</p>
												)}
											</div>
											<button
												className="w-full px-4 py-2 text-white text-lg font-semibold rounded-2xl duration-200"
												style={{
													background: 'linear-gradient(135deg,rgb(37, 88, 255) 0%,rgb(64, 255, 128) 100%)',
													boxShadow: '0 6px 24px rgba(92,141,255,0.35)'
												}}
											>
												Create Account
											</button>
										</form>

										<p className="mt-4 text-white/70 text-sm">
											Already have an account?{' '}
											<a
												href="/login"
												className="font-medium"
												style={{ color: '#5C8DFF' }}
											>
												Log in
											</a>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
};

export default SignUp;
