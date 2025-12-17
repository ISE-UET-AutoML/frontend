import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAdminAuth from 'src/hooks/useAdminAuth'
import { getUsers, getUserDatasets, getAllProjects } from 'src/api/user'
import {
	UsersIcon,
	FolderIcon,
	ArchiveBoxIcon,
	UserPlusIcon,
	Squares2X2Icon,
	ArrowLeftOnRectangleIcon,
	EyeIcon,
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
	const navigate = useNavigate()
	const { logout, admin } = useAdminAuth()
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [analytics, setAnalytics] = useState({
		totalUsers: 0,
		usersLastMonth: 0,
		totalProjects: 0,
		totalDatasets: 0,
		totalExperiments: 0,
		totalModels: 0,
	})

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A'
		try {
			const date = new Date(dateString)
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
		} catch (e) {
			return dateString
		}
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	const fetchUsers = async () => {
		try {
			setLoading(true)
			setError(null)
			const response = await getUsers()
			const userData = response.data || []
			setUsers(userData)

			// Fetch all datasets once
			let allDatasets = []
			try {
				const datasetsRes = await getUserDatasets()
				allDatasets = datasetsRes.data?.data || datasetsRes.data || []
				console.log('All datasets:', allDatasets)
			} catch (datasetsError) {
				console.error('Error fetching datasets:', datasetsError)
			}

			// Fetch all projects
			let allProjects = []
			try {
				const projectsRes = await getAllProjects()
				allProjects = projectsRes.data?.data || projectsRes.data || []
				console.log('All projects:', allProjects)
			} catch (projectsError) {
				console.error('Error fetching projects:', projectsError)
			}

			// Calculate analytics based on fetched users, datasets, and projects
			calculateAnalytics(userData, allDatasets, allProjects)
		} catch (err) {
			console.error('Error fetching users:', err)
			console.error('Response status:', err.response?.status)
			console.error('Response data:', err.response?.data)
			const errorMsg =
				err.response?.data?.error ||
				err.response?.data?.message ||
				'Failed to fetch users'
			setError(errorMsg)
			setUsers([])
		} finally {
			setLoading(false)
		}
	}

	const calculateAnalytics = (userData, datasets = [], projects = []) => {
		const now = new Date()
		const oneMonthAgo = new Date()
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

		const newUsersLastMonth = userData.filter((user) => {
			const createdDate = new Date(user.created_at || user.createdAt || 0)
			return createdDate >= oneMonthAgo
		}).length

		setAnalytics({
			totalUsers: userData.length,
			usersLastMonth: newUsersLastMonth,
			totalProjects: projects.length,
			totalDatasets: datasets.length,
			totalExperiments: userData.length > 0 ? userData.length : 0,
			totalModels: userData.length > 0 ? userData.length : 0,
		})
	}

	const handleLogout = async () => {
		await logout()
		navigate('/admin', { replace: true })
	}

	const handleViewUser = (user) => {
		navigate(`/admin/user/${user.id}`, { state: { user } })
	}

	const stats = [
		{
			title: 'Total Users',
			value: analytics.totalUsers,
			icon: UsersIcon,
			color: 'from-blue-500 to-cyan-500',
			bgColor: 'bg-blue-500/10',
			iconColor: 'text-blue-400',
		},
		{
			title: 'New Users (Last Month)',
			value: analytics.usersLastMonth,
			icon: UserPlusIcon,
			color: 'from-green-500 to-emerald-500',
			bgColor: 'bg-green-500/10',
			iconColor: 'text-green-400',
		},
		{
			title: 'Total Projects',
			value: analytics.totalProjects,
			icon: FolderIcon,
			color: 'from-purple-500 to-pink-500',
			bgColor: 'bg-purple-500/10',
			iconColor: 'text-purple-400',
		},
		{
			title: 'Total Datasets',
			value: analytics.totalDatasets,
			icon: ArchiveBoxIcon,
			color: 'from-orange-500 to-yellow-500',
			bgColor: 'bg-orange-500/10',
			iconColor: 'text-orange-400',
		},
	]

	return (
		<div
			className="min-h-screen"
			style={{
				backgroundColor: '#01000A',
				fontFamily: 'Poppins, sans-serif',
			}}
		>
			{/* Header */}
			<div
				className="border-b border-white/10"
				style={{ background: 'rgba(255,255,255,0.02)' }}
			>
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<img
								src="/PrimaryLogo.svg"
								width={120}
								alt="ASTRAL"
							/>
							<span className="text-white/40 text-xl">|</span>
							<h1 className="text-white text-xl font-semibold">
								Admin Dashboard
							</h1>
						</div>
						<div className="flex items-center gap-4">
							<div className="text-right">
								<p className="text-white/80 text-sm font-medium">
									{admin?.name}
								</p>
								<p className="text-white/50 text-xs">
									{admin?.email}
								</p>
							</div>
							<button
								onClick={handleLogout}
								className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
							>
								<ArrowLeftOnRectangleIcon className="w-4 h-4" />
								<span>Logout</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Stats Grid */}
				<div className="mb-8">
					<h2 className="text-white text-2xl font-semibold mb-6">
						Overview
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{stats.map((stat, index) => {
							const Icon = stat.icon
							return (
								<div
									key={index}
									className="backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
									style={{
										background: 'rgba(255,255,255,0.04)',
									}}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<p className="text-white/60 text-sm mb-2">
												{stat.title}
											</p>
											<p className="text-white text-3xl font-bold">
												{stat.value}
											</p>
										</div>
										<div
											className={`${stat.bgColor} rounded-xl p-3`}
										>
											<Icon
												className={stat.iconColor}
												size={24}
											/>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* Users Table */}
				<div>
					<h2 className="text-white text-2xl font-semibold mb-6">
						User Management
					</h2>
					<div
						className="backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
						style={{ background: 'rgba(255,255,255,0.04)' }}
					>
						{error && (
							<div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
								Error: {error}
							</div>
						)}
						{loading ? (
							<div className="px-6 py-8 text-center">
								<p className="text-white/60 text-sm">
									Loading users...
								</p>
							</div>
						) : users.length === 0 ? (
							<div className="px-6 py-8 text-center">
								<p className="text-white/60 text-sm">
									No users found
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr
											className="border-b border-white/10"
											style={{
												background:
													'rgba(255,255,255,0.02)',
											}}
										>
											<th className="text-left text-white/80 text-sm font-semibold px-6 py-4">
												Full Name
											</th>
											<th className="text-left text-white/80 text-sm font-semibold px-6 py-4">
												Email
											</th>
											<th className="text-left text-white/80 text-sm font-semibold px-6 py-4">
												Created At
											</th>
											<th className="text-left text-white/80 text-sm font-semibold px-6 py-4">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{users.map((user, index) => (
											<tr
												key={user.id || index}
												className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150"
											>
												<td className="px-6 py-4">
													<p className="text-white font-medium">
														{user.full_name ||
															'N/A'}
													</p>
												</td>
												<td className="px-6 py-4">
													<p className="text-white/70 text-sm">
														{user.email || 'N/A'}
													</p>
												</td>
												<td className="px-6 py-4">
													<p className="text-white/70 text-sm">
														{formatDate(
															user.created_at
														)}
													</p>
												</td>
												<td className="px-6 py-4">
													<button
														onClick={() =>
															handleViewUser(user)
														}
														className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200"
													>
														<EyeIcon className="w-3.5 h-3.5" />
														<span>
															View Details
														</span>
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminDashboard
