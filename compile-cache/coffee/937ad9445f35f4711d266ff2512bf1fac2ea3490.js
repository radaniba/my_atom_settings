(function() {
  var CACHE, Directory, encrypt, fileImport, fs, markdownConvert, path, processGraphs, processMath, processPaths, protocolsWhiteListRegExp;

  path = require('path');

  fs = require('fs');

  Directory = require('atom').Directory;

  processGraphs = require('./process-graphs');

  encrypt = require('./encrypt');

  CACHE = require('./cache');

  fileImport = require('./file-import');

  protocolsWhiteListRegExp = require('./protocols-whitelist').protocolsWhiteListRegExp;

  processMath = function(text) {
    var r;
    text = text.replace(/\\\$/g, '#slash_dollarsign#');
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, function($0, $1) {
      $1 = $1.replace(/\n/g, '').replace(/\#slash\_dollarsign\#/g, '\\\$');
      $1 = escape($1);
      return "<p align=\"center\"><img src=\"http://api.gmath.guru/cgi-bin/gmath?" + ($1.trim()) + "\"/></p>";
    });
    r = /\$([\s\S]+?)\$/g;
    text = text.replace(/\$([\s\S]+?)\$/g, function($0, $1) {
      $1 = $1.replace(/\n/g, '').replace(/\#slash\_dollarsign\#/g, '\\\$');
      $1 = escape($1);
      return "<img src=\"http://api.gmath.guru/cgi-bin/gmath?" + ($1.trim()) + "\"/>";
    });
    text = text.replace(/\#slash\_dollarsign\#/g, '\\\$');
    return text;
  };

  processPaths = function(text, fileDirectoryPath, projectDirectoryPath, useAbsoluteImagePath) {
    var match, offset, output, r, resolvePath;
    match = null;
    offset = 0;
    output = '';
    resolvePath = function(src) {
      if (src.match(protocolsWhiteListRegExp)) {
        return src;
      }
      if (useAbsoluteImagePath) {
        if (src.startsWith('/')) {
          return src;
        } else {
          return '/' + path.relative(projectDirectoryPath, path.resolve(fileDirectoryPath, src));
        }
      } else {
        if (src.startsWith('/')) {
          return path.relative(fileDirectoryPath, path.resolve(projectDirectoryPath, '.' + src));
        } else {
          return src;
        }
      }
    };
    r = /(\!?\[.*?]\()([^\)|^'|^"]*)(.*?\))/gi;
    text = text.replace(r, function(whole, a, b, c) {
      if (b[0] === '<') {
        b = b.slice(1, b.length - 1);
        return a + '<' + resolvePath(b.trim()) + '> ' + c;
      } else {
        return a + resolvePath(b.trim()) + ' ' + c;
      }
    });
    r = /(<[img|a|iframe].*?[src|href]=['"])(.+?)(['"].*?>)/gi;
    text = text.replace(r, function(whole, a, b, c) {
      return a + resolvePath(b) + c;
    });
    return text;
  };

  markdownConvert = function(text, arg, config) {
    var fileDirectoryPath, imageDir, imageDirectoryPath, outputFilePath, projectDirectoryPath, useAbsoluteImagePath;
    projectDirectoryPath = arg.projectDirectoryPath, fileDirectoryPath = arg.fileDirectoryPath;
    if (config == null) {
      config = {};
    }
    if (!config.path) {
      return atom.notifications.addError('{path} has to be specified');
    }
    if (!config.image_dir) {
      return atom.notifications.addError('{image_dir} has to be specified');
    }
    if (config.path[0] === '/') {
      outputFilePath = path.resolve(projectDirectoryPath, '.' + config.path);
    } else {
      outputFilePath = path.resolve(fileDirectoryPath, config.path);
    }
    delete CACHE[outputFilePath];
    useAbsoluteImagePath = config.absolute_image_path;
    text = fileImport(text, {
      fileDirectoryPath: fileDirectoryPath,
      projectDirectoryPath: projectDirectoryPath,
      useAbsoluteImagePath: useAbsoluteImagePath
    }).outputString;
    text = processPaths(text, fileDirectoryPath, projectDirectoryPath, useAbsoluteImagePath);
    text = processMath(text);
    if (config['image_dir'][0] === '/') {
      imageDirectoryPath = path.resolve(projectDirectoryPath, '.' + config['image_dir']);
    } else {
      imageDirectoryPath = path.resolve(fileDirectoryPath, config['image_dir']);
    }
    atom.notifications.addInfo('Your document is being prepared', {
      detail: ':)'
    });
    imageDir = new Directory(imageDirectoryPath);
    return imageDir.create().then(function(flag) {
      return processGraphs(text, {
        fileDirectoryPath: fileDirectoryPath,
        projectDirectoryPath: projectDirectoryPath,
        imageDirectoryPath: imageDirectoryPath,
        imageFilePrefix: encrypt(outputFilePath),
        useAbsoluteImagePath: useAbsoluteImagePath
      }, function(text, imagePaths) {
        if (imagePaths == null) {
          imagePaths = [];
        }
        return fs.writeFile(outputFilePath, text, function(err) {
          if (err) {
            return atom.notifications.addError('failed to generate markdown');
          }
          return atom.notifications.addInfo("File " + (path.basename(outputFilePath)) + " was created", {
            detail: "path: " + outputFilePath
          });
        });
      });
    });
  };

  module.exports = markdownConvert;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9tYXJrZG93bi1jb252ZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDSixZQUFhLE9BQUEsQ0FBUSxNQUFSOztFQUNkLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSOztFQUNoQixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBQ1YsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUNSLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDWiwyQkFBNEIsT0FBQSxDQUFRLHVCQUFSOztFQUs3QixXQUFBLEdBQWMsU0FBQyxJQUFEO0FBQ1osUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsRUFBc0Isb0JBQXRCO0lBR1AsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEscUJBQWIsRUFBb0MsU0FBQyxFQUFELEVBQUssRUFBTDtNQUN6QyxFQUFBLEdBQUssRUFBRSxDQUFDLE9BQUgsQ0FBVyxLQUFYLEVBQWtCLEVBQWxCLENBQXFCLENBQUMsT0FBdEIsQ0FBOEIsd0JBQTlCLEVBQXdELE1BQXhEO01BQ0wsRUFBQSxHQUFLLE1BQUEsQ0FBTyxFQUFQO2FBQ0wscUVBQUEsR0FBcUUsQ0FBQyxFQUFFLENBQUMsSUFBSCxDQUFBLENBQUQsQ0FBckUsR0FBZ0Y7SUFIdkMsQ0FBcEM7SUFNUCxDQUFBLEdBQUk7SUFDSixJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxpQkFBYixFQUFnQyxTQUFDLEVBQUQsRUFBSyxFQUFMO01BQ3JDLEVBQUEsR0FBSyxFQUFFLENBQUMsT0FBSCxDQUFXLEtBQVgsRUFBa0IsRUFBbEIsQ0FBcUIsQ0FBQyxPQUF0QixDQUE4Qix3QkFBOUIsRUFBd0QsTUFBeEQ7TUFDTCxFQUFBLEdBQUssTUFBQSxDQUFPLEVBQVA7YUFDTCxpREFBQSxHQUFpRCxDQUFDLEVBQUUsQ0FBQyxJQUFILENBQUEsQ0FBRCxDQUFqRCxHQUE0RDtJQUh2QixDQUFoQztJQUtQLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLHdCQUFiLEVBQXVDLE1BQXZDO1dBQ1A7RUFqQlk7O0VBb0JkLFlBQUEsR0FBZSxTQUFDLElBQUQsRUFBTyxpQkFBUCxFQUEwQixvQkFBMUIsRUFBZ0Qsb0JBQWhEO0FBQ2IsUUFBQTtJQUFBLEtBQUEsR0FBUTtJQUNSLE1BQUEsR0FBUztJQUNULE1BQUEsR0FBUztJQUVULFdBQUEsR0FBYyxTQUFDLEdBQUQ7TUFDWixJQUFHLEdBQUcsQ0FBQyxLQUFKLENBQVUsd0JBQVYsQ0FBSDtBQUNFLGVBQU8sSUFEVDs7TUFHQSxJQUFHLG9CQUFIO1FBQ0UsSUFBRyxHQUFHLENBQUMsVUFBSixDQUFlLEdBQWYsQ0FBSDtBQUNFLGlCQUFPLElBRFQ7U0FBQSxNQUFBO0FBR0UsaUJBQU8sR0FBQSxHQUFNLElBQUksQ0FBQyxRQUFMLENBQWMsb0JBQWQsRUFBb0MsSUFBSSxDQUFDLE9BQUwsQ0FBYSxpQkFBYixFQUFnQyxHQUFoQyxDQUFwQyxFQUhmO1NBREY7T0FBQSxNQUFBO1FBTUUsSUFBRyxHQUFHLENBQUMsVUFBSixDQUFlLEdBQWYsQ0FBSDtBQUNFLGlCQUFPLElBQUksQ0FBQyxRQUFMLENBQWMsaUJBQWQsRUFBaUMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxvQkFBYixFQUFtQyxHQUFBLEdBQUksR0FBdkMsQ0FBakMsRUFEVDtTQUFBLE1BQUE7QUFHRSxpQkFBTyxJQUhUO1NBTkY7O0lBSlk7SUFnQmQsQ0FBQSxHQUFJO0lBQ0osSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsQ0FBYixFQUFnQixTQUFDLEtBQUQsRUFBUSxDQUFSLEVBQVcsQ0FBWCxFQUFjLENBQWQ7TUFDckIsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsR0FBWDtRQUNFLENBQUEsR0FBSSxDQUFDLENBQUMsS0FBRixDQUFRLENBQVIsRUFBVyxDQUFDLENBQUMsTUFBRixHQUFTLENBQXBCO2VBQ0osQ0FBQSxHQUFJLEdBQUosR0FBVSxXQUFBLENBQVksQ0FBQyxDQUFDLElBQUYsQ0FBQSxDQUFaLENBQVYsR0FBa0MsSUFBbEMsR0FBeUMsRUFGM0M7T0FBQSxNQUFBO2VBSUUsQ0FBQSxHQUFJLFdBQUEsQ0FBWSxDQUFDLENBQUMsSUFBRixDQUFBLENBQVosQ0FBSixHQUE0QixHQUE1QixHQUFrQyxFQUpwQzs7SUFEcUIsQ0FBaEI7SUFRUCxDQUFBLEdBQUk7SUFDSixJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFiLEVBQWdCLFNBQUMsS0FBRCxFQUFRLENBQVIsRUFBVyxDQUFYLEVBQWMsQ0FBZDthQUNyQixDQUFBLEdBQUksV0FBQSxDQUFZLENBQVosQ0FBSixHQUFxQjtJQURBLENBQWhCO1dBR1A7RUFsQ2E7O0VBb0NmLGVBQUEsR0FBa0IsU0FBQyxJQUFELEVBQU8sR0FBUCxFQUFrRCxNQUFsRDtBQUNoQixRQUFBO0lBRHdCLGlEQUFzQjs7TUFBb0IsU0FBTzs7SUFDekUsSUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFYO0FBQ0UsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLDRCQUE1QixFQURUOztJQUdBLElBQUcsQ0FBQyxNQUFNLENBQUMsU0FBWDtBQUNFLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixpQ0FBNUIsRUFEVDs7SUFJQSxJQUFHLE1BQU0sQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFaLEtBQWtCLEdBQXJCO01BQ0UsY0FBQSxHQUFpQixJQUFJLENBQUMsT0FBTCxDQUFhLG9CQUFiLEVBQW1DLEdBQUEsR0FBTSxNQUFNLENBQUMsSUFBaEQsRUFEbkI7S0FBQSxNQUFBO01BR0UsY0FBQSxHQUFpQixJQUFJLENBQUMsT0FBTCxDQUFhLGlCQUFiLEVBQWdDLE1BQU0sQ0FBQyxJQUF2QyxFQUhuQjs7SUFLQSxPQUFPLEtBQU0sQ0FBQSxjQUFBO0lBRWIsb0JBQUEsR0FBdUIsTUFBTSxDQUFDO0lBRzlCLElBQUEsR0FBTyxVQUFBLENBQVcsSUFBWCxFQUFpQjtNQUFDLG1CQUFBLGlCQUFEO01BQW9CLHNCQUFBLG9CQUFwQjtNQUEwQyxzQkFBQSxvQkFBMUM7S0FBakIsQ0FBaUYsQ0FBQztJQUl6RixJQUFBLEdBQU8sWUFBQSxDQUFhLElBQWIsRUFBbUIsaUJBQW5CLEVBQXNDLG9CQUF0QyxFQUE0RCxvQkFBNUQ7SUFFUCxJQUFBLEdBQU8sV0FBQSxDQUFZLElBQVo7SUFHUCxJQUFHLE1BQU8sQ0FBQSxXQUFBLENBQWEsQ0FBQSxDQUFBLENBQXBCLEtBQTBCLEdBQTdCO01BQ0Usa0JBQUEsR0FBcUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxvQkFBYixFQUFtQyxHQUFBLEdBQU0sTUFBTyxDQUFBLFdBQUEsQ0FBaEQsRUFEdkI7S0FBQSxNQUFBO01BR0Usa0JBQUEsR0FBcUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxpQkFBYixFQUFnQyxNQUFPLENBQUEsV0FBQSxDQUF2QyxFQUh2Qjs7SUFLQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGlDQUEzQixFQUE4RDtNQUFBLE1BQUEsRUFBUSxJQUFSO0tBQTlEO0lBRUEsUUFBQSxHQUFlLElBQUEsU0FBQSxDQUFVLGtCQUFWO1dBQ2YsUUFBUSxDQUFDLE1BQVQsQ0FBQSxDQUFpQixDQUFDLElBQWxCLENBQXVCLFNBQUMsSUFBRDthQUdyQixhQUFBLENBQWMsSUFBZCxFQUFvQjtRQUFDLG1CQUFBLGlCQUFEO1FBQW9CLHNCQUFBLG9CQUFwQjtRQUEwQyxvQkFBQSxrQkFBMUM7UUFBOEQsZUFBQSxFQUFpQixPQUFBLENBQVEsY0FBUixDQUEvRTtRQUF3RyxzQkFBQSxvQkFBeEc7T0FBcEIsRUFBbUosU0FBQyxJQUFELEVBQU8sVUFBUDs7VUFBTyxhQUFXOztlQUNuSyxFQUFFLENBQUMsU0FBSCxDQUFhLGNBQWIsRUFBNkIsSUFBN0IsRUFBbUMsU0FBQyxHQUFEO1VBQ2pDLElBQXFFLEdBQXJFO0FBQUEsbUJBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0Qiw2QkFBNUIsRUFBUDs7aUJBQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixPQUFBLEdBQU8sQ0FBQyxJQUFJLENBQUMsUUFBTCxDQUFjLGNBQWQsQ0FBRCxDQUFQLEdBQXNDLGNBQWpFLEVBQWdGO1lBQUEsTUFBQSxFQUFRLFFBQUEsR0FBUyxjQUFqQjtXQUFoRjtRQUZpQyxDQUFuQztNQURpSixDQUFuSjtJQUhxQixDQUF2QjtFQW5DZ0I7O0VBNENsQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWhIakIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG57RGlyZWN0b3J5fSA9IHJlcXVpcmUgJ2F0b20nXG5wcm9jZXNzR3JhcGhzID0gcmVxdWlyZSAnLi9wcm9jZXNzLWdyYXBocydcbmVuY3J5cHQgPSByZXF1aXJlICcuL2VuY3J5cHQnXG5DQUNIRSA9IHJlcXVpcmUgJy4vY2FjaGUnXG5maWxlSW1wb3J0ID0gcmVxdWlyZSAnLi9maWxlLWltcG9ydCdcbntwcm90b2NvbHNXaGl0ZUxpc3RSZWdFeHB9ID0gcmVxdWlyZSAnLi9wcm90b2NvbHMtd2hpdGVsaXN0J1xuXG4jIFRPRE86IHJlZmFjdG9yIHRoaXMgZmlsZVxuIyBpdCBoYXMgY29tbW9uIGZ1bmN0aW9ucyBhcyBwYW5kb2MtY29udmVydC5jb2ZmZWVcblxucHJvY2Vzc01hdGggPSAodGV4dCktPlxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXFxcXFwkL2csICcjc2xhc2hfZG9sbGFyc2lnbiMnKVxuXG4gICMgZGlzcGxheVxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlIC9cXCRcXCQoW1xcc1xcU10rPylcXCRcXCQvZywgKCQwLCAkMSktPlxuICAgICQxID0gJDEucmVwbGFjZSgvXFxuL2csICcnKS5yZXBsYWNlKC9cXCNzbGFzaFxcX2RvbGxhcnNpZ25cXCMvZywgJ1xcXFxcXCQnKVxuICAgICQxID0gZXNjYXBlKCQxKVxuICAgIFwiPHAgYWxpZ249XFxcImNlbnRlclxcXCI+PGltZyBzcmM9XFxcImh0dHA6Ly9hcGkuZ21hdGguZ3VydS9jZ2ktYmluL2dtYXRoPyN7JDEudHJpbSgpfVxcXCIvPjwvcD5cIlxuXG4gICMgaW5saW5lXG4gIHIgPSAvXFwkKFtcXHNcXFNdKz8pXFwkL2dcbiAgdGV4dCA9IHRleHQucmVwbGFjZSAvXFwkKFtcXHNcXFNdKz8pXFwkL2csICgkMCwgJDEpLT5cbiAgICAkMSA9ICQxLnJlcGxhY2UoL1xcbi9nLCAnJykucmVwbGFjZSgvXFwjc2xhc2hcXF9kb2xsYXJzaWduXFwjL2csICdcXFxcXFwkJylcbiAgICAkMSA9IGVzY2FwZSgkMSlcbiAgICBcIjxpbWcgc3JjPVxcXCJodHRwOi8vYXBpLmdtYXRoLmd1cnUvY2dpLWJpbi9nbWF0aD8jeyQxLnRyaW0oKX1cXFwiLz5cIlxuXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcI3NsYXNoXFxfZG9sbGFyc2lnblxcIy9nLCAnXFxcXFxcJCcpXG4gIHRleHRcblxuIyBjb252ZXJ0IHJlbGF0aXZlIHBhdGggdG8gcHJvamVjdCBwYXRoXG5wcm9jZXNzUGF0aHMgPSAodGV4dCwgZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRoLCB1c2VBYnNvbHV0ZUltYWdlUGF0aCktPlxuICBtYXRjaCA9IG51bGxcbiAgb2Zmc2V0ID0gMFxuICBvdXRwdXQgPSAnJ1xuXG4gIHJlc29sdmVQYXRoID0gKHNyYyktPlxuICAgIGlmIHNyYy5tYXRjaChwcm90b2NvbHNXaGl0ZUxpc3RSZWdFeHApXG4gICAgICByZXR1cm4gc3JjXG5cbiAgICBpZiB1c2VBYnNvbHV0ZUltYWdlUGF0aFxuICAgICAgaWYgc3JjLnN0YXJ0c1dpdGgoJy8nKVxuICAgICAgICByZXR1cm4gc3JjXG4gICAgICBlbHNlICMgLi90ZXN0LnBuZyBvciB0ZXN0LnBuZ1xuICAgICAgICByZXR1cm4gJy8nICsgcGF0aC5yZWxhdGl2ZShwcm9qZWN0RGlyZWN0b3J5UGF0aCwgcGF0aC5yZXNvbHZlKGZpbGVEaXJlY3RvcnlQYXRoLCBzcmMpKVxuICAgIGVsc2VcbiAgICAgIGlmIHNyYy5zdGFydHNXaXRoKCcvJylcbiAgICAgICAgcmV0dXJuIHBhdGgucmVsYXRpdmUoZmlsZURpcmVjdG9yeVBhdGgsIHBhdGgucmVzb2x2ZShwcm9qZWN0RGlyZWN0b3J5UGF0aCwgJy4nK3NyYykpXG4gICAgICBlbHNlICMgLi90ZXN0LnBuZyBvciB0ZXN0LnBuZ1xuICAgICAgICByZXR1cm4gc3JjXG5cbiAgIyByZXBsYWNlIHBhdGggaW4gIVtdKC4uLikgYW5kIFtdKClcbiAgciA9IC8oXFwhP1xcWy4qP11cXCgpKFteXFwpfF4nfF5cIl0qKSguKj9cXCkpL2dpXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UgciwgKHdob2xlLCBhLCBiLCBjKS0+XG4gICAgaWYgYlswXSA9PSAnPCdcbiAgICAgIGIgPSBiLnNsaWNlKDEsIGIubGVuZ3RoLTEpXG4gICAgICBhICsgJzwnICsgcmVzb2x2ZVBhdGgoYi50cmltKCkpICsgJz4gJyArIGNcbiAgICBlbHNlXG4gICAgICBhICsgcmVzb2x2ZVBhdGgoYi50cmltKCkpICsgJyAnICsgY1xuXG4gICMgcmVwbGFjZSBwYXRoIGluIHRhZ1xuICByID0gLyg8W2ltZ3xhfGlmcmFtZV0uKj9bc3JjfGhyZWZdPVsnXCJdKSguKz8pKFsnXCJdLio/PikvZ2lcbiAgdGV4dCA9IHRleHQucmVwbGFjZSByLCAod2hvbGUsIGEsIGIsIGMpLT5cbiAgICBhICsgcmVzb2x2ZVBhdGgoYikgKyBjXG5cbiAgdGV4dFxuXG5tYXJrZG93bkNvbnZlcnQgPSAodGV4dCwge3Byb2plY3REaXJlY3RvcnlQYXRoLCBmaWxlRGlyZWN0b3J5UGF0aH0sIGNvbmZpZz17fSktPlxuICBpZiAhY29uZmlnLnBhdGhcbiAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCd7cGF0aH0gaGFzIHRvIGJlIHNwZWNpZmllZCcpXG5cbiAgaWYgIWNvbmZpZy5pbWFnZV9kaXJcbiAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCd7aW1hZ2VfZGlyfSBoYXMgdG8gYmUgc3BlY2lmaWVkJylcblxuICAjIGRlc3RcbiAgaWYgY29uZmlnLnBhdGhbMF0gPT0gJy8nXG4gICAgb3V0cHV0RmlsZVBhdGggPSBwYXRoLnJlc29sdmUocHJvamVjdERpcmVjdG9yeVBhdGgsICcuJyArIGNvbmZpZy5wYXRoKVxuICBlbHNlXG4gICAgb3V0cHV0RmlsZVBhdGggPSBwYXRoLnJlc29sdmUoZmlsZURpcmVjdG9yeVBhdGgsIGNvbmZpZy5wYXRoKVxuXG4gIGRlbGV0ZShDQUNIRVtvdXRwdXRGaWxlUGF0aF0pXG5cbiAgdXNlQWJzb2x1dGVJbWFnZVBhdGggPSBjb25maWcuYWJzb2x1dGVfaW1hZ2VfcGF0aFxuXG4gICMgaW1wb3J0IGV4dGVybmFsIGZpbGVzXG4gIHRleHQgPSBmaWxlSW1wb3J0KHRleHQsIHtmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGgsIHVzZUFic29sdXRlSW1hZ2VQYXRofSkub3V0cHV0U3RyaW5nXG5cbiAgIyBjaGFuZ2UgbGluayBwYXRoIHRvIHByb2plY3QgJy8nIHBhdGhcbiAgIyB0aGlzIGlzIGFjdHVhbGx5IGRpZmZlcm5ldCBmcm9tIHBhbmRvYy1jb252ZXJ0LmNvZmZlZVxuICB0ZXh0ID0gcHJvY2Vzc1BhdGhzIHRleHQsIGZpbGVEaXJlY3RvcnlQYXRoLCBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgdXNlQWJzb2x1dGVJbWFnZVBhdGhcblxuICB0ZXh0ID0gcHJvY2Vzc01hdGggdGV4dFxuXG4gICMgVE9ETzogY3JlYXRlIGltYWdlRm9sZGVyXG4gIGlmIGNvbmZpZ1snaW1hZ2VfZGlyJ11bMF0gPT0gJy8nXG4gICAgaW1hZ2VEaXJlY3RvcnlQYXRoID0gcGF0aC5yZXNvbHZlKHByb2plY3REaXJlY3RvcnlQYXRoLCAnLicgKyBjb25maWdbJ2ltYWdlX2RpciddKVxuICBlbHNlXG4gICAgaW1hZ2VEaXJlY3RvcnlQYXRoID0gcGF0aC5yZXNvbHZlKGZpbGVEaXJlY3RvcnlQYXRoLCBjb25maWdbJ2ltYWdlX2RpciddKVxuXG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdZb3VyIGRvY3VtZW50IGlzIGJlaW5nIHByZXBhcmVkJywgZGV0YWlsOiAnOiknKVxuXG4gIGltYWdlRGlyID0gbmV3IERpcmVjdG9yeShpbWFnZURpcmVjdG9yeVBhdGgpXG4gIGltYWdlRGlyLmNyZWF0ZSgpLnRoZW4gKGZsYWcpLT5cblxuICAgICMgbWVybWFpZCAvIHZpeiAvIHdhdmVkcm9tIGdyYXBoXG4gICAgcHJvY2Vzc0dyYXBocyB0ZXh0LCB7ZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRoLCBpbWFnZURpcmVjdG9yeVBhdGgsIGltYWdlRmlsZVByZWZpeDogZW5jcnlwdChvdXRwdXRGaWxlUGF0aCksIHVzZUFic29sdXRlSW1hZ2VQYXRofSwgKHRleHQsIGltYWdlUGF0aHM9W10pLT5cbiAgICAgIGZzLndyaXRlRmlsZSBvdXRwdXRGaWxlUGF0aCwgdGV4dCwgKGVyciktPlxuICAgICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdmYWlsZWQgdG8gZ2VuZXJhdGUgbWFya2Rvd24nKSBpZiBlcnJcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJGaWxlICN7cGF0aC5iYXNlbmFtZShvdXRwdXRGaWxlUGF0aCl9IHdhcyBjcmVhdGVkXCIsIGRldGFpbDogXCJwYXRoOiAje291dHB1dEZpbGVQYXRofVwiKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gbWFya2Rvd25Db252ZXJ0Il19
