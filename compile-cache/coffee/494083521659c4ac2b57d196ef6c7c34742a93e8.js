(function() {
  "use strict";
  var $, Beautifiers, CompositeDisposable, LoadingView, Promise, async, beautifier, beautify, beautifyDirectory, beautifyFile, beautifyFilePath, debug, defaultLanguageOptions, dir, fs, getCursors, getScrollTop, getUnsupportedOptions, handleSaveEvent, loadingView, logger, path, pkg, plugin, setCursors, setScrollTop, showError, strip, yaml, _;

  pkg = require('../package.json');

  plugin = module.exports;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  _ = require("lodash");

  Beautifiers = require("./beautifiers");

  beautifier = new Beautifiers();

  defaultLanguageOptions = beautifier.options;

  logger = require('./logger')(__filename);

  Promise = require('bluebird');

  fs = null;

  path = require("path");

  strip = null;

  yaml = null;

  async = null;

  dir = null;

  LoadingView = null;

  loadingView = null;

  $ = null;

  getScrollTop = function(editor) {
    var view;
    view = editor.viewRegistry.getView(editor);
    return view.getScrollTop();
  };

  setScrollTop = function(editor, value) {
    var view;
    view = editor.viewRegistry.getView(editor);
    return view.setScrollTop(value);
  };

  getCursors = function(editor) {
    var bufferPosition, cursor, cursors, posArray, _i, _len;
    cursors = editor.getCursors();
    posArray = [];
    for (_i = 0, _len = cursors.length; _i < _len; _i++) {
      cursor = cursors[_i];
      bufferPosition = cursor.getBufferPosition();
      posArray.push([bufferPosition.row, bufferPosition.column]);
    }
    return posArray;
  };

  setCursors = function(editor, posArray) {
    var bufferPosition, i, _i, _len;
    for (i = _i = 0, _len = posArray.length; _i < _len; i = ++_i) {
      bufferPosition = posArray[i];
      if (i === 0) {
        editor.setCursorBufferPosition(bufferPosition);
        continue;
      }
      editor.addCursorAtBufferPosition(bufferPosition);
    }
  };

  beautifier.on('beautify::start', function() {
    if (LoadingView == null) {
      LoadingView = require("./views/loading-view");
    }
    if (loadingView == null) {
      loadingView = new LoadingView();
    }
    return loadingView.show();
  });

  beautifier.on('beautify::end', function() {
    return loadingView != null ? loadingView.hide() : void 0;
  });

  showError = function(error) {
    var detail, stack, _ref;
    if (!atom.config.get("atom-beautify.general.muteAllErrors")) {
      stack = error.stack;
      detail = error.description || error.message;
      return (_ref = atom.notifications) != null ? _ref.addError(error.message, {
        stack: stack,
        detail: detail,
        dismissable: true
      }) : void 0;
    }
  };

  beautify = function(_arg) {
    var allOptions, beautifyCompleted, e, editedFilePath, editor, forceEntireFile, grammarName, isSelection, oldText, onSave, text;
    onSave = _arg.onSave;
    plugin.checkUnsupportedOptions();
    if (path == null) {
      path = require("path");
    }
    forceEntireFile = onSave && atom.config.get("atom-beautify.general.beautifyEntireFileOnSave");
    beautifyCompleted = function(text) {
      var origScrollTop, posArray, selectedBufferRange;
      if (text == null) {

      } else if (text instanceof Error) {
        showError(text);
      } else if (typeof text === "string") {
        if (oldText !== text) {
          posArray = getCursors(editor);
          origScrollTop = getScrollTop(editor);
          if (!forceEntireFile && isSelection) {
            selectedBufferRange = editor.getSelectedBufferRange();
            editor.setTextInBufferRange(selectedBufferRange, text);
          } else {
            editor.setText(text);
          }
          setCursors(editor, posArray);
          setTimeout((function() {
            setScrollTop(editor, origScrollTop);
          }), 0);
        }
      } else {
        showError(new Error("Unsupported beautification result '" + text + "'."));
      }
    };
    editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return showError(new Error("Active Editor not found. ", "Please select a Text Editor first to beautify."));
    }
    isSelection = !!editor.getSelectedText();
    editedFilePath = editor.getPath();
    allOptions = beautifier.getOptionsForPath(editedFilePath, editor);
    text = void 0;
    if (!forceEntireFile && isSelection) {
      text = editor.getSelectedText();
    } else {
      text = editor.getText();
    }
    oldText = text;
    grammarName = editor.getGrammar().name;
    try {
      beautifier.beautify(text, allOptions, grammarName, editedFilePath, {
        onSave: onSave
      }).then(beautifyCompleted)["catch"](beautifyCompleted);
    } catch (_error) {
      e = _error;
      showError(e);
    }
  };

  beautifyFilePath = function(filePath, callback) {
    var $el, cb;
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
    $el.addClass('beautifying');
    cb = function(err, result) {
      $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
      $el.removeClass('beautifying');
      return callback(err, result);
    };
    if (fs == null) {
      fs = require("fs");
    }
    return fs.readFile(filePath, function(err, data) {
      var allOptions, completionFun, e, grammar, grammarName, input;
      if (err) {
        return cb(err);
      }
      input = data != null ? data.toString() : void 0;
      grammar = atom.grammars.selectGrammar(filePath, input);
      grammarName = grammar.name;
      allOptions = beautifier.getOptionsForPath(filePath);
      completionFun = function(output) {
        if (output instanceof Error) {
          return cb(output, null);
        } else if (typeof output === "string") {
          if (output === '') {
            return cb(null, output);
          }
          return fs.writeFile(filePath, output, function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, output);
          });
        } else {
          return cb(new Error("Unknown beautification result " + output + "."), output);
        }
      };
      try {
        return beautifier.beautify(input, allOptions, grammarName, filePath).then(completionFun)["catch"](completionFun);
      } catch (_error) {
        e = _error;
        return cb(e);
      }
    });
  };

  beautifyFile = function(_arg) {
    var filePath, target;
    target = _arg.target;
    filePath = target.dataset.path;
    if (!filePath) {
      return;
    }
    beautifyFilePath(filePath, function(err, result) {
      if (err) {
        return showError(err);
      }
    });
  };

  beautifyDirectory = function(_arg) {
    var $el, dirPath, target;
    target = _arg.target;
    dirPath = target.dataset.path;
    if (!dirPath) {
      return;
    }
    if ((typeof atom !== "undefined" && atom !== null ? atom.confirm({
      message: "This will beautify all of the files found recursively in this directory, '" + dirPath + "'. Do you want to continue?",
      buttons: ['Yes, continue!', 'No, cancel!']
    }) : void 0) !== 0) {
      return;
    }
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
    $el.addClass('beautifying');
    if (dir == null) {
      dir = require("node-dir");
    }
    if (async == null) {
      async = require("async");
    }
    dir.files(dirPath, function(err, files) {
      if (err) {
        return showError(err);
      }
      return async.each(files, function(filePath, callback) {
        return beautifyFilePath(filePath, function() {
          return callback();
        });
      }, function(err) {
        $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
        return $el.removeClass('beautifying');
      });
    });
  };

  debug = function() {
    var addHeader, addInfo, allOptions, beautifiers, codeBlockSyntax, debugInfo, editor, filePath, grammarName, headers, language, linkifyTitle, selectedBeautifier, text, tocEl, _ref;
    plugin.checkUnsupportedOptions();
    editor = atom.workspace.getActiveTextEditor();
    linkifyTitle = function(title) {
      var p, sep;
      title = title.toLowerCase();
      p = title.split(/[\s,+#;,\/?:@&=+$]+/);
      sep = "-";
      return p.join(sep);
    };
    if (editor == null) {
      return confirm("Active Editor not found.\n" + "Please select a Text Editor first to beautify.");
    }
    if (!confirm('Are you ready to debug Atom Beautify?\n\n' + 'Warning: This will change your current clipboard contents.')) {
      return;
    }
    debugInfo = "";
    headers = [];
    tocEl = "<TABLEOFCONTENTS/>";
    addInfo = function(key, val) {
      if (key != null) {
        return debugInfo += "**" + key + "**: " + val + "\n\n";
      } else {
        return debugInfo += "" + val + "\n\n";
      }
    };
    addHeader = function(level, title) {
      debugInfo += "" + (Array(level + 1).join('#')) + " " + title + "\n\n";
      return headers.push({
        level: level,
        title: title
      });
    };
    addHeader(1, "Atom Beautify - Debugging information");
    debugInfo += "The following debugging information was " + ("generated by `Atom Beautify` on `" + (new Date()) + "`.") + "\n\n---\n\n" + tocEl + "\n\n---\n\n";
    addInfo('Platform', process.platform);
    addHeader(2, "Versions");
    addInfo('Atom Version', atom.appVersion);
    addInfo('Atom Beautify Version', pkg.version);
    addHeader(2, "Original file to be beautified");
    filePath = editor.getPath();
    addInfo('Original File Path', "`" + filePath + "`");
    grammarName = editor.getGrammar().name;
    addInfo('Original File Grammar', grammarName);
    language = beautifier.getLanguage(grammarName, filePath);
    addInfo('Original File Language', language != null ? language.name : void 0);
    addInfo('Language namespace', language != null ? language.namespace : void 0);
    beautifiers = beautifier.getBeautifiers(language.name);
    addInfo('Supported Beautifiers', _.map(beautifiers, 'name').join(', '));
    selectedBeautifier = beautifier.getBeautifierForLanguage(language);
    addInfo('Selected Beautifier', selectedBeautifier.name);
    text = editor.getText();
    codeBlockSyntax = ((_ref = language != null ? language.name : void 0) != null ? _ref : grammarName).toLowerCase().split(' ')[0];
    addHeader(3, 'Original File Contents');
    addInfo(null, "\n```" + codeBlockSyntax + "\n" + text + "\n```");
    addHeader(3, 'Package Settings');
    addInfo(null, "The raw package settings options\n" + ("```json\n" + (JSON.stringify(atom.config.get('atom-beautify'), void 0, 4)) + "\n```"));
    addHeader(2, "Beautification options");
    allOptions = beautifier.getOptionsForPath(filePath, editor);
    return Promise.all(allOptions).then(function(allOptions) {
      var cb, configOptions, e, editorConfigOptions, editorOptions, finalOptions, homeOptions, logFilePathRegex, logs, preTransformedOptions, projectOptions, subscription;
      editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
      projectOptions = allOptions.slice(4);
      preTransformedOptions = beautifier.getOptionsForLanguage(allOptions, language);
      if (selectedBeautifier) {
        finalOptions = beautifier.transformOptions(selectedBeautifier, language.name, preTransformedOptions);
      }
      addInfo('Editor Options', "\n" + "Options from Atom Editor settings\n" + ("```json\n" + (JSON.stringify(editorOptions, void 0, 4)) + "\n```"));
      addInfo('Config Options', "\n" + "Options from Atom Beautify package settings\n" + ("```json\n" + (JSON.stringify(configOptions, void 0, 4)) + "\n```"));
      addInfo('Home Options', "\n" + ("Options from `" + (path.resolve(beautifier.getUserHome(), '.jsbeautifyrc')) + "`\n") + ("```json\n" + (JSON.stringify(homeOptions, void 0, 4)) + "\n```"));
      addInfo('EditorConfig Options', "\n" + "Options from [EditorConfig](http://editorconfig.org/) file\n" + ("```json\n" + (JSON.stringify(editorConfigOptions, void 0, 4)) + "\n```"));
      addInfo('Project Options', "\n" + ("Options from `.jsbeautifyrc` files starting from directory `" + (path.dirname(filePath)) + "` and going up to root\n") + ("```json\n" + (JSON.stringify(projectOptions, void 0, 4)) + "\n```"));
      addInfo('Pre-Transformed Options', "\n" + "Combined options before transforming them given a beautifier's specifications\n" + ("```json\n" + (JSON.stringify(preTransformedOptions, void 0, 4)) + "\n```"));
      if (selectedBeautifier) {
        addHeader(3, 'Final Options');
        addInfo(null, "Final combined and transformed options that are used\n" + ("```json\n" + (JSON.stringify(finalOptions, void 0, 4)) + "\n```"));
      }
      logs = "";
      logFilePathRegex = new RegExp('\\: \\[(.*)\\]');
      subscription = logger.onLogging(function(msg) {
        var sep;
        sep = path.sep;
        return logs += msg.replace(logFilePathRegex, function(a, b) {
          var i, p, s;
          s = b.split(sep);
          i = s.indexOf('atom-beautify');
          p = s.slice(i + 2).join(sep);
          return ': [' + p + ']';
        });
      });
      cb = function(result) {
        var JsDiff, bullet, diff, header, indent, indentNum, toc, _i, _len;
        subscription.dispose();
        addHeader(2, "Results");
        addInfo('Beautified File Contents', "\n```" + codeBlockSyntax + "\n" + result + "\n```");
        JsDiff = require('diff');
        diff = JsDiff.createPatch(filePath, text, result, "original", "beautified");
        addInfo('Original vs. Beautified Diff', "\n```" + codeBlockSyntax + "\n" + diff + "\n```");
        addHeader(3, "Logs");
        addInfo(null, "```\n" + logs + "\n```");
        toc = "## Table Of Contents\n";
        for (_i = 0, _len = headers.length; _i < _len; _i++) {
          header = headers[_i];

          /*
          - Heading 1
            - Heading 1.1
           */
          indent = "  ";
          bullet = "-";
          indentNum = header.level - 2;
          if (indentNum >= 0) {
            toc += "" + (Array(indentNum + 1).join(indent)) + bullet + " [" + header.title + "](\#" + (linkifyTitle(header.title)) + ")\n";
          }
        }
        debugInfo = debugInfo.replace(tocEl, toc);
        atom.clipboard.write(debugInfo);
        return confirm('Atom Beautify debugging information is now in your clipboard.\n' + 'You can now paste this into an Issue you are reporting here\n' + 'https://github.com/Glavin001/atom-beautify/issues/\n\n' + 'Please follow the contribution guidelines found at\n' + 'https://github.com/Glavin001/atom-beautify/blob/master/CONTRIBUTING.md\n\n' + 'Warning: Be sure to look over the debug info before you send it, ' + 'to ensure you are not sharing undesirable private information.');
      };
      try {
        return beautifier.beautify(text, allOptions, grammarName, filePath).then(cb)["catch"](cb);
      } catch (_error) {
        e = _error;
        return cb(e);
      }
    });
  };

  handleSaveEvent = function() {
    return atom.workspace.observeTextEditors(function(editor) {
      var buffer, disposable;
      buffer = editor.getBuffer();
      disposable = buffer.onDidSave(function(_arg) {
        var beautifyOnSave, fileExtension, filePath, grammar, key, language, languages, origScrollTop, posArray;
        filePath = _arg.path;
        if (path == null) {
          path = require('path');
        }
        grammar = editor.getGrammar().name;
        fileExtension = path.extname(filePath);
        fileExtension = fileExtension.substr(1);
        languages = beautifier.languages.getLanguages({
          grammar: grammar,
          extension: fileExtension
        });
        if (languages.length < 1) {
          return;
        }
        language = languages[0];
        key = "atom-beautify." + language.namespace + ".beautify_on_save";
        beautifyOnSave = atom.config.get(key);
        logger.verbose('save editor positions', key, beautifyOnSave);
        if (beautifyOnSave) {
          posArray = getCursors(editor);
          origScrollTop = getScrollTop(editor);
          return beautifyFilePath(filePath, function() {
            if (editor.isAlive() === true) {
              buffer.reload();
              logger.verbose('restore editor positions', posArray, origScrollTop);
              return setTimeout((function() {
                setCursors(editor, posArray);
                setScrollTop(editor, origScrollTop);
              }), 0);
            }
          });
        }
      });
      return plugin.subscriptions.add(disposable);
    });
  };

  getUnsupportedOptions = function() {
    var schema, settings, unsupportedOptions;
    settings = atom.config.get('atom-beautify');
    schema = atom.config.getSchema('atom-beautify');
    unsupportedOptions = _.filter(_.keys(settings), function(key) {
      return schema.properties[key] === void 0;
    });
    return unsupportedOptions;
  };

  plugin.checkUnsupportedOptions = function() {
    var unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    if (unsupportedOptions.length !== 0) {
      return atom.notifications.addWarning("Please run Atom command 'Atom-Beautify: Migrate Settings'.", {
        detail: "You have unsupported options: " + (unsupportedOptions.join(', ')),
        dismissable: true
      });
    }
  };

  plugin.migrateSettings = function() {
    var namespaces, rename, rex, unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    namespaces = beautifier.languages.namespaces;
    if (unsupportedOptions.length === 0) {
      return atom.notifications.addSuccess("No options to migrate.");
    } else {
      rex = new RegExp("(" + (namespaces.join('|')) + ")_(.*)");
      rename = _.toPairs(_.zipObject(unsupportedOptions, _.map(unsupportedOptions, function(key) {
        var m;
        m = key.match(rex);
        if (m === null) {
          return "general." + key;
        } else {
          return "" + m[1] + "." + m[2];
        }
      })));
      _.each(rename, function(_arg) {
        var key, newKey, val;
        key = _arg[0], newKey = _arg[1];
        val = atom.config.get("atom-beautify." + key);
        atom.config.set("atom-beautify." + newKey, val);
        return atom.config.set("atom-beautify." + key, void 0);
      });
      return atom.notifications.addSuccess("Successfully migrated options: " + (unsupportedOptions.join(', ')));
    }
  };

  plugin.config = _.merge(require('./config.coffee'), defaultLanguageOptions);

  plugin.activate = function() {
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(handleSaveEvent());
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:beautify-editor", beautify));
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:help-debug-editor", debug));
    this.subscriptions.add(atom.commands.add(".tree-view .file .name", "atom-beautify:beautify-file", beautifyFile));
    this.subscriptions.add(atom.commands.add(".tree-view .directory .name", "atom-beautify:beautify-directory", beautifyDirectory));
    return this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:migrate-settings", plugin.migrateSettings));
  };

  plugin.deactivate = function() {
    return this.subscriptions.dispose();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSxnVkFBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsaUJBQVIsQ0FETixDQUFBOztBQUFBLEVBSUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUpoQixDQUFBOztBQUFBLEVBS0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUxELENBQUE7O0FBQUEsRUFNQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FOSixDQUFBOztBQUFBLEVBT0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxlQUFSLENBUGQsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBaUIsSUFBQSxXQUFBLENBQUEsQ0FSakIsQ0FBQTs7QUFBQSxFQVNBLHNCQUFBLEdBQXlCLFVBQVUsQ0FBQyxPQVRwQyxDQUFBOztBQUFBLEVBVUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQUEsQ0FBb0IsVUFBcEIsQ0FWVCxDQUFBOztBQUFBLEVBV0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSLENBWFYsQ0FBQTs7QUFBQSxFQWNBLEVBQUEsR0FBSyxJQWRMLENBQUE7O0FBQUEsRUFlQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FmUCxDQUFBOztBQUFBLEVBZ0JBLEtBQUEsR0FBUSxJQWhCUixDQUFBOztBQUFBLEVBaUJBLElBQUEsR0FBTyxJQWpCUCxDQUFBOztBQUFBLEVBa0JBLEtBQUEsR0FBUSxJQWxCUixDQUFBOztBQUFBLEVBbUJBLEdBQUEsR0FBTSxJQW5CTixDQUFBOztBQUFBLEVBb0JBLFdBQUEsR0FBYyxJQXBCZCxDQUFBOztBQUFBLEVBcUJBLFdBQUEsR0FBYyxJQXJCZCxDQUFBOztBQUFBLEVBc0JBLENBQUEsR0FBSSxJQXRCSixDQUFBOztBQUFBLEVBNEJBLFlBQUEsR0FBZSxTQUFDLE1BQUQsR0FBQTtBQUNiLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBcEIsQ0FBNEIsTUFBNUIsQ0FBUCxDQUFBO1dBQ0EsSUFBSSxDQUFDLFlBQUwsQ0FBQSxFQUZhO0VBQUEsQ0E1QmYsQ0FBQTs7QUFBQSxFQStCQSxZQUFBLEdBQWUsU0FBQyxNQUFELEVBQVMsS0FBVCxHQUFBO0FBQ2IsUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFwQixDQUE0QixNQUE1QixDQUFQLENBQUE7V0FDQSxJQUFJLENBQUMsWUFBTCxDQUFrQixLQUFsQixFQUZhO0VBQUEsQ0EvQmYsQ0FBQTs7QUFBQSxFQW1DQSxVQUFBLEdBQWEsU0FBQyxNQUFELEdBQUE7QUFDWCxRQUFBLG1EQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFWLENBQUE7QUFBQSxJQUNBLFFBQUEsR0FBVyxFQURYLENBQUE7QUFFQSxTQUFBLDhDQUFBOzJCQUFBO0FBQ0UsTUFBQSxjQUFBLEdBQWlCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQWpCLENBQUE7QUFBQSxNQUNBLFFBQVEsQ0FBQyxJQUFULENBQWMsQ0FDWixjQUFjLENBQUMsR0FESCxFQUVaLGNBQWMsQ0FBQyxNQUZILENBQWQsQ0FEQSxDQURGO0FBQUEsS0FGQTtXQVFBLFNBVFc7RUFBQSxDQW5DYixDQUFBOztBQUFBLEVBNkNBLFVBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxRQUFULEdBQUE7QUFHWCxRQUFBLDJCQUFBO0FBQUEsU0FBQSx1REFBQTttQ0FBQTtBQUNFLE1BQUEsSUFBRyxDQUFBLEtBQUssQ0FBUjtBQUNFLFFBQUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLGNBQS9CLENBQUEsQ0FBQTtBQUNBLGlCQUZGO09BQUE7QUFBQSxNQUdBLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxjQUFqQyxDQUhBLENBREY7QUFBQSxLQUhXO0VBQUEsQ0E3Q2IsQ0FBQTs7QUFBQSxFQXdEQSxVQUFVLENBQUMsRUFBWCxDQUFjLGlCQUFkLEVBQWlDLFNBQUEsR0FBQTs7TUFDL0IsY0FBZSxPQUFBLENBQVEsc0JBQVI7S0FBZjs7TUFDQSxjQUFtQixJQUFBLFdBQUEsQ0FBQTtLQURuQjtXQUVBLFdBQVcsQ0FBQyxJQUFaLENBQUEsRUFIK0I7RUFBQSxDQUFqQyxDQXhEQSxDQUFBOztBQUFBLEVBNkRBLFVBQVUsQ0FBQyxFQUFYLENBQWMsZUFBZCxFQUErQixTQUFBLEdBQUE7aUNBQzdCLFdBQVcsQ0FBRSxJQUFiLENBQUEsV0FENkI7RUFBQSxDQUEvQixDQTdEQSxDQUFBOztBQUFBLEVBaUVBLFNBQUEsR0FBWSxTQUFDLEtBQUQsR0FBQTtBQUNWLFFBQUEsbUJBQUE7QUFBQSxJQUFBLElBQUcsQ0FBQSxJQUFRLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCLENBQVA7QUFFRSxNQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsS0FBZCxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsS0FBSyxDQUFDLFdBQU4sSUFBcUIsS0FBSyxDQUFDLE9BRHBDLENBQUE7dURBRWtCLENBQUUsUUFBcEIsQ0FBNkIsS0FBSyxDQUFDLE9BQW5DLEVBQTRDO0FBQUEsUUFDMUMsT0FBQSxLQUQwQztBQUFBLFFBQ25DLFFBQUEsTUFEbUM7QUFBQSxRQUMzQixXQUFBLEVBQWMsSUFEYTtPQUE1QyxXQUpGO0tBRFU7RUFBQSxDQWpFWixDQUFBOztBQUFBLEVBeUVBLFFBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTtBQUVULFFBQUEsMEhBQUE7QUFBQSxJQUZXLFNBQUQsS0FBQyxNQUVYLENBQUE7QUFBQSxJQUFBLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQUEsQ0FBQTs7TUFHQSxPQUFRLE9BQUEsQ0FBUSxNQUFSO0tBSFI7QUFBQSxJQUlBLGVBQUEsR0FBa0IsTUFBQSxJQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnREFBaEIsQ0FKN0IsQ0FBQTtBQUFBLElBZUEsaUJBQUEsR0FBb0IsU0FBQyxJQUFELEdBQUE7QUFFbEIsVUFBQSw0Q0FBQTtBQUFBLE1BQUEsSUFBTyxZQUFQO0FBQUE7T0FBQSxNQUdLLElBQUcsSUFBQSxZQUFnQixLQUFuQjtBQUNILFFBQUEsU0FBQSxDQUFVLElBQVYsQ0FBQSxDQURHO09BQUEsTUFFQSxJQUFHLE1BQUEsQ0FBQSxJQUFBLEtBQWUsUUFBbEI7QUFDSCxRQUFBLElBQUcsT0FBQSxLQUFhLElBQWhCO0FBR0UsVUFBQSxRQUFBLEdBQVcsVUFBQSxDQUFXLE1BQVgsQ0FBWCxDQUFBO0FBQUEsVUFHQSxhQUFBLEdBQWdCLFlBQUEsQ0FBYSxNQUFiLENBSGhCLENBQUE7QUFNQSxVQUFBLElBQUcsQ0FBQSxlQUFBLElBQXdCLFdBQTNCO0FBQ0UsWUFBQSxtQkFBQSxHQUFzQixNQUFNLENBQUMsc0JBQVAsQ0FBQSxDQUF0QixDQUFBO0FBQUEsWUFHQSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsbUJBQTVCLEVBQWlELElBQWpELENBSEEsQ0FERjtXQUFBLE1BQUE7QUFRRSxZQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixDQUFBLENBUkY7V0FOQTtBQUFBLFVBaUJBLFVBQUEsQ0FBVyxNQUFYLEVBQW1CLFFBQW5CLENBakJBLENBQUE7QUFBQSxVQXVCQSxVQUFBLENBQVcsQ0FBRSxTQUFBLEdBQUE7QUFHWCxZQUFBLFlBQUEsQ0FBYSxNQUFiLEVBQXFCLGFBQXJCLENBQUEsQ0FIVztVQUFBLENBQUYsQ0FBWCxFQUtHLENBTEgsQ0F2QkEsQ0FIRjtTQURHO09BQUEsTUFBQTtBQWtDSCxRQUFBLFNBQUEsQ0FBZSxJQUFBLEtBQUEsQ0FBTyxxQ0FBQSxHQUFxQyxJQUFyQyxHQUEwQyxJQUFqRCxDQUFmLENBQUEsQ0FsQ0c7T0FQYTtJQUFBLENBZnBCLENBQUE7QUFBQSxJQWlFQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBakVULENBQUE7QUFxRUEsSUFBQSxJQUFPLGNBQVA7QUFDRSxhQUFPLFNBQUEsQ0FBZSxJQUFBLEtBQUEsQ0FBTSwyQkFBTixFQUNwQixnREFEb0IsQ0FBZixDQUFQLENBREY7S0FyRUE7QUFBQSxJQXdFQSxXQUFBLEdBQWMsQ0FBQSxDQUFDLE1BQU8sQ0FBQyxlQUFQLENBQUEsQ0F4RWhCLENBQUE7QUFBQSxJQTRFQSxjQUFBLEdBQWlCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0E1RWpCLENBQUE7QUFBQSxJQWdGQSxVQUFBLEdBQWEsVUFBVSxDQUFDLGlCQUFYLENBQTZCLGNBQTdCLEVBQTZDLE1BQTdDLENBaEZiLENBQUE7QUFBQSxJQW9GQSxJQUFBLEdBQU8sTUFwRlAsQ0FBQTtBQXFGQSxJQUFBLElBQUcsQ0FBQSxlQUFBLElBQXdCLFdBQTNCO0FBQ0UsTUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLGVBQVAsQ0FBQSxDQUFQLENBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBSEY7S0FyRkE7QUFBQSxJQXlGQSxPQUFBLEdBQVUsSUF6RlYsQ0FBQTtBQUFBLElBNkZBLFdBQUEsR0FBYyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsSUE3RmxDLENBQUE7QUFpR0E7QUFDRSxNQUFBLFVBQVUsQ0FBQyxRQUFYLENBQW9CLElBQXBCLEVBQTBCLFVBQTFCLEVBQXNDLFdBQXRDLEVBQW1ELGNBQW5ELEVBQW1FO0FBQUEsUUFBQSxNQUFBLEVBQVMsTUFBVDtPQUFuRSxDQUNBLENBQUMsSUFERCxDQUNNLGlCQUROLENBRUEsQ0FBQyxPQUFELENBRkEsQ0FFTyxpQkFGUCxDQUFBLENBREY7S0FBQSxjQUFBO0FBS0UsTUFESSxVQUNKLENBQUE7QUFBQSxNQUFBLFNBQUEsQ0FBVSxDQUFWLENBQUEsQ0FMRjtLQW5HUztFQUFBLENBekVYLENBQUE7O0FBQUEsRUFvTEEsZ0JBQUEsR0FBbUIsU0FBQyxRQUFELEVBQVcsUUFBWCxHQUFBO0FBR2pCLFFBQUEsT0FBQTs7TUFBQSxJQUFLLE9BQUEsQ0FBUSxzQkFBUixDQUErQixDQUFDO0tBQXJDO0FBQUEsSUFDQSxHQUFBLEdBQU0sQ0FBQSxDQUFHLDhCQUFBLEdBQThCLFFBQTlCLEdBQXVDLEtBQTFDLENBRE4sQ0FBQTtBQUFBLElBRUEsR0FBRyxDQUFDLFFBQUosQ0FBYSxhQUFiLENBRkEsQ0FBQTtBQUFBLElBS0EsRUFBQSxHQUFLLFNBQUMsR0FBRCxFQUFNLE1BQU4sR0FBQTtBQUNILE1BQUEsR0FBQSxHQUFNLENBQUEsQ0FBRyw4QkFBQSxHQUE4QixRQUE5QixHQUF1QyxLQUExQyxDQUFOLENBQUE7QUFBQSxNQUNBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLGFBQWhCLENBREEsQ0FBQTtBQUVBLGFBQU8sUUFBQSxDQUFTLEdBQVQsRUFBYyxNQUFkLENBQVAsQ0FIRztJQUFBLENBTEwsQ0FBQTs7TUFXQSxLQUFNLE9BQUEsQ0FBUSxJQUFSO0tBWE47V0FZQSxFQUFFLENBQUMsUUFBSCxDQUFZLFFBQVosRUFBc0IsU0FBQyxHQUFELEVBQU0sSUFBTixHQUFBO0FBQ3BCLFVBQUEseURBQUE7QUFBQSxNQUFBLElBQWtCLEdBQWxCO0FBQUEsZUFBTyxFQUFBLENBQUcsR0FBSCxDQUFQLENBQUE7T0FBQTtBQUFBLE1BQ0EsS0FBQSxrQkFBUSxJQUFJLENBQUUsUUFBTixDQUFBLFVBRFIsQ0FBQTtBQUFBLE1BRUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBZCxDQUE0QixRQUE1QixFQUFzQyxLQUF0QyxDQUZWLENBQUE7QUFBQSxNQUdBLFdBQUEsR0FBYyxPQUFPLENBQUMsSUFIdEIsQ0FBQTtBQUFBLE1BTUEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxpQkFBWCxDQUE2QixRQUE3QixDQU5iLENBQUE7QUFBQSxNQVNBLGFBQUEsR0FBZ0IsU0FBQyxNQUFELEdBQUE7QUFDZCxRQUFBLElBQUcsTUFBQSxZQUFrQixLQUFyQjtBQUNFLGlCQUFPLEVBQUEsQ0FBRyxNQUFILEVBQVcsSUFBWCxDQUFQLENBREY7U0FBQSxNQUVLLElBQUcsTUFBQSxDQUFBLE1BQUEsS0FBaUIsUUFBcEI7QUFFSCxVQUFBLElBQTJCLE1BQUEsS0FBVSxFQUFyQztBQUFBLG1CQUFPLEVBQUEsQ0FBRyxJQUFILEVBQVMsTUFBVCxDQUFQLENBQUE7V0FBQTtpQkFFQSxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsRUFBdUIsTUFBdkIsRUFBK0IsU0FBQyxHQUFELEdBQUE7QUFDN0IsWUFBQSxJQUFrQixHQUFsQjtBQUFBLHFCQUFPLEVBQUEsQ0FBRyxHQUFILENBQVAsQ0FBQTthQUFBO0FBQ0EsbUJBQU8sRUFBQSxDQUFJLElBQUosRUFBVyxNQUFYLENBQVAsQ0FGNkI7VUFBQSxDQUEvQixFQUpHO1NBQUEsTUFBQTtBQVNILGlCQUFPLEVBQUEsQ0FBUSxJQUFBLEtBQUEsQ0FBTyxnQ0FBQSxHQUFnQyxNQUFoQyxHQUF1QyxHQUE5QyxDQUFSLEVBQTJELE1BQTNELENBQVAsQ0FURztTQUhTO01BQUEsQ0FUaEIsQ0FBQTtBQXNCQTtlQUNFLFVBQVUsQ0FBQyxRQUFYLENBQW9CLEtBQXBCLEVBQTJCLFVBQTNCLEVBQXVDLFdBQXZDLEVBQW9ELFFBQXBELENBQ0EsQ0FBQyxJQURELENBQ00sYUFETixDQUVBLENBQUMsT0FBRCxDQUZBLENBRU8sYUFGUCxFQURGO09BQUEsY0FBQTtBQUtFLFFBREksVUFDSixDQUFBO0FBQUEsZUFBTyxFQUFBLENBQUcsQ0FBSCxDQUFQLENBTEY7T0F2Qm9CO0lBQUEsQ0FBdEIsRUFmaUI7RUFBQSxDQXBMbkIsQ0FBQTs7QUFBQSxFQWtPQSxZQUFBLEdBQWUsU0FBQyxJQUFELEdBQUE7QUFDYixRQUFBLGdCQUFBO0FBQUEsSUFEZSxTQUFELEtBQUMsTUFDZixDQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUExQixDQUFBO0FBQ0EsSUFBQSxJQUFBLENBQUEsUUFBQTtBQUFBLFlBQUEsQ0FBQTtLQURBO0FBQUEsSUFFQSxnQkFBQSxDQUFpQixRQUFqQixFQUEyQixTQUFDLEdBQUQsRUFBTSxNQUFOLEdBQUE7QUFDekIsTUFBQSxJQUF5QixHQUF6QjtBQUFBLGVBQU8sU0FBQSxDQUFVLEdBQVYsQ0FBUCxDQUFBO09BRHlCO0lBQUEsQ0FBM0IsQ0FGQSxDQURhO0VBQUEsQ0FsT2YsQ0FBQTs7QUFBQSxFQTJPQSxpQkFBQSxHQUFvQixTQUFDLElBQUQsR0FBQTtBQUNsQixRQUFBLG9CQUFBO0FBQUEsSUFEb0IsU0FBRCxLQUFDLE1BQ3BCLENBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQXpCLENBQUE7QUFDQSxJQUFBLElBQUEsQ0FBQSxPQUFBO0FBQUEsWUFBQSxDQUFBO0tBREE7QUFHQSxJQUFBLG9EQUFVLElBQUksQ0FBRSxPQUFOLENBQ1I7QUFBQSxNQUFBLE9BQUEsRUFBVSw0RUFBQSxHQUM0QixPQUQ1QixHQUNvQyw2QkFEOUM7QUFBQSxNQUdBLE9BQUEsRUFBUyxDQUFDLGdCQUFELEVBQWtCLGFBQWxCLENBSFQ7S0FEUSxXQUFBLEtBSXdDLENBSmxEO0FBQUEsWUFBQSxDQUFBO0tBSEE7O01BVUEsSUFBSyxPQUFBLENBQVEsc0JBQVIsQ0FBK0IsQ0FBQztLQVZyQztBQUFBLElBV0EsR0FBQSxHQUFNLENBQUEsQ0FBRyxtQ0FBQSxHQUFtQyxPQUFuQyxHQUEyQyxLQUE5QyxDQVhOLENBQUE7QUFBQSxJQVlBLEdBQUcsQ0FBQyxRQUFKLENBQWEsYUFBYixDQVpBLENBQUE7O01BZUEsTUFBTyxPQUFBLENBQVEsVUFBUjtLQWZQOztNQWdCQSxRQUFTLE9BQUEsQ0FBUSxPQUFSO0tBaEJUO0FBQUEsSUFpQkEsR0FBRyxDQUFDLEtBQUosQ0FBVSxPQUFWLEVBQW1CLFNBQUMsR0FBRCxFQUFNLEtBQU4sR0FBQTtBQUNqQixNQUFBLElBQXlCLEdBQXpCO0FBQUEsZUFBTyxTQUFBLENBQVUsR0FBVixDQUFQLENBQUE7T0FBQTthQUVBLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWCxFQUFrQixTQUFDLFFBQUQsRUFBVyxRQUFYLEdBQUE7ZUFFaEIsZ0JBQUEsQ0FBaUIsUUFBakIsRUFBMkIsU0FBQSxHQUFBO2lCQUFHLFFBQUEsQ0FBQSxFQUFIO1FBQUEsQ0FBM0IsRUFGZ0I7TUFBQSxDQUFsQixFQUdFLFNBQUMsR0FBRCxHQUFBO0FBQ0EsUUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFHLG1DQUFBLEdBQW1DLE9BQW5DLEdBQTJDLEtBQTlDLENBQU4sQ0FBQTtlQUNBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLGFBQWhCLEVBRkE7TUFBQSxDQUhGLEVBSGlCO0lBQUEsQ0FBbkIsQ0FqQkEsQ0FEa0I7RUFBQSxDQTNPcEIsQ0FBQTs7QUFBQSxFQTJRQSxLQUFBLEdBQVEsU0FBQSxHQUFBO0FBRU4sUUFBQSw4S0FBQTtBQUFBLElBQUEsTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFHQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBSFQsQ0FBQTtBQUFBLElBS0EsWUFBQSxHQUFlLFNBQUMsS0FBRCxHQUFBO0FBQ2IsVUFBQSxNQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFdBQU4sQ0FBQSxDQUFSLENBQUE7QUFBQSxNQUNBLENBQUEsR0FBSSxLQUFLLENBQUMsS0FBTixDQUFZLHFCQUFaLENBREosQ0FBQTtBQUFBLE1BRUEsR0FBQSxHQUFNLEdBRk4sQ0FBQTthQUdBLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBUCxFQUphO0lBQUEsQ0FMZixDQUFBO0FBWUEsSUFBQSxJQUFPLGNBQVA7QUFDRSxhQUFPLE9BQUEsQ0FBUSw0QkFBQSxHQUNmLGdEQURPLENBQVAsQ0FERjtLQVpBO0FBZUEsSUFBQSxJQUFBLENBQUEsT0FBYyxDQUFRLDJDQUFBLEdBQ3RCLDREQURjLENBQWQ7QUFBQSxZQUFBLENBQUE7S0FmQTtBQUFBLElBaUJBLFNBQUEsR0FBWSxFQWpCWixDQUFBO0FBQUEsSUFrQkEsT0FBQSxHQUFVLEVBbEJWLENBQUE7QUFBQSxJQW1CQSxLQUFBLEdBQVEsb0JBbkJSLENBQUE7QUFBQSxJQW9CQSxPQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO0FBQ1IsTUFBQSxJQUFHLFdBQUg7ZUFDRSxTQUFBLElBQWMsSUFBQSxHQUFJLEdBQUosR0FBUSxNQUFSLEdBQWMsR0FBZCxHQUFrQixPQURsQztPQUFBLE1BQUE7ZUFHRSxTQUFBLElBQWEsRUFBQSxHQUFHLEdBQUgsR0FBTyxPQUh0QjtPQURRO0lBQUEsQ0FwQlYsQ0FBQTtBQUFBLElBeUJBLFNBQUEsR0FBWSxTQUFDLEtBQUQsRUFBUSxLQUFSLEdBQUE7QUFDVixNQUFBLFNBQUEsSUFBYSxFQUFBLEdBQUUsQ0FBQyxLQUFBLENBQU0sS0FBQSxHQUFNLENBQVosQ0FBYyxDQUFDLElBQWYsQ0FBb0IsR0FBcEIsQ0FBRCxDQUFGLEdBQTRCLEdBQTVCLEdBQStCLEtBQS9CLEdBQXFDLE1BQWxELENBQUE7YUFDQSxPQUFPLENBQUMsSUFBUixDQUFhO0FBQUEsUUFDWCxPQUFBLEtBRFc7QUFBQSxRQUNKLE9BQUEsS0FESTtPQUFiLEVBRlU7SUFBQSxDQXpCWixDQUFBO0FBQUEsSUE4QkEsU0FBQSxDQUFVLENBQVYsRUFBYSx1Q0FBYixDQTlCQSxDQUFBO0FBQUEsSUErQkEsU0FBQSxJQUFhLDBDQUFBLEdBQ2IsQ0FBQyxtQ0FBQSxHQUFrQyxDQUFLLElBQUEsSUFBQSxDQUFBLENBQUwsQ0FBbEMsR0FBOEMsSUFBL0MsQ0FEYSxHQUViLGFBRmEsR0FHYixLQUhhLEdBSWIsYUFuQ0EsQ0FBQTtBQUFBLElBc0NBLE9BQUEsQ0FBUSxVQUFSLEVBQW9CLE9BQU8sQ0FBQyxRQUE1QixDQXRDQSxDQUFBO0FBQUEsSUF1Q0EsU0FBQSxDQUFVLENBQVYsRUFBYSxVQUFiLENBdkNBLENBQUE7QUFBQSxJQTJDQSxPQUFBLENBQVEsY0FBUixFQUF3QixJQUFJLENBQUMsVUFBN0IsQ0EzQ0EsQ0FBQTtBQUFBLElBK0NBLE9BQUEsQ0FBUSx1QkFBUixFQUFpQyxHQUFHLENBQUMsT0FBckMsQ0EvQ0EsQ0FBQTtBQUFBLElBZ0RBLFNBQUEsQ0FBVSxDQUFWLEVBQWEsZ0NBQWIsQ0FoREEsQ0FBQTtBQUFBLElBc0RBLFFBQUEsR0FBVyxNQUFNLENBQUMsT0FBUCxDQUFBLENBdERYLENBQUE7QUFBQSxJQXlEQSxPQUFBLENBQVEsb0JBQVIsRUFBK0IsR0FBQSxHQUFHLFFBQUgsR0FBWSxHQUEzQyxDQXpEQSxDQUFBO0FBQUEsSUE0REEsV0FBQSxHQUFjLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxJQTVEbEMsQ0FBQTtBQUFBLElBK0RBLE9BQUEsQ0FBUSx1QkFBUixFQUFpQyxXQUFqQyxDQS9EQSxDQUFBO0FBQUEsSUFrRUEsUUFBQSxHQUFXLFVBQVUsQ0FBQyxXQUFYLENBQXVCLFdBQXZCLEVBQW9DLFFBQXBDLENBbEVYLENBQUE7QUFBQSxJQW1FQSxPQUFBLENBQVEsd0JBQVIscUJBQWtDLFFBQVEsQ0FBRSxhQUE1QyxDQW5FQSxDQUFBO0FBQUEsSUFvRUEsT0FBQSxDQUFRLG9CQUFSLHFCQUE4QixRQUFRLENBQUUsa0JBQXhDLENBcEVBLENBQUE7QUFBQSxJQXVFQSxXQUFBLEdBQWMsVUFBVSxDQUFDLGNBQVgsQ0FBMEIsUUFBUSxDQUFDLElBQW5DLENBdkVkLENBQUE7QUFBQSxJQXdFQSxPQUFBLENBQVEsdUJBQVIsRUFBaUMsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxXQUFOLEVBQW1CLE1BQW5CLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsSUFBaEMsQ0FBakMsQ0F4RUEsQ0FBQTtBQUFBLElBeUVBLGtCQUFBLEdBQXFCLFVBQVUsQ0FBQyx3QkFBWCxDQUFvQyxRQUFwQyxDQXpFckIsQ0FBQTtBQUFBLElBMEVBLE9BQUEsQ0FBUSxxQkFBUixFQUErQixrQkFBa0IsQ0FBQyxJQUFsRCxDQTFFQSxDQUFBO0FBQUEsSUE2RUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0E3RVAsQ0FBQTtBQUFBLElBZ0ZBLGVBQUEsR0FBa0IscUVBQWtCLFdBQWxCLENBQThCLENBQUMsV0FBL0IsQ0FBQSxDQUE0QyxDQUFDLEtBQTdDLENBQW1ELEdBQW5ELENBQXdELENBQUEsQ0FBQSxDQWhGMUUsQ0FBQTtBQUFBLElBaUZBLFNBQUEsQ0FBVSxDQUFWLEVBQWEsd0JBQWIsQ0FqRkEsQ0FBQTtBQUFBLElBa0ZBLE9BQUEsQ0FBUSxJQUFSLEVBQWUsT0FBQSxHQUFPLGVBQVAsR0FBdUIsSUFBdkIsR0FBMkIsSUFBM0IsR0FBZ0MsT0FBL0MsQ0FsRkEsQ0FBQTtBQUFBLElBb0ZBLFNBQUEsQ0FBVSxDQUFWLEVBQWEsa0JBQWIsQ0FwRkEsQ0FBQTtBQUFBLElBcUZBLE9BQUEsQ0FBUSxJQUFSLEVBQ0Usb0NBQUEsR0FDQSxDQUFDLFdBQUEsR0FBVSxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGVBQWhCLENBQWYsRUFBaUQsTUFBakQsRUFBNEQsQ0FBNUQsQ0FBRCxDQUFWLEdBQTBFLE9BQTNFLENBRkYsQ0FyRkEsQ0FBQTtBQUFBLElBMEZBLFNBQUEsQ0FBVSxDQUFWLEVBQWEsd0JBQWIsQ0ExRkEsQ0FBQTtBQUFBLElBNEZBLFVBQUEsR0FBYSxVQUFVLENBQUMsaUJBQVgsQ0FBNkIsUUFBN0IsRUFBdUMsTUFBdkMsQ0E1RmIsQ0FBQTtXQThGQSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQVosQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLFVBQUQsR0FBQTtBQUVKLFVBQUEsZ0tBQUE7QUFBQSxNQUNJLDZCQURKLEVBRUksNkJBRkosRUFHSSwyQkFISixFQUlJLG1DQUpKLENBQUE7QUFBQSxNQU1BLGNBQUEsR0FBaUIsVUFBVyxTQU41QixDQUFBO0FBQUEsTUFRQSxxQkFBQSxHQUF3QixVQUFVLENBQUMscUJBQVgsQ0FBaUMsVUFBakMsRUFBNkMsUUFBN0MsQ0FSeEIsQ0FBQTtBQVVBLE1BQUEsSUFBRyxrQkFBSDtBQUNFLFFBQUEsWUFBQSxHQUFlLFVBQVUsQ0FBQyxnQkFBWCxDQUE0QixrQkFBNUIsRUFBZ0QsUUFBUSxDQUFDLElBQXpELEVBQStELHFCQUEvRCxDQUFmLENBREY7T0FWQTtBQUFBLE1BaUJBLE9BQUEsQ0FBUSxnQkFBUixFQUEwQixJQUFBLEdBQzFCLHFDQUQwQixHQUUxQixDQUFDLFdBQUEsR0FBVSxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsYUFBZixFQUE4QixNQUE5QixFQUF5QyxDQUF6QyxDQUFELENBQVYsR0FBdUQsT0FBeEQsQ0FGQSxDQWpCQSxDQUFBO0FBQUEsTUFvQkEsT0FBQSxDQUFRLGdCQUFSLEVBQTBCLElBQUEsR0FDMUIsK0NBRDBCLEdBRTFCLENBQUMsV0FBQSxHQUFVLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxhQUFmLEVBQThCLE1BQTlCLEVBQXlDLENBQXpDLENBQUQsQ0FBVixHQUF1RCxPQUF4RCxDQUZBLENBcEJBLENBQUE7QUFBQSxNQXVCQSxPQUFBLENBQVEsY0FBUixFQUF3QixJQUFBLEdBQ3hCLENBQUMsZ0JBQUEsR0FBZSxDQUFDLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBVSxDQUFDLFdBQVgsQ0FBQSxDQUFiLEVBQXVDLGVBQXZDLENBQUQsQ0FBZixHQUF3RSxLQUF6RSxDQUR3QixHQUV4QixDQUFDLFdBQUEsR0FBVSxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsV0FBZixFQUE0QixNQUE1QixFQUF1QyxDQUF2QyxDQUFELENBQVYsR0FBcUQsT0FBdEQsQ0FGQSxDQXZCQSxDQUFBO0FBQUEsTUEwQkEsT0FBQSxDQUFRLHNCQUFSLEVBQWdDLElBQUEsR0FDaEMsOERBRGdDLEdBRWhDLENBQUMsV0FBQSxHQUFVLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxtQkFBZixFQUFvQyxNQUFwQyxFQUErQyxDQUEvQyxDQUFELENBQVYsR0FBNkQsT0FBOUQsQ0FGQSxDQTFCQSxDQUFBO0FBQUEsTUE2QkEsT0FBQSxDQUFRLGlCQUFSLEVBQTJCLElBQUEsR0FDM0IsQ0FBQyw4REFBQSxHQUE2RCxDQUFDLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFELENBQTdELEdBQXFGLDBCQUF0RixDQUQyQixHQUUzQixDQUFDLFdBQUEsR0FBVSxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsY0FBZixFQUErQixNQUEvQixFQUEwQyxDQUExQyxDQUFELENBQVYsR0FBd0QsT0FBekQsQ0FGQSxDQTdCQSxDQUFBO0FBQUEsTUFnQ0EsT0FBQSxDQUFRLHlCQUFSLEVBQW1DLElBQUEsR0FDbkMsaUZBRG1DLEdBRW5DLENBQUMsV0FBQSxHQUFVLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxxQkFBZixFQUFzQyxNQUF0QyxFQUFpRCxDQUFqRCxDQUFELENBQVYsR0FBK0QsT0FBaEUsQ0FGQSxDQWhDQSxDQUFBO0FBbUNBLE1BQUEsSUFBRyxrQkFBSDtBQUNFLFFBQUEsU0FBQSxDQUFVLENBQVYsRUFBYSxlQUFiLENBQUEsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxDQUFRLElBQVIsRUFDRSx3REFBQSxHQUNBLENBQUMsV0FBQSxHQUFVLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxZQUFmLEVBQTZCLE1BQTdCLEVBQXdDLENBQXhDLENBQUQsQ0FBVixHQUFzRCxPQUF2RCxDQUZGLENBREEsQ0FERjtPQW5DQTtBQUFBLE1BMENBLElBQUEsR0FBTyxFQTFDUCxDQUFBO0FBQUEsTUEyQ0EsZ0JBQUEsR0FBdUIsSUFBQSxNQUFBLENBQU8sZ0JBQVAsQ0EzQ3ZCLENBQUE7QUFBQSxNQTRDQSxZQUFBLEdBQWUsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsU0FBQyxHQUFELEdBQUE7QUFFOUIsWUFBQSxHQUFBO0FBQUEsUUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQVgsQ0FBQTtlQUNBLElBQUEsSUFBUSxHQUFHLENBQUMsT0FBSixDQUFZLGdCQUFaLEVBQThCLFNBQUMsQ0FBRCxFQUFHLENBQUgsR0FBQTtBQUNwQyxjQUFBLE9BQUE7QUFBQSxVQUFBLENBQUEsR0FBSSxDQUFDLENBQUMsS0FBRixDQUFRLEdBQVIsQ0FBSixDQUFBO0FBQUEsVUFDQSxDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxlQUFWLENBREosQ0FBQTtBQUFBLFVBRUEsQ0FBQSxHQUFJLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBQSxHQUFFLENBQVYsQ0FBWSxDQUFDLElBQWIsQ0FBa0IsR0FBbEIsQ0FGSixDQUFBO0FBSUEsaUJBQU8sS0FBQSxHQUFNLENBQU4sR0FBUSxHQUFmLENBTG9DO1FBQUEsQ0FBOUIsRUFIc0I7TUFBQSxDQUFqQixDQTVDZixDQUFBO0FBQUEsTUF1REEsRUFBQSxHQUFLLFNBQUMsTUFBRCxHQUFBO0FBQ0gsWUFBQSw4REFBQTtBQUFBLFFBQUEsWUFBWSxDQUFDLE9BQWIsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLFNBQUEsQ0FBVSxDQUFWLEVBQWEsU0FBYixDQURBLENBQUE7QUFBQSxRQUlBLE9BQUEsQ0FBUSwwQkFBUixFQUFxQyxPQUFBLEdBQU8sZUFBUCxHQUF1QixJQUF2QixHQUEyQixNQUEzQixHQUFrQyxPQUF2RSxDQUpBLENBQUE7QUFBQSxRQU1BLE1BQUEsR0FBUyxPQUFBLENBQVEsTUFBUixDQU5ULENBQUE7QUFBQSxRQU9BLElBQUEsR0FBTyxNQUFNLENBQUMsV0FBUCxDQUFtQixRQUFuQixFQUE2QixJQUE3QixFQUNMLE1BREssRUFDRyxVQURILEVBQ2UsWUFEZixDQVBQLENBQUE7QUFBQSxRQVNBLE9BQUEsQ0FBUSw4QkFBUixFQUF5QyxPQUFBLEdBQU8sZUFBUCxHQUF1QixJQUF2QixHQUEyQixJQUEzQixHQUFnQyxPQUF6RSxDQVRBLENBQUE7QUFBQSxRQVdBLFNBQUEsQ0FBVSxDQUFWLEVBQWEsTUFBYixDQVhBLENBQUE7QUFBQSxRQVlBLE9BQUEsQ0FBUSxJQUFSLEVBQWUsT0FBQSxHQUFPLElBQVAsR0FBWSxPQUEzQixDQVpBLENBQUE7QUFBQSxRQWVBLEdBQUEsR0FBTSx3QkFmTixDQUFBO0FBZ0JBLGFBQUEsOENBQUE7K0JBQUE7QUFDRTtBQUFBOzs7YUFBQTtBQUFBLFVBSUEsTUFBQSxHQUFTLElBSlQsQ0FBQTtBQUFBLFVBS0EsTUFBQSxHQUFTLEdBTFQsQ0FBQTtBQUFBLFVBTUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxLQUFQLEdBQWUsQ0FOM0IsQ0FBQTtBQU9BLFVBQUEsSUFBRyxTQUFBLElBQWEsQ0FBaEI7QUFDRSxZQUFBLEdBQUEsSUFBUSxFQUFBLEdBQUUsQ0FBQyxLQUFBLENBQU0sU0FBQSxHQUFVLENBQWhCLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsTUFBeEIsQ0FBRCxDQUFGLEdBQXFDLE1BQXJDLEdBQTRDLElBQTVDLEdBQWdELE1BQU0sQ0FBQyxLQUF2RCxHQUE2RCxNQUE3RCxHQUFrRSxDQUFDLFlBQUEsQ0FBYSxNQUFNLENBQUMsS0FBcEIsQ0FBRCxDQUFsRSxHQUE4RixLQUF0RyxDQURGO1dBUkY7QUFBQSxTQWhCQTtBQUFBLFFBMkJBLFNBQUEsR0FBWSxTQUFTLENBQUMsT0FBVixDQUFrQixLQUFsQixFQUF5QixHQUF6QixDQTNCWixDQUFBO0FBQUEsUUE4QkEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXFCLFNBQXJCLENBOUJBLENBQUE7ZUErQkEsT0FBQSxDQUFRLGlFQUFBLEdBQ1IsK0RBRFEsR0FFUix3REFGUSxHQUdSLHNEQUhRLEdBSVIsNEVBSlEsR0FLUixtRUFMUSxHQU1SLGdFQU5BLEVBaENHO01BQUEsQ0F2REwsQ0FBQTtBQStGQTtlQUNFLFVBQVUsQ0FBQyxRQUFYLENBQW9CLElBQXBCLEVBQTBCLFVBQTFCLEVBQXNDLFdBQXRDLEVBQW1ELFFBQW5ELENBQ0EsQ0FBQyxJQURELENBQ00sRUFETixDQUVBLENBQUMsT0FBRCxDQUZBLENBRU8sRUFGUCxFQURGO09BQUEsY0FBQTtBQUtFLFFBREksVUFDSixDQUFBO0FBQUEsZUFBTyxFQUFBLENBQUcsQ0FBSCxDQUFQLENBTEY7T0FqR0k7SUFBQSxDQUROLEVBaEdNO0VBQUEsQ0EzUVIsQ0FBQTs7QUFBQSxFQXFkQSxlQUFBLEdBQWtCLFNBQUEsR0FBQTtXQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsTUFBRCxHQUFBO0FBQ2hDLFVBQUEsa0JBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxNQUFNLENBQUMsU0FBUCxDQUFBLENBQVQsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxHQUFhLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQUMsSUFBRCxHQUFBO0FBQzVCLFlBQUEsbUdBQUE7QUFBQSxRQURxQyxXQUFSLEtBQUMsSUFDOUIsQ0FBQTs7VUFBQSxPQUFRLE9BQUEsQ0FBUSxNQUFSO1NBQVI7QUFBQSxRQUVBLE9BQUEsR0FBVSxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsSUFGOUIsQ0FBQTtBQUFBLFFBSUEsYUFBQSxHQUFnQixJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FKaEIsQ0FBQTtBQUFBLFFBTUEsYUFBQSxHQUFnQixhQUFhLENBQUMsTUFBZCxDQUFxQixDQUFyQixDQU5oQixDQUFBO0FBQUEsUUFRQSxTQUFBLEdBQVksVUFBVSxDQUFDLFNBQVMsQ0FBQyxZQUFyQixDQUFrQztBQUFBLFVBQUMsU0FBQSxPQUFEO0FBQUEsVUFBVSxTQUFBLEVBQVcsYUFBckI7U0FBbEMsQ0FSWixDQUFBO0FBU0EsUUFBQSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO0FBQ0UsZ0JBQUEsQ0FERjtTQVRBO0FBQUEsUUFZQSxRQUFBLEdBQVcsU0FBVSxDQUFBLENBQUEsQ0FackIsQ0FBQTtBQUFBLFFBY0EsR0FBQSxHQUFPLGdCQUFBLEdBQWdCLFFBQVEsQ0FBQyxTQUF6QixHQUFtQyxtQkFkMUMsQ0FBQTtBQUFBLFFBZUEsY0FBQSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsR0FBaEIsQ0FmakIsQ0FBQTtBQUFBLFFBZ0JBLE1BQU0sQ0FBQyxPQUFQLENBQWUsdUJBQWYsRUFBd0MsR0FBeEMsRUFBNkMsY0FBN0MsQ0FoQkEsQ0FBQTtBQWlCQSxRQUFBLElBQUcsY0FBSDtBQUNFLFVBQUEsUUFBQSxHQUFXLFVBQUEsQ0FBVyxNQUFYLENBQVgsQ0FBQTtBQUFBLFVBQ0EsYUFBQSxHQUFnQixZQUFBLENBQWEsTUFBYixDQURoQixDQUFBO2lCQUVBLGdCQUFBLENBQWlCLFFBQWpCLEVBQTJCLFNBQUEsR0FBQTtBQUN6QixZQUFBLElBQUcsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLEtBQW9CLElBQXZCO0FBQ0UsY0FBQSxNQUFNLENBQUMsTUFBUCxDQUFBLENBQUEsQ0FBQTtBQUFBLGNBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSwwQkFBZixFQUEyQyxRQUEzQyxFQUFvRCxhQUFwRCxDQURBLENBQUE7cUJBS0EsVUFBQSxDQUFXLENBQUUsU0FBQSxHQUFBO0FBQ1gsZ0JBQUEsVUFBQSxDQUFXLE1BQVgsRUFBbUIsUUFBbkIsQ0FBQSxDQUFBO0FBQUEsZ0JBQ0EsWUFBQSxDQUFhLE1BQWIsRUFBcUIsYUFBckIsQ0FEQSxDQURXO2NBQUEsQ0FBRixDQUFYLEVBS0csQ0FMSCxFQU5GO2FBRHlCO1VBQUEsQ0FBM0IsRUFIRjtTQWxCNEI7TUFBQSxDQUFqQixDQURiLENBQUE7YUFxQ0EsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFyQixDQUF5QixVQUF6QixFQXRDZ0M7SUFBQSxDQUFsQyxFQURnQjtFQUFBLENBcmRsQixDQUFBOztBQUFBLEVBOGZBLHFCQUFBLEdBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLG9DQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGVBQWhCLENBQVgsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBWixDQUFzQixlQUF0QixDQURULENBQUE7QUFBQSxJQUVBLGtCQUFBLEdBQXFCLENBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBQyxDQUFDLElBQUYsQ0FBTyxRQUFQLENBQVQsRUFBMkIsU0FBQyxHQUFELEdBQUE7YUFHOUMsTUFBTSxDQUFDLFVBQVcsQ0FBQSxHQUFBLENBQWxCLEtBQTBCLE9BSG9CO0lBQUEsQ0FBM0IsQ0FGckIsQ0FBQTtBQU9BLFdBQU8sa0JBQVAsQ0FSc0I7RUFBQSxDQTlmeEIsQ0FBQTs7QUFBQSxFQXdnQkEsTUFBTSxDQUFDLHVCQUFQLEdBQWlDLFNBQUEsR0FBQTtBQUMvQixRQUFBLGtCQUFBO0FBQUEsSUFBQSxrQkFBQSxHQUFxQixxQkFBQSxDQUFBLENBQXJCLENBQUE7QUFDQSxJQUFBLElBQUcsa0JBQWtCLENBQUMsTUFBbkIsS0FBK0IsQ0FBbEM7YUFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLDREQUE5QixFQUE0RjtBQUFBLFFBQzFGLE1BQUEsRUFBVSxnQ0FBQSxHQUErQixDQUFDLGtCQUFrQixDQUFDLElBQW5CLENBQXdCLElBQXhCLENBQUQsQ0FEaUQ7QUFBQSxRQUUxRixXQUFBLEVBQWMsSUFGNEU7T0FBNUYsRUFERjtLQUYrQjtFQUFBLENBeGdCakMsQ0FBQTs7QUFBQSxFQWdoQkEsTUFBTSxDQUFDLGVBQVAsR0FBeUIsU0FBQSxHQUFBO0FBQ3ZCLFFBQUEsMkNBQUE7QUFBQSxJQUFBLGtCQUFBLEdBQXFCLHFCQUFBLENBQUEsQ0FBckIsQ0FBQTtBQUFBLElBQ0EsVUFBQSxHQUFhLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFEbEMsQ0FBQTtBQUdBLElBQUEsSUFBRyxrQkFBa0IsQ0FBQyxNQUFuQixLQUE2QixDQUFoQzthQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsd0JBQTlCLEVBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxHQUFBLEdBQVUsSUFBQSxNQUFBLENBQVEsR0FBQSxHQUFFLENBQUMsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBRCxDQUFGLEdBQXdCLFFBQWhDLENBQVYsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxrQkFBWixFQUFnQyxDQUFDLENBQUMsR0FBRixDQUFNLGtCQUFOLEVBQTBCLFNBQUMsR0FBRCxHQUFBO0FBQzNFLFlBQUEsQ0FBQTtBQUFBLFFBQUEsQ0FBQSxHQUFJLEdBQUcsQ0FBQyxLQUFKLENBQVUsR0FBVixDQUFKLENBQUE7QUFDQSxRQUFBLElBQUcsQ0FBQSxLQUFLLElBQVI7QUFHRSxpQkFBUSxVQUFBLEdBQVUsR0FBbEIsQ0FIRjtTQUFBLE1BQUE7QUFLRSxpQkFBTyxFQUFBLEdBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBTCxHQUFRLEdBQVIsR0FBVyxDQUFFLENBQUEsQ0FBQSxDQUFwQixDQUxGO1NBRjJFO01BQUEsQ0FBMUIsQ0FBaEMsQ0FBVixDQURULENBQUE7QUFBQSxNQWNBLENBQUMsQ0FBQyxJQUFGLENBQU8sTUFBUCxFQUFlLFNBQUMsSUFBRCxHQUFBO0FBRWIsWUFBQSxnQkFBQTtBQUFBLFFBRmUsZUFBSyxnQkFFcEIsQ0FBQTtBQUFBLFFBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFpQixnQkFBQSxHQUFnQixHQUFqQyxDQUFOLENBQUE7QUFBQSxRQUVBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFpQixnQkFBQSxHQUFnQixNQUFqQyxFQUEyQyxHQUEzQyxDQUZBLENBQUE7ZUFJQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBaUIsZ0JBQUEsR0FBZ0IsR0FBakMsRUFBd0MsTUFBeEMsRUFOYTtNQUFBLENBQWYsQ0FkQSxDQUFBO2FBc0JBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBK0IsaUNBQUEsR0FBZ0MsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixDQUFELENBQS9ELEVBekJGO0tBSnVCO0VBQUEsQ0FoaEJ6QixDQUFBOztBQUFBLEVBK2lCQSxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFDLENBQUMsS0FBRixDQUFRLE9BQUEsQ0FBUSxpQkFBUixDQUFSLEVBQW9DLHNCQUFwQyxDQS9pQmhCLENBQUE7O0FBQUEsRUFnakJBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLFNBQUEsR0FBQTtBQUNoQixJQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLGVBQUEsQ0FBQSxDQUFuQixDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLCtCQUFwQyxFQUFxRSxRQUFyRSxDQUFuQixDQUZBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLGlDQUFwQyxFQUF1RSxLQUF2RSxDQUFuQixDQUhBLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isd0JBQWxCLEVBQTRDLDZCQUE1QyxFQUEyRSxZQUEzRSxDQUFuQixDQUpBLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsNkJBQWxCLEVBQWlELGtDQUFqRCxFQUFxRixpQkFBckYsQ0FBbkIsQ0FMQSxDQUFBO1dBTUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsZ0NBQXBDLEVBQXNFLE1BQU0sQ0FBQyxlQUE3RSxDQUFuQixFQVBnQjtFQUFBLENBaGpCbEIsQ0FBQTs7QUFBQSxFQXlqQkEsTUFBTSxDQUFDLFVBQVAsR0FBb0IsU0FBQSxHQUFBO1dBQ2xCLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLEVBRGtCO0VBQUEsQ0F6akJwQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/beautify.coffee
