#! /usr/bin/env node
import * as pkgUp from 'pkg-up';
import * as inquirer from 'inquirer';
import {
  getDependencies,
  packageExists,
  installPackages,
} from './npmUtils';
import * as path from 'path';
import * as yargs from 'yargs';
const argv = yargs
  .option('force', {
    alias: 'f',
    describe: 'install found typings without prompting',
  })
  .option('dev', {
    alias: 'D',
    describe: 'install typings as dev dependancies',
  })
  .help('h')
  .argv;

const pkgBlackList = new Set([
  '@types/typescript',
]);

const confirm = (message: string, def: boolean) => (
  inquirer.prompt(
      { type: 'confirm', default: def, message, name: 'n' }
  ).then(r => r['n'] as boolean)
);

function printList(items: string[], indent: string) {
  console.log(items.map(s => indent + s).join('\n'));
}

(async () => {
  const pkgPath = await pkgUp();
  if (!pkgPath) {
    throw 'Not in a npm project directory';
  }
  const projectPath = path.dirname(pkgPath);
  const dependancies = getDependencies(require(pkgPath));
  let typePkgs = dependancies
    .filter(dep => !/^@types\//.test(dep))
    .map(dep => `@types/${dep}`)
    .filter(dep => dependancies.indexOf(dep) < 0)
    .filter(dep => !pkgBlackList.has(dep));
  
  // filter out packages that does not exist
  typePkgs = (await Promise.all(
    typePkgs.map(dep => packageExists(dep).then(b => b && dep)),
  )).filter(dep => dep);

  if (!typePkgs.length) {
    return;
  }
  if (!argv.force) {
    console.log(`${typePkgs.length} typing(s) found:`)
    printList(typePkgs, '    ');

    if (!await confirm('install?', false)) {
      return;
    }
  }
  installPackages(typePkgs, projectPath, argv.dev);
})().catch((error: any) => {
  console.error('Error:', error);
  process.exit(1);  
})
