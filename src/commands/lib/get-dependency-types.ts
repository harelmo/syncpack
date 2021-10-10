import { DependencyType, DEPENDENCY_TYPES } from '../../constants';

interface Options {
  dev: boolean;
  overrides: boolean;
  peer: boolean;
  prod: boolean;
  resolutions: boolean;
}

export const getDependencyTypes = (program: Options): DependencyType[] =>
  program.dev || program.overrides || program.peer || program.prod || program.resolutions
    ? DEPENDENCY_TYPES.filter(
        (type) =>
          (type === 'dependencies' && program.prod) ||
          (type === 'devDependencies' && program.dev) ||
          (type === 'overrides' && program.overrides) ||
          (type === 'peerDependencies' && program.peer) ||
          (type === 'resolutions' && program.resolutions),
      )
    : DEPENDENCY_TYPES;
