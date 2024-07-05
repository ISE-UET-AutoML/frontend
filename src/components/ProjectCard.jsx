import React from 'react';

const ProjectCard = () => {
	return (
		<div className="container flex flex-col justify-center items-center">
			<div className="rounded-t-[20px] object-fill overflow-hidden">
				<img
					src="https://d2j84zcwscxb12.cloudfront.net/landinglens-customer-data-production/6005852362758/6088040210433/dataset/22179/media/2023-02-12T16-59-52-678Z-daisy_2.jpeg?Expires=1678240938&Signature=RWpVmusGwp3TC93mh2pODOciIwqh-bsutC40fxidAaXR7mz2dBJ~ERThXv-dK4eakGdFl-BE3KVtW6NyTyBDR3uEhe3RHhDRYoUvwqNr7j~je~BuozpOY-6CZ4Ldkc~bIZL823D~BfNet03e7WgGu~4uAxUKUedoZ98uZfyK5qkBBQ7YdQiVUxX686jQMkUXkGrVEhtVfGGb-LNuCjfeS5n5vRqBl7LF25Ak-cF5LROQi2z5w6NGHYkqKEikp~fkeo0lndFMXHDTy0jIpG-C~cp2shHtQiLr1ia5deWJq0Kzj44JkFwCdaZFQpW1b-NkYHFd6~7VfSIdvVe1QHNaIw__&Key-Pair-Id=K39F6K5NFFQUE0"
					className="h-full w-full"
				/>
			</div>
			<div className="flex justify-between items-center w-full">
				<div className="w-full">
					<h4>Title</h4>
					<p>Subtitle</p>
				</div>
				<span>Icon</span>
			</div>
		</div>
	);
};

export default ProjectCard;
