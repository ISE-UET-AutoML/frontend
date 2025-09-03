import React from 'react'
import LandingNavbar from './LandingNavbar'
import HeroSection from './HeroSection'
import ServicesSection from './ServicesSection'
import ShowcaseSection from './ShowcaseSection'
import FooterSection from './FooterSection'
import BackgroundShapes from './BackgroundShapes'

/**
 * LandingPage - Main wrapper component for the landing page
 * 
 * This component handles:
 * - Overall page layout and styling
 * - Scroll state management
 * - Background and positioning
 * - Section organization
 */
const LandingPage = () => {
	const [navbarOpen, setNavbarOpen] = React.useState(false)
	const [scrolled, setScrolled] = React.useState(false)

	React.useEffect(() => {
		const handleScroll = () => {
			const isScrolled = window.scrollY > 50
			setScrolled(isScrolled)
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<div 
			className="min-h-screen text-white relative" 
			style={{ backgroundColor: '#01000A' }}
		>
			{/* Background Effects Layer */}
			<BackgroundShapes />
			
			{/* Navigation Layer */}
			<LandingNavbar 
				scrolled={scrolled}
				navbarOpen={navbarOpen}
				setNavbarOpen={setNavbarOpen}
			/>
			
			{/* Content Sections */}
			<main>
				<HeroSection />
				<ServicesSection />
				<ShowcaseSection />
				<FooterSection />
				
				{/* 
				Future sections can be easily added here:
				<AboutSection />
				<FeaturesSection />
				<TestimonialsSection />
				<PricingSection />
				<ContactSection />
				*/}
			</main>
		</div>
	)
}

export default LandingPage
