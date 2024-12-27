import { prisma } from '@/lib/prisma';
import { readImageMetadata, parseMetadata } from '@/lib/utils/metadata';
import fs from 'fs/promises';
import path from 'path';

async function processImage(id: string, imagePath: string) {
  try {
    // 读取文件
    const file = await fs.readFile(imagePath);
    const blob = new Blob([file], { type: 'image/png' });
    const imageFile = new File([blob], path.basename(imagePath), { type: 'image/png' });

    // 读取元数据
    const rawMetadata = await readImageMetadata(imageFile);
    if (!rawMetadata) {
      console.log(`No metadata found for: ${imagePath}`);
      return;
    }

    // 解析元数据
    const metadata = parseMetadata(rawMetadata);
    if (!metadata) {
      console.log(`Failed to parse metadata for: ${imagePath}`);
      return;
    }

    // 更新数据库
    await prisma.image.update({
      where: {
        id: id,
      },
      data: {
        prompt: metadata.prompt,
        negativePrompt: metadata.negativePrompt || null,
        modelName: metadata.modelName || null,
        loraNames: metadata.loraNames.length > 0 ? JSON.stringify(metadata.loraNames) : null,
        cfg: metadata.cfg ? Number(metadata.cfg) : null,
        steps: metadata.steps ? Number(metadata.steps) : null,
        seed: metadata.seed ? BigInt(metadata.seed.toString()) : null,
        sampler: metadata.sampler || null,
      },
    });

    console.log(`Updated metadata for: ${imagePath}`);
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error);
  }
}

async function main() {
  try {
    // 获取所有图片记录
    const images = await prisma.image.findMany({
      select: {
        id: true,
        path: true,
      },
    });

    console.log(`Found ${images.length} images in database`);

    // 处理每个图片
    for (const image of images) {
      const fullPath = path.join(process.cwd(), image.path);
      await processImage(image.id, fullPath);
    }

    console.log('Finished processing all images');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 