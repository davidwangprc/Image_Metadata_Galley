import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { Badge, Card, Title, Text, Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ImagePage({ params }: PageProps) {
  const image = await prisma.image.findUnique({
    where: {
      id: params.id
    },
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
    }
  });

  if (!image) {
    notFound();
  }

  // 处理图片路径
  const processedPath = image.path.replace(/^public\//, '');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 左侧图片区域 */}
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <Image
              src={`/${processedPath}`}
              alt={image.name}
              fill
              priority
              className={styles.image}
            />
          </div>
        </div>

        {/* 右侧信息区域 */}
        <div className={styles.infoSection}>
          <div className={styles.header}>
            <h1 className={styles.title}>{image.name}</h1>
            {image.category && (
              <Badge size="lg" variant="light" color="blue">
                {image.category}
              </Badge>
            )}
          </div>

          {/* 生成信息 */}
          <Card className={styles.infoCard}>
            <Title order={3} mb="md">生成信息</Title>
            
            {image.prompt && (
              <div className={styles.promptSection}>
                <Text fw={500} size="sm" c="dimmed">正向提示词</Text>
                <Text>{image.prompt}</Text>
              </div>
            )}
            
            {image.negativePrompt && (
              <div className={styles.promptSection}>
                <Text fw={500} size="sm" c="dimmed">反向提示词</Text>
                <Text>{image.negativePrompt}</Text>
              </div>
            )}

            <div className={styles.params}>
              {image.modelName && (
                <div className={styles.paramItem}>
                  <Text fw={500} size="sm" c="dimmed">模型</Text>
                  <Text>{image.modelName}</Text>
                </div>
              )}
              
              {image.loraNames && (
                <div className={styles.paramItem}>
                  <Text fw={500} size="sm" c="dimmed">LoRA</Text>
                  <Text>{image.loraNames}</Text>
                </div>
              )}
              
              {image.sampler && (
                <div className={styles.paramItem}>
                  <Text fw={500} size="sm" c="dimmed">采样器</Text>
                  <Text>{image.sampler}</Text>
                </div>
              )}
              
              {image.steps && (
                <div className={styles.paramItem}>
                  <Text fw={500} size="sm" c="dimmed">步数</Text>
                  <Text>{image.steps}</Text>
                </div>
              )}
              
              {image.cfg && (
                <div className={styles.paramItem}>
                  <Text fw={500} size="sm" c="dimmed">CFG Scale</Text>
                  <Text>{image.cfg}</Text>
                </div>
              )}
              
              {image.seed && (
                <div className={styles.paramItem}>
                  <Text fw={500} size="sm" c="dimmed">种子</Text>
                  <Text>{image.seed.toString()}</Text>
                </div>
              )}
            </div>
          </Card>

          {/* 下载按钮 */}
          <Button
            fullWidth
            size="lg"
            leftSection={<IconDownload size={20} />}
            className={styles.downloadButton}
          >
            下载图片
          </Button>
        </div>
      </div>
    </div>
  );
} 