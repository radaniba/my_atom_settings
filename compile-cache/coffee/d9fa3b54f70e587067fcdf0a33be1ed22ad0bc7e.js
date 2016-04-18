(function() {
  var DotRenderer;

  module.exports = DotRenderer = (function() {
    function DotRenderer() {}

    DotRenderer.prototype.render = function(colorMarker) {
      var charWidth, color, column, displayBuffer, index, lineHeight, markers, pixelPosition, range, screenLine, textEditor, textEditorElement;
      range = colorMarker.getScreenRange();
      color = colorMarker.color;
      if (color == null) {
        return {};
      }
      textEditor = colorMarker.colorBuffer.editor;
      textEditorElement = atom.views.getView(textEditor);
      displayBuffer = colorMarker.marker.displayBuffer;
      charWidth = displayBuffer.getDefaultCharWidth();
      markers = colorMarker.colorBuffer.getMarkerLayer().findMarkers({
        type: 'pigments-color',
        intersectsScreenRowRange: [range.end.row, range.end.row]
      });
      index = markers.indexOf(colorMarker.marker);
      screenLine = displayBuffer.screenLines[range.end.row];
      if (screenLine == null) {
        return {};
      }
      lineHeight = textEditor.getLineHeightInPixels();
      column = (screenLine.getMaxScreenColumn() + 1) * charWidth;
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

    return DotRenderer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcmVuZGVyZXJzL2RvdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsV0FBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007NkJBQ0o7O0FBQUEsMEJBQUEsTUFBQSxHQUFRLFNBQUMsV0FBRCxHQUFBO0FBQ04sVUFBQSxvSUFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFdBQVcsQ0FBQyxjQUFaLENBQUEsQ0FBUixDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsV0FBVyxDQUFDLEtBRnBCLENBQUE7QUFJQSxNQUFBLElBQWlCLGFBQWpCO0FBQUEsZUFBTyxFQUFQLENBQUE7T0FKQTtBQUFBLE1BTUEsVUFBQSxHQUFhLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFOckMsQ0FBQTtBQUFBLE1BT0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFVBQW5CLENBUHBCLENBQUE7QUFBQSxNQVFBLGFBQUEsR0FBZ0IsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQVJuQyxDQUFBO0FBQUEsTUFTQSxTQUFBLEdBQVksYUFBYSxDQUFDLG1CQUFkLENBQUEsQ0FUWixDQUFBO0FBQUEsTUFXQSxPQUFBLEdBQVUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxjQUF4QixDQUFBLENBQXdDLENBQUMsV0FBekMsQ0FBcUQ7QUFBQSxRQUM3RCxJQUFBLEVBQU0sZ0JBRHVEO0FBQUEsUUFFN0Qsd0JBQUEsRUFBMEIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVgsRUFBZ0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUExQixDQUZtQztPQUFyRCxDQVhWLENBQUE7QUFBQSxNQWdCQSxLQUFBLEdBQVEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBVyxDQUFDLE1BQTVCLENBaEJSLENBQUE7QUFBQSxNQWlCQSxVQUFBLEdBQWEsYUFBYSxDQUFDLFdBQVksQ0FBQSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVYsQ0FqQnZDLENBQUE7QUFtQkEsTUFBQSxJQUFpQixrQkFBakI7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQW5CQTtBQUFBLE1BcUJBLFVBQUEsR0FBYSxVQUFVLENBQUMscUJBQVgsQ0FBQSxDQXJCYixDQUFBO0FBQUEsTUFzQkEsTUFBQSxHQUFTLENBQUMsVUFBVSxDQUFDLGtCQUFYLENBQUEsQ0FBQSxHQUFrQyxDQUFuQyxDQUFBLEdBQXdDLFNBdEJqRCxDQUFBO0FBQUEsTUF1QkEsYUFBQSxHQUFnQixpQkFBaUIsQ0FBQyw4QkFBbEIsQ0FBaUQsS0FBSyxDQUFDLEdBQXZELENBdkJoQixDQUFBO2FBeUJBO0FBQUEsUUFBQSxPQUFBLEVBQU8sS0FBUDtBQUFBLFFBQ0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxlQUFBLEVBQWlCLEtBQUssQ0FBQyxLQUFOLENBQUEsQ0FBakI7QUFBQSxVQUNBLEdBQUEsRUFBSyxDQUFDLGFBQWEsQ0FBQyxHQUFkLEdBQW9CLFVBQUEsR0FBYSxDQUFsQyxDQUFBLEdBQXVDLElBRDVDO0FBQUEsVUFFQSxJQUFBLEVBQU0sQ0FBQyxNQUFBLEdBQVMsS0FBQSxHQUFRLEVBQWxCLENBQUEsR0FBd0IsSUFGOUI7U0FGRjtRQTFCTTtJQUFBLENBQVIsQ0FBQTs7dUJBQUE7O01BRkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/renderers/dot.coffee
