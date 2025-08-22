import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PATHS } from 'src/constants/paths'
import logo from 'src/assets/images/logo.png'
import useAuth from 'src/hooks/useAuth'
import clsx from 'clsx'

const NavBar = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { logout: authLogout } = useAuth()

	const logout = () => {
		return new Promise((resolve) => {
			authLogout()
			navigate('/', { replace: true })
			resolve()
		})
	}

	// Navigation items
	const navigation = [
		{ name: 'ABOUT', href: '#about' },
		{ name: 'PROJECTS', href: PATHS.PROJECTS },
		{ name: 'PRICING', href: '#pricing' },
		{ name: 'PROFILE', href: PATHS.PROFILE },
	]

	const isActive = (href) => {
		return location.pathname === href
	}

	return (
		<nav className="sticky top-0 bg-black shadow-lg z-[999]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Left: ASTRAL Logo */}
					<div className="flex-shrink-0">
						<div 
							className="text-cyan-400 text-2xl font-bold cursor-pointer"
							onClick={() => navigate('/')}
						>
							ASTRAL
						</div>
					</div>

					{/* Center: Navigation Items */}
					<div className="hidden md:block">
						<div className="flex items-baseline space-x-8">
							{navigation.map((item) => (
								<div key={item.name} className="relative">
									<button
										onClick={() => navigate(item.href)}
										className={clsx(
											'px-3 py-2 text-sm font-medium transition-all duration-200 relative',
											isActive(item.href)
												? 'text-white opacity-100'
												: 'text-white opacity-80 hover:opacity-100'
										)}
									>
										{item.name}
										{/* Line indicator */}
										<div
											className={clsx(
												'absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 transition-all duration-200',
												isActive(item.href) 
													? 'opacity-100 scale-x-100' 
													: 'opacity-0 scale-x-0'
											)}
										/>
									</button>
								</div>
							))}
						</div>
					</div>

					{/* Right: Login Button */}
					<div className="hidden md:block">
						<button 
							onClick={() => navigate('/login')}
							className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200"
						>
							Login
						</button>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<Disclosure>
							{({ open }) => (
								<>
									<Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
										<span className="sr-only">Open main menu</span>
										{open ? (
											<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
										) : (
											<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
										)}
									</Disclosure.Button>
									<Transition
										as={Fragment}
										enter="transition ease-out duration-100"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Disclosure.Panel className="absolute top-16 left-0 right-0 bg-black border-t border-gray-700">
											<div className="px-2 pt-2 pb-3 space-y-1">
												{navigation.map((item) => (
													<button
														key={item.name}
														onClick={() => navigate(item.href)}
														className={clsx(
															'block px-3 py-2 text-base font-medium w-full text-left transition-all duration-200',
															isActive(item.href)
																? 'text-white bg-gray-900'
																: 'text-white opacity-80 hover:opacity-100 hover:bg-gray-800'
														)}
													>
														{item.name}
													</button>
												))}
												<button 
													onClick={() => navigate('/login')}
													className="block w-full text-left px-3 py-2 text-base font-medium text-white bg-gray-800 hover:bg-gray-700 mt-4 rounded-md"
												>
													Login
												</button>
											</div>
										</Disclosure.Panel>
									</Transition>
								</>
							)}
						</Disclosure>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default NavBar