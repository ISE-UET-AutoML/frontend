import React from 'react'
import { Router } from './routes'
import TeacherDayTheme from './components/themes/teacher-day'
import ChristmasTheme from './components/themes/christmas'

function App() {
	return (
		<>
			<TeacherDayTheme />
			<Router />
		</>
	)
}

export default App
