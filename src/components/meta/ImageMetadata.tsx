"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, FileImage, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ParsedMetadata, ImageDimensions, parseMetadata, getImageDimensions } from "@/lib/utils/metadata";
import styles from './ImageMetadata.module.css';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";

interface ImageMetadataProps {
  image: {
    path: string;
    name: string;
    metadata: any;
  };
  onClose: () => void;
}

interface ParsedMetadata {
  prompt: string;
  negativePrompt?: string;
  modelName: string;
  loraNames: string[];
  seed: string | number;
  sampler: string;
  steps: string | number;
  cfg: string | number;
}

interface ImageData {
  path: string;
  name: string;
  prompt: string;
  negativePrompt?: string;
  modelName?: string;
  loraNames: string[];
  embeddings?: string;
  workflowId?: string;
  wildcardSets?: string;
  cfg?: number;
  steps?: number;
  seed?: bigint;
  sampler?: string;
  size?: string;
  category: string;
  nsfw: boolean;
}

export function ImageMetadata({ image, onClose }: ImageMetadataProps) {
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [metadata, setMetadata] = useState<ParsedMetadata | null>(null);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('Component mounted');
    console.log('Image data:', image);
    console.log('Metadata:', metadata);
  }, [image, metadata]);

  useEffect(() => {
    getImageDimensions(image.path).then(setImageDimensions);
  }, [image.path]);

  useEffect(() => {
    const parsedMetadata = parseMetadata(image.metadata);
    setMetadata(parsedMetadata);
  }, [image.metadata]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSave = () => {
    if (!metadata || !image) return;

    // 处理 LoRA 名称：提取最后一个"\"后的名称并去除.safetensors后缀
    const processLoraName = (path: string) => {
      const name = path.split('\\').pop() || path; // 获取最后一个\后的内容
      return name.replace('.safetensors', ''); // 移除.safetensors后缀
    };

    try {
      // 处理 LoRA 数组
      const processedLoraNames = metadata.loraNames?.map(processLoraName) || [];
      
      const queryParams = new URLSearchParams({
        path: image.path,
        name: image.name,
        prompt: metadata.prompt || '',
        negativePrompt: metadata.negativePrompt || '',
        modelName: metadata.modelName || '',
        loraNames: JSON.stringify(processedLoraNames), // 存储处理后的数组
        seed: (metadata.seed || '').toString(),
        sampler: metadata.sampler || '',
        steps: (metadata.steps || '').toString(),
        cfg: (metadata.cfg || '').toString(),
        category: 'default'
      });

      router.push(`/meta/confirm?${queryParams.toString()}`);
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('保存过程中出现错误，请重试');
    }
  };

  return (
    <div className="w-96 h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">图片详情</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-6">
          <Image
            src={image.path}
            alt={image.name}
            fill
            className="object-contain"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-muted rounded-md mb-6">
          <FileImage className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate flex-1">{image.name}</span>
          {imageDimensions && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {imageDimensions.width} × {imageDimensions.height}
            </span>
          )}
        </div>

        {metadata ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">提示词</h4>
                {metadata.prompt && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-70 hover:opacity-100"
                    onClick={() => copyToClipboard(metadata.prompt)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {metadata.prompt || "无提示词"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">模型</h4>
              <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                {metadata.modelName}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">LoRA 模型</h4>
              <div className="space-y-1">
                {metadata.loraNames?.length > 0 ? (
                  metadata.loraNames.map((lora: string, index: number) => (
                    <p key={index} className="text-sm text-muted-foreground py-1">
                      {lora}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">未使用 LoRA 模型</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded-md">
                <div className="text-xs font-medium mb-1">Seed</div>
                <div className="text-sm text-muted-foreground">
                  {metadata.seed || "不可用"}
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <div className="text-xs font-medium mb-1">采样器</div>
                <div className="text-sm text-muted-foreground">
                  {metadata.sampler || "不可用"}
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <div className="text-xs font-medium mb-1">步数</div>
                <div className="text-sm text-muted-foreground">
                  {metadata.steps || "不可用"}
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <div className="text-xs font-medium mb-1">CFG</div>
                <div className="text-sm text-muted-foreground">
                  {metadata.cfg || "不可用"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-sm text-muted-foreground bg-muted rounded-lg">
            该图片没有元数据信息
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t space-y-2">
        <Button
          variant="default"
          className="w-full bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
          onClick={handleSave}
        >
          保存到数据库
        </Button>
        
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => {
            alert('测试按钮被点击');
            console.log('Test button clicked');
          }}
        >
          测试按钮
        </Button>
      </div>
    </div>
  );
}