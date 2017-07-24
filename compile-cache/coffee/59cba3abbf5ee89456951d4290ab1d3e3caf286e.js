(function() {
  var AbstractProvider, ClassProvider,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AbstractProvider = require('./abstract-provider');

  module.exports = ClassProvider = (function(_super) {
    __extends(ClassProvider, _super);

    function ClassProvider() {
      return ClassProvider.__super__.constructor.apply(this, arguments);
    }

    ClassProvider.prototype.hoverEventSelectors = '.entity.inherited-class, .support.namespace, .support.class, .comment-clickable .region';

    ClassProvider.prototype.clickEventSelectors = '.entity.inherited-class, .support.namespace, .support.class';

    ClassProvider.prototype.gotoRegex = /^\\?[A-Z][A-za-z0-9_]*(\\[A-Z][A-Za-z0-9_])*$/;


    /**
     * Goto the class from the term given.
     *
     * @param  {TextEditor} editor TextEditor to search for namespace of term.
     * @param  {string}     term   Term to search for.
     */

    ClassProvider.prototype.gotoFromWord = function(editor, term) {
      var classInfo, classesResponse, matches, proxy, regexMatches;
      if (term === void 0 || term.indexOf('$') === 0) {
        return;
      }
      term = this.parser.getFullClassName(editor, term);
      proxy = require('../services/php-proxy.coffee');
      classesResponse = proxy.classes();
      if (!classesResponse.autocomplete) {
        return;
      }
      this.manager.addBackTrack(editor.getPath(), editor.getCursorBufferPosition());
      matches = this.fuzzaldrin.filter(classesResponse.autocomplete, term);
      if (matches[0] === term) {
        regexMatches = /(?:\\)(\w+)$/i.exec(matches[0]);
        if (regexMatches === null || regexMatches.length === 0) {
          this.jumpWord = matches[0];
        } else {
          this.jumpWord = regexMatches[1];
        }
        classInfo = proxy.methods(matches[0]);
        return atom.workspace.open(classInfo.filename, {
          searchAllPanes: true
        });
      }
    };


    /**
     * Gets the correct selector when a class or namespace is clicked.
     *
     * @param  {jQuery.Event}  event  A jQuery event.
     *
     * @return {object|null} A selector to be used with jQuery.
     */

    ClassProvider.prototype.getSelectorFromEvent = function(event) {
      return this.parser.getClassSelectorFromEvent(event);
    };


    /**
     * Goes through all the lines within the editor looking for classes within comments. More specifically if they have
     * @var, @param or @return prefixed.
     *
     * @param  {TextEditor} editor The editor to search through.
     */

    ClassProvider.prototype.registerMarkers = function(editor) {
      var key, regex, row, rows, text, _results;
      text = editor.getText();
      rows = text.split('\n');
      _results = [];
      for (key in rows) {
        row = rows[key];
        regex = /@param|@var|@return|@throws|@see/gi;
        if (regex.test(row)) {
          _results.push(this.addMarkerToCommentLine(row.split(' '), parseInt(key), editor, true));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };


    /**
     * Removes any markers previously created by registerMarkers.
     *
     * @param {TextEditor} editor The editor to search through
     */

    ClassProvider.prototype.cleanMarkers = function(editor) {
      var i, marker, _ref;
      _ref = this.allMarkers[editor.getLongTitle()];
      for (i in _ref) {
        marker = _ref[i];
        marker.destroy();
      }
      return this.allMarkers = [];
    };


    /**
     * Analyses the words array given for any classes and then creates a marker for them.
     *
     * @param {array} words           The array of words to check.
     * @param {int} rowIndex          The current row the words are on within the editor.
     * @param {TextEditor} editor     The editor the words are from.
     * @param {bool} shouldBreak      Flag to say whether the search should break after finding 1 class.
     * @param {int} currentIndex  = 0 The current column index the search is on.
     * @param {int} offset        = 0 Any offset that should be applied when creating the marker.
     */

    ClassProvider.prototype.addMarkerToCommentLine = function(words, rowIndex, editor, shouldBreak, currentIndex, offset) {
      var key, keywordRegex, marker, markerProperties, options, range, regex, value, _results;
      if (currentIndex == null) {
        currentIndex = 0;
      }
      if (offset == null) {
        offset = 0;
      }
      _results = [];
      for (key in words) {
        value = words[key];
        regex = /^\\?([A-Za-z0-9_]+)\\?([A-Za-zA-Z_\\]*)?/g;
        keywordRegex = /^(array|object|bool|string|static|null|boolean|void|int|integer|mixed|callable)$/gi;
        if (value && regex.test(value) && keywordRegex.test(value) === false) {
          if (value.includes('|')) {
            this.addMarkerToCommentLine(value.split('|'), rowIndex, editor, false, currentIndex, parseInt(key));
          } else {
            range = [[rowIndex, currentIndex + parseInt(key) + offset], [rowIndex, currentIndex + parseInt(key) + value.length + offset]];
            marker = editor.markBufferRange(range);
            markerProperties = {
              term: value
            };
            marker.setProperties(markerProperties);
            options = {
              type: 'highlight',
              "class": 'comment-clickable comment'
            };
            if (!marker.isDestroyed()) {
              editor.decorateMarker(marker, options);
            }
            if (this.allMarkers[editor.getLongTitle()] === void 0) {
              this.allMarkers[editor.getLongTitle()] = [];
            }
            this.allMarkers[editor.getLongTitle()].push(marker);
          }
          if (shouldBreak === true) {
            break;
          }
        }
        _results.push(currentIndex += value.length);
      }
      return _results;
    };


    /**
     * Gets the regex used when looking for a word within the editor
     *
     * @param  {string} term Term being search.
     *
     * @return {regex} Regex to be used.
     */

    ClassProvider.prototype.getJumpToRegex = function(term) {
      return RegExp("^(class|interface|abstractclass|trait) +" + term, "i");
    };

    return ClassProvider;

  })(AbstractProvider);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL2dvdG8vY2xhc3MtcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FBbkIsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFDRixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsNEJBQUEsbUJBQUEsR0FBcUIseUZBQXJCLENBQUE7O0FBQUEsNEJBQ0EsbUJBQUEsR0FBcUIsNkRBRHJCLENBQUE7O0FBQUEsNEJBRUEsU0FBQSxHQUFXLCtDQUZYLENBQUE7O0FBSUE7QUFBQTs7Ozs7T0FKQTs7QUFBQSw0QkFVQSxZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsSUFBVCxHQUFBO0FBQ1YsVUFBQSx3REFBQTtBQUFBLE1BQUEsSUFBRyxJQUFBLEtBQVEsTUFBUixJQUFxQixJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBQSxLQUFxQixDQUE3QztBQUNJLGNBQUEsQ0FESjtPQUFBO0FBQUEsTUFHQSxJQUFBLEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixFQUFpQyxJQUFqQyxDQUhQLENBQUE7QUFBQSxNQUtBLEtBQUEsR0FBUSxPQUFBLENBQVEsOEJBQVIsQ0FMUixDQUFBO0FBQUEsTUFNQSxlQUFBLEdBQWtCLEtBQUssQ0FBQyxPQUFOLENBQUEsQ0FObEIsQ0FBQTtBQVFBLE1BQUEsSUFBQSxDQUFBLGVBQTZCLENBQUMsWUFBOUI7QUFBQSxjQUFBLENBQUE7T0FSQTtBQUFBLE1BVUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULENBQXNCLE1BQU0sQ0FBQyxPQUFQ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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/goto/class-provider.coffee
