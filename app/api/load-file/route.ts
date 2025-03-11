import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file');
  
  if (!fileName) {
    return NextResponse.json({ error: 'ファイル名が指定されていません' }, { status: 400 });
  }
  
  // 許可するファイルの一覧
  const allowedFiles = [
    'renovate-json5-sample.json5',
    'renovate-json-schema.json'
  ];
  
  if (!allowedFiles.includes(fileName)) {
    return NextResponse.json({ error: '指定されたファイルは許可されていません' }, { status: 403 });
  }
  
  const filePath = path.join(process.cwd(), 'lib', fileName);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': fileName.endsWith('.json5') ? 'application/json5' : 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: `ファイルの読み込みに失敗しました: ${(error as Error).message}` }, { status: 500 });
  }
} 