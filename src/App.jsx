import React from 'react'
import { Router } from './routes'
import TeacherDayTheme from './components/themes/teacher-day'
import ChristmasTheme from './components/themes/christmas'
import ThanksgivingTheme from './components/themes/thanksgiving'

function App() {
	return (
		<>
			{/* <ChristmasTheme /> */}
			<ThanksgivingTheme />
			<Router />
		</>
	)
}

export default App
