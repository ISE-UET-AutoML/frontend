import React from 'react'
import { Button } from 'src/components/ui/button'
import ContentContainer from '../ContentContainer'
import GlowingLight from './GlowingLight'
import robotImage from 'src/assets/images/Robot_with_light.png'

const HeroSection = () => {
	return (
		<section className="text-gray-600 body-font relative" style={{ zIndex: 20 }}>
			<ContentContainer className="pt-64 pb-24">
				<div className="relative">
					{/* Left side: Content */}
					<div className="max-w-4xl">
						<h1 className="text-left text-7xl lh-6 ld-04 text-white mb-6">
							<div 
								className="font-bold"
								style={{ fontFamily: 'Poppins, sans-serif' }}
							>
								Build your model
							</div>
							<div 
								className="text-7xl font-bold italic inline-block"
								style={{
									fontFamily: 'Poppins, sans-serif',
									background: 'linear-gradient(90deg, #5C8DFF 0%, #65FFA0 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text',
									color: 'transparent'
								}}
							>
								fast and easy
							</div>
						</h1>
						
						<h2 
							className="text-xl font-4 font-regular lh-6 ld-04 pb-11 text-white text-left"
							style={{ fontFamily: 'Poppins, sans-serif' }}
						>
							Launch powerful AI models in minutes with our automated platform. <br />
							<span className="font-bold">No coding</span> — just faster results, lower costs, and smarter decisions.
						</h2>
						
						<div className="text-left flex gap-4">
							<Button
								href="/login"
								variant="gradientHover"
								size="hero"
								width="180px"
							>
								START NOW
							</Button>
							
							<Button
								href="#contact"
								variant="gradientOutline"
								size="hero"
								width="180px"
							>
								CONTACT US
							</Button>
						</div>
					</div>

					{/* Robot Image with Glowing Lights - Positioned absolutely so it doesn't push text */}
					<div className="absolute top-20 left-1/2 h-full flex items-center">
						<div className="relative">
							<img 
								src={robotImage} 
								alt="AI Robot" 
								className="max-w-7xl h-auto object-contain"
								style={{ maxHeight: '1000px' }}
							/>
							
							{/* Glowing Robot Eyes */}
							<GlowingLight 
								position={{ top: '265px', left: '435px' }}
								color="#00FFFF"
								size="100px"
								blur="20px"
								minOpacity={0.65}
								maxOpacity={0.85}
								animationDuration="2s"
							/>
							<GlowingLight 
								position={{ top: '235px', left: '525px' }}
								color="#00FFFF"
								size="100px"
								blur="20px"
								minOpacity={0.65}
								maxOpacity={0.85}
								animationDuration="2s"
							/>							
							
                            <GlowingLight 
								position={{ top: '235px', left: '330px' }}
								color="#FFFF00"
								size="300px"
								blur="80px"
								minOpacity={0.2}
								maxOpacity={0.4}
								animationDuration="2s"
							/>	

							{/* Head Light/Antenna */}
							<GlowingLight 
								position={{ top: '80px', left: '190px' }}
								color="#FFFF00"
								size="6px"
								blur="10px"
								minOpacity={0.5}
								maxOpacity={1.0}
								animationDuration="1.5s"
								animationDelay="0.8s"
							/>
						</div>
					</div>
				</div>
			</ContentContainer>
		</section>
	)
}

export default HeroSection
