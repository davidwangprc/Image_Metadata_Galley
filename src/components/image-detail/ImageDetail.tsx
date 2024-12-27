'use client';

import { Badge, Button, Card, Group, Text, Title, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconBrush, IconWand, IconDownload } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './image-detail.module.css';

interface Tag {
  id: string;
  name: string;
  type: string;
}

interface Model {
  name: string;
  type: string;
  baseModel: string;
}

interface Workflow {
  name: string;
  description: string;
}

interface ImageDetailProps {
  image: {
    id: string;
    name: string;
    path: string;
    prompt: string;
    negativePrompt: string | null;
    modelName: string | null;
    loraNames: string | null;
    cfg: number | null;
    steps: number | null;
    seed: bigint | null;
    sampler: string | null;
    size: string | null;
    category: string;
    tags: Tag[];
    model: Model | null;
    workflow: Workflow | null;
  };
}

export function ImageDetail({ image }: ImageDetailProps) {
  const router = useRouter();
  const processedPath = image.path.replace(/^public\//, '/');

  return (
    <div className={styles.container}>
      {/* 返回按钮 */}
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.back()}
        className={styles.backButton}
      >
        返回
      </Button>

      <div className={styles.content}>
        {/* 图片区域 */}
        <div className={styles.imageContainer}>
          <Image
            src={processedPath}
            alt={image.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
        </div>

        {/* 信息区域 */}
        <div className={styles.info}>
          <Card className={styles.infoCard}>
            {/* 标题和标签 */}
            <Title order={2} mb="md">{image.name}</Title>
            <Group gap="xs" mb="lg">
              <Badge color="blue">{image.category}</Badge>
              {image.tags.map(tag => (
                <Badge 
                  key={tag.id}
                  color={tag.type === 'style' ? 'green' : 'grape'}
                >
                  {tag.name}
                </Badge>
              ))}
            </Group>

            {/* 生成信息 */}
            <Title order={3} mb="sm">Generation Data</Title>
            <div className={styles.generationData}>
              {/* 模型信息 */}
              {image.model && (
                <Group mb="xs">
                  <IconBrush size={16} />
                  <Text>Model: </Text>
                  <Tooltip label={`${image.model.baseModel} - ${image.model.type}`}>
                    <Badge leftSection={<IconBrush size={12} />} size="lg">
                      {image.model.name}
                    </Badge>
                  </Tooltip>
                </Group>
              )}

              {/* Workflow 信息 */}
              {image.workflow && (
                <Group mb="xs">
                  <IconWand size={16} />
                  <Text>Workflow: </Text>
                  <Tooltip label={image.workflow.description}>
                    <Badge leftSection={<IconWand size={12} />} size="lg">
                      {image.workflow.name}
                    </Badge>
                  </Tooltip>
                </Group>
              )}

              {/* Prompt */}
              <div className={styles.promptSection}>
                <Text fw={500}>Prompt:</Text>
                <Card className={styles.promptCard}>
                  <Text>{image.prompt}</Text>
                </Card>
              </div>

              {/* Negative Prompt */}
              {image.negativePrompt && (
                <div className={styles.promptSection}>
                  <Text fw={500}>Negative Prompt:</Text>
                  <Card className={styles.promptCard}>
                    <Text>{image.negativePrompt}</Text>
                  </Card>
                </div>
              )}

              {/* 其他生成参数 */}
              <div className={styles.params}>
                {image.steps && (
                  <Text size="sm">Steps: {image.steps}</Text>
                )}
                {image.cfg && (
                  <Text size="sm">CFG Scale: {image.cfg}</Text>
                )}
                {image.sampler && (
                  <Text size="sm">Sampler: {image.sampler}</Text>
                )}
                {image.seed && (
                  <Text size="sm">Seed: {image.seed.toString()}</Text>
                )}
                {image.size && (
                  <Text size="sm">Size: {image.size}</Text>
                )}
              </div>
            </div>

            {/* 下载按钮 */}
            <Button
              leftSection={<IconDownload size={16} />}
              className={styles.downloadButton}
              component="a"
              href={processedPath}
              download
            >
              下载图片
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
} 