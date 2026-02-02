#!/usr/bin/env node

import { analyzeCommand } from './commands/analyze';
import { recommendCommand } from './commands/recommend';

export async function main(argv: string[]): Promise<void> {
  if (argv.length < 3) {
    console.error('Usage: savannahistorian <command> [args...]');
    process.exit(1);
  }

  const command = argv[2];

  switch (command) {
    case 'analyze':
      await analyzeCommand(argv.slice(3));
      break;
    case 'recommend':
      await recommendCommand(argv.slice(3));
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Available commands: analyze, recommend');
      process.exit(1);
  }
}

// Exported for testing and reuse
export { analyzeCommand, recommendCommand };