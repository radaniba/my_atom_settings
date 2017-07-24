Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isValidEditor = isValidEditor;
exports.focusEditor = focusEditor;
exports.replaceTag = replaceTag;
exports.replaceTags = replaceTags;
exports.formatType = formatType;
exports.prepareType = prepareType;
exports.prepareInlineDocs = prepareInlineDocs;
exports.buildDisplayText = buildDisplayText;
exports.buildSnippet = buildSnippet;
exports.extractParams = extractParams;
exports.formatTypeCompletion = formatTypeCompletion;
exports.disposeAll = disposeAll;
exports.openFileAndGoToPosition = openFileAndGoToPosition;
exports.openFileAndGoTo = openFileAndGoTo;
exports.updateTernFile = updateTernFile;
exports.writeFile = writeFile;
exports.isDirectory = isDirectory;
exports.fileExists = fileExists;
exports.getFileContent = getFileContent;
exports.readFile = readFile;
exports.markDefinitionBufferRange = markDefinitionBufferRange;
exports.getPackagePath = getPackagePath;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atomTernjsManager = require('./atom-ternjs-manager');

var _atomTernjsManager2 = _interopRequireDefault(_atomTernjsManager);

var _atomTernjsPackageConfig = require('./atom-ternjs-package-config');

var _atomTernjsPackageConfig2 = _interopRequireDefault(_atomTernjsPackageConfig);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _servicesNavigation = require('./services/navigation');

var _servicesNavigation2 = _interopRequireDefault(_servicesNavigation);

'use babel';

