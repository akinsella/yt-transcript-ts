import axios, { AxiosInstance } from 'axios';
import { FetchedTranscript } from './fetched-transcript';
import { TranscriptList } from './transcript-list';
import { VideoDetails, MicroformatData, StreamingData, VideoInfos } from './models';
import { CouldNotRetrieveTranscript } from './errors';
import { YoutubePageFetcher } from './youtube-page-fetcher';
import { JsVarParser } from './js-var-parser';
import { CaptionsExtractor } from './captions-extractor';

/**
 * Configuration options for the YouTube Transcript API.
 */
export interface YouTubeTranscriptApiConfig {
  /** Path to a Netscape-format cookie file for authenticated requests */
  cookiePath?: string;
  /** Custom HTTP client to use instead of the default one */
  httpClient?: AxiosInstance;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom user agent string */
  userAgent?: string;
}

/**
 * The main interface for retrieving YouTube video transcripts and metadata.
 */
export class YouTubeTranscriptApi {
  /** HTTP client used for making requests */
  private readonly client: AxiosInstance;
  
  /** YouTube page fetcher for retrieving video pages */
  private readonly pageFetcher: YoutubePageFetcher;

  /**
   * Creates a new YouTube Transcript API instance.
   * 
   * @param config Optional configuration options
   */
  constructor(config: YouTubeTranscriptApiConfig = {}) {
    // Create HTTP client
    this.client = config.httpClient || this.createDefaultClient(config);
    
    // Create page fetcher
    this.pageFetcher = new YoutubePageFetcher(this.client);
  }

  /**
   * Creates a default HTTP client with appropriate headers and configuration.
   */
  private createDefaultClient(config: YouTubeTranscriptApiConfig): AxiosInstance {
    const client = axios.create({
      timeout: config.timeout || 30000,
      headers: {
        'User-Agent': config.userAgent || 
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US',
      },
    });

    // Add cookie support if needed
    if (config.cookiePath) {
      // Note: Cookie file loading would need to be implemented separately
      // as it requires file system access and cookie parsing
      console.warn('Cookie file support not yet implemented in TypeScript version');
    }

    return client;
  }

  /**
   * Fetches a transcript from a YouTube video.
   * 
   * @param videoId The YouTube video ID
   * @param languages Array of preferred language codes in order of preference
   * @param preserveFormatting Whether to preserve HTML formatting in the transcript
   * @returns The fetched transcript
   */
  async fetchTranscript(
    videoId: string,
    languages: string[],
    preserveFormatting: boolean = false
  ): Promise<FetchedTranscript> {
    const transcriptList = await this.listTranscripts(videoId);
    const transcript = transcriptList.findTranscript(languages);
    return transcript.fetch(this.client, preserveFormatting);
  }

  /**
   * Lists all available transcripts for a YouTube video.
   * 
   * @param videoId The YouTube video ID
   * @returns A list of available transcripts
   */
  async listTranscripts(videoId: string): Promise<TranscriptList> {
    // Fetch the YouTube video page
    const html = await this.pageFetcher.fetchVideoPage(videoId);
    
    // Extract player response data
    const playerResponseParser = new JsVarParser('ytInitialPlayerResponse');
    const playerResponse = playerResponseParser.parse(html, videoId);
    
    // Extract captions data
    const captionsData = CaptionsExtractor.extractCaptionsData(playerResponse, videoId);
    
    // Build and return transcript list
    return TranscriptList.build(videoId, captionsData);
  }

  /**
   * Fetches detailed video metadata.
   * 
   * @param videoId The YouTube video ID
   * @returns Detailed video information
   */
  async fetchVideoDetails(videoId: string): Promise<VideoDetails> {
    const videoInfos = await this.fetchVideoInfos(videoId);
    return videoInfos.videoDetails;
  }

  /**
   * Fetches microformat data for a video.
   * 
   * @param videoId The YouTube video ID
   * @returns Microformat data
   */
  async fetchMicroformat(videoId: string): Promise<MicroformatData> {
    const videoInfos = await this.fetchVideoInfos(videoId);
    return videoInfos.microformat;
  }

  /**
   * Fetches streaming data for a video.
   * 
   * @param videoId The YouTube video ID
   * @returns Streaming data
   */
  async fetchStreamingData(videoId: string): Promise<StreamingData> {
    const videoInfos = await this.fetchVideoInfos(videoId);
    return videoInfos.streamingData;
  }

