import { readProjects } from '../scripts/site-data.mjs';

export default {
  watch: [
    'omp/coverage.json',
    'ompcode/coverage.json',
    'jchtools/coverage.json',
  ],
  load() {
    return readProjects();
  },
};
