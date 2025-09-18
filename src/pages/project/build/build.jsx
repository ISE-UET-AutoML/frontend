import { useEffect, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import * as projectAPI from 'src/api/project'
import BackgroundShapes from 'src/components/landing/BackgroundShapes'
import { useTheme } from 'src/theme/ThemeProvider'

export default function ProjectBuild() {
    const { id: projectID } = useParams()
    const { theme } = useTheme()
    const [projectInfo, setProjectInfo] = useState(null)
    const [data, setData] = useState({})

    useEffect(() => {
        const fetchProjectInfo = async () => {
            try {
                const response = await projectAPI.getProjectById(projectID)
                setProjectInfo(response.data.project)
            } catch (error) {
                console.error('Error fetching project:', error)
            }
        }

        fetchProjectInfo()
    }, [projectID])

    // Function to update data state
    function updateFields(fields) {
        setData((prev) => ({ ...prev, ...fields }))
    }

    return (
        <>
            <style>{`
                body, html {
                    font-family: 'Poppins', sans-serif !important;
                }
                * {
                    font-family: 'Poppins', sans-serif !important;
                }
            `}</style>
            <div className="min-h-screen relative font-poppins" style={{ background: 'var(--surface)' }}>
            {theme === 'dark' && (
                <BackgroundShapes 
                    width="1280px" 
                    height="1200px"
                    shapes={[
                        {
                            id: 'buildBlue',
                            shape: 'circle',
                            size: '480px',
                            gradient: { type: 'radial', shape: 'ellipse', colors: ['#5C8DFF 0%', '#5C8DFF 35%', 'transparent 50%'] },
                            opacity: 0.3,
                            blur: '200px',
                            position: { top: '200px', right: '-120px' },
                            transform: 'none'
                        },
                        {
                            id: 'buildCyan',
                            shape: 'rounded',
                            size: '380px',
                            gradient: { type: 'radial', shape: 'circle', colors: ['#40FFFF 0%', '#40FFFF 55%', 'transparent 10%'] },
                            opacity: 0.2,
                            blur: '160px',
                            position: { top: '50px', left: '-300px' },
                            transform: 'none'
                        },
                        {
                            id: 'buildWarm',
                            shape: 'rounded',
                            size: '450px',
                            gradient: { type: 'radial', shape: 'circle', colors: ['#FFAF40 0%', '#FFAF40 50%', 'transparent 100%'] },
                            opacity: 0.15,
                            blur: '180px',
                            position: { top: '700px', left: '50%' },
                            transform: 'translate(-50%, -50%)'
                        }
                    ]}
                />
            )}
            {/* Pass data and update function via Outlet context */}
            {projectInfo && (
                <div className="relative z-10">
                    <Outlet context={{ ...data, updateFields, projectInfo }} />
                </div>
            )}
            </div>
        </>
    )
}
