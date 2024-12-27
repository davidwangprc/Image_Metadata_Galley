import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { modelName } = await request.json()
    
    if (!modelName) {
      return NextResponse.json({
        success: false,
        error: '模型名称不能为空'
      }, { status: 400 })
    }

    // 检查模型是否存在
    let model = await prisma.model.findUnique({
      where: { name: modelName }
    })

    // 如果模型不存在，创建新模型
    if (!model) {
      model = await prisma.model.create({
        data: {
          name: modelName,
          baseModel: 'SDXL',  // 默认基础模型
          type: 'Checkpoint', // 默认类型
          category: 'auto-created', // 自动创建的分类
          description: '自动创建的模型记录'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: model
    })
  } catch (error: any) {
    console.error('Model check/create failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 