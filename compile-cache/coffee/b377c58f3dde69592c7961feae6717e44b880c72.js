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
    suggestionPriority: atom.config.get('autocomplete-python.suggestionPriority'),
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
      log.debug("Init autocomplete-python with priority " + this.suggestionPriority);
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
          return editor.onDidChangeGrammar(function(grammar) {
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
      eventId = "" + editor.id + "." + eventName;
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
      var bufferPosition, cacheSizeDelta, e, editor, id, ids, resolve, responseSource, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _results;
      log.debug('Deserealizing response from Jedi', response);
      log.debug("Got " + (response.trim().split('\n').length) + " lines");
      _ref1 = response.trim().split('\n');
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        responseSource = _ref1[_i];
        try {
          response = JSON.parse(responseSource);
        } catch (_error) {
          e = _error;
          throw new Error("Failed to parse JSON from \"" + responseSource + "\".\nOriginal exception: " + e);
        }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0xBQUE7O0FBQUEsRUFBQSxPQUFxRCxPQUFBLENBQVEsTUFBUixDQUFyRCxFQUFDLGtCQUFBLFVBQUQsRUFBYSwyQkFBQSxtQkFBYixFQUFrQyx1QkFBQSxlQUFsQyxDQUFBOztBQUFBLEVBQ0MsMkJBQTRCLE9BQUEsQ0FBUSxpQkFBUixFQUE1Qix3QkFERCxDQUFBOztBQUFBLEVBRUMsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaLFFBRkQsQ0FBQTs7QUFBQSxFQUdBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBSGxCLENBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FKYixDQUFBOztBQUFBLEVBS0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQUxmLENBQUE7O0FBQUEsRUFNQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FOYixDQUFBOztBQUFBLEVBT0EsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHVCQUFSLENBUHBCLENBQUE7O0FBQUEsRUFRQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FSTixDQUFBOztBQUFBLEVBU0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBVEosQ0FBQTs7QUFBQSxFQVVBLE1BQUEsR0FBUyxNQVZULENBQUE7O0FBQUEsRUFZQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsZ0JBQVY7QUFBQSxJQUNBLGtCQUFBLEVBQW9CLGlEQURwQjtBQUFBLElBRUEsaUJBQUEsRUFBbUIsQ0FGbkI7QUFBQSxJQUdBLGtCQUFBLEVBQW9CLElBQUksQ0FBQyxNQUFNLENB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

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/provider.coffee
