(function() {
  var GistView;

  GistView = require('./gist-view');

  module.exports = {
    gistView: null,
    activate: function(state) {
      return this.gistView = new GistView(state.gistViewState);
    },
    deactivate: function() {
      return this.gistView.destroy();
    },
    serialize: function() {
      return {
        gistViewState: this.gistView.serialize()
      };
    },
    config: {
      userToken: {
        title: 'OAuth token',
        description: 'Enter an OAuth token to have Gists posted to your GitHub account. This token must include the gist scope.',
        type: 'string',
        "default": ''
      },
      newGistsDefaultToPrivate: {
        title: 'New Gists default to private',
        description: 'Make Gists private by default.',
        type: 'boolean',
        "default": false
      },
      gitHubEnterpriseHost: {
        title: 'GitHub Enterprise Host',
        description: 'If you want to publish Gists to a GitHub Enterprise instance, enter the hostname here.',
        type: 'string',
        "default": ''
      },
      useHttp: {
        title: 'Use HTTP',
        description: 'Enable if your GitHub Enterprise instance is only available via HTTP, not HTTPS.',
        type: 'boolean',
        "default": false
      },
      openAfterCreate: {
        title: 'Open new Gist after create',
        description: 'Automatically open newly created Gists in the default web browser.',
        type: 'boolean',
        "default": false
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXN0LWl0L2xpYi9naXN0LWl0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxRQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBQVgsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxJQUFWO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLFFBQUEsQ0FBUyxLQUFLLENBQUMsYUFBZixFQURSO0lBQUEsQ0FGVjtBQUFBLElBS0EsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBLEVBRFU7SUFBQSxDQUxaO0FBQUEsSUFRQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1Q7QUFBQSxRQUFBLGFBQUEsRUFBZSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBQSxDQUFmO1FBRFM7SUFBQSxDQVJYO0FBQUEsSUFXQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGFBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSwyR0FEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxFQUhUO09BREY7QUFBQSxNQUtBLHdCQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyw4QkFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLGdDQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sU0FGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLEtBSFQ7T0FORjtBQUFBLE1BVUEsb0JBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLHdCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsd0ZBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxRQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsRUFIVDtPQVhGO0FBQUEsTUFlQSxPQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxVQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsa0ZBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsS0FIVDtPQWhCRjtBQUFBLE1Bb0JBLGVBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLDRCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsb0VBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsS0FIVDtPQXJCRjtLQVpGO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/gist-it/lib/gist-it.coffee
