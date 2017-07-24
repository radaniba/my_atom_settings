(function() {
  var GistView;

  GistView = require('./gist-view');

  module.exports = {
    gistView: null,
    activate: function(state) {
      return this.gistView = new GistView(state.gistViewState);
    },
    deactivate: function() {
      return this.gistView.destroy();
    },
    serialize: function() {
      return {
        gistViewState: this.gistView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXN0LWl0L2xpYi9naXN0LWl0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsSUFBVjtJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7YUFDUixJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLFFBQUEsQ0FBUyxLQUFLLENBQUMsYUFBZjtJQURSLENBRlY7SUFLQSxVQUFBLEVBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBO0lBRFUsQ0FMWjtJQVFBLFNBQUEsRUFBVyxTQUFBO2FBQ1Q7UUFBQSxhQUFBLEVBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQUEsQ0FBZjs7SUFEUyxDQVJYOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsiR2lzdFZpZXcgPSByZXF1aXJlICcuL2dpc3QtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnaXN0VmlldzogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGdpc3RWaWV3ID0gbmV3IEdpc3RWaWV3KHN0YXRlLmdpc3RWaWV3U3RhdGUpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZ2lzdFZpZXcuZGVzdHJveSgpXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGdpc3RWaWV3U3RhdGU6IEBnaXN0Vmlldy5zZXJpYWxpemUoKVxuIl19
