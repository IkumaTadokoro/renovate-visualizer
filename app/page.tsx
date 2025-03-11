"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
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
      setError(`解析エラー: ${(err as Error).message}`)
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
        console.error('スキーマの読み込みに失敗しました:', err);
        // ユーザーにはエラーを表示しない（説明なしでも機能する）
      }
    };
    
    loadRenovateSchema();
  }, []);

  return (
    <main className="flex flex-col min-h-screen p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold">Renovate Visualizer</h1>
        <p className="text-muted-foreground">
          Renovate設定ファイルを貼り付けて視覚化します。JSON/JSON5形式を自動検出します。
        </p>
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
                <h2 className="font-medium">JSON/JSON5 入力</h2>
              </div>
              <div className="flex-1 overflow-auto">
                <CodeEditor value={jsonInput} onChange={handleJsonChange} language="json5" />
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
            <h2 className="font-medium">可視化結果</h2>
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
            ) : config ? (
              <ConfigTable config={config} schema={renovateSchema} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                JSONまたはJSON5形式のRenovate設定を入力してください
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

