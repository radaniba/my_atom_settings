(function() {
  var Color, ColorMarker, ColorMarkerElement, click, path, stylesheet, stylesheetPath;

  path = require('path');

  Color = require('../lib/color');

  ColorMarker = require('../lib/color-marker');

  ColorMarkerElement = require('../lib/color-marker-element');

  click = require('./helpers/events').click;

  stylesheetPath = path.resolve(__dirname, '..', 'styles', 'pigments.less');

  stylesheet = atom.themes.loadStylesheet(stylesheetPath);

  describe('ColorMarkerElement', function() {
    var colorMarker, colorMarkerElement, editor, jasmineContent, marker, _ref;
    _ref = [], editor = _ref[0], marker = _ref[1], colorMarker = _ref[2], colorMarkerElement = _ref[3], jasmineContent = _ref[4];
    beforeEach(function() {
      var color, styleNode, text;
      jasmineContent = document.body.querySelector('#jasmine-content');
      styleNode = document.createElement('style');
      styleNode.textContent = "" + stylesheet;
      jasmineContent.appendChild(styleNode);
      editor = atom.workspace.buildTextEditor({});
      editor.setText("body {\n  color: #f00;\n  bar: foo;\n  foo: bar;\n}");
      marker = editor.markBufferRange([[1, 9], [4, 1]], {
        type: 'pigments-color',
        invalidate: 'touch'
      });
      color = new Color('#ff0000');
      text = '#f00';
      return colorMarker = new ColorMarker({
        marker: marker,
        color: color,
        text: text,
        colorBuffer: {
          editor: editor,
          selectColorMarkerAndOpenPicker: jasmine.createSpy('select-color'),
          ignoredScopes: [],
          getMarkerLayer: function() {
            return editor;
          }
        }
      });
    });
    it('releases itself when the marker is destroyed', function() {
      var eventSpy;
      colorMarkerElement = new ColorMarkerElement;
      colorMarkerElement.setContainer({
        editor: editor,
        requestMarkerUpdate: function(_arg) {
          var marker;
          marker = _arg[0];
          return marker.render();
        }
      });
      colorMarkerElement.setModel(colorMarker);
      eventSpy = jasmine.createSpy('did-release');
      colorMarkerElement.onDidRelease(eventSpy);
      spyOn(colorMarkerElement, 'release').andCallThrough();
      marker.destroy();
      expect(colorMarkerElement.release).toHaveBeenCalled();
      return expect(eventSpy).toHaveBeenCalled();
    });
    describe('clicking on the decoration', function() {
      beforeEach(function() {
        colorMarkerElement = new ColorMarkerElement;
        colorMarkerElement.setContainer({
          editor: editor,
          requestMarkerUpdate: function(_arg) {
            var marker;
            marker = _arg[0];
            return marker.render();
          }
        });
        colorMarkerElement.setModel(colorMarker);
        return click(colorMarkerElement);
      });
      return it('calls selectColorMarkerAndOpenPicker on the buffer', function() {
        return expect(colorMarker.colorBuffer.selectColorMarkerAndOpenPicker).toHaveBeenCalled();
      });
    });
    describe('when the render mode is set to background', function() {
      var regions;
      regions = [][0];
      beforeEach(function() {
        ColorMarkerElement.setMarkerType('background');
        colorMarkerElement = new ColorMarkerElement;
        colorMarkerElement.setContainer({
          editor: editor,
          requestMarkerUpdate: function(_arg) {
            var marker;
            marker = _arg[0];
            return marker.render();
          }
        });
        colorMarkerElement.setModel(colorMarker);
        return regions = colorMarkerElement.querySelectorAll('.region.background');
      });
      it('creates a region div for the color', function() {
        return expect(regions.length).toEqual(4);
      });
      it('fills the region with the covered text', function() {
        expect(regions[0].textContent).toEqual('#f00;');
        expect(regions[1].textContent).toEqual('  bar: foo;');
        expect(regions[2].textContent).toEqual('  foo: bar;');
        return expect(regions[3].textContent).toEqual('}');
      });
      it('sets the background of the region with the color css value', function() {
        var region, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = regions.length; _i < _len; _i++) {
          region = regions[_i];
          _results.push(expect(region.style.backgroundColor).toEqual('rgb(255, 0, 0)'));
        }
        return _results;
      });
      describe('when the marker is modified', function() {
        beforeEach(function() {
          spyOn(colorMarkerElement.renderer, 'render').andCallThrough();
          editor.moveToTop();
          return editor.insertText('\n\n');
        });
        return it('renders again the marker content', function() {
          expect(colorMarkerElement.renderer.render).toHaveBeenCalled();
          return expect(colorMarkerElement.querySelectorAll('.region').length).toEqual(4);
        });
      });
      return describe('when released', function() {
        return it('removes all the previously rendered content', function() {
          colorMarkerElement.release();
          return expect(colorMarkerElement.children.length).toEqual(0);
        });
      });
    });
    describe('when the render mode is set to outline', function() {
      var regions;
      regions = [][0];
      beforeEach(function() {
        ColorMarkerElement.setMarkerType('outline');
        colorMarkerElement = new ColorMarkerElement;
        colorMarkerElement.setContainer({
          editor: editor,
          requestMarkerUpdate: function(_arg) {
            var marker;
            marker = _arg[0];
            return marker.render();
          }
        });
        colorMarkerElement.setModel(colorMarker);
        return regions = colorMarkerElement.querySelectorAll('.region.outline');
      });
      it('creates a region div for the color', function() {
        return expect(regions.length).toEqual(4);
      });
      it('fills the region with the covered text', function() {
        expect(regions[0].textContent).toEqual('');
        expect(regions[1].textContent).toEqual('');
        expect(regions[2].textContent).toEqual('');
        return expect(regions[3].textContent).toEqual('');
      });
      it('sets the drop shadow color of the region with the color css value', function() {
        var region, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = regions.length; _i < _len; _i++) {
          region = regions[_i];
          _results.push(expect(region.style.borderColor).toEqual('rgb(255, 0, 0)'));
        }
        return _results;
      });
      describe('when the marker is modified', function() {
        beforeEach(function() {
          spyOn(colorMarkerElement.renderer, 'render').andCallThrough();
          editor.moveToTop();
          return editor.insertText('\n\n');
        });
        return it('renders again the marker content', function() {
          expect(colorMarkerElement.renderer.render).toHaveBeenCalled();
          return expect(colorMarkerElement.querySelectorAll('.region').length).toEqual(4);
        });
      });
      return describe('when released', function() {
        return it('removes all the previously rendered content', function() {
          colorMarkerElement.release();
          return expect(colorMarkerElement.children.length).toEqual(0);
        });
      });
    });
    describe('when the render mode is set to underline', function() {
      var regions;
      regions = [][0];
      beforeEach(function() {
        ColorMarkerElement.setMarkerType('underline');
        colorMarkerElement = new ColorMarkerElement;
        colorMarkerElement.setContainer({
          editor: editor,
          requestMarkerUpdate: function(_arg) {
            var marker;
            marker = _arg[0];
            return marker.render();
          }
        });
        colorMarkerElement.setModel(colorMarker);
        return regions = colorMarkerElement.querySelectorAll('.region.underline');
      });
      it('creates a region div for the color', function() {
        return expect(regions.length).toEqual(4);
      });
      it('fills the region with the covered text', function() {
        expect(regions[0].textContent).toEqual('');
        expect(regions[1].textContent).toEqual('');
        expect(regions[2].textContent).toEqual('');
        return expect(regions[3].textContent).toEqual('');
      });
      it('sets the background of the region with the color css value', function() {
        var region, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = regions.length; _i < _len; _i++) {
          region = regions[_i];
          _results.push(expect(region.style.backgroundColor).toEqual('rgb(255, 0, 0)'));
        }
        return _results;
      });
      describe('when the marker is modified', function() {
        beforeEach(function() {
          spyOn(colorMarkerElement.renderer, 'render').andCallThrough();
          editor.moveToTop();
          return editor.insertText('\n\n');
        });
        return it('renders again the marker content', function() {
          expect(colorMarkerElement.renderer.render).toHaveBeenCalled();
          return expect(colorMarkerElement.querySelectorAll('.region').length).toEqual(4);
        });
      });
      return describe('when released', function() {
        return it('removes all the previously rendered content', function() {
          colorMarkerElement.release();
          return expect(colorMarkerElement.children.length).toEqual(0);
        });
      });
    });
    describe('when the render mode is set to dot', function() {
      var createMarker, markerElement, markers, markersElements, regions, _ref1;
      _ref1 = [], regions = _ref1[0], markers = _ref1[1], markersElements = _ref1[2], markerElement = _ref1[3];
      createMarker = function(range, color, text) {
        marker = editor.markBufferRange(range, {
          type: 'pigments-color',
          invalidate: 'touch'
        });
        color = new Color(color);
        text = text;
        return colorMarker = new ColorMarker({
          marker: marker,
          color: color,
          text: text,
          colorBuffer: {
            editor: editor,
            project: {
              colorPickerAPI: {
                open: jasmine.createSpy('color-picker.open')
              }
            },
            ignoredScopes: [],
            getMarkerLayer: function() {
              return editor;
            }
          }
        });
      };
      beforeEach(function() {
        var editorElement;
        editor = atom.workspace.buildTextEditor({});
        editor.setText("body {\n  background: red, green, blue;\n}");
        editorElement = atom.views.getView(editor);
        jasmineContent.appendChild(editorElement);
        markers = [createMarker([[1, 13], [1, 16]], '#ff0000', 'red'), createMarker([[1, 18], [1, 23]], '#00ff00', 'green'), createMarker([[1, 25], [1, 29]], '#0000ff', 'blue')];
        ColorMarkerElement.setMarkerType('dot');
        return markersElements = markers.map(function(colorMarker) {
          colorMarkerElement = new ColorMarkerElement;
          colorMarkerElement.setContainer({
            editor: editor,
            requestMarkerUpdate: function(_arg) {
              var marker;
              marker = _arg[0];
              return marker.render();
            }
          });
          colorMarkerElement.setModel(colorMarker);
          jasmineContent.appendChild(colorMarkerElement);
          return colorMarkerElement;
        });
      });
      return it('adds the dot class on the marker', function() {
        var markersElement, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = markersElements.length; _i < _len; _i++) {
          markersElement = markersElements[_i];
          _results.push(expect(markersElement.classList.contains('dot')).toBeTruthy());
        }
        return _results;
      });
    });
    return describe('when the render mode is set to dot', function() {
      var createMarker, markers, markersElements, regions, _ref1;
      _ref1 = [], regions = _ref1[0], markers = _ref1[1], markersElements = _ref1[2];
      createMarker = function(range, color, text) {
        marker = editor.markBufferRange(range, {
          type: 'pigments-color',
          invalidate: 'touch'
        });
        color = new Color(color);
        text = text;
        return colorMarker = new ColorMarker({
          marker: marker,
          color: color,
          text: text,
          colorBuffer: {
            editor: editor,
            project: {
              colorPickerAPI: {
                open: jasmine.createSpy('color-picker.open')
              }
            },
            ignoredScopes: [],
            getMarkerLayer: function() {
              return editor;
            }
          }
        });
      };
      beforeEach(function() {
        var editorElement;
        editor = atom.workspace.buildTextEditor({});
        editor.setText("body {\n  background: red, green, blue;\n}");
        editorElement = atom.views.getView(editor);
        jasmineContent.appendChild(editorElement);
        markers = [createMarker([[1, 13], [1, 16]], '#ff0000', 'red'), createMarker([[1, 18], [1, 23]], '#00ff00', 'green'), createMarker([[1, 25], [1, 29]], '#0000ff', 'blue')];
        ColorMarkerElement.setMarkerType('square-dot');
        return markersElements = markers.map(function(colorMarker) {
          colorMarkerElement = new ColorMarkerElement;
          colorMarkerElement.setContainer({
            editor: editor,
            requestMarkerUpdate: function(_arg) {
              var marker;
              marker = _arg[0];
              return marker.render();
            }
          });
          colorMarkerElement.setModel(colorMarker);
          jasmineContent.appendChild(colorMarkerElement);
          return colorMarkerElement;
        });
      });
      return it('adds the dot class on the marker', function() {
        var markersElement, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = markersElements.length; _i < _len; _i++) {
          markersElement = markersElements[_i];
          expect(markersElement.classList.contains('dot')).toBeTruthy();
          _results.push(expect(markersElement.classList.contains('square')).toBeTruthy());
        }
        return _results;
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLW1hcmtlci1lbGVtZW50LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtFQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUixDQURSLENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUdBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSw2QkFBUixDQUhyQixDQUFBOztBQUFBLEVBSUMsUUFBUyxPQUFBLENBQVEsa0JBQVIsRUFBVCxLQUpELENBQUE7O0FBQUEsRUFNQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixJQUF4QixFQUE4QixRQUE5QixFQUF3QyxlQUF4QyxDQU5qQixDQUFBOztBQUFBLEVBT0EsVUFBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBWixDQUEyQixjQUEzQixDQVBiLENBQUE7O0FBQUEsRUFTQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFFBQUEscUVBQUE7QUFBQSxJQUFBLE9BQW9FLEVBQXBFLEVBQUMsZ0JBQUQsRUFBUyxnQkFBVCxFQUFpQixxQkFBakIsRUFBOEIsNEJBQTlCLEVBQWtELHdCQUFsRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxzQkFBQTtBQUFBLE1BQUEsY0FBQSxHQUFpQixRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWQsQ0FBNEIsa0JBQTVCLENBQWpCLENBQUE7QUFBQSxNQUVBLFNBQUEsR0FBWSxRQUFRLENBQUMsYUFBVCxD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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/color-marker-element-spec.coffee
