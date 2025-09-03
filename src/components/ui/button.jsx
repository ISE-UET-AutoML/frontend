import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * Gradient Animated Button Component
 * 
 * Features:
 * - Multiple gradient variants
 * - Smooth hover animations
 * - Size variants
 * - Consistent styling with ASTRAL brand
 */
const buttonVariants = {
  variant: {
    gradient: "bg-gradient-to-r from-[#5C8DFF] to-[#65FFA0] hover:from-[#74CAFF] hover:to-[#65FFA0] text-white",
    gradientOutline: "border-2 border-gray-400 text-gray-300 hover:text-white hover:border-white hover:bg-gray-600 bg-transparent",
    gradientReverse: "bg-gradient-to-r from-[#65FFA0] to-[#5C8DFF] hover:from-[#65FFA0] hover:to-[#74CAFF] text-white",
    gradientAnimated: "bg-gradient-to-r from-[#5C8DFF] via-[#65FFA0] to-[#5C8DFF] bg-[length:200%_100%] animate-gradient text-white",
    gradientHover: "text-white",
    outline: "border-2 border-current text-gray-300 hover:text-white hover:border-white bg-transparent",
    ghost: "text-gray-300 hover:text-white hover:bg-white/10",
  },
  size: {
    sm: "px-6 py-2 text-sm h-10",
    default: "px-8 py-3 text-lg h-12",
    lg: "px-10 py-4 text-xl h-14",
    hero: "px-8 py-3 text-lg h-12", // Special size for hero buttons
  }
}

const Button = React.forwardRef(({ 
  className, 
  variant = "gradient", 
  size = "default", 
  width,
  children,
  href,
  onClick,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 no-underline whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.gradient
  const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default
  
  const buttonClasses = cn(
    baseClasses,
    variantClasses,
    sizeClasses,
    className
  )

  // Special handling for gradientHover variant
  const buttonStyle = {
    fontFamily: 'Poppins, sans-serif',
    ...(width && { width }),
    ...(variant === 'gradientHover' && {
      background: 'linear-gradient(90deg, #5C8DFF 0%, #65FFA0 50%, #5C8DFF 100%)',
      backgroundSize: '200% 100%',
      backgroundPosition: '0% 50%',
      transition: 'background-position 0.3s ease',
    }),
  }

  // Hover handlers for gradientHover variant
  const handleMouseEnter = (e) => {
    if (variant === 'gradientHover') {
      e.target.style.backgroundPosition = '100% 50%'
    }
  }

  const handleMouseLeave = (e) => {
    if (variant === 'gradientHover') {
      e.target.style.backgroundPosition = '0% 50%'
    }
  }

  // If href is provided, render as anchor tag
  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={buttonClasses}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </a>
    )
  }

  // Otherwise render as button
  return (
    <button
      ref={ref}
      className={buttonClasses}
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }
