#!/usr/bin/env ts-node

/**
 * YouTube Video Details Example
 * 
 * This example demonstrates how to fetch detailed information about
 * YouTube videos including metadata, thumbnails, and video details.
 */

import { YouTubeTranscriptApi } from '../src/api';
import { Transcript } from '../src/transcript';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

function formatNumber(num: string | number): string {
  const n = typeof num === 'string' ? parseInt(num) : num;
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  } else if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return n.toString();
}

async function main() {
  try {
    // Initialize the API
    const api = new YouTubeTranscriptApi();

    // Example video IDs
    const videoIds = [
      'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
      'ZQUxL4Jm1Lo', // TED Talk
      'jNQXAC9IVRw', // Me at the zoo (first YouTube video)
    ];

    console.log('YouTube Video Details Fetcher');
    console.log('=============================\n');

    for (const videoId of videoIds) {
      console.log(`Fetching details for video: ${videoId}`);
      console.log('---');

      try {
        // Fetch video details
        const videoDetails = await api.fetchVideoDetails(videoId);

        console.log(`Title: ${videoDetails.title}`);
        console.log(`Author: ${videoDetails.author}`);
        console.log(`Channel ID: ${videoDetails.channelId}`);
        console.log(`Duration: ${formatDuration(videoDetails.lengthSeconds)}`);
        console.log(`View Count: ${formatNumber(videoDetails.viewCount)}`);
        console.log(`Live Content: ${videoDetails.isLiveContent ? 'Yes' : 'No'}`);
        
        if (videoDetails.shortDescription) {
          const description = videoDetails.shortDescription.length > 100 
            ? videoDetails.shortDescription.substring(0, 100) + '...'
            : videoDetails.shortDescription;
          console.log(`Description: ${description}`);
        }

        // Display thumbnails
        if (videoDetails.thumbnails && videoDetails.thumbnails.length > 0) {
          console.log(`Thumbnails (${videoDetails.thumbnails.length}):`);
          videoDetails.thumbnails.forEach((thumbnail, index) => {
            console.log(`  ${index + 1}. ${thumbnail.width}x${thumbnail.height} - ${thumbnail.url}`);
          });
        }

        // Try to get transcript info as well
        try {
          const transcriptList = await api.listTranscripts(videoId);
          const allTranscripts = transcriptList.transcripts();
          console.log(`Transcripts: ${allTranscripts.length} available`);
          
          // Filter transcripts by type
          const manualTranscripts = allTranscripts.filter((transcript: Transcript) => !transcript.isGenerated);
          const generatedTranscripts = allTranscripts.filter((transcript: Transcript) => transcript.isGenerated);
          
          if (manualTranscripts.length > 0) {
            console.log(`  - ${manualTranscripts.length} manually created`);
          }
          if (generatedTranscripts.length > 0) {
            console.log(`  - ${generatedTranscripts.length} auto-generated`);
          }
        } catch (error) {
          console.log('Transcripts: Not available');
        }

        console.log('');

      } catch (error) {
        console.log(`Error fetching details: ${error}`);
        console.log('');
      }
    }

    // Demonstrate comprehensive video information fetching
    console.log('Comprehensive Video Information Example');
    console.log('=======================================');
    
    const exampleVideoId = videoIds[0];
    console.log(`Fetching comprehensive info for: ${exampleVideoId}\n`);

    try {
      const videoInfos = await api.fetchVideoInfos(exampleVideoId);

      console.log('Video Details:');
      console.log(`  Title: ${videoInfos.videoDetails.title}`);
      console.log(`  Author: ${videoInfos.videoDetails.author}`);
      console.log(`  Duration: ${formatDuration(videoInfos.videoDetails.lengthSeconds)}`);
      console.log(`  Views: ${formatNumber(videoInfos.videoDetails.viewCount)}`);

      console.log('\nMicroformat:');
      if (videoInfos.microformat.title) {
        console.log(`  Title: ${videoInfos.microformat.title}`);
      }
      if (videoInfos.microformat.description) {
        const desc = videoInfos.microformat.description.length > 100 
          ? videoInfos.microformat.description.substring(0, 100) + '...'
          : videoInfos.microformat.description;
        console.log(`  Description: ${desc}`);
      }

      console.log('\nStreaming Data:');
      console.log(`  Expires in: ${videoInfos.streamingData.expiresInSeconds} seconds`);
      console.log(`  Formats available: ${videoInfos.streamingData.formats?.length || 0}`);
      console.log(`  Adaptive formats: ${videoInfos.streamingData.adaptiveFormats?.length || 0}`);

      console.log('\nTranscript Information:');
      const transcripts = videoInfos.transcriptList.transcripts();
      console.log(`  Total transcripts: ${transcripts.length}`);
      
      transcripts.forEach((transcript: Transcript) => {
        const type = transcript.isGenerated ? 'Auto-generated' : 'Manual';
        const translatable = transcript.isTranslatable() ? ' (Translatable)' : '';
        console.log(`    - ${transcript.language} (${transcript.languageCode}) - ${type}${translatable}`);
      });

      // Demonstrate URL extraction
      console.log('\nURL Extraction Examples:');
      const testUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'https://www.youtube.com/v/dQw4w9WgXcQ',
        'invalid-url'
      ];

      testUrls.forEach(url => {
        const extractedId = YouTubeTranscriptApi.extractVideoId(url);
        const isValid = extractedId ? YouTubeTranscriptApi.isValidVideoId(extractedId) : false;
        console.log(`  ${url} -> ${extractedId || 'null'} (${isValid ? 'valid' : 'invalid'})`);
      });

    } catch (error) {
      console.error('Error fetching comprehensive info:', error);
    }

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
} 