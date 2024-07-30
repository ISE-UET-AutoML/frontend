import axios from 'axios';
import React, { Fragment, useReducer, useState } from 'react';
import * as projectAPI from 'src/api/project';

const Explain = (props) => {
	const [explainImageUrl, setExplainImageUrl] = useState('');

	const handleExplainSelectedImage = async (event) => {
        event.preventDefault();
        console.log("Executing");
        const item = event.target.elements.file.files[0];
        const jsonObject = {
            userEmail: "test-automl",
            projectName: "4-animal",
            runName: "ISE",
        }; // Replace with your actual JSON object
        const formData = new FormData();
        formData.append('image', item);
        formData.append('json', JSON.stringify(jsonObject));

        try {
            console.log('Fetching');
            const { data } = await axios.post(`${process.env.REACT_APP_EXPLAIN_URL}/image_classification/explain`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const base64_image_str = data.explain_image;
            const explain_image_str = `data:image/jpeg;base64,${base64_image_str}`;
            setExplainImageUrl(explain_image_str);
            console.log('Fetch sucessfully');

        } catch(err) {
            console.log(err);
        }

    }


	return <>
        <h1>Test</h1>
        <form onSubmit={handleExplainSelectedImage}>
            <input type="file" name="file" />
            <button type="submit">Submit</button>
        </form>
        <div>
            {explainImageUrl && (
                <img src={explainImageUrl} alt="Explain" className="rounded-md mt-4" />
            )}
        </div>
    </>
}

export default Explain;