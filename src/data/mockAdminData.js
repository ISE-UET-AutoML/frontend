// Mock users data
export const mockUsers = [
	{
		id: 'user-001',
		name: 'John Doe',
		email: 'john.doe@example.com',
		password: 'password123',
		createdAt: '2024-11-15T10:30:00Z',
		lastLogin: '2024-12-16T14:22:00Z',
		role: 'user',
		modelsCount: 15,
		experimentsCount: 42,
		datasetsCount: 8,
		deployedModelsCount: 5,
		totalTrainingCost: 245.5,
		mostUsedTasks: ['Classification', 'Regression', 'Object Detection'],
		mostUsedDataTypes: ['Tabular', 'Image', 'Text'],
	},
	{
		id: 'user-002',
		name: 'Jane Smith',
		email: 'jane.smith@example.com',
		password: 'pass456',
		createdAt: '2024-10-20T08:15:00Z',
		lastLogin: '2024-12-17T09:45:00Z',
		role: 'user',
		modelsCount: 23,
		experimentsCount: 67,
		datasetsCount: 12,
		deployedModelsCount: 8,
		totalTrainingCost: 412.75,
		mostUsedTasks: ['NLP', 'Classification', 'Time Series'],
		mostUsedDataTypes: ['Text', 'Tabular', 'Time Series'],
	},
	{
		id: 'user-003',
		name: 'Bob Johnson',
		email: 'bob.johnson@example.com',
		password: 'secure789',
		createdAt: '2024-12-01T12:00:00Z',
		lastLogin: '2024-12-15T16:30:00Z',
		role: 'user',
		modelsCount: 5,
		experimentsCount: 18,
		datasetsCount: 4,
		deployedModelsCount: 2,
		totalTrainingCost: 89.25,
		mostUsedTasks: ['Regression', 'Forecasting'],
		mostUsedDataTypes: ['Tabular', 'Time Series'],
	},
	{
		id: 'user-004',
		name: 'Alice Williams',
		email: 'alice.williams@example.com',
		password: 'alice2024',
		createdAt: '2024-09-10T14:20:00Z',
		lastLogin: '2024-12-17T11:15:00Z',
		role: 'user',
		modelsCount: 31,
		experimentsCount: 95,
		datasetsCount: 18,
		deployedModelsCount: 12,
		totalTrainingCost: 678.9,
		mostUsedTasks: ['Object Detection', 'Segmentation', 'Classification'],
		mostUsedDataTypes: ['Image', 'Video'],
	},
	{
		id: 'user-005',
		name: 'Charlie Brown',
		email: 'charlie.brown@example.com',
		password: 'charlie123',
		createdAt: '2024-11-25T09:45:00Z',
		lastLogin: '2024-12-16T18:00:00Z',
		role: 'user',
		modelsCount: 8,
		experimentsCount: 22,
		datasetsCount: 6,
		deployedModelsCount: 3,
		totalTrainingCost: 156.4,
		mostUsedTasks: ['NLP', 'Text Classification'],
		mostUsedDataTypes: ['Text'],
	},
	{
		id: 'user-006',
		name: 'Diana Prince',
		email: 'diana.prince@example.com',
		password: 'wonder2024',
		createdAt: '2024-08-15T11:30:00Z',
		lastLogin: '2024-12-17T08:20:00Z',
		role: 'user',
		modelsCount: 19,
		experimentsCount: 54,
		datasetsCount: 11,
		deployedModelsCount: 7,
		totalTrainingCost: 334.8,
		mostUsedTasks: ['Classification', 'Clustering', 'Anomaly Detection'],
		mostUsedDataTypes: ['Tabular', 'Time Series'],
	},
	{
		id: 'user-007',
		name: 'Ethan Hunt',
		email: 'ethan.hunt@example.com',
		password: 'mission2024',
		createdAt: '2024-10-05T13:15:00Z',
		lastLogin: '2024-12-14T15:40:00Z',
		role: 'user',
		modelsCount: 12,
		experimentsCount: 35,
		datasetsCount: 7,
		deployedModelsCount: 4,
		totalTrainingCost: 198.6,
		mostUsedTasks: ['Object Detection', 'Tracking'],
		mostUsedDataTypes: ['Image', 'Video'],
	},
	{
		id: 'user-008',
		name: 'Fiona Gallagher',
		email: 'fiona.gallagher@example.com',
		password: 'fiona456',
		createdAt: '2024-11-10T10:00:00Z',
		lastLogin: '2024-12-17T07:30:00Z',
		role: 'user',
		modelsCount: 14,
		experimentsCount: 40,
		datasetsCount: 9,
		deployedModelsCount: 6,
		totalTrainingCost: 267.35,
		mostUsedTasks: ['Regression', 'Time Series', 'Forecasting'],
		mostUsedDataTypes: ['Tabular', 'Time Series'],
	},
]

// Mock analytics data
export const mockAnalytics = {
	totalUsers: mockUsers.length,
	usersLastMonth: mockUsers.filter((u) => {
		const createdDate = new Date(u.createdAt)
		const oneMonthAgo = new Date()
		oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
		return createdDate >= oneMonthAgo
	}).length,
	totalProjects: mockUsers.reduce((sum, u) => sum + u.modelsCount, 0),
	totalDatasets: mockUsers.reduce((sum, u) => sum + u.datasetsCount, 0),
	totalExperiments: mockUsers.reduce((sum, u) => sum + u.experimentsCount, 0),
	totalDeployedModels: mockUsers.reduce(
		(sum, u) => sum + u.deployedModelsCount,
		0
	),
	totalRevenue: mockUsers.reduce((sum, u) => sum + u.totalTrainingCost, 0),
}

// Helper function to get user by ID
export const getUserById = (userId) => {
	return mockUsers.find((u) => u.id === userId)
}

// Helper function to format date
export const formatDate = (dateString) => {
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}
