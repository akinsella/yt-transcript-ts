#!/usr/bin/env ts-node

/**
 * Basic YouTube Transcript Example
 * 
 * This example demonstrates how to fetch a transcript for a YouTube video
 * using the most basic functionality of the library.
 */

import { YouTubeTranscriptApi } from '../src/api';

async function main() {
  try {
    // Initialize the API
    const api = new YouTubeTranscriptApi();

    // Example video ID (Rick Astley - Never Gonna Give You Up)
    const videoId = 'dQw4w9WgXcQ';
    
    console.log(`Fetching transcript for video: ${videoId}`);
    console.log('---');

    // Fetch the transcript in English
    const transcript = await api.fetchTranscript(videoId, ['en']);

    console.log(`Video ID: ${transcript.videoId}`);
    console.log(`Language: ${transcript.language} (${transcript.languageCode})`);
    console.log(`Generated: ${transcript.isGenerated ? 'Yes' : 'No'}`);
    console.log(`Total duration: ${transcript.duration().toFixed(2)} seconds`);
    console.log(`Number of snippets: ${transcript.snippets.length}`);
    console.log('---');

    // Display first 5 snippets
    console.log('First 5 transcript snippets:');
    transcript.snippets.slice(0, 5).forEach((snippet, index) => {
      const timestamp = `${Math.floor(snippet.start / 60)}:${(snippet.start % 60).toFixed(1).padStart(4, '0')}`;
      console.log(`[${timestamp}] ${snippet.text}`);
    });

    console.log('---');
    console.log('Full transcript text (first 200 characters):');
    const fullText = transcript.text();
    console.log(fullText.substring(0, 200) + (fullText.length > 200 ? '...' : ''));

  } catch (error) {
    console.error('Error fetching transcript:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
} 