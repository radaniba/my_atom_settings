(function() {
  var ScriptOptionsView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = ScriptOptionsView = (function(_super) {
    __extends(ScriptOptionsView, _super);

    function ScriptOptionsView() {
      this.saveOptions = __bind(this.saveOptions, this);
      return ScriptOptionsView.__super__.constructor.apply(this, arguments);
    }

    ScriptOptionsView.content = function() {
      return this.div((function(_this) {
        return function() {
          return _this.div({
            "class": 'overlay from-top panel',
            outlet: 'scriptOptionsView'
          }, function() {
            _this.div({
              "class": 'panel-heading'
            }, 'Configure Run Options');
            return _this.div({
              "class": 'panel-body padded native-key-bindings'
            }, function() {
              _this.div({
                "class": 'block'
              }, function() {
                _this.label('Current Working Directory:');
                return _this.input({
                  type: 'text',
                  "class": 'editor mini editor-colors ',
                  outlet: 'inputCwd'
                });
              });
              _this.div({
                "class": 'block'
              }, function() {
                _this.label('Command');
                return _this.input({
                  type: 'text',
                  "class": 'editor mini editor-colors',
                  outlet: 'inputCommand'
                });
              });
              _this.div({
                "class": 'block'
              }, function() {
                _this.label('Command Arguments:');
                return _this.input({
                  type: 'text',
                  "class": 'editor mini editor-colors',
                  outlet: 'inputCommandArgs'
                });
              });
              _this.div({
                "class": 'block'
              }, function() {
                _this.label('Program Arguments:');
                return _this.input({
                  type: 'text',
                  "class": 'editor mini editor-colors',
                  outlet: 'inputScriptArgs'
                });
              });
              return _this.div({
                "class": 'block'
              }, function() {
                _this.button({
                  "class": 'btn btn-primary inline-block-tight',
                  click: 'close'
                }, 'Close');
                return _this.button({
                  "class": 'btn btn-success inline-block-tight',
                  click: 'run'
                }, 'Run');
              });
            });
          });
        };
      })(this));
    };

    ScriptOptionsView.prototype.initialize = function(run_options) {
      atom.workspaceView.command("script:run-options", (function(_this) {
        return function() {
          return _this.runOptions();
        };
      })(this));
      atom.workspaceView.command("script:close-options", (function(_this) {
        return function() {
          return _this.toggleScriptOptions('hide');
        };
      })(this));
      atom.workspaceView.command("script:save-options", (function(_this) {
        return function() {
          return _this.saveOptions();
        };
      })(this));
      atom.workspaceView.prependToTop(this);
      this.toggleScriptOptions('hide');
      return this.run_options = run_options;
    };

    ScriptOptionsView.prototype.runOptions = function() {
      return this.toggleScriptOptions();
    };

    ScriptOptionsView.prototype.toggleScriptOptions = function(command) {
      if (command != null) {
        if (command === 'show') {
          this.scriptOptionsView.show();
        }
        if (command === 'hide') {
          return this.scriptOptionsView.hide();
        }
      } else {
        return this.scriptOptionsView.toggle();
      }
    };

    ScriptOptionsView.prototype.saveOptions = function() {
      var item;
      this.run_options.cmd_cwd = this.inputCwd.val();
      this.run_options.cmd = this.inputCommand.val();
      this.run_options.cmd_args = (function() {
        var _i, _len, _ref, _results;
        _ref = this.inputCommandArgs.val().split(' ');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item !== '') {
            _results.push(item);
          }
        }
        return _results;
      }).call(this);
      return this.run_options.script_args = (function() {
        var _i, _len, _ref, _results;
        _ref = this.inputScriptArgs.val().split(' ');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item !== '') {
            _results.push(item);
          }
        }
        return _results;
      }).call(this);
    };

    ScriptOptionsView.prototype.close = function() {
      return atom.workspaceView.trigger("script:close-options");
    };

    ScriptOptionsView.prototype.run = function() {
      atom.workspaceView.trigger("script:save-options");
      atom.workspaceView.trigger("script:close-options");
      return atom.workspaceView.trigger("script:run");
    };

    return ScriptOptionsView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSix3Q0FBQSxDQUFBOzs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNILEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyx3QkFBUDtBQUFBLFlBQWlDLE1BQUEsRUFBUSxtQkFBekM7V0FBTCxFQUFtRSxTQUFBLEdBQUE7QUFDakUsWUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sZUFBUDthQUFMLEVBQTZCLHVCQUE3QixDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLHVDQUFQO2FBQUwsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELGNBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGdCQUFBLE9BQUEsRUFBTyxPQUFQO2VBQUwsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLGdCQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sNEJBQVAsQ0FBQSxDQUFBO3VCQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87QUFBQSxrQkFBQSxJQUFBLEVBQU0sTUFBTjtBQUFBLGtCQUFjLE9BQUEsRUFBTyw0QkFBckI7QUFBQSxrQkFBbUQsTUFBQSxFQUFRLFVBQTNEO2lCQUFQLEVBRm1CO2NBQUEsQ0FBckIsQ0FBQSxDQUFBO0FBQUEsY0FHQSxLQUFDLENBQUEsR0FBRCxDQUFL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
//# sourceURL=/Users/Rad/.atom/packages/script/lib/script-options-view.coffee