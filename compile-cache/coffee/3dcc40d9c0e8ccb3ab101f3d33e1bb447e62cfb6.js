(function() {
  var $, Point, Range, SymbolsContextMenu, SymbolsTreeView, TagGenerator, TagParser, TreeView, View, jQuery, ref, ref1,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, jQuery = ref1.jQuery, View = ref1.View;

  TreeView = require('./tree-view').TreeView;

  TagGenerator = require('./tag-generator');

  TagParser = require('./tag-parser');

  SymbolsContextMenu = require('./symbols-context-menu');

  module.exports = SymbolsTreeView = (function(superClass) {
    extend(SymbolsTreeView, superClass);

    function SymbolsTreeView() {
      return SymbolsTreeView.__super__.constructor.apply(this, arguments);
    }

    SymbolsTreeView.content = function() {
      return this.div({
        "class": 'symbols-tree-view tool-panel focusable-panel'
      });
    };

    SymbolsTreeView.prototype.initialize = function() {
      this.treeView = new TreeView;
      this.append(this.treeView);
      this.cachedStatus = {};
      this.contextMenu = new SymbolsContextMenu;
      this.autoHideTypes = atom.config.get('symbols-tree-view.zAutoHideTypes');
      this.treeView.onSelect((function(_this) {
        return function(arg) {
          var bottom, desiredScrollCenter, desiredScrollTop, done, editor, from, height, item, left, node, ref2, screenPosition, screenRange, step, to, top, width;
          node = arg.node, item = arg.item;
          if (item.position.row >= 0 && (editor = atom.workspace.getActiveTextEditor())) {
            screenPosition = editor.screenPositionForBufferPosition(item.position);
            screenRange = new Range(screenPosition, screenPosition);
            ref2 = editor.pixelRectForScreenRange(screenRange), top = ref2.top, left = ref2.left, height = ref2.height, width = ref2.width;
            bottom = top + height;
            desiredScrollCenter = top + height / 2;
            if (!((editor.getScrollTop() < desiredScrollCenter && desiredScrollCenter < editor.getScrollBottom()))) {
              desiredScrollTop = desiredScrollCenter - editor.getHeight() / 2;
            }
            from = {
              top: editor.getScrollTop()
            };
            to = {
              top: desiredScrollTop
            };
            step = function(now) {
              return editor.setScrollTop(now);
            };
            done = function() {
              editor.scrollToBufferPosition(item.position, {
                center: true
              });
              editor.setCursorBufferPosition(item.position);
              return editor.moveToFirstCharacterOfLine();
            };
            return jQuery(from).animate(to, {
              duration: _this.animationDuration,
              step: step,
              done: done
            });
          }
        };
      })(this));
      atom.config.observe('symbols-tree-view.scrollAnimation', (function(_this) {
        return function(enabled) {
          return _this.animationDuration = enabled ? 300 : 0;
        };
      })(this));
      this.minimalWidth = 5;
      this.originalWidth = atom.config.get('symbols-tree-view.defaultWidth');
      return atom.config.observe('symbols-tree-view.autoHide', (function(_this) {
        return function(autoHide) {
          if (!autoHide) {
            return _this.width(_this.originalWidth);
          } else {
            return _this.width(_this.minimalWidth);
          }
        };
      })(this));
    };

    SymbolsTreeView.prototype.getEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    SymbolsTreeView.prototype.getScopeName = function() {
      var ref2, ref3;
      return (ref2 = atom.workspace.getActiveTextEditor()) != null ? (ref3 = ref2.getGrammar()) != null ? ref3.scopeName : void 0 : void 0;
    };

    SymbolsTreeView.prototype.populate = function() {
      var editor, filePath;
      if (!(editor = this.getEditor())) {
        return this.hide();
      } else {
        filePath = editor.getPath();
        this.generateTags(filePath);
        this.show();
        this.onEditorSave = editor.onDidSave((function(_this) {
          return function(state) {
            filePath = editor.getPath();
            return _this.generateTags(filePath);
          };
        })(this));
        return this.onChangeRow = editor.onDidChangeCursorPosition((function(_this) {
          return function(arg) {
            var newBufferPosition, oldBufferPosition;
            oldBufferPosition = arg.oldBufferPosition, newBufferPosition = arg.newBufferPosition;
            if (oldBufferPosition.row !== newBufferPosition.row) {
              return _this.focusCurrentCursorTag();
            }
          };
        })(this));
      }
    };

    SymbolsTreeView.prototype.focusCurrentCursorTag = function() {
      var editor, row, tag;
      if (editor = this.getEditor()) {
        row = editor.getCursorBufferPosition().row;
        tag = this.parser.getNearestTag(row);
        return this.treeView.select(tag);
      }
    };

    SymbolsTreeView.prototype.focusClickedTag = function(editor, text) {
      var t, tag;
      console.log("clicked: " + text);
      if (editor = this.getEditor()) {
        tag = ((function() {
          var i, len, ref2, results;
          ref2 = this.parser.tags;
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            t = ref2[i];
            if (t.name === text) {
              results.push(t);
            }
          }
          return results;
        }).call(this))[0];
        this.treeView.select(tag);
        return jQuery('.list-item.list-selectable-item.selected').click();
      }
    };

    SymbolsTreeView.prototype.updateContextMenu = function(types) {
      var editor, i, j, len, len1, ref2, ref3, ref4, ref5, toggleSortByName, toggleTypeVisible, type, visible;
      this.contextMenu.clear();
      editor = (ref2 = this.getEditor()) != null ? ref2.id : void 0;
      toggleTypeVisible = (function(_this) {
        return function(type) {
          _this.treeView.toggleTypeVisible(type);
          return _this.nowTypeStatus[type] = !_this.nowTypeStatus[type];
        };
      })(this);
      toggleSortByName = (function(_this) {
        return function() {
          var ref3, type, visible;
          _this.nowSortStatus[0] = !_this.nowSortStatus[0];
          if (_this.nowSortStatus[0]) {
            _this.treeView.sortByName();
          } else {
            _this.treeView.sortByRow();
          }
          ref3 = _this.nowTypeStatus;
          for (type in ref3) {
            visible = ref3[type];
            if (!visible) {
              _this.treeView.toggleTypeVisible(type);
            }
          }
          return _this.focusCurrentCursorTag();
        };
      })(this);
      if (this.cachedStatus[editor]) {
        ref3 = this.cachedStatus[editor], this.nowTypeStatus = ref3.nowTypeStatus, this.nowSortStatus = ref3.nowSortStatus;
        ref4 = this.nowTypeStatus;
        for (type in ref4) {
          visible = ref4[type];
          if (!visible) {
            this.treeView.toggleTypeVisible(type);
          }
        }
        if (this.nowSortStatus[0]) {
          this.treeView.sortByName();
        }
      } else {
        this.cachedStatus[editor] = {
          nowTypeStatus: {},
          nowSortStatus: [false]
        };
        for (i = 0, len = types.length; i < len; i++) {
          type = types[i];
          this.cachedStatus[editor].nowTypeStatus[type] = true;
        }
        this.sortByNameScopes = atom.config.get('symbols-tree-view.sortByNameScopes');
        if (this.sortByNameScopes.indexOf(this.getScopeName()) !== -1) {
          this.cachedStatus[editor].nowSortStatus[0] = true;
          this.treeView.sortByName();
        }
        ref5 = this.cachedStatus[editor], this.nowTypeStatus = ref5.nowTypeStatus, this.nowSortStatus = ref5.nowSortStatus;
      }
      for (j = 0, len1 = types.length; j < len1; j++) {
        type = types[j];
        this.contextMenu.addMenu(type, this.nowTypeStatus[type], toggleTypeVisible);
      }
      this.contextMenu.addSeparator();
      return this.contextMenu.addMenu('sort by name', this.nowSortStatus[0], toggleSortByName);
    };

    SymbolsTreeView.prototype.generateTags = function(filePath) {
      return new TagGenerator(filePath, this.getScopeName()).generate().done((function(_this) {
        return function(tags) {
          var i, len, ref2, results, root, type, types;
          _this.parser = new TagParser(tags, _this.getScopeName());
          ref2 = _this.parser.parse(), root = ref2.root, types = ref2.types;
          _this.treeView.setRoot(root);
          _this.updateContextMenu(types);
          _this.focusCurrentCursorTag();
          if (_this.autoHideTypes) {
            results = [];
            for (i = 0, len = types.length; i < len; i++) {
              type = types[i];
              if (_this.autoHideTypes.indexOf(type) !== -1) {
                _this.treeView.toggleTypeVisible(type);
                results.push(_this.contextMenu.toggle(type));
              } else {
                results.push(void 0);
              }
            }
            return results;
          }
        };
      })(this));
    };

    SymbolsTreeView.prototype.serialize = function() {};

    SymbolsTreeView.prototype.destroy = function() {
      return this.element.remove();
    };

    SymbolsTreeView.prototype.attach = function() {
      if (atom.config.get('tree-view.showOnRightSide')) {
        this.panel = atom.workspace.addLeftPanel({
          item: this
        });
      } else {
        this.panel = atom.workspace.addRightPanel({
          item: this
        });
      }
      this.contextMenu.attach();
      return this.contextMenu.hide();
    };

    SymbolsTreeView.prototype.attached = function() {
      this.onChangeEditor = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(editor) {
          _this.removeEventForEditor();
          return _this.populate();
        };
      })(this));
      this.onChangeAutoHide = atom.config.observe('symbols-tree-view.autoHide', (function(_this) {
        return function(autoHide) {
          if (!autoHide) {
            return _this.off('mouseenter mouseleave');
          } else {
            _this.mouseenter(function(event) {
              _this.stop();
              return _this.animate({
                width: _this.originalWidth
              }, {
                duration: _this.animationDuration
              });
            });
            return _this.mouseleave(function(event) {
              _this.stop();
              if (atom.config.get('tree-view.showOnRightSide')) {
                if (event.offsetX > 0) {
                  return _this.animate({
                    width: _this.minimalWidth
                  }, {
                    duration: _this.animationDuration
                  });
                }
              } else {
                if (event.offsetX <= 0) {
                  return _this.animate({
                    width: _this.minimalWidth
                  }, {
                    duration: _this.animationDuration
                  });
                }
              }
            });
          }
        };
      })(this));
      return this.on("contextmenu", (function(_this) {
        return function(event) {
          var left;
          left = event.pageX;
          if (left + _this.contextMenu.width() > atom.getSize().width) {
            left = left - _this.contextMenu.width();
          }
          _this.contextMenu.css({
            left: left,
            top: event.pageY
          });
          _this.contextMenu.show();
          return false;
        };
      })(this));
    };

    SymbolsTreeView.prototype.removeEventForEditor = function() {
      var ref2, ref3;
      if ((ref2 = this.onEditorSave) != null) {
        ref2.dispose();
      }
      return (ref3 = this.onChangeRow) != null ? ref3.dispose() : void 0;
    };

    SymbolsTreeView.prototype.detached = function() {
      var ref2, ref3;
      if ((ref2 = this.onChangeEditor) != null) {
        ref2.dispose();
      }
      if ((ref3 = this.onChangeAutoHide) != null) {
        ref3.dispose();
      }
      this.removeEventForEditor();
      return this.off("contextmenu");
    };

    SymbolsTreeView.prototype.remove = function() {
      SymbolsTreeView.__super__.remove.apply(this, arguments);
      return this.panel.destroy();
    };

    SymbolsTreeView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.remove();
      } else {
        this.populate();
        return this.attach();
      }
    };

    SymbolsTreeView.prototype.showView = function() {
      if (!this.hasParent()) {
        this.populate();
        return this.attach();
      }
    };

    SymbolsTreeView.prototype.hideView = function() {
      if (this.hasParent()) {
        return this.remove();
      }
    };

    return SymbolsTreeView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW1ib2xzLXRyZWUtdmlldy9saWIvc3ltYm9scy10cmVlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnSEFBQTtJQUFBOzs7RUFBQSxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsT0FBb0IsT0FBQSxDQUFRLHNCQUFSLENBQXBCLEVBQUMsVUFBRCxFQUFJLG9CQUFKLEVBQVk7O0VBQ1gsV0FBWSxPQUFBLENBQVEsYUFBUjs7RUFDYixZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUjs7RUFDWixrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVI7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7Ozs7Ozs7SUFDSixlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyw4Q0FBUDtPQUFMO0lBRFE7OzhCQUdWLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJO01BQ2hCLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLFFBQVQ7TUFFQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUNoQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQjtNQUVqQixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDakIsY0FBQTtVQURtQixpQkFBTTtVQUN6QixJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxJQUFxQixDQUFyQixJQUEyQixDQUFB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QUFDQSxpQkFBTztRQU5VO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQjtJQXBCUTs7OEJBNEJWLG9CQUFBLEdBQXNCLFNBQUE7QUFDcEIsVUFBQTs7WUFBYSxDQUFFLE9BQWYsQ0FBQTs7cURBQ1ksQ0FBRSxPQUFkLENBQUE7SUFGb0I7OzhCQUl0QixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7O1lBQWUsQ0FBRSxPQUFqQixDQUFBOzs7WUFDaUIsQ0FBRSxPQUFuQixDQUFBOztNQUNBLElBQUMsQ0FBQSxvQkFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxhQUFMO0lBSlE7OzhCQU1WLE1BQUEsR0FBUSxTQUFBO01BQ04sNkNBQUEsU0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBO0lBRk07OzhCQUtSLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLFFBQUQsQ0FBQTtlQUNBLElBQUMsQ0FBQSxNQUFELENBQUEsRUFKRjs7SUFETTs7OEJBUVIsUUFBQSxHQUFVLFNBQUE7TUFDUixJQUFHLENBQUksSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFQO1FBQ0UsSUFBQyxDQUFBLFFBQUQsQ0FBQTtlQUNBLElBQUMsQ0FBQSxNQUFELENBQUEsRUFGRjs7SUFEUTs7OEJBTVYsUUFBQSxHQUFVLFNBQUE7TUFDUixJQUFHLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERjs7SUFEUTs7OztLQTFNa0I7QUFSaEMiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgalF1ZXJ5LCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xue1RyZWVWaWV3fSA9IHJlcXVpcmUgJy4vdHJlZS12aWV3J1xuVGFnR2VuZXJhdG9yID0gcmVxdWlyZSAnLi90YWctZ2VuZXJhdG9yJ1xuVGFnUGFyc2VyID0gcmVxdWlyZSAnLi90YWctcGFyc2VyJ1xuU3ltYm9sc0NvbnRleHRNZW51ID0gcmVxdWlyZSAnLi9zeW1ib2xzLWNvbnRleHQtbWVudSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjbGFzcyBTeW1ib2xzVHJlZVZpZXcgZXh0ZW5kcyBWaWV3XG4gICAgQGNvbnRlbnQ6IC0+XG4gICAgICBAZGl2IGNsYXNzOiAnc3ltYm9scy10cmVlLXZpZXcgdG9vbC1wYW5lbCBmb2N1c2FibGUtcGFuZWwnXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgQHRyZWVWaWV3ID0gbmV3IFRyZWVWaWV3XG4gICAgICBAYXBwZW5kKEB0cmVlVmlldylcblxuICAgICAgQGNhY2hlZFN0YXR1cyA9IHt9XG4gICAgICBAY29udGV4dE1lbnUgPSBuZXcgU3ltYm9sc0NvbnRleHRNZW51XG4gICAgICBAYXV0b0hpZGVUeXBlcyA9IGF0b20uY29uZmlnLmdldCgnc3ltYm9scy10cmVlLXZpZXcuekF1dG9IaWRlVHlwZXMnKVxuXG4gICAgICBAdHJlZVZpZXcub25TZWxlY3QgKHtub2RlLCBpdGVtfSkgPT5cbiAgICAgICAgaWYgaXRlbS5wb3NpdGlvbi5yb3cgPj0gMCBhbmQgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgICAgc2NyZWVuUG9zaXRpb24gPSBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihpdGVtLnBvc2l0aW9uKVxuICAgICAgICAgIHNjcmVlblJhbmdlID0gbmV3IFJhbmdlKHNjcmVlblBvc2l0aW9uLCBzY3JlZW5Qb3NpdGlvbilcbiAgICAgICAgICB7dG9wLCBsZWZ0LCBoZWlnaHQsIHdpZHRofSA9IGVkaXRvci5waXhlbFJlY3RGb3JTY3JlZW5SYW5nZShzY3JlZW5SYW5nZSlcbiAgICAgICAgICBib3R0b20gPSB0b3AgKyBoZWlnaHRcbiAgICAgICAgICBkZXNpcmVkU2Nyb2xsQ2VudGVyID0gdG9wICsgaGVpZ2h0IC8gMlxuICAgICAgICAgIHVubGVzcyBlZGl0b3IuZ2V0U2Nyb2xsVG9wKCkgPCBkZXNpcmVkU2Nyb2xsQ2VudGVyIDwgZWRpdG9yLmdldFNjcm9sbEJvdHRvbSgpXG4gICAgICAgICAgICBkZXNpcmVkU2Nyb2xsVG9wID0gIGRlc2lyZWRTY3JvbGxDZW50ZXIgLSBlZGl0b3IuZ2V0SGVpZ2h0KCkgLyAyXG5cbiAgICAgICAgICBmcm9tID0ge3RvcDogZWRpdG9yLmdldFNjcm9sbFRvcCgpfVxuICAgICAgICAgIHRvID0ge3RvcDogZGVzaXJlZFNjcm9sbFRvcH1cblxuICAgICAgICAgIHN0ZXAgPSAobm93KSAtPlxuICAgICAgICAgICAgZWRpdG9yLnNldFNjcm9sbFRvcChub3cpXG5cbiAgICAgICAgICBkb25lID0gLT5cbiAgICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKGl0ZW0ucG9zaXRpb24sIGNlbnRlcjogdHJ1ZSlcbiAgICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihpdGVtLnBvc2l0aW9uKVxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuICAgICAgICAgIGpRdWVyeShmcm9tKS5hbmltYXRlKHRvLCBkdXJhdGlvbjogQGFuaW1hdGlvbkR1cmF0aW9uLCBzdGVwOiBzdGVwLCBkb25lOiBkb25lKVxuXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdzeW1ib2xzLXRyZWUtdmlldy5zY3JvbGxBbmltYXRpb24nLCAoZW5hYmxlZCkgPT5cbiAgICAgICAgQGFuaW1hdGlvbkR1cmF0aW9uID0gaWYgZW5hYmxlZCB0aGVuIDMwMCBlbHNlIDBcblxuICAgICAgQG1pbmltYWxXaWR0aCA9IDVcbiAgICAgIEBvcmlnaW5hbFdpZHRoID0gYXRvbS5jb25maWcuZ2V0KCdzeW1ib2xzLXRyZWUtdmlldy5kZWZhdWx0V2lkdGgnKVxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSAnc3ltYm9scy10cmVlLXZpZXcuYXV0b0hpZGUnLCAoYXV0b0hpZGUpID0+XG4gICAgICAgIHVubGVzcyBhdXRvSGlkZVxuICAgICAgICAgIEB3aWR0aChAb3JpZ2luYWxXaWR0aClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB3aWR0aChAbWluaW1hbFdpZHRoKVxuXG4gICAgZ2V0RWRpdG9yOiAtPiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBnZXRTY29wZU5hbWU6IC0+IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0R3JhbW1hcigpPy5zY29wZU5hbWVcblxuICAgIHBvcHVsYXRlOiAtPlxuICAgICAgdW5sZXNzIGVkaXRvciA9IEBnZXRFZGl0b3IoKVxuICAgICAgICBAaGlkZSgpXG4gICAgICBlbHNlXG4gICAgICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBAZ2VuZXJhdGVUYWdzKGZpbGVQYXRoKVxuICAgICAgICBAc2hvdygpXG5cbiAgICAgICAgQG9uRWRpdG9yU2F2ZSA9IGVkaXRvci5vbkRpZFNhdmUgKHN0YXRlKSA9PlxuICAgICAgICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgIEBnZW5lcmF0ZVRhZ3MoZmlsZVBhdGgpXG5cbiAgICAgICAgQG9uQ2hhbmdlUm93ID0gZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKHtvbGRCdWZmZXJQb3NpdGlvbiwgbmV3QnVmZmVyUG9zaXRpb259KSA9PlxuICAgICAgICAgIGlmIG9sZEJ1ZmZlclBvc2l0aW9uLnJvdyAhPSBuZXdCdWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgICAgICAgIEBmb2N1c0N1cnJlbnRDdXJzb3JUYWcoKVxuXG4gICAgZm9jdXNDdXJyZW50Q3Vyc29yVGFnOiAtPlxuICAgICAgaWYgZWRpdG9yID0gQGdldEVkaXRvcigpXG4gICAgICAgIHJvdyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgICAgICB0YWcgPSBAcGFyc2VyLmdldE5lYXJlc3RUYWcocm93KVxuICAgICAgICBAdHJlZVZpZXcuc2VsZWN0KHRhZylcblxuICAgIGZvY3VzQ2xpY2tlZFRhZzogKGVkaXRvciwgdGV4dCkgLT5cbiAgICAgIGNvbnNvbGUubG9nIFwiY2xpY2tlZDogI3t0ZXh0fVwiXG4gICAgICBpZiBlZGl0b3IgPSBAZ2V0RWRpdG9yKClcbiAgICAgICAgdGFnID0gICh0IGZvciB0IGluIEBwYXJzZXIudGFncyB3aGVuIHQubmFtZSBpcyB0ZXh0KVswXVxuICAgICAgICBAdHJlZVZpZXcuc2VsZWN0KHRhZylcbiAgICAgICAgIyBpbWhvLCBpdHMgYSBiYWQgaWRlYSA9KFxuICAgICAgICBqUXVlcnkoJy5saXN0LWl0ZW0ubGlzdC1zZWxlY3RhYmxlLWl0ZW0uc2VsZWN0ZWQnKS5jbGljaygpXG5cbiAgICB1cGRhdGVDb250ZXh0TWVudTogKHR5cGVzKSAtPlxuICAgICAgQGNvbnRleHRNZW51LmNsZWFyKClcbiAgICAgIGVkaXRvciA9IEBnZXRFZGl0b3IoKT8uaWRcblxuICAgICAgdG9nZ2xlVHlwZVZpc2libGUgPSAodHlwZSkgPT5cbiAgICAgICAgQHRyZWVWaWV3LnRvZ2dsZVR5cGVWaXNpYmxlKHR5cGUpXG4gICAgICAgIEBub3dUeXBlU3RhdHVzW3R5cGVdID0gIUBub3dUeXBlU3RhdHVzW3R5cGVdXG5cbiAgICAgIHRvZ2dsZVNvcnRCeU5hbWUgPSA9PlxuICAgICAgICBAbm93U29ydFN0YXR1c1swXSA9ICFAbm93U29ydFN0YXR1c1swXVxuICAgICAgICBpZiBAbm93U29ydFN0YXR1c1swXVxuICAgICAgICAgIEB0cmVlVmlldy5zb3J0QnlOYW1lKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB0cmVlVmlldy5zb3J0QnlSb3coKVxuICAgICAgICBmb3IgdHlwZSwgdmlzaWJsZSBvZiBAbm93VHlwZVN0YXR1c1xuICAgICAgICAgIEB0cmVlVmlldy50b2dnbGVUeXBlVmlzaWJsZSh0eXBlKSB1bmxlc3MgdmlzaWJsZVxuICAgICAgICBAZm9jdXNDdXJyZW50Q3Vyc29yVGFnKClcblxuICAgICAgaWYgQGNhY2hlZFN0YXR1c1tlZGl0b3JdXG4gICAgICAgIHtAbm93VHlwZVN0YXR1cywgQG5vd1NvcnRTdGF0dXN9ID0gQGNhY2hlZFN0YXR1c1tlZGl0b3JdXG4gICAgICAgIGZvciB0eXBlLCB2aXNpYmxlIG9mIEBub3dUeXBlU3RhdHVzXG4gICAgICAgICAgQHRyZWVWaWV3LnRvZ2dsZVR5cGVWaXNpYmxlKHR5cGUpIHVubGVzcyB2aXNpYmxlXG4gICAgICAgIEB0cmVlVmlldy5zb3J0QnlOYW1lKCkgaWYgQG5vd1NvcnRTdGF0dXNbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgQGNhY2hlZFN0YXR1c1tlZGl0b3JdID0ge25vd1R5cGVTdGF0dXM6IHt9LCBub3dTb3J0U3RhdHVzOiBbZmFsc2VdfVxuICAgICAgICBAY2FjaGVkU3RhdHVzW2VkaXRvcl0ubm93VHlwZVN0YXR1c1t0eXBlXSA9IHRydWUgZm9yIHR5cGUgaW4gdHlwZXNcbiAgICAgICAgQHNvcnRCeU5hbWVTY29wZXMgPSBhdG9tLmNvbmZpZy5nZXQoJ3N5bWJvbHMtdHJlZS12aWV3LnNvcnRCeU5hbWVTY29wZXMnKVxuICAgICAgICBpZiBAc29ydEJ5TmFtZVNjb3Blcy5pbmRleE9mKEBnZXRTY29wZU5hbWUoKSkgIT0gLTFcbiAgICAgICAgICBAY2FjaGVkU3RhdHVzW2VkaXRvcl0ubm93U29ydFN0YXR1c1swXSA9IHRydWVcbiAgICAgICAgICBAdHJlZVZpZXcuc29ydEJ5TmFtZSgpXG4gICAgICAgIHtAbm93VHlwZVN0YXR1cywgQG5vd1NvcnRTdGF0dXN9ID0gQGNhY2hlZFN0YXR1c1tlZGl0b3JdXG5cbiAgICAgIEBjb250ZXh0TWVudS5hZGRNZW51KHR5cGUsIEBub3dUeXBlU3RhdHVzW3R5cGVdLCB0b2dnbGVUeXBlVmlzaWJsZSkgZm9yIHR5cGUgaW4gdHlwZXNcbiAgICAgIEBjb250ZXh0TWVudS5hZGRTZXBhcmF0b3IoKVxuICAgICAgQGNvbnRleHRNZW51LmFkZE1lbnUoJ3NvcnQgYnkgbmFtZScsIEBub3dTb3J0U3RhdHVzWzBdLCB0b2dnbGVTb3J0QnlOYW1lKVxuXG4gICAgZ2VuZXJhdGVUYWdzOiAoZmlsZVBhdGgpIC0+XG4gICAgICBuZXcgVGFnR2VuZXJhdG9yKGZpbGVQYXRoLCBAZ2V0U2NvcGVOYW1lKCkpLmdlbmVyYXRlKCkuZG9uZSAodGFncykgPT5cbiAgICAgICAgQHBhcnNlciA9IG5ldyBUYWdQYXJzZXIodGFncywgQGdldFNjb3BlTmFtZSgpKVxuICAgICAgICB7cm9vdCwgdHlwZXN9ID0gQHBhcnNlci5wYXJzZSgpXG4gICAgICAgIEB0cmVlVmlldy5zZXRSb290KHJvb3QpXG4gICAgICAgIEB1cGRhdGVDb250ZXh0TWVudSh0eXBlcylcbiAgICAgICAgQGZvY3VzQ3VycmVudEN1cnNvclRhZygpXG5cbiAgICAgICAgaWYgKEBhdXRvSGlkZVR5cGVzKVxuICAgICAgICAgIGZvciB0eXBlIGluIHR5cGVzXG4gICAgICAgICAgICBpZihAYXV0b0hpZGVUeXBlcy5pbmRleE9mKHR5cGUpICE9IC0xKVxuICAgICAgICAgICAgICBAdHJlZVZpZXcudG9nZ2xlVHlwZVZpc2libGUodHlwZSlcbiAgICAgICAgICAgICAgQGNvbnRleHRNZW51LnRvZ2dsZSh0eXBlKVxuXG5cbiAgICAjIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHJldHJpZXZlZCB3aGVuIHBhY2thZ2UgaXMgYWN0aXZhdGVkXG4gICAgc2VyaWFsaXplOiAtPlxuXG4gICAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgICBkZXN0cm95OiAtPlxuICAgICAgQGVsZW1lbnQucmVtb3ZlKClcblxuICAgIGF0dGFjaDogLT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNob3dPblJpZ2h0U2lkZScpXG4gICAgICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZExlZnRQYW5lbChpdGVtOiB0aGlzKVxuICAgICAgZWxzZVxuICAgICAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgICBAY29udGV4dE1lbnUuYXR0YWNoKClcbiAgICAgIEBjb250ZXh0TWVudS5oaWRlKClcblxuICAgIGF0dGFjaGVkOiAtPlxuICAgICAgQG9uQ2hhbmdlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAoZWRpdG9yKSA9PlxuICAgICAgICBAcmVtb3ZlRXZlbnRGb3JFZGl0b3IoKVxuICAgICAgICBAcG9wdWxhdGUoKVxuXG4gICAgICBAb25DaGFuZ2VBdXRvSGlkZSA9IGF0b20uY29uZmlnLm9ic2VydmUgJ3N5bWJvbHMtdHJlZS12aWV3LmF1dG9IaWRlJywgKGF1dG9IaWRlKSA9PlxuICAgICAgICB1bmxlc3MgYXV0b0hpZGVcbiAgICAgICAgICBAb2ZmKCdtb3VzZWVudGVyIG1vdXNlbGVhdmUnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQG1vdXNlZW50ZXIgKGV2ZW50KSA9PlxuICAgICAgICAgICAgQHN0b3AoKVxuICAgICAgICAgICAgQGFuaW1hdGUoe3dpZHRoOiBAb3JpZ2luYWxXaWR0aH0sIGR1cmF0aW9uOiBAYW5pbWF0aW9uRHVyYXRpb24pXG5cbiAgICAgICAgICBAbW91c2VsZWF2ZSAoZXZlbnQpID0+XG4gICAgICAgICAgICBAc3RvcCgpXG4gICAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5zaG93T25SaWdodFNpZGUnKVxuICAgICAgICAgICAgICBAYW5pbWF0ZSh7d2lkdGg6IEBtaW5pbWFsV2lkdGh9LCBkdXJhdGlvbjogQGFuaW1hdGlvbkR1cmF0aW9uKSBpZiBldmVudC5vZmZzZXRYID4gMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAYW5pbWF0ZSh7d2lkdGg6IEBtaW5pbWFsV2lkdGh9LCBkdXJhdGlvbjogQGFuaW1hdGlvbkR1cmF0aW9uKSBpZiBldmVudC5vZmZzZXRYIDw9IDBcblxuICAgICAgQG9uIFwiY29udGV4dG1lbnVcIiwgKGV2ZW50KSA9PlxuICAgICAgICBsZWZ0ID0gZXZlbnQucGFnZVhcbiAgICAgICAgaWYgbGVmdCArIEBjb250ZXh0TWVudS53aWR0aCgpID4gYXRvbS5nZXRTaXplKCkud2lkdGhcbiAgICAgICAgICBsZWZ0ID0gbGVmdCAtIEBjb250ZXh0TWVudS53aWR0aCgpXG4gICAgICAgIEBjb250ZXh0TWVudS5jc3Moe2xlZnQ6IGxlZnQsIHRvcDogZXZlbnQucGFnZVl9KVxuICAgICAgICBAY29udGV4dE1lbnUuc2hvdygpXG4gICAgICAgIHJldHVybiBmYWxzZSAjZGlzYWJsZSBvcmlnaW5hbCBhdG9tIGNvbnRleHQgbWVudVxuXG4gICAgcmVtb3ZlRXZlbnRGb3JFZGl0b3I6IC0+XG4gICAgICBAb25FZGl0b3JTYXZlPy5kaXNwb3NlKClcbiAgICAgIEBvbkNoYW5nZVJvdz8uZGlzcG9zZSgpXG5cbiAgICBkZXRhY2hlZDogLT5cbiAgICAgIEBvbkNoYW5nZUVkaXRvcj8uZGlzcG9zZSgpXG4gICAgICBAb25DaGFuZ2VBdXRvSGlkZT8uZGlzcG9zZSgpXG4gICAgICBAcmVtb3ZlRXZlbnRGb3JFZGl0b3IoKVxuICAgICAgQG9mZiBcImNvbnRleHRtZW51XCJcblxuICAgIHJlbW92ZTogLT5cbiAgICAgIHN1cGVyXG4gICAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgICAjIFRvZ2dsZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGlzIHZpZXdcbiAgICB0b2dnbGU6IC0+XG4gICAgICBpZiBAaGFzUGFyZW50KClcbiAgICAgICAgQHJlbW92ZSgpXG4gICAgICBlbHNlXG4gICAgICAgIEBwb3B1bGF0ZSgpXG4gICAgICAgIEBhdHRhY2goKVxuXG4gICAgIyBTaG93IHZpZXcgaWYgaGlkZGVuXG4gICAgc2hvd1ZpZXc6IC0+XG4gICAgICBpZiBub3QgQGhhc1BhcmVudCgpXG4gICAgICAgIEBwb3B1bGF0ZSgpXG4gICAgICAgIEBhdHRhY2goKVxuXG4gICAgIyBIaWRlIHZpZXcgaWYgdmlzaXNibGVcbiAgICBoaWRlVmlldzogLT5cbiAgICAgIGlmIEBoYXNQYXJlbnQoKVxuICAgICAgICBAcmVtb3ZlKClcbiJdfQ==
