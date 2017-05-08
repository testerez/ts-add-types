import * as childProcess from 'child_process';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';

export const getDependencies = (packageJson: any) => (
  Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })
);

export const installPackages = (
  packages: string[],
  projectPath: string,
  dev: boolean
) => {
  const useYarn = shouldUseYarn(projectPath);
  const command = [
    useYarn ? 'yarn add' : 'npm i',
    dev && '-D',
    ...packages,
  ].filter(s => s).join(' ');
  console.log(`$ ${command}`);
  childProcess.execSync(
    command,
    { stdio: [0, 1, 2], cwd: projectPath },
  );
}

/**
 * Check if a package exist on npmjs.com. It's faster than using npm CLI
 */
export const packageExists = (packageName: string) => (
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

export const isYarnInstalled = () => {
  try {
    childProcess.execSync('yarn --version');
    return true;
  } catch (e) {
    return false;
  }
}

export const shouldUseYarn = (projectPath: string) => (
  fs.existsSync(path.join(projectPath, 'yarn.lock')) && isYarnInstalled()
);

export const moduleHasTypings = (modulePath: string) => {
  if (fs.existsSync(path.join(modulePath, 'index.d.ts'))) {
    return true;
  }
  const pkgPath = path.join(modulePath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.log(pkgPath);
    return false;
  }
  const pkg = require(pkgPath);
  return !!(pkg.types || pkg.typings);
}
