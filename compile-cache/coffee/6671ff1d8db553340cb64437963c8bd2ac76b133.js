(function() {
  var AnnotationManager, AutocompletionManager, GotoManager, StatusInProgress, TooltipManager, config, parser, plugins, proxy;

  GotoManager = require("./goto/goto-manager.coffee");

  TooltipManager = require("./tooltip/tooltip-manager.coffee");

  AnnotationManager = require("./annotation/annotation-manager.coffee");

  AutocompletionManager = require("./autocompletion/autocompletion-manager.coffee");

  StatusInProgress = require("./services/status-in-progress.coffee");

  config = require('./config.coffee');

  proxy = require('./services/php-proxy.coffee');

  parser = require('./services/php-file-parser.coffee');

  plugins = require('./services/plugin-manager.coffee');

  module.exports = {
    config: {
      binComposer: {
        title: 'Command to use composer',
        description: 'This plugin depends on composer in order to work. Specify the path to your composer bin (e.g : bin/composer, composer.phar, composer)',
        type: 'string',
        "default": '/usr/local/bin/composer',
        order: 1
      },
      binPhp: {
        title: 'Command php',
        description: 'This plugin use php CLI in order to work. Please specify your php command ("php" on UNIX systems)',
        type: 'string',
        "default": 'php',
        order: 2
      },
      autoloadPaths: {
        title: 'Autoloader file',
        description: 'Relative path to the files of autoload.php from composer (or an other one). You can specify multiple paths (comma separated) if you have different paths for some projects.',
        type: 'array',
        "default": ['vendor/autoload.php', 'autoload.php'],
        order: 3
      },
      classMapFiles: {
        title: 'Classmap files',
        description: 'Relative path to the files that contains a classmap (array with "className" => "fileName"). By default on composer it\'s vendor/composer/autoload_classmap.php',
        type: 'array',
        "default": ['vendor/composer/autoload_classmap.php', 'autoload/ezp_kernel.php'],
        order: 4
      },
      insertNewlinesForUseStatements: {
        title: 'Insert newlines for use statements.',
        description: 'When enabled, the plugin will add additional newlines before or after an automatically added use statement when it can\'t add them nicely to an existing group. This results in more cleanly separated use statements but will create additional vertical whitespace.',
        type: 'boolean',
        "default": false,
        order: 5
      },
      verboseErrors: {
        title: 'Errors on file saving showed',
        description: 'When enabled, you\'ll have a notification once an error occured on autocomplete. Otherwise, the message will just be logged in developer console',
        type: 'boolean',
        "default": false,
        order: 6
      }
    },
    activate: function() {
      config.testConfig();
      config.init();
      this.autocompletionManager = new AutocompletionManager();
      this.autocompletionManager.init();
      this.gotoManager = new GotoManager();
      this.gotoManager.init();
      this.tooltipManager = new TooltipManager();
      this.tooltipManager.init();
      this.annotationManager = new AnnotationManager();
      this.annotationManager.init();
      return proxy.init();
    },
    deactivate: function() {
      this.gotoManager.deactivate();
      this.tooltipManager.deactivate();
      this.annotationManager.deactivate();
      return this.autocompletionManager.deactivate();
    },
    consumeStatusBar: function(statusBar) {
      config.statusInProgress.initialize(statusBar);
      return config.statusInProgress.attach();
    },
    consumePlugin: function(plugin) {
      return plugins.plugins.push(plugin);
    },
    provideAutocompleteTools: function() {
      this.services = {
        proxy: proxy,
        parser: parser
      };
      return this.services;
    },
    getProvider: function() {
      return this.autocompletionManager.getProviders();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3BlZWttby1waHAtYXRvbS1hdXRvY29tcGxldGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVIQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSw0QkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxrQ0FBUixDQURqQixDQUFBOztBQUFBLEVBRUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdDQUFSLENBRnBCLENBQUE7O0FBQUEsRUFHQSxxQkFBQSxHQUF3QixPQUFBLENBQVEsZ0RBQVIsQ0FIeEIsQ0FBQTs7QUFBQSxFQUlBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQ0FBUixDQUpuQixDQUFBOztBQUFBLEVBS0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQUxULENBQUE7O0FBQUEsRUFNQSxLQUFBLEdBQVEsT0FBQSxDQUFRLDZCQUFSLENBTlIsQ0FBQTs7QUFBQSxFQU9BLE1BQUEsR0FBUyxPQUFBLENBQVEsbUNBQVIsQ0FQVCxDQUFBOztBQUFBLEVBUUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQ0FBUixDQVJWLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUNJO0FBQUEsSUFBQSxNQUFBLEVBQ0k7QUFBQSxNQUFBLFdBQUEsRUFDSTtBQUFBLFFBQUEsS0FBQSxFQUFPLHlCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsdUlBRGI7QUFBQSxRQUdBLElBQUEsRUFBTSxRQUhOO0FBQUEsUUFJQSxTQUFBLEVBQVMseUJBSlQ7QUFBQSxRQUtBLEtBQUEsRUFBTyxDQUxQO09BREo7QUFBQSxNQVFBLE1BQUEsRUFDSTtBQUFBLFFBQUEsS0FBQSxFQUFPLGFBQVA7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

//# sourceURL=/Users/Rad/.atom/packages/atom-autocomplete-php/lib/peekmo-php-atom-autocomplete.coffee
