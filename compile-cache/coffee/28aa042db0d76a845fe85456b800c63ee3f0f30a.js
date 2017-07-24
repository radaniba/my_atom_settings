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
    view = atom.views.getView(editor);
    return view.getScrollTop();
  };

  setScrollTop = function(editor, value) {
    var view;
    view = atom.views.getView(editor);
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
    var editor, onSave;
    editor = _arg.editor, onSave = _arg.onSave;
    return new Promise(function(resolve, reject) {
      var allOptions, beautifyCompleted, e, editedFilePath, forceEntireFile, grammarName, isSelection, oldText, text;
      plugin.checkUnsupportedOptions();
      if (path == null) {
        path = require("path");
      }
      forceEntireFile = onSave && atom.config.get("atom-beautify.general.beautifyEntireFileOnSave");
      beautifyCompleted = function(text) {
        var error, origScrollTop, posArray, selectedBufferRange;
        if (text == null) {

        } else if (text instanceof Error) {
          showError(text);
          return reject(text);
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
              return resolve(text);
            }), 0);
          }
        } else {
          error = new Error("Unsupported beautification result '" + text + "'.");
          showError(error);
          return reject(error);
        }
      };
      editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
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
    });
  };

  beautifyFilePath = function(filePath, callback) {
    var $el, cb;
    logger.verbose('beautifyFilePath', filePath);
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
    $el.addClass('beautifying');
    cb = function(err, result) {
      logger.verbose('Cleanup beautifyFilePath', err, result);
      $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
      $el.removeClass('beautifying');
      return callback(err, result);
    };
    if (fs == null) {
      fs = require("fs");
    }
    logger.verbose('readFile', filePath);
    return fs.readFile(filePath, function(err, data) {
      var allOptions, completionFun, e, grammar, grammarName, input;
      logger.verbose('readFile completed', err, filePath);
      if (err) {
        return cb(err);
      }
      input = data != null ? data.toString() : void 0;
      grammar = atom.grammars.selectGrammar(filePath, input);
      grammarName = grammar.name;
      allOptions = beautifier.getOptionsForPath(filePath);
      logger.verbose('beautifyFilePath allOptions', allOptions);
      completionFun = function(output) {
        logger.verbose('beautifyFilePath completionFun', output);
        if (output instanceof Error) {
          return cb(output, null);
        } else if (typeof output === "string") {
          if (output.trim() === '') {
            logger.verbose('beautifyFilePath, output was empty string!');
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
        logger.verbose('beautify', input, allOptions, grammarName, filePath);
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
    var GitHubApi, addHeader, addInfo, allOptions, beautifiers, codeBlockSyntax, debugInfo, editor, filePath, github, grammarName, headers, language, linkifyTitle, open, selectedBeautifier, text, tocEl, _ref;
    open = require("open");
    if (fs == null) {
      fs = require("fs");
    }
    GitHubApi = require("github");
    github = new GitHubApi();
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
    if (!confirm('Are you ready to debug Atom Beautify?\n\n' + 'Warning: This will create an anonymous Gist on GitHub (publically accessible and cannot be easily deleted) ' + 'containing the contents of your active Text Editor.\n' + 'Be sure to delete any private text from your active Text Editor before continuing ' + 'to ensure you are not sharing undesirable private information.')) {
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
        return github.gists.create({
          files: {
            "debug.md": {
              "content": debugInfo
            }
          },
          "public": true,
          description: "Atom-Beautify debugging information"
        }, function(err, res) {
          var body, gistUrl, issueTemplate;
          if (err) {
            return confirm("An error occurred when creating the Gist: " + err);
          } else {
            gistUrl = res.html_url;
            open(gistUrl);
            confirm(("Your Atom Beautify debugging information can be found in the public Gist:\n" + res.html_url + "\n\n") + 'Warning: Be sure to look over the debug info before you send it ' + 'to ensure you are not sharing undesirable private information.\n\n' + 'If you want to delete this anonymous Gist read\n' + 'https://help.github.com/articles/deleting-an-anonymous-gist/');
            if (!confirm("Would you like to create a new Issue on GitHub now?")) {
              return;
            }
            issueTemplate = fs.readFileSync(path.resolve(__dirname, "../ISSUE_TEMPLATE.md")).toString();
            body = issueTemplate.replace("<INSERT GIST HERE>", gistUrl);
            return open("https://github.com/Glavin001/atom-beautify/issues/new?body=" + (encodeURIComponent(body)));
          }
        });
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
      var beautifyOnSaveHandler, disposable, pendingPaths;
      pendingPaths = {};
      beautifyOnSaveHandler = function(_arg) {
        var beautifyOnSave, buffer, fileExtension, filePath, grammar, key, language, languages;
        filePath = _arg.path;
        logger.verbose('Should beautify on this save?');
        if (pendingPaths[filePath]) {
          logger.verbose("Editor with file path " + filePath + " already beautified!");
          return;
        }
        buffer = editor.getBuffer();
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
          logger.verbose('Beautifying file', filePath);
          return beautify({
            editor: editor,
            onSave: true
          }).then(function() {
            logger.verbose('Done beautifying file', filePath);
            if (editor.isAlive() === true) {
              logger.verbose('Saving TextEditor...');
              pendingPaths[filePath] = true;
              editor.save();
              delete pendingPaths[filePath];
              return logger.verbose('Saved TextEditor.');
            }
          })["catch"](function(error) {
            return showError(error);
          });
        }
      };
      disposable = editor.onDidSave(function(_arg) {
        var filePath;
        filePath = _arg.path;
        return beautifyOnSaveHandler({
          path: filePath
        });
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
        detail: "You can open the Atom command palette with `cmd-shift-p` (OSX) or `ctrl-shift-p` (Linux/Windows) in Atom. You have unsupported options: " + (unsupportedOptions.join(', ')),
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmeS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLEVBQUEsWUFBQSxDQUFBO0FBQUEsTUFBQSxnVkFBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsaUJBQVIsQ0FETixDQUFBOztBQUFBLEVBSUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUpoQixDQUFBOztBQUFBLEVBS0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQUxELENBQUE7O0FBQUEsRUFNQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FOSixDQUFBOztBQUFBLEVBT0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxlQUFSLENBUGQsQ0FBQTs7QUFBQSxFQVFBLFVBQUEsR0FBaUIsSUFBQSxXQUFBLENBQUEsQ0FSakIsQ0FBQTs7QUFBQSxFQVNBLHNCQUFBLEdBQXlCLFVBQVUsQ0FBQyxPQVRwQyxDQUFBOztBQUFBLEVBVUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQUEsQ0FBb0IsVUFBcEIsQ0FWVCxDQUFBOztBQUFBLEVBV0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSLENBWFYsQ0FBQTs7QUFBQSxFQWNBLEVBQUEsR0FBSyxJQWRMLENBQUE7O0FBQUEsRUFlQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FmUCxDQUFBOztBQUFBLEVBZ0JBLEtBQUEsR0FBUSxJQWhCUixDQUFBOztBQUFBLEVBaUJBLElBQUEsR0FBTyxJQWpCUCxDQUFBOztBQUFBLEVBa0JBLEtBQUEsR0FBUSxJQWxCUixDQUFBOztBQUFBLEVBbUJBLEdBQUEsR0FBTSxJQW5CTixDQUFBOztBQUFBLEVBb0JBLFdBQUEsR0FBYyxJQXBCZCxDQUFBOztBQUFBLEVBcUJBLFdBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/beautify.coffee
