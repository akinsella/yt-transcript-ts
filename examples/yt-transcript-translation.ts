#!/usr/bin/env ts-node

/**
 * YouTube Transcript Translation Example
 * 
 * This example demonstrates how to fetch translated transcripts
 * and work with different language options.
 */

import { YouTubeTranscriptApi } from '../src/api';
import { Transcript } from '../src/transcript';
import { TranslationLanguage } from '../src/models';
import { CouldNotRetrieveTranscript, CouldNotRetrieveTranscriptReason } from '../src/errors';

async function main() {
  try {
    // Initialize the API
    const api = new YouTubeTranscriptApi();

    // Example video ID (should have translatable transcripts)
    const videoId = 'ZQUxL4Jm1Lo'; // TED Talk - usually has good translation support
    
    console.log('YouTube Transcript Translation Example');
    console.log('=====================================\n');
    console.log(`Working with video: ${videoId}\n`);

    // First, list all available transcripts
    console.log('Step 1: Listing available transcripts...');
    const transcriptList = await api.listTranscripts(videoId);
    
    console.log(`Found ${transcriptList.transcripts().length} total transcripts`);
    
    // Get all transcripts and filter them
    const allTranscripts = transcriptList.transcripts();
    
    // Show manually created transcripts
    const manualTranscripts = allTranscripts.filter((transcript: Transcript) => !transcript.isGenerated);
    console.log(`\nManually created transcripts (${manualTranscripts.length}):`);
    manualTranscripts.forEach((transcript: Transcript) => {
      const translatable = transcript.isTranslatable() ? ' (Translatable)' : ' (Not translatable)';
      console.log(`  - ${transcript.language} (${transcript.languageCode})${translatable}`);
    });

    // Show auto-generated transcripts
    const generatedTranscripts = allTranscripts.filter((transcript: Transcript) => transcript.isGenerated);
    console.log(`\nAuto-generated transcripts (${generatedTranscripts.length}):`);
    generatedTranscripts.forEach((transcript: Transcript) => {
      const translatable = transcript.isTranslatable() ? ' (Translatable)' : ' (Not translatable)';
      console.log(`  - ${transcript.language} (${transcript.languageCode})${translatable}`);
    });

    // Show translatable transcripts
    const translatableTranscripts = allTranscripts.filter((transcript: Transcript) => transcript.isTranslatable());
    console.log(`\nTranslatable transcripts (${translatableTranscripts.length}):`);
    translatableTranscripts.forEach((transcript: Transcript) => {
      console.log(`  - ${transcript.language} (${transcript.languageCode})`);
    });

    // Try to get translation languages if available
    console.log('\n---\nStep 2: Exploring translation options...');
    
    if (translatableTranscripts.length > 0) {
      const baseTranscript = translatableTranscripts[0];
      console.log(`\nUsing base transcript: ${baseTranscript.language} (${baseTranscript.languageCode})`);
      
      // Try to get available translation languages
      try {
        const translationLanguages = baseTranscript.translationLanguages || [];
        console.log(`Available translation languages: ${translationLanguages.length}`);
        
        // Show first 10 translation languages
        const displayLanguages = translationLanguages.slice(0, 10);
        displayLanguages.forEach((lang: TranslationLanguage) => {
          console.log(`  - ${lang.language} (${lang.languageCode})`);
        });
        
        if (translationLanguages.length > 10) {
          console.log(`  ... and ${translationLanguages.length - 10} more`);
        }
      } catch (error) {
        console.log('Could not retrieve translation languages');
      }
    }

    // Demonstrate fetching transcripts in different languages
    console.log('\n---\nStep 3: Fetching transcripts in different languages...');
    
    const languagesToTry = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ar', name: 'Arabic' }
    ];

    const fetchedTranscripts: any[] = [];

    for (const lang of languagesToTry) {
      try {
        console.log(`\nTrying to fetch ${lang.name} (${lang.code}) transcript...`);
        
        const transcript = await api.fetchTranscript(videoId, [lang.code]);
        
        console.log(`✓ Success! Fetched ${transcript.language} transcript`);
        console.log(`  - Language code: ${transcript.languageCode}`);
        console.log(`  - Generated: ${transcript.isGenerated ? 'Yes' : 'No'}`);
        console.log(`  - Snippets: ${transcript.snippets.length}`);
        console.log(`  - Duration: ${transcript.duration().toFixed(2)}s`);
        
        // Show first snippet as sample
        if (transcript.snippets.length > 0) {
          const firstSnippet = transcript.snippets[0];
          const preview = firstSnippet.text.length > 80 
            ? firstSnippet.text.substring(0, 80) + '...'
            : firstSnippet.text;
          console.log(`  - Sample: "${preview}"`);
        }
        
        fetchedTranscripts.push({
          language: transcript.language,
          languageCode: transcript.languageCode,
          transcript: transcript
        });
        
      } catch (error) {
        if (error instanceof CouldNotRetrieveTranscript) {
          switch (error.reason) {
            case CouldNotRetrieveTranscriptReason.NoTranscriptFound:
              console.log(`✗ No ${lang.name} transcript available`);
              break;
            case CouldNotRetrieveTranscriptReason.TranslationUnavailable:
              console.log(`✗ ${lang.name} translation not available`);
              break;
            case CouldNotRetrieveTranscriptReason.TranslationLanguageUnavailable:
              console.log(`✗ ${lang.name} translation language not supported`);
              break;
            default:
              console.log(`✗ Error fetching ${lang.name}: ${error.message}`);
          }
        } else {
          console.log(`✗ Error fetching ${lang.name}: ${error}`);
        }
      }
    }

    // Compare transcripts if we have multiple
    if (fetchedTranscripts.length > 1) {
      console.log('\n---\nStep 4: Comparing transcripts...');
      console.log(`Successfully fetched ${fetchedTranscripts.length} transcripts\n`);
      
      // Compare first snippet across languages
      console.log('First snippet comparison:');
      fetchedTranscripts.forEach(item => {
        if (item.transcript.snippets.length > 0) {
          const firstSnippet = item.transcript.snippets[0];
          const timestamp = `${Math.floor(firstSnippet.start / 60)}:${(firstSnippet.start % 60).toFixed(1).padStart(4, '0')}`;
          console.log(`[${timestamp}] ${item.language}: "${firstSnippet.text}"`);
        }
      });
      
      // Compare statistics
      console.log('\nTranscript statistics:');
      fetchedTranscripts.forEach(item => {
        const transcript = item.transcript;
        const totalWords = transcript.text().split(/\s+/).length;
        const avgWordsPerSnippet = totalWords / transcript.snippets.length;
        
        console.log(`${item.language}:`);
        console.log(`  - Total words: ${totalWords}`);
        console.log(`  - Avg words per snippet: ${avgWordsPerSnippet.toFixed(1)}`);
        console.log(`  - Total duration: ${transcript.duration().toFixed(2)}s`);
      });
    }

    // Demonstrate direct translation fetching
    console.log('\n---\nStep 5: Direct translation example...');
    
    if (translatableTranscripts.length > 0) {
      const baseTranscript = translatableTranscripts[0];
      console.log(`\nUsing base transcript: ${baseTranscript.language}`);
      
      // Try to translate to Spanish
      try {
        console.log('Attempting to translate to Spanish...');
        const translatedTranscript = baseTranscript.translate('es');
        
        // Fetch both the original and translated transcripts using the API
        const originalFetched = await api.fetchTranscript(videoId, [baseTranscript.languageCode]);
        const spanishFetched = await api.fetchTranscript(videoId, [translatedTranscript.languageCode]);
        
        console.log(`✓ Translation successful!`);
        console.log(`  - Language: ${spanishFetched.language}`);
        console.log(`  - Language code: ${spanishFetched.languageCode}`);
        console.log(`  - Snippets: ${spanishFetched.snippets.length}`);
        
        // Show side-by-side comparison of first few snippets
        console.log('\nSide-by-side comparison (first 3 snippets):');
        
        for (let i = 0; i < Math.min(3, originalFetched.snippets.length, spanishFetched.snippets.length); i++) {
          const origSnippet = originalFetched.snippets[i];
          const transSnippet = spanishFetched.snippets[i];
          const timestamp = `${Math.floor(origSnippet.start / 60)}:${(origSnippet.start % 60).toFixed(1).padStart(4, '0')}`;
          
          console.log(`\n[${timestamp}]`);
          console.log(`  ${originalFetched.language}: "${origSnippet.text}"`);
          console.log(`  ${spanishFetched.language}: "${transSnippet.text}"`);
        }
        
      } catch (error) {
        console.log(`✗ Translation failed: ${error}`);
      }
    } else {
      console.log('No translatable transcripts available for this video');
    }

  } catch (error) {
    console.error('Error in translation example:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
} 