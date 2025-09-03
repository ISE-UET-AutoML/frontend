import React from 'react'

/**
 * ContentContainer - Responsive container component
 * Option A: Content stays max-width, centered with side padding
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.maxWidth - Maximum width (default: 'max-w-8xl' = 1440px)
 * @param {boolean} props.centerContent - Whether to center content horizontally
 */
const ContentContainer = ({ 
	children, 
	className = '', 
	maxWidth = 'max-w-7xl',
	centerContent = false 
}) => {
	const containerClasses = [
		maxWidth,
		'mx-auto',
		'px-4 sm:px-6 lg:px-8',
		centerContent && 'text-center',
		className
	].filter(Boolean).join(' ')

	return (
		<div className={containerClasses}>
			{children}
		</div>
	)
}

export default ContentContainer
