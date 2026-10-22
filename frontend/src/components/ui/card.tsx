import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300", className)}>
    {children}
  </div>
)

const CardHeader = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("flex flex-col space-y-2 p-6", className)}>
    {children}
  </div>
)

const CardTitle = ({ className, children }: { className?: string; children: ReactNode }) => (
  <h3 className={cn("text-xl font-semibold leading-none tracking-tight text-gray-900", className)}>
    {children}
  </h3>
)

const CardDescription = ({ className, children }: { className?: string; children: ReactNode }) => (
  <p className={cn("text-sm text-gray-500", className)}>
    {children}
  </p>
)

const CardContent = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
)

const CardFooter = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("flex items-center p-6 pt-0", className)}>
    {children}
  </div>
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
