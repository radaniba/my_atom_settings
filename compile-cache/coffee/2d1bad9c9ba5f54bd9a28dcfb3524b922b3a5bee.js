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
