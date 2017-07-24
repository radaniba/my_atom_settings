var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _editorDiffExtender = require('./editor-diff-extender');

var _editorDiffExtender2 = _interopRequireDefault(_editorDiffExtender);

var _computeWordDiff = require('./compute-word-diff');

var _computeWordDiff2 = _interopRequireDefault(_computeWordDiff);

'use babel';

module.exports = (function () {
  /*
   * @param editors Array of editors being diffed.
   */

  function DiffView(editors) {
    _classCallCheck(this, DiffView);

    this._editorDiffExtender1 = new _editorDiffExtender2['default'](editors.editor1);
    this._editorDiffExtender2 = new _editorDiffExtender2['default'](editors.editor2);
    this._chunks = [];
    this._isSelectionActive = false;
    this._selectedChunkIndex = 0;
    this._COPY_HELP_MESSAGE = 'No differences selected.';
    this._markerLayers = {};
  }

  /**
   * Adds highlighting to the editors to show the diff.
   *
   * @param diff The diff to highlight.
   * @param leftHighlightType The type of highlight (ex: 'added').
   * @param rightHighlightType The type of highlight (ex: 'removed').
   * @param isWordDiffEnabled Whether differences between words per line should be highlighted.
   * @param isWhitespaceIgnored Whether whitespace should be ignored.
   */

  _createClass(DiffView, [{
    key: 'displayDiff',
    value: function displayDiff(diff, leftHighlightType, rightHighlightType, isWordDiffEnabled, isWhitespaceIgnored) {
      this._chunks = diff.chunks || [];

      // make the last chunk equal size on both screens so the editors retain sync scroll #58
      if (this.getNumDifferences() > 0) {
        var lastChunk = this._chunks[this._chunks.length - 1];
        var oldChunkRange = lastChunk.oldLineEnd - lastChunk.oldLineStart;
        var newChunkRange = lastChunk.newLineEnd - lastChunk.newLineStart;
        if (oldChunkRange > newChunkRange) {
          // make the offset as large as needed to make the chunk the same size in both editors
          diff.newLineOffsets[lastChunk.newLineStart + newChunkRange] = oldChunkRange - newChunkRange;
        } else if (newChunkRange > oldChunkRange) {
          // make the offset as large as needed to make the chunk the same size in both editors
          diff.oldLineOffsets[lastChunk.oldLineStart + oldChunkRange] = newChunkRange - oldChunkRange;
        }
      }

      for (var chunk of this._chunks) {
        this._editorDiffExtender1.highlightLines(chunk.oldLineStart, chunk.oldLineEnd, leftHighlightType);
        this._editorDiffExtender2.highlightLines(chunk.newLineStart, chunk.newLineEnd, rightHighlightType);

        if (isWordDiffEnabled) {
          this._highlightWordsInChunk(chunk, leftHighlightType, rightHighlightType, isWhitespaceIgnored);
        }
      }

      this._editorDiffExtender1.setLineOffsets(diff.oldLineOffsets);
      this._editorDiffExtender2.setLineOffsets(diff.newLineOffsets);

      this._markerLayers = {
        editor1: {
          id: this._editorDiffExtender1.getEditor().id,
          lineMarkerLayer: this._editorDiffExtender1.getLineMarkerLayer(),
          highlightType: leftHighlightType,
          selectionMarkerLayer: this._editorDiffExtender1.getSelectionMarkerLayer()
        },
        editor2: {
          id: this._editorDiffExtender2.getEditor().id,
          lineMarkerLayer: this._editorDiffExtender2.getLineMarkerLayer(),
          highlightType: rightHighlightType,
          selectionMarkerLayer: this._editorDiffExtender2.getSelectionMarkerLayer()
        }
      };
    }

    /**
     * Clears the diff highlighting and offsets from the editors.
     */
  }, {
    key: 'clearDiff',
    value: function clearDiff() {
      this._editorDiffExtender1.destroyMarkers();
      this._editorDiffExtender2.destroyMarkers();
    }

    /**
     * Called to move the current selection highlight to the next diff chunk.
     */
  }, {
    key: 'nextDiff',
    value: function nextDiff() {
      if (this._isSelectionActive) {
        this._selectedChunkIndex++;
        if (this._selectedChunkIndex >= this.getNumDifferences()) {
          this._selectedChunkIndex = 0;
        }
      } else {
        this._isSelectionActive = true;
      }

      this._selectChunk(this._selectedChunkIndex, true);
      return this._selectedChunkIndex;
    }

    /**
     * Called to move the current selection highlight to the previous diff chunk.
     */
  }, {
    key: 'prevDiff',
    value: function prevDiff() {
      if (this._isSelectionActive) {
        this._selectedChunkIndex--;
        if (this._selectedChunkIndex < 0) {
          this._selectedChunkIndex = this.getNumDifferences() - 1;
        }
      } else {
        this._isSelectionActive = true;
      }

      this._selectChunk(this._selectedChunkIndex, true);
      return this._selectedChunkIndex;
    }

    /**
     * Copies the currently selected diff chunk from the left editor to the right
     * editor.
     */
  }, {
    key: 'copyToRight',
    value: function copyToRight() {
      var foundSelection = false;
      var offset = 0; // keep track of line offset (used when there are multiple chunks being moved)

      for (var diffChunk of this._chunks) {
        if (diffChunk.isSelected) {
          foundSelection = true;

          var textToCopy = this._editorDiffExtender1.getEditor().getTextInBufferRange([[diffChunk.oldLineStart, 0], [diffChunk.oldLineEnd, 0]]);
          var lastBufferRow = this._editorDiffExtender2.getEditor().getLastBufferRow();

          // insert new line if the chunk we want to copy will be below the last line of the other editor
          if (diffChunk.newLineStart + offset > lastBufferRow) {
            this._editorDiffExtender2.getEditor().setCursorBufferPosition([lastBufferRow, 0], { autoscroll: false });
            this._editorDiffExtender2.getEditor().insertNewline();
          }

          this._editorDiffExtender2.getEditor().setTextInBufferRange([[diffChunk.newLineStart + offset, 0], [diffChunk.newLineEnd + offset, 0]], textToCopy);
          // offset will be the amount of lines to be copied minus the amount of lines overwritten
          offset += diffChunk.oldLineEnd - diffChunk.oldLineStart - (diffChunk.newLineEnd - diffChunk.newLineStart);
          // move the selection pointer back so the next diff chunk is not skipped
          if (this._editorDiffExtender1.hasSelection() || this._editorDiffExtender2.hasSelection()) {
            this._selectedChunkIndex--;
          }
        }
      }

      if (!foundSelection) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }
    }

    /**
     * Copies the currently selected diff chunk from the right editor to the left
     * editor.
     */
  }, {
    key: 'copyToLeft',
    value: function copyToLeft() {
      var foundSelection = false;
      var offset = 0; // keep track of line offset (used when there are multiple chunks being moved)

      for (var diffChunk of this._chunks) {
        if (diffChunk.isSelected) {
          foundSelection = true;

          var textToCopy = this._editorDiffExtender2.getEditor().getTextInBufferRange([[diffChunk.newLineStart, 0], [diffChunk.newLineEnd, 0]]);
          var lastBufferRow = this._editorDiffExtender1.getEditor().getLastBufferRow();
          // insert new line if the chunk we want to copy will be below the last line of the other editor
          if (diffChunk.oldLineStart + offset > lastBufferRow) {
            this._editorDiffExtender1.getEditor().setCursorBufferPosition([lastBufferRow, 0], { autoscroll: false });
            this._editorDiffExtender1.getEditor().insertNewline();
          }

          this._editorDiffExtender1.getEditor().setTextInBufferRange([[diffChunk.oldLineStart + offset, 0], [diffChunk.oldLineEnd + offset, 0]], textToCopy);
          // offset will be the amount of lines to be copied minus the amount of lines overwritten
          offset += diffChunk.newLineEnd - diffChunk.newLineStart - (diffChunk.oldLineEnd - diffChunk.oldLineStart);
          // move the selection pointer back so the next diff chunk is not skipped
          if (this._editorDiffExtender1.hasSelection() || this._editorDiffExtender2.hasSelection()) {
            this._selectedChunkIndex--;
          }
        }
      }

      if (!foundSelection) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }
    }

    /**
     * Cleans up the editor indicated by index. A clean up will remove the editor
     * or the pane if necessary. Typically left editor == 1 and right editor == 2.
     *
     * @param editorIndex The index of the editor to clean up.
     */
  }, {
    key: 'cleanUpEditor',
    value: function cleanUpEditor(editorIndex) {
      if (editorIndex === 1) {
        this._editorDiffExtender1.cleanUp();
      } else if (editorIndex === 2) {
        this._editorDiffExtender2.cleanUp();
      }
    }

    /**
     * Destroys the editor diff extenders.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this._editorDiffExtender1.destroy();
      this._editorDiffExtender2.destroy();
    }

    /**
     * Gets the number of differences between the editors.
     *
     * @return int The number of differences between the editors.
     */
  }, {
    key: 'getNumDifferences',
    value: function getNumDifferences() {
      return Array.isArray(this._chunks) ? this._chunks.length : 0;
    }
  }, {
    key: 'getMarkerLayers',
    value: function getMarkerLayers() {
      return this._markerLayers;
    }
  }, {
    key: 'handleCursorChange',
    value: function handleCursorChange(cursor, oldBufferPosition, newBufferPosition) {
      var editorIndex = cursor.editor === this._editorDiffExtender1.getEditor() ? 1 : 2;
      var oldPositionChunkIndex = this._getChunkIndexByLineNumber(editorIndex, oldBufferPosition.row);
      var newPositionChunkIndex = this._getChunkIndexByLineNumber(editorIndex, newBufferPosition.row);

      if (oldPositionChunkIndex >= 0) {
        var diffChunk = this._chunks[oldPositionChunkIndex];
        diffChunk.isSelected = false;
        this._editorDiffExtender1.deselectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
        this._editorDiffExtender2.deselectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
      }
      if (newPositionChunkIndex >= 0) {
        this._selectChunk(newPositionChunkIndex, false);
      }
    }

    // ----------------------------------------------------------------------- //
    // --------------------------- PRIVATE METHODS --------------------------- //
    // ----------------------------------------------------------------------- //

    /**
     * Selects and highlights the diff chunk in both editors according to the
     * given index.
     *
     * @param index The index of the diff chunk to highlight in both editors.
     */
  }, {
    key: '_selectChunk',
    value: function _selectChunk(index, isNextOrPrev) {
      var diffChunk = this._chunks[index];
      if (diffChunk != null) {
        diffChunk.isSelected = true;

        if (isNextOrPrev) {
          // deselect previous next/prev highlights
          this._editorDiffExtender1.deselectAllLines();
          this._editorDiffExtender2.deselectAllLines();
          // scroll the editors
          this._editorDiffExtender1.getEditor().setCursorBufferPosition([diffChunk.oldLineStart, 0], { autoscroll: true });
          this._editorDiffExtender2.getEditor().setCursorBufferPosition([diffChunk.newLineStart, 0], { autoscroll: true });
        }

        // highlight selection in both editors
        this._editorDiffExtender1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
        this._editorDiffExtender2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
      }
    }
  }, {
    key: '_getChunkIndexByLineNumber',
    value: function _getChunkIndexByLineNumber(editorIndex, lineNumber) {
      for (var i = 0; i < this._chunks.length; i++) {
        var diffChunk = this._chunks[i];
        if (editorIndex === 1) {
          if (diffChunk.oldLineStart <= lineNumber && diffChunk.oldLineEnd > lineNumber) {
            return i;
          }
        } else if (editorIndex === 2) {
          if (diffChunk.newLineStart <= lineNumber && diffChunk.newLineEnd > lineNumber) {
            return i;
          }
        }
      }

      return -1;
    }

    /**
     * Highlights the word diff of the chunk passed in.
     *
     * @param chunk The chunk that should have its words highlighted.
     */
  }, {
    key: '_highlightWordsInChunk',
    value: function _highlightWordsInChunk(chunk, leftHighlightType, rightHighlightType, isWhitespaceIgnored) {
      var leftLineNumber = chunk.oldLineStart;
      var rightLineNumber = chunk.newLineStart;
      // for each line that has a corresponding line
      while (leftLineNumber < chunk.oldLineEnd && rightLineNumber < chunk.newLineEnd) {
        var editor1LineText = this._editorDiffExtender1.getEditor().lineTextForBufferRow(leftLineNumber);
        var editor2LineText = this._editorDiffExtender2.getEditor().lineTextForBufferRow(rightLineNumber);

        if (editor1LineText == '') {
          // computeWordDiff returns empty for lines that are paired with empty lines
          // need to force a highlight
          this._editorDiffExtender2.setWordHighlights(rightLineNumber, [{ changed: true, value: editor2LineText }], rightHighlightType, isWhitespaceIgnored);
        } else if (editor2LineText == '') {
          // computeWordDiff returns empty for lines that are paired with empty lines
          // need to force a highlight
          this._editorDiffExtender1.setWordHighlights(leftLineNumber, [{ changed: true, value: editor1LineText }], leftHighlightType, isWhitespaceIgnored);
        } else {
          // perform regular word diff
          var wordDiff = _computeWordDiff2['default'].computeWordDiff(editor1LineText, editor2LineText);
          this._editorDiffExtender1.setWordHighlights(leftLineNumber, wordDiff.removedWords, leftHighlightType, isWhitespaceIgnored);
          this._editorDiffExtender2.setWordHighlights(rightLineNumber, wordDiff.addedWords, rightHighlightType, isWhitespaceIgnored);
        }

        leftLineNumber++;
        rightLineNumber++;
      }

      // highlight remaining lines in left editor
      while (leftLineNumber < chunk.oldLineEnd) {
        var editor1LineText = this._editorDiffExtender1.getEditor().lineTextForBufferRow(leftLineNumber);
        this._editorDiffExtender1.setWordHighlights(leftLineNumber, [{ changed: true, value: editor1LineText }], leftHighlightType, isWhitespaceIgnored);
        leftLineNumber++;
      }
      // highlight remaining lines in the right editor
      while (rightLineNumber < chunk.newLineEnd) {
        this._editorDiffExtender2.setWordHighlights(rightLineNumber, [{ changed: true, value: this._editorDiffExtender2.getEditor().lineTextForBufferRow(rightLineNumber) }], rightHighlightType, isWhitespaceIgnored);
        rightLineNumber++;
      }
    }
  }]);

  return DiffView;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvZGlmZi12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztrQ0FFK0Isd0JBQXdCOzs7OytCQUMzQixxQkFBcUI7Ozs7QUFIakQsV0FBVyxDQUFBOztBQU1YLE1BQU0sQ0FBQyxPQUFPOzs7OztBQUlELFdBSlUsUUFBUSxDQUlqQixPQUFPLEVBQUU7MEJBSkEsUUFBUTs7QUFLM0IsUUFBSSxDQUFDLG9CQUFvQixHQUFHLG9DQUF1QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEUsUUFBSSxDQUFDLG9CQUFvQixHQUFHLG9DQUF1QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEUsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsUUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztBQUNoQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRywwQkFBMEIsQ0FBQztBQUNyRCxRQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztHQUN6Qjs7Ozs7Ozs7Ozs7O2VBWm9CLFFBQVE7O1dBdUJsQixxQkFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUU7QUFDL0YsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQzs7O0FBR2pDLFVBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQy9CLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEQsWUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDLFVBQVUsR0FBRyxT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ZUFBZSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNqRyxZQUFJLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUMsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDL0ksc0JBQWMsRUFBRSxDQUFDO09BQ2xCOztBQUVELGFBQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUU7QUFDeEMsWUFBSSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxFQUFDLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQzdNLHVCQUFlLEVBQUUsQ0FBQztPQUNuQjtLQUNGOzs7U0FsVW9CLFFBQVE7SUFtVTlCLENBQUMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9kaWZmLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgRWRpdG9yRGlmZkV4dGVuZGVyIGZyb20gJy4vZWRpdG9yLWRpZmYtZXh0ZW5kZXInO1xuaW1wb3J0IENvbXB1dGVXb3JkRGlmZiBmcm9tICcuL2NvbXB1dGUtd29yZC1kaWZmJztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERpZmZWaWV3IHtcbiAgLypcbiAgICogQHBhcmFtIGVkaXRvcnMgQXJyYXkgb2YgZWRpdG9ycyBiZWluZyBkaWZmZWQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlZGl0b3JzKSB7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMSA9IG5ldyBFZGl0b3JEaWZmRXh0ZW5kZXIoZWRpdG9ycy5lZGl0b3IxKTtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyID0gbmV3IEVkaXRvckRpZmZFeHRlbmRlcihlZGl0b3JzLmVkaXRvcjIpO1xuICAgIHRoaXMuX2NodW5rcyA9IFtdO1xuICAgIHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ID0gMDtcbiAgICB0aGlzLl9DT1BZX0hFTFBfTUVTU0FHRSA9ICdObyBkaWZmZXJlbmNlcyBzZWxlY3RlZC4nO1xuICAgIHRoaXMuX21hcmtlckxheWVycyA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgaGlnaGxpZ2h0aW5nIHRvIHRoZSBlZGl0b3JzIHRvIHNob3cgdGhlIGRpZmYuXG4gICAqXG4gICAqIEBwYXJhbSBkaWZmIFRoZSBkaWZmIHRvIGhpZ2hsaWdodC5cbiAgICogQHBhcmFtIGxlZnRIaWdobGlnaHRUeXBlIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCAoZXg6ICdhZGRlZCcpLlxuICAgKiBAcGFyYW0gcmlnaHRIaWdobGlnaHRUeXBlIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCAoZXg6ICdyZW1vdmVkJykuXG4gICAqIEBwYXJhbSBpc1dvcmREaWZmRW5hYmxlZCBXaGV0aGVyIGRpZmZlcmVuY2VzIGJldHdlZW4gd29yZHMgcGVyIGxpbmUgc2hvdWxkIGJlIGhpZ2hsaWdodGVkLlxuICAgKiBAcGFyYW0gaXNXaGl0ZXNwYWNlSWdub3JlZCBXaGV0aGVyIHdoaXRlc3BhY2Ugc2hvdWxkIGJlIGlnbm9yZWQuXG4gICAqL1xuICBkaXNwbGF5RGlmZihkaWZmLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1dvcmREaWZmRW5hYmxlZCwgaXNXaGl0ZXNwYWNlSWdub3JlZCkge1xuICAgIHRoaXMuX2NodW5rcyA9IGRpZmYuY2h1bmtzIHx8IFtdO1xuXG4gICAgLy8gbWFrZSB0aGUgbGFzdCBjaHVuayBlcXVhbCBzaXplIG9uIGJvdGggc2NyZWVucyBzbyB0aGUgZWRpdG9ycyByZXRhaW4gc3luYyBzY3JvbGwgIzU4XG4gICAgaWYodGhpcy5nZXROdW1EaWZmZXJlbmNlcygpID4gMCkge1xuICAgICAgdmFyIGxhc3RDaHVuayA9IHRoaXMuX2NodW5rc1t0aGlzLl9jaHVua3MubGVuZ3RoIC0gMV07XG4gICAgICB2YXIgb2xkQ2h1bmtSYW5nZSA9IGxhc3RDaHVuay5vbGRMaW5lRW5kIC0gbGFzdENodW5rLm9sZExpbmVTdGFydDtcbiAgICAgIHZhciBuZXdDaHVua1JhbmdlID0gbGFzdENodW5rLm5ld0xpbmVFbmQgLSBsYXN0Q2h1bmsubmV3TGluZVN0YXJ0O1xuICAgICAgaWYob2xkQ2h1bmtSYW5nZSA+IG5ld0NodW5rUmFuZ2UpIHtcbiAgICAgICAgLy8gbWFrZSB0aGUgb2Zmc2V0IGFzIGxhcmdlIGFzIG5lZWRlZCB0byBtYWtlIHRoZSBjaHVuayB0aGUgc2FtZSBzaXplIGluIGJvdGggZWRpdG9yc1xuICAgICAgICBkaWZmLm5ld0xpbmVPZmZzZXRzW2xhc3RDaHVuay5uZXdMaW5lU3RhcnQgKyBuZXdDaHVua1JhbmdlXSA9IG9sZENodW5rUmFuZ2UgLSBuZXdDaHVua1JhbmdlO1xuICAgICAgfSBlbHNlIGlmKG5ld0NodW5rUmFuZ2UgPiBvbGRDaHVua1JhbmdlKSB7XG4gICAgICAgIC8vIG1ha2UgdGhlIG9mZnNldCBhcyBsYXJnZSBhcyBuZWVkZWQgdG8gbWFrZSB0aGUgY2h1bmsgdGhlIHNhbWUgc2l6ZSBpbiBib3RoIGVkaXRvcnNcbiAgICAgICAgZGlmZi5vbGRMaW5lT2Zmc2V0c1tsYXN0Q2h1bmsub2xkTGluZVN0YXJ0ICsgb2xkQ2h1bmtSYW5nZV0gPSBuZXdDaHVua1JhbmdlIC0gb2xkQ2h1bmtSYW5nZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IodmFyIGNodW5rIG9mIHRoaXMuX2NodW5rcykge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5oaWdobGlnaHRMaW5lcyhjaHVuay5vbGRMaW5lU3RhcnQsIGNodW5rLm9sZExpbmVFbmQsIGxlZnRIaWdobGlnaHRUeXBlKTtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuaGlnaGxpZ2h0TGluZXMoY2h1bmsubmV3TGluZVN0YXJ0LCBjaHVuay5uZXdMaW5lRW5kLCByaWdodEhpZ2hsaWdodFR5cGUpO1xuXG4gICAgICBpZihpc1dvcmREaWZmRW5hYmxlZCkge1xuICAgICAgICB0aGlzLl9oaWdobGlnaHRXb3Jkc0luQ2h1bmsoY2h1bmssIGxlZnRIaWdobGlnaHRUeXBlLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2V0TGluZU9mZnNldHMoZGlmZi5vbGRMaW5lT2Zmc2V0cyk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZXRMaW5lT2Zmc2V0cyhkaWZmLm5ld0xpbmVPZmZzZXRzKTtcblxuICAgIHRoaXMuX21hcmtlckxheWVycyA9IHtcbiAgICAgIGVkaXRvcjE6IHtcbiAgICAgICAgaWQ6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuaWQsXG4gICAgICAgIGxpbmVNYXJrZXJMYXllcjogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRMaW5lTWFya2VyTGF5ZXIoKSxcbiAgICAgICAgaGlnaGxpZ2h0VHlwZTogbGVmdEhpZ2hsaWdodFR5cGUsXG4gICAgICAgIHNlbGVjdGlvbk1hcmtlckxheWVyOiB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldFNlbGVjdGlvbk1hcmtlckxheWVyKClcbiAgICAgIH0sXG4gICAgICBlZGl0b3IyOiB7XG4gICAgICAgIGlkOiB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmlkLFxuICAgICAgICBsaW5lTWFya2VyTGF5ZXI6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0TGluZU1hcmtlckxheWVyKCksXG4gICAgICAgIGhpZ2hsaWdodFR5cGU6IHJpZ2h0SGlnaGxpZ2h0VHlwZSxcbiAgICAgICAgc2VsZWN0aW9uTWFya2VyTGF5ZXI6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0U2VsZWN0aW9uTWFya2VyTGF5ZXIoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgdGhlIGRpZmYgaGlnaGxpZ2h0aW5nIGFuZCBvZmZzZXRzIGZyb20gdGhlIGVkaXRvcnMuXG4gICAqL1xuICBjbGVhckRpZmYoKSB7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5kZXN0cm95TWFya2VycygpO1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZGVzdHJveU1hcmtlcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgdG8gbW92ZSB0aGUgY3VycmVudCBzZWxlY3Rpb24gaGlnaGxpZ2h0IHRvIHRoZSBuZXh0IGRpZmYgY2h1bmsuXG4gICAqL1xuICBuZXh0RGlmZigpIHtcbiAgICBpZih0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSkge1xuICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4Kys7XG4gICAgICBpZih0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPj0gdGhpcy5nZXROdW1EaWZmZXJlbmNlcygpKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCA9IDA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZWxlY3RDaHVuayh0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgsIHRydWUpO1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHRvIG1vdmUgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGhpZ2hsaWdodCB0byB0aGUgcHJldmlvdXMgZGlmZiBjaHVuay5cbiAgICovXG4gIHByZXZEaWZmKCkge1xuICAgIGlmKHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgtLTtcbiAgICAgIGlmKHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCA8IDApIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ID0gdGhpcy5nZXROdW1EaWZmZXJlbmNlcygpIC0gMVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fc2VsZWN0Q2h1bmsodGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4LCB0cnVlKTtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGRpZmYgY2h1bmsgZnJvbSB0aGUgbGVmdCBlZGl0b3IgdG8gdGhlIHJpZ2h0XG4gICAqIGVkaXRvci5cbiAgICovXG4gIGNvcHlUb1JpZ2h0KCkge1xuICAgIHZhciBmb3VuZFNlbGVjdGlvbiA9IGZhbHNlO1xuICAgIHZhciBvZmZzZXQgPSAwOyAvLyBrZWVwIHRyYWNrIG9mIGxpbmUgb2Zmc2V0ICh1c2VkIHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIGNodW5rcyBiZWluZyBtb3ZlZClcblxuICAgIGZvcih2YXIgZGlmZkNodW5rIG9mIHRoaXMuX2NodW5rcykge1xuICAgICAgaWYoZGlmZkNodW5rLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZm91bmRTZWxlY3Rpb24gPSB0cnVlO1xuXG4gICAgICAgIHZhciB0ZXh0VG9Db3B5ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW2RpZmZDaHVuay5vbGRMaW5lU3RhcnQsIDBdLCBbZGlmZkNodW5rLm9sZExpbmVFbmQsIDBdXSk7XG4gICAgICAgIHZhciBsYXN0QnVmZmVyUm93ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5nZXRMYXN0QnVmZmVyUm93KCk7XG5cbiAgICAgICAgLy8gaW5zZXJ0IG5ldyBsaW5lIGlmIHRoZSBjaHVuayB3ZSB3YW50IHRvIGNvcHkgd2lsbCBiZSBiZWxvdyB0aGUgbGFzdCBsaW5lIG9mIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgICAgaWYoKGRpZmZDaHVuay5uZXdMaW5lU3RhcnQgKyBvZmZzZXQpID4gbGFzdEJ1ZmZlclJvdykge1xuICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2xhc3RCdWZmZXJSb3csIDBdLCB7YXV0b3Njcm9sbDogZmFsc2V9KTtcbiAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmluc2VydE5ld2xpbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsubmV3TGluZVN0YXJ0ICsgb2Zmc2V0LCAwXSwgW2RpZmZDaHVuay5uZXdMaW5lRW5kICsgb2Zmc2V0LCAwXV0sIHRleHRUb0NvcHkpO1xuICAgICAgICAvLyBvZmZzZXQgd2lsbCBiZSB0aGUgYW1vdW50IG9mIGxpbmVzIHRvIGJlIGNvcGllZCBtaW51cyB0aGUgYW1vdW50IG9mIGxpbmVzIG92ZXJ3cml0dGVuXG4gICAgICAgIG9mZnNldCArPSAoZGlmZkNodW5rLm9sZExpbmVFbmQgLSBkaWZmQ2h1bmsub2xkTGluZVN0YXJ0KSAtIChkaWZmQ2h1bmsubmV3TGluZUVuZCAtIGRpZmZDaHVuay5uZXdMaW5lU3RhcnQpO1xuICAgICAgICAvLyBtb3ZlIHRoZSBzZWxlY3Rpb24gcG9pbnRlciBiYWNrIHNvIHRoZSBuZXh0IGRpZmYgY2h1bmsgaXMgbm90IHNraXBwZWRcbiAgICAgICAgaWYodGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5oYXNTZWxlY3Rpb24oKSB8fCB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmhhc1NlbGVjdGlvbigpKSB7XG4gICAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4LS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighZm91bmRTZWxlY3Rpb24pIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogdGhpcy5fQ09QWV9IRUxQX01FU1NBR0UsIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGRpZmYgY2h1bmsgZnJvbSB0aGUgcmlnaHQgZWRpdG9yIHRvIHRoZSBsZWZ0XG4gICAqIGVkaXRvci5cbiAgICovXG4gIGNvcHlUb0xlZnQoKSB7XG4gICAgdmFyIGZvdW5kU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgdmFyIG9mZnNldCA9IDA7IC8vIGtlZXAgdHJhY2sgb2YgbGluZSBvZmZzZXQgKHVzZWQgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgY2h1bmtzIGJlaW5nIG1vdmVkKVxuXG4gICAgZm9yKHZhciBkaWZmQ2h1bmsgb2YgdGhpcy5fY2h1bmtzKSB7XG4gICAgICBpZihkaWZmQ2h1bmsuaXNTZWxlY3RlZCkge1xuICAgICAgICBmb3VuZFNlbGVjdGlvbiA9IHRydWU7XG5cbiAgICAgICAgdmFyIHRleHRUb0NvcHkgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbZGlmZkNodW5rLm5ld0xpbmVTdGFydCwgMF0sIFtkaWZmQ2h1bmsubmV3TGluZUVuZCwgMF1dKTtcbiAgICAgICAgdmFyIGxhc3RCdWZmZXJSb3cgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmdldExhc3RCdWZmZXJSb3coKTtcbiAgICAgICAgLy8gaW5zZXJ0IG5ldyBsaW5lIGlmIHRoZSBjaHVuayB3ZSB3YW50IHRvIGNvcHkgd2lsbCBiZSBiZWxvdyB0aGUgbGFzdCBsaW5lIG9mIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgICAgaWYoKGRpZmZDaHVuay5vbGRMaW5lU3RhcnQgKyBvZmZzZXQpID4gbGFzdEJ1ZmZlclJvdykge1xuICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2xhc3RCdWZmZXJSb3csIDBdLCB7YXV0b3Njcm9sbDogZmFsc2V9KTtcbiAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmluc2VydE5ld2xpbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsub2xkTGluZVN0YXJ0ICsgb2Zmc2V0LCAwXSwgW2RpZmZDaHVuay5vbGRMaW5lRW5kICsgb2Zmc2V0LCAwXV0sIHRleHRUb0NvcHkpO1xuICAgICAgICAvLyBvZmZzZXQgd2lsbCBiZSB0aGUgYW1vdW50IG9mIGxpbmVzIHRvIGJlIGNvcGllZCBtaW51cyB0aGUgYW1vdW50IG9mIGxpbmVzIG92ZXJ3cml0dGVuXG4gICAgICAgIG9mZnNldCArPSAoZGlmZkNodW5rLm5ld0xpbmVFbmQgLSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0KSAtIChkaWZmQ2h1bmsub2xkTGluZUVuZCAtIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQpO1xuICAgICAgICAvLyBtb3ZlIHRoZSBzZWxlY3Rpb24gcG9pbnRlciBiYWNrIHNvIHRoZSBuZXh0IGRpZmYgY2h1bmsgaXMgbm90IHNraXBwZWRcbiAgICAgICAgaWYodGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5oYXNTZWxlY3Rpb24oKSB8fCB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmhhc1NlbGVjdGlvbigpKSB7XG4gICAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4LS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighZm91bmRTZWxlY3Rpb24pIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogdGhpcy5fQ09QWV9IRUxQX01FU1NBR0UsIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFucyB1cCB0aGUgZWRpdG9yIGluZGljYXRlZCBieSBpbmRleC4gQSBjbGVhbiB1cCB3aWxsIHJlbW92ZSB0aGUgZWRpdG9yXG4gICAqIG9yIHRoZSBwYW5lIGlmIG5lY2Vzc2FyeS4gVHlwaWNhbGx5IGxlZnQgZWRpdG9yID09IDEgYW5kIHJpZ2h0IGVkaXRvciA9PSAyLlxuICAgKlxuICAgKiBAcGFyYW0gZWRpdG9ySW5kZXggVGhlIGluZGV4IG9mIHRoZSBlZGl0b3IgdG8gY2xlYW4gdXAuXG4gICAqL1xuICBjbGVhblVwRWRpdG9yKGVkaXRvckluZGV4KSB7XG4gICAgaWYoZWRpdG9ySW5kZXggPT09IDEpIHtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuY2xlYW5VcCgpO1xuICAgIH0gZWxzZSBpZihlZGl0b3JJbmRleCA9PT0gMikge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5jbGVhblVwKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBlZGl0b3IgZGlmZiBleHRlbmRlcnMuXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZGVzdHJveSgpO1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZGVzdHJveSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSBlZGl0b3JzLlxuICAgKlxuICAgKiBAcmV0dXJuIGludCBUaGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIGVkaXRvcnMuXG4gICAqL1xuICBnZXROdW1EaWZmZXJlbmNlcygpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh0aGlzLl9jaHVua3MpID8gdGhpcy5fY2h1bmtzLmxlbmd0aCA6IDA7XG4gIH1cblxuICBnZXRNYXJrZXJMYXllcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmtlckxheWVycztcbiAgfVxuXG4gIGhhbmRsZUN1cnNvckNoYW5nZShjdXJzb3IsIG9sZEJ1ZmZlclBvc2l0aW9uLCBuZXdCdWZmZXJQb3NpdGlvbikge1xuICAgIHZhciBlZGl0b3JJbmRleCA9IChjdXJzb3IuZWRpdG9yID09PSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpKSA/IDEgOiAyO1xuICAgIHZhciBvbGRQb3NpdGlvbkNodW5rSW5kZXggPSB0aGlzLl9nZXRDaHVua0luZGV4QnlMaW5lTnVtYmVyKGVkaXRvckluZGV4LCBvbGRCdWZmZXJQb3NpdGlvbi5yb3cpO1xuICAgIHZhciBuZXdQb3NpdGlvbkNodW5rSW5kZXggPSB0aGlzLl9nZXRDaHVua0luZGV4QnlMaW5lTnVtYmVyKGVkaXRvckluZGV4LCBuZXdCdWZmZXJQb3NpdGlvbi5yb3cpO1xuXG4gICAgaWYob2xkUG9zaXRpb25DaHVua0luZGV4ID49IDApIHtcbiAgICAgIHZhciBkaWZmQ2h1bmsgPSB0aGlzLl9jaHVua3Nbb2xkUG9zaXRpb25DaHVua0luZGV4XTtcbiAgICAgIGRpZmZDaHVuay5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmRlc2VsZWN0TGluZXMoZGlmZkNodW5rLm9sZExpbmVTdGFydCwgZGlmZkNodW5rLm9sZExpbmVFbmQpO1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5kZXNlbGVjdExpbmVzKGRpZmZDaHVuay5uZXdMaW5lU3RhcnQsIGRpZmZDaHVuay5uZXdMaW5lRW5kKTtcbiAgICB9XG4gICAgaWYobmV3UG9zaXRpb25DaHVua0luZGV4ID49IDApIHtcbiAgICAgIHRoaXMuX3NlbGVjdENodW5rKG5ld1Bvc2l0aW9uQ2h1bmtJbmRleCwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQUklWQVRFIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgYW5kIGhpZ2hsaWdodHMgdGhlIGRpZmYgY2h1bmsgaW4gYm90aCBlZGl0b3JzIGFjY29yZGluZyB0byB0aGVcbiAgICogZ2l2ZW4gaW5kZXguXG4gICAqXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGRpZmYgY2h1bmsgdG8gaGlnaGxpZ2h0IGluIGJvdGggZWRpdG9ycy5cbiAgICovXG4gIF9zZWxlY3RDaHVuayhpbmRleCwgaXNOZXh0T3JQcmV2KSB7XG4gICAgdmFyIGRpZmZDaHVuayA9IHRoaXMuX2NodW5rc1tpbmRleF07XG4gICAgaWYoZGlmZkNodW5rICE9IG51bGwpIHtcbiAgICAgIGRpZmZDaHVuay5pc1NlbGVjdGVkID0gdHJ1ZTtcblxuICAgICAgaWYoaXNOZXh0T3JQcmV2KSB7XG4gICAgICAgIC8vIGRlc2VsZWN0IHByZXZpb3VzIG5leHQvcHJldiBoaWdobGlnaHRzXG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZGVzZWxlY3RBbGxMaW5lcygpO1xuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmRlc2VsZWN0QWxsTGluZXMoKTtcbiAgICAgICAgLy8gc2Nyb2xsIHRoZSBlZGl0b3JzXG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2RpZmZDaHVuay5vbGRMaW5lU3RhcnQsIDBdLCB7YXV0b3Njcm9sbDogdHJ1ZX0pO1xuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtkaWZmQ2h1bmsubmV3TGluZVN0YXJ0LCAwXSwge2F1dG9zY3JvbGw6IHRydWV9KTtcbiAgICAgIH1cblxuICAgICAgLy8gaGlnaGxpZ2h0IHNlbGVjdGlvbiBpbiBib3RoIGVkaXRvcnNcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2VsZWN0TGluZXMoZGlmZkNodW5rLm9sZExpbmVTdGFydCwgZGlmZkNodW5rLm9sZExpbmVFbmQpO1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZWxlY3RMaW5lcyhkaWZmQ2h1bmsubmV3TGluZVN0YXJ0LCBkaWZmQ2h1bmsubmV3TGluZUVuZCk7XG4gICAgfVxuICB9XG5cbiAgX2dldENodW5rSW5kZXhCeUxpbmVOdW1iZXIoZWRpdG9ySW5kZXgsIGxpbmVOdW1iZXIpIHtcbiAgICBmb3IodmFyIGk9MDsgaTx0aGlzLl9jaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkaWZmQ2h1bmsgPSB0aGlzLl9jaHVua3NbaV07XG4gICAgICBpZihlZGl0b3JJbmRleCA9PT0gMSkge1xuICAgICAgICBpZihkaWZmQ2h1bmsub2xkTGluZVN0YXJ0IDw9IGxpbmVOdW1iZXIgJiYgZGlmZkNodW5rLm9sZExpbmVFbmQgPiBsaW5lTnVtYmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZihlZGl0b3JJbmRleCA9PT0gMikge1xuICAgICAgICBpZihkaWZmQ2h1bmsubmV3TGluZVN0YXJ0IDw9IGxpbmVOdW1iZXIgJiYgZGlmZkNodW5rLm5ld0xpbmVFbmQgPiBsaW5lTnVtYmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKipcbiAgICogSGlnaGxpZ2h0cyB0aGUgd29yZCBkaWZmIG9mIHRoZSBjaHVuayBwYXNzZWQgaW4uXG4gICAqXG4gICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdGhhdCBzaG91bGQgaGF2ZSBpdHMgd29yZHMgaGlnaGxpZ2h0ZWQuXG4gICAqL1xuICBfaGlnaGxpZ2h0V29yZHNJbkNodW5rKGNodW5rLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkKSB7XG4gICAgdmFyIGxlZnRMaW5lTnVtYmVyID0gY2h1bmsub2xkTGluZVN0YXJ0O1xuICAgIHZhciByaWdodExpbmVOdW1iZXIgPSBjaHVuay5uZXdMaW5lU3RhcnQ7XG4gICAgLy8gZm9yIGVhY2ggbGluZSB0aGF0IGhhcyBhIGNvcnJlc3BvbmRpbmcgbGluZVxuICAgIHdoaWxlKGxlZnRMaW5lTnVtYmVyIDwgY2h1bmsub2xkTGluZUVuZCAmJiByaWdodExpbmVOdW1iZXIgPCBjaHVuay5uZXdMaW5lRW5kKSB7XG4gICAgICB2YXIgZWRpdG9yMUxpbmVUZXh0ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhsZWZ0TGluZU51bWJlcik7XG4gICAgICB2YXIgZWRpdG9yMkxpbmVUZXh0ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhyaWdodExpbmVOdW1iZXIpO1xuXG4gICAgICBpZihlZGl0b3IxTGluZVRleHQgPT0gJycpIHtcbiAgICAgICAgLy8gY29tcHV0ZVdvcmREaWZmIHJldHVybnMgZW1wdHkgZm9yIGxpbmVzIHRoYXQgYXJlIHBhaXJlZCB3aXRoIGVtcHR5IGxpbmVzXG4gICAgICAgIC8vIG5lZWQgdG8gZm9yY2UgYSBoaWdobGlnaHRcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZXRXb3JkSGlnaGxpZ2h0cyhyaWdodExpbmVOdW1iZXIsIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IGVkaXRvcjJMaW5lVGV4dH1dLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpO1xuICAgICAgfSBlbHNlIGlmKCBlZGl0b3IyTGluZVRleHQgPT0gJycgKSB7XG4gICAgICAgIC8vIGNvbXB1dGVXb3JkRGlmZiByZXR1cm5zIGVtcHR5IGZvciBsaW5lcyB0aGF0IGFyZSBwYWlyZWQgd2l0aCBlbXB0eSBsaW5lc1xuICAgICAgICAvLyBuZWVkIHRvIGZvcmNlIGEgaGlnaGxpZ2h0XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2V0V29yZEhpZ2hsaWdodHMobGVmdExpbmVOdW1iZXIsIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IGVkaXRvcjFMaW5lVGV4dH1dLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBwZXJmb3JtIHJlZ3VsYXIgd29yZCBkaWZmXG4gICAgICAgIHZhciB3b3JkRGlmZiA9IENvbXB1dGVXb3JkRGlmZi5jb21wdXRlV29yZERpZmYoZWRpdG9yMUxpbmVUZXh0LCBlZGl0b3IyTGluZVRleHQpO1xuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLnNldFdvcmRIaWdobGlnaHRzKGxlZnRMaW5lTnVtYmVyLCB3b3JkRGlmZi5yZW1vdmVkV29yZHMsIGxlZnRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZXRXb3JkSGlnaGxpZ2h0cyhyaWdodExpbmVOdW1iZXIsIHdvcmREaWZmLmFkZGVkV29yZHMsIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICB9XG5cbiAgICAgIGxlZnRMaW5lTnVtYmVyKys7XG4gICAgICByaWdodExpbmVOdW1iZXIrKztcbiAgICB9XG5cbiAgICAvLyBoaWdobGlnaHQgcmVtYWluaW5nIGxpbmVzIGluIGxlZnQgZWRpdG9yXG4gICAgd2hpbGUobGVmdExpbmVOdW1iZXIgPCBjaHVuay5vbGRMaW5lRW5kKSB7XG4gICAgICB2YXIgZWRpdG9yMUxpbmVUZXh0ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhsZWZ0TGluZU51bWJlcik7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLnNldFdvcmRIaWdobGlnaHRzKGxlZnRMaW5lTnVtYmVyLCBbe2NoYW5nZWQ6IHRydWUsIHZhbHVlOiBlZGl0b3IxTGluZVRleHR9XSwgbGVmdEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpO1xuICAgICAgbGVmdExpbmVOdW1iZXIrKztcbiAgICB9XG4gICAgLy8gaGlnaGxpZ2h0IHJlbWFpbmluZyBsaW5lcyBpbiB0aGUgcmlnaHQgZWRpdG9yXG4gICAgd2hpbGUocmlnaHRMaW5lTnVtYmVyIDwgY2h1bmsubmV3TGluZUVuZCkge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZXRXb3JkSGlnaGxpZ2h0cyhyaWdodExpbmVOdW1iZXIsIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3cocmlnaHRMaW5lTnVtYmVyKX1dLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpO1xuICAgICAgcmlnaHRMaW5lTnVtYmVyKys7XG4gICAgfVxuICB9XG59O1xuIl19