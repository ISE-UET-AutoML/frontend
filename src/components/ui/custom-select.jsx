import * as React from "react"
import { cn } from "../../lib/utils"

// Simple chevron down icon
const ChevronDownIcon = ({ className, ...props }) => (
  <svg
    className={className}
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
)

const CustomSelect = React.forwardRef(({ 
  className, 
  value, 
  onChange, 
  placeholder, 
  children, 
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  const selectRef = React.useRef(null)
  const dropdownRef = React.useRef(null)

  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue)
    if (onChange) {
      onChange(optionValue)
    }
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (selectedValue === null || selectedValue === undefined) return placeholder || "Select an option"
    const option = React.Children.toArray(children).find(
      child => child.props.value === selectedValue
    )
    return option ? option.props.children : selectedValue
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        ref={selectRef}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border border-gray-700 bg-black/20 px-4 py-3 text-sm text-white cursor-pointer transition-all duration-200 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <span className={selectedValue !== null && selectedValue !== undefined ? "text-white" : "text-gray-400"}>
          {getDisplayText()}
        </span>
        <ChevronDownIcon 
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-black/90 border border-gray-700 rounded-xl shadow-2xl backdrop-blur-sm max-h-60 overflow-y-auto">
          {React.Children.map(children, (child) => (
            <div
              key={child.props.value}
              className={cn(
                "px-4 py-3 text-sm text-white cursor-pointer hover:bg-white/10 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl",
                selectedValue === child.props.value && "bg-blue-500/20 text-blue-300"
              )}
              onClick={() => handleSelect(child.props.value)}
            >
              {child.props.children}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

const Option = ({ value, children, ...props }) => {
  return <div value={value} {...props}>{children}</div>
}

CustomSelect.displayName = "CustomSelect"
Option.displayName = "Option"

export { CustomSelect, Option }
