// import React, { useEffect, useRef, useState } from 'react'
// import { Card, Button, Spin, message } from 'antd'
// import LabelStudio from '@heartexlabs/label-studio'
// import 'label-studio/build/static/css/main.css'

// const LabelingComponent = ({ taskData, onSubmit }) => {
// 	const labelStudioRef = useRef(null)
// 	const [loading, setLoading] = useState(true)
// 	const [labelStudioInstance, setLabelStudioInstance] = useState(null)

// 	useEffect(() => {
// 		if (!taskData) return

// 		// Xóa instance cũ nếu có
// 		if (labelStudioInstance) {
// 			labelStudioInstance.destroy()
// 		}

// 		const labelStudio = new LabelStudio(labelStudioRef.current, {
// 			config: getConfigForTask(taskData.task_type),
// 			interfaces: [
// 				'panel',
// 				'update',
// 				'submit',
// 				'controls',
// 				'side-column',
// 				'annotations:menu',
// 				'annotations:add-new',
// 				'annotations:delete',
// 				'predictions:menu',
// 			],
// 			task: taskData,
// 			onLabelStudioLoad: (ls) => {
// 				setLabelStudioInstance(ls)
// 				setLoading(false)
// 			},
// 			onSubmitAnnotation: (ls, annotation) => {
// 				console.log('Annotation submitted:', annotation)
// 			},
// 			onUpdateAnnotation: (ls, annotation) => {
// 				console.log('Annotation updated:', annotation)
// 			},
// 			onDeleteAnnotation: (ls, annotation) => {
// 				console.log('Annotation deleted:', annotation)
// 			},
// 		})

// 		setLabelStudioInstance(labelStudio)

// 		return () => {
// 			if (labelStudio) {
// 				labelStudio.destroy()
// 			}
// 		}
// 	}, [taskData])

// 	const handleSubmit = () => {
// 		if (!labelStudioInstance) return

// 		try {
// 			const result = labelStudioInstance.exportAnnotations()
// 			onSubmit && onSubmit(result)
// 			message.success('Label đã được lưu thành công')
// 		} catch (error) {
// 			console.error('Error submitting labels:', error)
// 			message.error('Có lỗi xảy ra khi lưu label')
// 		}
// 	}

// 	// Hàm lấy cấu hình phù hợp với loại task
// 	const getConfigForTask = (taskType) => {
// 		switch (taskType) {
// 			case 'image_classification':
// 				return `
//           <View>
//             <Image name="image" value="$image"/>
//             <Choices name="choice" toName="image">
//               <Choice value="Cat"/>
//               <Choice value="Dog"/>
//               <Choice value="Other"/>
//             </Choices>
//           </View>
//         `
// 			case 'text_classification':
// 				return `
//           <View>
//             <Text name="text" value="$text"/>
//             <Choices name="sentiment" toName="text">
//               <Choice value="Positive"/>
//               <Choice value="Negative"/>
//               <Choice value="Neutral"/>
//             </Choices>
//           </View>
//         `
// 			case 'object_detection':
// 				return `
//           <View>
//             <Image name="image" value="$image"/>
//             <RectangleLabels name="labels" toName="image">
//               <Label value="Person"/>
//               <Label value="Car"/>
//               <Label value="Building"/>
//             </RectangleLabels>
//           </View>
//         `
// 			case 'named_entity':
// 				return `
//           <View>
//             <Text name="text" value="$text"/>
//             <Labels name="label" toName="text">
//               <Label value="Person"/>
//               <Label value="Organization"/>
//               <Label value="Location"/>
//             </Labels>
//           </View>
//         `
// 			default:
// 				return `
//           <View>
//             <Image name="image" value="$image"/>
//             <RectangleLabels name="labels" toName="image">
//               <Label value="Object"/>
//             </RectangleLabels>
//           </View>
//         `
// 		}
// 	}

// 	return (
// 		<Card title="Data Labeling" style={{ width: '100%' }}>
// 			{loading ? (
// 				<div
// 					style={{
// 						display: 'flex',
// 						justifyContent: 'center',
// 						padding: '40px',
// 					}}
// 				>
// 					<Spin tip="Đang tải công cụ labeling..." />
// 				</div>
// 			) : (
// 				<>
// 					<div
// 						ref={labelStudioRef}
// 						style={{ height: '600px', overflow: 'auto' }}
// 					/>
// 					<div style={{ marginTop: '20px', textAlign: 'right' }}>
// 						<Button type="primary" onClick={handleSubmit}>
// 							Lưu Label
// 						</Button>
// 					</div>
// 				</>
// 			)}
// 		</Card>
// 	)
// }

// export default LabelingComponent
