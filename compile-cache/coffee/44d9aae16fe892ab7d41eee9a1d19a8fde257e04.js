(function() {
  describe('autocomplete provider', function() {
    var autocompleteMain, autocompleteManager, completionDelay, editor, editorView, jasmineContent, pigments, project, _ref;
    _ref = [], completionDelay = _ref[0], editor = _ref[1], editorView = _ref[2], pigments = _ref[3], autocompleteMain = _ref[4], autocompleteManager = _ref[5], jasmineContent = _ref[6], project = _ref[7];
    beforeEach(function() {
      runs(function() {
        var workspaceElement;
        jasmineContent = document.body.querySelector('#jasmine-content');
        atom.config.set('pigments.autocompleteScopes', ['*']);
        atom.config.set('pigments.sourceNames', ['**/*.styl', '**/*.less']);
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmineContent.appendChild(workspaceElement);
      });
      waitsForPromise('autocomplete-plus activation', function() {
        return atom.packages.activatePackage('autocomplete-plus').then(function(pkg) {
          return autocompleteMain = pkg.mainModule;
        });
      });
      waitsForPromise('pigments activation', function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          return pigments = pkg.mainModule;
        });
      });
      runs(function() {
        spyOn(autocompleteMain, 'consumeProvider').andCallThrough();
        return spyOn(pigments, 'provideAutocomplete').andCallThrough();
      });
      waitsForPromise('open sample file', function() {
        return atom.workspace.open('sample.styl').then(function(e) {
          editor = e;
          editor.setText('');
          return editorView = atom.views.getView(editor);
        });
      });
      waitsForPromise('pigments project initialized', function() {
        project = pigments.getProject();
        return project.initialize();
      });
      return runs(function() {
        autocompleteManager = autocompleteMain.autocompleteManager;
        spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
        return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
      });
    });
    describe('writing the name of a color', function() {
      it('returns suggestions for the matching colors', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('border: 1px solid ');
          editor.moveToBottom();
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          var popup, preview;
          popup = editorView.querySelector('.autocomplete-plus');
          expect(popup).toExist();
          expect(popup.querySelector('span.word').textContent).toEqual('base-color');
          preview = popup.querySelector('.color-suggestion-preview');
          expect(preview).toExist();
          return expect(preview.style.background).toEqual('rgb(255, 255, 255)');
        });
      });
      it('replaces the prefix even when it contains a @', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('@');
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          return expect(editor.getText()).not.toContain('@@');
        });
      });
      it('replaces the prefix even when it contains a $', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('$');
          editor.insertText('o');
          editor.insertText('t');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          expect(editor.getText()).toContain('$other-color');
          return expect(editor.getText()).not.toContain('$$');
        });
      });
      return describe('when the extendAutocompleteToColorValue setting is enabled', function() {
        beforeEach(function() {
          return atom.config.set('pigments.extendAutocompleteToColorValue', true);
        });
        describe('with an opaque color', function() {
          return it('displays the color hexadecimal code in the completion item', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('b');
              editor.insertText('a');
              editor.insertText('s');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('base-color');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
        });
        describe('when the autocompleteSuggestionsFromValue setting is enabled', function() {
          beforeEach(function() {
            return atom.config.set('pigments.autocompleteSuggestionsFromValue', true);
          });
          it('suggests color variables from hexadecimal values', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('#');
              editor.insertText('f');
              editor.insertText('f');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          it('suggests color variables from hexadecimal values when in a CSS expression', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('border: 1px solid ');
              editor.moveToBottom();
              editor.insertText('#');
              editor.insertText('f');
              editor.insertText('f');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          it('suggests color variables from rgb values', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('border: 1px solid ');
              editor.moveToBottom();
              editor.insertText('r');
              editor.insertText('g');
              editor.insertText('b');
              editor.insertText('(');
              editor.insertText('2');
              editor.insertText('5');
              editor.insertText('5');
              editor.insertText(',');
              editor.insertText(' ');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          return describe('and when extendAutocompleteToVariables is true', function() {
            beforeEach(function() {
              return atom.config.set('pigments.extendAutocompleteToVariables', true);
            });
            return it('returns suggestions for the matching variable value', function() {
              runs(function() {
                expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
                editor.moveToBottom();
                editor.insertText('border: ');
                editor.moveToBottom();
                editor.insertText('6');
                editor.insertText('p');
                editor.insertText('x');
                editor.insertText(' ');
                return advanceClock(completionDelay);
              });
              waitsFor(function() {
                return autocompleteManager.displaySuggestions.calls.length === 1;
              });
              waitsFor(function() {
                return editorView.querySelector('.autocomplete-plus li') != null;
              });
              return runs(function() {
                var popup;
                popup = editorView.querySelector('.autocomplete-plus');
                expect(popup).toExist();
                expect(popup.querySelector('span.word').textContent).toEqual('button-padding');
                return expect(popup.querySelector('span.right-label').textContent).toEqual('6px 8px');
              });
            });
          });
        });
        return describe('with a transparent color', function() {
          return it('displays the color hexadecimal code in the completion item', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('$');
              editor.insertText('o');
              editor.insertText('t');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('$other-color');
              return expect(popup.querySelector('span.right-label').textContent).toContain('rgba(255,0,0,0.5)');
            });
          });
        });
      });
    });
    describe('writing the name of a non-color variable', function() {
      return it('returns suggestions for the matching variable', function() {
        atom.config.set('pigments.extendAutocompleteToVariables', false);
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('f');
          editor.insertText('o');
          editor.insertText('o');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });
    return describe('when extendAutocompleteToVariables is true', function() {
      beforeEach(function() {
        return atom.config.set('pigments.extendAutocompleteToVariables', true);
      });
      return describe('writing the name of a non-color variable', function() {
        return it('returns suggestions for the matching variable', function() {
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            editor.moveToBottom();
            editor.insertText('b');
            editor.insertText('u');
            editor.insertText('t');
            editor.insertText('t');
            editor.insertText('o');
            editor.insertText('n');
            editor.insertText('-');
            editor.insertText('p');
            return advanceClock(completionDelay);
          });
          waitsFor(function() {
            return autocompleteManager.displaySuggestions.calls.length === 1;
          });
          waitsFor(function() {
            return editorView.querySelector('.autocomplete-plus li') != null;
          });
          return runs(function() {
            var popup;
            popup = editorView.querySelector('.autocomplete-plus');
            expect(popup).toExist();
            expect(popup.querySelector('span.word').textContent).toEqual('button-padding');
            return expect(popup.querySelector('span.right-label').textContent).toEqual('6px 8px');
          });
        });
      });
    });
  });

  describe('autocomplete provider', function() {
    var autocompleteMain, autocompleteManager, completionDelay, editor, editorView, jasmineContent, pigments, project, _ref;
    _ref = [], completionDelay = _ref[0], editor = _ref[1], editorView = _ref[2], pigments = _ref[3], autocompleteMain = _ref[4], autocompleteManager = _ref[5], jasmineContent = _ref[6], project = _ref[7];
    return describe('for sass files', function() {
      beforeEach(function() {
        runs(function() {
          var workspaceElement;
          jasmineContent = document.body.querySelector('#jasmine-content');
          atom.config.set('pigments.autocompleteScopes', ['*']);
          atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.scss']);
          atom.config.set('autocomplete-plus.enableAutoActivation', true);
          completionDelay = 100;
          atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
          completionDelay += 100;
          workspaceElement = atom.views.getView(atom.workspace);
          return jasmineContent.appendChild(workspaceElement);
        });
        waitsForPromise('autocomplete-plus activation', function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(pkg) {
            return autocompleteMain = pkg.mainModule;
          });
        });
        waitsForPromise('pigments activation', function() {
          return atom.packages.activatePackage('pigments').then(function(pkg) {
            return pigments = pkg.mainModule;
          });
        });
        runs(function() {
          spyOn(autocompleteMain, 'consumeProvider').andCallThrough();
          return spyOn(pigments, 'provideAutocomplete').andCallThrough();
        });
        waitsForPromise('open sample file', function() {
          return atom.workspace.open('sample.styl').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(editor);
          });
        });
        waitsForPromise('pigments project initialized', function() {
          project = pigments.getProject();
          return project.initialize();
        });
        return runs(function() {
          autocompleteManager = autocompleteMain.autocompleteManager;
          spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
          return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
        });
      });
      return it('does not display the alternate sass version', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('$');
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor('suggestions displayed callback', function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor('autocomplete lis', function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          var hasAlternate, lis;
          lis = editorView.querySelectorAll('.autocomplete-plus li');
          hasAlternate = Array.prototype.some.call(lis, function(li) {
            return li.querySelector('span.word').textContent === '$base_color';
          });
          return expect(hasAlternate).toBeFalsy();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL3BpZ21lbnRzLXByb3ZpZGVyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxFQUFBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsUUFBQSxtSEFBQTtBQUFBLElBQUEsT0FBa0gsRUFBbEgsRUFBQyx5QkFBRCxFQUFrQixnQkFBbEIsRUFBMEIsb0JBQTFCLEVBQXNDLGtCQUF0QyxFQUFnRCwwQkFBaEQsRUFBa0UsNkJBQWxFLEVBQXVGLHdCQUF2RixFQUF1RyxpQkFBdkcsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsZ0JBQUE7QUFBQSxRQUFBLGNBQUEsR0FBaUIsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFkLENBQTRCLGtCQUE1QixDQUFqQixDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLEVBQStDLENBQUMsR0FBRCxDQUEvQyxDQUZBLENBQUE7QUFBQSxRQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsRUFBd0MsQ0FDdEMsV0FEc0MsRUFFdEMsV0FGc0MsQ0FBeEMsQ0FIQSxDQUFBO0FBQUEsUUFTQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLEVBQTBELElBQTFELENBVEEsQ0FBQTtBQUFBLFFBV0EsZUFBQSxHQUFrQixHQVhsQixDQUFBO0FBQUEsUUFZQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCLEVBQXlELGVBQXpELENBWkEsQ0FBQTtBQUFBLFFBYUEsZUFBQSxJQUFtQixHQWJuQixDQUFBO0FBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/pigments-provider-spec.coffee
