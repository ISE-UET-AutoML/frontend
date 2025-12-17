import React, { useEffect, useState } from 'react'
import useAdminAuth from 'src/hooks/useAdminAuth'
import { useLocation, Navigate } from 'react-router-dom'
import Loading from 'src/components/Loading'
import { Outlet } from 'react-router-dom'

export default function AdminNonAuthed() {
	const { authed, refresh } = useAdminAuth()
	const location = useLocation()
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const refreshAuth = async () => {
			await refresh()
			setLoading(false)
		}

		refreshAuth()

		return () => {
			setLoading(true)
		}
	}, [])

	if (loading) {
		return <Loading />
	}

	if (authed) {
		// Admin user already authenticated, redirect to admin dashboard
		return (
			<Navigate
				to="/admin/dashboard"
				replace
				state={{ path: location.pathname }}
			/>
		)
	}

	// Non-admin trying to access admin area, redirect to login
	return <Outlet />
}
