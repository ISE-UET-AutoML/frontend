import axios from 'axios';
import React, { Fragment, useReducer, useState } from 'react';
import * as projectAPI from 'src/api/project';
import { fetchWithTimeout } from 'src/utils/timeout';

const Explain = (props) => {
	const [explainImageUrl, setExplainImageUrl] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState(null);

	const handleExplainSelectedImage = async (event) => {
        event.preventDefault();
        console.log("Executing");
        const item = event.target.elements.file.files[0];
        
        // TODO: fix hardcorded values
        const jsonObject = {
            userEmail: "test-automl",
            projectName: "4-animal",
            runName: "ISE",
        };
        const formData = new FormData();
        formData.append('image', item);
        formData.append('json', JSON.stringify(jsonObject));

        const url = `${process.env.REACT_APP_EXPLAIN_URL}/image_classification/explain`;

        const options = {
            method: 'POST',
            body: formData,
        };

        fetchWithTimeout(url, options, 60000)
            .then(data => {
                const base64_image_str = data.explain_image;
                const explain_image_str = `data:image/jpeg;base64,${base64_image_str}`;
                setExplainImageUrl(explain_image_str);
                console.log('Fetch successful');
            })
            .catch(error => {
                console.error('Fetch error:', error.message);
                // Handle timeout or other errors here
                if (error.message === 'Request timed out') {
                    console.log('The request took too long and was terminated.');
                }
            });
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedImageFile(file);
        setExplainImageUrl('');
    }


	return <>
        <form onSubmit={handleExplainSelectedImage}>
            <input type="file" name="file" onChange={handleFileChange}/>
            <button type="submit">Submit</button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
            {selectedImageFile && (
                <img
                    src={URL.createObjectURL(selectedImageFile)}
                    alt="Selected"
                    className="rounded-md"
                    style={{ width: '30%' }}
                />
            )}
            {explainImageUrl && (
                <img
                    src={explainImageUrl}
                    alt="Explain"
                    className="rounded-md"
                    style={{ width: '30%' }}
                />
            )}
        </div>
    </>
}

export default Explain;