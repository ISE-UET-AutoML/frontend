import JSZip from 'jszip'
import axios from 'axios'

/**
 * Parse and validate files, remove duplicates, and rename them
 * @param {File[]} files - Array of File objects
 * @returns {Object} Object containing validFiles and labels
 */
const parseAndValidateFiles = (files) => {
	const validFiles = []
	const labels = []
	const idMap = new Map()

	// Step 1: Parse original names and analyze information
	for (let i = 0; i < files.length; i++) {
		const originalFileName = files[i].webkitRelativePath

		const parts = originalFileName.split('/')
		const label = parts[1]
		const fileName = parts[2] // e.g., dog_7.jpg
		const id = fileName

		if (!idMap.has(id)) {
			idMap.set(id, new Set())
		}
		idMap.get(id).add(label)

		// Store additional information for later use
		files[i]._parsed = { originalFileName, label, id }
	}

	// Step 2: Identify unique files and create new names
	const seenIds = new Set()

	for (let i = 0; i < files.length; i++) {
		const { label, id } = files[i]._parsed

		// Skip if the id has already been processed (remove duplicates)
		if (seenIds.has(id)) continue

		const labelSet = idMap.get(id)
		let newName = ''

		if (labelSet.size === 1) {
			newName = `${label}/${id}`
			labels.push(label)
		} else {
			const sortedLabels = Array.from(labelSet).sort()
			newName = `${sortedLabels.join('/')}/${id}`
			labels.push(sortedLabels.join('/'))
		}

		// Use the original File object and add _targetPath property for use during zipping
		files[i]._targetPath = newName

		validFiles.push(files[i])
		seenIds.add(id)
	}

	return validFiles
}

/**
 * Upload compressed files to S3 with optimized performance
 * @param {string} presignedUrl - Presigned URL for uploading
 * @param {File[]} files - Array of File objects
 */
const uploadZippedFilesToS3 = async (presignedUrl, files) => {
	const zip = new JSZip()

	// Add files to the zip
	for (const file of files) {
		const targetPath = file._targetPath || file.name
		zip.file(targetPath, file)
	}

	// Compress the files
	const zipBlob = await zip.generateAsync({
		type: 'blob',
		compression: 'DEFLATE',
		compressionOptions: { level: 6 },
		streamFiles: true,
	})

	console.log(`Compressed ${files.length} files into ${zipBlob.size} bytes`)

	// Upload to S3
	try {
		const response = await axios.put(presignedUrl, zipBlob, {
			headers: {
				'Content-Type': 'application/zip',
			},
			onUploadProgress: (progressEvent) => {
				const percentCompleted = Math.round(
					(progressEvent.loaded * 100) / progressEvent.total
				)
				console.log(`Upload progress: ${percentCompleted}%`)
			},
		})

		console.log('Upload successful:', response.status)
		return response
	} catch (error) {
		if (error.response) {
			console.error(
				'Error from S3:',
				error.response.status,
				error.response.data
			)
		} else if (error.request) {
			console.error('Network or CORS error:', error.message)
		} else {
			console.error('Unknown error:', error.message)
		}
		throw error
	}
}

async function uploadFilesToS3(presignedUrls, files) {
	const results = [];

	for (const file of files) {
		// Tìm URL tương ứng với file theo tên (hoặc theo key nếu có mapping rõ ràng hơn)
		const match = presignedUrls.find(p => p.key.endsWith(file.name));
		if (!match) {
			console.warn(`Không tìm thấy URL cho file ${file.name}`);
			continue;
		}

		try {
			const response = await axios.put(match.presignedUrl, file, {
				headers: {
					"Content-Type": file.type || "application/octet-stream",
				},
			});

			// Axios tự động throw error cho status codes >= 400, nên không cần kiểm tra response.ok
			results.push({
				fileName: file.name,
				s3Key: match.key,
				status: "success",
			});
		} catch (err) {
			console.error("Lỗi khi upload:", err);
			results.push({
				fileName: file.name,
				status: "error",
				error: err.message,
			});
		}
	}

	return results;
}
export { uploadZippedFilesToS3, parseAndValidateFiles, uploadFilesToS3 }