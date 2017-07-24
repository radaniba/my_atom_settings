(function() {
  var AncestorsMethods, ColorResultsElement, CompositeDisposable, EventsDelegation, Range, SpacePenDSL, path, removeLeadingWhitespace, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = [], Range = _ref[0], CompositeDisposable = _ref[1], _ = _ref[2], path = _ref[3];

  _ref1 = require('atom-utils'), SpacePenDSL = _ref1.SpacePenDSL, EventsDelegation = _ref1.EventsDelegation, AncestorsMethods = _ref1.AncestorsMethods;

  removeLeadingWhitespace = function(string) {
    return string.replace(/^\s+/, '');
  };

  ColorResultsElement = (function(_super) {
    __extends(ColorResultsElement, _super);

    function ColorResultsElement() {
      return ColorResultsElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(ColorResultsElement);

    EventsDelegation.includeInto(ColorResultsElement);

    ColorResultsElement.content = function() {
      return this.tag('atom-panel', {
        outlet: 'pane',
        "class": 'preview-pane pane-item'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-heading'
          }, function() {
            _this.span({
              outlet: 'previewCount',
              "class": 'preview-count inline-block'
            });
            return _this.div({
              outlet: 'loadingMessage',
              "class": 'inline-block'
            }, function() {
              _this.div({
                "class": 'loading loading-spinner-tiny inline-block'
              });
              return _this.div({
                outlet: 'searchedCountBlock',
                "class": 'inline-block'
              }, function() {
                _this.span({
                  outlet: 'searchedCount',
                  "class": 'searched-count'
                });
                return _this.span(' paths searched');
              });
            });
          });
          return _this.ol({
            outlet: 'resultsList',
            "class": 'search-colors-results results-view list-tree focusable-panel has-collapsable-children native-key-bindings',
            tabindex: -1
          });
        };
      })(this));
    };

    ColorResultsElement.prototype.createdCallback = function() {
      var _ref2;
      if (CompositeDisposable == null) {
        _ref2 = require('atom'), Range = _ref2.Range, CompositeDisposable = _ref2.CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.pathMapping = {};
      this.files = 0;
      this.colors = 0;
      this.loadingMessage.style.display = 'none';
      this.subscriptions.add(this.subscribeTo(this, '.list-nested-item > .list-item', {
        click: function(e) {
          var fileItem;
          e.stopPropagation();
          fileItem = AncestorsMethods.parents(e.target, '.list-nested-item')[0];
          return fileItem.classList.toggle('collapsed');
        }
      }));
      return this.subscriptions.add(this.subscribeTo(this, '.search-result', {
        click: (function(_this) {
          return function(e) {
            var fileItem, matchItem, pathAttribute, range;
            e.stopPropagation();
            matchItem = e.target.matches('.search-result') ? e.target : AncestorsMethods.parents(e.target, '.search-result')[0];
            fileItem = AncestorsMethods.parents(matchItem, '.list-nested-item')[0];
            range = Range.fromObject([matchItem.dataset.start.split(',').map(Number), matchItem.dataset.end.split(',').map(Number)]);
            pathAttribute = fileItem.dataset.path;
            return atom.workspace.open(_this.pathMapping[pathAttribute]).then(function(editor) {
              return editor.setSelectedBufferRange(range, {
                autoscroll: true
              });
            });
          };
        })(this)
      }));
    };

    ColorResultsElement.prototype.setModel = function(colorSearch) {
      this.colorSearch = colorSearch;
      this.subscriptions.add(this.colorSearch.onDidFindMatches((function(_this) {
        return function(result) {
          return _this.addFileResult(result);
        };
      })(this)));
      this.subscriptions.add(this.colorSearch.onDidCompleteSearch((function(_this) {
        return function() {
          return _this.searchComplete();
        };
      })(this)));
      return this.colorSearch.search();
    };

    ColorResultsElement.prototype.addFileResult = function(result) {
      this.files += 1;
      this.colors += result.matches.length;
      this.resultsList.innerHTML += this.createFileResult(result);
      return this.updateMessage();
    };

    ColorResultsElement.prototype.searchComplete = function() {
      this.updateMessage();
      if (this.colors === 0) {
        this.pane.classList.add('no-results');
        return this.pane.appendChild("<ul class='centered background-message no-results-overlay'>\n  <li>No Results</li>\n</ul>");
      }
    };

    ColorResultsElement.prototype.updateMessage = function() {
      var filesString;
      filesString = this.files === 1 ? 'file' : 'files';
      return this.previewCount.innerHTML = this.colors > 0 ? "<span class='text-info'>\n  " + this.colors + " colors\n</span>\nfound in\n<span class='text-info'>\n  " + this.files + " " + filesString + "\n</span>" : "No colors found in " + this.files + " " + filesString;
    };

    ColorResultsElement.prototype.createFileResult = function(fileResult) {
      var fileBasename, filePath, matches, pathAttribute, pathName;
      if (_ == null) {
        _ = require('underscore-plus');
      }
      if (path == null) {
        path = require('path');
      }
      filePath = fileResult.filePath, matches = fileResult.matches;
      fileBasename = path.basename(filePath);
      pathAttribute = _.escapeAttribute(filePath);
      this.pathMapping[pathAttribute] = filePath;
      pathName = atom.project.relativize(filePath);
      return "<li class=\"path list-nested-item\" data-path=\"" + pathAttribute + "\">\n  <div class=\"path-details list-item\">\n    <span class=\"disclosure-arrow\"></span>\n    <span class=\"icon icon-file-text\" data-name=\"" + fileBasename + "\"></span>\n    <span class=\"path-name bright\">" + pathName + "</span>\n    <span class=\"path-match-number\">(" + matches.length + ")</span></div>\n  </div>\n  <ul class=\"matches list-tree\">\n    " + (matches.map((function(_this) {
        return function(match) {
          return _this.createMatchResult(match);
        };
      })(this)).join('')) + "\n  </ul>\n</li>";
    };

    ColorResultsElement.prototype.createMatchResult = function(match) {
      var filePath, lineNumber, matchEnd, matchStart, prefix, range, style, suffix, textColor, _ref2;
      if (CompositeDisposable == null) {
        _ref2 = require('atom'), Range = _ref2.Range, CompositeDisposable = _ref2.CompositeDisposable;
      }
      textColor = match.color.luma > 0.43 ? 'black' : 'white';
      filePath = match.filePath, range = match.range;
      range = Range.fromObject(range);
      matchStart = range.start.column - match.lineTextOffset;
      matchEnd = range.end.column - match.lineTextOffset;
      prefix = removeLeadingWhitespace(match.lineText.slice(0, matchStart));
      suffix = match.lineText.slice(matchEnd);
      lineNumber = range.start.row + 1;
      style = '';
      style += "background: " + (match.color.toCSS()) + ";";
      style += "color: " + textColor + ";";
      return "<li class=\"search-result list-item\" data-start=\"" + range.start.row + "," + range.start.column + "\" data-end=\"" + range.end.row + "," + range.end.column + "\">\n  <span class=\"line-number text-subtle\">" + lineNumber + "</span>\n  <span class=\"preview\">\n    " + prefix + "\n    <span class='match color-match' style='" + style + "'>" + match.matchText + "</span>\n    " + suffix + "\n  </span>\n</li>";
    };

    return ColorResultsElement;

  })(HTMLElement);

  module.exports = ColorResultsElement = document.registerElement('pigments-color-results', {
    prototype: ColorResultsElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItcmVzdWx0cy1lbGVtZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrSUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FHSSxFQUhKLEVBQ0UsZUFERixFQUNTLDZCQURULEVBRUUsV0FGRixFQUVLLGNBRkwsQ0FBQTs7QUFBQSxFQUtBLFFBQW9ELE9BQUEsQ0FBUSxZQUFSLENBQXBELEVBQUMsb0JBQUEsV0FBRCxFQUFjLHlCQUFBLGdCQUFkLEVBQWdDLHlCQUFBLGdCQUxoQyxDQUFBOztBQUFBLEVBT0EsdUJBQUEsR0FBMEIsU0FBQyxNQUFELEdBQUE7V0FBWSxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWYsRUFBdUIsRUFBdkIsRUFBWjtFQUFBLENBUDFCLENBQUE7O0FBQUEsRUFTTTtBQUNKLDBDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQVcsQ0FBQyxXQUFaLENBQXdCLG1CQUF4QixDQUFBLENBQUE7O0FBQUEsSUFDQSxnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixtQkFBN0IsQ0FEQSxDQUFBOztBQUFBLElBR0EsbUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxZQUFMLEVBQW1CO0FBQUEsUUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLFFBQWdCLE9BQUEsRUFBTyx3QkFBdkI7T0FBbkIsRUFBb0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNsRSxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxlQUFQO1dBQUwsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFlBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGNBQUEsTUFBQSxFQUFRLGNBQVI7QUFBQSxjQUF3QixPQUFBLEVBQU8sNEJBQS9CO2FBQU4sQ0FBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE1BQUEsRUFBUSxnQkFBUjtBQUFBLGNBQTBCLE9BQUEsRUFBTyxjQUFqQzthQUFMLEVBQXNELFNBQUEsR0FBQTtBQUNwRCxjQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxnQkFBQSxPQUFBLEVBQU8sMkNBQVA7ZUFBTCxDQUFBLENBQUE7cUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGdCQUFBLE1BQUEsRUFBUSxvQkFBUjtBQUFBLGdCQUE4QixPQUFBLEVBQU8sY0FBckM7ZUFBTCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsZ0JBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGtCQUFBLE1BQUEsRUFBUSxlQUFSO0FBQUEsa0JBQXlCLE9BQUEsRUFBTyxnQkFBaEM7aUJBQU4sQ0FBQSxDQUFBO3VCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0saUJBQU4sRUFGd0Q7Y0FBQSxDQUExRCxFQUZvRDtZQUFBLENBQXRELEVBRjJCO1VBQUEsQ0FBN0IsQ0FBQSxDQUFBO2lCQVFBLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxZQUFBLE1BQUEsRUFBUSxhQUFSO0FBQUEsWUFBdUIsT0FBQSxFQUFPLDJHQUE5QjtBQUFBLFlBQTJJLFFBQUEsRUFBVSxDQUFBLENBQXJKO1dBQUosRUFUa0U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwRSxFQURRO0lBQUEsQ0FIVixDQUFBOztBQUFBLGtDQWVBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSxLQUFBO0FBQUEsTUFBQSxJQUFxRCwyQkFBckQ7QUFBQSxRQUFBLFFBQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsY0FBQSxLQUFELEVBQVEsNEJBQUEsbUJBQVIsQ0FBQTtPQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRmpCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFIZixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsS0FBRCxHQUFTLENBTFQsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQU5WLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxjQUFjLENBQUMsS0FBSyxDQUFDLE9BQXRCLEdBQWdDLE1BUmhDLENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsRUFBbUIsZ0NBQW5CLEVBQ2pCO0FBQUEsUUFBQSxLQUFBLEVBQU8sU0FBQyxDQUFELEdBQUE7QUFDTCxjQUFBLFFBQUE7QUFBQSxVQUFBLENBQUMsQ0FBQyxlQUFGLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxRQUFBLEdBQVcsZ0JBQWdCLENBQUMsT0FBakIsQ0FBeUIsQ0FBQyxDQUFDLE1BQTNCLEVBQWtDLG1CQUFsQyxDQUF1RCxDQUFBLENBQUEsQ0FEbEUsQ0FBQTtpQkFFQSxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQW5CLENBQTBCLFdBQTFCLEVBSEs7UUFBQSxDQUFQO09BRGlCLENBQW5CLENBVkEsQ0FBQTthQWdCQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLEVBQW1CLGdCQUFuQixFQUNqQjtBQUFBLFFBQUEsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxDQUFELEdBQUE7QUFDTCxnQkFBQSx5Q0FBQTtBQUFBLFlBQUEsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxZQUNBLFNBQUEsR0FBZSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQVQsQ0FBaUIsZ0JBQWpCLENBQUgsR0FDVixDQUFDLENBQUMsTUFEUSxHQUdWLGdCQUFnQixDQUFDLE9BQWpCLENBQXlCLENBQUMsQ0FBQyxNQUEzQixFQUFrQyxnQkFBbEMsQ0FBb0QsQ0FBQSxDQUFBLENBSnRELENBQUE7QUFBQSxZQU1BLFFBQUEsR0FBVyxnQkFBZ0IsQ0FBQyxPQUFqQixDQUF5QixTQUF6QixFQUFtQyxtQkFBbkMsQ0FBd0QsQ0FBQSxDQUFBLENBTm5FLENBQUE7QUFBQSxZQU9BLEtBQUEsR0FBUSxLQUFLLENBQUMsVUFBTixDQUFpQixDQUN2QixTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUF4QixDQUE4QixHQUE5QixDQUFrQyxDQUFDLEdBQW5DLENBQXVDLE1BQXZDLENBRHVCLEVBRXZCLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQXRCLENBQTRCLEdBQTVCLENBQWdDLENBQUMsR0FBakMsQ0FBcUMsTUFBckMsQ0FGdUIsQ0FBakIsQ0FQUixDQUFBO0FBQUEsWUFXQSxhQUFBLEdBQWdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFYakMsQ0FBQTttQkFZQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsS0FBQyxDQUFBLFdBQVksQ0FBQSxhQUFBLENBQWpDLENBQWdELENBQUMsSUFBakQsQ0FBc0QsU0FBQyxNQUFELEdBQUE7cUJBQ3BELE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixLQUE5QixFQUFxQztBQUFBLGdCQUFBLFVBQUEsRUFBWSxJQUFaO2VBQXJDLEVBRG9EO1lBQUEsQ0FBdEQsRUFiSztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVA7T0FEaUIsQ0FBbkIsRUFqQmU7SUFBQSxDQWZqQixDQUFBOztBQUFBLGtDQWlEQSxRQUFBLEdBQVUsU0FBRSxXQUFGLEdBQUE7QUFDUixNQURTLElBQUMsQ0FBQSxjQUFBLFdBQ1YsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsZ0JBQWIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUMvQyxLQUFDLENBQUEsYUFBRCxDQUFlLE1BQWYsRUFEK0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQUFuQixDQUFBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLG1CQUFiLENBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ2xELEtBQUMsQ0FBQSxjQUFELENBQUEsRUFEa0Q7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQyxDQUFuQixDQUhBLENBQUE7YUFNQSxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQWIsQ0FBQSxFQVBRO0lBQUEsQ0FqRFYsQ0FBQTs7QUFBQSxrQ0EwREEsYUFBQSxHQUFlLFNBQUMsTUFBRCxHQUFBO0FBQ2IsTUFBQSxJQUFDLENBQUEsS0FBRCxJQUFVLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsSUFBVyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BRDFCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixJQUEwQixJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsTUFBbEIsQ0FIMUIsQ0FBQTthQUlBLElBQUMsQ0FBQSxhQUFELENBQUEsRUFMYTtJQUFBLENBMURmLENBQUE7O0FBQUEsa0NBaUVBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsTUFBQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBQUEsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxLQUFXLENBQWQ7QUFDRSxRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLFlBQXBCLENBQUEsQ0FBQTtlQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixDQUFrQiwyRkFBbEIsRUFGRjtPQUhjO0lBQUEsQ0FqRWhCLENBQUE7O0FBQUEsa0NBNEVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixVQUFBLFdBQUE7QUFBQSxNQUFBLFdBQUEsR0FBaUIsSUFBQyxDQUFBLEtBQUQsS0FBVSxDQUFiLEdBQW9CLE1BQXBCLEdBQWdDLE9BQTlDLENBQUE7YUFFQSxJQUFDLENBQUEsWUFBWSxDQUFDLFNBQWQsR0FBNkIsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFiLEdBRTlCLDhCQUFBLEdBQTZCLElBQUMsQ0FBQSxNQUE5QixHQUNNLDBEQUROLEdBSUssSUFBQyxDQUFBLEtBSk4sR0FJWSxHQUpaLEdBSWUsV0FKZixHQUkyQixXQU5HLEdBV3ZCLHFCQUFBLEdBQXFCLElBQUMsQ0FBQSxLQUF0QixHQUE0QixHQUE1QixHQUErQixZQWRyQjtJQUFBLENBNUVmLENBQUE7O0FBQUEsa0NBNEZBLGdCQUFBLEdBQWtCLFNBQUMsVUFBRCxHQUFBO0FBQ2hCLFVBQUEsd0RBQUE7O1FBQUEsSUFBSyxPQUFBLENBQVEsaUJBQVI7T0FBTDs7UUFDQSxPQUFRLE9BQUEsQ0FBUSxNQUFSO09BRFI7QUFBQSxNQUdDLHNCQUFBLFFBQUQsRUFBVSxxQkFBQSxPQUhWLENBQUE7QUFBQSxNQUlBLFlBQUEsR0FBZSxJQUFJLENBQUMsUUFBTCxDQUFjLFFBQWQsQ0FKZixDQUFBO0FBQUEsTUFNQSxhQUFBLEdBQWdCLENBQUMsQ0FBQyxlQUFGLENBQWtCLFFBQWxCLENBTmhCLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxXQUFZLENBQUEsYUFBQSxDQUFiLEdBQThCLFFBUDlCLENBQUE7QUFBQSxNQVFBLFFBQUEsR0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQWIsQ0FBd0IsUUFBeEIsQ0FSWCxDQUFBO2FBV0osa0RBQUEsR0FBK0MsYUFBL0MsR0FBNkQsbUpBQTdELEdBR3VDLFlBSHZDLEdBR29ELG1EQUhwRCxHQUlxQixRQUpyQixHQUk4QixrREFKOUIsR0FLbUIsT0FBTyxDQUFDLE1BTDNCLEdBS2tDLG9FQUxsQyxHQU9VLENBQUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxLQUFELEdBQUE7aUJBQVcsS0FBQyxDQUFBLGlCQUFELENBQW1CLEtBQW5CLEVBQVg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLENBQWdELENBQUMsSUFBakQsQ0FBc0QsRUFBdEQsQ0FBRCxDQVBWLEdBUWdDLG1CQXBCWjtJQUFBLENBNUZsQixDQUFBOztBQUFBLGtDQW9IQSxpQkFBQSxHQUFtQixTQUFDLEtBQUQsR0FBQTtBQUNqQixVQUFBLDBGQUFBO0FBQUEsTUFBQSxJQUFxRCwyQkFBckQ7QUFBQSxRQUFBLFFBQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsY0FBQSxLQUFELEVBQVEsNEJBQUEsbUJBQVIsQ0FBQTtPQUFBO0FBQUEsTUFFQSxTQUFBLEdBQWUsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFaLEdBQW1CLElBQXRCLEdBQ1YsT0FEVSxHQUdWLE9BTEYsQ0FBQTtBQUFBLE1BT0MsaUJBQUEsUUFBRCxFQUFXLGNBQUEsS0FQWCxDQUFBO0FBQUEsTUFTQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakIsQ0FUUixDQUFBO0FBQUEsTUFVQSxVQUFBLEdBQWEsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFaLEdBQXFCLEtBQUssQ0FBQyxjQVZ4QyxDQUFBO0FBQUEsTUFXQSxRQUFBLEdBQVcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFWLEdBQW1CLEtBQUssQ0FBQyxjQVhwQyxDQUFBO0FBQUEsTUFZQSxNQUFBLEdBQVMsdUJBQUEsQ0FBd0IsS0FBSyxDQUFDLFFBQVMscUJBQXZDLENBWlQsQ0FBQTtBQUFBLE1BYUEsTUFBQSxHQUFTLEtBQUssQ0FBQyxRQUFTLGdCQWJ4QixDQUFBO0FBQUEsTUFjQSxVQUFBLEdBQWEsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFaLEdBQWtCLENBZC9CLENBQUE7QUFBQSxNQWVBLEtBQUEsR0FBUSxFQWZSLENBQUE7QUFBQSxNQWdCQSxLQUFBLElBQVUsY0FBQSxHQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFaLENBQUEsQ0FBRCxDQUFiLEdBQWtDLEdBaEI1QyxDQUFBO0FBQUEsTUFpQkEsS0FBQSxJQUFVLFNBQUEsR0FBUyxTQUFULEdBQW1CLEdBakI3QixDQUFBO2FBb0JKLHFEQUFBLEdBQWtELEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBOUQsR0FBa0UsR0FBbEUsR0FBcUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFqRixHQUF3RixnQkFBeEYsR0FBc0csS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFoSCxHQUFvSCxHQUFwSCxHQUF1SCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQWpJLEdBQXdJLGlEQUF4SSxHQUNzQyxVQUR0QyxHQUNpRCwyQ0FEakQsR0FFdUIsTUFGdkIsR0FHQywrQ0FIRCxHQUk2QixLQUo3QixHQUltQyxJQUpuQyxHQUl1QyxLQUFLLENBQUMsU0FKN0MsR0FJdUQsZUFKdkQsR0FJcUUsTUFKckUsR0FJNEUscUJBekJ2RDtJQUFBLENBcEhuQixDQUFBOzsrQkFBQTs7S0FEZ0MsWUFUbEMsQ0FBQTs7QUFBQSxFQThKQSxNQUFNLENBQUMsT0FBUCxHQUFpQixtQkFBQSxHQUNqQixRQUFRLENBQUMsZUFBVCxDQUF5Qix3QkFBekIsRUFBbUQ7QUFBQSxJQUNqRCxTQUFBLEVBQVcsbUJBQW1CLENBQUMsU0FEa0I7R0FBbkQsQ0EvSkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-results-element.coffee
