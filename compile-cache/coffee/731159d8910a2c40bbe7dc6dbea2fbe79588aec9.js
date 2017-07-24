(function() {
  var DiffLine, DiffView, View, fmtNum,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom-space-pen-views').View;

  DiffLine = (function(superClass) {
    extend(DiffLine, superClass);

    function DiffLine() {
      return DiffLine.__super__.constructor.apply(this, arguments);
    }

    DiffLine.content = function(line) {
      return this.div({
        "class": "line " + line.type
      }, (function(_this) {
        return function() {
          _this.pre({
            "class": "lineno " + (!line.lineno ? 'invisible' : '')
          }, line.lineno);
          return _this.pre({
            outlet: 'linetext'
          }, line.text);
        };
      })(this));
    };

    DiffLine.prototype.initialize = function(params) {
      if (params.type === 'heading') {
        return this.linetext.click(function() {
          return atom.workspace.open(params.text);
        });
      }
    };

    return DiffLine;

  })(View);

  fmtNum = function(num) {
    return ("     " + (num || '') + " ").slice(-6);
  };

  module.exports = DiffView = (function(superClass) {
    extend(DiffView, superClass);

    function DiffView() {
      return DiffView.__super__.constructor.apply(this, arguments);
    }

    DiffView.content = function() {
      return this.div({
        "class": 'diff'
      });
    };

    DiffView.prototype.clearAll = function() {
      this.find('>.line').remove();
    };

    DiffView.prototype.addAll = function(diffs) {
      this.clearAll();
      diffs.forEach((function(_this) {
        return function(diff) {
          var file, noa, nob;
          if ((file = diff['+++']) === '+++ /dev/null') {
            file = diff['---'];
          }
          _this.append(new DiffLine({
            type: 'heading',
            text: file
          }));
          noa = 0;
          nob = 0;
          diff.lines.forEach(function(line) {
            var atend, atstart, klass, linea, lineb, lineno, ref;
            klass = '';
            lineno = void 0;
            if (/^@@ /.test(line)) {
              ref = line.replace(/-|\+/g, '').split(' '), atstart = ref[0], linea = ref[1], lineb = ref[2], atend = ref[3];
              noa = parseInt(linea, 10);
              nob = parseInt(lineb, 10);
              klass = 'subtle';
            } else {
              lineno = "" + (fmtNum(noa)) + (fmtNum(nob));
              if (/^-/.test(line)) {
                klass = 'red';
                lineno = "" + (fmtNum(noa)) + (fmtNum(0));
                noa++;
              } else if (/^\+/.test(line)) {
                klass = 'green';
                lineno = "" + (fmtNum(0)) + (fmtNum(nob));
                nob++;
              } else {
                noa++;
                nob++;
              }
            }
            _this.append(new DiffLine({
              type: klass,
              text: line,
              lineno: lineno
            }));
          });
        };
      })(this));
    };

    return DiffView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvZGlmZi12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7SUFBQTs7O0VBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVI7O0VBRUg7Ozs7Ozs7SUFDSixRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRDthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQUEsR0FBUSxJQUFJLENBQUMsSUFBcEI7T0FBTCxFQUFpQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDL0IsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBQSxHQUFTLENBQUMsQ0FBTyxJQUFJLENBQUMsTUFBWixHQUF3QixXQUF4QixHQUF5QyxFQUExQyxDQUFoQjtXQUFMLEVBQXFFLElBQUksQ0FBQyxNQUExRTtpQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsTUFBQSxFQUFRLFVBQVI7V0FBTCxFQUF5QixJQUFJLENBQUMsSUFBOUI7UUFGK0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDO0lBRFE7O3VCQUtWLFVBQUEsR0FBWSxTQUFDLE1BQUQ7TUFDVixJQUFHLE1BQU0sQ0FBQyxJQUFQLEtBQWUsU0FBbEI7ZUFBaUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLFNBQUE7aUJBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLE1BQU0sQ0FBQyxJQUEzQjtRQUFILENBQWhCLEVBQWpDOztJQURVOzs7O0tBTlM7O0VBU3ZCLE1BQUEsR0FBUyxTQUFDLEdBQUQ7QUFDUCxXQUFPLENBQUEsT0FBQSxHQUFPLENBQUMsR0FBQSxJQUFPLEVBQVIsQ0FBUCxHQUFrQixHQUFsQixDQUFvQixDQUFDLEtBQXJCLENBQTJCLENBQUMsQ0FBNUI7RUFEQTs7RUFHVCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtPQUFMO0lBRFE7O3VCQUdWLFFBQUEsR0FBVSxTQUFBO01BQ1IsSUFBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLENBQWUsQ0FBQyxNQUFoQixDQUFBO0lBRFE7O3VCQUlWLE1BQUEsR0FBUSxTQUFDLEtBQUQ7TUFDTixJQUFDLENBQUEsUUFBRCxDQUFBO01BRUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtBQUNaLGNBQUE7VUFBQSxJQUFHLENBQUMsSUFBQSxHQUFPLElBQUssQ0FBQSxLQUFBLENBQWIsQ0FBQSxLQUF3QixlQUEzQjtZQUNFLElBQUEsR0FBTyxJQUFLLENBQUEsS0FBQSxFQURkOztVQUdBLEtBQUMsQ0FBQSxNQUFELENBQVksSUFBQSxRQUFBLENBQVM7WUFBQSxJQUFBLEVBQU0sU0FBTjtZQUFpQixJQUFBLEVBQU0sSUFBdkI7V0FBVCxDQUFaO1VBRUEsR0FBQSxHQUFNO1VBQ04sR0FBQSxHQUFNO1VBRU4sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFNBQUMsSUFBRDtBQUNqQixnQkFBQTtZQUFBLEtBQUEsR0FBUTtZQUNSLE1BQUEsR0FBUztZQUVULElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQUg7Y0FFRSxNQUFpQyxJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsRUFBc0IsRUFBdEIsQ0FBeUIsQ0FBQyxLQUExQixDQUFnQyxHQUFoQyxDQUFqQyxFQUFDLGdCQUFELEVBQVUsY0FBVixFQUFpQixjQUFqQixFQUF3QjtjQUN4QixHQUFBLEdBQU0sUUFBQSxDQUFTLEtBQVQsRUFBZ0IsRUFBaEI7Y0FDTixHQUFBLEdBQU0sUUFBQSxDQUFTLEtBQVQsRUFBZ0IsRUFBaEI7Y0FDTixLQUFBLEdBQVEsU0FMVjthQUFBLE1BQUE7Y0FRRSxNQUFBLEdBQVMsRUFBQSxHQUFFLENBQUMsTUFBQSxDQUFPLEdBQVAsQ0FBRCxDQUFGLEdBQWUsQ0FBQyxNQUFBLENBQU8sR0FBUCxDQUFEO2NBRXhCLElBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLENBQUg7Z0JBQ0UsS0FBQSxHQUFRO2dCQUNSLE1BQUEsR0FBUyxFQUFBLEdBQUUsQ0FBQyxNQUFBLENBQU8sR0FBUCxDQUFELENBQUYsR0FBZSxDQUFDLE1BQUEsQ0FBTyxDQUFQLENBQUQ7Z0JBQ3hCLEdBQUEsR0FIRjtlQUFBLE1BSUssSUFBRyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBSDtnQkFDSCxLQUFBLEdBQVE7Z0JBQ1IsTUFBQSxHQUFTLEVBQUEsR0FBRSxDQUFDLE1BQUEsQ0FBTyxDQUFQLENBQUQsQ0FBRixHQUFhLENBQUMsTUFBQSxDQUFPLEdBQVAsQ0FBRDtnQkFDdEIsR0FBQSxHQUhHO2VBQUEsTUFBQTtnQkFLSCxHQUFBO2dCQUNBLEdBQUEsR0FORztlQWRQOztZQXNCQSxLQUFDLENBQUEsTUFBRCxDQUFZLElBQUEsUUFBQSxDQUFTO2NBQUEsSUFBQSxFQUFNLEtBQU47Y0FBYSxJQUFBLEVBQU0sSUFBbkI7Y0FBeUIsTUFBQSxFQUFRLE1BQWpDO2FBQVQsQ0FBWjtVQTFCaUIsQ0FBbkI7UUFUWTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZDtJQUhNOzs7O0tBUmE7QUFmdkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuY2xhc3MgRGlmZkxpbmUgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAobGluZSkgLT5cbiAgICBAZGl2IGNsYXNzOiBcImxpbmUgI3tsaW5lLnR5cGV9XCIsID0+XG4gICAgICBAcHJlIGNsYXNzOiBcImxpbmVubyAje3VubGVzcyBsaW5lLmxpbmVubyB0aGVuICdpbnZpc2libGUnIGVsc2UgJyd9XCIsIGxpbmUubGluZW5vXG4gICAgICBAcHJlIG91dGxldDogJ2xpbmV0ZXh0JywgbGluZS50ZXh0XG5cbiAgaW5pdGlhbGl6ZTogKHBhcmFtcykgLT5cbiAgICBpZiBwYXJhbXMudHlwZSA9PSAnaGVhZGluZycgdGhlbiBAbGluZXRleHQuY2xpY2soLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihwYXJhbXMudGV4dCkpXG5cbmZtdE51bSA9IChudW0pIC0+XG4gIHJldHVybiBcIiAgICAgI3tudW0gb3IgJyd9IFwiLnNsaWNlKC02KVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBEaWZmVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ2RpZmYnXG5cbiAgY2xlYXJBbGw6IC0+XG4gICAgQGZpbmQoJz4ubGluZScpLnJlbW92ZSgpXG4gICAgcmV0dXJuXG5cbiAgYWRkQWxsOiAoZGlmZnMpIC0+XG4gICAgQGNsZWFyQWxsKClcblxuICAgIGRpZmZzLmZvckVhY2ggKGRpZmYpID0+XG4gICAgICBpZiAoZmlsZSA9IGRpZmZbJysrKyddKSBpcyAnKysrIC9kZXYvbnVsbCdcbiAgICAgICAgZmlsZSA9IGRpZmZbJy0tLSddXG5cbiAgICAgIEBhcHBlbmQgbmV3IERpZmZMaW5lKHR5cGU6ICdoZWFkaW5nJywgdGV4dDogZmlsZSlcblxuICAgICAgbm9hID0gMFxuICAgICAgbm9iID0gMFxuXG4gICAgICBkaWZmLmxpbmVzLmZvckVhY2ggKGxpbmUpID0+XG4gICAgICAgIGtsYXNzID0gJydcbiAgICAgICAgbGluZW5vID0gdW5kZWZpbmVkXG5cbiAgICAgICAgaWYgL15AQCAvLnRlc3QobGluZSlcbiAgICAgICAgICAjIEBAIC0xMDAsMTEgKzEwMCwxMyBAQFxuICAgICAgICAgIFthdHN0YXJ0LCBsaW5lYSwgbGluZWIsIGF0ZW5kXSA9IGxpbmUucmVwbGFjZSgvLXxcXCsvZywgJycpLnNwbGl0KCcgJylcbiAgICAgICAgICBub2EgPSBwYXJzZUludChsaW5lYSwgMTApXG4gICAgICAgICAgbm9iID0gcGFyc2VJbnQobGluZWIsIDEwKVxuICAgICAgICAgIGtsYXNzID0gJ3N1YnRsZSdcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGluZW5vID0gXCIje2ZtdE51bSBub2F9I3tmbXROdW0gbm9ifVwiXG5cbiAgICAgICAgICBpZiAvXi0vLnRlc3QobGluZSlcbiAgICAgICAgICAgIGtsYXNzID0gJ3JlZCdcbiAgICAgICAgICAgIGxpbmVubyA9IFwiI3tmbXROdW0gbm9hfSN7Zm10TnVtIDB9XCJcbiAgICAgICAgICAgIG5vYSsrXG4gICAgICAgICAgZWxzZSBpZiAvXlxcKy8udGVzdChsaW5lKVxuICAgICAgICAgICAga2xhc3MgPSAnZ3JlZW4nXG4gICAgICAgICAgICBsaW5lbm8gPSBcIiN7Zm10TnVtIDB9I3tmbXROdW0gbm9ifVwiXG4gICAgICAgICAgICBub2IrK1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5vYSsrXG4gICAgICAgICAgICBub2IrK1xuXG4gICAgICAgIEBhcHBlbmQgbmV3IERpZmZMaW5lKHR5cGU6IGtsYXNzLCB0ZXh0OiBsaW5lLCBsaW5lbm86IGxpbmVubylcblxuICAgICAgICByZXR1cm5cbiAgICAgIHJldHVyblxuICAgIHJldHVyblxuIl19