var tags = {

  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

var grammars = ['JavaScript', 'JavaScript (JSX)', 'Babel ES6 JavaScript'];

function isValidEditor(editor) {

  var isTextEditor = atom.workspace.isTextEditor(editor);

  if (!isTextEditor || editor.isMini()) {

    return false;
  }

  var grammar = editor.getGrammar();

  if (!grammars.includes(grammar.name)) {

    return false;
  }

  return true;
}

function focusEditor() {

  var editor = atom.workspace.getActiveTextEditor();

  if (!editor) {

    return;
  }

  var view = atom.views.getView(editor);

  view && view.focus && view.focus();
}

function replaceTag(tag) {

  return tags[tag];
}

function replaceTags(str) {

  if (!str) {

    return '';
  }

  return str.replace(/[&<>]/g, replaceTag);
}

function formatType(data) {

  if (!data.type) {

    return '';
  }

  data.type = data.type.replace(/->/g, ':').replace('<top>', 'window');

  if (!data.exprName) {

    return data.type;
  }

  data.type = data.type.replace(/^fn/, data.exprName);

  return data.type;
}

function prepareType(data) {

  if (!data.type) {

    return;
  }

  return data.type.replace(/->/g, ':').replace('<top>', 'window');
}

function prepareInlineDocs(data) {

  return data.replace(/@param/, '<span class="doc-param-first">@param</span>').replace(/@param/g, '<span class="text-info doc-param">@param</span>').replace(/@return/, '<span class="text-info doc-return">@return</span>');
}

function buildDisplayText(params, name) {

  if (params.length === 0) {

    return name + '()';
  }

  var suggestionParams = params.map(function (param) {

    param = param.replace('}', '\\}');
    param = param.replace(/'"/g, '');

    return param;
  });

  return name + '(' + suggestionParams.join(',') + ')';
}

function buildSnippet(params, name) {

  if (params.length === 0) {

    return name + '()';
  }

  var suggestionParams = params.map(function (param, i) {

    param = param.replace('}', '\\}');

    return '${' + (i + 1) + ':' + param + '}';
  });

  return name + '(' + suggestionParams.join(',') + ')';
}

function extractParams(type) {

  if (!type) {

    return [];
  }

  var start = type.indexOf('(') + 1;
  var params = [];
  var inside = 0;

  for (var i = start; i < type.length; i++) {

    if (type[i] === ':' && inside === -1) {

      params.push(type.substring(start, i - 2));

      break;
    }

    if (i === type.length - 1) {

      var param = type.substring(start, i);

      if (param.length) {

        params.push(param);
      }

      break;
    }

    if (type[i] === ',' && inside === 0) {

      params.push(type.substring(start, i));
      start = i + 1;

      continue;
    }

    if (type[i].match(/[{\[\(]/)) {

      inside++;

      continue;
    }

    if (type[i].match(/[}\]\)]/)) {

      inside--;
    }
  }

  return params;
}

function formatTypeCompletion(obj, isProperty, isObjectKey, isInFunDef) {

  if (obj.isKeyword) {

    obj._typeSelf = 'keyword';
  }

  if (obj.type === 'string') {

    obj.name = obj.name ? obj.name.replace(/(^"|"$)/g, '') : null;
  } else {

    obj.name = obj.name ? obj.name.replace(/["']/g, '') : null;
  }

  obj.name = obj.name ? obj.name.replace(/^..?\//, '') : null;

  if (!obj.type) {

    obj._displayText = obj.name;
    obj._snippet = obj.name;

    return obj;
  }

  if (!obj.type.startsWith('fn')) {

    if (isProperty) {

      obj._typeSelf = 'property';
    } else {

      obj._typeSelf = 'variable';
    }
  }

  obj.type = obj.rightLabel = prepareType(obj);

  if (obj.type.replace(/fn\(.+\)/, '').length === 0) {

    obj.leftLabel = '';
  } else {

    if (obj.type.indexOf('fn') === -1) {

      obj.leftLabel = obj.type;
    } else {

      obj.leftLabel = obj.type.replace(/fn\(.{0,}\)/, '').replace(' : ', '');
    }
  }

  if (obj.rightLabel.startsWith('fn')) {

    var params = extractParams(obj.rightLabel);

    if (_atomTernjsPackageConfig2['default'].options.useSnippets || _atomTernjsPackageConfig2['default'].options.useSnippetsAndFunction) {

      if (!isInFunDef) {

        obj._snippet = buildSnippet(params, obj.name);
      }

      obj._hasParams = params.length ? true : false;
    } else {

      if (!isInFunDef) {

        obj._snippet = params.length ? obj.name + '(${' + 0 + ':${}})' : obj.name + '()';
      }

      obj._displayText = buildDisplayText(params, obj.name);
    }

    obj._typeSelf = 'function';
  }

  if (obj.name) {

    if (obj.leftLabel === obj.name) {

      obj.leftLabel = null;
      obj.rightLabel = null;
    }
  }

  if (obj.leftLabel === obj.rightLabel) {

    obj.rightLabel = null;
  }

  return obj;
}

function disposeAll(disposables) {

  disposables.forEach(function (disposable) {
    return disposable.dispose();
  });
}

function openFileAndGoToPosition(position, file) {

  atom.workspace.open(file).then(function (textEditor) {

    var cursor = textEditor.getLastCursor();

    if (!cursor) {

      return;
    }

    cursor.setBufferPosition(position);
  });
}

function openFileAndGoTo(start, file) {

  atom.workspace.open(file).then(function (textEditor) {

    var buffer = textEditor.getBuffer();
    var cursor = textEditor.getLastCursor();

    if (!buffer || !cursor) {

      return;
    }

    var bufferPosition = buffer.positionForCharacterIndex(start);

    cursor.setBufferPosition(buffer.positionForCharacterIndex(start));

    _servicesNavigation2['default'].append(textEditor, buffer, bufferPosition);

    markDefinitionBufferRange(cursor, textEditor);
  });
}

function updateTernFile(content) {

  var projectRoot = _atomTernjsManager2['default'].server && _atomTernjsManager2['default'].server.projectDir;

  if (!projectRoot) {

    return;
  }

  writeFile(_path2['default'].resolve(__dirname, projectRoot + '/.tern-project'), content);
}

function writeFile(filePath, content) {

  _fs2['default'].writeFile(filePath, content, function (error) {

    atom.workspace.open(filePath);

    if (!error) {

      var server = _atomTernjsManager2['default'].server;
      server && server.restart();

      return;
    }

    var message = 'Could not create/update .tern-project file. Use the README to manually create a .tern-project file.';

    atom.notifications.addInfo(message, {

      dismissable: true
    });
  });
}

function isDirectory(dir) {

  try {

    return _fs2['default'].statSync(dir).isDirectory();
  } catch (error) {

    return false;
  }
}

function fileExists(path) {

  try {

    _fs2['default'].accessSync(path, _fs2['default'].F_OK, function (error) {

      console.error(error);
    });
  } catch (error) {

    return false;
  }
}

function getFileContent(filePath, root) {

  var _filePath = root + filePath;
  var resolvedPath = _path2['default'].resolve(__dirname, _filePath);

  if (fileExists(resolvedPath) !== undefined) {

    return false;
  }

  return readFile(resolvedPath);
}

function readFile(path) {

  try {

    return _fs2['default'].readFileSync(path, 'utf8');
  } catch (err) {

    return undefined;
  }
}

function markDefinitionBufferRange(cursor, editor) {

  var range = cursor.getCurrentWordBufferRange();
  var marker = editor.markBufferRange(range, { invalidate: 'touch' });

  var decoration = editor.decorateMarker(marker, {

    type: 'highlight',
    'class': 'atom-ternjs-definition-marker',
    invalidate: 'touch'
  });

  if (!decoration) {

    return;
  }

  setTimeout(function () {

    decoration.setProperties({

      type: 'highlight',
      'class': 'atom-ternjs-definition-marker active',
      invalidate: 'touch'
    });
  }, 1);

  setTimeout(function () {

    decoration.setProperties({

      type: 'highlight',
      'class': 'atom-ternjs-definition-marker',
      invalidate: 'touch'
    });
  }, 1501);

  setTimeout(function () {

    marker.destroy();
  }, 2500);
}

function getPackagePath() {

  var packagPath = atom.packages.resolvePackagePath('atom-ternjs');

  return packagPath;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvYXRvbS10ZXJuanMvbGliL2F0b20tdGVybmpzLWhlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2lDQUVvQix1QkFBdUI7Ozs7dUNBQ2pCLDhCQUE4Qjs7OztvQkFDdkMsTUFBTTs7OztrQkFDUixJQUFJOzs7O2tDQUNJLHVCQUF1Qjs7OztBQU45QyxXQUFXLENBQUM7O0FBUVosSUFBTSxJQUFJLEdBQUc7O0FBRVgsS0FBRyxFQUFFLE9BQU87QUFDWixLQUFHLEVBQUUsTUFBTTtBQUNYLEtBQUcsRUFBRSxNQUFNO0NBQ1osQ0FBQzs7QUFFRixJQUFNLFFBQVEsR0FBRyxDQUVmLFlBQVksRUFDWixrQkFBa0IsRUFDbEIsc0JBQXNCLENBQ3ZCLENBQUM7O0FBRUssU0FBUyxhQUFhLENBQUMsTUFBTSxFQUFFOztBQUVwQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFekQsTUFBSSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUU7O0FBRXBDLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDOztBQUVwQyxNQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7O0FBRXBDLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFTSxTQUFTLFdBQVcsR0FBRzs7QUFFNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDOztBQUVwRCxNQUFJLENBQUMsTUFBTSxFQUFFOztBQUVYLFdBQU87R0FDUjs7QUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9B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K0I7QUFDdEMsZ0JBQVUsRUFBRSxPQUFPO0tBQ3BCLENBQUMsQ0FBQztHQUVKLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRVQsWUFBVSxDQUFDLFlBQU07O0FBRWYsVUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBRWxCLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDVjs7QUFFTSxTQUFTLGNBQWMsR0FBRzs7QUFFL0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFbkUsU0FBTyxVQUFVLENBQUM7Q0FDbkIiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvYXRvbS10ZXJuanMtaGVscGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBtYW5hZ2VyIGZyb20gJy4vYXRvbS10ZXJuanMtbWFuYWdlcic7XG5pbXBvcnQgcGFja2FnZUNvbmZpZyBmcm9tICcuL2F0b20tdGVybmpzLXBhY2thZ2UtY29uZmlnJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBuYXZpZ2F0aW9uIGZyb20gJy4vc2VydmljZXMvbmF2aWdhdGlvbic7XG5cbmNvbnN0IHRhZ3MgPSB7XG5cbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0Oydcbn07XG5cbmNvbnN0IGdyYW1tYXJzID0gW1xuXG4gICdKYXZhU2NyaXB0JyxcbiAgJ0phdmFTY3JpcHQgKEpTWCknLFxuICAnQmFiZWwgRVM2IEphdmFTY3JpcHQnXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEVkaXRvcihlZGl0b3IpIHtcblxuICBjb25zdCBpc1RleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoZWRpdG9yKTtcbiAgXG4gIGlmICghaXNUZXh0RWRpdG9yIHx8IGVkaXRvci5pc01pbmkoKSkge1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgZ3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG5cbiAgaWYgKCFncmFtbWFycy5pbmNsdWRlcyhncmFtbWFyLm5hbWUpKSB7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvY3VzRWRpdG9yKCkge1xuXG4gIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcblxuICBpZiAoIWVkaXRvcikge1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgdmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpO1xuXG4gIHZpZXcgJiYgdmlldy5mb2N1cyAmJiB2aWV3LmZvY3VzKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlVGFnKHRhZykge1xuXG4gIHJldHVybiB0YWdzW3RhZ107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlVGFncyhzdHIpIHtcblxuICBpZiAoIXN0cikge1xuXG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bJjw+XS9nLCByZXBsYWNlVGFnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFR5cGUoZGF0YSkge1xuXG4gIGlmICghZGF0YS50eXBlKSB7XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBkYXRhLnR5cGUgPSBkYXRhLnR5cGUucmVwbGFjZSgvLT4vZywgJzonKS5yZXBsYWNlKCc8dG9wPicsICd3aW5kb3cnKTtcblxuICBpZiAoIWRhdGEuZXhwck5hbWUpIHtcblxuICAgIHJldHVybiBkYXRhLnR5cGU7XG4gIH1cblxuICBkYXRhLnR5cGUgPSBkYXRhLnR5cGUucmVwbGFjZSgvXmZuLywgZGF0YS5leHByTmFtZSk7XG5cbiAgcmV0dXJuIGRhdGEudHlwZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVUeXBlKGRhdGEpIHtcblxuICBpZiAoIWRhdGEudHlwZSkge1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGRhdGEudHlwZS5yZXBsYWNlKC8tPi9nLCAnOicpLnJlcGxhY2UoJzx0b3A+JywgJ3dpbmRvdycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZUlubGluZURvY3MoZGF0YSkge1xuXG4gIHJldHVybiBkYXRhXG4gICAgLnJlcGxhY2UoL0BwYXJhbS8sICc8c3BhbiBjbGFzcz1cImRvYy1wYXJhbS1maXJzdFwiPkBwYXJhbTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC9AcGFyYW0vZywgJzxzcGFuIGNsYXNzPVwidGV4dC1pbmZvIGRvYy1wYXJhbVwiPkBwYXJhbTwvc3Bhbj4nKVxuICAgIC5yZXBsYWNlKC9AcmV0dXJuLywgJzxzcGFuIGNsYXNzPVwidGV4dC1pbmZvIGRvYy1yZXR1cm5cIj5AcmV0dXJuPC9zcGFuPicpXG4gICAgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREaXNwbGF5VGV4dChwYXJhbXMsIG5hbWUpIHtcblxuICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMCkge1xuXG4gICAgcmV0dXJuIGAke25hbWV9KClgO1xuICB9XG5cbiAgbGV0IHN1Z2dlc3Rpb25QYXJhbXMgPSBwYXJhbXMubWFwKChwYXJhbSkgPT4ge1xuXG4gICAgcGFyYW0gPSBwYXJhbS5yZXBsYWNlKCd9JywgJ1xcXFx9Jyk7XG4gICAgcGFyYW0gPSBwYXJhbS5yZXBsYWNlKC8nXCIvZywgJycpO1xuXG4gICAgcmV0dXJuIHBhcmFtO1xuICB9KTtcblxuICByZXR1cm4gYCR7bmFtZX0oJHtzdWdnZXN0aW9uUGFyYW1zLmpvaW4oJywnKX0pYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkU25pcHBldChwYXJhbXMsIG5hbWUpIHtcblxuICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMCkge1xuXG4gICAgcmV0dXJuIGAke25hbWV9KClgO1xuICB9XG5cbiAgbGV0IHN1Z2dlc3Rpb25QYXJhbXMgPSBwYXJhbXMubWFwKChwYXJhbSwgaSkgPT4ge1xuXG4gICAgcGFyYW0gPSBwYXJhbS5yZXBsYWNlKCd9JywgJ1xcXFx9Jyk7XG5cbiAgICByZXR1cm4gYFxcJHske2kgKyAxfToke3BhcmFtfX1gO1xuICB9KTtcblxuICByZXR1cm4gYCR7bmFtZX0oJHtzdWdnZXN0aW9uUGFyYW1zLmpvaW4oJywnKX0pYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RQYXJhbXModHlwZSkge1xuXG4gIGlmICghdHlwZSkge1xuXG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgbGV0IHN0YXJ0ID0gdHlwZS5pbmRleE9mKCcoJykgKyAxO1xuICBsZXQgcGFyYW1zID0gW107XG4gIGxldCBpbnNpZGUgPSAwO1xuXG4gIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IHR5cGUubGVuZ3RoOyBpKyspIHtcblxuICAgIGlmICh0eXBlW2ldID09PSAnOicgJiYgaW5zaWRlID09PSAtMSkge1xuXG4gICAgICBwYXJhbXMucHVzaCh0eXBlLnN1YnN0cmluZyhzdGFydCwgaSAtIDIpKTtcblxuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKGkgPT09IHR5cGUubGVuZ3RoIC0gMSkge1xuXG4gICAgICBjb25zdCBwYXJhbSA9IHR5cGUuc3Vic3RyaW5nKHN0YXJ0LCBpKTtcblxuICAgICAgaWYgKHBhcmFtLmxlbmd0aCkge1xuXG4gICAgICAgIHBhcmFtcy5wdXNoKHBhcmFtKTtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVbaV0gPT09ICcsJyAmJiBpbnNpZGUgPT09IDApIHtcblxuICAgICAgcGFyYW1zLnB1c2godHlwZS5zdWJzdHJpbmcoc3RhcnQsIGkpKTtcbiAgICAgIHN0YXJ0ID0gaSArIDE7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmICh0eXBlW2ldLm1hdGNoKC9be1xcW1xcKF0vKSkge1xuXG4gICAgICBpbnNpZGUrKztcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVbaV0ubWF0Y2goL1t9XFxdXFwpXS8pKSB7XG5cbiAgICAgIGluc2lkZS0tO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJhbXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUeXBlQ29tcGxldGlvbihvYmosIGlzUHJvcGVydHksIGlzT2JqZWN0S2V5LCBpc0luRnVuRGVmKSB7XG5cbiAgaWYgKG9iai5pc0tleXdvcmQpIHtcblxuICAgIG9iai5fdHlwZVNlbGYgPSAna2V5d29yZCc7XG4gIH1cblxuICBpZiAob2JqLnR5cGUgPT09ICdzdHJpbmcnKSB7XG5cbiAgICBvYmoubmFtZSA9IG9iai5uYW1lID8gb2JqLm5hbWUucmVwbGFjZSgvKF5cInxcIiQpL2csICcnKSA6IG51bGw7XG5cbiAgfSBlbHNlIHtcblxuICAgIG9iai5uYW1lID0gb2JqLm5hbWUgPyBvYmoubmFtZS5yZXBsYWNlKC9bXCInXS9nLCAnJykgOiBudWxsO1xuICB9XG5cbiAgb2JqLm5hbWUgPSBvYmoubmFtZSA/IG9iai5uYW1lLnJlcGxhY2UoL14uLj9cXC8vLCAnJykgOiBudWxsO1xuXG4gIGlmICghb2JqLnR5cGUpIHtcblxuICAgIG9iai5fZGlzcGxheVRleHQgPSBvYmoubmFtZTtcbiAgICBvYmouX3NuaXBwZXQgPSBvYmoubmFtZTtcblxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICBpZiAoIW9iai50eXBlLnN0YXJ0c1dpdGgoJ2ZuJykpIHtcblxuICAgIGlmIChpc1Byb3BlcnR5KSB7XG5cbiAgICAgIG9iai5fdHlwZVNlbGYgPSAncHJvcGVydHknO1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgb2JqLl90eXBlU2VsZiA9ICd2YXJpYWJsZSc7XG4gICAgfVxuICB9XG5cbiAgb2JqLnR5cGUgPSBvYmoucmlnaHRMYWJlbCA9IHByZXBhcmVUeXBlKG9iaik7XG5cbiAgaWYgKG9iai50eXBlLnJlcGxhY2UoL2ZuXFwoLitcXCkvLCAnJykubGVuZ3RoID09PSAwKSB7XG5cbiAgICBvYmoubGVmdExhYmVsID0gJyc7XG5cbiAgfSBlbHNlIHtcblxuICAgIGlmIChvYmoudHlwZS5pbmRleE9mKCdmbicpID09PSAtMSkge1xuXG4gICAgICBvYmoubGVmdExhYmVsID0gb2JqLnR5cGU7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICBvYmoubGVmdExhYmVsID0gb2JqLnR5cGUucmVwbGFjZSgvZm5cXCguezAsfVxcKS8sICcnKS5yZXBsYWNlKCcgOiAnLCAnJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG9iai5yaWdodExhYmVsLnN0YXJ0c1dpdGgoJ2ZuJykpIHtcblxuICAgIGxldCBwYXJhbXMgPSBleHRyYWN0UGFyYW1zKG9iai5yaWdodExhYmVsKTtcblxuICAgIGlmIChcbiAgICAgIHBhY2thZ2VDb25maWcub3B0aW9ucy51c2VTbmlwcGV0cyB8fFxuICAgICAgcGFja2FnZUNvbmZpZy5vcHRpb25zLnVzZVNuaXBwZXRzQW5kRnVuY3Rpb25cbiAgICApIHtcblxuICAgICAgaWYgKCFpc0luRnVuRGVmKSB7XG5cbiAgICAgICAgb2JqLl9zbmlwcGV0ID0gYnVpbGRTbmlwcGV0KHBhcmFtcywgb2JqLm5hbWUpO1xuICAgICAgfVxuXG4gICAgICBvYmouX2hhc1BhcmFtcyA9IHBhcmFtcy5sZW5ndGggPyB0cnVlIDogZmFsc2U7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICBpZiAoIWlzSW5GdW5EZWYpIHtcblxuICAgICAgICBvYmouX3NuaXBwZXQgPSBwYXJhbXMubGVuZ3RoID8gYCR7b2JqLm5hbWV9KFxcJHskezB9OlxcJHt9fSlgIDogYCR7b2JqLm5hbWV9KClgO1xuICAgICAgfVxuXG4gICAgICBvYmouX2Rpc3BsYXlUZXh0ID0gYnVpbGREaXNwbGF5VGV4dChwYXJhbXMsIG9iai5uYW1lKTtcbiAgICB9XG5cbiAgICBvYmouX3R5cGVTZWxmID0gJ2Z1bmN0aW9uJztcbiAgfVxuXG4gIGlmIChvYmoubmFtZSkge1xuXG4gICAgaWYgKG9iai5sZWZ0TGFiZWwgPT09IG9iai5uYW1lKSB7XG5cbiAgICAgIG9iai5sZWZ0TGFiZWwgPSBudWxsO1xuICAgICAgb2JqLnJpZ2h0TGFiZWwgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvYmoubGVmdExhYmVsID09PSBvYmoucmlnaHRMYWJlbCkge1xuXG4gICAgb2JqLnJpZ2h0TGFiZWwgPSBudWxsO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3Bvc2VBbGwoZGlzcG9zYWJsZXMpIHtcblxuICBkaXNwb3NhYmxlcy5mb3JFYWNoKGRpc3Bvc2FibGUgPT4gZGlzcG9zYWJsZS5kaXNwb3NlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BlbkZpbGVBbmRHb1RvUG9zaXRpb24ocG9zaXRpb24sIGZpbGUpIHtcblxuICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGUpLnRoZW4oKHRleHRFZGl0b3IpID0+IHtcblxuICAgIGNvbnN0IGN1cnNvciA9IHRleHRFZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuXG4gICAgaWYgKCFjdXJzb3IpIHtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb3NpdGlvbik7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BlbkZpbGVBbmRHb1RvKHN0YXJ0LCBmaWxlKSB7XG5cbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlKS50aGVuKCh0ZXh0RWRpdG9yKSA9PiB7XG5cbiAgICBjb25zdCBidWZmZXIgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGNvbnN0IGN1cnNvciA9IHRleHRFZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuXG4gICAgaWYgKFxuICAgICAgIWJ1ZmZlciB8fFxuICAgICAgIWN1cnNvclxuICAgICkge1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyUG9zaXRpb24gPSBidWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChzdGFydCk7XG5cbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oYnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgoc3RhcnQpKTtcblxuICAgIG5hdmlnYXRpb24uYXBwZW5kKHRleHRFZGl0b3IsIGJ1ZmZlciwgYnVmZmVyUG9zaXRpb24pO1xuXG4gICAgbWFya0RlZmluaXRpb25CdWZmZXJSYW5nZShjdXJzb3IsIHRleHRFZGl0b3IpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVRlcm5GaWxlKGNvbnRlbnQpIHtcblxuICBjb25zdCBwcm9qZWN0Um9vdCA9IG1hbmFnZXIuc2VydmVyICYmIG1hbmFnZXIuc2VydmVyLnByb2plY3REaXI7XG5cbiAgaWYgKCFwcm9qZWN0Um9vdCkge1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgd3JpdGVGaWxlKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHByb2plY3RSb290ICsgJy8udGVybi1wcm9qZWN0JyksIGNvbnRlbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVGaWxlKGZpbGVQYXRoLCBjb250ZW50KSB7XG5cbiAgZnMud3JpdGVGaWxlKGZpbGVQYXRoLCBjb250ZW50LCAoZXJyb3IpID0+IHtcblxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpO1xuXG4gICAgaWYgKCFlcnJvcikge1xuXG4gICAgICBjb25zdCBzZXJ2ZXIgPSBtYW5hZ2VyLnNlcnZlcjtcbiAgICAgIHNlcnZlciAmJiBzZXJ2ZXIucmVzdGFydCgpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWVzc2FnZSA9ICdDb3VsZCBub3QgY3JlYXRlL3VwZGF0ZSAudGVybi1wcm9qZWN0IGZpbGUuIFVzZSB0aGUgUkVBRE1FIHRvIG1hbnVhbGx5IGNyZWF0ZSBhIC50ZXJuLXByb2plY3QgZmlsZS4nO1xuXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8obWVzc2FnZSwge1xuXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGlyZWN0b3J5KGRpcikge1xuXG4gIHRyeSB7XG5cbiAgICByZXR1cm4gZnMuc3RhdFN5bmMoZGlyKS5pc0RpcmVjdG9yeSgpO1xuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbGVFeGlzdHMocGF0aCkge1xuXG4gIHRyeSB7XG5cbiAgICBmcy5hY2Nlc3NTeW5jKHBhdGgsIGZzLkZfT0ssIChlcnJvcikgPT4ge1xuXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB9KTtcblxuICB9IGNhdGNoIChlcnJvcikge1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlQ29udGVudChmaWxlUGF0aCwgcm9vdCkge1xuXG4gIGNvbnN0IF9maWxlUGF0aCA9IHJvb3QgKyBmaWxlUGF0aDtcbiAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgX2ZpbGVQYXRoKTtcblxuICBpZiAoZmlsZUV4aXN0cyhyZXNvbHZlZFBhdGgpICE9PSB1bmRlZmluZWQpIHtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiByZWFkRmlsZShyZXNvbHZlZFBhdGgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZEZpbGUocGF0aCkge1xuXG4gIHRyeSB7XG5cbiAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgsICd1dGY4Jyk7XG5cbiAgfSBjYXRjaCAoZXJyKSB7XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXJrRGVmaW5pdGlvbkJ1ZmZlclJhbmdlKGN1cnNvciwgZWRpdG9yKSB7XG5cbiAgY29uc3QgcmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpO1xuICBjb25zdCBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKHJhbmdlLCB7aW52YWxpZGF0ZTogJ3RvdWNoJ30pO1xuXG4gIGNvbnN0IGRlY29yYXRpb24gPSBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG5cbiAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICBjbGFzczogJ2F0b20tdGVybmpzLWRlZmluaXRpb24tbWFya2VyJyxcbiAgICBpbnZhbGlkYXRlOiAndG91Y2gnXG4gIH0pO1xuXG4gIGlmICghZGVjb3JhdGlvbikge1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICBkZWNvcmF0aW9uLnNldFByb3BlcnRpZXMoe1xuXG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgIGNsYXNzOiAnYXRvbS10ZXJuanMtZGVmaW5pdGlvbi1tYXJrZXIgYWN0aXZlJyxcbiAgICAgIGludmFsaWRhdGU6ICd0b3VjaCdcbiAgICB9KTtcblxuICB9LCAxKTtcblxuICBzZXRUaW1lb3V0KCgpID0+IHtcblxuICAgIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyh7XG5cbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgY2xhc3M6ICdhdG9tLXRlcm5qcy1kZWZpbml0aW9uLW1hcmtlcicsXG4gICAgICBpbnZhbGlkYXRlOiAndG91Y2gnXG4gICAgfSk7XG5cbiAgfSwgMTUwMSk7XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG5cbiAgICBtYXJrZXIuZGVzdHJveSgpO1xuXG4gIH0sIDI1MDApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFja2FnZVBhdGgoKSB7XG5cbiAgY29uc3QgcGFja2FnUGF0aCA9IGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKCdhdG9tLXRlcm5qcycpO1xuXG4gIHJldHVybiBwYWNrYWdQYXRoO1xufVxuIl19