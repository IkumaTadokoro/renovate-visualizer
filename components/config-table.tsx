"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Search, X } from "lucide-react"

interface ConfigProperty {
  key: string
  path: string
  value: any
  type: string
}

interface ConfigTableProps {
  config: any
}

export default function ConfigTable({ config }: ConfigTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof ConfigProperty>("key")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Extract properties from config
  const properties = extractProperties(config)

  // Filter properties based on search term
  const filteredProperties = properties.filter((prop) => {
    if (!searchTerm) return true

    const lowerSearchTerm = searchTerm.toLowerCase()
    return (
      prop.key.toLowerCase().includes(lowerSearchTerm) ||
      prop.path.toLowerCase().includes(lowerSearchTerm) ||
      String(prop.value).toLowerCase().includes(lowerSearchTerm) ||
      prop.type.toLowerCase().includes(lowerSearchTerm)
    )
  })

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle special cases for sorting
    if (sortField === "value") {
      aValue = typeof aValue === "object" ? JSON.stringify(aValue) : String(aValue)
      bValue = typeof bValue === "object" ? JSON.stringify(bValue) : String(bValue)
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Handle sort
  const handleSort = (field: keyof ConfigProperty) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Format value for display
  function formatValue(value: any): JSX.Element {
    if (value === undefined || value === null) {
      return <span className="text-muted-foreground">—</span>
    }

    if (typeof value === "boolean") {
      return <Badge variant={value ? "success" : "secondary"}>{value.toString()}</Badge>
    }

    if (typeof value === "number") {
      return <code className="bg-muted px-1 py-0.5 rounded text-xs">{value}</code>
    }

    if (typeof value === "string") {
      return <span className="font-mono text-xs">{`"${value}"`}</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground">[]</span>
      }

      return (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Array [{value.length}]</span>
          <div className="pl-2 border-l-2 border-muted space-y-1">
            {value.slice(0, 3).map((item, i) => (
              <div key={i} className="text-xs">
                {formatValue(item)}
              </div>
            ))}
            {value.length > 3 && <div className="text-xs text-muted-foreground">...and {value.length - 3} more</div>}
          </div>
        </div>
      )
    }

    if (typeof value === "object") {
      const keys = Object.keys(value)
      if (keys.length === 0) {
        return <span className="text-muted-foreground">{"{}"}</span>
      }

      return (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Object {`{${keys.length}}`}</span>
          <div className="pl-2 border-l-2 border-muted space-y-1">
            {keys.slice(0, 3).map((key) => (
              <div key={key} className="text-xs">
                <span className="font-medium">{key}:</span> {formatValue(value[key])}
              </div>
            ))}
            {keys.length > 3 && <div className="text-xs text-muted-foreground">...and {keys.length - 3} more</div>}
          </div>
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1.5 h-7 w-7 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredProperties.length} of {properties.length} properties
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <button className="flex items-center space-x-1" onClick={() => handleSort("key")}>
                  <span>Property</span>
                  {sortField === "key" &&
                    (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                </button>
              </TableHead>
              <TableHead className="w-[100px]">
                <button className="flex items-center space-x-1" onClick={() => handleSort("type")}>
                  <span>Type</span>
                  {sortField === "type" &&
                    (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center space-x-1" onClick={() => handleSort("value")}>
                  <span>Value</span>
                  {sortField === "value" &&
                    (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProperties.length > 0 ? (
              sortedProperties.map((prop) => (
                <TableRow key={prop.path}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-mono text-sm">{prop.key}</div>
                      {prop.path !== prop.key && <div className="text-xs text-muted-foreground">{prop.path}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {prop.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatValue(prop.value)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No properties found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Helper function to extract properties from config
function extractProperties(obj: any, parentPath = ""): ConfigProperty[] {
  const result: ConfigProperty[] = []

  if (!obj || typeof obj !== "object") {
    return result
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const path = parentPath ? `${parentPath}[${index}]` : `[${index}]`
      const key = `[${index}]`

      if (typeof item === "object" && item !== null) {
        // Add the array item itself
        result.push({
          key,
          path,
          value: item,
          type: Array.isArray(item) ? "array" : "object",
        })

        // Add nested properties
        result.push(...extractProperties(item, path))
      } else {
        result.push({
          key,
          path,
          value: item,
          type: typeof item,
        })
      }
    })
    return result
  }

  // Handle objects
  Object.entries(obj).forEach(([key, value]) => {
    const path = parentPath ? `${parentPath}.${key}` : key

    if (typeof value === "object" && value !== null) {
      // Add the property itself
      result.push({
        key,
        path,
        value,
        type: Array.isArray(value) ? "array" : "object",
      })

      // Add nested properties
      result.push(...extractProperties(value, path))
    } else {
      result.push({
        key,
        path,
        value,
        type: typeof value,
      })
    }
  })

  return result
}

