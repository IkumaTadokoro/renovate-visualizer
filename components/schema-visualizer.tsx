/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Info } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface SchemaVisualizerProps {
  schema: any
  path?: string
  depth?: number
  isNested?: boolean
}

export default function SchemaVisualizer({ schema, path = "", depth = 0, isNested = false }: SchemaVisualizerProps) {
  const [expanded, setExpanded] = useState(depth < 1)

  if (!schema) return null

  const schemaType = Array.isArray(schema.type) ? schema.type.join(" | ") : schema.type

  // Handle different schema types
  if (schema.properties) {
    return (
      <div className={`${isNested ? "ml-4 pl-4 border-l border-gray-200" : ""}`}>
        {path && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center text-sm font-medium hover:text-primary"
            >
              {expanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              {path}
            </button>

            {schemaType && (
              <Badge variant="outline" className="text-xs">
                {schemaType}
              </Badge>
            )}

            {schema.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{schema.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {expanded && (
          <div className="space-y-2">
            {Object.entries(schema.properties).map(([key, value]: [string, any]) => (
              <SchemaVisualizer key={key} schema={value} path={key} depth={depth + 1} isNested={true} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (schema.items && schema.type === "array") {
    return (
      <div className={`${isNested ? "ml-4 pl-4 border-l border-gray-200" : ""}`}>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-sm font-medium hover:text-primary"
          >
            {expanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            {path}
          </button>

          <Badge variant="outline" className="text-xs">
            array
          </Badge>

          {schema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{schema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {expanded && (
          <div className="ml-4 pl-4 border-l border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">items</span>
            </div>
            <SchemaVisualizer schema={schema.items} path="" depth={depth + 1} isNested={true} />
          </div>
        )}
      </div>
    )
  }

  if (schema.oneOf || schema.anyOf || schema.allOf) {
    const combinationType = schema.oneOf ? "oneOf" : schema.anyOf ? "anyOf" : "allOf"
    const items = schema[combinationType]

    return (
      <div className={`${isNested ? "ml-4 pl-4 border-l border-gray-200" : ""}`}>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-sm font-medium hover:text-primary"
          >
            {expanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            {path}
          </button>

          <Badge variant="outline" className="text-xs">
            {combinationType}
          </Badge>

          {schema.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{schema.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {expanded && (
          <Accordion type="multiple" className="w-full">
            {items.map((item: any, index: number) => (
              <AccordionItem key={index} value={`${combinationType}-${index}`}>
                <AccordionTrigger className="text-sm">
                  Option {index + 1}
                  {item.title && `: ${item.title}`}
                </AccordionTrigger>
                <AccordionContent>
                  <SchemaVisualizer schema={item} path="" depth={depth + 1} isNested={true} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    )
  }

  // Simple property
  return (
    <div className={`${isNested ? "ml-4 pl-4 border-l border-gray-200" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{path}</span>

        {schemaType && (
          <Badge variant="outline" className="text-xs">
            {schemaType}
          </Badge>
        )}

        {schema.enum && (
          <Badge variant="secondary" className="text-xs">
            enum
          </Badge>
        )}

        {schema.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{schema.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {schema.enum && expanded && (
        <div className="ml-4 pl-4 border-l border-gray-200 mb-2">
          <div className="text-sm text-muted-foreground">
            Possible values:
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 mt-1">
              {schema.enum.map((value: any, index: number) => (
                <Badge key={index} variant="outline" className="justify-start">
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {schema.default !== undefined && (
        <div className="ml-4 pl-4 border-l border-gray-200 text-sm text-muted-foreground">
          Default:{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">
            {typeof schema.default === "string" ? schema.default : JSON.stringify(schema.default)}
          </code>
        </div>
      )}
    </div>
  )
}

