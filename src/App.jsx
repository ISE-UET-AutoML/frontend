import React from 'react'
import { Router } from './routes'
import TeacherDayTheme from './components/themes/teacher-day'
import ChristmasTheme from './components/themes/christmas'
import { AdminAuthProvider } from './hooks/useAdminAuth'

function App() {
	return (
		<AdminAuthProvider>
			<ChristmasTheme />
			<Router />
		</AdminAuthProvider>
	)
}

export default App
