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
            if (data.indexOf('is not recognized as an internal or external') > -1) {
              return _this._noExecutableError(data);
            }
            log.debug("autocomplete-python traceback output: " + data);
            if (data.indexOf('jedi') > -1) {
              if (atom.config.get('autocomplete-python.outputProviderErrors')) {
                return atom.notifications.addWarning('Looks like this error originated from Jedi. Please do not\nreport such issues in autocomplete-python issue tracker. Report\nthem directly to Jedi. Turn off `outputProviderErrors` setting\nto hide such errors in future. Traceback output:', {
                  detail: "" + data,
                  dismissable: true
                });
              }
            } else {
              return atom.notifications.addError('autocomplete-python traceback output:', {
                detail: "" + data,
                dismissable: true
              });
            }
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
    _handleGrammarChangeEvent: function(editor, grammar) {
      var disposable, eventId, eventName;
      eventName = 'keyup';
      eventId = "" + editor.displayBuffer.id + "." + eventName;
      if (grammar.scopeName === 'source.python') {
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
            if (response['id'] === this._generateRequestId(editor, bufferPosition)) {
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
    _generateRequestId: function(editor, bufferPosition, text) {
      if (!text) {
        text = editor.getText();
      }
      return require('crypto').createHash('md5').update([editor.getPath(), text, bufferPosition.row, bufferPosition.column].join()).digest('hex');
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
        id: this._generateRequestId(editor, bufferPosition),
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
      requestId = this._generateRequestId(editor, bufferPosition, lines.join('\n'));
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
        id: this._generateRequestId(editor, bufferPosition),
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
        id: this._generateRequestId(editor, bufferPosition),
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
        id: this._generateRequestId(editor, bufferPosition),
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
