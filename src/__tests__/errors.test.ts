import {
  YouTubeTranscriptApiError,
  CookieError,
  CouldNotRetrieveTranscript,
  CouldNotRetrieveTranscriptReason,
} from "../errors";
import { TranscriptList } from "../transcript-list";

describe("Error Classes", () => {
  describe("YouTubeTranscriptApiError", () => {
    it("should create error with default message", () => {
      const error = new YouTubeTranscriptApiError();
      expect(error.name).toBe("YouTubeTranscriptApiError");
      expect(error.message).toBe("YouTube Transcript API error");
    });

    it("should create error with custom message", () => {
      const error = new YouTubeTranscriptApiError("Custom error message");
      expect(error.name).toBe("YouTubeTranscriptApiError");
      expect(error.message).toBe("Custom error message");
    });
  });

  describe("CookieError", () => {
    it("should create error with default message", () => {
      const error = new CookieError();
      expect(error.name).toBe("CookieError");
      expect(error.message).toBe("Cookie error");
    });

    it("should create error with custom message", () => {
      const error = new CookieError("Custom cookie error");
      expect(error.name).toBe("CookieError");
      expect(error.message).toBe("Custom cookie error");
    });

    it("should create pathInvalid error", () => {
      const path = "/invalid/path/cookies.txt";
      const error = CookieError.pathInvalid(path);
      expect(error.name).toBe("CookieError");
      expect(error.message).toBe(
        `Can't load the provided cookie file: ${path}`,
      );
    });

    it("should create invalid error", () => {
      const details = "Cookies have expired";
      const error = CookieError.invalid(details);
      expect(error.name).toBe("CookieError");
      expect(error.message).toBe(
        `The cookies provided are not valid (may have expired): ${details}`,
      );
    });
  });

  describe("CouldNotRetrieveTranscript", () => {
    const videoId = "dQw4w9WgXcQ";

    describe("constructor and basic functionality", () => {
      it("should create error with video ID only", () => {
        const error = new CouldNotRetrieveTranscript(videoId);
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBeUndefined();
        expect(error.reasonData).toBeUndefined();
        expect(error.name).toBe("CouldNotRetrieveTranscript");
      });

      it("should create error with reason", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.TranscriptsDisabled,
        );
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.TranscriptsDisabled,
        );
      });

      it("should create error with reason and data", () => {
        const reasonData = { details: "Test details" };
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.YouTubeRequestFailed,
          reasonData,
        );
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.YouTubeRequestFailed,
        );
        expect(error.reasonData).toEqual(reasonData);
      });
    });

    describe("error message building", () => {
      it("should build message with no reason", () => {
        const error = new CouldNotRetrieveTranscript(videoId);
        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain(videoId);
        expect(error.message).not.toContain("This is most likely caused by");
      });

      it("should build message for transcripts disabled", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.TranscriptsDisabled,
        );
        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("Subtitles are disabled");
      });

      it("should build message for no transcript found", () => {
        const transcriptList = new TranscriptList(
          videoId,
          new Map(),
          new Map(),
          [],
        );

        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.NoTranscriptFound,
          {
            requestedLanguageCodes: ["fr", "es"],
            transcriptData: transcriptList,
          },
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("No transcripts were found");
        expect(error.message).toContain("fr");
        expect(error.message).toContain("es");
      });

      it("should build message for video unavailable", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.VideoUnavailable,
        );
        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("video is no longer available");
      });

      it("should build message for video unplayable with reason and sub-reasons", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.VideoUnplayable,
          {
            reason: "Content is private",
            subReasons: [
              "The owner has made this content private",
              "You need permission to access",
            ],
          },
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("video is unplayable");
        expect(error.message).toContain("Content is private");
        expect(error.message).toContain(
          "The owner has made this content private",
        );
        expect(error.message).toContain("You need permission to access");
      });

      it("should build message for video unplayable with no reason", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.VideoUnplayable,
          {
            subReasons: ["Region restricted"],
          },
        );

        expect(error.message).toContain("No reason specified");
        expect(error.message).toContain("Region restricted");
      });

      it("should build message for IP blocked", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.IpBlocked,
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain(
          "YouTube is blocking requests from your IP",
        );
        expect(error.message).toContain("Ip blocked");
      });

      it("should build message for request blocked", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.RequestBlocked,
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain(
          "YouTube is blocking requests from your IP",
        );
        expect(error.message).toContain("Request blocked");
      });

      it("should build message for translation unavailable", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.TranslationUnavailable,
          { details: "Manual transcripts cannot be translated" },
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("transcript cannot be translated");
        expect(error.message).toContain(
          "Manual transcripts cannot be translated",
        );
      });

      it("should build message for translation language unavailable", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.TranslationLanguageUnavailable,
          { details: "Language not supported" },
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain(
          "translation language is not available",
        );
        expect(error.message).toContain("Language not supported");
      });

      it("should build message for failed to create consent cookie", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.FailedToCreateConsentCookie,
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("Failed to create a consent cookie");
      });

      it("should build message for YouTube request failed", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.YouTubeRequestFailed,
          { details: "Network timeout" },
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("request to YouTube failed");
        expect(error.message).toContain("Network timeout");
      });

      it("should build message for invalid video ID", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.InvalidVideoId,
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("video ID is invalid");
      });

      it("should build message for age restricted", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.AgeRestricted,
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("age-restricted");
      });

      it("should build message for YouTube data unparsable", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.YouTubeDataUnparsable,
        );

        expect(error.message).toContain("Could not retrieve a transcript");
        expect(error.message).toContain("data structure could not be parsed");
      });
    });

    describe("static factory methods", () => {
      it("should create transcriptsDisabled error", () => {
        const error = CouldNotRetrieveTranscript.transcriptsDisabled(videoId);
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.TranscriptsDisabled,
        );
      });

      it("should create noTranscriptFound error", () => {
        const transcriptList = new TranscriptList(
          videoId,
          new Map(),
          new Map(),
          [],
        );
        const languageCodes = ["en", "fr"];

        const error = CouldNotRetrieveTranscript.noTranscriptFound(
          videoId,
          languageCodes,
          transcriptList,
        );

        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.NoTranscriptFound,
        );
        expect(error.reasonData?.requestedLanguageCodes).toEqual(languageCodes);
        expect(error.reasonData?.transcriptData).toBe(transcriptList);
      });

      it("should create videoUnavailable error", () => {
        const error = CouldNotRetrieveTranscript.videoUnavailable(videoId);
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.VideoUnavailable,
        );
      });

      it("should create videoUnplayable error", () => {
        const reason = "Private video";
        const subReasons = ["Owner restriction"];

        const error = CouldNotRetrieveTranscript.videoUnplayable(
          videoId,
          reason,
          subReasons,
        );
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.VideoUnplayable,
        );
        expect(error.reasonData?.reason).toBe(reason);
        expect(error.reasonData?.subReasons).toEqual(subReasons);
      });

      it("should create ipBlocked error", () => {
        const error = CouldNotRetrieveTranscript.ipBlocked(videoId);
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(CouldNotRetrieveTranscriptReason.IpBlocked);
      });

      it("should create requestBlocked error", () => {
        const error = CouldNotRetrieveTranscript.requestBlocked(videoId);
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.RequestBlocked,
        );
      });

      it("should create translationUnavailable error", () => {
        const details = "Translation not supported";
        const error = CouldNotRetrieveTranscript.translationUnavailable(
          videoId,
          details,
        );
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.TranslationUnavailable,
        );
        expect(error.reasonData?.details).toBe(details);
      });

      it("should create translationLanguageUnavailable error", () => {
        const details = "Language not available";
        const error = CouldNotRetrieveTranscript.translationLanguageUnavailable(
          videoId,
          details,
        );
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.TranslationLanguageUnavailable,
        );
        expect(error.reasonData?.details).toBe(details);
      });

      it("should create failedToCreateConsentCookie error", () => {
        const error =
          CouldNotRetrieveTranscript.failedToCreateConsentCookie(videoId);
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.FailedToCreateConsentCookie,
        );
      });

      it("should create youTubeRequestFailed error", () => {
        const details = "HTTP 500 error";
        const error = CouldNotRetrieveTranscript.youTubeRequestFailed(
          videoId,
          details,
        );
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.YouTubeRequestFailed,
        );
        expect(error.reasonData?.details).toBe(details);
      });

      it("should create invalidVideoId error", () => {
        const error = CouldNotRetrieveTranscript.invalidVideoId(videoId);
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.InvalidVideoId,
        );
      });

      it("should create ageRestricted error", () => {
        const error = CouldNotRetrieveTranscript.ageRestricted(videoId);
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.AgeRestricted,
        );
      });

      it("should create youTubeDataUnparsable error", () => {
        const error = CouldNotRetrieveTranscript.youTubeDataUnparsable(videoId);
        expect(error.videoId).toBe(videoId);
        expect(error.reason).toBe(
          CouldNotRetrieveTranscriptReason.YouTubeDataUnparsable,
        );
      });
    });

    describe("edge cases", () => {
      it("should handle empty video ID", () => {
        const error = new CouldNotRetrieveTranscript("");
        expect(error.videoId).toBe("");
        expect(error.message).toContain(
          "Could not retrieve a transcript for the video !",
        );
      });

      it("should handle missing details in reason data", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.YouTubeRequestFailed,
          {}, // Empty reason data
        );
        expect(error.message).toContain("Unknown error");
      });

      it("should handle video unplayable with empty sub-reasons", () => {
        const error = new CouldNotRetrieveTranscript(
          videoId,
          CouldNotRetrieveTranscriptReason.VideoUnplayable,
          {
            reason: "Premium content",
            subReasons: [],
          },
        );

        expect(error.message).toContain("Premium content");
        expect(error.message).not.toContain("Additional Details");
      });
    });
  });
});
