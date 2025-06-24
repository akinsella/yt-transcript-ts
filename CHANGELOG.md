# Changelog

All notable changes to the `yt-transcript-ts` project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.2.0] - 2025-01-27

### Breaking Changes
- **Complete API Overhaul**: Replaced the legacy transcript fetching method with YouTube's InnerTube API
- **Removed Legacy URL Approach**: The old method of using direct transcript URLs has been completely removed as it no longer works due to YouTube's permanent API changes

### Added
- **InnerTube API Integration**: Added `InnerTubeClient` to use YouTube's internal API exclusively for transcript fetching
- **Enhanced Error Handling**: Added `PoTokenRequired` error for YouTube's new security requirements
- **Improved Reliability**: Transcript fetching is now consistently reliable since it uses YouTube's internal API
- New error type: `PoTokenRequired` for handling YouTube's new authentication requirements

### Changed
- **Major Architecture Change**: All API methods now use InnerTube API exclusively instead of legacy HTML scraping
- **Improved Reliability**: Transcript fetching is now consistently reliable since it uses YouTube's internal API
- Enhanced error messages with detailed explanations when YouTube API issues occur
- Updated `TranscriptList.build()` method to handle InnerTube API response format
- Modified caption track detection logic to work with InnerTube's `vssId` field

### Fixed
- **Critical Fix**: YouTube transcript fetching now works reliably after YouTube's permanent API changes
- Fixed empty transcript responses by completely replacing the broken legacy approach
- Fixed transcript availability detection using InnerTube API's more reliable data structure

### Technical Details
- The library now exclusively uses YouTube's InnerTube API:
  1. Calls InnerTube API to get current transcript URLs and video data
  2. Extracts caption tracks from the InnerTube response
  3. Finds matching transcript URLs for the requested language
  4. Fetches transcript content using the current, authenticated URLs
- This approach completely bypasses YouTube's broken external API while maintaining full backward compatibility for user code
- Added proper handling for YouTube's new `PoToken` requirement (when encountered, provides helpful error message)
- Updated client version and user agent to match current YouTube expectations

### Migration Guide
1. **No code changes required** - your existing code will continue to work unchanged
2. **Remove any workarounds**: You can remove any special configuration like:
   - Custom headers or user agents (unless needed for other reasons)
   - Session establishment code
   - Workarounds for empty transcripts
3. **Your existing code will work unchanged** - no code modifications required

### Legacy Information (Historical)
*This section is kept for historical reference only. These solutions are no longer needed with v0.2.0+.*

The empty transcript issue affected versions prior to v0.2.0 when YouTube changed their external API. The previous solutions involved complex workarounds, but these are no longer necessary.

## [0.1.0] - 2025-05-27

### Added
- Initial TypeScript port of the Rust library `yt-transcript-rs`
- Core functionality for fetching YouTube video transcripts
- Support for handling various transcript formats and languages
- Comprehensive error handling for different YouTube error scenarios
- Support for age-restricted videos detection
- Support for unavailable videos detection
- HTML tag cleaning in transcript text

#### Core API Implementation
- `YouTubeTranscriptApi` class with configurable HTTP client support
- `fetchTranscript` method for retrieving video transcripts in specified languages
- `listTranscripts` method for discovering available transcripts
- `fetchVideoDetails` method for retrieving comprehensive video metadata
- `fetchVideoInfos` method for retrieving all video information in a single request
- Static utility methods `isValidVideoId` and `extractVideoId`

#### Data Models and Types
- Complete TypeScript interfaces for all data structures:
  - `VideoDetails` for video metadata
  - `MicroformatData` for extended video information
  - `StreamingData` and `StreamingFormat` for video/audio stream information
  - `FetchedTranscript` and `FetchedTranscriptSnippet` for transcript data
  - `TranscriptList` and `Transcript` for transcript management
  - `VideoInfos` for comprehensive video data

#### Transcript Processing
- `TranscriptParser` class with configurable HTML processing
- Support for preserving or removing HTML formatting tags
- Customizable link formatting with template-based approach
- Robust HTML entity handling and whitespace preservation
- Support for different link format styles (Default, Markdown, HTML, Wiki-style, Plain)

#### Error Handling System
- `YouTubeTranscriptApiError` base error class
- `CouldNotRetrieveTranscript` with specific error reasons
- `CouldNotRetrieveTranscriptReason` enum for detailed error classification
- `CookieError` for authentication-related issues
- Comprehensive error mapping from HTTP status codes

