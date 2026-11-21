import { cn } from "@/shared/lib/tailwind-cn"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded border font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-3 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
        secondary:
          "bg-muted text-foreground border border-border hover:bg-muted/80",
        ghost:
          "bg-transparent text-accent border border-transparent hover:bg-muted hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 text-base",
        xs: "h-7 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-7 text-lg",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      },
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
  asChild?: boolean
  render?: React.ReactElement | ((props: React.HTMLAttributes<HTMLElement>) => React.ReactElement)
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  render,
  ...props
}: ButtonProps) {
  const computedClass = cn(buttonVariants({ variant, size, className }))

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      className: cn(computedClass, (children.props as React.HTMLAttributes<HTMLElement>).className),
    })
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={computedClass}
      render={render}
      {...(props as ButtonPrimitive.Props)}
    >
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
