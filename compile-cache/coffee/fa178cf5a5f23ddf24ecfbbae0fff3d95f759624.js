(function() {
  var Emitter, Jekyll, Utils;

  Emitter = require('atom').Emitter;

  Jekyll = require('./jekyll/jekyll');

  Utils = require('./jekyll/utils');

  module.exports = {
    disposables: [],
    Emitter: new Emitter(),
    config: {
      serverPort: {
        type: 'integer',
        "default": 3000
      },
      buildCommand: {
        type: 'array',
        "default": ['jekyll', 'build'],
        items: {
          type: 'string'
        }
      }
    },
    activate: function() {
      process.jekyllAtom = {
        buildCommand: atom.config.get('jekyll.buildCommand')
      };
      Utils.setMainModule(this);
      Utils.getConfigFromSite();
      if (!atom.packages.isPackageLoaded('language-liquid')) {
        atom.notifications.addWarning('Jekyll', {
          detail: 'Please install the language-liquid package to get full syntax highlighting'
        });
      }
      atom.commands.add('atom-workspace', "jekyll:open-layout", (function(_this) {
        return function() {
          return _this.handleCommand('openLayout', true, true);
        };
      })(this));
      atom.commands.add('atom-workspace', "jekyll:open-config", (function(_this) {
        return function() {
          return _this.handleCommand('openConfig', false, false);
        };
      })(this));
      atom.commands.add('atom-workspace', "jekyll:open-include", (function(_this) {
        return function() {
          return _this.handleCommand('openInclude', true, true);
        };
      })(this));
      atom.commands.add('atom-workspace', "jekyll:open-data", (function(_this) {
        return function() {
          return _this.handleCommand('openData', true, true);
        };
      })(this));
      atom.commands.add('atom-workspace', "jekyll:toggle-server", (function(_this) {
        return function() {
          return _this.handleCommand('toggleServer', true, false);
        };
      })(this));
      atom.commands.add('atom-workspace', 'jekyll:new-post', (function(_this) {
        return function() {
          return _this.handleCommand('newPost', true, false);
        };
      })(this));
      atom.commands.add('atom-workspace', 'jekyll:build-site', (function(_this) {
        return function() {
          return _this.handleCommand('buildSite', true, false);
        };
      })(this));
      atom.commands.add('atom-workspace', 'jekyll:publish-draft', (function(_this) {
        return function() {
          return _this.handleCommand('publishDraft', true, true);
        };
      })(this));
      this.Emitter.emit('loaded');
      return this.Emitter.on('config-loaded', (function(_this) {
        return function() {
          return _this.dispose;
        };
      })(this));
    },
    deactivate: function() {
      var _ref;
      this.dispose();
      return (_ref = Jekyll.Server) != null ? _ref.stop() : void 0;
    },
    dispose: function() {
      var disposeable, _i, _len, _ref, _results;
      _ref = this.disposables;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        disposeable = _ref[_i];
        _results.push(disposeable.dispose());
      }
      return _results;
    },
    handleCommand: function(name, waitForConfig, needsEditor) {
      var run;
      run = true;
      if (needsEditor) {
        if (!atom.workspace.getActiveTextEditor()) {
          atom.notifications.addWarning('Could not see Active Editor, do you have an editor open?');
          run = false;
        }
      }
      if (run) {
        if (waitForConfig) {
          return Utils.waitForConfig(function(config) {
            return Jekyll[name](config);
          });
        } else {
          return Jekyll[name]();
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qZWt5bGwvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsaUJBQVIsQ0FGVCxDQUFBOztBQUFBLEVBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxnQkFBUixDQUhSLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxXQUFBLEVBQWEsRUFBYjtBQUFBLElBQ0EsT0FBQSxFQUFhLElBQUEsT0FBQSxDQUFBLENBRGI7QUFBQSxJQUdBLE1BQUEsRUFDRTtBQUFBLE1BQUEsVUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7T0FERjtBQUFBLE1BR0EsWUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLENBQUMsUUFBRCxFQUFXLE9BQVgsQ0FEVDtBQUFBLFFBRUEsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO09BSkY7S0FKRjtBQUFBLElBYUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsT0FBTyxDQUFDLFVBQVIsR0FBcUI7QUFBQSxRQUNuQixZQUFBLEVBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFCQUFoQixDQURLO09BQXJCLENBQUE7QUFBQSxNQUlBLEtBQUssQ0FBQyxhQUFOLENBQW9CLElBQXBCLENBSkEsQ0FBQTtBQUFBLE1BS0EsS0FBSyxDQUFDLGlCQUFOLENBQUEsQ0FMQSxDQUFBO0FBT0EsTUFBQSxJQUFBLENB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

//# sourceURL=/Users/Rad/.atom/packages/jekyll/lib/main.coffee
