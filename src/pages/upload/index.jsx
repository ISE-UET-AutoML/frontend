import React from 'react';
import UploadFolder from 'src/components/UploadFolder';

const Upload = () => {
	// return (
	//   <div className="flex flex-col items-center h-full justify-center relative">
	//     <span className="absolute top-0 left-10 p-2 rounded-full bg-white hover:bg-gray-300">
	//       Back
	//     </span>
	//     <span className="absolute top-0 right-10 p-2 rounded-full bg-white hover:bg-gray-300">X</span>
	//     <h3 className="text-center w-full">Classified images upload</h3>
	//     <div className="container flex flex-col justify-around items-center mx-auto border border-dashed border-gray-300 p-10 rounded-md">
	//       <p>Drag and drop folders/images here, or click to select files</p>
	//       <div className="flex flex-row justify-evenly w-full">
	//         <div className="flex flex-col justify-center">
	//           <img
	//             src="https://dr23pab8nlq87.cloudfront.net/images/classified_instruction_1-3uNW.png"
	//             alt=""
	//             width={200}
	//           />
	//           <p className="text-center">Subtitle</p>
	//         </div>
	//         <div className="flex flex-col justify-center">
	//           <img
	//             src="https://dr23pab8nlq87.cloudfront.net/images/classified_instruction_1-3uNW.png"
	//             alt=""
	//             width={200}
	//           />
	//           <p className="text-center">Subtitle</p>
	//         </div>
	//       </div>
	//     </div>
	//   </div>
	// )
	return <UploadFolder projectID="63f39e3883848f340ef0587c" />;
};

export default Upload;
