import { FetchedTranscript } from "../fetched-transcript";
import { FetchedTranscriptSnippet } from "../models";

describe("FetchedTranscript", () => {
  // Helper function to create a test transcript
  const createTestTranscript = (): FetchedTranscript => {
    const snippets: FetchedTranscriptSnippet[] = [
      {
        text: "Hello world",
        start: 0.0,
        duration: 3.5,
      },
      {
        text: "This is a test",
        start: 3.5,
        duration: 2.8,
      },
      {
        text: "of the transcript system",
        start: 6.3,
        duration: 4.2,
      },
    ];

    return new FetchedTranscript(snippets, "test123", "English", "en", false);
  };

  describe("constructor", () => {
    it("should create a transcript with all properties", () => {
      const snippets: FetchedTranscriptSnippet[] = [
        { text: "Test", start: 0.0, duration: 1.0 },
      ];

      const transcript = new FetchedTranscript(
        snippets,
        "video123",
        "Spanish",
        "es",
        true,
      );

      expect(transcript.snippets).toEqual(snippets);
      expect(transcript.videoId).toBe("video123");
      expect(transcript.language).toBe("Spanish");
      expect(transcript.languageCode).toBe("es");
      expect(transcript.isGenerated).toBe(true);
    });
  });

  describe("toRawData", () => {
    it("should convert transcript to raw data format", () => {
      const transcript = createTestTranscript();
      const rawData = transcript.toRawData();

      expect(rawData).toHaveLength(3);

      // Check first entry
      expect(rawData[0]).toEqual({
        text: "Hello world",
        start: 0.0,
        duration: 3.5,
      });

      // Check last entry
      expect(rawData[2]).toEqual({
        text: "of the transcript system",
        start: 6.3,
        duration: 4.2,
      });
    });

    it("should handle empty transcript", () => {
      const emptyTranscript = new FetchedTranscript(
        [],
        "empty123",
        "English",
        "en",
        false,
      );

      const rawData = emptyTranscript.toRawData();
      expect(rawData).toHaveLength(0);
    });
  });

  describe("text", () => {
    it("should return full transcript text as single string", () => {
      const transcript = createTestTranscript();
      const fullText = transcript.text();

      expect(fullText).toBe(
        "Hello world This is a test of the transcript system",
      );
    });

    it("should handle empty transcript", () => {
      const emptyTranscript = new FetchedTranscript(
        [],
        "empty123",
        "English",
        "en",
        false,
      );

      expect(emptyTranscript.text()).toBe("");
    });

    it("should handle transcript with empty snippets", () => {
      const snippets: FetchedTranscriptSnippet[] = [
        { text: "", start: 0.0, duration: 1.0 },
        { text: "Hello", start: 1.0, duration: 1.0 },
        { text: "", start: 2.0, duration: 1.0 },
      ];

      const transcript = new FetchedTranscript(
        snippets,
        "test123",
        "English",
        "en",
        false,
      );

      expect(transcript.text()).toBe(" Hello ");
    });
  });

  describe("parts", () => {
    it("should return reference to transcript snippets", () => {
      const transcript = createTestTranscript();
      const parts = transcript.parts();

      expect(parts).toHaveLength(3);
      expect(parts[0].text).toBe("Hello world");
      expect(parts[1].start).toBe(3.5);
      expect(parts[2].duration).toBe(4.2);

      // Should be the same reference
      expect(parts).toBe(transcript.snippets);
    });
  });

  describe("getters", () => {
    it("should return language properties", () => {
      const transcript = createTestTranscript();

      expect(transcript.getLanguage()).toBe("English");
      expect(transcript.getLanguageCode()).toBe("en");
      expect(transcript.getIsGenerated()).toBe(false);
    });

    it("should return correct values for generated transcript", () => {
      const transcript = new FetchedTranscript(
        [],
        "test123",
        "French",
        "fr",
        true,
      );

      expect(transcript.getLanguage()).toBe("French");
      expect(transcript.getLanguageCode()).toBe("fr");
      expect(transcript.getIsGenerated()).toBe(true);
    });
  });

  describe("duration", () => {
    it("should calculate total duration correctly", () => {
      const transcript = createTestTranscript();

      // Last entry starts at 6.3 with duration 4.2, so total should be 10.5
      expect(transcript.duration()).toBe(10.5);
    });

    it("should return 0 for empty transcript", () => {
      const emptyTranscript = new FetchedTranscript(
        [],
        "empty123",
        "English",
        "en",
        false,
      );

      expect(emptyTranscript.duration()).toBe(0.0);
    });

    it("should handle single snippet", () => {
      const singleSnippet: FetchedTranscriptSnippet[] = [
        { text: "Single", start: 5.0, duration: 2.5 },
      ];

      const transcript = new FetchedTranscript(
        singleSnippet,
        "single123",
        "English",
        "en",
        false,
      );

      expect(transcript.duration()).toBe(7.5);
    });
  });

  describe("iterator", () => {
    it("should implement iterator interface", () => {
      const transcript = createTestTranscript();

      // Test iterator
      let count = 0;
      for (const segment of transcript) {
        count++;
        expect(segment.start).toBeGreaterThanOrEqual(0.0);
        expect(segment.duration).toBeGreaterThan(0.0);
        expect(segment.text).toBeTruthy();
      }
      expect(count).toBe(3);
    });

    it("should allow collecting to array", () => {
      const transcript = createTestTranscript();

      const segments = Array.from(transcript);
      expect(segments).toHaveLength(3);
      expect(segments[0].text).toBe("Hello world");
      expect(segments[1].text).toBe("This is a test");
      expect(segments[2].text).toBe("of the transcript system");
    });

    it("should handle empty transcript iteration", () => {
      const emptyTranscript = new FetchedTranscript(
        [],
        "empty123",
        "English",
        "en",
        false,
      );

      const segments = Array.from(emptyTranscript);
      expect(segments).toHaveLength(0);
    });
  });

  describe("JSON serialization", () => {
    it("should serialize to JSON correctly", () => {
      const transcript = createTestTranscript();
      const json = transcript.toJSON();

      expect(json).toEqual({
        snippets: transcript.snippets,
        videoId: "test123",
        language: "English",
        languageCode: "en",
        isGenerated: false,
      });
    });

    it("should deserialize from JSON correctly", () => {
      const originalTranscript = createTestTranscript();
      const json = originalTranscript.toJSON();
      const deserializedTranscript = FetchedTranscript.fromJSON(json);

      expect(deserializedTranscript.videoId).toBe(originalTranscript.videoId);
      expect(deserializedTranscript.language).toBe(originalTranscript.language);
      expect(deserializedTranscript.languageCode).toBe(
        originalTranscript.languageCode,
      );
      expect(deserializedTranscript.isGenerated).toBe(
        originalTranscript.isGenerated,
      );
      expect(deserializedTranscript.snippets).toEqual(
        originalTranscript.snippets,
      );
    });

    it("should handle missing fields in JSON", () => {
      const incompleteJson = {
        videoId: "test123",
        // Missing other fields
      };

      const transcript = FetchedTranscript.fromJSON(incompleteJson);
      expect(transcript.videoId).toBe("test123");
      expect(transcript.language).toBe("");
      expect(transcript.languageCode).toBe("");
      expect(transcript.isGenerated).toBe(false);
      expect(transcript.snippets).toEqual([]);
    });

    it("should handle completely empty JSON", () => {
      const transcript = FetchedTranscript.fromJSON({});
      expect(transcript.videoId).toBe("");
      expect(transcript.language).toBe("");
      expect(transcript.languageCode).toBe("");
      expect(transcript.isGenerated).toBe(false);
      expect(transcript.snippets).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle transcript with special characters", () => {
      const snippets: FetchedTranscriptSnippet[] = [
        { text: "Special chars: éñ中文🎉", start: 0.0, duration: 1.0 },
        { text: "Symbols: @#$%^&*()", start: 1.0, duration: 1.0 },
      ];

      const transcript = new FetchedTranscript(
        snippets,
        "special123",
        "Multi-language",
        "mul",
        false,
      );

      expect(transcript.text()).toBe(
        "Special chars: éñ中文🎉 Symbols: @#$%^&*()",
      );
    });

    it("should handle very long transcript", () => {
      const snippets: FetchedTranscriptSnippet[] = [];
      for (let i = 0; i < 1000; i++) {
        snippets.push({
          text: `Snippet ${i}`,
          start: i * 1.0,
          duration: 1.0,
        });
      }

      const transcript = new FetchedTranscript(
        snippets,
        "long123",
        "English",
        "en",
        false,
      );

      expect(transcript.snippets).toHaveLength(1000);
      expect(transcript.duration()).toBe(1000.0);
      expect(transcript.text()).toContain("Snippet 0");
      expect(transcript.text()).toContain("Snippet 999");
    });

    it("should handle transcript with zero duration snippets", () => {
      const snippets: FetchedTranscriptSnippet[] = [
        { text: "Normal", start: 0.0, duration: 1.0 },
        { text: "Zero duration", start: 1.0, duration: 0.0 },
        { text: "Another normal", start: 1.0, duration: 2.0 },
      ];

      const transcript = new FetchedTranscript(
        snippets,
        "zero123",
        "English",
        "en",
        false,
      );

      expect(transcript.duration()).toBe(3.0); // 1.0 + 2.0
      expect(transcript.text()).toBe("Normal Zero duration Another normal");
    });
  });
});
