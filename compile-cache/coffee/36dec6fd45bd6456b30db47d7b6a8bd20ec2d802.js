(function() {
  var defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, scope, softTabs, tabLength, _ref, _ref1;

  scope = ['text.jade'];

  tabLength = (_ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.tabLength', {
    scope: scope
  }) : void 0) != null ? _ref : 4;

  softTabs = (_ref1 = typeof atom !== "undefined" && atom !== null ? atom.config.get('editor.softTabs', {
    scope: scope
  }) : void 0) != null ? _ref1 : true;

  defaultIndentSize = (softTabs ? tabLength : 1);

  defaultIndentChar = (softTabs ? " " : "\t");

  defaultIndentWithTabs = !softTabs;

  module.exports = {
    name: "Jade",
    namespace: "jade",
    fallback: ['html'],

    /*
    Supported Grammars
     */
    grammars: ["Jade"],

    /*
    Supported extensions
     */
    extensions: ["jade"],
    options: [
      {
        indent_size: {
          type: 'integer',
          "default": defaultIndentSize,
          minimum: 0,
          description: "Indentation size/length"
        },
        indent_char: {
          type: 'string',
          "default": defaultIndentChar,
          description: "Indentation character"
        },
        omit_div: {
          type: 'boolean',
          "default": false,
          description: "Whether to omit/remove the 'div' tags."
        }
      }
    ],
    defaultBeautifier: "Pug Beautify"
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvamFkZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsb0dBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsQ0FBQyxXQUFELENBQVIsQ0FBQTs7QUFBQSxFQUNBLFNBQUE7O2dDQUFpRSxDQURqRSxDQUFBOztBQUFBLEVBRUEsUUFBQTs7aUNBQStELElBRi9ELENBQUE7O0FBQUEsRUFHQSxpQkFBQSxHQUFvQixDQUFJLFFBQUgsR0FBaUIsU0FBakIsR0FBZ0MsQ0FBakMsQ0FIcEIsQ0FBQTs7QUFBQSxFQUlBLGlCQUFBLEdBQW9CLENBQUksUUFBSCxHQUFpQixHQUFqQixHQUEwQixJQUEzQixDQUpwQixDQUFBOztBQUFBLEVBS0EscUJBQUEsR0FBd0IsQ0FBQSxRQUx4QixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUVmLElBQUEsRUFBTSxNQUZTO0FBQUEsSUFHZixTQUFBLEVBQVcsTUFISTtBQUFBLElBSWYsUUFBQSxFQUFVLENBQUMsTUFBRCxDQUpLO0FBTWY7QUFBQTs7T0FOZTtBQUFBLElBU2YsUUFBQSxFQUFVLENBQ1IsTUFEUSxDQVRLO0FBYWY7QUFBQTs7T0FiZTtBQUFBLElBZ0JmLFVBQUEsRUFBWSxDQUNWLE1BRFUsQ0FoQkc7QUFBQSxJQW9CZixPQUFBLEVBQVM7TUFDUDtBQUFBLFFBQUEsV0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFVBQ0EsU0FBQSxFQUFTLGlCQURUO0FBQUEsVUFFQSxPQUFBLEVBQVMsQ0FGVDtBQUFBLFVBR0EsV0FBQSxFQUFhLHlCQUhiO1NBREY7QUFBQSxRQUtBLFdBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxVQUNBLFNBQUEsRUFBUyxpQkFEVDtBQUFBLFVBRUEsV0FBQSxFQUFhLHVCQUZiO1NBTkY7QUFBQSxRQVNBLFFBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxVQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsVUFFQSxXQUFBLEVBQWEsd0NBRmI7U0FWRjtPQURPO0tBcEJNO0FBQUEsSUFvQ2YsaUJBQUEsRUFBbUIsY0FwQ0o7R0FQakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/atom-beautify/src/languages/jade.coffee
