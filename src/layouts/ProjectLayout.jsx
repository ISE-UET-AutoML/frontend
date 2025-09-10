import { Outlet, useParams } from 'react-router-dom'
import ProjectSidebar from 'src/components/ProjectSidebar'

export default function ProjectLayout() {
	const params = useParams()

	return (
		<>
			<style>{`
				body, html {
					background-color: #01000A !important;
					min-height: 100vh !important;
				}
				
				.project-main-content {
					background: rgba(0, 0, 0, 0.4);
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 20px;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
				}
				
				.project-content-wrapper {
					background: transparent;
					min-height: calc(100vh - 80px);
				}
				
				/* Glowing background shapes */
				.project-bg-shapes::before {
					content: '';
					position: fixed;
					top: 20%;
					left: 10%;
					width: 300px;
					height: 300px;
					background: radial-gradient(circle, rgba(92, 141, 255, 0.1) 0%, transparent 70%);
					border-radius: 50%;
					animation: float 6s ease-in-out infinite;
					z-index: -1;
				}
				
				.project-bg-shapes::after {
					content: '';
					position: fixed;
					bottom: 20%;
					right: 10%;
					width: 200px;
					height: 200px;
					background: radial-gradient(circle, rgba(64, 255, 255, 0.1) 0%, transparent 70%);
					border-radius: 50%;
					animation: float 8s ease-in-out infinite reverse;
					z-index: -1;
				}
				
				@keyframes float {
					0%, 100% { transform: translateY(0px) rotate(0deg); }
					50% { transform: translateY(-20px) rotate(180deg); }
				}
			`}</style>
			<div className="project-bg-shapes">
				<ProjectSidebar
					projectID={params.id}
					className="fixed h-[calc(100vh-60px)] w-[80px] top-[60px] z-50"
				/>
				<div className="mx-auto w-[calc(100%-80px)] pt-12 ml-[80px] mr-4 flex-grow lg:flex mt-4 h-[calc(100vh-80px)]">
					{/* Left sidebar & main wrapper */}
					<div className="min-w-0 flex-1 w-max xl:flex rounded-md">
						<div className="project-main-content lg:min-w-0 lg:flex-1 project-content-wrapper">
							<Outlet className="outlet h-max" />
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
