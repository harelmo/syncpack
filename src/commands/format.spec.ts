import { withJson } from '../../test/mock';
import { DEFAULT_CONFIG } from '../constants';
import { format } from './format';
import { Source, SourceWrapper } from './lib/get-wrappers';

const createWrapper = (contents: Source): SourceWrapper => withJson({ contents, filePath: '' });

describe('format', () => {
  it('sorts Array properties alphabetically by value', () => {
    const wrapper = createWrapper({ keywords: ['B', 'A'] });
    expect(format(wrapper, { ...DEFAULT_CONFIG, sortAz: ['keywords'] })).toEqual({
      keywords: ['A', 'B'],
    });
  });
  it('sorts Object properties alphabetically by key', () => {
    const wrapper = createWrapper({ scripts: { B: '', A: '' } });
    expect(format(wrapper, { ...DEFAULT_CONFIG, sortAz: ['scripts'] })).toEqual({
      scripts: { A: '', B: '' },
    });
  });
  it('sorts named properties first, then the rest alphabetically', () => {
    const wrapper = createWrapper({ A: '', C: '', F: '', B: '', D: '', E: '' });
    expect(format(wrapper, { ...DEFAULT_CONFIG, sortFirst: ['D', 'E', 'f'] })).toEqual({
      D: '',
      E: '',
      F: '',
      A: '',
      B: '',
      C: '',
    });
  });
  it('uses shorthand format for "bugs"', () => {
    const wrapper = createWrapper({ bugs: { url: 'https://github.com/User/repo/issues' } });
    expect(format(wrapper, DEFAULT_CONFIG)).toEqual({ bugs: 'https://github.com/User/repo/issues' });
  });
  it('uses shorthand format for "repository"', () => {
    const wrapper = createWrapper({ repository: { url: 'git://gitlab.com/User/repo', type: 'git' } });
    expect(format(wrapper, DEFAULT_CONFIG)).toEqual({ repository: 'git://gitlab.com/User/repo' });
  });
  it('uses github shorthand format for "repository"', () => {
    const wrapper = createWrapper({ repository: { url: 'git://github.com/User/repo', type: 'git' } });
    expect(format(wrapper, DEFAULT_CONFIG)).toEqual({ repository: 'User/repo' });
  });
});
