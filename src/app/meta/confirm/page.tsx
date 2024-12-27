"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { X } from "lucide-react";

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

export default function ConfirmPage() {
  const router = useRouter();
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    
    try {
      const loraNames = JSON.parse(searchParams.get('loraNames') || '[]');
      
      setImageData({
        path: searchParams.get('path') || '',
        name: searchParams.get('name') || '',
        category: searchParams.get('category') || 'default',
        prompt: searchParams.get('prompt') || '',
        negativePrompt: searchParams.get('negativePrompt') || '',
        modelName: searchParams.get('modelName') || '',
        loraNames,
        embeddings: searchParams.get('embeddings') || '[]',
        workflowId: searchParams.get('workflowId') || null,
        wildcardSets: searchParams.get('wildcardSets') || '[]',
        cfg: searchParams.get('cfg') ? parseFloat(searchParams.get('cfg')) : null,
        steps: searchParams.get('steps') ? parseInt(searchParams.get('steps')) : null,
        seed: searchParams.get('seed') ? BigInt(searchParams.get('seed')) : null,
        sampler: searchParams.get('sampler') || '',
        size: searchParams.get('size') || '',
        nsfw: searchParams.get('nsfw') === 'true'
      });
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      alert('加载数据时出错');
    }
  }, []);

  const handleSubmit = async () => {
    if (!imageData) return;
    
    try {
      setIsSubmitting(true);
      
      // 准备发送的数据
      const dataToSend = {
        path: imageData.path,
        name: imageData.name,
        prompt: imageData.prompt || '',
        negativePrompt: imageData.negativePrompt || '',
        modelName: imageData.modelName || '',
        loraNames: imageData.loraNames, // 直接发送数组
        embeddings: imageData.embeddings || '',
        workflowId: imageData.workflowId || '',
        wildcardSets: imageData.wildcardSets || '',
        seed: imageData.seed?.toString() || '',
        sampler: imageData.sampler || '',
        steps: imageData.steps?.toString() || '',
        cfg: imageData.cfg?.toString() || '',
        size: imageData.size || '',
        category: imageData.category || 'default',
        nsfw: imageData.nsfw || false
      };
      
      console.log('Sending data:', dataToSend);
      
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '保存失败');
      }

      alert('保存成功！');
      router.push('/meta');
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`保存失败：${error.message || '未知错误'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!imageData) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-sm font-semibold text-yellow-800 mb-2">注意事项：</h2>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
            <li>分类(category)为必填字段，默认值为 'default'</li>
            <li>LoRA模型列表、Embeddings列表和Wildcard集合需要以JSON字符串格式存储</li>
            <li>CFG和步数(steps)需要为数字类型</li>
            <li>种子号(seed)需要为BigInt类型</li>
            <li>成人内容标记(NSFW)默认为否</li>
            <li>模型名称(modelName)必须引用数据库中已存在的模型，否则会导致外键约束错误</li>
          </ul>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">确认图片信息</h1>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              返回
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '确认保存'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 图片预览 */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden border">
              <Image
                src={imageData.path}
                alt={imageData.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              文件名: {imageData.name}
            </div>
            <div className="text-sm text-muted-foreground">
              尺寸: {imageData.size}
            </div>
          </div>

          {/* 图片信息表单 */}
          <ScrollArea className="h-[600px] border rounded-lg p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">提示词</label>
                <Textarea
                  value={imageData.prompt}
                  onChange={(e) => setImageData(prev => 
                    prev ? { ...prev, prompt: e.target.value } : null
                  )}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">反向提示词</label>
                <Textarea
                  value={imageData.negativePrompt}
                  onChange={(e) => setImageData(prev => 
                    prev ? { ...prev, negativePrompt: e.target.value } : null
                  )}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">模型</label>
                <div className="flex gap-2">
                  <Input
                    value={imageData.modelName}
                    onChange={(e) => setImageData(prev => 
                      prev ? { ...prev, modelName: e.target.value } : null
                    )}
                  />
                  <Button
                    variant="outline"
                    size="default"
                    onClick={async () => {
                      if (!imageData.modelName) {
                        alert('请输入模型名称');
                        return;
                      }
                      
                      try {
                        const response = await fetch('/api/models/check', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            modelName: imageData.modelName
                          }),
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                          alert('模型检查成功！' + (result.data.id ? '已存在的模型' : '已自动创建新模型'));
                        } else {
                          alert('模型检查失败：' + result.error);
                        }
                      } catch (error: any) {
                        console.error('Model check error:', error);
                        alert('模型检查出错：' + error.message);
                      }
                    }}
                  >
                    检查模型
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  如果模型不存在，系统会自动创建
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">LoRA 模型</label>
                <div className="space-y-2">
                  {Array.isArray(imageData.loraNames) && imageData.loraNames.map((lora, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={lora}
                        onChange={(e) => {
                          const newLoraNames = [...imageData.loraNames];
                          newLoraNames[index] = e.target.value;
                          setImageData(prev => 
                            prev ? { ...prev, loraNames: newLoraNames } : null
                          );
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newLoraNames = imageData.loraNames.filter((_, i) => i !== index);
                          setImageData(prev => 
                            prev ? { ...prev, loraNames: newLoraNames } : null
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageData(prev => 
                        prev ? { 
                          ...prev, 
                          loraNames: [...prev.loraNames, ''] 
                        } : null
                      );
                    }}
                  >
                    添加 LoRA 模型
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  已处理为简化名称，保存时将自动转换为JSON格式
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Seed</label>
                  <Input
                    value={imageData.seed?.toString()}
                    onChange={(e) => setImageData(prev => 
                      prev ? { ...prev, seed: e.target.value } : null
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    将自动转换为BigInt类型
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">采样器</label>
                  <Input
                    value={imageData.sampler}
                    onChange={(e) => setImageData(prev => 
                      prev ? { ...prev, sampler: e.target.value } : null
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">步数</label>
                  <Input
                    value={imageData.steps}
                    onChange={(e) => setImageData(prev => 
                      prev ? { ...prev, steps: e.target.value } : null
                    )}
                    type="number"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    请输入数字
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">CFG</label>
                  <Input
                    value={imageData.cfg}
                    onChange={(e) => setImageData(prev => 
                      prev ? { ...prev, cfg: e.target.value } : null
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">分类 *</label>
                <Input
                  value={imageData.category}
                  onChange={(e) => setImageData(prev => 
                    prev ? { ...prev, category: e.target.value } : null
                  )}
                  placeholder="请选择分类"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">原始元数据</label>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(imageData.rawMetadata, null, 2)}
                </pre>
              </div>

              <div>
                <label className="text-sm font-medium">Embeddings</label>
                <Input
                  value={imageData.embeddings || ''}
                  onChange={(e) => setImageData(prev => 
                    prev ? { ...prev, embeddings: e.target.value } : null
                  )}
                  placeholder="Embeddings列表"
                />
              </div>

              <div>
                <label className="text-sm font-medium">工作流ID</label>
                <Input
                  value={imageData.workflowId || ''}
                  onChange={(e) => setImageData(prev => 
                    prev ? { ...prev, workflowId: e.target.value } : null
                  )}
                  placeholder="关联的工作流ID"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Wildcard集合</label>
                <Input
                  value={imageData.wildcardSets || ''}
                  onChange={(e) => setImageData(prev => 
                    prev ? { ...prev, wildcardSets: e.target.value } : null
                  )}
                  placeholder="使用的Wildcard集合"
                />
              </div>

              <div>
                <label className="text-sm font-medium">图片尺寸</label>
                <Input
                  value={imageData.size || ''}
                  onChange={(e) => setImageData(prev => 
                    prev ? { ...prev, size: e.target.value } : null
                  )}
                  placeholder="例如: 512x512"
                />
              </div>

              <div>
                <label className="text-sm font-medium">NSFW</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={imageData.nsfw}
                    onChange={(e) => setImageData(prev => 
                      prev ? { ...prev, nsfw: e.target.checked } : null
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    标记为成人内容
                  </span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 