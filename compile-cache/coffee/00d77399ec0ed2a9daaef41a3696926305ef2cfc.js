(function() {
  var Color, ColorMarker;

  Color = require('../lib/color');

  ColorMarker = require('../lib/color-marker');

  describe('ColorMarker', function() {
    var colorMarker, colorMarkerElement, editor, jasmineContent, marker, _ref;
    _ref = [], editor = _ref[0], marker = _ref[1], colorMarker = _ref[2], colorMarkerElement = _ref[3], jasmineContent = _ref[4];
    beforeEach(function() {
      var color, text;
      editor = atom.workspace.buildTextEditor({});
      editor.setText("body {\n  color: hsva(0, 100%, 100%, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      marker = editor.markBufferRange([[1, 9], [1, 33]], {
        type: 'pigments-color'
      });
      color = new Color(255, 0, 0, 0.5);
      text = 'hsva(0, 100%, 100%, 0.5)';
      return colorMarker = new ColorMarker({
        marker: marker,
        color: color,
        text: text
      });
    });
    describe('::convertContentToHex', function() {
      beforeEach(function() {
        return colorMarker.convertContentToHex();
      });
      return it('replaces the text in the editor by the hexadecimal version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: #ff0000;\n  bar: foo;\n  foo: bar;\n}");
      });
    });
    describe('::convertContentToRGBA', function() {
      beforeEach(function() {
        return colorMarker.convertContentToRGBA();
      });
      it('replaces the text in the editor by the rgba version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: rgba(255, 0, 0, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is 1', function() {
        beforeEach(function() {
          colorMarker.color.alpha = 1;
          return colorMarker.convertContentToRGBA();
        });
        return it('replaces the text in the editor by the rgba version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: rgba(255, 0, 0, 1);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
    describe('::convertContentToRGB', function() {
      beforeEach(function() {
        colorMarker.color.alpha = 1;
        return colorMarker.convertContentToRGB();
      });
      it('replaces the text in the editor by the rgb version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: rgb(255, 0, 0);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is not 1', function() {
        beforeEach(function() {
          return colorMarker.convertContentToRGB();
        });
        return it('replaces the text in the editor by the rgb version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: rgb(255, 0, 0);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
    describe('::convertContentToHSLA', function() {
      beforeEach(function() {
        return colorMarker.convertContentToHSLA();
      });
      it('replaces the text in the editor by the hsla version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: hsla(0, 100%, 50%, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is 1', function() {
        beforeEach(function() {
          colorMarker.color.alpha = 1;
          return colorMarker.convertContentToHSLA();
        });
        return it('replaces the text in the editor by the hsla version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: hsla(0, 100%, 50%, 1);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
    return describe('::convertContentToHSL', function() {
      beforeEach(function() {
        colorMarker.color.alpha = 1;
        return colorMarker.convertContentToHSL();
      });
      it('replaces the text in the editor by the hsl version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: hsl(0, 100%, 50%);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is not 1', function() {
        beforeEach(function() {
          return colorMarker.convertContentToHSL();
        });
        return it('replaces the text in the editor by the hsl version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: hsl(0, 100%, 50%);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLW1hcmtlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrQkFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUixDQUFSLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLHFFQUFBO0FBQUEsSUFBQSxPQUFvRSxFQUFwRSxFQUFDLGdCQUFELEVBQVMsZ0JBQVQsRUFBaUIscUJBQWpCLEVBQThCLDRCQUE5QixFQUFrRCx3QkFBbEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsV0FBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUErQixFQUEvQixDQUFULENBQUE7QUFBQSxNQUNBLE1BQU0sQ0FBQyxPQUFQLENBQWUseUVBQWYsQ0FEQSxDQUFBO0FBQUEsTUFRQSxNQUFBLEdBQVMsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBTyxDQUFDLENBQUQsRUFBRyxFQUFILENBQVAsQ0FBdkIsRUFBdUM7QUFBQSxRQUFBLElBQUEsRUFBTSxnQkFBTjtPQUF2QyxDQVJULENBQUE7QUFBQSxNQVNBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsQ0FBWCxFQUFjLENBQWQsRUFBaUIsR0FBakIsQ0FUWixDQUFBO0FBQUEsTUFVQSxJQUFBLEdBQU8sMEJBVlAsQ0FBQTthQVlBLFdBQUEsR0FBa0IsSUFBQSxXQUFBLENBQVk7QUFBQSxRQUFD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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/color-marker-spec.coffee
