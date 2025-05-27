import { TranscriptParser } from "../transcript-parser";

describe("TranscriptParser", () => {
  describe("constructor", () => {
    it("should create parser with default settings", () => {
      const parser = new TranscriptParser();
      expect(parser).toBeInstanceOf(TranscriptParser);
    });

    it("should create parser with custom settings", () => {
      const parser = new TranscriptParser(true, "{text} - {url}");
      expect(parser).toBeInstanceOf(TranscriptParser);
    });
  });

  describe("withConfig", () => {
    it("should create parser with valid link format", () => {
      const parser = TranscriptParser.withConfig(true, "[{text}]({url})");
      expect(parser).toBeInstanceOf(TranscriptParser);
    });

    it("should throw error with invalid link format", () => {
      expect(() => {
        TranscriptParser.withConfig(true, "invalid format");
      }).toThrow("Link format must contain {text} and {url} placeholders");
    });
  });

  describe("parse", () => {
    it("should parse basic transcript", () => {
      const parser = new TranscriptParser(false);

      const xml = `
        <transcript>
            <text start="0.0" dur="1.0">This is a transcript</text>
            <text start="1.0" dur="1.5">With multiple entries</text>
        </transcript>
      `;

      const snippets = parser.parse(xml);
      expect(snippets).toHaveLength(2);
      expect(snippets[0].text).toBe("This is a transcript");
      expect(snippets[0].start).toBe(0.0);
      expect(snippets[0].duration).toBe(1.0);
      expect(snippets[1].text).toBe("With multiple entries");
      expect(snippets[1].start).toBe(1.0);
      expect(snippets[1].duration).toBe(1.5);
    });

    it("should parse transcript with HTML formatting", () => {
      const parserWithFormatting = new TranscriptParser(true);
      const xmlContent = `
        <transcript>
          <text start="12.645" dur="1.37">So in <b>college</b>,</text>
          <text start="15.349" dur="1.564">I was a <i>government</i> major,</text>
          <text start="17.913" dur="3.094">which means <b>I had to write</b> <i>a lot</i> of <b>papers</b>.</text>
        </transcript>
      `;

      const formattedSnippets = parserWithFormatting.parse(xmlContent);

      expect(formattedSnippets).toHaveLength(3);
      expect(formattedSnippets[0].text).toBe("So in <b>college</b>,");
      expect(formattedSnippets[1].text).toBe(
        "I was a <i>government</i> major,",
      );
      expect(formattedSnippets[2].text).toBe(
        "which means <b>I had to write</b> <i>a lot</i> of <b>papers</b>.",
      );
    });

    it("should parse transcript with HTML attributes", () => {
      const xmlWithAttributes = `<?xml version="1.0" encoding="utf-8" ?>
        <transcript>
            <text start="10.0" dur="2.0">This has a <span class="highlight" style="color:red">colored span</span> with attributes.</text>
            <text start="12.5" dur="3.0">And a <a href="https://example.com" target="_blank">link</a> with multiple attributes.</text>
            <text start="16.0" dur="2.5">And <b id="bold1" data-test="value">bold with attributes</b> should work too.</text>
        </transcript>`;

      // Test with formatting preserved
      const parserWithAttributes = new TranscriptParser(true);
      const formattedWithAttributes =
        parserWithAttributes.parse(xmlWithAttributes);

      expect(formattedWithAttributes).toHaveLength(3);
      expect(formattedWithAttributes[0].text).toContain("colored span");
      expect(formattedWithAttributes[1].text).toContain(
        "link (https://example.com)",
      );
      expect(formattedWithAttributes[2].text).toContain("bold with attributes");

      // Test with formatting removed
      const plainParser = new TranscriptParser(false);
      const plainWithAttributes = plainParser.parse(xmlWithAttributes);

      expect(plainWithAttributes).toHaveLength(3);
      expect(plainWithAttributes[0].text).toBe(
        "This has a colored span with attributes.",
      );
      expect(plainWithAttributes[1].text).toBe(
        "And a link (https://example.com) with multiple attributes.",
      );
      expect(plainWithAttributes[2].text).toBe(
        "And bold with attributes should work too.",
      );
    });

    it("should handle edge cases", () => {
      const parser = new TranscriptParser(true);

      // Test empty transcript
      const emptyXml = "<transcript></transcript>";
      const emptyResult = parser.parse(emptyXml);
      expect(emptyResult).toHaveLength(0);

      // Test transcript with empty text elements
      const emptyTextXml =
        '<transcript><text start="0.0" dur="1.0"></text></transcript>';
      const emptyTextResult = parser.parse(emptyTextXml);
      expect(emptyTextResult).toHaveLength(0); // Empty text should be filtered out

      // Test self-closing tags
      const selfClosingXml =
        '<transcript><text start="0.0" dur="1.0">This has a <br/> tag</text></transcript>';
      const selfClosingResult = parser.parse(selfClosingXml);
      expect(selfClosingResult).toHaveLength(1);
      expect(selfClosingResult[0].text).toContain("This has a");
      expect(selfClosingResult[0].text).toContain("tag");
    });

    it("should handle XML with version declaration", () => {
      const parser = new TranscriptParser(false);
      const xmlWithDeclaration = `<?xml version="1.0" encoding="utf-8" ?>
        <transcript>
            <text start="0.0" dur="1.0">Test content</text>
        </transcript>`;

      const result = parser.parse(xmlWithDeclaration);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Test content");
    });

    it("should handle XML entities", () => {
      const parser = new TranscriptParser(false);
      const xmlWithEntities = `
        <transcript>
            <text start="0.0" dur="1.0">This &amp; that &lt;test&gt; &quot;quoted&quot; &#39;apostrophe&#39;</text>
        </transcript>`;

      const result = parser.parse(xmlWithEntities);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("&");
      expect(result[0].text).toContain("<test>");
      expect(result[0].text).toContain('"quoted"');
      expect(result[0].text).toContain("'apostrophe'");
    });

    it("should skip elements with missing attributes", () => {
      const parser = new TranscriptParser(false);
      const xmlWithMissingAttrs = `
        <transcript>
            <text start="0.0" dur="1.0">Valid entry</text>
            <text start="1.0">Missing duration</text>
            <text dur="2.0">Missing start</text>
            <text start="3.0" dur="1.0">Another valid entry</text>
        </transcript>`;

      const result = parser.parse(xmlWithMissingAttrs);
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe("Valid entry");
      expect(result[1].text).toBe("Another valid entry");
    });

    it("should skip elements with invalid timing", () => {
      const parser = new TranscriptParser(false);
      const xmlWithInvalidTiming = `
        <transcript>
            <text start="0.0" dur="1.0">Valid entry</text>
            <text start="invalid" dur="1.0">Invalid start</text>
            <text start="1.0" dur="invalid">Invalid duration</text>
            <text start="2.0" dur="1.0">Another valid entry</text>
        </transcript>`;

      const result = parser.parse(xmlWithInvalidTiming);
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe("Valid entry");
      expect(result[1].text).toBe("Another valid entry");
    });

    it("should clean up whitespace", () => {
      const parser = new TranscriptParser(false);
      const xmlWithWhitespace = `
        <transcript>
            <text start="0.0" dur="1.0">   Multiple   spaces   and   
            newlines   </text>
        </transcript>`;

      const result = parser.parse(xmlWithWhitespace);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Multiple spaces and newlines");
    });

    it("should throw error for malformed XML", () => {
      const parser = new TranscriptParser(false);
      const malformedXml =
        '<transcript><text start="0.0" dur="1.0">Unclosed tag</transcript>';

      expect(() => {
        parser.parse(malformedXml);
      }).toThrow("Failed to parse transcript XML");
    });
  });

  describe("custom link formatting", () => {
    it("should format links with custom format", () => {
      const parser = TranscriptParser.withConfig(true, "[{text}]({url})");
      const xmlWithLink = `
        <transcript>
            <text start="0.0" dur="1.0">Check out <a href="https://example.com">this link</a> here.</text>
        </transcript>`;

      const result = parser.parse(xmlWithLink);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe(
        "Check out [this link](https://example.com) here.",
      );
    });

    it("should handle links without href", () => {
      const parser = new TranscriptParser(true);
      const xmlWithBadLink = `
        <transcript>
            <text start="0.0" dur="1.0">This is a <a>bad link</a> without href.</text>
        </transcript>`;

      const result = parser.parse(xmlWithBadLink);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("This is a bad link without href.");
    });
  });
});
