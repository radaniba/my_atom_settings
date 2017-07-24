(function() {
  var Pigments, deserializers, registry;

  registry = require('../../lib/color-expressions');

  Pigments = require('../../lib/pigments');

  deserializers = {
    Palette: 'deserializePalette',
    ColorSearch: 'deserializeColorSearch',
    ColorProject: 'deserializeColorProject',
    ColorProjectElement: 'deserializeColorProjectElement',
    VariablesCollection: 'deserializeVariablesCollection'
  };

  beforeEach(function() {
    var k, v;
    atom.views.addViewProvider(Pigments.pigmentsViewProvider);
    for (k in deserializers) {
      v = deserializers[k];
      atom.deserializers.add({
        name: k,
        deserialize: Pigments[v]
      });
    }
    return registry.removeExpression('pigments:variables');
  });

  afterEach(function() {
    return registry.removeExpression('pigments:variables');
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2hlbHBlcnMvc3BlYy1oZWxwZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLG9CQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FDRTtBQUFBLElBQUEsT0FBQSxFQUFTLG9CQUFUO0FBQUEsSUFDQSxXQUFBLEVBQWEsd0JBRGI7QUFBQSxJQUVBLFlBQUEsRUFBYyx5QkFGZDtBQUFBLElBR0EsbUJBQUEsRUFBcUIsZ0NBSHJCO0FBQUEsSUFJQSxtQkFBQSxFQUFxQixnQ0FKckI7R0FKRixDQUFBOztBQUFBLEVBVUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFYLENBQTJCLFFBQVEsQ0FBQyxvQkFBcEMsQ0FBQSxDQUFBO0FBRUEsU0FBQSxrQkFBQTsyQkFBQTtBQUNFLE1BQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QjtBQUFBLFFBQUEsSUFBQSxFQUFNLENBQU47QUFBQSxRQUFTLFdBQUEsRUFBYSxRQUFTLENBQUEsQ0FBQSxDQUEvQjtPQUF2QixDQUFBLENBREY7QUFBQSxLQUZBO1dBS0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLG9CQUExQixFQU5TO0VBQUEsQ0FBWCxDQVZBLENBQUE7O0FBQUEsRUFrQkEsU0FBQSxDQUFVLFNBQUEsR0FBQTtXQUNSLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixvQkFBMUIsRUFEUTtFQUFBLENBQVYsQ0FsQkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/helpers/spec-helper.coffee
