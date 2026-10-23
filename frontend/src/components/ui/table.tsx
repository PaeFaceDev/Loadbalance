import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const Table = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className="relative w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)}>
      {children}
    </table>
  </div>
)

const TableHeader = ({ className, children }: { className?: string; children: ReactNode }) => (
  <thead className={cn("[&_tr]:border-b", className)}>
    {children}
  </thead>
)

const TableBody = ({ className, children }: { className?: string; children: ReactNode }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)}>
    {children}
  </tbody>
)

const TableFooter = ({ className, children }: { className?: string; children: ReactNode }) => (
  <tfoot className={cn("border-t bg-gray-50/50 font-medium [&>tr]:last:border-b-0", className)}>
    {children}
  </tfoot>
)

function TableRow({
  className,
  children,
  ...props
}: React.ComponentProps<"tr">) {
  return (
    <tr
      className={className}
      {...props}
    >
      {children}
    </tr>
  );
}

const TableHead = ({ className, children }: { className?: string; children: ReactNode }) => (
  <th className={cn("h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0", className)}>
    {children}
  </th>
)

const TableCell = ({ className, children, colSpan }: { className?: string; children: ReactNode; colSpan?: number }) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} colSpan={colSpan}>
    {children}
  </td>
)

const TableCaption = ({ className, children }: { className?: string; children: ReactNode }) => (
  <caption className={cn("mt-4 text-sm text-gray-500", className)}>
    {children}
  </caption>
)

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
