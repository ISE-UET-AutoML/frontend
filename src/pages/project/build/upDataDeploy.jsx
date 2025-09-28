import { Upload, Button, Modal, message, Select } from 'antd'
import {
	InboxOutlined,
	CloseOutlined,
	FolderOutlined,
	FileOutlined,
	DeleteOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { createPresignedUrlsPredict } from 'src/api/dataset'
import { createDownPresignedUrlsForFolder } from 'src/api/dataset'
import instance from 'src/api/axios'

const { Dragger } = Upload

const UpDataDeploy = ({
	isOpen,
	onClose,
	projectId,
	onUploaded,
	onUploadStart,
}) => {
	const [isUploading, setIsUploading] = useState(false)
	const [fileList, setFileList] = useState([])
	const [folderStructure, setFolderStructure] = useState([])
	const [selectedDuration, setSelectedDuration] = useState('6hours')

	const getNextVersion = async (pid) => {
		try {
			// Lấy danh sách deploy_data hiện có của project
			const res = await instance.get(
				`/api/service/users/projects/${pid}/deployData`
			)
			const items = Array.isArray(res?.data) ? res.data : []
			// Ưu tiên: sort theo created_at rồi extract version từ predict_data_url/data_url
			const versionRegex = new RegExp(`^${pid}_predict\\/v(\\d+)\\/`)
			if (items.length > 0) {
				const sorted = [...items].sort((a, b) => {
					const ta = new Date(a?.created_at || 0).getTime()
					const tb = new Date(b?.created_at || 0).getTime()
					return tb - ta
				})
				const latest = sorted[0]
				const latestCand =
					latest?.predict_data_url || latest?.data_url || ''
				const latestMatch = String(latestCand).match(versionRegex)
				if (latestMatch && latestMatch[1]) {
					const v = parseInt(latestMatch[1], 10)
					if (!Number.isNaN(v)) return v + 1
				}
			}

			// Fallback: tìm version lớn nhất bằng regex nếu thiếu created_at hoặc không parse được
			let maxV = 0
			for (const it of items) {
				const cand = it?.data_url || it?.predict_data_url || ''
				const m = String(cand).match(versionRegex)
				if (m && m[1]) {
					const v = parseInt(m[1], 10)
					if (!Number.isNaN(v)) maxV = Math.max(maxV, v)
				}
			}
			return maxV + 1
		} catch (e) {
			// Nếu lỗi, fallback về 1
			return 1
		}
	}

	const getLatestVersion = async (pid) => {
		const next = await getNextVersion(pid)
		return Math.max(1, next - 1)
	}

	const getLatestDownloadUrls = async (pid) => {
		const v = await getLatestVersion(pid)
		const { data } = await createDownPresignedUrlsForFolder(pid, v)

		return { version: v, urls: data }
	}

	const getLatestUploadPresigns = async (pid, files) => {
		const v = await getLatestVersion(pid)
		const { data } = await createPresignedUrlsPredict({
			projectId: pid,
			version: v,
			files,
		})
		return { version: v, presigned: data }
	}

	const handleStart = async () => {
		try {
			if (!projectId) {
				message.error('Missing projectId')
				return
			}
			if (!fileList || fileList.length === 0) {
				message.warning('Please select files')
				return
			}

			if (typeof onUploadStart === 'function') {
				onUploadStart()
			}
			setIsUploading(true)

			// Không gọi deploy tại đây để ưu tiên upload dữ liệu trước

			// Only allow image files and flatten to base filename
			const allowed = ['.jpg', '.jpeg', '.png', '.csv']
			const imageFiles = fileList.filter((f) => {
				const name = (f.name || '').toLowerCase()
				return allowed.some((ext) => name.endsWith(ext))
			})

			if (imageFiles.length === 0) {
				message.warning('No valid image files (.jpg, .jpeg, .png)')
				return
			}

			// Tính version động theo deploy_data hiện có
			const version = await getNextVersion(projectId)

			// Build presign request for predict endpoint: flatten keys and set version
			const filesToUpload = imageFiles.map((f) => {
				const baseName = f.name
				const type =
					f.type ||
					(baseName.toLowerCase().endsWith('.png') ||
					baseName.toLowerCase().endsWith('.csv')
						? 'image/png'
						: 'image/jpeg')
				return {
					key: baseName,
					type,
				}
			})

			const { data: presignedUrlResponse } =
				await createPresignedUrlsPredict({
					projectId,
					version,
					files: filesToUpload,
				})

			if (
				!Array.isArray(presignedUrlResponse) ||
				presignedUrlResponse.length === 0
			) {
				throw new Error('Failed to get presigned URLs')
			}

			// Map basename(key) -> url for upload (backend returns full S3 key with prefix)
			const keyToUrl = new Map(
				presignedUrlResponse.map((item) => [
					(item.key || '').split('/').pop() || item.key,
					item.url,
				])
			)

			// Upload all files
			await Promise.all(
				filesToUpload.map(async (item, idx) => {
					// item.key is baseName; look up by basename mapping
					const url = keyToUrl.get(item.key)
					if (!url) throw new Error(`Missing URL for ${item.key}`)
					const fileObj =
						imageFiles[idx].originFileObj || imageFiles[idx]
					const resp = await fetch(url, {
						method: 'PUT',
						body: fileObj,
						headers: { 'Content-Type': item.type },
					})
					if (!resp.ok)
						throw new Error(`Upload failed for ${item.key}`)
				})
			)

			// Lưu prefix folder mới nhất lên user_service (deploy_data)
			const prefixKey = `${projectId}_predict/v${version}/`
			try {
				await instance.post(
					`/api/service/users/projects/${projectId}/deployData`,
					{
						dataUrl: prefixKey,
						predictDataUrl: prefixKey,
					}
				)
			} catch (e) {
				console.error('Save deploy_data error:', e)
			}

			if (typeof onUploaded === 'function') {
				onUploaded(selectedDuration)
			}
			setFileList([])
			setFolderStructure([])
			// Đóng modal sau khi upload thành công
			if (typeof onClose === 'function') {
				onClose()
			}
		} catch (e) {
			console.error('Upload error:', e)
			message.error(e.message || 'Upload failed')
		} finally {
			// Gọi lại list folder cho version mới nhất để hiển thị bằng helper
			const { version: latestV, urls } =
				await getLatestDownloadUrls(projectId)
			console.log('latest version', latestV, 'urls', urls)
			setIsUploading(false)
		}
	}
	const uploadProps = {
		name: 'file',
		multiple: true,
		directory: true,
		accept: '.jpg,.jpeg,.png,.csv',
		fileList, // kiểm soát danh sách file
		showUploadList: false,
		beforeUpload: (file) => {
			const isLt10M = file.size / 1024 / 1024 < 20
			if (!isLt10M) {
				message.error('File must be smaller than 20MB!')
				return false
			}
			return false
		},
		onChange(info) {
			const { fileList: newFileList } = info
			// Chỉ nhận ảnh: .jpg, .jpeg, .png
			const validFiles = newFileList.filter((f) => {
				const fileName = f.name.toLowerCase()
				return (
					fileName.endsWith('.jpg') ||
					fileName.endsWith('.jpeg') ||
					fileName.endsWith('.png') ||
					fileName.endsWith('.csv')
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
			styles={{
				content: {
					background: 'var(--card-gradient)',
					border: '1px solid var(--border)',
					borderRadius: 12,
					boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
				},
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

				<Dragger
					{...uploadProps}
					className="updeploy-dragger"
					style={{
						border: '1px dashed var(--border)',
						borderRadius: 12,
						background: 'transparent',
					}}
				>
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
						folder upload. JPG, PNG, CSV, JSON, Excel files are
						allowed. (MAX. 10MB per file)
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

				{/* Duration Selection */}
				<div className="mt-4">
					<label 
						className="block text-sm font-medium mb-2"
						style={{ color: 'var(--text)' }}
					>
						App Valid Duration:
					</label>
					<Select
						value={selectedDuration}
						onChange={setSelectedDuration}
						style={{ width: '100%' }}
						options={[
							{ value: '30min', label: '30 Minutes' },
							{ value: '6hours', label: '6 Hours' },
							{ value: '12hours', label: '12 Hours' },
							{ value: 'max', label: 'Maximum Duration' }
						]}
					/>
					<div
						className="mt-1 text-xs"
						style={{ color: 'var(--secondary-text)' }}
					>
						How long should your deployed app remain accessible?
					</div>
				</div>

				<div className="flex justify-end space-x-3 mt-6">
					<Button onClick={handleCancel} disabled={isUploading}>
						Cancel
					</Button>
					<Button
						type="primary"
						onClick={handleStart}
						disabled={fileList.length === 0 || isUploading}
						loading={isUploading}
					>
						Start
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default UpDataDeploy
