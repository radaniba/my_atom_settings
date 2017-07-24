(function() {
  module.exports = {
    config: {
      yapfPath: {
        type: 'string',
        "default": 'yapf'
      },
      yapfStyle: {
        type: 'string',
        "default": ''
      },
      formatOnSave: {
        type: 'boolean',
        "default": false
      },
      checkOnSave: {
        type: 'boolean',
        "default": true
      }
    },
    status: null,
    subs: null,
    activate: function() {
      var CompositeDisposable, PythonYAPF, StatusDialog, pi;
      PythonYAPF = require('./python-yapf');
      pi = new PythonYAPF();
      CompositeDisposable = require('atom').CompositeDisposable;
      this.subs = new CompositeDisposable;
      this.subs.add(atom.commands.add('atom-workspace', 'pane:active-item-changed', function() {
        return pi.removeStatusbarItem();
      }));
      this.subs.add(atom.commands.add('atom-workspace', 'python-yapf:formatCode', function() {
        return pi.formatCode();
      }));
      this.subs.add(atom.commands.add('atom-workspace', 'python-yapf:checkCode', function() {
        return pi.checkCode();
      }));
      this.subs.add(atom.config.observe('python-yapf.formatOnSave', function(value) {
        return atom.workspace.observeTextEditors(function(editor) {
          var ref;
          if (value) {
            return editor._yapfFormat = editor.onDidSave(function() {
              return pi.formatCode();
            });
          } else {
            return (ref = editor._yapfFormat) != null ? ref.dispose() : void 0;
          }
        });
      }));
      this.subs.add(atom.config.observe('python-yapf.checkOnSave', function(value) {
        return atom.workspace.observeTextEditors(function(editor) {
          var ref;
          if (value) {
            return editor._yapfCheck = editor.onDidSave(function() {
              return pi.checkCode();
            });
          } else {
            return (ref = editor._yapfCheck) != null ? ref.dispose() : void 0;
          }
        });
      }));
      StatusDialog = require('./status-dialog');
      this.status = new StatusDialog(pi);
      return pi.setStatusDialog(this.status);
    },
    deactivate: function() {
      var ref, ref1;
      if ((ref = this.subs) != null) {
        ref.dispose();
      }
      this.subs = null;
      if ((ref1 = this.status) != null) {
        ref1.dispose();
      }
      return this.status = null;
    },
    consumeStatusBar: function(statusBar) {
      return this.status.attach(statusBar);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24teWFwZi9saWIvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLFFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQURUO09BREY7TUFHQSxTQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtPQUpGO01BTUEsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7T0FQRjtNQVNBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BVkY7S0FERjtJQWNBLE1BQUEsRUFBUSxJQWRSO0lBZUEsSUFBQSxFQUFNLElBZk47SUFpQkEsUUFBQSxFQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSO01BQ2IsRUFBQSxHQUFTLElBQUEsVUFBQSxDQUFBO01BRVIsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSO01BQ3hCLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSTtNQUVaLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsMEJBQXBDLEVBQWdFLFNBQUE7ZUFDeEUsRUFBRSxDQUFDLG1CQUFILENBQUE7TUFEd0UsQ0FBaEUsQ0FBVjtNQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0Msd0JBQXBDLEVBQThELFNBQUE7ZUFDdEUsRUFBRSxDQUFDLFVBQUgsQ0FBQTtNQURzRSxDQUE5RCxDQUFWO01BR0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyx1QkFBcEMsRUFBNkQsU0FBQTtlQUNyRSxFQUFFLENBQUMsU0FBSCxDQUFBO01BRHFFLENBQTdELENBQVY7TUFHQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsMEJBQXBCLEVBQWdELFNBQUMsS0FBRDtlQUN4RCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsTUFBRDtBQUNoQyxjQUFBO1VBQUEsSUFBRyxLQUFIO21CQUNFLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQUE7cUJBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBQTtZQUFILENBQWpCLEVBRHZCO1dBQUEsTUFBQTsyREFHb0IsQ0FBRSxPQUFwQixDQUFBLFdBSEY7O1FBRGdDLENBQWxDO01BRHdELENBQWhELENBQVY7TUFPQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IseUJBQXBCLEVBQStDLFNBQUMsS0FBRDtlQUN2RCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsTUFBRDtBQUNoQyxjQUFBO1VBQUEsSUFBRyxLQUFIO21CQUNFLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQUE7cUJBQUcsRUFBRSxDQUFDLFNBQUgsQ0FBQTtZQUFILENBQWpCLEVBRHRCO1dBQUEsTUFBQTswREFHbUIsQ0FBRSxPQUFuQixDQUFBLFdBSEY7O1FBRGdDLENBQWxDO01BRHVELENBQS9DLENBQVY7TUFPQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSO01BQ2YsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLFlBQUEsQ0FBYSxFQUFiO2FBQ2QsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBQyxDQUFBLE1BQXBCO0lBaENRLENBakJWO0lBbURBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTs7V0FBSyxDQUFFLE9BQVAsQ0FBQTs7TUFDQSxJQUFDLENBQUEsSUFBRCxHQUFROztZQUNELENBQUUsT0FBVCxDQUFBOzthQUNBLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFKQSxDQW5EWjtJQXlEQSxnQkFBQSxFQUFrQixTQUFDLFNBQUQ7YUFDaEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsU0FBZjtJQURnQixDQXpEbEI7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICB5YXBmUGF0aDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAneWFwZidcbiAgICB5YXBmU3R5bGU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICBmb3JtYXRPblNhdmU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgY2hlY2tPblNhdmU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcblxuICBzdGF0dXM6IG51bGxcbiAgc3ViczogbnVsbFxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIFB5dGhvbllBUEYgPSByZXF1aXJlICcuL3B5dGhvbi15YXBmJ1xuICAgIHBpID0gbmV3IFB5dGhvbllBUEYoKVxuXG4gICAge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbiAgICBAc3VicyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc3Vicy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3BhbmU6YWN0aXZlLWl0ZW0tY2hhbmdlZCcsIC0+XG4gICAgICBwaS5yZW1vdmVTdGF0dXNiYXJJdGVtKClcblxuICAgIEBzdWJzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncHl0aG9uLXlhcGY6Zm9ybWF0Q29kZScsIC0+XG4gICAgICBwaS5mb3JtYXRDb2RlKClcblxuICAgIEBzdWJzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncHl0aG9uLXlhcGY6Y2hlY2tDb2RlJywgLT5cbiAgICAgIHBpLmNoZWNrQ29kZSgpXG5cbiAgICBAc3Vicy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncHl0aG9uLXlhcGYuZm9ybWF0T25TYXZlJywgKHZhbHVlKSAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpIC0+XG4gICAgICAgIGlmIHZhbHVlXG4gICAgICAgICAgZWRpdG9yLl95YXBmRm9ybWF0ID0gZWRpdG9yLm9uRGlkU2F2ZSAtPiBwaS5mb3JtYXRDb2RlKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGVkaXRvci5feWFwZkZvcm1hdD8uZGlzcG9zZSgpXG5cbiAgICBAc3Vicy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncHl0aG9uLXlhcGYuY2hlY2tPblNhdmUnLCAodmFsdWUpIC0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgLT5cbiAgICAgICAgaWYgdmFsdWVcbiAgICAgICAgICBlZGl0b3IuX3lhcGZDaGVjayA9IGVkaXRvci5vbkRpZFNhdmUgLT4gcGkuY2hlY2tDb2RlKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGVkaXRvci5feWFwZkNoZWNrPy5kaXNwb3NlKClcblxuICAgIFN0YXR1c0RpYWxvZyA9IHJlcXVpcmUgJy4vc3RhdHVzLWRpYWxvZydcbiAgICBAc3RhdHVzID0gbmV3IFN0YXR1c0RpYWxvZyBwaVxuICAgIHBpLnNldFN0YXR1c0RpYWxvZyhAc3RhdHVzKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzID0gbnVsbFxuICAgIEBzdGF0dXM/LmRpc3Bvc2UoKVxuICAgIEBzdGF0dXMgPSBudWxsXG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBAc3RhdHVzLmF0dGFjaCBzdGF0dXNCYXJcbiJdfQ==
