import { CouldNotRetrieveTranscript } from './errors';

/**
 * Extracts captions/transcript data from YouTube's player response JSON.
 */
export class CaptionsExtractor {
  /**
   * Extracts captions data from the player response JSON.
   * 
   * @param playerResponse The parsed YouTube player response JSON object
   * @param videoId The YouTube video ID (used for error reporting)
   * @returns The captions JSON data
   */
  static extractCaptionsData(playerResponse: any, videoId: string): any {
    // Extract captions from player response
    const captions = playerResponse?.captions;
    if (!captions) {
      throw CouldNotRetrieveTranscript.transcriptsDisabled(videoId);
    }

    const renderer = captions.playerCaptionsTracklistRenderer;
    if (!renderer) {
      throw CouldNotRetrieveTranscript.transcriptsDisabled(videoId);
    }

    return renderer;
  }
} 