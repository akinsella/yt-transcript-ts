import { TranscriptList } from './transcript-list';

/**
 * The base error type for the library.
 */
export class YouTubeTranscriptApiError extends Error {
  constructor(message: string = 'YouTube Transcript API error') {
    super(message);
    this.name = 'YouTubeTranscriptApiError';
  }
}

/**
 * Errors related to cookie handling and authentication.
 */
export class CookieError extends Error {
  constructor(message: string = 'Cookie error') {
    super(message);
    this.name = 'CookieError';
  }

  static pathInvalid(path: string): CookieError {
    return new CookieError(`Can't load the provided cookie file: ${path}`);
  }

  static invalid(details: string): CookieError {
    return new CookieError(`The cookies provided are not valid (may have expired): ${details}`);
  }
}

/**
 * Detailed reasons why a transcript couldn't be retrieved.
 */
export enum CouldNotRetrieveTranscriptReason {
  TranscriptsDisabled = 'TRANSCRIPTS_DISABLED',
  NoTranscriptFound = 'NO_TRANSCRIPT_FOUND',
  VideoUnavailable = 'VIDEO_UNAVAILABLE',
  VideoUnplayable = 'VIDEO_UNPLAYABLE',
  IpBlocked = 'IP_BLOCKED',
  RequestBlocked = 'REQUEST_BLOCKED',
  TranslationUnavailable = 'TRANSLATION_UNAVAILABLE',
  TranslationLanguageUnavailable = 'TRANSLATION_LANGUAGE_UNAVAILABLE',
  FailedToCreateConsentCookie = 'FAILED_TO_CREATE_CONSENT_COOKIE',
  YouTubeRequestFailed = 'YOUTUBE_REQUEST_FAILED',
  InvalidVideoId = 'INVALID_VIDEO_ID',
  AgeRestricted = 'AGE_RESTRICTED',
  YouTubeDataUnparsable = 'YOUTUBE_DATA_UNPARSABLE',
}

/**
 * Additional data for specific error reasons.
 */
export interface CouldNotRetrieveTranscriptReasonData {
  requestedLanguageCodes?: string[];
  transcriptData?: TranscriptList;
  reason?: string;
  subReasons?: string[];
  details?: string;
}

/**
 * The primary error type when transcript retrieval fails.
 */
export class CouldNotRetrieveTranscript extends Error {
  public readonly videoId: string;
  public readonly reason?: CouldNotRetrieveTranscriptReason;
  public readonly reasonData?: CouldNotRetrieveTranscriptReasonData;

  constructor(
    videoId: string,
    reason?: CouldNotRetrieveTranscriptReason,
    reasonData?: CouldNotRetrieveTranscriptReasonData
  ) {
    super();
    this.videoId = videoId;
    this.reason = reason;
    this.reasonData = reasonData;
    this.name = 'CouldNotRetrieveTranscript';
    this.message = this.buildErrorMessage();
  }

