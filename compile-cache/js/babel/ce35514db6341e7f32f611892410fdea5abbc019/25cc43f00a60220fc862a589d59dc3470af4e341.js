'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Config = {
  getJson: function getJson(key) {
    var _default = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var value = atom.config.get('Hydrogen.' + key);
    if (!value) return _default;
    try {
      return JSON.parse(value);
    } catch (error) {
      var message = 'Your Hydrogen config is broken: ' + key;
      atom.notifications.addError(message, { detail: error });
    }
    return _default;
  },

  schema: {
    autocomplete: {
      title: 'Enable Autocomplete',
      type: 'boolean',
      'default': true
    },
    kernelNotifications: {
      title: 'Enable Kernel Notifications',
      description: 'Notify if kernels writes to stdout. By default, kernel notifications are only displayed in the developer console.',
      type: 'boolean',
      'default': false
    },
    gateways: {
      title: 'List of kernel gateways to use',
      description: 'Hydrogen can connect to remote notebook servers and kernel gateways. Each gateway needs at minimum a name and a value for options.baseUrl. The options are passed directly to the `jupyter-js-services` npm package, which includes documentation for additional fields. Example value: ``` [{ "name": "Remote notebook", "options": { "baseUrl": "http://mysite.com:8888" } }] ```',
      type: 'string',
      'default': '[]'
    },
    kernelspec: {
      title: 'Kernel Specs',
      description: 'This field is populated on every launch or by invoking the command `hydrogen:update-kernels`. It contains the JSON string resulting from running `jupyter kernelspec list --json` or `ipython kernelspec list --json`. You can also edit this field and specify custom kernel specs , like this: ``` { "kernelspecs": { "ijavascript": { "spec": { "display_name": "IJavascript", "env": {}, "argv": [ "node", "/home/user/node_modules/ijavascript/lib/kernel.js", "--protocol=5.0", "{connection_file}" ], "language": "javascript" }, "resources_dir": "/home/user/node_modules/ijavascript/images" } } } ```',
      type: 'string',
      'default': '{}'
    },
    languageMappings: {
      title: 'Language Mappings',
      description: 'Some kernels may use a non-standard language name (e.g. jupyter-scala sets the language name to `scala211`). That leaves Hydrogen unable to figure out what kernel for your code. This field should be a valid JSON mapping from a kernel language name to Atom\'s lower-cased grammar name, e.g. ``` { "scala211": "scala", "Elixir": "elixir" } ```',
      type: 'string',
      'default': '{}'
    },
    startupCode: {
      title: 'Startup Code',
      description: 'This code will be executed on kernel startup. Format: `{"kernel": "your code \\nmore code"}`. Example: `{"Python 2": "%matplotlib inline"}`',
      type: 'string',
      'default': '{}'
    }
  }
};

