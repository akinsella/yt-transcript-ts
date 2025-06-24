#!/usr/bin/env ts-node

/**
 * Advanced YouTube Transcript Example
 * 
 * This example demonstrates advanced features including:
 * - Custom HTTP client configuration
 * - Batch processing multiple videos
 * - Custom formatting options
 * - Comprehensive error handling
 * - Performance monitoring
 */

import { YouTubeTranscriptApi } from '../src/api';
import { CouldNotRetrieveTranscript, CouldNotRetrieveTranscriptReason } from '../src/errors';
import axios from 'axios';

interface VideoResult {
  videoId: string;
  success: boolean;
  transcript?: any;
  error?: string;
  duration?: number;
}

async function main() {
  try {
    console.log('Advanced YouTube Transcript Processing');
    console.log('=====================================\n');

    // Create custom HTTP client with timeout and user agent
    const customClient = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
      }
    });

    // Initialize API with custom configuration
    const api = new YouTubeTranscriptApi({
      httpClient: customClient,
      timeout: 30000,
      userAgent: 'Advanced Transcript Fetcher 1.0'
    });

    // List of video IDs to process
    const videoIds = [
      'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
      'ZQUxL4Jm1Lo', // TED Talk
      'jNQXAC9IVRw', // Me at the zoo (first YouTube video)
      'invalid_id',   // Invalid ID for error demonstration
    ];

    console.log(`Processing ${videoIds.length} videos...\n`);

    const results: VideoResult[] = [];

    // Process each video
    for (const videoId of videoIds) {
      console.log(`Processing video: ${videoId}`);
      const startTime = Date.now();

      try {
        // Validate video ID first
        if (!YouTubeTranscriptApi.isValidVideoId(videoId)) {
          throw new Error('Invalid video ID format');
        }

        // Try to list transcripts first
        const transcriptList = await api.listTranscripts(videoId);
        console.log(`  ✓ Found ${transcriptList.transcripts().length} transcript(s)`);

        // Try to get English transcript, fallback to any available
        let transcript;
        try {
          transcript = await api.fetchTranscript(videoId, ['en']);
          console.log(`  ✓ Fetched English transcript`);
        } catch (error) {
          // Fallback to first available transcript
          const availableTranscripts = transcriptList.transcripts();
          if (availableTranscripts.length > 0) {
            // Use the API to fetch the transcript instead of calling fetch directly
            transcript = await api.fetchTranscript(videoId, [availableTranscripts[0].languageCode]);
            console.log(`  ✓ Fetched ${transcript.language} transcript (fallback)`);
          } else {
            throw new Error('No transcripts available');
          }
        }

        const duration = Date.now() - startTime;
        console.log(`  ✓ Completed in ${duration}ms`);
        console.log(`  ✓ ${transcript.snippets.length} snippets, ${transcript.duration().toFixed(2)}s duration\n`);

        results.push({
          videoId,
          success: true,
          transcript,
          duration
        });

      } catch (error) {
        const duration = Date.now() - startTime;
        let errorMessage = 'Unknown error';

        if (error instanceof CouldNotRetrieveTranscript) {
          switch (error.reason) {
            case CouldNotRetrieveTranscriptReason.TranscriptsDisabled:
              errorMessage = 'Transcripts are disabled for this video';
              break;
            case CouldNotRetrieveTranscriptReason.VideoUnavailable:
              errorMessage = 'Video is unavailable';
              break;
            case CouldNotRetrieveTranscriptReason.IpBlocked:
              errorMessage = 'IP blocked by YouTube';
              break;
            case CouldNotRetrieveTranscriptReason.InvalidVideoId:
              errorMessage = 'Invalid video ID';
              break;
            default:
              errorMessage = error.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        console.log(`  ✗ Failed: ${errorMessage} (${duration}ms)\n`);

        results.push({
          videoId,
          success: false,
          error: errorMessage,
          duration
        });
      }
    }

    // Display summary
    console.log('Processing Summary');
    console.log('==================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`Total videos processed: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    
    if (successful.length > 0) {
      const avgDuration = successful.reduce((sum, r) => sum + (r.duration || 0), 0) / successful.length;
      console.log(`Average processing time: ${avgDuration.toFixed(0)}ms`);
    }

    // Display detailed results
    console.log('\nDetailed Results:');
    console.log('-----------------');
    
    results.forEach(result => {
      if (result.success && result.transcript) {
        console.log(`✓ ${result.videoId}: ${result.transcript.language} (${result.transcript.snippets.length} snippets)`);
        
        // Show first snippet as preview
        if (result.transcript.snippets.length > 0) {
          const firstSnippet = result.transcript.snippets[0];
          const preview = firstSnippet.text.length > 50 
            ? firstSnippet.text.substring(0, 50) + '...'
            : firstSnippet.text;
          console.log(`    Preview: "${preview}"`);
        }
      } else {
        console.log(`✗ ${result.videoId}: ${result.error}`);
      }
    });

    // Demonstrate advanced transcript processing
    if (successful.length > 0) {
      console.log('\nAdvanced Processing Example:');
      console.log('----------------------------');
      
      const firstSuccessful = successful[0];
      const transcript = firstSuccessful.transcript;
      
      // Calculate statistics
      const totalWords = transcript.text().split(/\s+/).length;
      const avgWordsPerSnippet = totalWords / transcript.snippets.length;
      const avgSnippetDuration = transcript.snippets.reduce((sum: number, s: any) => sum + s.duration, 0) / transcript.snippets.length;
      
      console.log(`Video: ${firstSuccessful.videoId}`);
      console.log(`Total words: ${totalWords}`);
      console.log(`Average words per snippet: ${avgWordsPerSnippet.toFixed(1)}`);
      console.log(`Average snippet duration: ${avgSnippetDuration.toFixed(2)}s`);
      
      // Find longest snippet
      const longestSnippet = transcript.snippets.reduce((longest: any, current: any) => 
        current.text.length > longest.text.length ? current : longest
      );
      
      console.log(`Longest snippet: "${longestSnippet.text}" (${longestSnippet.text.length} chars)`);
      
      // Export to different formats
      console.log('\nExport Examples:');
      console.log('Raw data format available for JSON export');
      console.log('Iterator support for streaming processing');
      console.log('Text extraction for full-text search indexing');
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