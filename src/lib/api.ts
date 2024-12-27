export interface Tag {
  id: string;
  name: string;
  type: string;
}

export interface Model {
  name: string;
  type: string;
  baseModel: string;
}

export interface Workflow {
  name: string;
  description: string;
}

export interface ImageData {
  id: string;
  name: string;
  path: string;
  prompt: string;
  category: string;
  tags: Tag[];
  model?: Model;
  workflow?: Workflow;
  nsfw: boolean;
}

export interface ApiResponse {
  images: ImageData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 获取所有分类
export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, { 
    cache: 'no-store' 
  });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

// 获取指定分类的图片
export async function getImages(params: {
  category?: string;
  tag?: string;
  model?: string;
  page?: number;
  limit?: number;
  nsfw?: boolean;
}): Promise<ApiResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.category) searchParams.set('category', params.category);
  if (params.tag) searchParams.set('tag', params.tag);
  if (params.model) searchParams.set('model', params.model);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.nsfw !== undefined) searchParams.set('nsfw', params.nsfw.toString());

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/images?${searchParams.toString()}`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) throw new Error('Failed to fetch images');
  return response.json();
}

// 获取所有图片（分页）
export async function getAllImages(page = 1, limit = 20): Promise<ApiResponse> {
  return getImages({ page, limit });
}
