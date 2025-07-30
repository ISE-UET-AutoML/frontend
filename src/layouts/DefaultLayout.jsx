import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from 'src/components/NavBar'
import LabelProjectPollingManager from 'src/components/LabelProjectPollingManager'

const DefaultLayout = () => {
	return (
		<>
			<NavBar />
			<Outlet className="outlet" />
			<LabelProjectPollingManager />
		</>
	)
}

export default DefaultLayout
