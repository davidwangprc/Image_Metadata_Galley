"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET 测试
  const runGetTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting GET test...');
      const response = await fetch('/api/test');
      const data = await response.json();
      
      console.log('GET test response:', data);
      setTestResult({
        type: 'GET',
        data
      });
      
    } catch (err: any) {
      console.error('GET test failed:', err);
      setError(err.message || 'GET测试失败');
    } finally {
      setLoading(false);
    }
  };

  // POST 测试
  const runPostTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用实际存在的模型名称
      const testData = {
        path: "test/image.jpg",
        name: "Test Image",
        category: "test",
        prompt: "Test prompt",
        negativePrompt: "Test negative prompt",
        modelName: "animagine_xl_v3",  // 使用实际存在的模型名称
        loraNames: ["test_lora1", "test_lora2"],
        embeddings: "[]",
        wildcardSets: "[]",
        cfg: 7,
        steps: 20,
        seed: 123456789,
        sampler: "Euler a",
        size: "512x512",
        nsfw: false
      };

      console.log('Starting POST test with data:', testData);
      
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      console.log('POST test response:', data);
      setTestResult({
        type: 'POST',
        data,
        requestData: testData
      });
      
    } catch (err: any) {
      console.error('POST test failed:', err);
      setError(err.message || 'POST测试失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加获取模型列表的函数
  const runModelTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting model test...');
      const response = await fetch('/api/test/models');
      const data = await response.json();
      
      console.log('Model test response:', data);
      setTestResult({
        type: 'MODELS',
        data
      });
      
    } catch (err: any) {
      console.error('Model test failed:', err);
      setError(err.message || '模型测试失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">数据库操作测试</h1>
          <div className="space-x-4">
            <Button
              onClick={runGetTest}
              disabled={loading}
              variant="outline"
            >
              {loading ? '测试中...' : '测试读取'}
            </Button>
            <Button
              onClick={runPostTest}
              disabled={loading}
            >
              {loading ? '测试中...' : '测试保存'}
            </Button>
            <Button
              onClick={runModelTest}
              disabled={loading}
              variant="secondary"
            >
              {loading ? '测试中...' : '查看可用模型'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {testResult && (
          <ScrollArea className="h-[600px] border rounded-lg p-4">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">测试结果 ({testResult.type})</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  {testResult.type === 'GET' ? (
                    <>
                      <p className="text-green-800">状态: {testResult.data.success ? '成功' : '失败'}</p>
                      {testResult.data.data && (
                        <>
                          <p className="text-green-800">总图片数: {testResult.data.data.totalImages}</p>
                          <div className="mt-4">
                            <h3 className="font-medium mb-2 text-green-800">示例图片记录:</h3>
                            <pre className="bg-white border border-green-100 p-4 rounded-lg overflow-auto text-sm text-green-900">
                              {JSON.stringify(testResult.data.data.sampleImage, null, 2)}
                            </pre>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="font-medium mb-2 text-green-800">请求数据:</h3>
                        <pre className="bg-white border border-green-100 p-4 rounded-lg overflow-auto text-sm text-green-900">
                          {JSON.stringify(testResult.requestData, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2 text-green-800">响应数据:</h3>
                        <pre className="bg-white border border-green-100 p-4 rounded-lg overflow-auto text-sm text-green-900">
                          {JSON.stringify(testResult.data, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">原始响应数据</h2>
                <div className="bg-slate-800 border border-slate-700 rounded-lg">
                  <pre className="p-4 overflow-auto text-sm text-slate-100 font-mono">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
} 