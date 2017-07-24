(function() {
  var $, $$, Emitter, ScrollView, TreeNode, TreeView, View, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, View = ref.View, ScrollView = ref.ScrollView;

  Emitter = require('event-kit').Emitter;

  module.exports = {
    TreeNode: TreeNode = (function(superClass) {
      extend(TreeNode, superClass);

      function TreeNode() {
        this.dblClickItem = bind(this.dblClickItem, this);
        this.clickItem = bind(this.clickItem, this);
        return TreeNode.__super__.constructor.apply(this, arguments);
      }

      TreeNode.content = function(arg) {
        var children, icon, label;
        label = arg.label, icon = arg.icon, children = arg.children;
        if (children) {
          return this.li({
            "class": 'list-nested-item list-selectable-item'
          }, (function(_this) {
            return function() {
              _this.div({
                "class": 'list-item'
              }, function() {
                return _this.span({
                  "class": "icon " + icon
                }, label);
              });
              return _this.ul({
                "class": 'list-tree'
              }, function() {
                var child, i, len, results;
                results = [];
                for (i = 0, len = children.length; i < len; i++) {
                  child = children[i];
                  results.push(_this.subview('child', new TreeNode(child)));
                }
                return results;
              });
            };
          })(this));
        } else {
          return this.li({
            "class": 'list-item list-selectable-item'
          }, (function(_this) {
            return function() {
              return _this.span({
                "class": "icon " + icon
              }, label);
            };
          })(this));
        }
      };

      TreeNode.prototype.initialize = function(item) {
        this.emitter = new Emitter;
        this.item = item;
        this.item.view = this;
        this.on('dblclick', this.dblClickItem);
        return this.on('click', this.clickItem);
      };

      TreeNode.prototype.setCollapsed = function() {
        if (this.item.children) {
          return this.toggleClass('collapsed');
        }
      };

      TreeNode.prototype.setSelected = function() {
        return this.addClass('selected');
      };

      TreeNode.prototype.onDblClick = function(callback) {
        var child, i, len, ref1, results;
        this.emitter.on('on-dbl-click', callback);
        if (this.item.children) {
          ref1 = this.item.children;
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            child = ref1[i];
            results.push(child.view.onDblClick(callback));
          }
          return results;
        }
      };

      TreeNode.prototype.onSelect = function(callback) {
        var child, i, len, ref1, results;
        this.emitter.on('on-select', callback);
        if (this.item.children) {
          ref1 = this.item.children;
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            child = ref1[i];
            results.push(child.view.onSelect(callback));
          }
          return results;
        }
      };

      TreeNode.prototype.clickItem = function(event) {
        var $target, left, right, selected, width;
        if (this.item.children) {
          selected = this.hasClass('selected');
          this.removeClass('selected');
          $target = this.find('.list-item:first');
          left = $target.position().left;
          right = $target.children('span').position().left;
          width = right - left;
          if (event.offsetX <= width) {
            this.toggleClass('collapsed');
          }
          if (selected) {
            this.addClass('selected');
          }
          if (event.offsetX <= width) {
            return false;
          }
        }
        this.emitter.emit('on-select', {
          node: this,
          item: this.item
        });
        return false;
      };

      TreeNode.prototype.dblClickItem = function(event) {
        this.emitter.emit('on-dbl-click', {
          node: this,
          item: this.item
        });
        return false;
      };

      return TreeNode;

    })(View),
    TreeView: TreeView = (function(superClass) {
      extend(TreeView, superClass);

      function TreeView() {
        this.sortByRow = bind(this.sortByRow, this);
        this.sortByName = bind(this.sortByName, this);
        this.toggleTypeVisible = bind(this.toggleTypeVisible, this);
        this.traversal = bind(this.traversal, this);
        this.onSelect = bind(this.onSelect, this);
        return TreeView.__super__.constructor.apply(this, arguments);
      }

      TreeView.content = function() {
        return this.div({
          "class": '-tree-view-'
        }, (function(_this) {
          return function() {
            return _this.ul({
              "class": 'list-tree has-collapsable-children',
              outlet: 'root'
            });
          };
        })(this));
      };

      TreeView.prototype.initialize = function() {
        TreeView.__super__.initialize.apply(this, arguments);
        return this.emitter = new Emitter;
      };

      TreeView.prototype.deactivate = function() {
        return this.remove();
      };

      TreeView.prototype.onSelect = function(callback) {
        return this.emitter.on('on-select', callback);
      };

      TreeView.prototype.setRoot = function(root, ignoreRoot) {
        if (ignoreRoot == null) {
          ignoreRoot = true;
        }
        this.rootNode = new TreeNode(root);
        this.rootNode.onDblClick((function(_this) {
          return function(arg) {
            var item, node;
            node = arg.node, item = arg.item;
            return node.setCollapsed();
          };
        })(this));
        this.rootNode.onSelect((function(_this) {
          return function(arg) {
            var item, node;
            node = arg.node, item = arg.item;
            _this.clearSelect();
            node.setSelected();
            return _this.emitter.emit('on-select', {
              node: node,
              item: item
            });
          };
        })(this));
        this.root.empty();
        return this.root.append($$(function() {
          return this.div((function(_this) {
            return function() {
              var child, i, len, ref1, results;
              if (ignoreRoot) {
                ref1 = root.children;
                results = [];
                for (i = 0, len = ref1.length; i < len; i++) {
                  child = ref1[i];
                  results.push(_this.subview('child', child.view));
                }
                return results;
              } else {
                return _this.subview('root', root.view);
              }
            };
          })(this));
        }));
      };

      TreeView.prototype.traversal = function(root, doing) {
        var child, i, len, ref1, results;
        doing(root.item);
        if (root.item.children) {
          ref1 = root.item.children;
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            child = ref1[i];
            results.push(this.traversal(child.view, doing));
          }
          return results;
        }
      };

      TreeView.prototype.toggleTypeVisible = function(type) {
        return this.traversal(this.rootNode, (function(_this) {
          return function(item) {
            if (item.type === type) {
              return item.view.toggle();
            }
          };
        })(this));
      };

      TreeView.prototype.sortByName = function(ascending) {
        if (ascending == null) {
          ascending = true;
        }
        this.traversal(this.rootNode, (function(_this) {
          return function(item) {
            var ref1;
            return (ref1 = item.children) != null ? ref1.sort(function(a, b) {
              if (ascending) {
                return a.name.localeCompare(b.name);
              } else {
                return b.name.localeCompare(a.name);
              }
            }) : void 0;
          };
        })(this));
        return this.setRoot(this.rootNode.item);
      };

      TreeView.prototype.sortByRow = function(ascending) {
        if (ascending == null) {
          ascending = true;
        }
        this.traversal(this.rootNode, (function(_this) {
          return function(item) {
            var ref1;
            return (ref1 = item.children) != null ? ref1.sort(function(a, b) {
              if (ascending) {
                return a.position.row - b.position.row;
              } else {
                return b.position.row - a.position.row;
              }
            }) : void 0;
          };
        })(this));
        return this.setRoot(this.rootNode.item);
      };

      TreeView.prototype.clearSelect = function() {
        return $('.list-selectable-item').removeClass('selected');
      };

      TreeView.prototype.select = function(item) {
        this.clearSelect();
        return item != null ? item.view.setSelected() : void 0;
      };

      return TreeView;

    })(ScrollView)
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW1ib2xzLXRyZWUtdmlldy9saWIvdHJlZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseURBQUE7SUFBQTs7OztFQUFBLE1BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUQsRUFBSSxXQUFKLEVBQVEsZUFBUixFQUFjOztFQUNiLFVBQVcsT0FBQSxDQUFRLFdBQVI7O0VBRVosTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBZ0I7Ozs7Ozs7OztNQUNkLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxHQUFEO0FBQ1IsWUFBQTtRQURVLG1CQUFPLGlCQUFNO1FBQ3ZCLElBQUcsUUFBSDtpQkFDRSxJQUFDLENBQUEsRUFBRCxDQUFJO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx1Q0FBUDtXQUFKLEVBQW9ELENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7Y0FDbEQsS0FBQyxDQUFBLEdBQUQsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7ZUFBTCxFQUF5QixTQUFBO3VCQUN2QixLQUFDLENBQUEsSUFBRCxDQUFNO2tCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBQSxHQUFRLElBQWY7aUJBQU4sRUFBNkIsS0FBN0I7Y0FEdUIsQ0FBekI7cUJBRUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7ZUFBSixFQUF3QixTQUFBO0FBQ3RCLG9CQUFBO0FBQUE7cUJBQUEsMENBQUE7OytCQUNFLEtBQUMsQ0FBQSxPQUFELENBQVMsT0FBVCxFQUFzQixJQUFBLFFBQUEsQ0FBUyxLQUFULENBQXRCO0FBREY7O2NBRHNCLENBQXhCO1lBSGtEO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwRCxFQURGO1NBQUEsTUFBQTtpQkFRRSxJ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QSxHQUFhLFNBQUE7ZUFDWCxDQUFBLENBQUUsdUJBQUYsQ0FBMEIsQ0FBQyxXQUEzQixDQUF1QyxVQUF2QztNQURXOzt5QkFHYixNQUFBLEdBQVEsU0FBQyxJQUFEO1FBQ04sSUFBQyxDQUFBLFdBQUQsQ0FBQTs4QkFDQSxJQUFJLENBQUUsSUFBSSxDQUFDLFdBQVgsQ0FBQTtNQUZNOzs7O09BbEV1QixXQTNEakM7O0FBSkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCwgJCQsIFZpZXcsIFNjcm9sbFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG57RW1pdHRlcn0gPSByZXF1aXJlICdldmVudC1raXQnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgVHJlZU5vZGU6IGNsYXNzIFRyZWVOb2RlIGV4dGVuZHMgVmlld1xuICAgIEBjb250ZW50OiAoe2xhYmVsLCBpY29uLCBjaGlsZHJlbn0pIC0+XG4gICAgICBpZiBjaGlsZHJlblxuICAgICAgICBAbGkgY2xhc3M6ICdsaXN0LW5lc3RlZC1pdGVtIGxpc3Qtc2VsZWN0YWJsZS1pdGVtJywgPT5cbiAgICAgICAgICBAZGl2IGNsYXNzOiAnbGlzdC1pdGVtJywgPT5cbiAgICAgICAgICAgIEBzcGFuIGNsYXNzOiBcImljb24gI3tpY29ufVwiLCBsYWJlbFxuICAgICAgICAgIEB1bCBjbGFzczogJ2xpc3QtdHJlZScsID0+XG4gICAgICAgICAgICBmb3IgY2hpbGQgaW4gY2hpbGRyZW5cbiAgICAgICAgICAgICAgQHN1YnZpZXcgJ2NoaWxkJywgbmV3IFRyZWVOb2RlKGNoaWxkKVxuICAgICAgZWxzZVxuICAgICAgICBAbGkgY2xhc3M6ICdsaXN0LWl0ZW0gbGlzdC1zZWxlY3RhYmxlLWl0ZW0nLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiBcImljb24gI3tpY29ufVwiLCBsYWJlbFxuXG4gICAgaW5pdGlhbGl6ZTogKGl0ZW0pIC0+XG4gICAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgICBAaXRlbSA9IGl0ZW1cbiAgICAgIEBpdGVtLnZpZXcgPSB0aGlzXG5cbiAgICAgIEBvbiAnZGJsY2xpY2snLCBAZGJsQ2xpY2tJdGVtXG4gICAgICBAb24gJ2NsaWNrJywgQGNsaWNrSXRlbVxuXG4gICAgc2V0Q29sbGFwc2VkOiAtPlxuICAgICAgQHRvZ2dsZUNsYXNzKCdjb2xsYXBzZWQnKSBpZiBAaXRlbS5jaGlsZHJlblxuXG4gICAgc2V0U2VsZWN0ZWQ6IC0+XG4gICAgICBAYWRkQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgIG9uRGJsQ2xpY2s6IChjYWxsYmFjaykgLT5cbiAgICAgIEBlbWl0dGVyLm9uICdvbi1kYmwtY2xpY2snLCBjYWxsYmFja1xuICAgICAgaWYgQGl0ZW0uY2hpbGRyZW5cbiAgICAgICAgZm9yIGNoaWxkIGluIEBpdGVtLmNoaWxkcmVuXG4gICAgICAgICAgY2hpbGQudmlldy5vbkRibENsaWNrIGNhbGxiYWNrXG5cbiAgICBvblNlbGVjdDogKGNhbGxiYWNrKSAtPlxuICAgICAgQGVtaXR0ZXIub24gJ29uLXNlbGVjdCcsIGNhbGxiYWNrXG4gICAgICBpZiBAaXRlbS5jaGlsZHJlblxuICAgICAgICBmb3IgY2hpbGQgaW4gQGl0ZW0uY2hpbGRyZW5cbiAgICAgICAgICBjaGlsZC52aWV3Lm9uU2VsZWN0IGNhbGxiYWNrXG5cbiAgICBjbGlja0l0ZW06IChldmVudCkgPT5cbiAgICAgIGlmIEBpdGVtLmNoaWxkcmVuXG4gICAgICAgIHNlbGVjdGVkID0gQGhhc0NsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgIEByZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAkdGFyZ2V0ID0gQGZpbmQoJy5saXN0LWl0ZW06Zmlyc3QnKVxuICAgICAgICBsZWZ0ID0gJHRhcmdldC5wb3NpdGlvbigpLmxlZnRcbiAgICAgICAgcmlnaHQgPSAkdGFyZ2V0LmNoaWxkcmVuKCdzcGFuJykucG9zaXRpb24oKS5sZWZ0XG4gICAgICAgIHdpZHRoID0gcmlnaHQgLSBsZWZ0XG4gICAgICAgIEB0b2dnbGVDbGFzcygnY29sbGFwc2VkJykgaWYgZXZlbnQub2Zmc2V0WCA8PSB3aWR0aFxuICAgICAgICBAYWRkQ2xhc3MoJ3NlbGVjdGVkJykgaWYgc2VsZWN0ZWRcbiAgICAgICAgcmV0dXJuIGZhbHNlIGlmIGV2ZW50Lm9mZnNldFggPD0gd2lkdGhcblxuICAgICAgQGVtaXR0ZXIuZW1pdCAnb24tc2VsZWN0Jywge25vZGU6IHRoaXMsIGl0ZW06IEBpdGVtfVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBkYmxDbGlja0l0ZW06IChldmVudCkgPT5cbiAgICAgIEBlbWl0dGVyLmVtaXQgJ29uLWRibC1jbGljaycsIHtub2RlOiB0aGlzLCBpdGVtOiBAaXRlbX1cbiAgICAgIHJldHVybiBmYWxzZVxuXG5cbiAgVHJlZVZpZXc6IGNsYXNzIFRyZWVWaWV3IGV4dGVuZHMgU2Nyb2xsVmlld1xuICAgIEBjb250ZW50OiAtPlxuICAgICAgQGRpdiBjbGFzczogJy10cmVlLXZpZXctJywgPT5cbiAgICAgICAgQHVsIGNsYXNzOiAnbGlzdC10cmVlIGhhcy1jb2xsYXBzYWJsZS1jaGlsZHJlbicsIG91dGxldDogJ3Jvb3QnXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgc3VwZXJcbiAgICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIGRlYWN0aXZhdGU6IC0+XG4gICAgICBAcmVtb3ZlKClcblxuICAgIG9uU2VsZWN0OiAoY2FsbGJhY2spID0+XG4gICAgICBAZW1pdHRlci5vbiAnb24tc2VsZWN0JywgY2FsbGJhY2tcblxuICAgIHNldFJvb3Q6IChyb290LCBpZ25vcmVSb290PXRydWUpIC0+XG4gICAgICBAcm9vdE5vZGUgPSBuZXcgVHJlZU5vZGUocm9vdClcblxuICAgICAgQHJvb3ROb2RlLm9uRGJsQ2xpY2sgKHtub2RlLCBpdGVtfSkgPT5cbiAgICAgICAgbm9kZS5zZXRDb2xsYXBzZWQoKVxuICAgICAgQHJvb3ROb2RlLm9uU2VsZWN0ICh7bm9kZSwgaXRlbX0pID0+XG4gICAgICAgIEBjbGVhclNlbGVjdCgpXG4gICAgICAgIG5vZGUuc2V0U2VsZWN0ZWQoKVxuICAgICAgICBAZW1pdHRlci5lbWl0ICdvbi1zZWxlY3QnLCB7bm9kZSwgaXRlbX1cblxuICAgICAgQHJvb3QuZW1wdHkoKVxuICAgICAgQHJvb3QuYXBwZW5kICQkIC0+XG4gICAgICAgIEBkaXYgPT5cbiAgICAgICAgICBpZiBpZ25vcmVSb290XG4gICAgICAgICAgICBmb3IgY2hpbGQgaW4gcm9vdC5jaGlsZHJlblxuICAgICAgICAgICAgICBAc3VidmlldyAnY2hpbGQnLCBjaGlsZC52aWV3XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHN1YnZpZXcgJ3Jvb3QnLCByb290LnZpZXdcblxuICAgIHRyYXZlcnNhbDogKHJvb3QsIGRvaW5nKSA9PlxuICAgICAgZG9pbmcocm9vdC5pdGVtKVxuICAgICAgaWYgcm9vdC5pdGVtLmNoaWxkcmVuXG4gICAgICAgIGZvciBjaGlsZCBpbiByb290Lml0ZW0uY2hpbGRyZW5cbiAgICAgICAgICBAdHJhdmVyc2FsKGNoaWxkLnZpZXcsIGRvaW5nKVxuXG4gICAgdG9nZ2xlVHlwZVZpc2libGU6ICh0eXBlKSA9PlxuICAgICAgQHRyYXZlcnNhbCBAcm9vdE5vZGUsIChpdGVtKSA9PlxuICAgICAgICBpZiBpdGVtLnR5cGUgPT0gdHlwZVxuICAgICAgICAgIGl0ZW0udmlldy50b2dnbGUoKVxuXG4gICAgc29ydEJ5TmFtZTogKGFzY2VuZGluZz10cnVlKSA9PlxuICAgICAgQHRyYXZlcnNhbCBAcm9vdE5vZGUsIChpdGVtKSA9PlxuICAgICAgICBpdGVtLmNoaWxkcmVuPy5zb3J0IChhLCBiKSA9PlxuICAgICAgICAgIGlmIGFzY2VuZGluZ1xuICAgICAgICAgICAgcmV0dXJuIGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gYi5uYW1lLmxvY2FsZUNvbXBhcmUoYS5uYW1lKVxuICAgICAgQHNldFJvb3QoQHJvb3ROb2RlLml0ZW0pXG5cbiAgICBzb3J0QnlSb3c6IChhc2NlbmRpbmc9dHJ1ZSkgPT5cbiAgICAgIEB0cmF2ZXJzYWwgQHJvb3ROb2RlLCAoaXRlbSkgPT5cbiAgICAgICAgaXRlbS5jaGlsZHJlbj8uc29ydCAoYSwgYikgPT5cbiAgICAgICAgICBpZiBhc2NlbmRpbmdcbiAgICAgICAgICAgIHJldHVybiBhLnBvc2l0aW9uLnJvdyAtIGIucG9zaXRpb24ucm93XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGIucG9zaXRpb24ucm93IC0gYS5wb3NpdGlvbi5yb3dcbiAgICAgIEBzZXRSb290KEByb290Tm9kZS5pdGVtKVxuXG4gICAgY2xlYXJTZWxlY3Q6IC0+XG4gICAgICAkKCcubGlzdC1zZWxlY3RhYmxlLWl0ZW0nKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuXG4gICAgc2VsZWN0OiAoaXRlbSkgLT5cbiAgICAgIEBjbGVhclNlbGVjdCgpXG4gICAgICBpdGVtPy52aWV3LnNldFNlbGVjdGVkKClcbiJdfQ==
