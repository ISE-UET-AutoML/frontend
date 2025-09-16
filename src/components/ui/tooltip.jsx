import * as React from "react"
import { cn } from "../../lib/utils"

const Tooltip = React.forwardRef(({ 
  className, 
  children, 
  title, 
  placement = "top",
  ...props 
}, ref) => {
  const [isVisible, setIsVisible] = React.useState(false)

  const handleMouseEnter = () => {
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const getTooltipClasses = () => {
    const baseClasses = "absolute z-[9999] px-3 py-2 text-sm text-white bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl pointer-events-none border border-gray-700 w-60"
    
    switch (placement) {
      case "top":
        return cn(baseClasses, "bottom-full left-1/2 transform -translate-x-1/2 mb-2")
      case "bottom":
        return cn(baseClasses, "top-full left-1/2 transform -translate-x-1/2 mt-2")
      case "left":
        return cn(baseClasses, "right-full top-1/2 transform -translate-y-1/2 mr-2")
      case "right":
        return cn(baseClasses, "left-full top-1/2 transform -translate-y-1/2 ml-2")
      default:
        return cn(baseClasses, "bottom-full left-1/2 transform -translate-x-1/2 mb-2")
    }
  }

  const getArrowClasses = () => {
    const baseClasses = "absolute w-2 h-2 bg-gray-900/95 transform rotate-45 border border-gray-700"
    
    switch (placement) {
      case "top":
        return cn(baseClasses, "top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2")
      case "bottom":
        return cn(baseClasses, "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2")
      case "left":
        return cn(baseClasses, "left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2")
      case "right":
        return cn(baseClasses, "right-full top-1/2 transform -translate-y-1/2 translate-x-1/2")
      default:
        return cn(baseClasses, "top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2")
    }
  }

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      {isVisible && title && (
        <div className={getTooltipClasses()}>
          {title}
          <div className={getArrowClasses()} />
        </div>
      )}
    </div>
  )
})
Tooltip.displayName = "Tooltip"

export { Tooltip }
