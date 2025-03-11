/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PanelLeftClose, PanelLeftOpen, Microscope, Settings, FileJson, ExternalLink } from "lucide-react"
import CodeEditor from "@/components/code-editor"
import JSON5 from "json5"
import ConfigTable from "@/components/config-table"

export default function Home() {
  const [config, setConfig] = useState<any>(null)
  const [jsonInput, setJsonInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [renovateSchema, setRenovateSchema] = useState<any>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(true)

  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    setError(null)

    try {
      if (value.trim()) {
        let parsedJson;
        
        // JSON5とJSONを自動判定して解析
        try {
          // まずJSON5として解析を試みる
          parsedJson = JSON5.parse(value);
        } catch (json5Err) {
          try {
            // JSON5として失敗した場合、標準JSONとして解析を試みる
            parsedJson = JSON.parse(value);
          } catch (jsonErr) {
            // どちらも失敗した場合はエラーを表示
            throw new Error(`${(json5Err as Error).message} / ${(jsonErr as Error).message}`);
          }
        }
        
        setConfig(parsedJson)
      } else {
        setConfig(null)
      }
    } catch (err) {
      setError(`Parse Error: ${(err as Error).message}`)
      setConfig(null)
    }
  }

  // Renovateスキーマを初期ロードする
  useEffect(() => {
    const loadRenovateSchema = async () => {
      try {
        const response = await fetch('/api/load-file?file=renovate-json-schema.json');
        const text = await response.text();
        const parsedJson = JSON.parse(text);
        setRenovateSchema(parsedJson);
      } catch (err) {
        console.error('Failed to load schema:', err);
        // ユーザーにはエラーを表示しない（説明なしでも機能する）
      }
    };
    
    loadRenovateSchema();
  }, []);

  return (
    <main className="flex flex-col min-h-screen p-4 md:p-6 bg-zinc-900 text-zinc-100">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Microscope className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Renovate Config Inspector</h1>
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-zinc-200 hover:text-blue-400 hover:bg-zinc-700">
            <a href="https://docs.renovatebot.com/renovate-schema.json" className="text-sm">
              renovate-schema.json
            </a>
            <ExternalLink size="16" />
          </Button>
        </div>
        <p className="text-zinc-400">
          Check your Renovate configuration files.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
        <div 
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${isEditorOpen ? 'lg:w-[40%] w-full' : 'lg:w-0 w-0'}
          `}
        >
          <div className={`border border-zinc-700 rounded-lg overflow-hidden h-full ${!isEditorOpen && 'opacity-0'}`}>
            <div className="h-full flex flex-col">
              <div className="bg-zinc-800 p-2 py-3 border-b border-zinc-700">
              <div className="ml-2 flex gap-2 items-center">
                <FileJson size={16} />
                <h2 className="font-medium">JSON/JSON5 Input</h2>
            </div>

              </div>
              <div className="flex-1 overflow-auto bg-zinc-900">
                <CodeEditor value={jsonInput} onChange={handleJsonChange} language="json5" />
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`
            flex-1 border border-zinc-700 rounded-lg overflow-hidden flex flex-col 
            transition-all duration-300 ease-in-out bg-zinc-800
          `}
        >
          <div className="bg-zinc-800 p-2 border-b border-zinc-700 flex justify-between items-center">
            <div className="ml-2 flex gap-2 items-center">
              <Settings size={16} />
              <h2 className="font-medium">Configs</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className="h-8 px-2 text-zinc-200 hover:text-blue-400 hover:bg-zinc-700"
            >
              {isEditorOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              <span className="ml-2 text-xs">{isEditorOpen ? "Hide Editor" : "Show Editor"}</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-zinc-900">
            {error ? (
              <div className="p-4 bg-red-900/20 text-red-400 border border-red-800 rounded-md">{error}</div>
            ) : config ? (
              <ConfigTable config={config} schema={renovateSchema} />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Paste a Renovate configuration in JSON or JSON5 format to visualize
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}


