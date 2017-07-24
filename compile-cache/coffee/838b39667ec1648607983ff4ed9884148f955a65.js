(function() {
  var ColorBufferElement, ColorMarkerElement, mousedown, path, sleep;

  path = require('path');

  require('./helpers/spec-helper');

  mousedown = require('./helpers/events').mousedown;

  ColorBufferElement = require('../lib/color-buffer-element');

  ColorMarkerElement = require('../lib/color-marker-element');

  sleep = function(duration) {
    var t;
    t = new Date();
    return waitsFor(function() {
      return new Date() - t > duration;
    });
  };

  describe('ColorBufferElement', function() {
    var colorBuffer, colorBufferElement, editBuffer, editor, editorElement, isVisible, jasmineContent, jsonFixture, pigments, project, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], colorBuffer = _ref[2], pigments = _ref[3], project = _ref[4], colorBufferElement = _ref[5], jasmineContent = _ref[6];
    isVisible = function(node) {
      return !node.classList.contains('hidden');
    };
    editBuffer = function(text, options) {
      var range;
      if (options == null) {
        options = {};
      }
      if (options.start != null) {
        if (options.end != null) {
          range = [options.start, options.end];
        } else {
          range = [options.start, options.start];
        }
        editor.setSelectedBufferRange(range);
      }
      editor.insertText(text);
      if (!options.noEvent) {
        return advanceClock(500);
      }
    };
    jsonFixture = function(fixture, data) {
      var json, jsonPath;
      jsonPath = path.resolve(__dirname, 'fixtures', fixture);
      json = fs.readFileSync(jsonPath).toString();
      json = json.replace(/#\{(\w+)\}/g, function(m, w) {
        return data[w];
      });
      return JSON.parse(json);
    };
    beforeEach(function() {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      jasmineContent = document.body.querySelector('#jasmine-content');
      jasmineContent.appendChild(workspaceElement);
      atom.config.set('editor.softWrap', true);
      atom.config.set('editor.softWrapAtPreferredLineLength', true);
      atom.config.set('editor.preferredLineLength', 40);
      atom.config.set('pigments.delayBeforeScan', 0);
      atom.config.set('pigments.sourceNames', ['*.styl', '*.less']);
      waitsForPromise(function() {
        return atom.workspace.open('four-variables.styl').then(function(o) {
          editor = o;
          return editorElement = atom.views.getView(editor);
        });
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
    });
    afterEach(function() {
      return colorBuffer != null ? colorBuffer.destroy() : void 0;
    });
    return describe('when an editor is opened', function() {
      beforeEach(function() {
        colorBuffer = project.colorBufferForEditor(editor);
        colorBufferElement = atom.views.getView(colorBuffer);
        return colorBufferElement.attach();
      });
      it('is associated to the ColorBuffer model', function() {
        expect(colorBufferElement).toBeDefined();
        return expect(colorBufferElement.getModel()).toBe(colorBuffer);
      });
      it('attaches itself in the target text editor element', function() {
        expect(colorBufferElement.parentNode).toExist();
        return expect(editorElement.shadowRoot.querySelector('.lines pigments-markers')).toExist();
      });
      describe('when the editor shadow dom setting is not enabled', function() {
        beforeEach(function() {
          editor.destroy();
          atom.config.set('editor.useShadowDOM', false);
          waitsForPromise(function() {
            return atom.workspace.open('four-variables.styl').then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            editorElement = atom.views.getView(editor);
            colorBuffer = project.colorBufferForEditor(editor);
            colorBufferElement = atom.views.getView(colorBuffer);
            return colorBufferElement.attach();
          });
        });
        return it('attaches itself in the target text editor element', function() {
          return expect(colorBufferElement.parentNode).toExist();
        });
      });
      describe('when the color buffer is initialized', function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return colorBuffer.initialize();
          });
        });
        it('creates markers views for every visible buffer marker', function() {
          var marker, markersElements, _i, _len, _results;
          markersElements = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
          expect(markersElements.length).toEqual(3);
          _results = [];
          for (_i = 0, _len = markersElements.length; _i < _len; _i++) {
            marker = markersElements[_i];
            _results.push(expect(marker.getModel()).toBeDefined());
          }
          return _results;
        });
        describe('when the project variables are initialized', function() {
          return it('creates markers for the new valid colors', function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(4);
            });
          });
        });
        describe('when a selection intersects a marker range', function() {
          beforeEach(function() {
            return spyOn(colorBufferElement, 'updateSelections').andCallThrough();
          });
          describe('after the markers views was created', function() {
            beforeEach(function() {
              waitsForPromise(function() {
                return colorBuffer.variablesAvailable();
              });
              runs(function() {
                return editor.setSelectedBufferRange([[2, 12], [2, 14]]);
              });
              return waitsFor(function() {
                return colorBufferElement.updateSelections.callCount > 0;
              });
            });
            return it('hides the intersected marker', function() {
              var markers;
              markers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
              expect(isVisible(markers[0])).toBeTruthy();
              expect(isVisible(markers[1])).toBeTruthy();
              expect(isVisible(markers[2])).toBeTruthy();
              return expect(isVisible(markers[3])).toBeFalsy();
            });
          });
          return describe('before all the markers views was created', function() {
            beforeEach(function() {
              runs(function() {
                return editor.setSelectedBufferRange([[0, 0], [2, 14]]);
              });
              return waitsFor(function() {
                return colorBufferElement.updateSelections.callCount > 0;
              });
            });
            it('hides the existing markers', function() {
              var markers;
              markers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
              expect(isVisible(markers[0])).toBeFalsy();
              expect(isVisible(markers[1])).toBeTruthy();
              return expect(isVisible(markers[2])).toBeTruthy();
            });
            return describe('and the markers are updated', function() {
              beforeEach(function() {
                waitsForPromise('colors available', function() {
                  return colorBuffer.variablesAvailable();
                });
                return waitsFor('last marker visible', function() {
                  var markers;
                  markers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
                  return isVisible(markers[3]);
                });
              });
              return it('hides the created markers', function() {
                var markers;
                markers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker');
                expect(isVisible(markers[0])).toBeFalsy();
                expect(isVisible(markers[1])).toBeTruthy();
                expect(isVisible(markers[2])).toBeTruthy();
                return expect(isVisible(markers[3])).toBeTruthy();
              });
            });
          });
        });
        describe('when a line is edited and gets wrapped', function() {
          var marker;
          marker = null;
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            runs(function() {
              marker = colorBufferElement.usedMarkers[colorBufferElement.usedMarkers.length - 1];
              spyOn(marker, 'render').andCallThrough();
              return editBuffer(new Array(20).join("foo "), {
                start: [1, 0],
                end: [1, 0]
              });
            });
            return waitsFor(function() {
              return marker.render.callCount > 0;
            });
          });
          return it('updates the markers whose screen range have changed', function() {
            return expect(marker.render).toHaveBeenCalled();
          });
        });
        describe('when some markers are destroyed', function() {
          var spy;
          spy = [][0];
          beforeEach(function() {
            var el, _i, _len, _ref1;
            _ref1 = colorBufferElement.usedMarkers;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              el = _ref1[_i];
              spyOn(el, 'release').andCallThrough();
            }
            spy = jasmine.createSpy('did-update');
            colorBufferElement.onDidUpdate(spy);
            editBuffer('', {
              start: [4, 0],
              end: [8, 0]
            });
            return waitsFor(function() {
              return spy.callCount > 0;
            });
          });
          it('releases the unused markers', function() {
            var marker, _i, _len, _ref1, _results;
            expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
            expect(colorBufferElement.usedMarkers.length).toEqual(2);
            expect(colorBufferElement.unusedMarkers.length).toEqual(1);
            _ref1 = colorBufferElement.unusedMarkers;
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              marker = _ref1[_i];
              _results.push(expect(marker.release).toHaveBeenCalled());
            }
            return _results;
          });
          return describe('and then a new marker is created', function() {
            beforeEach(function() {
              editor.moveToBottom();
              editBuffer('\nfoo = #123456\n');
              return waitsFor(function() {
                return colorBufferElement.unusedMarkers.length === 0;
              });
            });
            return it('reuses the previously released marker element', function() {
              expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
              expect(colorBufferElement.usedMarkers.length).toEqual(3);
              return expect(colorBufferElement.unusedMarkers.length).toEqual(0);
            });
          });
        });
        describe('when the current pane is splitted to the right', function() {
          beforeEach(function() {
            var version;
            version = parseFloat(atom.getVersion().split('.').slice(1, 2).join('.'));
            if (version > 5) {
              atom.commands.dispatch(editorElement, 'pane:split-right-and-copy-active-item');
            } else {
              atom.commands.dispatch(editorElement, 'pane:split-right');
            }
            waitsFor('text editor', function() {
              return editor = atom.workspace.getTextEditors()[1];
            });
            waitsFor('color buffer element', function() {
              return colorBufferElement = atom.views.getView(project.colorBufferForEditor(editor));
            });
            return waitsFor('color buffer element markers', function() {
              return colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length;
            });
          });
          return it('should keep all the buffer elements attached', function() {
            var editors;
            editors = atom.workspace.getTextEditors();
            return editors.forEach(function(editor) {
              editorElement = atom.views.getView(editor);
              colorBufferElement = editorElement.shadowRoot.querySelector('pigments-markers');
              expect(colorBufferElement).toExist();
              expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:empty').length).toEqual(0);
            });
          });
        });
        return describe('when the marker type is set to gutter', function() {
          var gutter;
          gutter = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.initialize();
            });
            return runs(function() {
              atom.config.set('pigments.markerType', 'gutter');
              return gutter = editorElement.shadowRoot.querySelector('[gutter-name="pigments-gutter"]');
            });
          });
          it('removes the markers', function() {
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(0);
          });
          it('adds a custom gutter to the text editor', function() {
            return expect(gutter).toExist();
          });
          it('sets the size of the gutter based on the number of markers in the same row', function() {
            return expect(gutter.style.minWidth).toEqual('14px');
          });
          it('adds a gutter decoration for each color marker', function() {
            var decorations;
            decorations = editor.getDecorations().filter(function(d) {
              return d.properties.type === 'gutter';
            });
            return expect(decorations.length).toEqual(3);
          });
          describe('when the variables become available', function() {
            beforeEach(function() {
              return waitsForPromise(function() {
                return colorBuffer.variablesAvailable();
              });
            });
            it('creates decorations for the new valid colors', function() {
              var decorations;
              decorations = editor.getDecorations().filter(function(d) {
                return d.properties.type === 'gutter';
              });
              return expect(decorations.length).toEqual(4);
            });
            return describe('when many markers are added on the same line', function() {
              beforeEach(function() {
                var updateSpy;
                updateSpy = jasmine.createSpy('did-update');
                colorBufferElement.onDidUpdate(updateSpy);
                editor.moveToBottom();
                editBuffer('\nlist = #123456, #987654, #abcdef\n');
                return waitsFor(function() {
                  return updateSpy.callCount > 0;
                });
              });
              it('adds the new decorations to the gutter', function() {
                var decorations;
                decorations = editor.getDecorations().filter(function(d) {
                  return d.properties.type === 'gutter';
                });
                return expect(decorations.length).toEqual(7);
              });
              it('sets the size of the gutter based on the number of markers in the same row', function() {
                return expect(gutter.style.minWidth).toEqual('42px');
              });
              return describe('clicking on a gutter decoration', function() {
                beforeEach(function() {
                  var decoration;
                  project.colorPickerAPI = {
                    open: jasmine.createSpy('color-picker.open')
                  };
                  decoration = editorElement.shadowRoot.querySelector('.pigments-gutter-marker span');
                  return mousedown(decoration);
                });
                it('selects the text in the editor', function() {
                  return expect(editor.getSelectedScreenRange()).toEqual([[0, 13], [0, 17]]);
                });
                return it('opens the color picker', function() {
                  return expect(project.colorPickerAPI.open).toHaveBeenCalled();
                });
              });
            });
          });
          describe('when the marker is changed again', function() {
            beforeEach(function() {
              return atom.config.set('pigments.markerType', 'background');
            });
            it('removes the gutter', function() {
              return expect(editorElement.shadowRoot.querySelector('[gutter-name="pigments-gutter"]')).not.toExist();
            });
            return it('recreates the markers', function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
            });
          });
          return describe('when a new buffer is opened', function() {
            beforeEach(function() {
              waitsForPromise(function() {
                return atom.workspace.open('project/styles/variables.styl').then(function(e) {
                  editor = e;
                  editorElement = atom.views.getView(editor);
                  colorBuffer = project.colorBufferForEditor(editor);
                  return colorBufferElement = atom.views.getView(colorBuffer);
                });
              });
              waitsForPromise(function() {
                return colorBuffer.initialize();
              });
              waitsForPromise(function() {
                return colorBuffer.variablesAvailable();
              });
              return runs(function() {
                return gutter = editorElement.shadowRoot.querySelector('[gutter-name="pigments-gutter"]');
              });
            });
            return it('creates the decorations in the new buffer gutter', function() {
              var decorations;
              decorations = editor.getDecorations().filter(function(d) {
                return d.properties.type === 'gutter';
              });
              return expect(decorations.length).toEqual(10);
            });
          });
        });
      });
      describe('when the editor is moved to another pane', function() {
        var newPane, pane, _ref1;
        _ref1 = [], pane = _ref1[0], newPane = _ref1[1];
        beforeEach(function() {
          pane = atom.workspace.getActivePane();
          newPane = pane.splitDown({
            copyActiveItem: false
          });
          colorBuffer = project.colorBufferForEditor(editor);
          colorBufferElement = atom.views.getView(colorBuffer);
          expect(atom.workspace.getPanes().length).toEqual(2);
          pane.moveItemToPane(editor, newPane, 0);
          return waitsFor(function() {
            return colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length;
          });
        });
        return it('moves the editor with the buffer to the new pane', function() {
          expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker').length).toEqual(3);
          return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:empty').length).toEqual(0);
        });
      });
      describe('when pigments.supportedFiletypes settings is defined', function() {
        var loadBuffer;
        loadBuffer = function(filePath) {
          waitsForPromise(function() {
            return atom.workspace.open(filePath).then(function(o) {
              editor = o;
              editorElement = atom.views.getView(editor);
              colorBuffer = project.colorBufferForEditor(editor);
              colorBufferElement = atom.views.getView(colorBuffer);
              return colorBufferElement.attach();
            });
          });
          waitsForPromise(function() {
            return colorBuffer.initialize();
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        };
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          return waitsForPromise(function() {
            return atom.packages.activatePackage('language-less');
          });
        });
        describe('with the default wildcard', function() {
          beforeEach(function() {
            return atom.config.set('pigments.supportedFiletypes', ['*']);
          });
          return it('supports every filetype', function() {
            loadBuffer('scope-filter.coffee');
            runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            return runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(20);
            });
          });
        });
        describe('with a filetype', function() {
          beforeEach(function() {
            return atom.config.set('pigments.supportedFiletypes', ['coffee']);
          });
          return it('supports the specified file type', function() {
            loadBuffer('scope-filter.coffee');
            runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            return runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
            });
          });
        });
        return describe('with many filetypes', function() {
          beforeEach(function() {
            atom.config.set('pigments.supportedFiletypes', ['coffee']);
            return project.setSupportedFiletypes(['less']);
          });
          it('supports the specified file types', function() {
            loadBuffer('scope-filter.coffee');
            runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(20);
            });
            loadBuffer('four-variables.styl');
            return runs(function() {
              return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
            });
          });
          return describe('with global file types ignored', function() {
            beforeEach(function() {
              atom.config.set('pigments.supportedFiletypes', ['coffee']);
              project.setIgnoreGlobalSupportedFiletypes(true);
              return project.setSupportedFiletypes(['less']);
            });
            return it('supports the specified file types', function() {
              loadBuffer('scope-filter.coffee');
              runs(function() {
                return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
              });
              loadBuffer('project/vendor/css/variables.less');
              runs(function() {
                return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(20);
              });
              loadBuffer('four-variables.styl');
              return runs(function() {
                return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
              });
            });
          });
        });
      });
      describe('when pigments.ignoredScopes settings is defined', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          waitsForPromise(function() {
            return atom.workspace.open('scope-filter.coffee').then(function(o) {
              editor = o;
              editorElement = atom.views.getView(editor);
              colorBuffer = project.colorBufferForEditor(editor);
              colorBufferElement = atom.views.getView(colorBuffer);
              return colorBufferElement.attach();
            });
          });
          return waitsForPromise(function() {
            return colorBuffer.initialize();
          });
        });
        describe('with one filter', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(1);
          });
        });
        describe('with two filters', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\.string', '\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
          });
        });
        describe('with an invalid filter', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\']);
          });
          return it('ignores the filter', function() {
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(2);
          });
        });
        return describe('when the project ignoredScopes is defined', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoredScopes', ['\\.string']);
            return project.setIgnoredScopes(['\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)').length).toEqual(0);
          });
        });
      });
      return describe('when a text editor settings is modified', function() {
        var originalMarkers;
        originalMarkers = [][0];
        beforeEach(function() {
          waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
          return runs(function() {
            originalMarkers = colorBufferElement.shadowRoot.querySelectorAll('pigments-color-marker:not(:empty)');
            spyOn(colorBufferElement, 'updateMarkers').andCallThrough();
            return spyOn(ColorMarkerElement.prototype, 'render').andCallThrough();
          });
        });
        describe('editor.fontSize', function() {
          beforeEach(function() {
            return atom.config.set('editor.fontSize', 20);
          });
          return it('forces an update and a re-render of existing markers', function() {
            var marker, _i, _len, _results;
            expect(colorBufferElement.updateMarkers).toHaveBeenCalled();
            _results = [];
            for (_i = 0, _len = originalMarkers.length; _i < _len; _i++) {
              marker = originalMarkers[_i];
              _results.push(expect(marker.render).toHaveBeenCalled());
            }
            return _results;
          });
        });
        return describe('editor.lineHeight', function() {
          beforeEach(function() {
            return atom.config.set('editor.lineHeight', 20);
          });
          return it('forces an update and a re-render of existing markers', function() {
            var marker, _i, _len, _results;
            expect(colorBufferElement.updateMarkers).toHaveBeenCalled();
            _results = [];
            for (_i = 0, _len = originalMarkers.length; _i < _len; _i++) {
              marker = originalMarkers[_i];
              _results.push(expect(marker.render).toHaveBeenCalled());
            }
            return _results;
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLWJ1ZmZlci1lbGVtZW50LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhEQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsQ0FBUSx1QkFBUixDQURBLENBQUE7O0FBQUEsRUFFQyxZQUFhLE9BQUEsQ0FBUSxrQkFBUixFQUFiLFNBRkQsQ0FBQTs7QUFBQSxFQUlBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSw2QkFBUixDQUpyQixDQUFBOztBQUFBLEVBS0Esa0JBQUEsR0FBcUIsT0FBQSxDQUFRLDZCQUFSLENBTHJCLENBQUE7O0FBQUEsRUFPQSxLQUFBLEdBQVEsU0FBQyxRQUFELEdBQUE7QUFDTixRQUFBLENBQUE7QUFBQSxJQUFBLENBQUEsR0FBUSxJQUFBLElBQUEsQ0FBQSxDQUFSLENBQUE7V0FDQSxRQUFBLENBQVMsU0FBQSxHQUFBO2FBQU8sSUFBQSxJQUFBLENBQUEsQ0FBSixHQUFhLENBQWIsR0FBaUIsU0FBcEI7SUFBQSxDQUFULEVBRk07RUFBQSxDQVBSLENBQUE7O0FBQUEsRUFXQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFFBQUEsbUlBQUE7QUFBQSxJQUFBLE9BQThGLEVBQTlGLEVBQUMsZ0JBQUQsRUFBUyx1QkFBVCxFQUF3QixxQkFBeEIsRUFBcUMsa0JBQXJDLEVBQStDLGlCQUEvQyxFQUF3RCw0QkFBeEQsRUFBNEUsd0JBQTVFLENBQUE7QUFBQSxJQUVBLFNBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTthQUFVLENBQUEsSUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFmLENBQXdCLFFBQXhCLEVBQWQ7SUFBQSxDQUZa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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/color-buffer-element-spec.coffee
