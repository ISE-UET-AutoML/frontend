import React from 'react'

/**
 * GlowingLight - Creates glowing light effects for robot eyes, lightbulbs, etc.
 * 
 * Features:
 * - Pulsing opacity animation
 * - Customizable colors and gradients
 * - Adjustable size, blur, and position
 * - Configurable animation speed and opacity range
 */

const GlowingLight = ({ 
	// Basic properties
	size = '20px', 
	color = '#65FFA0', // Default green glow
	gradient = null, // Optional custom gradient
	
	// Positioning
	position = { top: '50%', left: '50%' },
	transform = 'translate(-50%, -50%)',
	zIndex = 10,
	
	// Glow effects
	blur = '15px',
	spread = '5px', // Box shadow spread
	
	// Animation properties
	animate = true,
	minOpacity = 0.3,
	maxOpacity = 1.0,
	animationDuration = '2s', // How long one pulse cycle takes
	animationDelay = '0s', // Stagger multiple lights
	
	// Shape
	shape = 'circle', // 'circle', 'rounded', 'square'
	
	// Additional props
	className = '',
	style = {}
}) => {
	// Generate background based on gradient or color (like BackgroundShapes)
	const generateBackground = () => {
		if (gradient) {
			if (gradient.type === 'radial') {
				return `radial-gradient(${gradient.shape || 'circle'}, ${gradient.colors.join(', ')})`
			} else if (gradient.type === 'linear') {
				return `linear-gradient(${gradient.direction || '45deg'}, ${gradient.colors.join(', ')})`
			}
		}
		// Same approach as BackgroundShapes - radial gradient with transparency
		return `radial-gradient(circle, ${color} 0%, transparent 70%)`
	}

	const lightStyles = {
		position: 'absolute',
		width: size,
		height: size,
		background: generateBackground(), // Use radial gradient like BackgroundShapes
		borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? '8px' : '0',
		filter: `blur(${blur})`, // Use CSS filter blur like BackgroundShapes
		top: position.top,
		left: position.left,
		right: position.right,
		bottom: position.bottom,
		transform: transform,
		zIndex: zIndex,
		pointerEvents: 'none',
		
		// Animation
		...(animate && {
			animation: `glowPulse ${animationDuration} ease-in-out infinite`,
			animationDelay: animationDelay,
		}),
		
		// Custom styles override
		...style
	}

	// Generate CSS custom properties for animation
	const cssVars = animate ? {
		'--min-opacity': minOpacity,
		'--max-opacity': maxOpacity,
	} : {}

	return (
		<>
			{/* CSS Animation Definition */}
			{animate && (
				<style jsx>{`
					@keyframes glowPulse {
						0%, 100% {
							opacity: var(--min-opacity, ${minOpacity});
							transform: ${transform} scale(1);
						}
						50% {
							opacity: var(--max-opacity, ${maxOpacity});
							transform: ${transform} scale(1.1);
						}
					}
				`}</style>
			)}
			
			{/* The glowing light */}
			<div 
				className={`glowing-light ${className}`}
				style={{ ...lightStyles, ...cssVars }}
			/>
		</>
	)
}

export default GlowingLight

/**
 * 🌟 USAGE EXAMPLES:
 * 
 * // Basic robot eye glow
 * <GlowingLight 
 *   position={{ top: '120px', left: '200px' }}
 *   color="#00FFFF"
 *   size="12px"
 * />
 * 
 * // Lightbulb with custom animation
 * <GlowingLight 
 *   position={{ top: '80px', left: '250px' }}
 *   color="#FFFF00"
 *   size="25px"
 *   minOpacity={0.2}
 *   maxOpacity={0.9}
 *   animationDuration="3s"
 *   blur="20px"
 * />
 * 
 * // Chest light with gradient
 * <GlowingLight 
 *   position={{ top: '300px', left: '220px' }}
 *   gradient={{
 *     type: 'radial',
 *     colors: ['#5C8DFF 0%', '#65FFA0 50%', 'transparent 80%']
 *   }}
 *   size="30px"
 *   animationDuration="4s"
 *   animationDelay="1s"
 * />
 * 
 * // Static glow (no animation)
 * <GlowingLight 
 *   position={{ top: '150px', right: '100px' }}
 *   color="#FF6B6B"
 *   animate={false}
 *   opacity={0.7}
 * />
 */
