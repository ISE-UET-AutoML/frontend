import React, { useState, useEffect } from 'react'
import { CloseOutlined } from '@ant-design/icons'

const ChristmasTheme = () => {
	const [isVisible, setIsVisible] = useState(false)
	const [isClosed, setIsClosed] = useState(false)

	useEffect(() => {
		// Check if user has already closed the theme
		const closed = localStorage.getItem('christmasThemeClosed')
		if (closed === 'true') {
			setIsClosed(true)
			return
		}

		setIsVisible(true)
	}, [])

	const handleClose = () => {
		setIsVisible(false)
		setIsClosed(true)
		localStorage.setItem('christmasThemeClosed', 'true')
	}

	if (!isVisible || isClosed) {
		return null
	}

	return (
		<>
			{/* Snowman - Bottom Left */}
			<div className="fixed bottom-20 left-8 z-50 pointer-events-none">
				<div className="relative animate-sway">
					{/* Top Hat */}
					<div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
						<div className="w-12 h-8 bg-black rounded-t-lg"></div>
						<div className="w-16 h-2 bg-black rounded-full -mt-1"></div>
					</div>

					{/* Snowman Head */}
					<div className="w-16 h-16 bg-white rounded-full border-4 border-gray-200 relative shadow-lg">
						{/* Eyes */}
						<div className="absolute top-5 left-3 w-2 h-2 bg-black rounded-full"></div>
						<div className="absolute top-5 right-3 w-2 h-2 bg-black rounded-full"></div>
						{/* Carrot Nose */}
						<div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-6 border-l-orange-500"></div>
						{/* Smile with coal */}
						<div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
							<div className="w-1 h-1 bg-black rounded-full"></div>
							<div className="w-1 h-1 bg-black rounded-full"></div>
							<div className="w-1 h-1 bg-black rounded-full"></div>
						</div>
					</div>

					{/* Snowman Body - Middle */}
					<div className="w-20 h-20 bg-white rounded-full border-4 border-gray-200 mx-auto -mt-2 relative shadow-lg">
						{/* Coal Buttons */}
						<div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full"></div>
						<div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full"></div>
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full"></div>

						{/* Scarf */}
						<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-20 h-3 bg-green-600 border-2 border-green-700 rounded-sm">
							<div className="absolute inset-0 flex justify-around items-center">
								<div className="w-1 h-1 bg-red-500 rounded-full"></div>
								<div className="w-1 h-1 bg-red-500 rounded-full"></div>
								<div className="w-1 h-1 bg-red-500 rounded-full"></div>
							</div>
						</div>
						{/* Scarf hanging part */}
						<div className="absolute top-1 -left-2 w-6 h-10 bg-green-600 border-2 border-green-700 rounded-sm transform -rotate-12 animate-wave-slow"></div>
					</div>

					{/* Snowman Body - Bottom */}
					<div className="w-24 h-24 bg-white rounded-full border-4 border-gray-200 mx-auto -mt-2 shadow-lg"></div>

					{/* Stick Arms */}
					<div className="absolute top-20 -left-8 w-16 h-1 bg-amber-800 transform -rotate-45 rounded-full">
						{/* Fingers */}
						<div className="absolute right-0 -top-1 w-6 h-0.5 bg-amber-800 transform rotate-45 rounded-full"></div>
						<div className="absolute right-0 top-1 w-6 h-0.5 bg-amber-800 transform -rotate-30 rounded-full"></div>
					</div>
					<div className="absolute top-20 -right-8 w-16 h-1 bg-amber-800 transform rotate-45 rounded-full">
						{/* Fingers */}
						<div className="absolute left-0 -top-1 w-6 h-0.5 bg-amber-800 transform -rotate-45 rounded-full"></div>
						<div className="absolute left-0 top-1 w-6 h-0.5 bg-amber-800 transform rotate-30 rounded-full"></div>
					</div>
				</div>
			</div>

			{/* Jumping AI Robot with Santa Hat - Bottom Right */}
			<div className="fixed bottom-20 right-8 z-50 pointer-events-none">
				<div className="relative animate-jump">
					{/* Santa Hat */}
					<div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
						<div className="relative">
							{/* Hat body */}
							<div className="w-16 h-16 bg-red-600 rounded-full relative overflow-hidden">
								<div className="absolute bottom-0 left-0 right-0 h-3 bg-white"></div>
							</div>
							{/* Hat tip */}
							<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-red-600"></div>
							{/* Pom-pom */}
							<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
						</div>
					</div>

					{/* Robot Body */}
					<div className="relative">
						{/* Robot Head */}
						<div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg relative border-4 border-blue-700 shadow-lg">
							{/* Eyes - happy eyes */}
							<div className="absolute top-5 left-3 w-5 h-5 bg-white rounded-full animate-blink">
								<div className="absolute top-1 left-1.5 w-2.5 h-2.5 bg-black rounded-full"></div>
								<div className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-white rounded-full"></div>
							</div>
							<div className="absolute top-5 right-3 w-5 h-5 bg-white rounded-full animate-blink">
								<div className="absolute top-1 left-1.5 w-2.5 h-2.5 bg-black rounded-full"></div>
								<div className="absolute top-0.5 right-1 w-1.5 h-1.5 bg-white rounded-full"></div>
							</div>
							{/* Rosy Cheeks */}
							<div className="absolute top-8 left-1 w-3 h-2 bg-pink-400 rounded-full opacity-60"></div>
							<div className="absolute top-8 right-1 w-3 h-2 bg-pink-400 rounded-full opacity-60"></div>
							{/* Big Happy Smile */}
							<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-4 border-b-3 border-yellow-400 rounded-full"></div>
							{/* Antenna with star */}
							<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-blue-700"></div>
							<div className="absolute -top-9 left-1/2 transform -translate-x-1/2 text-xl animate-spin-slow">
								⭐
							</div>
						</div>

						{/* Christmas Scarf */}
						<div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-red-600 border-2 border-red-700 rounded-sm z-10">
							<div className="absolute inset-0 flex justify-around items-center">
								<div className="w-1 h-1 bg-white rounded-full"></div>
								<div className="w-1 h-1 bg-white rounded-full"></div>
								<div className="w-1 h-1 bg-white rounded-full"></div>
							</div>
						</div>
						{/* Scarf end */}
						<div className="absolute top-20 right-0 w-8 h-12 bg-red-600 border-2 border-red-700 rounded-sm transform rotate-12 animate-wave"></div>

						{/* Robot Body */}
						<div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-md mx-auto mt-1 border-2 border-gray-600">
							<div className="w-3 h-3 bg-green-500 rounded-full mx-auto mt-2 animate-pulse"></div>
							<div className="w-8 h-1 bg-gray-600 mx-auto mt-2"></div>
							<div className="w-8 h-1 bg-gray-600 mx-auto mt-1"></div>
						</div>

						{/* Arms */}
						<div className="absolute top-20 -left-6 w-5 h-12 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 transform rotate-12 animate-wave"></div>
						<div className="absolute top-20 -right-6 w-5 h-12 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 transform -rotate-12"></div>

						{/* Legs */}
						<div className="flex justify-center gap-2 mt-1">
							<div className="w-4 h-10 bg-gradient-to-b from-gray-400 to-gray-600 rounded-md border-2 border-gray-700"></div>
							<div className="w-4 h-10 bg-gradient-to-b from-gray-400 to-gray-600 rounded-md border-2 border-gray-700"></div>
						</div>
					</div>
				</div>
			</div>

			{/* Snowflakes */}
			<div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
				{[...Array(20)].map((_, i) => (
					<div
						key={`snow-${i}`}
						className="absolute animate-snowfall"
						style={{
							left: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 5}s`,
							animationDuration: `${8 + Math.random() * 4}s`,
							fontSize: `${12 + Math.random() * 12}px`,
						}}
					>
						❄️
					</div>
				))}
			</div>

			{/* Christmas Decorations in Corners */}
			<div className="fixed top-4 left-4 z-50 pointer-events-none animate-twinkle">
				<div className="text-5xl">🎄</div>
			</div>
			<div
				className="fixed top-4 right-4 z-50 pointer-events-none animate-twinkle"
				style={{ animationDelay: '1s' }}
			>
				<div className="text-5xl">🎁</div>
			</div>
			<div
				className="fixed bottom-24 left-4 z-50 pointer-events-none animate-swing"
				style={{ animationDelay: '0.5s' }}
			>
				<div className="text-4xl">🍬</div>
			</div>

			{/* Christmas Lights String */}
			<div className="fixed top-0 left-0 right-0 z-35 pointer-events-none">
				<div className="flex justify-around py-2">
					{[...Array(15)].map((_, i) => (
						<div
							key={`light-${i}`}
							className="w-3 h-3 rounded-full animate-pulse"
							style={{
								backgroundColor: [
									'#ff0000',
									'#00ff00',
									'#ffff00',
									'#0000ff',
									'#ff00ff',
								][i % 5],
								animationDelay: `${i * 0.2}s`,
							}}
						/>
					))}
				</div>
			</div>

			{/* Bottom banner with close button */}
			<div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-green-600 via-red-600 to-green-600 text-white py-2 px-4 shadow-lg">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-3 flex-1 justify-center">
						<span className="text-2xl animate-bounce">🎄</span>
						<p className="text-sm md:text-base font-semibold text-center">
							Merry Christmas!!🎅🎁
						</p>
						<span
							className="text-2xl animate-bounce"
							style={{ animationDelay: '0.5s' }}
						>
							🎅
						</span>
					</div>
					<button
						onClick={handleClose}
						className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors pointer-events-auto"
						aria-label="Close Christmas theme"
					>
						<CloseOutlined style={{ fontSize: '16px' }} />
					</button>
				</div>
			</div>

			{/* CSS Animations */}
			<style jsx>{`
				@keyframes jump {
					0%,
					100% {
						transform: translateY(0);
					}
					50% {
						transform: translateY(-30px);
					}
				}

				@keyframes wave {
					0%,
					100% {
						transform: rotate(12deg);
					}
					50% {
						transform: rotate(45deg);
					}
				}

				@keyframes blink {
					0%,
					90%,
					100% {
						opacity: 1;
					}
					95% {
						opacity: 0;
					}
				}

				@keyframes eye-move {
					0%,
					100% {
						transform: translate(0, 0);
					}
					25% {
						transform: translate(2px, 0);
					}
					50% {
						transform: translate(0, 2px);
					}
					75% {
						transform: translate(-2px, 0);
					}
				}

				@keyframes snowfall {
					0% {
						transform: translateY(-100%) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(100vh) rotate(360deg);
						opacity: 0.8;
					}
				}

				@keyframes twinkle {
					0%,
					100% {
						opacity: 1;
						transform: scale(1) rotate(0deg);
					}
					50% {
						opacity: 0.4;
						transform: scale(1.2) rotate(180deg);
					}
				}

				@keyframes swing {
					0%,
					100% {
						transform: rotate(-15deg);
					}
					50% {
						transform: rotate(15deg);
					}
				}

				@keyframes spin-slow {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(360deg);
					}
				}

				.animate-jump {
					animation: jump 2s ease-in-out infinite;
				}

				.animate-wave {
					animation: wave 1.5s ease-in-out infinite;
				}

				.animate-blink {
					animation: blink 3s ease-in-out infinite;
				}

				.animate-eye-move {
					animation: eye-move 3s ease-in-out infinite;
				}

				.animate-snowfall {
					animation: snowfall linear infinite;
				}

				.animate-twinkle {
					animation: twinkle 2s ease-in-out infinite;
				}

				.animate-swing {
					animation: swing 2s ease-in-out infinite;
					transform-origin: top center;
				}

				.animate-spin-slow {
					animation: spin-slow 4s linear infinite;
				}

				@keyframes sway {
					0%,
					100% {
						transform: rotate(-3deg);
					}
					50% {
						transform: rotate(3deg);
					}
				}

				@keyframes wave-slow {
					0%,
					100% {
						transform: rotate(-12deg);
					}
					50% {
						transform: rotate(-25deg);
					}
				}

				.animate-sway {
					animation: sway 3s ease-in-out infinite;
					transform-origin: bottom center;
				}

				.animate-wave-slow {
					animation: wave-slow 2s ease-in-out infinite;
				}
			`}</style>
		</>
	)
}

export default ChristmasTheme
