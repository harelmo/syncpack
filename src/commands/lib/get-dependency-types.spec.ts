import { getDependencyTypes } from './get-dependency-types';

describe('getDependencyTypes', () => {
  it('returns all if none are set or true if any are set', () => {
    const prod = 'dependencies';
    const dev = 'devDependencies';
    const overrides = 'overrides';
    const peer = 'peerDependencies';
    const resolutions = 'resolutions';
    const allDisabled = { dev: false, overrides: false, peer: false, prod: false, resolutions: false };
    expect(getDependencyTypes(allDisabled)).toEqual([prod, dev, overrides, peer, resolutions]);
    expect(getDependencyTypes({ ...allDisabled, dev: true })).toEqual([dev]);
    expect(getDependencyTypes({ ...allDisabled, overrides: true })).toEqual([overrides]);
    expect(getDependencyTypes({ ...allDisabled, peer: true })).toEqual([peer]);
    expect(getDependencyTypes({ ...allDisabled, prod: true })).toEqual([prod]);
    expect(getDependencyTypes({ ...allDisabled, resolutions: true })).toEqual([resolutions]);
  });
});
