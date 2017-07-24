(function() {
  var Directory, Viz, async, codeChunkAPI, execFile, fileImport, fs, getFileExtension, loadOutputYAML, matter, pandocConvert, pandocRender, path, plantumlAPI, processConfigPaths, processGraphs, processOutputConfig, processPaths, svgAsPngUri;

  path = require('path');

  fs = require('fs');

  execFile = require('child_process').execFile;

  matter = require('gray-matter');

  Directory = require('atom').Directory;

  async = require('async');

  Viz = require('../dependencies/viz/viz.js');

  plantumlAPI = require('./puml');

  codeChunkAPI = require('./code-chunk');

  svgAsPngUri = require('../dependencies/save-svg-as-png/save-svg-as-png.js').svgAsPngUri;

  processGraphs = require('./process-graphs');

  fileImport = require('./file-import');

  getFileExtension = function(documentType) {
    if (documentType === 'pdf_document' || documentType === 'beamer_presentation') {
      return 'pdf';
    } else if (documentType === 'word_document') {
      return 'docx';
    } else if (documentType === 'rtf_document') {
      return 'rtf';
    } else if (documentType === 'custom_document') {
      return '*';
    } else {
      atom.notifications.addError('Invalid output format', {
        detail: documentType
      });
      return null;
    }
  };

  processOutputConfig = function(config, args) {
    var arg, helper, includesConfig, j, len, ref;
    if (config['toc']) {
      args.push('--toc');
    }
    if (config['toc_depth']) {
      args.push('--toc-depth=' + config['toc_depth']);
    }
    if (config['highlight']) {
      if (config['highlight'] === 'default') {
        config['highlight'] = 'pygments';
      }
      args.push('--highlight-style=' + config['highlight']);
    }
    if (config['highlight'] === null) {
      args.push('--no-highlight');
    }
    if (config['pandoc_args']) {
      ref = config['pandoc_args'];
      for (j = 0, len = ref.length; j < len; j++) {
        arg = ref[j];
        args.push(arg);
      }
    }
    if (config['citation_package']) {
      if (config['citation_package'] === 'natbib') {
        args.push('--natbib');
      } else if (config['citation_package'] === 'biblatex') {
        args.push('--biblatex');
      }
    }
    if (config['number_sections']) {
      args.push('--number-sections');
    }
    if (config['incremental']) {
      args.push('--incremental');
    }
    if (config['slide_level']) {
      args.push('--slide-level=' + config['slide_level']);
    }
    if (config['theme']) {
      args.push('-V', 'theme:' + config['theme']);
    }
    if (config['colortheme']) {
      args.push('-V', 'colortheme:' + config['colortheme']);
    }
    if (config['fonttheme']) {
      args.push('-V', 'fonttheme:' + config['fonttheme']);
    }
    if (config['latex_engine']) {
      args.push('--latex-engine=' + config['latex_engine']);
    }
    if (config['includes'] && typeof config['includes'] === 'object') {
      includesConfig = config['includes'];
      helper = function(prefix, data) {
        if (typeof data === 'string') {
          return args.push(prefix + data);
        } else if (data.constructor === Array) {
          return data.forEach(function(d) {
            return args.push(prefix + d);
          });
        } else {
          return args.push(prefix + data);
        }
      };
      if (includesConfig['in_header']) {
        helper('--include-in-header=', includesConfig['in_header']);
      }
      if (includesConfig['before_body']) {
        helper('--include-before-body=', includesConfig['before_body']);
      }
      if (includesConfig['after_body']) {
        helper('--include-after-body=', includesConfig['after_body']);
      }
    }
    if (config['template']) {
      return args.push('--template=' + config['template']);
    }
  };

  loadOutputYAML = function(fileDirectoryPath, config) {
    var data, error, format, yaml, yamlPath;
    yamlPath = path.resolve(fileDirectoryPath, '_output.yaml');
    try {
      yaml = fs.readFileSync(yamlPath);
    } catch (error1) {
      error = error1;
      return Object.assign({}, config);
    }
    data = matter('---\n' + yaml + '---\n').data;
    data = data || {};
    if (config['output']) {
      if (typeof config['output'] === 'string' && data[config['output']]) {
        format = config['output'];
        config['output'] = {};
        config['output'][format] = data[format];
      } else {
        format = Object.keys(config['output'])[0];
        if (data[format]) {
          config['output'][format] = Object.assign({}, data[format], config['output'][format]);
        }
      }
    }
    return Object.assign({}, data, config);
  };

  processConfigPaths = function(config, fileDirectoryPath, projectDirectoryPath) {
    var documentFormat, helper, outputConfig, resolvePath;
    resolvePath = function(src) {
      if (src.startsWith('/')) {
        return path.relative(fileDirectoryPath, path.resolve(projectDirectoryPath, '.' + src));
      } else {
        return src;
      }
    };
    helper = function(data) {
      if (typeof data === 'string') {
        return resolvePath(data);
      } else if (data.constructor === Array) {
        return data.map(function(d) {
          return resolvePath(d);
        });
      } else {
        return data;
      }
    };
    if (config['bibliography']) {
      config['bibliography'] = helper(config['bibliography']);
    }
    if (config['csl']) {
      config['csl'] = helper(config['csl']);
    }
    if (config['output'] && typeof config['output'] === 'object') {
      documentFormat = Object.keys(config['output'])[0];
      outputConfig = config['output'][documentFormat];
      if (outputConfig['includes']) {
        if (outputConfig['includes']['in_header']) {
          outputConfig['includes']['in_header'] = helper(outputConfig['includes']['in_header']);
        }
        if (outputConfig['includes']['before_body']) {
          outputConfig['includes']['before_body'] = helper(outputConfig['includes']['before_body']);
        }
        if (outputConfig['includes']['after_body']) {
          outputConfig['includes']['after_body'] = helper(outputConfig['includes']['after_body']);
        }
      }
      if (outputConfig['reference_docx']) {
        outputConfig['reference_docx'] = helper(outputConfig['reference_docx']);
      }
      if (outputConfig['template']) {
        return outputConfig['template'] = helper(outputConfig['template']);
      }
    }
  };

  processPaths = function(text, fileDirectoryPath, projectDirectoryPath) {
    var match, offset, output, r, resolvePath;
    match = null;
    offset = 0;
    output = '';
    resolvePath = function(src) {
      if (src.startsWith('/')) {
        return path.relative(fileDirectoryPath, path.resolve(projectDirectoryPath, '.' + src));
      } else {
        return src;
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

  pandocRender = function(text, arg1, callback) {
    var args, codeChunkMatch, cwd, dataArgs, dataCodeChunk, fileDirectoryPath, i, lang, line, lines, outputString, pandocPath, program, projectDirectoryPath;
    if (text == null) {
      text = '';
    }
    args = arg1.args, projectDirectoryPath = arg1.projectDirectoryPath, fileDirectoryPath = arg1.fileDirectoryPath;
    args = args || [];
    args = ['-t', 'html'].concat(args).filter(function(arg) {
      return arg.length;
    });

    /*
    convert code chunk
    ```{python id:"haha"}
    to
    ```{.python data-args="{id: haha}"}
     */
    outputString = "";
    lines = text.split('\n');
    i = 0;
    while (i < lines.length) {
      line = lines[i];
      codeChunkMatch = line.match(/^\`\`\`\{(\w+)\s*(.*)\}\s*/);
      if (codeChunkMatch) {
        lang = codeChunkMatch[1].trim();
        dataArgs = codeChunkMatch[2].trim().replace(/('|")/g, '\\$1');
        dataCodeChunk = "{" + lang + " " + dataArgs + "}";
        outputString += "```{." + lang + " data-code-chunk=\"" + dataCodeChunk + "\"}\n";
        i += 1;
        continue;
      }
      outputString += line + '\n';
      i += 1;
    }
    cwd = process.cwd();
    process.chdir(fileDirectoryPath);
    pandocPath = atom.config.get('markdown-preview-enhanced.pandocPath');
    program = execFile(pandocPath, args, function(error, stdout, stderr) {
      process.chdir(cwd);
      return callback(error || stderr, stdout);
    });
    return program.stdin.end(outputString);
  };


  /*
  @param {String} text: markdown string
  @param {Object} all properties are required!
    @param {String} fileDirectoryPath
    @param {String} projectDirectoryPath
    @param {String} sourceFilePath
  callback(err, outputFilePath)
   */

  pandocConvert = function(text, arg1, config, callback) {
    var args, cwd, deleteImages, documentFormat, extension, fileDirectoryPath, outputConfig, outputFilePath, projectDirectoryPath, sourceFilePath;
    fileDirectoryPath = arg1.fileDirectoryPath, projectDirectoryPath = arg1.projectDirectoryPath, sourceFilePath = arg1.sourceFilePath, deleteImages = arg1.deleteImages;
    if (config == null) {
      config = {};
    }
    if (callback == null) {
      callback = null;
    }
    deleteImages = deleteImages || true;
    config = loadOutputYAML(fileDirectoryPath, config);
    args = [];
    extension = null;
    outputConfig = null;
    documentFormat = null;
    if (config['output']) {
      if (typeof config['output'] === 'string') {
        documentFormat = config['output'];
        extension = getFileExtension(documentFormat);
      } else {
        documentFormat = Object.keys(config['output'])[0];
        extension = getFileExtension(documentFormat);
        outputConfig = config['output'][documentFormat];
      }
    } else {
      atom.notifications.addError('Output format needs to be specified');
    }
    if (!extension) {
      return;
    }
    if (documentFormat === 'custom_document' && (!outputConfig || !outputConfig['path'])) {
      return atom.notifications.addError('custom_document requires path to be defined');
    }
    if (documentFormat === 'beamer_presentation') {
      args.push('-t', 'beamer');
    }
    if (outputConfig && outputConfig['path']) {
      outputFilePath = outputConfig['path'];
      if (outputFilePath.startsWith('/')) {
        outputFilePath = path.resolve(projectDirectoryPath, '.' + outputFilePath);
      } else {
        outputFilePath = path.resolve(fileDirectoryPath, outputFilePath);
      }
      if (documentFormat !== 'custom_document' && path.extname(outputFilePath) !== '.' + extension) {
        return atom.notifications.addError('Invalid extension for ' + documentFormat, {
          detail: 'required .' + extension + ', but ' + path.extname(outputFilePath) + ' was provided.'
        });
      }
      args.push('-o', outputFilePath);
    } else {
      outputFilePath = sourceFilePath;
      outputFilePath = outputFilePath.slice(0, outputFilePath.length - path.extname(outputFilePath).length) + '.' + extension;
      args.push('-o', outputFilePath);
    }
    processConfigPaths(config, fileDirectoryPath, projectDirectoryPath);
    if (outputConfig) {
      processOutputConfig(outputConfig, args);
    }
    text = matter.stringify(text, config);
    text = fileImport(text, {
      fileDirectoryPath: fileDirectoryPath,
      projectDirectoryPath: projectDirectoryPath,
      useAbsoluteImagePath: false
    }).outputString;
    text = processPaths(text, fileDirectoryPath, projectDirectoryPath);
    cwd = process.cwd();
    process.chdir(fileDirectoryPath);
    if (config['bibliography'] || config['references']) {
      args.push('--filter', 'pandoc-citeproc');
    }
    atom.notifications.addInfo('Your document is being prepared', {
      detail: ':)'
    });
    return processGraphs(text, {
      fileDirectoryPath: fileDirectoryPath,
      projectDirectoryPath: projectDirectoryPath,
      imageDirectoryPath: fileDirectoryPath
    }, function(text, imagePaths) {
      var directory;
      if (imagePaths == null) {
        imagePaths = [];
      }
      directory = new Directory(path.dirname(outputFilePath));
      return directory.create().then(function(flag) {
        var pandocPath, program;
        pandocPath = atom.config.get('markdown-preview-enhanced.pandocPath');
        program = execFile(pandocPath, args, function(err) {
          if (deleteImages) {
            imagePaths.forEach(function(p) {
              return fs.unlink(p);
            });
          }
          process.chdir(cwd);
          if (callback) {
            return callback(err, outputFilePath);
          }
        });
        return program.stdin.end(text);
      });
    });
  };

  module.exports = {
    pandocConvert: pandocConvert,
    pandocRender: pandocRender
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9wYW5kb2MtY29udmVydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0osV0FBWSxPQUFBLENBQVEsZUFBUjs7RUFDYixNQUFBLEdBQVMsT0FBQSxDQUFRLGFBQVI7O0VBQ1IsWUFBYSxPQUFBLENBQVEsTUFBUjs7RUFDZCxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsR0FBQSxHQUFNLE9BQUEsQ0FBUSw0QkFBUjs7RUFDTixXQUFBLEdBQWMsT0FBQSxDQUFRLFFBQVI7O0VBQ2QsWUFBQSxHQUFlLE9BQUEsQ0FBUSxjQUFSOztFQUNkLGNBQWUsT0FBQSxDQUFRLG9EQUFSOztFQUNoQixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUjs7RUFDaEIsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUViLGdCQUFBLEdBQW1CLFNBQUMsWUFBRDtJQUNqQixJQUFHLFlBQUEsS0FBZ0IsY0FBaEIsSUFBa0MsWUFBQSxLQUFnQixxQkFBckQ7YUFDRSxNQURGO0tBQUEsTUFFSyxJQUFHLFlBQUEsS0FBZ0IsZUFBbkI7YUFDSCxPQURHO0tBQUEsTUFFQSxJQUFHLFlBQUEsS0FBZ0IsY0FBbkI7YUFDSCxNQURHO0tBQUEsTUFFQSxJQUFHLFlBQUEsS0FBZ0IsaUJBQW5CO2FBQ0gsSUFERztLQUFBLE1BQUE7TUFHSCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLHVCQUE1QixFQUFxRDtRQUFBLE1BQUEsRUFBUSxZQUFSO09BQXJEO2FBQ0EsS0FKRzs7RUFQWTs7RUFjbkIsbUJBQUEsR0FBc0IsU0FBQyxNQUFELEVBQVMsSUFBVDtBQUNwQixRQUFB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T0FBTCxDQUFhLGNBQWIsQ0FBVjthQUNoQixTQUFTLENBQUMsTUFBVixDQUFBLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsU0FBQyxJQUFEO0FBQ3RCLFlBQUE7UUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQjtRQUNiLE9BQUEsR0FBVSxRQUFBLENBQVMsVUFBVCxFQUFxQixJQUFyQixFQUEyQixTQUFDLEdBQUQ7VUFDbkMsSUFBRyxZQUFIO1lBRUUsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsU0FBQyxDQUFEO3FCQUNqQixFQUFFLENBQUMsTUFBSCxDQUFVLENBQVY7WUFEaUIsQ0FBbkIsRUFGRjs7VUFLQSxPQUFPLENBQUMsS0FBUixDQUFjLEdBQWQ7VUFDQSxJQUF3QyxRQUF4QztBQUFBLG1CQUFPLFFBQUEsQ0FBUyxHQUFULEVBQWMsY0FBZCxFQUFQOztRQVBtQyxDQUEzQjtlQVFWLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBZCxDQUFrQixJQUFsQjtNQVZzQixDQUF4QjtJQU5vRyxDQUF0RztFQXRFYzs7RUF3RmhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQ2YsZUFBQSxhQURlO0lBRWYsY0FBQSxZQUZlOztBQWpVakIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG57ZXhlY0ZpbGV9ID0gcmVxdWlyZSAnY2hpbGRfcHJvY2Vzcydcbm1hdHRlciA9IHJlcXVpcmUgJ2dyYXktbWF0dGVyJ1xue0RpcmVjdG9yeX0gPSByZXF1aXJlICdhdG9tJ1xuYXN5bmMgPSByZXF1aXJlICdhc3luYydcblZpeiA9IHJlcXVpcmUgJy4uL2RlcGVuZGVuY2llcy92aXovdml6LmpzJ1xucGxhbnR1bWxBUEkgPSByZXF1aXJlICcuL3B1bWwnXG5jb2RlQ2h1bmtBUEkgPSByZXF1aXJlICcuL2NvZGUtY2h1bmsnXG57c3ZnQXNQbmdVcml9ID0gcmVxdWlyZSAnLi4vZGVwZW5kZW5jaWVzL3NhdmUtc3ZnLWFzLXBuZy9zYXZlLXN2Zy1hcy1wbmcuanMnXG5wcm9jZXNzR3JhcGhzID0gcmVxdWlyZSAnLi9wcm9jZXNzLWdyYXBocydcbmZpbGVJbXBvcnQgPSByZXF1aXJlICcuL2ZpbGUtaW1wb3J0J1xuXG5nZXRGaWxlRXh0ZW5zaW9uID0gKGRvY3VtZW50VHlwZSktPlxuICBpZiBkb2N1bWVudFR5cGUgPT0gJ3BkZl9kb2N1bWVudCcgb3IgZG9jdW1lbnRUeXBlID09ICdiZWFtZXJfcHJlc2VudGF0aW9uJ1xuICAgICdwZGYnXG4gIGVsc2UgaWYgZG9jdW1lbnRUeXBlID09ICd3b3JkX2RvY3VtZW50J1xuICAgICdkb2N4J1xuICBlbHNlIGlmIGRvY3VtZW50VHlwZSA9PSAncnRmX2RvY3VtZW50J1xuICAgICdydGYnXG4gIGVsc2UgaWYgZG9jdW1lbnRUeXBlID09ICdjdXN0b21fZG9jdW1lbnQnXG4gICAgJyonXG4gIGVsc2VcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ludmFsaWQgb3V0cHV0IGZvcm1hdCcsIGRldGFpbDogZG9jdW1lbnRUeXBlKVxuICAgIG51bGxcblxuIyBlZzogcHJvY2VzcyBjb25maWcgaW5zaWRlIHBkZl9kb2N1bWVudCBibG9ja1xucHJvY2Vzc091dHB1dENvbmZpZyA9IChjb25maWcsIGFyZ3MpLT5cbiAgaWYgY29uZmlnWyd0b2MnXVxuICAgIGFyZ3MucHVzaCAnLS10b2MnXG4gIGlmIGNvbmZpZ1sndG9jX2RlcHRoJ11cbiAgICBhcmdzLnB1c2goJy0tdG9jLWRlcHRoPScrY29uZmlnWyd0b2NfZGVwdGgnXSlcblxuICBpZiBjb25maWdbJ2hpZ2hsaWdodCddXG4gICAgaWYgY29uZmlnWydoaWdobGlnaHQnXSA9PSAnZGVmYXVsdCdcbiAgICAgIGNvbmZpZ1snaGlnaGxpZ2h0J10gPSAncHlnbWVudHMnXG4gICAgYXJncy5wdXNoKCctLWhpZ2hsaWdodC1zdHlsZT0nK2NvbmZpZ1snaGlnaGxpZ2h0J10pXG4gIGlmIGNvbmZpZ1snaGlnaGxpZ2h0J10gPT0gbnVsbFxuICAgIGFyZ3MucHVzaCgnLS1uby1oaWdobGlnaHQnKVxuXG4gIGlmIGNvbmZpZ1sncGFuZG9jX2FyZ3MnXVxuICAgIGZvciBhcmcgaW4gY29uZmlnWydwYW5kb2NfYXJncyddXG4gICAgICBhcmdzLnB1c2goYXJnKVxuXG4gIGlmIGNvbmZpZ1snY2l0YXRpb25fcGFja2FnZSddXG4gICAgaWYgY29uZmlnWydjaXRhdGlvbl9wYWNrYWdlJ10gPT0gJ25hdGJpYidcbiAgICAgIGFyZ3MucHVzaCgnLS1uYXRiaWInKVxuICAgIGVsc2UgaWYgY29uZmlnWydjaXRhdGlvbl9wYWNrYWdlJ10gPT0gJ2JpYmxhdGV4J1xuICAgICAgYXJncy5wdXNoKCctLWJpYmxhdGV4JylcblxuICBpZiBjb25maWdbJ251bWJlcl9zZWN0aW9ucyddXG4gICAgYXJncy5wdXNoKCctLW51bWJlci1zZWN0aW9ucycpXG5cbiAgaWYgY29uZmlnWydpbmNyZW1lbnRhbCddXG4gICAgYXJncy5wdXNoKCctLWluY3JlbWVudGFsJylcblxuICBpZiBjb25maWdbJ3NsaWRlX2xldmVsJ11cbiAgICBhcmdzLnB1c2goJy0tc2xpZGUtbGV2ZWw9Jytjb25maWdbJ3NsaWRlX2xldmVsJ10pXG5cbiAgaWYgY29uZmlnWyd0aGVtZSddXG4gICAgYXJncy5wdXNoKCctVicsICd0aGVtZTonK2NvbmZpZ1sndGhlbWUnXSlcblxuICBpZiBjb25maWdbJ2NvbG9ydGhlbWUnXVxuICAgIGFyZ3MucHVzaCgnLVYnLCAnY29sb3J0aGVtZTonK2NvbmZpZ1snY29sb3J0aGVtZSddKVxuXG4gIGlmIGNvbmZpZ1snZm9udHRoZW1lJ11cbiAgICBhcmdzLnB1c2goJy1WJywgJ2ZvbnR0aGVtZTonK2NvbmZpZ1snZm9udHRoZW1lJ10pXG5cbiAgaWYgY29uZmlnWydsYXRleF9lbmdpbmUnXVxuICAgIGFyZ3MucHVzaCgnLS1sYXRleC1lbmdpbmU9Jytjb25maWdbJ2xhdGV4X2VuZ2luZSddKVxuXG4gIGlmIGNvbmZpZ1snaW5jbHVkZXMnXSBhbmQgdHlwZW9mKGNvbmZpZ1snaW5jbHVkZXMnXSkgPT0gJ29iamVjdCdcbiAgICBpbmNsdWRlc0NvbmZpZyA9IGNvbmZpZ1snaW5jbHVkZXMnXVxuICAgIGhlbHBlciA9IChwcmVmaXgsIGRhdGEpLT5cbiAgICAgIGlmIHR5cGVvZihkYXRhKSA9PSAnc3RyaW5nJ1xuICAgICAgICBhcmdzLnB1c2ggcHJlZml4K2RhdGFcbiAgICAgIGVsc2UgaWYgZGF0YS5jb25zdHJ1Y3RvciA9PSBBcnJheVxuICAgICAgICBkYXRhLmZvckVhY2ggKGQpLT5cbiAgICAgICAgICBhcmdzLnB1c2ggcHJlZml4K2RcbiAgICAgIGVsc2VcbiAgICAgICAgYXJncy5wdXNoIHByZWZpeCtkYXRhXG5cbiAgICAjIFRPRE86IGluY2x1ZGVzQ29uZmlnWydpbl9oZWFkZXInXSBpcyBhcnJheVxuICAgIGlmIGluY2x1ZGVzQ29uZmlnWydpbl9oZWFkZXInXVxuICAgICAgaGVscGVyKCctLWluY2x1ZGUtaW4taGVhZGVyPScsIGluY2x1ZGVzQ29uZmlnWydpbl9oZWFkZXInXSlcbiAgICBpZiBpbmNsdWRlc0NvbmZpZ1snYmVmb3JlX2JvZHknXVxuICAgICAgaGVscGVyKCctLWluY2x1ZGUtYmVmb3JlLWJvZHk9JywgaW5jbHVkZXNDb25maWdbJ2JlZm9yZV9ib2R5J10pXG4gICAgaWYgaW5jbHVkZXNDb25maWdbJ2FmdGVyX2JvZHknXVxuICAgICAgaGVscGVyKCctLWluY2x1ZGUtYWZ0ZXItYm9keT0nLCBpbmNsdWRlc0NvbmZpZ1snYWZ0ZXJfYm9keSddKVxuXG4gIGlmIGNvbmZpZ1sndGVtcGxhdGUnXVxuICAgIGFyZ3MucHVzaCgnLS10ZW1wbGF0ZT0nICsgY29uZmlnWyd0ZW1wbGF0ZSddKVxuXG5sb2FkT3V0cHV0WUFNTCA9IChmaWxlRGlyZWN0b3J5UGF0aCwgY29uZmlnKS0+XG4gIHlhbWxQYXRoID0gcGF0aC5yZXNvbHZlKGZpbGVEaXJlY3RvcnlQYXRoLCAnX291dHB1dC55YW1sJylcbiAgdHJ5XG4gICAgeWFtbCA9IGZzLnJlYWRGaWxlU3luYyB5YW1sUGF0aFxuICBjYXRjaCBlcnJvclxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBjb25maWcpXG5cbiAgZGF0YSA9IG1hdHRlcignLS0tXFxuJyt5YW1sKyctLS1cXG4nKS5kYXRhXG4gIGRhdGEgPSBkYXRhIHx8IHt9XG5cbiAgaWYgY29uZmlnWydvdXRwdXQnXVxuICAgIGlmIHR5cGVvZihjb25maWdbJ291dHB1dCddKSA9PSAnc3RyaW5nJyBhbmQgZGF0YVtjb25maWdbJ291dHB1dCddXVxuICAgICAgZm9ybWF0ID0gY29uZmlnWydvdXRwdXQnXVxuICAgICAgY29uZmlnWydvdXRwdXQnXSA9IHt9XG4gICAgICBjb25maWdbJ291dHB1dCddW2Zvcm1hdF0gPSBkYXRhW2Zvcm1hdF1cbiAgICBlbHNlXG4gICAgICBmb3JtYXQgPSBPYmplY3Qua2V5cyhjb25maWdbJ291dHB1dCddKVswXVxuICAgICAgaWYgZGF0YVtmb3JtYXRdXG4gICAgICAgIGNvbmZpZ1snb3V0cHV0J11bZm9ybWF0XSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbZm9ybWF0XSwgY29uZmlnWydvdXRwdXQnXVtmb3JtYXRdKVxuXG4gIE9iamVjdC5hc3NpZ24oe30sIGRhdGEsIGNvbmZpZylcblxucHJvY2Vzc0NvbmZpZ1BhdGhzID0gKGNvbmZpZywgZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRoKS0+XG4gICMgc2FtZSBhcyB0aGUgb25lIGluIHByb2Nlc3NQYXRocyBmdW5jdGlvblxuICAjIFRPRE86IHJlZmFjdG9yIGluIHRoZSBmdXR1cmVcbiAgcmVzb2x2ZVBhdGggPSAoc3JjKS0+XG4gICAgaWYgc3JjLnN0YXJ0c1dpdGgoJy8nKVxuICAgICAgcmV0dXJuIHBhdGgucmVsYXRpdmUoZmlsZURpcmVjdG9yeVBhdGgsIHBhdGgucmVzb2x2ZShwcm9qZWN0RGlyZWN0b3J5UGF0aCwgJy4nK3NyYykpXG4gICAgZWxzZSAjIC4vdGVzdC5wbmcgb3IgdGVzdC5wbmdcbiAgICAgIHJldHVybiBzcmNcblxuICBoZWxwZXIgPSAoZGF0YSktPlxuICAgIGlmIHR5cGVvZihkYXRhKSA9PSAnc3RyaW5nJ1xuICAgICAgcmV0dXJuIHJlc29sdmVQYXRoKGRhdGEpXG4gICAgZWxzZSBpZiBkYXRhLmNvbnN0cnVjdG9yID09IEFycmF5XG4gICAgICByZXR1cm4gZGF0YS5tYXAgKGQpLT5yZXNvbHZlUGF0aChkKVxuICAgIGVsc2VcbiAgICAgIGRhdGFcblxuICBpZiBjb25maWdbJ2JpYmxpb2dyYXBoeSddXG4gICAgY29uZmlnWydiaWJsaW9ncmFwaHknXSA9IGhlbHBlcihjb25maWdbJ2JpYmxpb2dyYXBoeSddKVxuXG4gIGlmIGNvbmZpZ1snY3NsJ11cbiAgICBjb25maWdbJ2NzbCddID0gaGVscGVyKGNvbmZpZ1snY3NsJ10pXG5cbiAgaWYgY29uZmlnWydvdXRwdXQnXSBhbmQgdHlwZW9mKGNvbmZpZ1snb3V0cHV0J10pID09ICdvYmplY3QnXG4gICAgZG9jdW1lbnRGb3JtYXQgPSBPYmplY3Qua2V5cyhjb25maWdbJ291dHB1dCddKVswXVxuICAgIG91dHB1dENvbmZpZyA9IGNvbmZpZ1snb3V0cHV0J11bZG9jdW1lbnRGb3JtYXRdXG4gICAgaWYgb3V0cHV0Q29uZmlnWydpbmNsdWRlcyddXG4gICAgICBpZiBvdXRwdXRDb25maWdbJ2luY2x1ZGVzJ11bJ2luX2hlYWRlciddXG4gICAgICAgIG91dHB1dENvbmZpZ1snaW5jbHVkZXMnXVsnaW5faGVhZGVyJ10gPSBoZWxwZXIob3V0cHV0Q29uZmlnWydpbmNsdWRlcyddWydpbl9oZWFkZXInXSlcbiAgICAgIGlmIG91dHB1dENvbmZpZ1snaW5jbHVkZXMnXVsnYmVmb3JlX2JvZHknXVxuICAgICAgICBvdXRwdXRDb25maWdbJ2luY2x1ZGVzJ11bJ2JlZm9yZV9ib2R5J10gPSBoZWxwZXIob3V0cHV0Q29uZmlnWydpbmNsdWRlcyddWydiZWZvcmVfYm9keSddKVxuICAgICAgaWYgb3V0cHV0Q29uZmlnWydpbmNsdWRlcyddWydhZnRlcl9ib2R5J11cbiAgICAgICAgb3V0cHV0Q29uZmlnWydpbmNsdWRlcyddWydhZnRlcl9ib2R5J10gPSBoZWxwZXIob3V0cHV0Q29uZmlnWydpbmNsdWRlcyddWydhZnRlcl9ib2R5J10pXG5cbiAgICBpZiBvdXRwdXRDb25maWdbJ3JlZmVyZW5jZV9kb2N4J11cbiAgICAgIG91dHB1dENvbmZpZ1sncmVmZXJlbmNlX2RvY3gnXSA9IGhlbHBlcihvdXRwdXRDb25maWdbJ3JlZmVyZW5jZV9kb2N4J10pXG5cbiAgICBpZiBvdXRwdXRDb25maWdbJ3RlbXBsYXRlJ11cbiAgICAgIG91dHB1dENvbmZpZ1sndGVtcGxhdGUnXSA9IGhlbHBlcihvdXRwdXRDb25maWdbJ3RlbXBsYXRlJ10pXG5cbnByb2Nlc3NQYXRocyA9ICh0ZXh0LCBmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGgpLT5cbiAgbWF0Y2ggPSBudWxsXG4gIG9mZnNldCA9IDBcbiAgb3V0cHV0ID0gJydcblxuICByZXNvbHZlUGF0aCA9IChzcmMpLT5cbiAgICBpZiBzcmMuc3RhcnRzV2l0aCgnLycpXG4gICAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZShmaWxlRGlyZWN0b3J5UGF0aCwgcGF0aC5yZXNvbHZlKHByb2plY3REaXJlY3RvcnlQYXRoLCAnLicrc3JjKSlcbiAgICBlbHNlICMgLi90ZXN0LnBuZyBvciB0ZXN0LnBuZ1xuICAgICAgcmV0dXJuIHNyY1xuXG4gICMgcmVwbGFjZSBwYXRoIGluICFbXSguLi4pIGFuZCBbXSgpXG4gIHIgPSAvKFxcIT9cXFsuKj9dXFwoKShbXlxcKXxeJ3xeXCJdKikoLio/XFwpKS9naVxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlIHIsICh3aG9sZSwgYSwgYiwgYyktPlxuICAgIGlmIGJbMF0gPT0gJzwnXG4gICAgICBiID0gYi5zbGljZSgxLCBiLmxlbmd0aC0xKVxuICAgICAgYSArICc8JyArIHJlc29sdmVQYXRoKGIudHJpbSgpKSArICc+ICcgKyBjXG4gICAgZWxzZVxuICAgICAgYSArIHJlc29sdmVQYXRoKGIudHJpbSgpKSArICcgJyArIGNcblxuICAjIHJlcGxhY2UgcGF0aCBpbiB0YWdcbiAgciA9IC8oPFtpbWd8YXxpZnJhbWVdLio/W3NyY3xocmVmXT1bJ1wiXSkoLis/KShbJ1wiXS4qPz4pL2dpXG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UgciwgKHdob2xlLCBhLCBiLCBjKS0+XG4gICAgYSArIHJlc29sdmVQYXRoKGIpICsgY1xuXG4gIHRleHRcblxuIyBjYWxsYmFjayhlcnJvciwgaHRtbClcbnBhbmRvY1JlbmRlciA9ICh0ZXh0PScnLCB7YXJncywgcHJvamVjdERpcmVjdG9yeVBhdGgsIGZpbGVEaXJlY3RvcnlQYXRofSwgY2FsbGJhY2spLT5cbiAgYXJncyA9IGFyZ3Mgb3IgW11cbiAgYXJncyA9IFsnLXQnLCAnaHRtbCddLmNvbmNhdChhcmdzKS5maWx0ZXIoKGFyZyktPmFyZy5sZW5ndGgpXG5cbiAgIyMjXG4gIGNvbnZlcnQgY29kZSBjaHVua1xuICBgYGB7cHl0aG9uIGlkOlwiaGFoYVwifVxuICB0b1xuICBgYGB7LnB5dGhvbiBkYXRhLWFyZ3M9XCJ7aWQ6IGhhaGF9XCJ9XG4gICMjI1xuXG4gIG91dHB1dFN0cmluZyA9IFwiXCJcbiAgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICBpID0gMFxuICB3aGlsZSBpIDwgbGluZXMubGVuZ3RoXG4gICAgbGluZSA9IGxpbmVzW2ldXG5cbiAgICBjb2RlQ2h1bmtNYXRjaCA9IGxpbmUubWF0Y2ggL15cXGBcXGBcXGBcXHsoXFx3KylcXHMqKC4qKVxcfVxccyovXG4gICAgaWYgY29kZUNodW5rTWF0Y2ggIyBjb2RlIGNodW5rXG4gICAgICBsYW5nID0gY29kZUNodW5rTWF0Y2hbMV0udHJpbSgpXG4gICAgICBkYXRhQXJncyA9IGNvZGVDaHVua01hdGNoWzJdLnRyaW0oKS5yZXBsYWNlKC8oJ3xcIikvZywgJ1xcXFwkMScpICMgZXNjYXBlXG4gICAgICBkYXRhQ29kZUNodW5rID0gXCJ7I3tsYW5nfSAje2RhdGFBcmdzfX1cIlxuXG4gICAgICBvdXRwdXRTdHJpbmcgKz0gXCJgYGB7LiN7bGFuZ30gZGF0YS1jb2RlLWNodW5rPVxcXCIje2RhdGFDb2RlQ2h1bmt9XFxcIn1cXG5cIlxuICAgICAgaSArPSAxXG4gICAgICBjb250aW51ZVxuXG4gICAgb3V0cHV0U3RyaW5nICs9IGxpbmUgKyAnXFxuJ1xuICAgIGkgKz0gMVxuXG4gICMgY29uc29sZS5sb2cob3V0cHV0U3RyaW5nKVxuXG4gICMgY2hhbmdlIHdvcmtpbmcgZGlyZWN0b3J5XG4gIGN3ZCA9IHByb2Nlc3MuY3dkKClcbiAgcHJvY2Vzcy5jaGRpcihmaWxlRGlyZWN0b3J5UGF0aClcblxuICBwYW5kb2NQYXRoID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBhbmRvY1BhdGgnKVxuICBwcm9ncmFtID0gZXhlY0ZpbGUgcGFuZG9jUGF0aCwgYXJncywgKGVycm9yLCBzdGRvdXQsIHN0ZGVyciktPlxuICAgIHByb2Nlc3MuY2hkaXIoY3dkKVxuICAgIHJldHVybiBjYWxsYmFjayhlcnJvciBvciBzdGRlcnIsIHN0ZG91dClcbiAgcHJvZ3JhbS5zdGRpbi5lbmQob3V0cHV0U3RyaW5nKVxuXG4jIyNcbkBwYXJhbSB7U3RyaW5nfSB0ZXh0OiBtYXJrZG93biBzdHJpbmdcbkBwYXJhbSB7T2JqZWN0fSBhbGwgcHJvcGVydGllcyBhcmUgcmVxdWlyZWQhXG4gIEBwYXJhbSB7U3RyaW5nfSBmaWxlRGlyZWN0b3J5UGF0aFxuICBAcGFyYW0ge1N0cmluZ30gcHJvamVjdERpcmVjdG9yeVBhdGhcbiAgQHBhcmFtIHtTdHJpbmd9IHNvdXJjZUZpbGVQYXRoXG5jYWxsYmFjayhlcnIsIG91dHB1dEZpbGVQYXRoKVxuIyMjXG5wYW5kb2NDb252ZXJ0ID0gKHRleHQsIHtmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGgsIHNvdXJjZUZpbGVQYXRoLCBkZWxldGVJbWFnZXN9LCBjb25maWc9e30sIGNhbGxiYWNrPW51bGwpLT5cbiAgZGVsZXRlSW1hZ2VzID0gZGVsZXRlSW1hZ2VzIG9yIHRydWVcbiAgY29uZmlnID0gbG9hZE91dHB1dFlBTUwgZmlsZURpcmVjdG9yeVBhdGgsIGNvbmZpZ1xuICBhcmdzID0gW11cblxuICBleHRlbnNpb24gPSBudWxsXG4gIG91dHB1dENvbmZpZyA9IG51bGxcbiAgZG9jdW1lbnRGb3JtYXQgPSBudWxsXG4gIGlmIGNvbmZpZ1snb3V0cHV0J11cbiAgICBpZiB0eXBlb2YoY29uZmlnWydvdXRwdXQnXSkgPT0gJ3N0cmluZydcbiAgICAgIGRvY3VtZW50Rm9ybWF0ID0gY29uZmlnWydvdXRwdXQnXVxuICAgICAgZXh0ZW5zaW9uID0gZ2V0RmlsZUV4dGVuc2lvbihkb2N1bWVudEZvcm1hdClcbiAgICBlbHNlXG4gICAgICBkb2N1bWVudEZvcm1hdCA9IE9iamVjdC5rZXlzKGNvbmZpZ1snb3V0cHV0J10pWzBdXG4gICAgICBleHRlbnNpb24gPSBnZXRGaWxlRXh0ZW5zaW9uKGRvY3VtZW50Rm9ybWF0KVxuICAgICAgb3V0cHV0Q29uZmlnID0gY29uZmlnWydvdXRwdXQnXVtkb2N1bWVudEZvcm1hdF1cbiAgZWxzZVxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignT3V0cHV0IGZvcm1hdCBuZWVkcyB0byBiZSBzcGVjaWZpZWQnKVxuICByZXR1cm4gaWYgbm90IGV4dGVuc2lvblxuXG4gICMgY3VzdG9tX2RvY3VtZW50IHJlcXVpcmVzIHBhdGggdG8gYmUgZGVmaW5lZFxuICBpZiBkb2N1bWVudEZvcm1hdCA9PSAnY3VzdG9tX2RvY3VtZW50JyBhbmQgKCFvdXRwdXRDb25maWcgfHwgIW91dHB1dENvbmZpZ1sncGF0aCddKVxuICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ2N1c3RvbV9kb2N1bWVudCByZXF1aXJlcyBwYXRoIHRvIGJlIGRlZmluZWQnKVxuXG4gIGlmIGRvY3VtZW50Rm9ybWF0ID09ICdiZWFtZXJfcHJlc2VudGF0aW9uJ1xuICAgIGFyZ3MucHVzaCgnLXQnLCAnYmVhbWVyJylcblxuICAjIGRlc3RcbiAgaWYgb3V0cHV0Q29uZmlnIGFuZCBvdXRwdXRDb25maWdbJ3BhdGgnXVxuICAgIG91dHB1dEZpbGVQYXRoID0gb3V0cHV0Q29uZmlnWydwYXRoJ11cbiAgICBpZiBvdXRwdXRGaWxlUGF0aC5zdGFydHNXaXRoKCcvJylcbiAgICAgIG91dHB1dEZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKHByb2plY3REaXJlY3RvcnlQYXRoLCAnLicrb3V0cHV0RmlsZVBhdGgpXG4gICAgZWxzZVxuICAgICAgb3V0cHV0RmlsZVBhdGggPSBwYXRoLnJlc29sdmUoZmlsZURpcmVjdG9yeVBhdGgsIG91dHB1dEZpbGVQYXRoKVxuXG4gICAgaWYgZG9jdW1lbnRGb3JtYXQgIT0gJ2N1c3RvbV9kb2N1bWVudCcgYW5kIHBhdGguZXh0bmFtZShvdXRwdXRGaWxlUGF0aCkgIT0gJy4nICsgZXh0ZW5zaW9uXG4gICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdJbnZhbGlkIGV4dGVuc2lvbiBmb3IgJyArIGRvY3VtZW50Rm9ybWF0LCBkZXRhaWw6ICdyZXF1aXJlZCAuJyArIGV4dGVuc2lvbiArICcsIGJ1dCAnICsgcGF0aC5leHRuYW1lKG91dHB1dEZpbGVQYXRoKSArICcgd2FzIHByb3ZpZGVkLicpXG5cbiAgICBhcmdzLnB1c2ggJy1vJywgb3V0cHV0RmlsZVBhdGhcbiAgZWxzZVxuICAgIG91dHB1dEZpbGVQYXRoID0gc291cmNlRmlsZVBhdGhcbiAgICBvdXRwdXRGaWxlUGF0aCA9IG91dHB1dEZpbGVQYXRoLnNsaWNlKDAsIG91dHB1dEZpbGVQYXRoLmxlbmd0aCAtIHBhdGguZXh0bmFtZShvdXRwdXRGaWxlUGF0aCkubGVuZ3RoKSArICcuJyArIGV4dGVuc2lvblxuICAgIGFyZ3MucHVzaCAnLW8nLCBvdXRwdXRGaWxlUGF0aFxuXG4gICMgcmVzb2x2ZSBwYXRocyBpbiBmcm9udC1tYXR0ZXIoeWFtbClcbiAgcHJvY2Vzc0NvbmZpZ1BhdGhzIGNvbmZpZywgZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRoXG5cbiAgaWYgb3V0cHV0Q29uZmlnXG4gICAgcHJvY2Vzc091dHB1dENvbmZpZyBvdXRwdXRDb25maWcsIGFyZ3NcblxuICAjIGFkZCBmcm9udC1tYXR0ZXIoeWFtbCkgdG8gdGV4dFxuICB0ZXh0ID0gbWF0dGVyLnN0cmluZ2lmeSh0ZXh0LCBjb25maWcpXG5cbiAgIyBpbXBvcnQgZXh0ZXJuYWwgZmlsZXNcbiAgdGV4dCA9IGZpbGVJbXBvcnQodGV4dCwge2ZpbGVEaXJlY3RvcnlQYXRoLCBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgdXNlQWJzb2x1dGVJbWFnZVBhdGg6IGZhbHNlfSkub3V0cHV0U3RyaW5nXG5cbiAgIyBjaGFuZ2UgbGluayBwYXRoIHRvIHJlbGF0aXZlIHBhdGhcbiAgdGV4dCA9IHByb2Nlc3NQYXRocyB0ZXh0LCBmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGhcblxuICAjIGNoYW5nZSB3b3JraW5nIGRpcmVjdG9yeVxuICBjd2QgPSBwcm9jZXNzLmN3ZCgpXG4gIHByb2Nlc3MuY2hkaXIoZmlsZURpcmVjdG9yeVBhdGgpXG5cbiAgIyBjaXRhdGlvblxuICBpZiBjb25maWdbJ2JpYmxpb2dyYXBoeSddIG9yIGNvbmZpZ1sncmVmZXJlbmNlcyddXG4gICAgYXJncy5wdXNoKCctLWZpbHRlcicsICdwYW5kb2MtY2l0ZXByb2MnKVxuXG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdZb3VyIGRvY3VtZW50IGlzIGJlaW5nIHByZXBhcmVkJywgZGV0YWlsOiAnOiknKVxuXG4gICMgbWVybWFpZCAvIHZpeiAvIHdhdmVkcm9tIGdyYXBoXG4gIHByb2Nlc3NHcmFwaHMgdGV4dCwge2ZpbGVEaXJlY3RvcnlQYXRoLCBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgaW1hZ2VEaXJlY3RvcnlQYXRoOiBmaWxlRGlyZWN0b3J5UGF0aH0sICh0ZXh0LCBpbWFnZVBhdGhzPVtdKS0+XG4gICAgIyBjb25zb2xlLmxvZyBhcmdzLmpvaW4oJyAnKVxuICAgICNcbiAgICAjIHBhbmRvYyB3aWxsIGNhdXNlIGVycm9yIGlmIGRpcmVjdG9yeSBkb2Vzbid0IGV4aXN0LFxuICAgICMgdGhlcmVmb3JlIEkgd2lsbCBjcmVhdGUgZGlyZWN0b3J5IGZpcnN0LlxuICAgIGRpcmVjdG9yeSA9IG5ldyBEaXJlY3RvcnkocGF0aC5kaXJuYW1lKG91dHB1dEZpbGVQYXRoKSlcbiAgICBkaXJlY3RvcnkuY3JlYXRlKCkudGhlbiAoZmxhZyktPlxuICAgICAgcGFuZG9jUGF0aCA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wYW5kb2NQYXRoJylcbiAgICAgIHByb2dyYW0gPSBleGVjRmlsZSBwYW5kb2NQYXRoLCBhcmdzLCAoZXJyKS0+XG4gICAgICAgIGlmIGRlbGV0ZUltYWdlc1xuICAgICAgICAgICMgcmVtb3ZlIGltYWdlc1xuICAgICAgICAgIGltYWdlUGF0aHMuZm9yRWFjaCAocCktPlxuICAgICAgICAgICAgZnMudW5saW5rKHApXG5cbiAgICAgICAgcHJvY2Vzcy5jaGRpcihjd2QpICMgY2hhbmdlIGN3ZCBiYWNrXG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIG91dHB1dEZpbGVQYXRoKSBpZiBjYWxsYmFja1xuICAgICAgcHJvZ3JhbS5zdGRpbi5lbmQodGV4dClcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHBhbmRvY0NvbnZlcnQsXG4gIHBhbmRvY1JlbmRlclxufSJdfQ==
