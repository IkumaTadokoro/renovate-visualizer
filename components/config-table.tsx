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
  description?: string
}

interface ConfigTableProps {
  config: any
  schema?: any
}

export default function ConfigTable({ config, schema }: ConfigTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof ConfigProperty>("key")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // スキーマから説明文を取得する関数
  const getDescriptionFromSchema = (propPath: string): string => {
    if (!schema || !schema.properties) return "";
    
    const pathParts = propPath.split(".");
    const rootProp = pathParts[0];
    
    // ルートプロパティの説明を検索
    if (schema.properties[rootProp]) {
      if (pathParts.length === 1) {
        return schema.properties[rootProp].description || "";
      }
      
      // ネストされたプロパティの場合、再帰的に説明を検索
      // 注: このロジックはrenovateのスキーマ構造に依存しています
      if (schema.properties[rootProp].properties) {
        const nestedProp = pathParts[1];
        if (schema.properties[rootProp].properties[nestedProp]) {
          return schema.properties[rootProp].properties[nestedProp].description || "";
        }
      }
    }
    
    return "";
  };

  // Extract properties from config
  const properties = extractProperties(config)
  
  // プロパティに説明を追加
  const propertiesWithDescriptions = properties.map(prop => ({
    ...prop,
    description: getDescriptionFromSchema(prop.path)
  }));

  // パスに基づいて適切にソートするヘルパー関数
  const sortByPropertyPath = (props: ConfigProperty[]): ConfigProperty[] => {
    return [...props].sort((a, b) => {
      // パスをセグメントに分割する
      const aSegments = a.path.replace(/\[(\d+)\]/g, '.$1').split('.');
      const bSegments = b.path.replace(/\[(\d+)\]/g, '.$1').split('.');
      
      // 最短の長さを取得
      const minLength = Math.min(aSegments.length, bSegments.length);
      
      // セグメントごとに比較
      for (let i = 0; i < minLength; i++) {
        const aSegment = aSegments[i];
        const bSegment = bSegments[i];
        
        // 数値インデックスの場合は数値として比較
        if (/^\d+$/.test(aSegment) && /^\d+$/.test(bSegment)) {
          const aNum = Number.parseInt(aSegment, 10);
          const bNum = Number.parseInt(bSegment, 10);
          if (aNum !== bNum) {
            return aNum - bNum;
          }
        } else if (aSegment !== bSegment) {
          // 文字列の場合は辞書順で比較
          return aSegment.localeCompare(bSegment);
        }
      }
      
      // すべてのセグメントが一致する場合は短いパスを優先
      return aSegments.length - bSegments.length;
    });
  };

  // まずパスでソートした結果を取得
  const sortedByPath = sortByPropertyPath(propertiesWithDescriptions);

  // Filter properties based on search term
  const filteredProperties = sortedByPath.filter((prop) => {
    if (!searchTerm) return true

    const lowerSearchTerm = searchTerm.toLowerCase()
    return (
      prop.key.toLowerCase().includes(lowerSearchTerm) ||
      prop.path.toLowerCase().includes(lowerSearchTerm) ||
      String(prop.value).toLowerCase().includes(lowerSearchTerm) ||
      prop.type.toLowerCase().includes(lowerSearchTerm) ||
      prop.description.toLowerCase().includes(lowerSearchTerm)
    )
  })

  // ソート方向に基づいて結果を反転（必要な場合）
  const finalProperties = sortDirection === "asc" ? filteredProperties : [...filteredProperties].reverse();

  // Handle sort - パスベースのソートを維持しつつ、表示順序のみ反転
  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
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
                <button type="button" className="flex items-center space-x-1" onClick={handleSort}>
                  <span>Property</span>
                  {sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </TableHead>
              <TableHead className="w-[100px]">
                <span>Type</span>
              </TableHead>
              <TableHead>
                <span>Value</span>
              </TableHead>
              <TableHead>
                <span>Description</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {finalProperties.length > 0 ? (
              finalProperties.map((prop) => (
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
                  <TableCell>
                    {prop.description && <div className="text-sm text-muted-foreground">{prop.description}</div>}
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
    // まず配列自体を追加
    // それから各要素を順番に追加する（それぞれのインデックスごとにまとめる）
    for (let index = 0; index < obj.length; index++) {
      const item = obj[index];
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
    }
    return result
  }

  // Handle objects
  // オブジェクトの各プロパティをエントリーとして追加
  for (const [key, value] of Object.entries(obj)) {
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
  }

  return result
}

