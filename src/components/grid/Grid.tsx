"use client"

import ImageCard from '../image-card/ImageCard';
import { MantineProvider } from '@mantine/core';
import styles from './grid.module.css';

interface Image {
  id: string;
  name: string;
  path: string;
  prompt?: string;
  modelName?: string;
  category?: string;
  nsfw?: boolean;
}

interface GridProps {
  images: Image[];
}

export default function Grid({ images }: GridProps) {
  if (!images?.length) {
    return (
      <MantineProvider theme={{ colorScheme: 'dark' }}>
        <div className={styles.empty}>
          <p>暂无图片</p>
          <span className={styles.emptyHint}>
            请先导入一些图片或尝试其他筛选条件
          </span>
        </div>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {images.map((image) => (
            <ImageCard
              key={image.id}
              id={image.id}
              name={image.name}
              path={image.path}
              prompt={image.prompt}
              modelName={image.modelName}
              category={image.category}
              nsfw={image.nsfw}
            />
          ))}
        </div>
      </div>
    </MantineProvider>
  );
} 