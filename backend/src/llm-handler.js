import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * LLM Handler - Manages LLM interactions with MCP tool support (Gemini)
 */
export class LLMHandler {
  constructor(mcpClient, systemPrompt) {
    this.mcpClient = mcpClient;
    this.systemPrompt = systemPrompt;
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or API_KEY environment variable is required. Please check your .env file.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.apiKey = apiKey;
    // Using gemini-2.5-flash - available model with function calling support
    // Free tier: 20 requests/day
    // Note: If quota exceeded, wait for daily reset (usually UTC 00:00)
    this.modelName = 'gemini-2.5-flash';
  }

  /**
   * Convert MCP tools to Gemini function declarations
   */
  convertToolsToGeminiFormat(tools) {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }));
  }

  /**
   * Build conversation history for Gemini
   * Gemini uses alternating user/model format
   */
  buildGeminiHistory(conversationHistory) {
    const history = [];
    
    for (let i = 0; i < conversationHistory.length; i++) {
      const msg = conversationHistory[i];
      
      if (msg.role === 'user') {
        history.push({
          role: 'user',
          parts: [{ text: msg.content }]
        });
      } else if (msg.role === 'assistant') {
        history.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
      }
    }
    
    return history;
  }

  /**
   * Process user message with LLM and MCP tools
   */
  async processMessage(userMessage, conversationHistory) {
    try {
      console.log('LLM Handler: processMessage started');
      // Get available tools from MCP
      console.log('LLM Handler: Getting tools from MCP...');
      const tools = await this.mcpClient.listTools();
      console.log(`LLM Handler: Got ${tools.length} tools from MCP`);
      
      // Convert MCP tools to Gemini function declarations
      const geminiTools = tools.length > 0 ? [{
        functionDeclarations: this.convertToolsToGeminiFormat(tools)
      }] : undefined;

      // Create model with tools
      // Using gemini-1.5-flash which supports function calling
      const model = this.genAI.getGenerativeModel({ 
        model: this.modelName,
        tools: geminiTools
      });

      // Build conversation history
      const history = this.buildGeminiHistory(conversationHistory.slice(0, -1));
      
      // Combine system prompt with user message
      let prompt = userMessage;
      if (this.systemPrompt) {
        prompt = `${this.systemPrompt}\n\nKullanıcı: ${userMessage}`;
      }

      // Start chat with history
      console.log('LLM Handler: Starting chat with Gemini...');
      const chat = model.startChat({
        history: history,
      });

      // Send message with retry mechanism for quota errors
      console.log('LLM Handler: Sending message to Gemini...');
      let result;
      let retries = 3;
      let retryDelay = 2000; // 2 seconds initially
      
      while (retries > 0) {
        try {
          result = await chat.sendMessage(prompt);
          break; // Success, exit retry loop
        } catch (error) {
          if (error.status === 429 && retries > 1) {
            // Quota exceeded, wait and retry
            const delay = retryDelay;
            console.log(`LLM Handler: Quota exceeded on first message, waiting ${delay}ms before retry (${retries - 1} retries left)...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries--;
            retryDelay *= 1.5; // Exponential backoff
          } else {
            // Not a quota error or out of retries, throw error
            throw error;
          }
        }
      }
      
      const response = result.response;
      console.log('LLM Handler: Received response from Gemini');

      const toolCalls = [];
      let finalText = '';
      let currentResponse = response; // Start with initial response
      let maxIterations = 5; // Prevent infinite loops
      let iteration = 0;

      // Loop until we get a text response (handle multiple function calls)
      while (iteration < maxIterations) {
        iteration++;
        console.log(`LLM Handler: Iteration ${iteration}/${maxIterations}`);

        // Check if function calls were made
        console.log('LLM Handler: Checking for function calls...');
        const functionCalls = currentResponse.functionCalls();
        console.log(`LLM Handler: Found ${functionCalls ? functionCalls.length : 0} function calls`);
        
        if (functionCalls && functionCalls.length > 0) {
          console.log('LLM Handler: Executing function calls...');
          // Execute all tool calls
          const functionResponses = [];
          
          for (let i = 0; i < functionCalls.length; i++) {
            const funcCall = functionCalls[i];
            const toolName = funcCall.name;
            let toolArgs = funcCall.args;
            
            console.log(`LLM Handler: Executing tool call ${i + 1}/${functionCalls.length}: ${toolName}`);
            console.log(`LLM Handler: Tool args:`, JSON.stringify(toolArgs));
            
            // Ensure toolArgs is an object
            if (typeof toolArgs === 'string') {
              try {
                toolArgs = JSON.parse(toolArgs);
              } catch (e) {
                toolArgs = { query: toolArgs };
              }
            }

            // Call MCP tool
            console.log(`LLM Handler: Calling MCP tool: ${toolName}...`);
            const toolResult = await this.mcpClient.callTool(toolName, toolArgs);
            console.log(`LLM Handler: Tool ${toolName} returned result`);
            console.log(`LLM Handler: Tool result type:`, typeof toolResult);
            console.log(`LLM Handler: Tool result preview:`, JSON.stringify(toolResult).substring(0, 200));
            toolCalls.push({ name: toolName, result: toolResult });

            // Add function response for Gemini
            // Gemini expects function response to be a JSON-serializable object
            const functionResponse = {
              functionResponse: {
                name: toolName,
                response: typeof toolResult === 'string' ? JSON.parse(toolResult) : toolResult
              }
            };
            console.log(`LLM Handler: Function response format:`, JSON.stringify(functionResponse).substring(0, 300));
            functionResponses.push(functionResponse);
          }

          // Send function results back to Gemini
          console.log('LLM Handler: Sending function responses to Gemini...');
          
          // Retry mechanism for quota errors
          let followUpResult;
          let retries = 3;
          let retryDelay = 6000; // 6 seconds (slightly more than API suggests)
          
          while (retries > 0) {
            try {
              followUpResult = await chat.sendMessage(functionResponses);
              break; // Success, exit retry loop
            } catch (error) {
              if (error.status === 429 && retries > 1) {
                // Quota exceeded, wait and retry
                console.log(`LLM Handler: Quota exceeded, waiting ${retryDelay}ms before retry (${retries - 1} retries left)...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retries--;
                retryDelay *= 1.5; // Exponential backoff
              } else {
                // Not a quota error or out of retries, throw error
                throw error;
              }
            }
          }
          
          // Update current response for next iteration
          currentResponse = followUpResult.response;
          
          // Check if this response has more function calls
          const nextFunctionCalls = currentResponse.functionCalls();
          if (!nextFunctionCalls || nextFunctionCalls.length === 0) {
            // No more function calls, break out of loop
            console.log('LLM Handler: No more function calls, extracting text response');
            break;
          } else {
            console.log(`LLM Handler: More function calls detected, continuing loop...`);
          }
        } else {
          // No function calls, break out of loop
          console.log('LLM Handler: No function calls, extracting text response');
          break;
        }
      }
      
      // After loop, extract text from currentResponse (final response after all function calls)
      const finalResponse = currentResponse;
      
      // Debug: Check response structure
      console.log('LLM Handler: Final response type:', typeof finalResponse);
      if (finalResponse) {
        console.log('LLM Handler: Final response keys:', Object.keys(finalResponse));
        console.log('LLM Handler: Final response has text method?', typeof finalResponse.text === 'function');
      }
      
      try {
        // Try text() method on response
        if (typeof finalResponse.text === 'function') {
          finalText = finalResponse.text();
          console.log('LLM Handler: Received final response from Gemini');
          console.log('LLM Handler: Response text length:', finalText?.length || 0);
          console.log('LLM Handler: Response text preview:', finalText?.substring(0, 200) || '(empty)');
        } else {
          console.log('LLM Handler: No text() method found, will try candidates');
          finalText = '';
        }
        
        // If text is empty, try to get candidates
        if (!finalText || finalText.length === 0) {
          console.log('LLM Handler: Warning - Empty response, checking candidates...');
          
          // Try different ways to access candidates
          let candidates = finalResponse.candidates;
          if (!candidates && finalResponse.response) {
            candidates = finalResponse.response.candidates;
          }
          
          if (candidates && candidates.length > 0) {
            console.log('LLM Handler: Found candidates:', candidates.length);
            const firstCandidate = candidates[0];
            
            // Try different candidate structures
            let content = firstCandidate.content;
            if (!content && firstCandidate.parts) {
              content = { parts: firstCandidate.parts };
            }
            
            if (content) {
              let parts = content.parts;
              if (!parts && content.text) {
                parts = [{ text: content.text }];
              }
              
              if (parts && Array.isArray(parts)) {
                const textParts = parts.filter(p => p && p.text);
                if (textParts.length > 0) {
                  finalText = textParts.map(p => p.text).join('\n');
                  console.log('LLM Handler: Extracted text from candidates:', finalText.substring(0, 200));
                } else {
                  console.log('LLM Handler: No text parts found in candidate');
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('LLM Handler: Error getting text from response:', error);
        finalText = 'Üzgünüm, yanıt alınamadı. Lütfen tekrar deneyin.';
      }

      console.log(`LLM Handler: Returning response, content length: ${finalText.length} characters`);
      return {
        content: finalText,
        toolCalls: toolCalls
      };

    } catch (error) {
      console.error('LLM Handler: Processing error occurred');
      console.error('LLM processing error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }
}
