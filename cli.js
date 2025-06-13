#!/usr/bin/env node
import { Command } from 'commander';
import { sign } from './sign.js';
import { verify } from './verify.js';

const program = new Command();

program
  .command('sign')
  .requiredOption('--bundle <path>')
  .option('--key <path>')
  .option('--out <path>', 'Path to output file (optional; defaults to overwriting input)')
  .option('--xml', 'Parse as XML')
  .action(sign);

program
  .command('verify')
  .requiredOption('--bundle <path>')
  .requiredOption('--key <path>')
  .option('--xml', 'Parse as XML')
  .action(verify);

program.parse();