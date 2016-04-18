(function() {
  var BufferedProcess, CompositeDisposable, DefinitionsView, Disposable, InterpreterLookup, RenameView, Selector, UsagesView, filter, log, selectorsMatchScopeChain, _, _ref;

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable, BufferedProcess = _ref.BufferedProcess;

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  Selector = require('selector-kit').Selector;

  DefinitionsView = require('./definitions-view');

  UsagesView = require('./usages-view');

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
      var interpreter;
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
      this.provider.process.stdin.on('error', function(err) {
        return log.debug('stdin', err);
      });
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
      return atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          return editor.displayBuffer.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(editor, grammar);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0tBQUE7O0FBQUEsRUFBQSxPQUFxRCxPQUFBLENBQVEsTUFBUixDQUFyRCxFQUFDLGtCQUFBLFVBQUQsRUFBYSwyQkFBQSxtQkFBYixFQUFrQyx1QkFBQSxlQUFsQyxDQUFBOztBQUFBLEVBQ0MsMkJBQTRCLE9BQUEsQ0FBUSxpQkFBUixFQUE1Qix3QkFERCxDQUFBOztBQUFBLEVBRUMsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaLFFBRkQsQ0FBQTs7QUFBQSxFQUdBLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSLENBSGxCLENBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FKYixDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBTGIsQ0FBQTs7QUFBQSxFQU1BLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx1QkFBUixDQU5wQixDQUFBOztBQUFBLEVBT0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBUE4sQ0FBQTs7QUFBQSxFQVFBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQVJKLENBQUE7O0FBQUEsRUFTQSxNQUFBLEdBQVMsTUFUVCxDQUFBOztBQUFBLEVBV0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLGdCQUFWO0FBQUEsSUFDQSxrQkFBQSxFQUFvQixpREFEcEI7QUFBQSxJQUVBLGlCQUFBLEVBQW1CLENBRm5CO0FBQUEsSUFHQSxrQkFBQSxFQUFvQixDQUhwQjtBQUFBLElBSUEsb0JBQUEsRUFBc0IsS0FKdEI7QUFBQSxJQUtBLFNBQUEsRUFBVyxFQUxYO0FBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/provider.coffee
