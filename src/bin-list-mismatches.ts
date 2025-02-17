#!/usr/bin/env node

import chalk from 'chalk';
import { listMismatchesFromDisk } from './commands/list-mismatches';
import { option } from './constants';
import { getConfig } from './lib/get-config';
import { program } from 'commander';

program.description(
  `
  List dependencies which are required by multiple packages, where the version
  is not the same across every package.`.replace(/^\n/, ''),
);

program.on('--help', () => {
  console.log(chalk`
Examples:
  {dim # uses defaults for resolving packages}
  syncpack list-mismatches
  {dim # uses packages defined by --source when provided}
  syncpack list-mismatches --source {yellow "apps/*/package.json"}
  {dim # multiple globs can be provided like this}
  syncpack list-mismatches --source {yellow "apps/*/package.json"} --source {yellow "core/*/package.json"}
  {dim # uses dependencies regular expression defined by --filter when provided}
  syncpack list-mismatches --filter {yellow "typescript|tslint"}
  {dim # only inspect "devDependencies"}
  syncpack list-mismatches --dev
  {dim # only inspect "devDependencies" and "peerDependencies"}
  syncpack list-mismatches --dev --peer

Resolving Packages:
  1. If {yellow --source} globs are provided, use those.
  2. If using Pnpm Workspaces, read {yellow packages} from {yellow pnpm-workspace.yaml} in the root of the project.
  3. If using Yarn Workspaces, read {yellow workspaces} from {yellow package.json}.
  4. If using Lerna, read {yellow packages} from {yellow lerna.json}.
  5. Default to {yellow "package.json"} and {yellow "packages/*/package.json"}.

Reference:
  globs            {blue.underline https://github.com/isaacs/node-glob#glob-primer}
  lerna.json       {blue.underline https://github.com/lerna/lerna#lernajson}
  Yarn Workspaces  {blue.underline https://yarnpkg.com/lang/en/docs/workspaces}
  Pnpm Workspaces  {blue.underline https://pnpm.js.org/en/workspaces}
`);
});

program
  .option(...option.source)
  .option(...option.prod)
  .option(...option.dev)
  .option(...option.peer)
  .option(...option.filter)
  .parse(process.argv);

listMismatchesFromDisk(
  getConfig({
    dev: program.opts().dev,
    filter: program.opts().filter,
    peer: program.opts().peer,
    prod: program.opts().prod,
    source: program.opts().source,
  }),
);
