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
    atom.config.set('pigments.markerType', 'background');
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2hlbHBlcnMvc3BlYy1oZWxwZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLG9CQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FDRTtBQUFBLElBQUEsT0FBQSxFQUFTLG9CQUFUO0FBQUEsSUFDQSxXQUFBLEVBQWEsd0JBRGI7QUFBQSxJQUVBLFlBQUEsRUFBYyx5QkFGZDtBQUFBLElBR0EsbUJBQUEsRUFBcUIsZ0NBSHJCO0FBQUEsSUFJQSxtQkFBQSxFQUFxQixnQ0FKckI7R0FKRixDQUFBOztBQUFBLEVBVUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFCQUFoQixFQUF1QyxZQUF2QyxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBWCxDQUEyQixRQUFRLENBQUMsb0JBQXBDLENBREEsQ0FBQTtBQUdBLFNBQUEsa0JBQUE7MkJBQUE7QUFDRSxNQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUI7QUFBQSxRQUFBLElBQUEsRUFBTSxDQUFOO0FBQUEsUUFBUyxXQUFBLEVBQWEsUUFBUyxDQUFBLENBQUEsQ0FBL0I7T0FBdkIsQ0FBQSxDQURGO0FBQUEsS0FIQTtXQU1BLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixvQkFBMUIsRUFQUztFQUFBLENBQVgsQ0FWQSxDQUFBOztBQUFBLEVBbUJBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7V0FDUixRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsb0JBQTFCLEVBRFE7RUFBQSxDQUFWLENBbkJBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/pigments/spec/helpers/spec-helper.coffee
