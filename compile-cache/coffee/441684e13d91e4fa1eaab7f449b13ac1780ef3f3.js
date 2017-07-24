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
          useNativeDecorations: function() {
            return false;
          },
          selectColorMarkerAndOpenPicker: jasmine.createSpy('select-color'),
          ignoredScopes: [],
          findValidColorMarkers: function() {
            return [];
          }
        }
      });
    });
    it('releases itself when the marker is destroyed', function() {
      var eventSpy;
      colorMarkerElement = new ColorMarkerElement;
      colorMarkerElement.setContainer({
        editor: editor,
        useNativeDecorations: function() {
          return false;
        },
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
          useNativeDecorations: function() {
            return false;
          },
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
          useNativeDecorations: function() {
            return false;
          },
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
          useNativeDecorations: function() {
            return false;
          },
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
          useNativeDecorations: function() {
            return false;
          },
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
            useNativeDecorations: function() {
              return false;
            },
            project: {
              colorPickerAPI: {
                open: jasmine.createSpy('color-picker.open')
              }
            },
            ignoredScopes: [],
            findValidColorMarkers: function() {
              return [];
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
            useNativeDecorations: function() {
              return false;
            },
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
            useNativeDecorations: function() {
              return false;
            },
            project: {
              colorPickerAPI: {
                open: jasmine.createSpy('color-picker.open')
              }
            },
            ignoredScopes: [],
            findValidColorMarkers: function() {
              return [];
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
            useNativeDecorations: function() {
              return false;
            },
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
