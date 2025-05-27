import { CouldNotRetrieveTranscript } from './errors';

/**
 * Parser for extracting JavaScript variables from HTML content.
 */
export class JsVarParser {
  /** The name of the JavaScript variable to extract */
  private readonly varName: string;

  /**
   * Creates a new JavaScript variable parser for the specified variable name.
   * 
   * @param varName The name of the JavaScript variable to extract
   */
  constructor(varName: string) {
    this.varName = varName;
  }

  /**
   * Parses a JavaScript variable from HTML content and converts it to a JSON value.
   * 
   * @param html The HTML content containing the JavaScript variable
   * @param videoId The YouTube video ID (used for error reporting)
   * @returns The parsed JSON value
   */
  parse(html: string, videoId: string): any {
    // First try to find the variable using a character-by-character approach
    try {
      return this.parseCharByChar(html, videoId);
    } catch (error) {
      // Fall back to regex as a backup strategy
      return this.parseWithRegex(html, videoId);
    }
  }

  /**
   * Parses a JavaScript variable using a character-by-character approach.
   * 
   * @param html The HTML content containing the JavaScript variable
   * @param videoId The YouTube video ID (used for error reporting)
   * @returns The parsed JSON value
   */
  private parseCharByChar(html: string, videoId: string): any {
    // Step 1: Split by "var {varName}"
    const varMarker = `var ${this.varName}`;
    let parts = html.split(varMarker);

    if (parts.length <= 1) {
      // Try with just the var name (without 'var' prefix)
      parts = html.split(this.varName);
      if (parts.length <= 1) {
        throw CouldNotRetrieveTranscript.youTubeDataUnparsable(videoId);
      }
    }

    // Step 2: Find the opening brace
    const afterVar = parts[1];
    const openBraceIndex = afterVar.indexOf('{');
    
    if (openBraceIndex === -1) {
      throw CouldNotRetrieveTranscript.youTubeDataUnparsable(videoId);
    }

    // Step 3: Extract the object using brace matching
    const startIndex = openBraceIndex;
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let stringChar = '';
    let endIndex = -1;

    for (let i = startIndex; i < afterVar.length; i++) {
      const char = afterVar[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
        } else if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      } else {
        if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
    }

    if (endIndex === -1) {
      throw CouldNotRetrieveTranscript.youTubeDataUnparsable(videoId);
    }

    // Step 4: Extract and parse the JSON
    const jsonStr = afterVar.substring(startIndex, endIndex + 1);
    
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      throw CouldNotRetrieveTranscript.youTubeDataUnparsable(videoId);
    }
  }

  /**
   * Parses a JavaScript variable using regular expressions as a fallback.
   * 
   * @param html The HTML content containing the JavaScript variable
   * @param videoId The YouTube video ID (used for error reporting)
   * @returns The parsed JSON value
   */
  private parseWithRegex(html: string, videoId: string): any {
    // Create regex patterns to match the variable assignment
    const patterns = [
      new RegExp(`var\\s+${this.varName}\\s*=\\s*({[^}]*(?:{[^}]*}[^}]*)*});`, 's'),
      new RegExp(`${this.varName}\\s*=\\s*({[^}]*(?:{[^}]*}[^}]*)*});`, 's'),
      new RegExp(`"${this.varName}"\\s*:\\s*({[^}]*(?:{[^}]*}[^}]*)*})`, 's'),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          // Convert single quotes to double quotes for valid JSON
          let jsonStr = match[1];
          
          // Replace single quotes with double quotes, but be careful about escaped quotes
          jsonStr = jsonStr.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
          
          return JSON.parse(jsonStr);
        } catch (error) {
          // Continue to next pattern
          continue;
        }
      }
    }

    throw CouldNotRetrieveTranscript.youTubeDataUnparsable(videoId);
  }
} 