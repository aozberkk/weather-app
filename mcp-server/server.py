#!/usr/bin/env python3
"""
MCP Server for Weather Assistant
Provides tools: get_weather, get_city_image, and get_weather_forecast
Communicates with n8n webhooks via HTTP
"""
    
import asyncio
import json
import sys
import httpx
from typing import Any, Dict, List

# MCP SDK imports - adjust based on actual package name
try:
    from mcp import Server, Tool
    from mcp.server.stdio import stdio_server
except ImportError:
    # Fallback: Manual JSON-RPC over stdio if MCP package structure is different
    print("Warning: MCP package not found. Using fallback implementation.", file=sys.stderr)
    # We'll implement a simple JSON-RPC handler
    pass

# n8n webhook URLs
N8N_WEBHOOK_BASE = "http://localhost:5678/webhook"
WEATHER_WEBHOOK_URL = f"{N8N_WEBHOOK_BASE}/weather"
CITY_IMAGE_WEBHOOK_URL = f"{N8N_WEBHOOK_BASE}/city-image"
FORECAST_WEBHOOK_URL = f"{N8N_WEBHOOK_BASE}/weather-forecast"


async def get_weather(city: str) -> Dict[str, Any]:
    """
    Get weather information for a city.
    Calls n8n webhook which then calls OpenWeatherMap API.
    
    Args:
        city: City name (e.g., "Istanbul", "Ankara")
    
    Returns:
        Dictionary containing weather data (temperature, condition, humidity, etc.)
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                WEATHER_WEBHOOK_URL,
                json={"city": city},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            # Use response.json() directly - test script confirms this works
            return response.json()
    except httpx.ConnectError as e:
        return {
            "error": f"Connection error: Cannot connect to {WEATHER_WEBHOOK_URL}. Is n8n running? Error: {str(e)}",
            "success": False
        }
    except httpx.HTTPStatusError as e:
        return {
            "error": f"HTTP {e.response.status_code} error from webhook: {e.response.text[:200]}",
            "success": False
        }
    except httpx.HTTPError as e:
        return {
            "error": f"HTTP error while calling weather webhook: {type(e).__name__}: {str(e)}",
            "success": False
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {type(e).__name__}: {str(e)}",
            "success": False
        }


async def get_city_image(search_query: str) -> Dict[str, Any]:
    """
    Get a city image from Unsplash based on search query.
    Calls n8n webhook which then calls Unsplash API.
    
    Args:
        search_query: English search query (e.g., "Istanbul rainy city street")
    
    Returns:
        Dictionary containing image URL
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                CITY_IMAGE_WEBHOOK_URL,
                json={"search_query": search_query},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            # Use response.json() directly - test script confirms this works
            return response.json()
    except httpx.ConnectError as e:
        return {
            "error": f"Connection error: Cannot connect to {CITY_IMAGE_WEBHOOK_URL}. Is n8n running? Error: {str(e)}",
            "success": False
        }
    except httpx.HTTPStatusError as e:
        return {
            "error": f"HTTP {e.response.status_code} error from webhook: {e.response.text[:200]}",
            "success": False
        }
    except httpx.HTTPError as e:
        return {
            "error": f"HTTP error while calling image webhook: {type(e).__name__}: {str(e)}",
            "success": False
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {type(e).__name__}: {str(e)}",
            "success": False
        }


