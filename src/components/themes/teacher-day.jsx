import React, { useState, useEffect } from 'react'
import { CloseOutlined } from '@ant-design/icons'

const TeacherDayTheme = () => {
	const [isVisible, setIsVisible] = useState(false)
	const [isClosed, setIsClosed] = useState(false)

	useEffect(() => {
		// Check if user has already closed the theme
		const closed = localStorage.getItem('teacherDayThemeClosed')
		if (closed === 'true') {
			setIsClosed(true)
			return
		}

		setIsVisible(true)
	}, [])

	const handleClose = () => {
		setIsVisible(false)
		setIsClosed(true)
		localStorage.setItem('teacherDayThemeClosed', 'true')
	}

	if (!isVisible || isClosed) {
		return null
	}

	return (
		<>
			{/* Floating flowers - top corners */}
			<div className="fixed top-4 left-4 z-50 pointer-events-none animate-float">
				<div className="text-6xl opacity-80">🌸</div>
			</div>
			<div
				className="fixed top-4 right-4 z-50 pointer-events-none animate-float"
				style={{ animationDelay: '1s' }}
			>
				<div className="text-6xl opacity-80">🌺</div>
			</div>
			{/* Bottom corner flowers */}
			<div
				className="fixed bottom-4 left-4 z-50 pointer-events-none animate-float"
				style={{ animationDelay: '2s' }}
			>
				<div className="text-5xl opacity-80">🌼</div>
			</div>
			<div
				className="fixed bottom-4 right-4 z-50 pointer-events-none animate-float"
				style={{ animationDelay: '1.5s' }}
			>
				<div className="text-5xl opacity-80">🌻</div>
			</div>
			{/* Bottom banner with close button */}
			<div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white py-2 px-4 shadow-lg">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-3 flex-1 justify-center">
						<span className="text-2xl animate-bounce">🎓</span>
						<p className="text-sm md:text-base font-semibold text-center">
							Chào mừng ngày Nhà giáo Việt Nam 20/11 - Happy
							Vietnamese Teacher's Day!
						</p>
						<span
							className="text-2xl animate-bounce"
							style={{ animationDelay: '0.5s' }}
						>
							📚
						</span>
					</div>
					<button
						onClick={handleClose}
						className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors pointer-events-auto"
						aria-label="Close Teacher's Day theme"
					>
						<CloseOutlined style={{ fontSize: '16px' }} />
					</button>
				</div>
			</div>{' '}
			{/* Confetti effect */}
			<div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
				{[...Array(15)].map((_, i) => (
					<div
						key={i}
						className="absolute animate-confetti"
						style={{
							left: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 5}s`,
							animationDuration: `${5 + Math.random() * 5}s`,
						}}
					>
						<div
							className="w-2 h-2 rounded-full"
							style={{
								backgroundColor: [
									'#ec4899',
									'#f43f5e',
									'#ef4444',
									'#f59e0b',
									'#eab308',
									'#84cc16',
								][Math.floor(Math.random() * 6)],
							}}
						/>
					</div>
				))}
			</div>
			{/* Falling petals */}
			<div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
				{[...Array(10)].map((_, i) => (
					<div
						key={`petal-${i}`}
						className="absolute animate-fall"
						style={{
							left: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 5}s`,
							animationDuration: `${8 + Math.random() * 4}s`,
						}}
					>
						<span className="text-2xl opacity-70">🌸</span>
					</div>
				))}
			</div>
			{/* CSS Animations */}
			<style jsx>{`
				@keyframes float {
					0%,
					100% {
						transform: translateY(0px) rotate(0deg);
					}
					50% {
						transform: translateY(-20px) rotate(10deg);
					}
				}

				@keyframes confetti {
					0% {
						transform: translateY(-100%) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(100vh) rotate(720deg);
						opacity: 0;
					}
				}

				@keyframes fall {
					0% {
						transform: translateY(-100%) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(100vh) rotate(360deg);
						opacity: 0;
					}
				}

				.animate-float {
					animation: float 3s ease-in-out infinite;
				}

				.animate-confetti {
					animation: confetti linear infinite;
				}

				.animate-fall {
					animation: fall linear infinite;
				}
			`}</style>
		</>
	)
}

export default TeacherDayTheme
