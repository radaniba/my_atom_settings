(function() {
  var RegionRenderer;

  module.exports = RegionRenderer = (function() {
    function RegionRenderer() {}

    RegionRenderer.prototype.includeTextInRegion = false;

    RegionRenderer.prototype.renderRegions = function(colorMarker) {
      var range, regions, row, rowSpan, textEditor, _i, _ref, _ref1;
      range = colorMarker.getScreenRange();
      if (range.isEmpty()) {
        return [];
      }
      rowSpan = range.end.row - range.start.row;
      regions = [];
      textEditor = colorMarker.colorBuffer.editor;
      if (rowSpan === 0) {
        regions.push(this.createRegion(range.start, range.end, colorMarker));
      } else {
        regions.push(this.createRegion(range.start, {
          row: range.start.row,
          column: Infinity
        }, colorMarker, this.screenLineForScreenRow(textEditor, range.start.row)));
        if (rowSpan > 1) {
          for (row = _i = _ref = range.start.row + 1, _ref1 = range.end.row; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; row = _ref <= _ref1 ? ++_i : --_i) {
            regions.push(this.createRegion({
              row: row,
              column: 0
            }, {
              row: row,
              column: Infinity
            }, colorMarker, this.screenLineForScreenRow(textEditor, row)));
          }
        }
        regions.push(this.createRegion({
          row: range.end.row,
          column: 0
        }, range.end, colorMarker, this.screenLineForScreenRow(textEditor, range.end.row)));
      }
      return regions;
    };

    RegionRenderer.prototype.screenLineForScreenRow = function(textEditor, row) {
      if (textEditor.screenLineForScreenRow != null) {
        return textEditor.screenLineForScreenRow(row);
      } else {
        return textEditor.displayBuffer.screenLines[row];
      }
    };

    RegionRenderer.prototype.createRegion = function(start, end, colorMarker, screenLine) {
      var bufferRange, charWidth, clippedEnd, clippedStart, css, endPosition, lineHeight, name, needAdjustment, region, startPosition, text, textEditor, textEditorElement, value, _ref, _ref1;
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      if (textEditorElement.component == null) {
        return;
      }
      lineHeight = textEditor.getLineHeightInPixels();
      charWidth = textEditor.getDefaultCharWidth();
      clippedStart = {
        row: start.row,
        column: (_ref = this.clipScreenColumn(screenLine, start.column)) != null ? _ref : start.column
      };
      clippedEnd = {
        row: end.row,
        column: (_ref1 = this.clipScreenColumn(screenLine, end.column)) != null ? _ref1 : end.column
      };
      bufferRange = textEditor.bufferRangeForScreenRange({
        start: clippedStart,
        end: clippedEnd
      });
      needAdjustment = (screenLine != null ? typeof screenLine.isSoftWrapped === "function" ? screenLine.isSoftWrapped() : void 0 : void 0) && end.column >= (screenLine != null ? screenLine.text.length : void 0) - (screenLine != null ? screenLine.softWrapIndentationDelta : void 0);
      if (needAdjustment) {
        bufferRange.end.column++;
      }
      startPosition = textEditorElement.pixelPositionForScreenPosition(clippedStart);
      endPosition = textEditorElement.pixelPositionForScreenPosition(clippedEnd);
      text = textEditor.getBuffer().getTextInRange(bufferRange);
      css = {};
      css.left = startPosition.left;
      css.top = startPosition.top;
      css.width = endPosition.left - startPosition.left;
      if (needAdjustment) {
        css.width += charWidth;
      }
      css.height = lineHeight;
      region = document.createElement('div');
      region.className = 'region';
      if (this.includeTextInRegion) {
        region.textContent = text;
      }
      if (startPosition.left === endPosition.left) {
        region.invalid = true;
      }
      for (name in css) {
        value = css[name];
        region.style[name] = value + 'px';
      }
      return region;
    };

    RegionRenderer.prototype.clipScreenColumn = function(line, column) {
      if (line != null) {
        if (line.clipScreenColumn != null) {
          return line.clipScreenColumn(column);
        } else {
          return Math.min(line.lineText.length, column);
        }
      }
    };

    return RegionRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVuZGVyZXJzL3JlZ2lvbi1yZW5kZXJlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsY0FBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007Z0NBQ0o7O0FBQUEsNkJBQUEsbUJBQUEsR0FBcUIsS0FBckIsQ0FBQTs7QUFBQSw2QkFFQSxhQUFBLEdBQWUsU0FBQyxXQUFELEdBQUE7QUFDYixVQUFBLHlEQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsV0FBVyxDQUFDLGNBQVosQ0FBQSxDQUFSLENBQUE7QUFDQSxNQUFBLElBQWEsS0FBSyxDQUFDLE9BQU4sQ0FBQSxDQUFiO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FEQTtBQUFBLE1BR0EsT0FBQSxHQUFVLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBVixHQUFnQixLQUFLLENBQUMsS0FBSyxDQUFDLEdBSHRDLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FBVSxFQUpWLENBQUE7QUFBQSxNQU1BLFVBQUEsR0FBYSxXQUFXLENBQUMsV0FBVyxDQUFDLE1BTnJDLENBQUE7QUFRQSxNQUFBLElBQUcsT0FBQSxLQUFXLENBQWQ7QUFDRSxRQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxLQUFLLENBQUMsS0FBcEIsRUFBMkIsS0FBSyxDQUFDLEdBQWpDLEVBQXNDLFdBQXRDLENBQWIsQ0FBQSxDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFDLENBQUEsWUFBRCxDQUNYLEtBQUssQ0FBQyxLQURLLEVBRVg7QUFBQSxVQUNFLEdBQUEsRUFBSyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBRG5CO0FBQUEsVUFFRSxNQUFBLEVBQVEsUUFGVjtTQUZXLEVBTVgsV0FOVyxFQU9YLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixVQUF4QixFQUFvQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQWhELENBUFcsQ0FBYixDQUFBLENBQUE7QUFTQSxRQUFBLElBQUcsT0FBQSxHQUFVLENBQWI7QUFDRSxlQUFXLHdJQUFYLEdBQUE7QUFDRSxZQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLFlBQUQsQ0FDWDtBQUFBLGNBQUMsS0FBQSxHQUFEO0FBQUEsY0FBTSxNQUFBLEVBQVEsQ0FBZDthQURXLEVBRVg7QUFBQSxjQUFDLEtBQUEsR0FBRDtBQUFBLGNBQU0sTUFBQSxFQUFRLFFBQWQ7YUFGVyxFQUdYLFdBSFcsRUFJWCxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsVUFBeEIsRUFBb0MsR0FBcEMsQ0FKVyxDQUFiLENBQUEsQ0FERjtBQUFBLFdBREY7U0FUQTtBQUFBLFFBa0JBLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBQyxDQUFBLFlBQUQsQ0FDWDtBQUFBLFVBQUMsR0FBQSxFQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBaEI7QUFBQSxVQUFxQixNQUFBLEVBQVEsQ0FBN0I7U0FEVyxFQUVYLEtBQUssQ0FBQyxHQUZLLEVBR1gsV0FIVyxFQUlYLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixVQUF4QixFQUFvQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQTlDLENBSlcsQ0FBYixDQWxCQSxDQUhGO09BUkE7YUFvQ0EsUUFyQ2E7SUFBQSxDQUZmLENBQUE7O0FBQUEsNkJBeUNBLHNCQUFBLEdBQXdCLFNBQUMsVUFBRCxFQUFhLEdBQWIsR0FBQTtBQUN0QixNQUFBLElBQUcseUNBQUg7ZUFDRSxVQUFVLENBQUMsc0JBQVgsQ0FBa0MsR0FBbEMsRUFERjtPQUFBLE1BQUE7ZUFHRSxVQUFVLENBQUMsYUFBYSxDQUFDLFdBQVksQ0FBQSxHQUFBLEVBSHZDO09BRHNCO0lBQUEsQ0F6Q3hCLENBQUE7O0FBQUEsNkJBK0NBLFlBQUEsR0FBYyxTQUFDLEtBQUQsRUFBUSxHQUFSLEVBQWEsV0FBYixFQUEwQixVQUExQixHQUFBO0FBQ1osVUFBQSxvTEFBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBckMsQ0FBQTtBQUFBLE1BQ0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFVBQW5CLENBRHBCLENBQUE7QUFHQSxNQUFBLElBQWMsbUNBQWQ7QUFBQSxjQUFBLENBQUE7T0FIQTtBQUFBLE1BS0EsVUFBQSxHQUFhLFVBQVUsQ0FBQyxxQkFBWCxDQUFBLENBTGIsQ0FBQTtBQUFBLE1BTUEsU0FBQSxHQUFZLFVBQVUsQ0FBQyxtQkFBWCxDQUFBLENBTlosQ0FBQTtBQUFBLE1BUUEsWUFBQSxHQUFlO0FBQUEsUUFDYixHQUFBLEVBQUssS0FBSyxDQUFDLEdBREU7QUFBQSxRQUViLE1BQUEsNEVBQXNELEtBQUssQ0FBQyxNQUYvQztPQVJmLENBQUE7QUFBQSxNQVlBLFVBQUEsR0FBYTtBQUFBLFFBQ1gsR0FBQSxFQUFLLEdBQUcsQ0FBQyxHQURFO0FBQUEsUUFFWCxNQUFBLDRFQUFvRCxHQUFHLENBQUMsTUFGN0M7T0FaYixDQUFBO0FBQUEsTUFpQkEsV0FBQSxHQUFjLFVBQVUsQ0FBQyx5QkFBWCxDQUFxQztBQUFBLFFBQ2pELEtBQUEsRUFBTyxZQUQwQztBQUFBLFFBRWpELEdBQUEsRUFBSyxVQUY0QztPQUFyQyxDQWpCZCxDQUFBO0FBQUEsTUFzQkEsY0FBQSwwRUFBaUIsVUFBVSxDQUFFLGtDQUFaLElBQWlDLEdBQUcsQ0FBQyxNQUFKLDBCQUFjLFVBQVUsQ0FBRSxJQUFJLENBQUMsZ0JBQWpCLHlCQUEwQixVQUFVLENBQUUsa0NBdEJ0RyxDQUFBO0FBd0JBLE1BQUEsSUFBNEIsY0FBNUI7QUFBQSxRQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBaEIsRUFBQSxDQUFBO09BeEJBO0FBQUEsTUEwQkEsYUFBQSxHQUFnQixpQkFBaUIsQ0FBQyw4QkFBbEIsQ0FBaUQsWUFBakQsQ0ExQmhCLENBQUE7QUFBQSxNQTJCQSxXQUFBLEdBQWMsaUJBQWlCLENBQUMsOEJBQWxCLENBQWlELFVBQWpELENBM0JkLENBQUE7QUFBQSxNQTZCQSxJQUFBLEdBQU8sVUFBVSxDQUFDLFNBQVgsQ0FBQSxDQUFzQixDQUFDLGNBQXZCLENBQXNDLFdBQXRDLENBN0JQLENBQUE7QUFBQSxNQStCQSxHQUFBLEdBQU0sRUEvQk4sQ0FBQTtBQUFBLE1BZ0NBLEdBQUcsQ0FBQyxJQUFKLEdBQVcsYUFBYSxDQUFDLElBaEN6QixDQUFBO0FBQUEsTUFpQ0EsR0FBRyxDQUFDLEdBQUosR0FBVSxhQUFhLENBQUMsR0FqQ3hCLENBQUE7QUFBQSxNQWtDQSxHQUFHLENBQUMsS0FBSixHQUFZLFdBQVcsQ0FBQyxJQUFaLEdBQW1CLGFBQWEsQ0FBQyxJQWxDN0MsQ0FBQTtBQW1DQSxNQUFBLElBQTBCLGNBQTFCO0FBQUEsUUFBQSxHQUFHLENBQUMsS0FBSixJQUFhLFNBQWIsQ0FBQTtPQW5DQTtBQUFBLE1Bb0NBLEdBQUcsQ0FBQyxNQUFKLEdBQWEsVUFwQ2IsQ0FBQTtBQUFBLE1Bc0NBLE1BQUEsR0FBUyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQXRDVCxDQUFBO0FBQUEsTUF1Q0EsTUFBTSxDQUFDLFNBQVAsR0FBbUIsUUF2Q25CLENBQUE7QUF3Q0EsTUFBQSxJQUE2QixJQUFDLENBQUEsbUJBQTlCO0FBQUEsUUFBQSxNQUFNLENBQUMsV0FBUCxHQUFxQixJQUFyQixDQUFBO09BeENBO0FBeUNBLE1BQUEsSUFBeUIsYUFBYSxDQUFDLElBQWQsS0FBc0IsV0FBVyxDQUFDLElBQTNEO0FBQUEsUUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFqQixDQUFBO09BekNBO0FBMENBLFdBQUEsV0FBQTswQkFBQTtBQUFBLFFBQUEsTUFBTSxDQUFDLEtBQU0sQ0FBQSxJQUFBLENBQWIsR0FBcUIsS0FBQSxHQUFRLElBQTdCLENBQUE7QUFBQSxPQTFDQTthQTRDQSxPQTdDWTtJQUFBLENBL0NkLENBQUE7O0FBQUEsNkJBOEZBLGdCQUFBLEdBQWtCLFNBQUMsSUFBRCxFQUFPLE1BQVAsR0FBQTtBQUNoQixNQUFBLElBQUcsWUFBSDtBQUNFLFFBQUEsSUFBRyw2QkFBSDtpQkFDRSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsTUFBdEIsRUFERjtTQUFBLE1BQUE7aUJBR0UsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQXZCLEVBQStCLE1BQS9CLEVBSEY7U0FERjtPQURnQjtJQUFBLENBOUZsQixDQUFBOzswQkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/renderers/region-renderer.coffee
