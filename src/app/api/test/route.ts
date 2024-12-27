import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // 1. 测试数据库连接
    const testCount = await prisma.image.count();
    console.log('Database connection successful. Total images:', testCount);
    
    // 2. 测试读取一条记录
    const testImage = await prisma.image.findFirst({
      include: {
        tags: true,
        model: true,
        workflow: true
      }
    });
    console.log('Sample image record:', testImage);
    
    return NextResponse.json({
      success: true,
      data: {
        totalImages: testCount,
        sampleImage: testImage
      }
    });
  } catch (error: any) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        name: error.name,
        code: error?.code,
        meta: error?.meta
      }
    }, { status: 500 });
  }
} 