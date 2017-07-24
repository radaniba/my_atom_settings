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
        scrollViewElement = this.$(textEditorElement).find('.scroll-view');
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
        this.$(textEditorElement).find('.horizontal-scrollbar').on('scroll', (function(_this) {
          return function() {
            return _this.removePopover();
          };
        })(this));
        return this.$(textEditorElement).find('.vertical-scrollbar').on('scroll', (function(_this) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3Rvb2x0aXAvYWJzdHJhY3QtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUVmLE9BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7RUFDVixlQUFBLEdBQWtCLE9BQUEsQ0FBUSw4QkFBUjs7RUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FFTTs7OytCQUNGLG1CQUFBLEdBQXFCOzs7QUFFckI7Ozs7K0JBR0EsSUFBQSxHQUFNLFNBQUE7TUFDRixJQUFDLENBQUEsQ0FBRCxHQUFLLE9BQUEsQ0FBUSxRQUFSO01BQ0wsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFBLENBQVEsNkJBQVI7TUFFVixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFFZixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO2lCQUM5QixLQUFDLENBQUEsY0FBRCxDQUFnQixNQUFoQjtRQUQ4QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEM7TUFJQSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFmLENBQWdDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQzVCLGNBQUE7VUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFmLENBQUE7VUFFUixJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO0FBQ0k7QUFBQTtpQkFBQSxxQ0FBQTs7Y0FDSSxJQUFHLFFBQUEsWUFBb0IsVUFBdkI7NkJBQ0ksS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsUUFBaEIsR0FESjtlQUFBLE1BQUE7cUNBQUE7O0FBREo7MkJBREo7O1FBSDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFB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OztJQURXOzs7QUFLZjs7Ozs7Ozs7K0JBT0EsaUJBQUEsR0FBbUIsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLGNBQWYsR0FBQTs7O0FBRW5COzs7Ozs7K0JBS0Esb0JBQUEsR0FBc0IsU0FBQyxLQUFEO0FBQ2xCLGFBQU8sS0FBSyxDQUFDO0lBREs7OztBQUd0Qjs7Ozs7OytCQUtBLDZCQUFBLEdBQStCLFNBQUMsUUFBRDtBQUMzQixhQUFPO0lBRG9COzs7OztBQW5KbkMiLCJzb3VyY2VzQ29udGVudCI6WyJ7VGV4dEVkaXRvcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5TdWJBdG9tID0gcmVxdWlyZSAnc3ViLWF0b20nXG5BdHRhY2hlZFBvcG92ZXIgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9hdHRhY2hlZC1wb3BvdmVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbmNsYXNzIEFic3RyYWN0UHJvdmlkZXJcbiAgICBob3ZlckV2ZW50U2VsZWN0b3JzOiAnJ1xuXG4gICAgIyMjKlxuICAgICAqIEluaXRpYWxpemVzIHRoaXMgcHJvdmlkZXIuXG4gICAgIyMjXG4gICAgaW5pdDogKCkgLT5cbiAgICAgICAgQCQgPSByZXF1aXJlICdqcXVlcnknXG4gICAgICAgIEBwYXJzZXIgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9waHAtZmlsZS1wYXJzZXInXG5cbiAgICAgICAgQHN1YkF0b20gPSBuZXcgU3ViQXRvbVxuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIGVkaXRvclxuXG4gICAgICAgICMgV2hlbiB5b3UgZ28gYmFjayB0byBvbmx5IGhhdmUgb25lIHBhbmUgdGhlIGV2ZW50cyBhcmUgbG9zdCwgc28gbmVlZCB0byByZS1yZWdpc3Rlci5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZSAocGFuZSkgPT5cbiAgICAgICAgICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuXG4gICAgICAgICAgICBpZiBwYW5lcy5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICAgIGZvciBwYW5lSXRlbSBpbiBwYW5lc1swXS5pdGVtc1xuICAgICAgICAgICAgICAgICAgICBpZiBwYW5lSXRlbSBpbnN0YW5jZW9mIFRleHRFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIEByZWdpc3RlckV2ZW50cyBwYW5lSXRlbVxuXG4gICAgICAgICMgSGF2aW5nIHRvIHJlLXJlZ2lzdGVyIGV2ZW50cyBhcyB3aGVuIGEgbmV3IHBhbmUgaXMgY3JlYXRlZCB0aGUgb2xkIHBhbmVzIGxvc2UgdGhlIGV2ZW50cy5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRBZGRQYW5lIChvYnNlcnZlZFBhbmUpID0+XG4gICAgICAgICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcblxuICAgICAgICAgICAgZm9yIHBhbmUgaW4gcGFuZXNcbiAgICAgICAgICAgICAgICBpZiBwYW5lID09IG9ic2VydmVkUGFuZVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAgICAgZm9yIHBhbmVJdGVtIGluIHBhbmUuaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgaWYgcGFuZUl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgcGFuZUl0ZW1cblxuICAgICMjIypcbiAgICAgKiBEZWFjdGl2ZXMgdGhlIHByb3ZpZGVyLlxuICAgICMjI1xuICAgIGRlYWN0aXZhdGU6ICgpIC0+XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUNoaWxkKEBwb3BvdmVyKVxuICAgICAgICBAc3ViQXRvbS5kaXNwb3NlKClcbiAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgIyMjKlxuICAgICAqIFJlZ2lzdGVycyB0aGUgbmVjZXNzYXJ5IGV2ZW50IGhhbmRsZXJzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgVGV4dEVkaXRvciB0byByZWdpc3RlciBldmVudHMgdG8uXG4gICAgIyMjXG4gICAgcmVnaXN0ZXJFdmVudHM6IChlZGl0b3IpIC0+XG4gICAgICAgIGlmIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLm1hdGNoIC90ZXh0Lmh0bWwucGhwJC9cbiAgICAgICAgICAgIHRleHRFZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgICAgIHNjcm9sbFZpZXdFbGVtZW50ID0gQCQodGV4dEVkaXRvckVsZW1lbnQpLmZpbmQoJy5zY3JvbGwtdmlldycpXG5cbiAgICAgICAgICAgIEBzdWJBdG9tLmFkZCBzY3JvbGxWaWV3RWxlbWVudCwgJ21vdXNlb3ZlcicsIEBob3ZlckV2ZW50U2VsZWN0b3JzLCAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgaWYgQHRpbWVvdXRcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KEB0aW1lb3V0KVxuXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBAZ2V0U2VsZWN0b3JGcm9tRXZlbnQoZXZlbnQpXG5cbiAgICAgICAgICAgICAgICBpZiBzZWxlY3RvciA9PSBudWxsXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICAgICAgZWRpdG9yVmlld0NvbXBvbmVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLmNvbXBvbmVudFxuXG4gICAgICAgICAgICAgICAgIyBUaWNrZXQgIzE0MCAtIEluIHJhcmUgY2FzZXMgdGhlIGNvbXBvbmVudCBpcyBudWxsLlxuICAgICAgICAgICAgICAgIGlmIGVkaXRvclZpZXdDb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yUG9zaXRpb24gPSBlZGl0b3JWaWV3Q29tcG9uZW50LnNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChldmVudClcblxuICAgICAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG4gICAgICAgICAgICAgICAgICAgIEBzaG93UG9wb3ZlckZvcihlZGl0b3IsIHNlbGVjdG9yLCBjdXJzb3JQb3NpdGlvbilcblxuICAgICAgICAgICAgQHN1YkF0b20uYWRkIHNjcm9sbFZpZXdFbGVtZW50LCAnbW91c2VvdXQnLCBAaG92ZXJFdmVudFNlbGVjdG9ycywgKGV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICAgICAgICAgIyBUaWNrZXQgIzEwNyAtIE1vdXNlb3V0IGlzbid0IGdlbmVyYXRlZCB1bnRpbCB0aGUgbW91c2UgbW92ZXMsIGV2ZW4gd2hlbiBzY3JvbGxpbmcgKHdpdGggdGhlIGtleWJvYXJkIG9yXG4gICAgICAgICAgICAjIG1vdXNlKS4gSWYgdGhlIGVsZW1lbnQgZ29lcyBvdXQgb2YgdGhlIHZpZXcgaW4gdGhlIG1lYW50aW1lLCBpdHMgSFRNTCBlbGVtZW50IGRpc2FwcGVhcnMsIG5ldmVyIHJlbW92aW5nXG4gICAgICAgICAgICAjIGl0LlxuICAgICAgICAgICAgZWRpdG9yLm9uRGlkRGVzdHJveSAoKSA9PlxuICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICAgICAgICAgZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nICgpID0+XG4gICAgICAgICAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgICAgICAgICBAJCh0ZXh0RWRpdG9yRWxlbWVudCkuZmluZCgnLmhvcml6b250YWwtc2Nyb2xsYmFyJykub24gJ3Njcm9sbCcsICgpID0+XG4gICAgICAgICAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgICAgICAgICBAJCh0ZXh0RWRpdG9yRWxlbWVudCkuZmluZCgnLnZlcnRpY2FsLXNjcm9sbGJhcicpLm9uICdzY3JvbGwnLCAoKSA9PlxuICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICMjIypcbiAgICAgKiBTaG93cyBhIHBvcG92ZXIgY29udGFpbmluZyB0aGUgZG9jdW1lbnRhdGlvbiBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgbG9jYXRlZCBhdCB0aGUgc3BlY2lmaWVkIGxvY2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3IgICAgICAgICBUZXh0RWRpdG9yIGNvbnRhaW5pbmcgdGhlIGVsZW1tZW50LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgZWxlbWVudCAgICAgICAgVGhlIGVsZW1lbnQgdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSAgICAgIGJ1ZmZlclBvc2l0aW9uIFRoZSBjdXJzb3IgbG9jYXRpb24gdGhlIGVsZW1lbnQgaXMgYXQuXG4gICAgICogQHBhcmFtIHtpbnR9ICAgICAgICBkZWxheSAgICAgICAgICBIb3cgbG9uZyB0byB3YWl0IGJlZm9yZSB0aGUgcG9wb3ZlciBzaG93cyB1cC5cbiAgICAgKiBAcGFyYW0ge2ludH0gICAgICAgIGZhZGVJblRpbWUgICAgIFRoZSBhbW91bnQgb2YgdGltZSB0byB0YWtlIHRvIGZhZGUgaW4gdGhlIHRvb2x0aXAuXG4gICAgIyMjXG4gICAgc2hvd1BvcG92ZXJGb3I6IChlZGl0b3IsIGVsZW1lbnQsIGJ1ZmZlclBvc2l0aW9uLCBkZWxheSA9IDUwMCwgZmFkZUluVGltZSA9IDEwMCkgLT5cbiAgICAgICAgdGVybSA9IEAkKGVsZW1lbnQpLnRleHQoKVxuICAgICAgICB0b29sdGlwVGV4dCA9IEBnZXRUb29sdGlwRm9yV29yZChlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uKVxuXG4gICAgICAgIGlmIHRvb2x0aXBUZXh0Py5sZW5ndGggPiAwXG4gICAgICAgICAgICBwb3BvdmVyRWxlbWVudCA9IEBnZXRQb3BvdmVyRWxlbWVudEZyb21TZWxlY3RvcihlbGVtZW50KVxuXG4gICAgICAgICAgICBAYXR0YWNoZWRQb3BvdmVyID0gbmV3IEF0dGFjaGVkUG9wb3Zlcihwb3BvdmVyRWxlbWVudClcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIuc2V0VGV4dCgnPGRpdiBzdHlsZT1cIm1hcmdpbi10b3A6IC0xZW07XCI+JyArIHRvb2x0aXBUZXh0ICsgJzwvZGl2PicpXG4gICAgICAgICAgICBAYXR0YWNoZWRQb3BvdmVyLnNob3dBZnRlcihkZWxheSwgZmFkZUluVGltZSlcblxuICAgICMjIypcbiAgICAgKiBSZW1vdmVzIHRoZSBwb3BvdmVyLCBpZiBpdCBpcyBkaXNwbGF5ZWQuXG4gICAgIyMjXG4gICAgcmVtb3ZlUG9wb3ZlcjogKCkgLT5cbiAgICAgICAgaWYgQGF0dGFjaGVkUG9wb3ZlclxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3Zlci5kaXNwb3NlKClcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIgPSBudWxsXG5cbiAgICAjIyMqXG4gICAgICogUmV0cmlldmVzIGEgdG9vbHRpcCBmb3IgdGhlIHdvcmQgZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9IGVkaXRvciAgICAgICAgIFRleHRFZGl0b3IgdG8gc2VhcmNoIGZvciBuYW1lc3BhY2Ugb2YgdGVybS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgIHRlcm0gICAgICAgICAgIFRlcm0gdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcGFyYW0ge1BvaW50fSAgICAgIGJ1ZmZlclBvc2l0aW9uIFRoZSBjdXJzb3IgbG9jYXRpb24gdGhlIHRlcm0gaXMgYXQuXG4gICAgIyMjXG4gICAgZ2V0VG9vbHRpcEZvcldvcmQ6IChlZGl0b3IsIHRlcm0sIGJ1ZmZlclBvc2l0aW9uKSAtPlxuXG4gICAgIyMjKlxuICAgICAqIEdldHMgdGhlIGNvcnJlY3Qgc2VsZWN0b3Igd2hlbiBhIHNlbGVjdG9yIGlzIGNsaWNrZWQuXG4gICAgICogQHBhcmFtICB7alF1ZXJ5LkV2ZW50fSAgZXZlbnQgIEEgalF1ZXJ5IGV2ZW50LlxuICAgICAqIEByZXR1cm4ge29iamVjdHxudWxsfSAgICAgICAgICBBIHNlbGVjdG9yIHRvIGJlIHVzZWQgd2l0aCBqUXVlcnkuXG4gICAgIyMjXG4gICAgZ2V0U2VsZWN0b3JGcm9tRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgcmV0dXJuIGV2ZW50LmN1cnJlbnRUYXJnZXRcblxuICAgICMjIypcbiAgICAgKiBHZXRzIHRoZSBjb3JyZWN0IGVsZW1lbnQgdG8gYXR0YWNoIHRoZSBwb3BvdmVyIHRvIGZyb20gdGhlIHJldHJpZXZlZCBzZWxlY3Rvci5cbiAgICAgKiBAcGFyYW0gIHtqUXVlcnkuRXZlbnR9ICBldmVudCAgQSBqUXVlcnkgZXZlbnQuXG4gICAgICogQHJldHVybiB7b2JqZWN0fG51bGx9ICAgICAgICAgIEEgc2VsZWN0b3IgdG8gYmUgdXNlZCB3aXRoIGpRdWVyeS5cbiAgICAjIyNcbiAgICBnZXRQb3BvdmVyRWxlbWVudEZyb21TZWxlY3RvcjogKHNlbGVjdG9yKSAtPlxuICAgICAgICByZXR1cm4gc2VsZWN0b3JcbiJdfQ==
