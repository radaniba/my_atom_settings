(function() {
  var AbstractProvider, AttachedPopover, Point, Range, SubAtom, TextEditor, _ref;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, TextEditor = _ref.TextEditor;

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
          var paneItem, panes, _i, _len, _ref1, _results;
          panes = atom.workspace.getPanes();
          if (panes.length === 1) {
            _ref1 = panes[0].items;
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              paneItem = _ref1[_i];
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
              var _j, _len1, _ref1, _results1;
              _ref1 = pane.items;
              _results1 = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                paneItem = _ref1[_j];
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
     * Registers the annotations.
     *
     * @param {TextEditor} editor The editor to search through.
     */

    AbstractProvider.prototype.registerAnnotations = function(editor) {
      var match, row, rowNum, rows, text, _results;
      text = editor.getText();
      rows = text.split('\n');
      this.subAtoms[editor.getLongTitle()] = new SubAtom;
      _results = [];
      for (rowNum in rows) {
        row = rows[rowNum];
        _results.push((function() {
          var _results1;
          _results1 = [];
          while ((match = this.regex.exec(row))) {
            _results1.push(this.placeAnnotation(editor, rowNum, row, match));
          }
          return _results1;
        }).call(this));
      }
      return _results;
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
      gutterContainerElement = this.$(textEditorElement.shadowRoot).find('.gutter-container');
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
      var i, marker, _ref1, _ref2;
      _ref1 = this.markers[editor.getLongTitle()];
      for (i in _ref1) {
        marker = _ref1[i];
        marker.destroy();
      }
      this.markers[editor.getLongTitle()] = [];
      return (_ref2 = this.subAtoms[editor.getLongTitle()]) != null ? _ref2.dispose() : void 0;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2Fubm90YXRpb24vYWJzdHJhY3QtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBFQUFBOztBQUFBLEVBQUEsT0FBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBQVIsRUFBZSxrQkFBQSxVQUFmLENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVIsQ0FGVixDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixPQUFBLENBQVEsOEJBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBRU07a0NBRUY7O0FBQUEsK0JBQUEsS0FBQSxHQUFPLElBQVAsQ0FBQTs7QUFBQSwrQkFDQSxPQUFBLEdBQVMsRUFEVCxDQUFBOztBQUFBLCtCQUVBLFFBQUEsR0FBVSxFQUZWLENBQUE7O0FBSUE7QUFBQTs7T0FKQTs7QUFBQSwrQkFPQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0YsTUFBQSxJQUFDLENBQUEsQ0FBRCxHQUFLLE9BQUEsQ0FBUSxRQUFSLENBQUwsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFBLENBQVEsNkJBQVIsQ0FEVixDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtBQUM5QixVQUFBLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQUMsS0FBRCxHQUFBO21CQUNiLEtBQUMsQ0FBQSxNQUFELENBQVEsTUFBUixFQURhO1VBQUEsQ0FBakIsQ0FBQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/annotation/abstract-provider.coffee
