(function() {
  var generateSVG, path, plantumlAPI, plantumlJarPath, spawn;

  path = require('path');

  spawn = require('child_process').spawn;

  plantumlJarPath = path.resolve(__dirname, '../dependencies/plantuml/plantuml.jar');

  generateSVG = function(content, callback) {
    var chunks, task;
    content = content.trim();
    if (!content.startsWith('@start')) {
      content = "@startuml\n" + content + "\n@enduml";
    }
    task = spawn('java', ['-Djava.awt.headless=true', '-jar', plantumlJarPath, '-pipe', '-tsvg', '-charset', 'UTF-8']);
    task.stdin.write(content);
    task.stdin.end();
    chunks = [];
    task.stdout.on('data', function(chunk) {
      return chunks.push(chunk);
    });
    return task.stdout.on('end', function() {
      var data;
      data = Buffer.concat(chunks).toString();
      return typeof callback === "function" ? callback(data) : void 0;
    });
  };

  plantumlAPI = {
    render: generateSVG
  };

  module.exports = plantumlAPI;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9wdW1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLFFBQVMsT0FBQSxDQUFRLGVBQVI7O0VBRVYsZUFBQSxHQUFrQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsdUNBQXhCOztFQUdsQixXQUFBLEdBQWMsU0FBQyxPQUFELEVBQVUsUUFBVjtBQUNaLFFBQUE7SUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLElBQVIsQ0FBQTtJQUNWLElBQUcsQ0FBQyxPQUFPLENBQUMsVUFBUixDQUFtQixRQUFuQixDQUFKO01BQ0UsT0FBQSxHQUFVLGFBQUEsR0FFWixPQUZZLEdBRUosWUFIUjs7SUFPQSxJQUFBLEdBQU8sS0FBQSxDQUFNLE1BQU4sRUFBYyxDQUFLLDBCQUFMLEVBQ0ssTUFETCxFQUNhLGVBRGIsRUFHSyxPQUhMLEVBSUssT0FKTCxFQUtLLFVBTEwsRUFLaUIsT0FMakIsQ0FBZDtJQU9QLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBWCxDQUFpQixPQUFqQjtJQUNBLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBWCxDQUFBO0lBRUEsTUFBQSxHQUFTO0lBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFaLENBQWUsTUFBZixFQUF1QixTQUFDLEtBQUQ7YUFDckIsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaO0lBRHFCLENBQXZCO1dBR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFaLENBQWUsS0FBZixFQUFzQixTQUFBO0FBQ3BCLFVBQUE7TUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFkLENBQXFCLENBQUMsUUFBdEIsQ0FBQTs4Q0FDUCxTQUFVO0lBRlUsQ0FBdEI7RUF2Qlk7O0VBNEJkLFdBQUEsR0FBYztJQUNaLE1BQUEsRUFBUSxXQURJOzs7RUFJZCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXRDakIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbntzcGF3bn0gPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuXG5wbGFudHVtbEphclBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZGVwZW5kZW5jaWVzL3BsYW50dW1sL3BsYW50dW1sLmphcicpXG5cbiMgQXN5bmMgY2FsbFxuZ2VuZXJhdGVTVkcgPSAoY29udGVudCwgY2FsbGJhY2spLT5cbiAgY29udGVudCA9IGNvbnRlbnQudHJpbSgpXG4gIGlmICFjb250ZW50LnN0YXJ0c1dpdGgoJ0BzdGFydCcpXG4gICAgY29udGVudCA9IFwiXCJcIlxuQHN0YXJ0dW1sXG4je2NvbnRlbnR9XG5AZW5kdW1sXG4gICAgXCJcIlwiXG5cbiAgdGFzayA9IHNwYXduICdqYXZhJywgWyAgICAnLURqYXZhLmF3dC5oZWFkbGVzcz10cnVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLWphcicsIHBsYW50dW1sSmFyUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjICctZ3JhcGh2aXpkb3QnLCAnZXhlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICctcGlwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy10c3ZnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLWNoYXJzZXQnLCAnVVRGLTgnXVxuXG4gIHRhc2suc3RkaW4ud3JpdGUoY29udGVudClcbiAgdGFzay5zdGRpbi5lbmQoKVxuXG4gIGNodW5rcyA9IFtdXG4gIHRhc2suc3Rkb3V0Lm9uICdkYXRhJywgKGNodW5rKS0+XG4gICAgY2h1bmtzLnB1c2goY2h1bmspXG5cbiAgdGFzay5zdGRvdXQub24gJ2VuZCcsICgpLT5cbiAgICBkYXRhID0gQnVmZmVyLmNvbmNhdChjaHVua3MpLnRvU3RyaW5nKClcbiAgICBjYWxsYmFjaz8oZGF0YSlcblxuIyBnZW5lcmF0ZVNWRygnQSAtPiBCJylcbnBsYW50dW1sQVBJID0ge1xuICByZW5kZXI6IGdlbmVyYXRlU1ZHXG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGxhbnR1bWxBUElcbiJdfQ==
