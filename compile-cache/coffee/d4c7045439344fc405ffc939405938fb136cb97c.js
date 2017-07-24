(function() {
  module.exports = {
    name: "PHP",
    namespace: "php",

    /*
    Supported Grammars
     */
    grammars: ["PHP"],

    /*
    Supported extensions
     */
    extensions: ["php", "module", "inc"],
    defaultBeautifier: "PHP-CS-Fixer",
    options: {
      cs_fixer_path: {
        title: "PHP-CS-Fixer Path",
        type: 'string',
        "default": "",
        description: "Absolute path to the `php-cs-fixer` CLI executable"
      },
      cs_fixer_version: {
        title: "PHP-CS-Fixer Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2]
      },
      fixers: {
        type: 'string',
        "default": "",
        description: "Add fixer(s). i.e. linefeed,-short_tag,indentation (PHP-CS-Fixer 1 only)"
      },
      level: {
        type: 'string',
        "default": "",
        description: "By default, all PSR-2 fixers and some additional ones are run. (PHP-CS-Fixer 1 only)"
      },
      rules: {
        type: 'string',
        "default": "",
        description: "Add rule(s). i.e. line_ending,-full_opening_tag,@PSR2 (PHP-CS-Fixer 2 only)"
      },
      allow_risky: {
        title: "Allow risky rules",
        type: 'string',
        "default": "no",
        "enum": ["no", "yes"],
        description: "allow risky rules to be applied (PHP-CS-Fixer 2 only)"
      },
      phpcbf_path: {
        title: "PHPCBF Path",
        type: 'string',
        "default": "",
        description: "Path to the `phpcbf` CLI executable"
      },
      phpcbf_version: {
        title: "PHPCBF Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2, 3]
      },
      standard: {
        title: "PHPCBF Standard",
        type: 'string',
        "default": "PEAR",
        description: "Standard name Squiz, PSR2, PSR1, PHPCS, PEAR, Zend, MySource... or path to CS rules. Will use local `phpcs.xml`, `phpcs.xml.dist`, `phpcs.ruleset.xml` or `ruleset.xml` if found in the project root."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvcGhwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLEtBRlM7SUFHZixTQUFBLEVBQVcsS0FISTs7QUFLZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsS0FEUSxDQVJLOztBQVlmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixLQURVLEVBRVYsUUFGVSxFQUdWLEtBSFUsQ0FmRztJQXFCZixpQkFBQSxFQUFtQixjQXJCSjtJQXVCZixPQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sbUJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtRQUdBLFdBQUEsRUFBYSxvREFIYjtPQURGO01BS0EsZ0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxzQkFBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUZUO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLENBQUQsRUFBSSxDQUFKLENBSE47T0FORjtNQVVBLE1BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLDBFQUZiO09BWEY7TUFjQSxLQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSxzRkFGYjtPQWZGO01Ba0JBLEtBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLDZFQUZiO09BbkJGO01Bc0JBLFdBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxtQkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLElBQUQsRUFBTyxLQUFQLENBSE47UUFJQSxXQUFBLEVBQWEsdURBSmI7T0F2QkY7TUE0QkEsV0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGFBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtRQUdBLFdBQUEsRUFBYSxxQ0FIYjtPQTdCRjtNQWlDQSxjQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sZ0JBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FGVDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FITjtPQWxDRjtNQXNDQSxRQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8saUJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFGVDtRQUdBLFdBQUEsRUFBYSx1TUFIYjtPQXZDRjtLQXhCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiBcIlBIUFwiXG4gIG5hbWVzcGFjZTogXCJwaHBcIlxuXG4gICMjI1xuICBTdXBwb3J0ZWQgR3JhbW1hcnNcbiAgIyMjXG4gIGdyYW1tYXJzOiBbXG4gICAgXCJQSFBcIlxuICBdXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXG4gICMjI1xuICBleHRlbnNpb25zOiBbXG4gICAgXCJwaHBcIlxuICAgIFwibW9kdWxlXCJcbiAgICBcImluY1wiXG4gIF1cblxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJQSFAtQ1MtRml4ZXJcIlxuXG4gIG9wdGlvbnM6XG4gICAgY3NfZml4ZXJfcGF0aDpcbiAgICAgIHRpdGxlOiBcIlBIUC1DUy1GaXhlciBQYXRoXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJBYnNvbHV0ZSBwYXRoIHRvIHRoZSBgcGhwLWNzLWZpeGVyYCBDTEkgZXhlY3V0YWJsZVwiXG4gICAgY3NfZml4ZXJfdmVyc2lvbjpcbiAgICAgIHRpdGxlOiBcIlBIUC1DUy1GaXhlciBWZXJzaW9uXCJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogMlxuICAgICAgZW51bTogWzEsIDJdXG4gICAgZml4ZXJzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBmaXhlcihzKS4gaS5lLiBsaW5lZmVlZCwtc2hvcnRfdGFnLGluZGVudGF0aW9uIChQSFAtQ1MtRml4ZXIgMSBvbmx5KVwiXG4gICAgbGV2ZWw6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQnkgZGVmYXVsdCwgYWxsIFBTUi0yIGZpeGVycyBhbmQgc29tZSBhZGRpdGlvbmFsIG9uZXMgYXJlIHJ1bi4gKFBIUC1DUy1GaXhlciAxIG9ubHkpXCJcbiAgICBydWxlczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJBZGQgcnVsZShzKS4gaS5lLiBsaW5lX2VuZGluZywtZnVsbF9vcGVuaW5nX3RhZyxAUFNSMiAoUEhQLUNTLUZpeGVyIDIgb25seSlcIlxuICAgIGFsbG93X3Jpc2t5OlxuICAgICAgdGl0bGU6IFwiQWxsb3cgcmlza3kgcnVsZXNcIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwibm9cIlxuICAgICAgZW51bTogW1wibm9cIiwgXCJ5ZXNcIl1cbiAgICAgIGRlc2NyaXB0aW9uOiBcImFsbG93IHJpc2t5IHJ1bGVzIHRvIGJlIGFwcGxpZWQgKFBIUC1DUy1GaXhlciAyIG9ubHkpXCJcbiAgICBwaHBjYmZfcGF0aDpcbiAgICAgIHRpdGxlOiBcIlBIUENCRiBQYXRoXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiBcIlwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJQYXRoIHRvIHRoZSBgcGhwY2JmYCBDTEkgZXhlY3V0YWJsZVwiLFxuICAgIHBocGNiZl92ZXJzaW9uOlxuICAgICAgdGl0bGU6IFwiUEhQQ0JGIFZlcnNpb25cIlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAyXG4gICAgICBlbnVtOiBbMSwgMiwgM11cbiAgICBzdGFuZGFyZDpcbiAgICAgIHRpdGxlOiBcIlBIUENCRiBTdGFuZGFyZFwiXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJQRUFSXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJTdGFuZGFyZCBuYW1lIFNxdWl6LCBQU1IyLCBQU1IxLCBQSFBDUywgUEVBUiwgWmVuZCwgTXlTb3VyY2UuLi4gb3IgcGF0aCB0byBDUyBydWxlcy4gV2lsbCB1c2UgbG9jYWwgYHBocGNzLnhtbGAsIGBwaHBjcy54bWwuZGlzdGAsIGBwaHBjcy5ydWxlc2V0LnhtbGAgb3IgYHJ1bGVzZXQueG1sYCBpZiBmb3VuZCBpbiB0aGUgcHJvamVjdCByb290LlwiXG5cbn1cbiJdfQ==
