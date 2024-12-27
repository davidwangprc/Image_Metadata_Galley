import { prisma } from '@/lib/prisma';

async function fixImagePaths() {
  try {
    const images = await prisma.image.findMany();
    
    for (const image of images) {
      // 移除路径中的 public 前缀
      const fixedPath = image.path.replace(/^public\//, '');
      
      if (fixedPath !== image.path) {
        await prisma.image.update({
          where: { id: image.id },
          data: { path: fixedPath }
        });
        console.log(`Fixed path for image ${image.id}: ${fixedPath}`);
      }
    }
    
    console.log('All image paths have been fixed');
  } catch (error) {
    console.error('Error fixing image paths:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImagePaths(); 