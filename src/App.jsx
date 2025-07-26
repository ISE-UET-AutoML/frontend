import React, { useEffect } from 'react';
import { Router } from './routes';
import useTrainingStore from './stores/trainingStore';
import useDeployStore from './stores/deployStore';

function App() {
    const restoreTrainingTasks = useTrainingStore(state => state.restoreTrainingTasks);
    const restoreDeployingTasks = useDeployStore(state => state.restoreDeployingTasks)
    useEffect(() => {
        restoreTrainingTasks();
        restoreDeployingTasks();
    }, []);

    return <Router />;
}

export default App;