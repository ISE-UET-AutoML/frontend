import { PATHS } from 'src/constants/paths';
import Explain from 'src/pages/testing/explain.jsx';
import TrainGraph from 'src/pages/testing/traingraph.jsx';
import DefaultLayout from 'src/layouts/DefaultLayout';

const routes = {
	element: <DefaultLayout />,
	children: [
		{
			path: '/testing/explain',
			element: <Explain />,
		},
		{
			path: '/testing/train-graph',
			element: <TrainGraph />,
		},
	]
};


export default routes;
