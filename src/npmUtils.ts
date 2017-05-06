import * as childProcess from 'child_process';
import * as https from 'https';

export const getDependencies = (packageJson: any) => (
  Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })
);

export const installPackages = (packages: string[]) => {
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
