import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const Badge = ({ className, children, variant = "default" }: { className?: string; children: ReactNode; variant?: "default" | "secondary" | "destructive" | "outline" }) => {
  const variants = {
    default: "bg-[#E6F2FF] text-[#0066CC]",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-800",
  }

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  )
}

export { Badge }
