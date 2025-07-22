import React, { useEffect } from 'react';
import { Router } from './routes';
import useTrainingStore from './stores/trainingStore';

function App() {
    const restoreTrainingTasks = useTrainingStore(state => state.restoreTrainingTasks);

    useEffect(() => {
        restoreTrainingTasks();
    }, []);

    return <Router />;
}

export default App;