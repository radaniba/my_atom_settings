(function() {
  var AbstractProvider, SubAtom, TextEditor;

  TextEditor = require('atom').TextEditor;

  SubAtom = require('sub-atom');

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.allMarkers = [];

    AbstractProvider.prototype.hoverEventSelectors = '';

    AbstractProvider.prototype.clickEventSelectors = '';

    AbstractProvider.prototype.manager = {};

    AbstractProvider.prototype.gotoRegex = '';

    AbstractProvider.prototype.jumpWord = '';


    /**
     * Initialisation of Gotos
     *
     * @param {GotoManager} manager The manager that stores this goto. Used mainly for backtrack registering.
     */

    AbstractProvider.prototype.init = function(manager) {
      this.subAtom = new SubAtom;
      this.$ = require('jquery');
      this.parser = require('../services/php-file-parser');
      this.fuzzaldrin = require('fuzzaldrin');
      this.manager = manager;
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          editor.onDidSave(function(event) {
            return _this.rescanMarkers(editor);
          });
          _this.registerMarkers(editor);
          return _this.registerEvents(editor);
        };
      })(this));
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(paneItem) {
          if (paneItem instanceof TextEditor && _this.jumpWord !== '' && _this.jumpWord !== void 0) {
            _this.jumpTo(paneItem, _this.jumpWord);
            return _this.jumpWord = '';
          }
        };
      })(this));
      atom.workspace.onDidDestroyPane((function(_this) {
        return function(pane) {
          var paneItem, panes, _i, _len, _ref, _results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            _ref = panes[0].items;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              paneItem = _ref[_i];
              if (paneItem instanceof TextEditor) {
                _results.push(_this.registerEvents(paneItem));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
      })(this));
      return atom.workspace.onDidAddPane((function(_this) {
        return function(observedPane) {
          var pane, paneItem, panes, _i, _len, _results;
          panes = atom.workspace.getPanes();
          _results = [];
          for (_i = 0, _len = panes.length; _i < _len; _i++) {
            pane = panes[_i];
            if (pane === observedPane) {
              continue;
            }
            _results.push((function() {
              var _j, _len1, _ref, _results1;
              _ref = pane.items;
              _results1 = [];
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                paneItem = _ref[_j];
                if (paneItem instanceof TextEditor) {
                  _results1.push(this.registerEvents(paneItem));
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            }).call(_this));
          }
          return _results;
        };
      })(this));
    };


    /**
     * Deactives the goto feature.
     */

    AbstractProvider.prototype.deactivate = function() {
      var allMarkers;
      this.subAtom.dispose();
      return allMarkers = [];
    };


    /**
     * Goto from the current cursor position in the editor.
     *
     * @param {TextEditor} editor TextEditor to pull term from.
     */

    AbstractProvider.prototype.gotoFromEditor = function(editor) {
      var position, term, termParts;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        position = editor.getCursorBufferPosition();
        term = this.parser.getFullWordFromBufferPosition(editor, position);
        termParts = term.split(/(?:\-\>|::)/);
        term = termParts.pop().replace('(', '');
        return this.gotoFromWord(editor, term);
      }
    };


    /**
     * Goto from the term given.
     *
     * @param  {TextEditor} editor TextEditor to search for namespace of term.
     * @param  {string}     term   Term to search for.
     */

    AbstractProvider.prototype.gotoFromWord = function(editor, term) {};


    /**
     * Registers the mouse events for alt-click.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    AbstractProvider.prototype.registerEvents = function(editor) {
      var scrollViewElement, textEditorElement;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        textEditorElement = atom.views.getView(editor);
        scrollViewElement = this.$(textEditorElement.shadowRoot).find('.scroll-view');
        this.subAtom.add(scrollViewElement, 'mousemove', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            var selector;
            if (!event.altKey) {
              return;
            }
            selector = _this.getSelectorFromEvent(event);
            if (!selector) {
              return;
            }
            _this.$(selector).css('border-bottom', '1px solid ' + _this.$(selector).css('color'));
            _this.$(selector).css('cursor', 'pointer');
            return _this.isHovering = true;
          };
        })(this));
        this.subAtom.add(scrollViewElement, 'mouseout', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            var selector;
            if (!_this.isHovering) {
              return;
            }
            selector = _this.getSelectorFromEvent(event);
            if (!selector) {
              return;
            }
            _this.$(selector).css('border-bottom', '');
            _this.$(selector).css('cursor', '');
            return _this.isHovering = false;
          };
        })(this));
        this.subAtom.add(scrollViewElement, 'click', this.clickEventSelectors, (function(_this) {
          return function(event) {
            var selector;
            selector = _this.getSelectorFromEvent(event);
            if (selector === null || event.altKey === false) {
              return;
            }
            if (event.handled !== true) {
              _this.gotoFromWord(editor, _this.$(selector).text());
              return event.handled = true;
            }
          };
        })(this));
        return editor.onDidChangeCursorPosition((function(_this) {
          return function(event) {
            var allKey, allMarker, key, marker, markerProperties, markers, _results;
            if (!_this.isHovering) {
              return;
            }
            markerProperties = {
              containsBufferPosition: event.newBufferPosition
            };
            markers = event.cursor.editor.findMarkers(markerProperties);
            _results = [];
            for (key in markers) {
              marker = markers[key];
              _results.push((function() {
                var _ref, _results1;
                _ref = this.allMarkers[editor.getLongTitle()];
                _results1 = [];
                for (allKey in _ref) {
                  allMarker = _ref[allKey];
                  if (marker.id === allMarker.id) {
                    this.gotoFromWord(event.cursor.editor, marker.getProperties().term);
                    break;
                  } else {
                    _results1.push(void 0);
                  }
                }
                return _results1;
              }).call(_this));
            }
            return _results;
          };
        })(this));
      }
    };


    /**
     * Register any markers that you need.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.registerMarkers = function(editor) {};


    /**
     * Removes any markers previously created by registerMarkers.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.cleanMarkers = function(editor) {};


    /**
     * Rescans the editor, updating all markers.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.rescanMarkers = function(editor) {
      this.cleanMarkers(editor);
      return this.registerMarkers(editor);
    };


    /**
     * Gets the correct selector when a selector is clicked.
     *
     * @param  {jQuery.Event} event A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */

    AbstractProvider.prototype.getSelectorFromEvent = function(event) {
      return event.currentTarget;
    };


    /**
     * Returns whether this goto is able to jump using the term.
     *
     * @param  {string} term Term to check.
     *
     * @return {boolean} Whether a jump is possible.
     */

    AbstractProvider.prototype.canGoto = function(term) {
      var _ref;
      return ((_ref = term.match(this.gotoRegex)) != null ? _ref.length : void 0) > 0;
    };


    /**
     * Gets the regex used when looking for a word within the editor.
     *
     * @param {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    AbstractProvider.prototype.getJumpToRegex = function(term) {};


    /**
     * Jumps to a word within the editor
     * @param  {TextEditor} editor The editor that has the function in.
     * @param  {string} word       The word to find and then jump to.
     * @return {boolean}           Whether the finding was successful.
     */

    AbstractProvider.prototype.jumpTo = function(editor, word) {
      var bufferPosition;
      bufferPosition = this.parser.findBufferPositionOfWord(editor, word, this.getJumpToRegex(word));
      if (bufferPosition === null) {
        return false;
      }
      return setTimeout(function() {
        editor.setCursorBufferPosition(bufferPosition, {
          autoscroll: false
        });
        return editor.scrollToScreenPosition(editor.screenPositionForBufferPosition(bufferPosition), {
          center: true
        });
      }, 100);
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2dvdG8vYWJzdHJhY3QtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBOztBQUFBLEVBQUMsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQUZWLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUVNO2tDQUNGOztBQUFBLCtCQUFBLFVBQUEsR0FBWSxFQUFaLENBQUE7O0FBQUEsK0JBQ0EsbUJBQUEsR0FBcUIsRUFEckIsQ0FBQTs7QUFBQSwrQkFFQSxtQkFBQSxHQUFxQixFQUZyQixDQUFBOztBQUFBLCtCQUdBLE9BQUEsR0FBUyxFQUhULENBQUE7O0FBQUEsK0JBSUEsU0FBQSxHQUFXLEVBSlgsQ0FBQTs7QUFBQSwrQkFLQSxRQUFBLEdBQVUsRUFMVixDQUFBOztBQU9BO0FBQUE7Ozs7T0FQQTs7QUFBQSwrQkFZQSxJQUFBLEdBQU0sU0FBQyxPQUFELEdBQUE7QUFDRixNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQVgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLENBQUQsR0FBSyxPQUFBLENBQVEsUUFBUixDQUZMLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBQSxDQUFRLDZCQUFSLENBSFYsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQUFBLENBQVEsWUFBUixDQUpkLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FOWCxDQUFBO0FBQUEsTUFRQSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FB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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/goto/abstract-provider.coffee
