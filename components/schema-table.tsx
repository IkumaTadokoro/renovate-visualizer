/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Search, X, ExternalLink, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SchemaProperty {
  name: string
  path: string
  type: string
  description: string
  default?: any
  enum?: any[]
  required: boolean
  deprecated?: boolean
}

interface SchemaTableProps {
  schema: any
}

export default function SchemaTable({ schema }: SchemaTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof SchemaProperty>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Extract properties from schema
  const properties = useMemo(() => {
    const result: SchemaProperty[] = []

    // Get required properties
    const requiredProps = schema.required || []

    // Extract properties from schema
    const extractProperties = (obj: any, parentPath = "", required: string[] = []) => {
      if (!obj || !obj.properties) return

      Object.entries(obj.properties).forEach(([key, value]: [string, any]) => {
        const path = parentPath ? `${parentPath}.${key}` : key
        const isRequired = required.includes(key)

        // Add property to result
        result.push({
          name: key,
          path,
          type: getType(value),
          description: value.description || "",
          default: value.default,
          enum: value.enum,
          required: isRequired,
          deprecated: value.deprecated || false,
        })

        // Extract nested properties if this is an object
        if (value.type === "object" && value.properties) {
          extractProperties(value, path, value.required || [])
        }

        // Extract properties from oneOf, anyOf, allOf
        if (value.oneOf || value.anyOf || value.allOf) {
          const schemas = value.oneOf || value.anyOf || value.allOf
          schemas.forEach((subSchema: any, index: number) => {
            if (subSchema.properties) {
              extractProperties(subSchema, `${path}[${index}]`, subSchema.required || [])
            }
          })
        }
      })
    }

    extractProperties(schema, "", requiredProps)
    return result
  }, [getType, schema])

  // Filter properties based on search term
  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties

    const lowerSearchTerm = searchTerm.toLowerCase()
    return properties.filter(
      (prop) =>
        prop.name.toLowerCase().includes(lowerSearchTerm) ||
        prop.path.toLowerCase().includes(lowerSearchTerm) ||
        prop.description.toLowerCase().includes(lowerSearchTerm) ||
        prop.type.toLowerCase().includes(lowerSearchTerm),
    )
  }, [properties, searchTerm])

  // Sort properties
  const sortedProperties = useMemo(() => {
    return [...filteredProperties].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle special cases for sorting
      if (sortField === "default" || sortField === "enum") {
        aValue = aValue ? JSON.stringify(aValue) : ""
        bValue = bValue ? JSON.stringify(bValue) : ""
      }

      if (aValue === undefined) aValue = ""
      if (bValue === undefined) bValue = ""

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredProperties, sortField, sortDirection])

  // Handle sort
  const handleSort = (field: keyof SchemaProperty) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Get type string from schema property
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function getType(prop: any): string {
    if (Array.isArray(prop.type)) {
      return prop.type.join(" | ")
    }

    if (prop.type === "array" && prop.items) {
      if (prop.items.type) {
        return `array<${getType(prop.items)}>`
      }
      return "array"
    }

    if (prop.enum) {
      return `enum (${prop.enum.length} values)`
    }

    if (prop.oneOf) {
      return `oneOf (${prop.oneOf.length} options)`
    }

    if (prop.anyOf) {
      return `anyOf (${prop.anyOf.length} options)`
    }

    if (prop.allOf) {
      return `allOf (${prop.allOf.length} schemas)`
    }

    return prop.type || "object"
  }

  // Format value for display
  function formatValue(value: any): string {
    if (value === undefined) return ""
    if (typeof value === "string") return value
    return JSON.stringify(value)
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
                <button className="flex items-center space-x-1" onClick={() => handleSort("name")}>
                  <span>Property</span>
                  {sortField === "name" &&
                    (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                </button>
              </TableHead>
              <TableHead className="w-[150px]">
                <button className="flex items-center space-x-1" onClick={() => handleSort("type")}>
                  <span>Type</span>
                  {sortField === "type" &&
                    (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center space-x-1" onClick={() => handleSort("description")}>
                  <span>Description</span>
                  {sortField === "description" &&
                    (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                </button>
              </TableHead>
              <TableHead className="w-[150px]">
                <button className="flex items-center space-x-1" onClick={() => handleSort("default")}>
                  <span>Default</span>
                  {sortField === "default" &&
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
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="font-mono text-sm">{prop.name}</div>
                        <div className="text-xs text-muted-foreground">{prop.path}</div>
                      </div>
                      <div className="flex space-x-1">
                        {prop.required && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="destructive" className="h-5 px-1">
                                  Required
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This property is required</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {prop.deprecated && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="h-5 px-1 border-yellow-500 text-yellow-500">
                                  Deprecated
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This property is deprecated</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {prop.type}
                    </Badge>
                    {prop.enum && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="font-semibold mb-1">Enum values:</div>
                            <div className="grid grid-cols-2 gap-1">
                              {prop.enum.map((value: any, i: number) => (
                                <Badge key={i} variant="outline" className="justify-start">
                                  {formatValue(value)}
                                </Badge>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell>
                    {prop.description ? (
                      <div className="text-sm">{prop.description}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">No description</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {prop.default !== undefined ? (
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">{formatValue(prop.default)}</code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No properties found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {schema.$schema && (
        <div className="flex items-center justify-end space-x-2 text-sm text-muted-foreground">
          <span>Schema:</span>
          <a
            href={schema.$schema}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-primary"
          >
            {schema.$schema}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}

