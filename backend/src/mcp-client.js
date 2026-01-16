import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * MCP Client - Communicates with Python MCP Server via stdio
 */
export class MCPClient {
  constructor() {
    this.process = null;
    this.connected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.messageBuffer = '';
  }

  /**
   * Connect to MCP Server by spawning Python process
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Spawn Python process with MCP server script
        // Adjust path based on your project structure
        const serverPath = join(__dirname, '../../mcp-server/server.py');
        
        this.process = spawn('python', [serverPath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Handle stdout (responses from MCP server)
        this.process.stdout.on('data', (data) => {
          this.messageBuffer += data.toString();
          this.processMessageBuffer();
        });

        // Handle stderr (errors)
        this.process.stderr.on('data', (data) => {
          console.error('MCP Server stderr:', data.toString());
        });

        // Handle process exit
        this.process.on('exit', (code) => {
          this.connected = false;
          if (code !== 0) {
            console.error(`MCP Server exited with code ${code}`);
          }
        });

        // Send initialize request
        setTimeout(async () => {
          try {
            await this.initialize();
            this.connected = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        }, 500); // Give process time to start

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Process buffered messages from stdout
   */
  processMessageBuffer() {
    const lines = this.messageBuffer.split('\n');
    this.messageBuffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse MCP message:', line, error);
        }
      }
    }
  }

  /**
   * Handle incoming JSON-RPC messages
   */
  handleMessage(message) {
    const { id, result, error } = message;

    if (id !== undefined && this.pendingRequests.has(id)) {
      const { resolve, reject } = this.pendingRequests.get(id);
      this.pendingRequests.delete(id);

      if (error) {
        reject(new Error(error.message || 'MCP request failed'));
      } else {
        resolve(result);
      }
    }
  }

  /**
   * Send JSON-RPC request to MCP server
   */
  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin.writable) {
        reject(new Error('MCP Server not connected'));
        return;
      }

      const id = ++this.requestId;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });

      const requestLine = JSON.stringify(request) + '\n';
      this.process.stdin.write(requestLine);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('MCP request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Initialize MCP connection
   */
  async initialize() {
    const result = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'weather-assistant-backend',
        version: '1.0.0'
      }
    });
    return result;
  }

  /**
   * List available tools
   */
  async listTools() {
    const result = await this.sendRequest('tools/list');
    return result.tools || [];
  }

  /**
   * Call a tool
   */
  async callTool(name, arguments_) {
    const result = await this.sendRequest('tools/call', {
      name,
      arguments: arguments_
    });
    
    // Parse result content (MCP returns content array)
    if (result.content && result.content.length > 0) {
      const content = result.content[0];
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text);
        } catch (error) {
          return { text: content.text };
        }
      }
    }
    
    return result;
  }

  /**
   * Check if client is connected
   */
  isConnected() {
    return this.connected && this.process && !this.process.killed;
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.connected = false;
    this.pendingRequests.clear();
  }
}
