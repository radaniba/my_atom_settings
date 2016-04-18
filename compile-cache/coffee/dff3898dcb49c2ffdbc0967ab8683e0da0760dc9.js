(function() {
  var Beautifier, Beautifiers, Languages, Promise, beautifiers, fs, isWindows, path, temp, _;

  Beautifiers = require("../src/beautifiers");

  beautifiers = new Beautifiers();

  Beautifier = require("../src/beautifiers/beautifier");

  Languages = require('../src/languages/');

  _ = require('lodash');

  fs = require('fs');

  path = require('path');

  Promise = require("bluebird");

  temp = require('temp');

  temp.track();

  isWindows = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';

  describe("Atom-Beautify", function() {
    beforeEach(function() {
      return waitsForPromise(function() {
        var activationPromise, pack;
        activationPromise = atom.packages.activatePackage('atom-beautify');
        pack = atom.packages.getLoadedPackage("atom-beautify");
        pack.activateNow();
        return activationPromise;
      });
    });
    afterEach(function() {
      return temp.cleanupSync();
    });
    describe("Beautifiers", function() {
      var beautifier;
      beautifier = null;
      beforeEach(function() {
        return beautifier = new Beautifier();
      });
      return describe("Beautifier::run", function() {
        it("should error when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, p;
            p = beautifier.run("program", []);
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).toBe(void 0, 'Error should not have a description.');
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        it("should error with help description when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, help, p;
            help = {
              link: "http://test.com",
              program: "test-program",
              pathOption: "Lang - Test Program Path"
            };
            p = beautifier.run("program", [], {
              help: help
            });
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).not.toBe(null);
              expect(v.description.indexOf(help.link)).not.toBe(-1);
              expect(v.description.indexOf(help.program)).not.toBe(-1);
              expect(v.description.indexOf(help.pathOption)).not.toBe(-1, "Error should have a description.");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        it("should error with Windows-specific help description when beautifier's program not found", function() {
          expect(beautifier).not.toBe(null);
          expect(beautifier instanceof Beautifier).toBe(true);
          return waitsForPromise({
            shouldReject: true
          }, function() {
            var cb, help, p, terminal, whichCmd;
            help = {
              link: "http://test.com",
              program: "test-program",
              pathOption: "Lang - Test Program Path"
            };
            beautifier.isWindows = true;
            terminal = 'CMD prompt';
            whichCmd = "where.exe";
            p = beautifier.run("program", [], {
              help: help
            });
            expect(p).not.toBe(null);
            expect(p instanceof beautifier.Promise).toBe(true);
            cb = function(v) {
              expect(v).not.toBe(null);
              expect(v instanceof Error).toBe(true);
              expect(v.code).toBe("CommandNotFound");
              expect(v.description).not.toBe(null);
              expect(v.description.indexOf(help.link)).not.toBe(-1);
              expect(v.description.indexOf(help.program)).not.toBe(-1);
              expect(v.description.indexOf(help.pathOption)).not.toBe(-1, "Error should have a description.");
              expect(v.description.indexOf(terminal)).not.toBe(-1, "Error should have a description including '" + terminal + "' in message.");
              expect(v.description.indexOf(whichCmd)).not.toBe(-1, "Error should have a description including '" + whichCmd + "' in message.");
              return v;
            };
            p.then(cb, cb);
            return p;
          });
        });
        if (!isWindows) {
          return it("should error with Mac/Linux-specific help description when beautifier's program not found", function() {
            expect(beautifier).not.toBe(null);
            expect(beautifier instanceof Beautifier).toBe(true);
            return waitsForPromise({
              shouldReject: true
            }, function() {
              var cb, help, p, terminal, whichCmd;
              help = {
                link: "http://test.com",
                program: "test-program",
                pathOption: "Lang - Test Program Path"
              };
              beautifier.isWindows = false;
              terminal = "Terminal";
              whichCmd = "which";
              p = beautifier.run("program", [], {
                help: help
              });
              expect(p).not.toBe(null);
              expect(p instanceof beautifier.Promise).toBe(true);
              cb = function(v) {
                expect(v).not.toBe(null);
                expect(v instanceof Error).toBe(true);
                expect(v.code).toBe("CommandNotFound");
                expect(v.description).not.toBe(null);
                expect(v.description.indexOf(help.link)).not.toBe(-1);
                expect(v.description.indexOf(help.program)).not.toBe(-1);
                expect(v.description.indexOf(terminal)).not.toBe(-1, "Error should have a description including '" + terminal + "' in message.");
                expect(v.description.indexOf(whichCmd)).not.toBe(-1, "Error should have a description including '" + whichCmd + "' in message.");
                return v;
              };
              p.then(cb, cb);
              return p;
            });
          });
        }
      });
    });
    return describe("Options", function() {
      var beautifier, beautifyEditor, editor, workspaceElement;
      editor = null;
      beautifier = null;
      workspaceElement = atom.views.getView(atom.workspace);
      beforeEach(function() {
        beautifier = new Beautifiers();
        return waitsForPromise(function() {
          return atom.workspace.open().then(function(e) {
            editor = e;
            return expect(editor.getText()).toEqual("");
          });
        });
      });
      describe("Migrate Settings", function() {
        var migrateSettings;
        migrateSettings = function(beforeKey, afterKey, val) {
          atom.config.set("atom-beautify." + beforeKey, val);
          atom.commands.dispatch(workspaceElement, "atom-beautify:migrate-settings");
          expect(_.has(atom.config.get('atom-beautify'), beforeKey)).toBe(false);
          return expect(atom.config.get("atom-beautify." + afterKey)).toBe(val);
        };
        it("should migrate js_indent_size to js.indent_size", function() {
          return migrateSettings("js_indent_size", "js.indent_size", 10);
        });
        it("should migrate analytics to general.analytics", function() {
          return migrateSettings("analytics", "general.analytics", true);
        });
        return it("should migrate _analyticsUserId to general._analyticsUserId", function() {
          return migrateSettings("_analyticsUserId", "general._analyticsUserId", "userid");
        });
      });
      beautifyEditor = function(callback) {
        var beforeText, delay, isComplete;
        isComplete = false;
        beforeText = null;
        delay = 500;
        runs(function() {
          beforeText = editor.getText();
          atom.commands.dispatch(workspaceElement, "atom-beautify:beautify-editor");
          return setTimeout(function() {
            return isComplete = true;
          }, delay);
        });
        waitsFor(function() {
          return isComplete;
        });
        return runs(function() {
          var afterText;
          afterText = editor.getText();
          expect(typeof beforeText).toBe('string');
          expect(typeof afterText).toBe('string');
          return callback(beforeText, afterText);
        });
      };
      return describe("JavaScript", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            var packName;
            packName = 'language-javascript';
            return atom.packages.activatePackage(packName);
          });
          return runs(function() {
            var code, grammar;
            code = "var hello='world';function(){console.log('hello '+hello)}";
            editor.setText(code);
            grammar = atom.grammars.selectGrammar('source.js');
            expect(grammar.name).toBe('JavaScript');
            editor.setGrammar(grammar);
            expect(editor.getGrammar().name).toBe('JavaScript');
            return jasmine.unspy(window, 'setTimeout');
          });
        });
        describe(".jsbeautifyrc", function() {
          return it("should look at directories above file", function() {
            var cb, isDone;
            isDone = false;
            cb = function(err) {
              isDone = true;
              return expect(err).toBe(void 0);
            };
            runs(function() {
              var err;
              try {
                return temp.mkdir('dir1', function(err, dirPath) {
                  var myData, myData1, rcPath;
                  if (err) {
                    return cb(err);
                  }
                  rcPath = path.join(dirPath, '.jsbeautifyrc');
                  myData1 = {
                    indent_size: 1,
                    indent_char: '\t'
                  };
                  myData = JSON.stringify(myData1);
                  return fs.writeFile(rcPath, myData, function(err) {
                    if (err) {
                      return cb(err);
                    }
                    dirPath = path.join(dirPath, 'dir2');
                    return fs.mkdir(dirPath, function(err) {
                      var myData2;
                      if (err) {
                        return cb(err);
                      }
                      rcPath = path.join(dirPath, '.jsbeautifyrc');
                      myData2 = {
                        indent_size: 2,
                        indent_char: ' '
                      };
                      myData = JSON.stringify(myData2);
                      return fs.writeFile(rcPath, myData, function(err) {
                        if (err) {
                          return cb(err);
                        }
                        return Promise.all(beautifier.getOptionsForPath(rcPath, null)).then(function(allOptions) {
                          var config1, config2, configOptions, editorConfigOptions, editorOptions, homeOptions, projectOptions, _ref;
                          editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
                          projectOptions = allOptions.slice(4);
                          _ref = projectOptions.slice(-2), config1 = _ref[0], config2 = _ref[1];
                          expect(_.get(config1, '_default.indent_size')).toBe(myData1.indent_size);
                          expect(_.get(config2, '_default.indent_size')).toBe(myData2.indent_size);
                          expect(_.get(config1, '_default.indent_char')).toBe(myData1.indent_char);
                          expect(_.get(config2, '_default.indent_char')).toBe(myData2.indent_char);
                          return cb();
                        });
                      });
                    });
                  });
                });
              } catch (_error) {
                err = _error;
                return cb(err);
              }
            });
            return waitsFor(function() {
              return isDone;
            });
          });
        });
        return describe("Package settings", function() {
          var getOptions;
          getOptions = function(callback) {
            var options;
            options = null;
            waitsForPromise(function() {
              var allOptions;
              allOptions = beautifier.getOptionsForPath(null, null);
              return Promise.all(allOptions).then(function(allOptions) {
                return options = allOptions;
              });
            });
            return runs(function() {
              return callback(options);
            });
          };
          it("should change indent_size to 1", function() {
            atom.config.set('atom-beautify.js.indent_size', 1);
            return getOptions(function(allOptions) {
              var configOptions;
              expect(typeof allOptions).toBe('object');
              configOptions = allOptions[1];
              expect(typeof configOptions).toBe('object');
              expect(configOptions.js.indent_size).toBe(1);
              return beautifyEditor(function(beforeText, afterText) {
                return expect(afterText).toBe("var hello = 'world';\n\nfunction() {\n console.log('hello ' + hello)\n}");
              });
            });
          });
          return it("should change indent_size to 10", function() {
            atom.config.set('atom-beautify.js.indent_size', 10);
            return getOptions(function(allOptions) {
              var configOptions;
              expect(typeof allOptions).toBe('object');
              configOptions = allOptions[1];
              expect(typeof configOptions).toBe('object');
              expect(configOptions.js.indent_size).toBe(10);
              return beautifyEditor(function(beforeText, afterText) {
                return expect(afterText).toBe("var hello = 'world';\n\nfunction() {\n          console.log('hello ' + hello)\n}");
              });
            });
          });
        });
      });
    });
  });

  describe("Languages", function() {
    var languages;
    languages = null;
    beforeEach(function() {
      return languages = new Languages();
    });
    return describe("Languages::namespace", function() {
      return it("should verify that multiple languages do not share the same namespace", function() {
        var namespaceGroups, namespaceOverlap, namespacePairs;
        namespaceGroups = _.groupBy(languages.languages, "namespace");
        namespacePairs = _.toPairs(namespaceGroups);
        namespaceOverlap = _.filter(namespacePairs, function(_arg) {
          var group, namespace;
          namespace = _arg[0], group = _arg[1];
          return group.length > 1;
        });
        return expect(namespaceOverlap.length).toBe(0, "Language namespaces are overlapping.\nNamespaces are unique: only one language for each namespace.\n" + _.map(namespaceOverlap, function(_arg) {
          var group, namespace;
          namespace = _arg[0], group = _arg[1];
          return "- '" + namespace + "': Check languages " + (_.map(group, 'name').join(', ')) + " for using namespace '" + namespace + "'.";
        }).join('\n'));
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NwZWMvYXRvbS1iZWF1dGlmeS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzRkFBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsb0JBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFrQixJQUFBLFdBQUEsQ0FBQSxDQURsQixDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUixDQUZiLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSLENBSFosQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUpKLENBQUE7O0FBQUEsRUFLQSxFQUFBLEdBQU8sT0FBQSxDQUFRLElBQVIsQ0FMUCxDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTlAsQ0FBQTs7QUFBQSxFQU9BLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQVBWLENBQUE7O0FBQUEsRUFRQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FSUCxDQUFBOztBQUFBLEVBU0EsSUFBSSxDQUFDLEtBQUwsQ0FBQSxDQVRBLENBQUE7O0FBQUEsRUFpQkEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLE9BQXBCLElBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFaLEtBQXNCLFFBRFosSUFFVixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQVosS0FBc0IsTUFuQnhCLENBQUE7O0FBQUEsRUFxQkEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO0FBRXhCLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUdULGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO0FB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

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/spec/atom-beautify-spec.coffee
