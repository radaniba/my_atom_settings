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
    this._COPY_HELP_MESSAGE = 'Place your cursor in a chunk first!';
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
          this._selectedChunkIndex = this.getNumDifferences() - 1;
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

      for (var lineRange of linesToCopy) {
        for (var diffChunk of this._chunks) {
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
      for (var lineRange of linesToCopy) {
        for (var diffChunk of this._chunks) {
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
      return Array.isArray(this._chunks) ? this._chunks.length : 0;
    }
  }, {
    key: 'getMarkerLayers',
    value: function getMarkerLayers() {
      return this._markerLayers;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvZGlmZi12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztrQ0FFK0Isd0JBQXdCOzs7OytCQUMzQixxQkFBcUI7Ozs7QUFIakQsV0FBVyxDQUFBOztBQU1YLE1BQU0sQ0FBQyxPQUFPOzs7OztBQUlELFdBSlUsUUFBUSxDQUlqQixPQUFPLEVBQUU7MEJBSkEsUUFBUTs7QUFLM0IsUUFBSSxDQUFDLG9CQUFvQixHQUFHLG9DQUF1QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEUsUUFBSSxDQUFDLG9CQUFvQixHQUFHLG9DQUF1QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEUsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbEIsUUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztBQUNoQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxxQ0FBcUMsQ0FBQztBQUNoRSxRQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztHQUN6Qjs7Ozs7Ozs7Ozs7O2VBWm9CLFFBQVE7O1dBdUJsQixxQkFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUU7QUFDL0YsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQzs7O0FBR2pDLFVBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQy9CLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEQsWUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDLFVBQVUsR0FBRyxT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QUFDLENBQUM7QUFDL0ksc0JBQWMsRUFBRSxDQUFDO09BQ2xCOztBQUVELGFBQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUU7QUFDeEMsWUFBSSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxFQUFDLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQzdNLHVCQUFlLEVBQUUsQ0FBQztPQUNuQjtLQUNGOzs7U0E5Um9CLFFBQVE7SUErUjlCLENBQUMiLCJmaWxlIjoiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9kaWZmLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgRWRpdG9yRGlmZkV4dGVuZGVyIGZyb20gJy4vZWRpdG9yLWRpZmYtZXh0ZW5kZXInO1xuaW1wb3J0IENvbXB1dGVXb3JkRGlmZiBmcm9tICcuL2NvbXB1dGUtd29yZC1kaWZmJztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIERpZmZWaWV3IHtcbiAgLypcbiAgICogQHBhcmFtIGVkaXRvcnMgQXJyYXkgb2YgZWRpdG9ycyBiZWluZyBkaWZmZWQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlZGl0b3JzKSB7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMSA9IG5ldyBFZGl0b3JEaWZmRXh0ZW5kZXIoZWRpdG9ycy5lZGl0b3IxKTtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyID0gbmV3IEVkaXRvckRpZmZFeHRlbmRlcihlZGl0b3JzLmVkaXRvcjIpO1xuICAgIHRoaXMuX2NodW5rcyA9IFtdO1xuICAgIHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ID0gMDtcbiAgICB0aGlzLl9DT1BZX0hFTFBfTUVTU0FHRSA9ICdQbGFjZSB5b3VyIGN1cnNvciBpbiBhIGNodW5rIGZpcnN0ISc7XG4gICAgdGhpcy5fbWFya2VyTGF5ZXJzID0ge307XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBoaWdobGlnaHRpbmcgdG8gdGhlIGVkaXRvcnMgdG8gc2hvdyB0aGUgZGlmZi5cbiAgICpcbiAgICogQHBhcmFtIGRpZmYgVGhlIGRpZmYgdG8gaGlnaGxpZ2h0LlxuICAgKiBAcGFyYW0gbGVmdEhpZ2hsaWdodFR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IChleDogJ2FkZGVkJykuXG4gICAqIEBwYXJhbSByaWdodEhpZ2hsaWdodFR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IChleDogJ3JlbW92ZWQnKS5cbiAgICogQHBhcmFtIGlzV29yZERpZmZFbmFibGVkIFdoZXRoZXIgZGlmZmVyZW5jZXMgYmV0d2VlbiB3b3JkcyBwZXIgbGluZSBzaG91bGQgYmUgaGlnaGxpZ2h0ZWQuXG4gICAqIEBwYXJhbSBpc1doaXRlc3BhY2VJZ25vcmVkIFdoZXRoZXIgd2hpdGVzcGFjZSBzaG91bGQgYmUgaWdub3JlZC5cbiAgICovXG4gIGRpc3BsYXlEaWZmKGRpZmYsIGxlZnRIaWdobGlnaHRUeXBlLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV29yZERpZmZFbmFibGVkLCBpc1doaXRlc3BhY2VJZ25vcmVkKSB7XG4gICAgdGhpcy5fY2h1bmtzID0gZGlmZi5jaHVua3MgfHwgW107XG5cbiAgICAvLyBtYWtlIHRoZSBsYXN0IGNodW5rIGVxdWFsIHNpemUgb24gYm90aCBzY3JlZW5zIHNvIHRoZSBlZGl0b3JzIHJldGFpbiBzeW5jIHNjcm9sbCAjNThcbiAgICBpZih0aGlzLmdldE51bURpZmZlcmVuY2VzKCkgPiAwKSB7XG4gICAgICB2YXIgbGFzdENodW5rID0gdGhpcy5fY2h1bmtzW3RoaXMuX2NodW5rcy5sZW5ndGggLSAxXTtcbiAgICAgIHZhciBvbGRDaHVua1JhbmdlID0gbGFzdENodW5rLm9sZExpbmVFbmQgLSBsYXN0Q2h1bmsub2xkTGluZVN0YXJ0O1xuICAgICAgdmFyIG5ld0NodW5rUmFuZ2UgPSBsYXN0Q2h1bmsubmV3TGluZUVuZCAtIGxhc3RDaHVuay5uZXdMaW5lU3RhcnQ7XG4gICAgICBpZihvbGRDaHVua1JhbmdlID4gbmV3Q2h1bmtSYW5nZSkge1xuICAgICAgICAvLyBtYWtlIHRoZSBvZmZzZXQgYXMgbGFyZ2UgYXMgbmVlZGVkIHRvIG1ha2UgdGhlIGNodW5rIHRoZSBzYW1lIHNpemUgaW4gYm90aCBlZGl0b3JzXG4gICAgICAgIGRpZmYubmV3TGluZU9mZnNldHNbbGFzdENodW5rLm5ld0xpbmVTdGFydCArIG5ld0NodW5rUmFuZ2VdID0gb2xkQ2h1bmtSYW5nZSAtIG5ld0NodW5rUmFuZ2U7XG4gICAgICB9IGVsc2UgaWYobmV3Q2h1bmtSYW5nZSA+IG9sZENodW5rUmFuZ2UpIHtcbiAgICAgICAgLy8gbWFrZSB0aGUgb2Zmc2V0IGFzIGxhcmdlIGFzIG5lZWRlZCB0byBtYWtlIHRoZSBjaHVuayB0aGUgc2FtZSBzaXplIGluIGJvdGggZWRpdG9yc1xuICAgICAgICBkaWZmLm9sZExpbmVPZmZzZXRzW2xhc3RDaHVuay5vbGRMaW5lU3RhcnQgKyBvbGRDaHVua1JhbmdlXSA9IG5ld0NodW5rUmFuZ2UgLSBvbGRDaHVua1JhbmdlO1xuICAgICAgfVxuICAgIH0gXG5cbiAgICBmb3IodmFyIGNodW5rIG9mIHRoaXMuX2NodW5rcykge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5oaWdobGlnaHRMaW5lcyhjaHVuay5vbGRMaW5lU3RhcnQsIGNodW5rLm9sZExpbmVFbmQsIGxlZnRIaWdobGlnaHRUeXBlKTtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuaGlnaGxpZ2h0TGluZXMoY2h1bmsubmV3TGluZVN0YXJ0LCBjaHVuay5uZXdMaW5lRW5kLCByaWdodEhpZ2hsaWdodFR5cGUpO1xuXG4gICAgICBpZihpc1dvcmREaWZmRW5hYmxlZCkge1xuICAgICAgICB0aGlzLl9oaWdobGlnaHRXb3Jkc0luQ2h1bmsoY2h1bmssIGxlZnRIaWdobGlnaHRUeXBlLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2V0TGluZU9mZnNldHMoZGlmZi5vbGRMaW5lT2Zmc2V0cyk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5zZXRMaW5lT2Zmc2V0cyhkaWZmLm5ld0xpbmVPZmZzZXRzKTtcblxuICAgIHRoaXMuX21hcmtlckxheWVycyA9IHtcbiAgICAgIGVkaXRvcjE6IHtcbiAgICAgICAgaWQ6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuaWQsXG4gICAgICAgIGxpbmVNYXJrZXJMYXllcjogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRMaW5lTWFya2VyTGF5ZXIoKSxcbiAgICAgICAgaGlnaGxpZ2h0VHlwZTogbGVmdEhpZ2hsaWdodFR5cGUsXG4gICAgICAgIHNlbGVjdGlvbk1hcmtlckxheWVyOiB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldFNlbGVjdGlvbk1hcmtlckxheWVyKClcbiAgICAgIH0sXG4gICAgICBlZGl0b3IyOiB7XG4gICAgICAgIGlkOiB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmlkLFxuICAgICAgICBsaW5lTWFya2VyTGF5ZXI6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0TGluZU1hcmtlckxheWVyKCksXG4gICAgICAgIGhpZ2hsaWdodFR5cGU6IHJpZ2h0SGlnaGxpZ2h0VHlwZSxcbiAgICAgICAgc2VsZWN0aW9uTWFya2VyTGF5ZXI6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0U2VsZWN0aW9uTWFya2VyTGF5ZXIoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgdGhlIGRpZmYgaGlnaGxpZ2h0aW5nIGFuZCBvZmZzZXRzIGZyb20gdGhlIGVkaXRvcnMuXG4gICAqL1xuICBjbGVhckRpZmYoKSB7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5kZXN0cm95TWFya2VycygpO1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZGVzdHJveU1hcmtlcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgdG8gbW92ZSB0aGUgY3VycmVudCBzZWxlY3Rpb24gaGlnaGxpZ2h0IHRvIHRoZSBuZXh0IGRpZmYgY2h1bmsuXG4gICAqL1xuICBuZXh0RGlmZigpIHtcbiAgICBpZih0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSkge1xuICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4Kys7XG4gICAgICBpZih0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPj0gdGhpcy5nZXROdW1EaWZmZXJlbmNlcygpKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCA9IDA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZWxlY3RDaHVuayh0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgpO1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHRvIG1vdmUgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGhpZ2hsaWdodCB0byB0aGUgcHJldmlvdXMgZGlmZiBjaHVuay5cbiAgICovXG4gIHByZXZEaWZmKCkge1xuICAgIGlmKHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgtLTtcbiAgICAgIGlmKHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCA8IDApIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ID0gdGhpcy5nZXROdW1EaWZmZXJlbmNlcygpIC0gMVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fc2VsZWN0Q2h1bmsodGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4KTtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGRpZmYgY2h1bmsgZnJvbSB0aGUgbGVmdCBlZGl0b3IgdG8gdGhlIHJpZ2h0XG4gICAqIGVkaXRvci5cbiAgICovXG4gIGNvcHlUb1JpZ2h0KCkge1xuICAgIHZhciBsaW5lc1RvQ29weSA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0Q3Vyc29yRGlmZkxpbmVzKCk7XG5cbiAgICBpZihsaW5lc1RvQ29weS5sZW5ndGggPT0gMCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiB0aGlzLl9DT1BZX0hFTFBfTUVTU0FHRSwgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuICAgIH1cblxuICAgIC8vIGtlZXAgdHJhY2sgb2YgbGluZSBvZmZzZXQgKHVzZWQgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgY2h1bmtzIGJlaW5nIG1vdmVkKVxuICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgZm9yKHZhciBsaW5lUmFuZ2Ugb2YgbGluZXNUb0NvcHkpIHtcbiAgICAgIGZvcih2YXIgZGlmZkNodW5rIG9mIHRoaXMuX2NodW5rcykge1xuICAgICAgICBpZihsaW5lUmFuZ2Uuc3RhcnQucm93ID09IGRpZmZDaHVuay5vbGRMaW5lU3RhcnQpIHtcbiAgICAgICAgICB2YXIgdGV4dFRvQ29weSA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCAwXSwgW2RpZmZDaHVuay5vbGRMaW5lRW5kLCAwXV0pO1xuICAgICAgICAgIHZhciBsYXN0QnVmZmVyUm93ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5nZXRMYXN0QnVmZmVyUm93KCk7XG5cbiAgICAgICAgICAvLyBpbnNlcnQgbmV3IGxpbmUgaWYgdGhlIGNodW5rIHdlIHdhbnQgdG8gY29weSB3aWxsIGJlIGJlbG93IHRoZSBsYXN0IGxpbmUgb2YgdGhlIG90aGVyIGVkaXRvclxuICAgICAgICAgIGlmKChkaWZmQ2h1bmsubmV3TGluZVN0YXJ0ICsgb2Zmc2V0KSA+IGxhc3RCdWZmZXJSb3cpIHtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2xhc3RCdWZmZXJSb3csIDBdLCB7YXV0b3Njcm9sbDogZmFsc2V9KTtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuaW5zZXJ0TmV3bGluZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsubmV3TGluZVN0YXJ0ICsgb2Zmc2V0LCAwXSwgW2RpZmZDaHVuay5uZXdMaW5lRW5kICsgb2Zmc2V0LCAwXV0sIHRleHRUb0NvcHkpO1xuICAgICAgICAgIC8vIG9mZnNldCB3aWxsIGJlIHRoZSBhbW91bnQgb2YgbGluZXMgdG8gYmUgY29waWVkIG1pbnVzIHRoZSBhbW91bnQgb2YgbGluZXMgb3ZlcndyaXR0ZW5cbiAgICAgICAgICBvZmZzZXQgKz0gKGRpZmZDaHVuay5vbGRMaW5lRW5kIC0gZGlmZkNodW5rLm9sZExpbmVTdGFydCkgLSAoZGlmZkNodW5rLm5ld0xpbmVFbmQgLSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0KTtcbiAgICAgICAgICAvLyBtb3ZlIHRoZSBzZWxlY3Rpb24gcG9pbnRlciBiYWNrIHNvIHRoZSBuZXh0IGRpZmYgY2h1bmsgaXMgbm90IHNraXBwZWRcbiAgICAgICAgICBpZih0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmhhc1NlbGVjdGlvbigpIHx8IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuaGFzU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleC0tO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb3BpZXMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBkaWZmIGNodW5rIGZyb20gdGhlIHJpZ2h0IGVkaXRvciB0byB0aGUgbGVmdFxuICAgKiBlZGl0b3IuXG4gICAqL1xuICBjb3B5VG9MZWZ0KCkge1xuICAgIHZhciBsaW5lc1RvQ29weSA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0Q3Vyc29yRGlmZkxpbmVzKCk7XG5cbiAgICBpZihsaW5lc1RvQ29weS5sZW5ndGggPT0gMCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiB0aGlzLl9DT1BZX0hFTFBfTUVTU0FHRSwgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KTtcbiAgICB9XG5cbiAgICB2YXIgb2Zmc2V0ID0gMDsgLy8ga2VlcCB0cmFjayBvZiBsaW5lIG9mZnNldCAodXNlZCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBjaHVua3MgYmVpbmcgbW92ZWQpXG4gICAgZm9yKHZhciBsaW5lUmFuZ2Ugb2YgbGluZXNUb0NvcHkpIHtcbiAgICAgIGZvcih2YXIgZGlmZkNodW5rIG9mIHRoaXMuX2NodW5rcykge1xuICAgICAgICBpZihsaW5lUmFuZ2Uuc3RhcnQucm93ID09IGRpZmZDaHVuay5uZXdMaW5lU3RhcnQpIHtcbiAgICAgICAgICB2YXIgdGV4dFRvQ29weSA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsubmV3TGluZVN0YXJ0LCAwXSwgW2RpZmZDaHVuay5uZXdMaW5lRW5kLCAwXV0pO1xuICAgICAgICAgIHZhciBsYXN0QnVmZmVyUm93ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5nZXRMYXN0QnVmZmVyUm93KCk7XG4gICAgICAgICAgLy8gaW5zZXJ0IG5ldyBsaW5lIGlmIHRoZSBjaHVuayB3ZSB3YW50IHRvIGNvcHkgd2lsbCBiZSBiZWxvdyB0aGUgbGFzdCBsaW5lIG9mIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgICAgICBpZigoZGlmZkNodW5rLm9sZExpbmVTdGFydCArIG9mZnNldCkgPiBsYXN0QnVmZmVyUm93KSB7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtsYXN0QnVmZmVyUm93LCAwXSwge2F1dG9zY3JvbGw6IGZhbHNlfSk7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmluc2VydE5ld2xpbmUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtbZGlmZkNodW5rLm9sZExpbmVTdGFydCArIG9mZnNldCwgMF0sIFtkaWZmQ2h1bmsub2xkTGluZUVuZCArIG9mZnNldCwgMF1dLCB0ZXh0VG9Db3B5KTtcbiAgICAgICAgICAvLyBvZmZzZXQgd2lsbCBiZSB0aGUgYW1vdW50IG9mIGxpbmVzIHRvIGJlIGNvcGllZCBtaW51cyB0aGUgYW1vdW50IG9mIGxpbmVzIG92ZXJ3cml0dGVuXG4gICAgICAgICAgb2Zmc2V0ICs9IChkaWZmQ2h1bmsubmV3TGluZUVuZCAtIGRpZmZDaHVuay5uZXdMaW5lU3RhcnQpIC0gKGRpZmZDaHVuay5vbGRMaW5lRW5kIC0gZGlmZkNodW5rLm9sZExpbmVTdGFydCk7XG4gICAgICAgICAgLy8gbW92ZSB0aGUgc2VsZWN0aW9uIHBvaW50ZXIgYmFjayBzbyB0aGUgbmV4dCBkaWZmIGNodW5rIGlzIG5vdCBza2lwcGVkXG4gICAgICAgICAgaWYodGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5oYXNTZWxlY3Rpb24oKSB8fCB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmhhc1NlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgtLTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW5zIHVwIHRoZSBlZGl0b3IgaW5kaWNhdGVkIGJ5IGluZGV4LiBBIGNsZWFuIHVwIHdpbGwgcmVtb3ZlIHRoZSBlZGl0b3JcbiAgICogb3IgdGhlIHBhbmUgaWYgbmVjZXNzYXJ5LiBUeXBpY2FsbHkgbGVmdCBlZGl0b3IgPT0gMSBhbmQgcmlnaHQgZWRpdG9yID09IDIuXG4gICAqXG4gICAqIEBwYXJhbSBlZGl0b3JJbmRleCBUaGUgaW5kZXggb2YgdGhlIGVkaXRvciB0byBjbGVhbiB1cC5cbiAgICovXG4gIGNsZWFuVXBFZGl0b3IoZWRpdG9ySW5kZXgpIHtcbiAgICBpZihlZGl0b3JJbmRleCA9PT0gMSkge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5jbGVhblVwKCk7XG4gICAgfSBlbHNlIGlmKGVkaXRvckluZGV4ID09PSAyKSB7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmNsZWFuVXAoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGVkaXRvciBkaWZmIGV4dGVuZGVycy5cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5kZXN0cm95KCk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5kZXN0cm95KCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIGVkaXRvcnMuXG4gICAqXG4gICAqIEByZXR1cm4gaW50IFRoZSBudW1iZXIgb2YgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgZWRpdG9ycy5cbiAgICovXG4gIGdldE51bURpZmZlcmVuY2VzKCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMuX2NodW5rcykgPyB0aGlzLl9jaHVua3MubGVuZ3RoIDogMDtcbiAgfVxuXG4gIGdldE1hcmtlckxheWVycygpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya2VyTGF5ZXJzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBSSVZBVEUgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuICAvKipcbiAgICogU2VsZWN0cyBhbmQgaGlnaGxpZ2h0cyB0aGUgZGlmZiBjaHVuayBpbiBib3RoIGVkaXRvcnMgYWNjb3JkaW5nIHRvIHRoZVxuICAgKiBnaXZlbiBpbmRleC5cbiAgICpcbiAgICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgZGlmZiBjaHVuayB0byBoaWdobGlnaHQgaW4gYm90aCBlZGl0b3JzLlxuICAgKi9cbiAgX3NlbGVjdENodW5rKGluZGV4KSB7XG4gICAgdmFyIGRpZmZDaHVuayA9IHRoaXMuX2NodW5rc1tpbmRleF07XG4gICAgaWYoZGlmZkNodW5rICE9IG51bGwpIHtcbiAgICAgIC8vIGRlc2VsZWN0IHByZXZpb3VzIG5leHQvcHJldiBoaWdobGlnaHRzXG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmRlc2VsZWN0QWxsTGluZXMoKTtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZGVzZWxlY3RBbGxMaW5lcygpO1xuICAgICAgLy8gaGlnaGxpZ2h0IGFuZCBzY3JvbGwgZWRpdG9yIDFcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2VsZWN0TGluZXMoIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQsIGRpZmZDaHVuay5vbGRMaW5lRW5kICk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCBbZGlmZkNodW5rLm9sZExpbmVTdGFydCwgMF0sIHthdXRvc2Nyb2xsOiB0cnVlfSApO1xuICAgICAgLy8gaGlnaGxpZ2h0IGFuZCBzY3JvbGwgZWRpdG9yIDJcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuc2VsZWN0TGluZXMoIGRpZmZDaHVuay5uZXdMaW5lU3RhcnQsIGRpZmZDaHVuay5uZXdMaW5lRW5kICk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCBbZGlmZkNodW5rLm5ld0xpbmVTdGFydCwgMF0sIHthdXRvc2Nyb2xsOiB0cnVlfSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHRzIHRoZSB3b3JkIGRpZmYgb2YgdGhlIGNodW5rIHBhc3NlZCBpbi5cbiAgICpcbiAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0aGF0IHNob3VsZCBoYXZlIGl0cyB3b3JkcyBoaWdobGlnaHRlZC5cbiAgICovXG4gIF9oaWdobGlnaHRXb3Jkc0luQ2h1bmsoY2h1bmssIGxlZnRIaWdobGlnaHRUeXBlLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpIHtcbiAgICB2YXIgbGVmdExpbmVOdW1iZXIgPSBjaHVuay5vbGRMaW5lU3RhcnQ7XG4gICAgdmFyIHJpZ2h0TGluZU51bWJlciA9IGNodW5rLm5ld0xpbmVTdGFydDtcbiAgICAvLyBmb3IgZWFjaCBsaW5lIHRoYXQgaGFzIGEgY29ycmVzcG9uZGluZyBsaW5lXG4gICAgd2hpbGUobGVmdExpbmVOdW1iZXIgPCBjaHVuay5vbGRMaW5lRW5kICYmIHJpZ2h0TGluZU51bWJlciA8IGNodW5rLm5ld0xpbmVFbmQpIHtcbiAgICAgIHZhciBlZGl0b3IxTGluZVRleHQgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGxlZnRMaW5lTnVtYmVyKTtcbiAgICAgIHZhciBlZGl0b3IyTGluZVRleHQgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJpZ2h0TGluZU51bWJlcik7XG5cbiAgICAgIGlmKGVkaXRvcjFMaW5lVGV4dCA9PSAnJykge1xuICAgICAgICAvLyBjb21wdXRlV29yZERpZmYgcmV0dXJucyBlbXB0eSBmb3IgbGluZXMgdGhhdCBhcmUgcGFpcmVkIHdpdGggZW1wdHkgbGluZXNcbiAgICAgICAgLy8gbmVlZCB0byBmb3JjZSBhIGhpZ2hsaWdodFxuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNldFdvcmRIaWdobGlnaHRzKHJpZ2h0TGluZU51bWJlciwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogZWRpdG9yMkxpbmVUZXh0fV0sIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICB9IGVsc2UgaWYoIGVkaXRvcjJMaW5lVGV4dCA9PSAnJyApIHtcbiAgICAgICAgLy8gY29tcHV0ZVdvcmREaWZmIHJldHVybnMgZW1wdHkgZm9yIGxpbmVzIHRoYXQgYXJlIHBhaXJlZCB3aXRoIGVtcHR5IGxpbmVzXG4gICAgICAgIC8vIG5lZWQgdG8gZm9yY2UgYSBoaWdobGlnaHRcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRXb3JkSGlnaGxpZ2h0cyhsZWZ0TGluZU51bWJlciwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogZWRpdG9yMUxpbmVUZXh0fV0sIGxlZnRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHBlcmZvcm0gcmVndWxhciB3b3JkIGRpZmZcbiAgICAgICAgdmFyIHdvcmREaWZmID0gQ29tcHV0ZVdvcmREaWZmLmNvbXB1dGVXb3JkRGlmZihlZGl0b3IxTGluZVRleHQsIGVkaXRvcjJMaW5lVGV4dCk7XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2V0V29yZEhpZ2hsaWdodHMobGVmdExpbmVOdW1iZXIsIHdvcmREaWZmLnJlbW92ZWRXb3JkcywgbGVmdEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpO1xuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNldFdvcmRIaWdobGlnaHRzKHJpZ2h0TGluZU51bWJlciwgd29yZERpZmYuYWRkZWRXb3JkcywgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkKTtcbiAgICAgIH1cblxuICAgICAgbGVmdExpbmVOdW1iZXIrKztcbiAgICAgIHJpZ2h0TGluZU51bWJlcisrO1xuICAgIH1cblxuICAgIC8vIGhpZ2hsaWdodCByZW1haW5pbmcgbGluZXMgaW4gbGVmdCBlZGl0b3JcbiAgICB3aGlsZShsZWZ0TGluZU51bWJlciA8IGNodW5rLm9sZExpbmVFbmQpIHtcbiAgICAgIHZhciBlZGl0b3IxTGluZVRleHQgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGxlZnRMaW5lTnVtYmVyKTtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2V0V29yZEhpZ2hsaWdodHMobGVmdExpbmVOdW1iZXIsIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IGVkaXRvcjFMaW5lVGV4dH1dLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICBsZWZ0TGluZU51bWJlcisrO1xuICAgIH1cbiAgICAvLyBoaWdobGlnaHQgcmVtYWluaW5nIGxpbmVzIGluIHRoZSByaWdodCBlZGl0b3JcbiAgICB3aGlsZShyaWdodExpbmVOdW1iZXIgPCBjaHVuay5uZXdMaW5lRW5kKSB7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNldFdvcmRIaWdobGlnaHRzKHJpZ2h0TGluZU51bWJlciwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhyaWdodExpbmVOdW1iZXIpfV0sIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICByaWdodExpbmVOdW1iZXIrKztcbiAgICB9XG4gIH1cbn07XG4iXX0=