import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    const entries = await fs.readdir(publicDir, { withFileTypes: true })
    
    const folders = entries
      .filter(entry => entry.isDirectory())
      .map(dir => dir.name)
    
    return NextResponse.json(folders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load folders' }, { status: 500 })
  }
} 