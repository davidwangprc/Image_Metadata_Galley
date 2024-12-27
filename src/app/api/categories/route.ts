import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 获取分类及其图片数量
    const categories = await prisma.image.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });

    // 获取模型类型及其数量
    const modelTypes = await prisma.model.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      categories: categories.map(c => ({
        name: c.category,
        count: c._count.id
      })),
      modelTypes: modelTypes.map(m => ({
        type: m.type,
        count: m._count.id
      }))
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 