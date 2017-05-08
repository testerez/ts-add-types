import {packageExists, moduleHasTypings} from './npmUtils';
import * as path from 'path';

const rootPath = path.join(__dirname, '..');

describe('npmUtils', () => {
  describe('isPackageExisting', () => {
    it('exists', async () => {
      expect(await packageExists('react')).toBe(true);
    });
    it('exists @types', async () => {
      expect(await packageExists('@types/react')).toBe(true);
    });
    it('does not exist', async () => {
      expect(await packageExists('this-does-not-exist')).toBe(false);
    });
  });

  describe('moduleHasTypings', () => {
    it('has typings', async () => {
      expect(await moduleHasTypings(
        path.join(rootPath, 'node_modules', 'typescript')
      )).toBe(true);
    });
    it('has no', async () => {
      expect(await moduleHasTypings(
        path.join(rootPath, 'node_modules', 'jest')
      )).toBe(false);
    });
  });
})



