"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ChevronDown, Sparkles } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  initialSorting?: SortingState
  actionButton?: React.ReactNode
  
  enableAiSearch?: boolean
  isAiMode?: boolean
  onAiToggle?: (enabled: boolean) => void
  onAiSearchSubmit?: (query: string) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialSorting = [],
  actionButton,
  enableAiSearch = false,
  isAiMode = false,
  onAiToggle,
  onAiSearchSubmit
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [aiSearchText, setAiSearchText] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter: isAiMode ? "" : globalFilter,
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between"> 
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Input
            placeholder={isAiMode ? "Ask AI to find gear..." : "Search all items..."}
            value={isAiMode ? aiSearchText : (globalFilter ?? "")}
            onChange={(event) => {
              if (isAiMode) {
                setAiSearchText(event.target.value)
              } else {
                setGlobalFilter(event.target.value)
              }
            }}
            onKeyDown={(e) => {
              if (isAiMode && e.key === 'Enter' && onAiSearchSubmit) {
                onAiSearchSubmit(aiSearchText)
              }
            }}
            className={`flex-1 transition-all ${isAiMode ? 'border-purple-500 focus-visible:ring-purple-500 bg-purple-500/5' : ''}`}
          />
          {enableAiSearch && (
            <Button 
              variant={isAiMode ? "default" : "outline"} 
              onClick={() => {
                onAiToggle?.(!isAiMode)
              }}
              className={isAiMode ? "bg-purple-600 hover:bg-purple-700" : ""}
              title="Toggle AI Semantic Search"
            >
              <Sparkles className="h-4 w-4" />
              AI MODE
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 ml-auto">            
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                }
              />
              {actionButton}
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} items
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}