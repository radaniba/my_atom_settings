(function() {
  module.exports = {
    ignoreWhitespace: {
      title: 'Ignore Whitespace',
      description: 'Will not diff whitespace when this box is checked.',
      type: 'boolean',
      "default": false
    },
    diffWords: {
      title: 'Show Word Diff',
      description: 'Diffs the words between each line when this box is checked.',
      type: 'boolean',
      "default": true
    },
    syncHorizontalScroll: {
      title: 'Sync Horizontal Scroll',
      description: 'Syncs the horizontal scrolling of the editors.',
      type: 'boolean',
      "default": false
    },
    leftEditorColor: {
      title: 'Left Editor Color',
      description: 'Specifies the highlight color for the left editor.',
      type: 'string',
      "default": 'green',
      "enum": ['green', 'red']
    },
    rightEditorColor: {
      title: 'Right Editor Color',
      description: 'Specifies the highlight color for the right editor.',
      type: 'string',
      "default": 'red',
      "enum": ['green', 'red']
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9jb25maWctc2NoZW1hLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxnQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG1CQUFQO01BQ0EsV0FBQSxFQUFhLG9EQURiO01BRUEsSUFBQSxFQUFNLFNBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7S0FERjtJQUtBLFNBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxnQkFBUDtNQUNBLFdBQUEsRUFBYSw2REFEYjtNQUVBLElBQUEsRUFBTSxTQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO0tBTkY7SUFVQSxvQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLHdCQUFQO01BQ0EsV0FBQSxFQUFhLGdEQURiO01BRUEsSUFBQSxFQUFNLFNBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7S0FYRjtJQWVBLGVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxtQkFBUDtNQUNBLFdBQUEsRUFBYSxvREFEYjtNQUVBLElBQUEsRUFBTSxRQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO01BSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxLQUFWLENBSk47S0FoQkY7SUFxQkEsZ0JBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxvQkFBUDtNQUNBLFdBQUEsRUFBYSxxREFEYjtNQUVBLElBQUEsRUFBTSxRQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO01BSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxLQUFWLENBSk47S0F0QkY7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIGlnbm9yZVdoaXRlc3BhY2U6XG4gICAgdGl0bGU6ICdJZ25vcmUgV2hpdGVzcGFjZSdcbiAgICBkZXNjcmlwdGlvbjogJ1dpbGwgbm90IGRpZmYgd2hpdGVzcGFjZSB3aGVuIHRoaXMgYm94IGlzIGNoZWNrZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gIGRpZmZXb3JkczpcbiAgICB0aXRsZTogJ1Nob3cgV29yZCBEaWZmJ1xuICAgIGRlc2NyaXB0aW9uOiAnRGlmZnMgdGhlIHdvcmRzIGJldHdlZW4gZWFjaCBsaW5lIHdoZW4gdGhpcyBib3ggaXMgY2hlY2tlZC4nXG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogdHJ1ZVxuICBzeW5jSG9yaXpvbnRhbFNjcm9sbDpcbiAgICB0aXRsZTogJ1N5bmMgSG9yaXpvbnRhbCBTY3JvbGwnXG4gICAgZGVzY3JpcHRpb246ICdTeW5jcyB0aGUgaG9yaXpvbnRhbCBzY3JvbGxpbmcgb2YgdGhlIGVkaXRvcnMuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gIGxlZnRFZGl0b3JDb2xvcjpcbiAgICB0aXRsZTogJ0xlZnQgRWRpdG9yIENvbG9yJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmaWVzIHRoZSBoaWdobGlnaHQgY29sb3IgZm9yIHRoZSBsZWZ0IGVkaXRvci4nXG4gICAgdHlwZTogJ3N0cmluZydcbiAgICBkZWZhdWx0OiAnZ3JlZW4nXG4gICAgZW51bTogWydncmVlbicsICdyZWQnXVxuICByaWdodEVkaXRvckNvbG9yOlxuICAgIHRpdGxlOiAnUmlnaHQgRWRpdG9yIENvbG9yJ1xuICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmaWVzIHRoZSBoaWdobGlnaHQgY29sb3IgZm9yIHRoZSByaWdodCBlZGl0b3IuJ1xuICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgZGVmYXVsdDogJ3JlZCdcbiAgICBlbnVtOiBbJ2dyZWVuJywgJ3JlZCddXG4iXX0=
