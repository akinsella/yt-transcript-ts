import { FetchedTranscriptSnippet } from './models';
import { CheerioAPI, load } from 'cheerio';

/**
 * Parses YouTube transcript XML data into structured transcript snippets.
 */
export class TranscriptParser {
  /** Whether to preserve specified formatting tags in the transcript */
  private readonly preserveFormatting: boolean;
  
  /** Format for link processing (default is "{text} ({url})") */
  private readonly linkFormat: string;

  /** List of HTML formatting tags that can be preserved when preserveFormatting is enabled */
  private static readonly FORMATTING_TAGS = [
    'strong', // important (bold)
    'em',     // emphasized (italic)
    'b',      // bold
    'i',      // italic
    'mark',   // highlighted
    'small',  // smaller
    'del',    // deleted/strikethrough
    'ins',    // inserted/underlined
    'sub',    // subscript
    'sup',    // superscript
    'span',   // generic inline container
    'a',      // hyperlink
  ];

  /**
   * Creates a new transcript parser with additional configuration options.
   * 
   * @param preserveFormatting If true, certain HTML formatting tags will be kept
   * @param linkFormat Format string for rendering links with {text} and {url} placeholders
   */
  static withConfig(preserveFormatting: boolean, linkFormat: string): TranscriptParser {
    if (!linkFormat.includes('{text}') || !linkFormat.includes('{url}')) {
      throw new Error('Link format must contain {text} and {url} placeholders');
    }
    return new TranscriptParser(preserveFormatting, linkFormat);
  }

  /**
   * Creates a new transcript parser.
   * 
   * @param preserveFormatting If true, certain HTML formatting tags will be kept
   * @param linkFormat Format string for rendering links
   */
  constructor(preserveFormatting: boolean = false, linkFormat: string = '{text} ({url})') {
    this.preserveFormatting = preserveFormatting;
    this.linkFormat = linkFormat;
  }

  /**
   * Parses YouTube transcript XML into a collection of transcript snippets.
   * 
   * @param rawData The raw XML string containing transcript data from YouTube
   * @returns Array of transcript snippets
   */
  parse(rawData: string): FetchedTranscriptSnippet[] {
    try {
      // Basic validation for XML structure
      if (!rawData.includes('<transcript') || !rawData.includes('</transcript>')) {
        throw new Error('Invalid transcript XML structure');
      }

      // Check for basic XML well-formedness by counting opening and closing tags
      const openTags = (rawData.match(/<text[^>]*>/g) || []).length;
      const closeTags = (rawData.match(/<\/text>/g) || []).length;
      if (openTags !== closeTags) {
        throw new Error('Malformed XML: mismatched text tags');
      }

      // Load the XML with cheerio
      const $ = load(rawData, {
        xmlMode: true,
      });

      // Check if parsing was successful by looking for transcript element
      if ($('transcript').length === 0) {
        throw new Error('No transcript element found in XML');
      }

      const snippets: FetchedTranscriptSnippet[] = [];

      // Find all text elements
      $('text').each((_index: number, element: any) => {
        const $element = $(element);
        
        // Extract attributes
        const startStr = $element.attr('start');
        const durStr = $element.attr('dur');
        
        if (!startStr || !durStr) {
          return; // Skip elements without required attributes
        }

        const start = parseFloat(startStr);
        const duration = parseFloat(durStr);
        
        if (isNaN(start) || isNaN(duration)) {
          return; // Skip elements with invalid timing
        }

        // Extract and process text content
        let text = $element.html() || '';
        
        // Decode HTML entities first
        text = this.decodeHtmlEntities(text);
        
        // Process formatting
        if (this.preserveFormatting) {
          text = this.processWithFormatting(text);
        } else {
          text = this.htmlToPlainText(text);
        }

        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // Only include non-empty text to match expected behavior
        if (text) {
          snippets.push({
            text,
            start,
            duration,
          });
        }
      });

      return snippets;
    } catch (error) {
      throw new Error(`Failed to parse transcript XML: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Converts HTML to plain text by removing all tags.
   */
  private htmlToPlainText(html: string): string {
    const $ = load(html, { xmlMode: false });
    
    // Process links to include href in plain text
    $('a').each((_index: number, element: any) => {
      const $element = $(element);
      const href = $element.attr('href');
      const linkText = $element.text();
      if (href && linkText) {
        const formattedLink = this.linkFormat
          .replace('{text}', linkText)
          .replace('{url}', href);
        $element.replaceWith(formattedLink);
      } else {
        $element.replaceWith($element.text());
      }
    });
    
    return $.text();
  }

  /**
   * Processes text while preserving specified formatting tags.
   */
  private processWithFormatting(text: string): string {
    const $ = load(`<div>${text}</div>`, { xmlMode: false });
    
    // Process links first to convert them to the desired format
    $('a').each((_index: number, element: any) => {
      const $element = $(element);
      const href = $element.attr('href');
      const linkText = $element.text();
      if (href && linkText) {
        const formattedLink = this.linkFormat
          .replace('{text}', linkText)
          .replace('{url}', href);
        $element.replaceWith(formattedLink);
      } else {
        $element.replaceWith($element.text());
      }
    });

    // Remove non-formatting tags but keep their content
    $('*').not('div, ' + TranscriptParser.FORMATTING_TAGS.join(', ')).each((_index: number, element: any) => {
      const $element = $(element);
      $element.replaceWith($element.html() || $element.text());
    });

    return $('div').html() || '';
  }

  /**
   * Decodes HTML entities in text.
   */
  private decodeHtmlEntities(text: string): string {
    // Create a temporary element to decode entities while preserving HTML structure
    const $ = load(`<div>${text}</div>`, { xmlMode: false });
    
    // Get the HTML content which will have entities decoded
    const decodedHtml = $('div').html() || text;
    
    // If the decoded HTML is different from original, return it, otherwise use manual decoding
    if (decodedHtml !== text) {
      return decodedHtml;
    }
    
    // Fallback to manual entity decoding
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
    };

    return text.replace(/&[#\w]+;/g, (entity) => {
      return entities[entity] || entity;
    });
  }
} 