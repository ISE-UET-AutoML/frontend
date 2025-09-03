import React from 'react'

/**
 * BackgroundShapes - Manages glowing abstract shapes behind content
 * Easy to add new shapes and edit their positions like in Figma
 */

// Individual shape component
const GlowingShape = ({ 
	shape, 
	size = '200px', 
	gradient = null, // New: custom gradient support
	color = '#5C8DFF', // Fallback for simple color
	opacity = 0.3, 
	blur = '100px',
	position = { top: '50%', left: '50%' },
	transform = 'translate(-50%, -50%)',
	zIndex = -10,
	rotation = 0 // New: rotation support
}) => {
	// Generate background based on gradient or color
	const generateBackground = () => {
		if (gradient) {
			// Custom gradient support
			if (gradient.type === 'radial') {
				return `radial-gradient(${gradient.shape || 'circle'}, ${gradient.colors.join(', ')})`
			} else if (gradient.type === 'linear') {
				return `linear-gradient(${gradient.direction || '45deg'}, ${gradient.colors.join(', ')})`
			} else if (gradient.type === 'conic') {
				return `conic-gradient(from ${gradient.angle || '0deg'}, ${gradient.colors.join(', ')})`
			}
		}
		// Fallback to simple radial gradient
		return `radial-gradient(circle, ${color} 0%, transparent 70%)`
	}

	const shapeStyles = {
		position: 'absolute',
		width: size,
		height: size,
		background: generateBackground(),
		borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? '20px' : '0',
		opacity: opacity,
		filter: `blur(${blur})`,
		top: position.top,
		left: position.left,
		right: position.right,
		bottom: position.bottom,
		transform: `${transform} rotate(${rotation}deg)`,
		zIndex: zIndex,
		pointerEvents: 'none' // Don't interfere with interactions
	}

	return <div style={shapeStyles} />
}

// Main component with predefined shapes (easy to modify)
const BackgroundShapes = () => {
	// Array of shapes - Your custom colors: FFAF40, 5970FF, 40FFFF
	const shapes = [
		// BOX 1: Yellow/Orange (#FFAF40)
		{
			id: 'yellowBox',
			shape: 'rounded', // 'circle', 'rounded', 'square'
			size: '600px', // Adjust: '200px', '300px', '500px', etc.
			gradient: {
				type: 'radial',
				shape: 'circle',
				colors: ['#FFAF40 0%', '#FFAF40 50%', 'transparent 80%']
			},
			opacity: 0.55, // Restored subtle effect
			blur: '250px', // Restored soft blur
			position: { top: '550px', left: '-350px' }, // Fixed relative to content
			transform: 'none'
			
		},
		
		// BOX 2: Purple/Blue (#5970FF)
		{
			id: 'purpleBox',
			shape: 'circle', // 'circle', 'rounded', 'square'
			size: '500px', // Adjust: '200px', '300px', '500px', etc.
			gradient: {
				type: 'radial',
				shape: 'ellipse',
				colors: ['#5970FF 0%', '#5970FF 40%', 'transparent 70%']
			},
			opacity: 0.8, // Restored subtle effect
			blur: '200px', // Restored soft blur
			position: { top: '350px', right: '-150px' }, // Fixed relative to content
			transform: 'none'
		},
		
		// BOX 3: Cyan (#40FFFF)
		{
			id: 'cyanBox',
			shape: 'rounded', // 'circle', 'rounded', 'square'
			size: '350px', // Adjust: '200px', '300px', '500px', etc.
			gradient: {
				type: 'radial',
				shape: 'circle',
				colors: ['#40FFFF 0%', '#40FFFF 60%', 'transparent 85%']
			},
			opacity: 0.35, // Restored subtle effect
			blur: '150px', // Restored soft blur
			position: { top: '-150px', left: '0px' }, // Fixed relative to content
			transform: 'none'
		},

		{
			id: 'pinkBox',
			shape: 'rounded', // 'circle', 'rounded', 'square'
			size: '600px', // Adjust: '200px', '300px', '500px', etc.
			gradient: {
				type: 'radial',
				shape: 'circle',
				colors: ['#FFAF40 0%', '#DE64BF 60%', 'transparent 85%']
			},
			opacity: 0.35, // Restored subtle effect
			blur: '200px', // Restored soft blur
			position: { top: '1500px', right: '-350px' }, // Fixed relative to content
			transform: 'none'
		}
	]

	return (
		<div 
			className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none" 
			style={{ 
				zIndex: 1,
				width: '1280px', // Same as max-w-7xl content width
				height: '800px', // Fixed content-relative height
				overflow: 'visible'
			}}
		>
			{shapes.map((shapeProps) => (
				<GlowingShape key={shapeProps.id} {...shapeProps} />
			))}
		</div>
	)
}

export default BackgroundShapes

/*
🎯 HOW TO ADJUST YOUR THREE BOXES:

1. 📏 SIZE - Make boxes bigger/smaller:
   size: '200px'  // Small
   size: '400px'  // Medium  
   size: '600px'  // Large
   size: '800px'  // Extra Large

2. 🌫️ BLUR - Control softness:
   blur: '50px'   // Sharp edges
   blur: '120px'  // Medium blur
   blur: '200px'  // Soft
   blur: '300px'  // Very soft/dreamy

3. 💫 OPACITY - Control intensity:
   opacity: 0.1   // Very subtle
   opacity: 0.3   // Medium
   opacity: 0.5   // Strong
   opacity: 0.8   // Very strong

4. 📍 POSITION - Move boxes around (using viewport units for consistency):
   // Top-left area
   position: { top: '15vh', left: '10vw' }
   
   // Top-right area  
   position: { top: '15vh', right: '10vw' }
   
   // Bottom-left area
   position: { bottom: '10vh', left: '10vw' }
   
   // Bottom-right area
   position: { bottom: '10vh', right: '10vw' }
   
   // Center (approximate)
   position: { top: '40vh', left: '40vw' }
   
   // vh = viewport height (1vh = 1% of screen height)
   // vw = viewport width (1vw = 1% of screen width)

5. 🎨 SHAPE OPTIONS:
   shape: 'circle'   // Perfect circle
   shape: 'rounded'  // Rounded rectangle
   shape: 'square'   // Sharp corners

📝 QUICK EXAMPLE - Make yellowBox bigger and more blurred:

{
  id: 'yellowBox',
  size: '600px',        // ← Changed from 400px
  blur: '250px',        // ← Changed from 150px  
  opacity: 0.5,         // ← Changed from 0.3
  position: { top: '20%', left: '15%' },
  // ... other properties stay same
}

🔄 REAL-TIME EDITING:
Just change the values in the shapes array above and save the file!
Your changes will appear immediately on the page.
*/
