(function() {
  var CompositeDisposable, EventsDelegation, Palette, PaletteElement, SpacePenDSL, StickyTitle, THEME_VARIABLES, pigments, registerOrUpdateElement, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-utils'), SpacePenDSL = _ref.SpacePenDSL, EventsDelegation = _ref.EventsDelegation, registerOrUpdateElement = _ref.registerOrUpdateElement;

  _ref1 = [], CompositeDisposable = _ref1[0], THEME_VARIABLES = _ref1[1], pigments = _ref1[2], Palette = _ref1[3], StickyTitle = _ref1[4];

  PaletteElement = (function(_super) {
    __extends(PaletteElement, _super);

    function PaletteElement() {
      return PaletteElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(PaletteElement);

    EventsDelegation.includeInto(PaletteElement);

    PaletteElement.content = function() {
      var group, merge, optAttrs, sort;
      sort = atom.config.get('pigments.sortPaletteColors');
      group = atom.config.get('pigments.groupPaletteColors');
      merge = atom.config.get('pigments.mergeColorDuplicates');
      optAttrs = function(bool, name, attrs) {
        if (bool) {
          attrs[name] = name;
        }
        return attrs;
      };
      return this.div({
        "class": 'pigments-palette-panel'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'pigments-palette-controls settings-view pane-item'
          }, function() {
            return _this.div({
              "class": 'pigments-palette-controls-wrapper'
            }, function() {
              _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.label({
                  "for": 'sort-palette-colors'
                }, 'Sort Colors');
                return _this.select({
                  outlet: 'sort',
                  id: 'sort-palette-colors'
                }, function() {
                  _this.option(optAttrs(sort === 'none', 'selected', {
                    value: 'none'
                  }), 'None');
                  _this.option(optAttrs(sort === 'by name', 'selected', {
                    value: 'by name'
                  }), 'By Name');
                  return _this.option(optAttrs(sort === 'by file', 'selected', {
                    value: 'by color'
                  }), 'By Color');
                });
              });
              _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.label({
                  "for": 'sort-palette-colors'
                }, 'Group Colors');
                return _this.select({
                  outlet: 'group',
                  id: 'group-palette-colors'
                }, function() {
                  _this.option(optAttrs(group === 'none', 'selected', {
                    value: 'none'
                  }), 'None');
                  return _this.option(optAttrs(group === 'by file', 'selected', {
                    value: 'by file'
                  }), 'By File');
                });
              });
              return _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.input(optAttrs(merge, 'checked', {
                  type: 'checkbox',
                  id: 'merge-duplicates',
                  outlet: 'merge'
                }));
                return _this.label({
                  "for": 'merge-duplicates'
                }, 'Merge Duplicates');
              });
            });
          });
          return _this.div({
            "class": 'pigments-palette-list native-key-bindings',
            tabindex: -1
          }, function() {
            return _this.ol({
              outlet: 'list'
            });
          });
        };
      })(this));
    };

    PaletteElement.prototype.createdCallback = function() {
      var subscription;
      if (pigments == null) {
        pigments = require('./pigments');
      }
      this.project = pigments.getProject();
      if (this.project != null) {
        return this.init();
      } else {
        return subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              _this.project = pigments.getProject();
              return _this.init();
            }
          };
        })(this));
      }
    };

    PaletteElement.prototype.init = function() {
      if (this.project.isDestroyed()) {
        return;
      }
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.project.onDidUpdateVariables((function(_this) {
        return function() {
          if (_this.palette != null) {
            _this.palette.variables = _this.project.getColorVariables();
            if (_this.attached) {
              return _this.renderList();
            }
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sortPaletteColors', (function(_this) {
        return function(sortPaletteColors) {
          _this.sortPaletteColors = sortPaletteColors;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.groupPaletteColors', (function(_this) {
        return function(groupPaletteColors) {
          _this.groupPaletteColors = groupPaletteColors;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.mergeColorDuplicates', (function(_this) {
        return function(mergeColorDuplicates) {
          _this.mergeColorDuplicates = mergeColorDuplicates;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(this.subscribeTo(this.sort, {
        'change': function(e) {
          return atom.config.set('pigments.sortPaletteColors', e.target.value);
        }
      }));
      this.subscriptions.add(this.subscribeTo(this.group, {
        'change': function(e) {
          return atom.config.set('pigments.groupPaletteColors', e.target.value);
        }
      }));
      this.subscriptions.add(this.subscribeTo(this.merge, {
        'change': function(e) {
          return atom.config.set('pigments.mergeColorDuplicates', e.target.checked);
        }
      }));
      return this.subscriptions.add(this.subscribeTo(this.list, '[data-variable-id]', {
        'click': (function(_this) {
          return function(e) {
            var variable, variableId;
            variableId = Number(e.target.dataset.variableId);
            variable = _this.project.getVariableById(variableId);
            return _this.project.showVariableInFile(variable);
          };
        })(this)
      }));
    };

    PaletteElement.prototype.attachedCallback = function() {
      if (this.palette != null) {
        this.renderList();
      }
      return this.attached = true;
    };

    PaletteElement.prototype.detachedCallback = function() {
      this.subscriptions.dispose();
      return this.attached = false;
    };

    PaletteElement.prototype.getModel = function() {
      return this.palette;
    };

    PaletteElement.prototype.setModel = function(palette) {
      this.palette = palette;
      if (this.attached) {
        return this.renderList();
      }
    };

    PaletteElement.prototype.getColorsList = function(palette) {
      switch (this.sortPaletteColors) {
        case 'by color':
          return palette.sortedByColor();
        case 'by name':
          return palette.sortedByName();
        default:
          return palette.variables.slice();
      }
    };

    PaletteElement.prototype.renderList = function() {
      var file, li, ol, palette, palettes, _ref2;
      if ((_ref2 = this.stickyTitle) != null) {
        _ref2.dispose();
      }
      this.list.innerHTML = '';
      if (this.groupPaletteColors === 'by file') {
        if (StickyTitle == null) {
          StickyTitle = require('./sticky-title');
        }
        palettes = this.getFilesPalettes();
        for (file in palettes) {
          palette = palettes[file];
          li = document.createElement('li');
          li.className = 'pigments-color-group';
          ol = document.createElement('ol');
          li.appendChild(this.getGroupHeader(atom.project.relativize(file)));
          li.appendChild(ol);
          this.buildList(ol, this.getColorsList(palette));
          this.list.appendChild(li);
        }
        return this.stickyTitle = new StickyTitle(this.list.querySelectorAll('.pigments-color-group-header-content'), this.querySelector('.pigments-palette-list'));
      } else {
        return this.buildList(this.list, this.getColorsList(this.palette));
      }
    };

    PaletteElement.prototype.getGroupHeader = function(label) {
      var content, header;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      header = document.createElement('div');
      header.className = 'pigments-color-group-header';
      content = document.createElement('div');
      content.className = 'pigments-color-group-header-content';
      if (label === THEME_VARIABLES) {
        content.textContent = 'Atom Themes';
      } else {
        content.textContent = label;
      }
      header.appendChild(content);
      return header;
    };

    PaletteElement.prototype.getFilesPalettes = function() {
      var palettes;
      if (Palette == null) {
        Palette = require('./palette');
      }
      palettes = {};
      this.palette.eachColor((function(_this) {
        return function(variable) {
          var path;
          path = variable.path;
          if (palettes[path] == null) {
            palettes[path] = new Palette([]);
          }
          return palettes[path].variables.push(variable);
        };
      })(this));
      return palettes;
    };

    PaletteElement.prototype.buildList = function(container, paletteColors) {
      var color, html, id, li, line, name, path, variables, _i, _j, _len, _len1, _ref2, _results;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      paletteColors = this.checkForDuplicates(paletteColors);
      _results = [];
      for (_i = 0, _len = paletteColors.length; _i < _len; _i++) {
        variables = paletteColors[_i];
        li = document.createElement('li');
        li.className = 'pigments-color-item';
        color = variables[0].color;
        if (color.toCSS == null) {
          continue;
        }
        html = "<div class=\"pigments-color\">\n  <span class=\"pigments-color-preview\"\n        style=\"background-color: " + (color.toCSS()) + "\">\n  </span>\n  <span class=\"pigments-color-properties\">\n    <span class=\"pigments-color-component\"><strong>R:</strong> " + (Math.round(color.red)) + "</span>\n    <span class=\"pigments-color-component\"><strong>G:</strong> " + (Math.round(color.green)) + "</span>\n    <span class=\"pigments-color-component\"><strong>B:</strong> " + (Math.round(color.blue)) + "</span>\n    <span class=\"pigments-color-component\"><strong>A:</strong> " + (Math.round(color.alpha * 1000) / 1000) + "</span>\n  </span>\n</div>\n<div class=\"pigments-color-details\">";
        for (_j = 0, _len1 = variables.length; _j < _len1; _j++) {
          _ref2 = variables[_j], name = _ref2.name, path = _ref2.path, line = _ref2.line, id = _ref2.id;
          html += "<span class=\"pigments-color-occurence\">\n    <span class=\"name\">" + name + "</span>";
          if (path !== THEME_VARIABLES) {
            html += "<span data-variable-id=\"" + id + "\">\n  <span class=\"path\">" + (atom.project.relativize(path)) + "</span>\n  <span class=\"line\">at line " + (line + 1) + "</span>\n</span>";
          }
          html += '</span>';
        }
        html += '</div>';
        li.innerHTML = html;
        _results.push(container.appendChild(li));
      }
      return _results;
    };

    PaletteElement.prototype.checkForDuplicates = function(paletteColors) {
      var colors, findColor, key, map, results, v, _i, _len;
      results = [];
      if (this.mergeColorDuplicates) {
        map = new Map();
        colors = [];
        findColor = function(color) {
          var col, _i, _len;
          for (_i = 0, _len = colors.length; _i < _len; _i++) {
            col = colors[_i];
            if (typeof col.isEqual === "function" ? col.isEqual(color) : void 0) {
              return col;
            }
          }
        };
        for (_i = 0, _len = paletteColors.length; _i < _len; _i++) {
          v = paletteColors[_i];
          if (key = findColor(v.color)) {
            map.get(key).push(v);
          } else {
            map.set(v.color, [v]);
            colors.push(v.color);
          }
        }
        map.forEach(function(vars, color) {
          return results.push(vars);
        });
        return results;
      } else {
        return (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = paletteColors.length; _j < _len1; _j++) {
            v = paletteColors[_j];
            _results.push([v]);
          }
          return _results;
        })();
      }
    };

    return PaletteElement;

  })(HTMLElement);

  module.exports = PaletteElement = registerOrUpdateElement('pigments-palette', PaletteElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGFsZXR0ZS1lbGVtZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5SkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBMkQsT0FBQSxDQUFRLFlBQVIsQ0FBM0QsRUFBQyxtQkFBQSxXQUFELEVBQWMsd0JBQUEsZ0JBQWQsRUFBZ0MsK0JBQUEsdUJBQWhDLENBQUE7O0FBQUEsRUFFQSxRQUF5RSxFQUF6RSxFQUFDLDhCQUFELEVBQXNCLDBCQUF0QixFQUF1QyxtQkFBdkMsRUFBaUQsa0JBQWpELEVBQTBELHNCQUYxRCxDQUFBOztBQUFBLEVBSU07QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFXLENBQUMsV0FBWixDQUF3QixjQUF4QixDQUFBLENBQUE7O0FBQUEsSUFDQSxnQkFBZ0IsQ0FBQyxXQUFqQixDQUE2QixjQUE3QixDQURBLENBQUE7O0FBQUEsSUFHQSxjQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTtBQUNSLFVBQUEsNEJBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLENBQVAsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FEUixDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQixDQUZSLENBQUE7QUFBQSxNQUdBLFFBQUEsR0FBVyxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsS0FBYixHQUFBO0FBQ1QsUUFBQSxJQUFzQixJQUF0QjtBQUFBLFVBQUEsS0FBTSxDQUFBLElBQUEsQ0FBTixHQUFjLElBQWQs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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/palette-element.coffee
