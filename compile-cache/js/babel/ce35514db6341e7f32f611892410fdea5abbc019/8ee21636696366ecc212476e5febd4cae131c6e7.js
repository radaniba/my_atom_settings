Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// @jupyterlab/services apparently require overriding globals, as explained in its
// README: https://github.com/jupyterlab/services
// Otherwise, any requests it sends are blocked due to CORS issues
//
// This file exists to
// a) Make sure globals are only ever overridden once
// b) In the future, try to make the global overrides optional if gateways are
//    not used, or have been pre-configured to avoid CORS issues

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _xmlhttprequest = require('xmlhttprequest');

var _xmlhttprequest2 = _interopRequireDefault(_xmlhttprequest);

var _requirejs = require('requirejs');

var _requirejs2 = _interopRequireDefault(_requirejs);

'use babel';

global.requirejs = _requirejs2['default'];
global.XMLHttpRequest = _xmlhttprequest2['default'].XMLHttpRequest;
global.WebSocket = _ws2['default'];

var _jupyterlabServices = require('@jupyterlab/services');

_defaults(exports, _interopExportWildcard(_jupyterlabServices, _defaults));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2p1cHl0ZXItanMtc2VydmljZXMtc2hpbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQVdlLElBQUk7Ozs7OEJBQ0gsZ0JBQWdCOzs7O3lCQUNWLFdBQVc7Ozs7QUFiakMsV0FBVyxDQUFDOztBQWVaLE1BQU0sQ0FBQyxTQUFTLHlCQUFZLENBQUM7QUFDN0IsTUFBTSxDQUFDLGNBQWMsR0FBRyw0QkFBSSxjQUFjLENBQUM7QUFDM0MsTUFBTSxDQUFDLFNBQVMsa0JBQUssQ0FBQzs7a0NBRVIsc0JBQXNCIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2p1cHl0ZXItanMtc2VydmljZXMtc2hpbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyBAanVweXRlcmxhYi9zZXJ2aWNlcyBhcHBhcmVudGx5IHJlcXVpcmUgb3ZlcnJpZGluZyBnbG9iYWxzLCBhcyBleHBsYWluZWQgaW4gaXRzXG4vLyBSRUFETUU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qdXB5dGVybGFiL3NlcnZpY2VzXG4vLyBPdGhlcndpc2UsIGFueSByZXF1ZXN0cyBpdCBzZW5kcyBhcmUgYmxvY2tlZCBkdWUgdG8gQ09SUyBpc3N1ZXNcbi8vXG4vLyBUaGlzIGZpbGUgZXhpc3RzIHRvXG4vLyBhKSBNYWtlIHN1cmUgZ2xvYmFscyBhcmUgb25seSBldmVyIG92ZXJyaWRkZW4gb25jZVxuLy8gYikgSW4gdGhlIGZ1dHVyZSwgdHJ5IHRvIG1ha2UgdGhlIGdsb2JhbCBvdmVycmlkZXMgb3B0aW9uYWwgaWYgZ2F0ZXdheXMgYXJlXG4vLyAgICBub3QgdXNlZCwgb3IgaGF2ZSBiZWVuIHByZS1jb25maWd1cmVkIHRvIGF2b2lkIENPUlMgaXNzdWVzXG5cbmltcG9ydCB3cyBmcm9tICd3cyc7XG5pbXBvcnQgeGhyIGZyb20gJ3htbGh0dHByZXF1ZXN0JztcbmltcG9ydCByZXF1aXJlanMgZnJvbSAncmVxdWlyZWpzJztcblxuZ2xvYmFsLnJlcXVpcmVqcyA9IHJlcXVpcmVqcztcbmdsb2JhbC5YTUxIdHRwUmVxdWVzdCA9IHhoci5YTUxIdHRwUmVxdWVzdDtcbmdsb2JhbC5XZWJTb2NrZXQgPSB3cztcblxuZXhwb3J0ICogZnJvbSAnQGp1cHl0ZXJsYWIvc2VydmljZXMnO1xuIl19