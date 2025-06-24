// Main API
export { YouTubeTranscriptApi, YouTubeTranscriptApiConfig } from './api';

// Core classes
export { FetchedTranscript } from './fetched-transcript';
export { Transcript } from './transcript';
export { TranscriptList } from './transcript-list';

// Models and interfaces
export {
  TranslationLanguage,
  FetchedTranscriptSnippet,
  VideoThumbnail,
  VideoDetails,
  MicroformatEmbed,
  MicroformatThumbnail,
  MicroformatData,
  Range,
  ColorInfo,
  StreamingFormat,
  StreamingData,
  VideoInfos,
} from './models';

// Errors
export {
  YouTubeTranscriptApiError,
  CookieError,
  PoTokenRequired,
  CouldNotRetrieveTranscript,
  CouldNotRetrieveTranscriptReason,
  CouldNotRetrieveTranscriptReasonData,
  // Type aliases
  TranscriptsDisabled,
  NoTranscriptFound,
  VideoUnavailable,
  VideoUnplayable,
  IpBlocked,
  RequestBlocked,
  NotTranslatable,
  TranslationLanguageNotAvailable,
  FailedToCreateConsentCookie,
  YouTubeRequestFailed,
  InvalidVideoId,
  AgeRestricted,
  YouTubeDataUnparsable,
} from './errors';

// Utility classes (for advanced usage)
export { TranscriptParser } from './transcript-parser';
export { InnerTubeClient, InnerTubeConfig, InnerTubeResponse } from './innertube-client';
export { YoutubePageFetcher } from './youtube-page-fetcher';
export { JsVarParser } from './js-var-parser';
export { CaptionsExtractor } from './captions-extractor'; 