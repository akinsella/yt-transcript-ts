#!/usr/bin/env ts-node

/**
 * YouTube Transcript API Examples Runner
 * 
 * This script allows you to run all examples or specific ones.
 * 
 * Usage:
 *   ts-node examples/index.ts                    # Show available examples
 *   ts-node examples/index.ts basic              # Run basic example
 *   ts-node examples/index.ts all                # Run all examples
 *   ts-node examples/index.ts basic advanced     # Run specific examples
 */

import { spawn } from 'child_process';
import { join } from 'path';

const examples = {
  basic: {
    file: 'yt-transcript-basic.ts',
    description: 'Basic transcript fetching example'
  },
  list: {
    file: 'yt-transcript-list.ts',
    description: 'List available transcripts example'
  },
  advanced: {
    file: 'yt-transcript-advanced.ts',
    description: 'Advanced processing with batch operations'
  },
  details: {
    file: 'youtube-video-details.ts',
    description: 'Fetch video details and metadata'
  },
  translation: {
    file: 'yt-transcript-translation.ts',
    description: 'Translation and multi-language support'
  },
  parser: {
    file: 'transcript-parser-demo.ts',
    description: 'Transcript parser functionality demo'
  }
};

function showHelp() {
  console.log('YouTube Transcript API - TypeScript Examples');
  console.log('============================================\n');
  
  console.log('Available examples:');
  Object.entries(examples).forEach(([key, example]) => {
    console.log(`  ${key.padEnd(12)} - ${example.description}`);
  });
  
  console.log('\nUsage:');
  console.log('  ts-node examples/index.ts [example1] [example2] ...');
  console.log('  ts-node examples/index.ts all                        # Run all examples');
  console.log('  ts-node examples/index.ts basic                      # Run basic example');
  console.log('  ts-node examples/index.ts basic advanced             # Run multiple examples');
  
  console.log('\nOr use npm scripts:');
  Object.keys(examples).forEach(key => {
    console.log(`  npm run example:${key}`);
  });
}

async function runExample(exampleKey: string): Promise<boolean> {
  const example = examples[exampleKey as keyof typeof examples];
  if (!example) {
    console.error(`❌ Unknown example: ${exampleKey}`);
    return false;
  }

  console.log(`\n🚀 Running ${exampleKey} example: ${example.description}`);
  console.log('=' .repeat(60));

  return new Promise((resolve) => {
    const examplePath = join(__dirname, example.file);
    const child = spawn('ts-node', [examplePath], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${exampleKey} example completed successfully`);
        resolve(true);
      } else {
        console.log(`\n❌ ${exampleKey} example failed with code ${code}`);
        resolve(false);
      }
    });

    child.on('error', (error) => {
      console.error(`\n❌ Error running ${exampleKey} example:`, error.message);
      resolve(false);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    return;
  }

  let examplesToRun: string[] = [];

  if (args.includes('all')) {
    examplesToRun = Object.keys(examples);
  } else {
    examplesToRun = args.filter(arg => arg in examples);
    
    // Check for invalid examples
    const invalidExamples = args.filter(arg => !(arg in examples) && arg !== 'all');
    if (invalidExamples.length > 0) {
      console.error(`❌ Unknown examples: ${invalidExamples.join(', ')}`);
      console.log('\nAvailable examples:', Object.keys(examples).join(', '));
      process.exit(1);
    }
  }

  if (examplesToRun.length === 0) {
    console.error('❌ No valid examples specified');
    showHelp();
    process.exit(1);
  }

  console.log(`Running ${examplesToRun.length} example(s): ${examplesToRun.join(', ')}`);

  let successCount = 0;
  let totalCount = examplesToRun.length;

  for (const exampleKey of examplesToRun) {
    const success = await runExample(exampleKey);
    if (success) {
      successCount++;
    }
    
    // Add a delay between examples to avoid rate limiting
    if (examplesToRun.indexOf(exampleKey) < examplesToRun.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next example...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Summary: ${successCount}/${totalCount} examples completed successfully`);
  
  if (successCount === totalCount) {
    console.log('🎉 All examples completed successfully!');
    process.exit(0);
  } else {
    console.log('⚠️  Some examples failed. Check the output above for details.');
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Examples interrupted by user');
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
} 