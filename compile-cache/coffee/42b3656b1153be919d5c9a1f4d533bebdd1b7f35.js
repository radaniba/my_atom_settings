(function() {
  var Color, ColorMarker;

  Color = require('../lib/color');

  ColorMarker = require('../lib/color-marker');

  describe('ColorMarker', function() {
    var colorMarker, colorMarkerElement, editor, jasmineContent, marker, _ref;
    _ref = [], editor = _ref[0], marker = _ref[1], colorMarker = _ref[2], colorMarkerElement = _ref[3], jasmineContent = _ref[4];
    beforeEach(function() {
      var color, colorBuffer, text;
      editor = atom.workspace.buildTextEditor({});
      editor.setText("body {\n  color: hsva(0, 100%, 100%, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      marker = editor.markBufferRange([[1, 9], [1, 33]]);
      color = new Color(255, 0, 0, 0.5);
      text = 'hsva(0, 100%, 100%, 0.5)';
      colorBuffer = {
        editor: editor
      };
      return colorMarker = new ColorMarker({
        marker: marker,
        color: color,
        text: text,
        colorBuffer: colorBuffer
      });
    });
    describe('::copyContentAsHex', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsHex();
      });
      return it('write the hexadecimal version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("#ff0000");
      });
    });
    describe('::copyContentAsRGB', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsRGB();
      });
      return it('write the rgb version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("rgb(255, 0, 0)");
      });
    });
    describe('::copyContentAsRGBA', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsRGBA();
      });
      return it('write the rgba version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("rgba(255, 0, 0, 0.5)");
      });
    });
    describe('::copyContentAsHSL', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsHSL();
      });
      return it('write the hsl version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("hsl(0, 100%, 50%)");
      });
    });
    describe('::copyContentAsHSLA', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsHSLA();
      });
      return it('write the hsla version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("hsla(0, 100%, 50%, 0.5)");
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLW1hcmtlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrQkFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUixDQUFSLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLHFFQUFBO0FBQUEsSUFBQSxPQUFvRSxFQUFwRSxFQUFDLGdCQUFELEVBQVMsZ0JBQVQsRUFBaUIscUJBQWpCLEVBQThCLDRCQUE5QixFQUFrRCx3QkFBbEQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsd0JBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBK0IsRUFBL0IsQ0FBVCxDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsT0FBUCxDQUFlLHlFQUFmLENBREEsQ0FBQTtBQUFBLE1BUUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxlQUFQLENBQXVCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQU8sQ0FBQyxDQUFELEVBQUcsRUFBSCxDQUFQLENBQXZCLENBUlQsQ0FBQTtBQUFBLE1BU0EsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxDQUFYLEVBQWMsQ0FBZCxFQUFpQixHQUFqQixDQVRaLENBQUE7QUFBQSxNQVVBLElBQUEsR0FBTywwQkFWUCxDQUFBO0FBQUEsTUFXQSxXQUFBLEdBQWM7QUFBQSxRQUFDLFFBQUEsTUFBRDtPQVhkLENBQUE7YUFhQSxXQUFBLEdBQWtCLElBQUEsV0FBQSxD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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/color-marker-spec.coffee
