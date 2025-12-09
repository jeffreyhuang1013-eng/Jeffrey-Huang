import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelId } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * XStudio Gateway Logic (Simulated)
 * Routes user prompts to the most suitable Chinese market model.
 */
const selectModelViaGateway = (prompt: string): ModelId => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Image Generation Keywords
  if (['draw', 'image', 'picture', '画', '绘', '图', '生成'].some(k => lowerPrompt.includes(k))) {
    return ModelId.KLING_AI; 
  } 
  // Complex/Coding Keywords
  else if (['code', 'program', 'complex', 'math', '代码', '编程', '算法', '数学', '逻辑', '写个'].some(k => lowerPrompt.includes(k))) {
    return ModelId.DEEPSEEK_V3; 
  } 
  // Reasoning/Thinking Keywords
  else if (['think', 'reason', 'why', 'plan', '思考', '分析', '规划', '为什么', '方案', '深度'].some(k => lowerPrompt.includes(k))) {
    return ModelId.QWEN_MAX; 
  } 
  // Default Chat
  else {
    return ModelId.DOUBAO_PRO; 
  }
};

export const sendMessageStream = async (
  prompt: string,
  modelId: ModelId,
  images: string[] | undefined,
  onChunk: (text: string) => void
): Promise<string> => {
  let targetGeminiModel = "";
  let requestConfig: any = {};
  let effectiveModelId = modelId;

  // 1. Gateway Routing Logic
  if (modelId === ModelId.GATEWAY_AUTO) {
    effectiveModelId = selectModelViaGateway(prompt);
  }

  // Common instruction to ensure Chinese output
  const baseInstruction = "请始终使用简体中文回复。";

  // 2. Map XStudio Model IDs to underlying Google GenAI Models
  switch (effectiveModelId) {
    case ModelId.DEEPSEEK_V3:
      targetGeminiModel = 'gemini-3-pro-preview'; // Deepseek mapped to Pro
      // Enable thinking for complex coding/math tasks
      requestConfig.thinkingConfig = { thinkingBudget: 32768 };
      requestConfig.systemInstruction = `${baseInstruction} 你是 Deepseek-V3 (深度求索)，一个擅长复杂代码、数学和硬核逻辑推理的专家模型。`;
      break;
    case ModelId.QWEN_MAX:
      targetGeminiModel = 'gemini-3-pro-preview'; // Qwen mapped to Thinking
      // Max thinking budget for deep reasoning
      requestConfig.thinkingConfig = { thinkingBudget: 32768 }; 
      requestConfig.systemInstruction = `${baseInstruction} 你是通义千问 (Qwen-Max)，一个具备深度思考和规划能力的模型。在回答前请深思熟虑。`;
      break;
    case ModelId.KLING_AI:
      targetGeminiModel = 'gemini-2.5-flash'; // Kling mapped to Flash (Text mode simulation for this demo)
      requestConfig.systemInstruction = `${baseInstruction} 你是可灵 AI (Kling AI)。你专注于视觉生成和创意绘画。如果用户让你画画，请用文字生动地描述画面，作为生成图片的占位符。`;
      break;
    case ModelId.DOUBAO_PRO:
    default:
      targetGeminiModel = 'gemini-2.5-flash'; // Doubao mapped to Flash
      requestConfig.systemInstruction = `${baseInstruction} 你是豆包，一个亲切、反应迅速的日常聊天助手。`;
      break;
  }

  // 3. Construct Contents (Text + Images)
  const parts: any[] = [];
  
  if (images && images.length > 0) {
    images.forEach(img => {
        // Expected format: "data:image/png;base64,..."
        // We need to extract the mimeType and the base64 data
        const matches = img.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            parts.push({ 
                inlineData: { 
                    mimeType: matches[1], 
                    data: matches[2] 
                } 
            });
        }
    });
  }
  
  parts.push({ text: prompt });

  // 4. Make the API Call
  try {
    const streamResult = await ai.models.generateContentStream({
      model: targetGeminiModel,
      contents: [{ role: 'user', parts: parts }],
      config: requestConfig
    });

    let fullText = "";

    for await (const chunk of streamResult) {
      const chunkResponse = chunk as GenerateContentResponse;
      const text = chunkResponse.text || "";
      fullText += text;
      onChunk(fullText);
    }

    // Return the visible model name for the UI
    return getModelDisplayName(effectiveModelId);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const getModelDisplayName = (id: ModelId): string => {
    switch(id) {
        case ModelId.DEEPSEEK_V3: return 'Deepseek (深度求索)';
        case ModelId.QWEN_MAX: return '通义千问';
        case ModelId.DOUBAO_PRO: return '豆包';
        case ModelId.KLING_AI: return '可灵 AI';
        default: return '智能路由';
    }
}