#### HTTP Client and Network Handling
- `YoutubePageFetcher` for YouTube page retrieval with consent handling
- `CaptionsExtractor` for extracting caption data from player responses
- `JsVarParser` for parsing JavaScript variables from HTML content
- Support for custom HTTP client configuration
- Automatic consent cookie handling for EU compliance
- Configurable timeout and user agent settings

#### Translation Support
- Full support for transcript translations
- `TranslationLanguage` interface for available translation options
- Methods for finding and fetching translated transcripts
- Preservation of translation metadata and language information

### Documentation
- Comprehensive README.md with:
  - Table of contents and feature overview
  - Installation instructions for npm and yarn
  - Detailed usage examples for all major features
  - Advanced usage scenarios including custom HTTP clients
  - Complete API reference documentation
  - Error handling examples and best practices
  - Contributing guidelines and development setup

#### Examples Implementation
- `yt-transcript-basic.ts` - Basic transcript fetching
- `yt-transcript-list.ts` - Listing available transcripts
- `yt-transcript-advanced.ts` - Advanced processing with batch operations
- `youtube-video-details.ts` - Fetching video details and metadata
- `yt-transcript-translation.ts` - Translation and multi-language support
- `transcript-parser-demo.ts` - Transcript parser functionality demonstration
- `index.ts` - Examples runner for executing all or specific examples
- Comprehensive examples README.md with detailed documentation

### Testing
- Complete Jest test suite with comprehensive coverage:
  - `api.test.ts` - Main API functionality with mocked HTTP requests
  - `transcript-parser.test.ts` - XML parsing with formatting preservation
  - `fetched-transcript.test.ts` - Transcript data handling and text processing
  - `captions-extractor.test.ts` - Caption data extraction from player responses
  - `errors.test.ts` - Error classes and error handling scenarios
  - `js-var-parser.test.ts` - JavaScript variable parsing from HTML
- Mock implementations for HTTP requests and external dependencies
- Test coverage for error scenarios and edge cases
- Performance testing for transcript parsing operations

### Development Infrastructure
- TypeScript configuration with strict type checking
- ESLint configuration with TypeScript-specific rules
- Prettier configuration for consistent code formatting
- Jest configuration for testing with TypeScript support
- Package.json with comprehensive scripts for development workflow
- Proper module exports and TypeScript declaration files

### Dependencies
- `axios` for HTTP client functionality with cookie support
- `cheerio` for server-side HTML parsing and manipulation
- `tough-cookie` for cookie handling and management
- Development dependencies:
  - `typescript` for TypeScript compilation
  - `jest` and `@types/jest` for testing framework
  - `eslint` and TypeScript ESLint plugins for code quality
  - `prettier` for code formatting
  - `ts-node` for running TypeScript examples

### Features Ported from Rust Version
- All core functionality from `yt-transcript-rs` v0.1.7
- Video details extraction with complete metadata
- Microformat data extraction for extended video information
- Streaming data extraction for video/audio formats
- Comprehensive transcript list management
- Translation support with language detection
- Custom transcript formatting with configurable link styles
- Robust error handling with specific error types
- Consent cookie handling for EU compliance
- HTML entity decoding and whitespace preservation

### TypeScript-Specific Enhancements
- Full type safety with comprehensive TypeScript interfaces
- Generic type support for extensible data structures
- Optional chaining and nullish coalescing for safer property access
- Modern async/await patterns throughout the codebase
- ES6+ features including destructuring, arrow functions, and template literals
- Proper module system with named and default exports

### Performance Optimizations
- Efficient XML parsing using Cheerio's optimized selectors
- Lazy loading of transcript data with on-demand fetching
- Minimal memory footprint with streaming-friendly data structures
- Optimized regular expressions for JavaScript variable parsing
- Cached HTTP client instances for improved performance

### Browser and Node.js Compatibility
- Designed for Node.js environments with full feature support
- Compatible with modern JavaScript runtimes
- Proper handling of different character encodings
- Cross-platform file path handling for cookie files (planned feature)

### Known Limitations
- Cookie file support not yet implemented (shows warning)
- Browser environment support requires additional configuration
- Some advanced proxy configurations may need manual HTTP client setup

### Migration from Rust Version
- API compatibility maintained where possible
- Method names adapted to TypeScript/JavaScript conventions (camelCase)
- Error handling adapted to JavaScript error patterns
- Configuration options expanded for JavaScript ecosystem compatibility

[0.1.0]: https://github.com/akinsella/yt-transcript-ts/releases/tag/v0.1.0 