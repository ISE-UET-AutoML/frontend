import { PATHS } from 'src/constants/paths'

import NonAuthed from 'src/layouts/nonAuthed'
import Home from 'src/pages/home'
import Login from 'src/pages/login'
import SignUp from 'src/pages/signup'
import ProjectDemo from 'src/pages/demo/ProjectDemo'

const routes = {
	element: <NonAuthed />,
	children: [
		{
			path: PATHS.ROOT,
			element: <Home />,
		},
		{
			path: PATHS.LOGIN,
			element: <Login />,
		},
		{
			path: PATHS.SIGNUP,
			element: <SignUp />,
		},
		{
			path: '/demo/:projectId',
			element: <ProjectDemo />,
		},
	],
}

export default routes
