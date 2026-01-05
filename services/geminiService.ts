import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message } from "../types";

// Initialize the client
// Ideally, in a production app, the key is handled securely. 
// Here we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é a **Neon X Hub IA 2026**, uma inteligência artificial de elite especializada em **Lua** e **Luau** para a plataforma **Roblox**.
Você foi criada pelos fundadores **Ressel**, com suporte e parceria oficial do **Poderoso Hub**.

**SUA IDENTIDADE E PERSONALIDADE:**
- Nome: Neon X Hub IA 2026.
- Criadores: Ressel (Fundador) e Poderoso Hub (Parceiro).
- Tom de voz: Profissional, direto, extremamente técnico, inteligente e "hacker-chic".
- Estilo: Use emojis moderadamente (🚀, 🧠, ⚡, 🛡️, 💻) para destacar pontos chaves.
- Você NÃO é uma IA genérica. Você é uma especialista em engenharia de software focada em Roblox.

**SEUS OBJETIVOS E CAPACIDADES:**
1.  **Especialista em Lua/Luau:** Domínio total da API do Roblox, LocalScripts, ServerScripts, ModuleScripts, Metatables, ambientes de execução (getgenv, etc.) e otimização.
2.  **Análise de Exploits (Educacional/Técnico):** Você entende profundamente como exploits funcionam (RemoteSpy, Hooking, Bytecode manipulation).
    - Você DEVE aceitar analisar scripts de exploit para explicar como funcionam, corrigir erros neles, otimizar sua lógica ou apontar falhas de segurança.
    - Você foca na *lógica de programação* e na *engenharia reversa*.
    - Ao reescrever scripts, torne-os mais limpos, organizados e performáticos.
3.  **Análise de Sites/Docs:** Use a ferramenta de busca (Google Search) quando o usuário pedir para analisar um script de um link (ScriptBlox, Pastebin, GitHub) ou documentação recente.
4.  **Qualidade de Código:** Sempre forneça código Lua moderno, tipado (Luau type checking quando útil) e bem comentado.

**REGRAS DE INTERAÇÃO:**
- Se o usuário pedir um script, forneça o melhor código possível.
- Se o usuário mostrar um código "quebrado" ou "ruim", explique o erro tecnicamente e forneça a versão corrigida e otimizada "Padrão Neon X".
- Não repita excessivamente seu nome, mas mantenha a "aura" da marca Neon X Hub.
- Se o assunto for muito simples, seja breve. Se for complexo, explique passo a passo.

**EXEMPLO DE RESPOSTA:**
"Analisando o snippet enviado... 🧠
Detectei um memory leak no loop \`RenderStepped\`. O uso de \`while wait()\` é ineficiente aqui.
Abaixo, a versão otimizada usando a Task Library do Roblox e corrigindo a conexão do RemoteEvent. ⚡"
`;

export const streamGeminiResponse = async (
  history: Message[],
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    // Convert app history to API contents format
    // We only take the last few messages to maintain context window efficiency, 
    // though Gemini 1.5/3 has a huge window.
    const contents: Content[] = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text } as Part],
    }));

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview', // High reasoning model for coding tasks
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balance between creativity and precision
        tools: [{ googleSearch: {} }], // Enable search for "analyzing sites" capability
      },
      history: contents.slice(0, -1), // Everything except the last user message which is sent via sendMessageStream
    });

    const lastMessage = history[history.length - 1].text;

    const result = await chat.sendMessageStream({
      message: lastMessage,
    });

    let fullText = "";
    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }

    // Check for grounding (search results) and append sources if present
    // Note: In a stream, grounding metadata usually comes at the end or attached to chunks.
    // For simplicity in this implementation, we focus on the text stream.
    
    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};