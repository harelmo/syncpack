import { getDependencyTypes } from './commands/lib/get-dependency-types';
import minimatch from 'minimatch';
import { getWrappers, SourceWrapper } from './commands/lib/get-wrappers';
import { DependencyType, ValidRange } from './constants';
import { getConfig } from './lib/get-config';
import { setSemverRange } from './commands/lib/set-semver-range';

interface Instance {
  name: string;
  wrapper: SourceWrapper;
  version: string;
  dependencyType: DependencyType;
}

interface Lookup {
  [name: string]: Instance[];
}

interface SemverGroup {
  dependencies: string[];
  packages: string[];
  range: ValidRange;
  instancesByDependencyName: Lookup;
}

interface VersionGroup {
  dependencies: string[];
  packages: string[];
  instancesByDependencyName: Lookup;
}

interface UserConfig {
  semverGroups: SemverGroup[];
  versionGroups: VersionGroup[];
}

function matchesGroup(pkgName: string, dependencyName: string, group: SemverGroup | VersionGroup): boolean {
  return (
    group.packages.some((pattern) => minimatch(pkgName, pattern)) &&
    group.dependencies.some((pattern) => minimatch(dependencyName, pattern))
  );
}

const config = getConfig({
  dev: true,
  peer: true,
  prod: true,
  source: ['/Users/foldleft/Dev/*/package.json'],
});

const userConfig: UserConfig = {
  semverGroups: [
    {
      dependencies: ['**'],
      packages: ['hackernews-node'],
      range: '~',
      instancesByDependencyName: {},
    },
    {
      dependencies: ['**'],
      packages: ['**'],
      range: '',
      instancesByDependencyName: {},
    },
  ],
  versionGroups: [
    {
      dependencies: ['@types/*'],
      packages: ['eslint-*'],
      instancesByDependencyName: {},
    },
    {
      dependencies: ['**'],
      packages: ['**'],
      instancesByDependencyName: {},
    },
  ],
};

const wrappers = getWrappers(config);
const dependencyTypes = getDependencyTypes(config);
const allInstances: Instance[] = [];

// populate semverPartitions and versionPartitions
for (const wrapper of wrappers) {
  for (const dependencyType of dependencyTypes) {
    const pkgs = Object.entries(wrapper.contents?.[dependencyType] || {});
    for (const [name, version] of pkgs) {
      const pkgName = `${wrapper.contents.name}`;
      const instance = { name, wrapper, version, dependencyType };
      let didMatchSemverGroup = false;
      let didMatchVersionGroup = false;
      allInstances.push(instance);
      semverGroupsLoop: for (const i in userConfig.semverGroups) {
        const semverGroup = userConfig.semverGroups[i];
        if (matchesGroup(pkgName, name, semverGroup)) {
          semverGroup.instancesByDependencyName[name] = semverGroup.instancesByDependencyName[name] || [];
          semverGroup.instancesByDependencyName[name].push(instance);
          didMatchSemverGroup = true;
          break semverGroupsLoop;
        }
      }
      if (!didMatchSemverGroup) {
        throw new Error(`${name} in ${pkgName} did not match any semver group`);
      }
      versionGroupsLoop: for (const i in userConfig.versionGroups) {
        const versionGroup = userConfig.versionGroups[i];
        if (matchesGroup(pkgName, name, versionGroup)) {
          versionGroup.instancesByDependencyName[name] = versionGroup.instancesByDependencyName[name] || [];
          versionGroup.instancesByDependencyName[name].push(instance);
          didMatchVersionGroup = true;
          break versionGroupsLoop;
        }
      }
      if (!didMatchVersionGroup) {
        throw new Error(`${name} in ${pkgName} did not match any version group`);
      }
    }
  }
}

console.log(allInstances.length, 'total instances');

//
for (const semverGroup of userConfig.semverGroups) {
  console.log('='.repeat(80));
  const { dependencies, packages, range } = semverGroup;
  const dependencySize = Object.keys(semverGroup.instancesByDependencyName).length;
  const instanceSize = Object.values(semverGroup.instancesByDependencyName).reduce(
    (sum, instances) => sum + instances.length,
    0,
  );
  console.log(dependencySize, 'dependencies and', instanceSize, 'instances in semver group', {
    dependencies,
    packages,
    range,
  });
  const setRange = setSemverRange({ semverRange: range });

  for (const [name, instances] of Object.entries(semverGroup.instancesByDependencyName)) {
    for (const instance of instances) {
      if (instance.version !== setRange(instance.version)) {
        console.log(name, instance.version, `does not have range "${range}"`);
      }
    }
  }
}

for (const versionGroup of userConfig.versionGroups) {
  console.log('='.repeat(80));
  const { dependencies, packages } = versionGroup;
  const dependencySize = Object.keys(versionGroup.instancesByDependencyName).length;
  const instanceSize = Object.values(versionGroup.instancesByDependencyName).reduce(
    (sum, instances) => sum + instances.length,
    0,
  );
  console.log(dependencySize, 'dependencies and', instanceSize, 'instances in version group', {
    dependencies,
    packages,
  });
  for (const [name, instances] of Object.entries(versionGroup.instancesByDependencyName)) {
    if (
      instances.length > 1 &&
      instances.some((instance, i) => i > 0 && instances[i - 1].version !== instance.version)
    ) {
      console.log(
        name,
        'has mismatches',
        instances.map(({ version }) => version),
      );
    }
  }
}
