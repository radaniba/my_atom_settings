(function() {
  var scopesForLanguageName;

  scopesForLanguageName = {
    'sh': 'source.shell',
    'bash': 'source.shell',
    'c': 'source.c',
    'c++': 'source.cpp',
    'cpp': 'source.cpp',
    'coffee': 'source.coffee',
    'coffeescript': 'source.coffee',
    'coffee-script': 'source.coffee',
    'cs': 'source.cs',
    'csharp': 'source.cs',
    'css': 'source.css',
    'scss': 'source.css.scss',
    'sass': 'source.sass',
    'erlang': 'source.erl',
    'go': 'source.go',
    'html': 'text.html.basic',
    'java': 'source.java',
    'js': 'source.js',
    'javascript': 'source.js',
    'json': 'source.json',
    'less': 'source.less',
    'mustache': 'text.html.mustache',
    'objc': 'source.objc',
    'objectivec': 'source.objc',
    'objective-c': 'source.objc',
    'php': 'text.html.php',
    'py': 'source.python',
    'python': 'source.python',
    'rb': 'source.ruby',
    'ruby': 'source.ruby',
    'text': 'text.plain',
    'toml': 'source.toml',
    'xml': 'text.xml',
    'yaml': 'source.yaml',
    'yml': 'source.yaml',
    'yaml_table': 'source.yaml',
    'mermaid': 'source.mermaid',
    'plantuml': 'source.plantuml',
    'puml': 'source.plantuml',
    'wavedrom': 'source.wavedrom',
    'viz': 'source.dot',
    'dot': 'source.dot',
    'erd': 'source.erd',
    'node': 'source.js',
    'markdown': 'source.gfm',
    'md': "source.gfm"
  };

  module.exports.scopeForLanguageName = function(language) {
    return scopesForLanguageName[language] || ('source.' + language);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9leHRlbnNpb24taGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEscUJBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxjQUFOO0lBQ0EsTUFBQSxFQUFRLGNBRFI7SUFFQSxHQUFBLEVBQUssVUFGTDtJQUdBLEtBQUEsRUFBTyxZQUhQO0lBSUEsS0FBQSxFQUFPLFlBSlA7SUFLQSxRQUFBLEVBQVUsZUFMVjtJQU1BLGNBQUEsRUFBZ0IsZUFOaEI7SUFPQSxlQUFBLEVBQWlCLGVBUGpCO0lBUUEsSUFBQSxFQUFNLFdBUk47SUFTQSxRQUFBLEVBQVUsV0FUVjtJQVVBLEtBQUEsRUFBTyxZQVZQO0lBV0EsTUFBQSxFQUFRLGlCQVhSO0lBWUEsTUFBQSxFQUFRLGFBWlI7SUFhQSxRQUFBLEVBQVUsWUFiVjtJQWNBLElBQUEsRUFBTSxXQWROO0lBZUEsTUFBQSxFQUFRLGlCQWZSO0lBZ0JBLE1BQUEsRUFBUSxhQWhCUjtJQWlCQSxJQUFBLEVBQU0sV0FqQk47SUFrQkEsWUFBQSxFQUFjLFdBbEJkO0lBbUJBLE1BQUEsRUFBUSxhQW5CUjtJQW9CQSxNQUFBLEVBQVEsYUFwQlI7SUFxQkEsVUFBQSxFQUFZLG9CQXJCWjtJQXNCQSxNQUFBLEVBQVEsYUF0QlI7SUF1QkEsWUFBQSxFQUFjLGFBdkJkO0lBd0JBLGFBQUEsRUFBZSxhQXhCZjtJQXlCQSxLQUFBLEVBQU8sZUF6QlA7SUEwQkEsSUFBQSxFQUFNLGVBMUJOO0lBMkJBLFFBQUEsRUFBVSxlQTNCVjtJQTRCQSxJQUFBLEVBQU0sYUE1Qk47SUE2QkEsTUFBQSxFQUFRLGFBN0JSO0lBOEJBLE1BQUEsRUFBUSxZQTlCUjtJQStCQSxNQUFBLEVBQVEsYUEvQlI7SUFnQ0EsS0FBQSxFQUFPLFVBaENQO0lBaUNBLE1BQUEsRUFBUSxhQWpDUjtJQWtDQSxLQUFBLEVBQU8sYUFsQ1A7SUFvQ0EsWUFBQSxFQUFjLGFBcENkO0lBcUNBLFNBQUEsRUFBVyxnQkFyQ1g7SUFzQ0EsVUFBQSxFQUFZLGlCQXRDWjtJQXVDQSxNQUFBLEVBQVEsaUJBdkNSO0lBd0NBLFVBQUEsRUFBWSxpQkF4Q1o7SUF5Q0EsS0FBQSxFQUFPLFlBekNQO0lBMENBLEtBQUEsRUFBTyxZQTFDUDtJQTJDQSxLQUFBLEVBQU8sWUEzQ1A7SUE0Q0EsTUFBQSxFQUFRLFdBNUNSO0lBNkNBLFVBQUEsRUFBWSxZQTdDWjtJQThDQSxJQUFBLEVBQU0sWUE5Q047OztFQWdERixNQUFNLENBQUMsT0FBTyxDQUFDLG9CQUFmLEdBQXVDLFNBQUMsUUFBRDtBQUNyQyxXQUFPLHFCQUFzQixDQUFBLFFBQUEsQ0FBdEIsSUFBbUMsQ0FBQyxTQUFBLEdBQVksUUFBYjtFQURMO0FBakR2QyIsInNvdXJjZXNDb250ZW50IjpbIiMgcmVmZXJyZWQgZnJvbSB0aGUgb2ZmaWNpYWwgTWFya2Rvd24gUHJldmlldyBleHRlbnNpb24taGVscGVyLmNvZmZlZVxuc2NvcGVzRm9yTGFuZ3VhZ2VOYW1lID1cbiAgJ3NoJzogJ3NvdXJjZS5zaGVsbCcsXG4gICdiYXNoJzogJ3NvdXJjZS5zaGVsbCcsXG4gICdjJzogJ3NvdXJjZS5jJyxcbiAgJ2MrKyc6ICdzb3VyY2UuY3BwJyxcbiAgJ2NwcCc6ICdzb3VyY2UuY3BwJyxcbiAgJ2NvZmZlZSc6ICdzb3VyY2UuY29mZmVlJyxcbiAgJ2NvZmZlZXNjcmlwdCc6ICdzb3VyY2UuY29mZmVlJyxcbiAgJ2NvZmZlZS1zY3JpcHQnOiAnc291cmNlLmNvZmZlZScsXG4gICdjcyc6ICdzb3VyY2UuY3MnLFxuICAnY3NoYXJwJzogJ3NvdXJjZS5jcycsXG4gICdjc3MnOiAnc291cmNlLmNzcycsXG4gICdzY3NzJzogJ3NvdXJjZS5jc3Muc2NzcycsXG4gICdzYXNzJzogJ3NvdXJjZS5zYXNzJyxcbiAgJ2VybGFuZyc6ICdzb3VyY2UuZXJsJyxcbiAgJ2dvJzogJ3NvdXJjZS5nbycsXG4gICdodG1sJzogJ3RleHQuaHRtbC5iYXNpYycsXG4gICdqYXZhJzogJ3NvdXJjZS5qYXZhJyxcbiAgJ2pzJzogJ3NvdXJjZS5qcycsXG4gICdqYXZhc2NyaXB0JzogJ3NvdXJjZS5qcycsXG4gICdqc29uJzogJ3NvdXJjZS5qc29uJyxcbiAgJ2xlc3MnOiAnc291cmNlLmxlc3MnLFxuICAnbXVzdGFjaGUnOiAndGV4dC5odG1sLm11c3RhY2hlJyxcbiAgJ29iamMnOiAnc291cmNlLm9iamMnLFxuICAnb2JqZWN0aXZlYyc6ICdzb3VyY2Uub2JqYycsXG4gICdvYmplY3RpdmUtYyc6ICdzb3VyY2Uub2JqYycsXG4gICdwaHAnOiAndGV4dC5odG1sLnBocCcsXG4gICdweSc6ICdzb3VyY2UucHl0aG9uJyxcbiAgJ3B5dGhvbic6ICdzb3VyY2UucHl0aG9uJyxcbiAgJ3JiJzogJ3NvdXJjZS5ydWJ5JyxcbiAgJ3J1YnknOiAnc291cmNlLnJ1YnknLFxuICAndGV4dCc6ICd0ZXh0LnBsYWluJyxcbiAgJ3RvbWwnOiAnc291cmNlLnRvbWwnLFxuICAneG1sJzogJ3RleHQueG1sJyxcbiAgJ3lhbWwnOiAnc291cmNlLnlhbWwnLFxuICAneW1sJzogJ3NvdXJjZS55YW1sJyxcbiAgIyBleHRlbmRlZFxuICAneWFtbF90YWJsZSc6ICdzb3VyY2UueWFtbCcsXG4gICdtZXJtYWlkJzogJ3NvdXJjZS5tZXJtYWlkJyxcbiAgJ3BsYW50dW1sJzogJ3NvdXJjZS5wbGFudHVtbCcsXG4gICdwdW1sJzogJ3NvdXJjZS5wbGFudHVtbCcsXG4gICd3YXZlZHJvbSc6ICdzb3VyY2Uud2F2ZWRyb20nLFxuICAndml6JzogJ3NvdXJjZS5kb3QnLFxuICAnZG90JzogJ3NvdXJjZS5kb3QnLFxuICAnZXJkJzogJ3NvdXJjZS5lcmQnLFxuICAnbm9kZSc6ICdzb3VyY2UuanMnLFxuICAnbWFya2Rvd24nOiAnc291cmNlLmdmbScsXG4gICdtZCc6IFwic291cmNlLmdmbVwiXG5cbm1vZHVsZS5leHBvcnRzLnNjb3BlRm9yTGFuZ3VhZ2VOYW1lICA9IChsYW5ndWFnZSktPlxuICByZXR1cm4gc2NvcGVzRm9yTGFuZ3VhZ2VOYW1lW2xhbmd1YWdlXSBvciAoJ3NvdXJjZS4nICsgbGFuZ3VhZ2UpXG4iXX0=
