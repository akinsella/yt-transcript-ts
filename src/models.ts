/**
 * Represents a language option available for YouTube transcript translation.
 */
export interface TranslationLanguage {
  /** The full, human-readable name of the language (e.g., "English") */
  language: string;
  /** The ISO language code used by YouTube (e.g., "en") */
  languageCode: string;
}

/**
 * Represents a single segment of transcript text with its timing information.
 */
export interface FetchedTranscriptSnippet {
  /** The text content of this snippet */
  text: string;
  /** The timestamp at which this snippet appears on screen in seconds */
  start: number;
  /** The duration of how long the snippet stays on screen in seconds */
  duration: number;
}

/**
 * Represents a single thumbnail image for a YouTube video.
 */
export interface VideoThumbnail {
  /** Direct URL to the thumbnail image */
  url: string;
  /** Width of the thumbnail in pixels */
  width: number;
  /** Height of the thumbnail in pixels */
  height: number;
}

/**
 * Comprehensive metadata about a YouTube video.
 */
export interface VideoDetails {
  /** The unique YouTube video ID (e.g., "dQw4w9WgXcQ") */
  videoId: string;
  /** The video's title */
  title: string;
  /** Total duration of the video in seconds */
  lengthSeconds: number;
  /** Optional list of keywords/tags associated with the video */
  keywords?: string[];
  /** The YouTube channel ID that published the video */
  channelId: string;
  /** The video description text */
  shortDescription: string;
  /** Number of views as a string (to handle potentially very large numbers) */
  viewCount: string;
  /** Name of the channel/creator who published the video */
  author: string;
  /** List of available thumbnail images in various resolutions */
  thumbnails: VideoThumbnail[];
  /** Whether the video is or was a live stream */
  isLiveContent: boolean;
}

/**
 * Embed information for microformat data.
 */
export interface MicroformatEmbed {
  /** Height of the embed */
  height?: number;
  /** URL for the iframe embed */
  iframeUrl?: string;
  /** Width of the embed */
  width?: number;
}

/**
 * Thumbnail information for microformat data.
 */
export interface MicroformatThumbnail {
  /** List of thumbnails in different sizes */
  thumbnails?: VideoThumbnail[];
}

/**
 * Extended metadata from YouTube's microformat section.
 */
export interface MicroformatData {
  /** Countries where the video is available */
  availableCountries?: string[];
  /** Category of the video */
  category?: string;
  /** Description of the video */
  description?: string;
  /** Embed information */
  embed?: MicroformatEmbed;
  /** External channel ID */
  externalChannelId?: string;
  /** External video ID */
  externalVideoId?: string;
  /** Whether the video has YPC metadata */
  hasYpcMetadata?: boolean;
  /** Whether the video is family safe */
  isFamilySafe?: boolean;
  /** Whether the video is eligible for Shorts */
  isShortsEligible?: boolean;
  /** Whether the video is unlisted */
  isUnlisted?: boolean;
  /** Duration of the video in seconds */
  lengthSeconds?: string;
  /** Number of likes */
  likeCount?: string;
  /** Name of the channel owner */
  ownerChannelName?: string;
  /** URL to the owner's profile */
  ownerProfileUrl?: string;
  /** Date when the video was published */
  publishDate?: string;
  /** Thumbnail information */
  thumbnail?: MicroformatThumbnail;
  /** Title of the video */
  title?: string;
  /** Date when the video was uploaded */
  uploadDate?: string;
  /** Number of views */
  viewCount?: string;
}

/**
 * Range information for streaming formats.
 */
export interface Range {
  /** Start position */
  start: string;
  /** End position */
  end: string;
}

/**
 * Color information for video formats.
 */
export interface ColorInfo {
  /** Primary colors used */
  primaries?: string;
  /** Transfer characteristics */
  transferCharacteristics?: string;
  /** Matrix coefficients */
  matrixCoefficients?: string;
}

/**
 * Information about a specific streaming format.
 */
export interface StreamingFormat {
  /** Format identification number */
  itag: number;
  /** URL to the media */
  url?: string;
  /** MIME type and codec information */
  mimeType: string;
  /** Bitrate in bits per second */
  bitrate: number;
  /** Video width in pixels (video only) */
  width?: number;
  /** Video height in pixels (video only) */
  height?: number;
  /** Initialization range for segmented formats */
  initRange?: Range;
  /** Index range for segmented formats */
  indexRange?: Range;
  /** Last modification timestamp */
  lastModified?: string;
  /** Content length in bytes */
  contentLength?: string;
  /** Quality label (e.g., "medium", "hd720") */
  quality: string;
  /** Frames per second (video only) */
  fps?: number;
  /** Human-readable quality label (e.g., "720p") */
  qualityLabel?: string;
  /** Projection type (e.g., "RECTANGULAR") */
  projectionType: string;
  /** Average bitrate in bits per second */
  averageBitrate?: number;
  /** Audio quality (audio only) */
  audioQuality?: string;
  /** Approximate duration in milliseconds */
  approxDurationMs: string;
  /** Audio sample rate (audio only) */
  audioSampleRate?: string;
  /** Number of audio channels (audio only) */
  audioChannels?: number;
  /** Quality ordinal value */
  qualityOrdinal?: string;
  /** High replication flag */
  highReplication?: boolean;
  /** Color information */
  colorInfo?: ColorInfo;
  /** Loudness in decibels (audio only) */
  loudnessDb?: number;
  /** Whether DRC (Dynamic Range Compression) is used */
  isDrc?: boolean;
  /** Extra tags */
  xtags?: string;
}

/**
 * Information about available streaming formats.
 */
export interface StreamingData {
  /** Time in seconds until the streaming URLs expire */
  expiresInSeconds: string;
  /** Combined formats with both audio and video */
  formats: StreamingFormat[];
  /** Separate adaptive formats for audio or video */
  adaptiveFormats: StreamingFormat[];
  /** Server ABR streaming URL */
  serverAbrStreamingUrl?: string;
}

// Forward declaration to avoid circular dependency
export interface VideoInfos {
  /** Basic details about the video (title, author, view count, etc.) */
  videoDetails: VideoDetails;
  /** Extended metadata from the microformat section */
  microformat: MicroformatData;
  /** Information about available streaming formats */
  streamingData: StreamingData;
  /** List of available transcripts/captions for the video */
  transcriptList: any; // TranscriptList - defined separately to avoid circular dependency
} 