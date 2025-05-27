import { JsVarParser } from "../js-var-parser";
import { CouldNotRetrieveTranscript } from "../errors";

describe("JsVarParser", () => {
  const videoId = "test_video_id";

  describe("constructor", () => {
    it("should create parser with variable name", () => {
      const parser = new JsVarParser("testVar");
      expect(parser).toBeInstanceOf(JsVarParser);
    });
  });

  describe("parse", () => {
    it("should parse simple JavaScript variable", () => {
      const parser = new JsVarParser("testVar");
      const html = `
        <script>
          var testVar = {"key": "value", "number": 42};
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({ key: "value", number: 42 });
    });

    it("should parse variable without var keyword", () => {
      const parser = new JsVarParser("testVar");
      const html = `
        <script>
          testVar = {"key": "value"};
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({ key: "value" });
    });

    it("should parse complex nested object", () => {
      const parser = new JsVarParser("complexVar");
      const html = `
        <script>
          var complexVar = {
            "nested": {
              "array": [1, 2, 3],
              "boolean": true,
              "null": null
            },
            "string": "test"
          };
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({
        nested: {
          array: [1, 2, 3],
          boolean: true,
          null: null,
        },
        string: "test",
      });
    });

    it("should handle strings with escaped quotes", () => {
      const parser = new JsVarParser("stringVar");
      const html = `
        <script>
          var stringVar = {"text": "This is a \\"quoted\\" string"};
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({ text: 'This is a "quoted" string' });
    });

    it("should handle strings with single quotes", () => {
      const parser = new JsVarParser("stringVar");
      const html = `
        <script>
          var stringVar = {'text': 'Single quoted string'};
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({ text: "Single quoted string" });
    });

    it("should handle nested braces in strings", () => {
      const parser = new JsVarParser("braceVar");
      const html = `
        <script>
          var braceVar = {"code": "function() { return {}; }", "value": 42};
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({ code: "function() { return {}; }", value: 42 });
    });

    it("should parse variable with whitespace", () => {
      const parser = new JsVarParser("spaceVar");
      const html = `
        <script>
          var   spaceVar   =   {
            "key"  :  "value"
          }  ;
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({ key: "value" });
    });

    it("should handle multiple variables and find the correct one", () => {
      const parser = new JsVarParser("targetVar");
      const html = `
        <script>
          var otherVar = {"other": "data"};
          var targetVar = {"target": "found"};
          var anotherVar = {"another": "value"};
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({ target: "found" });
    });

    it("should parse YouTube-like player response", () => {
      const parser = new JsVarParser("ytInitialPlayerResponse");
      const html = `
        <script>
          var ytInitialPlayerResponse = {
            "videoDetails": {
              "videoId": "dQw4w9WgXcQ",
              "title": "Test Video"
            },
            "captions": {
              "playerCaptionsTracklistRenderer": {
                "captionTracks": []
              }
            }
          };
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result.videoDetails.videoId).toBe("dQw4w9WgXcQ");
      expect(result.videoDetails.title).toBe("Test Video");
      expect(result.captions.playerCaptionsTracklistRenderer).toBeDefined();
    });

    it("should throw error when variable not found", () => {
      const parser = new JsVarParser("nonExistentVar");
      const html = `
        <script>
          var otherVar = {"key": "value"};
        </script>
      `;

      expect(() => {
        parser.parse(html, videoId);
      }).toThrow(CouldNotRetrieveTranscript);
    });

    it("should throw error for malformed JSON", () => {
      const parser = new JsVarParser("malformedVar");
      const html = `
        <script>
          var malformedVar = {key: "value"}; // Missing quotes around key
        </script>
      `;

      expect(() => {
        parser.parse(html, videoId);
      }).toThrow(CouldNotRetrieveTranscript);
    });

    it("should throw error for incomplete JSON", () => {
      const parser = new JsVarParser("incompleteVar");
      const html = `
        <script>
          var incompleteVar = {"key": "value"
        </script>
      `;

      expect(() => {
        parser.parse(html, videoId);
      }).toThrow(CouldNotRetrieveTranscript);
    });

    it("should handle empty object", () => {
      const parser = new JsVarParser("emptyVar");
      const html = `
        <script>
          var emptyVar = {};
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({});
    });

    it("should handle array values", () => {
      const parser = new JsVarParser("arrayVar");
      const html = `
        <script>
          var arrayVar = {
            "items": ["item1", "item2", "item3"],
            "numbers": [1, 2, 3]
          };
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result.items).toEqual(["item1", "item2", "item3"]);
      expect(result.numbers).toEqual([1, 2, 3]);
    });

    it("should handle boolean and null values", () => {
      const parser = new JsVarParser("mixedVar");
      const html = `
        <script>
          var mixedVar = {
            "isTrue": true,
            "isFalse": false,
            "nullValue": null
          };
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result.isTrue).toBe(true);
      expect(result.isFalse).toBe(false);
      expect(result.nullValue).toBe(null);
    });

    it("should handle numeric values", () => {
      const parser = new JsVarParser("numberVar");
      const html = `
        <script>
          var numberVar = {
            "integer": 42,
            "float": 3.14,
            "negative": -10,
            "zero": 0
          };
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result.integer).toBe(42);
      expect(result.float).toBe(3.14);
      expect(result.negative).toBe(-10);
      expect(result.zero).toBe(0);
    });

    it("should handle deeply nested objects", () => {
      const parser = new JsVarParser("deepVar");
      const html = `
        <script>
          var deepVar = {
            "level1": {
              "level2": {
                "level3": {
                  "level4": {
                    "value": "deep"
                  }
                }
              }
            }
          };
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result.level1.level2.level3.level4.value).toBe("deep");
    });

    it("should handle special characters in strings", () => {
      const parser = new JsVarParser("specialVar");
      const html = `
        <script>
          var specialVar = {
            "unicode": "Hello 世界 🌍",
            "symbols": "!@#$%^&*()",
            "newlines": "Line 1\\nLine 2"
          };
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result.unicode).toBe("Hello 世界 🌍");
      expect(result.symbols).toBe("!@#$%^&*()");
      expect(result.newlines).toBe("Line 1\nLine 2");
    });

    it("should fallback to regex parsing when char-by-char fails", () => {
      const parser = new JsVarParser("regexVar");
      // Create HTML that might be challenging for char-by-char parsing
      const html = `
        <script>
          // Some complex JavaScript code here
          var regexVar = {"fallback": "test"};
          // More code
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({ fallback: "test" });
    });
  });

  describe("edge cases", () => {
    it("should handle HTML with no script tags", () => {
      const parser = new JsVarParser("testVar");
      const html = "<html><body>No JavaScript here</body></html>";

      expect(() => {
        parser.parse(html, videoId);
      }).toThrow(CouldNotRetrieveTranscript);
    });

    it("should handle empty HTML", () => {
      const parser = new JsVarParser("testVar");
      const html = "";

      expect(() => {
        parser.parse(html, videoId);
      }).toThrow(CouldNotRetrieveTranscript);
    });

    it("should handle variable name with special characters", () => {
      const parser = new JsVarParser("test_var$123");
      const html = `
        <script>
          var test_var$123 = {"special": "name"};
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual({ special: "name" });
    });

    it("should handle very large JSON objects", () => {
      const parser = new JsVarParser("largeVar");

      // Create a large object
      const largeObject: any = {};
      for (let i = 0; i < 100; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }

      const html = `
        <script>
          var largeVar = ${JSON.stringify(largeObject)};
        </script>
      `;

      const result = parser.parse(html, videoId);
      expect(result).toEqual(largeObject);
      expect(Object.keys(result)).toHaveLength(100);
    });
  });
});
