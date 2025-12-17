import React, { useState, useEffect, useCallback } from 'react'
import useAuth from './useAuth'

const adminAuthContext = React.createContext()

function useAdminAuth() {
	const authContext = useAuth()
	const { authed, user, refresh: refreshAuth } = authContext
	const [isAdmin, setIsAdmin] = useState(false)

	useEffect(() => {
		// Admin is identified by email == admin@astral.io
		const adminStatus = authed && user && user.email === 'admin@astral.io'
		setIsAdmin(adminStatus)
	}, [authed, user])

	const refresh = useCallback(() => {
		// First refresh the base auth to get user data
		// This returns isAuthenticated, but we need to check the user data
		return refreshAuth().then((isAuthenticated) => {
			// After refresh, the useAuth hook will have updated user data
			// But we need to check it from the current state
			// The setIsAdmin will be called by the useEffect above
			// For now, return the isAuthenticated status
			// The admin check will happen in useEffect
			return isAuthenticated
		})
	}, [refreshAuth])

	const login = useCallback(() => {
		// Admin login is now handled by regular useAuth login
		// This is kept for compatibility but does nothing
		return new Promise((res, rej) => {
			rej(new Error('Use regular login endpoint for admin accounts'))
		})
	}, [])

	const logout = useCallback(() => {
		// Logout is handled by regular useAuth
		return new Promise((res) => {
			res()
		})
	}, [])

	return {
		authed: isAdmin,
		admin: isAdmin ? user : null,
		refresh,
		login,
		logout,
	}
}

export function AdminAuthProvider({ children }) {
	const auth = useAdminAuth()
	return (
		<adminAuthContext.Provider value={auth}>
			{children}
		</adminAuthContext.Provider>
	)
}

export function useAdminAuthContext() {
	const context = React.useContext(adminAuthContext)
	if (!context) {
		throw new Error(
			'useAdminAuthContext must be used within AdminAuthProvider'
		)
	}
	return context
}

export default useAdminAuth
