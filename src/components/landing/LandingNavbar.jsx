import React, { useState } from 'react'

const LandingNavbar = ({ scrolled, navbarOpen, setNavbarOpen }) => {
	const [hoveredItem, setHoveredItem] = useState(null)
	const [activeDropdown, setActiveDropdown] = useState(null)
	const [hideTimeout, setHideTimeout] = useState(null)

	// Navigation items with potential dropdowns
	const navigationItems = [
		{
			name: 'ABOUT',
			href: '#about',
			dropdownItems: [
				{ name: 'Our Story', href: '#story' },
				{ name: 'Team', href: '#team' },
				{ name: 'Mission', href: '#mission' }
			]
		},
		{
			name: 'PROJECTS',
			href: '/app/projects',
			dropdownItems: null // No dropdown for this one
		},
		{
			name: 'PRICING',
			href: '#pricing',
			dropdownItems: [
				{ name: 'Plans', href: '#plans' },
				{ name: 'Enterprise', href: '#enterprise' },
				{ name: 'Free Trial', href: '#trial' }
			]
		},
		{
			name: 'PROFILE',
			href: '#profile',
			dropdownItems: [
				{ name: 'Dashboard', href: '#dashboard' },
				{ name: 'Settings', href: '#settings' },
				{ name: 'Account', href: '#account' }
			]
		}
	]

	const handleMouseEnter = (itemName) => {
		// Clear any pending hide timeout
		if (hideTimeout) {
			clearTimeout(hideTimeout)
			setHideTimeout(null)
		}
		
		setHoveredItem(itemName)
		const item = navigationItems.find(nav => nav.name === itemName)
		if (item?.dropdownItems) {
			setActiveDropdown(itemName)
		} else {
			setActiveDropdown(null)
		}
	}

	const handleMouseLeave = () => {
		setHoveredItem(null)
		// Delay hiding dropdown to allow mouse movement to dropdown
		const timeout = setTimeout(() => {
			setActiveDropdown(null)
		}, 150)
		setHideTimeout(timeout)
	}

	const handleNavbarMouseLeave = () => {
		setHoveredItem(null)
		setActiveDropdown(null)
		if (hideTimeout) {
			clearTimeout(hideTimeout)
			setHideTimeout(null)
		}
	}

	return (
		<header 
			className="fixed top-0 w-full z-50 transition-all duration-300 pt-6 pb-6" 
			style={{ 
				backgroundColor: scrolled ? 'rgba(1, 0, 10, 0.5)' : 'rgba(1, 0, 10, 0)',
				backdropFilter: scrolled ? 'blur(10px)' : 'none',
				zIndex: 50
			}}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Left: ASTRAL Logo */}
					<div className="flex-shrink-0">
						<img
							src="/PrimaryLogo.svg"
							alt="ASTRAL"
							className="h-10 w-auto cursor-pointer transition-transform duration-300 hover:scale-105"
							onClick={() => window.location.href = '/'}
						/>
					</div>

					{/* Center: Navigation Items */}
					<div className="hidden md:block">
						<div 
							className="flex items-baseline space-x-8"
							onMouseLeave={handleNavbarMouseLeave}
						>
							{navigationItems.map((item) => (
								<div 
									key={item.name}
									className="relative"
									onMouseEnter={() => handleMouseEnter(item.name)}
									onMouseLeave={handleMouseLeave}
								>
									<a
										href={item.href}
										className="px-3 py-2 text-sm font-bold text-white opacity-80 hover:opacity-100 transition-all duration-200 relative"
										style={{ fontFamily: 'Poppins, sans-serif' }}
									>
										{item.name}
										
										{/* Animated underline */}
										<div
											className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#5C8DFF] to-[#65FFA0] rounded-full transition-all duration-300 ${
												hoveredItem === item.name 
													? 'w-full opacity-100' 
													: 'w-0 opacity-0'
											}`}
										/>
									</a>

									{/* Dropdown Menu */}
									{item.dropdownItems && activeDropdown === item.name && (
										<div 
											className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-900 bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 overflow-hidden"
											style={{ zIndex: 60 }}
											onMouseEnter={() => {
												if (hideTimeout) {
													clearTimeout(hideTimeout)
													setHideTimeout(null)
												}
												setActiveDropdown(item.name)
											}}
											onMouseLeave={handleMouseLeave}
										>
											{/* Dropdown arrow */}
											<div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
											
											{item.dropdownItems.map((dropdownItem, index) => (
												<a
													key={dropdownItem.name}
													href={dropdownItem.href}
													className={`block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-[#5C8DFF]/20 hover:to-[#65FFA0]/20 transition-all duration-200 ${
														index !== item.dropdownItems.length - 1 ? 'border-b border-gray-700' : ''
													}`}
													style={{ fontFamily: 'Poppins, sans-serif' }}
												>
													{dropdownItem.name}
												</a>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Right: Login Button */}
					<div className="hidden md:block">
						<a 
							href="/login"
							className="bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors duration-200"
                            style={{
                                fontFamily: 'Poppins, sans-serif'
                            }}
						>
							Login
						</a>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							onClick={() => setNavbarOpen(!navbarOpen)}
							className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
						>
							<span className="sr-only">Open main menu</span>
							{navbarOpen ? (
								<svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							) : (
								<svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								</svg>
							)}
						</button>
						
						{/* Mobile menu panel */}
						{navbarOpen && (
							<div className="absolute top-16 left-0 right-0 bg-black border-t border-gray-700">
								<div className="px-2 pt-2 pb-3 space-y-1">
									<a href="#about" className="block px-3 py-2 text-base font-medium text-white opacity-80 hover:opacity-100 hover:bg-gray-800 transition-all duration-200">
										ABOUT
									</a>
									<a href="/app/projects" className="block px-3 py-2 text-base font-medium text-white opacity-80 hover:opacity-100 hover:bg-gray-800 transition-all duration-200">
										PROJECTS
									</a>
									<a href="#pricing" className="block px-3 py-2 text-base font-medium text-white opacity-80 hover:opacity-100 hover:bg-gray-800 transition-all duration-200">
										PRICING
									</a>
									<a href="#profile" className="block px-3 py-2 text-base font-medium text-white opacity-80 hover:opacity-100 hover:bg-gray-800 transition-all duration-200">
										PROFILE
									</a>
									<a href="/login" className="block w-full text-center px-3 py-2 text-base font-medium text-white bg-gray-800 hover:bg-gray-700 mt-4 rounded-full">
										Login
									</a>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

export default LandingNavbar
