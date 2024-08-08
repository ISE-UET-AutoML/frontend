import React from 'react';

const ImagePreview = ({ file, index, handleRemoveFile }) => {
    return (
        <div key={index} className="rounded-md overflow-hidden relative group hover:opacity-100">
            <button
                className="absolute cursor-pointer right-2 top-2 bg-white flex justify-center items-center rounded-full h-[20px] w-[20px] opacity-0 group-hover:opacity-100"
                onClick={() => handleRemoveFile(index)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
            <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-[150px] w-full m-0 object-cover"
            />
        </div>
    );
};

export default ImagePreview;
