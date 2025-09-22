import { Outlet, useParams } from 'react-router-dom'
import ProjectSidebar from 'src/components/ProjectSidebar'
import { useTheme } from 'src/theme/ThemeProvider'

export default function ProjectLayout() {
	const params = useParams()
	const { theme } = useTheme()

	return (
		<>
			<style>{`
				body, html {
					background-color: var(--surface) !important;
					min-height: 100vh !important;
				}
				
				.project-main-content {
					background: var(--card-gradient);
					backdrop-filter: blur(10px);
					border: 1px solid var(--border);
					border-radius: 20px;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
				}
				
				.project-content-wrapper {
					background: transparent;
					min-height: calc(100dvh - 60px);
				}
				
				/* Glowing background shapes - only in dark mode */
				.project-bg-shapes.dark-mode::before {
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
				
				.project-bg-shapes.dark-mode::after {
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
			<div className={`project-bg-shapes ${theme === 'dark' ? 'dark-mode' : ''}`}>
				{/* Full-viewport background fill */}
				<div className="fixed inset-0 bg-[var(--surface)] -z-50" />
				<ProjectSidebar
					projectID={params.id}
					className="fixed h-[calc(100vh-60px)] w-[80px] top-[60px] z-50"
				/>
				<div className="mx-auto w-[calc(100%-80px)] pl-[60px] pt-12 ml-[80px] mr-4 flex-grow lg:flex mt-4 min-h-[calc(100dvh-60px)] overflow-hidden">
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
