import React, { useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATHS } from 'src/constants/paths'
<<<<<<< HEAD
import logo from 'src/assets/images/logo.png'
import ActiveLink from './common/ActiveLink'
=======
>>>>>>> feature/new-landing-page
import useAuth from 'src/hooks/useAuth'
import clsx from 'clsx'

const NavBar = () => {
<<<<<<< HEAD
	const defaultclassname =
		'inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-bold text-gray-500 hover:border-gray-300 hover:text-gray-700'
	const activeclassname =
		'inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-bold text-gray-900'

	const navigate = useNavigate()
	const { logout: authLogout } = useAuth()
=======
	const [navbarOpen, setNavbarOpen] = useState(false)
	const [hoveredItem, setHoveredItem] = useState(null)
	const navigate = useNavigate()
	const location = useLocation()
	const { authed, logout: authLogout } = useAuth()
>>>>>>> feature/new-landing-page

	const logout = () => {
		return new Promise((resolve) => {
			authLogout()
			navigate('/', { replace: true })
			resolve()
		})
	}

<<<<<<< HEAD
	return (
		<Disclosure
			as="nav"
			className="sticky top-0 bg-white shadow-md z-[999]"
		>
			{({ open }) => (
				<>
					<div className="mx-auto px-2 sm:px-6 lg:px-8">
						<div className="relative flex h-[60px] justify-between">
							<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
								{/* Mobile menu button */}
								<Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
									<span className="sr-only">
										Open main menu
									</span>
									{open ? (
										<XMarkIcon
											className="block h-6 w-6"
											aria-hidden="true"
=======
	// Navigation items for non-authenticated users
	const publicNavigationItems = [
		{ name: 'ABOUT', href: '#about' },
		{ name: 'PRICING', href: '#pricing' },
	]

	// Navigation items for authenticated users
	const authNavigationItems = [
		{ name: 'PROJECTS', href: PATHS.PROJECTS },
		{ name: 'DATASETS', href: PATHS.DATASETS },
		{ name: 'BUCKETS', href: PATHS.BUCKETS },
		{ name: 'LABELS', href: PATHS.LABELS },
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
			className="sticky top-0 w-full z-50 transition-all duration-300" 
			style={{ 
				backgroundColor: 'rgba(0, 0, 0, 0.95)',
				backdropFilter: 'blur(10px)',
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
>>>>>>> feature/new-landing-page
										/>
									) : (
										<Bars3Icon
											className="block h-6 w-6"
											aria-hidden="true"
										/>
									)}
								</Disclosure.Button>
							</div>
							<div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
								<div className="flex flex-shrink-0 items-center">
									<img
										className="block h-8 w-auto lg:hidden"
										src={logo}
										alt="UET MLOps"
									/>
									<img
										className="hidden h-8 w-auto lg:block"
										src={logo}
										alt="UET MLOps"
									/>
								</div>
<<<<<<< HEAD
								<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
									<ActiveLink
										to={PATHS.PROJECTS}
										defaultclassname={defaultclassname}
										activeclassname={activeclassname}
									// className={({ isActive }) => (isActive ? activeClassName : defaultClassName)}
									>
										Projects
									</ActiveLink>
								</div>
								{/* <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
									<ActiveLink
										to={PATHS.BUCKETS}
										defaultclassname={defaultclassname}
										activeclassname={activeclassname}
										// className={({ isActive }) => (isActive ? activeClassName : defaultClassName)}
									>
										Buckets
									</ActiveLink>
								</div> */}
								<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
									<ActiveLink
										to={PATHS.DATASETS}
										defaultclassname={defaultclassname}
										activeclassname={activeclassname}
									// className={({ isActive }) => (isActive ? activeClassName : defaultClassName)}
									>
										Datasets
									</ActiveLink>
								</div>
								{/*<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
									<ActiveLink
										to={PATHS.LABELS}
										defaultclassname={defaultclassname}
										activeclassname={activeclassname}
										// className={({ isActive }) => (isActive ? activeClassName : defaultClassName)}
									>
										Labels
									</ActiveLink>
								</div>*/}
							</div>
							<div className="absolute inset-y-0 right-0 flex items-center p-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
								{/* Profile dropdown */}
								<Menu as="div" className="relative ml-3">
									<div>
										<Menu.Button className="transition flex gap-2 rounded-xl bg-white text-sm focus:outline-none hover:bg-gray-100 py-1 px-2">
											<span className="font-bold pt-[5px]">
												username
											</span>
											<img
												className="h-8 w-8 border-solid border-2 border-blue-600 rounded-full"
												src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
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
										<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
											<Menu.Item>
												{({ active }) => (
													<a
														onClick={() =>
															navigate(
																PATHS.PROFILE,
																{
																	replace: true,
																}
															)
														}
														className={clsx(
															active
																? 'bg-gray-100'
																: '',
															'block px-4 py-2 text-sm text-gray-700'
														)}
													>
														Your Profile
													</a>
												)}
											</Menu.Item>
											<Menu.Item>
												{({ active }) => (
													<a
														onClick={() =>
															navigate(
																PATHS.SETTINGS,
																{
																	replace: true,
																}
															)
														}
														className={clsx(
															active
																? 'bg-gray-100'
																: '',
															'block px-4 py-2 text-sm text-gray-700'
														)}
													>
														Settings
													</a>
												)}
											</Menu.Item>
											<Menu.Item>
												{({ active }) => (
													<a
														href="/"
														onClick={async (e) => {
															e.preventDefault()
															await logout()
														}}
														className={clsx(
															active
																? 'bg-gray-100'
																: '',
															'block px-4 py-2 text-sm text-gray-700 border-t'
														)}
													>
														Sign out
													</a>
												)}
											</Menu.Item>
										</Menu.Items>
									</Transition>
								</Menu>
							</div>
						</div>
					</div>
				</>
			)}
		</Disclosure>
=======
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
										<span className="font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
											username
										</span>
										<img
											className="h-6 w-6 border-solid border-2 border-blue-500 rounded-full"
											src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
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
>>>>>>> feature/new-landing-page
	)
}

export default NavBar