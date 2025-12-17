import AdminDashboard from 'src/pages/admin/dashboard'
import AdminUserDetail from 'src/pages/admin/user'
import RequireAdminAuth from 'src/layouts/RequireAdminAuth'

const adminRoutes = {
	path: '/admin',
	children: [
		{
			element: <RequireAdminAuth />,
			children: [
				{
					path: 'dashboard',
					element: <AdminDashboard />,
				},
				{
					path: 'user/:userId',
					element: <AdminUserDetail />,
				},
			],
		},
	],
}

export default adminRoutes