  /**
   * Fetches complete video information including all metadata.
   * 
   * @param videoId The YouTube video ID
   * @returns Complete video information
   */
  async fetchVideoInfos(videoId: string): Promise<VideoInfos> {
    // Fetch the YouTube video page
    const html = await this.pageFetcher.fetchVideoPage(videoId);
    
    // Extract player response data
    const playerResponseParser = new JsVarParser('ytInitialPlayerResponse');
    const playerResponse = playerResponseParser.parse(html, videoId);
    
    // Extract video details
    const videoDetails = this.extractVideoDetails(playerResponse, videoId);
    
    // Extract microformat data
    const microformat = this.extractMicroformatData(playerResponse, videoId);
    
    // Extract streaming data
    const streamingData = this.extractStreamingData(playerResponse, videoId);
    
    // Extract transcript list
    const captionsData = CaptionsExtractor.extractCaptionsData(playerResponse, videoId);
    const transcriptList = TranscriptList.build(videoId, captionsData);
    
    return {
      videoDetails,
      microformat,
      streamingData,
      transcriptList,
    };
  }

  /**
   * Extracts video details from player response.
   */
  private extractVideoDetails(playerResponse: any, videoId: string): VideoDetails {
    const details = playerResponse?.videoDetails;
    if (!details) {
      throw CouldNotRetrieveTranscript.youTubeDataUnparsable(videoId);
    }

    return {
      videoId: details.videoId || videoId,
      title: details.title || '',
      lengthSeconds: parseInt(details.lengthSeconds || '0', 10),
      keywords: details.keywords || [],
      channelId: details.channelId || '',
      shortDescription: details.shortDescription || '',
      viewCount: details.viewCount || '0',
      author: details.author || '',
      thumbnails: details.thumbnail?.thumbnails || [],
      isLiveContent: details.isLiveContent || false,
    };
  }

  /**
   * Extracts microformat data from player response.
   */
  private extractMicroformatData(playerResponse: any, videoId: string): MicroformatData {
    const microformat = playerResponse?.microformat?.playerMicroformatRenderer;
    if (!microformat) {
      return {}; // Microformat is optional
    }

    return {
      availableCountries: microformat.availableCountries,
      category: microformat.category,
      description: microformat.description?.simpleText,
      embed: microformat.embed,
      externalChannelId: microformat.externalChannelId,
      externalVideoId: microformat.externalVideoId,
      hasYpcMetadata: microformat.hasYpcMetadata,
      isFamilySafe: microformat.isFamilySafe,
      isShortsEligible: microformat.isShortsEligible,
      isUnlisted: microformat.isUnlisted,
      lengthSeconds: microformat.lengthSeconds,
      likeCount: microformat.likeCount,
      ownerChannelName: microformat.ownerChannelName,
      ownerProfileUrl: microformat.ownerProfileUrl,
      publishDate: microformat.publishDate,
      thumbnail: microformat.thumbnail,
      title: microformat.title?.simpleText,
      uploadDate: microformat.uploadDate,
      viewCount: microformat.viewCount,
    };
  }

  /**
   * Extracts streaming data from player response.
   */
  private extractStreamingData(playerResponse: any, videoId: string): StreamingData {
    const streamingData = playerResponse?.streamingData;
    if (!streamingData) {
      throw CouldNotRetrieveTranscript.youTubeDataUnparsable(videoId);
    }

    return {
      expiresInSeconds: streamingData.expiresInSeconds || '0',
      formats: streamingData.formats || [],
      adaptiveFormats: streamingData.adaptiveFormats || [],
      serverAbrStreamingUrl: streamingData.serverAbrStreamingUrl,
    };
  }

  /**
   * Validates a YouTube video ID format.
   * 
   * @param videoId The video ID to validate
   * @returns True if the video ID appears to be valid
   */
  static isValidVideoId(videoId: string): boolean {
    // YouTube video IDs are typically 11 characters long and contain alphanumeric characters, hyphens, and underscores
    const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    return videoIdRegex.test(videoId);
  }

  /**
   * Extracts a video ID from a YouTube URL.
   * 
   * @param url The YouTube URL
   * @returns The extracted video ID or null if not found
   */
  static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
} 