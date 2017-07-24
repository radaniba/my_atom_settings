'use babel';

/* eslint-disable no-console */
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = log;

function log() {
  if (atom.inDevMode() === true) {
    for (var _len = arguments.length, message = Array(_len), _key = 0; _key < _len; _key++) {
      message[_key] = arguments[_key];
    }

    console.debug.apply(console, ['Hydrogen'].concat(message));
  }
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2xvZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7OztxQkFHWSxHQUFHOztBQUFaLFNBQVMsR0FBRyxHQUFhO0FBQ3RDLE1BQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLElBQUksRUFBRTtzQ0FERixPQUFPO0FBQVAsYUFBTzs7O0FBRWxDLFdBQU8sQ0FBQyxLQUFLLE1BQUEsQ0FBYixPQUFPLEdBQU8sVUFBVSxTQUFLLE9BQU8sRUFBQyxDQUFDO0dBQ3ZDO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvZyguLi5tZXNzYWdlKSB7XG4gIGlmIChhdG9tLmluRGV2TW9kZSgpID09PSB0cnVlKSB7XG4gICAgY29uc29sZS5kZWJ1ZygnSHlkcm9nZW4nLCAuLi5tZXNzYWdlKTtcbiAgfVxufVxuIl19