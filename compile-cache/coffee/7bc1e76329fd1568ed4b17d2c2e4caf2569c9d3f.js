(function() {
  var Config, _;

  _ = require('lodash');

  module.exports = Config = {
    getJson: function(key, _default) {
      var error, message, value;
      if (_default == null) {
        _default = {};
      }
      if (!(value = atom.config.get("Hydrogen." + key))) {
        return _default;
      }
      try {
        return JSON.parse(value);
      } catch (_error) {
        error = _error;
        message = "Your Hydrogen config is broken: " + key;
        atom.notifications.addError(message, {
          description: error
        });
      }
      return _default;
    },
    schema: {
      autocomplete: {
        title: 'Enable Autocomplete',
        type: 'boolean',
        "default": true
      },
      kernelNotifications: {
        title: 'Enable Kernel Notifications',
        description: 'By default, kernel notifications are only displayed in the developer console. This setting defines a RegExp to filter what kernel notifications will also be shown as Atom notification bubbles. Example: `error|warning`',
        type: 'string',
        "default": '(?!)'
      },
      gateways: {
        title: 'List of kernel gateways to use',
        description: 'Hydrogen can connect to remote notebook servers and kernel gateways. Each gateway needs at minimum a name and a value for options.baseUrl. The options are passed directly to the `jupyter-js-services` npm package, which includes documentation for additional fields. Example value: ``` [{ "name": "Remote notebook", "options": { "baseUrl": "http://mysite.com:8888" } }] ```',
        type: 'string',
        "default": '[]'
      },
      kernelspec: {
        title: 'Kernel Specs',
        description: 'This field is populated on every launch or by invoking the command `hydrogen:update-kernels`. It contains the JSON string resulting from running `jupyter kernelspec list --json` or `ipython kernelspec list --json`. You can also edit this field and specify custom kernel specs , like this: ``` { "kernelspecs": { "ijavascript": { "spec": { "display_name": "IJavascript", "env": {}, "argv": [ "node", "/home/user/node_modules/ijavascript/lib/kernel.js", "--protocol=5.0", "{connection_file}" ], "language": "javascript" }, "resources_dir": "/home/user/node_modules/ijavascript/images" } } } ```',
        type: 'string',
        "default": '{}'
      },
      languageMappings: {
        title: 'Language Mappings',
        description: 'Some kernels may use a non-standard language name (e.g. jupyter-scala sets the language name to `scala211`). That leaves Hydrogen unable to figure out what kernel for your code. This field should be a valid JSON mapping from a kernel language name to Atom\'s lower-cased grammar name, e.g. ``` { "scala211": "scala", "Elixir": "elixir" } ```',
        type: 'string',
        "default": '{}'
      },
      startupCode: {
        title: 'Startup Code',
        description: 'This code will be executed on kernel startup. Format: `{"kernel": "your code \\nmore code"}`. Example: `{"Python 2": "%matplotlib inline"}`',
        type: 'string',
        "default": '{}'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvY29uZmlnLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxTQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE1BQUEsR0FDYjtBQUFBLElBQUEsT0FBQSxFQUFTLFNBQUMsR0FBRCxFQUFNLFFBQU4sR0FBQTtBQUNMLFVBQUEscUJBQUE7O1FBRFcsV0FBVztPQUN0QjtBQUFBLE1BQUEsSUFBQSxDQUFBLENBQXVCLEtBQUEsR0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBaUIsV0FBQSxHQUFXLEdBQTVCLENBQVIsQ0FBdkI7QUFBQSxlQUFPLFFBQVAsQ0FBQTtPQUFBO0FBQ0E7QUFDSSxlQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBWCxDQUFQLENBREo7T0FBQSxjQUFBO0FBR0ksUUFERSxjQUNGLENBQUE7QUFBQSxRQUFBLE9BQUEsR0FBVyxrQ0FBQSxHQUFrQyxHQUE3QyxDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLE9BQTVCLEVBQXFDO0FBQUEsVUFBQSxXQUFBLEVBQWEsS0FBYjtTQUFyQyxDQURBLENBSEo7T0FEQTtBQU1BLGFBQU8sUUFBUCxDQVBLO0lBQUEsQ0FBVDtBQUFBLElBU0EsTUFBQSxFQUNJO0FBQUEsTUFBQSxZQUFBLEVBQ0k7QUFBQSxRQUFBLEtBQUEsRUFBTyxxQkFBUDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxJQUZUO09BREo7QUFBQSxNQUlBLG1CQUFBLEVBQ0k7QUFBQSxRQUFBLEtBQUEsRUFBTyw2QkFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLDJOQURiO0FBQUEsUUFLQSxJQUFBLEVBQU0sUUFMTjtBQUFBLFFBTUEsU0FBQSxFQUFTLE1BTlQ7T0FMSjtBQUFBLE1BWUEsUUFBQSxFQUNJO0FBQUEsUUFBQSxLQUFBLEVBQU8sZ0NBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxxWEFEYjtBQUFBLFFBZ0JBLElBQUEsRUFBTSxRQWhCTjtBQUFBLFFBaUJBLFNBQUEsRUFBUyxJQWpCVDtPQWJKO0FBQUEsTUErQkEsVUFBQSxFQUNJO0FBQUEsUUFBQSxLQUFBLEVBQU8sY0FBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLGtsQkFEYjtBQUFBLFFBMEJBLElBQUEsRUFBTSxRQTFCTjtBQUFBLFFBMkJBLFNBQUEsRUFBUyxJQTNCVDtPQWhDSjtBQUFBLE1BNERBLGdCQUFBLEVBQ0k7QUFBQSxRQUFBLEtBQUEsRUFBTyxtQkFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLHVWQURiO0FBQUEsUUFZQSxJQUFBLEVBQU0sUUFaTjtBQUFBLFFBYUEsU0FBQSxFQUFTLElBYlQ7T0E3REo7QUFBQSxNQTJFQSxXQUFBLEVBQ0k7QUFBQSxRQUFBLEtBQUEsRUFBTyxjQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsNklBRGI7QUFBQSxRQUlBLElBQUEsRUFBTSxRQUpOO0FBQUEsUUFLQSxTQUFBLEVBQVMsSUFMVDtPQTVFSjtLQVZKO0dBSEosQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/config.coffee
