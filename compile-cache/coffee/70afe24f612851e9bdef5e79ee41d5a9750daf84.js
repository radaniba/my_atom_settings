(function() {
  var AbstractProvider, MemberProvider, exec, fuzzaldrin, parser, proxy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fuzzaldrin = require('fuzzaldrin');

  exec = require("child_process");

  proxy = require("../services/php-proxy.coffee");

  parser = require("../services/php-file-parser.coffee");

  AbstractProvider = require("./abstract-provider");

  module.exports = MemberProvider = (function(_super) {
    __extends(MemberProvider, _super);

    function MemberProvider() {
      return MemberProvider.__super__.constructor.apply(this, arguments);
    }

    MemberProvider.prototype.methods = [];


    /**
     * Get suggestions from the provider (@see provider-api)
     * @return array
     */

    MemberProvider.prototype.fetchSuggestions = function(_arg) {
      var bufferPosition, characterAfterPrefix, classInfo, className, currentClass, currentClassParents, editor, elements, insertParameterList, mustBeStatic, prefix, scopeDescriptor, suggestions;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      this.regex = /(?:(?:[a-zA-Z0-9_]*)\s*(?:\(.*\))?\s*(?:->|::)\s*)+([a-zA-Z0-9_]*)/g;
      prefix = this.getPrefix(editor, bufferPosition);
      if (!prefix.length) {
        return;
      }
      elements = parser.getStackClasses(editor, bufferPosition);
      if (elements == null) {
        return;
      }
      className = parser.parseElements(editor, bufferPosition, elements);
      if (className == null) {
        return;
      }
      elements = prefix.split(/(->|::)/);
      if (!(elements.length > 2)) {
        return;
      }
      currentClass = parser.getFullClassName(editor);
      currentClassParents = [];
      if (currentClass) {
        classInfo = proxy.methods(currentClass);
        currentClassParents = (classInfo != null ? classInfo.parents : void 0) ? classInfo != null ? classInfo.parents : void 0 : [];
      }
      mustBeStatic = false;
      if (elements[elements.length - 2] === '::' && elements[elements.length - 3].trim() !== 'parent') {
        mustBeStatic = true;
      }
      characterAfterPrefix = editor.getTextInRange([bufferPosition, [bufferPosition.row, bufferPosition.column + 1]]);
      insertParameterList = characterAfterPrefix === '(' ? false : true;
      suggestions = this.findSuggestionsForPrefix(className, elements[elements.length - 1].trim(), (function(_this) {
        return function(element) {
          var _ref;
          if (mustBeStatic && !element.isStatic) {
            return false;
          }
          if (element.isPrivate && element.declaringClass.name !== currentClass) {
            return false;
          }
          if (element.isProtected && element.declaringClass.name !== currentClass && (_ref = element.declaringClass.name, __indexOf.call(currentClassParents, _ref) < 0)) {
            return false;
          }
          if (!element.isMethod && !element.isProperty && !mustBeStatic) {
            return false;
          }
          return true;
        };
      })(this), insertParameterList);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };


    /**
     * Returns suggestions available matching the given prefix
     * @param {string}   className           The name of the class to show members of.
     * @param {string}   prefix              Prefix to match (may be left empty to list all members).
     * @param {callback} filterCallback      A callback that should return true if the item should be added to the
     *                                       suggestions list.
     * @param {bool}     insertParameterList Whether to insert a list of parameters for methods.
     * @return array
     */

    MemberProvider.prototype.findSuggestionsForPrefix = function(className, prefix, filterCallback, insertParameterList) {
      var displayText, ele, element, methods, returnValue, returnValueParts, snippet, suggestions, type, word, words, _i, _j, _len, _len1, _ref;
      if (insertParameterList == null) {
        insertParameterList = true;
      }
      methods = proxy.methods(className);
      if (!(methods != null ? methods.names : void 0)) {
        return [];
      }
      words = fuzzaldrin.filter(methods.names, prefix);
      suggestions = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        element = methods.values[word];
        if (!(element instanceof Array)) {
          element = [element];
        }
        for (_j = 0, _len1 = element.length; _j < _len1; _j++) {
          ele = element[_j];
          if (filterCallback && !filterCallback(ele)) {
            continue;
          }
          snippet = null;
          displayText = word;
          returnValueParts = ((_ref = ele.args["return"]) != null ? _ref.type : void 0) ? ele.args["return"].type.split('\\') : [];
          returnValue = returnValueParts[returnValueParts.length - 1];
          if (ele.isMethod) {
            type = 'method';
            snippet = insertParameterList ? this.getFunctionSnippet(word, ele.args) : null;
            displayText = this.getFunctionSignature(word, ele.args);
          } else if (ele.isProperty) {
            type = 'property';
          } else {
            type = 'constant';
          }
          suggestions.push({
            text: word,
            type: type,
            snippet: snippet,
            displayText: displayText,
            leftLabel: returnValue,
            description: ele.args.descriptions.short != null ? ele.args.descriptions.short : '',
            className: ele.args.deprecated ? 'php-atom-autocomplete-strike' : ''
          });
        }
      }
      return suggestions;
    };

    return MemberProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2F1dG9jb21wbGV0aW9uL21lbWJlci1wcm92aWRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUVBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVIsQ0FBYixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVIsQ0FIUixDQUFBOztBQUFBLEVBSUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxvQ0FBUixDQUpULENBQUE7O0FBQUEsRUFLQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FMbkIsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBR007QUFDRixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNkJBQUEsT0FBQSxHQUFTLEVBQVQsQ0FBQTs7QUFFQTtBQUFBOzs7T0FGQTs7QUFBQSw2QkFNQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsR0FBQTtBQUVkLFVBQUEsd0xBQUE7QUFBQSxNQUZnQixjQUFBLFFBQVEsc0JBQUEsZ0JBQWdCLHVCQUFBLGlCQUFpQixjQUFBLE1BRXpELENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMscUVBQVQsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsTUFBWCxFQUFtQixjQUFuQixDQUZULENBQUE7QUFHQSxNQUFBLElBQUEsQ0FBQSxNQUFvQixDQUFDLE1BQXJCO0FBQUEsY0FBQSxDQUFBO09BSEE7QUFBQSxNQUtBLFFBQUEsR0FBVyxNQUFNLENBQUMsZUFBUCxDQUF1QixNQUF2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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/autocompletion/member-provider.coffee
