import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from 'src/components/NavBar'
import LabelProjectPollingManager from 'src/components/LabelProjectPollingManager'
import useDeployStore from 'src/stores/deployStore'

const DefaultLayout = () => {
    const restoreDeployingTasks = useDeployStore(state => state.restoreDeployingTasks)
    useEffect(() => {
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
