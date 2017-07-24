(function() {
  var DotRenderer;

  module.exports = DotRenderer = (function() {
    function DotRenderer() {}

    DotRenderer.prototype.render = function(colorMarker) {
      var charWidth, color, column, index, lineHeight, markers, pixelPosition, range, screenLine, textEditor, textEditorElement;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (color == null) {
        return {};
      }
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      charWidth = textEditor.getDefaultCharWidth();
      markers = colorMarker.colorBuffer.findValidColorMarkers({
        intersectsScreenRowRange: [range.end.row, range.end.row]
      }).filter(function(m) {
        return m.getScreenRange().end.row === range.end.row;
      });
      index = markers.indexOf(colorMarker);
      screenLine = this.screenLineForScreenRow(textEditor, range.end.row);
      if (screenLine == null) {
        return {};
      }
      lineHeight = textEditor.getLineHeightInPixels();
      column = this.getLineLastColumn(screenLine) * charWidth;
      pixelPosition = textEditorElement.pixelPositionForScreenPosition(range.end);
      return {
        "class": 'dot',
        style: {
          backgroundColor: color.toCSS(),
          top: (pixelPosition.top + lineHeight / 2) + 'px',
          left: (column + index * 18) + 'px'
        }
      };
    };

    DotRenderer.prototype.getLineLastColumn = function(line) {
      if (line.lineText != null) {
        return line.lineText.length + 1;
      } else {
        return line.getMaxScreenColumn() + 1;
      }
    };

    DotRenderer.prototype.screenLineForScreenRow = function(textEditor, row) {
      if (textEditor.screenLineForScreenRow != null) {
        return textEditor.screenLineForScreenRow(row);
      } else {
        return textEditor.displayBuffer.screenLines[row];
      }
    };

    return DotRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVuZGVyZXJzL2RvdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsV0FBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007NkJBQ0o7O0FBQUEsMEJBQUEsTUFBQSxHQUFRLFNBQUMsV0FBRCxHQUFBO0FBQ04sVUFBQSxxSEFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxjQUFaLENBQUEsQ0FBUixDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsV0FBVyxDQUFDLEtBRnBCLENBQUE7QUFJQSxNQUFBLElBQWlCLGFBQWpCO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FKQTtBQUFBLE1BTUEsVUFBQSxHQUFhLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFOckMsQ0FBQTtBQUFBLE1BT0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFVBQW5CLENBUHBCLENBQUE7QUFBQSxNQVFBLFNBQUEsR0FBWSxVQUFVLENBQUMsbUJBQVgsQ0FBQSxDQVJaLENBQUE7QUFBQSxNQVVBLE9BQUEsR0FBVSxXQUFXLENBQUMsV0FBVyxDQUFDLHFCQUF4QixDQUE4QztBQUFBLFFBQ3RELHdCQUFBLEVBQTBCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFYLEVBQWdCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBMUIsQ0FENEI7T0FBOUMsQ0FFUixDQUFDLE1BRk8sQ0FFQSxTQUFDLENBQUQsR0FBQTtlQUFPLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FBa0IsQ0FBQyxHQUFHLENBQUMsR0FBdkIsS0FBOEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUEvQztNQUFBLENBRkEsQ0FWVixDQUFBO0FBQUEsTUFjQSxLQUFBLEdBQVEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBaEIsQ0FkUixDQUFBO0FBQUEsTUFlQSxVQUFBLEdBQWEsSUFBQyxDQUFBLHNCQUFELENBQXdCLFVBQXhCLEVBQW9DLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBOUMsQ0FmYixDQUFBO0FBaUJBLE1BQUEsSUFBaUIsa0JBQWpCO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FqQkE7QUFBQSxNQW1CQSxVQUFBLEdBQWEsVUFBVSxDQUFDLHFCQUFYLENBQUEsQ0FuQmIsQ0FBQTtBQUFBLE1Bb0JBLE1BQUEsR0FBUyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsVUFBbkIsQ0FBQSxHQUFpQyxTQXBCMUMsQ0FBQTtBQUFBLE1BcUJBLGFBQUEsR0FBZ0IsaUJBQWlCLENBQUMsOEJBQWxCLENBQWlELEtBQUssQ0FBQyxHQUF2RCxDQXJCaEIsQ0FBQTthQXVCQTtBQUFBLFFBQUEsT0FBQSxFQUFPLEtBQVA7QUFBQSxRQUNBLEtBQUEsRUFDRTtBQUFBLFVBQUEsZUFBQSxFQUFpQixLQUFLLENBQUMsS0FBTixDQUFBLENBQWpCO0FBQUEsVUFDQSxHQUFBLEVBQUssQ0FBQyxhQUFhLENBQUMsR0FBZCxHQUFvQixVQUFBLEdBQWEsQ0FBbEMsQ0FBQSxHQUF1QyxJQUQ1QztBQUFBLFVBRUEsSUFBQSxFQUFNLENBQUMsTUFBQSxHQUFTLEtBQUEsR0FBUSxFQUFsQixDQUFBLEdBQXdCLElBRjlCO1NBRkY7UUF4Qk07SUFBQSxDQUFSLENBQUE7O0FBQUEsMEJBOEJBLGlCQUFBLEdBQW1CLFNBQUMsSUFBRCxHQUFBO0FBQ2pCLE1BQUEsSUFBRyxxQkFBSDtlQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBZCxHQUF1QixFQUR6QjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsa0JBQUwsQ0FBQSxDQUFBLEdBQTRCLEVBSDlCO09BRGlCO0lBQUEsQ0E5Qm5CLENBQUE7O0FBQUEsMEJBb0NBLHNCQUFBLEdBQXdCLFNBQUMsVUFBRCxFQUFhLEdBQWIsR0FBQTtBQUN0QixNQUFBLElBQUcseUNBQUg7ZUFDRSxVQUFVLENBQUMsc0JBQVgsQ0FBa0MsR0FBbEMsRUFERjtPQUFBLE1BQUE7ZUFHRSxVQUFVLENBQUMsYUFBYSxDQUFDLFdBQVksQ0FBQSxHQUFBLEVBSHZDO09BRHNCO0lBQUEsQ0FwQ3hCLENBQUE7O3VCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/renderers/dot.coffee
