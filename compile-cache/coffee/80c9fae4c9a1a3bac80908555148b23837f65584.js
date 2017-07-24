(function() {
  var Baby, _2DArrayToMarkdownTable, fileExtensionToLanguageMap, fileImport, fs, markdownFileExtensions, path, protocolsWhiteListRegExp,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Baby = require('babyparse');

  path = require('path');

  fs = require('fs');

  protocolsWhiteListRegExp = require('./protocols-whitelist').protocolsWhiteListRegExp;

  markdownFileExtensions = atom.config.get('markdown-preview-enhanced.fileExtension').split(',').map(function(x) {
    return x.trim();
  }) || ['.md', '.mmark', '.markdown'];

  fileExtensionToLanguageMap = {
    'vhd': 'vhdl',
    'erl': 'erlang'
  };

  _2DArrayToMarkdownTable = function(_2DArr) {
    var output;
    output = "  \n";
    _2DArr.forEach(function(arr, offset) {
      var i;
      i = 0;
      output += '|';
      while (i < arr.length) {
        output += arr[i] + '|';
        i += 1;
      }
      output += '  \n';
      if (offset === 0) {
        output += '|';
        i = 0;
        while (i < arr.length) {
          output += '---|';
          i += 1;
        }
        return output += '  \n';
      }
    });
    output += '  ';
    return output;
  };


  /*
  @param {String} inputString, required
  @param {Object} filesCache, optional
  @param {String} fileDirectoryPath, required
  @param {String} projectDirectoryPath, required
  @param {Boolean} useAbsoluteImagePath, optional
  @param {Object} editor, optional
  return
  {
    {String} outputString,
    {Array} heightsDelta : [[start, height, acc, realStart], ...]
            start is the buffer row
            heightsDelta is used to correct scroll sync. please refer to md.coffee
  }
   */

  fileImport = function(inputString, arg) {
    var acc, editor, fileDirectoryPath, filesCache, heightsDelta, outputString, projectDirectoryPath, updateHeightsDelta, useAbsoluteImagePath;
    filesCache = arg.filesCache, fileDirectoryPath = arg.fileDirectoryPath, projectDirectoryPath = arg.projectDirectoryPath, useAbsoluteImagePath = arg.useAbsoluteImagePath, editor = arg.editor;
    heightsDelta = [];
    acc = 0;
    updateHeightsDelta = function(str, start) {
      var height, ref;
      height = (((ref = str.match(/\n/g)) != null ? ref.length : void 0) + 1) || 1;
      heightsDelta.push({
        realStart: start,
        start: start + acc - heightsDelta.length,
        height: height,
        acc: acc
      });
      return acc = acc + height;
    };
    outputString = inputString.replace(/(^|\n)\@import(\s+)\"([^\"]+)\"/g, function(whole, prefix, spaces, filePath, offset) {
      var absoluteFilePath, e, extname, fileContent, fileExtension, output, parseResult, ref, start;
      start = 0;
      if (editor) {
        start = ((ref = inputString.slice(0, offset + 1).match(/\n/g)) != null ? ref.length : void 0) || 0;
      }
      if (filePath.match(protocolsWhiteListRegExp)) {
        absoluteFilePath = filePath;
      } else if (filePath.startsWith('/')) {
        absoluteFilePath = path.resolve(projectDirectoryPath, '.' + filePath);
      } else {
        absoluteFilePath = path.resolve(fileDirectoryPath, filePath);
      }
      if (filesCache != null ? filesCache[absoluteFilePath] : void 0) {
        if (editor) {
          updateHeightsDelta(filesCache[absoluteFilePath], start);
        }
        return prefix + filesCache[absoluteFilePath];
      }
      extname = path.extname(filePath);
      output = '';
      if (extname === '.jpeg' || extname === '.jpg' || extname === '.gif' || extname === '.png' || extname === '.apng' || extname === '.svg' || extname === '.bmp') {
        if (filePath.match(protocolsWhiteListRegExp)) {
          output = "![](" + filePath + ")  ";
        } else if (useAbsoluteImagePath) {
          output = "![](" + ('/' + path.relative(projectDirectoryPath, absoluteFilePath) + '?' + Math.random()) + ")  ";
        } else {
          output = "![](" + (path.relative(fileDirectoryPath, absoluteFilePath) + '?' + Math.random()) + ")  ";
        }
        if (filesCache != null) {
          filesCache[absoluteFilePath] = output;
        }
      } else {
        try {
          fileContent = fs.readFileSync(absoluteFilePath, {
            encoding: 'utf-8'
          });
          if (indexOf.call(markdownFileExtensions, extname) >= 0) {
            output = fileImport(fileContent, {
              filesCache: filesCache,
              projectDirectoryPath: projectDirectoryPath,
              useAbsoluteImagePath: true,
              fileDirectoryPath: path.dirname(absoluteFilePath)
            }).outputString + '  ';
            if (filesCache != null) {
              filesCache[absoluteFilePath] = output;
            }
          } else if (extname === '.html') {
            output = '<div>' + fileContent + '</div>  ';
            if (filesCache != null) {
              filesCache[absoluteFilePath] = output;
            }
          } else if (extname === '.csv') {
            parseResult = Baby.parse(fileContent);
            if (parseResult.errors.length) {
              output = "<pre>" + parseResult.errors[0] + "</pre>  ";
            } else {
              output = _2DArrayToMarkdownTable(parseResult.data);
              if (filesCache != null) {
                filesCache[absoluteFilePath] = output;
              }
            }
          } else if (extname === '.dot') {
            output = "```@viz\n" + fileContent + "\n```  ";
            if (filesCache != null) {
              filesCache[absoluteFilePath] = output;
            }
          } else if (extname === '.mermaid') {
            output = "```@mermaid\n" + fileContent + "\n```  ";
            if (filesCache != null) {
              filesCache[absoluteFilePath] = output;
            }
          } else if (extname === '.puml' || extname === '.plantuml') {
            output = "```@puml\n" + fileContent + "\n```  ";
            if (filesCache != null) {
              filesCache[absoluteFilePath] = output;
            }
          } else if (extname === '.wavedrom') {
            output = "```@wavedrom\n" + fileContent + "\n```  ";
            if (filesCache != null) {
              filesCache[absoluteFilePath] = output;
            }
          } else {
            fileExtension = extname.slice(1, extname.length);
            output = "```" + (fileExtensionToLanguageMap[fileExtension] || fileExtension) + "  \n" + fileContent + "\n```  ";
            if (filesCache != null) {
              filesCache[absoluteFilePath] = output;
            }
          }
        } catch (error) {
          e = error;
          output = prefix + "<pre>" + (e.toString()) + "</pre>  ";
        }
      }
      if (editor) {
        updateHeightsDelta(output, start);
      }
      return prefix + output;
    });
    return {
      outputString: outputString,
      heightsDelta: heightsDelta
    };
  };

  module.exports = fileImport;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9maWxlLWltcG9ydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlJQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxXQUFSOztFQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUosMkJBQTRCLE9BQUEsQ0FBUSx1QkFBUjs7RUFFN0Isc0JBQUEsR0FBeUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlDQUFoQixDQUEwRCxDQUFDLEtBQTNELENBQWlFLEdBQWpFLENBQXFFLENBQUMsR0FBdEUsQ0FBMEUsU0FBQyxDQUFEO1dBQUssQ0FBQyxDQUFDLElBQUYsQ0FBQTtFQUFMLENBQTFFLENBQUEsSUFBNEYsQ0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixXQUFsQjs7RUFHckgsMEJBQUEsR0FBNkI7SUFDM0IsS0FBQSxFQUFPLE1BRG9CO0lBRTNCLEtBQUEsRUFBTyxRQUZvQjs7O0VBTzdCLHVCQUFBLEdBQTBCLFNBQUMsTUFBRDtBQUN4QixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLE9BQVAsQ0FBZSxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBQ2IsVUFBQTtNQUFBLENBQUEsR0FBSTtNQUNKLE1BQUEsSUFBVTtBQUNWLGFBQU0sQ0FBQSxHQUFJLEdBQUcsQ0FBQyxNQUFkO1FBQ0UsTUFBQSxJQUFXLEdBQUksQ0FBQSxDQUFBLENBQUosR0FBUztRQUNwQixDQUFBLElBQUs7TUFGUDtNQUdBLE1BQUEsSUFBVTtNQUNWLElBQUcsTUFBQSxLQUFVLENBQWI7UUFDRSxNQUFBLElBQVU7UUFDVixDQUFBLEdBQUk7QUFDSixlQUFNLENBQUEsR0FBSSxHQUFHLENBQUMsTUFB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RyxPQUFBLEtBQVksT0FBWixJQUFBLE9BQUEsS0FBcUIsV0FBeEI7WUFDSCxNQUFBLEdBQVMsWUFBQSxHQUFhLFdBQWIsR0FBeUI7O2NBQ2xDLFVBQVksQ0FBQSxnQkFBQSxDQUFaLEdBQWdDO2FBRjdCO1dBQUEsTUFHQSxJQUFHLE9BQUEsS0FBWSxXQUFmO1lBQ0gsTUFBQSxHQUFTLGdCQUFBLEdBQWlCLFdBQWpCLEdBQTZCOztjQUN0QyxVQUFZLENBQUEsZ0JBQUEsQ0FBWixHQUFnQzthQUY3QjtXQUFBLE1BQUE7WUFJSCxhQUFBLEdBQWdCLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZCxFQUFpQixPQUFPLENBQUMsTUFBekI7WUFDaEIsTUFBQSxHQUFTLEtBQUEsR0FBSyxDQUFDLDBCQUEyQixDQUFBLGFBQUEsQ0FBM0IsSUFBNkMsYUFBOUMsQ0FBTCxHQUFpRSxNQUFqRSxHQUF1RSxXQUF2RSxHQUFtRjs7Y0FDNUYsVUFBWSxDQUFBLGdCQUFBLENBQVosR0FBZ0M7YUFON0I7V0ExQlA7U0FBQSxhQUFBO1VBaUNNO1VBQ0osTUFBQSxHQUFZLE1BQUQsR0FBUSxPQUFSLEdBQWMsQ0FBQyxDQUFDLENBQUMsUUFBRixDQUFBLENBQUQsQ0FBZCxHQUE0QixXQWxDekM7U0FWRjs7TUE4Q0EsSUFBcUMsTUFBckM7UUFBQSxrQkFBQSxDQUFtQixNQUFuQixFQUEyQixLQUEzQixFQUFBOztBQUNBLGFBQU8sTUFBQSxHQUFTO0lBakVxRCxDQUF4RDtBQW9FZixXQUFPO01BQUMsY0FBQSxZQUFEO01BQWUsY0FBQSxZQUFmOztFQW5GSTs7RUFxRmIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF4SWpCIiwic291cmNlc0NvbnRlbnQiOlsiQmFieSA9IHJlcXVpcmUoJ2JhYnlwYXJzZScpXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG5cbntwcm90b2NvbHNXaGl0ZUxpc3RSZWdFeHB9ID0gcmVxdWlyZSgnLi9wcm90b2NvbHMtd2hpdGVsaXN0JylcblxubWFya2Rvd25GaWxlRXh0ZW5zaW9ucyA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5maWxlRXh0ZW5zaW9uJykuc3BsaXQoJywnKS5tYXAoKHgpLT54LnRyaW0oKSkgb3IgWycubWQnLCAnLm1tYXJrJywgJy5tYXJrZG93biddXG5cblxuZmlsZUV4dGVuc2lvblRvTGFuZ3VhZ2VNYXAgPSB7XG4gICd2aGQnOiAndmhkbCcsXG4gICdlcmwnOiAnZXJsYW5nJ1xufVxuXG4jIENvbnZlcnQgMkQgYXJyYXkgdG8gbWFya2Rvd24gdGFibGUuXG4jIFRoZSBmaXJzdCByb3cgaXMgaGVhZGluZ3MuXG5fMkRBcnJheVRvTWFya2Rvd25UYWJsZSA9IChfMkRBcnIpLT5cbiAgb3V0cHV0ID0gXCIgIFxcblwiXG4gIF8yREFyci5mb3JFYWNoIChhcnIsIG9mZnNldCktPlxuICAgIGkgPSAwXG4gICAgb3V0cHV0ICs9ICd8J1xuICAgIHdoaWxlIGkgPCBhcnIubGVuZ3RoXG4gICAgICBvdXRwdXQgKz0gKGFycltpXSArICd8JylcbiAgICAgIGkgKz0gMVxuICAgIG91dHB1dCArPSAnICBcXG4nXG4gICAgaWYgb2Zmc2V0ID09IDBcbiAgICAgIG91dHB1dCArPSAnfCdcbiAgICAgIGkgPSAwXG4gICAgICB3aGlsZSBpIDwgYXJyLmxlbmd0aFxuICAgICAgICBvdXRwdXQgKz0gKCctLS18JylcbiAgICAgICAgaSArPSAxXG4gICAgICBvdXRwdXQgKz0gJyAgXFxuJ1xuXG4gIG91dHB1dCArPSAnICAnXG4gIG91dHB1dFxuXG4jIyNcbkBwYXJhbSB7U3RyaW5nfSBpbnB1dFN0cmluZywgcmVxdWlyZWRcbkBwYXJhbSB7T2JqZWN0fSBmaWxlc0NhY2hlLCBvcHRpb25hbFxuQHBhcmFtIHtTdHJpbmd9IGZpbGVEaXJlY3RvcnlQYXRoLCByZXF1aXJlZFxuQHBhcmFtIHtTdHJpbmd9IHByb2plY3REaXJlY3RvcnlQYXRoLCByZXF1aXJlZFxuQHBhcmFtIHtCb29sZWFufSB1c2VBYnNvbHV0ZUltYWdlUGF0aCwgb3B0aW9uYWxcbkBwYXJhbSB7T2JqZWN0fSBlZGl0b3IsIG9wdGlvbmFsXG5yZXR1cm5cbntcbiAge1N0cmluZ30gb3V0cHV0U3RyaW5nLFxuICB7QXJyYXl9IGhlaWdodHNEZWx0YSA6IFtbc3RhcnQsIGhlaWdodCwgYWNjLCByZWFsU3RhcnRdLCAuLi5dXG4gICAgICAgICAgc3RhcnQgaXMgdGhlIGJ1ZmZlciByb3dcbiAgICAgICAgICBoZWlnaHRzRGVsdGEgaXMgdXNlZCB0byBjb3JyZWN0IHNjcm9sbCBzeW5jLiBwbGVhc2UgcmVmZXIgdG8gbWQuY29mZmVlXG59XG4jIyNcbmZpbGVJbXBvcnQgPSAoaW5wdXRTdHJpbmcsIHtmaWxlc0NhY2hlLCBmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGgsIHVzZUFic29sdXRlSW1hZ2VQYXRoLCBlZGl0b3J9KS0+XG4gIGhlaWdodHNEZWx0YSA9IFtdXG4gIGFjYyA9IDBcblxuICB1cGRhdGVIZWlnaHRzRGVsdGEgPSAoc3RyLCBzdGFydCktPlxuICAgIGhlaWdodCA9IChzdHIubWF0Y2goL1xcbi9nKT8ubGVuZ3RoICsgMSkgb3IgMVxuICAgIGhlaWdodHNEZWx0YS5wdXNoKHtcbiAgICAgIHJlYWxTdGFydDogc3RhcnQsXG4gICAgICBzdGFydDogc3RhcnQgKyBhY2MgLSBoZWlnaHRzRGVsdGEubGVuZ3RoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICBhY2M6IGFjYyxcbiAgICB9KVxuXG4gICAgYWNjID0gYWNjICsgaGVpZ2h0XG5cbiAgb3V0cHV0U3RyaW5nID0gaW5wdXRTdHJpbmcucmVwbGFjZSAvKF58XFxuKVxcQGltcG9ydChcXHMrKVxcXCIoW15cXFwiXSspXFxcIi9nLCAod2hvbGUsIHByZWZpeCwgc3BhY2VzLCBmaWxlUGF0aCwgb2Zmc2V0KS0+XG4gICAgc3RhcnQgPSAwXG4gICAgaWYgZWRpdG9yXG4gICAgICBzdGFydCA9IChpbnB1dFN0cmluZy5zbGljZSgwLCBvZmZzZXQgKyAxKS5tYXRjaCgvXFxuL2cpPy5sZW5ndGgpIG9yIDBcblxuICAgIGlmIGZpbGVQYXRoLm1hdGNoKHByb3RvY29sc1doaXRlTGlzdFJlZ0V4cClcbiAgICAgIGFic29sdXRlRmlsZVBhdGggPSBmaWxlUGF0aFxuICAgIGVsc2UgaWYgZmlsZVBhdGguc3RhcnRzV2l0aCgnLycpXG4gICAgICBhYnNvbHV0ZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKHByb2plY3REaXJlY3RvcnlQYXRoLCAnLicgKyBmaWxlUGF0aClcbiAgICBlbHNlXG4gICAgICBhYnNvbHV0ZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGZpbGVEaXJlY3RvcnlQYXRoLCBmaWxlUGF0aClcblxuICAgIGlmIGZpbGVzQ2FjaGU/W2Fic29sdXRlRmlsZVBhdGhdICMgYWxyZWFkeSBpbiBjYWNoZVxuICAgICAgdXBkYXRlSGVpZ2h0c0RlbHRhKGZpbGVzQ2FjaGVbYWJzb2x1dGVGaWxlUGF0aF0sIHN0YXJ0KSBpZiBlZGl0b3JcbiAgICAgIHJldHVybiBwcmVmaXggKyBmaWxlc0NhY2hlW2Fic29sdXRlRmlsZVBhdGhdXG5cbiAgICBleHRuYW1lID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKVxuICAgIG91dHB1dCA9ICcnXG4gICAgaWYgZXh0bmFtZSBpbiBbJy5qcGVnJywgJy5qcGcnLCAnLmdpZicsICcucG5nJywgJy5hcG5nJywgJy5zdmcnLCAnLmJtcCddICMgaW1hZ2VcbiAgICAgIGlmIGZpbGVQYXRoLm1hdGNoKHByb3RvY29sc1doaXRlTGlzdFJlZ0V4cClcbiAgICAgICAgb3V0cHV0ID0gXCIhW10oI3tmaWxlUGF0aH0pICBcIlxuICAgICAgZWxzZSBpZiB1c2VBYnNvbHV0ZUltYWdlUGF0aFxuICAgICAgICBvdXRwdXQgPSBcIiFbXSgjeycvJyArIHBhdGgucmVsYXRpdmUocHJvamVjdERpcmVjdG9yeVBhdGgsIGFic29sdXRlRmlsZVBhdGgpICsgJz8nICsgTWF0aC5yYW5kb20oKX0pICBcIlxuICAgICAgZWxzZVxuICAgICAgICBvdXRwdXQgPSBcIiFbXSgje3BhdGgucmVsYXRpdmUoZmlsZURpcmVjdG9yeVBhdGgsIGFic29sdXRlRmlsZVBhdGgpICsgJz8nICsgTWF0aC5yYW5kb20oKX0pICBcIlxuXG4gICAgICBmaWxlc0NhY2hlP1thYnNvbHV0ZUZpbGVQYXRoXSA9IG91dHB1dFxuICAgIGVsc2VcbiAgICAgIHRyeVxuICAgICAgICBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhhYnNvbHV0ZUZpbGVQYXRoLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9KVxuXG4gICAgICAgIGlmIGV4dG5hbWUgaW4gbWFya2Rvd25GaWxlRXh0ZW5zaW9ucyAjIG1hcmtkb3duIGZpbGVzXG4gICAgICAgICAgb3V0cHV0ID0gZmlsZUltcG9ydChmaWxlQ29udGVudCwge2ZpbGVzQ2FjaGUsIHByb2plY3REaXJlY3RvcnlQYXRoLCB1c2VBYnNvbHV0ZUltYWdlUGF0aDogdHJ1ZSwgZmlsZURpcmVjdG9yeVBhdGg6IHBhdGguZGlybmFtZShhYnNvbHV0ZUZpbGVQYXRoKX0pLm91dHB1dFN0cmluZyArICcgICdcbiAgICAgICAgICBmaWxlc0NhY2hlP1thYnNvbHV0ZUZpbGVQYXRoXSA9IG91dHB1dFxuICAgICAgICBlbHNlIGlmIGV4dG5hbWUgPT0gJy5odG1sJyAjIGh0bWwgZmlsZVxuICAgICAgICAgIG91dHB1dCA9ICc8ZGl2PicgKyBmaWxlQ29udGVudCArICc8L2Rpdj4gICdcbiAgICAgICAgICBmaWxlc0NhY2hlP1thYnNvbHV0ZUZpbGVQYXRoXSA9IG91dHB1dFxuICAgICAgICBlbHNlIGlmIGV4dG5hbWUgPT0gJy5jc3YnICAjIGNzdiBmaWxlXG4gICAgICAgICAgcGFyc2VSZXN1bHQgPSBCYWJ5LnBhcnNlKGZpbGVDb250ZW50KVxuICAgICAgICAgIGlmIHBhcnNlUmVzdWx0LmVycm9ycy5sZW5ndGhcbiAgICAgICAgICAgIG91dHB1dCA9IFwiPHByZT4je3BhcnNlUmVzdWx0LmVycm9yc1swXX08L3ByZT4gIFwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBmb3JtYXQgY3N2IHRvIG1hcmtkb3duIHRhYmxlXG4gICAgICAgICAgICBvdXRwdXQgPSBfMkRBcnJheVRvTWFya2Rvd25UYWJsZShwYXJzZVJlc3VsdC5kYXRhKVxuICAgICAgICAgICAgZmlsZXNDYWNoZT9bYWJzb2x1dGVGaWxlUGF0aF0gPSBvdXRwdXRcbiAgICAgICAgZWxzZSBpZiBleHRuYW1lIGluIFsnLmRvdCddICMgZ3JhcGh2aXpcbiAgICAgICAgICBvdXRwdXQgPSBcImBgYEB2aXpcXG4je2ZpbGVDb250ZW50fVxcbmBgYCAgXCJcbiAgICAgICAgICBmaWxlc0NhY2hlP1thYnNvbHV0ZUZpbGVQYXRoXSA9IG91dHB1dFxuICAgICAgICBlbHNlIGlmIGV4dG5hbWUgPT0gJy5tZXJtYWlkJyAjIG1lcm1haWRcbiAgICAgICAgICBvdXRwdXQgPSBcImBgYEBtZXJtYWlkXFxuI3tmaWxlQ29udGVudH1cXG5gYGAgIFwiXG4gICAgICAgICAgZmlsZXNDYWNoZT9bYWJzb2x1dGVGaWxlUGF0aF0gPSBvdXRwdXRcbiAgICAgICAgZWxzZSBpZiBleHRuYW1lIGluIFsnLnB1bWwnLCAnLnBsYW50dW1sJ10gIyBwbGFudHVtbFxuICAgICAgICAgIG91dHB1dCA9IFwiYGBgQHB1bWxcXG4je2ZpbGVDb250ZW50fVxcbmBgYCAgXCJcbiAgICAgICAgICBmaWxlc0NhY2hlP1thYnNvbHV0ZUZpbGVQYXRoXSA9IG91dHB1dFxuICAgICAgICBlbHNlIGlmIGV4dG5hbWUgaW4gWycud2F2ZWRyb20nXVxuICAgICAgICAgIG91dHB1dCA9IFwiYGBgQHdhdmVkcm9tXFxuI3tmaWxlQ29udGVudH1cXG5gYGAgIFwiXG4gICAgICAgICAgZmlsZXNDYWNoZT9bYWJzb2x1dGVGaWxlUGF0aF0gPSBvdXRwdXRcbiAgICAgICAgZWxzZSAjIGNvZGVibG9ja1xuICAgICAgICAgIGZpbGVFeHRlbnNpb24gPSBleHRuYW1lLnNsaWNlKDEsIGV4dG5hbWUubGVuZ3RoKVxuICAgICAgICAgIG91dHB1dCA9IFwiYGBgI3tmaWxlRXh0ZW5zaW9uVG9MYW5ndWFnZU1hcFtmaWxlRXh0ZW5zaW9uXSBvciBmaWxlRXh0ZW5zaW9ufSAgXFxuI3tmaWxlQ29udGVudH1cXG5gYGAgIFwiXG4gICAgICAgICAgZmlsZXNDYWNoZT9bYWJzb2x1dGVGaWxlUGF0aF0gPSBvdXRwdXRcbiAgICAgIGNhdGNoIGUgIyBmYWlsZWQgdG8gbG9hZCBmaWxlXG4gICAgICAgIG91dHB1dCA9IFwiI3twcmVmaXh9PHByZT4je2UudG9TdHJpbmcoKX08L3ByZT4gIFwiXG5cbiAgICB1cGRhdGVIZWlnaHRzRGVsdGEob3V0cHV0LCBzdGFydCkgaWYgZWRpdG9yXG4gICAgcmV0dXJuIHByZWZpeCArIG91dHB1dFxuXG4gICMgY29uc29sZS5sb2coaGVpZ2h0c0RlbHRhLCBvdXRwdXRTdHJpbmcpXG4gIHJldHVybiB7b3V0cHV0U3RyaW5nLCBoZWlnaHRzRGVsdGF9XG5cbm1vZHVsZS5leHBvcnRzID0gZmlsZUltcG9ydCJdfQ==
