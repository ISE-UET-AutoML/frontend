import * as React from "react"
import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  const handleChange = (e) => {
    if (onValueChange) {
      // Switch to the clicked value (no toggle, just switch)
      onValueChange(e.target.value)
    }
  }

  return (
    <div
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            children: React.Children.map(child.props.children, (grandChild) => {
              if (React.isValidElement(grandChild) && grandChild.type?.displayName === 'RadioGroupItem') {
                return React.cloneElement(grandChild, {
                  checked: value === grandChild.props.value,
                  onChange: handleChange,
                  groupValue: value
                })
              }
              return grandChild
            })
          })
        }
        return child
      })}
    </div>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, value, checked, groupValue, ...props }, ref) => {
  const isChecked = checked !== undefined ? checked : groupValue === value
  
  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          "aspect-square h-4 w-4 rounded-full border-2 border-gray-600 transition-all duration-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative flex items-center justify-center",
          isChecked && "border-blue-500 bg-blue-500",
          className
        )}
        ref={ref}
        {...props}
      >
        {isChecked && (
          <div className="w-2 h-2 rounded-full bg-white" />
        )}
      </div>
    </div>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
