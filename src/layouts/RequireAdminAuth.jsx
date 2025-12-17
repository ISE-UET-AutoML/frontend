import React, { useEffect, useState } from 'react'
import useAdminAuth from 'src/hooks/useAdminAuth'
import { useLocation, Navigate } from 'react-router-dom'
import Loading from 'src/components/Loading'
import { Outlet } from 'react-router-dom'

export default function RequireAdminAuth() {
	const { authed, admin, refresh } = useAdminAuth()
	const location = useLocation()
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const refreshAuth = async () => {
			try {
				// Refresh to get latest user data
				await refresh()
				// Give state updates a moment to propagate
				setTimeout(() => {
					setLoading(false)
				}, 50)
			} catch (error) {
				console.error('Error refreshing admin auth:', error)
				setLoading(false)
			}
		}

		refreshAuth()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (loading) {
		return <Loading />
	}

	if (!authed || !admin) {
		// Non-admin user or not authenticated, redirect to login
		return (
			<Navigate to="/login" replace state={{ path: location.pathname }} />
		)
	}

	return <Outlet />
}
