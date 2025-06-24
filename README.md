# yt-transcript-ts

`yt-transcript-ts` is a TypeScript library for fetching and working with YouTube video transcripts. It allows you to retrieve transcripts in various languages, list available transcripts for a video, and fetch video details. This is a TypeScript port of the Rust library [yt-transcript-rs](https://github.com/akinsella/yt-transcript-rs).

[![npm version](https://img.shields.io/npm/v/akinsella/yt-transcript-ts.svg)](https://www.npmjs.com/package/yt-transcript-ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**🚀 Version 0.2.0 - Now with InnerTube API!**  
This version includes a complete rewrite to use YouTube's InnerTube API, making transcript fetching reliable and future-proof. No code changes required for existing users!

This project is heavily inspired by the Python module [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) originally developed by [Jonas Depoix](https://github.com/jdepoix) and the Rust port [yt-transcript-rs](https://github.com/akinsella/yt-transcript-rs) by [Alexis Kinsella](https://github.com/akinsella).

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Fetch a transcript](#fetch-a-transcript)
  - [List available transcripts](#list-available-transcripts)
  - [Fetch video details](#fetch-video-details)
  - [Fetch microformat data](#fetch-microformat-data)
  - [Fetch streaming data](#fetch-streaming-data)
  - [Fetch all video information at once](#fetch-all-video-information-at-once)
  - [Customize transcript formatting](#customize-transcript-formatting)
- [Requirements](#requirements)
- [Advanced Usage](#advanced-usage)
  - [Using Custom HTTP Clients](#using-custom-http-clients)
  - [Using Cookie Authentication](#using-cookie-authentication)
  - [Working with Translations](#working-with-translations)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [API Reference](#api-reference)
- [License](#license)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

## Features

- **🔥 InnerTube API Integration**: Uses YouTube's internal API for reliable transcript fetching
- **🚀 Future-Proof**: No more broken transcripts due to YouTube changes
- Fetch transcripts from YouTube videos in various languages
- List all available transcripts for a video
- Retrieve translations of transcripts
- Get detailed information about YouTube videos
- Access video microformat data including available countries and embed information
- Retrieve streaming formats and quality options for videos
- Fetch all video information in a single request for optimal performance
- Support for custom HTTP client configuration and cookie authentication
- Customizable HTML processing with configurable link formatting
- Robust HTML entity handling and whitespace preservation
- Enhanced error handling with specific error types including PO Token requirements
- Full TypeScript support with comprehensive type definitions

## Installation

Install `yt-transcript-ts` using npm:

```bash
npm install yt-transcript-ts
```

Or using yarn:

```bash
yarn add yt-transcript-ts
```

## Usage

### Fetch a transcript

```typescript
import { YouTubeTranscriptApi } from 'yt-transcript-ts';

/**
 * This example demonstrates how to fetch a transcript from a YouTube video.
 *
 * It shows:
 * 1. Creating a YouTubeTranscriptApi instance
 * 2. Fetching a transcript for a video in a specific language
 * 3. Displaying the transcript content
 */
async function main() {
  try {
    // Initialize the YouTubeTranscriptApi
    const api = new YouTubeTranscriptApi();

    // Ted Talk video ID
    const videoId = '5MuIMqhT8DM';

    // Language preference (English)
    const languages = ['en'];

    // Fetch the transcript
    console.log(`Fetching transcript for video ID: ${videoId}`);

    const transcript = await api.fetchTranscript(videoId, languages);

    console.log('Successfully fetched transcript!');
    console.log(`Video ID: ${transcript.videoId}`);
    console.log(`Language: ${transcript.language} (${transcript.languageCode})`);
    console.log(`Is auto-generated: ${transcript.isGenerated}`);
    console.log(`Number of snippets: ${transcript.snippets.length}`);
    console.log('\nTranscript content:');

    // Display the first 5 snippets
    transcript.snippets.slice(0, 5).forEach((snippet, i) => {
      console.log(
        `[${snippet.start.toFixed(1)}-${(snippet.start + snippet.duration).toFixed(1)}s] ${snippet.text}`
      );
    });

    console.log('... (truncated)');
  } catch (error) {
    console.error('Failed to fetch transcript:', error);
  }
}

main();
```

### List available transcripts

```typescript
import { YouTubeTranscriptApi } from 'yt-transcript-ts';

/**
 * This example demonstrates how to list all available transcripts for a YouTube video.
 *
 * It shows:
 * 1. Creating a YouTubeTranscriptApi instance
 * 2. Listing all available transcripts
 * 3. Displaying information about each transcript, including whether it's translatable
 */
async function main() {
  try {
    // Initialize the YouTubeTranscriptApi
    const api = new YouTubeTranscriptApi();

    // Ted Talk video ID (known to have multiple language transcripts)
    const videoId = 'arj7oStGLkU';

    // List available transcripts
    console.log(`Listing available transcripts for video ID: ${videoId}`);

    const transcriptList = await api.listTranscripts(videoId);

    console.log('Successfully retrieved transcript list!');
    console.log(`Video ID: ${transcriptList.videoId}`);

    // Get different types of transcripts
    const allTranscripts = transcriptList.transcripts();
    const manualTranscripts = transcriptList.manuallyCreated();
    const generatedTranscripts = transcriptList.generated();
    const translatableTranscripts = transcriptList.translatable();

    console.log('\nAvailable transcripts:');
    allTranscripts.forEach((transcript, index) => {
      const translatable = transcript.isTranslatable ? '[translatable]' : '';
      const type = transcript.isGenerated ? '[auto-generated]' : '[manual]';
      
      console.log(
        `${index + 1}: ${transcript.language} (${transcript.languageCode}) ${type} ${translatable}`
      );

      // If this transcript is translatable, show available translation languages
      if (transcript.isTranslatable && index === 0) {
        console.log('  Available translations:');
        transcript.translationLanguages?.slice(0, 5).forEach((lang, i) => {
          console.log(`    ${i + 1}: ${lang.languageName} (${lang.languageCode})`);
        });

        if (transcript.translationLanguages && transcript.translationLanguages.length > 5) {
          console.log(`    ... and ${transcript.translationLanguages.length - 5} more`);
        }
      }
    });

    console.log(`\nTotal transcripts: ${allTranscripts.length}`);
    console.log(`Manual transcripts: ${manualTranscripts.length}`);
    console.log(`Auto-generated transcripts: ${generatedTranscripts.length}`);
    console.log(`Translatable transcripts: ${translatableTranscripts.length}`);
  } catch (error) {
    console.error('Failed to list transcripts:', error);
  }
}

main();
```

### Fetch video details

```typescript
import { YouTubeTranscriptApi } from 'yt-transcript-ts';

/**
 * This example demonstrates how to fetch video details using the YouTube Transcript API.
 *
 * It shows:
 * 1. Creating a YouTubeTranscriptApi instance
 * 2. Fetching video details for a given video ID
 * 3. Displaying the video information including title, author, view count, etc.
 */
async function main() {
  try {
    console.log('YouTube Video Details Example');
    console.log('------------------------------');

    // Initialize the YouTubeTranscriptApi
    const api = new YouTubeTranscriptApi();

    // Ted Talk video ID
    const videoId = 'arj7oStGLkU';

    console.log(`Fetching video details for: ${videoId}`);

    const details = await api.fetchVideoDetails(videoId);

    console.log('\nVideo Details:');
    console.log('-------------');
    console.log(`Video ID: ${details.videoId}`);
    console.log(`Title: ${details.title}`);
    console.log(`Author: ${details.author}`);
    console.log(`Channel ID: ${details.channelId}`);
    console.log(`View Count: ${details.viewCount}`);
    console.log(`Length: ${details.lengthSeconds} seconds`);
    console.log(`Is Live Content: ${details.isLiveContent}`);

    // Print keywords if available
    if (details.keywords && details.keywords.length > 0) {
      console.log('\nKeywords:');
      details.keywords.slice(0, 10).forEach((keyword, i) => {
        console.log(`  ${i + 1}: ${keyword}`);
      });

      if (details.keywords.length > 10) {
        console.log(`  ... and ${details.keywords.length - 10} more`);
      }
    }

    // Print thumbnail information
    console.log(`\nThumbnails: ${details.thumbnails.length} available`);
    details.thumbnails.forEach((thumb, i) => {
      console.log(`  ${i + 1}: ${thumb.width}x${thumb.height} - ${thumb.url}`);
    });

    // Print a truncated description
    console.log('\nDescription:');
    const description = details.shortDescription.length > 300
      ? `${details.shortDescription.substring(0, 300)}...`
      : details.shortDescription;
    console.log(description);
  } catch (error) {
    console.error('Failed to fetch video details:', error);
  }
}

main();
```

### Fetch microformat data

```typescript
import { YouTubeTranscriptApi } from 'yt-transcript-ts';

async function main() {
  try {
    // Initialize the YouTubeTranscriptApi
    const api = new YouTubeTranscriptApi();

    // Ted Talk video ID
    const videoId = 'arj7oStGLkU';

    console.log(`Fetching microformat data for: ${videoId}`);

    const videoInfos = await api.fetchVideoInfos(videoId);
    const microformat = videoInfos.microformat;

    console.log('\nMicroformat Data:');
    console.log('-----------------');

    // Print video title and channel info
    if (microformat.title) {
      console.log(`Title: ${microformat.title}`);
    }
    if (microformat.ownerChannelName) {
      console.log(`Channel: ${microformat.ownerChannelName}`);
    }

    // Print video stats
    if (microformat.viewCount) {
      console.log(`View Count: ${microformat.viewCount}`);
    }

    // Print video status and category
    if (microformat.category) {
      console.log(`Category: ${microformat.category}`);
    }
    if (microformat.isUnlisted !== undefined) {
      console.log(`Is Unlisted: ${microformat.isUnlisted}`);
    }
    if (microformat.isFamilySafe !== undefined) {
      console.log(`Is Family Safe: ${microformat.isFamilySafe}`);
    }

    // Print countries where video is available
    if (microformat.availableCountries) {
      console.log(`Available in ${microformat.availableCountries.length} countries`);
    }

    // Print embed information
    if (microformat.embed?.iframeUrl) {
      console.log(`Embed URL: ${microformat.embed.iframeUrl}`);
    }
  } catch (error) {
    console.error('Failed to fetch microformat data:', error);
  }
}

main();
```

### Fetch streaming data

```typescript
import { YouTubeTranscriptApi } from 'yt-transcript-ts';

async function main() {
  try {
    console.log('YouTube Streaming Data Example');
    console.log('------------------------------');

    // Initialize the YouTubeTranscriptApi
    const api = new YouTubeTranscriptApi();

    // Ted Talk video ID
    const videoId = 'arj7oStGLkU';

    console.log(`Fetching streaming data for: ${videoId}`);

    const videoInfos = await api.fetchVideoInfos(videoId);
    const streamingData = videoInfos.streamingData;

    console.log('\nStreaming Data:');
    console.log('--------------');
    console.log(`Expires in: ${streamingData.expiresInSeconds} seconds`);
    
    // Display basic format counts
    console.log(`\nCombined Formats (video+audio): ${streamingData.formats?.length || 0}`);
    console.log(`Adaptive Formats: ${streamingData.adaptiveFormats?.length || 0}`);
    
    // Example of accessing video format information
    if (streamingData.formats && streamingData.formats.length > 0) {
      const format = streamingData.formats[0];
      console.log('\nSample format information:');
      console.log(`  ITAG: ${format.itag}`);
      if (format.width && format.height) {
        console.log(`  Resolution: ${format.width}x${format.height}`);
      }
      console.log(`  Bitrate: ${format.bitrate} bps`);
      console.log(`  MIME type: ${format.mimeType}`);
    }
    
    // Count video and audio format types
    if (streamingData.adaptiveFormats) {
      const videoCount = streamingData.adaptiveFormats
        .filter(f => f.mimeType.startsWith('video/'))
        .length;
        
      const audioCount = streamingData.adaptiveFormats
        .filter(f => f.mimeType.startsWith('audio/'))
        .length;
        
      console.log('\nAdaptive format breakdown:');
      console.log(`  Video formats: ${videoCount}`);
      console.log(`  Audio formats: ${audioCount}`);
    }
  } catch (error) {
    console.error('Failed to fetch streaming data:', error);
  }
}

main();
```

### Fetch all video information at once

```typescript
import { YouTubeTranscriptApi } from 'yt-transcript-ts';

async function main() {
  try {
    console.log('YouTube Video Infos (All-in-One) Example');
    console.log('----------------------------------------');

    // Initialize the YouTubeTranscriptApi
    const api = new YouTubeTranscriptApi();

    // Ted Talk video ID
    const videoId = 'arj7oStGLkU';

    console.log('Fetching all video information in a single request...');

    const infos = await api.fetchVideoInfos(videoId);

    // Access video details
    console.log('\nVideo Details:');
    console.log(`Title: ${infos.videoDetails.title}`);
    console.log(`Author: ${infos.videoDetails.author}`);
    console.log(`Length: ${infos.videoDetails.lengthSeconds} seconds`);
    
    // Access microformat data
    if (infos.microformat.category) {
      console.log(`Category: ${infos.microformat.category}`);
    }
    
    if (infos.microformat.availableCountries) {
      console.log(`Available in ${infos.microformat.availableCountries.length} countries`);
    }
    
    // Access streaming data
    console.log('\nStreaming Options:');
    console.log(`Video formats: ${infos.streamingData.formats?.length || 0}`);
    console.log(`Adaptive formats: ${infos.streamingData.adaptiveFormats?.length || 0}`);
    
    // Find highest resolution
    const highestRes = infos.streamingData.adaptiveFormats
      ?.map(f => f.height)
      .filter(h => h !== undefined)
      .reduce((max, current) => Math.max(max || 0, current || 0), 0) || 0;
    console.log(`Highest resolution: ${highestRes}p`);
    
    // Access transcript information
    const transcriptCount = infos.transcriptList.transcripts().length;
    console.log(`\nAvailable transcripts: ${transcriptCount}`);
    
    console.log('\nAll data retrieved in a single network request!');
  } catch (error) {
    console.error('Failed to fetch video information:', error);
  }
}

main();
```

### Customize transcript formatting

```typescript
import { TranscriptParser } from 'yt-transcript-ts';

async function main() {
  try {
    // Create a transcript parser with default settings (plain text, standard link format)
    const defaultParser = new TranscriptParser(false);
    
    // Create a parser that preserves HTML formatting tags
    const formattedParser = new TranscriptParser(true);
    
    // Create a parser with custom link format (Markdown style)
    const markdownParser = TranscriptParser.withConfig(false, '[{text}]({url})');
    
    // Create a parser with custom link format (HTML style)
    const htmlParser = TranscriptParser.withConfig(false, '<a href="{url}">{text}</a>');
    
    // Sample XML content with a link (typical YouTube transcript format)
    const xmlContent = `
      <transcript>
        <text start="0.0" dur="3.0">Check out <a href="https://example.com">this link</a> for more info.</text>
      </transcript>
    `;
    
    // Process the XML with different parsers
    const defaultSnippets = defaultParser.parse(xmlContent);
    const formattedSnippets = formattedParser.parse(xmlContent);
    const markdownSnippets = markdownParser.parse(xmlContent);
    const htmlSnippets = htmlParser.parse(xmlContent);
    
    console.log('Default format:', defaultSnippets[0].text);
    console.log('Preserved HTML:', formattedSnippets[0].text);
    console.log('Markdown links:', markdownSnippets[0].text);
    console.log('HTML links:', htmlSnippets[0].text);
  } catch (error) {
    console.error('Error processing transcript:', error);
  }
}

main();
```

This feature is particularly useful when you need to:
- Format transcript links according to specific output needs
- Create transcripts for different display contexts (web, terminal, documents)
- Preserve certain HTML tags for styling while removing others
- Ensure proper entity decoding for symbols like apostrophes and quotes

## Requirements

- Node.js 14 or higher
- TypeScript 4.5 or higher (for development)

## Advanced Usage

### Using Custom HTTP Clients

You can configure the API to use a custom HTTP client with specific settings:

```typescript
import { YouTubeTranscriptApi } from 'yt-transcript-ts';
import axios from 'axios';

async function main() {
  try {
    // Create a custom HTTP client with specific configuration
    const customClient = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
      },
      // Add proxy configuration if needed
      // proxy: {
      //   host: 'proxy-server.com',
      //   port: 8080,
      //   auth: {
      //     username: 'username',
      //     password: 'password'
      //   }
      // }
    });

    // Initialize the API with custom HTTP client
    const api = new YouTubeTranscriptApi({
      httpClient: customClient,
      timeout: 30000,
      userAgent: 'Custom YouTube Transcript Fetcher 1.0'
    });
    
    // Use the API as normal
    const videoId = '5MuIMqhT8DM';
    const transcript = await api.fetchTranscript(videoId, ['en']);
    
    console.log('Fetched transcript with custom HTTP client!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

### Using Cookie Authentication

For videos that require authentication, you can provide cookies:

```typescript
import { YouTubeTranscriptApi } from 'yt-transcript-ts';

async function main() {
  try {
    // Note: Cookie file support is planned for future versions
    // For now, you can manually set cookies in the HTTP client
    const api = new YouTubeTranscriptApi({
      cookiePath: '/path/to/cookies.txt' // This will show a warning as it's not yet implemented
    });
    
    // Fetch transcript for a video that requires authentication
    const videoId = 'private_video_id';
    const transcript = await api.fetchTranscript(videoId, ['en']);
    
    console.log('Successfully authenticated and fetched transcript!');
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

main();
```

### Working with Translations

```typescript
import { YouTubeTranscriptApi } from 'yt-transcript-ts';

async function main() {
  try {
    const api = new YouTubeTranscriptApi();
    const videoId = 'arj7oStGLkU';

    // List transcripts to find translatable ones
    const transcriptList = await api.listTranscripts(videoId);
    const translatableTranscripts = transcriptList.translatable();

    if (translatableTranscripts.length > 0) {
      const baseTranscript = translatableTranscripts[0];
      
      // Translate to Spanish
      const spanishTranscript = await baseTranscript.translate('es');
      
      console.log(`Original: ${baseTranscript.language}`);
      console.log(`Translated: ${spanishTranscript.language}`);
      
      // Compare first snippets
      const originalSnippets = await baseTranscript.fetch();
      console.log(`Original text: "${originalSnippets.snippets[0].text}"`);
      console.log(`Spanish text: "${spanishTranscript.snippets[0].text}"`);
    }
  } catch (error) {
    console.error('Translation failed:', error);
  }
}

main();
```

## Error Handling

The library provides specific error types for handling different failure scenarios:

```typescript
import { YouTubeTranscriptApi, CouldNotRetrieveTranscript, CouldNotRetrieveTranscriptReason } from 'yt-transcript-ts';

async function main() {
  const api = new YouTubeTranscriptApi();
  const videoId = '5MuIMqhT8DM';
  
  try {
    const transcript = await api.fetchTranscript(videoId, ['en']);
    console.log(`Successfully fetched transcript with ${transcript.snippets.length} snippets`);
  } catch (error) {
    if (error instanceof CouldNotRetrieveTranscript) {
      switch (error.reason) {
        case CouldNotRetrieveTranscriptReason.NoTranscriptFound:
          console.log('No transcript found for this video');
          break;
        case CouldNotRetrieveTranscriptReason.TranslationLanguageUnavailable:
          console.log('The requested translation language is not available');
          break;
        case CouldNotRetrieveTranscriptReason.VideoUnavailable:
          console.log('The video is unavailable or does not exist');
          break;
        case CouldNotRetrieveTranscriptReason.TranscriptsDisabled:
          console.log('Transcripts are disabled for this video');
          break;
        case CouldNotRetrieveTranscriptReason.IpBlocked:
          console.log('Your IP has been blocked by YouTube');
          break;
        default:
          console.log('Other error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main();
```

## Examples

The library comes with comprehensive examples demonstrating various use cases:

```bash
# Run individual examples
npx ts-node examples/yt-transcript-basic.ts
npx ts-node examples/yt-transcript-list.ts
npx ts-node examples/yt-transcript-advanced.ts
npx ts-node examples/youtube-video-details.ts
npx ts-node examples/tr-transcript-translation.ts
npx ts-node examples/transcript-parser-demo.ts

# Use the examples runner
npx ts-node examples/index.ts                    # Show available examples
npx ts-node examples/index.ts basic              # Run basic example
npx ts-node examples/index.ts all                # Run all examples
npx ts-node examples/index.ts basic advanced     # Run specific examples
```

See the [examples directory](./examples) for complete example code and the [examples README](./examples/README.md) for detailed documentation.

## API Reference

### YouTubeTranscriptApi

The main class for interacting with YouTube transcripts.

#### Constructor

```typescript
new YouTubeTranscriptApi(config?: YouTubeTranscriptApiConfig)
```

#### Methods

- `fetchTranscript(videoId: string, languages: string[]): Promise<FetchedTranscript>`
- `listTranscripts(videoId: string): Promise<TranscriptList>`
- `fetchVideoDetails(videoId: string): Promise<VideoDetails>`
- `fetchVideoInfos(videoId: string): Promise<VideoInfos>`

#### Static Methods

- `isValidVideoId(videoId: string): boolean`
- `extractVideoId(url: string): string | null`

### TranscriptParser

Class for parsing YouTube transcript XML with customizable formatting.

#### Constructor

```typescript
new TranscriptParser(preserveFormatting: boolean = false, linkFormat: string = '{text} ({url})')
```

#### Static Methods

- `withConfig(preserveFormatting: boolean, linkFormat: string): TranscriptParser`

#### Methods

- `parse(rawData: string): FetchedTranscriptSnippet[]`

### Error Types

- `CouldNotRetrieveTranscript`: Main error class for transcript retrieval failures
- `CouldNotRetrieveTranscriptReason`: Enum of specific error reasons
- `CookieError`: Error related to cookie handling
- `YouTubeTranscriptApiError`: Base error class

For complete API documentation, see the TypeScript definitions in the source code.

## License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/akinsella/yt-transcript-ts.git
cd yt-transcript-ts

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format

# Run examples
npm run examples
```

### Code Quality

This project maintains high code quality standards:

- **TypeScript**: Full type safety with strict TypeScript configuration
- **ESLint**: Code linting with TypeScript-specific rules
- **Prettier**: Consistent code formatting
- **Jest**: Comprehensive test coverage
- **Examples**: Working examples for all major features

## Acknowledgments

- [Jonas Depoix](https://github.com/jdepoix) for the original [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) Python library
- [Alexis Kinsella](https://github.com/akinsella) for the [yt-transcript-rs](https://github.com/akinsella/yt-transcript-rs) Rust library that this TypeScript port is based on
- All contributors who have helped improve this library 