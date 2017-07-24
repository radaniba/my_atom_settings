(function() {
  module.exports = {
    name: "LaTeX",
    namespace: "latex",
    scope: ['source.tex'],

    /*
    Supported Grammars
     */
    grammars: ["LaTeX"],

    /*
    Supported extensions
     */
    extensions: ["tex"],
    defaultBeautifier: "Latex Beautify",

    /*
     */
    options: {
      indent_char: {
        type: 'string',
        "default": null,
        description: "Indentation character"
      },
      indent_with_tabs: {
        type: 'boolean',
        "default": null,
        description: "Indentation uses tabs, overrides `Indent Size` and `Indent Char`"
      },
      indent_preamble: {
        type: 'boolean',
        "default": false,
        description: "Indent the preable"
      },
      always_look_for_split_braces: {
        type: 'boolean',
        "default": true,
        description: "If `latexindent` should look for commands that split braces across lines"
      },
      always_look_for_split_brackets: {
        type: 'boolean',
        "default": false,
        description: "If `latexindent` should look for commands that split brackets across lines"
      },
      remove_trailing_whitespace: {
        type: 'boolean',
        "default": false,
        description: "Remove trailing whitespace"
      },
      align_columns_in_environments: {
        type: 'array',
        "default": ["tabular", "matrix", "bmatrix", "pmatrix"],
        decription: "Aligns columns by the alignment tabs for environments specified"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvbGF0ZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sT0FGUztJQUdmLFNBQUEsRUFBVyxPQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsWUFBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixPQURRLENBVEs7O0FBYWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLEtBRFUsQ0FoQkc7SUFvQmYsaUJBQUEsRUFBbUIsZ0JBcEJKOztBQXNCZjs7SUFHQSxPQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSx1QkFGYjtPQURGO01BSUEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLGtFQUZiO09BTEY7TUFRQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxvQkFGYjtPQVRGO01BWUEsNEJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLDBFQUZiO09BYkY7TUFnQkEsOEJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLDRFQUZiO09BakJGO01Bb0JBLDBCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSw0QkFGYjtPQXJCRjtNQXdCQSw2QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLE9BQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFRLENBQUMsU0FBRCxFQUFZLFFBQVosRUFBc0IsU0FBdEIsRUFBaUMsU0FBakMsQ0FEUjtRQUVBLFVBQUEsRUFBWSxpRUFGWjtPQXpCRjtLQTFCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIkxhVGVYXCJcbiAgbmFtZXNwYWNlOiBcImxhdGV4XCJcbiAgc2NvcGU6IFsnc291cmNlLnRleCddXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xuICAjIyNcbiAgZ3JhbW1hcnM6IFtcbiAgICBcIkxhVGVYXCJcbiAgXVxuXG4gICMjI1xuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAjIyNcbiAgZXh0ZW5zaW9uczogW1xuICAgIFwidGV4XCJcbiAgXVxuXG4gIGRlZmF1bHRCZWF1dGlmaWVyOiBcIkxhdGV4IEJlYXV0aWZ5XCJcblxuICAjIyNcblxuICAjIyNcbiAgb3B0aW9uczpcbiAgICBpbmRlbnRfY2hhcjpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBudWxsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBjaGFyYWN0ZXJcIlxuICAgIGluZGVudF93aXRoX3RhYnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHVzZXMgdGFicywgb3ZlcnJpZGVzIGBJbmRlbnQgU2l6ZWAgYW5kIGBJbmRlbnQgQ2hhcmBcIlxuICAgIGluZGVudF9wcmVhbWJsZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudCB0aGUgcHJlYWJsZVwiXG4gICAgYWx3YXlzX2xvb2tfZm9yX3NwbGl0X2JyYWNlczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiSWYgYGxhdGV4aW5kZW50YCBzaG91bGQgbG9vayBmb3IgY29tbWFuZHMgdGhhdCBzcGxpdCBicmFjZXMgYWNyb3NzIGxpbmVzXCJcbiAgICBhbHdheXNfbG9va19mb3Jfc3BsaXRfYnJhY2tldHM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiBgbGF0ZXhpbmRlbnRgIHNob3VsZCBsb29rIGZvciBjb21tYW5kcyB0aGF0IHNwbGl0IGJyYWNrZXRzIGFjcm9zcyBsaW5lc1wiXG4gICAgcmVtb3ZlX3RyYWlsaW5nX3doaXRlc3BhY2U6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJSZW1vdmUgdHJhaWxpbmcgd2hpdGVzcGFjZVwiXG4gICAgYWxpZ25fY29sdW1uc19pbl9lbnZpcm9ubWVudHM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OltcInRhYnVsYXJcIiwgXCJtYXRyaXhcIiwgXCJibWF0cml4XCIsIFwicG1hdHJpeFwiXVxuICAgICAgZGVjcmlwdGlvbjogXCJBbGlnbnMgY29sdW1ucyBieSB0aGUgYWxpZ25tZW50IHRhYnMgZm9yIGVudmlyb25tZW50cyBzcGVjaWZpZWRcIlxufVxuIl19
