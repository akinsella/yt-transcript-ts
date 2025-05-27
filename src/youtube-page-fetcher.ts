import axios, { AxiosInstance, AxiosError } from 'axios';
import { CouldNotRetrieveTranscript } from './errors';

/** The URL template for YouTube video watch pages */
export const WATCH_URL = 'https://www.youtube.com/watch?v={video_id}';

/**
 * Responsible for fetching YouTube video pages and handling special cases
 * like cookie consent, region restrictions.
 */
export class YoutubePageFetcher {
  /** HTTP client used for making requests to YouTube */
  private readonly client: AxiosInstance;

  /**
   * Creates a new page fetcher with the provided HTTP client.
   * 
   * @param client A configured axios HTTP client for making requests
   */
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Fetches the HTML content for a YouTube video page.
   * 
   * @param videoId The YouTube video ID to fetch
   * @returns The HTML content on success
   */
  async fetchVideoPage(videoId: string): Promise<string> {
    const url = WATCH_URL.replace('{video_id}', videoId);

    try {
      const response = await this.client.get(url, {
        headers: {
          'Accept-Language': 'en-US',
        },
      });

      if (response.status !== 200) {
        throw CouldNotRetrieveTranscript.youTubeRequestFailed(
          videoId,
          `YouTube returned status code: ${response.status}`
        );
      }

      const html = response.data;

      // Check if we need to handle cookie consent form (for EU/regions with cookie consent laws)
      if (html.includes('action="https://consent.youtube.com/s"')) {
        // Create and set consent cookie
        await this.createConsentCookie(html, videoId);

        // Fetch the HTML again with the consent cookie
        const consentResponse = await this.client.get(url, {
          headers: {
            'Accept-Language': 'en-US',
          },
        });

        if (consentResponse.status !== 200) {
          throw CouldNotRetrieveTranscript.youTubeRequestFailed(
            videoId,
            `YouTube returned status code after consent: ${consentResponse.status}`
          );
        }

        return consentResponse.data;
      }

      return html;
    } catch (error) {
      if (error instanceof CouldNotRetrieveTranscript) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 403 || axiosError.response?.status === 429) {
          throw CouldNotRetrieveTranscript.ipBlocked(videoId);
        }

        throw CouldNotRetrieveTranscript.youTubeRequestFailed(
          videoId,
          `Network error: ${axiosError.message}`
        );
      }

      throw CouldNotRetrieveTranscript.youTubeRequestFailed(
        videoId,
        `Unknown error: ${error}`
      );
    }
  }

  /**
   * Creates and sets a consent cookie for YouTube.
   * 
   * @param html The HTML content containing the consent form
   * @param videoId The video ID for error reporting
   */
  private async createConsentCookie(html: string, videoId: string): Promise<void> {
    try {
      // Extract the consent form data
      const consentFormMatch = html.match(/<form[^>]*action="https:\/\/consent\.youtube\.com\/s"[^>]*>(.*?)<\/form>/s);
      if (!consentFormMatch) {
        throw CouldNotRetrieveTranscript.failedToCreateConsentCookie(videoId);
      }

      const formContent = consentFormMatch[1];
      
      // Extract hidden input values
      const inputs: Record<string, string> = {};
      const inputMatches = formContent.matchAll(/<input[^>]*type="hidden"[^>]*>/g);
      
      for (const inputMatch of inputMatches) {
        const input = inputMatch[0];
        const nameMatch = input.match(/name="([^"]*)"/);
        const valueMatch = input.match(/value="([^"]*)"/);
        
        if (nameMatch && valueMatch) {
          inputs[nameMatch[1]] = valueMatch[1];
        }
      }

      // Set the consent choice (usually 'accept' or similar)
      inputs['set_eom'] = 'true';
      inputs['continue'] = 'true';

      // Submit the consent form
      const formData = new URLSearchParams(inputs);
      
      await this.client.post('https://consent.youtube.com/s', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Language': 'en-US',
        },
      });

    } catch (error) {
      if (error instanceof CouldNotRetrieveTranscript) {
        throw error;
      }
      
      throw CouldNotRetrieveTranscript.failedToCreateConsentCookie(videoId);
    }
  }
} 