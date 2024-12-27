import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { ImageData } from '@/lib/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase()
  const folder = searchParams.get('folder')
  
  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] })
  }

  try {
    // 如果指定了文件夹，只搜索该文件夹
    if (folder) {
      const folderPath = path.join(process.cwd(), 'public', folder)
      const files = await fs.readdir(folderPath)
      
      const images: ImageData[] = files
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
        .map(file => ({
          id: file,
          name: file.replace(/\.(jpg|jpeg|png)$/i, ''),
          src: `/${folder}/${file}`,
          type: path.extname(file).slice(1).toLowerCase()
        }))

      const results = images.filter(img => 
        img.name.toLowerCase().includes(query)
      )
      
      return NextResponse.json({ results })
    }
    
    // 如果没有指定文件夹，搜索所有文件夹
    const publicDir = path.join(process.cwd(), 'public')
    const folders = await fs.readdir(publicDir, { withFileTypes: true })
    
    const allImages = await Promise.all(
      folders
        .filter(entry => entry.isDirectory())
        .map(async folder => {
          const folderPath = path.join(publicDir, folder.name)
          const files = await fs.readdir(folderPath)
          
          return files
            .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
            .map(file => ({
              id: file,
              name: file.replace(/\.(jpg|jpeg|png)$/i, ''),
              src: `/${folder.name}/${file}`,
              type: path.extname(file).slice(1).toLowerCase()
            }))
        })
    )

    const results = allImages
      .flat()
      .filter(img => img.name.toLowerCase().includes(query))
    
    return NextResponse.json({ results })
    
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search images' }, 
      { status: 500 }
    )
  }
} 