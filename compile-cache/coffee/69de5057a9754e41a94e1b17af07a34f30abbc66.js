(function() {
  var Disposable, Pigments, PigmentsAPI, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, registry, _ref;

  Disposable = require('atom').Disposable;

  Pigments = require('../lib/pigments');

  PigmentsAPI = require('../lib/pigments-api');

  registry = require('../lib/variable-expressions');

  _ref = require('../lib/versions'), SERIALIZE_VERSION = _ref.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = _ref.SERIALIZE_MARKERS_VERSION;

  describe("Pigments", function() {
    var pigments, project, workspaceElement, _ref1;
    _ref1 = [], workspaceElement = _ref1[0], pigments = _ref1[1], project = _ref1[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.styl']);
      atom.config.set('pigments.ignoredNames', []);
      atom.config.set('pigments.ignoredScopes', []);
      atom.config.set('pigments.autocompleteScopes', []);
      registry.createExpression('pigments:txt_vars', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=(?!=)\\s*([^\\n\\r;]*);?$', ['txt']);
      return waitsForPromise({
        label: 'pigments activation'
      }, function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
    });
    afterEach(function() {
      registry.removeExpression('pigments:txt_vars');
      return project != null ? project.destroy() : void 0;
    });
    it('instanciates a ColorProject instance', function() {
      return expect(pigments.getProject()).toBeDefined();
    });
    it('serializes the project', function() {
      var date;
      date = new Date;
      spyOn(pigments.getProject(), 'getTimestamp').andCallFake(function() {
        return date;
      });
      return expect(pigments.serialize()).toEqual({
        project: {
          deserializer: 'ColorProject',
          timestamp: date,
          version: SERIALIZE_VERSION,
          markersVersion: SERIALIZE_MARKERS_VERSION,
          globalSourceNames: ['**/*.sass', '**/*.styl'],
          globalIgnoredNames: [],
          buffers: {}
        }
      });
    });
    describe('when deactivated', function() {
      var colorBuffer, editor, editorElement, _ref2;
      _ref2 = [], editor = _ref2[0], editorElement = _ref2[1], colorBuffer = _ref2[2];
      beforeEach(function() {
        waitsForPromise({
          label: 'text-editor opened'
        }, function() {
          return atom.workspace.open('four-variables.styl').then(function(e) {
            editor = e;
            editorElement = atom.views.getView(e);
            return colorBuffer = project.colorBufferForEditor(editor);
          });
        });
        waitsFor('pigments markers appended to the DOM', function() {
          return editorElement.shadowRoot.querySelector('pigments-markers');
        });
        return runs(function() {
          spyOn(project, 'destroy').andCallThrough();
          spyOn(colorBuffer, 'destroy').andCallThrough();
          return pigments.deactivate();
        });
      });
      it('destroys the pigments project', function() {
        return expect(project.destroy).toHaveBeenCalled();
      });
      it('destroys all the color buffers that were created', function() {
        expect(project.colorBufferForEditor(editor)).toBeUndefined();
        expect(project.colorBuffersByEditorId).toBeNull();
        return expect(colorBuffer.destroy).toHaveBeenCalled();
      });
      return it('destroys the color buffer element that were added to the DOM', function() {
        return expect(editorElement.shadowRoot.querySelector('pigments-markers')).not.toExist();
      });
    });
    describe('pigments:project-settings', function() {
      var item;
      item = null;
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:project-settings');
        return waitsFor('active pane item', function() {
          item = atom.workspace.getActivePaneItem();
          return item != null;
        });
      });
      return it('opens a settings view in the active pane', function() {
        return item.matches('pigments-color-project');
      });
    });
    describe('API provider', function() {
      var buffer, editor, editorElement, service, _ref2;
      _ref2 = [], service = _ref2[0], editor = _ref2[1], editorElement = _ref2[2], buffer = _ref2[3];
      beforeEach(function() {
        waitsForPromise({
          label: 'text-editor opened'
        }, function() {
          return atom.workspace.open('four-variables.styl').then(function(e) {
            editor = e;
            editorElement = atom.views.getView(e);
            return buffer = project.colorBufferForEditor(editor);
          });
        });
        runs(function() {
          return service = pigments.provideAPI();
        });
        return waitsForPromise({
          label: 'project initialized'
        }, function() {
          return project.initialize();
        });
      });
      it('returns an object conforming to the API', function() {
        expect(service instanceof PigmentsAPI).toBeTruthy();
        expect(service.getProject()).toBe(project);
        expect(service.getPalette()).toEqual(project.getPalette());
        expect(service.getPalette()).not.toBe(project.getPalette());
        expect(service.getVariables()).toEqual(project.getVariables());
        return expect(service.getColorVariables()).toEqual(project.getColorVariables());
      });
      return describe('::observeColorBuffers', function() {
        var spy;
        spy = [][0];
        beforeEach(function() {
          spy = jasmine.createSpy('did-create-color-buffer');
          return service.observeColorBuffers(spy);
        });
        it('calls the callback for every existing color buffer', function() {
          expect(spy).toHaveBeenCalled();
          return expect(spy.calls.length).toEqual(1);
        });
        return it('calls the callback on every new buffer creation', function() {
          waitsForPromise({
            label: 'text-editor opened'
          }, function() {
            return atom.workspace.open('buttons.styl');
          });
          return runs(function() {
            return expect(spy.calls.length).toEqual(2);
          });
        });
      });
    });
    describe('color expression consumer', function() {
      var colorBuffer, colorBufferElement, colorProvider, consumerDisposable, editor, editorElement, otherConsumerDisposable, _ref2;
      _ref2 = [], colorProvider = _ref2[0], consumerDisposable = _ref2[1], editor = _ref2[2], editorElement = _ref2[3], colorBuffer = _ref2[4], colorBufferElement = _ref2[5], otherConsumerDisposable = _ref2[6];
      beforeEach(function() {
        return colorProvider = {
          name: 'todo',
          regexpString: 'TODO',
          scopes: ['*'],
          priority: 0,
          handle: function(match, expression, context) {
            return this.red = 255;
          }
        };
      });
      afterEach(function() {
        if (consumerDisposable != null) {
          consumerDisposable.dispose();
        }
        return otherConsumerDisposable != null ? otherConsumerDisposable.dispose() : void 0;
      });
      describe('when consumed before opening a text editor', function() {
        beforeEach(function() {
          consumerDisposable = pigments.consumeColorExpressions(colorProvider);
          waitsForPromise({
            label: 'text-editor opened'
          }, function() {
            return atom.workspace.open('color-consumer-sample.txt').then(function(e) {
              editor = e;
              editorElement = atom.views.getView(e);
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          waitsForPromise({
            label: 'color buffer initialized'
          }, function() {
            return colorBuffer.initialize();
          });
          return waitsForPromise({
            label: 'color buffer variables available'
          }, function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('parses the new expression and renders a color', function() {
          return expect(colorBuffer.getColorMarkers().length).toEqual(1);
        });
        it('returns a Disposable instance', function() {
          return expect(consumerDisposable instanceof Disposable).toBeTruthy();
        });
        return describe('the returned disposable', function() {
          it('removes the provided expression from the registry', function() {
            consumerDisposable.dispose();
            return expect(project.getColorExpressionsRegistry().getExpression('todo')).toBeUndefined();
          });
          return it('triggers an update in the opened editors', function() {
            var updateSpy;
            updateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(updateSpy);
            consumerDisposable.dispose();
            waitsFor('did-update-color-markers event dispatched', function() {
              return updateSpy.callCount > 0;
            });
            return runs(function() {
              return expect(colorBuffer.getColorMarkers().length).toEqual(0);
            });
          });
        });
      });
      describe('when consumed after opening a text editor', function() {
        beforeEach(function() {
          waitsForPromise({
            label: 'text-editor opened'
          }, function() {
            return atom.workspace.open('color-consumer-sample.txt').then(function(e) {
              editor = e;
              editorElement = atom.views.getView(e);
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          waitsForPromise({
            label: 'color buffer initialized'
          }, function() {
            return colorBuffer.initialize();
          });
          return waitsForPromise({
            label: 'color buffer variables available'
          }, function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('triggers an update in the opened editors', function() {
          var updateSpy;
          updateSpy = jasmine.createSpy('did-update-color-markers');
          colorBuffer.onDidUpdateColorMarkers(updateSpy);
          consumerDisposable = pigments.consumeColorExpressions(colorProvider);
          waitsFor('did-update-color-markers event dispatched', function() {
            return updateSpy.callCount > 0;
          });
          runs(function() {
            expect(colorBuffer.getColorMarkers().length).toEqual(1);
            return consumerDisposable.dispose();
          });
          waitsFor('did-update-color-markers event dispatched', function() {
            return updateSpy.callCount > 1;
          });
          return runs(function() {
            return expect(colorBuffer.getColorMarkers().length).toEqual(0);
          });
        });
        return describe('when an array of expressions is passed', function() {
          return it('triggers an update in the opened editors', function() {
            var updateSpy;
            updateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(updateSpy);
            consumerDisposable = pigments.consumeColorExpressions({
              expressions: [colorProvider]
            });
            waitsFor('did-update-color-markers event dispatched', function() {
              return updateSpy.callCount > 0;
            });
            runs(function() {
              expect(colorBuffer.getColorMarkers().length).toEqual(1);
              return consumerDisposable.dispose();
            });
            waitsFor('did-update-color-markers event dispatched', function() {
              return updateSpy.callCount > 1;
            });
            return runs(function() {
              return expect(colorBuffer.getColorMarkers().length).toEqual(0);
            });
          });
        });
      });
      return describe('when the expression matches a variable value', function() {
        beforeEach(function() {
          return waitsForPromise({
            label: 'project initialized'
          }, function() {
            return project.initialize();
          });
        });
        it('detects the new variable as a color variable', function() {
          var variableSpy;
          variableSpy = jasmine.createSpy('did-update-variables');
          project.onDidUpdateVariables(variableSpy);
          atom.config.set('pigments.sourceNames', ['**/*.txt']);
          waitsFor('variables updated', function() {
            return variableSpy.callCount > 1;
          });
          runs(function() {
            expect(project.getVariables().length).toEqual(6);
            expect(project.getColorVariables().length).toEqual(4);
            return consumerDisposable = pigments.consumeColorExpressions(colorProvider);
          });
          waitsFor('variables updated', function() {
            return variableSpy.callCount > 2;
          });
          return runs(function() {
            expect(project.getVariables().length).toEqual(6);
            return expect(project.getColorVariables().length).toEqual(5);
          });
        });
        return describe('and there was an expression that could not be resolved before', function() {
          return it('updates the invalid color as a now valid color', function() {
            var variableSpy;
            variableSpy = jasmine.createSpy('did-update-variables');
            project.onDidUpdateVariables(variableSpy);
            atom.config.set('pigments.sourceNames', ['**/*.txt']);
            waitsFor('variables updated', function() {
              return variableSpy.callCount > 1;
            });
            return runs(function() {
              otherConsumerDisposable = pigments.consumeColorExpressions({
                name: 'bar',
                regexpString: 'baz\\s+(\\w+)',
                handle: function(match, expression, context) {
                  var color, expr, _;
                  _ = match[0], expr = match[1];
                  color = context.readColor(expr);
                  if (context.isInvalid(color)) {
                    return this.invalid = true;
                  }
                  return this.rgba = color.rgba;
                }
              });
              consumerDisposable = pigments.consumeColorExpressions(colorProvider);
              waitsFor('variables updated', function() {
                return variableSpy.callCount > 2;
              });
              runs(function() {
                expect(project.getVariables().length).toEqual(6);
                expect(project.getColorVariables().length).toEqual(6);
                expect(project.getVariableByName('bar').color.invalid).toBeFalsy();
                return consumerDisposable.dispose();
              });
              waitsFor('variables updated', function() {
                return variableSpy.callCount > 3;
              });
              return runs(function() {
                expect(project.getVariables().length).toEqual(6);
                expect(project.getColorVariables().length).toEqual(5);
                return expect(project.getVariableByName('bar').color.invalid).toBeTruthy();
              });
            });
          });
        });
      });
    });
    return describe('variable expression consumer', function() {
      var colorBuffer, colorBufferElement, consumerDisposable, editor, editorElement, variableProvider, _ref2;
      _ref2 = [], variableProvider = _ref2[0], consumerDisposable = _ref2[1], editor = _ref2[2], editorElement = _ref2[3], colorBuffer = _ref2[4], colorBufferElement = _ref2[5];
      beforeEach(function() {
        variableProvider = {
          name: 'todo',
          regexpString: '(TODO):\\s*([^;\\n]+)'
        };
        return waitsForPromise({
          label: 'project initialized'
        }, function() {
          return project.initialize();
        });
      });
      afterEach(function() {
        return consumerDisposable != null ? consumerDisposable.dispose() : void 0;
      });
      it('updates the project variables when consumed', function() {
        var variableSpy;
        variableSpy = jasmine.createSpy('did-update-variables');
        project.onDidUpdateVariables(variableSpy);
        atom.config.set('pigments.sourceNames', ['**/*.txt']);
        waitsFor('variables updated', function() {
          return variableSpy.callCount > 1;
        });
        runs(function() {
          expect(project.getVariables().length).toEqual(6);
          expect(project.getColorVariables().length).toEqual(4);
          return consumerDisposable = pigments.consumeVariableExpressions(variableProvider);
        });
        waitsFor('variables updated after service consumed', function() {
          return variableSpy.callCount > 2;
        });
        runs(function() {
          expect(project.getVariables().length).toEqual(7);
          expect(project.getColorVariables().length).toEqual(4);
          return consumerDisposable.dispose();
        });
        waitsFor('variables updated after service disposed', function() {
          return variableSpy.callCount > 3;
        });
        return runs(function() {
          expect(project.getVariables().length).toEqual(6);
          return expect(project.getColorVariables().length).toEqual(4);
        });
      });
      return describe('when an array of expressions is passed', function() {
        return it('updates the project variables when consumed', function() {
          var previousVariablesCount;
          previousVariablesCount = null;
          atom.config.set('pigments.sourceNames', ['**/*.txt']);
          waitsFor('variables initialized', function() {
            return project.getVariables().length === 45;
          });
          runs(function() {
            return previousVariablesCount = project.getVariables().length;
          });
          waitsFor('variables updated', function() {
            return project.getVariables().length === 6;
          });
          runs(function() {
            expect(project.getVariables().length).toEqual(6);
            expect(project.getColorVariables().length).toEqual(4);
            previousVariablesCount = project.getVariables().length;
            return consumerDisposable = pigments.consumeVariableExpressions({
              expressions: [variableProvider]
            });
          });
          waitsFor('variables updated after service consumed', function() {
            return project.getVariables().length !== previousVariablesCount;
          });
          runs(function() {
            expect(project.getVariables().length).toEqual(7);
            expect(project.getColorVariables().length).toEqual(4);
            previousVariablesCount = project.getVariables().length;
            return consumerDisposable.dispose();
          });
          waitsFor('variables updated after service disposed', function() {
            return project.getVariables().length !== previousVariablesCount;
          });
          return runs(function() {
            expect(project.getVariables().length).toEqual(6);
            return expect(project.getColorVariables().length).toEqual(4);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2FjdGl2YXRpb24tYW5kLWFwaS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrRkFBQTs7QUFBQSxFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxVQUFELENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FGZCxDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUixDQUhYLENBQUE7O0FBQUEsRUFLQSxPQUFpRCxPQUFBLENBQVEsaUJBQVIsQ0FBakQsRUFBQyx5QkFBQSxpQkFBRCxFQUFvQixpQ0FBQSx5QkFMcEIsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTtBQUNuQixRQUFBLDBDQUFBO0FBQUEsSUFBQSxRQUF3QyxFQUF4QyxFQUFDLDJCQUFELEVBQW1CLG1CQUFuQixFQUE2QixrQkFBN0IsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFuQixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEIsQ0FEQSxDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLEVBQXdDLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FBeEMsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDLEVBQXpDLENB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/activation-and-api-spec.coffee