async def get_weather_forecast(city: str) -> Dict[str, Any]:
    """
    Get 5-day weather forecast for a city.
    Calls n8n webhook which then calls OpenWeatherMap Forecast API.
    
    Args:
        city: City name (e.g., "Istanbul", "Ankara")
    
    Returns:
        Dictionary containing 5-day forecast data with daily min/max temperatures,
        conditions, humidity, and wind speed
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                FORECAST_WEBHOOK_URL,
                json={"city": city},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            # Use response.json() directly - test script confirms this works
            return response.json()
    except httpx.ConnectError as e:
        return {
            "error": f"Connection error: Cannot connect to {FORECAST_WEBHOOK_URL}. Is n8n running? Error: {str(e)}",
            "success": False
        }
    except httpx.HTTPStatusError as e:
        return {
            "error": f"HTTP {e.response.status_code} error from webhook: {e.response.text[:200]}",
            "success": False
        }
    except httpx.HTTPError as e:
        return {
            "error": f"HTTP error while calling forecast webhook: {type(e).__name__}: {str(e)}",
            "success": False
        }
    except Exception as e:
        return {
            "error": f"Unexpected error: {type(e).__name__}: {str(e)}",
            "success": False
        }


# Tool definitions for MCP
def create_tools() -> List[Dict[str, Any]]:
    """Create tool schemas for MCP"""
    return [
        {
            "name": "get_weather",
            "description": "Get current weather information for a given city. Returns temperature in Celsius, weather condition, humidity, and other details.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "Name of the city (e.g., 'Istanbul', 'Ankara', 'Izmir')"
                    }
                },
                "required": ["city"]
            }
        },
        {
            "name": "get_city_image",
            "description": "Get a contextual, atmospheric city image from Unsplash based on city name, weather condition, and mood. The search query must be in English.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "search_query": {
                        "type": "string",
                        "description": "English search query combining city name, weather, and atmosphere (e.g., 'Istanbul rainy city street', 'Ankara sunny skyline', 'Izmir cloudy evening cityscape')"
                    }
                },
                "required": ["search_query"]
            }
        },
        {
            "name": "get_weather_forecast",
            "description": "Get 5-day weather forecast for a given city. Returns daily min/max temperatures, weather conditions, humidity, and wind speed for the next 5 days.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "Name of the city (e.g., 'Istanbul', 'Ankara', 'Izmir')"
                    }
                },
                "required": ["city"]
            }
        }
    ]


# Handler functions for tool calls
async def handle_tool_call(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Handle tool call requests"""
    if name == "get_weather":
        city = arguments.get("city")
        if not city:
            return {"error": "City parameter is required", "success": False}
        result = await get_weather(city)
        return result
    
    elif name == "get_city_image":
        search_query = arguments.get("search_query")
        if not search_query:
            return {"error": "search_query parameter is required", "success": False}
        result = await get_city_image(search_query)
        return result
    
    elif name == "get_weather_forecast":
        city = arguments.get("city")
        if not city:
            return {"error": "City parameter is required", "success": False}
        result = await get_weather_forecast(city)
        return result
    
    else:
        return {"error": f"Unknown tool: {name}", "success": False}


# Simple JSON-RPC over stdio implementation
# This is a fallback if MCP SDK structure is different
async def handle_jsonrpc_request(request: Dict[str, Any]) -> Dict[str, Any]:
    """Handle JSON-RPC requests over stdio"""
    method = request.get("method")
    params = request.get("params", {})
    request_id = request.get("id")
    
    if method == "tools/list":
        # Return list of available tools
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "tools": create_tools()
            }
        }
    
    elif method == "tools/call":
        # Call a tool
        tool_name = params.get("name")
        tool_args = params.get("arguments", {})
        
        result = await handle_tool_call(tool_name, tool_args)
        
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(result, ensure_ascii=False, indent=2)
                    }
                ]
            }
        }
    
    elif method == "initialize":
        # Initialize request
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "weather-assistant-mcp-server",
                    "version": "1.0.0"
                }
            }
        }
    
    else:
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {
                "code": -32601,
                "message": f"Method not found: {method}"
            }
        }


def read_stdin_line():
    """Blocking read from stdin"""
    return sys.stdin.readline()

async def main():
    """Main entry point - handles stdio communication"""
    # Read from stdin, write to stdout
    # MCP uses JSON-RPC over stdio (line-delimited JSON)
    
    try:
        loop = asyncio.get_event_loop()
        
        while True:
            # Read line from stdin (blocking, but run in executor to not block event loop)
            line = await loop.run_in_executor(None, read_stdin_line)
            
            if not line:
                # EOF - exit gracefully
                break
            
            line = line.strip()
            if not line:
                continue
            
            try:
                request = json.loads(line)
                response = await handle_jsonrpc_request(request)
                
                # Write response to stdout (JSON-RPC responses are line-delimited)
                print(json.dumps(response, ensure_ascii=False), flush=True)
            
            except json.JSONDecodeError as e:
                error_response = {
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {
                        "code": -32700,
                        "message": f"Parse error: {str(e)}"
                    }
                }
                print(json.dumps(error_response), flush=True)
            
            except Exception as e:
                error_response = {
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {
                        "code": -32603,
                        "message": f"Internal error: {str(e)}"
                    }
                }
                print(json.dumps(error_response), flush=True)
    
    except KeyboardInterrupt:
        # Graceful shutdown on Ctrl+C
        pass
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
