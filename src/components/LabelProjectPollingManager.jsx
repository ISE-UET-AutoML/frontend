import { useEffect, useRef } from 'react';
import { usePollingStore } from 'src/store/pollingStore';
import * as datasetAPI from 'src/api/dataset';
import * as labelProjectAPI from 'src/api/labelProject';
import { message } from 'antd';

export default function LabelProjectPollingManager() {
  const { pendingLabelProjects, removePending } = usePollingStore();
  const processingRef = useRef(new Set()); // Track datasets being processed

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
    
    const interval = setInterval(async () => {
      for (const item of pendingLabelProjects) {
        const { dataset, labelProjectValues } = item;
        
        // Kiểm tra xem dataset này đang được xử lý chưa
        if (processingRef.current.has(dataset.id)) {
          continue; // Skip if already processing
        }
        
        try {
          const statusData = await datasetAPI.getProcessingStatus(dataset.id).then(res => res.data)
          const status = statusData.processingStatus || statusData.processing_status || statusData.status;
          
          if (status === 'COMPLETED') {
            // Đánh dấu đang xử lý để tránh gọi lại
            processingRef.current.add(dataset.id);
            
            setTimeout(async () => {
              try {
                // Tạo label project
                const payload = {
                  name: labelProjectValues.name,
                  taskType: labelProjectValues.taskType,
                  datasetId: dataset.id,
                  expectedLabels: labelProjectValues.expectedLabels,
                  description: labelProjectValues.description || '',
                  meta_data: labelProjectValues.meta_data || {},
                };
                
                await labelProjectAPI.createLbProject(payload);
                message.success(`Label project for ${dataset.title} created successfully!`);
                
                // Đợi Label Studio hoàn thành việc tạo project và tasks
                console.log(`Waiting for Label Studio to complete project setup for ${dataset.title}...`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Đợi 5 giây
                
                // Sync annotations từ Label Studio về database
                console.log(`Syncing project data for ${dataset.title}...`);
                await refreshLabelProjects();
                
                // Kiểm tra xem project đã được tạo thành công chưa
                try {
                  const projectsResponse = await labelProjectAPI.getLbProjects();
                  const project = projectsResponse.data.find(p => p.datasetId === dataset.id);
                  
                  if (project) {
                    console.log(`Project ${dataset.title} created successfully with ${project.annotatedNums}/${project.annotationNums} annotations`);
                  } else {
                    console.warn(`Project ${dataset.title} not found in projects list`);
                  }
                } catch (err) {
                  console.error('Error checking project status:', err);
                }
                
              } catch (err) {
                console.error('Error creating label project:', err);
                message.error(`Failed to create label project for ${dataset.title}`);
              } finally {
                // Luôn remove khỏi pending và processing, dù thành công hay thất bại
                removePending(dataset.id);
                processingRef.current.delete(dataset.id);
                refreshDatasets();
              }
            }, 4000); // Delay 4 giây
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [pendingLabelProjects, removePending]);

  return null; // Component này không render gì cả
} 