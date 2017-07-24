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
          var i, len, paneItem, panes, ref, results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            ref = panes[0].items;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              paneItem = ref[i];
              if (paneItem instanceof TextEditor) {
                results.push(_this.registerEvents(paneItem));
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        };
      })(this));
      return atom.workspace.onDidAddPane((function(_this) {
        return function(observedPane) {
          var i, len, pane, paneItem, panes, results;
          panes = atom.workspace.getPanes();
          results = [];
          for (i = 0, len = panes.length; i < len; i++) {
            pane = panes[i];
            if (pane === observedPane) {
              continue;
            }
            results.push((function() {
              var j, len1, ref, results1;
              ref = pane.items;
              results1 = [];
              for (j = 0, len1 = ref.length; j < len1; j++) {
                paneItem = ref[j];
                if (paneItem instanceof TextEditor) {
                  results1.push(this.registerEvents(paneItem));
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            }).call(_this));
          }
          return results;
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
        scrollViewElement = this.$(textEditorElement).find('.scroll-view');
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
            var allKey, allMarker, key, marker, markerProperties, markers, results;
            if (!_this.isHovering) {
              return;
            }
            markerProperties = {
              containsBufferPosition: event.newBufferPosition
            };
            markers = event.cursor.editor.findMarkers(markerProperties);
            results = [];
            for (key in markers) {
              marker = markers[key];
              results.push((function() {
                var ref, results1;
                ref = this.allMarkers[editor.getLongTitle()];
                results1 = [];
                for (allKey in ref) {
                  allMarker = ref[allKey];
                  if (marker.id === allMarker.id) {
                    this.gotoFromWord(event.cursor.editor, marker.getProperties().term);
                    break;
                  } else {
                    results1.push(void 0);
                  }
                }
                return results1;
              }).call(_this));
            }
            return results;
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
      var ref;
      return ((ref = term.match(this.gotoRegex)) != null ? ref.length : void 0) > 0;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2dvdG8vYWJzdHJhY3QtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUVmLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUVNOzs7K0JBQ0YsVUFBQSxHQUFZOzsrQkFDWixtQkFBQSxHQUFxQjs7K0JBQ3JCLG1CQUFBLEdBQXFCOzsrQkFDckIsT0FBQSxHQUFTOzsrQkFDVCxTQUFBLEdBQVc7OytCQUNYLFFBQUEsR0FBVTs7O0FBRVY7Ozs7OzsrQkFLQSxJQUFBLEdBQU0sU0FBQyxPQUFEO01BQ0YsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsSUFBQyxDQUFBLENBQUQsR0FBSyxPQUFBLENBQVEsUUFBUjtNQUNMLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBQSxDQUFRLDZCQUFSO01BQ1YsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQUFBLENBQVEsWUFBUjtNQUVkLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFFWCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO1VBQzlCLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQUMsS0FBRDttQkFDYixLQUFDLENBQUEsYUFBRCxDQUFlLE1BQWY7VUFEYSxDQUFqQjtVQUdBLEtBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCO2lCQUNBLEtBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCO1FBTDhCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQztNQU9BLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQWYsQ0FBeUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFFBQUQ7VUFDckMs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OzsrQkFLQSxZQUFBLEdBQWMsU0FBQyxNQUFELEdBQUE7OztBQUVkOzs7Ozs7K0JBS0EsYUFBQSxHQUFlLFNBQUMsTUFBRDtNQUNYLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBZDthQUNBLElBQUMsQ0FBQSxlQUFELENBQWlCLE1BQWpCO0lBRlc7OztBQUlmOzs7Ozs7OzsrQkFPQSxvQkFBQSxHQUFzQixTQUFDLEtBQUQ7QUFDbEIsYUFBTyxLQUFLLENBQUM7SUFESzs7O0FBR3RCOzs7Ozs7OzsrQkFPQSxPQUFBLEdBQVMsU0FBQyxJQUFEO0FBQ0wsVUFBQTtBQUFBLDhEQUE2QixDQUFFLGdCQUF4QixHQUFpQztJQURuQzs7O0FBR1Q7Ozs7Ozs7OytCQU9BLGNBQUEsR0FBZ0IsU0FBQyxJQUFELEdBQUE7OztBQUVoQjs7Ozs7OzsrQkFNQSxNQUFBLEdBQVEsU0FBQyxNQUFELEVBQVMsSUFBVDtBQUNKLFVBQUE7TUFBQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBaUMsTUFBakMsRUFBeUMsSUFBekMsRUFBK0MsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBaEIsQ0FBL0M7TUFFakIsSUFBRyxjQUFBLEtBQWtCLElBQXJCO0FBQ0ksZUFBTyxNQURYOzthQUlBLFVBQUEsQ0FBVyxTQUFBO1FBQ1AsTUFBTSxDQUFDLHVCQUFQLENBQStCLGNBQS9CLEVBQStDO1VBQzNDLFVBQUEsRUFBWSxLQUQrQjtTQUEvQztlQUtBLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixNQUFNLENBQUMsK0JBQVAsQ0FBdUMsY0FBdkMsQ0FBOUIsRUFBc0Y7VUFDbEYsTUFBQSxFQUFRLElBRDBFO1NBQXRGO01BTk8sQ0FBWCxFQVNFLEdBVEY7SUFQSTs7Ozs7QUFoTloiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGV4dEVkaXRvcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5TdWJBdG9tID0gcmVxdWlyZSAnc3ViLWF0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cblxuY2xhc3MgQWJzdHJhY3RQcm92aWRlclxuICAgIGFsbE1hcmtlcnM6IFtdXG4gICAgaG92ZXJFdmVudFNlbGVjdG9yczogJydcbiAgICBjbGlja0V2ZW50U2VsZWN0b3JzOiAnJ1xuICAgIG1hbmFnZXI6IHt9XG4gICAgZ290b1JlZ2V4OiAnJ1xuICAgIGp1bXBXb3JkOiAnJ1xuXG4gICAgIyMjKlxuICAgICAqIEluaXRpYWxpc2F0aW9uIG9mIEdvdG9zXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0dvdG9NYW5hZ2VyfSBtYW5hZ2VyIFRoZSBtYW5hZ2VyIHRoYXQgc3RvcmVzIHRoaXMgZ290by4gVXNlZCBtYWlubHkgZm9yIGJhY2t0cmFjayByZWdpc3RlcmluZy5cbiAgICAjIyNcbiAgICBpbml0OiAobWFuYWdlcikgLT5cbiAgICAgICAgQHN1YkF0b20gPSBuZXcgU3ViQXRvbVxuXG4gICAgICAgIEAkID0gcmVxdWlyZSAnanF1ZXJ5J1xuICAgICAgICBAcGFyc2VyID0gcmVxdWlyZSAnLi4vc2VydmljZXMvcGhwLWZpbGUtcGFyc2VyJ1xuICAgICAgICBAZnV6emFsZHJpbiA9IHJlcXVpcmUgJ2Z1enphbGRyaW4nXG5cbiAgICAgICAgQG1hbmFnZXIgPSBtYW5hZ2VyXG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgICAgICBlZGl0b3Iub25EaWRTYXZlIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBAcmVzY2FuTWFya2VycyhlZGl0b3IpXG5cbiAgICAgICAgICAgIEByZWdpc3Rlck1hcmtlcnMgZWRpdG9yXG4gICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgZWRpdG9yXG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAocGFuZUl0ZW0pID0+XG4gICAgICAgICAgICBpZiBwYW5lSXRlbSBpbnN0YW5jZW9mIFRleHRFZGl0b3IgJiYgQGp1bXBXb3JkICE9ICcnICYmIEBqdW1wV29yZCAhPSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICBAanVtcFRvKHBhbmVJdGVtLCBAanVtcFdvcmQpXG4gICAgICAgICAgICAgICAgQGp1bXBXb3JkID0gJydcblxuICAgICAgICAjIFdoZW4geW91IGdvIGJhY2sgdG8gb25seSBoYXZlIDEgcGFuZSB0aGUgZXZlbnRzIGFyZSBsb3N0LCBzbyBuZWVkIHRvIHJlLXJlZ2lzdGVyLlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZERlc3Ryb3lQYW5lIChwYW5lKSA9PlxuICAgICAgICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG5cbiAgICAgICAgICAgIGlmIHBhbmVzLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgZm9yIHBhbmVJdGVtIGluIHBhbmVzWzBdLml0ZW1zXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhbmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIHBhbmVJdGVtXG5cbiAgICAgICAgIyBIYXZpbmcgdG8gcmUtcmVnaXN0ZXIgZXZlbnRzIGFzIHdoZW4gYSBuZXcgcGFuZSBpcyBjcmVhdGVkIHRoZSBvbGQgcGFuZXMgbG9zZSB0aGUgZXZlbnRzLlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZEFkZFBhbmUgKG9ic2VydmVkUGFuZSkgPT5cbiAgICAgICAgICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuXG4gICAgICAgICAgICBmb3IgcGFuZSBpbiBwYW5lc1xuICAgICAgICAgICAgICAgIGlmIHBhbmUgPT0gb2JzZXJ2ZWRQYW5lXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICBmb3IgcGFuZUl0ZW0gaW4gcGFuZS5pdGVtc1xuICAgICAgICAgICAgICAgICAgICBpZiBwYW5lSXRlbSBpbnN0YW5jZW9mIFRleHRFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIEByZWdpc3RlckV2ZW50cyBwYW5lSXRlbVxuXG4gICAgIyMjKlxuICAgICAqIERlYWN0aXZlcyB0aGUgZ290byBmZWF0dXJlLlxuICAgICMjI1xuICAgIGRlYWN0aXZhdGU6ICgpIC0+XG4gICAgICAgIEBzdWJBdG9tLmRpc3Bvc2UoKVxuICAgICAgICBhbGxNYXJrZXJzID0gW11cblxuICAgICMjIypcbiAgICAgKiBHb3RvIGZyb20gdGhlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uIGluIHRoZSBlZGl0b3IuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUZXh0RWRpdG9yIHRvIHB1bGwgdGVybSBmcm9tLlxuICAgICMjI1xuICAgIGdvdG9Gcm9tRWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgICAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5tYXRjaCAvdGV4dC5odG1sLnBocCQvXG4gICAgICAgICAgICBwb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgICAgICB0ZXJtID0gQHBhcnNlci5nZXRGdWxsV29yZEZyb21CdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvc2l0aW9uKVxuXG4gICAgICAgICAgICB0ZXJtUGFydHMgPSB0ZXJtLnNwbGl0KC8oPzpcXC1cXD58OjopLylcbiAgICAgICAgICAgIHRlcm0gPSB0ZXJtUGFydHMucG9wKCkucmVwbGFjZSgnKCcsICcnKVxuXG4gICAgICAgICAgICBAZ290b0Zyb21Xb3JkKGVkaXRvciwgdGVybSlcblxuICAgICMjIypcbiAgICAgKiBHb3RvIGZyb20gdGhlIHRlcm0gZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGV4dEVkaXRvciB0byBzZWFyY2ggZm9yIG5hbWVzcGFjZSBvZiB0ZXJtLlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICAgIHRlcm0gICBUZXJtIHRvIHNlYXJjaCBmb3IuXG4gICAgIyMjXG4gICAgZ290b0Zyb21Xb3JkOiAoZWRpdG9yLCB0ZXJtKSAtPlxuXG4gICAgIyMjKlxuICAgICAqIFJlZ2lzdGVycyB0aGUgbW91c2UgZXZlbnRzIGZvciBhbHQtY2xpY2suXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUZXh0RWRpdG9yIHRvIHJlZ2lzdGVyIGV2ZW50cyB0by5cbiAgICAjIyNcbiAgICByZWdpc3RlckV2ZW50czogKGVkaXRvcikgLT5cbiAgICAgICAgaWYgZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUubWF0Y2ggL3RleHQuaHRtbC5waHAkL1xuICAgICAgICAgICAgdGV4dEVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgICAgc2Nyb2xsVmlld0VsZW1lbnQgPSBAJCh0ZXh0RWRpdG9yRWxlbWVudCkuZmluZCgnLnNjcm9sbC12aWV3JylcblxuICAgICAgICAgICAgQHN1YkF0b20uYWRkIHNjcm9sbFZpZXdFbGVtZW50LCAnbW91c2Vtb3ZlJywgQGhvdmVyRXZlbnRTZWxlY3RvcnMsIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIGV2ZW50LmFsdEtleVxuXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBAZ2V0U2VsZWN0b3JGcm9tRXZlbnQoZXZlbnQpXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIHNlbGVjdG9yXG5cbiAgICAgICAgICAgICAgICBAJChzZWxlY3RvcikuY3NzKCdib3JkZXItYm90dG9tJywgJzFweCBzb2xpZCAnICsgQCQoc2VsZWN0b3IpLmNzcygnY29sb3InKSlcbiAgICAgICAgICAgICAgICBAJChzZWxlY3RvcikuY3NzKCdjdXJzb3InLCAncG9pbnRlcicpXG5cbiAgICAgICAgICAgICAgICBAaXNIb3ZlcmluZyA9IHRydWVcblxuICAgICAgICAgICAgQHN1YkF0b20uYWRkIHNjcm9sbFZpZXdFbGVtZW50LCAnbW91c2VvdXQnLCBAaG92ZXJFdmVudFNlbGVjdG9ycywgKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGlzSG92ZXJpbmdcblxuICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gQGdldFNlbGVjdG9yRnJvbUV2ZW50KGV2ZW50KVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBzZWxlY3RvclxuXG4gICAgICAgICAgICAgICAgQCQoc2VsZWN0b3IpLmNzcygnYm9yZGVyLWJvdHRvbScsICcnKVxuICAgICAgICAgICAgICAgIEAkKHNlbGVjdG9yKS5jc3MoJ2N1cnNvcicsICcnKVxuXG4gICAgICAgICAgICAgICAgQGlzSG92ZXJpbmcgPSBmYWxzZVxuXG4gICAgICAgICAgICBAc3ViQXRvbS5hZGQgc2Nyb2xsVmlld0VsZW1lbnQsICdjbGljaycsIEBjbGlja0V2ZW50U2VsZWN0b3JzLCAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBAZ2V0U2VsZWN0b3JGcm9tRXZlbnQoZXZlbnQpXG5cbiAgICAgICAgICAgICAgICBpZiBzZWxlY3RvciA9PSBudWxsIHx8IGV2ZW50LmFsdEtleSA9PSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgICAgICAgIGlmIGV2ZW50LmhhbmRsZWQgIT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBAZ290b0Zyb21Xb3JkKGVkaXRvciwgQCQoc2VsZWN0b3IpLnRleHQoKSlcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuaGFuZGxlZCA9IHRydWVcblxuICAgICAgICAgICAgIyBUaGlzIGlzIG5lZWRlZCB0byBiZSBhYmxlIHRvIGFsdC1jbGljayBjbGFzcyBuYW1lcyBpbnNpZGUgY29tbWVudHMgKGRvY2Jsb2NrcykuXG4gICAgICAgICAgICBlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbiAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBAaXNIb3ZlcmluZ1xuXG4gICAgICAgICAgICAgICAgbWFya2VyUHJvcGVydGllcyA9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5zQnVmZmVyUG9zaXRpb246IGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uXG5cbiAgICAgICAgICAgICAgICBtYXJrZXJzID0gZXZlbnQuY3Vyc29yLmVkaXRvci5maW5kTWFya2VycyBtYXJrZXJQcm9wZXJ0aWVzXG5cbiAgICAgICAgICAgICAgICBmb3Iga2V5LG1hcmtlciBvZiBtYXJrZXJzXG4gICAgICAgICAgICAgICAgICAgIGZvciBhbGxLZXksYWxsTWFya2VyIG9mIEBhbGxNYXJrZXJzW2VkaXRvci5nZXRMb25nVGl0bGUoKV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG1hcmtlci5pZCA9PSBhbGxNYXJrZXIuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZ290b0Zyb21Xb3JkKGV2ZW50LmN1cnNvci5lZGl0b3IsIG1hcmtlci5nZXRQcm9wZXJ0aWVzKCkudGVybSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgIyMjKlxuICAgICAqIFJlZ2lzdGVyIGFueSBtYXJrZXJzIHRoYXQgeW91IG5lZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUaGUgZWRpdG9yIHRvIHNlYXJjaCB0aHJvdWdoLlxuICAgICMjI1xuICAgIHJlZ2lzdGVyTWFya2VyczogKGVkaXRvcikgLT5cblxuICAgICMjIypcbiAgICAgKiBSZW1vdmVzIGFueSBtYXJrZXJzIHByZXZpb3VzbHkgY3JlYXRlZCBieSByZWdpc3Rlck1hcmtlcnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciBUaGUgZWRpdG9yIHRvIHNlYXJjaCB0aHJvdWdoLlxuICAgICMjI1xuICAgIGNsZWFuTWFya2VyczogKGVkaXRvcikgLT5cblxuICAgICMjIypcbiAgICAgKiBSZXNjYW5zIHRoZSBlZGl0b3IsIHVwZGF0aW5nIGFsbCBtYXJrZXJzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGhlIGVkaXRvciB0byBzZWFyY2ggdGhyb3VnaC5cbiAgICAjIyNcbiAgICByZXNjYW5NYXJrZXJzOiAoZWRpdG9yKSAtPlxuICAgICAgICBAY2xlYW5NYXJrZXJzKGVkaXRvcilcbiAgICAgICAgQHJlZ2lzdGVyTWFya2VycyhlZGl0b3IpXG5cbiAgICAjIyMqXG4gICAgICogR2V0cyB0aGUgY29ycmVjdCBzZWxlY3RvciB3aGVuIGEgc2VsZWN0b3IgaXMgY2xpY2tlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge2pRdWVyeS5FdmVudH0gZXZlbnQgQSBqUXVlcnkgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R8bnVsbH0gQSBzZWxlY3RvciB0byBiZSB1c2VkIHdpdGggalF1ZXJ5LlxuICAgICMjI1xuICAgIGdldFNlbGVjdG9yRnJvbUV2ZW50OiAoZXZlbnQpIC0+XG4gICAgICAgIHJldHVybiBldmVudC5jdXJyZW50VGFyZ2V0XG5cbiAgICAjIyMqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgZ290byBpcyBhYmxlIHRvIGp1bXAgdXNpbmcgdGhlIHRlcm0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRlcm0gVGVybSB0byBjaGVjay5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgYSBqdW1wIGlzIHBvc3NpYmxlLlxuICAgICMjI1xuICAgIGNhbkdvdG86ICh0ZXJtKSAtPlxuICAgICAgICByZXR1cm4gdGVybS5tYXRjaChAZ290b1JlZ2V4KT8ubGVuZ3RoID4gMFxuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIHJlZ2V4IHVzZWQgd2hlbiBsb29raW5nIGZvciBhIHdvcmQgd2l0aGluIHRoZSBlZGl0b3IuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGVybSBUZXJtIGJlaW5nIHNlYXJjaC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3JlZ2V4fSBSZWdleCB0byBiZSB1c2VkLlxuICAgICMjI1xuICAgIGdldEp1bXBUb1JlZ2V4OiAodGVybSkgLT5cblxuICAgICMjIypcbiAgICAgKiBKdW1wcyB0byBhIHdvcmQgd2l0aGluIHRoZSBlZGl0b3JcbiAgICAgKiBAcGFyYW0gIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGhlIGVkaXRvciB0aGF0IGhhcyB0aGUgZnVuY3Rpb24gaW4uXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB3b3JkICAgICAgIFRoZSB3b3JkIHRvIGZpbmQgYW5kIHRoZW4ganVtcCB0by5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSAgICAgICAgICAgV2hldGhlciB0aGUgZmluZGluZyB3YXMgc3VjY2Vzc2Z1bC5cbiAgICAjIyNcbiAgICBqdW1wVG86IChlZGl0b3IsIHdvcmQpIC0+XG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uID0gQHBhcnNlci5maW5kQnVmZmVyUG9zaXRpb25PZldvcmQoZWRpdG9yLCB3b3JkLCBAZ2V0SnVtcFRvUmVnZXgod29yZCkpXG5cbiAgICAgICAgaWYgYnVmZmVyUG9zaXRpb24gPT0gbnVsbFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgIyBTbWFsbCBkZWxheSB0byB3YWl0IGZvciB3aGVuIGEgZWRpdG9yIGlzIGJlaW5nIGNyZWF0ZWQuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgLT5cbiAgICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbiwge1xuICAgICAgICAgICAgICAgIGF1dG9zY3JvbGw6IGZhbHNlXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAjIFNlcGFyYXRlZCB0aGVzZSBhcyB0aGUgYXV0b3Njcm9sbCBvbiBzZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBkaWRuJ3Qgd29yayBhcyB3ZWxsLlxuICAgICAgICAgICAgZWRpdG9yLnNjcm9sbFRvU2NyZWVuUG9zaXRpb24oZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pLCB7XG4gICAgICAgICAgICAgICAgY2VudGVyOiB0cnVlXG4gICAgICAgICAgICB9KVxuICAgICAgICAsIDEwMClcbiJdfQ==
