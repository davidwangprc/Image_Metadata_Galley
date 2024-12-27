import { getAllImages } from '@/lib/api'
import Grid from '@/components/grid/Grid';
import styles from './homepage.module.css';

export const revalidate = 0; // 禁用缓存

export default async function Home() {
  const response = await getAllImages(1, 50);
  console.log('API Response:', JSON.stringify(response, null, 2));
  
  // 使用 response.images 而不是 response.data
  const images = response?.images || [];
  console.log('Processed images:', JSON.stringify(images, null, 2));
  
  return (
    <main className={styles.main}>
      <Grid images={images} />
    </main>
  );
}

