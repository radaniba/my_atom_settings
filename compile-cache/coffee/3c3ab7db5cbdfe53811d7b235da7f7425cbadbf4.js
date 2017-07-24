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
    checkForUpdatedBackup: {
      description: 'Check for newer backup on Atom start',
      type: 'boolean',
      "default": true,
      order: 12
    },
    _lastBackupHash: {
      type: 'string',
      "default": '',
      description: 'Hash of the last backup restored or created',
      order: 13
    },
    quietUpdateCheck: {
      type: 'boolean',
      "default": false,
      description: "Mute 'Latest backup is already applied' message",
      order: 14
    },
    removeObsoletePackages: {
      description: 'Packages installed but not in the backup will be removed when restoring backups',
      type: 'boolean',
      "default": false,
      order: 15
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW5jLXNldHRpbmdzL2xpYi9jb25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDZixtQkFBQSxFQUNFO01BQUEsV0FBQSxFQUFhLG1DQUFiO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRlQ7TUFHQSxLQUFBLEVBQU8sQ0FIUDtLQUZhO0lBTWYsTUFBQSxFQUNFO01BQUEsV0FBQSxFQUFhLDZDQUFiO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRlQ7TUFHQSxLQUFBLEVBQU8sQ0FIUDtLQVBhO0lBV2YsZUFBQSxFQUNFO01BQUEsV0FBQSxFQUFhLDZCQUFiO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLDJEQUZUO01BR0EsS0FBQSxFQUFPLENBSFA7S0FaYTtJQWdCZixZQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtNQUVBLEtBQUEsRUFBTyxDQUZQO0tBakJhO0lBb0JmLGVBQUEsRUFDRTtNQUFBLFdBQUEsRUFBYSwrRkFBYjtNQUNBLElBQUEsRUFBTSxPQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO01BR0EsS0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47T0FKRjtNQUtBLEtBQUEsRUFBTyxDQUxQO0tBckJhO0lBMkJmLFlBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxTQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO01BRUEsS0FBQSxFQUFPLENBRlA7S0E1QmE7SUErQmYsVUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7TUFFQSxLQUFBLEVBQU8sQ0FGUDtLQWhDYTtJQW1DZixVQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtNQUVBLEtBQUEsRUFBTyxDQUZQO0tBcENhO0lBdUNmLFFBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxTQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO01BRUEsS0FBQSxFQUFPLENBRlA7S0F4Q2E7SUEyQ2YsWUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7TUFFQSxLQUFBLEVBQU8sRUFGUDtLQTVDYTtJQStDZixVQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQWEsa0ZBQWI7TUFDQSxJQUFBLEVBQU0sT0FETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtNQUdBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO09BSkY7TUFLQSxLQUFBLEVBQU8sRUFMUDtLQWhEYTtJQXNEZixxQkFBQSxFQUNFO01BQUEsV0FBQSxFQUFhLHNDQUFiO01BQ0EsSUFBQSxFQUFNLFNBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7TUFHQSxLQUFBLEVBQU8sRUFIUDtLQXZEYTtJQTJEZixlQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtNQUVBLFdBQUEsRUFBYSw2Q0FGYjtNQUdBLEtBQUEsRUFBTyxFQUhQO0tBNURhO0lBZ0VmLGdCQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtNQUVBLFdBQUEsRUFBYSxpREFGYjtNQUdBLEtBQUEsRUFBTyxFQUhQO0tBakVhO0lBcUVmLHNCQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQWEsaUZBQWI7TUFDQSxJQUFBLEVBQU0sU0FETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtNQUdBLEtBQUEsRUFBTyxFQUhQO0tBdEVhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xuICBwZXJzb25hbEFjY2Vzc1Rva2VuOlxuICAgIGRlc2NyaXB0aW9uOiAnWW91ciBwZXJzb25hbCBHaXRIdWIgYWNjZXNzIHRva2VuJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJydcbiAgICBvcmRlcjogMVxuICBnaXN0SWQ6XG4gICAgZGVzY3JpcHRpb246ICdJRCBvZiBnaXN0IHRvIHVzZSBmb3IgY29uZmlndXJhdGlvbiBzdG9yYWdlJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJydcbiAgICBvcmRlcjogMlxuICBnaXN0RGVzY3JpcHRpb246XG4gICAgZGVzY3JpcHRpb246ICdUaGUgZGVzY3JpcHRpb24gb2YgdGhlIGdpc3QnXG4gICAgdHlwZTogJ3N0cmluZydcbiAgICBkZWZhdWx0OiAnYXV0b21hdGljIHVwZGF0ZSBieSBodHRwOi8vYXRvbS5pby9wYWNrYWdlcy9zeW5jLXNldHRpbmdzJ1xuICAgIG9yZGVyOiAzXG4gIHN5bmNTZXR0aW5nczpcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgb3JkZXI6IDRcbiAgYmxhY2tsaXN0ZWRLZXlzOlxuICAgIGRlc2NyaXB0aW9uOiBcIkNvbW1hLXNlcGVyYXRlZCBsaXN0IG9mIGJsYWNrbGlzdGVkIGtleXMgKGUuZy4gJ3BhY2thZ2UtbmFtZSxvdGhlci1wYWNrYWdlLW5hbWUuY29uZmlnLW5hbWUnKVwiXG4gICAgdHlwZTogJ2FycmF5J1xuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIG9yZGVyOiA1XG4gIHN5bmNQYWNrYWdlczpcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgb3JkZXI6IDZcbiAgc3luY0tleW1hcDpcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgb3JkZXI6IDdcbiAgc3luY1N0eWxlczpcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgb3JkZXI6IDhcbiAgc3luY0luaXQ6XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiA5XG4gIHN5bmNTbmlwcGV0czpcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgb3JkZXI6IDEwXG4gIGV4dHJhRmlsZXM6XG4gICAgZGVzY3JpcHRpb246ICdDb21tYS1zZXBlcmF0ZWQgbGlzdCBvZiBmaWxlcyBvdGhlciB0aGFuIEF0b21cXCdzIGRlZmF1bHQgY29uZmlnIGZpbGVzIGluIH4vLmF0b20nXG4gICAgdHlwZTogJ2FycmF5J1xuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIG9yZGVyOiAxMVxuICBjaGVja0ZvclVwZGF0ZWRCYWNrdXA6XG4gICAgZGVzY3JpcHRpb246ICdDaGVjayBmb3IgbmV3ZXIgYmFja3VwIG9uIEF0b20gc3RhcnQnXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiAxMlxuICBfbGFzdEJhY2t1cEhhc2g6XG4gICAgdHlwZTogJ3N0cmluZydcbiAgICBkZWZhdWx0OiAnJ1xuICAgIGRlc2NyaXB0aW9uOiAnSGFzaCBvZiB0aGUgbGFzdCBiYWNrdXAgcmVzdG9yZWQgb3IgY3JlYXRlZCdcbiAgICBvcmRlcjogMTNcbiAgcXVpZXRVcGRhdGVDaGVjazpcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIk11dGUgJ0xhdGVzdCBiYWNrdXAgaXMgYWxyZWFkeSBhcHBsaWVkJyBtZXNzYWdlXCJcbiAgICBvcmRlcjogMTRcbiAgcmVtb3ZlT2Jzb2xldGVQYWNrYWdlczpcbiAgICBkZXNjcmlwdGlvbjogJ1BhY2thZ2VzIGluc3RhbGxlZCBidXQgbm90IGluIHRoZSBiYWNrdXAgd2lsbCBiZSByZW1vdmVkIHdoZW4gcmVzdG9yaW5nIGJhY2t1cHMnXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBvcmRlcjogMTVcbn1cbiJdfQ==
