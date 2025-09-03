import React, { useState } from 'react'
import ContentContainer from '../ContentContainer'
import darkUIDemo from 'src/assets/images/dark_ui_demo.png'
import labelingImage from 'src/assets/images/Labeling.png'
import solutionImage from 'src/assets/images/Solution.png'
import researchImage from 'src/assets/images/research.png'
import listDataImage from 'src/assets/images/listData.png'

const ShowcaseSection = () => {
	const [hoveredIndex, setHoveredIndex] = useState(null)

	// Sample showcase items - you can replace with your actual content
	const showcaseItems = [
		{
			id: 1,
			title: "Data Processing",
			description: "Advanced data processing pipeline",
			image: darkUIDemo,
			category: "Pipeline"
		},
		{
			id: 2,
			title: "Data Labeling",
			description: "Intelligent data labeling interface",
			image: labelingImage,
			category: "Labeling"
		},
		{
			id: 3,
			title: "ML Solutions",
			description: "Pre-built machine learning solutions",
			image: solutionImage,
			category: "Solutions"
		},
		{
			id: 4,
			title: "Research Tools",
			description: "Advanced research and experimentation",
			image: researchImage,
			category: "Research"
		},
		{
			id: 5,
			title: "Data Management",
			description: "Comprehensive data management system",
			image: listDataImage,
			category: "Data"
		}
	]

	return (
		<section className="py-24 relative overflow-hidden" style={{ zIndex: 20 }}>
			<ContentContainer>
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 
						className="text-3xl font-bold text-white mb-4"
						style={{ fontFamily: 'Poppins, sans-serif' }}
					>
						Building an <span 
							className="bg-gradient-to-r from-[#FFAF40] to-[#DE64BF] bg-clip-text text-transparent"
						>
							ML system
						</span> has never been easier!
					</h2>
				</div>

				{/* 3D Showcase Grid */}
				<div 
					className="relative"
					style={{ 
						perspective: '1000px',
						perspectiveOrigin: 'center center'
					}}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{showcaseItems.map((item, index) => (
							<div
								key={item.id}
								className="relative group cursor-pointer"
								onMouseEnter={() => setHoveredIndex(index)}
								onMouseLeave={() => setHoveredIndex(null)}
								style={{
									transformStyle: 'preserve-3d',
									transition: 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
									transform: hoveredIndex === null 
										? 'rotateX(0deg) rotateY(0deg) translateZ(0px)'
										: hoveredIndex === index
											? 'rotateX(-10deg) rotateY(10deg) translateZ(50px) scale(1.05)'
											: index < hoveredIndex
												? 'rotateX(5deg) rotateY(-15deg) translateZ(-30px) translateX(-20px)'
												: 'rotateX(5deg) rotateY(15deg) translateZ(-30px) translateX(20px)'
								}}
							>
								{/* Image Card */}
								<div 
									className="relative bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl"
									style={{
										boxShadow: hoveredIndex === index 
											? '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(92, 141, 255, 0.3)'
											: '0 10px 25px rgba(0, 0, 0, 0.3)'
									}}
								>
									{/* Screenshot/Image */}
									<div className="relative h-48 overflow-hidden">
										<img 
											src={item.image}
											alt={item.title}
											className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
										
										{/* Overlay gradient */}
										<div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										
										{/* Category badge */}
										<div className="absolute top-3 left-3">
											<span className="px-3 py-1 bg-gradient-to-r from-[#5C8DFF] to-[#65FFA0] text-white text-xs font-bold rounded-full">
												{item.category}
											</span>
										</div>
									</div>

									{/* Content */}
									<div className="p-6">
										<h3 
											className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#5C8DFF] group-hover:to-[#65FFA0] group-hover:bg-clip-text transition-all duration-300"
											style={{ fontFamily: 'Poppins, sans-serif' }}
										>
											{item.title}
										</h3>
										<p 
											className="text-gray-300 text-sm"
											style={{ fontFamily: 'Poppins, sans-serif' }}
										>
											{item.description}
										</p>
									</div>

									{/* Glow effect */}
									<div 
										className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
										style={{
											background: 'linear-gradient(45deg, #5C8DFF, #65FFA0)',
											filter: 'blur(20px)',
											transform: 'scale(1.1)'
										}}
									/>
								</div>

								{/* Reflection effect */}
								<div 
									className="absolute top-full left-0 right-0 h-20 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
									style={{
										background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
										transform: 'rotateX(180deg) translateY(-1px)',
										maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), transparent)'
									}}
								/>
							</div>
						))}
					</div>
				</div>

				{/* Bottom CTA */}
				<div className="text-center mt-16">
					<p 
						className="text-gray-300 mb-6"
						style={{ fontFamily: 'Poppins, sans-serif' }}
					>
						Experience the power of automated machine learning
					</p>
				</div>
			</ContentContainer>
		</section>
	)
}

export default ShowcaseSection
