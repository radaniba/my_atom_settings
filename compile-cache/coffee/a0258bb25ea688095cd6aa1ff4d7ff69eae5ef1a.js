(function() {
  var $, $$$, File, NbviewerView, ScrollView, exec, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  exec = require("child_process").exec;

  File = require('atom').File;

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$$ = _ref.$$$, ScrollView = _ref.ScrollView;

  module.exports = NbviewerView = (function(_super) {
    __extends(NbviewerView, _super);

    NbviewerView.content = function() {
      return this.div({
        "class": 'nbviewer native-key-bindings',
        tabindex: -1
      });
    };

    function NbviewerView(_arg) {
      this.editorId = _arg.editorId, this.filePath = _arg.filePath;
      NbviewerView.__super__.constructor.apply(this, arguments);
      this.text('Loading... nbviewer output should replace this text');
      if (this.editorId != null) {
        this.resolveEditor(this.editorId);
      } else {
        if (atom.workspace != null) {
          this.subscribeToFilePath(this.filePath);
        } else {
          atom.packages.onDidActivatePackage((function(_this) {
            return function() {
              return _this.subscribeToFilePath(_this.filePath);
            };
          })(this));
        }
      }
    }

    NbviewerView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var _ref1, _ref2;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            return _this.renderHTML();
          } else {
            return (_ref1 = atom.workspace) != null ? (_ref2 = _ref1.paneForItem(_this)) != null ? _ref2.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return atom.packages.onDidActivatePackage((function(_this) {
          return function() {
            return resolve();
          };
        })(this));
      }
    };

    NbviewerView.prototype.subscribeToFilePath = function(filePath) {
      this.file = new File(filePath);
      return this.renderHTML();
    };

    NbviewerView.prototype.getURI = function() {
      if (this.file != null) {
        return "nbviewer-preview://" + (this.getPath());
      } else {
        return "nbviewer-preview://editor/" + this.editorId;
      }
    };

    NbviewerView.prototype.getPath = function() {
      if (this.file != null) {
        return this.file.getPath();
      } else {
        return this.editor.getPath();
      }
    };

    NbviewerView.prototype.getOutputPath = function() {
      var baseName;
      baseName = path.parse(this.getPath()).name;
      return baseName + '.html';
    };

    NbviewerView.prototype.editorForId = function(editorId) {
      var editor, _i, _len, _ref1, _ref2;
      _ref1 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        if (((_ref2 = editor.id) != null ? _ref2.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    NbviewerView.prototype.getTitle = function() {
      if (this.file != null) {
        return "" + (path.basename(this.getPath())) + " Preview";
      } else if (this.editor != null) {
        return "" + (this.editor.getTitle()) + " Preview";
      } else {
        return "Nbviewer Preview";
      }
    };

    NbviewerView.prototype.renderHTML = function() {
      var bin, child, cmd, _self;
      _self = this;
      bin = atom.config.get('nbviewer.jupyterConvertBin');
      console.log(this.getPath());
      cmd = bin + " \"" + this.getPath() + "\" --to html --output /tmp/" + "\"" + this.getOutputPath() + "\"";
      console.log(cmd);
      child = exec(cmd, {
        cwd: "/tmp"
      }, function(error, stdout, stderr) {
        if (error !== null) {
          _self.text('Conversion failed:\n' + error);
        }
      });
      return child.on('exit', function(code, signal) {
        var iframe;
        if (code === 0) {
          iframe = document.createElement("iframe");
          iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
          iframe.setAttribute("style", "width: 100%; height: 100%;");
          iframe.src = 'file:///tmp/' + _self.getOutputPath();
          return _self.html($(iframe));
        }
      });
    };

    return NbviewerView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9uYnZpZXdlci9saWIvbmJ2aWV3ZXItdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0RBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQyxJQURoQyxDQUFBOztBQUFBLEVBR0MsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBSEQsQ0FBQTs7QUFBQSxFQUlBLE9BQXdCLE9BQUEsQ0FBUSxzQkFBUixDQUF4QixFQUFDLFNBQUEsQ0FBRCxFQUFJLFdBQUEsR0FBSixFQUFTLGtCQUFBLFVBSlQsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixtQ0FBQSxDQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sOEJBQVA7QUFBQSxRQUF1QyxRQUFBLEVBQVUsQ0FBQSxDQUFqRDtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBR2EsSUFBQSxzQkFBQyxJQUFELEdBQUE7QUFDWCxNQURhLElBQUMsQ0FBQSxnQkFBQSxVQUFVLElBQUMsQ0FBQSxnQkFBQSxRQUN6QixDQUFBO0FBQUEsTUFBQSwrQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxxREFBTixDQURBLENBQUE7QUFHQSxNQUFBLElBQUcscUJBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBQyxDQUFBLFFBQWhCLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLElBQUcs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

//# sourceURL=/Users/Rad/.atom/packages/nbviewer/lib/nbviewer-view.coffee
