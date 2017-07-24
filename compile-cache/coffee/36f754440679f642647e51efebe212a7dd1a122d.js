(function() {
  var generateSVG, path, plantumlAPI, plantumlJarPath, spawn;

  path = require('path');

  spawn = require('child_process').spawn;

  plantumlJarPath = path.resolve(__dirname, '../dependencies/plantuml/plantuml.jar');

  generateSVG = function(content, fileDirectoryPath, callback) {
    var chunks, ref, task;
    if (fileDirectoryPath == null) {
      fileDirectoryPath = '';
    }
    content = content.trim();
    fileDirectoryPath = ((ref = content.match(/^'\s@mpe_file_directory_path:(.+)$/m)) != null ? ref[1] : void 0) || fileDirectoryPath;
    if (!content.startsWith('@start')) {
      content = "@startuml\n" + content + "\n@enduml";
    }
    task = spawn('java', ['-Djava.awt.headless=true', '-Dplantuml.include.path=' + fileDirectoryPath, '-jar', plantumlJarPath, '-pipe', '-tsvg', '-charset', 'UTF-8']);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9wdW1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNOLFFBQVMsT0FBQSxDQUFRLGVBQVI7O0VBRVYsZUFBQSxHQUFrQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsdUNBQXhCOztFQUdsQixXQUFBLEdBQWMsU0FBQyxPQUFELEVBQVUsaUJBQVYsRUFBZ0MsUUFBaEM7QUFDWixRQUFBOztNQURzQixvQkFBa0I7O0lBQ3hDLE9BQUEsR0FBVSxPQUFPLENBQUMsSUFBUixDQUFBO0lBSVYsaUJBQUEsOEVBQTBFLENBQUEsQ0FBQSxXQUF0RCxJQUE0RDtJQUVoRixJQUFHLENBQUMsT0FBTyxDQUFDLFVBQVIsQ0FBbUIsUUFBbkIsQ0FBSjtNQUNFLE9BQUEsR0FBVSxhQUFBLEdBRVosT0FGWSxHQUVKLFlBSFI7O0lBT0EsSUFBQSxHQUFPLEtBQUEsQ0FBTSxNQUFOLEVBQWMsQ0FBSywwQkFBTCxFQUNLLDBCQUFBLEdBQTJCLGlCQURoQyxFQUVLLE1BRkwsRUFFYSxlQUZiLEVBSUssT0FKTCxFQUtLLE9BTEwsRUFNSyxVQU5MLEVBTWlCLE9BTmpCLENBQWQ7SUFRUCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQVgsQ0FBaUIsT0FBakI7SUFDQSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQVgsQ0FBQTtJQUVBLE1BQUEsR0FBUztJQUNULElBQUksQ0FBQyxNQUFNLENBQUMsRUFBWixDQUFlLE1BQWYsRUFBdUIsU0FBQyxLQUFEO2FBQ3JCLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWjtJQURxQixDQUF2QjtXQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBWixDQUFlLEtBQWYsRUFBc0IsU0FBQTtBQUNwQixVQUFBO01BQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsTUFBZCxDQUFxQixDQUFDLFFBQXRCLENBQUE7OENBQ1AsU0FBVTtJQUZVLENBQXRCO0VBN0JZOztFQWtDZCxXQUFBLEdBQWM7SUFDWixNQUFBLEVBQVEsV0FESTs7O0VBSWQsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE1Q2pCIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57c3Bhd259ID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcblxucGxhbnR1bWxKYXJQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2RlcGVuZGVuY2llcy9wbGFudHVtbC9wbGFudHVtbC5qYXInKVxuXG4jIEFzeW5jIGNhbGxcbmdlbmVyYXRlU1ZHID0gKGNvbnRlbnQsIGZpbGVEaXJlY3RvcnlQYXRoPScnLCBjYWxsYmFjayktPlxuICBjb250ZW50ID0gY29udGVudC50cmltKClcbiAgIyAnIEBtcGVfZmlsZV9kaXJlY3RvcnlfcGF0aDovZmlsZURpcmVjdG9yeVBhdGhcbiAgIyBmaWxlRGlyZWN0b3J5UGF0aFxuXG4gIGZpbGVEaXJlY3RvcnlQYXRoID0gY29udGVudC5tYXRjaCgvXidcXHNAbXBlX2ZpbGVfZGlyZWN0b3J5X3BhdGg6KC4rKSQvbSk/WzFdIG9yIGZpbGVEaXJlY3RvcnlQYXRoXG5cbiAgaWYgIWNvbnRlbnQuc3RhcnRzV2l0aCgnQHN0YXJ0JylcbiAgICBjb250ZW50ID0gXCJcIlwiXG5Ac3RhcnR1bWxcbiN7Y29udGVudH1cbkBlbmR1bWxcbiAgICBcIlwiXCJcblxuICB0YXNrID0gc3Bhd24gJ2phdmEnLCBbICAgICctRGphdmEuYXd0LmhlYWRsZXNzPXRydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICctRHBsYW50dW1sLmluY2x1ZGUucGF0aD0nK2ZpbGVEaXJlY3RvcnlQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy1qYXInLCBwbGFudHVtbEphclBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyAnLWdyYXBodml6ZG90JywgJ2V4ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLXBpcGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICctdHN2ZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy1jaGFyc2V0JywgJ1VURi04J11cblxuICB0YXNrLnN0ZGluLndyaXRlKGNvbnRlbnQpXG4gIHRhc2suc3RkaW4uZW5kKClcblxuICBjaHVua3MgPSBbXVxuICB0YXNrLnN0ZG91dC5vbiAnZGF0YScsIChjaHVuayktPlxuICAgIGNodW5rcy5wdXNoKGNodW5rKVxuXG4gIHRhc2suc3Rkb3V0Lm9uICdlbmQnLCAoKS0+XG4gICAgZGF0YSA9IEJ1ZmZlci5jb25jYXQoY2h1bmtzKS50b1N0cmluZygpXG4gICAgY2FsbGJhY2s/KGRhdGEpXG5cbiMgZ2VuZXJhdGVTVkcoJ0EgLT4gQicpXG5wbGFudHVtbEFQSSA9IHtcbiAgcmVuZGVyOiBnZW5lcmF0ZVNWR1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBsYW50dW1sQVBJXG4iXX0=
