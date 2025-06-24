import axios, { AxiosInstance } from 'axios';
import { FetchedTranscript } from './fetched-transcript';
import { TranscriptList } from './transcript-list';
import { VideoDetails, MicroformatData, StreamingData, VideoInfos } from './models';
import { CouldNotRetrieveTranscript } from './errors';
import { InnerTubeClient, InnerTubeConfig } from './innertube-client';
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
  /** InnerTube client configuration */
  innerTubeConfig?: Partial<InnerTubeConfig>;
}

/**
 * The main interface for retrieving YouTube video transcripts and metadata.
 */
export class YouTubeTranscriptApi {
  /** HTTP client used for making requests */
  private readonly client: AxiosInstance;
  
  /** InnerTube client for accessing YouTube's internal API */
  private readonly innerTubeClient: InnerTubeClient;

  /**
   * Creates a new YouTube Transcript API instance.
   * 
   * @param config Optional configuration options
   */
  constructor(config: YouTubeTranscriptApiConfig = {}) {
    // Create HTTP client
    this.client = config.httpClient || this.createDefaultClient(config);
    
    // Create InnerTube client
    this.innerTubeClient = new InnerTubeClient(this.client, config.innerTubeConfig);
  }

  /**
   * Creates a default HTTP client with appropriate headers and configuration.
   */
  private createDefaultClient(config: YouTubeTranscriptApiConfig): AxiosInstance {
    const client = axios.create({
      timeout: config.timeout || 30000,
      headers: {
        'User-Agent': config.userAgent || 
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
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
    // Fetch video information using InnerTube API
    const innerTubeResponse = await this.innerTubeClient.fetchVideoInfo(videoId);
    
    // Extract caption tracks from the response
    const captionTracks = this.innerTubeClient.extractCaptionTracks(innerTubeResponse);
    const translationLanguages = this.innerTubeClient.extractTranslationLanguages(innerTubeResponse);
    
    // Build captions data structure
    const captionsData = {
      captionTracks,
      translationLanguages,
    };
    
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
    // Fetch video information using InnerTube API
    const innerTubeResponse = await this.innerTubeClient.fetchVideoInfo(videoId);
    
    // Extract video details
    const videoDetails = this.extractVideoDetails(innerTubeResponse, videoId);
    
    // Extract microformat data
    const microformat = this.extractMicroformatData(innerTubeResponse, videoId);
    
    // Extract streaming data
    const streamingData = this.extractStreamingData(innerTubeResponse, videoId);
    
    // Extract transcript list
    const captionTracks = this.innerTubeClient.extractCaptionTracks(innerTubeResponse);
    const translationLanguages = this.innerTubeClient.extractTranslationLanguages(innerTubeResponse);
    const captionsData = {
      captionTracks,
      translationLanguages,
    };
    const transcriptList = TranscriptList.build(videoId, captionsData);
    
    return {
      videoDetails,
      microformat,
      streamingData,
      transcriptList,
    };
  }

  /**
   * Extracts video details from InnerTube response.
   */
  private extractVideoDetails(innerTubeResponse: any, videoId: string): VideoDetails {
    const details = innerTubeResponse?.videoDetails;
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
   * Extracts microformat data from InnerTube response.
   */
  private extractMicroformatData(innerTubeResponse: any, videoId: string): MicroformatData {
    const microformat = innerTubeResponse?.microformat?.playerMicroformatRenderer;
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
   * Extracts streaming data from InnerTube response.
   */
  private extractStreamingData(innerTubeResponse: any, videoId: string): StreamingData {
    const streamingData = innerTubeResponse?.streamingData;
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