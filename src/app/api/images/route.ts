import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const modelName = searchParams.get('model')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const nsfw = searchParams.get('nsfw') === 'true'
  
  try {
    const where = {
      AND: [
        category ? { category } : {},
        tag ? { tags: { some: { name: tag } } } : {},
        modelName ? { modelName } : {},
        { nsfw }
      ]
    }

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        include: {
          tags: true,
          model: {
            select: {
              name: true,
              type: true,
              baseModel: true
            }
          },
          workflow: {
            select: {
              name: true,
              description: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.image.count({ where })
    ])
    
    const processedImages = images.map(image => ({
      ...image,
      path: image.path.replace(/^public\//, '')
    }));
    
    return NextResponse.json({
      images: processedImages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to load images' }, 
      { status: 500 }
    )
  }
}

// 添加一个测试函数
async function testDatabaseConnection() {
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
    
    return { success: true, count: testCount, sample: testImage };
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error };
  }
}

export async function POST(request: Request) {
  try {
    // 首先测试数据库连接
    const dbTest = await testDatabaseConnection();
    if (!dbTest.success) {
      return NextResponse.json({
        error: 'Database connection test failed',
        details: dbTest.error
      }, { status: 500 });
    }
    console.log('Database test passed:', dbTest);

    // 原有的 POST 逻辑...
    const rawData = await request.text();
    console.log('\n=== API Start ===');
    console.log('1. Raw request data:', rawData);
    
    // 2. 解析数据
    const data = JSON.parse(rawData);
    console.log('2. Parsed request data:', {
      path: data.path,
      name: data.name,
      category: data.category,
      // 其他字段...
    });

    // 3. 数据验证
    if (!data.path || !data.name || !data.category) {
      console.log('3. Validation failed:', { path: data.path, name: data.name, category: data.category });
      return NextResponse.json({
        error: 'Missing required fields',
        details: { path: data.path, name: data.name, category: data.category }
      }, { status: 400 });
    }
    console.log('3. Validation passed');

    // 4. 准备数据库数据
    const dbData = {
      path: data.path.replace(/^public\//, '').replace(/^blob:http:\/\/localhost:\d+\//, ''),
      name: data.name,
      category: data.category,
      prompt: data.prompt || '',
      negativePrompt: data.negativePrompt || null,
      modelName: data.modelName || null,
      loraNames: Array.isArray(data.loraNames) ? JSON.stringify(data.loraNames) : null,
      embeddings: data.embeddings || null,
      wildcardSets: data.wildcardSets || null,
      cfg: data.cfg ? parseFloat(data.cfg) : null,
      steps: data.steps ? parseInt(data.steps) : null,
      seed: data.seed ? BigInt(data.seed.toString().replace(/\D/g, '') || '0') : null,
      sampler: data.sampler || null,
      size: data.size || null,
      workflowId: null,
      nsfw: Boolean(data.nsfw)
    };

    console.log('4. Prepared database data:', {
      ...dbData,
      // BigInt 需要特殊处理才能打印
      seed: dbData.seed?.toString()
    });

    // 5. 执行数据库插入
    try {
      console.log('5. Attempting database insert...');
      
      // 如果提供了 modelName，先验证模型是否存在
      if (dbData.modelName) {
        const model = await prisma.model.findFirst({
          where: {
            name: dbData.modelName
          }
        });
        
        if (!model) {
          console.log('Model not found:', dbData.modelName);
          return NextResponse.json({
            error: 'Invalid model name',
            details: `Model "${dbData.modelName}" not found`
          }, { status: 400 });
        }
      }

      // 执行插入
      const result = await prisma.image.create({
        data: dbData,
        include: {
          model: true  // 包含关联的模型信息
        }
      });

      console.log('6. Database insert successful:', result);

      // 处理 BigInt 序列化
      const serializedResult = {
        ...result,
        seed: result.seed ? result.seed.toString() : null,  // 将 BigInt 转换为字符串
        id: result.id.toString(),  // 如果 ID 也是 BigInt 类型
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      };

      return NextResponse.json({
        success: true,
        data: serializedResult
      }, { status: 200 });

    } catch (dbError: any) {
      // 详细记录数据库错误
      console.error('Database error:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        name: dbError.name,
        stack: dbError.stack
      });

      // 根据错误类型返回不同的错误信息
      if (dbError.code === 'P2002') {
        return NextResponse.json({
          error: 'Duplicate entry',
          details: dbError.meta
        }, { status: 409 });
      }

      return NextResponse.json({
        error: 'Database operation failed',
        details: {
          message: dbError.message,
          code: dbError.code,
          meta: dbError.meta
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('API error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({
      error: 'API error',
      details: {
        message: error.message,
        name: error.name
      }
    }, { status: 500 });
  }
} 