#! /usr/bin/env node
import * as pkgUp from 'pkg-up';
import * as https from 'https';
import * as childProcess from 'child_process';

const blackList = new Set([
  '@types/typescript',
]);

const getDependencies = (packageJson: any) => (
  Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })
);

const installPackages = (packages: string[]) => {
  childProcess.execSync(
    `npm i -D ${packages.join(' ')}`,
    { stdio: [0, 1, 2] },
  );
}

/**
 * Check if a package exist on npmjs.com. It's faster than using npm CLI
 */
export const isPackageExisting = (packageName: string) => (
  new Promise(resolve => {
    https.get({
      host: 'www.npmjs.com',
      path: `/package/${packageName}`,
      port: 443,
      method: 'GET',
      headers: { accept: '*/*' },
    }, res => {
      if (res.statusCode === 200) {
        resolve(true);
      } else if (res.statusCode === 404) {
        resolve(false);
      } else {
        throw new Error('Unable to check if package exists');
      }
    })
  })
);


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
