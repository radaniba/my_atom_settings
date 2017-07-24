(function() {
  var $, FileItem, FileView, View, git, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  git = require('../git');

  FileItem = (function(superClass) {
    extend(FileItem, superClass);

    function FileItem() {
      return FileItem.__super__.constructor.apply(this, arguments);
    }

    FileItem.content = function(file) {
      console.log('file', file);
      return this.div({
        "class": "file " + file.type,
        'data-name': file.name
      }, (function(_this) {
        return function() {
          _this.span({
            "class": 'clickable text',
            click: 'select',
            title: file.name
          }, file.name);
          _this.i({
            "class": 'icon check clickable',
            click: 'select'
          });
          return _this.i({
            "class": "icon " + (file.type === 'modified' ? 'clickable' : '') + " file-" + file.type,
            click: 'showFileDiff'
          });
        };
      })(this));
    };

    FileItem.prototype.initialize = function(file) {
      return this.file = file;
    };

    FileItem.prototype.showFileDiff = function() {
      if (this.file.type === 'modified') {
        return this.file.showFileDiff(this.file.name);
      }
    };

    FileItem.prototype.select = function() {
      return this.file.select(this.file.name);
    };

    return FileItem;

  })(View);

  module.exports = FileView = (function(superClass) {
    extend(FileView, superClass);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.content = function() {
      return this.div({
        "class": 'files'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading clickable'
          }, function() {
            _this.i({
              click: 'toggleBranch',
              "class": 'icon forked'
            });
            _this.span({
              click: 'toggleBranch'
            }, 'Workspace:');
            _this.span('', {
              outlet: 'workspaceTitle'
            });
            return _this.div({
              "class": 'action',
              click: 'selectAll'
            }, function() {
              _this.span('Select all');
              _this.i({
                "class": 'icon check'
              });
              return _this.input({
                "class": 'invisible',
                type: 'checkbox',
                outlet: 'allCheckbox',
                checked: true
              });
            });
          });
          return _this.div({
            "class": 'placeholder'
          }, 'No local working copy changes detected');
        };
      })(this));
    };

    FileView.prototype.initialize = function() {
      this.files = {};
      this.arrayOfFiles = new Array;
      return this.hidden = false;
    };

    FileView.prototype.toggleBranch = function() {
      if (this.hidden) {
        this.addAll(this.arrayOfFiles);
      } else {
        this.clearAll();
      }
      return this.hidden = !this.hidden;
    };

    FileView.prototype.hasSelected = function() {
      var file, name, ref1;
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        if (file.selected) {
          return true;
        }
      }
      return false;
    };

    FileView.prototype.getSelected = function() {
      var file, files, name, ref1;
      files = {
        all: [],
        add: [],
        rem: []
      };
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        if (!file.selected) {
          continue;
        }
        files.all.push(file.name);
        switch (file.type) {
          case 'deleted':
            files.rem.push(file.name);
            break;
          default:
            files.add.push(file.name);
        }
      }
      return files;
    };

    FileView.prototype.showSelected = function() {
      var file, fnames, name, ref1;
      fnames = [];
      this.arrayOfFiles = Object.keys(this.files).map((function(_this) {
        return function(file) {
          return _this.files[file];
        };
      })(this));
      this.find('.file').toArray().forEach((function(_this) {
        return function(div) {
          var f, name;
          f = $(div);
          if (name = f.attr('data-name')) {
            if (_this.files[name].selected) {
              fnames.push(name);
              f.addClass('active');
            } else {
              f.removeClass('active');
            }
          }
        };
      })(this));
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        if (indexOf.call(fnames, name) < 0) {
          file.selected = false;
        }
      }
      this.parentView.showSelectedFiles();
    };

    FileView.prototype.clearAll = function() {
      this.find('>.file').remove();
    };

    FileView.prototype.addAll = function(files) {
      var file, fnames, name, ref1, select, showFileDiff;
      fnames = [];
      this.clearAll();
      if (files.length) {
        this.removeClass('none');
        select = (function(_this) {
          return function(name) {
            return _this.selectFile(name);
          };
        })(this);
        showFileDiff = (function(_this) {
          return function(name) {
            return _this.showFileDiff(name);
          };
        })(this);
        files.forEach((function(_this) {
          return function(file) {
            var base, name1, tempName;
            fnames.push(file.name);
            file.select = select;
            file.showFileDiff = showFileDiff;
            tempName = file.name;
            if (tempName.indexOf(' ') > 0) {
              tempName = '\"' + tempName + '\"';
            }
            (base = _this.files)[name1 = file.name] || (base[name1] = {
              name: tempName
            });
            _this.files[file.name].type = file.type;
            _this.files[file.name].selected = file.selected;
            _this.append(new FileItem(file));
          };
        })(this));
      } else {
        this.addClass('none');
      }
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        if (indexOf.call(fnames, name) < 0) {
          file.selected = false;
        }
      }
      this.showSelected();
    };

    FileView.prototype.showFileDiff = function(name) {
      return git.diff(name).then((function(_this) {
        return function(diffs) {
          _this.parentView.diffView.clearAll();
          return _this.parentView.diffView.addAll(diffs);
        };
      })(this));
    };

    FileView.prototype.selectFile = function(name) {
      if (name) {
        this.files[name].selected = !!!this.files[name].selected;
      }
      this.allCheckbox.prop('checked', false);
      this.showSelected();
    };

    FileView.prototype.selectAll = function() {
      var file, name, ref1, val;
      if (this.hidden) {
        return;
      }
      val = !!!this.allCheckbox.prop('checked');
      this.allCheckbox.prop('checked', val);
      ref1 = this.files;
      for (name in ref1) {
        file = ref1[name];
        file.selected = val;
      }
      this.showSelected();
    };

    FileView.prototype.unselectAll = function() {
      var file, i, len, name, ref1;
      ref1 = this.files;
      for (file = i = 0, len = ref1.length; i < len; file = ++i) {
        name = ref1[file];
        if (file.selected) {
          file.selected = false;
        }
      }
    };

    FileView.prototype.setWorkspaceTitle = function(title) {
      this.workspaceTitle.text(title);
    };

    return FileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvZmlsZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscUNBQUE7SUFBQTs7OztFQUFBLE1BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxlQUFELEVBQU87O0VBQ1AsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUVBOzs7Ozs7O0lBQ0osUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQ7TUFDUixPQUFPLENBQUMsR0FBUixDQUFZLE1BQVosRUFBb0IsSUFBcEI7YUFDQSxJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFBLEdBQVEsSUFBSSxDQUFDLElBQXBCO1FBQTRCLFdBQUEsRUFBYSxJQUFJLENBQUMsSUFBOUM7T0FBTCxFQUF5RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDdkQsS0FBQyxDQUFBLElBQUQsQ0FBTTtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0JBQVA7WUFBeUIsS0FBQSxFQUFPLFFBQWhDO1lBQTBDLEtBQUEsRUFBTyxJQUFJLENBQUMsSUFBdEQ7V0FBTixFQUFrRSxJQUFJLENBQUMsSUFBdkU7VUFDQSxLQUFDLENBQUEsQ0FBRCxDQUFHO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxzQkFBUDtZQUErQixLQUFBLEVBQU8sUUFBdEM7V0FBSDtpQkFDQSxLQUFDLENBQUEsQ0FBRCxDQUFHO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFBLEdBQU8sQ0FBSyxJQUFJLENBQUMsSUFBTCxLQUFhLFVBQWpCLEdBQWtDLFdBQWxDLEdBQW1ELEVBQXBELENBQVAsR0FBOEQsUUFBOUQsR0FBc0UsSUFBSSxDQUFDLElBQWxGO1lBQTBGLEtBQUEsRUFBTyxjQUFqRztXQUFIO1FBSHVEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6RDtJQUZROzt1QkFPVixVQUFBLEdBQVksU0FBQyxJQUFEO2FBQ1YsSUFBQyxDQUFBLElBQUQsR0FBUTtJQURFOzt1QkFHWixZQUFBLEdBQWMsU0FBQTtNQUNaLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLEtBQWMsVUFBakI7ZUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQU4sQ0FBbUIsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUF6QixFQURGOztJQURZOzt1QkFJZCxNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFhLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBbkI7SUFETTs7OztLQWZhOztFQWtCdkIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7T0FBTCxFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDbkIsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sbUJBQVA7V0FBTCxFQUFpQyxTQUFBO1lBQy9CLEtBQUMsQ0FBQSxDQUFELENBQUc7Y0FBQSxLQUFBLEVBQU8sY0FBUDtjQUF1QixDQUFBLEtBQUEsQ0FBQSxFQUFPLGFBQTlCO2FBQUg7WUFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsS0FBQSxFQUFPLGNBQVA7YUFBTixFQUE2QixZQUE3QjtZQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sRUFBTixFQUFVO2NBQUEsTUFBQSxFQUFRLGdCQUFSO2FBQVY7bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtjQUFpQixLQUFBLEVBQU8sV0FBeEI7YUFBTCxFQUEwQyxTQUFBO2NBQ3hDLEtBQUMsQ0FBQSxJQUFELENBQU0sWUFBTjtjQUNBLEtBQUMsQ0FBQSxDQUFELENBQUc7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2VBQUg7cUJBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7Z0JBQW9CLElBQUEsRUFBTSxVQUExQjtnQkFBc0MsTUFBQSxFQUFRLGFBQTlDO2dCQUE2RCxPQUFBLEVBQVMsSUFBdEU7ZUFBUDtZQUh3QyxDQUExQztVQUorQixDQUFqQztpQkFRQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO1dBQUwsRUFBMkIsd0NBQTNCO1FBVG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtJQURROzt1QkFZVixVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFDVCxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJO2FBQ3BCLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFIQTs7dUJBS1osWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFHLElBQUMsQ0FBQSxNQUFKO1FBQWdCLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLFlBQVQsRUFBaEI7T0FBQSxNQUFBO1FBQThDLElBQUMsQ0FBQSxRQUFKLENBQUEsRUFBM0M7O2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFDLElBQUMsQ0FBQTtJQUZBOzt1QkFJZCxXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7QUFBQTtBQUFBLFdBQUEsWUFBQTs7WUFBOEIsSUFBSSxDQUFDO0FBQ2pDLGlCQUFPOztBQURUO0FBRUEsYUFBTztJQUhJOzt1QkFLYixXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxLQUFBLEdBQ0U7UUFBQSxHQUFBLEVBQUssRUFBTDtRQUNBLEdBQUEsRUFBSyxFQURMO1FBRUEsR0FBQSxFQUFLLEVBRkw7O0FBSUY7QUFBQSxXQUFBLFlBQUE7O2FBQThCLElBQUksQ0FBQzs7O1FBQ2pDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBVixDQUFlLElBQUksQ0FBQyxJQUFwQjtBQUNBLGdCQUFPLElBQUksQ0FBQyxJQUFaO0FBQUEsZUFDTyxTQURQO1lBQ3NCLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBVixDQUFlLElBQUksQ0FBQyxJQUFwQjtBQUFmO0FBRFA7WUFFTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQVYsQ0FBZSxJQUFJLENBQUMsSUFBcEI7QUFGUDtBQUZGO0FBTUEsYUFBTztJQVpJOzt1QkFjYixZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxNQUFBLEdBQVM7TUFDVCxJQUFDLENBQUEsWUFBRCxHQUFnQixNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxLQUFiLENBQW1CLENBQUMsR0FBcEIsQ0FBd0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQVUsS0FBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBO1FBQWpCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtNQUNoQixJQUFDLENBQUEsSUFBRCxDQUFNLE9BQU4sQ0FBYyxDQUFDLE9BQWYsQ0FBQSxDQUF3QixDQUFDLE9BQXpCLENBQWlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQy9CLGNBQUE7VUFBQSxDQUFBLEdBQUksQ0FBQSxDQUFFLEdBQUY7VUFFSixJQUFHLElBQUEsR0FBTyxDQUFDLENBQUMsSUFBRixDQUFPLFdBQVAsQ0FBVjtZQUNFLElBQUcsS0FBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQUssQ0FBQyxRQUFoQjtjQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtjQUNBLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBWCxFQUZGO2FBQUEsTUFBQTtjQUlFLENBQUMsQ0FBQyxXQUFGLENBQWMsUUFBZCxFQUpGO2FBREY7O1FBSCtCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQztBQVdBO0FBQUEsV0FBQSxZQUFBOztRQUNFLElBQU8sYUFBUSxNQUFSLEVBQUEsSUFBQSxLQUFQO1VBQ0UsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsTUFEbEI7O0FBREY7TUFJQSxJQUFDLENBQUEsVUFBVSxDQUFDLGlCQUFaLENBQUE7SUFsQlk7O3VCQXFCZCxRQUFBLEdBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixDQUFlLENBQUMsTUFBaEIsQ0FBQTtJQURROzt1QkFJVixNQUFBLEdBQVEsU0FBQyxLQUFEO0FBQ04sVUFBQTtNQUFBLE1BQUEsR0FBUztNQUVULElBQUMsQ0FBQSxRQUFELENBQUE7TUFFQSxJQUFHLEtBQUssQ0FBQyxNQUFUO1FBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiO1FBRUEsTUFBQSxHQUFTLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsSUFBRDttQkFBVSxLQUFDLENBQUEsVUFBRCxDQUFZLElBQVo7VUFBVjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7UUFDVCxZQUFBLEdBQWUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxJQUFEO21CQUFVLEtBQUMsQ0FBQSxZQUFELENBQWMsSUFBZDtVQUFWO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtRQUVmLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxJQUFEO0FBQ1osZ0JBQUE7WUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUksQ0FBQyxJQUFqQjtZQUVBLElBQUksQ0FBQyxNQUFMLEdBQWM7WUFDZCxJQUFJLENBQUMsWUFBTCxHQUFvQjtZQUVwQixRQUFBLEdBQVcsSUFBSSxDQUFDO1lBQ2hCLElBQUcsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakIsQ0FBQSxHQUF3QixDQUEzQjtjQUFrQyxRQUFBLEdBQVcsSUFBQSxHQUFPLFFBQVAsR0FBa0IsS0FBL0Q7O29CQUVBLEtBQUMsQ0FBQSxlQUFNLElBQUksQ0FBQyx3QkFBVTtjQUFBLElBQUEsRUFBTSxRQUFOOztZQUN0QixLQUFDLENBQUEsS0FBTSxDQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxJQUFsQixHQUF5QixJQUFJLENBQUM7WUFDOUIsS0FBQyxDQUFBLEtBQU0sQ0FBQSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsUUFBbEIsR0FBNkIsSUFBSSxDQUFDO1lBQ2xDLEtBQUMsQ0FBQSxNQUFELENBQVksSUFBQSxRQUFBLENBQVMsSUFBVCxDQUFaO1VBWlk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQsRUFORjtPQUFBLE1BQUE7UUFzQkUsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBdEJGOztBQXdCQTtBQUFBLFdBQUEsWUFBQTs7UUFDRSxJQUFPLGFBQVEsTUFBUixFQUFBLElBQUEsS0FBUDtVQUNFLElBQUksQ0FBQyxRQUFMLEdBQWdCLE1BRGxCOztBQURGO01BSUEsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQWpDTTs7dUJBb0NSLFlBQUEsR0FBYyxTQUFDLElBQUQ7YUFDWixHQUFHLENBQUMsSUFBSixDQUFTLElBQVQsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDbEIsS0FBQyxDQUFBLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBckIsQ0FBQTtpQkFDQSxLQUFDLENBQUEsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFyQixDQUE0QixLQUE1QjtRQUZrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEI7SUFEWTs7dUJBTWQsVUFBQSxHQUFZLFNBQUMsSUFBRDtNQUNWLElBQUcsSUFBSDtRQUNFLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFLLENBQUMsUUFBYixHQUF3QixDQUFDLENBQUMsQ0FBQyxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBSyxDQUFDLFNBRDFDOztNQUdBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixTQUFsQixFQUE2QixLQUE3QjtNQUNBLElBQUMsQ0FBQSxZQUFELENBQUE7SUFMVTs7dUJBUVosU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsSUFBVSxJQUFDLENBQUEsTUFBWDtBQUFBLGVBQUE7O01BQ0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxDQUFDLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixTQUFsQjtNQUNULElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixTQUFsQixFQUE2QixHQUE3QjtBQUVBO0FBQUEsV0FBQSxZQUFBOztRQUNFLElBQUksQ0FBQyxRQUFMLEdBQWdCO0FBRGxCO01BR0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQVJTOzt1QkFXWCxXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7QUFBQTtBQUFBLFdBQUEsb0RBQUE7O1lBQThCLElBQUksQ0FBQztVQUNqQyxJQUFJLENBQUMsUUFBTCxHQUFnQjs7QUFEbEI7SUFEVzs7dUJBTWIsaUJBQUEsR0FBbUIsU0FBQyxLQUFEO01BQ2pCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsS0FBckI7SUFEaUI7Ozs7S0FySUU7QUF0QnZCIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXcsICR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5cbmNsYXNzIEZpbGVJdGVtIGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKGZpbGUpIC0+XG4gICAgY29uc29sZS5sb2coJ2ZpbGUnLCBmaWxlKVxuICAgIEBkaXYgY2xhc3M6IFwiZmlsZSAje2ZpbGUudHlwZX1cIiwgJ2RhdGEtbmFtZSc6IGZpbGUubmFtZSwgPT5cbiAgICAgIEBzcGFuIGNsYXNzOiAnY2xpY2thYmxlIHRleHQnLCBjbGljazogJ3NlbGVjdCcsIHRpdGxlOiBmaWxlLm5hbWUsIGZpbGUubmFtZVxuICAgICAgQGkgY2xhc3M6ICdpY29uIGNoZWNrIGNsaWNrYWJsZScsIGNsaWNrOiAnc2VsZWN0J1xuICAgICAgQGkgY2xhc3M6IFwiaWNvbiAje2lmIChmaWxlLnR5cGUgPT0gJ21vZGlmaWVkJykgdGhlbiAnY2xpY2thYmxlJyBlbHNlICcnfSBmaWxlLSN7ZmlsZS50eXBlfVwiLCBjbGljazogJ3Nob3dGaWxlRGlmZidcblxuICBpbml0aWFsaXplOiAoZmlsZSkgLT5cbiAgICBAZmlsZSA9IGZpbGVcblxuICBzaG93RmlsZURpZmY6IC0+XG4gICAgaWYgQGZpbGUudHlwZSA9PSAnbW9kaWZpZWQnXG4gICAgICBAZmlsZS5zaG93RmlsZURpZmYoQGZpbGUubmFtZSlcblxuICBzZWxlY3Q6IC0+XG4gICAgQGZpbGUuc2VsZWN0KEBmaWxlLm5hbWUpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEZpbGVWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZmlsZXMnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ2hlYWRpbmcgY2xpY2thYmxlJywgPT5cbiAgICAgICAgQGkgY2xpY2s6ICd0b2dnbGVCcmFuY2gnLCBjbGFzczogJ2ljb24gZm9ya2VkJ1xuICAgICAgICBAc3BhbiBjbGljazogJ3RvZ2dsZUJyYW5jaCcsICdXb3Jrc3BhY2U6J1xuICAgICAgICBAc3BhbiAnJywgb3V0bGV0OiAnd29ya3NwYWNlVGl0bGUnXG4gICAgICAgIEBkaXYgY2xhc3M6ICdhY3Rpb24nLCBjbGljazogJ3NlbGVjdEFsbCcsID0+XG4gICAgICAgICAgQHNwYW4gJ1NlbGVjdCBhbGwnXG4gICAgICAgICAgQGkgY2xhc3M6ICdpY29uIGNoZWNrJ1xuICAgICAgICAgIEBpbnB1dCBjbGFzczogJ2ludmlzaWJsZScsIHR5cGU6ICdjaGVja2JveCcsIG91dGxldDogJ2FsbENoZWNrYm94JywgY2hlY2tlZDogdHJ1ZVxuICAgICAgQGRpdiBjbGFzczogJ3BsYWNlaG9sZGVyJywgJ05vIGxvY2FsIHdvcmtpbmcgY29weSBjaGFuZ2VzIGRldGVjdGVkJ1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZpbGVzID0ge31cbiAgICBAYXJyYXlPZkZpbGVzID0gbmV3IEFycmF5XG4gICAgQGhpZGRlbiA9IGZhbHNlXG5cbiAgdG9nZ2xlQnJhbmNoOiAtPlxuICAgIGlmIEBoaWRkZW4gdGhlbiBAYWRkQWxsIEBhcnJheU9mRmlsZXMgZWxzZSBkbyBAY2xlYXJBbGxcbiAgICBAaGlkZGVuID0gIUBoaWRkZW5cblxuICBoYXNTZWxlY3RlZDogLT5cbiAgICBmb3IgbmFtZSwgZmlsZSBvZiBAZmlsZXMgd2hlbiBmaWxlLnNlbGVjdGVkXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGdldFNlbGVjdGVkOiAtPlxuICAgIGZpbGVzID1cbiAgICAgIGFsbDogW11cbiAgICAgIGFkZDogW11cbiAgICAgIHJlbTogW11cblxuICAgIGZvciBuYW1lLCBmaWxlIG9mIEBmaWxlcyB3aGVuIGZpbGUuc2VsZWN0ZWRcbiAgICAgIGZpbGVzLmFsbC5wdXNoIGZpbGUubmFtZVxuICAgICAgc3dpdGNoIGZpbGUudHlwZVxuICAgICAgICB3aGVuICdkZWxldGVkJyB0aGVuIGZpbGVzLnJlbS5wdXNoIGZpbGUubmFtZVxuICAgICAgICBlbHNlIGZpbGVzLmFkZC5wdXNoIGZpbGUubmFtZVxuXG4gICAgcmV0dXJuIGZpbGVzXG5cbiAgc2hvd1NlbGVjdGVkOiAtPlxuICAgIGZuYW1lcyA9IFtdXG4gICAgQGFycmF5T2ZGaWxlcyA9IE9iamVjdC5rZXlzKEBmaWxlcykubWFwKChmaWxlKSA9PiBAZmlsZXNbZmlsZV0pO1xuICAgIEBmaW5kKCcuZmlsZScpLnRvQXJyYXkoKS5mb3JFYWNoIChkaXYpID0+XG4gICAgICBmID0gJChkaXYpXG5cbiAgICAgIGlmIG5hbWUgPSBmLmF0dHIoJ2RhdGEtbmFtZScpXG4gICAgICAgIGlmIEBmaWxlc1tuYW1lXS5zZWxlY3RlZFxuICAgICAgICAgIGZuYW1lcy5wdXNoIG5hbWVcbiAgICAgICAgICBmLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZi5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgIHJldHVyblxuXG4gICAgZm9yIG5hbWUsIGZpbGUgb2YgQGZpbGVzXG4gICAgICB1bmxlc3MgbmFtZSBpbiBmbmFtZXNcbiAgICAgICAgZmlsZS5zZWxlY3RlZCA9IGZhbHNlXG5cbiAgICBAcGFyZW50Vmlldy5zaG93U2VsZWN0ZWRGaWxlcygpXG4gICAgcmV0dXJuXG5cbiAgY2xlYXJBbGw6IC0+XG4gICAgQGZpbmQoJz4uZmlsZScpLnJlbW92ZSgpXG4gICAgcmV0dXJuXG5cbiAgYWRkQWxsOiAoZmlsZXMpIC0+XG4gICAgZm5hbWVzID0gW11cblxuICAgIEBjbGVhckFsbCgpXG5cbiAgICBpZiBmaWxlcy5sZW5ndGhcbiAgICAgIEByZW1vdmVDbGFzcygnbm9uZScpXG5cbiAgICAgIHNlbGVjdCA9IChuYW1lKSA9PiBAc2VsZWN0RmlsZShuYW1lKVxuICAgICAgc2hvd0ZpbGVEaWZmID0gKG5hbWUpID0+IEBzaG93RmlsZURpZmYobmFtZSlcblxuICAgICAgZmlsZXMuZm9yRWFjaCAoZmlsZSkgPT5cbiAgICAgICAgZm5hbWVzLnB1c2ggZmlsZS5uYW1lXG5cbiAgICAgICAgZmlsZS5zZWxlY3QgPSBzZWxlY3RcbiAgICAgICAgZmlsZS5zaG93RmlsZURpZmYgPSBzaG93RmlsZURpZmZcblxuICAgICAgICB0ZW1wTmFtZSA9IGZpbGUubmFtZVxuICAgICAgICBpZiB0ZW1wTmFtZS5pbmRleE9mKCcgJykgPiAwIHRoZW4gdGVtcE5hbWUgPSAnXFxcIicgKyB0ZW1wTmFtZSArICdcXFwiJ1xuXG4gICAgICAgIEBmaWxlc1tmaWxlLm5hbWVdIG9yPSBuYW1lOiB0ZW1wTmFtZVxuICAgICAgICBAZmlsZXNbZmlsZS5uYW1lXS50eXBlID0gZmlsZS50eXBlXG4gICAgICAgIEBmaWxlc1tmaWxlLm5hbWVdLnNlbGVjdGVkID0gZmlsZS5zZWxlY3RlZFxuICAgICAgICBAYXBwZW5kIG5ldyBGaWxlSXRlbShmaWxlKVxuICAgICAgICByZXR1cm5cblxuICAgIGVsc2VcbiAgICAgIEBhZGRDbGFzcygnbm9uZScpXG5cbiAgICBmb3IgbmFtZSwgZmlsZSBvZiBAZmlsZXNcbiAgICAgIHVubGVzcyBuYW1lIGluIGZuYW1lc1xuICAgICAgICBmaWxlLnNlbGVjdGVkID0gZmFsc2VcblxuICAgIEBzaG93U2VsZWN0ZWQoKVxuICAgIHJldHVyblxuXG4gIHNob3dGaWxlRGlmZjogKG5hbWUpIC0+XG4gICAgZ2l0LmRpZmYobmFtZSkudGhlbiAoZGlmZnMpID0+XG4gICAgICBAcGFyZW50Vmlldy5kaWZmVmlldy5jbGVhckFsbCgpXG4gICAgICBAcGFyZW50Vmlldy5kaWZmVmlldy5hZGRBbGwoZGlmZnMpXG5cblxuICBzZWxlY3RGaWxlOiAobmFtZSkgLT5cbiAgICBpZiBuYW1lXG4gICAgICBAZmlsZXNbbmFtZV0uc2VsZWN0ZWQgPSAhISFAZmlsZXNbbmFtZV0uc2VsZWN0ZWRcblxuICAgIEBhbGxDaGVja2JveC5wcm9wKCdjaGVja2VkJywgZmFsc2UpXG4gICAgQHNob3dTZWxlY3RlZCgpXG4gICAgcmV0dXJuXG5cbiAgc2VsZWN0QWxsOiAtPlxuICAgIHJldHVybiBpZiBAaGlkZGVuXG4gICAgdmFsID0gISEhQGFsbENoZWNrYm94LnByb3AoJ2NoZWNrZWQnKVxuICAgIEBhbGxDaGVja2JveC5wcm9wKCdjaGVja2VkJywgdmFsKVxuXG4gICAgZm9yIG5hbWUsIGZpbGUgb2YgQGZpbGVzXG4gICAgICBmaWxlLnNlbGVjdGVkID0gdmFsXG5cbiAgICBAc2hvd1NlbGVjdGVkKClcbiAgICByZXR1cm5cblxuICB1bnNlbGVjdEFsbDogLT5cbiAgICBmb3IgbmFtZSwgZmlsZSBpbiBAZmlsZXMgd2hlbiBmaWxlLnNlbGVjdGVkXG4gICAgICBmaWxlLnNlbGVjdGVkID0gZmFsc2VcblxuICAgIHJldHVyblxuXG4gIHNldFdvcmtzcGFjZVRpdGxlOiAodGl0bGUpIC0+XG4gICAgQHdvcmtzcGFjZVRpdGxlLnRleHQodGl0bGUpXG4gICAgcmV0dXJuXG4iXX0=
