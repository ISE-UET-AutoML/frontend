import React from 'react'
import { Layout } from 'antd'

// Components
import {
	ProjectHeader,
	TaskFilter,
	ProjectsGrid,
	CreationMethodModal,
	ManualCreationModal,
	DatasetSelectionModal,
	ProjectSearchBar,
} from 'src/components/projects'
import AIAssistantModal from './AIAssistantModal'
import ContentContainer from 'src/components/ContentContainer'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import Pager from 'src/components/Pager'

// Hooks
import { useProjects, useChatbot, useDatasets } from 'src/hooks'
import { useTheme } from 'src/theme/ThemeProvider'

const { Content } = Layout

export default function Projects() {
	const pageSize = 9
	const [currentPage, setCurrentPage] = React.useState(1)
	// Custom hooks
	const {
		projectState,
		updateProjState,
		selectedTrainingTask,
		setSelectedTrainingTask,
		isSelected,
		projectName,
		setProjectName,
		description,
		setDescription,
		jsonSumm,
		setJsonSumm,
		selectType,
		getProjects,
		handleCreateProject,
		setTask,
		handleSearch,
		selectedSort,
		handleSortChange,
		searchValue,
		setSearchValue,
		isReset,
		resetFilters,
		visibility,
		setVisibility,
		projType,
		license,
		setLicense,
		expectedAccuracy,
		setExpectedAccuracy,

	} = useProjects()

	const {
		input,
		setInput,
		messages,
		setMessages,
		showTitle,
		setShowTitle,
		showChatbotButtons,
		setShowChatbotButtons,
		chatContainerRef,
		handleKeyPress,
		newChat,
		proceedFromChat,
	} = useChatbot()

	const { selectedDataset, setSelectedDataset, datasets, getDatasets } =
		useDatasets()

	// Enhanced chatbot proceed function
	const handleProceedFromChat = async () => {
		const projectList = projectState.projects.map((project) => project.name)
		const jsonSummary = await proceedFromChat(projectList)

		if (jsonSummary) {
			setJsonSumm(jsonSummary)
			updateProjState({ showUploaderChatbot: false })
			updateProjState({ showUploaderManual: true })
			setTask(jsonSummary)
		} else {
			// User wants to proceed with current data
			updateProjState({ showUploaderChatbot: false })
			updateProjState({ showUploaderManual: true })
		}
	}

	const { theme } = useTheme()

	// Reset page if projects list changes and current page overflows
	React.useEffect(() => {
		const total = projectState.projects?.length || 0
		const totalPages = Math.max(1, Math.ceil(total / pageSize))
		if (currentPage > totalPages) setCurrentPage(1)
	}, [projectState.projects])

	const startIndex = (currentPage - 1) * pageSize
	const paginatedProjects = (projectState.projects || []).slice(startIndex, startIndex + pageSize)

	return (
		<>
			<div
				className="min-h-screen"
				style={{ background: 'var(--surface)', color: 'var(--text)' }}
			>
				<Layout
					className="min-h-screen pt-12"
					style={{ background: 'var(--surface)' }}
				>
					<Content className="relative pt-20 px-6 pb-20">
						{theme === 'dark' && (
							<BackgroundShapes
								width="1280px"
								height="1100px"
								shapes={[
									{
										id: 'projectsBlue',
										shape: 'circle',
										size: '520px',
										gradient: {
											type: 'radial',
											shape: 'ellipse',
											colors: [
												'#5C8DFF 0%',
												'#5C8DFF 35%',
												'transparent 75%',
											],
										},
										opacity: 0.45,
										blur: '220px',
										position: {
											top: '240px',
											right: '-140px',
										},
										transform: 'none',
									},
									{
										id: 'projectsCyan',
										shape: 'rounded',
										size: '420px',
										gradient: {
											type: 'radial',
											shape: 'circle',
											colors: [
												'#40FFFF 0%',
												'#40FFFF 55%',
												'transparent 40%',
											],
										},
										opacity: 0.3,
										blur: '180px',
										position: {
											top: '60px',
											left: '-120px',
										},
										transform: 'none',
									},
									{
										id: 'projectsWarm',
										shape: 'rounded',
										size: '520px',
										gradient: {
											type: 'radial',
											shape: 'circle',
											colors: [
												'#FFAF40 0%',
												'#FFAF40 50%',
												'transparent 85%',
											],
										},
										opacity: 0.25,
										blur: '220px',
										position: { top: '820px', left: '50%' },
										transform: 'translate(-50%, -50%)',
									},
								]}
							/>
						)}
						<ContentContainer className="relative z-10">
							{/* Header Section */}
							<ProjectHeader
								onNewProject={() =>
									updateProjState({ showUploader: true })
								}
							/>

							{/* Training Task Filter */}
							<TaskFilter
								selectedTrainingTask={selectedTrainingTask}
								onTaskChange={setSelectedTrainingTask}
								onReset={resetFilters}
								onSearch={handleSearch}
								selectedSort={selectedSort}
								onSortChange={handleSortChange}
								isReset={isReset}
								searchValue={searchValue}
							/>

						{/* Projects Grid */}
						<ProjectsGrid
							projects={paginatedProjects}
								getProjects={getProjects}
								onCreateProject={() =>
									updateProjState({ showUploader: true })
								}
							/>

						{/* Pager */}
						<div className="mt-8">
							<Pager
								currentPage={currentPage}
								totalItems={(projectState.projects || []).length}
								pageSize={pageSize}
								onPageChange={setCurrentPage}
							/>
						</div>
						</ContentContainer>

						{/* Creation Method Modal */}
						<CreationMethodModal
							open={projectState.showUploader}
							onCancel={() =>
								updateProjState({ showUploader: false })
							}
							onSelectChatbot={() =>
								updateProjState({ showUploaderChatbot: true })
							}
							onSelectManual={() =>
								updateProjState({ showUploaderManual: true })
							}
						/>

						{/* Manual Creation Modal */}
						<ManualCreationModal
							open={projectState.showUploaderManual}
							onCancel={() =>
								updateProjState({ showUploaderManual: false })
							}
							onSubmit={handleCreateProject}
							initialProjectName={projectName}
							initialDescription={description}
							initialVisibility={visibility}
							initialLicense="MIT"
							initialExpectedAccuracy={75}
							isSelected={isSelected}
							onSelectType={selectType}
						/>

						{/* Dataset Selection Modal */}
						<DatasetSelectionModal
							open={projectState.showSelectData}
							onCancel={() =>
								updateProjState({ showSelectData: false })
							}
							onConfirm={() =>
								updateProjState({ showSelectData: false })
							}
							datasets={datasets}
							selectedDataset={selectedDataset}
							onSelectDataset={setSelectedDataset}
						/>

						{/* AI Assistant Modal */}
						<AIAssistantModal
							open={projectState.showUploaderChatbot}
							onCancel={() =>
								updateProjState({ showUploaderChatbot: false })
							}
							messages={messages}
							showTitle={showTitle}
							showChatbotButtons={showChatbotButtons}
							input={input}
							setInput={setInput}
							handleKeyPress={handleKeyPress}
							selectedDataset={selectedDataset}
							datasets={datasets}
							getDatasets={() => getDatasets(updateProjState)}
							newChat={newChat}
							proceedFromChat={handleProceedFromChat}
							chatContainerRef={chatContainerRef}
							setShowTitle={setShowTitle}
							setMessages={setMessages}
							setShowChatbotButtons={setShowChatbotButtons}
						/>
					</Content>
				</Layout>
			</div>
		</>
	)
}
