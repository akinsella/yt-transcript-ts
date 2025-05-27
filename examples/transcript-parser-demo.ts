#!/usr/bin/env ts-node

/**
 * Transcript Parser Demo
 * 
 * This example demonstrates the transcript parser functionality,
 * including different formatting options and custom link formatting.
 */

import { TranscriptParser } from '../src/transcript-parser';

// Sample XML data that might come from YouTube
const sampleTranscriptXml = `<?xml version="1.0" encoding="utf-8" ?>
<transcript>
    <text start="0.0" dur="3.5">Welcome to this <b>amazing</b> tutorial!</text>
    <text start="3.5" dur="4.2">Today we'll learn about <i>transcript parsing</i> and <strong>formatting</strong>.</text>
    <text start="7.7" dur="5.1">You can visit <a href="https://example.com">our website</a> for more information.</text>
    <text start="12.8" dur="3.8">We also have <span class="highlight">highlighted content</span> here.</text>
    <text start="16.6" dur="4.5">Special characters like &amp; and &lt;brackets&gt; are properly handled.</text>
    <text start="21.1" dur="3.2">This includes &quot;quoted text&quot; and &#39;apostrophes&#39;.</text>
    <text start="24.3" dur="2.9">Some content has <br/> line breaks too.</text>
    <text start="27.2" dur="4.1">Mathematical expressions like E=mc<sup>2</sup> work as well.</text>
    <text start="31.3" dur="3.7">And we can handle <del>deleted</del> and <ins>inserted</ins> text.</text>
    <text start="35.0" dur="2.8">Finally, some <mark>marked</mark> content to finish.</text>
</transcript>`;

