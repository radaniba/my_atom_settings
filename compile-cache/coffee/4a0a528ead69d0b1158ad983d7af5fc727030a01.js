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
      markers = colorMarker.colorBuffer.getMarkerLayer().findMarkers({
        type: 'pigments-color',
        intersectsScreenRowRange: [range.end.row, range.end.row]
      });
      index = markers.indexOf(colorMarker.marker);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVuZGVyZXJzL2RvdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsV0FBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007NkJBQ0o7O0FBQUEsMEJBQUEsTUFBQSxHQUFRLFNBQUMsV0FBRCxHQUFBO0FBQ04sVUFBQSxxSEFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxjQUFaLENBQUEsQ0FBUixDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsV0FBVyxDQUFDLEtBRnBCLENBQUE7QUFJQSxNQUFBLElBQWlCLGFBQWpCO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FKQTtBQUFBLE1BTUEsVUFBQSxHQUFhLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFOckMsQ0FBQTtBQUFBLE1BT0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFVBQW5CLENBUHBCLENBQUE7QUFBQSxNQVFBLFNBQUEsR0FBWSxVQUFVLENBQUMsbUJBQVgsQ0FBQSxDQVJaLENBQUE7QUFBQSxNQVVBLE9BQUEsR0FBVSxXQUFXLENBQUMsV0FBVyxDQUFDLGNBQXhCLENBQUEsQ0FBd0MsQ0FBQyxXQUF6QyxDQUFxRDtBQUFBLFFBQzdELElBQUEsRUFBTSxnQkFEdUQ7QUFBQSxRQUU3RCx3QkFBQSxFQUEwQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBWCxFQUFnQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQTFCLENBRm1DO09BQXJELENBVlYsQ0FBQTtBQUFBLE1BZUEsS0FBQSxHQUFRLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFdBQVcsQ0FBQyxNQUE1QixDQWZSLENBQUE7QUFBQSxNQWdCQSxVQUFBLEdBQWEsSUFBQyxDQUFBLHNCQUFELENBQXdCLFVBQXhCLEVBQW9DLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBOUMsQ0FoQmIsQ0FBQTtBQWtCQSxNQUFBLElBQWlCLGtCQUFqQjtBQUFBLGVBQU8sRUFBUCxDQUFBO09BbEJBO0FBQUEsTUFvQkEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxxQkFBWCxDQUFBLENBcEJiLENBQUE7QUFBQSxNQXFCQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGlCQUFELENBQW1CLFVBQW5CLENBQUEsR0FBaUMsU0FyQjFDLENBQUE7QUFBQSxNQXNCQSxhQUFBLEdBQWdCLGlCQUFpQixDQUFDLDhCQUFsQixDQUFpRCxLQUFLLENBQUMsR0FBdkQsQ0F0QmhCLENBQUE7YUF3QkE7QUFBQSxRQUFBLE9BQUEsRUFBTyxLQUFQO0FBQUEsUUFDQSxLQUFBLEVBQ0U7QUFBQSxVQUFBLGVBQUEsRUFBaUIsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFqQjtBQUFBLFVBQ0EsR0FBQSxFQUFLLENBQUMsYUFBYSxDQUFDLEdBQWQsR0FBb0IsVUFBQSxHQUFhLENBQWxDLENBQUEsR0FBdUMsSUFENUM7QUFBQSxVQUVBLElBQUEsRUFBTSxDQUFDLE1BQUEsR0FBUyxLQUFBLEdBQVEsRUFBbEIsQ0FBQSxHQUF3QixJQUY5QjtTQUZGO1FBekJNO0lBQUEsQ0FBUixDQUFBOztBQUFBLDBCQStCQSxpQkFBQSxHQUFtQixTQUFDLElBQUQsR0FBQTtBQUNqQixNQUFBLElBQUcscUJBQUg7ZUFDRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQWQsR0FBdUIsRUFEekI7T0FBQSxNQUFBO2VBR0UsSUFBSSxDQUFDLGtCQUFMLENBQUEsQ0FBQSxHQUE0QixFQUg5QjtPQURpQjtJQUFBLENBL0JuQixDQUFBOztBQUFBLDBCQXFDQSxzQkFBQSxHQUF3QixTQUFDLFVBQUQsRUFBYSxHQUFiLEdBQUE7QUFDdEIsTUFBQSxJQUFHLHlDQUFIO2VBQ0UsVUFBVSxDQUFDLHNCQUFYLENBQWtDLEdBQWxDLEVBREY7T0FBQSxNQUFBO2VBR0UsVUFBVSxDQUFDLGFBQWEsQ0FBQyxXQUFZLENBQUEsR0FBQSxFQUh2QztPQURzQjtJQUFBLENBckN4QixDQUFBOzt1QkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/renderers/dot.coffee
