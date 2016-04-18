(function() {
  var AbstractProvider, AttachedPopover, SubAtom, TextEditor;

  TextEditor = require('atom').TextEditor;

  SubAtom = require('sub-atom');

  AttachedPopover = require('../services/attached-popover');

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.hoverEventSelectors = '';


    /**
     * Initializes this provider.
     */

    AbstractProvider.prototype.init = function() {
      this.$ = require('jquery');
      this.parser = require('../services/php-file-parser');
      this.subAtom = new SubAtom;
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.registerEvents(editor);
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
     * Deactives the provider.
     */

    AbstractProvider.prototype.deactivate = function() {
      document.removeChild(this.popover);
      this.subAtom.dispose();
      return this.removePopover();
    };


    /**
     * Registers the necessary event handlers.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    AbstractProvider.prototype.registerEvents = function(editor) {
      var scrollViewElement, textEditorElement;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
        textEditorElement = atom.views.getView(editor);
        scrollViewElement = this.$(textEditorElement.shadowRoot).find('.scroll-view');
        this.subAtom.add(scrollViewElement, 'mouseover', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            var cursorPosition, editorViewComponent, selector;
            if (_this.timeout) {
              clearTimeout(_this.timeout);
            }
            selector = _this.getSelectorFromEvent(event);
            if (selector === null) {
              return;
            }
            editorViewComponent = atom.views.getView(editor).component;
            if (editorViewComponent) {
              cursorPosition = editorViewComponent.screenPositionForMouseEvent(event);
              _this.removePopover();
              return _this.showPopoverFor(editor, selector, cursorPosition);
            }
          };
        })(this));
        this.subAtom.add(scrollViewElement, 'mouseout', this.hoverEventSelectors, (function(_this) {
          return function(event) {
            return _this.removePopover();
          };
        })(this));
        editor.onDidDestroy((function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        editor.onDidStopChanging((function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        this.$(textEditorElement.shadowRoot).find('.horizontal-scrollbar').on('scroll', (function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        return this.$(textEditorElement.shadowRoot).find('.vertical-scrollbar').on('scroll', (function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
      }
    };


    /**
     * Shows a popover containing the documentation of the specified element located at the specified location.
     *
     * @param {TextEditor} editor         TextEditor containing the elemment.
     * @param {string}     element        The element to search for.
     * @param {Point}      bufferPosition The cursor location the element is at.
     * @param {int}        delay          How long to wait before the popover shows up.
     * @param {int}        fadeInTime     The amount of time to take to fade in the tooltip.
     */

    AbstractProvider.prototype.showPopoverFor = function(editor, element, bufferPosition, delay, fadeInTime) {
      var popoverElement, term, tooltipText;
      if (delay == null) {
        delay = 500;
      }
      if (fadeInTime == null) {
        fadeInTime = 100;
      }
      term = this.$(element).text();
      tooltipText = this.getTooltipForWord(editor, term, bufferPosition);
      if ((tooltipText != null ? tooltipText.length : void 0) > 0) {
        popoverElement = this.getPopoverElementFromSelector(element);
        this.attachedPopover = new AttachedPopover(popoverElement);
        this.attachedPopover.setText('<div style="margin-top: -1em;">' + tooltipText + '</div>');
        return this.attachedPopover.showAfter(delay, fadeInTime);
      }
    };


    /**
     * Removes the popover, if it is displayed.
     */

    AbstractProvider.prototype.removePopover = function() {
      if (this.attachedPopover) {
        this.attachedPopover.dispose();
        return this.attachedPopover = null;
      }
    };


    /**
     * Retrieves a tooltip for the word given.
     *
     * @param {TextEditor} editor         TextEditor to search for namespace of term.
     * @param {string}     term           Term to search for.
     * @param {Point}      bufferPosition The cursor location the term is at.
     */

    AbstractProvider.prototype.getTooltipForWord = function(editor, term, bufferPosition) {};


    /**
     * Gets the correct selector when a selector is clicked.
     * @param  {jQuery.Event}  event  A jQuery event.
     * @return {object|null}          A selector to be used with jQuery.
     */

    AbstractProvider.prototype.getSelectorFromEvent = function(event) {
      return event.currentTarget;
    };


    /**
     * Gets the correct element to attach the popover to from the retrieved selector.
     * @param  {jQuery.Event}  event  A jQuery event.
     * @return {object|null}          A selector to be used with jQuery.
     */

    AbstractProvider.prototype.getPopoverElementFromSelector = function(selector) {
      return selector;
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Rvb2x0aXAvYWJzdHJhY3QtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNEQUFBOztBQUFBLEVBQUMsYUFBYyxPQUFBLENBQVEsTUFBUixFQUFkLFVBQUQsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUixDQUZWLENBQUE7O0FBQUEsRUFHQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSw4QkFBUixDQUhsQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FFTTtrQ0FDRjs7QUFBQSwrQkFBQSxtQkFBQSxHQUFxQixFQUFyQixDQUFBOztBQUVBO0FBQUE7O09BRkE7O0FBQUEsK0JBS0EsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNGLE1BQUEsSUFBQyxDQUFBLENBQUQsR0FBSyxPQUFBLENBQVEsUUFBUixDQUFMLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBQSxDQUFRLDZCQUFSLENBRFYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUEsT0FIWCxDQUFBO0FBQUEsTUFLQSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtpQkFDOUIsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsRUFEOEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUxBLENBQUE7QUFBQSxNQVNBLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWYsQ0FBZ0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzVCLGNB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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/tooltip/abstract-provider.coffee
