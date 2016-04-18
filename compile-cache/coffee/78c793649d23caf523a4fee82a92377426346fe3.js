(function() {
  var provider;

  provider = require('./provider');

  module.exports = {
    config: provider.config,
    activate: function() {
      return console.log('activate aligner-php');
    },
    getProvider: function() {
      return provider;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hbGlnbmVyLXBocC9saWIvbWFpbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsUUFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUFYLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsUUFBUSxDQUFDLE1BQWpCO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQSxHQUFBO2FBQ1IsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQkFBWixFQURRO0lBQUEsQ0FGVjtBQUFBLElBS0EsV0FBQSxFQUFhLFNBQUEsR0FBQTthQUFHLFNBQUg7SUFBQSxDQUxiO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/aligner-php/lib/main.coffee
