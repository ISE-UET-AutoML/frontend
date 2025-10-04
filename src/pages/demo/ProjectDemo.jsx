import { useOutletContext } from 'react-router-dom'
import ImageClassificationDemo from 'src/pages/demo/ImageClassificationDemo'

const ProjectDemo = () => {
	// const { projectInfo } = useOutletContext()
	// console.log(projectInfo)

	return (
		<div>
			<ImageClassificationDemo />
		</div>
	)
}

export default ProjectDemo
