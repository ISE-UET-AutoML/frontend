import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from 'src/components/NavBar'
import LabelProjectPollingManager from 'src/components/LabelProjectPollingManager'
import useTrainingStore from 'src/stores/trainingStore'
import useDeployStore from 'src/stores/deployStore'

const DefaultLayout = () => {
    const restoreTrainingTasks = useTrainingStore(state => state.restoreTrainingTasks);
    const restoreDeployingTasks = useDeployStore(state => state.restoreDeployingTasks)
    useEffect(() => {
        restoreTrainingTasks();
        restoreDeployingTasks();
    }, []);
    return (
        <>
            <NavBar />
            <Outlet className="outlet" />
            <LabelProjectPollingManager />
        </>
    )
}

export default DefaultLayout
