(function() {
  var __slice = [].slice;

  module.exports = {
    prefix: 'autocomplete-python:',
    debug: function() {
      var msg;
      msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (atom.config.get('autocomplete-python.outputDebug')) {
        return console.debug.apply(console, [this.prefix].concat(__slice.call(msg)));
      }
    },
    warning: function() {
      var msg;
      msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return console.warn.apply(console, [this.prefix].concat(__slice.call(msg)));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9sb2cuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLHNCQUFSO0FBQUEsSUFDQSxLQUFBLEVBQU8sU0FBQSxHQUFBO0FBQ0wsVUFBQSxHQUFBO0FBQUEsTUFETSw2REFDTixDQUFBO0FBQUEsTUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FBSDtBQUNFLGVBQU8sT0FBTyxDQUFDLEtBQVIsZ0JBQWMsQ0FBQSxJQUFDLENBQUEsTUFBUSxTQUFBLGFBQUEsR0FBQSxDQUFBLENBQXZCLENBQVAsQ0FERjtPQURLO0lBQUEsQ0FEUDtBQUFBLElBS0EsT0FBQSxFQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsR0FBQTtBQUFBLE1BRFEsNkRBQ1IsQ0FBQTtBQUFBLGFBQU8sT0FBTyxDQUFDLElBQVIsZ0JBQWEsQ0FBQSxJQUFDLENBQUEsTUFBUSxTQUFBLGFBQUEsR0FBQSxDQUFBLENBQXRCLENBQVAsQ0FETztJQUFBLENBTFQ7R0FERixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/Rad/.atom/packages/autocomplete-python/lib/log.coffee
