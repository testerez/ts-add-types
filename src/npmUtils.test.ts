import {packageExists} from './npmUtils';


describe('npmUtils', () => {
  describe('isPackageExisting', () => {
    it('exists', async() => {
      expect(await packageExists('react')).toBe(true);
    });
    it('exists @types', async() => {
      expect(await packageExists('@types/react')).toBe(true);
    });
    it('does not exist', async() => {
      expect(await packageExists('this-does-not-exist')).toBe(false);
    });
  })
})

