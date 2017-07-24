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
    scrollSyncType: {
      title: 'Sync Scrolling',
      description: 'Syncs the scrolling of the editors.',
      type: 'string',
      "default": 'Vertical + Horizontal',
      "enum": ['Vertical + Horizontal', 'Vertical', 'None'],
      order: 4
    },
    leftEditorColor: {
      title: 'Left Editor Color',
      description: 'Specifies the highlight color for the left editor.',
      type: 'string',
      "default": 'green',
      "enum": ['green', 'red'],
      order: 5
    },
    rightEditorColor: {
      title: 'Right Editor Color',
      description: 'Specifies the highlight color for the right editor.',
      type: 'string',
      "default": 'red',
      "enum": ['green', 'red'],
      order: 6
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9jb25maWctc2NoZW1hLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxTQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sZ0JBQVA7TUFDQSxXQUFBLEVBQWEsNkRBRGI7TUFFQSxJQUFBLEVBQU0sU0FGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtNQUlBLEtBQUEsRUFBTyxDQUpQO0tBREY7SUFNQSxnQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG1CQUFQO01BQ0EsV0FBQSxFQUFhLG9EQURiO01BRUEsSUFBQSxFQUFNLFNBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQVBGO0lBWUEsaUJBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxvQkFBUDtNQUNBLFdBQUEsRUFBYSwyREFEYjtNQUVBLElBQUEsRUFBTSxTQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO01BSUEsS0FBQSxFQUFPLENBSlA7S0FiRjtJQWtCQSxjQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sZ0JBQVA7TUFDQSxXQUFBLEVBQWEscUNBRGI7TUFFQSxJQUFBLEVBQU0sUUFGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsdUJBSFQ7TUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsdUJBQUQsRUFBMEIsVUFBMUIsRUFBc0MsTUFBdEMsQ0FKTjtNQUtBLEtBQUEsRUFBTyxDQUxQO0tBbkJGO0lBeUJBLGVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxtQkFBUDtNQUNBLFdBQUEsRUFBYSxvREFEYjtNQUVBLElBQUEsRUFBTSxRQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO01BSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxLQUFWLENBSk47TUFLQSxLQUFBLEVBQU8sQ0FMUDtLQTFCRjtJQWdDQSxnQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG9CQUFQO01BQ0EsV0FBQSxFQUFhLHFEQURiO01BRUEsSUFBQSxFQUFNLFFBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7TUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FKTjtNQUtBLEtBQUEsRUFBTyxDQUxQO0tBakNGOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBkaWZmV29yZHM6XG4gICAgdGl0bGU6ICdTaG93IFdvcmQgRGlmZidcbiAgICBkZXNjcmlwdGlvbjogJ0RpZmZzIHRoZSB3b3JkcyBiZXR3ZWVuIGVhY2ggbGluZSB3aGVuIHRoaXMgYm94IGlzIGNoZWNrZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBvcmRlcjogMVxuICBpZ25vcmVXaGl0ZXNwYWNlOlxuICAgIHRpdGxlOiAnSWdub3JlIFdoaXRlc3BhY2UnXG4gICAgZGVzY3JpcHRpb246ICdXaWxsIG5vdCBkaWZmIHdoaXRlc3BhY2Ugd2hlbiB0aGlzIGJveCBpcyBjaGVja2VkLidcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIG9yZGVyOiAyXG4gIG11dGVOb3RpZmljYXRpb25zOlxuICAgIHRpdGxlOiAnTXV0ZSBOb3RpZmljYXRpb25zJ1xuICAgIGRlc2NyaXB0aW9uOiAnTXV0ZXMgYWxsIHdhcm5pbmcgbm90aWZpY2F0aW9ucyB3aGVuIHRoaXMgYm94IGlzIGNoZWNrZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgb3JkZXI6IDNcbiAgc2Nyb2xsU3luY1R5cGU6XG4gICAgdGl0bGU6ICdTeW5jIFNjcm9sbGluZydcbiAgICBkZXNjcmlwdGlvbjogJ1N5bmNzIHRoZSBzY3JvbGxpbmcgb2YgdGhlIGVkaXRvcnMuJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCdcbiAgICBlbnVtOiBbJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCcsICdWZXJ0aWNhbCcsICdOb25lJ11cbiAgICBvcmRlcjogNFxuICBsZWZ0RWRpdG9yQ29sb3I6XG4gICAgdGl0bGU6ICdMZWZ0IEVkaXRvciBDb2xvcidcbiAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZmllcyB0aGUgaGlnaGxpZ2h0IGNvbG9yIGZvciB0aGUgbGVmdCBlZGl0b3IuJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ2dyZWVuJ1xuICAgIGVudW06IFsnZ3JlZW4nLCAncmVkJ11cbiAgICBvcmRlcjogNVxuICByaWdodEVkaXRvckNvbG9yOlxuICAgIHRpdGxlOiAnUmlnaHQgRWRpdG9yIENvbG9yJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmaWVzIHRoZSBoaWdobGlnaHQgY29sb3IgZm9yIHRoZSByaWdodCBlZGl0b3IuJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ3JlZCdcbiAgICBlbnVtOiBbJ2dyZWVuJywgJ3JlZCddXG4gICAgb3JkZXI6IDZcbiJdfQ==
