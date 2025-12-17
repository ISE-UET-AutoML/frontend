import React from 'react'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import useAdminAuth from 'src/hooks/useAdminAuth'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import TextCubeCanvas from 'src/components/login/TextCubeCanvas'

const AdminLogin = () => {
	const navigate = useNavigate()
	const { login } = useAdminAuth()
	const [sizeHalf, setSizeHalf] = React.useState(220)
	const [offsetX, setOffsetX] = React.useState(-260)

	React.useEffect(() => {
		const compute = () => {
			const w = window.innerWidth || 1280
			if (w >= 1920) {
				setSizeHalf(360)
				setOffsetX(-380)
			} else if (w >= 1536) {
				setSizeHalf(320)
				setOffsetX(-340)
			} else if (w >= 1280) {
				setSizeHalf(280)
				setOffsetX(-310)
			} else if (w >= 1024) {
				setSizeHalf(240)
				setOffsetX(-290)
			} else {
				setSizeHalf(200)
				setOffsetX(-240)
			}
		}
		compute()
		window.addEventListener('resize', compute)
		return () => window.removeEventListener('resize', compute)
	}, [])

	const handleAdminLogin = async (e) => {
		e.preventDefault()
		const formData = new FormData(e.target)
		const email = formData.get('email')
		const password = formData.get('password')

		try {
			await login({ email, password })
			message.success('Admin login successful!')
			setTimeout(() => {
				navigate('/admin/dashboard', { replace: true })
			}, 200)
		} catch (error) {
			console.error(error)
			message.error('Invalid admin credentials')
		}
	}

	return (
		<>
			<main
				className="w-full h-screen"
				style={{
					fontFamily: 'Poppins, sans-serif',
					backgroundColor: '#01000A',
				}}
			>
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
							{
								id: 'adminBlue',
								shape: 'circle',
								size: '520px',
								gradient: {
									type: 'radial',
									shape: 'ellipse',
									colors: [
										'#5C8DFF 0%',
										'#5C8DFF 35%',
										'transparent 75%',
									],
								},
								opacity: 0.45,
								blur: '220px',
								position: { top: '10%', right: '-140px' },
								transform: 'none',
							},
							{
								id: 'adminCyan',
								shape: 'rounded',
								size: '420px',
								gradient: {
									type: 'radial',
									shape: 'circle',
									colors: [
										'#40FFFF 0%',
										'#40FFFF 55%',
										'transparent 40%',
									],
								},
								opacity: 0.3,
								blur: '180px',
								position: { top: '5%', left: '-120px' },
								transform: 'none',
							},
							{
								id: 'adminWarm',
								shape: 'rounded',
								size: '520px',
								gradient: {
									type: 'radial',
									shape: 'circle',
									colors: [
										'#FFAF40 0%',
										'#FFAF40 50%',
										'transparent 85%',
									],
								},
								opacity: 0.2,
								blur: '220px',
								position: { bottom: '-10%', left: '50%' },
								transform: 'translate(-50%, 0%)',
							},
						]}
					/>
					<div className="absolute inset-0 z-0 pointer-events-none">
						<TextCubeCanvas
							shapeType="icosahedron"
							offsetX={offsetX}
							rollSpeed={0.005}
							mouseMaxYaw={0.6}
							mouseMaxPitch={0.6}
							sizeHalf={sizeHalf}
							opacity={0.4}
						/>
					</div>
					<div className="relative z-10 flex items-center justify-center h-full">
						<div className="w-full max-w-md px-4">
							<div
								className="backdrop-blur-xl rounded-2xl p-8 border border-white/10"
								style={{
									background: 'rgba(255,255,255,0.06)',
									boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
								}}
							>
								<div className="text-center">
									<img
										src="/PrimaryLogo.svg"
										width={150}
										className="mx-auto"
										alt="ASTRAL"
									/>
									<div className="mt-6 space-y-2">
										<h3 className="text-white text-2xl font-semibold">
											Admin Access
										</h3>
										<p className="text-white/60 text-sm">
											Sign in with admin credentials
										</p>
									</div>
								</div>
								<form
									onSubmit={handleAdminLogin}
									className="space-y-5 mt-8"
								>
									<div>
										<label className="font-medium text-white/80">
											Email
										</label>
										<input
											type="email"
											name="email"
											required
											className="w-full mt-2 px-3 py-2 text-white placeholder-white/50 bg-white/10 outline-none border border-white/20 focus:border-white/40 shadow-sm rounded-2xl"
											placeholder="admin@astral.io"
										/>
									</div>
									<div>
										<label className="font-medium text-white/80">
											Password
										</label>
										<input
											type="password"
											name="password"
											required
											className="w-full mt-2 px-3 py-2 text-white placeholder-white/50 bg-white/10 outline-none border border-white/20 focus:border-white/40 shadow-sm rounded-2xl"
											placeholder="••••••••"
										/>
									</div>
									<button
										type="submit"
										className="w-full px-4 py-2 text-white text-lg font-semibold rounded-2xl duration-200"
										style={{
											background:
												'linear-gradient(135deg,rgb(37, 88, 255) 0%,rgb(64, 255, 128) 100%)',
											boxShadow:
												'0 6px 24px rgba(92,141,255,0.35)',
										}}
									>
										Login as Admin
									</button>
								</form>
								<div className="mt-6 text-center">
									<p className="text-white/50 text-xs">
										Admin access only
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}

export default AdminLogin
