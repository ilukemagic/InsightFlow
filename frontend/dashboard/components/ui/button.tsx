import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)]",
        destructive: "bg-[var(--color-error)] text-white shadow-sm hover:bg-[var(--color-error-hover)] focus-visible:ring-[var(--color-error)]",
        outline: "border border-[var(--color-border)] bg-transparent shadow-sm hover:bg-[var(--color-gray-50)] hover:text-[var(--color-text-primary)] focus-visible:ring-[var(--color-primary)]",
        secondary: "bg-[var(--color-gray-100)] text-[var(--color-text-primary)] shadow-sm hover:bg-[var(--color-gray-200)] focus-visible:ring-[var(--color-primary)]",
        ghost: "hover:bg-[var(--color-gray-100)] hover:text-[var(--color-text-primary)] focus-visible:ring-[var(--color-primary)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-primary)]",
        success: "bg-[var(--color-success)] text-white shadow-sm hover:bg-[var(--color-success-hover)] focus-visible:ring-[var(--color-success)]",
        warning: "bg-[var(--color-warning)] text-white shadow-sm hover:bg-[var(--color-warning-hover)] focus-visible:ring-[var(--color-warning)]",
        gradient: "gradient-primary text-white shadow-lg hover:shadow-xl focus-visible:ring-[var(--color-primary)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 