exports['default'] = Config;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7O0FBRVosSUFBTSxNQUFNLEdBQUc7QUFDYixTQUFPLEVBQUEsaUJBQUMsR0FBRyxFQUFpQjtRQUFmLFFBQVEseURBQUcsRUFBRTs7QUFDeEIsUUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQWEsR0FBRyxDQUFHLENBQUM7QUFDakQsUUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLFFBQVEsQ0FBQztBQUM1QixRQUFJO0FBQ0YsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzFCLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxVQUFNLE9BQU8sd0NBQXNDLEdBQUcsQUFBRSxDQUFDO0FBQ3pELFVBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3pEO0FBQ0QsV0FBTyxRQUFRLENBQUM7R0FDakI7O0FBRUQsUUFBTSxFQUFFO0FBQ04sZ0JBQVksRUFBRTtBQUNaLFdBQUssRUFBRSxxQkFBcUI7QUFDNUIsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCx1QkFBbUIsRUFBRTtBQUNuQixXQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGlCQUFXLEVBQUUsbUhBQW1IO0FBQ2hJLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0FBQ0QsWUFBUSxFQUFFO0FBQ1IsV0FBSyxFQUFFLGdDQUFnQztBQUN2QyxpQkFBVyxFQUFFLHFYQUFxWDtBQUNsWSxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLElBQUk7S0FDZDtBQUNELGNBQVUsRUFBRTtBQUNWLFdBQUssRUFBRSxjQUFjO0FBQ3JCLGlCQUFXLEVBQUUsa2xCQUFrbEI7QUFDL2xCLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsSUFBSTtLQUNkO0FBQ0Qsb0JBQWdCLEVBQUU7QUFDaEIsV0FBSyxFQUFFLG1CQUFtQjtBQUMxQixpQkFBVyxFQUFFLHVWQUF1VjtBQUNwVyxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLElBQUk7S0FDZDtBQUNELGVBQVcsRUFBRTtBQUNYLFdBQUssRUFBRSxjQUFjO0FBQ3JCLGlCQUFXLEVBQUUsNklBQTZJO0FBQzFKLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsSUFBSTtLQUNkO0dBQ0Y7Q0FDRixDQUFDOztxQkFFYSxNQUFNIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jb25zdCBDb25maWcgPSB7XG4gIGdldEpzb24oa2V5LCBfZGVmYXVsdCA9IHt9KSB7XG4gICAgY29uc3QgdmFsdWUgPSBhdG9tLmNvbmZpZy5nZXQoYEh5ZHJvZ2VuLiR7a2V5fWApO1xuICAgIGlmICghdmFsdWUpIHJldHVybiBfZGVmYXVsdDtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYFlvdXIgSHlkcm9nZW4gY29uZmlnIGlzIGJyb2tlbjogJHtrZXl9YDtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCB7IGRldGFpbDogZXJyb3IgfSk7XG4gICAgfVxuICAgIHJldHVybiBfZGVmYXVsdDtcbiAgfSxcblxuICBzY2hlbWE6IHtcbiAgICBhdXRvY29tcGxldGU6IHtcbiAgICAgIHRpdGxlOiAnRW5hYmxlIEF1dG9jb21wbGV0ZScsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAga2VybmVsTm90aWZpY2F0aW9uczoge1xuICAgICAgdGl0bGU6ICdFbmFibGUgS2VybmVsIE5vdGlmaWNhdGlvbnMnLFxuICAgICAgZGVzY3JpcHRpb246ICdOb3RpZnkgaWYga2VybmVscyB3cml0ZXMgdG8gc3Rkb3V0LiBCeSBkZWZhdWx0LCBrZXJuZWwgbm90aWZpY2F0aW9ucyBhcmUgb25seSBkaXNwbGF5ZWQgaW4gdGhlIGRldmVsb3BlciBjb25zb2xlLicsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIGdhdGV3YXlzOiB7XG4gICAgICB0aXRsZTogJ0xpc3Qgb2Yga2VybmVsIGdhdGV3YXlzIHRvIHVzZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0h5ZHJvZ2VuIGNhbiBjb25uZWN0IHRvIHJlbW90ZSBub3RlYm9vayBzZXJ2ZXJzIGFuZCBrZXJuZWwgZ2F0ZXdheXMuIEVhY2ggZ2F0ZXdheSBuZWVkcyBhdCBtaW5pbXVtIGEgbmFtZSBhbmQgYSB2YWx1ZSBmb3Igb3B0aW9ucy5iYXNlVXJsLiBUaGUgb3B0aW9ucyBhcmUgcGFzc2VkIGRpcmVjdGx5IHRvIHRoZSBganVweXRlci1qcy1zZXJ2aWNlc2AgbnBtIHBhY2thZ2UsIHdoaWNoIGluY2x1ZGVzIGRvY3VtZW50YXRpb24gZm9yIGFkZGl0aW9uYWwgZmllbGRzLiBFeGFtcGxlIHZhbHVlOiBgYGAgW3sgXCJuYW1lXCI6IFwiUmVtb3RlIG5vdGVib29rXCIsIFwib3B0aW9uc1wiOiB7IFwiYmFzZVVybFwiOiBcImh0dHA6Ly9teXNpdGUuY29tOjg4ODhcIiB9IH1dIGBgYCcsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICdbXScsXG4gICAgfSxcbiAgICBrZXJuZWxzcGVjOiB7XG4gICAgICB0aXRsZTogJ0tlcm5lbCBTcGVjcycsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgZmllbGQgaXMgcG9wdWxhdGVkIG9uIGV2ZXJ5IGxhdW5jaCBvciBieSBpbnZva2luZyB0aGUgY29tbWFuZCBgaHlkcm9nZW46dXBkYXRlLWtlcm5lbHNgLiBJdCBjb250YWlucyB0aGUgSlNPTiBzdHJpbmcgcmVzdWx0aW5nIGZyb20gcnVubmluZyBganVweXRlciBrZXJuZWxzcGVjIGxpc3QgLS1qc29uYCBvciBgaXB5dGhvbiBrZXJuZWxzcGVjIGxpc3QgLS1qc29uYC4gWW91IGNhbiBhbHNvIGVkaXQgdGhpcyBmaWVsZCBhbmQgc3BlY2lmeSBjdXN0b20ga2VybmVsIHNwZWNzICwgbGlrZSB0aGlzOiBgYGAgeyBcImtlcm5lbHNwZWNzXCI6IHsgXCJpamF2YXNjcmlwdFwiOiB7IFwic3BlY1wiOiB7IFwiZGlzcGxheV9uYW1lXCI6IFwiSUphdmFzY3JpcHRcIiwgXCJlbnZcIjoge30sIFwiYXJndlwiOiBbIFwibm9kZVwiLCBcIi9ob21lL3VzZXIvbm9kZV9tb2R1bGVzL2lqYXZhc2NyaXB0L2xpYi9rZXJuZWwuanNcIiwgXCItLXByb3RvY29sPTUuMFwiLCBcIntjb25uZWN0aW9uX2ZpbGV9XCIgXSwgXCJsYW5ndWFnZVwiOiBcImphdmFzY3JpcHRcIiB9LCBcInJlc291cmNlc19kaXJcIjogXCIvaG9tZS91c2VyL25vZGVfbW9kdWxlcy9pamF2YXNjcmlwdC9pbWFnZXNcIiB9IH0gfSBgYGAnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAne30nLFxuICAgIH0sXG4gICAgbGFuZ3VhZ2VNYXBwaW5nczoge1xuICAgICAgdGl0bGU6ICdMYW5ndWFnZSBNYXBwaW5ncycsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NvbWUga2VybmVscyBtYXkgdXNlIGEgbm9uLXN0YW5kYXJkIGxhbmd1YWdlIG5hbWUgKGUuZy4ganVweXRlci1zY2FsYSBzZXRzIHRoZSBsYW5ndWFnZSBuYW1lIHRvIGBzY2FsYTIxMWApLiBUaGF0IGxlYXZlcyBIeWRyb2dlbiB1bmFibGUgdG8gZmlndXJlIG91dCB3aGF0IGtlcm5lbCBmb3IgeW91ciBjb2RlLiBUaGlzIGZpZWxkIHNob3VsZCBiZSBhIHZhbGlkIEpTT04gbWFwcGluZyBmcm9tIGEga2VybmVsIGxhbmd1YWdlIG5hbWUgdG8gQXRvbVxcJ3MgbG93ZXItY2FzZWQgZ3JhbW1hciBuYW1lLCBlLmcuIGBgYCB7IFwic2NhbGEyMTFcIjogXCJzY2FsYVwiLCBcIkVsaXhpclwiOiBcImVsaXhpclwiIH0gYGBgJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ3t9JyxcbiAgICB9LFxuICAgIHN0YXJ0dXBDb2RlOiB7XG4gICAgICB0aXRsZTogJ1N0YXJ0dXAgQ29kZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgY29kZSB3aWxsIGJlIGV4ZWN1dGVkIG9uIGtlcm5lbCBzdGFydHVwLiBGb3JtYXQ6IGB7XCJrZXJuZWxcIjogXCJ5b3VyIGNvZGUgXFxcXG5tb3JlIGNvZGVcIn1gLiBFeGFtcGxlOiBge1wiUHl0aG9uIDJcIjogXCIlbWF0cGxvdGxpYiBpbmxpbmVcIn1gJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ3t9JyxcbiAgICB9LFxuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29uZmlnO1xuIl19