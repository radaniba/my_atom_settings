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
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFFBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FBWCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLElBQVY7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsUUFBQSxDQUFTLEtBQUssQ0FBQyxhQUFmLEVBRFI7SUFBQSxDQUZWO0FBQUEsSUFLQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQUEsRUFEVTtJQUFBLENBTFo7QUFBQSxJQVFBLFNBQUEsRUFBVyxTQUFBLEdBQUE7YUFDVDtBQUFBLFFBQUEsYUFBQSxFQUFlLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQWY7UUFEUztJQUFBLENBUlg7QUFBQSxJQVdBLE1BQUEsRUFDRTtBQUFBLE1BQUEsU0FBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sYUFBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLDJHQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0sUUFGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLEVBSFQ7T0FERjtBQUFBLE1BS0Esd0JBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLDhCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsZ0NBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsS0FIVDtPQU5GO0FBQUEsTUFVQSxvQkFBQSxFQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sd0JBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSx3RkFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxFQUhUO09BWEY7QUFBQSxNQWVBLE9BQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLFVBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxrRkFEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxLQUhUO09BaEJGO0tBWkY7R0FIRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/Rad/.atom/packages/gist-it/lib/gist-it.coffee