(function() {
  var AskStackView;

  AskStackView = require('./ask-stack-view');

  module.exports = {
    config: {
      autoDetectLanguage: true
    },
    askStackView: null,
    activate: function(state) {
      return this.askStackView = new AskStackView(state.askStackViewState);
    },
    deactivate: function() {
      return this.askStackView.destroy();
    },
    serialize: function() {
      return {
        askStackViewState: this.askStackView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hc2stc3RhY2svbGliL2Fzay1zdGFjay5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsWUFBQTs7QUFBQSxFQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVIsQ0FBZixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxrQkFBQSxFQUFvQixJQUFwQjtLQURGO0FBQUEsSUFFQSxZQUFBLEVBQWMsSUFGZDtBQUFBLElBSUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxZQUFBLENBQWEsS0FBSyxDQUFDLGlCQUFuQixFQURaO0lBQUEsQ0FKVjtBQUFBLElBT0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFBLEVBRFU7SUFBQSxDQVBaO0FBQUEsSUFVQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1Q7QUFBQSxRQUFBLGlCQUFBLEVBQW1CLElBQUMsQ0FBQSxZQUFZLENBQUMsU0FBZCxDQUFBLENBQW5CO1FBRFM7SUFBQSxDQVZYO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/ask-stack/lib/ask-stack.coffee
