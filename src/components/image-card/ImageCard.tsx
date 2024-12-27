"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge, Text, MantineProvider } from '@mantine/core';
import styles from './image-card.module.css';


interface ImageCardProps {
  id: string;
  name: string;
  path: string;
  prompt?: string;
  modelName?: string;
  category?: string;
  nsfw?: boolean;
}

export default function ImageCard({ 
  id, 
  name, 
  path, 
  prompt, 
  modelName,
  category,
  nsfw 
}: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <MantineProvider theme={{ colorScheme: 'dark' }}>
      <div 
        className={styles.card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/images/${id}`} className={styles.imageLink}>
          <div className={styles.imageWrapper}>
            <Image
              src={`/${path}`}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`${styles.image} ${isLoading ? styles.loading : ''}`}
              onLoad={() => setIsLoading(false)}
            />
            {nsfw && (
              <div className={styles.nsfwOverlay}>
                <span>NSFW</span>
              </div>
            )}
          </div>
        </Link>

        <div className={`${styles.info} ${isHovered ? styles.infoHovered : ''}`}>
          <div className={styles.header}>
            <h3 className={styles.title}>{name}</h3>
            {category && (
              <Badge size="sm" variant="light" color="blue">
                {category}
              </Badge>
            )}
          </div>
          
          {prompt && (
            <Text className={styles.prompt} lineClamp={2}>
              {prompt}
            </Text>
          )}
          
          {modelName && (
            <div className={styles.footer}>
              <Badge size="sm" variant="outline">
                {modelName}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </MantineProvider>
  );
} 