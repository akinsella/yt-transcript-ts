# YouTube Transcript API - TypeScript Examples

This directory contains comprehensive examples demonstrating how to use the YouTube Transcript API TypeScript library. These examples are ported from the original Rust implementation and showcase various features and use cases.

## Prerequisites

Before running the examples, make sure you have:

1. Node.js (version 14 or higher)
2. TypeScript installed globally or use `ts-node`
3. All dependencies installed (`npm install`)

## Installation

```bash
# Install ts-node globally for running TypeScript files directly
npm install -g ts-node

# Or run with npx (no global installation needed)
npx ts-node examples/yt-transcript-basic.ts
```

## Examples Overview

### 1. Basic Transcript Fetching (`yt-transcript-basic.ts`)

**Purpose**: Demonstrates the most basic functionality of fetching a YouTube transcript.

**Features**:
- Simple transcript fetching
- Basic error handling
- Display transcript metadata
- Show first few snippets

**Usage**:
```bash
ts-node examples/yt-transcript-basic.ts
```

**What you'll learn**:
- How to initialize the API
- How to fetch a transcript for a specific video
- How to access transcript properties (language, duration, snippets)
- Basic iteration over transcript snippets

---

### 2. Transcript Listing (`yt-transcript-list.ts`)

**Purpose**: Shows how to list all available transcripts for a video and work with different transcript types.

**Features**:
- List all available transcripts
- Distinguish between manual and auto-generated transcripts
- Find transcripts by language
- Demonstrate transcript fetching from the list

**Usage**:
```bash
ts-node examples/yt-transcript-list.ts
```

**What you'll learn**:
- How to list available transcripts
- Difference between manual and auto-generated transcripts
- How to filter transcripts by type
- How to search for specific language transcripts

---

### 3. Advanced Processing (`yt-transcript-advanced.ts`)

**Purpose**: Demonstrates advanced features including batch processing, custom configuration, and comprehensive error handling.

**Features**:
- Custom HTTP client configuration
- Batch processing multiple videos
- Performance monitoring
- Comprehensive error handling
- Statistics calculation
- Different error types and handling strategies

**Usage**:
```bash
ts-node examples/yt-transcript-advanced.ts
```

**What you'll learn**:
- How to configure custom HTTP clients
- How to process multiple videos efficiently
- How to handle different types of errors
- How to calculate transcript statistics
- Performance optimization techniques

---

### 4. Video Details (`yt-video-details.ts`)

**Purpose**: Shows how to fetch comprehensive video information including metadata, thumbnails, and streaming data.

**Features**:
- Fetch video details and metadata
- Display thumbnails and video information
- Extract video IDs from URLs
- Comprehensive video information fetching

**Usage**:
```bash
ts-node examples/youtube-video-details.ts
```

**What you'll learn**:
- How to fetch video metadata
- How to access video thumbnails
- How to extract video IDs from various URL formats
- How to get comprehensive video information

---

### 5. Translation Support (`yt-transcript-translation.ts`)

**Purpose**: Demonstrates transcript translation capabilities and working with multiple languages.

**Features**:
- List available translation languages
- Fetch transcripts in different languages
- Compare transcripts across languages
- Direct translation from base transcripts

**Usage**:
```bash
ts-node examples/yt-transcript-translation.ts
```

**What you'll learn**:
- How to work with translatable transcripts
- How to fetch transcripts in specific languages
- How to translate transcripts to different languages
- How to compare transcripts across languages

---

### 6. Transcript Parser Demo (`transcript-parser-demo.ts`)

**Purpose**: Showcases the transcript parser functionality with different formatting options.

**Features**:
- Basic vs. formatted parsing
- Custom link formatting
- Error handling in parsing
- Performance statistics
- Complex XML handling

**Usage**:
```bash
ts-node examples/transcript-parser-demo.ts
```

**What you'll learn**:
- How to parse transcript XML
- How to preserve or remove formatting
- How to customize link formatting
- How to handle parsing errors
- How to work with complex nested XML

## Common Use Cases

### Fetching a Simple Transcript

```typescript
import { YouTubeTranscriptApi } from '../src/api';

const api = new YouTubeTranscriptApi();
const transcript = await api.fetchTranscript('dQw4w9WgXcQ', ['en']);
console.log(transcript.text());
```

### Handling Multiple Languages

```typescript
const transcriptList = await api.listTranscripts(videoId);
const availableLanguages = transcriptList.transcripts().map(t => t.languageCode);
console.log('Available languages:', availableLanguages);
```

### Custom Error Handling

```typescript
try {
  const transcript = await api.fetchTranscript(videoId, ['en']);
} catch (error) {
  if (error instanceof CouldNotRetrieveTranscript) {
    switch (error.reason) {
      case CouldNotRetrieveTranscriptReason.TranscriptsDisabled:
        console.log('Transcripts are disabled for this video');
        break;
      case CouldNotRetrieveTranscriptReason.VideoUnavailable:
        console.log('Video is not available');
        break;
      // Handle other cases...
    }
  }
}
```

### Custom HTTP Configuration

```typescript
import axios from 'axios';

const customClient = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'My Custom Bot 1.0'
  }
});

const api = new YouTubeTranscriptApi({
  httpClient: customClient,
  timeout: 30000
});
```

## Error Handling

The examples demonstrate various error scenarios:

- **Invalid video IDs**: How to validate and handle invalid video IDs
- **Unavailable transcripts**: When transcripts are disabled or not available
- **Network errors**: Handling timeouts and connection issues
- **IP blocking**: When YouTube blocks requests
- **Translation errors**: When translations are not available

## Performance Considerations

The advanced example shows:

- **Batch processing**: How to efficiently process multiple videos
- **Timeout configuration**: Setting appropriate timeouts
- **Error recovery**: How to handle failures gracefully
- **Statistics tracking**: Monitoring performance metrics

## Testing with Different Videos

The examples use various video IDs for testing:

- `dQw4w9WgXcQ`: Rick Astley - Never Gonna Give You Up (popular video with transcripts)
- `ZQUxL4Jm1Lo`: TED Talk (usually has multiple language support)
- `jNQXAC9IVRw`: "Me at the zoo" (first YouTube video)

You can replace these with your own video IDs to test different scenarios.

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Make sure you've run `npm install`
2. **TypeScript compilation errors**: Ensure TypeScript is properly configured
3. **Network timeouts**: Some videos may take longer to process
4. **Rate limiting**: YouTube may temporarily block requests if too many are made

### Debug Mode

You can enable more verbose logging by modifying the examples to include debug information:

```typescript
// Add this to see more detailed error information
console.log('Full error details:', error);
```

## Contributing

If you'd like to add more examples or improve existing ones:

1. Follow the existing code style and structure
2. Include comprehensive error handling
3. Add clear comments explaining the functionality
4. Test with various video types and scenarios

## Related Documentation

- [Main API Documentation](../README.md)
- [TypeScript API Reference](../src/README.md)
- [Original Rust Examples](../../yt-transcript-rs/examples/README.md)

## License

These examples are provided under the same license as the main library. 