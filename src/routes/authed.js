import { PATHS } from 'src/constants/paths'

import Profile from 'src/pages/profile'
import Settings from 'src/pages/settings'
import RequireAuth from 'src/layouts/RequireAuth'
import DefaultLayout from 'src/layouts/DefaultLayout'

import Projects from 'src/pages/projects'
import ProjectTasks from 'src/pages/project/tasks'
import ProjectLayout from 'src/layouts/ProjectLayout'
import ProjectDeploy from 'src/pages/project/deploy'
import ProjectModels from 'src/pages/project/models'
import ProjectBuild from 'src/pages/project/build/build'
import ProjectSettings from 'src/pages/project/settings'
// import UploadData from 'src/pages/project/build/uploadData';
// import TrainModel from 'src/pages/project/build/trainModel';
// import PredictData from 'src/pages/project/build/predictData';

import Buckets from 'src/pages/buckets'

import Datasets from 'src/pages/datasets'
import DatasetLayout from 'src/layouts/DatasetLayout'
import DatasetView from 'src/pages/dataset/DatasetView'

const routes = {
	element: <DefaultLayout />,
	children: [
		{
			path: PATHS.PROFILE,
			element: <Profile />,
		},
		{
			path: PATHS.SETTINGS,
			element: <Settings />,
		},
		{
			path: PATHS.DEFAULT,
			element: <RequireAuth />,
			children: [
				/*-----------------PROJECTS' PATH---------------*/

				{
					path: PATHS.PROJECTS,
					element: <Projects />,
				},
				{
					path: '/app/',
					children: [
						{
							path: 'project/:id',
							element: <ProjectLayout />,
							children: [
								{
									path: 'build',
									element: <ProjectBuild />,
									//     children: [{
									//         path: 'upload',
									//         element: <UploadData />
									//     },
									//     {
									//         path: 'train',
									//         element: <TrainModel />
									//     },
									//     {
									//         path: 'predict',
									//         element: <PredictData />
									//     },
									//     {
									//         path: 'upload',
									//         element: <UploadData />
									//     }
									// ]
								},
								{
									path: 'model',
									element: <ProjectModels />,
								},
								{
									path: 'deploy',
									element: <ProjectDeploy />,
								},

								{
									path: 'tasks',
									element: <ProjectTasks />,
								},
								{
									path: 'settings',
									element: <ProjectSettings />,
								},
							],
						},
					],
				},

				/*-----------------BUCKETS' PATH---------------*/

				{
					path: PATHS.BUCKETS,
					element: <Buckets />,
				},

				/*-----------------DATASETS' PATH---------------*/
				{
					path: PATHS.DATASETS,
					element: <Datasets />,
				},
				{
					path: '/app/',
					children: [
						{
							path: 'dataset/:id',
							element: <DatasetLayout />,
							children: [
								{
									path: 'view',
									element: <DatasetView />,
								},
							],
						},
					],
				},
			],
		},
	],
}

export default routes
