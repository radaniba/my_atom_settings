'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var disposables = new CompositeDisposable();

var toggle = function toggle(enable, text) {
  var body = document.querySelector('body');

  if (enable) {
    body.className = body.className + ' ' + text;
  } else {
    body.className = body.className.replace(' ' + text, '');
  }
};

var activate = function activate() {
  disposables.add(atom.config.observe('seti-icons.noColor', function (value) {
    return toggle(value, 'seti-icons-no-color');
  }));

  // Removes removed setting
  atom.config.unset('seti-icons.iconsPlus');
};

exports.activate = activate;
var deactivate = function deactivate() {
  return disposables.dispose();
};
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvc2V0aS1pY29ucy9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7ZUFFcUIsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdkMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7QUFDM0IsSUFBTSxXQUFXLEdBQUcsSUFBSSxtQkFBbUIsRUFBQSxDQUFBOztBQUUzQyxJQUFNLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBSyxNQUFNLEVBQUUsSUFBSSxFQUFNO0FBQ2pDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRTNDLE1BQUssTUFBTSxFQUFHO0FBQ1osUUFBSSxDQUFDLFNBQVMsR0FBTSxJQUFJLENBQUMsU0FBUyxTQUFJLElBQUksQUFBRSxDQUFBO0dBQzdDLE1BQU07QUFDTCxRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxPQUFLLElBQUksRUFBSSxFQUFFLENBQUMsQ0FBQTtHQUN4RDtDQUNGLENBQUE7O0FBRU0sSUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFRLEdBQVM7QUFDNUIsYUFBVyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxVQUFBLEtBQUs7V0FDN0MsTUFBTSxDQUFDLEtBQUssRUFBRSxxQkFBcUIsQ0FBQztHQUFBLENBQ3JDLENBQ0YsQ0FBQTs7O0FBR0QsTUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtDQUMxQyxDQUFBOztRQVRZLFFBQVEsR0FBUixRQUFRO0FBV2QsSUFBTSxVQUFVLEdBQUcsU0FBYixVQUFVO1NBQVMsV0FBVyxDQUFDLE9BQU8sRUFBRTtDQUFBLENBQUE7UUFBeEMsVUFBVSxHQUFWLFVBQVUiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zZXRpLWljb25zL2xpYi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9ID0gcmVxdWlyZSgnYXRvbScpXG5jb25zdCBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbmNvbnN0IHRvZ2dsZSA9ICggZW5hYmxlLCB0ZXh0ICkgPT4ge1xuICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpXG5cbiAgaWYgKCBlbmFibGUgKSB7XG4gICAgYm9keS5jbGFzc05hbWUgPSBgJHtib2R5LmNsYXNzTmFtZX0gJHt0ZXh0fWBcbiAgfSBlbHNlIHtcbiAgICBib2R5LmNsYXNzTmFtZSA9IGJvZHkuY2xhc3NOYW1lLnJlcGxhY2UoYCAke3RleHR9YCwgJycpXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGFjdGl2YXRlID0gKCkgPT4ge1xuICBkaXNwb3NhYmxlcy5hZGQoXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnc2V0aS1pY29ucy5ub0NvbG9yJywgdmFsdWUgPT5cbiAgICAgIHRvZ2dsZSh2YWx1ZSwgJ3NldGktaWNvbnMtbm8tY29sb3InKVxuICAgIClcbiAgKVxuXG4gIC8vIFJlbW92ZXMgcmVtb3ZlZCBzZXR0aW5nXG4gIGF0b20uY29uZmlnLnVuc2V0KCdzZXRpLWljb25zLmljb25zUGx1cycpXG59XG5cbmV4cG9ydCBjb25zdCBkZWFjdGl2YXRlID0gKCkgPT4gZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4iXX0=