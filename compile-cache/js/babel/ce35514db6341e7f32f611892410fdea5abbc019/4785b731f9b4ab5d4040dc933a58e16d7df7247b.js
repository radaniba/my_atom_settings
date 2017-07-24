'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function EditorDiffExtender(editor) {
    _classCallCheck(this, EditorDiffExtender);

    this._editor = editor;
    this._markers = [];
    this._currentSelection = null;
    this._oldPlaceholderText = editor.getPlaceholderText();
    editor.setPlaceholderText('Paste what you want to diff here!');
    // add split-diff css selector to editors for keybindings #73
    atom.views.getView(this._editor).classList.add('split-diff');
  }

  /**
   * Creates a decoration for an offset. Adds the marker to this._markers.
   *
   * @param lineNumber The line number to add the block decoration to.
   * @param numberOfLines The number of lines that the block decoration's height will be.
   * @param blockPosition Specifies whether to put the decoration before the line or after.
   */

  _createClass(EditorDiffExtender, [{
    key: '_addOffsetDecoration',
    value: function _addOffsetDecoration(lineNumber, numberOfLines, blockPosition) {
      var element = document.createElement('div');
      element.className += 'split-diff-offset';
      // if no text, set height for blank lines
      element.style.minHeight = numberOfLines * this._editor.getLineHeightInPixels() + 'px';

      var marker = this._editor.markScreenPosition([lineNumber, 0], { invalidate: 'never' });
      this._editor.decorateMarker(marker, { type: 'block', position: blockPosition, item: element });
      this._markers.push(marker);
    }

    /**
     * Adds offsets (blank lines) into the editor.
     *
     * @param lineOffsets An array of offsets (blank lines) to insert into this editor.
     */
  }, {
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
     * Creates marker for line highlight. Adds it to this._markers.
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
        this._markers.push(this._createLineMarker(startIndex, endIndex, highlightClass));
      }
    }

    /**
     * Creates a marker and decorates its line and line number.
     *
     * @param startLineNumber A buffer line number to start highlighting at.
     * @param endLineNumber A buffer line number to end highlighting at.
     * @param highlightClass The type of highlight to be applied to the line.
     *    Could be a value of: ['split-diff-insert', 'split-diff-delete',
     *    'split-diff-select'].
     * @return The created line marker.
     */
  }, {
    key: '_createLineMarker',
    value: function _createLineMarker(startLineNumber, endLineNumber, highlightClass) {
      var marker = this._editor.markBufferRange([[startLineNumber, 0], [endLineNumber, 0]], { invalidate: 'never', 'class': highlightClass });

      this._editor.decorateMarker(marker, { type: 'line-number', 'class': highlightClass });
      this._editor.decorateMarker(marker, { type: 'line', 'class': highlightClass });

      return marker;
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
            var marker = this._editor.markBufferRange([[lineNumber, count], [lineNumber, count + wordDiff[i].value.length]], { invalidate: 'never', persistent: false, 'class': klass });

            this._editor.decorateMarker(marker, { type: 'highlight', 'class': klass });
            this._markers.push(marker);
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
      for (var i = 0; i < this._markers.length; i++) {
        this._markers[i].destroy();
      }
      this._markers = [];

      this.deselectAllLines();
    }

    /**
     * Destroys the instance of the EditorDiffExtender and cleans up after itself.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.destroyMarkers();
      this._editor.setPlaceholderText(this._oldPlaceholderText);
      // remove split-diff css selector from editors for keybindings #73
      atom.views.getView(this._editor).classList.remove('split-diff');
    }

    /**
     * Not added to this._markers because we want it to persist between updates.
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
        this._currentSelection = this._createLineMarker(startLine, endLine, 'split-diff-selected');
      }
    }

    /**
     * Destroy the selection markers.
     */
  }, {
    key: 'deselectAllLines',
    value: function deselectAllLines() {
      if (this._currentSelection) {
        this._currentSelection.destroy();
        this._currentSelection = null;
      }
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
      if (this._currentSelection) {
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

      for (var i = 0; i < cursorPositions.length; i++) {
        for (var j = 0; j < this._markers.length; j++) {
          var markerRange = this._markers[j].getBufferRange();

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
  }]);

  return EditorDiffExtender;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvZWRpdG9yLWRpZmYtZXh0ZW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxNQUFNLENBQUMsT0FBTztBQUtELFdBTFUsa0JBQWtCLENBSzNCLE1BQU0sRUFBRTswQkFMQyxrQkFBa0I7O0FBTXJDLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7QUFDOUIsUUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ3ZELFVBQU0sQ0FBQyxrQkFBa0IsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDOztBQUUvRCxRQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUM5RDs7Ozs7Ozs7OztlQWJvQixrQkFBa0I7O1dBc0JuQiw4QkFBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBUTtBQUNuRSxVQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVDLGFBQU8sQ0FBQyxTQUFTLElBQUksbUJBQW1CLENBQUM7O0FBRXpDLGFBQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEFBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsR0FBSSxJQUFJLENBQUM7O0FBRXhGLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBQyxVQUFVLEVB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YWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9lZGl0b3ItZGlmZi1leHRlbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRWRpdG9yRGlmZkV4dGVuZGVyIHtcbiAgX2VkaXRvcjogT2JqZWN0O1xuICBfbWFya2VyczogQXJyYXk8YXRvbSRNYXJrZXI+O1xuICBfY3VycmVudFNlbGVjdGlvbjogQXJyYXk8YXRvbSRNYXJrZXI+O1xuXG4gIGNvbnN0cnVjdG9yKGVkaXRvcikge1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fb2xkUGxhY2Vob2xkZXJUZXh0ID0gZWRpdG9yLmdldFBsYWNlaG9sZGVyVGV4dCgpO1xuICAgIGVkaXRvci5zZXRQbGFjZWhvbGRlclRleHQoJ1Bhc3RlIHdoYXQgeW91IHdhbnQgdG8gZGlmZiBoZXJlIScpO1xuICAgIC8vIGFkZCBzcGxpdC1kaWZmIGNzcyBzZWxlY3RvciB0byBlZGl0b3JzIGZvciBrZXliaW5kaW5ncyAjNzNcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fZWRpdG9yKS5jbGFzc0xpc3QuYWRkKCdzcGxpdC1kaWZmJyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRlY29yYXRpb24gZm9yIGFuIG9mZnNldC4gQWRkcyB0aGUgbWFya2VyIHRvIHRoaXMuX21hcmtlcnMuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lTnVtYmVyIFRoZSBsaW5lIG51bWJlciB0byBhZGQgdGhlIGJsb2NrIGRlY29yYXRpb24gdG8uXG4gICAqIEBwYXJhbSBudW1iZXJPZkxpbmVzIFRoZSBudW1iZXIgb2YgbGluZXMgdGhhdCB0aGUgYmxvY2sgZGVjb3JhdGlvbidzIGhlaWdodCB3aWxsIGJlLlxuICAgKiBAcGFyYW0gYmxvY2tQb3NpdGlvbiBTcGVjaWZpZXMgd2hldGhlciB0byBwdXQgdGhlIGRlY29yYXRpb24gYmVmb3JlIHRoZSBsaW5lIG9yIGFmdGVyLlxuICAgKi9cbiAgX2FkZE9mZnNldERlY29yYXRpb24obGluZU51bWJlciwgbnVtYmVyT2ZMaW5lcywgYmxvY2tQb3NpdGlvbik6IHZvaWQge1xuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWxlbWVudC5jbGFzc05hbWUgKz0gJ3NwbGl0LWRpZmYtb2Zmc2V0JztcbiAgICAvLyBpZiBubyB0ZXh0LCBzZXQgaGVpZ2h0IGZvciBibGFuayBsaW5lc1xuICAgIGVsZW1lbnQuc3R5bGUubWluSGVpZ2h0ID0gKG51bWJlck9mTGluZXMgKiB0aGlzLl9lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkpICsgJ3B4JztcblxuICAgIHZhciBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya1NjcmVlblBvc2l0aW9uKFtsaW5lTnVtYmVyLCAwXSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2Jsb2NrJywgcG9zaXRpb246IGJsb2NrUG9zaXRpb24sIGl0ZW06IGVsZW1lbnR9KTtcbiAgICB0aGlzLl9tYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIG9mZnNldHMgKGJsYW5rIGxpbmVzKSBpbnRvIHRoZSBlZGl0b3IuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lT2Zmc2V0cyBBbiBhcnJheSBvZiBvZmZzZXRzIChibGFuayBsaW5lcykgdG8gaW5zZXJ0IGludG8gdGhpcyBlZGl0b3IuXG4gICAqL1xuICBzZXRMaW5lT2Zmc2V0cyhsaW5lT2Zmc2V0czogYW55KTogdm9pZCB7XG4gICAgdmFyIG9mZnNldExpbmVOdW1iZXJzID0gT2JqZWN0LmtleXMobGluZU9mZnNldHMpLm1hcChsaW5lTnVtYmVyID0+IHBhcnNlSW50KGxpbmVOdW1iZXIsIDEwKSkuc29ydCgoeCwgeSkgPT4geCAtIHkpO1xuXG4gICAgZm9yICh2YXIgb2Zmc2V0TGluZU51bWJlciBvZiBvZmZzZXRMaW5lTnVtYmVycykge1xuICAgICAgaWYgKG9mZnNldExpbmVOdW1iZXIgPT0gMCkge1xuICAgICAgICAvLyBhZGQgYmxvY2sgZGVjb3JhdGlvbiBiZWZvcmUgaWYgYWRkaW5nIHRvIGxpbmUgMFxuICAgICAgICB0aGlzLl9hZGRPZmZzZXREZWNvcmF0aW9uKG9mZnNldExpbmVOdW1iZXItMSwgbGluZU9mZnNldHNbb2Zmc2V0TGluZU51bWJlcl0sICdiZWZvcmUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGFkZCBibG9jayBkZWNvcmF0aW9uIGFmdGVyIGlmIGFkZGluZyB0byBsaW5lcyA+IDBcbiAgICAgICAgdGhpcy5fYWRkT2Zmc2V0RGVjb3JhdGlvbihvZmZzZXRMaW5lTnVtYmVyLTEsIGxpbmVPZmZzZXRzW29mZnNldExpbmVOdW1iZXJdLCAnYWZ0ZXInKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBtYXJrZXIgZm9yIGxpbmUgaGlnaGxpZ2h0LiBBZGRzIGl0IHRvIHRoaXMuX21hcmtlcnMuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydEluZGV4IFRoZSBzdGFydCBpbmRleCBvZiB0aGUgbGluZSBjaHVuayB0byBoaWdobGlnaHQuXG4gICAqIEBwYXJhbSBlbmRJbmRleCBUaGUgZW5kIGluZGV4IG9mIHRoZSBsaW5lIGNodW5rIHRvIGhpZ2hsaWdodC5cbiAgICogQHBhcmFtIGhpZ2hsaWdodFR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGxpbmUuXG4gICAqL1xuICBoaWdobGlnaHRMaW5lcyggc3RhcnRJbmRleCwgZW5kSW5kZXgsIGhpZ2hsaWdodFR5cGUgKSB7XG4gICAgaWYoIHN0YXJ0SW5kZXggIT0gZW5kSW5kZXggKSB7XG4gICAgICB2YXIgaGlnaGxpZ2h0Q2xhc3MgPSAnc3BsaXQtZGlmZi0nICsgaGlnaGxpZ2h0VHlwZTtcbiAgICAgIHRoaXMuX21hcmtlcnMucHVzaCggdGhpcy5fY3JlYXRlTGluZU1hcmtlciggc3RhcnRJbmRleCwgZW5kSW5kZXgsIGhpZ2hsaWdodENsYXNzICkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG1hcmtlciBhbmQgZGVjb3JhdGVzIGl0cyBsaW5lIGFuZCBsaW5lIG51bWJlci5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0TGluZU51bWJlciBBIGJ1ZmZlciBsaW5lIG51bWJlciB0byBzdGFydCBoaWdobGlnaHRpbmcgYXQuXG4gICAqIEBwYXJhbSBlbmRMaW5lTnVtYmVyIEEgYnVmZmVyIGxpbmUgbnVtYmVyIHRvIGVuZCBoaWdobGlnaHRpbmcgYXQuXG4gICAqIEBwYXJhbSBoaWdobGlnaHRDbGFzcyBUaGUgdHlwZSBvZiBoaWdobGlnaHQgdG8gYmUgYXBwbGllZCB0byB0aGUgbGluZS5cbiAgICogICAgQ291bGQgYmUgYSB2YWx1ZSBvZjogWydzcGxpdC1kaWZmLWluc2VydCcsICdzcGxpdC1kaWZmLWRlbGV0ZScsXG4gICAqICAgICdzcGxpdC1kaWZmLXNlbGVjdCddLlxuICAgKiBAcmV0dXJuIFRoZSBjcmVhdGVkIGxpbmUgbWFya2VyLlxuICAgKi9cbiAgX2NyZWF0ZUxpbmVNYXJrZXIoc3RhcnRMaW5lTnVtYmVyOiBudW1iZXIsIGVuZExpbmVOdW1iZXI6IG51bWJlciwgaGlnaGxpZ2h0Q2xhc3M6IHN0cmluZyk6IGF0b20kTWFya2VyIHtcbiAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW3N0YXJ0TGluZU51bWJlciwgMF0sIFtlbmRMaW5lTnVtYmVyLCAwXV0sIHtpbnZhbGlkYXRlOiAnbmV2ZXInLCBjbGFzczogaGlnaGxpZ2h0Q2xhc3N9KVxuXG4gICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdsaW5lLW51bWJlcicsIGNsYXNzOiBoaWdobGlnaHRDbGFzc30pO1xuICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnbGluZScsIGNsYXNzOiBoaWdobGlnaHRDbGFzc30pO1xuXG4gICAgcmV0dXJuIG1hcmtlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHRzIHdvcmRzIGluIGEgZ2l2ZW4gbGluZS5cbiAgICpcbiAgICogQHBhcmFtIGxpbmVOdW1iZXIgVGhlIGxpbmUgbnVtYmVyIHRvIGhpZ2hsaWdodCB3b3JkcyBvbi5cbiAgICogQHBhcmFtIHdvcmREaWZmIEFuIGFycmF5IG9mIG9iamVjdHMgd2hpY2ggbG9vayBsaWtlLi4uXG4gICAqICAgIGFkZGVkOiBib29sZWFuIChub3QgdXNlZClcbiAgICogICAgY291bnQ6IG51bWJlciAobm90IHVzZWQpXG4gICAqICAgIHJlbW92ZWQ6IGJvb2xlYW4gKG5vdCB1c2VkKVxuICAgKiAgICB2YWx1ZTogc3RyaW5nXG4gICAqICAgIGNoYW5nZWQ6IGJvb2xlYW5cbiAgICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIHdvcmRzLlxuICAgKi9cbiAgc2V0V29yZEhpZ2hsaWdodHMobGluZU51bWJlcjogbnVtYmVyLCB3b3JkRGlmZjogQXJyYXk8YW55PiA9IFtdLCB0eXBlOiBzdHJpbmcsIGlzV2hpdGVzcGFjZUlnbm9yZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB2YXIga2xhc3MgPSAnc3BsaXQtZGlmZi13b3JkLScgKyB0eXBlO1xuICAgIHZhciBjb3VudCA9IDA7XG5cbiAgICBmb3IgKHZhciBpPTA7IGk8d29yZERpZmYubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh3b3JkRGlmZltpXS52YWx1ZSkgeyAvLyBmaXggZm9yICM0OVxuICAgICAgICAvLyBpZiB0aGVyZSB3YXMgYSBjaGFuZ2VcbiAgICAgICAgLy8gQU5EIG9uZSBvZiB0aGVzZSBpcyB0cnVlOlxuICAgICAgICAvLyBpZiB0aGUgc3RyaW5nIGlzIG5vdCBzcGFjZXMsIGhpZ2hsaWdodFxuICAgICAgICAvLyBPUlxuICAgICAgICAvLyBpZiB0aGUgc3RyaW5nIGlzIHNwYWNlcyBhbmQgd2hpdGVzcGFjZSBub3QgaWdub3JlZCwgaGlnaGxpZ2h0XG4gICAgICAgIGlmICh3b3JkRGlmZltpXS5jaGFuZ2VkXG4gICAgICAgICAgJiYgKC9cXFMvLnRlc3Qod29yZERpZmZbaV0udmFsdWUpXG4gICAgICAgICAgfHwgKCEvXFxTLy50ZXN0KHdvcmREaWZmW2ldLnZhbHVlKSAmJiAhaXNXaGl0ZXNwYWNlSWdub3JlZCkpKSB7XG4gICAgICAgICAgdmFyIG1hcmtlciA9IHRoaXMuX2VkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1tsaW5lTnVtYmVyLCBjb3VudF0sIFtsaW5lTnVtYmVyLCAoY291bnQgKyB3b3JkRGlmZltpXS52YWx1ZS5sZW5ndGgpXV0sIHtpbnZhbGlkYXRlOiAnbmV2ZXInLCBwZXJzaXN0ZW50OiBmYWxzZSwgY2xhc3M6IGtsYXNzfSlcblxuICAgICAgICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IGtsYXNzfSk7XG4gICAgICAgICAgdGhpcy5fbWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICAgICAgIH1cbiAgICAgICAgY291bnQgKz0gd29yZERpZmZbaV0udmFsdWUubGVuZ3RoO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbGwgbWFya2VycyBhZGRlZCB0byB0aGlzIGVkaXRvciBieSBzcGxpdC1kaWZmLlxuICAgKi9cbiAgZGVzdHJveU1hcmtlcnMoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaT0wOyBpPHRoaXMuX21hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX21hcmtlcnNbaV0uZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl9tYXJrZXJzID0gW107XG5cbiAgICB0aGlzLmRlc2VsZWN0QWxsTGluZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgaW5zdGFuY2Ugb2YgdGhlIEVkaXRvckRpZmZFeHRlbmRlciBhbmQgY2xlYW5zIHVwIGFmdGVyIGl0c2VsZi5cbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICB0aGlzLmRlc3Ryb3lNYXJrZXJzKCk7XG4gICAgICB0aGlzLl9lZGl0b3Iuc2V0UGxhY2Vob2xkZXJUZXh0KHRoaXMuX29sZFBsYWNlaG9sZGVyVGV4dCk7XG4gICAgICAvLyByZW1vdmUgc3BsaXQtZGlmZiBjc3Mgc2VsZWN0b3IgZnJvbSBlZGl0b3JzIGZvciBrZXliaW5kaW5ncyAjNzNcbiAgICAgIGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9lZGl0b3IpLmNsYXNzTGlzdC5yZW1vdmUoJ3NwbGl0LWRpZmYnKVxuICB9XG5cbiAgLyoqXG4gICAqIE5vdCBhZGRlZCB0byB0aGlzLl9tYXJrZXJzIGJlY2F1c2Ugd2Ugd2FudCBpdCB0byBwZXJzaXN0IGJldHdlZW4gdXBkYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0TGluZSBUaGUgbGluZSBudW1iZXIgdGhhdCB0aGUgc2VsZWN0aW9uIHN0YXJ0cyBhdC5cbiAgICogQHBhcmFtIGVuZExpbmUgVGhlIGxpbmUgbnVtYmVyIHRoYXQgdGhlIHNlbGVjdGlvbiBlbmRzIGF0IChub24taW5jbHVzaXZlKS5cbiAgICovXG4gIHNlbGVjdExpbmVzKHN0YXJ0TGluZTogbnVtYmVyLCBlbmRMaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBkb24ndCB3YW50IHRvIGhpZ2hsaWdodCBpZiB0aGV5IGFyZSB0aGUgc2FtZSAoc2FtZSBudW1iZXJzIG1lYW5zIGNodW5rIGlzXG4gICAgLy8ganVzdCBwb2ludGluZyB0byBhIGxvY2F0aW9uIHRvIGNvcHktdG8tcmlnaHQvY29weS10by1sZWZ0KVxuICAgIGlmIChzdGFydExpbmUgPCBlbmRMaW5lKSB7XG4gICAgICB0aGlzLl9jdXJyZW50U2VsZWN0aW9uID0gdGhpcy5fY3JlYXRlTGluZU1hcmtlcihzdGFydExpbmUsIGVuZExpbmUsICdzcGxpdC1kaWZmLXNlbGVjdGVkJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIHNlbGVjdGlvbiBtYXJrZXJzLlxuICAgKi9cbiAgZGVzZWxlY3RBbGxMaW5lcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY3VycmVudFNlbGVjdGlvbikge1xuICAgICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbi5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9jdXJyZW50U2VsZWN0aW9uID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXNlZCB0byB0ZXN0IHdoZXRoZXIgdGhlcmUgaXMgY3VycmVudGx5IGFuIGFjdGl2ZSBzZWxlY3Rpb24gaGlnaGxpZ2h0IGluXG4gICAqIHRoZSBlZGl0b3IuXG4gICAqXG4gICAqIEByZXR1cm4gQSBib29sZWFuIHNpZ25pZnlpbmcgd2hldGhlciB0aGVyZSBpcyBhbiBhY3RpdmUgc2VsZWN0aW9uIGhpZ2hsaWdodC5cbiAgICovXG4gIGhhc1NlbGVjdGlvbigpOiBib29sZWFuIHtcbiAgICBpZih0aGlzLl9jdXJyZW50U2VsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlIHNvZnQgd3JhcCBmb3IgdGhpcyBlZGl0b3IuXG4gICAqL1xuICBlbmFibGVTb2Z0V3JhcCgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fZWRpdG9yLnNldFNvZnRXcmFwcGVkKHRydWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ1NvZnQgd3JhcCB3YXMgZW5hYmxlZCBvbiBhIHRleHQgZWRpdG9yIHRoYXQgZG9lcyBub3QgZXhpc3QuJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIHRleHQgZWRpdG9yIHdpdGhvdXQgcHJvbXB0aW5nIGEgc2F2ZS5cbiAgICovXG4gIGNsZWFuVXAoKTogdm9pZCB7XG4gICAgLy8gaWYgdGhlIHBhbmUgdGhhdCB0aGlzIGVkaXRvciB3YXMgaW4gaXMgbm93IGVtcHR5LCB3ZSB3aWxsIGRlc3Ryb3kgaXRcbiAgICB2YXIgZWRpdG9yUGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMuX2VkaXRvcik7XG4gICAgaWYgKHR5cGVvZiBlZGl0b3JQYW5lICE9PSAndW5kZWZpbmVkJyAmJiBlZGl0b3JQYW5lICE9IG51bGwgJiYgZWRpdG9yUGFuZS5nZXRJdGVtcygpLmxlbmd0aCA9PSAxKSB7XG4gICAgICBlZGl0b3JQYW5lLmRlc3Ryb3koKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZWRpdG9yLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgY3Vyc29yLXRvdWNoZWQgbGluZSByYW5nZXMgdGhhdCBhcmUgbWFya2VkIGFzIGRpZmZlcmVudCBpbiBhbiBlZGl0b3JcbiAgICogdmlldy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgbGluZSByYW5nZXMgb2YgZGlmZnMgdGhhdCBhcmUgdG91Y2hlZCBieSBhIGN1cnNvci5cbiAgICovXG4gIGdldEN1cnNvckRpZmZMaW5lcygpOiBhbnkge1xuICAgIHZhciBjdXJzb3JQb3NpdGlvbnMgPSB0aGlzLl9lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCk7XG4gICAgdmFyIHRvdWNoZWRMaW5lcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaT0wOyBpPGN1cnNvclBvc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yICh2YXIgaj0wOyBqPHRoaXMuX21hcmtlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIG1hcmtlclJhbmdlID0gdGhpcy5fbWFya2Vyc1tqXS5nZXRCdWZmZXJSYW5nZSgpO1xuXG4gICAgICAgIGlmIChjdXJzb3JQb3NpdGlvbnNbaV0ucm93ID49IG1hcmtlclJhbmdlLnN0YXJ0LnJvd1xuICAgICAgICAgICYmIGN1cnNvclBvc2l0aW9uc1tpXS5yb3cgPCBtYXJrZXJSYW5nZS5lbmQucm93KSB7XG4gICAgICAgICAgICB0b3VjaGVkTGluZXMucHVzaChtYXJrZXJSYW5nZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHB1dCB0aGUgY2h1bmtzIGluIG9yZGVyIHNvIHRoZSBjb3B5IGZ1bmN0aW9uIGRvZXNuJ3QgbWVzcyB1cFxuICAgIHRvdWNoZWRMaW5lcy5zb3J0KGZ1bmN0aW9uKGxpbmVBLCBsaW5lQikge1xuICAgICAgcmV0dXJuIGxpbmVBLnN0YXJ0LnJvdyAtIGxpbmVCLnN0YXJ0LnJvdztcbiAgICB9KTtcblxuICAgIHJldHVybiB0b3VjaGVkTGluZXM7XG4gIH1cblxuICAvKipcbiAgICogVXNlZCB0byBnZXQgdGhlIFRleHQgRWRpdG9yIG9iamVjdCBmb3IgdGhpcyB2aWV3LiBIZWxwZnVsIGZvciBjYWxsaW5nIGJhc2ljXG4gICAqIEF0b20gVGV4dCBFZGl0b3IgZnVuY3Rpb25zLlxuICAgKlxuICAgKiBAcmV0dXJuIFRoZSBUZXh0IEVkaXRvciBvYmplY3QgZm9yIHRoaXMgdmlldy5cbiAgICovXG4gIGdldEVkaXRvcigpOiBUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdG9yO1xuICB9XG59O1xuIl19