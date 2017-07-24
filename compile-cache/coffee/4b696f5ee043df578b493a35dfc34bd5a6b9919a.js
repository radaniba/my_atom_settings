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
      if (trimmedLine.match(/^```\{(.+)\}$/) || trimmedLine.match(/^```\@/) || (useStandardCodeFencingForGraphs && trimmedLine.match(/^```(mermaid|wavedrom|viz|plantuml|puml|dot)/))) {
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
              return plantumlAPI.render(content, fileDirectoryPath, function(outputHTML) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9wcm9jZXNzLWdyYXBocy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0osWUFBYSxPQUFBLENBQVEsTUFBUjs7RUFDYixXQUFZLE9BQUEsQ0FBUSxlQUFSOztFQUNiLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFDUixHQUFBLEdBQU07O0VBQ04sV0FBQSxHQUFjLE9BQUEsQ0FBUSxRQUFSOztFQUNkLFlBQUEsR0FBZSxPQUFBLENBQVEsY0FBUjs7RUFDZCxjQUFlLE9BQUEsQ0FBUSxvREFBUjs7RUFDaEIsTUFBNEMsT0FBQSxDQUFRLFVBQVIsQ0FBNUMsRUFBQyxxQ0FBRCxFQUFrQjs7RUFLbEIsYUFBQSxHQUFnQixTQUFDLElBQUQsRUFBTyxHQUFQLEVBQTZHLFFBQTdHO0FBQ2QsUUFBQTtJQURzQiwyQ0FBbUIsaURBQXNCLDZDQUFvQix1Q0FBaUI7SUFDcEcsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWDtJQUNSLEtBQUEsR0FBUTtJQUVSLCtCQUFBLEdBQWtDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyREFBaEI7SUFDbEMsQ0FBQSxHQUFJO0FBQ0osV0FBTSxDQUFBLEdBQUksS0FBSyxDQUFDLE1BQWhCO01BQ0UsSUFBQSxHQUFPLEtBQU0sQ0FBQSxDQUFBO01BQ2IsV0FBQSxHQUFjLElBQUksQ0FBQyxJQUFMLENBQUE7TUFDZCxJQUFHLFdBQVcsQ0FBQyxLQUFaLENBQWtCLGVBQWxCLENBQUEsSUFDQSxXQUFXLENBQUMsS0FBWixDQUFrQixRQUFsQixDQURBLElBRUEsQ0FBQywrQkFBQSxJQUFvQyxXQUFXLENB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QUFHLG9CQUFIO2NBQ0UsS0FBQSxHQUFRLE1BQUEsR0FBTSxDQUFDLEdBQUEsR0FBTSxJQUFJLENBQUMsUUFBTCxDQUFjLG9CQUFkLEVBQW9DLElBQXBDLENBQU4sR0FBa0QsR0FBbEQsR0FBd0QsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUF6RCxDQUFOLEdBQTZFLE1BRHZGO2FBQUEsTUFBQTtjQUdFLEtBQUEsR0FBUSxNQUFBLEdBQU0sQ0FBQyxJQUFJLENBQUMsUUFBTCxDQUFjLGlCQUFkLEVBQWlDLElBQWpDLENBQUEsR0FBeUMsR0FBekMsR0FBK0MsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFoRCxDQUFOLEdBQW9FLE1BSDlFOztZQUlBLEtBQU0sQ0FBQSxHQUFBLENBQU4sSUFBZSxJQUFBLEdBQU8sTUFOeEI7O1VBUUEsSUFBRyxJQUFIO1lBQ0UsS0FBTSxDQUFBLEdBQUEsQ0FBTixJQUFlLElBQUEsR0FBTyxLQUR4QjtXQW5DRjs7QUFIRjtNQXlDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxTQUFDLElBQUQ7ZUFBUyxJQUFBLEtBQU07TUFBZixDQUFiLENBQ0UsQ0FBQyxJQURILENBQ1EsSUFEUjthQUVSLFFBQUEsQ0FBUyxLQUFULEVBQWdCLFVBQWhCO0lBaEQ2QixDQUEvQjtFQWhPYTs7RUFtUmYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF6VWpCIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xue0RpcmVjdG9yeX0gPSByZXF1aXJlICdhdG9tJ1xue2V4ZWNGaWxlfSA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG5hc3luYyA9IHJlcXVpcmUgJ2FzeW5jJ1xuVml6ID0gbnVsbFxucGxhbnR1bWxBUEkgPSByZXF1aXJlICcuL3B1bWwnXG5jb2RlQ2h1bmtBUEkgPSByZXF1aXJlICcuL2NvZGUtY2h1bmsnXG57c3ZnQXNQbmdVcml9ID0gcmVxdWlyZSAnLi4vZGVwZW5kZW5jaWVzL3NhdmUtc3ZnLWFzLXBuZy9zYXZlLXN2Zy1hcy1wbmcuanMnXG57YWxsb3dVbnNhZmVFdmFsLCBhbGxvd1Vuc2FmZU5ld0Z1bmN0aW9ufSA9IHJlcXVpcmUgJ2xvb3Bob2xlJ1xuXG4jIGNvbnZlcnQgbWVybWFpZCwgd2F2ZWRyb20sIHZpei5qcyBmcm9tIHN2ZyB0byBwbmdcbiMgdXNlZCBmb3IgbWFya2Rvd24tY29udmVydCBhbmQgcGFuZG9jLWNvbnZlcnRcbiMgY2FsbGJhY2s6IGZ1bmN0aW9uKHRleHQsIGltYWdlUGF0aHM9W10peyAuLi4gfVxucHJvY2Vzc0dyYXBocyA9ICh0ZXh0LCB7ZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRoLCBpbWFnZURpcmVjdG9yeVBhdGgsIGltYWdlRmlsZVByZWZpeCwgdXNlQWJzb2x1dGVJbWFnZVBhdGh9LCBjYWxsYmFjayktPlxuICBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gIGNvZGVzID0gW11cblxuICB1c2VTdGFuZGFyZENvZGVGZW5jaW5nRm9yR3JhcGhzID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVN0YW5kYXJkQ29kZUZlbmNpbmdGb3JHcmFwaHMnKVxuICBpID0gMFxuICB3aGlsZSBpIDwgbGluZXMubGVuZ3RoXG4gICAgbGluZSA9IGxpbmVzW2ldXG4gICAgdHJpbW1lZExpbmUgPSBsaW5lLnRyaW0oKVxuICAgIGlmIHRyaW1tZWRMaW5lLm1hdGNoKC9eYGBgXFx7KC4rKVxcfSQvKSBvclxuICAgICAgIHRyaW1tZWRMaW5lLm1hdGNoKC9eYGBgXFxALykgb3JcbiAgICAgICAodXNlU3RhbmRhcmRDb2RlRmVuY2luZ0ZvckdyYXBocyBhbmQgdHJpbW1lZExpbmUubWF0Y2goL15gYGAobWVybWFpZHx3YXZlZHJvbXx2aXp8cGxhbnR1bWx8cHVtbHxkb3QpLykpXG4gICAgICBudW1PZlNwYWNlc0FoZWFkID0gbGluZS5tYXRjaCgvXFxzKi8pLmxlbmd0aFxuXG4gICAgICBqID0gaSArIDFcbiAgICAgIGNvbnRlbnQgPSAnJ1xuICAgICAgd2hpbGUgaiA8IGxpbmVzLmxlbmd0aFxuICAgICAgICBpZiBsaW5lc1tqXS50cmltKCkgPT0gJ2BgYCcgYW5kIGxpbmVzW2pdLm1hdGNoKC9cXHMqLykubGVuZ3RoID09IG51bU9mU3BhY2VzQWhlYWRcbiAgICAgICAgICBjb2Rlcy5wdXNoKHtzdGFydDogaSwgZW5kOiBqLCBjb250ZW50OiBjb250ZW50LnRyaW0oKX0pXG4gICAgICAgICAgaSA9IGpcbiAgICAgICAgICBicmVha1xuICAgICAgICBjb250ZW50ICs9IChsaW5lc1tqXSsnXFxuJylcbiAgICAgICAgaiArPSAxXG4gICAgaSArPSAxXG5cbiAgcmV0dXJuIHByb2Nlc3NDb2Rlcyhjb2RlcywgbGluZXMsIHtmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGgsIGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4LCB1c2VBYnNvbHV0ZUltYWdlUGF0aH0sIGNhbGxiYWNrKVxuXG5zYXZlU3ZnQXNQbmcgPSAoc3ZnRWxlbWVudCwgZGVzdCwgb3B0aW9uPXt9LCBjYiktPlxuICByZXR1cm4gY2IobnVsbCkgaWYgIXN2Z0VsZW1lbnQgb3Igc3ZnRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT0gJ3N2ZydcblxuICBpZiB0eXBlb2Yob3B0aW9uKSA9PSAnZnVuY3Rpb24nIGFuZCAhY2JcbiAgICBjYiA9IG9wdGlvblxuICAgIG9wdGlvbiA9IHt9XG5cbiAgc3ZnQXNQbmdVcmkgc3ZnRWxlbWVudCwgb3B0aW9uLCAoZGF0YSktPlxuICAgIGJhc2U2NERhdGEgPSBkYXRhLnJlcGxhY2UoL15kYXRhOmltYWdlXFwvcG5nO2Jhc2U2NCwvLCBcIlwiKVxuICAgIGZzLndyaXRlRmlsZSBkZXN0LCBiYXNlNjREYXRhLCAnYmFzZTY0JywgKGVyciktPlxuICAgICAgY2IoZXJyKVxuXG4jIHtzdGFydCwgZW5kLCBjb250ZW50fVxucHJvY2Vzc0NvZGVzID0gKGNvZGVzLCBsaW5lcywge2ZpbGVEaXJlY3RvcnlQYXRoLCBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgaW1hZ2VEaXJlY3RvcnlQYXRoLCBpbWFnZUZpbGVQcmVmaXgsIHVzZUFic29sdXRlSW1hZ2VQYXRofSwgY2FsbGJhY2spLT5cbiAgYXN5bmNGdW5jdGlvbnMgPSBbXVxuXG4gIGltYWdlRmlsZVByZWZpeCA9IChNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSkgKyAnXycpIGlmICFpbWFnZUZpbGVQcmVmaXhcbiAgaW1hZ2VGaWxlUHJlZml4ID0gaW1hZ2VGaWxlUHJlZml4LnJlcGxhY2UoL1tcXC8mXS9nLCAnX3NzXycpXG4gIGltYWdlRmlsZVByZWZpeCA9IGVuY29kZVVSSUNvbXBvbmVudChpbWFnZUZpbGVQcmVmaXgpXG4gIGltZ0NvdW50ID0gMFxuXG4gIHdhdmVkcm9tSWRQcmVmaXggPSAnd2F2ZWRyb21fJyArIChNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSkgKyAnXycpXG4gIHdhdmVkcm9tT2Zmc2V0ID0gMTAwXG5cbiAgY29kZUNodW5rc0FyciA9IFtdICMgYXJyYXkgb2Yge2lkLCBvcHRpb25zLCBjb2RlfVxuXG4gIGZvciBjb2RlRGF0YSBpbiBjb2Rlc1xuICAgIHtzdGFydCwgZW5kLCBjb250ZW50fSA9IGNvZGVEYXRhXG4gICAgZGVmID0gbGluZXNbc3RhcnRdLnRyaW0oKS5zbGljZSgzKVxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnVzZVN0YW5kYXJkQ29kZUZlbmNpbmdGb3JHcmFwaHMnKVxuICAgICAgbWF0Y2ggPSBkZWYubWF0Y2goL15cXEA/KG1lcm1haWR8d2F2ZWRyb218dml6fHBsYW50dW1sfHB1bWx8ZG90KS8pXG4gICAgZWxzZVxuICAgICAgbWF0Y2ggPSBkZWYubWF0Y2goL15cXEAobWVybWFpZHx3YXZlZHJvbXx2aXp8cGxhbnR1bWx8cHVtbHxkb3QpLylcblxuICAgIGlmIG1hdGNoICAjIGJ1aWx0aW4gZ3JhcGhcbiAgICAgIGdyYXBoVHlwZSA9IG1hdGNoWzFdXG5cbiAgICAgIGlmIGdyYXBoVHlwZSA9PSAnbWVybWFpZCdcbiAgICAgICAgaGVscGVyID0gKHN0YXJ0LCBlbmQsIGNvbnRlbnQpLT5cbiAgICAgICAgICAoY2IpLT5cbiAgICAgICAgICAgIG1lcm1haWQucGFyc2VFcnJvciA9IChlcnIsIGhhc2gpLT5cbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yICdtZXJtYWlkIGVycm9yJywgZGV0YWlsOiBlcnJcblxuICAgICAgICAgICAgaWYgbWVybWFpZEFQSS5wYXJzZShjb250ZW50KVxuICAgICAgICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgICAgICAjIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnICMgd2lsbCBjYXVzZSBmb250IGlzc3VlLlxuICAgICAgICAgICAgICBkaXYuY2xhc3NMaXN0LmFkZCgnbWVybWFpZCcpXG4gICAgICAgICAgICAgIGRpdi50ZXh0Q29udGVudCA9IGNvbnRlbnRcbiAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpXG5cbiAgICAgICAgICAgICAgbWVybWFpZC5pbml0IG51bGwsIGRpdiwgKCktPlxuICAgICAgICAgICAgICAgIHN2Z0VsZW1lbnQgPSBkaXYuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N2ZycpWzBdXG4gICAgICAgICAgICAgICAgc3ZnRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtZXJtYWlkJylcblxuICAgICAgICAgICAgICAgIGRlc3QgPSBwYXRoLnJlc29sdmUoaW1hZ2VEaXJlY3RvcnlQYXRoLCBpbWFnZUZpbGVQcmVmaXggKyBpbWdDb3VudCArICcucG5nJylcbiAgICAgICAgICAgICAgICBpbWdDb3VudCArPSAxXG5cbiAgICAgICAgICAgICAgICBzYXZlU3ZnQXNQbmcgc3ZnRWxlbWVudCwgZGVzdCwge30sIChlcnJvciktPlxuICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkaXYpXG4gICAgICAgICAgICAgICAgICBjYihudWxsLCB7ZGVzdCwgc3RhcnQsIGVuZCwgY29udGVudCwgdHlwZTogJ2dyYXBoJ30pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGNiKG51bGwsIG51bGwpXG5cbiAgICAgICAgYXN5bmNGdW5jID0gaGVscGVyKHN0YXJ0LCBlbmQsIGNvbnRlbnQpXG4gICAgICAgIGFzeW5jRnVuY3Rpb25zLnB1c2ggYXN5bmNGdW5jXG5cbiAgICAgIGVsc2UgaWYgZ3JhcGhUeXBlID09ICd2aXonXG4gICAgICAgIGhlbHBlciA9IChzdGFydCwgZW5kLCBjb250ZW50KS0+XG4gICAgICAgICAgKGNiKS0+XG4gICAgICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9XG5cbiAgICAgICAgICAgICMgY2hlY2sgZW5naW5lXG4gICAgICAgICAgICBjb250ZW50ID0gY29udGVudC50cmltKCkucmVwbGFjZSAvXmVuZ2luZShcXHMpKls6PV0oW15cXG5dKykvLCAoYSwgYiwgYyktPlxuICAgICAgICAgICAgICBvcHRpb25zLmVuZ2luZSA9IGMudHJpbSgpIGlmIGM/LnRyaW0oKSBpbiBbJ2NpcmNvJywgJ2RvdCcsICdmZHAnLCAnbmVhdG8nLCAnb3NhZ2UnLCAndHdvcGknXVxuICAgICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICAgICAgVml6ID89IHJlcXVpcmUgJy4uL2RlcGVuZGVuY2llcy92aXovdml6LmpzJ1xuICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IFZpeihjb250ZW50LCBvcHRpb25zKVxuXG4gICAgICAgICAgICBkZXN0ID0gcGF0aC5yZXNvbHZlKGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4ICsgaW1nQ291bnQgKyAnLnBuZycpXG4gICAgICAgICAgICBpbWdDb3VudCArPSAxXG5cbiAgICAgICAgICAgIHN2Z0VsZW1lbnQgPSBkaXYuY2hpbGRyZW5bMF1cbiAgICAgICAgICAgIHdpZHRoID0gc3ZnRWxlbWVudC5nZXRCQm94KCkud2lkdGhcbiAgICAgICAgICAgIGhlaWdodCA9IHN2Z0VsZW1lbnQuZ2V0QkJveCgpLmhlaWdodFxuXG4gICAgICAgICAgICBzYXZlU3ZnQXNQbmcgc3ZnRWxlbWVudCwgZGVzdCwge3dpZHRoLCBoZWlnaHR9LCAoZXJyb3IpLT5cbiAgICAgICAgICAgICAgY2IobnVsbCwge2Rlc3QsIHN0YXJ0LCBlbmQsIGNvbnRlbnQsIHR5cGU6ICdncmFwaCd9KVxuXG5cbiAgICAgICAgYXN5bmNGdW5jID0gaGVscGVyKHN0YXJ0LCBlbmQsIGNvbnRlbnQpXG4gICAgICAgIGFzeW5jRnVuY3Rpb25zLnB1c2ggYXN5bmNGdW5jXG5cbiAgICAgIGVsc2UgaWYgZ3JhcGhUeXBlID09ICd3YXZlZHJvbSdcbiAgICAgICAgIyBub3Qgc3VwcG9ydGVkXG4gICAgICAgIG51bGxcbiAgICAgICAgIyMjXG4gICAgICAgIGhlbHBlciA9IChzdGFydCwgZW5kLCBjb250ZW50KS0+XG4gICAgICAgICAgKGNiKS0+XG4gICAgICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgICAgZGl2LmlkID0gd2F2ZWRyb21JZFByZWZpeCArIHdhdmVkcm9tT2Zmc2V0XG4gICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgICAgICAgICAjIGNoZWNrIGVuZ2luZVxuICAgICAgICAgICAgY29udGVudCA9IGNvbnRlbnQudHJpbSgpXG5cbiAgICAgICAgICAgIGFsbG93VW5zYWZlRXZhbCAtPlxuICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdilcbiAgICAgICAgICAgICAgICBXYXZlRHJvbS5SZW5kZXJXYXZlRm9ybSh3YXZlZHJvbU9mZnNldCwgZXZhbChcIigje2NvbnRlbnR9KVwiKSwgd2F2ZWRyb21JZFByZWZpeClcbiAgICAgICAgICAgICAgICB3YXZlZHJvbU9mZnNldCArPSAxXG5cbiAgICAgICAgICAgICAgICBkZXN0ID0gcGF0aC5yZXNvbHZlKGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4ICsgaW1nQ291bnQgKyAnLnBuZycpXG4gICAgICAgICAgICAgICAgaW1nQ291bnQgKz0gMVxuXG4gICAgICAgICAgICAgICAgc3ZnRWxlbWVudCA9IGRpdi5jaGlsZHJlblswXVxuICAgICAgICAgICAgICAgIHdpZHRoID0gc3ZnRWxlbWVudC5nZXRCQm94KCkud2lkdGhcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdmdFbGVtZW50LmdldEJCb3goKS5oZWlnaHRcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW5kZXJlZCBXYXZlRHJvbScpXG4gICAgICAgICAgICAgICAgd2luZG93LnN2Z0VsZW1lbnQgPSBzdmdFbGVtZW50XG5cbiAgICAgICAgICAgICAgICBzYXZlU3ZnQXNQbmcgc3ZnRWxlbWVudCwgZGVzdCwge3dpZHRoLCBoZWlnaHR9LCAoZXJyb3IpLT5cbiAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZGl2KVxuICAgICAgICAgICAgICAgICAgY2IobnVsbCwge2Rlc3QsIHN0YXJ0LCBlbmQsIGNvbnRlbnQsIHR5cGU6ICdncmFwaCd9KVxuICAgICAgICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gcmVuZGVyIHdhdmVkcm9tJylcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRpdilcbiAgICAgICAgICAgICAgICBjYihudWxsLCBudWxsKVxuXG4gICAgICAgIGFzeW5jRnVuYyA9IGhlbHBlcihzdGFydCwgZW5kLCBjb250ZW50KVxuICAgICAgICBhc3luY0Z1bmN0aW9ucy5wdXNoIGFzeW5jRnVuY1xuICAgICAgICAjIyNcbiAgICAgIGVsc2UgIyBwbGFudHVtbFxuICAgICAgICBoZWxwZXIgPSAoc3RhcnQsIGVuZCwgY29udGVudCktPlxuICAgICAgICAgIChjYiktPlxuICAgICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgIHBsYW50dW1sQVBJLnJlbmRlciBjb250ZW50LCBmaWxlRGlyZWN0b3J5UGF0aCwgKG91dHB1dEhUTUwpLT5cbiAgICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IG91dHB1dEhUTUxcblxuICAgICAgICAgICAgICBkZXN0ID0gcGF0aC5yZXNvbHZlKGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4ICsgaW1nQ291bnQgKyAnLnBuZycpXG4gICAgICAgICAgICAgIGltZ0NvdW50ICs9IDFcblxuICAgICAgICAgICAgICBzdmdFbGVtZW50ID0gZGl2LmNoaWxkcmVuWzBdXG4gICAgICAgICAgICAgIHdpZHRoID0gc3ZnRWxlbWVudC5nZXRCQm94KCkud2lkdGhcbiAgICAgICAgICAgICAgaGVpZ2h0ID0gc3ZnRWxlbWVudC5nZXRCQm94KCkuaGVpZ2h0XG5cbiAgICAgICAgICAgICAgc2F2ZVN2Z0FzUG5nIHN2Z0VsZW1lbnQsIGRlc3QsIHt3aWR0aCwgaGVpZ2h0fSwgKGVycm9yKS0+XG4gICAgICAgICAgICAgICAgY2IobnVsbCwge2Rlc3QsIHN0YXJ0LCBlbmQsIGNvbnRlbnQsIHR5cGU6ICdncmFwaCd9KVxuXG4gICAgICAgIGFzeW5jRnVuYyA9IGhlbHBlcihzdGFydCwgZW5kLCBjb250ZW50KVxuICAgICAgICBhc3luY0Z1bmN0aW9ucy5wdXNoIGFzeW5jRnVuY1xuICAgIGVsc2UgIyBjb2RlIGNodW5rXG4gICAgICBoZWxwZXIgPSAoc3RhcnQsIGVuZCwgY29udGVudCktPlxuICAgICAgICAoY2IpLT5cbiAgICAgICAgICBkZWYgPSBsaW5lc1tzdGFydF0udHJpbSgpLnNsaWNlKDMpXG4gICAgICAgICAgbWF0Y2ggPSBkZWYubWF0Y2goL15cXHtcXHMqKFxcXCJbXlxcXCJdKlxcXCJ8W15cXHNdKnxbXn1dKikoLiopfSQvKVxuICAgICAgICAgIHJldHVybiBjYihudWxsLCBudWxsKSBpZiAhbWF0Y2hcblxuICAgICAgICAgIGxhbmcgPSBtYXRjaFsxXS50cmltKClcbiAgICAgICAgICBsYW5nID0gbGFuZy5zbGljZSgxLCBsYW5nLmxlbmd0aC0xKS50cmltKCkgaWYgbGFuZ1swXSA9PSAnXCInXG4gICAgICAgICAgZGF0YUFyZ3MgPSBtYXRjaFsyXS50cmltKClcblxuICAgICAgICAgIG9wdGlvbnMgPSBudWxsXG4gICAgICAgICAgdHJ5XG4gICAgICAgICAgICBhbGxvd1Vuc2FmZUV2YWwgLT5cbiAgICAgICAgICAgICAgb3B0aW9ucyA9IGV2YWwoXCIoeyN7ZGF0YUFyZ3N9fSlcIilcbiAgICAgICAgICAgICMgb3B0aW9ucyA9IEpTT04ucGFyc2UgJ3snK2RhdGFBcmdzLnJlcGxhY2UoKC8oWyhcXHcpfChcXC0pXSspKDopL2cpLCBcIlxcXCIkMVxcXCIkMlwiKS5yZXBsYWNlKCgvJy9nKSwgXCJcXFwiXCIpKyd9J1xuICAgICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ludmFsaWQgb3B0aW9ucycsIGRldGFpbDogZGF0YUFyZ3MpXG4gICAgICAgICAgICByZXR1cm4gY2IobnVsbCwgbnVsbClcblxuICAgICAgICAgIGlkID0gb3B0aW9ucy5pZFxuXG4gICAgICAgICAgY29kZUNodW5rc0Fyci5wdXNoIHtpZCwgY29kZTogY29udGVudCwgb3B0aW9uc31cblxuICAgICAgICAgICMgY2hlY2sgY29udGludWVcbiAgICAgICAgICBjdXJyZW50Q29kZUNodW5rID0gY29kZUNodW5rc0Fycltjb2RlQ2h1bmtzQXJyLmxlbmd0aCAtIDFdXG4gICAgICAgICAgd2hpbGUgY3VycmVudENvZGVDaHVuaz8ub3B0aW9ucy5jb250aW51ZVxuICAgICAgICAgICAgbGFzdCA9IG51bGxcbiAgICAgICAgICAgIGlmIGN1cnJlbnRDb2RlQ2h1bmsub3B0aW9ucy5jb250aW51ZSA9PSB0cnVlXG4gICAgICAgICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgICAgICAgd2hpbGUgb2Zmc2V0IDwgY29kZUNodW5rc0Fyci5sZW5ndGggLSAxXG4gICAgICAgICAgICAgICAgaWYgY29kZUNodW5rc0FycltvZmZzZXQgKyAxXSA9PSBjdXJyZW50Q29kZUNodW5rXG4gICAgICAgICAgICAgICAgICBsYXN0ID0gY29kZUNodW5rc0FycltvZmZzZXRdXG4gICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSAxXG4gICAgICAgICAgICBlbHNlICMgY29udGludWUgd2l0aCBpZFxuICAgICAgICAgICAgICBmb3IgYyBpbiBjb2RlQ2h1bmtzQXJyXG4gICAgICAgICAgICAgICAgaWYgYy5pZCA9PSBjdXJyZW50Q29kZUNodW5rLm9wdGlvbnMuY29udGludWVcbiAgICAgICAgICAgICAgICAgIGxhc3QgPSBjXG4gICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBpZiBsYXN0XG4gICAgICAgICAgICAgIGNvbnRlbnQgPSBsYXN0LmNvZGUgKyAnXFxuJyArIGNvbnRlbnRcbiAgICAgICAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGxhc3Qub3B0aW9ucywgb3B0aW9ucylcbiAgICAgICAgICAgIGVsc2UgIyBlcnJvclxuICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBjdXJyZW50Q29kZUNodW5rID0gbGFzdFxuXG4gICAgICAgICAgY21kID0gb3B0aW9ucy5jbWQgb3IgbGFuZ1xuXG4gICAgICAgICAgY29kZUNodW5rQVBJLnJ1biBjb250ZW50LCBmaWxlRGlyZWN0b3J5UGF0aCwgY21kLCBvcHRpb25zLCAoZXJyb3IsIGRhdGEsIG9wdGlvbnMpLT5cbiAgICAgICAgICAgIG91dHB1dFR5cGUgPSBvcHRpb25zLm91dHB1dCB8fCAndGV4dCdcbiAgICAgICAgICAgIHJldHVybiBjYihudWxsLCB7c3RhcnQsIGVuZCwgY29udGVudCwgbGFuZywgdHlwZTogJ2NvZGUtY2h1bmsnLCBoaWRlOiBvcHRpb25zLmhpZGUsIGRhdGE6ICcnfSkgaWYgIWRhdGFcblxuICAgICAgICAgICAgaWYgb3V0cHV0VHlwZSA9PSAndGV4dCdcbiAgICAgICAgICAgICAgIyBDaGluZXNlIGNoYXJhY3RlciB3aWxsIGNhdXNlIHByb2JsZW0gaW4gcGFuZG9jXG4gICAgICAgICAgICAgIGNiKG51bGwsIHtzdGFydCwgZW5kLCBjb250ZW50LCBsYW5nLCB0eXBlOiAnY29kZV9jaHVuaycsIGhpZGU6IG9wdGlvbnMuaGlkZSwgZGF0YTogXCJgYGBcXG4je2RhdGEudHJpbSgpfVxcbmBgYFxcblwifSlcbiAgICAgICAgICAgIGVsc2UgaWYgb3V0cHV0VHlwZSA9PSAnbm9uZSdcbiAgICAgICAgICAgICAgY2IobnVsbCwge3N0YXJ0LCBlbmQsIGNvbnRlbnQsIGxhbmcsIHR5cGU6ICdjb2RlX2NodW5rJywgaGlkZTogb3B0aW9ucy5oaWRlfSlcbiAgICAgICAgICAgIGVsc2UgaWYgb3V0cHV0VHlwZSA9PSAnaHRtbCdcbiAgICAgICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IGRhdGFcbiAgICAgICAgICAgICAgaWYgZGl2LmNoaWxkcmVuWzBdPy50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ3N2ZydcbiAgICAgICAgICAgICAgICBkZXN0ID0gcGF0aC5yZXNvbHZlKGltYWdlRGlyZWN0b3J5UGF0aCwgaW1hZ2VGaWxlUHJlZml4ICsgaW1nQ291bnQgKyAnLnBuZycpXG4gICAgICAgICAgICAgICAgaW1nQ291bnQgKz0gMVxuXG4gICAgICAgICAgICAgICAgc3ZnRWxlbWVudCA9IGRpdi5jaGlsZHJlblswXVxuICAgICAgICAgICAgICAgIHdpZHRoID0gc3ZnRWxlbWVudC5nZXRCQm94KCkud2lkdGhcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzdmdFbGVtZW50LmdldEJCb3goKS5oZWlnaHRcbiAgICAgICAgICAgICAgICBzYXZlU3ZnQXNQbmcgc3ZnRWxlbWVudCwgZGVzdCwge3dpZHRoLCBoZWlnaHR9LCAoZXJyb3IpLT5cbiAgICAgICAgICAgICAgICAgIGNiKG51bGwsIHtzdGFydCwgZW5kLCBjb250ZW50LCBsYW5nLCB0eXBlOiAnY29kZV9jaHVuaycsIGhpZGU6IG9wdGlvbnMuaGlkZSwgZGVzdH0pXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIGh0bWwgd2lsbCBub3QgYmUgd29ya2luZyB3aXRoIHBhbmRvYy5cbiAgICAgICAgICAgICAgICBjYihudWxsLCB7c3RhcnQsIGVuZCwgY29udGVudCwgbGFuZywgdHlwZTogJ2NvZGVfY2h1bmsnLCBoaWRlOiBvcHRpb25zLmhpZGUsIGRhdGF9KVxuICAgICAgICAgICAgZWxzZSBpZiBvdXRwdXRUeXBlID09ICdtYXJrZG93bidcbiAgICAgICAgICAgICAgY2IobnVsbCwge3N0YXJ0LCBlbmQsIGNvbnRlbnQsIGxhbmcsIHR5cGU6ICdjb2RlX2NodW5rJywgaGlkZTogb3B0aW9ucy5oaWRlLCBkYXRhfSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgY2IobnVsbCwgbnVsbClcblxuICAgICAgYXN5bmNGdW5jID0gaGVscGVyKHN0YXJ0LCBlbmQsIGNvbnRlbnQpXG4gICAgICBhc3luY0Z1bmN0aW9ucy5wdXNoIGFzeW5jRnVuY1xuXG4gIGFzeW5jLnBhcmFsbGVsIGFzeW5jRnVuY3Rpb25zLCAoZXJyb3IsIGRhdGFBcnJheSktPlxuICAgICMgVE9ETzogZGVhbCB3aXRoIGVycm9yIGluIHRoZSBmdXR1cmUuXG4gICAgI1xuICAgIGltYWdlUGF0aHMgPSBbXVxuXG4gICAgZm9yIGQgaW4gZGF0YUFycmF5XG4gICAgICBjb250aW51ZSBpZiAhZFxuICAgICAge3N0YXJ0LCBlbmQsIHR5cGV9ID0gZFxuICAgICAgaWYgdHlwZSA9PSAnZ3JhcGgnXG4gICAgICAgIHtkZXN0fSA9IGRcbiAgICAgICAgaWYgdXNlQWJzb2x1dGVJbWFnZVBhdGhcbiAgICAgICAgICBpbWdNZCA9IFwiIVtdKCN7Jy8nICsgcGF0aC5yZWxhdGl2ZShwcm9qZWN0RGlyZWN0b3J5UGF0aCwgZGVzdCkgKyAnPycgKyBNYXRoLnJhbmRvbSgpfSkgIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpbWdNZCA9IFwiIVtdKCN7cGF0aC5yZWxhdGl2ZShmaWxlRGlyZWN0b3J5UGF0aCwgZGVzdCkgKyAnPycgKyBNYXRoLnJhbmRvbSgpfSkgIFwiXG4gICAgICAgIGltYWdlUGF0aHMucHVzaCBkZXN0XG5cbiAgICAgICAgbGluZXNbc3RhcnRdID0gaW1nTWRcblxuICAgICAgICBpID0gc3RhcnQgKyAxXG4gICAgICAgIHdoaWxlIGkgPD0gZW5kXG4gICAgICAgICAgbGluZXNbaV0gPSBudWxsICMgZmlsdGVyIG91dCBsYXRlci5cbiAgICAgICAgICBpICs9IDFcbiAgICAgIGVsc2UgIyBjb2RlIGNodW5rXG4gICAgICAgIHtoaWRlLCBkYXRhLCBkZXN0LCBsYW5nfSA9IGRcbiAgICAgICAgaWYgaGlkZVxuICAgICAgICAgIGkgPSBzdGFydFxuICAgICAgICAgIHdoaWxlIGkgPD0gZW5kXG4gICAgICAgICAgICBsaW5lc1tpXSA9IG51bGxcbiAgICAgICAgICAgIGkgKz0gMVxuICAgICAgICAgIGxpbmVzW2VuZF0gPSAnJ1xuICAgICAgICBlbHNlICMgcmVwbGFjZSBgYGB7cHl0aG9ufSB0byBgYGBweXRob25cbiAgICAgICAgICBsaW5lID0gbGluZXNbc3RhcnRdXG4gICAgICAgICAgaSA9IGxpbmUuaW5kZXhPZignYGBgJylcbiAgICAgICAgICBsaW5lc1tzdGFydF0gPSBsaW5lLnNsaWNlKDAsIGkrMykgKyBsYW5nXG5cbiAgICAgICAgaWYgZGVzdFxuICAgICAgICAgIGltYWdlUGF0aHMucHVzaCBkZXN0XG4gICAgICAgICAgaWYgdXNlQWJzb2x1dGVJbWFnZVBhdGhcbiAgICAgICAgICAgIGltZ01kID0gXCIhW10oI3snLycgKyBwYXRoLnJlbGF0aXZlKHByb2plY3REaXJlY3RvcnlQYXRoLCBkZXN0KSArICc/JyArIE1hdGgucmFuZG9tKCl9KSAgXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBpbWdNZCA9IFwiIVtdKCN7cGF0aC5yZWxhdGl2ZShmaWxlRGlyZWN0b3J5UGF0aCwgZGVzdCkgKyAnPycgKyBNYXRoLnJhbmRvbSgpfSkgIFwiXG4gICAgICAgICAgbGluZXNbZW5kXSArPSAoJ1xcbicgKyBpbWdNZClcblxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgbGluZXNbZW5kXSArPSAoJ1xcbicgKyBkYXRhKVxuXG4gICAgbGluZXMgPSBsaW5lcy5maWx0ZXIgKGxpbmUpLT4gbGluZSE9bnVsbFxuICAgICAgICAgICAgICAuam9pbignXFxuJylcbiAgICBjYWxsYmFjayBsaW5lcywgaW1hZ2VQYXRoc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gcHJvY2Vzc0dyYXBocyJdfQ==
