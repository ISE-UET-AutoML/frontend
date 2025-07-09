import { ALLOWED_FILE_EXTENSIONS } from 'src/constants/file'
import { TASK_TYPES } from 'src/constants/types'

const isAllowedExtension = (fileName, allowedExtensions) => {
	const idx = fileName.lastIndexOf('.')
	if (idx <= 0) {
		return false
	}
	const ext = fileName.substring(idx + 1, fileName.length).toLowerCase()
	return allowedExtensions.includes(ext)
}

const validateFiles = (files, projectType) => {
	const projectInfo = TASK_TYPES[projectType]
	if (!projectInfo) {
		alert('Unsupported project type.')
		return []
	}

	const { allowedExtensions } = projectInfo
	const validFiles = []
	for (let i = 0; i < files.length; i++) {
		const file = files[i]
		// Don't need to validate dot files (hidden files), just remove its
		if (file.name.startsWith('.')) {
			continue
		}

		if (isAllowedExtension(file.name, allowedExtensions)) {
			validFiles.push(file)
		} else {
			alert(
				`We only accept ${allowedExtensions.join(', ').toUpperCase()} format, please remove ${file.name} from folder`
			)
			return []
		}
	}
	return validFiles
}

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

export { validateFiles, organizeFiles, createChunks }
