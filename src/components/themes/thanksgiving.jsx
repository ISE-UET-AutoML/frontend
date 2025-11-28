import React, { useState, useEffect } from 'react'
import { CloseOutlined } from '@ant-design/icons'

const ThanksgivingTheme = () => {
	const [isVisible, setIsVisible] = useState(false)
	const [isClosed, setIsClosed] = useState(false)

	useEffect(() => {
		// Check if user has already closed the theme
		const closed = localStorage.getItem('thanksgivingThemeClosed')
		if (closed === 'true') {
			setIsClosed(true)
			return
		}

		setIsVisible(true)
	}, [])

	const handleClose = () => {
		setIsVisible(false)
		setIsClosed(true)
		localStorage.setItem('thanksgivingThemeClosed', 'true')
	}

	if (!isVisible || isClosed) {
		return null
	}

	return (
		<>
			{/* Scarecrow - Bottom Left */}
			<div className="fixed bottom-20 left-8 z-50 pointer-events-none">
				<div className="relative animate-sway">
					{/* Straw Hat */}
					<div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
						<div className="w-14 h-8 bg-yellow-700 rounded-t-2xl border-2 border-yellow-800"></div>
						<div className="w-20 h-2 bg-yellow-600 rounded-full -mt-1 border border-yellow-700"></div>
					</div>

					{/* Head */}
					<div className="w-16 h-16 bg-yellow-100 rounded-full border-4 border-yellow-200 relative shadow-lg">
						{/* Eyes - X eyes for scarecrow */}
						<div className="absolute top-4 left-3">
							<div className="text-xl text-black">✕</div>
						</div>
						<div className="absolute top-4 right-3">
							<div className="text-xl text-black">✕</div>
						</div>
						{/* Carrot Nose */}
						<div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-6 border-l-orange-500"></div>
						{/* Stitched Smile */}
						<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
							<div className="w-1 h-1 bg-black rounded-full"></div>
							<div className="w-1 h-1 bg-black rounded-full"></div>
							<div className="w-1 h-1 bg-black rounded-full"></div>
							<div className="w-1 h-1 bg-black rounded-full"></div>
						</div>
					</div>

					{/* Body - Brown burlap */}
					<div className="w-20 h-20 bg-amber-900 rounded-lg border-4 border-amber-950 mx-auto -mt-2 relative shadow-lg">
						{/* Straw sticking out */}
						<div className="absolute -left-2 top-4 w-2 h-3 bg-yellow-600 transform -rotate-45"></div>
						<div className="absolute -right-2 top-6 w-2 h-3 bg-yellow-600 transform rotate-45"></div>
						<div className="absolute -left-1 bottom-4 w-2 h-2 bg-yellow-600 transform -rotate-30"></div>

						{/* Straw Collar/Ruff */}
						<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-24 h-4 bg-yellow-600 border-2 border-yellow-700 rounded-sm">
							<div className="absolute inset-0 flex justify-around">
								<div className="w-1 h-2 bg-yellow-700"></div>
								<div className="w-1 h-2 bg-yellow-700"></div>
								<div className="w-1 h-2 bg-yellow-700"></div>
							</div>
						</div>

						{/* Overalls button */}
						<div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-700 rounded-full"></div>
					</div>

					{/* Bottom body - Pants */}
					<div className="w-20 h-24 bg-amber-800 rounded-lg border-4 border-amber-950 mx-auto -mt-2 shadow-lg">
						<div className="flex justify-center gap-2 mt-2">
							<div className="w-1 h-1 bg-amber-700 rounded-full"></div>
							<div className="w-1 h-1 bg-amber-700 rounded-full"></div>
							<div className="w-1 h-1 bg-amber-700 rounded-full"></div>
						</div>
					</div>

					{/* Stick Arms */}
					<div className="absolute top-20 -left-10 w-20 h-1.5 bg-amber-700 transform -rotate-30 rounded-full">
						{/* Fingers/Twigs */}
						<div className="absolute right-0 -top-1.5 w-8 h-1 bg-amber-700 transform rotate-45 rounded-full"></div>
						<div className="absolute right-0 top-2 w-8 h-1 bg-amber-700 transform -rotate-45 rounded-full"></div>
					</div>
					<div className="absolute top-20 -right-10 w-20 h-1.5 bg-amber-700 transform rotate-30 rounded-full">
						{/* Fingers/Twigs */}
						<div className="absolute left-0 -top-1.5 w-8 h-1 bg-amber-700 transform -rotate-45 rounded-full"></div>
						<div className="absolute left-0 top-2 w-8 h-1 bg-amber-700 transform rotate-45 rounded-full"></div>
					</div>
				</div>
			</div>

			{/* Turkey - Bottom Right */}
			<div className="fixed bottom-20 right-8 z-50 pointer-events-none">
				<div className="relative animate-jump">
					{/* Turkey Tail Feathers */}
					<div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
						<div className="relative flex justify-center">
							{/* Left feather */}
							<div className="absolute w-2 h-24 bg-amber-700 transform -rotate-35 rounded-full" style={{ left: '-20px', top: '-10px' }}></div>
							{/* Center left feather */}
							<div className="absolute w-2 h-28 bg-orange-600 transform -rotate-20 rounded-full" style={{ left: '-8px', top: '-15px' }}></div>
							{/* Center feather */}
							<div className="absolute w-3 h-32 bg-red-600 rounded-full"></div>
							{/* Center right feather */}
							<div className="absolute w-2 h-28 bg-orange-600 transform rotate-20 rounded-full" style={{ right: '-8px', top: '-15px' }}></div>
							{/* Right feather */}
							<div className="absolute w-2 h-24 bg-amber-700 transform rotate-35 rounded-full" style={{ right: '-20px', top: '-10px' }}></div>
						</div>
					</div>

					{/* Turkey Body */}
					<div className="relative">
						{/* Turkey Head */}
						<div className="w-10 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-full relative border-2 border-red-700 shadow-lg">
							{/* Eyes */}
							<div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full border border-black">
								<div className="w-1.5 h-1.5 bg-black rounded-full ml-0.5 mt-0.5"></div>
							</div>
							<div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full border border-black">
								<div className="w-1.5 h-1.5 bg-black rounded-full ml-0.5 mt-0.5"></div>
							</div>
							{/* Snood (red dangly thing) */}
							<div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-red-700 rounded-full"></div>
							{/* Beak */}
							<div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-3 border-t-transparent border-b-3 border-b-transparent border-l-4 border-l-yellow-500"></div>
						</div>

						{/* Turkey Body */}
						<div className="w-24 h-20 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full mx-auto -mt-4 shadow-lg border-2 border-amber-900">
							{/* Body details - lighter spots */}
							<div className="absolute top-4 left-4 w-6 h-6 bg-amber-600 rounded-full opacity-60"></div>
							<div className="absolute bottom-4 right-6 w-5 h-5 bg-orange-700 rounded-full opacity-60"></div>
						</div>

						{/* Wings - folded */}
						<div className="absolute top-8 -left-8 w-8 h-12 bg-amber-800 rounded-full border-2 border-amber-900 transform -rotate-25 animate-wave"></div>
						<div className="absolute top-8 -right-8 w-8 h-12 bg-amber-800 rounded-full border-2 border-amber-900 transform rotate-25"></div>

						{/* Legs */}
						<div className="flex justify-center gap-3 mt-2">
							<div className="w-1 h-8 bg-orange-600 rounded-full"></div>
							<div className="w-1 h-8 bg-orange-600 rounded-full"></div>
						</div>
					</div>
				</div>
			</div>

			{/* Falling Autumn Leaves */}
			<div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
				{[...Array(25)].map((_, i) => (
					<div
						key={`leaf-${i}`}
						className="absolute animate-leaf-fall"
						style={{
							left: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 5}s`,
							animationDuration: `${10 + Math.random() * 5}s`,
							fontSize: `${16 + Math.random() * 14}px`,
						}}
					>
						{['🍂', '🍁'][Math.floor(Math.random() * 2)]}
					</div>
				))}
			</div>

			{/* Thanksgiving Decorations in Corners */}
			<div className="fixed top-4 left-4 z-50 pointer-events-none animate-twinkle">
				<div className="text-5xl">🎃</div>
			</div>
			<div
				className="fixed top-4 right-4 z-50 pointer-events-none animate-twinkle"
				style={{ animationDelay: '1s' }}
			>
				<div className="text-5xl">🌽</div>
			</div>
			<div
				className="fixed bottom-24 left-4 z-50 pointer-events-none animate-swing"
				style={{ animationDelay: '0.5s' }}
			>
				<div className="text-4xl">🍇</div>
			</div>
			<div
				className="fixed bottom-24 right-4 z-50 pointer-events-none animate-swing"
				style={{ animationDelay: '0.2s' }}
			>
				<div className="text-4xl">🥧</div>
			</div>

			{/* Harvest Lights String */}
			<div className="fixed top-0 left-0 right-0 z-35 pointer-events-none">
				<div className="flex justify-around py-2">
					{[...Array(15)].map((_, i) => (
						<div
							key={`light-${i}`}
							className="w-3 h-3 rounded-full animate-pulse"
							style={{
								backgroundColor: [
									'#ff6b35',
									'#ffa500',
									'#d4a574',
									'#c41e3a',
									'#8b4513',
								][i % 5],
								animationDelay: `${i * 0.2}s`,
							}}
						/>
					))}
				</div>
			</div>

			{/* Bottom banner with close button */}
			<div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-600 via-amber-700 to-orange-600 text-white py-2 px-4 shadow-lg">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-3 flex-1 justify-center">
						<span className="text-2xl animate-bounce">🎃</span>
						<p className="text-sm md:text-base font-semibold text-center">
							Happy Thanksgiving!!🦃🌽
						</p>
						<span
							className="text-2xl animate-bounce"
							style={{ animationDelay: '0.5s' }}
						>
							🦃
						</span>
					</div>
					<button
						onClick={handleClose}
						className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors pointer-events-auto"
						aria-label="Close Thanksgiving theme"
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
						transform: rotate(-25deg);
					}
					50% {
						transform: rotate(-10deg);
					}
				}

				@keyframes leaf-fall {
					0% {
						transform: translateY(-100%) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(100vh) rotate(360deg);
						opacity: 0.7;
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

				.animate-jump {
					animation: jump 2s ease-in-out infinite;
				}

				.animate-wave {
					animation: wave 1.5s ease-in-out infinite;
				}

				.animate-leaf-fall {
					animation: leaf-fall linear infinite;
				}

				.animate-twinkle {
					animation: twinkle 2s ease-in-out infinite;
				}

				.animate-swing {
					animation: swing 2s ease-in-out infinite;
					transform-origin: top center;
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

				.animate-sway {
					animation: sway 3s ease-in-out infinite;
					transform-origin: bottom center;
				}
			`}</style>
		</>
	)
}

export default ThanksgivingTheme

