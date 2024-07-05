import React, { forwardRef, useState } from 'react';
import { uploadFiles } from 'src/api/project';
import { UploadTypes } from 'src/constants/file';
import { validateFiles } from 'src/utils/file';

const UploadFolder = ({ projectID, uploadedImages }) => {
	const [files, setFiles] = useState([]);

	const handleImageChange = (e) => {
		if (e.target.files) {
			setFiles(e.target.files);
		}
	};

	// const renderPhotos = (source) => {
	//   return source.map((blobURL) => {
	//     return <img src={blobURL} alt="" key={blobURL} />
	//   })
	// }

	const uploadFolder = async (e) => {
		e.preventDefault();

		const validFiles = validateFiles(files);
		if (validFiles !== undefined && validFiles.length > 0) {
			const formData = new FormData();
			formData.append('type', UploadTypes.FOLDER);
			for (let i = 0; i < validFiles.length; i++) {
				// Convert file name with relative path to base64 string
				const fileNameBase64 = window.btoa(
					validFiles[i].webkitRelativePath
				);
				formData.append('files', validFiles[i], fileNameBase64);
			}

			try {
				const { data } = await uploadFiles(projectID, formData);
				uploadedImages(data.files, data.labels);
			} catch (error) {
				console.error(error);
			}
		}

		// TODO: validate folder structure
		// Nêú folder chỉ có toàn ảnh không có folder con thì hiển thị lỗi
	};

	const trainModel = () => {
		fetch(`${process.env.REACT_APP_ML_SERVICE_ADDR}/clf/train`, {
			method: 'POST',
		})
			.then((res) => res.json())
			.then((data) => console.log(data))
			.catch((err) => console.log(err));
	};

	return (
		<div className="flex justify-center items-center flex-col">
			<form encType="multipart/form-data">
				<input
					type="file"
					name="files"
					webkitdirectory="true"
					onChange={handleImageChange}
				/>
				<input
					type="submit"
					value="Upload"
					onClick={uploadFolder}
					className="cursor-pointer inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				/>
			</form>
		</div>
	);
};

export default UploadFolder;
