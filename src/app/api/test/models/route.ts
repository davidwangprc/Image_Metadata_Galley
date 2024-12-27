import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing model query...');
    
    const models = await prisma.model.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        baseModel: true
      }
    });
    
    console.log('Available models:', models);
    
    return NextResponse.json({
      success: true,
      data: models
    });
  } catch (error: any) {
    console.error('Model query failed:', error);
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