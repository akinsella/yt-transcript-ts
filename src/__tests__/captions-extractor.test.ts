import { CaptionsExtractor } from "../captions-extractor";
import {
  CouldNotRetrieveTranscript,
  CouldNotRetrieveTranscriptReason,
} from "../errors";

describe("CaptionsExtractor", () => {
  describe("extractCaptionsData", () => {
    it("should extract captions data successfully", () => {
      const videoId = "test_video_id";

      // Create a mock player response with captions data
      const mockRenderer = {
        captionTracks: [
          {
            baseUrl: "https://example.com/captions",
            name: { simpleText: "English" },
            vssId: ".en",
            languageCode: "en",
            isTranslatable: true,
          },
        ],
      };

      const playerResponse = {
        captions: {
          playerCaptionsTracklistRenderer: mockRenderer,
        },
      };

      // Extract captions data
      const result = CaptionsExtractor.extractCaptionsData(
        playerResponse,
        videoId,
      );

      // Verify the result
      expect(result).toEqual(mockRenderer);

      // Verify content of the extracted data
      expect(result.captionTracks).toBeDefined();
      expect(result.captionTracks).toHaveLength(1);
      expect(result.captionTracks[0].languageCode).toBe("en");
    });

    it("should throw error when captions field is missing", () => {
      const videoId = "test_video_id";
      const playerResponse = {
        videoDetails: {
          videoId: "test_video_id",
          title: "Test Video",
        },
        // No captions field
      };

      // Extract captions data
      expect(() => {
        CaptionsExtractor.extractCaptionsData(playerResponse, videoId);
      }).toThrow(CouldNotRetrieveTranscript);

      try {
        CaptionsExtractor.extractCaptionsData(playerResponse, videoId);
      } catch (error) {
        expect(error).toBeInstanceOf(CouldNotRetrieveTranscript);
        expect((error as CouldNotRetrieveTranscript).videoId).toBe(videoId);
        expect((error as CouldNotRetrieveTranscript).reason).toBe(
          CouldNotRetrieveTranscriptReason.TranscriptsDisabled,
        );
      }
    });

    it("should throw error when renderer is missing", () => {
      const videoId = "test_video_id";
      const playerResponse = {
        captions: {
          // No playerCaptionsTracklistRenderer field
          otherField: "value",
        },
      };

      // Extract captions data
      expect(() => {
        CaptionsExtractor.extractCaptionsData(playerResponse, videoId);
      }).toThrow(CouldNotRetrieveTranscript);

      try {
        CaptionsExtractor.extractCaptionsData(playerResponse, videoId);
      } catch (error) {
        expect(error).toBeInstanceOf(CouldNotRetrieveTranscript);
        expect((error as CouldNotRetrieveTranscript).videoId).toBe(videoId);
        expect((error as CouldNotRetrieveTranscript).reason).toBe(
          CouldNotRetrieveTranscriptReason.TranscriptsDisabled,
        );
      }
    });

    it("should handle empty renderer", () => {
      const videoId = "test_video_id";
      const playerResponse = {
        captions: {
          playerCaptionsTracklistRenderer: {},
        },
      };

      // Extract captions data
      const result = CaptionsExtractor.extractCaptionsData(
        playerResponse,
        videoId,
      );

      // Should succeed but return empty object
      expect(result).toEqual({});
    });

    it("should handle complex structure", () => {
      const videoId = "test_video_id";

      const playerResponse = {
        captions: {
          playerCaptionsTracklistRenderer: {
            captionTracks: [
              {
                baseUrl: "https://example.com/captions/en",
                name: { simpleText: "English" },
                vssId: ".en",
                languageCode: "en",
                isTranslatable: true,
              },
              {
                baseUrl: "https://example.com/captions/fr",
                name: { simpleText: "French" },
                vssId: ".fr",
                languageCode: "fr",
                isTranslatable: true,
              },
            ],
            audioTracks: [
              {
                captionTrackIndices: [0, 1],
                defaultCaptionTrackIndex: 0,
              },
            ],
            translationLanguages: [
              {
                languageCode: "es",
                languageName: { simpleText: "Spanish" },
              },
              {
                languageCode: "de",
                languageName: { simpleText: "German" },
              },
            ],
          },
        },
      };

      // Extract captions data
      const result = CaptionsExtractor.extractCaptionsData(
        playerResponse,
        videoId,
      );

      // Verify the structure
      expect(result.captionTracks).toBeDefined();
      expect(result.captionTracks).toHaveLength(2);
      expect(result.captionTracks[0].languageCode).toBe("en");
      expect(result.captionTracks[1].languageCode).toBe("fr");

      // Verify translation languages
      expect(result.translationLanguages).toBeDefined();
      expect(result.translationLanguages).toHaveLength(2);
      expect(result.translationLanguages[0].languageCode).toBe("es");
      expect(result.translationLanguages[1].languageCode).toBe("de");

      // Verify audio tracks
      expect(result.audioTracks).toBeDefined();
      expect(result.audioTracks).toHaveLength(1);
      expect(result.audioTracks[0].defaultCaptionTrackIndex).toBe(0);
    });

    it("should handle null/undefined player response", () => {
      const videoId = "test_video_id";

      expect(() => {
        CaptionsExtractor.extractCaptionsData(null as any, videoId);
      }).toThrow(CouldNotRetrieveTranscript);

      expect(() => {
        CaptionsExtractor.extractCaptionsData(undefined as any, videoId);
      }).toThrow(CouldNotRetrieveTranscript);
    });

    it("should handle captions field with null value", () => {
      const videoId = "test_video_id";
      const playerResponse = {
        captions: null,
      };

      expect(() => {
        CaptionsExtractor.extractCaptionsData(playerResponse, videoId);
      }).toThrow(CouldNotRetrieveTranscript);
    });

    it("should handle renderer with null value", () => {
      const videoId = "test_video_id";
      const playerResponse = {
        captions: {
          playerCaptionsTracklistRenderer: null,
        },
      };

      expect(() => {
        CaptionsExtractor.extractCaptionsData(playerResponse, videoId);
      }).toThrow(CouldNotRetrieveTranscript);
    });

    it("should preserve all renderer data", () => {
      const videoId = "test_video_id";
      const mockRenderer = {
        captionTracks: [
          {
            baseUrl: "https://example.com/captions",
            name: { simpleText: "English" },
            vssId: ".en",
            languageCode: "en",
            isTranslatable: true,
            kind: "asr",
          },
        ],
        translationLanguages: [
          {
            languageCode: "es",
            languageName: { simpleText: "Spanish" },
          },
        ],
        defaultAudioTrackIndex: 0,
        customField: "customValue",
      };

      const playerResponse = {
        captions: {
          playerCaptionsTracklistRenderer: mockRenderer,
        },
      };

      const result = CaptionsExtractor.extractCaptionsData(
        playerResponse,
        videoId,
      );

      // Should preserve all fields exactly
      expect(result).toEqual(mockRenderer);
      expect(result.customField).toBe("customValue");
      expect(result.defaultAudioTrackIndex).toBe(0);
    });
  });
});
