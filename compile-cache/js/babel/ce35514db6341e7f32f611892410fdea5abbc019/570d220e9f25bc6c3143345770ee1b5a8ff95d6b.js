'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function EditorDiffExtender(editor) {
    _classCallCheck(this, EditorDiffExtender);

    this._editor = editor;
    this._lineMarkerLayer = this._editor.addMarkerLayer();
    this._miscMarkers = [];
    this._selectionMarkerLayer = this._editor.addMarkerLayer();
    this._oldPlaceholderText = editor.getPlaceholderText();
    editor.setPlaceholderText('Paste what you want to diff here!');
    // add split-diff css selector to editors for keybindings #73
    atom.views.getView(this._editor).classList.add('split-diff');
  }

  /**
   * Adds offsets (blank lines) into the editor.
   *
   * @param lineOffsets An array of offsets (blank lines) to insert into this editor.
   */

  _createClass(EditorDiffExtender, [{
    key: 'setLineOffsets',
    value: function setLineOffsets(lineOffsets) {
      var offsetLineNumbers = Object.keys(lineOffsets).map(function (lineNumber) {
        return parseInt(lineNumber, 10);
      }).sort(function (x, y) {
        return x - y;
      });

      for (var offsetLineNumber of offsetLineNumbers) {
        if (offsetLineNumber == 0) {
          // add block decoration before if adding to line 0
          this._addOffsetDecoration(offsetLineNumber - 1, lineOffsets[offsetLineNumber], 'before');
        } else {
          // add block decoration after if adding to lines > 0
          this._addOffsetDecoration(offsetLineNumber - 1, lineOffsets[offsetLineNumber], 'after');
        }
      }
    }

    /**
     * Creates marker for line highlight.
     *
     * @param startIndex The start index of the line chunk to highlight.
     * @param endIndex The end index of the line chunk to highlight.
     * @param highlightType The type of highlight to be applied to the line.
     */
  }, {
    key: 'highlightLines',
    value: function highlightLines(startIndex, endIndex, highlightType) {
      if (startIndex != endIndex) {
        var highlightClass = 'split-diff-' + highlightType;
        this._createLineMarker(this._lineMarkerLayer, startIndex, endIndex, highlightClass);
      }
    }

    /**
     * The line marker layer holds all added/removed line markers.
     *
     * @return The line marker layer.
     */
  }, {
    key: 'getLineMarkerLayer',
    value: function getLineMarkerLayer() {
      return this._lineMarkerLayer;
    }

    /**
     * The selection marker layer holds all line highlight selection markers.
     *
     * @return The selection marker layer.
     */
  }, {
    key: 'getSelectionMarkerLayer',
    value: function getSelectionMarkerLayer() {
      return this._selectionMarkerLayer;
    }

    /**
     * Highlights words in a given line.
     *
     * @param lineNumber The line number to highlight words on.
     * @param wordDiff An array of objects which look like...
     *    added: boolean (not used)
     *    count: number (not used)
     *    removed: boolean (not used)
     *    value: string
     *    changed: boolean
     * @param type The type of highlight to be applied to the words.
     */
  }, {
    key: 'setWordHighlights',
    value: function setWordHighlights(lineNumber, wordDiff, type, isWhitespaceIgnored) {
      if (wordDiff === undefined) wordDiff = [];

      var klass = 'split-diff-word-' + type;
      var count = 0;

      for (var i = 0; i < wordDiff.length; i++) {
        if (wordDiff[i].value) {
          // fix for #49
          // if there was a change
          // AND one of these is true:
          // if the string is not spaces, highlight
          // OR
          // if the string is spaces and whitespace not ignored, highlight
          if (wordDiff[i].changed && (/\S/.test(wordDiff[i].value) || !/\S/.test(wordDiff[i].value) && !isWhitespaceIgnored)) {
            var marker = this._editor.markBufferRange([[lineNumber, count], [lineNumber, count + wordDiff[i].value.length]], { invalidate: 'never' });
            this._editor.decorateMarker(marker, { type: 'highlight', 'class': klass });
            this._miscMarkers.push(marker);
          }
          count += wordDiff[i].value.length;
        }
      }
    }

    /**
     * Destroys all markers added to this editor by split-diff.
     */
  }, {
    key: 'destroyMarkers',
    value: function destroyMarkers() {
      this._lineMarkerLayer.clear();

      this._miscMarkers.forEach(function (marker) {
        marker.destroy();
      });
      this._miscMarkers = [];

      this._selectionMarkerLayer.clear();
    }

    /**
     * Destroys the instance of the EditorDiffExtender and cleans up after itself.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.destroyMarkers();
      this._lineMarkerLayer.destroy();
      this._editor.setPlaceholderText(this._oldPlaceholderText);
      // remove split-diff css selector from editors for keybindings #73
      atom.views.getView(this._editor).classList.remove('split-diff');
    }

    /**
     * Selects lines.
     *
     * @param startLine The line number that the selection starts at.
     * @param endLine The line number that the selection ends at (non-inclusive).
     */
  }, {
    key: 'selectLines',
    value: function selectLines(startLine, endLine) {
      // don't want to highlight if they are the same (same numbers means chunk is
      // just pointing to a location to copy-to-right/copy-to-left)
      if (startLine < endLine) {
        this._createLineMarker(this._selectionMarkerLayer, startLine, endLine, 'split-diff-selected');
      }
    }

    /**
     * Destroy the selection markers.
     */
  }, {
    key: 'deselectAllLines',
    value: function deselectAllLines() {
      this._selectionMarkerLayer.clear();
    }

    /**
     * Used to test whether there is currently an active selection highlight in
     * the editor.
     *
     * @return A boolean signifying whether there is an active selection highlight.
     */
  }, {
    key: 'hasSelection',
    value: function hasSelection() {
      if (this._selectionMarkerLayer.getMarkerCount() > 0) {
        return true;
      }
      return false;
    }

    /**
     * Enable soft wrap for this editor.
     */
  }, {
    key: 'enableSoftWrap',
    value: function enableSoftWrap() {
      try {
        this._editor.setSoftWrapped(true);
      } catch (e) {
        //console.log('Soft wrap was enabled on a text editor that does not exist.');
      }
    }

    /**
     * Removes the text editor without prompting a save.
     */
  }, {
    key: 'cleanUp',
    value: function cleanUp() {
      // if the pane that this editor was in is now empty, we will destroy it
      var editorPane = atom.workspace.paneForItem(this._editor);
      if (typeof editorPane !== 'undefined' && editorPane != null && editorPane.getItems().length == 1) {
        editorPane.destroy();
      } else {
        this._editor.destroy();
      }
    }

    /**
     * Finds cursor-touched line ranges that are marked as different in an editor
     * view.
     *
     * @return The line ranges of diffs that are touched by a cursor.
     */
  }, {
    key: 'getCursorDiffLines',
    value: function getCursorDiffLines() {
      var cursorPositions = this._editor.getCursorBufferPositions();
      var touchedLines = [];
      var lineMarkers = this._lineMarkerLayer.getMarkers();

      for (var i = 0; i < cursorPositions.length; i++) {
        for (var j = 0; j < lineMarkers.length; j++) {
          var markerRange = lineMarkers[j].getBufferRange();

          if (cursorPositions[i].row >= markerRange.start.row && cursorPositions[i].row < markerRange.end.row) {
            touchedLines.push(markerRange);
            break;
          }
        }
      }

      // put the chunks in order so the copy function doesn't mess up
      touchedLines.sort(function (lineA, lineB) {
        return lineA.start.row - lineB.start.row;
      });

      return touchedLines;
    }

    /**
     * Used to get the Text Editor object for this view. Helpful for calling basic
     * Atom Text Editor functions.
     *
     * @return The Text Editor object for this view.
     */
  }, {
    key: 'getEditor',
    value: function getEditor() {
      return this._editor;
    }

    // ----------------------------------------------------------------------- //
    // --------------------------- PRIVATE METHODS --------------------------- //
    // ----------------------------------------------------------------------- //

    /**
     * Creates a marker and decorates its line and line number.
     *
     * @param markerLayer The marker layer to put the marker in.
     * @param startLineNumber A buffer line number to start highlighting at.
     * @param endLineNumber A buffer line number to end highlighting at.
     * @param highlightClass The type of highlight to be applied to the line.
     *    Could be a value of: ['split-diff-insert', 'split-diff-delete',
     *    'split-diff-select'].
     * @return The created line marker.
     */
  }, {
    key: '_createLineMarker',
    value: function _createLineMarker(markerLayer, startLineNumber, endLineNumber, highlightClass) {
      var marker = markerLayer.markBufferRange([[startLineNumber, 0], [endLineNumber, 0]], { invalidate: 'never' });

      this._editor.decorateMarker(marker, { type: 'line-number', 'class': highlightClass });
      this._editor.decorateMarker(marker, { type: 'line', 'class': highlightClass });

      return marker;
    }

    /**
     * Creates a decoration for an offset.
     *
     * @param lineNumber The line number to add the block decoration to.
     * @param numberOfLines The number of lines that the block decoration's height will be.
     * @param blockPosition Specifies whether to put the decoration before the line or after.
     */
  }, {
    key: '_addOffsetDecoration',
    value: function _addOffsetDecoration(lineNumber, numberOfLines, blockPosition) {
      var element = document.createElement('div');
      element.className += 'split-diff-offset';
      // if no text, set height for blank lines
      element.style.minHeight = numberOfLines * this._editor.getLineHeightInPixels() + 'px';

      var marker = this._editor.markScreenPosition([lineNumber, 0], { invalidate: 'never' });
      this._editor.decorateMarker(marker, { type: 'block', position: blockPosition, item: element });
      this._miscMarkers.push(marker);
    }
  }]);

  return EditorDiffExtender;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvZWRpdG9yLWRpZmYtZXh0ZW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxNQUFNLENBQUMsT0FBTztBQUVELFdBRlUsa0JBQWtCLENBRTNCLE1BQU0sRUFBRTswQkFGQyxrQkFBa0I7O0FBR3JDLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3RELFFBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzNELFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUN2RCxVQUFNLENBQUMsa0JBQWtCLENBQUMsbUNBQW1DLENBQUMsQ0FBQzs7QUFFL0QsUUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDOUQ7Ozs7Ozs7O2VBWG9CLGtCQUFrQjs7V0FrQnpCLHdCQUFDLFdBQVcsRUFBRTtBQUMxQixVQUFJLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsVUFBVTtlQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO2VBQUssQ0FBQyxHQUFHLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRW5ILFdBQUksSUFBSSxnQkFBZ0IsSUFBSSxp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RSxRQUFRLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0FBQzdGLFVBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2hDOzs7U0F2UW9CLGtCQUFrQjtJQXdReEMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL3NwbGl0LWRpZmYvbGliL2VkaXRvci1kaWZmLWV4dGVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFZGl0b3JEaWZmRXh0ZW5kZXIge1xuXG4gIGNvbnN0cnVjdG9yKGVkaXRvcikge1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLl9saW5lTWFya2VyTGF5ZXIgPSB0aGlzLl9lZGl0b3IuYWRkTWFya2VyTGF5ZXIoKTtcbiAgICB0aGlzLl9taXNjTWFya2VycyA9IFtdO1xuICAgIHRoaXMuX3NlbGVjdGlvbk1hcmtlckxheWVyID0gdGhpcy5fZWRpdG9yLmFkZE1hcmtlckxheWVyKCk7XG4gICAgdGhpcy5fb2xkUGxhY2Vob2xkZXJUZXh0ID0gZWRpdG9yLmdldFBsYWNlaG9sZGVyVGV4dCgpO1xuICAgIGVkaXRvci5zZXRQbGFjZWhvbGRlclRleHQoJ1Bhc3RlIHdoYXQgeW91IHdhbnQgdG8gZGlmZiBoZXJlIScpO1xuICAgIC8vIGFkZCBzcGxpdC1kaWZmIGNzcyBzZWxlY3RvciB0byBlZGl0b3JzIGZvciBrZXliaW5kaW5ncyAjNzNcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fZWRpdG9yKS5jbGFzc0xpc3QuYWRkKCdzcGxpdC1kaWZmJyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBvZmZzZXRzIChibGFuayBsaW5lcykgaW50byB0aGUgZWRpdG9yLlxuICAgKlxuICAgKiBAcGFyYW0gbGluZU9mZnNldHMgQW4gYXJyYXkgb2Ygb2Zmc2V0cyAoYmxhbmsgbGluZXMpIHRvIGluc2VydCBpbnRvIHRoaXMgZWRpdG9yLlxuICAgKi9cbiAgc2V0TGluZU9mZnNldHMobGluZU9mZnNldHMpIHtcbiAgICB2YXIgb2Zmc2V0TGluZU51bWJlcnMgPSBPYmplY3Qua2V5cyhsaW5lT2Zmc2V0cykubWFwKGxpbmVOdW1iZXIgPT4gcGFyc2VJbnQobGluZU51bWJlciwgMTApKS5zb3J0KCh4LCB5KSA9PiB4IC0geSk7XG5cbiAgICBmb3IodmFyIG9mZnNldExpbmVOdW1iZXIgb2Ygb2Zmc2V0TGluZU51bWJlcnMpIHtcbiAgICAgIGlmKG9mZnNldExpbmVOdW1iZXIgPT0gMCkge1xuICAgICAgICAvLyBhZGQgYmxvY2sgZGVjb3JhdGlvbiBiZWZvcmUgaWYgYWRkaW5nIHRvIGxpbmUgMFxuICAgICAgICB0aGlzLl9hZGRPZmZzZXREZWNvcmF0aW9uKG9mZnNldExpbmVOdW1iZXItMSwgbGluZU9mZnNldHNbb2Zmc2V0TGluZU51bWJlcl0sICdiZWZvcmUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGFkZCBibG9jayBkZWNvcmF0aW9uIGFmdGVyIGlmIGFkZGluZyB0byBsaW5lcyA+IDBcbiAgICAgICAgdGhpcy5fYWRkT2Zmc2V0RGVjb3JhdGlvbihvZmZzZXRMaW5lTnVtYmVyLTEsIGxpbmVPZmZzZXRzW29mZnNldExpbmVOdW1iZXJdLCAnYWZ0ZXInKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBtYXJrZXIgZm9yIGxpbmUgaGlnaGxpZ2h0LlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnRJbmRleCBUaGUgc3RhcnQgaW5kZXggb2YgdGhlIGxpbmUgY2h1bmsgdG8gaGlnaGxpZ2h0LlxuICAgKiBAcGFyYW0gZW5kSW5kZXggVGhlIGVuZCBpbmRleCBvZiB0aGUgbGluZSBjaHVuayB0byBoaWdobGlnaHQuXG4gICAqIEBwYXJhbSBoaWdobGlnaHRUeXBlIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCB0byBiZSBhcHBsaWVkIHRvIHRoZSBsaW5lLlxuICAgKi9cbiAgaGlnaGxpZ2h0TGluZXMoc3RhcnRJbmRleCwgZW5kSW5kZXgsIGhpZ2hsaWdodFR5cGUpIHtcbiAgICBpZihzdGFydEluZGV4ICE9IGVuZEluZGV4KSB7XG4gICAgICB2YXIgaGlnaGxpZ2h0Q2xhc3MgPSAnc3BsaXQtZGlmZi0nICsgaGlnaGxpZ2h0VHlwZTtcbiAgICAgIHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIodGhpcy5fbGluZU1hcmtlckxheWVyLCBzdGFydEluZGV4LCBlbmRJbmRleCwgaGlnaGxpZ2h0Q2xhc3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbGluZSBtYXJrZXIgbGF5ZXIgaG9sZHMgYWxsIGFkZGVkL3JlbW92ZWQgbGluZSBtYXJrZXJzLlxuICAgKlxuICAgKiBAcmV0dXJuIFRoZSBsaW5lIG1hcmtlciBsYXllci5cbiAgICovXG4gIGdldExpbmVNYXJrZXJMYXllcigpIHtcbiAgICByZXR1cm4gdGhpcy5fbGluZU1hcmtlckxheWVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzZWxlY3Rpb24gbWFya2VyIGxheWVyIGhvbGRzIGFsbCBsaW5lIGhpZ2hsaWdodCBzZWxlY3Rpb24gbWFya2Vycy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgc2VsZWN0aW9uIG1hcmtlciBsYXllci5cbiAgICovXG4gIGdldFNlbGVjdGlvbk1hcmtlckxheWVyKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb25NYXJrZXJMYXllcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHRzIHdvcmRzIGluIGEgZ2l2ZW4gbGluZS5cbiAgICpcbiAgICogQHBhcmFtIGxpbmVOdW1iZXIgVGhlIGxpbmUgbnVtYmVyIHRvIGhpZ2hsaWdodCB3b3JkcyBvbi5cbiAgICogQHBhcmFtIHdvcmREaWZmIEFuIGFycmF5IG9mIG9iamVjdHMgd2hpY2ggbG9vayBsaWtlLi4uXG4gICAqICAgIGFkZGVkOiBib29sZWFuIChub3QgdXNlZClcbiAgICogICAgY291bnQ6IG51bWJlciAobm90IHVzZWQpXG4gICAqICAgIHJlbW92ZWQ6IGJvb2xlYW4gKG5vdCB1c2VkKVxuICAgKiAgICB2YWx1ZTogc3RyaW5nXG4gICAqICAgIGNoYW5nZWQ6IGJvb2xlYW5cbiAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIHdvcmRzLlxuICAgKi9cbiAgc2V0V29yZEhpZ2hsaWdodHMobGluZU51bWJlciwgd29yZERpZmYgPSBbXSwgdHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCkge1xuICAgIHZhciBrbGFzcyA9ICdzcGxpdC1kaWZmLXdvcmQtJyArIHR5cGU7XG4gICAgdmFyIGNvdW50ID0gMDtcblxuICAgIGZvcih2YXIgaT0wOyBpPHdvcmREaWZmLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZih3b3JkRGlmZltpXS52YWx1ZSkgeyAvLyBmaXggZm9yICM0OVxuICAgICAgICAvLyBpZiB0aGVyZSB3YXMgYSBjaGFuZ2VcbiAgICAgICAgLy8gQU5EIG9uZSBvZiB0aGVzZSBpcyB0cnVlOlxuICAgICAgICAvLyBpZiB0aGUgc3RyaW5nIGlzIG5vdCBzcGFjZXMsIGhpZ2hsaWdodFxuICAgICAgICAvLyBPUlxuICAgICAgICAvLyBpZiB0aGUgc3RyaW5nIGlzIHNwYWNlcyBhbmQgd2hpdGVzcGFjZSBub3QgaWdub3JlZCwgaGlnaGxpZ2h0XG4gICAgICAgIGlmKHdvcmREaWZmW2ldLmNoYW5nZWRcbiAgICAgICAgICAmJiAoL1xcUy8udGVzdCh3b3JkRGlmZltpXS52YWx1ZSlcbiAgICAgICAgICB8fCAoIS9cXFMvLnRlc3Qod29yZERpZmZbaV0udmFsdWUpICYmICFpc1doaXRlc3BhY2VJZ25vcmVkKSkpIHtcbiAgICAgICAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW2xpbmVOdW1iZXIsIGNvdW50XSwgW2xpbmVOdW1iZXIsIChjb3VudCArIHdvcmREaWZmW2ldLnZhbHVlLmxlbmd0aCldXSwge2ludmFsaWRhdGU6ICduZXZlcid9KVxuICAgICAgICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IGtsYXNzfSk7XG4gICAgICAgICAgdGhpcy5fbWlzY01hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50ICs9IHdvcmREaWZmW2ldLnZhbHVlLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYWxsIG1hcmtlcnMgYWRkZWQgdG8gdGhpcyBlZGl0b3IgYnkgc3BsaXQtZGlmZi5cbiAgICovXG4gIGRlc3Ryb3lNYXJrZXJzKCkge1xuICAgIHRoaXMuX2xpbmVNYXJrZXJMYXllci5jbGVhcigpO1xuXG4gICAgdGhpcy5fbWlzY01hcmtlcnMuZm9yRWFjaChmdW5jdGlvbihtYXJrZXIpIHtcbiAgICAgIG1hcmtlci5kZXN0cm95KCk7XG4gICAgfSk7XG4gICAgdGhpcy5fbWlzY01hcmtlcnMgPSBbXTtcblxuICAgIHRoaXMuX3NlbGVjdGlvbk1hcmtlckxheWVyLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGluc3RhbmNlIG9mIHRoZSBFZGl0b3JEaWZmRXh0ZW5kZXIgYW5kIGNsZWFucyB1cCBhZnRlciBpdHNlbGYuXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveU1hcmtlcnMoKTtcbiAgICB0aGlzLl9saW5lTWFya2VyTGF5ZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX2VkaXRvci5zZXRQbGFjZWhvbGRlclRleHQodGhpcy5fb2xkUGxhY2Vob2xkZXJUZXh0KTtcbiAgICAvLyByZW1vdmUgc3BsaXQtZGlmZiBjc3Mgc2VsZWN0b3IgZnJvbSBlZGl0b3JzIGZvciBrZXliaW5kaW5ncyAjNzNcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fZWRpdG9yKS5jbGFzc0xpc3QucmVtb3ZlKCdzcGxpdC1kaWZmJyk7XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0cyBsaW5lcy5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0TGluZSBUaGUgbGluZSBudW1iZXIgdGhhdCB0aGUgc2VsZWN0aW9uIHN0YXJ0cyBhdC5cbiAgICogQHBhcmFtIGVuZExpbmUgVGhlIGxpbmUgbnVtYmVyIHRoYXQgdGhlIHNlbGVjdGlvbiBlbmRzIGF0IChub24taW5jbHVzaXZlKS5cbiAgICovXG4gIHNlbGVjdExpbmVzKHN0YXJ0TGluZSwgZW5kTGluZSkge1xuICAgIC8vIGRvbid0IHdhbnQgdG8gaGlnaGxpZ2h0IGlmIHRoZXkgYXJlIHRoZSBzYW1lIChzYW1lIG51bWJlcnMgbWVhbnMgY2h1bmsgaXNcbiAgICAvLyBqdXN0IHBvaW50aW5nIHRvIGEgbG9jYXRpb24gdG8gY29weS10by1yaWdodC9jb3B5LXRvLWxlZnQpXG4gICAgaWYoc3RhcnRMaW5lIDwgZW5kTGluZSkge1xuICAgICAgdGhpcy5fY3JlYXRlTGluZU1hcmtlcih0aGlzLl9zZWxlY3Rpb25NYXJrZXJMYXllciwgc3RhcnRMaW5lLCBlbmRMaW5lLCAnc3BsaXQtZGlmZi1zZWxlY3RlZCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBzZWxlY3Rpb24gbWFya2Vycy5cbiAgICovXG4gIGRlc2VsZWN0QWxsTGluZXMoKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uTWFya2VyTGF5ZXIuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIHRvIHRlc3Qgd2hldGhlciB0aGVyZSBpcyBjdXJyZW50bHkgYW4gYWN0aXZlIHNlbGVjdGlvbiBoaWdobGlnaHQgaW5cbiAgICogdGhlIGVkaXRvci5cbiAgICpcbiAgICogQHJldHVybiBBIGJvb2xlYW4gc2lnbmlmeWluZyB3aGV0aGVyIHRoZXJlIGlzIGFuIGFjdGl2ZSBzZWxlY3Rpb24gaGlnaGxpZ2h0LlxuICAgKi9cbiAgaGFzU2VsZWN0aW9uKCkge1xuICAgIGlmKHRoaXMuX3NlbGVjdGlvbk1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KCkgPiAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZSBzb2Z0IHdyYXAgZm9yIHRoaXMgZWRpdG9yLlxuICAgKi9cbiAgZW5hYmxlU29mdFdyYXAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2VkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdTb2Z0IHdyYXAgd2FzIGVuYWJsZWQgb24gYSB0ZXh0IGVkaXRvciB0aGF0IGRvZXMgbm90IGV4aXN0LicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB0ZXh0IGVkaXRvciB3aXRob3V0IHByb21wdGluZyBhIHNhdmUuXG4gICAqL1xuICBjbGVhblVwKCkge1xuICAgIC8vIGlmIHRoZSBwYW5lIHRoYXQgdGhpcyBlZGl0b3Igd2FzIGluIGlzIG5vdyBlbXB0eSwgd2Ugd2lsbCBkZXN0cm95IGl0XG4gICAgdmFyIGVkaXRvclBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLl9lZGl0b3IpO1xuICAgIGlmKHR5cGVvZiBlZGl0b3JQYW5lICE9PSAndW5kZWZpbmVkJyAmJiBlZGl0b3JQYW5lICE9IG51bGwgJiYgZWRpdG9yUGFuZS5nZXRJdGVtcygpLmxlbmd0aCA9PSAxKSB7XG4gICAgICBlZGl0b3JQYW5lLmRlc3Ryb3koKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZWRpdG9yLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgY3Vyc29yLXRvdWNoZWQgbGluZSByYW5nZXMgdGhhdCBhcmUgbWFya2VkIGFzIGRpZmZlcmVudCBpbiBhbiBlZGl0b3JcbiAgICogdmlldy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgbGluZSByYW5nZXMgb2YgZGlmZnMgdGhhdCBhcmUgdG91Y2hlZCBieSBhIGN1cnNvci5cbiAgICovXG4gIGdldEN1cnNvckRpZmZMaW5lcygpIHtcbiAgICB2YXIgY3Vyc29yUG9zaXRpb25zID0gdGhpcy5fZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpO1xuICAgIHZhciB0b3VjaGVkTGluZXMgPSBbXTtcbiAgICB2YXIgbGluZU1hcmtlcnMgPSB0aGlzLl9saW5lTWFya2VyTGF5ZXIuZ2V0TWFya2VycygpO1xuXG4gICAgZm9yKHZhciBpPTA7IGk8Y3Vyc29yUG9zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IodmFyIGo9MDsgajxsaW5lTWFya2Vycy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgbWFya2VyUmFuZ2UgPSBsaW5lTWFya2Vyc1tqXS5nZXRCdWZmZXJSYW5nZSgpO1xuXG4gICAgICAgIGlmKGN1cnNvclBvc2l0aW9uc1tpXS5yb3cgPj0gbWFya2VyUmFuZ2Uuc3RhcnQucm93XG4gICAgICAgICAgJiYgY3Vyc29yUG9zaXRpb25zW2ldLnJvdyA8IG1hcmtlclJhbmdlLmVuZC5yb3cpIHtcbiAgICAgICAgICB0b3VjaGVkTGluZXMucHVzaChtYXJrZXJSYW5nZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBwdXQgdGhlIGNodW5rcyBpbiBvcmRlciBzbyB0aGUgY29weSBmdW5jdGlvbiBkb2Vzbid0IG1lc3MgdXBcbiAgICB0b3VjaGVkTGluZXMuc29ydChmdW5jdGlvbihsaW5lQSwgbGluZUIpIHtcbiAgICAgIHJldHVybiBsaW5lQS5zdGFydC5yb3cgLSBsaW5lQi5zdGFydC5yb3c7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdG91Y2hlZExpbmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZ2V0IHRoZSBUZXh0IEVkaXRvciBvYmplY3QgZm9yIHRoaXMgdmlldy4gSGVscGZ1bCBmb3IgY2FsbGluZyBiYXNpY1xuICAgKiBBdG9tIFRleHQgRWRpdG9yIGZ1bmN0aW9ucy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgVGV4dCBFZGl0b3Igb2JqZWN0IGZvciB0aGlzIHZpZXcuXG4gICAqL1xuICBnZXRFZGl0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvcjtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQUklWQVRFIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBtYXJrZXIgYW5kIGRlY29yYXRlcyBpdHMgbGluZSBhbmQgbGluZSBudW1iZXIuXG4gICAqXG4gICAqIEBwYXJhbSBtYXJrZXJMYXllciBUaGUgbWFya2VyIGxheWVyIHRvIHB1dCB0aGUgbWFya2VyIGluLlxuICAgKiBAcGFyYW0gc3RhcnRMaW5lTnVtYmVyIEEgYnVmZmVyIGxpbmUgbnVtYmVyIHRvIHN0YXJ0IGhpZ2hsaWdodGluZyBhdC5cbiAgICogQHBhcmFtIGVuZExpbmVOdW1iZXIgQSBidWZmZXIgbGluZSBudW1iZXIgdG8gZW5kIGhpZ2hsaWdodGluZyBhdC5cbiAgICogQHBhcmFtIGhpZ2hsaWdodENsYXNzIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCB0byBiZSBhcHBsaWVkIHRvIHRoZSBsaW5lLlxuICAgKiAgICBDb3VsZCBiZSBhIHZhbHVlIG9mOiBbJ3NwbGl0LWRpZmYtaW5zZXJ0JywgJ3NwbGl0LWRpZmYtZGVsZXRlJyxcbiAgICogICAgJ3NwbGl0LWRpZmYtc2VsZWN0J10uXG4gICAqIEByZXR1cm4gVGhlIGNyZWF0ZWQgbGluZSBtYXJrZXIuXG4gICAqL1xuICBfY3JlYXRlTGluZU1hcmtlcihtYXJrZXJMYXllciwgc3RhcnRMaW5lTnVtYmVyLCBlbmRMaW5lTnVtYmVyLCBoaWdobGlnaHRDbGFzcykge1xuICAgIHZhciBtYXJrZXIgPSBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UoW1tzdGFydExpbmVOdW1iZXIsIDBdLCBbZW5kTGluZU51bWJlciwgMF1dLCB7aW52YWxpZGF0ZTogJ25ldmVyJ30pXG5cbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2xpbmUtbnVtYmVyJywgY2xhc3M6IGhpZ2hsaWdodENsYXNzfSk7XG4gICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdsaW5lJywgY2xhc3M6IGhpZ2hsaWdodENsYXNzfSk7XG5cbiAgICByZXR1cm4gbWFya2VyO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkZWNvcmF0aW9uIGZvciBhbiBvZmZzZXQuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lTnVtYmVyIFRoZSBsaW5lIG51bWJlciB0byBhZGQgdGhlIGJsb2NrIGRlY29yYXRpb24gdG8uXG4gICAqIEBwYXJhbSBudW1iZXJPZkxpbmVzIFRoZSBudW1iZXIgb2YgbGluZXMgdGhhdCB0aGUgYmxvY2sgZGVjb3JhdGlvbidzIGhlaWdodCB3aWxsIGJlLlxuICAgKiBAcGFyYW0gYmxvY2tQb3NpdGlvbiBTcGVjaWZpZXMgd2hldGhlciB0byBwdXQgdGhlIGRlY29yYXRpb24gYmVmb3JlIHRoZSBsaW5lIG9yIGFmdGVyLlxuICAgKi9cbiAgX2FkZE9mZnNldERlY29yYXRpb24obGluZU51bWJlciwgbnVtYmVyT2ZMaW5lcywgYmxvY2tQb3NpdGlvbikge1xuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWxlbWVudC5jbGFzc05hbWUgKz0gJ3NwbGl0LWRpZmYtb2Zmc2V0JztcbiAgICAvLyBpZiBubyB0ZXh0LCBzZXQgaGVpZ2h0IGZvciBibGFuayBsaW5lc1xuICAgIGVsZW1lbnQuc3R5bGUubWluSGVpZ2h0ID0gKG51bWJlck9mTGluZXMgKiB0aGlzLl9lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkpICsgJ3B4JztcblxuICAgIHZhciBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya1NjcmVlblBvc2l0aW9uKFtsaW5lTnVtYmVyLCAwXSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2Jsb2NrJywgcG9zaXRpb246IGJsb2NrUG9zaXRpb24sIGl0ZW06IGVsZW1lbnR9KTtcbiAgICB0aGlzLl9taXNjTWFya2Vycy5wdXNoKG1hcmtlcik7XG4gIH1cbn07XG4iXX0=