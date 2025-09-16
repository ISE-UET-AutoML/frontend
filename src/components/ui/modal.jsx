import * as React from "react"
import { cn } from "../../lib/utils"

const Modal = React.forwardRef(({ 
  className, 
  open, 
  onClose, 
  children, 
  title, 
  ...props 
}, ref) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className={cn(
          "relative z-50 w-full max-w-lg mx-4 bg-background border rounded-lg shadow-lg",
          className
        )}
        {...props}
      >
        {title && (
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
})
Modal.displayName = "Modal"

export { Modal }
