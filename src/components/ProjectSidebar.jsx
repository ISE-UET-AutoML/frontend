import {
    BuildIcon,
    SettingIcon,
    ModelIcon,
    DeployIcon,
    TasksIcon,
} from 'src/components/icons'
import clsx from 'clsx'
import { PATHS } from 'src/constants/paths'
import { useLocation } from 'react-router-dom' // Assuming you're using react-router

const ProjectSidebar = ({ projectID, className }) => {
    const location = useLocation()

    const navigation = [
        {
            name: 'Build',
            href: PATHS.PROJECT_BUILD(projectID),
            icon: BuildIcon,
            current: location.pathname === PATHS.PROJECT_BUILD(projectID),
        },
        {
            name: 'Experiment',
            href: PATHS.PROJECT_EXPERIMENT(projectID),
            icon: TasksIcon,
            current: location.pathname === PATHS.PROJECT_EXPERIMENT(projectID),
        },
        {
            name: 'Model',
            href: PATHS.PROJECT_MODEL(projectID),
            icon: ModelIcon,
            current: location.pathname === PATHS.PROJECT_MODEL(projectID),
        },
        {
            name: 'Deploy',
            href: PATHS.PROJECT_DEPLOY(projectID),
            icon: DeployIcon,
            current: location.pathname === PATHS.PROJECT_DEPLOY(projectID),
        },
    ]

    return (
        <>
            <style>{`
                .project-sidebar {
                    background: linear-gradient(180deg, #0F2027 0%, #203A43 50%, #2C5364 100%);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }
                
                .sidebar-nav-item {
                    position: relative;
                    transition: all 0.3s ease;
                    border-radius: 12px;
                    margin: 4px 8px;
                    padding: 12px 8px;
                }
                
                .sidebar-nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateX(2px);
                }
                
                .sidebar-nav-item.active {
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(101, 255, 160, 0.2) 50%, rgba(255, 215, 0, 0.1) 100%);
                    border: 1px solid rgba(0, 212, 255, 0.4);
                    box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3);
                }
                
                .sidebar-nav-item.active::before {
                    content: '';
                    position: absolute;
                    left: -12px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 6px;
                    height: 32px;
                    background: linear-gradient(180deg, #00D4FF 0%, #65FFA0 50%, #FFD700 100%);
                    border-radius: 0 3px 3px 0;
                    box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
                }
                
                .sidebar-icon {
                    transition: all 0.3s ease;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                }
                
                .sidebar-nav-item:hover .sidebar-icon {
                    transform: scale(1.1);
                    filter: drop-shadow(0 4px 8px rgba(0, 212, 255, 0.4));
                }
                
                .sidebar-nav-item.active .sidebar-icon {
                    color: #00D4FF !important;
                    filter: drop-shadow(0 4px 8px rgba(0, 212, 255, 0.5));
                }
                
                .sidebar-text {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .sidebar-nav-item:hover .sidebar-text {
                    color: #00D4FF !important;
                }
                
                .sidebar-nav-item.active .sidebar-text {
                    color: #00D4FF !important;
                    font-weight: 600;
                }
                
                .sidebar-settings {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    margin-top: 16px;
                    padding-top: 16px;
                }
                
                .sidebar-settings:hover {
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateX(2px);
                }
                
                .sidebar-settings:hover .sidebar-icon {
                    color: #00D4FF !important;
                    transform: scale(1.1);
                }
                
                .sidebar-settings:hover .sidebar-text {
                    color: #00D4FF !important;
                }
                
                /* Custom scrollbar */
                .project-sidebar::-webkit-scrollbar {
                    width: 4px;
                }
                
                .project-sidebar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .project-sidebar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #00D4FF 0%, #65FFA0 50%, #FFD700 100%);
                    border-radius: 2px;
                }
                
                .project-sidebar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #FFD700 0%, #65FFA0 50%, #00D4FF 100%);
                }
            `}</style>
            <div className={clsx('duration-300 project-sidebar', className)}>
                <div className="h-[calc(100vh-60px)] flex flex-grow flex-col overflow-y-auto">
                    <div className="py-6 flex flex-grow flex-col justify-between">
                        <nav className="flex flex-col gap-2 px-2 pb-4">
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        'sidebar-nav-item',
                                        item.current ? 'active' : '',
                                        'group flex flex-col items-center justify-center text-sm font-medium'
                                    )}
                                >
                                    <item.icon
                                        className={clsx(
                                            'sidebar-icon',
                                            'mx-auto flex-shrink-0 rounded-xl w-10 h-10',
                                            'p-2 text-gray-400'
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span className="sidebar-text text-xs text-gray-400 mt-1">
                                        {item.name}
                                    </span>
                                </a>
                            ))}
                        </nav>
                        <a
                            href={PATHS.PROJECT_SETTINGS(projectID)}
                            className={clsx(
                                'sidebar-settings',
                                'group flex flex-col items-center text-sm font-medium px-2 py-3 rounded-lg transition-all duration-300'
                            )}
                        >
                            <SettingIcon
                                className={clsx(
                                    'sidebar-icon',
                                    'flex-shrink-0 rounded-xl w-10 h-10',
                                    'px-2 py-2 text-gray-400'
                                )}
                            />
                            <span className="sidebar-text text-xs text-gray-400 mt-1">Settings</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProjectSidebar
