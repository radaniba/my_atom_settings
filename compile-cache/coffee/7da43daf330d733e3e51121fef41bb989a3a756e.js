(function() {
  describe('Handlebars grammar', function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('atom-handlebars');
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName('text.html.handlebars');
      });
    });
    it('parses the grammar', function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('text.html.handlebars');
    });
    it('parses helpers', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{my-helper }}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'my-helper ',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      tokens = grammar.tokenizeLine("{{my-helper class='test'}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'my-helper ',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: 'class',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.other.attribute-name.handlebars', 'meta.tag.template.handlebars', 'entity.other.attribute-name.handlebars']
      });
      expect(tokens[3]).toEqual({
        value: '=',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.other.attribute-name.handlebars', 'meta.tag.template.handlebars']
      });
      expect(tokens[4]).toEqual({
        value: "'",
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'string.quoted.single.handlebars', 'punctuation.definition.string.begin.handlebars']
      });
      expect(tokens[5]).toEqual({
        value: 'test',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'string.quoted.single.handlebars']
      });
      expect(tokens[6]).toEqual({
        value: "'",
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'string.quoted.single.handlebars', 'punctuation.definition.string.end.handlebars']
      });
      expect(tokens[7]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      tokens = grammar.tokenizeLine("{{else}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'else',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      return expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
    });
    it('parses variables', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{name}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'name',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      tokens = grammar.tokenizeLine("{{> name}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{>',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: ' name',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars']
      });
      return expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
    });
    it('parses comments', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{!-- comment --}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{!--',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: ' comment ',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: '--}}',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      tokens = grammar.tokenizeLine("{{! comment }}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{!',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: ' comment ',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
      return expect(tokens[2]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'comment.block.handlebars']
      });
    });
    it('parses block expression', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{#each person in people}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: '#',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'punctuation.definition.block.begin.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: 'each',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      expect(tokens[3]).toEqual({
        value: ' person',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars']
      });
      expect(tokens[4]).toEqual({
        value: ' in ',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.function.handlebars']
      });
      expect(tokens[5]).toEqual({
        value: 'people',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars']
      });
      expect(tokens[6]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      tokens = grammar.tokenizeLine("{{/if}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: '/',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'punctuation.definition.block.end.handlebars']
      });
      expect(tokens[2]).toEqual({
        value: 'if',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars', 'entity.name.function.handlebars']
      });
      return expect(tokens[3]).toEqual({
        value: '}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.handlebars', 'entity.name.tag.handlebars']
      });
    });
    return it('parses unescaped expressions', function() {
      var tokens;
      tokens = grammar.tokenizeLine("{{{do not escape me}}}").tokens;
      expect(tokens[0]).toEqual({
        value: '{{{',
        scopes: ['text.html.handlebars', 'meta.tag.template.raw.handlebars', 'entity.name.tag.handlebars']
      });
      expect(tokens[1]).toEqual({
        value: 'do not escape me',
        scopes: ['text.html.handlebars', 'meta.tag.template.raw.handlebars']
      });
      return expect(tokens[2]).toEqual({
        value: '}}}',
        scopes: ['text.html.handlebars', 'meta.tag.template.raw.handlebars', 'entity.name.tag.handlebars']
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWhhbmRsZWJhcnMvc3BlYy9oYW5kbGViYXJzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxPQUFBO0FBQUEsSUFBQSxPQUFBLEdBQVUsSUFBVixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixpQkFBOUIsRUFEYztNQUFBLENBQWhCLENBQUEsQ0FBQTthQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7ZUFDSCxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBZCxDQUFrQyxzQkFBbEMsRUFEUDtNQUFBLENBQUwsRUFKUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFTQSxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLE1BQUEsTUFBQSxDQUFPLE9BQVAsQ0FBZSxDQUFDLFVBQWhCLENBQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxTQUFmLENBQXlCLENBQUMsSUFBMUIsQ0FBK0Isc0JBQS9CLEVBRnVCO0lBQUEsQ0FBekIsQ0FUQSxDQUFBO0FBQUEsSUFhQSxFQUFBLENBQUcsZ0JBQUgsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxPQUFPLENBQUMsWUFBUixDQUFxQixnQkFBckIsRUFBVixNQUFELENBQUE7QUFBQSxNQUVBLE1BQUEsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLENBQWlCLENBQUMsT0FBbEIsQ0FBMEI7QUFBQSxRQUFBLEtBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/atom-handlebars/spec/handlebars-spec.coffee