  private buildErrorMessage(): string {
    const baseError = `Could not retrieve a transcript for the video ${this.videoId}!`;

    if (!this.reason) {
      return baseError;
    }

    let cause: string;
    switch (this.reason) {
      case CouldNotRetrieveTranscriptReason.TranscriptsDisabled:
        cause = 'Subtitles are disabled for this video';
        break;

      case CouldNotRetrieveTranscriptReason.NoTranscriptFound:
        cause = `No transcripts were found for any of the requested language codes: ${JSON.stringify(
          this.reasonData?.requestedLanguageCodes || []
        )}`;
        if (this.reasonData?.transcriptData) {
          cause += `\n\n${this.reasonData.transcriptData.toString()}`;
        }
        break;

      case CouldNotRetrieveTranscriptReason.VideoUnavailable:
        cause = 'The video is no longer available';
        break;

      case CouldNotRetrieveTranscriptReason.VideoUnplayable:
        const reason = this.reasonData?.reason || 'No reason specified!';
        cause = `The video is unplayable for the following reason: ${reason}`;
        if (this.reasonData?.subReasons && this.reasonData.subReasons.length > 0) {
          cause += '\n\nAdditional Details:\n';
          for (const subReason of this.reasonData.subReasons) {
            cause += ` - ${subReason}\n`;
          }
        }
        break;

      case CouldNotRetrieveTranscriptReason.IpBlocked:
        cause = `YouTube is blocking requests from your IP. This usually is due to one of the following reasons:
- You have done too many requests and your IP has been blocked by YouTube
- You are doing requests from an IP belonging to a cloud provider (like AWS, Google Cloud Platform, Azure, etc.). Unfortunately, most IPs from cloud providers are blocked by YouTube.

Ip blocked.`;
        break;

      case CouldNotRetrieveTranscriptReason.RequestBlocked:
        cause = `YouTube is blocking requests from your IP. This usually is due to one of the following reasons:
- You have done too many requests and your IP has been blocked by YouTube
- You are doing requests from an IP belonging to a cloud provider (like AWS, Google Cloud Platform, Azure, etc.). Unfortunately, most IPs from cloud providers are blocked by YouTube.

Request blocked.`;
        break;

      case CouldNotRetrieveTranscriptReason.TranslationUnavailable:
        cause = `The requested transcript cannot be translated: ${this.reasonData?.details || 'Unknown reason'}`;
        break;

      case CouldNotRetrieveTranscriptReason.TranslationLanguageUnavailable:
        cause = `The requested translation language is not available: ${this.reasonData?.details || 'Unknown reason'}`;
        break;

      case CouldNotRetrieveTranscriptReason.FailedToCreateConsentCookie:
        cause = 'Failed to create a consent cookie required by YouTube';
        break;

      case CouldNotRetrieveTranscriptReason.YouTubeRequestFailed:
        cause = `The request to YouTube failed: ${this.reasonData?.details || 'Unknown error'}`;
        break;

      case CouldNotRetrieveTranscriptReason.InvalidVideoId:
        cause = 'The provided video ID is invalid';
        break;

      case CouldNotRetrieveTranscriptReason.AgeRestricted:
        cause = 'The video is age-restricted and requires authentication';
        break;

      case CouldNotRetrieveTranscriptReason.YouTubeDataUnparsable:
        cause = 'The YouTube data structure could not be parsed';
        break;

      default:
        cause = 'Unknown error';
        break;
    }

    return `${baseError} ${cause}`;
  }

  static transcriptsDisabled(videoId: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.TranscriptsDisabled);
  }

  static noTranscriptFound(
    videoId: string,
    requestedLanguageCodes: string[],
    transcriptData: TranscriptList
  ): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.NoTranscriptFound, {
      requestedLanguageCodes,
      transcriptData,
    });
  }

  static videoUnavailable(videoId: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.VideoUnavailable);
  }

  static videoUnplayable(videoId: string, reason?: string, subReasons?: string[]): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.VideoUnplayable, {
      reason,
      subReasons,
    });
  }

  static ipBlocked(videoId: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.IpBlocked);
  }

  static requestBlocked(videoId: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.RequestBlocked);
  }

  static translationUnavailable(videoId: string, details: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.TranslationUnavailable, {
      details,
    });
  }

  static translationLanguageUnavailable(videoId: string, details: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.TranslationLanguageUnavailable, {
      details,
    });
  }

  static failedToCreateConsentCookie(videoId: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.FailedToCreateConsentCookie);
  }

  static youTubeRequestFailed(videoId: string, details: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.YouTubeRequestFailed, {
      details,
    });
  }

  static invalidVideoId(videoId: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.InvalidVideoId);
  }

  static ageRestricted(videoId: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.AgeRestricted);
  }

  static youTubeDataUnparsable(videoId: string): CouldNotRetrieveTranscript {
    return new CouldNotRetrieveTranscript(videoId, CouldNotRetrieveTranscriptReason.YouTubeDataUnparsable);
  }
}

// Type aliases for compatibility
export type TranscriptsDisabled = CouldNotRetrieveTranscript;
export type NoTranscriptFound = CouldNotRetrieveTranscript;
export type VideoUnavailable = CouldNotRetrieveTranscript;
export type VideoUnplayable = CouldNotRetrieveTranscript;
export type IpBlocked = CouldNotRetrieveTranscript;
export type RequestBlocked = CouldNotRetrieveTranscript;
export type NotTranslatable = CouldNotRetrieveTranscript;
export type TranslationLanguageNotAvailable = CouldNotRetrieveTranscript;
export type FailedToCreateConsentCookie = CouldNotRetrieveTranscript;
export type YouTubeRequestFailed = CouldNotRetrieveTranscript;
export type InvalidVideoId = CouldNotRetrieveTranscript;
export type AgeRestricted = CouldNotRetrieveTranscript;
export type YouTubeDataUnparsable = CouldNotRetrieveTranscript; 