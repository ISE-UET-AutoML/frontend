import React from 'react'
import ContentContainer from '../ContentContainer'

const ServicesSection = () => {
	const services = [
		{
			id: 'data-explainer',
			title: 'Data Explainer',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim.',
			icon: (
				<svg 
					width="80" 
					height="80" 
					viewBox="0 0 100 100" 
					fill="none" 
					xmlns="http://www.w3.org/2000/svg"
					className="w-20 h-20"
				>
					<defs>
						<linearGradient id="serviceGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#5C8DFF" />
							<stop offset="100%" stopColor="#65FFA0" />
						</linearGradient>
					</defs>
					<path 
						d="M20 30 L80 30 L70 70 L10 70 Z" 
						fill="url(#serviceGradient1)" 
						opacity="0.9"
					/>
					<circle cx="75" cy="25" r="8" fill="#1a1a1a" />
				</svg>
			)
		},
		{
			id: 'automl',
			title: 'AutoML',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim.',
			icon: (
				<svg 
					width="80" 
					height="80" 
					viewBox="0 0 100 100" 
					fill="none" 
					xmlns="http://www.w3.org/2000/svg"
					className="w-20 h-20"
				>
					<defs>
						<linearGradient id="serviceGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#5C8DFF" />
							<stop offset="100%" stopColor="#65FFA0" />
						</linearGradient>
					</defs>
					<path 
						d="M20 30 L80 30 L70 70 L10 70 Z" 
						fill="url(#serviceGradient2)" 
						opacity="0.9"
					/>
					<circle cx="75" cy="25" r="8" fill="#1a1a1a" />
				</svg>
			)
		},
		{
			id: 'auto-deployment',
			title: 'Auto Deployment',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim.',
			icon: (
				<svg 
					width="80" 
					height="80" 
					viewBox="0 0 100 100" 
					fill="none" 
					xmlns="http://www.w3.org/2000/svg"
					className="w-20 h-20"
				>
					<defs>
						<linearGradient id="serviceGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#5C8DFF" />
							<stop offset="100%" stopColor="#65FFA0" />
						</linearGradient>
					</defs>
					<path 
						d="M20 30 L80 30 L70 70 L10 70 Z" 
						fill="url(#serviceGradient3)" 
						opacity="0.9"
					/>
					<circle cx="75" cy="25" r="8" fill="#1a1a1a" />
				</svg>
			)
		}
	]

	return (
		<section className="py-24 relative pt-80" style={{ zIndex: 20 }}>
			<ContentContainer>
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 
						className="text-5xl font-bold text-white mb-4"
						style={{ fontFamily: 'Poppins, sans-serif' }}
					>
						Our Services
					</h2>
					<p 
						className="text-xl text-gray-300"
						style={{ fontFamily: 'Poppins, sans-serif' }}
					>
						All you need is <span className="font-bold text-white">data</span>, the rest is on us!
					</p>
				</div>

				{/* Services Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{services.map((service) => (
						<div 
							key={service.id}
							className="bg-gray-800 bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-opacity-70 transition-all duration-300 group"
						>
							{/* Icon */}
							<div className="mb-6 flex justify-center">
								{service.icon}
							</div>

							{/* Title */}
							<h3 
								className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#5C8DFF] group-hover:to-[#65FFA0] group-hover:bg-clip-text transition-all duration-300"
								style={{ fontFamily: 'Poppins, sans-serif' }}
							>
								{service.title}
							</h3>

							{/* Description */}
							<p 
								className="text-gray-300 leading-relaxed"
								style={{ fontFamily: 'Poppins, sans-serif' }}
							>
								{service.description}
							</p>
						</div>
					))}
				</div>
			</ContentContainer>
		</section>
	)
}

export default ServicesSection
