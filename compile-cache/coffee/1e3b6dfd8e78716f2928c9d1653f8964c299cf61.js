(function() {
  module.exports = {
    diffWords: {
      title: 'Show Word Diff',
      description: 'Diffs the words between each line when this box is checked.',
      type: 'boolean',
      "default": true,
      order: 1
    },
    ignoreWhitespace: {
      title: 'Ignore Whitespace',
      description: 'Will not diff whitespace when this box is checked.',
      type: 'boolean',
      "default": false,
      order: 2
    },
    muteNotifications: {
      title: 'Mute Notifications',
      description: 'Mutes all warning notifications when this box is checked.',
      type: 'boolean',
      "default": false,
      order: 3
    },
    hideTreeView: {
      title: 'Hide Tree View',
      description: 'Hides Tree View during diff - shows when finished.',
      type: 'boolean',
      "default": false,
      order: 4
    },
    scrollSyncType: {
      title: 'Sync Scrolling',
      description: 'Syncs the scrolling of the editors.',
      type: 'string',
      "default": 'Vertical + Horizontal',
      "enum": ['Vertical + Horizontal', 'Vertical', 'None'],
      order: 5
    },
    leftEditorColor: {
      title: 'Left Editor Color',
      description: 'Specifies the highlight color for the left editor.',
      type: 'string',
      "default": 'green',
      "enum": ['green', 'red'],
      order: 6
    },
    rightEditorColor: {
      title: 'Right Editor Color',
      description: 'Specifies the highlight color for the right editor.',
      type: 'string',
      "default": 'red',
      "enum": ['green', 'red'],
      order: 7
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9jb25maWctc2NoZW1hLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxTQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sZ0JBQVA7TUFDQSxXQUFBLEVBQWEsNkRBRGI7TUFFQSxJQUFBLEVBQU0sU0FGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtNQUlBLEtBQUEsRUFBTyxDQUpQO0tBREY7SUFNQSxnQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG1CQUFQO01BQ0EsV0FBQSxFQUFhLG9EQURiO01BRUEsSUFBQSxFQUFNLFNBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQVBGO0lBWUEsaUJBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxvQkFBUDtNQUNBLFdBQUEsRUFBYSwyREFEYjtNQUVBLElBQUEsRUFBTSxTQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO01BSUEsS0FBQSxFQUFPLENBSlA7S0FiRjtJQWtCQSxZQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sZ0JBQVA7TUFDQSxXQUFBLEVBQWEsb0RBRGI7TUFFQSxJQUFBLEVBQU0sU0FGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtNQUlBLEtBQUEsRUFBTyxDQUpQO0tBbkJGO0lBd0JBLGNBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxnQkFBUDtNQUNBLFdBQUEsRUFBYSxxQ0FEYjtNQUVBLElBQUEsRUFBTSxRQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyx1QkFIVDtNQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyx1QkFBRCxFQUEwQixVQUExQixFQUFzQyxNQUF0QyxDQUpOO01BS0EsS0FBQSxFQUFPLENBTFA7S0F6QkY7SUErQkEsZUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG1CQUFQO01BQ0EsV0FBQSxFQUFhLG9EQURiO01BRUEsSUFBQSxFQUFNLFFBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BSFQ7TUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FKTjtNQUtBLEtBQUEsRUFBTyxDQUxQO0tBaENGO0lBc0NBLGdCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sb0JBQVA7TUFDQSxXQUFBLEVBQWEscURBRGI7TUFFQSxJQUFBLEVBQU0sUUFGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtNQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsS0FBVixDQUpOO01BS0EsS0FBQSxFQUFPLENBTFA7S0F2Q0Y7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIGRpZmZXb3JkczpcbiAgICB0aXRsZTogJ1Nob3cgV29yZCBEaWZmJ1xuICAgIGRlc2NyaXB0aW9uOiAnRGlmZnMgdGhlIHdvcmRzIGJldHdlZW4gZWFjaCBsaW5lIHdoZW4gdGhpcyBib3ggaXMgY2hlY2tlZC4nXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIG9yZGVyOiAxXG4gIGlnbm9yZVdoaXRlc3BhY2U6XG4gICAgdGl0bGU6ICdJZ25vcmUgV2hpdGVzcGFjZSdcbiAgICBkZXNjcmlwdGlvbjogJ1dpbGwgbm90IGRpZmYgd2hpdGVzcGFjZSB3aGVuIHRoaXMgYm94IGlzIGNoZWNrZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgb3JkZXI6IDJcbiAgbXV0ZU5vdGlmaWNhdGlvbnM6XG4gICAgdGl0bGU6ICdNdXRlIE5vdGlmaWNhdGlvbnMnXG4gICAgZGVzY3JpcHRpb246ICdNdXRlcyBhbGwgd2FybmluZyBub3RpZmljYXRpb25zIHdoZW4gdGhpcyBib3ggaXMgY2hlY2tlZC4nXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBvcmRlcjogM1xuICBoaWRlVHJlZVZpZXc6XG4gICAgdGl0bGU6ICdIaWRlIFRyZWUgVmlldydcbiAgICBkZXNjcmlwdGlvbjogJ0hpZGVzIFRyZWUgVmlldyBkdXJpbmcgZGlmZiAtIHNob3dzIHdoZW4gZmluaXNoZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgb3JkZXI6IDRcbiAgc2Nyb2xsU3luY1R5cGU6XG4gICAgdGl0bGU6ICdTeW5jIFNjcm9sbGluZydcbiAgICBkZXNjcmlwdGlvbjogJ1N5bmNzIHRoZSBzY3JvbGxpbmcgb2YgdGhlIGVkaXRvcnMuJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCdcbiAgICBlbnVtOiBbJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCcsICdWZXJ0aWNhbCcsICdOb25lJ11cbiAgICBvcmRlcjogNVxuICBsZWZ0RWRpdG9yQ29sb3I6XG4gICAgdGl0bGU6ICdMZWZ0IEVkaXRvciBDb2xvcidcbiAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZmllcyB0aGUgaGlnaGxpZ2h0IGNvbG9yIGZvciB0aGUgbGVmdCBlZGl0b3IuJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ2dyZWVuJ1xuICAgIGVudW06IFsnZ3JlZW4nLCAncmVkJ11cbiAgICBvcmRlcjogNlxuICByaWdodEVkaXRvckNvbG9yOlxuICAgIHRpdGxlOiAnUmlnaHQgRWRpdG9yIENvbG9yJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmaWVzIHRoZSBoaWdobGlnaHQgY29sb3IgZm9yIHRoZSByaWdodCBlZGl0b3IuJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ3JlZCdcbiAgICBlbnVtOiBbJ2dyZWVuJywgJ3JlZCddXG4gICAgb3JkZXI6IDdcbiJdfQ==