function main() {
  console.log('Transcript Parser Demo');
  console.log('=====================\n');

  // Demo 1: Basic parsing without formatting
  console.log('Demo 1: Basic parsing (no formatting preservation)');
  console.log('--------------------------------------------------');
  
  const basicParser = new TranscriptParser(false);
  const basicSnippets = basicParser.parse(sampleTranscriptXml);
  
  console.log(`Parsed ${basicSnippets.length} snippets:\n`);
  
  basicSnippets.forEach((snippet, index) => {
    const timestamp = `${Math.floor(snippet.start / 60)}:${(snippet.start % 60).toFixed(1).padStart(4, '0')}`;
    console.log(`${index + 1}. [${timestamp}] ${snippet.text}`);
  });

  // Demo 2: Parsing with formatting preservation
  console.log('\n\nDemo 2: Parsing with formatting preservation');
  console.log('--------------------------------------------');
  
  const formattingParser = new TranscriptParser(true);
  const formattedSnippets = formattingParser.parse(sampleTranscriptXml);
  
  console.log(`Parsed ${formattedSnippets.length} snippets with formatting:\n`);
  
  formattedSnippets.forEach((snippet, index) => {
    const timestamp = `${Math.floor(snippet.start / 60)}:${(snippet.start % 60).toFixed(1).padStart(4, '0')}`;
    console.log(`${index + 1}. [${timestamp}] ${snippet.text}`);
  });

  // Demo 3: Custom link formatting
  console.log('\n\nDemo 3: Custom link formatting');
  console.log('------------------------------');
  
  const customLinkParser = TranscriptParser.withConfig(true, '[{text}]({url})');
  const customLinkSnippets = customLinkParser.parse(sampleTranscriptXml);
  
  console.log('Using Markdown-style link format: [{text}]({url})\n');
  
  customLinkSnippets.forEach((snippet, index) => {
    const timestamp = `${Math.floor(snippet.start / 60)}:${(snippet.start % 60).toFixed(1).padStart(4, '0')}`;
    console.log(`${index + 1}. [${timestamp}] ${snippet.text}`);
  });

  // Demo 4: Different link formats
  console.log('\n\nDemo 4: Various link formatting options');
  console.log('---------------------------------------');
  
  const linkFormats = [
    { name: 'Default', format: '{text} ({url})' },
    { name: 'Markdown', format: '[{text}]({url})' },
    { name: 'HTML-like', format: '<a href="{url}">{text}</a>' },
    { name: 'Wiki-style', format: '[[{url}|{text}]]' },
    { name: 'Plain', format: '{text}: {url}' }
  ];

  const xmlWithLink = `
    <transcript>
        <text start="0.0" dur="3.0">Check out <a href="https://example.com">our website</a> for details.</text>
    </transcript>
  `;

  linkFormats.forEach(format => {
    try {
      const parser = TranscriptParser.withConfig(true, format.format);
      const snippets = parser.parse(xmlWithLink);
      console.log(`${format.name}: ${snippets[0].text}`);
    } catch (error) {
      console.log(`${format.name}: Error - ${error}`);
    }
  });

  // Demo 5: Error handling
  console.log('\n\nDemo 5: Error handling');
  console.log('----------------------');
  
  const errorCases = [
    {
      name: 'Malformed XML',
      xml: '<transcript><text start="0.0" dur="1.0">Unclosed tag</transcript>'
    },
    {
      name: 'Missing attributes',
      xml: '<transcript><text>No timing attributes</text></transcript>'
    },
    {
      name: 'Invalid timing',
      xml: '<transcript><text start="invalid" dur="also_invalid">Bad timing</text></transcript>'
    },
    {
      name: 'Empty transcript',
      xml: '<transcript></transcript>'
    }
  ];

  errorCases.forEach(testCase => {
    try {
      const parser = new TranscriptParser(false);
      const snippets = parser.parse(testCase.xml);
      console.log(`${testCase.name}: Parsed ${snippets.length} snippets`);
    } catch (error) {
      console.log(`${testCase.name}: Error - ${error}`);
    }
  });

  // Demo 6: Performance and statistics
  console.log('\n\nDemo 6: Performance and statistics');
  console.log('----------------------------------');
  
  const startTime = Date.now();
  const perfSnippets = basicParser.parse(sampleTranscriptXml);
  const parseTime = Date.now() - startTime;
  
  // Calculate statistics
  const totalDuration = perfSnippets.reduce((sum, snippet) => sum + snippet.duration, 0);
  const totalText = perfSnippets.map(s => s.text).join(' ');
  const totalWords = totalText.split(/\s+/).length;
  const avgWordsPerSnippet = totalWords / perfSnippets.length;
  const avgSnippetDuration = totalDuration / perfSnippets.length;
  
  console.log(`Parse time: ${parseTime}ms`);
  console.log(`Total snippets: ${perfSnippets.length}`);
  console.log(`Total duration: ${totalDuration.toFixed(2)} seconds`);
  console.log(`Total words: ${totalWords}`);
  console.log(`Average words per snippet: ${avgWordsPerSnippet.toFixed(1)}`);
  console.log(`Average snippet duration: ${avgSnippetDuration.toFixed(2)} seconds`);
  console.log(`Words per second: ${(totalWords / totalDuration).toFixed(1)}`);

  // Demo 7: Complex XML with nested elements
  console.log('\n\nDemo 7: Complex nested XML');
  console.log('---------------------------');
  
  const complexXml = `
    <transcript>
        <text start="0.0" dur="5.0">
            This is <b>bold with <i>nested italic</i> text</b> and more content.
        </text>
        <text start="5.0" dur="4.0">
            Here's a <a href="https://example.com">link with <strong>bold text</strong> inside</a>.
        </text>
        <text start="9.0" dur="3.0">
            Mathematical: H<sub>2</sub>O and E=mc<sup>2</sup> with <mark>highlighting</mark>.
        </text>
    </transcript>
  `;

  console.log('Plain text version:');
  const plainParser = new TranscriptParser(false);
  const plainComplex = plainParser.parse(complexXml);
  plainComplex.forEach((snippet, index) => {
    console.log(`${index + 1}. ${snippet.text}`);
  });

  console.log('\nFormatted version:');
  const formattedParser = new TranscriptParser(true);
  const formattedComplex = formattedParser.parse(complexXml);
  formattedComplex.forEach((snippet, index) => {
    console.log(`${index + 1}. ${snippet.text}`);
  });

  console.log('\n✓ Transcript Parser Demo completed successfully!');
}

// Run the demo
if (require.main === module) {
  main();
} 