#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pkgUp = require("pkg-up");
const https = require("https");
const childProcess = require("child_process");
const blackList = new Set([
    '@types/typescript',
]);
const getDependencies = (packageJson) => (Object.keys(Object.assign({}, packageJson.dependencies, packageJson.devDependencies)));
const installPackages = (packages) => {
    childProcess.execSync(`npm i -D ${packages.join(' ')}`, { stdio: [0, 1, 2] });
};
/**
 * Check if a package exist on npmjs.com. It's faster than using npm CLI
 */
exports.isPackageExisting = (packageName) => (new Promise(resolve => {
    https.get({
        host: 'www.npmjs.com',
        path: `/package/${packageName}`,
        port: 443,
        method: 'GET',
        headers: { accept: '*/*' },
    }, res => {
        if (res.statusCode === 200) {
            resolve(true);
        }
        else if (res.statusCode === 404) {
            resolve(false);
        }
        else {
            throw new Error('Unable to check if package exists');
        }
    });
}));
(() => __awaiter(this, void 0, void 0, function* () {
    const dependancies = getDependencies(require(yield pkgUp()));
    const typings = dependancies
        .filter(dep => !/^@types\//.test(dep))
        .map(dep => `@types/${dep}`)
        .filter(dep => dependancies.indexOf(dep) < 0)
        .filter(dep => !blackList.has(dep));
    const existingTypings = (yield Promise.all(typings.map(dep => exports.isPackageExisting(dep).then(b => b && dep)))).filter(dep => dep);
    if (existingTypings.length) {
        installPackages(existingTypings);
    }
}))();
