import axios from "axios";
import { YouTubeTranscriptApi } from "../api";
import {
  CouldNotRetrieveTranscript,
  CouldNotRetrieveTranscriptReason,
} from "../errors";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.isAxiosError separately
const mockIsAxiosError = jest.fn();
(axios as any).isAxiosError = mockIsAxiosError;

describe("YouTubeTranscriptApi", () => {
  let api: YouTubeTranscriptApi;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a fresh API instance
    api = new YouTubeTranscriptApi();

    // Mock axios.create to return the mocked axios instance
    mockedAxios.create.mockReturnValue(mockedAxios);

    // Reset the isAxiosError mock
    mockIsAxiosError.mockReset();
  });

  describe("constructor", () => {
    it("should create API with default configuration", () => {
      const api = new YouTubeTranscriptApi();
      expect(api).toBeInstanceOf(YouTubeTranscriptApi);
    });

    it("should create API with custom configuration", () => {
      const customClient = axios.create();
      const api = new YouTubeTranscriptApi({
        httpClient: customClient,
        timeout: 10000,
        userAgent: "Custom Bot 1.0",
      });
      expect(api).toBeInstanceOf(YouTubeTranscriptApi);
    });

    it("should warn about cookie file support", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      new YouTubeTranscriptApi({
        cookiePath: "/path/to/cookies.txt",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Cookie file support not yet implemented in TypeScript version",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("static methods", () => {
    describe("isValidVideoId", () => {
      it("should validate correct video IDs", () => {
        expect(YouTubeTranscriptApi.isValidVideoId("dQw4w9WgXcQ")).toBe(true);
        expect(YouTubeTranscriptApi.isValidVideoId("abc123DEF45")).toBe(true);
        expect(YouTubeTranscriptApi.isValidVideoId("_-_-_-_-_-_")).toBe(true);
      });

      it("should reject invalid video IDs", () => {
        expect(YouTubeTranscriptApi.isValidVideoId("too-short")).toBe(false);
        expect(YouTubeTranscriptApi.isValidVideoId("way-too-long-id")).toBe(
          false,
        );
        expect(YouTubeTranscriptApi.isValidVideoId("invalid@chars")).toBe(
          false,
        );
        expect(YouTubeTranscriptApi.isValidVideoId("")).toBe(false);
      });
    });

    describe("extractVideoId", () => {
      it("should extract video ID from various YouTube URL formats", () => {
        expect(
          YouTubeTranscriptApi.extractVideoId(
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          ),
        ).toBe("dQw4w9WgXcQ");
        expect(
          YouTubeTranscriptApi.extractVideoId("https://youtu.be/dQw4w9WgXcQ"),
        ).toBe("dQw4w9WgXcQ");
        expect(
          YouTubeTranscriptApi.extractVideoId(
            "https://www.youtube.com/embed/dQw4w9WgXcQ",
          ),
        ).toBe("dQw4w9WgXcQ");
        expect(
          YouTubeTranscriptApi.extractVideoId(
            "https://www.youtube.com/v/dQw4w9WgXcQ",
          ),
        ).toBe("dQw4w9WgXcQ");
      });

      it("should return null for invalid URLs", () => {
        expect(YouTubeTranscriptApi.extractVideoId("https://example.com")).toBe(
          null,
        );
        expect(YouTubeTranscriptApi.extractVideoId("not-a-url")).toBe(null);
        expect(YouTubeTranscriptApi.extractVideoId("")).toBe(null);
      });

      it("should handle URLs with additional parameters", () => {
        expect(
          YouTubeTranscriptApi.extractVideoId(
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s",
          ),
        ).toBe("dQw4w9WgXcQ");
        expect(
          YouTubeTranscriptApi.extractVideoId(
            "https://youtu.be/dQw4w9WgXcQ?t=30",
          ),
        ).toBe("dQw4w9WgXcQ");
      });
    });
  });

  describe("fetchTranscript", () => {
    const videoId = "dQw4w9WgXcQ";
    const mockHtml = `
      <html>
        <script>
          var ytInitialPlayerResponse = {
            "captions": {
              "playerCaptionsTracklistRenderer": {
                "captionTracks": [
                  {
                    "baseUrl": "https://example.com/transcript",
                    "name": {"simpleText": "English"},
                    "languageCode": "en",
                    "isTranslatable": false
                  }
                ]
              }
            }
          };
        </script>
      </html>
    `;

    const mockTranscriptXml = `
      <transcript>
        <text start="0.0" dur="3.0">Hello world</text>
        <text start="3.0" dur="2.0">This is a test</text>
      </transcript>
    `;

    it("should fetch transcript successfully", async () => {
      // Mock the YouTube page request
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockHtml,
      });

      // Mock the transcript XML request
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockTranscriptXml,
      });

      const transcript = await api.fetchTranscript(videoId, ["en"]);

      expect(transcript.videoId).toBe(videoId);
      expect(transcript.language).toBe("English");
      expect(transcript.languageCode).toBe("en");
      expect(transcript.snippets).toHaveLength(2);
      expect(transcript.snippets[0].text).toBe("Hello world");
      expect(transcript.snippets[1].text).toBe("This is a test");
    });

    it("should handle HTTP errors", async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
        isAxiosError: true,
      });

      await expect(api.fetchTranscript(videoId, ["en"])).rejects.toThrow(
        CouldNotRetrieveTranscript,
      );
    });

    it("should handle network errors", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

      await expect(api.fetchTranscript(videoId, ["en"])).rejects.toThrow(
        CouldNotRetrieveTranscript,
      );
    });
  });

  describe("listTranscripts", () => {
    const videoId = "dQw4w9WgXcQ";
    const mockHtml = `
      <html>
        <script>
          var ytInitialPlayerResponse = {
            "captions": {
              "playerCaptionsTracklistRenderer": {
                "captionTracks": [
                  {
                    "baseUrl": "https://example.com/transcript/en",
                    "name": {"simpleText": "English"},
                    "languageCode": "en",
                    "isTranslatable": true
                  },
                  {
                    "baseUrl": "https://example.com/transcript/fr",
                    "name": {"simpleText": "French"},
                    "languageCode": "fr",
                    "kind": "asr",
                    "isTranslatable": true
                  }
                ],
                "translationLanguages": [
                  {
                    "languageCode": "es",
                    "languageName": {"simpleText": "Spanish"}
                  }
                ]
              }
            }
          };
        </script>
      </html>
    `;

    it("should list available transcripts", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockHtml,
      });

      const transcriptList = await api.listTranscripts(videoId);

      expect(transcriptList.videoId).toBe(videoId);
      expect(transcriptList.transcripts()).toHaveLength(2);

      const transcripts = transcriptList.transcripts();
      expect(transcripts[0].languageCode).toBe("en");
      expect(transcripts[0].isGenerated).toBe(false);
      expect(transcripts[1].languageCode).toBe("fr");
      expect(transcripts[1].isGenerated).toBe(true);
    });

    it("should handle missing captions", async () => {
      const htmlWithoutCaptions = `
        <html>
          <script>
            var ytInitialPlayerResponse = {
              "videoDetails": {"videoId": "${videoId}"}
            };
          </script>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: htmlWithoutCaptions,
      });

      await expect(api.listTranscripts(videoId)).rejects.toThrow(
        CouldNotRetrieveTranscript,
      );
    });

    it("should handle 403 errors as IP blocked", async () => {
      const axiosError = {
        response: { status: 403 },
        isAxiosError: true,
        message: "Request failed with status code 403",
        name: "AxiosError",
      };

      // Mock axios.isAxiosError to return true for our mock error
      mockIsAxiosError.mockReturnValue(true);

      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(api.listTranscripts(videoId)).rejects.toThrow(
        expect.objectContaining({
          reason: CouldNotRetrieveTranscriptReason.IpBlocked,
        }),
      );
    });

    it("should handle 429 errors as IP blocked", async () => {
      const axiosError = {
        response: { status: 429 },
        isAxiosError: true,
        message: "Request failed with status code 429",
        name: "AxiosError",
      };

      // Mock axios.isAxiosError to return true for our mock error
      mockIsAxiosError.mockReturnValue(true);

      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(api.listTranscripts(videoId)).rejects.toThrow(
        expect.objectContaining({
          reason: CouldNotRetrieveTranscriptReason.IpBlocked,
        }),
      );
    });
  });

  describe("fetchVideoDetails", () => {
    const videoId = "dQw4w9WgXcQ";
    const mockHtml = `
      <html>
        <script>
          var ytInitialPlayerResponse = {
            "videoDetails": {
              "videoId": "${videoId}",
              "title": "Test Video",
              "lengthSeconds": "212",
              "author": "Test Channel",
              "viewCount": "1000000",
              "channelId": "UC123456789",
              "shortDescription": "A test video",
              "thumbnail": {
                "thumbnails": [
                  {"url": "https://example.com/thumb.jpg", "width": 120, "height": 90}
                ]
              },
              "isLiveContent": false
            },
            "captions": {
              "playerCaptionsTracklistRenderer": {}
            },
            "streamingData": {
              "expiresInSeconds": "21600",
              "formats": [],
              "adaptiveFormats": []
            }
          };
        </script>
      </html>
    `;

    it("should fetch video details", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockHtml,
      });

      const details = await api.fetchVideoDetails(videoId);

      expect(details.videoId).toBe(videoId);
      expect(details.title).toBe("Test Video");
      expect(details.lengthSeconds).toBe(212);
      expect(details.author).toBe("Test Channel");
      expect(details.viewCount).toBe("1000000");
      expect(details.channelId).toBe("UC123456789");
      expect(details.shortDescription).toBe("A test video");
      expect(details.isLiveContent).toBe(false);
      expect(details.thumbnails).toHaveLength(1);
    });

    it("should handle missing video details", async () => {
      const htmlWithoutDetails = `
        <html>
          <script>
            var ytInitialPlayerResponse = {};
          </script>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: htmlWithoutDetails,
      });

      await expect(api.fetchVideoDetails(videoId)).rejects.toThrow(
        CouldNotRetrieveTranscript,
      );
    });
  });

  describe("fetchVideoInfos", () => {
    const videoId = "dQw4w9WgXcQ";
    const mockHtml = `
      <html>
        <script>
          var ytInitialPlayerResponse = {
            "videoDetails": {
              "videoId": "${videoId}",
              "title": "Test Video",
              "lengthSeconds": "212",
              "author": "Test Channel",
              "viewCount": "1000000",
              "channelId": "UC123456789",
              "shortDescription": "A test video",
              "thumbnail": {"thumbnails": []},
              "isLiveContent": false
            },
            "microformat": {
              "playerMicroformatRenderer": {
                "title": {"simpleText": "Test Video"},
                "description": {"simpleText": "Test description"}
              }
            },
            "streamingData": {
              "expiresInSeconds": "21600",
              "formats": [],
              "adaptiveFormats": []
            },
            "captions": {
              "playerCaptionsTracklistRenderer": {
                "captionTracks": []
              }
            }
          };
        </script>
      </html>
    `;

    it("should fetch complete video information", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockHtml,
      });

      const videoInfos = await api.fetchVideoInfos(videoId);

      expect(videoInfos.videoDetails.videoId).toBe(videoId);
      expect(videoInfos.videoDetails.title).toBe("Test Video");
      expect(videoInfos.microformat.title).toBe("Test Video");
      expect(videoInfos.streamingData.expiresInSeconds).toBe("21600");
      expect(videoInfos.transcriptList).toBeDefined();
    });
  });

  describe("consent cookie handling", () => {
    const videoId = "dQw4w9WgXcQ";
    const consentHtml = `
      <html>
        <form action="https://consent.youtube.com/s">
          <input type="hidden" name="continue" value="https://www.youtube.com/">
          <input type="hidden" name="gl" value="US">
        </form>
      </html>
    `;

    const normalHtml = `
      <html>
        <script>
          var ytInitialPlayerResponse = {
            "captions": {
              "playerCaptionsTracklistRenderer": {}
            }
          };
        </script>
      </html>
    `;

    it("should handle consent cookie creation", async () => {
      // First request returns consent form
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: consentHtml,
      });

      // POST to consent endpoint
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: "OK",
      });

      // Second request returns normal page
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: normalHtml,
      });

      const transcriptList = await api.listTranscripts(videoId);
      expect(transcriptList).toBeDefined();

      // Verify consent form was submitted
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://consent.youtube.com/s",
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
        }),
      );
    });
  });

  describe("error handling", () => {
    const videoId = "dQw4w9WgXcQ";

    it("should handle other HTTP errors", async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 500 },
        isAxiosError: true,
        message: "Internal Server Error",
      });

      await expect(api.listTranscripts(videoId)).rejects.toThrow(
        expect.objectContaining({
          reason: CouldNotRetrieveTranscriptReason.YouTubeRequestFailed,
        }),
      );
    });

    it("should handle unparsable YouTube data", async () => {
      const invalidHtml = `
        <html>
          <script>
            var ytInitialPlayerResponse = "not valid json";
          </script>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: invalidHtml,
      });

      await expect(api.listTranscripts(videoId)).rejects.toThrow(
        expect.objectContaining({
          reason: CouldNotRetrieveTranscriptReason.YouTubeDataUnparsable,
        }),
      );
    });
  });
});
