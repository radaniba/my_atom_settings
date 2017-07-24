(function() {
  var BufferedProcess, CompositeDisposable, DefinitionsView, Disposable, InterpreterLookup, OverrideView, RenameView, Selector, UsagesView, filter, log, selectorsMatchScopeChain, _, _ref;

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable, BufferedProcess = _ref.BufferedProcess;

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  Selector = require('selector-kit').Selector;

  DefinitionsView = require('./definitions-view');

  UsagesView = require('./usages-view');

  OverrideView = require('./override-view');

  RenameView = require('./rename-view');

  InterpreterLookup = require('./interpreters-lookup');

  log = require('./log');

  _ = require('underscore');

  filter = void 0;

  module.exports = {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 2,
    suggestionPriority: 3,
    excludeLowerPriority: false,
    cacheSize: 10,
    _addEventListener: function(editor, eventName, handler) {
      var disposable, editorView;
      editorView = atom.views.getView(editor);
      editorView.addEventListener(eventName, handler);
      disposable = new Disposable(function() {
        log.debug('Unsubscribing from event listener ', eventName, handler);
        return editorView.removeEventListener(eventName, handler);
      });
      return disposable;
    },
    _noExecutableError: function(error) {
      if (this.providerNoExecutable) {
        return;
      }
      log.warning('No python executable found', error);
      atom.notifications.addWarning('autocomplete-python unable to find python binary.', {
        detail: "Please set path to python executable manually in package\nsettings and restart your editor. Be sure to migrate on new settings\nif everything worked on previous version.\nDetailed error message: " + error + "\n\nCurrent config: " + (atom.config.get('autocomplete-python.pythonPaths')),
        dismissable: true
      });
      return this.providerNoExecutable = true;
    },
    _spawnDaemon: function() {
      var interpreter, _ref1;
      interpreter = InterpreterLookup.getInterpreter();
      log.debug('Using interpreter', interpreter);
      this.provider = new BufferedProcess({
        command: interpreter || 'python',
        args: [__dirname + '/completion.py'],
        stdout: (function(_this) {
          return function(data) {
            return _this._deserialize(data);
          };
        })(this),
        stderr: (function(_this) {
          return function(data) {
            var requestId, resolve, _ref1, _results;
            if (data.indexOf('is not recognized as an internal or external') > -1) {
              return _this._noExecutableError(data);
            }
            log.debug("autocomplete-python traceback output: " + data);
            if (data.indexOf('jedi') > -1) {
              if (atom.config.get('autocomplete-python.outputProviderErrors')) {
                atom.notifications.addWarning('Looks like this error originated from Jedi. Please do not\nreport such issues in autocomplete-python issue tracker. Report\nthem directly to Jedi. Turn off `outputProviderErrors` setting\nto hide such errors in future. Traceback output:', {
                  detail: "" + data,
                  dismissable: true
                });
              }
            } else {
              atom.notifications.addError('autocomplete-python traceback output:', {
                detail: "" + data,
                dismissable: true
              });
            }
            log.debug("Forcing to resolve " + (Object.keys(_this.requests).length) + " promises");
            _ref1 = _this.requests;
            _results = [];
            for (requestId in _ref1) {
              resolve = _ref1[requestId];
              if (typeof resolve === 'function') {
                resolve([]);
              }
              _results.push(delete _this.requests[requestId]);
            }
            return _results;
          };
        })(this),
        exit: (function(_this) {
          return function(code) {
            return log.warning('Process exit with', code, _this.provider);
          };
        })(this)
      });
      this.provider.onWillThrowError((function(_this) {
        return function(_arg) {
          var error, handle;
          error = _arg.error, handle = _arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            _this._noExecutableError(error);
            _this.dispose();
            return handle();
          } else {
            throw error;
          }
        };
      })(this));
      if ((_ref1 = this.provider.process) != null) {
        _ref1.stdin.on('error', function(err) {
          return log.debug('stdin', err);
        });
      }
      return setTimeout((function(_this) {
        return function() {
          log.debug('Killing python process after timeout...');
          if (_this.provider && _this.provider.process) {
            return _this.provider.kill();
          }
        };
      })(this), 60 * 10 * 1000);
    },
    constructor: function() {
      var err, selector;
      this.requests = {};
      this.responses = {};
      this.provider = null;
      this.disposables = new CompositeDisposable;
      this.subscriptions = {};
      this.definitionsView = null;
      this.usagesView = null;
      this.renameView = null;
      this.snippetsManager = null;
      try {
        this.triggerCompletionRegex = RegExp(atom.config.get('autocomplete-python.triggerCompletionRegex'));
      } catch (_error) {
        err = _error;
        atom.notifications.addWarning('autocomplete-python invalid regexp to trigger autocompletions.\nFalling back to default value.', {
          detail: "Original exception: " + err,
          dismissable: true
        });
        atom.config.set('autocomplete-python.triggerCompletionRegex', '([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)');
        this.triggerCompletionRegex = /([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)/;
      }
      selector = 'atom-text-editor[data-grammar~=python]';
      atom.commands.add(selector, 'autocomplete-python:go-to-definition', (function(_this) {
        return function() {
          return _this.goToDefinition();
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:complete-arguments', (function(_this) {
        return function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return _this._completeArguments(editor, editor.getCursorBufferPosition(), true);
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:show-usages', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.usagesView) {
            _this.usagesView.destroy();
          }
          _this.usagesView = new UsagesView();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            return _this.usagesView.setItems(usages);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:override-method', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.overrideView) {
            _this.overrideView.destroy();
          }
          _this.overrideView = new OverrideView();
          return _this.getMethods(editor, bufferPosition).then(function(_arg) {
            var bufferPosition, indent, methods;
            methods = _arg.methods, indent = _arg.indent, bufferPosition = _arg.bufferPosition;
            _this.overrideView.indent = indent;
            _this.overrideView.bufferPosition = bufferPosition;
            return _this.overrideView.setItems(methods);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:rename', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            if (_this.renameView) {
              _this.renameView.destroy();
            }
            if (usages.length > 0) {
              _this.renameView = new RenameView(usages);
              return _this.renameView.onInput(function(newName) {
                var fileName, project, _ref1, _ref2, _relative, _results;
                _ref1 = _.groupBy(usages, 'fileName');
                _results = [];
                for (fileName in _ref1) {
                  usages = _ref1[fileName];
                  _ref2 = atom.project.relativizePath(fileName), project = _ref2[0], _relative = _ref2[1];
                  if (project) {
                    _results.push(_this._updateUsagesInFile(fileName, usages, newName));
                  } else {
                    _results.push(log.debug('Ignoring file outside of project', fileName));
                  }
                }
                return _results;
              });
            } else {
              if (_this.usagesView) {
                _this.usagesView.destroy();
              }
              _this.usagesView = new UsagesView();
              return _this.usagesView.setItems(usages);
            }
          });
        };
      })(this));
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          return editor.displayBuffer.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(editor, grammar);
          });
        };
      })(this));
      return atom.config.onDidChange('autocomplete-plus.enableAutoActivation', (function(_this) {
        return function() {
          return atom.workspace.observeTextEditors(function(editor) {
            return _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          });
        };
      })(this));
    },
    _updateUsagesInFile: function(fileName, usages, newName) {
      var columnOffset;
      columnOffset = {};
      return atom.workspace.open(fileName, {
        activateItem: false
      }).then(function(editor) {
        var buffer, column, line, name, usage, _i, _len;
        buffer = editor.getBuffer();
        for (_i = 0, _len = usages.length; _i < _len; _i++) {
          usage = usages[_i];
          name = usage.name, line = usage.line, column = usage.column;
          if (columnOffset[line] == null) {
            columnOffset[line] = 0;
          }
          log.debug('Replacing', usage, 'with', newName, 'in', editor.id);
          log.debug('Offset for line', line, 'is', columnOffset[line]);
          buffer.setTextInRange([[line - 1, column + columnOffset[line]], [line - 1, column + name.length + columnOffset[line]]], newName);
          columnOffset[line] += newName.length - name.length;
        }
        return buffer.save();
      });
    },
    _showSignatureOverlay: function(event) {
      var cursor, disableForSelector, editor, getTooltip, marker, scopeChain, scopeDescriptor, wordBufferRange, _i, _len, _ref1;
      if (this.markers) {
        _ref1 = this.markers;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          marker = _ref1[_i];
          log.debug('destroying old marker', marker);
          marker.destroy();
        }
      } else {
        this.markers = [];
      }
      selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      Selector = require('selector-kit').Selector;
      cursor = event.cursor;
      editor = event.cursor.editor;
      wordBufferRange = cursor.getCurrentWordBufferRange();
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(event.newBufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = "" + this.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name";
      disableForSelector = Selector.create(disableForSelector);
      if (selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('do nothing for this selector');
        return;
      }
      marker = editor.markBufferRange(wordBufferRange, {
        persistent: false,
        invalidate: 'never'
      });
      this.markers.push(marker);
      getTooltip = (function(_this) {
        return function(editor, bufferPosition) {
          var payload;
          payload = {
            id: _this._generateRequestId('tooltip', editor, bufferPosition),
            lookup: 'tooltip',
            path: editor.getPath(),
            source: editor.getText(),
            line: bufferPosition.row,
            column: bufferPosition.column,
            config: _this._generateRequestConfig()
          };
          _this._sendRequest(_this._serialize(payload));
          return new Promise(function(resolve) {
            return _this.requests[payload.id] = resolve;
          });
        };
      })(this);
      return getTooltip(editor, event.newBufferPosition).then((function(_this) {
        return function(results) {
          var column, decoration, description, fileName, line, text, type, view, _ref2;
          if (results.length > 0) {
            _ref2 = results[0], text = _ref2.text, fileName = _ref2.fileName, line = _ref2.line, column = _ref2.column, type = _ref2.type, description = _ref2.description;
            description = description.trim();
            if (!description) {
              return;
            }
            view = document.createElement('autocomplete-python-suggestion');
            view.appendChild(document.createTextNode(description));
            decoration = editor.decorateMarker(marker, {
              type: 'overlay',
              item: view,
              position: 'head'
            });
            return log.debug('decorated marker', marker);
          }
        };
      })(this));
    },
    _handleGrammarChangeEvent: function(editor, grammar) {
      var disposable, eventId, eventName;
      eventName = 'keyup';
      eventId = "" + editor.displayBuffer.id + "." + eventName;
      if (grammar.scopeName === 'source.python') {
        if (atom.config.get('autocomplete-python.showTooltips') === true) {
          editor.onDidChangeCursorPosition((function(_this) {
            return function(event) {
              return _this._showSignatureOverlay(event);
            };
          })(this));
        }
        if (!atom.config.get('autocomplete-plus.enableAutoActivation')) {
          log.debug('Ignoring keyup events due to autocomplete-plus settings.');
          return;
        }
        disposable = this._addEventListener(editor, eventName, (function(_this) {
          return function(e) {
            var bracketIdentifiers;
            bracketIdentifiers = {
              'U+0028': 'qwerty',
              'U+0038': 'german',
              'U+0035': 'azerty',
              'U+0039': 'other'
            };
            if (e.keyIdentifier in bracketIdentifiers) {
              log.debug('Trying to complete arguments on keyup event', e);
              return _this._completeArguments(editor, editor.getCursorBufferPosition());
            }
          };
        })(this));
        this.disposables.add(disposable);
        this.subscriptions[eventId] = disposable;
        return log.debug('Subscribed on event', eventId);
      } else {
        if (eventId in this.subscriptions) {
          this.subscriptions[eventId].dispose();
          return log.debug('Unsubscribed from event', eventId);
        }
      }
    },
    _serialize: function(request) {
      log.debug('Serializing request to be sent to Jedi', request);
      return JSON.stringify(request);
    },
    _sendRequest: function(data, respawned) {
      var process;
      log.debug('Pending requests:', Object.keys(this.requests).length, this.requests);
      if (Object.keys(this.requests).length > 10) {
        log.debug('Cleaning up request queue to avoid overflow, ignoring request');
        this.requests = {};
        if (this.provider && this.provider.process) {
          log.debug('Killing python process');
          this.provider.kill();
          return;
        }
      }
      if (this.provider && this.provider.process) {
        process = this.provider.process;
        if (process.exitCode === null && process.signalCode === null) {
          if (this.provider.process.pid) {
            return this.provider.process.stdin.write(data + '\n');
          } else {
            return log.debug('Attempt to communicate with terminated process', this.provider);
          }
        } else if (respawned) {
          atom.notifications.addWarning(["Failed to spawn daemon for autocomplete-python.", "Completions will not work anymore", "unless you restart your editor."].join(' '), {
            detail: ["exitCode: " + process.exitCode, "signalCode: " + process.signalCode].join('\n'),
            dismissable: true
          });
          return this.dispose();
        } else {
          this._spawnDaemon();
          this._sendRequest(data, {
            respawned: true
          });
          return log.debug('Re-spawning python process...');
        }
      } else {
        log.debug('Spawning python process...');
        this._spawnDaemon();
        return this._sendRequest(data);
      }
    },
    _deserialize: function(response) {
      var bufferPosition, cacheSizeDelta, editor, id, ids, resolve, responseSource, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _results;
      log.debug('Deserealizing response from Jedi', response);
      log.debug("Got " + (response.trim().split('\n').length) + " lines");
      _ref1 = response.trim().split('\n');
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        responseSource = _ref1[_i];
        response = JSON.parse(responseSource);
        if (response['arguments']) {
          editor = this.requests[response['id']];
          if (typeof editor === 'object') {
            bufferPosition = editor.getCursorBufferPosition();
            if (response['id'] === this._generateRequestId('arguments', editor, bufferPosition)) {
              if ((_ref2 = this.snippetsManager) != null) {
                _ref2.insertSnippet(response['arguments'], editor);
              }
            }
          }
        } else {
          resolve = this.requests[response['id']];
          if (typeof resolve === 'function') {
            resolve(response['results']);
          }
        }
        cacheSizeDelta = Object.keys(this.responses).length > this.cacheSize;
        if (cacheSizeDelta > 0) {
          ids = Object.keys(this.responses).sort((function(_this) {
            return function(a, b) {
              return _this.responses[a]['timestamp'] - _this.responses[b]['timestamp'];
            };
          })(this));
          _ref3 = ids.slice(0, cacheSizeDelta);
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            id = _ref3[_j];
            log.debug('Removing old item from cache with ID', id);
            delete this.responses[id];
          }
        }
        this.responses[response['id']] = {
          source: responseSource,
          timestamp: Date.now()
        };
        log.debug('Cached request with ID', response['id']);
        _results.push(delete this.requests[response['id']]);
      }
      return _results;
    },
    _generateRequestId: function(type, editor, bufferPosition, text) {
      if (!text) {
        text = editor.getText();
      }
      return require('crypto').createHash('md5').update([editor.getPath(), text, bufferPosition.row, bufferPosition.column, type].join()).digest('hex');
    },
    _generateRequestConfig: function() {
      var args, extraPaths;
      extraPaths = InterpreterLookup.applySubstitutions(atom.config.get('autocomplete-python.extraPaths').split(';'));
      args = {
        'extraPaths': extraPaths,
        'useSnippets': atom.config.get('autocomplete-python.useSnippets'),
        'caseInsensitiveCompletion': atom.config.get('autocomplete-python.caseInsensitiveCompletion'),
        'showDescriptions': atom.config.get('autocomplete-python.showDescriptions'),
        'fuzzyMatcher': atom.config.get('autocomplete-python.fuzzyMatcher')
      };
      return args;
    },
    setSnippetsManager: function(snippetsManager) {
      this.snippetsManager = snippetsManager;
    },
    _completeArguments: function(editor, bufferPosition, force) {
      var disableForSelector, line, lines, payload, prefix, scopeChain, scopeDescriptor, suffix, useSnippets;
      useSnippets = atom.config.get('autocomplete-python.useSnippets');
      if (!force && useSnippets === 'none') {
        atom.commands.dispatch(document.querySelector('atom-text-editor'), 'autocomplete-plus:activate');
        return;
      }
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = Selector.create(this.disableForSelector);
      if (selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('Ignoring argument completion inside of', scopeChain);
        return;
      }
      lines = editor.getBuffer().getLines();
      line = lines[bufferPosition.row];
      prefix = line.slice(bufferPosition.column - 1, bufferPosition.column);
      if (prefix !== '(') {
        log.debug('Ignoring argument completion with prefix', prefix);
        return;
      }
      suffix = line.slice(bufferPosition.column, line.length);
      if (!/^(\)(?:$|\s)|\s|$)/.test(suffix)) {
        log.debug('Ignoring argument completion with suffix', suffix);
        return;
      }
      payload = {
        id: this._generateRequestId('arguments', editor, bufferPosition),
        lookup: 'arguments',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function() {
          return _this.requests[payload.id] = editor;
        };
      })(this));
    },
    _fuzzyFilter: function(candidates, query) {
      if (candidates.length !== 0 && (query !== ' ' && query !== '.' && query !== '(')) {
        if (filter == null) {
          filter = require('fuzzaldrin-plus').filter;
        }
        candidates = filter(candidates, query, {
          key: 'text'
        });
      }
      return candidates;
    },
    getSuggestions: function(_arg) {
      var bufferPosition, editor, lastIdentifier, line, lines, matches, payload, prefix, requestId, scopeDescriptor;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      if (!this.triggerCompletionRegex.test(prefix)) {
        return [];
      }
      bufferPosition = {
        row: bufferPosition.row,
        column: bufferPosition.column
      };
      lines = editor.getBuffer().getLines();
      if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
        line = lines[bufferPosition.row];
        lastIdentifier = /\.?[a-zA-Z_][a-zA-Z0-9_]*$/.exec(line.slice(0, bufferPosition.column));
        if (lastIdentifier) {
          bufferPosition.column = lastIdentifier.index + 1;
          lines[bufferPosition.row] = line.slice(0, bufferPosition.column);
        }
      }
      requestId = this._generateRequestId('completions', editor, bufferPosition, lines.join('\n'));
      if (requestId in this.responses) {
        log.debug('Using cached response with ID', requestId);
        matches = JSON.parse(this.responses[requestId]['source'])['results'];
        if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
          return this._fuzzyFilter(matches, prefix);
        } else {
          return matches;
        }
      }
      payload = {
        id: requestId,
        prefix: prefix,
        lookup: 'completions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
            return _this.requests[payload.id] = function(matches) {
              return resolve(_this._fuzzyFilter(matches, prefix));
            };
          } else {
            return _this.requests[payload.id] = resolve;
          }
        };
      })(this));
    },
    getDefinitions: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('definitions', editor, bufferPosition),
        lookup: 'definitions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getUsages: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('usages', editor, bufferPosition),
        lookup: 'usages',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getMethods: function(editor, bufferPosition) {
      var indent, lines, payload;
      indent = bufferPosition.column;
      lines = editor.getBuffer().getLines();
      lines.splice(bufferPosition.row + 1, 0, "  def __autocomplete_python(s):");
      lines.splice(bufferPosition.row + 2, 0, "    s.");
      payload = {
        id: this._generateRequestId('methods', editor, bufferPosition),
        lookup: 'methods',
        path: editor.getPath(),
        source: lines.join('\n'),
        line: bufferPosition.row + 2,
        column: 6,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = function(methods) {
            return resolve({
              methods: methods,
              indent: indent,
              bufferPosition: bufferPosition
            });
          };
        };
      })(this));
    },
    goToDefinition: function(editor, bufferPosition) {
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!bufferPosition) {
        bufferPosition = editor.getCursorBufferPosition();
      }
      if (this.definitionsView) {
        this.definitionsView.destroy();
      }
      this.definitionsView = new DefinitionsView();
      return this.getDefinitions(editor, bufferPosition).then((function(_this) {
        return function(results) {
          _this.definitionsView.setItems(results);
          if (results.length === 1) {
            return _this.definitionsView.confirmed(results[0]);
          }
        };
      })(this));
    },
    dispose: function() {
      this.disposables.dispose();
      if (this.provider) {
        return this.provider.kill();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0xBQUE7O0FBQUEsRUFBQSxPQUFxRCxPQUFBLENBQVEsTUFBUixDQUFyRCxFQUFDLGtCQUFBLFVBQUQsRUFBYSwyQkFBQSxtQkFBYixFQUFrQyx1QkFBQSxlQUFsQyxDQUFBOztBQUFBLEVBQ0MsMkJBQTRCLE9BQUEsQ0FBUSxpQkFBUixFQUE1Qix3QkFERCxDQUFBOztBQUFBLEVBRUMsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaLFFBRkQsQ0FBQTs7QUFBQSxFQUdBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBSGxCLENBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FKYixDQUFBOztBQUFBLEVBS0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQUxmLENBQUE7O0FBQUEsRUFNQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FOYixDQUFBOztBQUFBLEVBT0EsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHVCQUFSLENBUHBCLENBQUE7O0FBQUEsRUFRQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FSTixDQUFBOztBQUFBLEVBU0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBVEosQ0FBQTs7QUFBQSxFQVVBLE1BQUEsR0FBUyxNQVZULENBQUE7O0FBQUEsRUFZQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsZ0JBQVY7QUFBQSxJQUNBLGtCQUFBLEVBQW9CLGlEQURwQjtBQUFBLElBRUEsaUJBQUEsRUFBbUIsQ0FGbkI7QUFBQSxJQUdBLGtCQUFBLEVBQW9CLENBSHBCO0FBQUEsSUFJQSxv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

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/provider.coffee
