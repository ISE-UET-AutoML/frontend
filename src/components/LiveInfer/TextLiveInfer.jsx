import React, { useState } from 'react'
import {
	Card,
	Button,
	Table,
	Tooltip,
	Space,
	Input,
	Form,
	Typography,
	message,
	Popconfirm,
} from 'antd'
import {
	PlusOutlined,
	DeleteOutlined,
	EditOutlined,
	CloudUploadOutlined,
	ThunderboltOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const EditableCell = ({
	editing,
	dataIndex,
	title,
	record,
	index,
	children,
	...restProps
}) => {
	return (
		<td {...restProps}>
			{editing ? (
				<Form.Item
					name={dataIndex}
					style={{ margin: 0 }}
					rules={[{ required: false }]}
				>
					<Input
						autoFocus
						onPressEnter={() => restProps.onPressEnter?.()}
					/>
				</Form.Item>
			) : (
				children
			)}
		</td>
	)
}

const TextLiveInfer = ({ projectInfo, handleUploadFiles }) => {
	const [form] = Form.useForm()
	const [rows, setRows] = useState(1)
	const [columns, setColumns] = useState(1)
	const [data, setData] = useState([{ key: '0', 0: '' }]) // Initial empty row with key
	const [columnHeaders, setColumnHeaders] = useState(['Column 1']) // Default header
	const [editingKey, setEditingKey] = useState('')
	const [editingHeader, setEditingHeader] = useState(-1)
	const [headerForm] = Form.useForm()
	const [uploading, setUploading] = useState(false)

	// Is row being edited
	const isEditing = (record) => record.key === editingKey

	// Start editing a row
	const edit = (record) => {
		form.setFieldsValue({ ...record })
		setEditingKey(record.key)
	}

	// Cancel editing
	const cancel = () => {
		setEditingKey('')
	}

	// Save edited row
	const save = async (key) => {
		try {
			const row = await form.validateFields()
			const newData = [...data]
			const index = newData.findIndex((item) => key === item.key)

			if (index > -1) {
				const item = newData[index]
				newData.splice(index, 1, {
					...item,
					...row,
				})
				setData(newData)
				setEditingKey('')
			}
		} catch (errInfo) {
			console.log('Validate Failed:', errInfo)
		}
	}

	// Add a new row
	const addRow = () => {
		const newRow = { key: `${rows}` }
		for (let i = 0; i < columns; i++) {
			newRow[i] = ''
		}
		setRows(rows + 1)
		setData([...data, newRow])
	}

	// Add a new column
	const addColumn = () => {
		const newColumnIndex = columns
		const newHeader = `Column ${columns + 1}`
		setColumns(columns + 1)
		setColumnHeaders([...columnHeaders, newHeader])

		// Add the new column to all existing rows
		const newData = data.map((row) => ({
			...row,
			[newColumnIndex]: '',
		}))

		setData(newData)
	}

	// Delete a row
	const deleteRow = (key) => {
		const newData = data.filter((item) => item.key !== key)
		setData(newData)
	}

	// Delete a column
	const deleteColumn = (columnIndex) => {
		// Remove the column header
		const newHeaders = columnHeaders.filter(
			(_, index) => index !== columnIndex
		)
		setColumnHeaders(newHeaders)

		// Remove the column data from each row
		const newData = data.map((row) => {
			const newRow = { ...row }
			delete newRow[columnIndex]

			// Reindex the columns after the deleted one
			for (let i = columnIndex + 1; i < columns; i++) {
				newRow[i - 1] = newRow[i]
				delete newRow[i]
			}

			return newRow
		})

		setData(newData)
		setColumns(columns - 1)
	}

	// Start editing header
	const editHeader = (index) => {
		headerForm.setFieldsValue({ header: columnHeaders[index] })
		setEditingHeader(index)
	}

	// Save header change
	const saveHeader = async (index) => {
		try {
			const values = await headerForm.validateFields()
			const newHeaders = [...columnHeaders]
			newHeaders[index] = values.header || `Column ${index + 1}`
			setColumnHeaders(newHeaders)
			setEditingHeader(-1)
		} catch (errInfo) {
			console.log('Validate Failed:', errInfo)
		}
	}

	// Cancel header editing
	const cancelHeaderEdit = () => {
		setEditingHeader(-1)
	}

	// Generate table columns dynamically
	const tableColumns = columnHeaders.map((header, index) => ({
		title: (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				{editingHeader === index ? (
					<Form
						form={headerForm}
						component={false}
						initialValues={{ header }}
					>
						<Form.Item name="header" style={{ margin: 0 }}>
							<Input
								autoFocus
								onPressEnter={() => saveHeader(index)}
								onBlur={() => saveHeader(index)}
							/>
						</Form.Item>
					</Form>
				) : (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							width: '100%',
						}}
					>
						<Text
							strong
							onClick={() => editHeader(index)}
							style={{ cursor: 'pointer', flexGrow: 1 }}
						>
							{header}
						</Text>
						<Space>
							<EditOutlined
								onClick={() => editHeader(index)}
								style={{ cursor: 'pointer', fontSize: '12px' }}
							/>
							{columns > 1 && (
								<Popconfirm
									title="Are you sure you want to delete this column?"
									onConfirm={() => deleteColumn(index)}
									okText="Yes"
									cancelText="Cancel"
								>
									<DeleteOutlined
										style={{
											cursor: 'pointer',
											fontSize: '12px',
											color: '#ff4d4f',
										}}
									/>
								</Popconfirm>
							)}
						</Space>
					</div>
				)}
			</div>
		),
		dataIndex: index,
		key: index,
		editable: true,
		render: (text, record) => (
			<div
				className="editable-cell-value-wrap"
				style={{ minHeight: '32px', padding: '5px 12px' }}
				onClick={() => !isEditing(record) && edit(record)}
			>
				{text !== undefined ? text : ''}
			</div>
		),
	}))

	// Add operations column
	const operationColumn = {
		title: 'Actions',
		dataIndex: 'operation',
		key: 'operation',
		width: 60,
		render: (_, record) =>
			record.key !== 'add_row' && (
				<Popconfirm
					title="Are you sure you want to delete this row?"
					onConfirm={() => deleteRow(record.key)}
					okText="Yes"
					cancelText="Cancel"
				>
					<Button
						type="text"
						icon={<DeleteOutlined />}
						danger
						style={{ padding: 0 }}
					/>
				</Popconfirm>
			),
	}

	// Add button column (placed at the end)
	const addButtonColumn = {
		title: '',
		dataIndex: 'add_column',
		key: 'add_column',
		width: 50,
		render: (_, record) =>
			record.key === 'add_row' && (
				<Button
					type="text"
					icon={<PlusOutlined />}
					onClick={addColumn}
					className="add-button"
					style={{
						width: '100%',
						height: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				/>
			),
	}

	// Final merged columns
	const mergedColumns = [
		...tableColumns,
		operationColumn,
		addButtonColumn,
	].map((col) => {
		if (!col.editable) {
			return col
		}
		return {
			...col,
			onCell: (record) => ({
				record,
				dataIndex: col.dataIndex,
				title: col.title,
				editing: isEditing(record),
				onPressEnter: () => save(record.key),
			}),
		}
	})

	// Create data for table including the "Add Row" button row
	const tableData = [
		...data,
		// Add row button as the last row
		{ key: 'add_row', isAddRow: true },
	]

	// Prepare data for export
	const prepareDataForExport = () => {
		// Create CSV string from data
		const csvData = [
			columnHeaders.slice(0, columns), // Headers as first row
			...data.map((row) => {
				// Convert row object to array in the correct order
				const rowArray = []
				for (let i = 0; i < columns; i++) {
					rowArray.push(row[i] || '')
				}
				return rowArray
			}),
		]

		// Convert to CSV string
		const csvContent = csvData.map((row) => row.join(',')).join('\n')

		// Create a Blob with the CSV data
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

		// Create a File object from the Blob
		const file = new File([blob], 'grid-data.csv', { type: 'text/csv' })

		return file
	}

	// Handle export button click
	const handleExportClick = () => {
		const file = prepareDataForExport()

		// Call the handleUploadFiles function with the generated file
		if (handleUploadFiles && typeof handleUploadFiles === 'function') {
			handleUploadFiles([file])
			message.success('Data processed successfully')
		} else {
			message.error(
				'Cannot process data. The handleUploadFiles function is not available.'
			)
		}
	}

	return (
		<Card
			title={<Title level={4}>Live Predict</Title>}
			bordered={true}
			style={{ width: '100%', marginTop: '12px' }}
			className="editable-grid-card"
			extra={
				<Tooltip title="Export and process data">
					<Button
						icon={<ThunderboltOutlined />}
						type="primary"
						onClick={handleExportClick}
						loading={uploading}
					>
						{uploading ? 'Predicting...' : 'Go'}
					</Button>
				</Tooltip>
			}
		>
			<Form form={form} component={false}>
				<Table
					components={{
						body: {
							cell: EditableCell,
						},
					}}
					bordered
					dataSource={tableData}
					columns={mergedColumns}
					rowClassName={(record) => {
						if (record.isAddRow) return 'add-row'
						return isEditing(record) ? 'editable-row' : ''
					}}
					pagination={false}
					scroll={{ x: 'max-content' }}
					size="middle"
					onRow={(record) => {
						if (record.isAddRow) {
							return {
								onClick: (e) => {
									// Prevent adding a new row when clicking on the add column button
									if (!e.target.closest('.add-button')) {
										addRow()
									}
								},
								style: {
									cursor: 'pointer',
									textAlign: 'center',
									background: '#fafafa',
									height: '40px',
								},
							}
						}
						return {
							onClick: (event) => {
								if (!isEditing(record) && !record.isAddRow) {
									edit(record)
								}
							},
						}
					}}
				/>
			</Form>

			<style jsx global>{`
				.add-row td {
					background: #fafafa;
					text-align: center;
					padding: 8px !important;
				}
				.add-row:hover td {
					background: #f0f0f0;
				}
				.add-row td:first-child {
					position: relative;
				}
				.add-row td:first-child:before {
					content: '+';
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%);
					font-size: 18px;
					color: #1890ff;
				}
				.editable-cell-value-wrap {
					cursor: pointer;
				}
				.editable-cell-value-wrap:hover {
					border: 1px solid #d9d9d9;
					border-radius: 4px;
					padding: 4px 11px;
				}
			`}</style>
		</Card>
	)
}

export default TextLiveInfer
