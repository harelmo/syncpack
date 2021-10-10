import 'expect-more-jest';
import { withJson } from '../../../../test/mock';
import { DEFAULT_CONFIG } from '../../../constants';
import { SourceWrapper } from '../get-wrappers';
import { getMismatchedDependencies } from './get-mismatched-dependencies';

const types: Array<[string, string]> = [
  ['dependencies', 'prod'],
  ['devDependencies', 'dev'],
  ['overrides', 'overrides'],
  ['peerDependencies', 'peer'],
  ['resolutions', 'resolutions'],
];

describe('getMismatchedDependencies', () => {
  types.forEach(([propA, optionA]) => {
    types.forEach(([propB, optionB]) => {
      it(`finds mismatches between ${propA} and ${propB}`, () => {
        const versionA = '1.0.0';
        const versionB = '2.0.0';
        const wrappers = [{ [propA]: { chalk: versionA } }, { [propB]: { chalk: versionB } }].map(
          (contents): SourceWrapper => withJson({ filePath: '', contents }),
        );
        const result = Array.from(
          getMismatchedDependencies(wrappers, {
            ...DEFAULT_CONFIG,
            dev: false,
            overrides: false,
            peer: false,
            prod: false,
            resolutions: false,
            [optionA]: true,
            [optionB]: true,
          }),
        );
        expect(result[0].installations).toBeArrayOfObjects();
        expect(result[0].installations).toBeArrayOfSize(2);
      });
    });
  });

  types.forEach(([propA, optionA]) => {
    types.forEach(([propB, optionB]) => {
      it(`ignores matches between ${propA} and ${propB}`, () => {
        const versionA = '1.0.0';
        const versionB = '1.0.0';
        const wrappers = [{ [propA]: { chalk: versionA } }, { [propB]: { chalk: versionB } }].map(
          (contents): SourceWrapper => withJson({ filePath: '', contents }),
        );
        const result = Array.from(
          getMismatchedDependencies(wrappers, {
            ...DEFAULT_CONFIG,
            dev: false,
            overrides: false,
            peer: false,
            prod: false,
            resolutions: false,
            [optionA]: true,
            [optionB]: true,
          }),
        );
        expect(result).toBeEmptyArray();
      });
    });
  });
});
