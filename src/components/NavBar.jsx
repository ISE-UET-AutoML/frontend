import React, { useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PATHS } from 'src/constants/paths'
import useAuth from 'src/hooks/useAuth'
import clsx from 'clsx'

const NavBar = () => {
	const [navbarOpen, setNavbarOpen] = useState(false)
	const [hoveredItem, setHoveredItem] = useState(null)
	const [scrolled, setScrolled] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
    const { authed, logout: authLogout, user } = useAuth()

	useEffect(() => {
		const getScrollTop = () => {
			const winY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
			const layoutEl = document.querySelector('.ant-layout')
			const layoutY = layoutEl && typeof layoutEl.scrollTop === 'number' ? layoutEl.scrollTop : 0
			return Math.max(winY, layoutY)
		}

		const handleScroll = () => {
			setScrolled(getScrollTop() > 0)
		}

		const layoutEl = document.querySelector('.ant-layout')
		window.addEventListener('scroll', handleScroll, { passive: true })
		if (layoutEl) layoutEl.addEventListener('scroll', handleScroll, { passive: true })

		handleScroll()

		return () => {
			window.removeEventListener('scroll', handleScroll)
			if (layoutEl) layoutEl.removeEventListener('scroll', handleScroll)
		}
	}, [])

	// Recalculate on route changes to ensure correct initial state per page
	useEffect(() => {
		const y = window.pageYOffset || document.documentElement.scrollTop || 0
		setScrolled(y > 0)
	}, [location.pathname])

	const logout = () => {
		return new Promise((resolve) => {
			authLogout()
			navigate('/', { replace: true })
			resolve()
		})
	}

	// Navigation items for non-authenticated users
	const publicNavigationItems = [
		{ name: 'ABOUT', href: '#about' },
		{ name: 'PRICING', href: '#pricing' },
	]

	// Navigation items for authenticated users
	const authNavigationItems = [
		{ name: 'PROJECTS', href: PATHS.PROJECTS },
		{ name: 'DATASETS', href: PATHS.DATASETS },
	]

	const isActive = (href) => {
		return location.pathname === href || location.pathname.startsWith(href)
	}

	const handleNavigation = (href) => {
		if (href.startsWith('#')) {
			// Handle anchor links
			const element = document.querySelector(href);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		} else {
			navigate(href);
		}
	}
	return (
		<header 
			className="fixed top-0 w-full z-50 transition-all duration-300" 
			style={{ 
				backgroundColor: scrolled ? 'rgba(1, 0, 10, 0.95)' : 'rgba(1, 0, 10, 0)',
				backdropFilter: scrolled ? 'blur(10px)' : 'none',
				zIndex: 999
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
							onClick={() => navigate('/')}
						/>
					</div>

					{/* Center: Navigation Items */}
					<div className="hidden md:block">
						<div className="flex items-baseline space-x-8">
							{(authed ? authNavigationItems : publicNavigationItems).map((item) => (
								<div 
									key={item.name}
									className="relative"
									onMouseEnter={() => setHoveredItem(item.name)}
									onMouseLeave={() => setHoveredItem(null)}
								>
									<button
										onClick={() => handleNavigation(item.href)}
										className={clsx(
											"px-3 py-2 text-sm font-bold transition-all duration-200 relative",
											isActive(item.href)
												? "text-white opacity-100"
												: "text-white opacity-80 hover:opacity-100"
										)}
										style={{ fontFamily: 'Poppins, sans-serif' }}
									>
										{item.name}
										
										{/* Animated underline */}
										<div
											className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#5C8DFF] to-[#65FFA0] rounded-full transition-all duration-300 ${
												hoveredItem === item.name || isActive(item.href)
													? 'w-full opacity-100' 
													: 'w-0 opacity-0'
											}`}
										/>
									</button>
								</div>
							))}
						</div>
					</div>

					{/* Right: Login/Profile */}
					<div className="hidden md:block">
						{authed ? (
							/* Profile dropdown for authenticated users */
							<Menu as="div" className="relative">
								<div>
                                    <Menu.Button className="transition flex gap-2 rounded-xl bg-gray-800 text-sm focus:outline-none hover:bg-gray-700 py-2 px-3">
                                        <span className="font-regular text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {user?.name || user?.username || user?.email || 'User'}
                                        </span>
                                        <img
                                            className="h-6 w-6 border-solid border-2 border-blue-500 rounded-full"
                                            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                                            alt=""
                                        />
                                    </Menu.Button>
								</div>
								<Transition
									as={Fragment}
									enter="transition ease-out duration-200"
									enterFrom="transform opacity-0 scale-95"
									enterTo="transform opacity-100 scale-100"
									leave="transition ease-in duration-75"
									leaveFrom="transform opacity-100 scale-100"
									leaveTo="transform opacity-0 scale-95"
								>
									<Menu.Items className="absolute right-0 z-10 mt-2 w-48 bg-gray-900 bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 overflow-hidden focus:outline-none">
										<Menu.Item>
											{({ active }) => (
												<button
													onClick={() => navigate(PATHS.PROFILE)}
													className={clsx(
														"block w-full text-left px-4 py-3 text-sm transition-all duration-200",
														active
															? "text-white bg-gradient-to-r from-[#5C8DFF]/20 to-[#65FFA0]/20"
															: "text-gray-300"
													)}
													style={{ fontFamily: 'Poppins, sans-serif' }}
												>
													Your Profile
												</button>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<button
													onClick={() => navigate(PATHS.SETTINGS)}
													className={clsx(
														"block w-full text-left px-4 py-3 text-sm border-b border-gray-700 transition-all duration-200",
														active
															? "text-white bg-gradient-to-r from-[#5C8DFF]/20 to-[#65FFA0]/20"
															: "text-gray-300"
													)}
													style={{ fontFamily: 'Poppins, sans-serif' }}
												>
													Settings
												</button>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<button
													onClick={async () => await logout()}
													className={clsx(
														"block w-full text-left px-4 py-3 text-sm transition-all duration-200",
														active
															? "text-white bg-gradient-to-r from-[#5C8DFF]/20 to-[#65FFA0]/20"
															: "text-gray-300"
													)}
													style={{ fontFamily: 'Poppins, sans-serif' }}
												>
													Sign out
												</button>
											)}
										</Menu.Item>
									</Menu.Items>
								</Transition>
							</Menu>
						) : (
							/* Login button for non-authenticated users */
							<button 
								onClick={() => navigate('/login')}
								className="bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors duration-200"
								style={{ fontFamily: 'Poppins, sans-serif' }}
							>
								Login
							</button>
						)}
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
									{(authed ? authNavigationItems : publicNavigationItems).map((item) => (
										<button
											key={item.name}
											onClick={() => {
												handleNavigation(item.href)
												setNavbarOpen(false)
											}}
											className="block w-full text-left px-3 py-2 text-base font-medium text-white opacity-80 hover:opacity-100 hover:bg-gray-800 transition-all duration-200"
											style={{ fontFamily: 'Poppins, sans-serif' }}
										>
											{item.name}
										</button>
									))}
									{!authed && (
										<button 
											onClick={() => {
												navigate('/login')
												setNavbarOpen(false)
											}}
											className="block w-full text-center px-3 py-2 text-base font-medium text-white bg-gray-800 hover:bg-gray-700 mt-4 rounded-full"
											style={{ fontFamily: 'Poppins, sans-serif' }}
										>
											Login
										</button>
									)}
									{authed && (
										<button 
											onClick={async () => {
												await logout()
												setNavbarOpen(false)
											}}
											className="block w-full text-center px-3 py-2 text-base font-medium text-white bg-red-800 hover:bg-red-700 mt-4 rounded-full"
											style={{ fontFamily: 'Poppins, sans-serif' }}
										>
											Sign out
										</button>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

export default NavBar