(function() {
  var Directory, Viz, allowUnsafeEval, allowUnsafeNewFunction, async, codeChunkAPI, execFile, fs, path, plantumlAPI, processCodes, processGraphs, ref, saveSvgAsPng, svgAsPngUri;

  path = require('path');

  fs = require('fs');

  Directory = require('atom').Directory;

  execFile = require('child_process').execFile;

  async = require('async');

  Viz = null;

  plantumlAPI = require('./puml');

  codeChunkAPI = require('./code-chunk');

  svgAsPngUri = require('../dependencies/save-svg-as-png/save-svg-as-png.js').svgAsPngUri;

  ref = require('loophole'), allowUnsafeEval = ref.allowUnsafeEval, allowUnsafeNewFunction = ref.allowUnsafeNewFunction;

  processGraphs = function(text, arg, callback) {
    var codes, content, fileDirectoryPath, i, imageDirectoryPath, imageFilePrefix, j, line, lines, numOfSpacesAhead, projectDirectoryPath, trimmedLine, useAbsoluteImagePath, useStandardCodeFencingForGraphs;
    fileDirectoryPath = arg.fileDirectoryPath, projectDirectoryPath = arg.projectDirectoryPath, imageDirectoryPath = arg.imageDirectoryPath, imageFilePrefix = arg.imageFilePrefix, useAbsoluteImagePath = arg.useAbsoluteImagePath;
    lines = text.split('\n');
    codes = [];
    useStandardCodeFencingForGraphs = atom.config.get('markdown-preview-enhanced.useStandardCodeFencingForGraphs');
    i = 0;
    while (i < lines.length) {
      line = lines[i];
      trimmedLine = line.trim();
      if (trimmedLine.match(/^```\{(.+)\}$/) || trimmedLine.match(/^```\@/) || (useStandardCodeFencingForGraphs && trimmedLine.match(/(mermaid|wavedrom|viz|plantuml|puml|dot)/))) {
        numOfSpacesAhead = line.match(/\s*/).length;
        j = i + 1;
        content = '';
        while (j < lines.length) {
          if (lines[j].trim() === '```' && lines[j].match(/\s*/).length === numOfSpacesAhead) {
            codes.push({
              start: i,
              end: j,
              content: content.trim()
            });
            i = j;
            break;
          }
          content += lines[j] + '\n';
          j += 1;
        }
      }
      i += 1;
    }
    return processCodes(codes, lines, {
      fileDirectoryPath: fileDirectoryPath,
      projectDirectoryPath: projectDirectoryPath,
      imageDirectoryPath: imageDirectoryPath,
      imageFilePrefix: imageFilePrefix,
      useAbsoluteImagePath: useAbsoluteImagePath
    }, callback);
  };

  saveSvgAsPng = function(svgElement, dest, option, cb) {
    if (option == null) {
      option = {};
    }
    if (!svgElement || svgElement.tagName.toLowerCase() !== 'svg') {
      return cb(null);
    }
    if (typeof option === 'function' && !cb) {
      cb = option;
      option = {};
    }
    return svgAsPngUri(svgElement, option, function(data) {
      var base64Data;
      base64Data = data.replace(/^data:image\/png;base64,/, "");
      return fs.writeFile(dest, base64Data, 'base64', function(err) {
        return cb(err);
      });
    });
  };

  processCodes = function(codes, lines, arg, callback) {
    var asyncFunc, asyncFunctions, codeChunksArr, codeData, content, def, end, fileDirectoryPath, graphType, helper, imageDirectoryPath, imageFilePrefix, imgCount, k, len, match, projectDirectoryPath, start, useAbsoluteImagePath, wavedromIdPrefix, wavedromOffset;
    fileDirectoryPath = arg.fileDirectoryPath, projectDirectoryPath = arg.projectDirectoryPath, imageDirectoryPath = arg.imageDirectoryPath, imageFilePrefix = arg.imageFilePrefix, useAbsoluteImagePath = arg.useAbsoluteImagePath;
    asyncFunctions = [];
    if (!imageFilePrefix) {
      imageFilePrefix = Math.random().toString(36).substr(2, 9) + '_';
    }
    imageFilePrefix = imageFilePrefix.replace(/[\/&]/g, '_ss_');
    imageFilePrefix = encodeURIComponent(imageFilePrefix);
    imgCount = 0;
    wavedromIdPrefix = 'wavedrom_' + (Math.random().toString(36).substr(2, 9) + '_');
    wavedromOffset = 100;
    codeChunksArr = [];
    for (k = 0, len = codes.length; k < len; k++) {
      codeData = codes[k];
      start = codeData.start, end = codeData.end, content = codeData.content;
      def = lines[start].trim().slice(3);
      if (atom.config.get('markdown-preview-enhanced.useStandardCodeFencingForGraphs')) {
        match = def.match(/^\@?(mermaid|wavedrom|viz|plantuml|puml|dot)/);
      } else {
        match = def.match(/^\@(mermaid|wavedrom|viz|plantuml|puml|dot)/);
      }
      if (match) {
        graphType = match[1];
        if (graphType === 'mermaid') {
          helper = function(start, end, content) {
            return function(cb) {
              var div;
              mermaid.parseError = function(err, hash) {
                return atom.notifications.addError('mermaid error', {
                  detail: err
                });
              };
              if (mermaidAPI.parse(content)) {
                div = document.createElement('div');
                div.classList.add('mermaid');
                div.textContent = content;
                document.body.appendChild(div);
                return mermaid.init(null, div, function() {
                  var dest, svgElement;
                  svgElement = div.getElementsByTagName('svg')[0];
                  svgElement.classList.add('mermaid');
                  dest = path.resolve(imageDirectoryPath, imageFilePrefix + imgCount + '.png');
                  imgCount += 1;
                  return saveSvgAsPng(svgElement, dest, {}, function(error) {
                    document.body.removeChild(div);
                    return cb(null, {
                      dest: dest,
                      start: start,
                      end: end,
                      content: content,
                      type: 'graph'
                    });
                  });
                });
              } else {
                return cb(null, null);
              }
            };
          };
          asyncFunc = helper(start, end, content);
          asyncFunctions.push(asyncFunc);
        } else if (graphType === 'viz') {
          helper = function(start, end, content) {
            return function(cb) {
              var dest, div, height, options, svgElement, width;
              div = document.createElement('div');
              options = {};
              content = content.trim().replace(/^engine(\s)*[:=]([^\n]+)/, function(a, b, c) {
                var ref1;
                if ((ref1 = c != null ? c.trim() : void 0) === 'circo' || ref1 === 'dot' || ref1 === 'fdp' || ref1 === 'neato' || ref1 === 'osage' || ref1 === 'twopi') {
                  options.engine = c.trim();
                }
                return '';
              });
              if (Viz == null) {
                Viz = require('../dependencies/viz/viz.js');
              }
              div.innerHTML = Viz(content, options);
              dest = path.resolve(imageDirectoryPath, imageFilePrefix + imgCount + '.png');
              imgCount += 1;
              svgElement = div.children[0];
              width = svgElement.getBBox().width;
              height = svgElement.getBBox().height;
              return saveSvgAsPng(svgElement, dest, {
                width: width,
                height: height
              }, function(error) {
                return cb(null, {
                  dest: dest,
                  start: start,
                  end: end,
                  content: content,
                  type: 'graph'
                });
              });
            };
          };
          asyncFunc = helper(start, end, content);
          asyncFunctions.push(asyncFunc);
        } else if (graphType === 'wavedrom') {
          null;

          /*
          helper = (start, end, content)->
            (cb)->
              div = document.createElement('div')
              div.id = wavedromIdPrefix + wavedromOffset
              div.style.display = 'none'
          
               * check engine
              content = content.trim()
          
              allowUnsafeEval ->
                try
                  document.body.appendChild(div)
                  WaveDrom.RenderWaveForm(wavedromOffset, eval("(#{content})"), wavedromIdPrefix)
                  wavedromOffset += 1
          
                  dest = path.resolve(imageDirectoryPath, imageFilePrefix + imgCount + '.png')
                  imgCount += 1
          
                  svgElement = div.children[0]
                  width = svgElement.getBBox().width
                  height = svgElement.getBBox().height
          
                  console.log('rendered WaveDrom')
                  window.svgElement = svgElement
          
                  saveSvgAsPng svgElement, dest, {width, height}, (error)->
                    document.body.removeChild(div)
                    cb(null, {dest, start, end, content, type: 'graph'})
                catch error
                  console.log('failed to render wavedrom')
                  document.body.removeChild(div)
                  cb(null, null)
          
          asyncFunc = helper(start, end, content)
          asyncFunctions.push asyncFunc
           */
        } else {
          helper = function(start, end, content) {
            return function(cb) {
              var div;
              div = document.createElement('div');
              return plantumlAPI.render(content, function(outputHTML) {
                var dest, height, svgElement, width;
                div.innerHTML = outputHTML;
                dest = path.resolve(imageDirectoryPath, imageFilePrefix + imgCount + '.png');
                imgCount += 1;
                svgElement = div.children[0];
                width = svgElement.getBBox().width;
                height = svgElement.getBBox().height;
                return saveSvgAsPng(svgElement, dest, {
                  width: width,
                  height: height
                }, function(error) {
                  return cb(null, {
                    dest: dest,
                    start: start,
                    end: end,
                    content: content,
                    type: 'graph'
                  });
                });
              });
            };
          };
          asyncFunc = helper(start, end, content);
          asyncFunctions.push(asyncFunc);
        }
      } else {
        helper = function(start, end, content) {
          return function(cb) {
            var c, cmd, currentCodeChunk, dataArgs, error, id, l, lang, last, len1, offset, options;
            def = lines[start].trim().slice(3);
            match = def.match(/^\{\s*(\"[^\"]*\"|[^\s]*|[^}]*)(.*)}$/);
            if (!match) {
              return cb(null, null);
            }
            lang = match[1].trim();
            if (lang[0] === '"') {
              lang = lang.slice(1, lang.length - 1).trim();
            }
            dataArgs = match[2].trim();
            options = null;
            try {
              allowUnsafeEval(function() {
                return options = eval("({" + dataArgs + "})");
              });
            } catch (error1) {
              error = error1;
              atom.notifications.addError('Invalid options', {
                detail: dataArgs
              });
              return cb(null, null);
            }
            id = options.id;
            codeChunksArr.push({
              id: id,
              code: content,
              options: options
            });
            currentCodeChunk = codeChunksArr[codeChunksArr.length - 1];
            while (currentCodeChunk != null ? currentCodeChunk.options["continue"] : void 0) {
              last = null;
              if (currentCodeChunk.options["continue"] === true) {
                offset = 0;
                while (offset < codeChunksArr.length - 1) {
                  if (codeChunksArr[offset + 1] === currentCodeChunk) {
                    last = codeChunksArr[offset];
                    break;
                  }
                  offset += 1;
                }
              } else {
                for (l = 0, len1 = codeChunksArr.length; l < len1; l++) {
                  c = codeChunksArr[l];
                  if (c.id === currentCodeChunk.options["continue"]) {
                    last = c;
                    break;
                  }
                }
              }
              if (last) {
                content = last.code + '\n' + content;
                options = Object.assign({}, last.options, options);
              } else {
                break;
              }
              currentCodeChunk = last;
            }
            cmd = options.cmd || lang;
            return codeChunkAPI.run(content, fileDirectoryPath, cmd, options, function(error, data, options) {
              var dest, div, height, outputType, ref1, svgElement, width;
              outputType = options.output || 'text';
              if (!data) {
                return cb(null, {
                  start: start,
                  end: end,
                  content: content,
                  lang: lang,
                  type: 'code-chunk',
                  hide: options.hide,
                  data: ''
                });
              }
              if (outputType === 'text') {
                return cb(null, {
                  start: start,
                  end: end,
                  content: content,
                  lang: lang,
                  type: 'code_chunk',
                  hide: options.hide,
                  data: "```\n" + (data.trim()) + "\n```\n"
                });
              } else if (outputType === 'none') {
                return cb(null, {
                  start: start,
                  end: end,
                  content: content,
                  lang: lang,
                  type: 'code_chunk',
                  hide: options.hide
                });
              } else if (outputType === 'html') {
                div = document.createElement('div');
                div.innerHTML = data;
                if (((ref1 = div.children[0]) != null ? ref1.tagName.toLowerCase() : void 0) === 'svg') {
                  dest = path.resolve(imageDirectoryPath, imageFilePrefix + imgCount + '.png');
                  imgCount += 1;
                  svgElement = div.children[0];
                  width = svgElement.getBBox().width;
                  height = svgElement.getBBox().height;
                  return saveSvgAsPng(svgElement, dest, {
                    width: width,
                    height: height
                  }, function(error) {
                    return cb(null, {
                      start: start,
                      end: end,
                      content: content,
                      lang: lang,
                      type: 'code_chunk',
                      hide: options.hide,
                      dest: dest
                    });
                  });
                } else {
                  return cb(null, {
                    start: start,
                    end: end,
                    content: content,
                    lang: lang,
                    type: 'code_chunk',
                    hide: options.hide,
                    data: data
                  });
                }
              } else if (outputType === 'markdown') {
                return cb(null, {
                  start: start,
                  end: end,
                  content: content,
                  lang: lang,
                  type: 'code_chunk',
                  hide: options.hide,
                  data: data
                });
              } else {
                return cb(null, null);
              }
            });
          };
        };
        asyncFunc = helper(start, end, content);
        asyncFunctions.push(asyncFunc);
      }
    }
    return async.parallel(asyncFunctions, function(error, dataArray) {
      var d, data, dest, hide, i, imagePaths, imgMd, l, lang, len1, line, type;
      imagePaths = [];
      for (l = 0, len1 = dataArray.length; l < len1; l++) {
        d = dataArray[l];
        if (!d) {
          continue;
        }
        start = d.start, end = d.end, type = d.type;
        if (type === 'graph') {
          dest = d.dest;
          if (useAbsoluteImagePath) {
            imgMd = "![](" + ('/' + path.relative(projectDirectoryPath, dest) + '?' + Math.random()) + ")  ";
          } else {
            imgMd = "![](" + (path.relative(fileDirectoryPath, dest) + '?' + Math.random()) + ")  ";
          }
          imagePaths.push(dest);
          lines[start] = imgMd;
          i = start + 1;
          while (i <= end) {
            lines[i] = null;
            i += 1;
          }
        } else {
          hide = d.hide, data = d.data, dest = d.dest, lang = d.lang;
          if (hide) {
            i = start;
            while (i <= end) {
              lines[i] = null;
              i += 1;
            }
            lines[end] = '';
          } else {
            line = lines[start];
            i = line.indexOf('```');
            lines[start] = line.slice(0, i + 3) + lang;
          }
          if (dest) {
            imagePaths.push(dest);
            if (useAbsoluteImagePath) {
              imgMd = "![](" + ('/' + path.relative(projectDirectoryPath, dest) + '?' + Math.random()) + ")  ";
            } else {
              imgMd = "![](" + (path.relative(fileDirectoryPath, dest) + '?' + Math.random()) + ")  ";
            }
            lines[end] += '\n' + imgMd;
          }
          if (data) {
            lines[end] += '\n' + data;
          }
        }
      }
      lines = lines.filter(function(line) {
        return line !== null;
      }).join('\n');
      return callback(lines, imagePaths);
    });
  };

  module.exports = processGraphs;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9wcm9jZXNzLWdyYXBocy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0osWUFBYSxPQUFBLENBQVEsTUFBUjs7RUFDYixXQUFZLE9BQUEsQ0FBUSxlQUFSOztFQUNiLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFDUixHQUFBLEdBQU07O0VBQ04sV0FBQSxHQUFjLE9BQUEsQ0FBUSxRQUFSOztFQUNkLFlBQUEsR0FBZSxPQUFBLENBQVEsY0FBUjs7RUFDZCxjQUFlLE9BQUEsQ0FBUSxvREFBUjs7RUFDaEIsTUFBNEMsT0FBQSxDQUFRLFVBQVIsQ0FBNUMsRUFBQyxxQ0FBRCxFQUFrQjs7RUFLbEIsYUFBQSxHQUFnQixTQUFDLElBQUQsRUFBTyxHQUFQLEVBQTZHLFFBQTdHO0FBQ2QsUUFBQTtJQURzQiwyQ0FBbUIsaURBQXNCLDZDQUFvQix1Q0FBaUI7SUFDcEcsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWDtJQUNSLEtBQUEsR0FBUTtJQUVSLCtCQUFBLEdBQWtDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyREFBaEI7SUFDbEMsQ0FBQSxHQUFJO0FBQ0osV0FBTSxDQUFBLEdBQUksS0FBSyxDQUFDLE1BQWhCO01BQ0UsSUFBQSxHQUFPLEtBQU0sQ0FBQSxDQUFBO01BQ2IsV0FBQSxHQUFjLElBQUksQ0FBQyxJQUFMLENBQUE7TUFDZCxJQUFHLFdBQVcsQ0FBQyxLQUFaLENBQWtCLGVBQWxCLENBQUEsSUFDQSxXQUFXLENBQUMsS0FBWixDQUFrQixRQUFsQixDQURBLElBRUEsQ0FBQywrQkFBQSxJQUFvQyxXQUFXLENB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RSxLQUFBLEdBQVEsTUFBQSxHQUFNLENBQUMsR0FBQSxHQUFNLElBQUksQ0FBQyxRQUFMLENBQWMsb0JBQWQsRUFBb0MsSUFBcEMsQ0FBTixHQUFrRCxHQUFsRCxHQUF3RCxJQUFJLENBQUMsTUFBTCxDQUFBLENBQXpELENBQU4sR0FBNkUsTUFEdkY7YUFBQSxNQUFBO2NBR0UsS0FBQSxHQUFRLE1BQUEsR0FBTSxDQUFDLElBQUksQ0FBQyxRQUFMLENBQWMsaUJBQWQsRUFBaUMsSUFBakMsQ0FBQSxHQUF5QyxHQUF6QyxHQUErQyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQWhELENBQU4sR0FBb0UsTUFIOUU7O1lBSUEsS0FBTSxDQUFBLEdBQUEsQ0FBTixJQUFlLElBQUEsR0FBTyxNQU54Qjs7VUFRQSxJQUFHLElBQUg7WUFDRSxLQUFNLENBQUEsR0FBQSxDQUFOLElBQWUsSUFBQSxHQUFPLEtBRHhCO1dBbkNGOztBQUhGO01BeUNBLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFBTixDQUFhLFNBQUMsSUFBRDtlQUFTLElBQUEsS0FBTTtNQUFmLENBQWIsQ0FDRSxDQUFDLElBREgsQ0FDUSxJQURSO2FBRVIsUUFBQSxDQUFTLEtBQVQsRUFBZ0IsVUFBaEI7SUFoRDZCLENBQS9CO0VBaE9hOztFQW1SZixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXpVakIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG57RGlyZWN0b3J5fSA9IHJlcXVpcmUgJ2F0b20nXG57ZXhlY0ZpbGV9ID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbmFzeW5jID0gcmVxdWlyZSAnYXN5bmMnXG5WaXogPSBudWxsXG5wbGFudHVtbEFQSSA9IHJlcXVpcmUgJy4vcHVtbCdcbmNvZGVDaHVua0FQSSA9IHJlcXVpcmUgJy4vY29kZS1jaHVuaydcbntzdmdBc1BuZ1VyaX0gPSByZXF1aXJlICcuLi9kZXBlbmRlbmNpZXMvc2F2ZS1zdmctYXMtcG5nL3NhdmUtc3ZnLWFzLXBuZy5qcydcbnthbGxvd1Vuc2FmZUV2YWwsIGFsbG93VW5zYWZlTmV3RnVuY3Rpb259ID0gcmVxdWlyZSAnbG9vcGhvbGUnXG5cbiMgY29udmVydCBtZXJtYWlkLCB3YXZlZHJvbSwgdml6LmpzIGZyb20gc3ZnIHRvIHBuZ1xuIyB1c2VkIGZvciBtYXJrZG93bi1jb252ZXJ0IGFuZCBwYW5kb2MtY29udmVydFxuIyBjYWxsYmFjazogZnVuY3Rpb24odGV4dCwgaW1hZ2VQYXRocz1bXSl7IC4uLiB9XG5wcm9jZXNzR3JhcGhzID0gKHRleHQsIHtmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGgsIGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4LCB1c2VBYnNvbHV0ZUltYWdlUGF0aH0sIGNhbGxiYWNrKS0+XG4gIGxpbmVzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgY29kZXMgPSBbXVxuXG4gIHVzZVN0YW5kYXJkQ29kZUZlbmNpbmdGb3JHcmFwaHMgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQudXNlU3RhbmRhcmRDb2RlRmVuY2luZ0ZvckdyYXBocycpXG4gIGkgPSAwXG4gIHdoaWxlIGkgPCBsaW5lcy5sZW5ndGhcbiAgICBsaW5lID0gbGluZXNbaV1cbiAgICB0cmltbWVkTGluZSA9IGxpbmUudHJpbSgpXG4gICAgaWYgdHJpbW1lZExpbmUubWF0Y2goL15gYGBcXHsoLispXFx9JC8pIG9yXG4gICAgICAgdHJpbW1lZExpbmUubWF0Y2goL15gYGBcXEAvKSBvclxuICAgICAgICh1c2VTdGFuZGFyZENvZGVGZW5jaW5nRm9yR3JhcGhzIGFuZCB0cmltbWVkTGluZS5tYXRjaCgvKG1lcm1haWR8d2F2ZWRyb218dml6fHBsYW50dW1sfHB1bWx8ZG90KS8pKVxuICAgICAgbnVtT2ZTcGFjZXNBaGVhZCA9IGxpbmUubWF0Y2goL1xccyovKS5sZW5ndGhcblxuICAgICAgaiA9IGkgKyAxXG4gICAgICBjb250ZW50ID0gJydcbiAgICAgIHdoaWxlIGogPCBsaW5lcy5sZW5ndGhcbiAgICAgICAgaWYgbGluZXNbal0udHJpbSgpID09ICdgYGAnIGFuZCBsaW5lc1tqXS5tYXRjaCgvXFxzKi8pLmxlbmd0aCA9PSBudW1PZlNwYWNlc0FoZWFkXG4gICAgICAgICAgY29kZXMucHVzaCh7c3RhcnQ6IGksIGVuZDogaiwgY29udGVudDogY29udGVudC50cmltKCl9KVxuICAgICAgICAgIGkgPSBqXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY29udGVudCArPSAobGluZXNbal0rJ1xcbicpXG4gICAgICAgIGogKz0gMVxuICAgIGkgKz0gMVxuXG4gIHJldHVybiBwcm9jZXNzQ29kZXMoY29kZXMsIGxpbmVzLCB7ZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRoLCBpbWFnZURpcmVjdG9yeVBhdGgsIGltYWdlRmlsZVByZWZpeCwgdXNlQWJzb2x1dGVJbWFnZVBhdGh9LCBjYWxsYmFjaylcblxuc2F2ZVN2Z0FzUG5nID0gKHN2Z0VsZW1lbnQsIGRlc3QsIG9wdGlvbj17fSwgY2IpLT5cbiAgcmV0dXJuIGNiKG51bGwpIGlmICFzdmdFbGVtZW50IG9yIHN2Z0VsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9ICdzdmcnXG5cbiAgaWYgdHlwZW9mKG9wdGlvbikgPT0gJ2Z1bmN0aW9uJyBhbmQgIWNiXG4gICAgY2IgPSBvcHRpb25cbiAgICBvcHRpb24gPSB7fVxuXG4gIHN2Z0FzUG5nVXJpIHN2Z0VsZW1lbnQsIG9wdGlvbiwgKGRhdGEpLT5cbiAgICBiYXNlNjREYXRhID0gZGF0YS5yZXBsYWNlKC9eZGF0YTppbWFnZVxcL3BuZztiYXNlNjQsLywgXCJcIilcbiAgICBmcy53cml0ZUZpbGUgZGVzdCwgYmFzZTY0RGF0YSwgJ2Jhc2U2NCcsIChlcnIpLT5cbiAgICAgIGNiKGVycilcblxuIyB7c3RhcnQsIGVuZCwgY29udGVudH1cbnByb2Nlc3NDb2RlcyA9IChjb2RlcywgbGluZXMsIHtmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGgsIGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4LCB1c2VBYnNvbHV0ZUltYWdlUGF0aH0sIGNhbGxiYWNrKS0+XG4gIGFzeW5jRnVuY3Rpb25zID0gW11cblxuICBpbWFnZUZpbGVQcmVmaXggPSAoTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpICsgJ18nKSBpZiAhaW1hZ2VGaWxlUHJlZml4XG4gIGltYWdlRmlsZVByZWZpeCA9IGltYWdlRmlsZVByZWZpeC5yZXBsYWNlKC9bXFwvJl0vZywgJ19zc18nKVxuICBpbWFnZUZpbGVQcmVmaXggPSBlbmNvZGVVUklDb21wb25lbnQoaW1hZ2VGaWxlUHJlZml4KVxuICBpbWdDb3VudCA9IDBcblxuICB3YXZlZHJvbUlkUHJlZml4ID0gJ3dhdmVkcm9tXycgKyAoTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpICsgJ18nKVxuICB3YXZlZHJvbU9mZnNldCA9IDEwMFxuXG4gIGNvZGVDaHVua3NBcnIgPSBbXSAjIGFycmF5IG9mIHtpZCwgb3B0aW9ucywgY29kZX1cblxuICBmb3IgY29kZURhdGEgaW4gY29kZXNcbiAgICB7c3RhcnQsIGVuZCwgY29udGVudH0gPSBjb2RlRGF0YVxuICAgIGRlZiA9IGxpbmVzW3N0YXJ0XS50cmltKCkuc2xpY2UoMylcblxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC51c2VTdGFuZGFyZENvZGVGZW5jaW5nRm9yR3JhcGhzJylcbiAgICAgIG1hdGNoID0gZGVmLm1hdGNoKC9eXFxAPyhtZXJtYWlkfHdhdmVkcm9tfHZpenxwbGFudHVtbHxwdW1sfGRvdCkvKVxuICAgIGVsc2VcbiAgICAgIG1hdGNoID0gZGVmLm1hdGNoKC9eXFxAKG1lcm1haWR8d2F2ZWRyb218dml6fHBsYW50dW1sfHB1bWx8ZG90KS8pXG5cbiAgICBpZiBtYXRjaCAgIyBidWlsdGluIGdyYXBoXG4gICAgICBncmFwaFR5cGUgPSBtYXRjaFsxXVxuXG4gICAgICBpZiBncmFwaFR5cGUgPT0gJ21lcm1haWQnXG4gICAgICAgIGhlbHBlciA9IChzdGFydCwgZW5kLCBjb250ZW50KS0+XG4gICAgICAgICAgKGNiKS0+XG4gICAgICAgICAgICBtZXJtYWlkLnBhcnNlRXJyb3IgPSAoZXJyLCBoYXNoKS0+XG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciAnbWVybWFpZCBlcnJvcicsIGRldGFpbDogZXJyXG5cbiAgICAgICAgICAgIGlmIG1lcm1haWRBUEkucGFyc2UoY29udGVudClcbiAgICAgICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgICAgIyBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJyAjIHdpbGwgY2F1c2UgZm9udCBpc3N1ZS5cbiAgICAgICAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoJ21lcm1haWQnKVxuICAgICAgICAgICAgICBkaXYudGV4dENvbnRlbnQgPSBjb250ZW50XG4gICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KVxuXG4gICAgICAgICAgICAgIG1lcm1haWQuaW5pdCBudWxsLCBkaXYsICgpLT5cbiAgICAgICAgICAgICAgICBzdmdFbGVtZW50ID0gZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXVxuICAgICAgICAgICAgICAgIHN2Z0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWVybWFpZCcpXG5cbiAgICAgICAgICAgICAgICBkZXN0ID0gcGF0aC5yZXNvbHZlKGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4ICsgaW1nQ291bnQgKyAnLnBuZycpXG4gICAgICAgICAgICAgICAgaW1nQ291bnQgKz0gMVxuXG4gICAgICAgICAgICAgICAgc2F2ZVN2Z0FzUG5nIHN2Z0VsZW1lbnQsIGRlc3QsIHt9LCAoZXJyb3IpLT5cbiAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZGl2KVxuICAgICAgICAgICAgICAgICAgY2IobnVsbCwge2Rlc3QsIHN0YXJ0LCBlbmQsIGNvbnRlbnQsIHR5cGU6ICdncmFwaCd9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBjYihudWxsLCBudWxsKVxuXG4gICAgICAgIGFzeW5jRnVuYyA9IGhlbHBlcihzdGFydCwgZW5kLCBjb250ZW50KVxuICAgICAgICBhc3luY0Z1bmN0aW9ucy5wdXNoIGFzeW5jRnVuY1xuXG4gICAgICBlbHNlIGlmIGdyYXBoVHlwZSA9PSAndml6J1xuICAgICAgICBoZWxwZXIgPSAoc3RhcnQsIGVuZCwgY29udGVudCktPlxuICAgICAgICAgIChjYiktPlxuICAgICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fVxuXG4gICAgICAgICAgICAjIGNoZWNrIGVuZ2luZVxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQudHJpbSgpLnJlcGxhY2UgL15lbmdpbmUoXFxzKSpbOj1dKFteXFxuXSspLywgKGEsIGIsIGMpLT5cbiAgICAgICAgICAgICAgb3B0aW9ucy5lbmdpbmUgPSBjLnRyaW0oKSBpZiBjPy50cmltKCkgaW4gWydjaXJjbycsICdkb3QnLCAnZmRwJywgJ25lYXRvJywgJ29zYWdlJywgJ3R3b3BpJ11cbiAgICAgICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgICAgIFZpeiA/PSByZXF1aXJlICcuLi9kZXBlbmRlbmNpZXMvdml6L3Zpei5qcydcbiAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSBWaXooY29udGVudCwgb3B0aW9ucylcblxuICAgICAgICAgICAgZGVzdCA9IHBhdGgucmVzb2x2ZShpbWFnZURpcmVjdG9yeVBhdGgsIGltYWdlRmlsZVByZWZpeCArIGltZ0NvdW50ICsgJy5wbmcnKVxuICAgICAgICAgICAgaW1nQ291bnQgKz0gMVxuXG4gICAgICAgICAgICBzdmdFbGVtZW50ID0gZGl2LmNoaWxkcmVuWzBdXG4gICAgICAgICAgICB3aWR0aCA9IHN2Z0VsZW1lbnQuZ2V0QkJveCgpLndpZHRoXG4gICAgICAgICAgICBoZWlnaHQgPSBzdmdFbGVtZW50LmdldEJCb3goKS5oZWlnaHRcblxuICAgICAgICAgICAgc2F2ZVN2Z0FzUG5nIHN2Z0VsZW1lbnQsIGRlc3QsIHt3aWR0aCwgaGVpZ2h0fSwgKGVycm9yKS0+XG4gICAgICAgICAgICAgIGNiKG51bGwsIHtkZXN0LCBzdGFydCwgZW5kLCBjb250ZW50LCB0eXBlOiAnZ3JhcGgnfSlcblxuXG4gICAgICAgIGFzeW5jRnVuYyA9IGhlbHBlcihzdGFydCwgZW5kLCBjb250ZW50KVxuICAgICAgICBhc3luY0Z1bmN0aW9ucy5wdXNoIGFzeW5jRnVuY1xuXG4gICAgICBlbHNlIGlmIGdyYXBoVHlwZSA9PSAnd2F2ZWRyb20nXG4gICAgICAgICMgbm90IHN1cHBvcnRlZFxuICAgICAgICBudWxsXG4gICAgICAgICMjI1xuICAgICAgICBoZWxwZXIgPSAoc3RhcnQsIGVuZCwgY29udGVudCktPlxuICAgICAgICAgIChjYiktPlxuICAgICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgIGRpdi5pZCA9IHdhdmVkcm9tSWRQcmVmaXggKyB3YXZlZHJvbU9mZnNldFxuICAgICAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICAgICAgICAgIyBjaGVjayBlbmdpbmVcbiAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnRyaW0oKVxuXG4gICAgICAgICAgICBhbGxvd1Vuc2FmZUV2YWwgLT5cbiAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpXG4gICAgICAgICAgICAgICAgV2F2ZURyb20uUmVuZGVyV2F2ZUZvcm0od2F2ZWRyb21PZmZzZXQsIGV2YWwoXCIoI3tjb250ZW50fSlcIiksIHdhdmVkcm9tSWRQcmVmaXgpXG4gICAgICAgICAgICAgICAgd2F2ZWRyb21PZmZzZXQgKz0gMVxuXG4gICAgICAgICAgICAgICAgZGVzdCA9IHBhdGgucmVzb2x2ZShpbWFnZURpcmVjdG9yeVBhdGgsIGltYWdlRmlsZVByZWZpeCArIGltZ0NvdW50ICsgJy5wbmcnKVxuICAgICAgICAgICAgICAgIGltZ0NvdW50ICs9IDFcblxuICAgICAgICAgICAgICAgIHN2Z0VsZW1lbnQgPSBkaXYuY2hpbGRyZW5bMF1cbiAgICAgICAgICAgICAgICB3aWR0aCA9IHN2Z0VsZW1lbnQuZ2V0QkJveCgpLndpZHRoXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gc3ZnRWxlbWVudC5nZXRCQm94KCkuaGVpZ2h0XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVuZGVyZWQgV2F2ZURyb20nKVxuICAgICAgICAgICAgICAgIHdpbmRvdy5zdmdFbGVtZW50ID0gc3ZnRWxlbWVudFxuXG4gICAgICAgICAgICAgICAgc2F2ZVN2Z0FzUG5nIHN2Z0VsZW1lbnQsIGRlc3QsIHt3aWR0aCwgaGVpZ2h0fSwgKGVycm9yKS0+XG4gICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRpdilcbiAgICAgICAgICAgICAgICAgIGNiKG51bGwsIHtkZXN0LCBzdGFydCwgZW5kLCBjb250ZW50LCB0eXBlOiAnZ3JhcGgnfSlcbiAgICAgICAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHJlbmRlciB3YXZlZHJvbScpXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkaXYpXG4gICAgICAgICAgICAgICAgY2IobnVsbCwgbnVsbClcblxuICAgICAgICBhc3luY0Z1bmMgPSBoZWxwZXIoc3RhcnQsIGVuZCwgY29udGVudClcbiAgICAgICAgYXN5bmNGdW5jdGlvbnMucHVzaCBhc3luY0Z1bmNcbiAgICAgICAgIyMjXG4gICAgICBlbHNlICMgcGxhbnR1bWxcbiAgICAgICAgaGVscGVyID0gKHN0YXJ0LCBlbmQsIGNvbnRlbnQpLT5cbiAgICAgICAgICAoY2IpLT5cbiAgICAgICAgICAgIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICAgICBwbGFudHVtbEFQSS5yZW5kZXIgY29udGVudCwgKG91dHB1dEhUTUwpLT5cbiAgICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IG91dHB1dEhUTUxcblxuICAgICAgICAgICAgICBkZXN0ID0gcGF0aC5yZXNvbHZlKGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4ICsgaW1nQ291bnQgKyAnLnBuZycpXG4gICAgICAgICAgICAgIGltZ0NvdW50ICs9IDFcblxuICAgICAgICAgICAgICBzdmdFbGVtZW50ID0gZGl2LmNoaWxkcmVuWzBdXG4gICAgICAgICAgICAgIHdpZHRoID0gc3ZnRWxlbWVudC5nZXRCQm94KCkud2lkdGhcbiAgICAgICAgICAgICAgaGVpZ2h0ID0gc3ZnRWxlbWVudC5nZXRCQm94KCkuaGVpZ2h0XG5cbiAgICAgICAgICAgICAgc2F2ZVN2Z0FzUG5nIHN2Z0VsZW1lbnQsIGRlc3QsIHt3aWR0aCwgaGVpZ2h0fSwgKGVycm9yKS0+XG4gICAgICAgICAgICAgICAgY2IobnVsbCwge2Rlc3QsIHN0YXJ0LCBlbmQsIGNvbnRlbnQsIHR5cGU6ICdncmFwaCd9KVxuXG4gICAgICAgIGFzeW5jRnVuYyA9IGhlbHBlcihzdGFydCwgZW5kLCBjb250ZW50KVxuICAgICAgICBhc3luY0Z1bmN0aW9ucy5wdXNoIGFzeW5jRnVuY1xuICAgIGVsc2UgIyBjb2RlIGNodW5rXG4gICAgICBoZWxwZXIgPSAoc3RhcnQsIGVuZCwgY29udGVudCktPlxuICAgICAgICAoY2IpLT5cbiAgICAgICAgICBkZWYgPSBsaW5lc1tzdGFydF0udHJpbSgpLnNsaWNlKDMpXG4gICAgICAgICAgbWF0Y2ggPSBkZWYubWF0Y2goL15cXHtcXHMqKFxcXCJbXlxcXCJdKlxcXCJ8W15cXHNdKnxbXn1dKikoLiopfSQvKVxuICAgICAgICAgIHJldHVybiBjYihudWxsLCBudWxsKSBpZiAhbWF0Y2hcblxuICAgICAgICAgIGxhbmcgPSBtYXRjaFsxXS50cmltKClcbiAgICAgICAgICBsYW5nID0gbGFuZy5zbGljZSgxLCBsYW5nLmxlbmd0aC0xKS50cmltKCkgaWYgbGFuZ1swXSA9PSAnXCInXG4gICAgICAgICAgZGF0YUFyZ3MgPSBtYXRjaFsyXS50cmltKClcblxuICAgICAgICAgIG9wdGlvbnMgPSBudWxsXG4gICAgICAgICAgdHJ5XG4gICAgICAgICAgICBhbGxvd1Vuc2FmZUV2YWwgLT5cbiAgICAgICAgICAgICAgb3B0aW9ucyA9IGV2YWwoXCIoeyN7ZGF0YUFyZ3N9fSlcIilcbiAgICAgICAgICAgICMgb3B0aW9ucyA9IEpTT04ucGFyc2UgJ3snK2RhdGFBcmdzLnJlcGxhY2UoKC8oWyhcXHcpfChcXC0pXSspKDopL2cpLCBcIlxcXCIkMVxcXCIkMlwiKS5yZXBsYWNlKCgvJy9nKSwgXCJcXFwiXCIpKyd9J1xuICAgICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ludmFsaWQgb3B0aW9ucycsIGRldGFpbDogZGF0YUFyZ3MpXG4gICAgICAgICAgICByZXR1cm4gY2IobnVsbCwgbnVsbClcblxuICAgICAgICAgIGlkID0gb3B0aW9ucy5pZFxuXG4gICAgICAgICAgY29kZUNodW5rc0Fyci5wdXNoIHtpZCwgY29kZTogY29udGVudCwgb3B0aW9uc31cblxuICAgICAgICAgICMgY2hlY2sgY29udGludWVcbiAgICAgICAgICBjdXJyZW50Q29kZUNodW5rID0gY29kZUNodW5rc0Fycltjb2RlQ2h1bmtzQXJyLmxlbmd0aCAtIDFdXG4gICAgICAgICAgd2hpbGUgY3VycmVudENvZGVDaHVuaz8ub3B0aW9ucy5jb250aW51ZVxuICAgICAgICAgICAgbGFzdCA9IG51bGxcbiAgICAgICAgICAgIGlmIGN1cnJlbnRDb2RlQ2h1bmsub3B0aW9ucy5jb250aW51ZSA9PSB0cnVlXG4gICAgICAgICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgICAgICAgd2hpbGUgb2Zmc2V0IDwgY29kZUNodW5rc0Fyci5sZW5ndGggLSAxXG4gICAgICAgICAgICAgICAgaWYgY29kZUNodW5rc0FycltvZmZzZXQgKyAxXSA9PSBjdXJyZW50Q29kZUNodW5rXG4gICAgICAgICAgICAgICAgICBsYXN0ID0gY29kZUNodW5rc0FycltvZmZzZXRdXG4gICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSAxXG4gICAgICAgICAgICBlbHNlICMgY29udGludWUgd2l0aCBpZFxuICAgICAgICAgICAgICBmb3IgYyBpbiBjb2RlQ2h1bmtzQXJyXG4gICAgICAgICAgICAgICAgaWYgYy5pZCA9PSBjdXJyZW50Q29kZUNodW5rLm9wdGlvbnMuY29udGludWVcbiAgICAgICAgICAgICAgICAgIGxhc3QgPSBjXG4gICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBpZiBsYXN0XG4gICAgICAgICAgICAgIGNvbnRlbnQgPSBsYXN0LmNvZGUgKyAnXFxuJyArIGNvbnRlbnRcbiAgICAgICAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGxhc3Qub3B0aW9ucywgb3B0aW9ucylcbiAgICAgICAgICAgIGVsc2UgIyBlcnJvclxuICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBjdXJyZW50Q29kZUNodW5rID0gbGFzdFxuXG4gICAgICAgICAgY21kID0gb3B0aW9ucy5jbWQgb3IgbGFuZ1xuXG4gICAgICAgICAgY29kZUNodW5rQVBJLnJ1biBjb250ZW50LCBmaWxlRGlyZWN0b3J5UGF0aCwgY21kLCBvcHRpb25zLCAoZXJyb3IsIGRhdGEsIG9wdGlvbnMpLT5cbiAgICAgICAgICAgIG91dHB1dFR5cGUgPSBvcHRpb25zLm91dHB1dCB8fCAndGV4dCdcbiAgICAgICAgICAgIHJldHVybiBjYihudWxsLCB7c3RhcnQsIGVuZCwgY29udGVudCwgbGFuZywgdHlwZTogJ2NvZGUtY2h1bmsnLCBoaWRlOiBvcHRpb25zLmhpZGUsIGRhdGE6ICcnfSkgaWYgIWRhdGFcblxuICAgICAgICAgICAgaWYgb3V0cHV0VHlwZSA9PSAndGV4dCdcbiAgICAgICAgICAgICAgIyBDaGluZXNlIGNoYXJhY3RlciB3aWxsIGNhdXNlIHByb2JsZW0gaW4gcGFuZG9jXG4gICAgICAgICAgICAgIGNiKG51bGwsIHtzdGFydCwgZW5kLCBjb250ZW50LCBsYW5nLCB0eXBlOiAnY29kZV9jaHVuaycsIGhpZGU6IG9wdGlvbnMuaGlkZSwgZGF0YTogXCJgYGBcXG4je2RhdGEudHJpbSgpfVxcbmBgYFxcblwifSlcbiAgICAgICAgICAgIGVsc2UgaWYgb3V0cHV0VHlwZSA9PSAnbm9uZSdcbiAgICAgICAgICAgICAgY2IobnVsbCwge3N0YXJ0LCBlbmQsIGNvbnRlbnQsIGxhbmcsIHR5cGU6ICdjb2RlX2NodW5rJywgaGlkZTogb3B0aW9ucy5oaWRlfSlcbiAgICAgICAgICAgIGVsc2UgaWYgb3V0cHV0VHlwZSA9PSAnaHRtbCdcbiAgICAgICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IGRhdGFcbiAgICAgICAgICAgICAgaWYgZGl2LmNoaWxkcmVuWzBdPy50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ3N2ZydcbiAgICAgICAgICAgICAgICBkZXN0ID0gcGF0aC5yZXNvbHZlKGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4ICsgaW1nQ291bnQgKyAnLnBuZycpXG4gICAgICAgICAgICAgICAgaW1nQ291bnQgKz0gMVxuXG4gICAgICAgICAgICAgICAgc3ZnRWxlbWVudCA9IGRpdi5jaGlsZHJlblswXVxuICAgICAgICAgICAgICAgIHdpZHRoID0gc3ZnRWxlbWVudC5nZXRCQm94KCkud2lkdGhcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdmdFbGVtZW50LmdldEJCb3goKS5oZWlnaHRcbiAgICAgICAgICAgICAgICBzYXZlU3ZnQXNQbmcgc3ZnRWxlbWVudCwgZGVzdCwge3dpZHRoLCBoZWlnaHR9LCAoZXJyb3IpLT5cbiAgICAgICAgICAgICAgICAgIGNiKG51bGwsIHtzdGFydCwgZW5kLCBjb250ZW50LCBsYW5nLCB0eXBlOiAnY29kZV9jaHVuaycsIGhpZGU6IG9wdGlvbnMuaGlkZSwgZGVzdH0pXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIGh0bWwgd2lsbCBub3QgYmUgd29ya2luZyB3aXRoIHBhbmRvYy5cbiAgICAgICAgICAgICAgICBjYihudWxsLCB7c3RhcnQsIGVuZCwgY29udGVudCwgbGFuZywgdHlwZTogJ2NvZGVfY2h1bmsnLCBoaWRlOiBvcHRpb25zLmhpZGUsIGRhdGF9KVxuICAgICAgICAgICAgZWxzZSBpZiBvdXRwdXRUeXBlID09ICdtYXJrZG93bidcbiAgICAgICAgICAgICAgY2IobnVsbCwge3N0YXJ0LCBlbmQsIGNvbnRlbnQsIGxhbmcsIHR5cGU6ICdjb2RlX2NodW5rJywgaGlkZTogb3B0aW9ucy5oaWRlLCBkYXRhfSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgY2IobnVsbCwgbnVsbClcblxuICAgICAgYXN5bmNGdW5jID0gaGVscGVyKHN0YXJ0LCBlbmQsIGNvbnRlbnQpXG4gICAgICBhc3luY0Z1bmN0aW9ucy5wdXNoIGFzeW5jRnVuY1xuXG4gIGFzeW5jLnBhcmFsbGVsIGFzeW5jRnVuY3Rpb25zLCAoZXJyb3IsIGRhdGFBcnJheSktPlxuICAgICMgVE9ETzogZGVhbCB3aXRoIGVycm9yIGluIHRoZSBmdXR1cmUuXG4gICAgI1xuICAgIGltYWdlUGF0aHMgPSBbXVxuXG4gICAgZm9yIGQgaW4gZGF0YUFycmF5XG4gICAgICBjb250aW51ZSBpZiAhZFxuICAgICAge3N0YXJ0LCBlbmQsIHR5cGV9ID0gZFxuICAgICAgaWYgdHlwZSA9PSAnZ3JhcGgnXG4gICAgICAgIHtkZXN0fSA9IGRcbiAgICAgICAgaWYgdXNlQWJzb2x1dGVJbWFnZVBhdGhcbiAgICAgICAgICBpbWdNZCA9IFwiIVtdKCN7Jy8nICsgcGF0aC5yZWxhdGl2ZShwcm9qZWN0RGlyZWN0b3J5UGF0aCwgZGVzdCkgKyAnPycgKyBNYXRoLnJhbmRvbSgpfSkgIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpbWdNZCA9IFwiIVtdKCN7cGF0aC5yZWxhdGl2ZShmaWxlRGlyZWN0b3J5UGF0aCwgZGVzdCkgKyAnPycgKyBNYXRoLnJhbmRvbSgpfSkgIFwiXG4gICAgICAgIGltYWdlUGF0aHMucHVzaCBkZXN0XG5cbiAgICAgICAgbGluZXNbc3RhcnRdID0gaW1nTWRcblxuICAgICAgICBpID0gc3RhcnQgKyAxXG4gICAgICAgIHdoaWxlIGkgPD0gZW5kXG4gICAgICAgICAgbGluZXNbaV0gPSBudWxsICMgZmlsdGVyIG91dCBsYXRlci5cbiAgICAgICAgICBpICs9IDFcbiAgICAgIGVsc2UgIyBjb2RlIGNodW5rXG4gICAgICAgIHtoaWRlLCBkYXRhLCBkZXN0LCBsYW5nfSA9IGRcbiAgICAgICAgaWYgaGlkZVxuICAgICAgICAgIGkgPSBzdGFydFxuICAgICAgICAgIHdoaWxlIGkgPD0gZW5kXG4gICAgICAgICAgICBsaW5lc1tpXSA9IG51bGxcbiAgICAgICAgICAgIGkgKz0gMVxuICAgICAgICAgIGxpbmVzW2VuZF0gPSAnJ1xuICAgICAgICBlbHNlICMgcmVwbGFjZSBgYGB7cHl0aG9ufSB0byBgYGBweXRob25cbiAgICAgICAgICBsaW5lID0gbGluZXNbc3RhcnRdXG4gICAgICAgICAgaSA9IGxpbmUuaW5kZXhPZignYGBgJylcbiAgICAgICAgICBsaW5lc1tzdGFydF0gPSBsaW5lLnNsaWNlKDAsIGkrMykgKyBsYW5nXG5cbiAgICAgICAgaWYgZGVzdFxuICAgICAgICAgIGltYWdlUGF0aHMucHVzaCBkZXN0XG4gICAgICAgICAgaWYgdXNlQWJzb2x1dGVJbWFnZVBhdGhcbiAgICAgICAgICAgIGltZ01kID0gXCIhW10oI3snLycgKyBwYXRoLnJlbGF0aXZlKHByb2plY3REaXJlY3RvcnlQYXRoLCBkZXN0KSArICc/JyArIE1hdGgucmFuZG9tKCl9KSAgXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBpbWdNZCA9IFwiIVtdKCN7cGF0aC5yZWxhdGl2ZShmaWxlRGlyZWN0b3J5UGF0aCwgZGVzdCkgKyAnPycgKyBNYXRoLnJhbmRvbSgpfSkgIFwiXG4gICAgICAgICAgbGluZXNbZW5kXSArPSAoJ1xcbicgKyBpbWdNZClcblxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgbGluZXNbZW5kXSArPSAoJ1xcbicgKyBkYXRhKVxuXG4gICAgbGluZXMgPSBsaW5lcy5maWx0ZXIgKGxpbmUpLT4gbGluZSE9bnVsbFxuICAgICAgICAgICAgICAuam9pbignXFxuJylcbiAgICBjYWxsYmFjayBsaW5lcywgaW1hZ2VQYXRoc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gcHJvY2Vzc0dyYXBocyJdfQ==
