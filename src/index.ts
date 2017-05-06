#! /usr/bin/env node
import * as pkgUp from 'pkg-up';
import {
  getDependencies,
  isPackageExisting,
  installPackages,
} from './npmUtils';

const blackList = new Set([
  '@types/typescript',
]);


(async () => {
  const dependancies = getDependencies(require(await pkgUp()));
  const typings = dependancies
    .filter(dep => !/^@types\//.test(dep))
    .map(dep => `@types/${dep}`)
    .filter(dep => dependancies.indexOf(dep) < 0)
    .filter(dep => !blackList.has(dep));
  const existingTypings = (await Promise.all(
    typings.map(dep => isPackageExisting(dep).then(b => b && dep)),
  )).filter(dep => dep);
  if (existingTypings.length) {
    installPackages(existingTypings);
  }
})()
