import { API_BASE_URL, API_URL } from "src/constants/api";
import instance from "./axios";
import { checkInstanceStatus, deleteInstance } from "./resource";

const URL = `${API_BASE_URL}/api/service/ml`
const AGGREGATE_URL = `${API_BASE_URL}/api/ml`

const getDeployedModel = (modelId) => {
    return instance.get(`${URL}/database_service/model_deploy_service/all?model_id=${modelId}`)
}

const getRunningDeployedModel = (modelId) => {
    // const deployedModelRes = await instance.get(`${URL}/database_service/model_deploy_service/all?model_id=${modelId}`)
    // const deployedModels = deployedModelRes.data 
    // for (let i = deployedModels.length - 1; i >= 0; i--) {
    //     const deployedModel = deployedModels[i]
    //     console.log('Checking deployed model:', deployedModel)
    //     const instanceID = deployedModel.instance_info.id
    //     if (instanceID === '') { // skip if instance is creating
    //         continue
    //     }
    //     const statusRes = await checkInstanceStatus(instanceID)
    //     const status = statusRes?.data?.status || 'ONLINE'
    //     if (status !== 'ONLINE') {
    //         try {
    //             if (status === 'OFFLINE') {
    //                 try {
    //                     await deleteInstance(instanceID)
    //                 } catch (error) {
    //                     console.log(`Failed to delete instance ${instanceID}`)
    //                 }
    //             }
    //             await instance.delete(`${URL}/database_service/model_deploy_service/delete?deploy_id=${deployedModel.id}`)
    //             deployedModels.splice(i, 1);
    //         } catch (error) {
    //             console.log(`Error deleting offline deployed model ${deployedModel.id}:`, error.message);
    //         }
    //     }
    // }
    // return deployedModels
    return instance.get(`${AGGREGATE_URL}/deploy/running/${modelId}`)
}

const getAllDeployedModel = (projectId) => {
    return instance.get(`${URL}/database_service/aggregator_service/all_deployed_models?project_id=${projectId}`)
}

const getDeployData = (deployId) => {
    return instance.get(`${URL}/database_service/model_deploy_service/find?deploy_id=${deployId}`)
}

const getDeployStatus = (modelId, deployModelId) => {
    return instance.get(`${AGGREGATE_URL}/model/${modelId}/${deployModelId}/deploy-progress`)
}

export {
    getDeployedModel,
    getAllDeployedModel,
    getDeployData,
    getDeployStatus,
    getRunningDeployedModel
}