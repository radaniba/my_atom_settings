(function() {
  var VariableParser, registry;

  VariableParser = require('../lib/variable-parser');

  registry = require('../lib/variable-expressions');

  describe('VariableParser', function() {
    var itParses, parser;
    parser = [][0];
    itParses = function(expression) {
      return {
        as: function(variables) {
          it("parses '" + expression + "' as variables " + (jasmine.pp(variables)), function() {
            var expected, name, range, results, value, _i, _len, _ref, _results;
            results = parser.parse(expression);
            expect(results.length).toEqual(Object.keys(variables).length);
            _results = [];
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              _ref = results[_i], name = _ref.name, value = _ref.value, range = _ref.range;
              expected = variables[name];
              if (expected.value != null) {
                _results.push(expect(value).toEqual(expected.value));
              } else if (expected.range != null) {
                _results.push(expect(range).toEqual(expected.range));
              } else {
                _results.push(expect(value).toEqual(expected));
              }
            }
            return _results;
          });
          return this;
        },
        asDefault: function(variables) {
          it("parses '" + expression + "' as default variables " + (jasmine.pp(variables)), function() {
            var expected, isDefault, name, range, results, value, _i, _len, _ref, _results;
            results = parser.parse(expression);
            expect(results.length).toEqual(Object.keys(variables).length);
            _results = [];
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              _ref = results[_i], name = _ref.name, value = _ref.value, range = _ref.range, isDefault = _ref["default"];
              expected = variables[name];
              expect(isDefault).toBeTruthy();
              if (expected.value != null) {
                _results.push(expect(value).toEqual(expected.value));
              } else if (expected.range != null) {
                _results.push(expect(range).toEqual(expected.range));
              } else {
                _results.push(expect(value).toEqual(expected));
              }
            }
            return _results;
          });
          return this;
        },
        asUndefined: function() {
          return it("does not parse '" + expression + "' as a variable expression", function() {
            var results;
            results = parser.parse(expression);
            return expect(results).toBeUndefined();
          });
        }
      };
    };
    beforeEach(function() {
      return parser = new VariableParser(registry);
    });
    itParses('color = white').as({
      'color': 'white'
    });
    itParses('non-color = 10px').as({
      'non-color': '10px'
    });
    itParses('$color: white').as({
      '$color': 'white'
    });
    itParses('$color: white !default').asDefault({
      '$color': 'white'
    });
    itParses('$color: white // foo').as({
      '$color': 'white'
    });
    itParses('$color  : white').as({
      '$color': 'white'
    });
    itParses('$some-color: white;').as({
      '$some-color': 'white',
      '$some_color': 'white'
    });
    itParses('$some_color  : white').as({
      '$some-color': 'white',
      '$some_color': 'white'
    });
    itParses('$non-color: 10px;').as({
      '$non-color': '10px',
      '$non_color': '10px'
    });
    itParses('$non_color: 10px').as({
      '$non-color': '10px',
      '$non_color': '10px'
    });
    itParses('@color: white;').as({
      '@color': 'white'
    });
    itParses('@non-color: 10px;').as({
      '@non-color': '10px'
    });
    itParses('@non--color: 10px;').as({
      '@non--color': '10px'
    });
    itParses('--color: white;').as({
      'var(--color)': 'white'
    });
    itParses('--non-color: 10px;').as({
      'var(--non-color)': '10px'
    });
    itParses('\\definecolor{orange}{gray}{1}').as({
      '{orange}': 'gray(100%)'
    });
    itParses('\\definecolor{orange}{RGB}{255,127,0}').as({
      '{orange}': 'rgb(255,127,0)'
    });
    itParses('\\definecolor{orange}{rgb}{1,0.5,0}').as({
      '{orange}': 'rgb(255,127,0)'
    });
    itParses('\\definecolor{orange}{cmyk}{0,0.5,1,0}').as({
      '{orange}': 'cmyk(0,0.5,1,0)'
    });
    itParses('\\definecolor{orange}{HTML}{FF7F00}').as({
      '{orange}': '#FF7F00'
    });
    itParses('\\definecolor{darkgreen}{blue!20!black!30!green}').as({
      '{darkgreen}': '{blue!20!black!30!green}'
    });
    itParses('\n.error--large(@color: red) {\n  background-color: @color;\n}').asUndefined();
    return itParses("colors = {\n  red: rgb(255,0,0),\n  green: rgb(0,255,0),\n  blue: rgb(0,0,255)\n  value: 10px\n  light: {\n    base: lightgrey\n  }\n  dark: {\n    base: slategrey\n  }\n}").as({
      'colors.red': {
        value: 'rgb(255,0,0)',
        range: [[1, 2], [1, 14]]
      },
      'colors.green': {
        value: 'rgb(0,255,0)',
        range: [[2, 2], [2, 16]]
      },
      'colors.blue': {
        value: 'rgb(0,0,255)',
        range: [[3, 2], [3, 15]]
      },
      'colors.value': {
        value: '10px',
        range: [[4, 2], [4, 13]]
      },
      'colors.light.base': {
        value: 'lightgrey',
        range: [[9, 4], [9, 17]]
      },
      'colors.dark.base': {
        value: 'slategrey',
        range: [[12, 4], [12, 14]]
      }
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL3ZhcmlhYmxlLXBhcnNlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3QkFBQTs7QUFBQSxFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLHdCQUFSLENBQWpCLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLDZCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsUUFBQSxnQkFBQTtBQUFBLElBQUMsU0FBVSxLQUFYLENBQUE7QUFBQSxJQUVBLFFBQUEsR0FBVyxTQUFDLFVBQUQsR0FBQTthQUNUO0FBQUEsUUFBQSxFQUFBLEVBQUksU0FBQyxTQUFELEdBQUE7QUFDRixVQUFBLEVBQUEsQ0FBSSxVQUFBLEdBQVUsVUFBVixHQUFxQixpQkFBckIsR0FBcUMsQ0FBQyxPQUFPLENBQUMsRUFBUixDQUFXLFNBQVgsQ0FBRCxDQUF6QyxFQUFtRSxTQUFBLEdBQUE7QUFDakUsZ0JBQUEsK0RBQUE7QUFBQSxZQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsS0FBUCxDQUFhLFVBQWIsQ0FBVixDQUFBO0FBQUEsWUFFQSxNQUFBLENBQU8sT0FBTyxDQUFDLE1BQWYsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixNQUFNLENBQUMsSUFBUCxDQUFZLFNBQVosQ0FBc0IsQ0FBQyxNQUF0RCxDQUZBLENBQUE7QUFHQTtpQkFBQSw4Q0FBQSxHQUFBO0FBQ0Usa0NBREcsWUFBQSxNQUFNLGFBQUEsT0FBTyxhQUFBLEtBQ2hCLENBQUE7QUFBQSxjQUFBLFFBQUEsR0FBVyxTQUFVLENBQUEsSUFBQSxDQUFyQixDQUFBO0FBQ0EsY0FBQSxJQUFHLHNCQUFIOzhCQUNFLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCLFFBQVEsQ0FBQyxLQUEvQixHQURGO2VBQUEsTUFFSyxJQUFHLHNCQUFIOzhCQUNILE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCLFFBQVEsQ0FBQyxLQUEvQixHQURHO2VBQUEsTUFBQTs4QkFHSCxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsT0FBZCxDQUFzQixRQUF0QixHQUhHO2VBSlA7QUFBQTs0QkFKaUU7VUFBQSxDQUFuRSxDQUFBLENBQUE7aUJBYUEsS0FkRTtRQUFBLENBQUo7QUFBQSxRQWdCQSxTQUFBLEVBQVcsU0FBQyxTQUFELEdBQUE7QUFDVCxVQUFBLEVBQUEsQ0FBSSxVQUFBLEdBQVUsVUFBVixHQUFxQix5QkFBckIsR0FBNkMsQ0FBQyxPQUFPLENBQUMsRUFBUixDQUFXLFNBQVgsQ0FBRCxDQUFqRCxFQUEyRSxTQUFBLEdBQUE7QUFDekUsZ0JBQUEsMEVBQUE7QUFBQSxZQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsS0FBUCxDQUFhLFVBQWIsQ0FBVixDQUFBO0FBQUEsWUFFQSxNQUFBLENBQU8sT0FBTyxDQUFDLE1BQWYsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixNQUFNLENBQUMsSUFBUCxDQUFZLFNBQVosQ0FBc0IsQ0FBQyxNQUF0RCxDQUZBLENBQUE7QUFHQTtpQkFBQSw4Q0FBQSxHQUFBO0FBQ0Usa0NBREcsWUFBQSxNQUFNLGFBQUEsT0FBTyxhQUFBLE9BQWdCLGlCQUFULFVBQ3ZCLENBQUE7QUFBQSxjQUFBLFFBQUEsR0FBVyxTQUFVLENBQUEsSUFBQSxDQUFyQixDQUFBO0FBQUEsY0FDQSxNQUFBLENBQU8sU0FBUCxDQUFpQixDQUFDLFVBQWxCLENBQUEsQ0FEQSxDQUFBO0FBRUEsY0FBQSxJQUFHLHNCQUFIOzhCQUNFLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCLFFBQVEsQ0FBQyxLQUEvQixHQURGO2VBQUEsTUFFSyxJQUFHLHNCQUFIOzhCQUNILE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCLFFBQVEsQ0FBQyxLQUEvQixHQURHO2VBQUEsTUFBQTs4QkFHSCxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsT0FBZCxDQUFzQixRQUF0QixHQUhHO2VBTFA7QUFBQTs0QkFKeUU7VUFBQSxDQUEzRSxDQUFBLENBQUE7aUJBY0EsS0FmUztRQUFBLENBaEJYO0FBQUEsUUFrQ0EsV0FBQSxFQUFhLFNBQUEsR0FBQTtpQkFDWCxFQUFBLENBQUksa0JBQUEsR0FBa0IsVUFBbEIsR0FBNkIsNEJBQWpDLEVBQThELFNBQUEsR0FBQTtBQUM1RCxnQkFBQSxPQUFBO0FBQUEsWUFBQSxPQUFBLEdBQVUsTUFBTSxDQUFDLEtBQVAsQ0FBYSxVQUFiLENBQVYsQ0FBQTttQkFFQSxNQUFBLENBQU8sT0FBUCxDQUFlLENBQUMsYUFBaEIsQ0FBQSxFQUg0RDtVQUFBLENBQTlELEVBRFc7UUFBQSxDQWxDYjtRQURTO0lBQUEsQ0FGWCxDQUFBO0FBQUEsSUEyQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULE1BQUEsR0FBYSxJQUFBLGNBQUEsQ0FBZSxRQUFmLEVBREo7SUFBQSxDQUFYLENBM0NBLENBQUE7QUFBQSxJQThDQSxRQUFBLENBQVMsZUFBVCxDQUF5QixDQUFDLEVBQTFCLENBQTZCO0FBQUEsTUFBQSxPQUFBLEVBQVMsT0FBVDtLQUE3QixDQTlDQSxDQUFBO0FBQUEsSUErQ0EsUUFBQSxDQUFTLGtCQUFULENBQTRCLENBQUMsRUFBN0IsQ0FBZ0M7QUFBQSxNQUFBLFdBQUEsRUFBYSxNQUFiO0tBQWhDLENBL0NBLENBQUE7QUFBQSxJQWlEQSxRQUFBLENBQVMsZUFBVCxDQUF5QixDQUFDLEVBQTFCLENBQTZCO0FBQUEsTUFBQSxRQUFBLEVBQVUsT0FBVjtLQUE3QixDQWpEQSxDQUFBO0FBQUEsSUFrREEsUUFBQSxDQUFTLHdCQUFULENBQWtDLENBQUMsU0FBbkMsQ0FBNkM7QUFBQSxNQUFBLFFBQUEsRUFBVSxPQUFWO0tBQTdDLENBbERBLENBQUE7QUFBQSxJQW1EQSxRQUFBLENBQVMsc0JBQVQsQ0FBZ0MsQ0FBQyxFQUFqQyxDQUFvQztBQUFBLE1BQUEsUUFBQSxFQUFVLE9BQVY7S0FBcEMsQ0FuREEsQ0FBQTtBQUFBLElBb0RBLFFBQUEsQ0FBUyxpQkFBVCxDQUEyQixDQUFDLEVBQTVCLENBQStCO0FBQUEsTUFBQSxRQUFBLEVBQVUsT0FBVjtLQUEvQixDQXBEQSxDQUFBO0FBQUEsSUFxREEsUUFBQSxDQUFTLHFCQUFULENBQStCLENBQUMsRUFBaEMsQ0FBbUM7QUFBQSxNQUNqQyxhQUFBLEVBQWUsT0FEa0I7QUFBQSxNQUVqQyxhQUFBLEVBQWUsT0FGa0I7S0FBbkMsQ0FyREEsQ0FBQTtBQUFBLElBeURBLFFBQUEsQ0FBUyxzQkFBVCxDQUFnQyxDQUFDLEVBQWpDLENBQW9DO0FBQUEsTUFDbEMsYUFBQSxFQUFlLE9BRG1CO0FBQUEsTUFFbEMsYUFBQSxFQUFlLE9BRm1CO0tBQXBDLENBekRBLENBQUE7QUFBQSxJQTZEQSxRQUFBLENBQVMsbUJBQVQsQ0FBNkIsQ0FBQyxFQUE5QixDQUFpQztBQUFBLE1BQy9CLFlBQUEsRUFBYyxNQURpQjtBQUFBLE1BRS9CLFlBQUEsRUFBYyxNQUZpQjtLQUFqQyxDQTdEQSxDQUFBO0FBQUEsSUFpRUEsUUFBQSxDQUFTLGtCQUFULENBQTRCLENBQUMsRUFBN0IsQ0FBZ0M7QUFBQSxNQUM5QixZQUFBLEVBQWMsTUFEZ0I7QUFBQSxNQUU5QixZQUFBLEVBQWMsTUFGZ0I7S0FBaEMsQ0FqRUEsQ0FBQTtBQUFBLElBc0VBLFFBQUEsQ0FBUyxnQkFBVCxDQUEwQixDQUFDLEVBQTNCLENBQThCO0FBQUEsTUFBQSxRQUFBLEVBQVUsT0FBVjtLQUE5QixDQXRFQSxDQUFBO0FBQUEsSUF1RUEsUUFBQSxDQUFTLG1CQUFULENBQTZCLENBQUMsRUFBOUIsQ0FBaUM7QUFBQSxNQUFBLFlBQUEsRUFBYyxNQUFkO0tBQWpDLENBdkVBLENBQUE7QUFBQSxJQXdFQSxRQUFBLENBQVMsb0JBQVQsQ0FBOEIsQ0FBQyxFQUEvQixDQUFrQztBQUFBLE1BQUEsYUFBQSxFQUFlLE1BQWY7S0FBbEMsQ0F4RUEsQ0FBQTtBQUFBLElBMEVBLFFBQUEsQ0FBUyxpQkFBVCxDQUEyQixDQUFDLEVBQTVCLENBQStCO0FBQUEsTUFBQSxjQUFBLEVBQWdCLE9BQWhCO0tBQS9CLENBMUVBLENBQUE7QUFBQSxJQTJFQSxRQUFBLENBQVMsb0JBQVQsQ0FBOEIsQ0FBQyxFQUEvQixDQUFrQztBQUFBLE1BQUEsa0JBQUEsRUFBb0IsTUFBcEI7S0FBbEMsQ0EzRUEsQ0FBQTtBQUFBLElBNkVBLFFBQUEsQ0FBUyxnQ0FBVCxDQUEwQyxDQUFDLEVBQTNDLENBQThDO0FBQUEsTUFDNUMsVUFBQSxFQUFZLFlBRGdDO0tBQTlDLENBN0VBLENBQUE7QUFBQSxJQWlGQSxRQUFBLENBQVMsdUNBQVQsQ0FBaUQsQ0FBQyxFQUFsRCxDQUFxRDtBQUFBLE1BQ25ELFVBQUEsRUFBWSxnQkFEdUM7S0FBckQsQ0FqRkEsQ0FBQTtBQUFBLElBcUZBLFFBQUEsQ0FBUyxxQ0FBVCxDQUErQyxDQUFDLEVBQWhELENBQW1EO0FBQUEsTUFDakQsVUFBQSxFQUFZLGdCQURxQztLQUFuRCxDQXJGQSxDQUFBO0FBQUEsSUF5RkEsUUFBQSxDQUFTLHdDQUFULENBQWtELENBQUMsRUFBbkQsQ0FBc0Q7QUFBQSxNQUNwRCxVQUFBLEVBQVksaUJBRHdDO0tBQXRELENBekZBLENBQUE7QUFBQSxJQTZGQSxRQUFBLENBQVMscUNBQVQsQ0FBK0MsQ0FBQyxFQUFoRCxDQUFtRDtBQUFBLE1BQ2pELFVBQUEsRUFBWSxTQURxQztLQUFuRCxDQTdGQSxDQUFBO0FBQUEsSUFpR0EsUUFBQSxDQUFTLGtEQUFULENBQTRELENBQUMsRUFBN0QsQ0FBZ0U7QUFBQSxNQUM5RCxhQUFBLEVBQWUsMEJBRCtDO0tBQWhFLENBakdBLENBQUE7QUFBQSxJQXFHQSxRQUFBLENBQVMsZ0VBQVQsQ0FBMEUsQ0FBQyxXQUEzRSxDQUFBLENBckdBLENBQUE7V0F1R0EsUUFBQSxDQUFTLDZLQUFULENBYUksQ0FBQyxFQWJMLENBYVE7QUFBQSxNQUNOLFlBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGNBQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFRLENBQUMsQ0FBRCxFQUFHLEVBQUgsQ0FBUixDQURQO09BRkk7QUFBQSxNQUlOLGNBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGNBQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFRLENBQUMsQ0FBRCxFQUFHLEVBQUgsQ0FBUixDQURQO09BTEk7QUFBQSxNQU9OLGFBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGNBQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFPLENBQUMsQ0FBRCxFQUFHLEVBQUgsQ0FBUCxDQURQO09BUkk7QUFBQSxNQVVOLGNBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLE1BQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFPLENBQUMsQ0FBRCxFQUFHLEVBQUgsQ0FBUCxDQURQO09BWEk7QUFBQSxNQWFOLG1CQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxXQUFQO0FBQUEsUUFDQSxLQUFBLEVBQU8sQ0FBQyxDQUFDLENBQUQsRUFBRyxDQUFILENBQUQsRUFBTyxDQUFDLENBQUQsRUFBRyxFQUFILENBQVAsQ0FEUDtPQWRJO0FBQUEsTUFnQk4sa0JBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLFdBQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxDQUFDLENBQUMsRUFBRCxFQUFJLENBQUosQ0FBRCxFQUFRLENBQUMsRUFBRCxFQUFJLEVBQUosQ0FBUixDQURQO09BakJJO0tBYlIsRUF4R3lCO0VBQUEsQ0FBM0IsQ0FIQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/variable-parser-spec.coffee
