import { ALLOWED_FILE_EXTENSIONS } from 'src/constants/file';

const isAllowedExtension = (fileName) => {
	const idx = fileName.lastIndexOf('.');
	if (idx <= 0) {
		return false;
	}
	const ext = fileName.substring(idx + 1, fileName.length);
	return ALLOWED_FILE_EXTENSIONS.includes(ext);
};

const validateFiles = (files) => {
	const validFiles = [];
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		// Don't need to validate dot files (hidden files), just remove its
		if (file.name.startsWith('.')) {
			continue;
		}

		if (isAllowedExtension(file.name)) {
			validFiles.push(file);
		} else {
			alert(
				`We only accept image in JPEG/PNG/WEBP format, please remove ${file.name} from folder`
			);
			return;
		}
	}
	return validFiles;
};

export { validateFiles };
