#! /usr/bin/env node
import * as pkgUp from 'pkg-up';
import {
  getDependencies,
  packageExists,
  installPackages,
} from './npmUtils';
import * as path from 'path';

const pkgBlackList = new Set([
  '@types/typescript',
]);


(async () => {
  const pkgPath = await pkgUp();
  if (!pkgPath) {
    throw 'Not in a npm project directory';
  }
  const projectPath = path.dirname(pkgPath);
  const dependancies = getDependencies(require(pkgPath));
  let typesPackages = dependancies
    .filter(dep => !/^@types\//.test(dep))
    .map(dep => `@types/${dep}`)
    .filter(dep => dependancies.indexOf(dep) < 0)
    .filter(dep => !pkgBlackList.has(dep));
  
  // filter out packages that does not exist
  typesPackages = (await Promise.all(
    typesPackages.map(dep => packageExists(dep).then(b => b && dep)),
  )).filter(dep => dep);
  
  if (typesPackages.length) {
    installPackages(typesPackages, projectPath);
  }
})().catch((error: any) => {
  console.error('Error:', error);
})
