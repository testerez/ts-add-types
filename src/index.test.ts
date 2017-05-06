import {isPackageExisting} from '.';

describe('isPackageExisting', () => {
  it('exists', async() => {
    expect(await isPackageExisting('react')).toBe(true);
  });
  it('exists @types', async() => {
    expect(await isPackageExisting('@types/react')).toBe(true);
  });
  it('does not exist', async() => {
    expect(await isPackageExisting('this-does-not-exist')).toBe(false);
  });
})

