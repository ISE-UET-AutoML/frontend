import { useEffect, useRef } from 'react';
import { usePollingStore } from 'src/store/pollingStore';
import * as datasetAPI from 'src/api/dataset';
import * as labelProjectAPI from 'src/api/labelProject';
import { message } from 'antd';

const handleCompletedDataset = async (item, removingPending) => {
  const {dataset, labelProjectValues} = item;
  try {
    message.info(`Verifying uploaded files for dataset '${dataset.title}'...`);
    const verificationResponse = await datasetAPI.verifyUpload(dataset.id);
    console.log(verificationResponse.data);
    if (verificationResponse.data.status === false) {
        throw new Error("File count mismatch on the server.");
    }
    console.log("Verification ", verificationResponse.data);
    const payload = {
      name: labelProjectValues.name,
      taskType: labelProjectValues.taskType,
      datasetId: dataset.id,
      expectedLabels: labelProjectValues.expectedLabels,
      description: labelProjectValues.description || '',
      meta_data: labelProjectValues.meta_data || {},
    }
    console.log(`Dataset '${dataset.title}' is COMPLETED. Creating label project...`);
    await labelProjectAPI.createLbProject(payload);
  } catch (err) {
    console.error(`Error while processing completed dataset '${dataset.title}':`, err);
    
    if (err.message === "File count mismatch on the server.") {
        Modal.error({
            title: 'Upload Verification Failed',
            content: `Please check your network connection and try creating the dataset again.`,
        });
        await datasetAPI.deleteDataset(dataset.id);
      }
  } finally {
    removingPending(dataset.id);
  }
}

export default function LabelProjectPollingManager() {
  const { pendingLabelProjects, removePending } = usePollingStore();
  const beingProcessed = useRef(new Set());
  const refreshDatasets = async () => {
    try {
      // Gọi API để refresh datasets
      await datasetAPI.getDatasets();
    } catch (error) {
      console.error('Error refreshing datasets:', error);
    }
  };

  const refreshLabelProjects = async () => {
    try {
      // Gọi API để refresh label projects và sync annotations
      await labelProjectAPI.getLbProjects();
    } catch (error) {
      console.error('Error refreshing label projects:', error);
    }
  };

  useEffect(() => {
    if (pendingLabelProjects.length === 0) return;
    
    const processPendingItems = async () => {
      for (const item of pendingLabelProjects) {
        const { dataset } = item;

        if (beingProcessed.current.has(dataset.id)) {
          continue;
        }

        try {
          const res = await datasetAPI.getProcessingStatus(dataset.id);
          const status = res.data?.processingStatus;
          console.log(res);
          // Nếu đã hoàn thành, bắt đầu xử lý
          if (status === 'COMPLETED') {
            // Đánh dấu là đang xử lý
            beingProcessed.current.add(dataset.id);
            // Gọi hàm xử lý riêng biệt mà không cần chờ (non-blocking)
            handleCompletedDataset(item, removePending);
            console.log(item);
          } else if (status === 'FAILED') {
            message.error(`Dataset '${dataset.title}' failed to process.`);
            removePending(dataset.id);
            beingProcessed.current.add(dataset.id); 
          }
        } catch (err) {
          console.error(`Lỗi polling cho dataset '${dataset.id}':`, err);
        } 
      }
    };
    processPendingItems();
    const intervalId = setInterval(processPendingItems, 5000);

    return () => clearInterval(intervalId);
  }, [pendingLabelProjects, removePending]);

  return null; // Component này không render gì cả
} 