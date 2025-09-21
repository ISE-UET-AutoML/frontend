import React, { useEffect, useState } from 'react'
import {
	createLbProject,
	getLbProjByTask,
	startExport,
	getExportStatus,
} from 'src/api/labelProject'
import { useNavigate, useOutletContext } from 'react-router-dom'
import CreateLabelProjectModal from 'src/pages/labels/CreateLabelProjectModal'
import config from './config'
import { PATHS } from 'src/constants/paths'
import { Button } from 'src/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from 'src/components/ui/card'
import { CustomSelect, Option } from 'src/components/ui/custom-select'
import { RadioGroup, RadioGroupItem } from 'src/components/ui/radio-group'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from 'src/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from 'src/components/ui/alert'
import { Tooltip } from 'src/components/ui/tooltip'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { message } from 'antd'
import { useTheme } from 'src/theme/ThemeProvider'
// Simple SVG icons
const CloudUploadIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M7 18C4.79086 18 3 16.2091 3 14C3 12.9857 3.37764 12.0596 4 11.3542V11C4 7.68629 6.68629 5 10 5C10.3416 5 10.6734 5.03015 10.9925 5.08738C11.7212 3.73139 13.1772 3 14.5 3C16.433 3 18 4.567 18 6.5C18.0001 6.5 18 6.5 18 6.5V7C19.6569 7 21 8.34315 21 10C21 11.6569 19.6569 13 18 13H17V14C17 16.2091 15.2091 18 13 18H7Z"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M12 15L12 9M12 15L9 12M12 15L15 12"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const ArrowRightIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M5 12H19M19 12L12 5M19 12L12 19"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const InfoCircledIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
		<path
			d="M12 16V12M12 8H12.01"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const MixerHorizontalIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M3 12H21M3 6H21M3 18H21"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<circle cx="6" cy="6" r="2" fill="currentColor" />
		<circle cx="18" cy="12" r="2" fill="currentColor" />
		<circle cx="6" cy="18" r="2" fill="currentColor" />
	</svg>
)

const SearchIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const SortIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M3 6H21M6 12H18M9 18H15"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const SortAscIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M3 6H21M6 12H18M9 18H15M12 6L8 2L4 6"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const SortDescIcon = ({ className, ...props }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M3 6H21M6 12H18M9 18H15M12 18L8 22L4 18"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const UploadData = () => {
	const { updateFields, projectInfo } = useOutletContext()
	const { theme } = useTheme()
	const navigate = useNavigate()
	const [labelProjects, setLabelProjects] = useState([])
	const [serviceFilter, setServiceFilter] = useState('')
	const [bucketFilter, setBucketFilter] = useState('')
	const [labeledFilter, setLabeledFilter] = useState('')
	const [searchQuery, setSearchQuery] = useState('')
	const [sortBy, setSortBy] = useState('name')
	const [sortDirection, setSortDirection] = useState('asc')
	const [selectedRowKeys, setSelectedRowKeys] = useState('')
	const [tableLoading, setTableLoading] = useState(false)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isExporting, setIsExporting] = useState(false)

	const pollExportStatus = (taskId) => {
		return new Promise((resolve, reject) => {
			const intervalId = setInterval(async () => {
				try {
					const response = await getExportStatus(taskId)
					const { status, result, error } = response.data

					console.log(
						`[pollExportStatus] Task ${taskId} → status: ${status}`
					)

					if (status === 'SUCCESS') {
						clearInterval(intervalId)
						console.log(
							`[pollExportStatus] Task ${taskId} completed. Result:`,
							result
						)
						resolve(result)
					} else if (status === 'FAILURE') {
						clearInterval(intervalId)
						console.error(
							`[pollExportStatus] Task ${taskId} failed. Error:`,
							error
						)
						reject(new Error(error || 'Export task failed.'))
					}
					// Nếu là PENDING thì tiếp tục chờ
				} catch (err) {
					clearInterval(intervalId)
					console.error(
						`[pollExportStatus] Error checking task ${taskId}:`,
						err?.message || err
					)
					reject(err)
				}
			}, 5000) // Hỏi lại mỗi 5 giây
		})
	}

	const fetchProjects = async () => {
		setTableLoading(true)
		try {
			const response = await getLbProjByTask(projectInfo.task_type)
			setLabelProjects(
				Array.isArray(response.data)
					? response.data.map((item) => ({
							...item,
							project_id: item.id,
							title: item.name,
							bucketName: item.bucket_name,
							isLabeled: item.annotated_nums > 0,
							service: item.service,
						}))
					: []
			)
			console.log(response)
		} catch (error) {
			console.error('Error fetching label projects by task type:', error)
		} finally {
			setTableLoading(false)
		}
	}

	useEffect(() => {
		if (!projectInfo?.task_type) return
		fetchProjects()
	}, [projectInfo?.task_type])

	const filteredProjects = labelProjects
		.filter(
			(item) =>
				(!serviceFilter || item.service === serviceFilter) &&
				(!bucketFilter || item.bucketName === bucketFilter) &&
				(!labeledFilter ||
					(labeledFilter === 'yes'
						? item.isLabeled
						: !item.isLabeled)) &&
				(!searchQuery ||
					item.title
						.toLowerCase()
						.includes(searchQuery.toLowerCase())) &&
				item.task_type === projectInfo?.task_type
		)
		.sort((a, b) => {
			let comparison = 0

			if (sortBy === 'name') {
				comparison = a.title.localeCompare(b.title)
			} else if (sortBy === 'date') {
				// Assuming there's a created_at or similar date field
				const dateA = new Date(a.created_at || a.updated_at || 0)
				const dateB = new Date(b.created_at || b.updated_at || 0)
				comparison = dateA - dateB
			}

			return sortDirection === 'asc' ? comparison : -comparison
		})

	const handleContinue = async () => {
		const selectedProject = filteredProjects.find(
			(p) => p.project_id === selectedRowKeys
		)

		if (!selectedProject) return

		console.log('selectedProject', selectedProject)
		setIsExporting(true)
		try {
			const startResponse = await startExport(
				selectedProject.label_studio_id
			)
			const { task_id } = startResponse.data
			console.log('Export started, task ID:', startResponse)

			const finalResult = await pollExportStatus(task_id)
			console.log('Export completed successfully:', finalResult)
			message.success('Data prepared successfully!')

			//await uploadToS3(selectedProject.label_studio_id)
			updateFields({
				selectedProject,
			})
			const object = config[projectInfo.task_type]
			if (!object) {
				console.error(
					'Config not found for task type:',
					projectInfo.task_type
				)
				return
			}
			navigate(
				`/app/project/${projectInfo.id}/build/${object.afterUploadURL}`
			)
		} catch (error) {
			console.error('Error exporting labels to S3:', error)
			message.error('Không thể chuẩn bị dữ liệu. Vui lòng thử lại.')
		} finally {
			setIsExporting(false) // Luôn ẩn dialog sau khi hoàn tất
		}
		//if (!selectedProject.isLabeled) {
		//  navigate(PATHS.LABEL_VIEW(selectedProject.project_id, 'labeling'))
		//}
	}

	const showModal = () => {
		setIsModalVisible(true)
	}

	const hideModal = () => {
		setIsModalVisible(false)
	}

	const handleCreateLabelProject = async (payload) => {
		setTableLoading(true)
		try {
			const response = await createLbProject(payload)
			if (response.status === 201) {
				hideModal() // Đóng modal
				await fetchProjects() // Refresh bảng
			}
		} catch (error) {
			console.error('Error creating label project:', error)
		} finally {
			setTableLoading(false)
		}
	}

	const renderServiceTag = (service) => (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${
				service === 'AWS_S3'
					? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
					: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
			}`}
		>
			{service === 'AWS_S3' ? 'AWS' : 'Google Cloud'}
		</span>
	)

	const renderLabeledTag = (isLabeled) => (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${
				isLabeled
					? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
					: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
			}`}
		>
			{isLabeled ? 'Yes' : 'No (Disabled)'}
		</span>
	)

	const selectedProject = selectedRowKeys
		? filteredProjects.find((p) => p.project_id === selectedRowKeys)
		: null
	const isSelectedProjectLabeled = selectedProject?.isLabeled

	return (
		<>
			<style>{`
				body, html {
					background-color: var(--surface) !important;
				}
			`}</style>
			<div
				className="min-h-screen"
				style={{ background: 'var(--surface)' }}
			>
				<div className="relative pt-20 px-6 pb-20">
					{theme === 'dark' && (
						<BackgroundShapes
							width="1280px"
							height="1200px"
							shapes={[
								{
									id: 'uploadBlue',
									shape: 'circle',
									size: '480px',
									gradient: {
										type: 'radial',
										shape: 'ellipse',
										colors: [
											'#5C8DFF 0%',
											'#5C8DFF 35%',
											'transparent 75%',
										],
									},
									opacity: 0.4,
									blur: '200px',
									position: { top: '200px', right: '-120px' },
									transform: 'none',
								},
								{
									id: 'uploadCyan',
									shape: 'rounded',
									size: '380px',
									gradient: {
										type: 'radial',
										shape: 'circle',
										colors: [
											'#40FFFF 0%',
											'#40FFFF 55%',
											'transparent 85%',
										],
									},
									opacity: 0.25,
									blur: '160px',
									position: { top: '50px', left: '-100px' },
									transform: 'none',
								},
								{
									id: 'uploadWarm',
									shape: 'rounded',
									size: '450px',
									gradient: {
										type: 'radial',
										shape: 'circle',
										colors: [
											'#FFAF40 0%',
											'#FFAF40 50%',
											'transparent 85%',
										],
									},
									opacity: 0.2,
									blur: '180px',
									position: { top: '700px', left: '50%' },
									transform: 'translate(-50%, -50%)',
								},
							]}
						/>
					)}

					<div className="relative z-10">
						{/* Header Section */}
						<div className="flex justify-center mb-12">
							<div className="w-full max-w-4xl text-center">
								<h1
									className="text-5xl md:text-6xl font-bold mb-6"
									style={{
										color: 'var(--title-project)',
									}}
								>
									Choose Your Label Project
								</h1>
								<p
									className="text-xl max-w-2xl mx-auto"
									style={{ color: 'var(--secondary-text)' }}
								>
									Select an existing label project or create a
									new one <br /> for your labeling task
								</p>
							</div>
						</div>

						{/* Main Content */}
						<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
							{/* Filter Sidebar */}
							<div className="lg:col-span-1">
								<Card
									className="rounded-2xl shadow-2xl sticky top-4"
									style={{
										background: 'var(--card-gradient)',
										border: '1px solid var(--border)',
									}}
								>
									<CardHeader>
										<CardTitle
											className="flex items-center gap-3 text-lg"
											style={{ color: 'var(--text)' }}
										>
											<MixerHorizontalIcon
												className="h-5 w-5"
												style={{
													color: 'var(--accent-text)',
												}}
											/>
											Filter Options
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										{/* Search Input */}
										<div>
											<label
												className="flex items-center gap-2 font-medium mb-3"
												style={{ color: 'var(--text)' }}
											>
												Search by Name
												<Tooltip title="Search for projects by name">
													<InfoCircledIcon
														className="h-4 w-4 cursor-help"
														style={{
															color: 'var(--secondary-text)',
														}}
													/>
												</Tooltip>
											</label>
											<div className="relative">
												<SearchIcon
													className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
													style={{
														color: 'var(--secondary-text)',
													}}
												/>
												<input
													type="text"
													placeholder="Search projects..."
													value={searchQuery}
													onChange={(e) =>
														setSearchQuery(
															e.target.value
														)
													}
													className="w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
													style={{
														background:
															'var(--input-bg)',
														border: '1px solid var(--border)',
														color: 'var(--text)',
													}}
												/>
											</div>
										</div>

										{/* Sort Options */}
										<div>
											<label
												className="flex items-center gap-2 font-medium mb-3"
												style={{ color: 'var(--text)' }}
											>
												Sort by
												<Tooltip title="Choose how to sort the projects">
													<InfoCircledIcon
														className="h-4 w-4 cursor-help"
														style={{
															color: 'var(--secondary-text)',
														}}
													/>
												</Tooltip>
											</label>
											<div className="flex items-center gap-2 w-full">
												<div className="flex-1">
													<CustomSelect
														value={sortBy}
														onChange={setSortBy}
														placeholder="Sort by"
														className="theme-dropdown w-full"
													>
														<Option value="name">
															Name
														</Option>
														<Option value="date">
															Date Added
														</Option>
													</CustomSelect>
												</div>

												<Tooltip
													title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
												>
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															setSortDirection(
																sortDirection ===
																	'asc'
																	? 'desc'
																	: 'asc'
															)
														}
														className="p-2 h-8 w-8 flex-shrink-0"
														style={{
															background:
																'var(--input-bg)',
															border: '1px solid var(--border)',
															color: 'var(--text)',
														}}
													>
														{sortDirection ===
														'asc' ? (
															<SortAscIcon className="h-4 w-4" />
														) : (
															<SortDescIcon className="h-4 w-4" />
														)}
													</Button>
												</Tooltip>
											</div>
										</div>

										{/* Cloud Service Filter */}
										<div>
											<label
												className="flex items-center gap-2 font-medium mb-3"
												style={{ color: 'var(--text)' }}
											>
												Cloud Service
												<Tooltip title="Choose the cloud storage service where your label project is stored">
													<InfoCircledIcon
														className="h-4 w-4 cursor-help"
														style={{
															color: 'var(--secondary-text)',
														}}
													/>
												</Tooltip>
											</label>
											<CustomSelect
												value={serviceFilter}
												onChange={setServiceFilter}
												placeholder="Select Service"
												className="theme-dropdown"
											>
												<Option value="">
													All Services
												</Option>
												<Option value="AWS_S3">
													Amazon S3
												</Option>
												<Option value="GCP_STORAGE">
													Google Cloud Storage
												</Option>
											</CustomSelect>
										</div>

										{/* Storage Bucket Filter */}
										<div>
											<label
												className="flex items-center gap-2 font-medium mb-3"
												style={{ color: 'var(--text)' }}
											>
												Storage Bucket
												<Tooltip title="Select the specific storage bucket containing your label project">
													<InfoCircledIcon
														className="h-4 w-4 cursor-help"
														style={{
															color: 'var(--secondary-text)',
														}}
													/>
												</Tooltip>
											</label>
											<CustomSelect
												value={bucketFilter}
												onChange={setBucketFilter}
												placeholder="Select Bucket"
												className="theme-dropdown"
											>
												<Option value="">
													All Buckets
												</Option>
												<Option value="user-private-project">
													User Private Project
												</Option>
												<Option value="bucket-1">
													Bucket 1
												</Option>
											</CustomSelect>
										</div>

										{/* Project Status Filter */}
										<div>
											<label
												className="flex items-center gap-2 font-medium mb-3"
												style={{ color: 'var(--text)' }}
											>
												Project Status
												<Tooltip title="Filter projects based on whether they're already labeled">
													<InfoCircledIcon
														className="h-4 w-4 cursor-help"
														style={{
															color: 'var(--secondary-text)',
														}}
													/>
												</Tooltip>
											</label>
											<RadioGroup
												value={labeledFilter}
												onValueChange={setLabeledFilter}
												className="space-y-3"
											>
												<div
													className="flex items-center space-x-3 cursor-pointer"
													onClick={() =>
														setLabeledFilter('')
													}
												>
													<RadioGroupItem
														value=""
														id="all"
													/>
													<label
														htmlFor="all"
														className="cursor-pointer"
														style={{
															color: 'var(--secondary-text)',
														}}
													>
														All Projects
													</label>
												</div>
												<div
													className="flex items-center space-x-3 cursor-pointer"
													onClick={() =>
														setLabeledFilter('yes')
													}
												>
													<RadioGroupItem
														value="yes"
														id="labeled"
													/>
													<label
														htmlFor="labeled"
														className="cursor-pointer"
														style={{
															color: 'var(--secondary-text)',
														}}
													>
														Labeled Projects
													</label>
												</div>
												<div
													className="flex items-center space-x-3 cursor-pointer"
													onClick={() =>
														setLabeledFilter('no')
													}
												>
													<RadioGroupItem
														value="no"
														id="unlabeled"
													/>
													<label
														htmlFor="unlabeled"
														className="cursor-pointer"
														style={{
															color: 'var(--secondary-text)',
														}}
													>
														Unlabeled Projects
													</label>
												</div>
											</RadioGroup>
										</div>

										{/* Continue Button */}
										{selectedRowKeys && (
											<Button
												onClick={handleContinue}
												className="w-full font-semibold py-3 rounded-xl transition-all duration-200"
												style={{
													background:
														'var(--button-gradient)',
													border: '1px solid var(--border)',
													color: '#ffffff',
												}}
											>
												<span className="flex items-center justify-center gap-2">
													Go to Training
													<ArrowRightIcon className="h-4 w-4" />
												</span>
											</Button>
										)}
									</CardContent>
								</Card>
							</div>

							{/* Main Content Area */}
							<div className="lg:col-span-3 space-y-6">
								{/* Projects Table */}
								<Card
									className="rounded-2xl shadow-2xl"
									style={{
										background: 'var(--card-gradient)',
										border: '1px solid var(--border)',
									}}
								>
									<CardContent className="p-8">
										<Alert
											className="mb-8"
											style={{
												background:
													'var(--alert-info-bg)',
												border: '1px solid var(--alert-info-border)',
												color: 'var(--text)',
											}}
										>
											<InfoCircledIcon
												className="h-4 w-4"
												style={{
													color: 'var(--accent-text)',
												}}
											/>
											<AlertTitle
												className="font-medium"
												style={{ color: 'var(--text)' }}
											>
												Need help choosing a label
												project?
											</AlertTitle>
											<AlertDescription
												className="mt-1"
												style={{
													color: 'var(--secondary-text)',
												}}
											>
												If you're unsure about which
												project to select, look for one
												that matches your task type and
												is already labeled (marked with
												'Yes'). This will help you get
												started faster.
											</AlertDescription>
										</Alert>

										{tableLoading ? (
											<div className="flex items-center justify-center py-16">
												<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
												<span className="ml-4 text-gray-300 text-lg">
													Processing label project
													creation...
												</span>
											</div>
										) : (
											<div className="overflow-x-auto">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead
																className="font-semibold text-left py-4"
																style={{
																	background:
																		'var(--table-header-bg)',
																	color: 'var(--table-header-color)',
																	borderBottom:
																		'1px solid var(--table-header-border)',
																}}
															>
																Title
															</TableHead>
															<TableHead
																className="font-semibold text-center py-4"
																style={{
																	background:
																		'var(--table-header-bg)',
																	color: 'var(--table-header-color)',
																	borderBottom:
																		'1px solid var(--table-header-border)',
																}}
															>
																Service
															</TableHead>
															<TableHead
																className="font-semibold text-center py-4"
																style={{
																	background:
																		'var(--table-header-bg)',
																	color: 'var(--table-header-color)',
																	borderBottom:
																		'1px solid var(--table-header-border)',
																}}
															>
																Bucket
															</TableHead>
															<TableHead
																className="font-semibold text-center py-4"
																style={{
																	background:
																		'var(--table-header-bg)',
																	color: 'var(--table-header-color)',
																	borderBottom:
																		'1px solid var(--table-header-border)',
																}}
															>
																Labeled
															</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{filteredProjects.length ===
														0 ? (
															<TableRow>
																<TableCell
																	colSpan={4}
																	className="text-center py-16"
																>
																	<div
																		style={{
																			color: 'var(--secondary-text)',
																		}}
																	>
																		<CloudUploadIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
																		<p className="text-lg">
																			No
																			label
																			projects
																			match
																			your
																			current
																			filters
																		</p>
																	</div>
																</TableCell>
															</TableRow>
														) : (
															filteredProjects.map(
																(project) => (
																	<TableRow
																		key={
																			project.project_id
																		}
																		className={`transition-all duration-200 ${project.isLabeled ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
																		style={{
																			background:
																				selectedRowKeys ===
																				project.project_id
																					? 'var(--selection-bg)'
																					: 'transparent',
																		}}
																		onClick={() => {
																			if (
																				project.isLabeled
																			) {
																				setSelectedRowKeys(
																					project.project_id
																				)
																			}
																		}}
																	>
																		<TableCell
																			className="font-medium py-4"
																			style={{
																				color: 'var(--text)',
																			}}
																		>
																			{
																				project.title
																			}
																		</TableCell>
																		<TableCell className="text-center py-4">
																			{renderServiceTag(
																				project.service
																			)}
																		</TableCell>
																		<TableCell
																			className="text-center py-4"
																			style={{
																				color: 'var(--secondary-text)',
																			}}
																		>
																			{
																				project.bucketName
																			}
																		</TableCell>
																		<TableCell className="text-center py-4">
																			{project.isLabeled ? (
																				renderLabeledTag(
																					project.isLabeled
																				)
																			) : (
																				<Tooltip title="This project has no labeled data and cannot be selected">
																					{renderLabeledTag(
																						project.isLabeled
																					)}
																				</Tooltip>
																			)}
																		</TableCell>
																	</TableRow>
																)
															)
														)}
													</TableBody>
												</Table>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Create New Project Card */}
								<Card
									className="rounded-2xl shadow-2xl transition-all duration-300 cursor-pointer group"
									style={{
										background: 'var(--card-gradient)',
										border: '1px solid var(--border)',
									}}
									onClick={showModal}
								>
									<CardContent className="p-12 text-center">
										<CloudUploadIcon
											className="h-20 w-20 mx-auto mb-6 transition-colors"
											style={{
												color: 'var(--accent-text)',
											}}
										/>
										<h3
											className="text-2xl font-semibold mb-3 transition-colors"
											style={{ color: 'var(--text)' }}
										>
											Create a New Label Project
										</h3>
										<p
											className="text-lg transition-colors"
											style={{
												color: 'var(--secondary-text)',
											}}
										>
											Don't see what you need? Click here
											to create a new label project
										</p>
									</CardContent>
								</Card>
							</div>
						</div>

						{/* Modals */}
						<CreateLabelProjectModal
							visible={isModalVisible}
							onCancel={hideModal}
							onCreate={handleCreateLabelProject}
						/>
					</div>
				</div>
				{isExporting && (
					<div className="absolute inset-0 z-50 flex items-center justify-center p-4">
						{/* Backdrop */}
						<div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

						{/* Modal */}
						<div className="relative z-10 w-full max-w-md">
							<div
								className="rounded-2xl shadow-2xl overflow-hidden"
								style={{
									background: 'var(--modal-bg)',
									border: '1px solid var(--modal-border)',
								}}
							>
								{/* Header */}
								<div
									className="px-8 py-6"
									style={{
										borderBottom:
											'1px solid var(--modal-header-border)',
										background: 'var(--modal-header-bg)',
									}}
								>
									<div className="flex items-center justify-center">
										<div className="relative">
											{/* Animated gradient ring */}
											<div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin">
												<div
													className="w-14 h-14 rounded-full m-1 flex items-center justify-center"
													style={{
														background:
															'var(--modal-bg)',
													}}
												>
													<svg
														className="w-6 h-6 animate-pulse"
														style={{
															color: 'var(--accent-text)',
														}}
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
														/>
													</svg>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Content */}
								<div className="px-8 py-6 text-center">
									<h3
										className="text-xl font-semibold mb-3"
										style={{
											color: 'var(--modal-title-color)',
										}}
									>
										Preparing Your Data
									</h3>
									<p
										className="leading-relaxed"
										style={{ color: 'var(--text)' }}
									>
										The system is exporting labels and
										preparing your data for training.
										<br />
										<span
											className="text-sm mt-2 block"
											style={{
												color: 'var(--secondary-text)',
											}}
										>
											This process may take a few minutes.
											Please do not close this window.
										</span>
									</p>

									{/* Progress indicator */}
									<div className="mt-6">
										<div className="flex justify-center space-x-1">
											<div
												className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
												style={{
													animationDelay: '0ms',
												}}
											></div>
											<div
												className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
												style={{
													animationDelay: '150ms',
												}}
											></div>
											<div
												className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
												style={{
													animationDelay: '300ms',
												}}
											></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	)
}

export default UploadData
