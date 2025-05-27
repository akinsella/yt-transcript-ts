#!/usr/bin/env ts-node

/**
 * YouTube Transcript List Example
 * 
 * This example demonstrates how to list all available transcripts
 * for a YouTube video, including manually created and auto-generated ones.
 */

import { YouTubeTranscriptApi } from '../src/api';
import { Transcript } from '../src/transcript';

async function main() {
  try {
    // Initialize the API
    const api = new YouTubeTranscriptApi();

    // Example video ID (TED Talk with multiple language transcripts)
    const videoId = 'ZQUxL4Jm1Lo'; // Example TED talk
    
    console.log(`Listing available transcripts for video: ${videoId}`);
    console.log('---');

    // List all available transcripts
    const transcriptList = await api.listTranscripts(videoId);

    console.log(`Video ID: ${transcriptList.videoId}`);
    console.log(`Total transcripts available: ${transcriptList.transcripts().length}`);
    console.log('---');

    // Get all transcripts and filter them
    const allTranscripts = transcriptList.transcripts();
    
    // Display manually created transcripts
    const manualTranscripts = allTranscripts.filter((transcript: Transcript) => !transcript.isGenerated);
    console.log(`Manually created transcripts (${manualTranscripts.length}):`);
    manualTranscripts.forEach((transcript: Transcript) => {
      console.log(`  - ${transcript.language} (${transcript.languageCode})`);
    });

    // Display auto-generated transcripts
    const generatedTranscripts = allTranscripts.filter((transcript: Transcript) => transcript.isGenerated);
    console.log(`\nAuto-generated transcripts (${generatedTranscripts.length}):`);
    generatedTranscripts.forEach((transcript: Transcript) => {
      console.log(`  - ${transcript.language} (${transcript.languageCode})`);
    });

    // Display translatable transcripts
    const translatableTranscripts = allTranscripts.filter((transcript: Transcript) => transcript.isTranslatable());
    console.log(`\nTranslatable transcripts (${translatableTranscripts.length}):`);
    translatableTranscripts.forEach((transcript: Transcript) => {
      console.log(`  - ${transcript.language} (${transcript.languageCode})`);
    });

    // Try to find specific language transcripts
    console.log('\n---');
    console.log('Language-specific searches:');
    
    try {
      const englishTranscript = transcriptList.findTranscript(['en']);
      console.log(`✓ English transcript found: ${englishTranscript.language}`);
    } catch (error) {
      console.log('✗ English transcript not found');
    }

    try {
      const spanishTranscript = transcriptList.findTranscript(['es']);
      console.log(`✓ Spanish transcript found: ${spanishTranscript.language}`);
    } catch (error) {
      console.log('✗ Spanish transcript not found');
    }

    try {
      const frenchTranscript = transcriptList.findTranscript(['fr']);
      console.log(`✓ French transcript found: ${frenchTranscript.language}`);
    } catch (error) {
      console.log('✗ French transcript not found');
    }

    // Demonstrate fetching a transcript if available
    const availableTranscripts = transcriptList.transcripts();
    if (availableTranscripts.length > 0) {
      console.log('\n---');
      console.log('Fetching first available transcript...');
      
      const firstTranscript = availableTranscripts[0];
      // Use the API to fetch the transcript (which provides the HTTP client)
      const fetchedTranscript = await api.fetchTranscript(videoId, [firstTranscript.languageCode]);
      
      console.log(`Fetched: ${fetchedTranscript.language} (${fetchedTranscript.languageCode})`);
      console.log(`Snippets: ${fetchedTranscript.snippets.length}`);
      console.log(`Duration: ${fetchedTranscript.duration().toFixed(2)} seconds`);
      
      // Show first snippet
      if (fetchedTranscript.snippets.length > 0) {
        const firstSnippet = fetchedTranscript.snippets[0];
        console.log(`First snippet: "${firstSnippet.text}"`);
      }
    }

  } catch (error) {
    console.error('Error listing transcripts:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
} 