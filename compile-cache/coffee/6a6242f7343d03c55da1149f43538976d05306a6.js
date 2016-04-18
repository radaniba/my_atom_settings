(function() {
  module.exports = {
    general: {
      title: 'General',
      type: 'object',
      collapsed: true,
      order: -1,
      description: 'General options for Atom Beautify',
      properties: {
        analytics: {
          title: 'Anonymous Analytics',
          type: 'boolean',
          "default": true,
          description: "There is [Segment.io](https://segment.io/) which forwards data to [Google Analytics](http://www.google.com/analytics/) to track what languages are being used the most, as well as other stats. Everything is anonymized and no personal information, such as source code, is sent. See https://github.com/Glavin001/atom-beautify/issues/47 for more details."
        },
        _analyticsUserId: {
          title: 'Analytics User Id',
          type: 'string',
          "default": "",
          description: "Unique identifier for this user for tracking usage analytics"
        },
        loggerLevel: {
          title: "Logger Level",
          type: 'string',
          "default": 'warn',
          description: 'Set the level for the logger',
          "enum": ['verbose', 'debug', 'info', 'warn', 'error']
        },
        beautifyEntireFileOnSave: {
          title: "Beautify Entire File On Save",
          type: 'boolean',
          "default": true,
          description: "When beautifying on save, use the entire file, even if there is selected text in the editor. Important: The `beautify on save` option for the specific language must be enabled for this to be applicable. This option is not `beautify on save`."
        },
        muteUnsupportedLanguageErrors: {
          title: "Mute Unsupported Language Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show \"Unsupported Language\" errors when they occur"
        },
        muteAllErrors: {
          title: "Mute All Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show any/all errors when they occur"
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9jb25maWcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZixPQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxTQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sUUFETjtBQUFBLE1BRUEsU0FBQSxFQUFXLElBRlg7QUFBQSxNQUdBLEtBQUEsRUFBTyxDQUFBLENBSFA7QUFBQSxNQUlBLFdBQUEsRUFBYSxtQ0FKYjtBQUFBLE1BS0EsVUFBQSxFQUNFO0FBQUEsUUFBQSxTQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxxQkFBUDtBQUFBLFVBQ0EsSUFBQSxFQUFPLFNBRFA7QUFBQSxVQUVBLFNBQUEsRUFBVSxJQUZWO0FBQUEsVUFHQSxXQUFBLEVBQWMsZ1dBSGQ7U0FERjtBQUFBLFFBU0EsZ0JBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLG1CQUFQO0FBQUEsVUFDQSxJQUFBLEVBQU8sUUFEUDtBQUFBLFVBRUEsU0FBQSxFQUFVLEVBRlY7QUFBQSxVQUdBLFdBQUEsRUFBYyw4REFIZDtTQVZGO0FBQUEsUUFjQSxXQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxjQUFQO0FBQUEsVUFDQSxJQUFBLEVBQU8sUUFEUDtBQUFBLFVBRUEsU0FBQSxFQUFVLE1BRlY7QUFBQSxVQUdBLFdBQUEsRUFBYyw4QkFIZDtBQUFBLFVBSUEsTUFBQSxFQUFPLENBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsTUFBckIsRUFBNkIsTUFBN0IsRUFBcUMsT0FBckMsQ0FKUDtTQWZGO0FBQUEsUUFvQkEsd0JBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLDhCQUFQO0FBQUEsVUFDQSxJQUFBLEVBQU8sU0FEUDtBQUFBLFVBRUEsU0FBQSxFQUFVLElBRlY7QUFBQSxVQUdBLFdBQUEsRUFBYyxtUEFIZDtTQXJCRjtBQUFBLFFBeUJBLDZCQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxrQ0FBUDtBQUFBLFVBQ0EsSUFBQSxFQUFPLFNBRFA7QUFBQSxVQUVBLFNBQUEsRUFBVSxLQUZWO0FBQUEsVUFHQSxXQUFBLEVBQWMsNkRBSGQ7U0ExQkY7QUFBQSxRQThCQSxhQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxpQkFBUDtBQUFBLFVBQ0EsSUFBQSxFQUFPLFNBRFA7QUFBQSxVQUVBLFNBQUEsRUFBVSxLQUZWO0FBQUEsVUFHQSxXQUFBLEVBQWMsNENBSGQ7U0EvQkY7T0FORjtLQUZhO0dBQWpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/config.coffee
