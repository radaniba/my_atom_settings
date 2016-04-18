(function() {
  var provider;

  provider = require('./provider');

  module.exports = {
    activate: function() {
      return provider.loadKeywords();
    },
    getProvider: function() {
      return provider;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtYXdrL2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixRQUFRLENBQUMsWUFBVCxDQUFBLEVBRFE7SUFBQSxDQUFWO0FBQUEsSUFHQSxXQUFBLEVBQWEsU0FBQSxHQUFBO2FBQUcsU0FBSDtJQUFBLENBSGI7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-awk/lib/main.coffee
