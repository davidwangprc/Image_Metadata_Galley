import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 清理现有数据
  await prisma.tag.deleteMany()
  await prisma.image.deleteMany()
  await prisma.model.deleteMany()
  await prisma.lora.deleteMany()
  await prisma.workflow.deleteMany()
  await prisma.wildcard.deleteMany()

  // 创建一些标签
  const tags = await Promise.all([
    // 风格标签
    prisma.tag.create({ data: { name: 'anime', type: 'style' } }),
    prisma.tag.create({ data: { name: 'realistic', type: 'style' } }),
    // 角色标签
    prisma.tag.create({ data: { name: 'portrait', type: 'character' } }),
    prisma.tag.create({ data: { name: 'landscape', type: 'character' } }),
    // 艺术家标签
    prisma.tag.create({ data: { name: 'Van Gogh', type: 'artist' } }),
  ])

  // 创建基础模型
  const models = await Promise.all([
    prisma.model.create({
      data: {
        name: 'sd_xl_base_1.0',
        baseModel: 'SDXL',
        type: 'Checkpoint',
        version: '1.0',
        description: 'Stable Diffusion XL 基础模型',
        category: 'base',
        tags: { connect: [{ name: 'realistic' }] }
      }
    }),
    prisma.model.create({
      data: {
        name: 'animagine_xl_v3',
        baseModel: 'SDXL',
        type: 'Checkpoint',
        version: '3.0',
        description: '动漫风格模型',
        category: 'anime',
        tags: { connect: [{ name: 'anime' }] }
      }
    })
  ])

  // 创建 LoRA 模型
  const loras = await Promise.all([
    prisma.lora.create({
      data: {
        name: 'detail_tweaker_xl',
        type: 'Style',
        version: '1.0',
        description: '细节增强器',
        trigger: 'detail++',
        weight: 0.6,
        category: 'enhancement',
        tags: { connect: [{ name: 'realistic' }] }
      }
    }),
    prisma.lora.create({
      data: {
        name: 'lcm_lora_xl',
        type: 'Effect',
        description: 'LCM 加速器',
        weight: 1.0,
        category: 'utility',
        tags: { connect: [{ name: 'realistic' }] }
      }
    })
  ])

  // 创建工作流
  const workflows = await Promise.all([
    prisma.workflow.create({
      data: {
        name: 'portrait_workflow',
        description: '标准人像工作流',
        nodes: JSON.stringify({
          nodes: [
            { id: 'ksampler', inputs: { steps: 20, cfg: 7 } },
            { id: 'upscale', inputs: { scale: 2 } }
          ]
        }),
        category: 'portrait',
        tags: { connect: [{ name: 'portrait' }] }
      }
    }),
    prisma.workflow.create({
      data: {
        name: 'landscape_workflow',
        description: '风景图工作流',
        nodes: JSON.stringify({
          nodes: [
            { id: 'ksampler', inputs: { steps: 30, cfg: 8 } },
            { id: 'upscale', inputs: { scale: 1.5 } }
          ]
        }),
        category: 'landscape',
        tags: { connect: [{ name: 'landscape' }] }
      }
    })
  ])

  // 创建 Wildcard 集合
  const wildcards = await Promise.all([
    prisma.wildcard.create({
      data: {
        name: 'art_styles',
        type: 'Style',
        content: `oil painting
watercolor
pencil sketch
digital art`,
        description: '艺术风格集合',
        category: 'style',
        tags: { connect: [{ name: 'Van Gogh' }] }
      }
    }),
    prisma.wildcard.create({
      data: {
        name: 'camera_angles',
        type: 'Technical',
        content: `close-up shot
wide angle
bird's eye view
low angle`,
        description: '相机角度集合',
        category: 'technical',
        tags: { connect: [{ name: 'portrait' }] }
      }
    })
  ])

  // 创建一些示例图片
  const images = await Promise.all([
    prisma.image.create({
      data: {
        name: 'portrait_1',
        path: '/images/portrait_1.png',
        prompt: 'beautiful girl, detailed face, photorealistic',
        negativePrompt: 'bad quality, blurry',
        modelName: 'sd_xl_base_1.0',
        loraNames: JSON.stringify(['detail_tweaker_xl']),
        workflowId: workflows[0].id,
        wildcardSets: JSON.stringify(['camera_angles']),
        cfg: 7.0,
        steps: 20,
        seed: BigInt('1234567890'),
        sampler: 'euler_a',
        size: '1024x1024',
        category: 'portrait',
        tags: { connect: [{ name: 'portrait' }, { name: 'realistic' }] }
      }
    }),
    prisma.image.create({
      data: {
        name: 'anime_1',
        path: '/images/anime_1.png',
        prompt: 'anime girl, colorful background',
        modelName: 'animagine_xl_v3',
        cfg: 7.0,
        steps: 25,
        seed: BigInt('987654321'),
        sampler: 'euler_a',
        size: '1024x1024',
        category: 'anime',
        tags: { connect: [{ name: 'anime' }] }
      }
    })
  ])

  console.log('Database has been seeded. 🌱')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 