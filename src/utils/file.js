import { ALLOWED_FILE_EXTENSIONS } from 'src/constants/file'
import { TASK_TYPES } from 'src/constants/types'
import Papa from 'papaparse';

const isAllowedExtension = (fileName, allowedExtensions) => {
	const idx = fileName.lastIndexOf('.')
	if (idx <= 0) {
		return false
	}
	const ext = fileName.substring(idx + 1, fileName.length).toLowerCase()
	return allowedExtensions.includes(ext)
}

const validateFiles = (files, datasetType) => {
	// Chỉ dựa vào phần đuôi file thay vì MIME type vì trình duyệt đôi khi đặt CSV là
	// 'application/vnd.ms-excel' hoặc để trống.
	const allowedExtensionsByType = {
		IMAGE: ['jpg', 'jpeg', 'png', 'webp'],
		TEXT: ['csv'],
		TABULAR: ['csv'],
		MULTIMODAL: ['jpg', 'jpeg', 'png', 'webp', 'csv'],
	};

	const allowedExts = allowedExtensionsByType[datasetType] || [];
	return files.filter((file) => {
		const filePath = file.webkitRelativePath || file.name || '';
		return isAllowedExtension(filePath, allowedExts);
	});
};

const organizeFiles = (files) => {
	const fileMap = new Map();

	files.forEach((file) => {
		const pathParts = file.path.split('/');

		if (pathParts.length >= 3) {
			// Ex: path = 'train/dog/dog_10.jpg' → label = 'dog'
			const label = pathParts[pathParts.length - 2];

			if (!fileMap.has(label)) {
				fileMap.set(label, []);
			}
			fileMap.get(label).push({
				path: file.path,
				label,
				fileObject: file.fileObject,
				boundingBox: file.boundingBox,
			});
		} else {
			// Ex: path = 'train/dog_10.jpg' OR 'dog_10.jpg' → unlabeled
			if (!fileMap.has('unlabeled')) {
				fileMap.set('unlabeled', []);
			}
			fileMap.get('unlabeled').push({
				path: file.path,
				label: null,
				fileObject: file.fileObject,
				boundingBox: file.boundingBox,
			});
		}
	});
	return fileMap;
};


const createChunks = (fileMap, chunkSize) => {
	const chunks = [];

	for (const [label, files] of fileMap.entries()) {
		for (let i = 0; i < files.length; i += chunkSize) {
			const chunkFiles = files.slice(i, i + chunkSize);
			const chunkIndex = Math.floor(i / chunkSize);

			// Updated naming logic for unlabeled data
			const chunkName = label === 'unlabeled'
				? `chunk_unlabel_${chunkIndex}.zip`
				: `chunk_${label}_${chunkIndex}.zip`;

			chunks.push({
				name: chunkName,
				files: chunkFiles,
				label: label === 'unlabeled' ? null : label,
			});
		}
	}

	return chunks;
};

const extractCSVMetaData = async (file) => {
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: function (results) {
				const rows = results.data;
				if (rows.length === 0) return resolve({ rowCount: 0, columnCount: 0, columns: {} });

				const columns = {};
				Object.keys(rows[0]).forEach((col) => {
					const uniqueValues = new Set();
					rows.forEach((row) => {
						if (row[col] !== '') uniqueValues.add(row[col]);
					});
					columns[col] = {
						unique_class_count: uniqueValues.size,
					};
				});

				resolve({
					rowCount: rows.length,
					columnCount: Object.keys(rows[0]).length,
					columns,
				});
			},
			error: function (error) {
				reject(error);
			},
		});
	});
};

export { validateFiles, organizeFiles, createChunks, extractCSVMetaData }
