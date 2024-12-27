// 定义类型接口
interface NodeInputs {
  text?: string;
  text2?: string;
  ckpt_name?: string;
  unet_name?: string;
  seed?: number | string;
  sampler_name?: string;
  steps?: number | string;
  cfg?: number | string;
  [key: string]: any;
}

interface NodeMeta {
  title?: string;
  [key: string]: any;
}

interface Node {
  inputs?: NodeInputs;
  _meta?: NodeMeta;
  class_type?: string;
  [key: string]: any;
}

export interface ParsedMetadata {
  prompt: string;
  modelName: string;
  loraNames: string[];
  seed: string | number;
  sampler: string;
  steps: string | number;
  cfg: string | number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// 查找采样器相关节点
const findSamplerInfo = (data: Record<string, Node>) => {
  let seed = "";
  let sampler = "";
  let steps = "";
  let cfg = "";

  // 查找主采样器节点
  const samplerNode = Object.entries(data).find(
    ([, value]: [string, Node]) =>
      value?.class_type === "KSampler" || value?.class_type === "SamplerCustom"
  );

  if (samplerNode) {
    const [, node] = samplerNode;
    seed = node.inputs?.noise_seed || node.inputs?.seed || "";
    cfg = node.inputs?.cfg || "";

    // 如果是 SamplerCustom，需要查找关联的采样器设置
    if (node.class_type === "SamplerCustom") {
      const samplerRef = node.inputs?.sampler?.[0];
      if (samplerRef) {
        // 查找 KSamplerSelect 节点
        const samplerSelectNode = Object.entries(data).find(
          ([id]) => id === samplerRef
        );
        if (samplerSelectNode?.[1]?.inputs?.sampler_name) {
          sampler = samplerSelectNode[1].inputs.sampler_name;
        }
      }

      // 查找 BasicScheduler 节点获取步数
      const schedulerNode = Object.entries(data).find(
        ([, value]: [string, Node]) => value?.class_type === "BasicScheduler"
      );
      if (schedulerNode?.[1]?.inputs?.steps) {
        steps = schedulerNode[1].inputs.steps;
      }
    } else {
      // 对于普通 KSampler 节点
      steps = node.inputs?.steps || "";
      sampler = node.inputs?.sampler_name || "";
    }
  }

  return { seed, sampler, steps, cfg };
};

export function parseMetadata(metadata: any): ParsedMetadata | null {
  try {
    if (!metadata) {
      return null;
    }

    let data: Record<string, Node>;
    if (typeof metadata === "string") {
      try {
        // 清理和规范化字符串
        let cleanedMetadata = metadata
          .replace(/NaN/g, '"NaN"')
          .replace(/undefined/g, "null")
          .replace(/\bInfinity\b/g, '"Infinity"');

        // 检查是否是被转义的 JSON 字符串
        if (cleanedMetadata.startsWith('"') && cleanedMetadata.endsWith('"')) {
          const unescaped = JSON.parse(cleanedMetadata);
          data = JSON.parse(unescaped);
        } else {
          data = JSON.parse(cleanedMetadata);
        }
      } catch (error) {
        try {
          data = JSON.parse(metadata);
        } catch (e) {
          console.error("Failed to parse metadata:", e);
          return null;
        }
      }
    } else {
      data = metadata;
    }

    if (data?.prompt) {
      data = data.prompt;
    }

    // 查找模型节点
    const modelNode = Object.entries(data).find(
      ([, value]: [string, Node]) =>
        value?.class_type === "CheckpointLoaderSimple" ||
        value?.class_type === "CheckpointLoader" ||
        value?.class_type === "UNETLoader"
    );

    // 查找提示词
    let prompt = "";

    // 先查找 CLIPTextEncode 节点
    const clipNodes = Object.entries(data).filter(
      ([, value]: [string, Node]) =>
        value?.class_type === "CLIPTextEncode" &&
        value?.inputs?.text &&
        !value?.inputs?.text?.includes("negative")
    );

    if (clipNodes.length > 0) {
      for (const [, node] of clipNodes) {
        if (node?.inputs?.text) {
          let promptText = node.inputs.text;
          
          // 如果 text 是引用数组，直接查找 metadata-prompt 节点
          if (Array.isArray(promptText)) {
            const metadataPromptNode = Object.entries(data).find(
              ([, value]: [string, Node]) =>
                value?._meta?.title === "metadata-prompt" &&
                value?.class_type === "ShowText|pysssss"
            );

            if (metadataPromptNode?.[1]?.inputs?.text2) {
              promptText = metadataPromptNode[1].inputs.text2;
            } else if (metadataPromptNode?.[1]?.inputs?.text) {
              const textValue = metadataPromptNode[1].inputs.text;
              if (typeof textValue === "string") {
                promptText = textValue;
              }
            }
          }

          // 处理字符串中的引号和转义字符
          if (typeof promptText === "string") {
            // 处理多层转义的情况
            promptText = promptText
              .replace(/\\{2}/g, '\\')     // 先处理双反斜杠
              .replace(/\\"/g, '"')        // 处理转义的双引号
              .replace(/\\n/g, '\n')       // 处理换行符
              .replace(/^"/, '')           // 移除开头的引号
              .replace(/"$/, '');          // 移除结尾的引号
          }

          // 确保是字符串且不是负面提示词
          if (
            typeof promptText === "string" &&
            !node._meta?.title?.toLowerCase().includes("negative")
          ) {
            prompt = promptText;
            break;
          }
        }
      }
    }

    // 如果都没有找到，设置默认提示词
    if (!prompt) {
      prompt = "textValue";
    }

    // 查找 LoRA 节点
    const loraNames: string[] = [];
    Object.entries(data).forEach(([, value]: [string, Node]) => {
      // 處理 Power Lora Loader (rgthree) 節點
      if (value?.class_type === "Power Lora Loader (rgthree)") {
        Object.entries(value.inputs || {}).forEach(
          ([key, val]: [string, any]) => {
            if (key.startsWith("lora_") && val?.on && val?.lora) {
              loraNames.push(val.lora);
            }
          }
        );
      }
      // 處理 LoraLoaderModelOnly 節點
      else if (value?.class_type === "LoraLoaderModelOnly") {
        if (value.inputs?.lora_name) {
          loraNames.push(value.inputs.lora_name);
        }
      }
    });

    // 使用新的采样器信息获取函数
    const { seed, sampler, steps, cfg } = findSamplerInfo(data);

    return {
      prompt,
      modelName:
        modelNode?.[1]?.inputs?.ckpt_name?.toString() ||
        modelNode?.[1]?.inputs?.unet_name?.toString() ||
        "",
      loraNames: Array.from(new Set(loraNames)),
      seed,
      sampler,
      steps,
      cfg,
    };
  } catch (error) {
    console.error("Error in parseMetadata:", error);
    return null;
  }
}

export function getImageDimensions(
  imagePath: string
): Promise<ImageDimensions> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = imagePath;
  });
}
