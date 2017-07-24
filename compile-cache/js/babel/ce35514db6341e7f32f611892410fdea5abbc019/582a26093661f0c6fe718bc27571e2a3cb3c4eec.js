'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var defaultProjectConfig = {

  ecmaVersion: 6,
  libs: [],
  loadEagerly: [],
  dontLoad: ['node_module/**'],
  plugins: {

    doc_comment: true
  }
};

exports.defaultProjectConfig = defaultProjectConfig;
var defaultServerConfig = {

  ecmaVersion: 6,
  libs: [],
  loadEagerly: [],
  dontLoad: ['node_module/**'],
  plugins: {

    doc_comment: true
  },
  dependencyBudget: 20000,
  ecmaScript: true
};

exports.defaultServerConfig = defaultServerConfig;
var ecmaVersions = [5, 6, 7];

exports.ecmaVersions = ecmaVersions;
var availableLibs = ['browser', 'chai', 'jquery', 'underscore'];

exports.availableLibs = availableLibs;
var availablePlugins = {

  complete_strings: {

    maxLength: 15
  },
  doc_comment: {

    fullDocs: true,
    strong: false
  },
  node: {

    dontLoad: '',
    load: '',
    modules: ''
  },
  node_resolve: {},
  modules: {

    dontLoad: '',
    load: '',
    modules: ''
  },
  es_modules: {},
  angular: {},
  requirejs: {

    baseURL: '',
    paths: '',
    override: ''
  },
  commonjs: {}
};
exports.availablePlugins = availablePlugins;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvY29uZmlnL3Rlcm4tY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7QUFFTCxJQUFNLG9CQUFvQixHQUFHOztBQUVsQyxhQUFXLEVBQUUsQ0FBQztBQUNkLE1BQUksRUFBRSxFQUFFO0FBQ1IsYUFBVyxFQUFFLEVBQUU7QUFDZixVQUFRLEVBQUUsQ0FDUixnQkFBZ0IsQ0FDakI7QUFDRCxTQUFPLEVBQUU7O0FBRVAsZUFBVyxFQUFFLElBQUk7R0FDbEI7Q0FDRixDQUFDOzs7QUFFSyxJQUFNLG1CQUFtQixHQUFHOztBQUVqQyxhQUFXLEVBQUUsQ0FBQztBQUNkLE1BQUksRUFBRSxFQUFFO0FBQ1IsYUFBVyxFQUFFLEVBQUU7QUFDZixVQUFRLEVBQUUsQ0FDUixnQkFBZ0IsQ0FDakI7QUFDRCxTQUFPLEVBQUU7O0FBRVAsZUFBVyxFQUFFLElBQUk7R0FDbEI7QUFDRCxrQkFBZ0IsRUFBRSxLQUFLO0FBQ3ZCLFlBQVUsRUFBRSxJQUFJO0NBQ2pCLENBQUM7OztBQUVLLElBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O0FBRS9CLElBQU0sYUFBYSxHQUFHLENBRTNCLFNBQVMsRUFDVCxNQUFNLEVBQ04sUUFBUSxFQUNSLFlBQVksQ0FDYixDQUFDOzs7QUFFSyxJQUFNLGdCQUFnQixHQUFHOztBQUU5QixrQkFBZ0IsRUFBRTs7QUFFaEIsYUFBUyxFQUFFLEVBQUU7R0FDZDtBQUNELGFBQVcsRUFBRTs7QUFFWCxZQUFRLEVBQUUsSUFBSTtBQUNkLFVBQU0sRUFBRSxLQUFLO0dBQ2Q7QUFDRCxNQUFJLEVBQUU7O0FBRUosWUFBUSxFQUFFLEVBQUU7QUFDWixRQUFJLEVBQUUsRUFBRTtBQUNSLFdBQU8sRUFBRSxFQUFFO0dBQ1o7QUFDRCxjQUFZLEVBQUUsRUFBRTtBQUNoQixTQUFPLEVBQUU7O0FBRVAsWUFBUSxFQUFFLEVBQUU7QUFDWixRQUFJLEVBQUUsRUFBRTtBQUNSLFdBQU8sRUFBRSxFQUFFO0dBQ1o7QUFDRCxZQUFVLEVBQUUsRUFBRTtBQUNkLFNBQU8sRUFBRSxFQUFFO0FBQ1gsV0FBUyxFQUFFOztBQUVULFdBQU8sRUFBRSxFQUFFO0FBQ1gsU0FBSyxFQUFFLEVBQUU7QUFDVCxZQUFRLEVBQUUsRUFBRTtHQUNiO0FBQ0QsVUFBUSxFQUFFLEVBQUU7Q0FDYixDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvY29uZmlnL3Rlcm4tY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0UHJvamVjdENvbmZpZyA9IHtcblxuICBlY21hVmVyc2lvbjogNixcbiAgbGliczogW10sXG4gIGxvYWRFYWdlcmx5OiBbXSxcbiAgZG9udExvYWQ6IFtcbiAgICAnbm9kZV9tb2R1bGUvKionXG4gIF0sXG4gIHBsdWdpbnM6IHtcblxuICAgIGRvY19jb21tZW50OiB0cnVlXG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0U2VydmVyQ29uZmlnID0ge1xuXG4gIGVjbWFWZXJzaW9uOiA2LFxuICBsaWJzOiBbXSxcbiAgbG9hZEVhZ2VybHk6IFtdLFxuICBkb250TG9hZDogW1xuICAgICdub2RlX21vZHVsZS8qKidcbiAgXSxcbiAgcGx1Z2luczoge1xuXG4gICAgZG9jX2NvbW1lbnQ6IHRydWVcbiAgfSxcbiAgZGVwZW5kZW5jeUJ1ZGdldDogMjAwMDAsXG4gIGVjbWFTY3JpcHQ6IHRydWVcbn07XG5cbmV4cG9ydCBjb25zdCBlY21hVmVyc2lvbnMgPSBbNSwgNiwgN107XG5cbmV4cG9ydCBjb25zdCBhdmFpbGFibGVMaWJzID0gW1xuXG4gICdicm93c2VyJyxcbiAgJ2NoYWknLFxuICAnanF1ZXJ5JyxcbiAgJ3VuZGVyc2NvcmUnXG5dO1xuXG5leHBvcnQgY29uc3QgYXZhaWxhYmxlUGx1Z2lucyA9IHtcblxuICBjb21wbGV0ZV9zdHJpbmdzOiB7XG5cbiAgICBtYXhMZW5ndGg6IDE1XG4gIH0sXG4gIGRvY19jb21tZW50OiB7XG5cbiAgICBmdWxsRG9jczogdHJ1ZSxcbiAgICBzdHJvbmc6IGZhbHNlXG4gIH0sXG4gIG5vZGU6IHtcblxuICAgIGRvbnRMb2FkOiAnJyxcbiAgICBsb2FkOiAnJyxcbiAgICBtb2R1bGVzOiAnJ1xuICB9LFxuICBub2RlX3Jlc29sdmU6IHt9LFxuICBtb2R1bGVzOiB7XG5cbiAgICBkb250TG9hZDogJycsXG4gICAgbG9hZDogJycsXG4gICAgbW9kdWxlczogJydcbiAgfSxcbiAgZXNfbW9kdWxlczoge30sXG4gIGFuZ3VsYXI6IHt9LFxuICByZXF1aXJlanM6IHtcblxuICAgIGJhc2VVUkw6ICcnLFxuICAgIHBhdGhzOiAnJyxcbiAgICBvdmVycmlkZTogJydcbiAgfSxcbiAgY29tbW9uanM6IHt9XG59O1xuIl19