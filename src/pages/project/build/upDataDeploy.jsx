import { Upload, Button, Modal, message } from 'antd'
import {
	InboxOutlined,
	CloseOutlined,
	FolderOutlined,
	FileOutlined,
	DeleteOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'

const { Dragger } = Upload

const UpDataDeploy = ({ isOpen, onClose, onUpload }) => {
	const [fileList, setFileList] = useState([])
	const [folderStructure, setFolderStructure] = useState([])

	const uploadProps = {
		name: 'file',
		multiple: true,
		directory: true,
		accept: '.xlsx,.xls, .jpg, .png',
		fileList, // kiểm soát danh sách file
		showUploadList: false,
		beforeUpload: (file) => {
			const isLt10M = file.size / 1024 / 1024 < 10
			if (!isLt10M) {
				message.error('File must be smaller than 10MB!')
				return false
			}
			return false
		},
		onChange(info) {
			const { fileList: newFileList } = info
			// Lọc file theo định dạng được phép
			const validFiles = newFileList.filter((f) => {
				const fileName = f.name.toLowerCase()
				return (
					fileName.endsWith('.jpg') ||
					fileName.endsWith('.png') ||
					fileName.endsWith('.xlsx')
				)
			})

			setFileList(validFiles)

			// Tạo cấu trúc thư mục
			const structure = createFolderStructure(validFiles)
			setFolderStructure(structure)
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files)
		},
	}

	// Hàm tạo cấu trúc thư mục từ danh sách file
	const createFolderStructure = (files) => {
		const structure = {}

		files.forEach((file) => {
			const rel =
				file.originFileObj?.webkitRelativePath ||
				file.webkitRelativePath ||
				file.name
			const pathParts = rel.split('/')

			let current = structure
			for (let i = 0; i < pathParts.length - 1; i++) {
				const folderName = pathParts[i]
				if (!current[folderName]) {
					current[folderName] = { type: 'folder', children: {} }
				}
				current = current[folderName].children
			}

			const fileName = pathParts[pathParts.length - 1]
			current[fileName] = { type: 'file', file }
		})

		return structure
	}

	// Hàm render cấu trúc thư mục (kèm path đầy đủ)
	const renderFolderStructure = (structure, path = []) => {
		const level = path.length
		return Object.entries(structure).map(([name, item]) => {
			const currentPath = [...path, name]
			return (
				<div
					key={currentPath.join('/')}
					className="ml-4"
					style={{ marginLeft: `${level * 20}px` }}
				>
					{item.type === 'folder' ? (
						<div>
							<div className="flex items-center py-1">
								<FolderOutlined
									className="mr-2"
									style={{ color: '#f5a623' }}
								/>
								<span className="font-medium">{name}/</span>
								<button
									onClick={() =>
										handleRemovePath(currentPath)
									}
									className="ml-2 text-red-400 hover:text-red-300"
									type="button"
								>
									<DeleteOutlined />
								</button>
							</div>
							{renderFolderStructure(item.children, currentPath)}
						</div>
					) : (
						<div className="flex items-center py-1">
							<FileOutlined
								className="mr-2"
								style={{ color: '#4a90e2' }}
							/>
							<span
								className="text-sm truncate max-w-xs"
								title={name}
							>
								{name} ({(item.file.size / 1024).toFixed(2)} KB)
							</span>
							<button
								onClick={() => handleRemovePath(currentPath)}
								className="ml-2 text-red-400 hover:text-red-300"
								type="button"
							>
								<DeleteOutlined />
							</button>
						</div>
					)}
				</div>
			)
		})
	}

	// Xóa file/folder theo path (pathParts: mảng tên các cấp)
	const handleRemovePath = (pathParts) => {
		setFolderStructure((prev) => {
			const clone = JSON.parse(JSON.stringify(prev))
			let parent = clone
			for (let i = 0; i < pathParts.length - 1; i++) {
				const key = pathParts[i]
				if (!parent[key]) return prev
				parent = parent[key].children
			}
			const last = pathParts[pathParts.length - 1]
			if (last != null && parent[last]) {
				delete parent[last]
			}
			return clone
		})

		// đồng bộ fileList: loại bỏ các file nằm trong folder bị xóa hoặc file vừa xóa
		setFileList((prev) => {
			return prev.filter((f) => {
				const rel =
					f.originFileObj?.webkitRelativePath ||
					f.webkitRelativePath ||
					f.name
				const relParts = rel.split('/')
				const target = pathParts
				// giữ lại file nếu không nằm trong nhánh bị xóa
				return !target.every((p, idx) => relParts[idx] === p)
			})
		})
	}

	const handleUpload = () => {
		if (fileList.length === 0) {
			message.warning('Please select files or folder first!')
			return
		}

		// Gọi callback với danh sách file được chọn
		if (onUpload) {
			onUpload(fileList)
		}

		// Đóng modal sau khi upload
		onClose()
		setFileList([])
		setFolderStructure([])
	}

	const handleCancel = () => {
		setFileList([])
		setFolderStructure([])
		onClose()
	}

	return (
		<Modal
			open={isOpen}
			onCancel={handleCancel}
			footer={null}
			width={600}
			centered
			closeIcon={<CloseOutlined style={{ color: 'var(--text)' }} />}
			style={{
				background: 'var(--card-gradient)',
				backdropFilter: 'blur(10px)',
			}}
			styles={{
				body: {
					background: 'var(--card-gradient)',
					color: 'var(--text)',
				},
			}}
		>
			<div className="p-4">
				<h3
					className="text-xl font-bold mb-4"
					style={{ color: 'var(--text)' }}
				>
					Upload Data
				</h3>

				<Dragger {...uploadProps}>
					<p className="ant-upload-drag-icon">
						<InboxOutlined
							style={{ color: 'var(--accent-text)' }}
						/>
					</p>
					<p
						className="ant-upload-text"
						style={{ color: 'var(--text)' }}
					>
						Click or drag folder/file to this area to upload
					</p>
					<p
						className="ant-upload-hint"
						style={{ color: 'var(--secondary-text)' }}
					>
						Support for single file, multiple files, or entire
						folder upload. Only CSV, JSON, Excel files are allowed.
						(MAX. 10MB per file)
					</p>
				</Dragger>

				{folderStructure && Object.keys(folderStructure).length > 0 && (
					<div
						className="mt-4 p-3 rounded-lg"
						style={{
							backgroundColor: 'var(--card-gradient)',
							border: '1px solid var(--border)',
						}}
					>
						<p
							className="text-sm mb-2"
							style={{ color: 'var(--text)' }}
						>
							Selected structure:
						</p>
						<div className="max-h-40 overflow-y-auto">
							{renderFolderStructure(folderStructure)}
						</div>
					</div>
				)}

				{fileList.length > 0 && (
					<div
						className="mt-2 text-xs"
						style={{ color: 'var(--secondary-text)' }}
					>
						Total files: {fileList.length}
					</div>
				)}

				<div className="flex justify-end space-x-3 mt-6">
					<Button onClick={handleCancel}>Cancel</Button>
					<Button
						type="primary"
						onClick={handleUpload}
						disabled={fileList.length === 0}
					>
						Upload
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default UpDataDeploy
