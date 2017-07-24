(function() {
  module.exports = {
    personalAccessToken: {
      description: 'Your personal GitHub access token',
      type: 'string',
      "default": '',
      order: 1
    },
    gistId: {
      description: 'ID of gist to use for configuration storage',
      type: 'string',
      "default": '',
      order: 2
    },
    gistDescription: {
      description: 'The description of the gist',
      type: 'string',
      "default": 'automatic update by http://atom.io/packages/sync-settings',
      order: 3
    },
    syncSettings: {
      type: 'boolean',
      "default": true,
      order: 4
    },
    blacklistedKeys: {
      description: "Comma-seperated list of blacklisted keys (e.g. 'package-name,other-package-name.config-name')",
      type: 'array',
      "default": [],
      items: {
        type: 'string'
      },
      order: 5
    },
    syncPackages: {
      type: 'boolean',
      "default": true,
      order: 6
    },
    syncKeymap: {
      type: 'boolean',
      "default": true,
      order: 7
    },
    syncStyles: {
      type: 'boolean',
      "default": true,
      order: 8
    },
    syncInit: {
      type: 'boolean',
      "default": true,
      order: 9
    },
    syncSnippets: {
      type: 'boolean',
      "default": true,
      order: 10
    },
    extraFiles: {
      description: 'Comma-seperated list of files other than Atom\'s default config files in ~/.atom',
      type: 'array',
      "default": [],
      items: {
        type: 'string'
      },
      order: 11
    },
    analytics: {
      type: 'boolean',
      "default": true,
      description: "There is Segment.io which forwards data to Google Analytics to track what versions and platforms are used. Everything is anonymized and no personal information, such as source code, is sent. See the README.md for more details.",
      order: 12
    },
    _analyticsUserId: {
      type: 'string',
      "default": "",
      description: "Unique identifier for this user for tracking usage analytics",
      order: 13
    },
    checkForUpdatedBackup: {
      description: 'Check for newer backup on Atom start',
      type: 'boolean',
      "default": true,
      order: 14
    },
    _lastBackupHash: {
      type: 'string',
      "default": '',
      description: 'Hash of the last backup restored or created',
      order: 15
    },
    quietUpdateCheck: {
      type: 'boolean',
      "default": false,
      description: "Mute 'Latest backup is already applied' message",
      order: 16
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi9jb25maWcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZixtQkFBQSxFQUNFO0FBQUEsTUFBQSxXQUFBLEVBQWEsbUNBQWI7QUFBQSxNQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsRUFGVDtBQUFBLE1BR0EsS0FBQSxFQUFPLENBSFA7S0FGYTtBQUFBLElBTWYsTUFBQSxFQUNFO0FBQUEsTUFBQSxXQUFBLEVBQWEsNkNBQWI7QUFBQSxNQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsRUFGVDtBQUFBLE1BR0EsS0FBQSxFQUFPLENBSFA7S0FQYTtBQUFBLElBV2YsZUFBQSxFQUNFO0FBQUEsTUFBQSxXQUFBLEVBQWEsNkJBQWI7QUFBQSxNQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsMkRBRlQ7QUFBQSxNQUdBLEtBQUEsRUFBTyxDQUhQO0tBWmE7QUFBQSxJQWdCZixZQUFBLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsTUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLE1BRUEsS0FBQSxFQUFPLENBRlA7S0FqQmE7QUFBQSxJQW9CZixlQUFBLEVBQ0U7QUFBQSxNQUFBLFdBQUEsRUFBYSwrRkFBYjtBQUFBLE1BQ0EsSUFBQSxFQUFNLE9BRE47QUFBQSxNQUVBLFNBQUEsRUFBUyxFQUZUO0FBQUEsTUFHQSxLQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO09BSkY7QUFBQSxNQUtBLEtBQUEsRUFBTyxDQUxQO0tBckJhO0FBQUEsSUEyQmYsWUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLE1BQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxNQUVBLEtBQUEsRUFBTyxDQUZQO0tBNUJhO0FBQUEsSUErQmYsVUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLE1BQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxNQUVBLEtBQUEsRUFBTyxDQUZQO0tBaENhO0FBQUEsSUFtQ2YsVUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLE1BQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxNQUVBLEtBQUEsRUFBTyxDQUZQO0tBcENhO0FBQUEsSUF1Q2YsUUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLE1BQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxNQUVBLEtBQUEsRUFBTyxDQUZQO0tBeENhO0FBQUEsSUEyQ2YsWUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLE1BQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxNQUVBLEtBQUEsRUFBTyxFQUZQO0tBNUNhO0FBQUEsSUErQ2YsVUFBQSxFQUNFO0FBQUEsTUFBQSxXQUFBLEVBQWEsa0ZBQWI7QUFBQSxNQUNBLElBQUEsRUFBTSxPQUROO0FBQUEsTUFFQSxTQUFBLEVBQVMsRUFGVDtBQUFBLE1BR0EsS0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtPQUpGO0FBQUEsTUFLQSxLQUFBLEVBQU8sRUFMUDtLQWhEYTtBQUFBLElBc0RmLFNBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxNQUNBLFNBQUEsRUFBUyxJQURUO0FBQUEsTUFFQSxXQUFBLEVBQWEsb09BRmI7QUFBQSxNQU1BLEtBQUEsRUFBTyxFQU5QO0tBdkRhO0FBQUEsSUE4RGYsZ0JBQUEsRUFDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxNQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsTUFFQSxXQUFBLEVBQWEsOERBRmI7QUFBQSxNQUdBLEtBQUEsRUFBTyxFQUhQO0tBL0RhO0FBQUEsSUFtRWYscUJBQUEsRUFDRTtBQUFBLE1BQUEsV0FBQSxFQUFhLHNDQUFiO0FBQUEsTUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLE1BRUEsU0FBQSxFQUFTLElBRlQ7QUFBQSxNQUdBLEtBQUEsRUFBTyxFQUhQO0tBcEVhO0FBQUEsSUF3RWYsZUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLE1BQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxNQUVBLFdBQUEsRUFBYSw2Q0FGYjtBQUFBLE1BR0EsS0FBQSxFQUFPLEVBSFA7S0F6RWE7QUFBQSxJQTZFZixnQkFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLE1BQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxNQUVBLFdBQUEsRUFBYSxpREFGYjtBQUFBLE1BR0EsS0FBQSxFQUFPLEVBSFA7S0E5RWE7R0FBakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/sync-settings/lib/config.coffee
