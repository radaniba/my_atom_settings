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
            ref2 = editor.element.pixelRectForScreenRange(screenRange), top = ref2.top, left = ref2.left, height = ref2.height, width = ref2.width;
            bottom = top + height;
            desiredScrollCenter = top + height / 2;
            if (!((editor.element.getScrollTop() < desiredScrollCenter && desiredScrollCenter < editor.element.getScrollBottom()))) {
              desiredScrollTop = desiredScrollCenter - editor.element.getHeight() / 2;
            }
            from = {
              top: editor.element.getScrollTop()
            };
            to = {
              top: desiredScrollTop
            };
            step = function(now) {
              return editor.element.setScrollTop(now);
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
      if ((editor = this.getEditor()) && (this.parser != null)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW1ib2xzLXRyZWUtdmlldy9saWIvc3ltYm9scy10cmVlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnSEFBQTtJQUFBOzs7RUFBQSxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsT0FBb0IsT0FBQSxDQUFRLHNCQUFSLENBQXBCLEVBQUMsVUFBRCxFQUFJLG9CQUFKLEVBQVk7O0VBQ1gsV0FBWSxPQUFBLENBQVEsYUFBUjs7RUFDYixZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUjs7RUFDWixrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVI7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7Ozs7Ozs7SUFDSixlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyw4Q0FBUDtPQUFMO0lBRFE7OzhCQUdWLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJO01BQ2hCLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLFFBQVQ7TUFFQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUNoQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtDQUFoQjtNQUVqQixJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDakIsY0FBQTtVQURtQixpQkFBTTtVQUN6QixJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxJQUFxQixDQUFyQixJQUEyQixDQUFB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ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG57VHJlZVZpZXd9ID0gcmVxdWlyZSAnLi90cmVlLXZpZXcnXG5UYWdHZW5lcmF0b3IgPSByZXF1aXJlICcuL3RhZy1nZW5lcmF0b3InXG5UYWdQYXJzZXIgPSByZXF1aXJlICcuL3RhZy1wYXJzZXInXG5TeW1ib2xzQ29udGV4dE1lbnUgPSByZXF1aXJlICcuL3N5bWJvbHMtY29udGV4dC1tZW51J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNsYXNzIFN5bWJvbHNUcmVlVmlldyBleHRlbmRzIFZpZXdcbiAgICBAY29udGVudDogLT5cbiAgICAgIEBkaXYgY2xhc3M6ICdzeW1ib2xzLXRyZWUtdmlldyB0b29sLXBhbmVsIGZvY3VzYWJsZS1wYW5lbCdcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICBAdHJlZVZpZXcgPSBuZXcgVHJlZVZpZXdcbiAgICAgIEBhcHBlbmQoQHRyZWVWaWV3KVxuXG4gICAgICBAY2FjaGVkU3RhdHVzID0ge31cbiAgICAgIEBjb250ZXh0TWVudSA9IG5ldyBTeW1ib2xzQ29udGV4dE1lbnVcbiAgICAgIEBhdXRvSGlkZVR5cGVzID0gYXRvbS5jb25maWcuZ2V0KCdzeW1ib2xzLXRyZWUtdmlldy56QXV0b0hpZGVUeXBlcycpXG5cbiAgICAgIEB0cmVlVmlldy5vblNlbGVjdCAoe25vZGUsIGl0ZW19KSA9PlxuICAgICAgICBpZiBpdGVtLnBvc2l0aW9uLnJvdyA+PSAwIGFuZCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgICBzY3JlZW5Qb3NpdGlvbiA9IGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGl0ZW0ucG9zaXRpb24pXG4gICAgICAgICAgc2NyZWVuUmFuZ2UgPSBuZXcgUmFuZ2Uoc2NyZWVuUG9zaXRpb24sIHNjcmVlblBvc2l0aW9uKVxuICAgICAgICAgIHt0b3AsIGxlZnQsIGhlaWdodCwgd2lkdGh9ID0gZWRpdG9yLmVsZW1lbnQucGl4ZWxSZWN0Rm9yU2NyZWVuUmFuZ2Uoc2NyZWVuUmFuZ2UpXG4gICAgICAgICAgYm90dG9tID0gdG9wICsgaGVpZ2h0XG4gICAgICAgICAgZGVzaXJlZFNjcm9sbENlbnRlciA9IHRvcCArIGhlaWdodCAvIDJcbiAgICAgICAgICB1bmxlc3MgZWRpdG9yLmVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgPCBkZXNpcmVkU2Nyb2xsQ2VudGVyIDwgZWRpdG9yLmVsZW1lbnQuZ2V0U2Nyb2xsQm90dG9tKClcbiAgICAgICAgICAgIGRlc2lyZWRTY3JvbGxUb3AgPSAgZGVzaXJlZFNjcm9sbENlbnRlciAtIGVkaXRvci5lbGVtZW50LmdldEhlaWdodCgpIC8gMlxuXG4gICAgICAgICAgZnJvbSA9IHt0b3A6IGVkaXRvci5lbGVtZW50LmdldFNjcm9sbFRvcCgpfVxuICAgICAgICAgIHRvID0ge3RvcDogZGVzaXJlZFNjcm9sbFRvcH1cblxuICAgICAgICAgIHN0ZXAgPSAobm93KSAtPlxuICAgICAgICAgICAgZWRpdG9yLmVsZW1lbnQuc2V0U2Nyb2xsVG9wKG5vdylcblxuICAgICAgICAgIGRvbmUgPSAtPlxuICAgICAgICAgICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oaXRlbS5wb3NpdGlvbiwgY2VudGVyOiB0cnVlKVxuICAgICAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGl0ZW0ucG9zaXRpb24pXG4gICAgICAgICAgICBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG4gICAgICAgICAgalF1ZXJ5KGZyb20pLmFuaW1hdGUodG8sIGR1cmF0aW9uOiBAYW5pbWF0aW9uRHVyYXRpb24sIHN0ZXA6IHN0ZXAsIGRvbmU6IGRvbmUpXG5cbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUgJ3N5bWJvbHMtdHJlZS12aWV3LnNjcm9sbEFuaW1hdGlvbicsIChlbmFibGVkKSA9PlxuICAgICAgICBAYW5pbWF0aW9uRHVyYXRpb24gPSBpZiBlbmFibGVkIHRoZW4gMzAwIGVsc2UgMFxuXG4gICAgICBAbWluaW1hbFdpZHRoID0gNVxuICAgICAgQG9yaWdpbmFsV2lkdGggPSBhdG9tLmNvbmZpZy5nZXQoJ3N5bWJvbHMtdHJlZS12aWV3LmRlZmF1bHRXaWR0aCcpXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdzeW1ib2xzLXRyZWUtdmlldy5hdXRvSGlkZScsIChhdXRvSGlkZSkgPT5cbiAgICAgICAgdW5sZXNzIGF1dG9IaWRlXG4gICAgICAgICAgQHdpZHRoKEBvcmlnaW5hbFdpZHRoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHdpZHRoKEBtaW5pbWFsV2lkdGgpXG5cbiAgICBnZXRFZGl0b3I6IC0+IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGdldFNjb3BlTmFtZTogLT4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRHcmFtbWFyKCk/LnNjb3BlTmFtZVxuXG4gICAgcG9wdWxhdGU6IC0+XG4gICAgICB1bmxlc3MgZWRpdG9yID0gQGdldEVkaXRvcigpXG4gICAgICAgIEBoaWRlKClcbiAgICAgIGVsc2VcbiAgICAgICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIEBnZW5lcmF0ZVRhZ3MoZmlsZVBhdGgpXG4gICAgICAgIEBzaG93KClcblxuICAgICAgICBAb25FZGl0b3JTYXZlID0gZWRpdG9yLm9uRGlkU2F2ZSAoc3RhdGUpID0+XG4gICAgICAgICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgQGdlbmVyYXRlVGFncyhmaWxlUGF0aClcblxuICAgICAgICBAb25DaGFuZ2VSb3cgPSBlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbiAoe29sZEJ1ZmZlclBvc2l0aW9uLCBuZXdCdWZmZXJQb3NpdGlvbn0pID0+XG4gICAgICAgICAgaWYgb2xkQnVmZmVyUG9zaXRpb24ucm93ICE9IG5ld0J1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgICAgICAgQGZvY3VzQ3VycmVudEN1cnNvclRhZygpXG5cbiAgICBmb2N1c0N1cnJlbnRDdXJzb3JUYWc6IC0+XG4gICAgICBpZiAoZWRpdG9yID0gQGdldEVkaXRvcigpKSBhbmQgQHBhcnNlcj9cbiAgICAgICAgcm93ID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgICAgIHRhZyA9IEBwYXJzZXIuZ2V0TmVhcmVzdFRhZyhyb3cpXG4gICAgICAgIEB0cmVlVmlldy5zZWxlY3QodGFnKVxuXG4gICAgZm9jdXNDbGlja2VkVGFnOiAoZWRpdG9yLCB0ZXh0KSAtPlxuICAgICAgY29uc29sZS5sb2cgXCJjbGlja2VkOiAje3RleHR9XCJcbiAgICAgIGlmIGVkaXRvciA9IEBnZXRFZGl0b3IoKVxuICAgICAgICB0YWcgPSAgKHQgZm9yIHQgaW4gQHBhcnNlci50YWdzIHdoZW4gdC5uYW1lIGlzIHRleHQpWzBdXG4gICAgICAgIEB0cmVlVmlldy5zZWxlY3QodGFnKVxuICAgICAgICAjIGltaG8sIGl0cyBhIGJhZCBpZGVhID0oXG4gICAgICAgIGpRdWVyeSgnLmxpc3QtaXRlbS5saXN0LXNlbGVjdGFibGUtaXRlbS5zZWxlY3RlZCcpLmNsaWNrKClcblxuICAgIHVwZGF0ZUNvbnRleHRNZW51OiAodHlwZXMpIC0+XG4gICAgICBAY29udGV4dE1lbnUuY2xlYXIoKVxuICAgICAgZWRpdG9yID0gQGdldEVkaXRvcigpPy5pZFxuXG4gICAgICB0b2dnbGVUeXBlVmlzaWJsZSA9ICh0eXBlKSA9PlxuICAgICAgICBAdHJlZVZpZXcudG9nZ2xlVHlwZVZpc2libGUodHlwZSlcbiAgICAgICAgQG5vd1R5cGVTdGF0dXNbdHlwZV0gPSAhQG5vd1R5cGVTdGF0dXNbdHlwZV1cblxuICAgICAgdG9nZ2xlU29ydEJ5TmFtZSA9ID0+XG4gICAgICAgIEBub3dTb3J0U3RhdHVzWzBdID0gIUBub3dTb3J0U3RhdHVzWzBdXG4gICAgICAgIGlmIEBub3dTb3J0U3RhdHVzWzBdXG4gICAgICAgICAgQHRyZWVWaWV3LnNvcnRCeU5hbWUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRyZWVWaWV3LnNvcnRCeVJvdygpXG4gICAgICAgIGZvciB0eXBlLCB2aXNpYmxlIG9mIEBub3dUeXBlU3RhdHVzXG4gICAgICAgICAgQHRyZWVWaWV3LnRvZ2dsZVR5cGVWaXNpYmxlKHR5cGUpIHVubGVzcyB2aXNpYmxlXG4gICAgICAgIEBmb2N1c0N1cnJlbnRDdXJzb3JUYWcoKVxuXG4gICAgICBpZiBAY2FjaGVkU3RhdHVzW2VkaXRvcl1cbiAgICAgICAge0Bub3dUeXBlU3RhdHVzLCBAbm93U29ydFN0YXR1c30gPSBAY2FjaGVkU3RhdHVzW2VkaXRvcl1cbiAgICAgICAgZm9yIHR5cGUsIHZpc2libGUgb2YgQG5vd1R5cGVTdGF0dXNcbiAgICAgICAgICBAdHJlZVZpZXcudG9nZ2xlVHlwZVZpc2libGUodHlwZSkgdW5sZXNzIHZpc2libGVcbiAgICAgICAgQHRyZWVWaWV3LnNvcnRCeU5hbWUoKSBpZiBAbm93U29ydFN0YXR1c1swXVxuICAgICAgZWxzZVxuICAgICAgICBAY2FjaGVkU3RhdHVzW2VkaXRvcl0gPSB7bm93VHlwZVN0YXR1czoge30sIG5vd1NvcnRTdGF0dXM6IFtmYWxzZV19XG4gICAgICAgIEBjYWNoZWRTdGF0dXNbZWRpdG9yXS5ub3dUeXBlU3RhdHVzW3R5cGVdID0gdHJ1ZSBmb3IgdHlwZSBpbiB0eXBlc1xuICAgICAgICBAc29ydEJ5TmFtZVNjb3BlcyA9IGF0b20uY29uZmlnLmdldCgnc3ltYm9scy10cmVlLXZpZXcuc29ydEJ5TmFtZVNjb3BlcycpXG4gICAgICAgIGlmIEBzb3J0QnlOYW1lU2NvcGVzLmluZGV4T2YoQGdldFNjb3BlTmFtZSgpKSAhPSAtMVxuICAgICAgICAgIEBjYWNoZWRTdGF0dXNbZWRpdG9yXS5ub3dTb3J0U3RhdHVzWzBdID0gdHJ1ZVxuICAgICAgICAgIEB0cmVlVmlldy5zb3J0QnlOYW1lKClcbiAgICAgICAge0Bub3dUeXBlU3RhdHVzLCBAbm93U29ydFN0YXR1c30gPSBAY2FjaGVkU3RhdHVzW2VkaXRvcl1cblxuICAgICAgQGNvbnRleHRNZW51LmFkZE1lbnUodHlwZSwgQG5vd1R5cGVTdGF0dXNbdHlwZV0sIHRvZ2dsZVR5cGVWaXNpYmxlKSBmb3IgdHlwZSBpbiB0eXBlc1xuICAgICAgQGNvbnRleHRNZW51LmFkZFNlcGFyYXRvcigpXG4gICAgICBAY29udGV4dE1lbnUuYWRkTWVudSgnc29ydCBieSBuYW1lJywgQG5vd1NvcnRTdGF0dXNbMF0sIHRvZ2dsZVNvcnRCeU5hbWUpXG5cbiAgICBnZW5lcmF0ZVRhZ3M6IChmaWxlUGF0aCkgLT5cbiAgICAgIG5ldyBUYWdHZW5lcmF0b3IoZmlsZVBhdGgsIEBnZXRTY29wZU5hbWUoKSkuZ2VuZXJhdGUoKS5kb25lICh0YWdzKSA9PlxuICAgICAgICBAcGFyc2VyID0gbmV3IFRhZ1BhcnNlcih0YWdzLCBAZ2V0U2NvcGVOYW1lKCkpXG4gICAgICAgIHtyb290LCB0eXBlc30gPSBAcGFyc2VyLnBhcnNlKClcbiAgICAgICAgQHRyZWVWaWV3LnNldFJvb3Qocm9vdClcbiAgICAgICAgQHVwZGF0ZUNvbnRleHRNZW51KHR5cGVzKVxuICAgICAgICBAZm9jdXNDdXJyZW50Q3Vyc29yVGFnKClcblxuICAgICAgICBpZiAoQGF1dG9IaWRlVHlwZXMpXG4gICAgICAgICAgZm9yIHR5cGUgaW4gdHlwZXNcbiAgICAgICAgICAgIGlmKEBhdXRvSGlkZVR5cGVzLmluZGV4T2YodHlwZSkgIT0gLTEpXG4gICAgICAgICAgICAgIEB0cmVlVmlldy50b2dnbGVUeXBlVmlzaWJsZSh0eXBlKVxuICAgICAgICAgICAgICBAY29udGV4dE1lbnUudG9nZ2xlKHR5cGUpXG5cblxuICAgICMgUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgcmV0cmlldmVkIHdoZW4gcGFja2FnZSBpcyBhY3RpdmF0ZWRcbiAgICBzZXJpYWxpemU6IC0+XG5cbiAgICAjIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICAgIGRlc3Ryb3k6IC0+XG4gICAgICBAZWxlbWVudC5yZW1vdmUoKVxuXG4gICAgYXR0YWNoOiAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCd0cmVlLXZpZXcuc2hvd09uUmlnaHRTaWRlJylcbiAgICAgICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgICBlbHNlXG4gICAgICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoaXRlbTogdGhpcylcbiAgICAgIEBjb250ZXh0TWVudS5hdHRhY2goKVxuICAgICAgQGNvbnRleHRNZW51LmhpZGUoKVxuXG4gICAgYXR0YWNoZWQ6IC0+XG4gICAgICBAb25DaGFuZ2VFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChlZGl0b3IpID0+XG4gICAgICAgIEByZW1vdmVFdmVudEZvckVkaXRvcigpXG4gICAgICAgIEBwb3B1bGF0ZSgpXG5cbiAgICAgIEBvbkNoYW5nZUF1dG9IaWRlID0gYXRvbS5jb25maWcub2JzZXJ2ZSAnc3ltYm9scy10cmVlLXZpZXcuYXV0b0hpZGUnLCAoYXV0b0hpZGUpID0+XG4gICAgICAgIHVubGVzcyBhdXRvSGlkZVxuICAgICAgICAgIEBvZmYoJ21vdXNlZW50ZXIgbW91c2VsZWF2ZScpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAbW91c2VlbnRlciAoZXZlbnQpID0+XG4gICAgICAgICAgICBAc3RvcCgpXG4gICAgICAgICAgICBAYW5pbWF0ZSh7d2lkdGg6IEBvcmlnaW5hbFdpZHRofSwgZHVyYXRpb246IEBhbmltYXRpb25EdXJhdGlvbilcblxuICAgICAgICAgIEBtb3VzZWxlYXZlIChldmVudCkgPT5cbiAgICAgICAgICAgIEBzdG9wKClcbiAgICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNob3dPblJpZ2h0U2lkZScpXG4gICAgICAgICAgICAgIEBhbmltYXRlKHt3aWR0aDogQG1pbmltYWxXaWR0aH0sIGR1cmF0aW9uOiBAYW5pbWF0aW9uRHVyYXRpb24pIGlmIGV2ZW50Lm9mZnNldFggPiAwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEBhbmltYXRlKHt3aWR0aDogQG1pbmltYWxXaWR0aH0sIGR1cmF0aW9uOiBAYW5pbWF0aW9uRHVyYXRpb24pIGlmIGV2ZW50Lm9mZnNldFggPD0gMFxuXG4gICAgICBAb24gXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+XG4gICAgICAgIGxlZnQgPSBldmVudC5wYWdlWFxuICAgICAgICBpZiBsZWZ0ICsgQGNvbnRleHRNZW51LndpZHRoKCkgPiBhdG9tLmdldFNpemUoKS53aWR0aFxuICAgICAgICAgIGxlZnQgPSBsZWZ0IC0gQGNvbnRleHRNZW51LndpZHRoKClcbiAgICAgICAgQGNvbnRleHRNZW51LmNzcyh7bGVmdDogbGVmdCwgdG9wOiBldmVudC5wYWdlWX0pXG4gICAgICAgIEBjb250ZXh0TWVudS5zaG93KClcbiAgICAgICAgcmV0dXJuIGZhbHNlICNkaXNhYmxlIG9yaWdpbmFsIGF0b20gY29udGV4dCBtZW51XG5cbiAgICByZW1vdmVFdmVudEZvckVkaXRvcjogLT5cbiAgICAgIEBvbkVkaXRvclNhdmU/LmRpc3Bvc2UoKVxuICAgICAgQG9uQ2hhbmdlUm93Py5kaXNwb3NlKClcblxuICAgIGRldGFjaGVkOiAtPlxuICAgICAgQG9uQ2hhbmdlRWRpdG9yPy5kaXNwb3NlKClcbiAgICAgIEBvbkNoYW5nZUF1dG9IaWRlPy5kaXNwb3NlKClcbiAgICAgIEByZW1vdmVFdmVudEZvckVkaXRvcigpXG4gICAgICBAb2ZmIFwiY29udGV4dG1lbnVcIlxuXG4gICAgcmVtb3ZlOiAtPlxuICAgICAgc3VwZXJcbiAgICAgIEBwYW5lbC5kZXN0cm95KClcblxuICAgICMgVG9nZ2xlIHRoZSB2aXNpYmlsaXR5IG9mIHRoaXMgdmlld1xuICAgIHRvZ2dsZTogLT5cbiAgICAgIGlmIEBoYXNQYXJlbnQoKVxuICAgICAgICBAcmVtb3ZlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHBvcHVsYXRlKClcbiAgICAgICAgQGF0dGFjaCgpXG5cbiAgICAjIFNob3cgdmlldyBpZiBoaWRkZW5cbiAgICBzaG93VmlldzogLT5cbiAgICAgIGlmIG5vdCBAaGFzUGFyZW50KClcbiAgICAgICAgQHBvcHVsYXRlKClcbiAgICAgICAgQGF0dGFjaCgpXG5cbiAgICAjIEhpZGUgdmlldyBpZiB2aXNpc2JsZVxuICAgIGhpZGVWaWV3OiAtPlxuICAgICAgaWYgQGhhc1BhcmVudCgpXG4gICAgICAgIEByZW1vdmUoKVxuIl19
