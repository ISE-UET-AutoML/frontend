import {
    BuildIcon,
    SettingIcon,
    ModelIcon,
    DeployIcon,
    TasksIcon,
    InfoIcon
} from 'src/components/icons'
import clsx from 'clsx'
import { PATHS } from 'src/constants/paths'
import { NavLink } from 'react-router-dom' // ✅ use NavLink
import { useTheme } from 'src/theme/ThemeProvider'

const ProjectSidebar = ({ projectID, className }) => {
    const { theme } = useTheme()
    const navigation = [
        {
            name: 'Info',
            href: PATHS.PROJECT_INFO(projectID),
            icon: InfoIcon,
        },
        {
            name: 'Build',
            href: PATHS.PROJECT_BUILD(projectID),
            icon: BuildIcon,
        },
        {
            name: 'Experiment',
            href: PATHS.PROJECT_EXPERIMENT(projectID),
            icon: TasksIcon,
        },
        {
            name: 'Model',
            href: PATHS.PROJECT_MODEL(projectID),
            icon: ModelIcon,
        },
        {
            name: 'Deploy',
            href: PATHS.PROJECT_DEPLOY(projectID),
            icon: DeployIcon,
        },
    ]

    return (
        <>
            <style>{`
                .project-sidebar {
                    background: var(--card-gradient);
                    border-right: 1px solid var(--border);
                    backdrop-filter: blur(10px);
                    width: 120px;
                    position: fixed;
                    top: 60px; /* align below top navbar */
                    left: 0;
                    bottom: 0;
                    height: calc(100vh - 60px);
                    overflow: hidden; /* prevent sidebar scroll */
                }
                
                .sidebar-nav-item {
                    position: relative;
                    transition: all 0.3s ease;
                    border-radius: 16px;
                    margin: 6px 8px;
                    padding: 12px 8px;
                }
                
                .sidebar-nav-item:hover {
                    background: var(--hover-bg);
                    transform: translateX(2px);
                }
                
                .sidebar-nav-item.active {
                    background: var(--selection-bg);
                    border: 1px solid var(--accent-text);
                    box-shadow: 0 4px 16px var(--selection-bg);
                }
                
                .sidebar-nav-item.active::before {
                    content: '';
                    position: absolute;
                    left: -12px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 6px;
                    height: 32px;
                    background: var(--accent-gradient);
                    border-radius: 0 3px 3px 0;
                    box-shadow: 0 0 8px var(--accent-text);
                }
                
                .sidebar-icon {
                    transition: all 0.3s ease;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                    color: var(--secondary-text);
                }
                
                .sidebar-nav-item:hover .sidebar-icon {
                    transform: scale(1.1);
                    filter: drop-shadow(0 4px 8px var(--accent-text));
                    color: var(--accent-text) !important;
                }
                
                .sidebar-nav-item.active .sidebar-icon {
                    color: var(--accent-text) !important;
                    filter: drop-shadow(0 4px 8px var(--accent-text));
                }
                
                .sidebar-text {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    color: var(--secondary-text);
                }
                
                .sidebar-nav-item:hover .sidebar-text {
                    color: var(--accent-text) !important;
                }
                
                .sidebar-nav-item.active .sidebar-text {
                    color: var(--accent-text) !important;
                    font-weight: 600;
                }
                
                .sidebar-settings {
                    border-top: 1px solid var(--border);
                    margin-top: 16px;
                    padding-top: 16px;
                }
                
                .sidebar-settings:hover {
                    background: var(--hover-bg);
                    transform: translateX(2px);
                }
                
                .sidebar-settings:hover .sidebar-icon {
                    color: var(--accent-text) !important;
                    transform: scale(1.1);
                }
                
                .sidebar-settings:hover .sidebar-text {
                    color: var(--accent-text) !important;
                }
                
                /* Custom scrollbar */
                /* Remove custom scrollbar: sidebar is fixed and not scrollable */
             `}</style>
            <div className={clsx('duration-300 project-sidebar', className)}>
                <div className="h-full flex flex-grow flex-col">
                    <div className="py-6 flex flex-grow flex-col justify-between">
                        <nav className="flex flex-col gap-2 px-2 pb-4">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        clsx(
                                            'sidebar-nav-item',
                                            isActive && 'active', // ✅ NavLink auto-applies
                                            'group flex flex-col items-center justify-center text-sm font-medium'
                                        )
                                    }
                                >
                                    <item.icon
                                        className={clsx(
                                            'sidebar-icon',
                                            'mx-auto flex-shrink-0 rounded-xl w-10 h-10',
                                            'p-2'
                                        )}
                                    />
                                    <span className="sidebar-text text-xs mt-1">
                                        {item.name}
                                    </span>
                                </NavLink>
                            ))}
                        </nav>
                        <NavLink
                            to={PATHS.PROJECT_SETTINGS(projectID)}
                            className={({ isActive }) =>
                                clsx(
                                    'sidebar-settings',
                                    isActive && 'active', // ✅ gets same active class
                                    'group flex flex-col items-center text-sm font-medium px-2 py-3 rounded-lg transition-all duration-300'
                                )
                            }
                        >
                            <SettingIcon
                                className={clsx(
                                    'sidebar-icon',
                                    'flex-shrink-0 rounded-xl w-10 h-10',
                                    'px-2 py-2 text-gray-400'
                                )}
                            />
                            <span className="sidebar-text text-xs text-gray-400 mt-1">Settings</span>
                        </NavLink>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProjectSidebar
