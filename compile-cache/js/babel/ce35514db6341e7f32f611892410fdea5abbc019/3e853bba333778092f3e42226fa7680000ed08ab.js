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
   * @param diff ex: {
   *                    oldLineOffsets: [lineNumber: numOffsetLines, ...],
   *                    newLineOffsets: [lineNumber: numOffsetLines, ...],
   *                    chunks: [{
   *                                newLineStart: (int),
   *                                newLineEnd: (int),
   *                                oldLineStart: (int),
   *                                oldLineEnd: (int)
   *                            }, ...]
   *                 }
   */

  function DiffView(editors) {
    _classCallCheck(this, DiffView);

    this._editorDiffExtender1 = new _editorDiffExtender2['default'](editors.editor1);
    this._editorDiffExtender2 = new _editorDiffExtender2['default'](editors.editor2);
    this._chunks = null;
    this._isSelectionActive = false;
    this._selectedChunkIndex = 0;
    this._COPY_HELP_MESSAGE = 'Place your cursor in a chunk first!';
  }

  /**
   * Adds highlighting to the editors to show the diff.
   *
   * @param chunks The diff chunks to highlight.
   * @param leftHighlightType The type of highlight (ex: 'added').
   * @param rightHighlightType The type of highlight (ex: 'removed').
   * @param isWordDiffEnabled Whether differences between words per line should be highlighted.
   * @param isWhitespaceIgnored Whether whitespace should be ignored.
   */

  _createClass(DiffView, [{
    key: 'displayDiff',
    value: function displayDiff(diff, leftHighlightType, rightHighlightType, isWordDiffEnabled, isWhitespaceIgnored) {
      this._chunks = diff.chunks;

      // make the last chunk equal size on both screens so the editors retain sync scroll #58
      if (this._chunks.length > 0) {
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

      for (chunk of this._chunks) {
        this._editorDiffExtender1.highlightLines(chunk.oldLineStart, chunk.oldLineEnd, leftHighlightType);
        this._editorDiffExtender2.highlightLines(chunk.newLineStart, chunk.newLineEnd, rightHighlightType);

        if (isWordDiffEnabled) {
          this._highlightWordsInChunk(chunk, leftHighlightType, rightHighlightType, isWhitespaceIgnored);
        }
      }

      this._editorDiffExtender1.setLineOffsets(diff.oldLineOffsets);
      this._editorDiffExtender2.setLineOffsets(diff.newLineOffsets);
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
        if (this._selectedChunkIndex >= this._chunks.length) {
          this._selectedChunkIndex = 0;
        }
      } else {
        this._isSelectionActive = true;
      }

      this._selectChunk(this._selectedChunkIndex);
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
          this._selectedChunkIndex = this._chunks.length - 1;
        }
      } else {
        this._isSelectionActive = true;
      }

      this._selectChunk(this._selectedChunkIndex);
      return this._selectedChunkIndex;
    }

    /**
     * Copies the currently selected diff chunk from the left editor to the right
     * editor.
     */
  }, {
    key: 'copyToRight',
    value: function copyToRight() {
      var linesToCopy = this._editorDiffExtender1.getCursorDiffLines();

      if (linesToCopy.length == 0) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }

      // keep track of line offset (used when there are multiple chunks being moved)
      var offset = 0;

      for (lineRange of linesToCopy) {
        for (diffChunk of this._chunks) {
          if (lineRange.start.row == diffChunk.oldLineStart) {
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
      }
    }

    /**
     * Copies the currently selected diff chunk from the right editor to the left
     * editor.
     */
  }, {
    key: 'copyToLeft',
    value: function copyToLeft() {
      var linesToCopy = this._editorDiffExtender2.getCursorDiffLines();

      if (linesToCopy.length == 0) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }

      var offset = 0; // keep track of line offset (used when there are multiple chunks being moved)
      for (lineRange of linesToCopy) {
        for (diffChunk of this._chunks) {
          if (lineRange.start.row == diffChunk.newLineStart) {
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
      return this._chunks.length;
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
    value: function _selectChunk(index) {
      var diffChunk = this._chunks[index];
      if (diffChunk != null) {
        // deselect previous next/prev highlights
        this._editorDiffExtender1.deselectAllLines();
        this._editorDiffExtender2.deselectAllLines();
        // highlight and scroll editor 1
        this._editorDiffExtender1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
        this._editorDiffExtender1.getEditor().setCursorBufferPosition([diffChunk.oldLineStart, 0], { autoscroll: true });
        // highlight and scroll editor 2
        this._editorDiffExtender2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
        this._editorDiffExtender2.getEditor().setCursorBufferPosition([diffChunk.newLineStart, 0], { autoscroll: true });
      }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvZGlmZi12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztrQ0FFK0Isd0JBQXdCOzs7OytCQUMzQixxQkFBcUI7Ozs7QUFIakQsV0FBVyxDQUFBOztBQU1YLE1BQU0sQ0FBQyxPQUFPOzs7Ozs7Ozs7Ozs7Ozs7QUFjRCxXQWRVLFFBQVEsQ0FjaEIsT0FBTyxFQUFHOzBCQWRGLFFBQVE7O0FBZTNCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQ0FBd0IsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQ0FBd0IsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7QUFDaEMsUUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztBQUM3QixRQUFJLENBQUMsa0JBQWtCLEdBQUcscUNBQXFDLENBQUM7R0FDakU7Ozs7Ozs7Ozs7OztlQXJCb0IsUUFBUTs7V0FnQ2xCLHFCQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRztBQUNqRyxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7OztBQUczQixVQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRztBQUM1QixZQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBRSxDQUFDO0FBQ3hELFlBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQztBQUNsRSxZQUFJLGFB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YyxFQUFFLENBQUM7QUFDakIsdUJBQWUsRUFBRSxDQUFDO09BQ25COzs7QUFHRCxhQUFPLGNBQWMsR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFHO0FBQ3pDLFlBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBRSxjQUFjLENBQUUsQ0FBQztBQUNuRyxZQUFJLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixDQUFFLENBQUM7QUFDbkosc0JBQWMsRUFBRSxDQUFDO09BQ2xCOztBQUVELGFBQU8sZUFBZSxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUc7QUFDMUMsWUFBSSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFFLGVBQWUsQ0FBRSxFQUFFLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsQ0FBRSxDQUFDO0FBQ25OLHVCQUFlLEVBQUUsQ0FBQztPQUNuQjtLQUNGOzs7U0FwUm9CLFFBQVE7SUFxUjlCLENBQUMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9kaWZmLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgRWRpdG9yRGlmZkV4dGVuZGVyIGZyb20gJy4vZWRpdG9yLWRpZmYtZXh0ZW5kZXInO1xuaW1wb3J0IENvbXB1dGVXb3JkRGlmZiBmcm9tICcuL2NvbXB1dGUtd29yZC1kaWZmJztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERpZmZWaWV3IHtcbiAgLypcbiAgICogQHBhcmFtIGVkaXRvcnMgQXJyYXkgb2YgZWRpdG9ycyBiZWluZyBkaWZmZWQuXG4gICAqIEBwYXJhbSBkaWZmIGV4OiB7XG4gICAqICAgICAgICAgICAgICAgICAgICBvbGRMaW5lT2Zmc2V0czogW2xpbmVOdW1iZXI6IG51bU9mZnNldExpbmVzLCAuLi5dLFxuICAgKiAgICAgICAgICAgICAgICAgICAgbmV3TGluZU9mZnNldHM6IFtsaW5lTnVtYmVyOiBudW1PZmZzZXRMaW5lcywgLi4uXSxcbiAgICogICAgICAgICAgICAgICAgICAgIGNodW5rczogW3tcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0xpbmVTdGFydDogKGludCksXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdMaW5lRW5kOiAoaW50KSxcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZExpbmVTdGFydDogKGludCksXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRMaW5lRW5kOiAoaW50KVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAuLi5dXG4gICAqICAgICAgICAgICAgICAgICB9XG4gICAqL1xuICBjb25zdHJ1Y3RvciggZWRpdG9ycyApIHtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxID0gbmV3IEVkaXRvckRpZmZFeHRlbmRlciggZWRpdG9ycy5lZGl0b3IxICk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMiA9IG5ldyBFZGl0b3JEaWZmRXh0ZW5kZXIoIGVkaXRvcnMuZWRpdG9yMiApO1xuICAgIHRoaXMuX2NodW5rcyA9IG51bGw7XG4gICAgdGhpcy5faXNTZWxlY3Rpb25BY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPSAwO1xuICAgIHRoaXMuX0NPUFlfSEVMUF9NRVNTQUdFID0gJ1BsYWNlIHlvdXIgY3Vyc29yIGluIGEgY2h1bmsgZmlyc3QhJztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGhpZ2hsaWdodGluZyB0byB0aGUgZWRpdG9ycyB0byBzaG93IHRoZSBkaWZmLlxuICAgKlxuICAgKiBAcGFyYW0gY2h1bmtzIFRoZSBkaWZmIGNodW5rcyB0byBoaWdobGlnaHQuXG4gICAqIEBwYXJhbSBsZWZ0SGlnaGxpZ2h0VHlwZSBUaGUgdHlwZSBvZiBoaWdobGlnaHQgKGV4OiAnYWRkZWQnKS5cbiAgICogQHBhcmFtIHJpZ2h0SGlnaGxpZ2h0VHlwZSBUaGUgdHlwZSBvZiBoaWdobGlnaHQgKGV4OiAncmVtb3ZlZCcpLlxuICAgKiBAcGFyYW0gaXNXb3JkRGlmZkVuYWJsZWQgV2hldGhlciBkaWZmZXJlbmNlcyBiZXR3ZWVuIHdvcmRzIHBlciBsaW5lIHNob3VsZCBiZSBoaWdobGlnaHRlZC5cbiAgICogQHBhcmFtIGlzV2hpdGVzcGFjZUlnbm9yZWQgV2hldGhlciB3aGl0ZXNwYWNlIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgKi9cbiAgZGlzcGxheURpZmYoIGRpZmYsIGxlZnRIaWdobGlnaHRUeXBlLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV29yZERpZmZFbmFibGVkLCBpc1doaXRlc3BhY2VJZ25vcmVkICkge1xuICAgIHRoaXMuX2NodW5rcyA9IGRpZmYuY2h1bmtzO1xuXG4gICAgLy8gbWFrZSB0aGUgbGFzdCBjaHVuayBlcXVhbCBzaXplIG9uIGJvdGggc2NyZWVucyBzbyB0aGUgZWRpdG9ycyByZXRhaW4gc3luYyBzY3JvbGwgIzU4XG4gICAgaWYoIHRoaXMuX2NodW5rcy5sZW5ndGggPiAwICkge1xuICAgICAgdmFyIGxhc3RDaHVuayA9IHRoaXMuX2NodW5rc1sgdGhpcy5fY2h1bmtzLmxlbmd0aCAtIDEgXTtcbiAgICAgIHZhciBvbGRDaHVua1JhbmdlID0gbGFzdENodW5rLm9sZExpbmVFbmQgLSBsYXN0Q2h1bmsub2xkTGluZVN0YXJ0O1xuICAgICAgdmFyIG5ld0NodW5rUmFuZ2UgPSBsYXN0Q2h1bmsubmV3TGluZUVuZCAtIGxhc3RDaHVuay5uZXdMaW5lU3RhcnQ7XG4gICAgICBpZiggb2xkQ2h1bmtSYW5nZSA+IG5ld0NodW5rUmFuZ2UgKSB7XG4gICAgICAgIC8vIG1ha2UgdGhlIG9mZnNldCBhcyBsYXJnZSBhcyBuZWVkZWQgdG8gbWFrZSB0aGUgY2h1bmsgdGhlIHNhbWUgc2l6ZSBpbiBib3RoIGVkaXRvcnNcbiAgICAgICAgZGlmZi5uZXdMaW5lT2Zmc2V0c1sgbGFzdENodW5rLm5ld0xpbmVTdGFydCArIG5ld0NodW5rUmFuZ2UgXSA9IG9sZENodW5rUmFuZ2UgLSBuZXdDaHVua1JhbmdlO1xuICAgICAgfSBlbHNlIGlmKCBuZXdDaHVua1JhbmdlID4gb2xkQ2h1bmtSYW5nZSApIHtcbiAgICAgICAgLy8gbWFrZSB0aGUgb2Zmc2V0IGFzIGxhcmdlIGFzIG5lZWRlZCB0byBtYWtlIHRoZSBjaHVuayB0aGUgc2FtZSBzaXplIGluIGJvdGggZWRpdG9yc1xuICAgICAgICBkaWZmLm9sZExpbmVPZmZzZXRzWyBsYXN0Q2h1bmsub2xkTGluZVN0YXJ0ICsgb2xkQ2h1bmtSYW5nZSBdID0gbmV3Q2h1bmtSYW5nZSAtIG9sZENodW5rUmFuZ2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yKCBjaHVuayBvZiB0aGlzLl9jaHVua3MgKSB7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmhpZ2hsaWdodExpbmVzKCBjaHVuay5vbGRMaW5lU3RhcnQsIGNodW5rLm9sZExpbmVFbmQsIGxlZnRIaWdobGlnaHRUeXBlICk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmhpZ2hsaWdodExpbmVzKCBjaHVuay5uZXdMaW5lU3RhcnQsIGNodW5rLm5ld0xpbmVFbmQsIHJpZ2h0SGlnaGxpZ2h0VHlwZSApO1xuXG4gICAgICBpZiggaXNXb3JkRGlmZkVuYWJsZWQgKSB7XG4gICAgICAgIHRoaXMuX2hpZ2hsaWdodFdvcmRzSW5DaHVuayggY2h1bmssIGxlZnRIaWdobGlnaHRUeXBlLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLnNldExpbmVPZmZzZXRzKCBkaWZmLm9sZExpbmVPZmZzZXRzICk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZXRMaW5lT2Zmc2V0cyggZGlmZi5uZXdMaW5lT2Zmc2V0cyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgZGlmZiBoaWdobGlnaHRpbmcgYW5kIG9mZnNldHMgZnJvbSB0aGUgZWRpdG9ycy5cbiAgICovXG4gIGNsZWFyRGlmZigpIHtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmRlc3Ryb3lNYXJrZXJzKCk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5kZXN0cm95TWFya2VycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB0byBtb3ZlIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBoaWdobGlnaHQgdG8gdGhlIG5leHQgZGlmZiBjaHVuay5cbiAgICovXG4gIG5leHREaWZmKCkge1xuICAgIGlmKCB0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSApIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCsrO1xuICAgICAgaWYoIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCA+PSB0aGlzLl9jaHVua3MubGVuZ3RoICkge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPSAwO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fc2VsZWN0Q2h1bmsoIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCApO1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHRvIG1vdmUgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGhpZ2hsaWdodCB0byB0aGUgcHJldmlvdXMgZGlmZiBjaHVuay5cbiAgICovXG4gIHByZXZEaWZmKCkge1xuICAgIGlmKCB0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSApIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleC0tO1xuICAgICAgaWYoIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCA8IDAgKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCA9IHRoaXMuX2NodW5rcy5sZW5ndGggLSAxXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZWxlY3RDaHVuayggdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ICk7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3BpZXMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBkaWZmIGNodW5rIGZyb20gdGhlIGxlZnQgZWRpdG9yIHRvIHRoZSByaWdodFxuICAgKiBlZGl0b3IuXG4gICAqL1xuICBjb3B5VG9SaWdodCgpIHtcbiAgICB2YXIgbGluZXNUb0NvcHkgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEN1cnNvckRpZmZMaW5lcygpO1xuXG4gICAgaWYoIGxpbmVzVG9Db3B5Lmxlbmd0aCA9PSAwICkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiB0aGlzLl9DT1BZX0hFTFBfTUVTU0FHRSwgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuICAgIH1cblxuICAgIC8vIGtlZXAgdHJhY2sgb2YgbGluZSBvZmZzZXQgKHVzZWQgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgY2h1bmtzIGJlaW5nIG1vdmVkKVxuICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgZm9yKCBsaW5lUmFuZ2Ugb2YgbGluZXNUb0NvcHkgKSB7XG4gICAgICBmb3IoIGRpZmZDaHVuayBvZiB0aGlzLl9jaHVua3MgKSB7XG4gICAgICAgIGlmKCBsaW5lUmFuZ2Uuc3RhcnQucm93ID09IGRpZmZDaHVuay5vbGRMaW5lU3RhcnQgKSB7XG4gICAgICAgICAgdmFyIHRleHRUb0NvcHkgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKCBbW2RpZmZDaHVuay5vbGRMaW5lU3RhcnQsIDBdLCBbZGlmZkNodW5rLm9sZExpbmVFbmQsIDBdXSApO1xuICAgICAgICAgIHZhciBsYXN0QnVmZmVyUm93ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5nZXRMYXN0QnVmZmVyUm93KCk7XG5cbiAgICAgICAgICAvLyBpbnNlcnQgbmV3IGxpbmUgaWYgdGhlIGNodW5rIHdlIHdhbnQgdG8gY29weSB3aWxsIGJlIGJlbG93IHRoZSBsYXN0IGxpbmUgb2YgdGhlIG90aGVyIGVkaXRvclxuICAgICAgICAgIGlmKCAoZGlmZkNodW5rLm5ld0xpbmVTdGFydCArIG9mZnNldCkgPiBsYXN0QnVmZmVyUm93ICkge1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiggW2xhc3RCdWZmZXJSb3csIDBdLCB7YXV0b3Njcm9sbDogZmFsc2V9ICk7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmluc2VydE5ld2xpbmUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLnNldFRleHRJbkJ1ZmZlclJhbmdlKCBbW2RpZmZDaHVuay5uZXdMaW5lU3RhcnQgKyBvZmZzZXQsIDBdLCBbZGlmZkNodW5rLm5ld0xpbmVFbmQgKyBvZmZzZXQsIDBdXSwgdGV4dFRvQ29weSApO1xuICAgICAgICAgIC8vIG9mZnNldCB3aWxsIGJlIHRoZSBhbW91bnQgb2YgbGluZXMgdG8gYmUgY29waWVkIG1pbnVzIHRoZSBhbW91bnQgb2YgbGluZXMgb3ZlcndyaXR0ZW5cbiAgICAgICAgICBvZmZzZXQgKz0gKGRpZmZDaHVuay5vbGRMaW5lRW5kIC0gZGlmZkNodW5rLm9sZExpbmVTdGFydCkgLSAoZGlmZkNodW5rLm5ld0xpbmVFbmQgLSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0KTtcbiAgICAgICAgICAvLyBtb3ZlIHRoZSBzZWxlY3Rpb24gcG9pbnRlciBiYWNrIHNvIHRoZSBuZXh0IGRpZmYgY2h1bmsgaXMgbm90IHNraXBwZWRcbiAgICAgICAgICBpZiggdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5oYXNTZWxlY3Rpb24oKSB8fCB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmhhc1NlbGVjdGlvbigpICkge1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4LS07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGRpZmYgY2h1bmsgZnJvbSB0aGUgcmlnaHQgZWRpdG9yIHRvIHRoZSBsZWZ0XG4gICAqIGVkaXRvci5cbiAgICovXG4gIGNvcHlUb0xlZnQoKSB7XG4gICAgdmFyIGxpbmVzVG9Db3B5ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRDdXJzb3JEaWZmTGluZXMoKTtcblxuICAgIGlmKCBsaW5lc1RvQ29weS5sZW5ndGggPT0gMCApIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCAnU3BsaXQgRGlmZicsIHtkZXRhaWw6IHRoaXMuX0NPUFlfSEVMUF9NRVNTQUdFLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30gKTtcbiAgICB9XG5cbiAgICB2YXIgb2Zmc2V0ID0gMDsgLy8ga2VlcCB0cmFjayBvZiBsaW5lIG9mZnNldCAodXNlZCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBjaHVua3MgYmVpbmcgbW92ZWQpXG4gICAgZm9yKCBsaW5lUmFuZ2Ugb2YgbGluZXNUb0NvcHkgKSB7XG4gICAgICBmb3IoIGRpZmZDaHVuayBvZiB0aGlzLl9jaHVua3MgKSB7XG4gICAgICAgIGlmKCBsaW5lUmFuZ2Uuc3RhcnQucm93ID09IGRpZmZDaHVuay5uZXdMaW5lU3RhcnQgKSB7XG4gICAgICAgICAgdmFyIHRleHRUb0NvcHkgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKCBbW2RpZmZDaHVuay5uZXdMaW5lU3RhcnQsIDBdLCBbZGlmZkNodW5rLm5ld0xpbmVFbmQsIDBdXSApO1xuICAgICAgICAgIHZhciBsYXN0QnVmZmVyUm93ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5nZXRMYXN0QnVmZmVyUm93KCk7XG4gICAgICAgICAgLy8gaW5zZXJ0IG5ldyBsaW5lIGlmIHRoZSBjaHVuayB3ZSB3YW50IHRvIGNvcHkgd2lsbCBiZSBiZWxvdyB0aGUgbGFzdCBsaW5lIG9mIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgICAgICBpZiggKGRpZmZDaHVuay5vbGRMaW5lU3RhcnQgKyBvZmZzZXQpID4gbGFzdEJ1ZmZlclJvdyApIHtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oIFtsYXN0QnVmZmVyUm93LCAwXSwge2F1dG9zY3JvbGw6IGZhbHNlfSApO1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5pbnNlcnROZXdsaW5lKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5zZXRUZXh0SW5CdWZmZXJSYW5nZSggW1tkaWZmQ2h1bmsub2xkTGluZVN0YXJ0ICsgb2Zmc2V0LCAwXSwgW2RpZmZDaHVuay5vbGRMaW5lRW5kICsgb2Zmc2V0LCAwXV0sIHRleHRUb0NvcHkgKTtcbiAgICAgICAgICAvLyBvZmZzZXQgd2lsbCBiZSB0aGUgYW1vdW50IG9mIGxpbmVzIHRvIGJlIGNvcGllZCBtaW51cyB0aGUgYW1vdW50IG9mIGxpbmVzIG92ZXJ3cml0dGVuXG4gICAgICAgICAgb2Zmc2V0ICs9IChkaWZmQ2h1bmsubmV3TGluZUVuZCAtIGRpZmZDaHVuay5uZXdMaW5lU3RhcnQpIC0gKGRpZmZDaHVuay5vbGRMaW5lRW5kIC0gZGlmZkNodW5rLm9sZExpbmVTdGFydCk7XG4gICAgICAgICAgLy8gbW92ZSB0aGUgc2VsZWN0aW9uIHBvaW50ZXIgYmFjayBzbyB0aGUgbmV4dCBkaWZmIGNodW5rIGlzIG5vdCBza2lwcGVkXG4gICAgICAgICAgaWYoIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuaGFzU2VsZWN0aW9uKCkgfHwgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5oYXNTZWxlY3Rpb24oKSApIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleC0tO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnMgdXAgdGhlIGVkaXRvciBpbmRpY2F0ZWQgYnkgaW5kZXguIEEgY2xlYW4gdXAgd2lsbCByZW1vdmUgdGhlIGVkaXRvclxuICAgKiBvciB0aGUgcGFuZSBpZiBuZWNlc3NhcnkuIFR5cGljYWxseSBsZWZ0IGVkaXRvciA9PSAxIGFuZCByaWdodCBlZGl0b3IgPT0gMi5cbiAgICpcbiAgICogQHBhcmFtIGVkaXRvckluZGV4IFRoZSBpbmRleCBvZiB0aGUgZWRpdG9yIHRvIGNsZWFuIHVwLlxuICAgKi9cbiAgY2xlYW5VcEVkaXRvciggZWRpdG9ySW5kZXggKSB7XG4gICAgaWYoIGVkaXRvckluZGV4ID09PSAxICkge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5jbGVhblVwKCk7XG4gICAgfSBlbHNlIGlmKCBlZGl0b3JJbmRleCA9PT0gMiApIHtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuY2xlYW5VcCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgZWRpdG9yIGRpZmYgZXh0ZW5kZXJzLlxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgZWRpdG9ycy5cbiAgICpcbiAgICogQHJldHVybiBpbnQgVGhlIG51bWJlciBvZiBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSBlZGl0b3JzLlxuICAgKi9cbiAgZ2V0TnVtRGlmZmVyZW5jZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NodW5rcy5sZW5ndGg7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUFJJVkFURSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4gIC8qKlxuICAgKiBTZWxlY3RzIGFuZCBoaWdobGlnaHRzIHRoZSBkaWZmIGNodW5rIGluIGJvdGggZWRpdG9ycyBhY2NvcmRpbmcgdG8gdGhlXG4gICAqIGdpdmVuIGluZGV4LlxuICAgKlxuICAgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBkaWZmIGNodW5rIHRvIGhpZ2hsaWdodCBpbiBib3RoIGVkaXRvcnMuXG4gICAqL1xuICBfc2VsZWN0Q2h1bmsoIGluZGV4ICkge1xuICAgIHZhciBkaWZmQ2h1bmsgPSB0aGlzLl9jaHVua3NbaW5kZXhdO1xuICAgIGlmKCBkaWZmQ2h1bmsgIT0gbnVsbCApIHtcbiAgICAgIC8vIGRlc2VsZWN0IHByZXZpb3VzIG5leHQvcHJldiBoaWdobGlnaHRzXG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmRlc2VsZWN0QWxsTGluZXMoKTtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZGVzZWxlY3RBbGxMaW5lcygpO1xuICAgICAgLy8gaGlnaGxpZ2h0IGFuZCBzY3JvbGwgZWRpdG9yIDFcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2VsZWN0TGluZXMoIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQsIGRpZmZDaHVuay5vbGRMaW5lRW5kICk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCBbZGlmZkNodW5rLm9sZExpbmVTdGFydCwgMF0sIHthdXRvc2Nyb2xsOiB0cnVlfSApO1xuICAgICAgLy8gaGlnaGxpZ2h0IGFuZCBzY3JvbGwgZWRpdG9yIDJcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuc2VsZWN0TGluZXMoIGRpZmZDaHVuay5uZXdMaW5lU3RhcnQsIGRpZmZDaHVuay5uZXdMaW5lRW5kICk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCBbZGlmZkNodW5rLm5ld0xpbmVTdGFydCwgMF0sIHthdXRvc2Nyb2xsOiB0cnVlfSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHRzIHRoZSB3b3JkIGRpZmYgb2YgdGhlIGNodW5rIHBhc3NlZCBpbi5cbiAgICpcbiAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0aGF0IHNob3VsZCBoYXZlIGl0cyB3b3JkcyBoaWdobGlnaHRlZC5cbiAgICovXG4gIF9oaWdobGlnaHRXb3Jkc0luQ2h1bmsoIGNodW5rLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkICkge1xuICAgIHZhciBsZWZ0TGluZU51bWJlciA9IGNodW5rLm9sZExpbmVTdGFydDtcbiAgICB2YXIgcmlnaHRMaW5lTnVtYmVyID0gY2h1bmsubmV3TGluZVN0YXJ0O1xuICAgIC8vIGZvciBlYWNoIGxpbmUgdGhhdCBoYXMgYSBjb3JyZXNwb25kaW5nIGxpbmVcbiAgICB3aGlsZSggbGVmdExpbmVOdW1iZXIgPCBjaHVuay5vbGRMaW5lRW5kICYmIHJpZ2h0TGluZU51bWJlciA8IGNodW5rLm5ld0xpbmVFbmQgKSB7XG4gICAgICB2YXIgZWRpdG9yMUxpbmVUZXh0ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyggbGVmdExpbmVOdW1iZXIgKTtcbiAgICAgIHZhciBlZGl0b3IyTGluZVRleHQgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KCByaWdodExpbmVOdW1iZXIgKTtcblxuICAgICAgaWYoIGVkaXRvcjFMaW5lVGV4dCA9PSAnJyApIHtcbiAgICAgICAgLy8gY29tcHV0ZVdvcmREaWZmIHJldHVybnMgZW1wdHkgZm9yIGxpbmVzIHRoYXQgYXJlIHBhaXJlZCB3aXRoIGVtcHR5IGxpbmVzXG4gICAgICAgIC8vIG5lZWQgdG8gZm9yY2UgYSBoaWdobGlnaHRcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZXRXb3JkSGlnaGxpZ2h0cyggcmlnaHRMaW5lTnVtYmVyLCBbeyBjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogZWRpdG9yMkxpbmVUZXh0IH1dLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQgKTtcbiAgICAgIH0gZWxzZSBpZiggZWRpdG9yMkxpbmVUZXh0ID09ICcnICkge1xuICAgICAgICAvLyBjb21wdXRlV29yZERpZmYgcmV0dXJucyBlbXB0eSBmb3IgbGluZXMgdGhhdCBhcmUgcGFpcmVkIHdpdGggZW1wdHkgbGluZXNcbiAgICAgICAgLy8gbmVlZCB0byBmb3JjZSBhIGhpZ2hsaWdodFxuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLnNldFdvcmRIaWdobGlnaHRzKCBsZWZ0TGluZU51bWJlciwgW3sgY2hhbmdlZDogdHJ1ZSwgdmFsdWU6IGVkaXRvcjFMaW5lVGV4dCB9XSwgbGVmdEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHBlcmZvcm0gcmVndWxhciB3b3JkIGRpZmZcbiAgICAgICAgdmFyIHdvcmREaWZmID0gQ29tcHV0ZVdvcmREaWZmLmNvbXB1dGVXb3JkRGlmZiggZWRpdG9yMUxpbmVUZXh0LCBlZGl0b3IyTGluZVRleHQgKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRXb3JkSGlnaGxpZ2h0cyggbGVmdExpbmVOdW1iZXIsIHdvcmREaWZmLnJlbW92ZWRXb3JkcywgbGVmdEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQgKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZXRXb3JkSGlnaGxpZ2h0cyggcmlnaHRMaW5lTnVtYmVyLCB3b3JkRGlmZi5hZGRlZFdvcmRzLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQgKTtcbiAgICAgIH1cblxuICAgICAgbGVmdExpbmVOdW1iZXIrKztcbiAgICAgIHJpZ2h0TGluZU51bWJlcisrO1xuICAgIH1cblxuICAgIC8vIGhpZ2hsaWdodCByZW1haW5pbmcgbGluZXMgaW4gbGVmdCBlZGl0b3JcbiAgICB3aGlsZSggbGVmdExpbmVOdW1iZXIgPCBjaHVuay5vbGRMaW5lRW5kICkge1xuICAgICAgdmFyIGVkaXRvcjFMaW5lVGV4dCA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3coIGxlZnRMaW5lTnVtYmVyICk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLnNldFdvcmRIaWdobGlnaHRzKCBsZWZ0TGluZU51bWJlciwgW3sgY2hhbmdlZDogdHJ1ZSwgdmFsdWU6IGVkaXRvcjFMaW5lVGV4dCB9XSwgbGVmdEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQgKTtcbiAgICAgIGxlZnRMaW5lTnVtYmVyKys7XG4gICAgfVxuICAgIC8vIGhpZ2hsaWdodCByZW1haW5pbmcgbGluZXMgaW4gdGhlIHJpZ2h0IGVkaXRvclxuICAgIHdoaWxlKCByaWdodExpbmVOdW1iZXIgPCBjaHVuay5uZXdMaW5lRW5kICkge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZXRXb3JkSGlnaGxpZ2h0cyggcmlnaHRMaW5lTnVtYmVyLCBbeyBjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyggcmlnaHRMaW5lTnVtYmVyICkgfV0sIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCApO1xuICAgICAgcmlnaHRMaW5lTnVtYmVyKys7XG4gICAgfVxuICB9XG59O1xuIl19