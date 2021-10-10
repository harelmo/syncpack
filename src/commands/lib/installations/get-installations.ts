import { getDependencies, Installation } from './get-dependencies';
import { DependencyOption, SyncpackConfig } from '../../../constants';
import { SourceWrapper } from '../get-wrappers';
import { matchesFilter as createMatchesFilter } from '../matches-filter';

type Options = DependencyOption & Pick<SyncpackConfig, 'filter'>;

export function* getInstallations(wrappers: SourceWrapper[], options: Options): Generator<Installation> {
  const dependenciesIterator = getDependencies(wrappers, options);
  const matchesFilter = createMatchesFilter(options);

  for (const installedPackage of dependenciesIterator) {
    if (matchesFilter(installedPackage)) {
      for (const installation of installedPackage.installations) {
        yield installation;
      }
    }
  }
}
