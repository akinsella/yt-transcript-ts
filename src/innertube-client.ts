import { AxiosInstance, AxiosResponse } from 'axios';
import { CouldNotRetrieveTranscript, CouldNotRetrieveTranscriptReason, PoTokenRequired } from './errors';

/**
 * Configuration for the InnerTube client
 */
export interface InnerTubeConfig {
  context: {
    client: {
      clientName: string;
      clientVersion: string;
      hl?: string;
      gl?: string;
    };
  };
}

/**
 * Response from the InnerTube API
 */
export interface InnerTubeResponse {
  contents?: any;
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: Array<{
        baseUrl: string;
        name: {
          simpleText: string;
        };
        languageCode: string;
        vssId: string;
        isTranslatable?: boolean;
      }>;
      audioTracks?: Array<{
        captionTrackIndices: number[];
      }>;
      translationLanguages?: Array<{
        languageCode: string;
        languageName: {
          simpleText: string;
        };
      }>;
    };
  };
  videoDetails?: any;
  microformat?: any;
  streamingData?: any;
  playabilityStatus?: {
    status: string;
    reason?: string;
    errorScreen?: {
      playerErrorMessageRenderer?: {
        reason?: {
          simpleText?: string;
        };
        subreason?: {
          simpleText?: string;
        };
      };
    };
  };
}

/**
 * InnerTube API client for fetching YouTube data using YouTube's internal API
 */
export class InnerTubeClient {
  private httpClient: AxiosInstance;
  private config: InnerTubeConfig;
  private baseUrl: string = 'https://www.youtube.com/youtubei/v1/player';

  constructor(httpClient: AxiosInstance, config?: Partial<InnerTubeConfig>) {
    this.httpClient = httpClient;
    this.config = {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20241217.09.00',
          hl: 'en',
          gl: 'US',
          ...config?.context?.client,
        },
      },
    };
  }

  /**
   * Fetch video information using the InnerTube API
   */
  async fetchVideoInfo(videoId: string): Promise<InnerTubeResponse> {
    const requestBody = {
      videoId,
      context: this.config.context,
    };

    const url = `${this.baseUrl}?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`;

    try {
      const response: AxiosResponse<InnerTubeResponse> = await this.httpClient.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          'X-YouTube-Client-Name': '1',
          'X-YouTube-Client-Version': this.config.context.client.clientVersion,
        },
      });

      const data = response.data;

      // Check for playability issues
      if (data.playabilityStatus) {
        this.handlePlayabilityStatus(videoId, data.playabilityStatus);
      }

      return data;
    } catch (error: any) {
      // Check if this is already a specific transcript error, if so re-throw it
      if (error instanceof CouldNotRetrieveTranscript || error instanceof PoTokenRequired) {
        throw error;
      }

      if (error.response?.status === 403) {
        throw CouldNotRetrieveTranscript.ipBlocked(videoId);
      }
      
      if (error.response?.status === 429) {
        throw CouldNotRetrieveTranscript.ipBlocked(videoId);
      }
      
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw CouldNotRetrieveTranscript.requestBlocked(videoId);
      }

      throw CouldNotRetrieveTranscript.youTubeRequestFailed(
        videoId,
        error.message || 'Unknown error occurred while fetching video information'
      );
    }
  }

  /**
   * Handle playability status from the InnerTube response
   */
  private handlePlayabilityStatus(videoId: string, playabilityStatus: any): void {
    const status = playabilityStatus.status;

    switch (status) {
      case 'OK':
        // Video is playable, continue
        return;

      case 'UNPLAYABLE':
        const reason = playabilityStatus.reason || 'Video is unplayable';
        const subReasons: string[] = [];
        
        if (playabilityStatus.errorScreen?.playerErrorMessageRenderer) {
          const errorRenderer = playabilityStatus.errorScreen.playerErrorMessageRenderer;
          if (errorRenderer.reason?.simpleText) {
            subReasons.push(errorRenderer.reason.simpleText);
          }
          if (errorRenderer.subreason?.simpleText) {
            subReasons.push(errorRenderer.subreason.simpleText);
          }
        }

        throw CouldNotRetrieveTranscript.videoUnplayable(videoId, reason, subReasons);

      case 'LOGIN_REQUIRED':
        throw CouldNotRetrieveTranscript.ageRestricted(videoId);

      case 'ERROR':
        // Check if this is a PO token requirement
        const errorMessage = playabilityStatus.reason || '';
        if (errorMessage.toLowerCase().includes('po token') || 
            errorMessage.toLowerCase().includes('proof of origin')) {
          throw new PoTokenRequired(videoId);
        }
        
        throw CouldNotRetrieveTranscript.videoUnavailable(videoId);

      case 'CONTENT_CHECK_REQUIRED':
        throw CouldNotRetrieveTranscript.ageRestricted(videoId);

      default:
        throw CouldNotRetrieveTranscript.videoUnavailable(videoId);
    }
  }

  /**
   * Extract caption tracks from the InnerTube response
   */
  extractCaptionTracks(response: InnerTubeResponse): Array<{
    baseUrl: string;
    name: string;
    languageCode: string;
    vssId: string;
    isTranslatable: boolean;
  }> {
    const captionTracks = response.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      return [];
    }

    return captionTracks.map(track => ({
      baseUrl: track.baseUrl,
      name: track.name.simpleText,
      languageCode: track.languageCode,
      vssId: track.vssId,
      isTranslatable: track.isTranslatable || false,
    }));
  }

  /**
   * Extract translation languages from the InnerTube response
   */
  extractTranslationLanguages(response: InnerTubeResponse): Array<{
    languageCode: string;
    languageName: string;
  }> {
    const translationLanguages = response.captions?.playerCaptionsTracklistRenderer?.translationLanguages;
    
    if (!translationLanguages || translationLanguages.length === 0) {
      return [];
    }

    return translationLanguages.map(lang => ({
      languageCode: lang.languageCode,
      languageName: lang.languageName.simpleText,
    }));
  }

  /**
   * Extract video details from the InnerTube response
   */
  extractVideoDetails(response: InnerTubeResponse): any {
    return response.videoDetails || {};
  }

  /**
   * Extract microformat data from the InnerTube response
   */
  extractMicroformat(response: InnerTubeResponse): any {
    return response.microformat || {};
  }

  /**
   * Extract streaming data from the InnerTube response
   */
  extractStreamingData(response: InnerTubeResponse): any {
    return response.streamingData || {};
  }
} 