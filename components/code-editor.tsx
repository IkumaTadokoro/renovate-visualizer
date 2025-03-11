"use client"

import { useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { json } from "@codemirror/lang-json"
import { javascript } from "@codemirror/lang-javascript"
import { EditorState } from "@codemirror/state"
import { oneDark } from "@codemirror/theme-one-dark"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: "json" | "javascript" | "typescript" | "json5"
}

export default function CodeEditor({ value, onChange, language = "json" }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Clean up previous editor instance
    if (viewRef.current) {
      viewRef.current.destroy()
    }

    // Set up language support
    let languageSupport
    switch (language) {
      case "json":
        languageSupport = json()
        break
      case "json5":
        // Use JavaScript mode for JSON5 since it supports comments and more relaxed syntax
        languageSupport = javascript({ jsx: false, typescript: false })
        break
      case "javascript":
      case "typescript":
        languageSupport = javascript({ jsx: false, typescript: language === "typescript" })
        break
      default:
        languageSupport = json()
    }

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        languageSupport,
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily: "monospace",
          },
        }),
      ],
    })

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [language, onChange, value])

  // Update editor content when value prop changes
  useEffect(() => {
    const view = viewRef.current
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      })
    }
  }, [value])

  return <div ref={editorRef} className="h-full w-full" />
}

