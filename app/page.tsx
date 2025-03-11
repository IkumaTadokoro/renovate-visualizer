"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Check, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import SchemaVisualizer from "@/components/schema-visualizer"
import SchemaTable from "@/components/schema-table"
import CodeEditor from "@/components/code-editor"
import JSON5 from "json5"
import ConfigTable from "@/components/config-table"

function isJsonSchema(obj: Record<string, any>): boolean {
  if (obj && typeof obj === "object" && obj.$schema && typeof obj.$schema === "string" && 
      obj.$schema.includes("renovate-schema.json")) {
    return false;
  }
  
  return (
    obj &&
    typeof obj === "object" &&
    (obj.$schema || obj.properties || obj.type === "object" || obj.definitions || obj.$defs)
  )
}

export default function Home() {
  const [schema, setSchema] = useState<any>(null)
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<"json" | "json5">("json5")
  const [renovateSchema, setRenovateSchema] = useState<any>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(true)

  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    setError(null)

    try {
      if (value.trim()) {
        const parsedJson = mode === "json" ? JSON.parse(value) : JSON5.parse(value)
        setSchema(parsedJson)
      } else {
        setSchema(null)
      }
    } catch (err) {
      setError("Invalid JSON/JSON5: " + (err as Error).message)
      setSchema(null)
    }
  }

  const fetchSampleSchema = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://docs.renovatebot.com/renovate-schema.json")
      const data = await response.json()
      const formatted = JSON.stringify(data, null, 2)
      setJsonInput(formatted)
      setSchema(data)
      setRenovateSchema(data)
    } catch (err) {
      setError(`Failed to fetch sample schema: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadRenovateSchema = async () => {
    setMode("json")
    setLoading(true)
    try {
      fetch('/api/load-file?file=renovate-json-schema.json')
        .then(response => response.text())
        .then(text => {
          setJsonInput(text)
          try {
            const parsedJson = JSON.parse(text)
            setSchema(parsedJson)
            setRenovateSchema(parsedJson)
          } catch (parseErr) {
            setError(`Failed to parse Renovate schema: ${(parseErr as Error).message}`)
          }
          setLoading(false)
        })
        .catch(fetchErr => {
          setError(`Failed to load Renovate schema: ${(fetchErr as Error).message}`)
          setLoading(false)
        })
    } catch (err) {
      setError(`Failed to access Renovate schema: ${(err as Error).message}`)
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const loadInitialData = async () => {
      await loadRenovateSchema();
    };
    
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex flex-col min-h-screen p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold">JSON/JSON5 Schema Visualizer</h1>
        <p className="text-muted-foreground">
          Paste your JSON or JSON5 schema on the left and see the visualization on the right.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchSampleSchema} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load Sample Schema"
            )}
          </Button>
          <Button variant="outline" onClick={loadRenovateSchema}>
            Load Renovate Schema
          </Button>
          <Button variant="outline" onClick={copyToClipboard} disabled={!jsonInput}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy JSON
              </>
            )}
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={mode === "json" ? "default" : "ghost"}
              className="rounded-none"
              onClick={() => setMode("json")}
            >
              JSON
            </Button>
            <Button
              variant={mode === "json5" ? "default" : "ghost"}
              className="rounded-none"
              onClick={() => setMode("json5")}
            >
              JSON5
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
        <div 
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${isEditorOpen ? 'lg:w-[40%] w-full' : 'lg:w-0 w-0'}
          `}
        >
          <div className={`border rounded-lg overflow-hidden h-full ${!isEditorOpen && 'opacity-0'}`}>
            <div className="h-full flex flex-col">
              <div className="bg-muted p-2 border-b">
                <h2 className="font-medium">JSON Schema Input</h2>
              </div>
              <div className="flex-1 overflow-auto">
                <CodeEditor value={jsonInput} onChange={handleJsonChange} language={mode} />
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`
            flex-1 border rounded-lg overflow-hidden flex flex-col 
            transition-all duration-300 ease-in-out
          `}
        >
          <div className="bg-muted p-2 border-b flex justify-between items-center">
            <h2 className="font-medium">Visualization</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className="h-8 px-2"
            >
              {isEditorOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              <span className="ml-2 text-xs">{isEditorOpen ? "エディタを閉じる" : "エディタを開く"}</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {error ? (
              <div className="p-4 bg-red-50 text-red-500 rounded-md">{error}</div>
            ) : schema ? (
              <Tabs defaultValue={isJsonSchema(schema) ? "table" : "config"}>
                <TabsList className="mb-4">
                  {isJsonSchema(schema) ? (
                    <>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="tree">Tree View</TabsTrigger>
                      <TabsTrigger value="properties">Properties</TabsTrigger>
                    </>
                  ) : (
                    <TabsTrigger value="config">Config View</TabsTrigger>
                  )}
                </TabsList>

                {isJsonSchema(schema) ? (
                  <>
                    <TabsContent value="table" className="mt-0">
                      <SchemaTable schema={schema} />
                    </TabsContent>
                    <TabsContent value="tree" className="mt-0">
                      <SchemaVisualizer schema={schema} />
                    </TabsContent>
                    <TabsContent value="properties" className="mt-0">
                      <SchemaProperties schema={schema} />
                    </TabsContent>
                  </>
                ) : (
                  <TabsContent value="config" className="mt-0">
                    <ConfigTable config={schema} schema={renovateSchema} />
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Paste a JSON schema to see the visualization
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function SchemaProperties({ schema }: { schema: any }) {
  return (
    <div className="space-y-4">
      {schema.title && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Title</h3>
          <p>{schema.title}</p>
        </div>
      )}

      {schema.description && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Description</h3>
          <p>{schema.description}</p>
        </div>
      )}

      {schema.type && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Type</h3>
          <p>{Array.isArray(schema.type) ? schema.type.join(", ") : schema.type}</p>
        </div>
      )}

      {schema.$schema && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Schema</h3>
          <p>{schema.$schema}</p>
        </div>
      )}

      {schema.required && schema.required.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Required Properties</h3>
          <ul className="list-disc pl-5">
            {schema.required.map((prop: string) => (
              <li key={prop}>{prop}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

