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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL3ZhcmlhYmxlLXBhcnNlci1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3QkFBQTs7QUFBQSxFQUFBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLHdCQUFSLENBQWpCLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLDZCQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsUUFBQSxnQkFBQTtBQUFBLElBQUMsU0FBVSxLQUFYLENBQUE7QUFBQSxJQUVBLFFBQUEsR0FBVyxTQUFDLFVBQUQsR0FBQTthQUNUO0FBQUEsUUFBQSxFQUFBLEVBQUksU0FBQyxTQUFELEdBQUE7QUFDRixVQUFBLEVBQUEsQ0FBSSxVQUFBLEdBQVUsVUFBVixHQUFxQixpQkFBckIsR0FBcUMsQ0FBQyxPQUFPLENBQUMsRUFBUixDQUFXLFNBQVgsQ0FBRCxDQUF6QyxFQUFtRSxTQUFBLEdBQUE7QUFDakUsZ0JBQUEsK0RBQUE7QUFBQSxZQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsS0FBUCxDQUFhLFVBQWIsQ0FBVixDQUFBO0FBQUEsWUFFQSxNQUFBLENBQU8sT0FBTyxDQUFDLE1BQWYsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixNQUFNLENBQUMsSUFBUCxDQUFZLFNBQVosQ0FBc0IsQ0FBQyxNQUF0RCxDQUZBLENBQUE7QUFHQTtpQkFBQSw4Q0FBQSxHQUFBO0FBQ0Usa0NBREcsWUFBQSxNQUFNLGFBQUEsT0FBTyxhQUFBLEtBQ2hCLENBQUE7QUFBQSxjQUFBLFFBQUEsR0FBVyxTQUFVLENBQUEsSUFBQSxDQUFyQixDQUFBO0FBQ0EsY0FBQSxJQUFHLHNCQUFIOzhCQUNFLE1BQUEsQ0FBTyxL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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/variable-parser-spec.coffee
