(function() {
  var AbstractProvider, AttachedPopover, Point, Range, SubAtom, TextEditor, ref;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, TextEditor = ref.TextEditor;

  SubAtom = require('sub-atom');

  AttachedPopover = require('../services/attached-popover');

  module.exports = AbstractProvider = (function() {
    function AbstractProvider() {}

    AbstractProvider.prototype.regex = null;

    AbstractProvider.prototype.markers = [];

    AbstractProvider.prototype.subAtoms = [];


    /**
     * Initializes this provider.
     */

    AbstractProvider.prototype.init = function() {
      this.$ = require('jquery');
      this.parser = require('../services/php-file-parser');
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          editor.onDidSave(function(event) {
            return _this.rescan(editor);
          });
          _this.registerAnnotations(editor);
          return _this.registerEvents(editor);
        };
      })(this));
      atom.workspace.onDidDestroyPane((function(_this) {
        return function(pane) {
          var j, len, paneItem, panes, ref1, results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            ref1 = panes[0].items;
            results = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              paneItem = ref1[j];
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
          var j, len, pane, paneItem, panes, results;
          panes = atom.workspace.getPanes();
          results = [];
          for (j = 0, len = panes.length; j < len; j++) {
            pane = panes[j];
            if (pane === observedPane) {
              continue;
            }
            results.push((function() {
              var k, len1, ref1, results1;
              ref1 = pane.items;
              results1 = [];
              for (k = 0, len1 = ref1.length; k < len1; k++) {
                paneItem = ref1[k];
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
      return this.removeAnnotations();
    };


    /**
     * Registers event handlers.
     *
     * @param {TextEditor} editor TextEditor to register events to.
     */

    AbstractProvider.prototype.registerEvents = function(editor) {
      var textEditorElement;
      if (editor.getGrammar().scopeName.match(/text.html.php$/)) {
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
        textEditorElement = atom.views.getView(editor);
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
     * Registers the annotations.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.registerAnnotations = function(editor) {
      var match, results, row, rowNum, rows, text;
      text = editor.getText();
      rows = text.split('\n');
      this.subAtoms[editor.getLongTitle()] = new SubAtom;
      results = [];
      for (rowNum in rows) {
        row = rows[rowNum];
        results.push((function() {
          var results1;
          results1 = [];
          while ((match = this.regex.exec(row))) {
            results1.push(this.placeAnnotation(editor, rowNum, row, match));
          }
          return results1;
        }).call(this));
      }
      return results;
    };


    /**
     * Places an annotation at the specified line and row text.
     *
     * @param {TextEditor} editor
     * @param {int}        row
     * @param {String}     rowText
     * @param {Array}      match
     */

    AbstractProvider.prototype.placeAnnotation = function(editor, row, rowText, match) {
      var annotationInfo, decoration, longTitle, marker, markerLayer, range;
      annotationInfo = this.extractAnnotationInfo(editor, row, rowText, match);
      if (!annotationInfo) {
        return;
      }
      range = new Range(new Point(parseInt(row), 0), new Point(parseInt(row), rowText.length));
      if (typeof editor.addMarkerLayer === 'function') {
        if (this.markerLayers == null) {
          this.markerLayers = new WeakMap;
        }
        if (!(markerLayer = this.markerLayers.get(editor))) {
          markerLayer = editor.addMarkerLayer({
            maintainHistory: true
          });
          this.markerLayers.set(editor, markerLayer);
        }
      }
      marker = (markerLayer != null ? markerLayer : editor).markBufferRange(range, {
        maintainHistory: true,
        invalidate: 'touch'
      });
      decoration = editor.decorateMarker(marker, {
        type: 'line-number',
        "class": annotationInfo.lineNumberClass
      });
      longTitle = editor.getLongTitle();
      if (this.markers[longTitle] === void 0) {
        this.markers[longTitle] = [];
      }
      this.markers[longTitle].push(marker);
      return this.registerAnnotationEventHandlers(editor, row, annotationInfo);
    };


    /**
     * Exracts information about the annotation match.
     *
     * @param {TextEditor} editor
     * @param {int}        row
     * @param {String}     rowText
     * @param {Array}      match
     */

    AbstractProvider.prototype.extractAnnotationInfo = function(editor, row, rowText, match) {};


    /**
     * Registers annotation event handlers for the specified row.
     *
     * @param {TextEditor} editor
     * @param {int}        row
     * @param {Object}     annotationInfo
     */

    AbstractProvider.prototype.registerAnnotationEventHandlers = function(editor, row, annotationInfo) {
      var gutterContainerElement, textEditorElement;
      textEditorElement = atom.views.getView(editor);
      gutterContainerElement = this.$(textEditorElement).find('.gutter-container');
      return (function(_this) {
        return function(editor, gutterContainerElement, annotationInfo) {
          var longTitle, selector;
          longTitle = editor.getLongTitle();
          selector = '.line-number' + '.' + annotationInfo.lineNumberClass + '[data-buffer-row=' + row + '] .icon-right';
          _this.subAtoms[longTitle].add(gutterContainerElement, 'mouseover', selector, function(event) {
            return _this.handleMouseOver(event, editor, annotationInfo);
          });
          _this.subAtoms[longTitle].add(gutterContainerElement, 'mouseout', selector, function(event) {
            return _this.handleMouseOut(event, editor, annotationInfo);
          });
          return _this.subAtoms[longTitle].add(gutterContainerElement, 'click', selector, function(event) {
            return _this.handleMouseClick(event, editor, annotationInfo);
          });
        };
      })(this)(editor, gutterContainerElement, annotationInfo);
    };


    /**
     * Handles the mouse over event on an annotation.
     *
     * @param {jQuery.Event} event
     * @param {TextEditor}   editor
     * @param {Object}       annotationInfo
     */

    AbstractProvider.prototype.handleMouseOver = function(event, editor, annotationInfo) {
      if (annotationInfo.tooltipText) {
        this.removePopover();
        this.attachedPopover = new AttachedPopover(event.target);
        this.attachedPopover.setText(annotationInfo.tooltipText);
        return this.attachedPopover.show();
      }
    };


    /**
     * Handles the mouse out event on an annotation.
     *
     * @param {jQuery.Event} event
     * @param {TextEditor}   editor
     * @param {Object}       annotationInfo
     */

    AbstractProvider.prototype.handleMouseOut = function(event, editor, annotationInfo) {
      return this.removePopover();
    };


    /**
     * Handles the mouse click event on an annotation.
     *
     * @param {jQuery.Event} event
     * @param {TextEditor}   editor
     * @param {Object}       annotationInfo
     */

    AbstractProvider.prototype.handleMouseClick = function(event, editor, annotationInfo) {};


    /**
     * Removes the existing popover, if any.
     */

    AbstractProvider.prototype.removePopover = function() {
      if (this.attachedPopover) {
        this.attachedPopover.dispose();
        return this.attachedPopover = null;
      }
    };


    /**
     * Removes any annotations that were created.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.removeAnnotations = function(editor) {
      var i, marker, ref1, ref2;
      ref1 = this.markers[editor.getLongTitle()];
      for (i in ref1) {
        marker = ref1[i];
        marker.destroy();
      }
      this.markers[editor.getLongTitle()] = [];
      return (ref2 = this.subAtoms[editor.getLongTitle()]) != null ? ref2.dispose() : void 0;
    };


    /**
     * Rescans the editor, updating all annotations.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.rescan = function(editor) {
      this.removeAnnotations(editor);
      return this.registerAnnotations(editor);
    };

    return AbstractProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2Fubm90YXRpb24vYWJzdHJhY3QtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLGlCQUFELEVBQVEsaUJBQVIsRUFBZTs7RUFFZixPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0VBRVYsZUFBQSxHQUFrQixPQUFBLENBQVEsOEJBQVI7O0VBRWxCLE1BQU0sQ0FBQyxPQUFQLEdBRU07OzsrQkFFRixLQUFBLEdBQU87OytCQUNQLE9BQUEsR0FBUzs7K0JBQ1QsUUFBQSxHQUFVOzs7QUFFVjs7OzsrQkFHQSxJQUFBLEdBQU0sU0FBQTtNQUNGLElBQUMsQ0FBQSxDQUFELEdBQUssT0FBQSxDQUFRLFFBQVI7TUFDTCxJQUFDLENBQUEsTUFBRCxHQUFVLE9BQUEsQ0FBUSw2QkFBUjtNQUVWLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7VUFDOUIsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsU0FBQyxLQUFEO21CQUNiLEtBQUMsQ0FBQSxNQUFELENBQVEsTUFBUjtVQURhLENBQWpCO1VBR0EsS0FBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCO2lCQUNBLEtBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCO1FBTDhCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQztNQVFBLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWYsQ0FBZ0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7QUFDNUIsY0FBQTtVQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQWYsQ0FBQTtVQUVSLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FB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QUFtQixTQUFDLE1BQUQ7QUFDZixVQUFBO0FBQUE7QUFBQSxXQUFBLFNBQUE7O1FBQ0ksTUFBTSxDQUFDLE9BQVAsQ0FBQTtBQURKO01BR0EsSUFBQyxDQUFBLE9BQVEsQ0FBQSxNQUFNLENBQUMsWUFBUCxDQUFBLENBQUEsQ0FBVCxHQUFrQzt5RUFDRixDQUFFLE9BQWxDLENBQUE7SUFMZTs7O0FBT25COzs7Ozs7K0JBS0EsTUFBQSxHQUFRLFNBQUMsTUFBRDtNQUNKLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQjthQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixNQUFyQjtJQUZJOzs7OztBQXpPWiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnQsIFRleHRFZGl0b3J9ID0gcmVxdWlyZSAnYXRvbSdcblxuU3ViQXRvbSA9IHJlcXVpcmUgJ3N1Yi1hdG9tJ1xuXG5BdHRhY2hlZFBvcG92ZXIgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9hdHRhY2hlZC1wb3BvdmVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbmNsYXNzIEFic3RyYWN0UHJvdmlkZXJcbiAgICAjIFRoZSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBhIGxpbmUgbXVzdCBtYXRjaCBpbiBvcmRlciBmb3IgaXQgdG8gYmUgY2hlY2tlZCBpZiBpdCByZXF1aXJlcyBhbiBhbm5vdGF0aW9uLlxuICAgIHJlZ2V4OiBudWxsXG4gICAgbWFya2VyczogW11cbiAgICBzdWJBdG9tczogW11cblxuICAgICMjIypcbiAgICAgKiBJbml0aWFsaXplcyB0aGlzIHByb3ZpZGVyLlxuICAgICMjI1xuICAgIGluaXQ6ICgpIC0+XG4gICAgICAgIEAkID0gcmVxdWlyZSAnanF1ZXJ5J1xuICAgICAgICBAcGFyc2VyID0gcmVxdWlyZSAnLi4vc2VydmljZXMvcGhwLWZpbGUtcGFyc2VyJ1xuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAgICAgZWRpdG9yLm9uRGlkU2F2ZSAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgQHJlc2NhbihlZGl0b3IpXG5cbiAgICAgICAgICAgIEByZWdpc3RlckFubm90YXRpb25zIGVkaXRvclxuICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIGVkaXRvclxuXG4gICAgICAgICMgV2hlbiB5b3UgZ28gYmFjayB0byBvbmx5IGhhdmUgMSBwYW5lIHRoZSBldmVudHMgYXJlIGxvc3QsIHNvIG5lZWQgdG8gcmUtcmVnaXN0ZXIuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkRGVzdHJveVBhbmUgKHBhbmUpID0+XG4gICAgICAgICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcblxuICAgICAgICAgICAgaWYgcGFuZXMubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICBmb3IgcGFuZUl0ZW0gaW4gcGFuZXNbMF0uaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgaWYgcGFuZUl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBAcmVnaXN0ZXJFdmVudHMgcGFuZUl0ZW1cblxuICAgICAgICAjIEhhdmluZyB0byByZS1yZWdpc3RlciBldmVudHMgYXMgd2hlbiBhIG5ldyBwYW5lIGlzIGNyZWF0ZWQgdGhlIG9sZCBwYW5lcyBsb3NlIHRoZSBldmVudHMuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQWRkUGFuZSAob2JzZXJ2ZWRQYW5lKSA9PlxuICAgICAgICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG5cbiAgICAgICAgICAgIGZvciBwYW5lIGluIHBhbmVzXG4gICAgICAgICAgICAgICAgaWYgcGFuZSA9PSBvYnNlcnZlZFBhbmVcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgICAgIGZvciBwYW5lSXRlbSBpbiBwYW5lLml0ZW1zXG4gICAgICAgICAgICAgICAgICAgIGlmIHBhbmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgQHJlZ2lzdGVyRXZlbnRzIHBhbmVJdGVtXG5cbiAgICAjIyMqXG4gICAgICogRGVhY3RpdmVzIHRoZSBwcm92aWRlci5cbiAgICAjIyNcbiAgICBkZWFjdGl2YXRlOiAoKSAtPlxuICAgICAgICBAcmVtb3ZlQW5ub3RhdGlvbnMoKVxuXG4gICAgIyMjKlxuICAgICAqIFJlZ2lzdGVycyBldmVudCBoYW5kbGVycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRleHRFZGl0b3IgdG8gcmVnaXN0ZXIgZXZlbnRzIHRvLlxuICAgICMjI1xuICAgIHJlZ2lzdGVyRXZlbnRzOiAoZWRpdG9yKSAtPlxuICAgICAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5tYXRjaCAvdGV4dC5odG1sLnBocCQvXG4gICAgICAgICAgICAjIFRpY2tldCAjMTA3IC0gTW91c2VvdXQgaXNuJ3QgZ2VuZXJhdGVkIHVudGlsIHRoZSBtb3VzZSBtb3ZlcywgZXZlbiB3aGVuIHNjcm9sbGluZyAod2l0aCB0aGUga2V5Ym9hcmQgb3JcbiAgICAgICAgICAgICMgbW91c2UpLiBJZiB0aGUgZWxlbWVudCBnb2VzIG91dCBvZiB0aGUgdmlldyBpbiB0aGUgbWVhbnRpbWUsIGl0cyBIVE1MIGVsZW1lbnQgZGlzYXBwZWFycywgbmV2ZXIgcmVtb3ZpbmdcbiAgICAgICAgICAgICMgaXQuXG4gICAgICAgICAgICBlZGl0b3Iub25EaWREZXN0cm95ICgpID0+XG4gICAgICAgICAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgICAgICAgICBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgKCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAgICAgICAgIHRleHRFZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcblxuICAgICAgICAgICAgQCQodGV4dEVkaXRvckVsZW1lbnQpLmZpbmQoJy5ob3Jpem9udGFsLXNjcm9sbGJhcicpLm9uICdzY3JvbGwnLCAoKSA9PlxuICAgICAgICAgICAgICAgIEByZW1vdmVQb3BvdmVyKClcblxuICAgICAgICAgICAgQCQodGV4dEVkaXRvckVsZW1lbnQpLmZpbmQoJy52ZXJ0aWNhbC1zY3JvbGxiYXInKS5vbiAnc2Nyb2xsJywgKCkgPT5cbiAgICAgICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAjIyMqXG4gICAgICogUmVnaXN0ZXJzIHRoZSBhbm5vdGF0aW9ucy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRoZSBlZGl0b3IgdG8gc2VhcmNoIHRocm91Z2guXG4gICAgIyMjXG4gICAgcmVnaXN0ZXJBbm5vdGF0aW9uczogKGVkaXRvcikgLT5cbiAgICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgcm93cyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gICAgICAgIEBzdWJBdG9tc1tlZGl0b3IuZ2V0TG9uZ1RpdGxlKCldID0gbmV3IFN1YkF0b21cblxuICAgICAgICBmb3Igcm93TnVtLHJvdyBvZiByb3dzXG4gICAgICAgICAgICB3aGlsZSAobWF0Y2ggPSBAcmVnZXguZXhlYyhyb3cpKVxuICAgICAgICAgICAgICAgIEBwbGFjZUFubm90YXRpb24oZWRpdG9yLCByb3dOdW0sIHJvdywgbWF0Y2gpXG5cbiAgICAjIyMqXG4gICAgICogUGxhY2VzIGFuIGFubm90YXRpb24gYXQgdGhlIHNwZWNpZmllZCBsaW5lIGFuZCByb3cgdGV4dC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yXG4gICAgICogQHBhcmFtIHtpbnR9ICAgICAgICByb3dcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gICAgIHJvd1RleHRcbiAgICAgKiBAcGFyYW0ge0FycmF5fSAgICAgIG1hdGNoXG4gICAgIyMjXG4gICAgcGxhY2VBbm5vdGF0aW9uOiAoZWRpdG9yLCByb3csIHJvd1RleHQsIG1hdGNoKSAtPlxuICAgICAgICBhbm5vdGF0aW9uSW5mbyA9IEBleHRyYWN0QW5ub3RhdGlvbkluZm8oZWRpdG9yLCByb3csIHJvd1RleHQsIG1hdGNoKVxuXG4gICAgICAgIGlmIG5vdCBhbm5vdGF0aW9uSW5mb1xuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgICAgICBuZXcgUG9pbnQocGFyc2VJbnQocm93KSwgMCksXG4gICAgICAgICAgICBuZXcgUG9pbnQocGFyc2VJbnQocm93KSwgcm93VGV4dC5sZW5ndGgpXG4gICAgICAgIClcblxuICAgICAgICAjIEZvciBBdG9tIDEuMyBvciBncmVhdGVyLCBtYWludGFpbkhpc3RvcnkgY2FuIG9ubHkgYmUgYXBwbGllZCB0byBlbnRpcmVcbiAgICAgICAgIyBtYXJrZXIgbGF5ZXJzLiBMYXllcnMgZG9uJ3QgZXhpc3QgaW4gZWFybGllciB2ZXJzaW9ucywgaGVuY2UgdGhlXG4gICAgICAgICMgY29uZGl0aW9uYWwgbG9naWMuXG4gICAgICAgIGlmIHR5cGVvZiBlZGl0b3IuYWRkTWFya2VyTGF5ZXIgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgQG1hcmtlckxheWVycyA/PSBuZXcgV2Vha01hcFxuICAgICAgICAgICAgdW5sZXNzIG1hcmtlckxheWVyID0gQG1hcmtlckxheWVycy5nZXQoZWRpdG9yKVxuICAgICAgICAgICAgICAgIG1hcmtlckxheWVyID0gZWRpdG9yLmFkZE1hcmtlckxheWVyKG1haW50YWluSGlzdG9yeTogdHJ1ZSlcbiAgICAgICAgICAgICAgICBAbWFya2VyTGF5ZXJzLnNldChlZGl0b3IsIG1hcmtlckxheWVyKVxuXG4gICAgICAgIG1hcmtlciA9IChtYXJrZXJMYXllciA/IGVkaXRvcikubWFya0J1ZmZlclJhbmdlKHJhbmdlLCB7XG4gICAgICAgICAgICBtYWludGFpbkhpc3RvcnkgOiB0cnVlLFxuICAgICAgICAgICAgaW52YWxpZGF0ZSAgICAgIDogJ3RvdWNoJ1xuICAgICAgICB9KVxuXG4gICAgICAgIGRlY29yYXRpb24gPSBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgICAgICB0eXBlOiAnbGluZS1udW1iZXInLFxuICAgICAgICAgICAgY2xhc3M6IGFubm90YXRpb25JbmZvLmxpbmVOdW1iZXJDbGFzc1xuICAgICAgICB9KVxuXG4gICAgICAgIGxvbmdUaXRsZSA9IGVkaXRvci5nZXRMb25nVGl0bGUoKVxuXG4gICAgICAgIGlmIEBtYXJrZXJzW2xvbmdUaXRsZV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICBAbWFya2Vyc1tsb25nVGl0bGVdID0gW11cblxuICAgICAgICBAbWFya2Vyc1tsb25nVGl0bGVdLnB1c2gobWFya2VyKVxuXG4gICAgICAgIEByZWdpc3RlckFubm90YXRpb25FdmVudEhhbmRsZXJzKGVkaXRvciwgcm93LCBhbm5vdGF0aW9uSW5mbylcblxuICAgICMjIypcbiAgICAgKiBFeHJhY3RzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhbm5vdGF0aW9uIG1hdGNoLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge2ludH0gICAgICAgIHJvd1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSAgICAgcm93VGV4dFxuICAgICAqIEBwYXJhbSB7QXJyYXl9ICAgICAgbWF0Y2hcbiAgICAjIyNcbiAgICBleHRyYWN0QW5ub3RhdGlvbkluZm86IChlZGl0b3IsIHJvdywgcm93VGV4dCwgbWF0Y2gpIC0+XG5cbiAgICAjIyMqXG4gICAgICogUmVnaXN0ZXJzIGFubm90YXRpb24gZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSBzcGVjaWZpZWQgcm93LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUZXh0RWRpdG9yfSBlZGl0b3JcbiAgICAgKiBAcGFyYW0ge2ludH0gICAgICAgIHJvd1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSAgICAgYW5ub3RhdGlvbkluZm9cbiAgICAjIyNcbiAgICByZWdpc3RlckFubm90YXRpb25FdmVudEhhbmRsZXJzOiAoZWRpdG9yLCByb3csIGFubm90YXRpb25JbmZvKSAtPlxuICAgICAgICB0ZXh0RWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgIGd1dHRlckNvbnRhaW5lckVsZW1lbnQgPSBAJCh0ZXh0RWRpdG9yRWxlbWVudCkuZmluZCgnLmd1dHRlci1jb250YWluZXInKVxuXG4gICAgICAgIGRvIChlZGl0b3IsIGd1dHRlckNvbnRhaW5lckVsZW1lbnQsIGFubm90YXRpb25JbmZvKSA9PlxuICAgICAgICAgICAgbG9uZ1RpdGxlID0gZWRpdG9yLmdldExvbmdUaXRsZSgpXG4gICAgICAgICAgICBzZWxlY3RvciA9ICcubGluZS1udW1iZXInICsgJy4nICsgYW5ub3RhdGlvbkluZm8ubGluZU51bWJlckNsYXNzICsgJ1tkYXRhLWJ1ZmZlci1yb3c9JyArIHJvdyArICddIC5pY29uLXJpZ2h0J1xuXG4gICAgICAgICAgICBAc3ViQXRvbXNbbG9uZ1RpdGxlXS5hZGQgZ3V0dGVyQ29udGFpbmVyRWxlbWVudCwgJ21vdXNlb3ZlcicsIHNlbGVjdG9yLCAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgQGhhbmRsZU1vdXNlT3ZlcihldmVudCwgZWRpdG9yLCBhbm5vdGF0aW9uSW5mbylcblxuICAgICAgICAgICAgQHN1YkF0b21zW2xvbmdUaXRsZV0uYWRkIGd1dHRlckNvbnRhaW5lckVsZW1lbnQsICdtb3VzZW91dCcsIHNlbGVjdG9yLCAoZXZlbnQpID0+XG4gICAgICAgICAgICAgICAgQGhhbmRsZU1vdXNlT3V0KGV2ZW50LCBlZGl0b3IsIGFubm90YXRpb25JbmZvKVxuXG4gICAgICAgICAgICBAc3ViQXRvbXNbbG9uZ1RpdGxlXS5hZGQgZ3V0dGVyQ29udGFpbmVyRWxlbWVudCwgJ2NsaWNrJywgc2VsZWN0b3IsIChldmVudCkgPT5cbiAgICAgICAgICAgICAgICBAaGFuZGxlTW91c2VDbGljayhldmVudCwgZWRpdG9yLCBhbm5vdGF0aW9uSW5mbylcblxuICAgICMjIypcbiAgICAgKiBIYW5kbGVzIHRoZSBtb3VzZSBvdmVyIGV2ZW50IG9uIGFuIGFubm90YXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2pRdWVyeS5FdmVudH0gZXZlbnRcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9ICAgZWRpdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9ICAgICAgIGFubm90YXRpb25JbmZvXG4gICAgIyMjXG4gICAgaGFuZGxlTW91c2VPdmVyOiAoZXZlbnQsIGVkaXRvciwgYW5ub3RhdGlvbkluZm8pIC0+XG4gICAgICAgIGlmIGFubm90YXRpb25JbmZvLnRvb2x0aXBUZXh0XG4gICAgICAgICAgICBAcmVtb3ZlUG9wb3ZlcigpXG5cbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIgPSBuZXcgQXR0YWNoZWRQb3BvdmVyKGV2ZW50LnRhcmdldClcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIuc2V0VGV4dChhbm5vdGF0aW9uSW5mby50b29sdGlwVGV4dClcbiAgICAgICAgICAgIEBhdHRhY2hlZFBvcG92ZXIuc2hvdygpXG5cbiAgICAjIyMqXG4gICAgICogSGFuZGxlcyB0aGUgbW91c2Ugb3V0IGV2ZW50IG9uIGFuIGFubm90YXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2pRdWVyeS5FdmVudH0gZXZlbnRcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9ICAgZWRpdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9ICAgICAgIGFubm90YXRpb25JbmZvXG4gICAgIyMjXG4gICAgaGFuZGxlTW91c2VPdXQ6IChldmVudCwgZWRpdG9yLCBhbm5vdGF0aW9uSW5mbykgLT5cbiAgICAgICAgQHJlbW92ZVBvcG92ZXIoKVxuXG4gICAgIyMjKlxuICAgICAqIEhhbmRsZXMgdGhlIG1vdXNlIGNsaWNrIGV2ZW50IG9uIGFuIGFubm90YXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2pRdWVyeS5FdmVudH0gZXZlbnRcbiAgICAgKiBAcGFyYW0ge1RleHRFZGl0b3J9ICAgZWRpdG9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9ICAgICAgIGFubm90YXRpb25JbmZvXG4gICAgIyMjXG4gICAgaGFuZGxlTW91c2VDbGljazogKGV2ZW50LCBlZGl0b3IsIGFubm90YXRpb25JbmZvKSAtPlxuXG4gICAgIyMjKlxuICAgICAqIFJlbW92ZXMgdGhlIGV4aXN0aW5nIHBvcG92ZXIsIGlmIGFueS5cbiAgICAjIyNcbiAgICByZW1vdmVQb3BvdmVyOiAoKSAtPlxuICAgICAgICBpZiBAYXR0YWNoZWRQb3BvdmVyXG4gICAgICAgICAgICBAYXR0YWNoZWRQb3BvdmVyLmRpc3Bvc2UoKVxuICAgICAgICAgICAgQGF0dGFjaGVkUG9wb3ZlciA9IG51bGxcblxuICAgICMjIypcbiAgICAgKiBSZW1vdmVzIGFueSBhbm5vdGF0aW9ucyB0aGF0IHdlcmUgY3JlYXRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRoZSBlZGl0b3IgdG8gc2VhcmNoIHRocm91Z2guXG4gICAgIyMjXG4gICAgcmVtb3ZlQW5ub3RhdGlvbnM6IChlZGl0b3IpIC0+XG4gICAgICAgIGZvciBpLG1hcmtlciBvZiBAbWFya2Vyc1tlZGl0b3IuZ2V0TG9uZ1RpdGxlKCldXG4gICAgICAgICAgICBtYXJrZXIuZGVzdHJveSgpXG5cbiAgICAgICAgQG1hcmtlcnNbZWRpdG9yLmdldExvbmdUaXRsZSgpXSA9IFtdXG4gICAgICAgIEBzdWJBdG9tc1tlZGl0b3IuZ2V0TG9uZ1RpdGxlKCldPy5kaXNwb3NlKClcblxuICAgICMjIypcbiAgICAgKiBSZXNjYW5zIHRoZSBlZGl0b3IsIHVwZGF0aW5nIGFsbCBhbm5vdGF0aW9ucy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGV4dEVkaXRvcn0gZWRpdG9yIFRoZSBlZGl0b3IgdG8gc2VhcmNoIHRocm91Z2guXG4gICAgIyMjXG4gICAgcmVzY2FuOiAoZWRpdG9yKSAtPlxuICAgICAgICBAcmVtb3ZlQW5ub3RhdGlvbnMoZWRpdG9yKVxuICAgICAgICBAcmVnaXN0ZXJBbm5vdGF0aW9ucyhlZGl0b3IpXG4iXX0=
