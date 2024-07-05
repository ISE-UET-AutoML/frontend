import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PATHS } from 'src/constants/paths';
dayjs.extend(relativeTime);

function clsx(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function ProjectCard({ project, className }) {
    return (
        <>
            <div
                key={project._id}
                className={clsx(
                    'relative group rounded-xl bg-gray-50 shadow-md transition duration-300',
                    className
                )}
            >
                <div className="p-6">
                    <span
                        className={clsx(
                            'text-blue-700',
                            'bg-blue-50',
                            'rounded-full inline-flex p-3 ring-4 ring-white',
                            'transition duration-450',
                            'group-hover:rotate-45'
                        )}
                    >
                        <CubeTransparentIcon
                            className="h-20 w-20"
                            aria-hidden="true"
                        />
                    </span>
                </div>

                <div className="mt-5 bg-gray-100 group-hover:bg-blue-100 p-6 rounded-xl transition duration-300">
                    <div className="flex w-full justify-between items-center">
                        <h3 className="text-xl font-medium">
                            <a
                                href={
                                    project.uploaded
                                        ? `${PATHS.PROJECT_BUILD(project?._id)}&step=1`
                                        : PATHS.PROJECT_BUILD(project?._id)
                                }
                                className="focus:outline-none"
                            >
                                {/* Extend touch target to entire panel */}
                                <span
                                    className="absolute inset-0"
                                    aria-hidden="true"
                                />
                                {project?.name}
                            </a>
                        </h3>
                        {project.createdAt && (
                            <span>{dayjs(project.createdAt).fromNow()}</span>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        {project?.description}
                    </p>
                </div>
            </div>
        </>
    );
}
