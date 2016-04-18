(function() {
  var ColorContext, ColorParser, registry,
    __slice = [].slice;

  ColorContext = require('../lib/color-context');

  ColorParser = require('../lib/color-parser');

  registry = require('../lib/color-expressions');

  describe('ColorContext', function() {
    var context, itParses, parser, _ref;
    _ref = [], context = _ref[0], parser = _ref[1];
    itParses = function(expression) {
      return {
        asUndefined: function() {
          return it("parses '" + expression + "' as undefined", function() {
            return expect(context.getValue(expression)).toBeUndefined();
          });
        },
        asUndefinedColor: function() {
          return it("parses '" + expression + "' as undefined color", function() {
            return expect(context.readColor(expression)).toBeUndefined();
          });
        },
        asInt: function(expected) {
          return it("parses '" + expression + "' as an integer with value of " + expected, function() {
            return expect(context.readInt(expression)).toEqual(expected);
          });
        },
        asFloat: function(expected) {
          return it("parses '" + expression + "' as a float with value of " + expected, function() {
            return expect(context.readFloat(expression)).toEqual(expected);
          });
        },
        asIntOrPercent: function(expected) {
          return it("parses '" + expression + "' as an integer or a percentage with value of " + expected, function() {
            return expect(context.readIntOrPercent(expression)).toEqual(expected);
          });
        },
        asFloatOrPercent: function(expected) {
          return it("parses '" + expression + "' as a float or a percentage with value of " + expected, function() {
            return expect(context.readFloatOrPercent(expression)).toEqual(expected);
          });
        },
        asColorExpression: function(expected) {
          return it("parses '" + expression + "' as a color expression", function() {
            return expect(context.readColorExpression(expression)).toEqual(expected);
          });
        },
        asColor: function() {
          var expected;
          expected = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return it("parses '" + expression + "' as a color with value of " + (jasmine.pp(expected)), function() {
            var _ref1;
            return (_ref1 = expect(context.readColor(expression))).toBeColor.apply(_ref1, expected);
          });
        }
      };
    };
    describe('created without any variables', function() {
      beforeEach(function() {
        return context = new ColorContext({
          registry: registry
        });
      });
      itParses('10').asInt(10);
      itParses('10').asFloat(10);
      itParses('0.5').asFloat(0.5);
      itParses('.5').asFloat(0.5);
      itParses('10').asIntOrPercent(10);
      itParses('10%').asIntOrPercent(26);
      itParses('0.1').asFloatOrPercent(0.1);
      itParses('10%').asFloatOrPercent(0.1);
      itParses('red').asColorExpression('red');
      itParses('red').asColor(255, 0, 0);
      itParses('#ff0000').asColor(255, 0, 0);
      return itParses('rgb(255,127,0)').asColor(255, 127, 0);
    });
    describe('with a variables array', function() {
      var createColorVar, createVar;
      createVar = function(name, value) {
        return {
          value: value,
          name: name,
          path: '/path/to/file.coffee'
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      beforeEach(function() {
        var colorVariables, variables;
        variables = [createVar('x', '10'), createVar('y', '0.1'), createVar('z', '10%'), createColorVar('c', 'rgb(255,127,0)')];
        colorVariables = variables.filter(function(v) {
          return v.isColor;
        });
        return context = new ColorContext({
          variables: variables,
          colorVariables: colorVariables,
          registry: registry
        });
      });
      itParses('x').asInt(10);
      itParses('y').asFloat(0.1);
      itParses('z').asIntOrPercent(26);
      itParses('z').asFloatOrPercent(0.1);
      itParses('c').asColorExpression('rgb(255,127,0)');
      itParses('c').asColor(255, 127, 0);
      describe('that contains invalid colors', function() {
        beforeEach(function() {
          var variables;
          variables = [createVar('@text-height', '@scale-b-xxl * 1rem'), createVar('@component-line-height', '@text-height'), createVar('@list-item-height', '@component-line-height')];
          return context = new ColorContext({
            variables: variables,
            registry: registry
          });
        });
        return itParses('@list-item-height').asUndefinedColor();
      });
      describe('that contains circular references', function() {
        beforeEach(function() {
          var variables;
          variables = [createVar('@foo', '@bar'), createVar('@bar', '@baz'), createVar('@baz', '@foo'), createVar('@taz', '@taz')];
          return context = new ColorContext({
            variables: variables,
            registry: registry
          });
        });
        itParses('@foo').asUndefined();
        return itParses('@taz').asUndefined();
      });
      describe('that contains circular references', function() {
        beforeEach(function() {
          var variables;
          variables = [createColorVar('@foo', '@bar'), createColorVar('@bar', '@baz'), createColorVar('@baz', '@foo'), createColorVar('@taz', '@taz')];
          return context = new ColorContext({
            variables: variables,
            registry: registry
          });
        });
        itParses('@foo').asUndefinedColor();
        itParses('@foo').asUndefined();
        return itParses('@taz').asUndefined();
      });
      return describe('that contains circular references nested in operations', function() {
        beforeEach(function() {
          var variables;
          variables = [createColorVar('@foo', 'complement(@bar)'), createColorVar('@bar', 'transparentize(@baz, 0.5)'), createColorVar('@baz', 'darken(@foo, 10%)')];
          return context = new ColorContext({
            variables: variables,
            registry: registry
          });
        });
        return itParses('@foo').asUndefinedColor();
      });
    });
    describe('with variables from a default file', function() {
      var createColorVar, createVar, projectPath, referenceVariable, _ref1;
      _ref1 = [], projectPath = _ref1[0], referenceVariable = _ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = "" + projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value, path) {
        var v;
        v = createVar(name, value, path);
        v.isColor = true;
        return v;
      };
      describe('when there is another valid value', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', "" + projectPath + "/.pigments"), createVar('b', '20', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(20);
      });
      describe('when there is no another valid value', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', "" + projectPath + "/.pigments"), createVar('b', 'c', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      describe('when there is another valid color', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createColorVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createColorVar('b', '#ff0000', "" + projectPath + "/.pigments"), createColorVar('b', '#0000ff', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asColor(0, 0, 255);
      });
      return describe('when there is no another valid color', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createColorVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createColorVar('b', '#ff0000', "" + projectPath + "/.pigments"), createColorVar('b', 'c', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asColor(255, 0, 0);
      });
    });
    describe('with a reference variable', function() {
      var createColorVar, createVar, projectPath, referenceVariable, _ref1;
      _ref1 = [], projectPath = _ref1[0], referenceVariable = _ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = "" + projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      describe('when there is a single root path', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', '10', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('a', '20', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      return describe('when there are many root paths', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', "" + projectPath + "/b.styl"), createVar('b', '20', "" + projectPath + "2/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath, "" + projectPath + "2"]
          });
        });
        return itParses('a').asInt(10);
      });
    });
    return describe('with a reference path', function() {
      var createColorVar, createVar, projectPath, referenceVariable, _ref1;
      _ref1 = [], projectPath = _ref1[0], referenceVariable = _ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = "" + projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      describe('when there is a single root path', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', '10', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('a', '20', "" + projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referencePath: "" + projectPath + "/a.styl",
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      return describe('when there are many root paths', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', "" + projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', "" + projectPath + "/b.styl"), createVar('b', '20', "" + projectPath + "2/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referencePath: "" + projectPath + "/a.styl",
            rootPaths: [projectPath, "" + projectPath + "2"]
          });
        });
        return itParses('a').asInt(10);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLWNvbnRleHQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsbUNBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVIsQ0FBZixDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQURkLENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLDBCQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUEsR0FBQTtBQUN2QixRQUFBLCtCQUFBO0FBQUEsSUFBQSxPQUFvQixFQUFwQixFQUFDLGlCQUFELEVBQVUsZ0JBQVYsQ0FBQTtBQUFBLElBRUEsUUFBQSxHQUFXLFNBQUMsVUFBRCxHQUFBO2FBQ1Q7QUFBQSxRQUFBLFdBQUEsRUFBYSxTQUFBLEdBQUE7aUJBQ1gsRUFBQSxDQUFJLFVBQUEsR0FBVSxVQUFWLEdBQXFCLGdCQUF6QixFQUEwQyxTQUFBLEdBQUE7bUJBQ3hDLE1BQUEsQ0FBTyxPQUFPLENBQUMsUUFBUixDQUFpQixVQUFqQixDQUFQLENBQW9DLENBQUMsYUFBckMsQ0FBQSxFQUR3QztVQUFBLENBQTFDLEVBRFc7UUFBQSxDQUFiO0FBQUEsUUFJQSxnQkFBQSxFQUFrQixTQUFBLEdBQUE7aUJBQ2hCLEVBQUEsQ0FBSSxVQUFBLEdBQVUsVUFBVixHQUFxQixzQkFBekIsRUFBZ0QsU0FBQSxHQUFBO21CQUM5QyxNQUFBLENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsVUFBbEIsQ0FBUCxDQUFxQyxDQUFDLGFBQXRDLENBQUEsRUFEOEM7VUFBQSxDQUFoRCxFQURnQjtRQUFBLENBSmxCO0FBQUEsUUFRQSxLQUFB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

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/color-context-spec.coffee
