import { PATHS } from 'src/constants/paths';

import Projects from 'src/pages/projects';
import Profile from 'src/pages/profile';
import Settings from 'src/pages/settings';
import RequireAuth from 'src/layouts/RequireAuth';
import DefaultLayout from 'src/layouts/DefaultLayout';
import ProjectLayout from 'src/layouts/ProjectLayout';
import ProjectTasks from 'src/pages/project/tasks';
import { ProjectDeploy } from 'src/pages/project/deploy';
import ProjectModels from 'src/pages/project/models';
import ProjectBuild from 'src/pages/project/build/build';
import ProjectSettings from 'src/pages/project/settings';
// import UploadData from 'src/pages/project/build/uploadData';
// import TrainModel from 'src/pages/project/build/trainModel';
// import PredictData from 'src/pages/project/build/predictData';

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
                            ]
                        }
                    ]
                },
            ],
        },
    ],
};

export default routes;
