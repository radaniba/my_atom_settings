(function() {
  var Directory, Viz, async, codeChunkAPI, execFile, fileImport, fs, getFileExtension, loadOutputYAML, matter, pandocConvert, pandocRender, path, processConfigPaths, processGraphs, processOutputConfig, processPaths, svgAsPngUri;

  path = require('path');

  fs = require('fs');

  execFile = require('child_process').execFile;

  matter = require('gray-matter');

  Directory = require('atom').Directory;

  async = require('async');

  Viz = require('../dependencies/viz/viz.js');

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
    ```{.python data-code-chunk"{id: haha}"}
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
        outputString += "```{.r data-code-chunk=\"" + dataCodeChunk + "\"}\n";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9wYW5kb2MtY29udmVydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0osV0FBWSxPQUFBLENBQVEsZUFBUjs7RUFDYixNQUFBLEdBQVMsT0FBQSxDQUFRLGFBQVI7O0VBQ1IsWUFBYSxPQUFBLENBQVEsTUFBUjs7RUFDZCxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsR0FBQSxHQUFNLE9BQUEsQ0FBUSw0QkFBUjs7RUFDTixZQUFBLEdBQWUsT0FBQSxDQUFRLGNBQVI7O0VBQ2QsY0FBZSxPQUFBLENBQVEsb0RBQVI7O0VBQ2hCLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSOztFQUNoQixVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBRWIsZ0JBQUEsR0FBbUIsU0FBQyxZQUFEO0lBQ2pCLElBQUcsWUFBQSxLQUFnQixjQUFoQixJQUFrQyxZQUFBLEtBQWdCLHFCQUFyRDthQUNFLE1BREY7S0FBQSxNQUVLLElBQUcsWUFBQSxLQUFnQixlQUFuQjthQUNILE9BREc7S0FBQSxNQUVBLElBQUcsWUFBQSxLQUFnQixjQUFuQjthQUNILE1BREc7S0FBQSxNQUVBLElBQUcsWUFBQSxLQUFnQixpQkFBbkI7YUFDSCxJQURHO0tBQUEsTUFBQTtNQUdILElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsdUJBQTVCLEVBQXFEO1FBQUEsTUFBQSxFQUFRLFlBQVI7T0FBckQ7YUFDQSxLQUpHOztFQVBZOztFQWNuQixtQkFBQSxHQUFzQixTQUFDLE1BQUQsRUFBUyxJQUFUO0FBQ3BCLFFBQUE7SUFBQSxJQUFHLE1BQU8sQ0FBQSxLQUFBLENBQVY7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LENBQUMsSUFBbkIsQ0FBd0IsU0FBQyxJQUFEO0FBQ3RCLFlBQUE7UUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQjtRQUNiLE9BQUEsR0FBVSxRQUFBLENBQVMsVUFBVCxFQUFxQixJQUFyQixFQUEyQixTQUFDLEdBQUQ7VUFDbkMsSUFBRyxZQUFIO1lBRUUsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsU0FBQyxDQUFEO3FCQUNqQixFQUFFLENBQUMsTUFBSCxDQUFVLENBQVY7WUFEaUIsQ0FBbkIsRUFGRjs7VUFLQSxPQUFPLENBQUMsS0FBUixDQUFjLEdBQWQ7VUFDQSxJQUF3QyxRQUF4QztBQUFBLG1CQUFPLFFBQUEsQ0FBUyxHQUFULEVBQWMsY0FBZCxFQUFQOztRQVBtQyxDQUEzQjtlQVFWLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBZCxDQUFrQixJQUFsQjtNQVZzQixDQUF4QjtJQU5vRyxDQUF0RztFQXRFYzs7RUF3RmhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQ2YsZUFBQSxhQURlO0lBRWYsY0FBQSxZQUZlOztBQWhVakIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG57ZXhlY0ZpbGV9ID0gcmVxdWlyZSAnY2hpbGRfcHJvY2Vzcydcbm1hdHRlciA9IHJlcXVpcmUgJ2dyYXktbWF0dGVyJ1xue0RpcmVjdG9yeX0gPSByZXF1aXJlICdhdG9tJ1xuYXN5bmMgPSByZXF1aXJlICdhc3luYydcblZpeiA9IHJlcXVpcmUgJy4uL2RlcGVuZGVuY2llcy92aXovdml6LmpzJ1xuY29kZUNodW5rQVBJID0gcmVxdWlyZSAnLi9jb2RlLWNodW5rJ1xue3N2Z0FzUG5nVXJpfSA9IHJlcXVpcmUgJy4uL2RlcGVuZGVuY2llcy9zYXZlLXN2Zy1hcy1wbmcvc2F2ZS1zdmctYXMtcG5nLmpzJ1xucHJvY2Vzc0dyYXBocyA9IHJlcXVpcmUgJy4vcHJvY2Vzcy1ncmFwaHMnXG5maWxlSW1wb3J0ID0gcmVxdWlyZSAnLi9maWxlLWltcG9ydCdcblxuZ2V0RmlsZUV4dGVuc2lvbiA9IChkb2N1bWVudFR5cGUpLT5cbiAgaWYgZG9jdW1lbnRUeXBlID09ICdwZGZfZG9jdW1lbnQnIG9yIGRvY3VtZW50VHlwZSA9PSAnYmVhbWVyX3ByZXNlbnRhdGlvbidcbiAgICAncGRmJ1xuICBlbHNlIGlmIGRvY3VtZW50VHlwZSA9PSAnd29yZF9kb2N1bWVudCdcbiAgICAnZG9jeCdcbiAgZWxzZSBpZiBkb2N1bWVudFR5cGUgPT0gJ3J0Zl9kb2N1bWVudCdcbiAgICAncnRmJ1xuICBlbHNlIGlmIGRvY3VtZW50VHlwZSA9PSAnY3VzdG9tX2RvY3VtZW50J1xuICAgICcqJ1xuICBlbHNlXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdJbnZhbGlkIG91dHB1dCBmb3JtYXQnLCBkZXRhaWw6IGRvY3VtZW50VHlwZSlcbiAgICBudWxsXG5cbiMgZWc6IHByb2Nlc3MgY29uZmlnIGluc2lkZSBwZGZfZG9jdW1lbnQgYmxvY2tcbnByb2Nlc3NPdXRwdXRDb25maWcgPSAoY29uZmlnLCBhcmdzKS0+XG4gIGlmIGNvbmZpZ1sndG9jJ11cbiAgICBhcmdzLnB1c2ggJy0tdG9jJ1xuICBpZiBjb25maWdbJ3RvY19kZXB0aCddXG4gICAgYXJncy5wdXNoKCctLXRvYy1kZXB0aD0nK2NvbmZpZ1sndG9jX2RlcHRoJ10pXG5cbiAgaWYgY29uZmlnWydoaWdobGlnaHQnXVxuICAgIGlmIGNvbmZpZ1snaGlnaGxpZ2h0J10gPT0gJ2RlZmF1bHQnXG4gICAgICBjb25maWdbJ2hpZ2hsaWdodCddID0gJ3B5Z21lbnRzJ1xuICAgIGFyZ3MucHVzaCgnLS1oaWdobGlnaHQtc3R5bGU9Jytjb25maWdbJ2hpZ2hsaWdodCddKVxuICBpZiBjb25maWdbJ2hpZ2hsaWdodCddID09IG51bGxcbiAgICBhcmdzLnB1c2goJy0tbm8taGlnaGxpZ2h0JylcblxuICBpZiBjb25maWdbJ3BhbmRvY19hcmdzJ11cbiAgICBmb3IgYXJnIGluIGNvbmZpZ1sncGFuZG9jX2FyZ3MnXVxuICAgICAgYXJncy5wdXNoKGFyZylcblxuICBpZiBjb25maWdbJ2NpdGF0aW9uX3BhY2thZ2UnXVxuICAgIGlmIGNvbmZpZ1snY2l0YXRpb25fcGFja2FnZSddID09ICduYXRiaWInXG4gICAgICBhcmdzLnB1c2goJy0tbmF0YmliJylcbiAgICBlbHNlIGlmIGNvbmZpZ1snY2l0YXRpb25fcGFja2FnZSddID09ICdiaWJsYXRleCdcbiAgICAgIGFyZ3MucHVzaCgnLS1iaWJsYXRleCcpXG5cbiAgaWYgY29uZmlnWydudW1iZXJfc2VjdGlvbnMnXVxuICAgIGFyZ3MucHVzaCgnLS1udW1iZXItc2VjdGlvbnMnKVxuXG4gIGlmIGNvbmZpZ1snaW5jcmVtZW50YWwnXVxuICAgIGFyZ3MucHVzaCgnLS1pbmNyZW1lbnRhbCcpXG5cbiAgaWYgY29uZmlnWydzbGlkZV9sZXZlbCddXG4gICAgYXJncy5wdXNoKCctLXNsaWRlLWxldmVsPScrY29uZmlnWydzbGlkZV9sZXZlbCddKVxuXG4gIGlmIGNvbmZpZ1sndGhlbWUnXVxuICAgIGFyZ3MucHVzaCgnLVYnLCAndGhlbWU6Jytjb25maWdbJ3RoZW1lJ10pXG5cbiAgaWYgY29uZmlnWydjb2xvcnRoZW1lJ11cbiAgICBhcmdzLnB1c2goJy1WJywgJ2NvbG9ydGhlbWU6Jytjb25maWdbJ2NvbG9ydGhlbWUnXSlcblxuICBpZiBjb25maWdbJ2ZvbnR0aGVtZSddXG4gICAgYXJncy5wdXNoKCctVicsICdmb250dGhlbWU6Jytjb25maWdbJ2ZvbnR0aGVtZSddKVxuXG4gIGlmIGNvbmZpZ1snbGF0ZXhfZW5naW5lJ11cbiAgICBhcmdzLnB1c2goJy0tbGF0ZXgtZW5naW5lPScrY29uZmlnWydsYXRleF9lbmdpbmUnXSlcblxuICBpZiBjb25maWdbJ2luY2x1ZGVzJ10gYW5kIHR5cGVvZihjb25maWdbJ2luY2x1ZGVzJ10pID09ICdvYmplY3QnXG4gICAgaW5jbHVkZXNDb25maWcgPSBjb25maWdbJ2luY2x1ZGVzJ11cbiAgICBoZWxwZXIgPSAocHJlZml4LCBkYXRhKS0+XG4gICAgICBpZiB0eXBlb2YoZGF0YSkgPT0gJ3N0cmluZydcbiAgICAgICAgYXJncy5wdXNoIHByZWZpeCtkYXRhXG4gICAgICBlbHNlIGlmIGRhdGEuY29uc3RydWN0b3IgPT0gQXJyYXlcbiAgICAgICAgZGF0YS5mb3JFYWNoIChkKS0+XG4gICAgICAgICAgYXJncy5wdXNoIHByZWZpeCtkXG4gICAgICBlbHNlXG4gICAgICAgIGFyZ3MucHVzaCBwcmVmaXgrZGF0YVxuXG4gICAgIyBUT0RPOiBpbmNsdWRlc0NvbmZpZ1snaW5faGVhZGVyJ10gaXMgYXJyYXlcbiAgICBpZiBpbmNsdWRlc0NvbmZpZ1snaW5faGVhZGVyJ11cbiAgICAgIGhlbHBlcignLS1pbmNsdWRlLWluLWhlYWRlcj0nLCBpbmNsdWRlc0NvbmZpZ1snaW5faGVhZGVyJ10pXG4gICAgaWYgaW5jbHVkZXNDb25maWdbJ2JlZm9yZV9ib2R5J11cbiAgICAgIGhlbHBlcignLS1pbmNsdWRlLWJlZm9yZS1ib2R5PScsIGluY2x1ZGVzQ29uZmlnWydiZWZvcmVfYm9keSddKVxuICAgIGlmIGluY2x1ZGVzQ29uZmlnWydhZnRlcl9ib2R5J11cbiAgICAgIGhlbHBlcignLS1pbmNsdWRlLWFmdGVyLWJvZHk9JywgaW5jbHVkZXNDb25maWdbJ2FmdGVyX2JvZHknXSlcblxuICBpZiBjb25maWdbJ3RlbXBsYXRlJ11cbiAgICBhcmdzLnB1c2goJy0tdGVtcGxhdGU9JyArIGNvbmZpZ1sndGVtcGxhdGUnXSlcblxubG9hZE91dHB1dFlBTUwgPSAoZmlsZURpcmVjdG9yeVBhdGgsIGNvbmZpZyktPlxuICB5YW1sUGF0aCA9IHBhdGgucmVzb2x2ZShmaWxlRGlyZWN0b3J5UGF0aCwgJ19vdXRwdXQueWFtbCcpXG4gIHRyeVxuICAgIHlhbWwgPSBmcy5yZWFkRmlsZVN5bmMgeWFtbFBhdGhcbiAgY2F0Y2ggZXJyb3JcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnKVxuXG4gIGRhdGEgPSBtYXR0ZXIoJy0tLVxcbicreWFtbCsnLS0tXFxuJykuZGF0YVxuICBkYXRhID0gZGF0YSB8fCB7fVxuXG4gIGlmIGNvbmZpZ1snb3V0cHV0J11cbiAgICBpZiB0eXBlb2YoY29uZmlnWydvdXRwdXQnXSkgPT0gJ3N0cmluZycgYW5kIGRhdGFbY29uZmlnWydvdXRwdXQnXV1cbiAgICAgIGZvcm1hdCA9IGNvbmZpZ1snb3V0cHV0J11cbiAgICAgIGNvbmZpZ1snb3V0cHV0J10gPSB7fVxuICAgICAgY29uZmlnWydvdXRwdXQnXVtmb3JtYXRdID0gZGF0YVtmb3JtYXRdXG4gICAgZWxzZVxuICAgICAgZm9ybWF0ID0gT2JqZWN0LmtleXMoY29uZmlnWydvdXRwdXQnXSlbMF1cbiAgICAgIGlmIGRhdGFbZm9ybWF0XVxuICAgICAgICBjb25maWdbJ291dHB1dCddW2Zvcm1hdF0gPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW2Zvcm1hdF0sIGNvbmZpZ1snb3V0cHV0J11bZm9ybWF0XSlcblxuICBPYmplY3QuYXNzaWduKHt9LCBkYXRhLCBjb25maWcpXG5cbnByb2Nlc3NDb25maWdQYXRocyA9IChjb25maWcsIGZpbGVEaXJlY3RvcnlQYXRoLCBwcm9qZWN0RGlyZWN0b3J5UGF0aCktPlxuICAjIHNhbWUgYXMgdGhlIG9uZSBpbiBwcm9jZXNzUGF0aHMgZnVuY3Rpb25cbiAgIyBUT0RPOiByZWZhY3RvciBpbiB0aGUgZnV0dXJlXG4gIHJlc29sdmVQYXRoID0gKHNyYyktPlxuICAgIGlmIHNyYy5zdGFydHNXaXRoKCcvJylcbiAgICAgIHJldHVybiBwYXRoLnJlbGF0aXZlKGZpbGVEaXJlY3RvcnlQYXRoLCBwYXRoLnJlc29sdmUocHJvamVjdERpcmVjdG9yeVBhdGgsICcuJytzcmMpKVxuICAgIGVsc2UgIyAuL3Rlc3QucG5nIG9yIHRlc3QucG5nXG4gICAgICByZXR1cm4gc3JjXG5cbiAgaGVscGVyID0gKGRhdGEpLT5cbiAgICBpZiB0eXBlb2YoZGF0YSkgPT0gJ3N0cmluZydcbiAgICAgIHJldHVybiByZXNvbHZlUGF0aChkYXRhKVxuICAgIGVsc2UgaWYgZGF0YS5jb25zdHJ1Y3RvciA9PSBBcnJheVxuICAgICAgcmV0dXJuIGRhdGEubWFwIChkKS0+cmVzb2x2ZVBhdGgoZClcbiAgICBlbHNlXG4gICAgICBkYXRhXG5cbiAgaWYgY29uZmlnWydiaWJsaW9ncmFwaHknXVxuICAgIGNvbmZpZ1snYmlibGlvZ3JhcGh5J10gPSBoZWxwZXIoY29uZmlnWydiaWJsaW9ncmFwaHknXSlcblxuICBpZiBjb25maWdbJ2NzbCddXG4gICAgY29uZmlnWydjc2wnXSA9IGhlbHBlcihjb25maWdbJ2NzbCddKVxuXG4gIGlmIGNvbmZpZ1snb3V0cHV0J10gYW5kIHR5cGVvZihjb25maWdbJ291dHB1dCddKSA9PSAnb2JqZWN0J1xuICAgIGRvY3VtZW50Rm9ybWF0ID0gT2JqZWN0LmtleXMoY29uZmlnWydvdXRwdXQnXSlbMF1cbiAgICBvdXRwdXRDb25maWcgPSBjb25maWdbJ291dHB1dCddW2RvY3VtZW50Rm9ybWF0XVxuICAgIGlmIG91dHB1dENvbmZpZ1snaW5jbHVkZXMnXVxuICAgICAgaWYgb3V0cHV0Q29uZmlnWydpbmNsdWRlcyddWydpbl9oZWFkZXInXVxuICAgICAgICBvdXRwdXRDb25maWdbJ2luY2x1ZGVzJ11bJ2luX2hlYWRlciddID0gaGVscGVyKG91dHB1dENvbmZpZ1snaW5jbHVkZXMnXVsnaW5faGVhZGVyJ10pXG4gICAgICBpZiBvdXRwdXRDb25maWdbJ2luY2x1ZGVzJ11bJ2JlZm9yZV9ib2R5J11cbiAgICAgICAgb3V0cHV0Q29uZmlnWydpbmNsdWRlcyddWydiZWZvcmVfYm9keSddID0gaGVscGVyKG91dHB1dENvbmZpZ1snaW5jbHVkZXMnXVsnYmVmb3JlX2JvZHknXSlcbiAgICAgIGlmIG91dHB1dENvbmZpZ1snaW5jbHVkZXMnXVsnYWZ0ZXJfYm9keSddXG4gICAgICAgIG91dHB1dENvbmZpZ1snaW5jbHVkZXMnXVsnYWZ0ZXJfYm9keSddID0gaGVscGVyKG91dHB1dENvbmZpZ1snaW5jbHVkZXMnXVsnYWZ0ZXJfYm9keSddKVxuXG4gICAgaWYgb3V0cHV0Q29uZmlnWydyZWZlcmVuY2VfZG9jeCddXG4gICAgICBvdXRwdXRDb25maWdbJ3JlZmVyZW5jZV9kb2N4J10gPSBoZWxwZXIob3V0cHV0Q29uZmlnWydyZWZlcmVuY2VfZG9jeCddKVxuXG4gICAgaWYgb3V0cHV0Q29uZmlnWyd0ZW1wbGF0ZSddXG4gICAgICBvdXRwdXRDb25maWdbJ3RlbXBsYXRlJ10gPSBoZWxwZXIob3V0cHV0Q29uZmlnWyd0ZW1wbGF0ZSddKVxuXG5wcm9jZXNzUGF0aHMgPSAodGV4dCwgZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRoKS0+XG4gIG1hdGNoID0gbnVsbFxuICBvZmZzZXQgPSAwXG4gIG91dHB1dCA9ICcnXG5cbiAgcmVzb2x2ZVBhdGggPSAoc3JjKS0+XG4gICAgaWYgc3JjLnN0YXJ0c1dpdGgoJy8nKVxuICAgICAgcmV0dXJuIHBhdGgucmVsYXRpdmUoZmlsZURpcmVjdG9yeVBhdGgsIHBhdGgucmVzb2x2ZShwcm9qZWN0RGlyZWN0b3J5UGF0aCwgJy4nK3NyYykpXG4gICAgZWxzZSAjIC4vdGVzdC5wbmcgb3IgdGVzdC5wbmdcbiAgICAgIHJldHVybiBzcmNcblxuICAjIHJlcGxhY2UgcGF0aCBpbiAhW10oLi4uKSBhbmQgW10oKVxuICByID0gLyhcXCE/XFxbLio/XVxcKCkoW15cXCl8Xid8XlwiXSopKC4qP1xcKSkvZ2lcbiAgdGV4dCA9IHRleHQucmVwbGFjZSByLCAod2hvbGUsIGEsIGIsIGMpLT5cbiAgICBpZiBiWzBdID09ICc8J1xuICAgICAgYiA9IGIuc2xpY2UoMSwgYi5sZW5ndGgtMSlcbiAgICAgIGEgKyAnPCcgKyByZXNvbHZlUGF0aChiLnRyaW0oKSkgKyAnPiAnICsgY1xuICAgIGVsc2VcbiAgICAgIGEgKyByZXNvbHZlUGF0aChiLnRyaW0oKSkgKyAnICcgKyBjXG5cbiAgIyByZXBsYWNlIHBhdGggaW4gdGFnXG4gIHIgPSAvKDxbaW1nfGF8aWZyYW1lXS4qP1tzcmN8aHJlZl09WydcIl0pKC4rPykoWydcIl0uKj8+KS9naVxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlIHIsICh3aG9sZSwgYSwgYiwgYyktPlxuICAgIGEgKyByZXNvbHZlUGF0aChiKSArIGNcblxuICB0ZXh0XG5cbiMgY2FsbGJhY2soZXJyb3IsIGh0bWwpXG5wYW5kb2NSZW5kZXIgPSAodGV4dD0nJywge2FyZ3MsIHByb2plY3REaXJlY3RvcnlQYXRoLCBmaWxlRGlyZWN0b3J5UGF0aH0sIGNhbGxiYWNrKS0+XG4gIGFyZ3MgPSBhcmdzIG9yIFtdXG4gIGFyZ3MgPSBbJy10JywgJ2h0bWwnXS5jb25jYXQoYXJncykuZmlsdGVyKChhcmcpLT5hcmcubGVuZ3RoKVxuXG4gICMjI1xuICBjb252ZXJ0IGNvZGUgY2h1bmtcbiAgYGBge3B5dGhvbiBpZDpcImhhaGFcIn1cbiAgdG9cbiAgYGBgey5weXRob24gZGF0YS1jb2RlLWNodW5rXCJ7aWQ6IGhhaGF9XCJ9XG4gICMjI1xuXG4gIG91dHB1dFN0cmluZyA9IFwiXCJcbiAgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICBpID0gMFxuICB3aGlsZSBpIDwgbGluZXMubGVuZ3RoXG4gICAgbGluZSA9IGxpbmVzW2ldXG5cbiAgICBjb2RlQ2h1bmtNYXRjaCA9IGxpbmUubWF0Y2ggL15cXGBcXGBcXGBcXHsoXFx3KylcXHMqKC4qKVxcfVxccyovXG4gICAgaWYgY29kZUNodW5rTWF0Y2ggIyBjb2RlIGNodW5rXG4gICAgICBsYW5nID0gY29kZUNodW5rTWF0Y2hbMV0udHJpbSgpXG4gICAgICBkYXRhQXJncyA9IGNvZGVDaHVua01hdGNoWzJdLnRyaW0oKS5yZXBsYWNlKC8oJ3xcIikvZywgJ1xcXFwkMScpICMgZXNjYXBlXG4gICAgICBkYXRhQ29kZUNodW5rID0gXCJ7I3tsYW5nfSAje2RhdGFBcmdzfX1cIlxuXG4gICAgICBvdXRwdXRTdHJpbmcgKz0gXCJgYGB7LnIgZGF0YS1jb2RlLWNodW5rPVxcXCIje2RhdGFDb2RlQ2h1bmt9XFxcIn1cXG5cIlxuICAgICAgaSArPSAxXG4gICAgICBjb250aW51ZVxuXG4gICAgb3V0cHV0U3RyaW5nICs9IGxpbmUgKyAnXFxuJ1xuICAgIGkgKz0gMVxuXG4gICMgY29uc29sZS5sb2cob3V0cHV0U3RyaW5nKVxuXG4gICMgY2hhbmdlIHdvcmtpbmcgZGlyZWN0b3J5XG4gIGN3ZCA9IHByb2Nlc3MuY3dkKClcbiAgcHJvY2Vzcy5jaGRpcihmaWxlRGlyZWN0b3J5UGF0aClcblxuICBwYW5kb2NQYXRoID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBhbmRvY1BhdGgnKVxuICBwcm9ncmFtID0gZXhlY0ZpbGUgcGFuZG9jUGF0aCwgYXJncywgKGVycm9yLCBzdGRvdXQsIHN0ZGVyciktPlxuICAgIHByb2Nlc3MuY2hkaXIoY3dkKVxuICAgIHJldHVybiBjYWxsYmFjayhlcnJvciBvciBzdGRlcnIsIHN0ZG91dClcbiAgcHJvZ3JhbS5zdGRpbi5lbmQob3V0cHV0U3RyaW5nKVxuXG4jIyNcbkBwYXJhbSB7U3RyaW5nfSB0ZXh0OiBtYXJrZG93biBzdHJpbmdcbkBwYXJhbSB7T2JqZWN0fSBhbGwgcHJvcGVydGllcyBhcmUgcmVxdWlyZWQhXG4gIEBwYXJhbSB7U3RyaW5nfSBmaWxlRGlyZWN0b3J5UGF0aFxuICBAcGFyYW0ge1N0cmluZ30gcHJvamVjdERpcmVjdG9yeVBhdGhcbiAgQHBhcmFtIHtTdHJpbmd9IHNvdXJjZUZpbGVQYXRoXG5jYWxsYmFjayhlcnIsIG91dHB1dEZpbGVQYXRoKVxuIyMjXG5wYW5kb2NDb252ZXJ0ID0gKHRleHQsIHtmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGgsIHNvdXJjZUZpbGVQYXRoLCBkZWxldGVJbWFnZXN9LCBjb25maWc9e30sIGNhbGxiYWNrPW51bGwpLT5cbiAgZGVsZXRlSW1hZ2VzID0gZGVsZXRlSW1hZ2VzIG9yIHRydWVcbiAgY29uZmlnID0gbG9hZE91dHB1dFlBTUwgZmlsZURpcmVjdG9yeVBhdGgsIGNvbmZpZ1xuICBhcmdzID0gW11cblxuICBleHRlbnNpb24gPSBudWxsXG4gIG91dHB1dENvbmZpZyA9IG51bGxcbiAgZG9jdW1lbnRGb3JtYXQgPSBudWxsXG4gIGlmIGNvbmZpZ1snb3V0cHV0J11cbiAgICBpZiB0eXBlb2YoY29uZmlnWydvdXRwdXQnXSkgPT0gJ3N0cmluZydcbiAgICAgIGRvY3VtZW50Rm9ybWF0ID0gY29uZmlnWydvdXRwdXQnXVxuICAgICAgZXh0ZW5zaW9uID0gZ2V0RmlsZUV4dGVuc2lvbihkb2N1bWVudEZvcm1hdClcbiAgICBlbHNlXG4gICAgICBkb2N1bWVudEZvcm1hdCA9IE9iamVjdC5rZXlzKGNvbmZpZ1snb3V0cHV0J10pWzBdXG4gICAgICBleHRlbnNpb24gPSBnZXRGaWxlRXh0ZW5zaW9uKGRvY3VtZW50Rm9ybWF0KVxuICAgICAgb3V0cHV0Q29uZmlnID0gY29uZmlnWydvdXRwdXQnXVtkb2N1bWVudEZvcm1hdF1cbiAgZWxzZVxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignT3V0cHV0IGZvcm1hdCBuZWVkcyB0byBiZSBzcGVjaWZpZWQnKVxuICByZXR1cm4gaWYgbm90IGV4dGVuc2lvblxuXG4gICMgY3VzdG9tX2RvY3VtZW50IHJlcXVpcmVzIHBhdGggdG8gYmUgZGVmaW5lZFxuICBpZiBkb2N1bWVudEZvcm1hdCA9PSAnY3VzdG9tX2RvY3VtZW50JyBhbmQgKCFvdXRwdXRDb25maWcgfHwgIW91dHB1dENvbmZpZ1sncGF0aCddKVxuICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ2N1c3RvbV9kb2N1bWVudCByZXF1aXJlcyBwYXRoIHRvIGJlIGRlZmluZWQnKVxuXG4gIGlmIGRvY3VtZW50Rm9ybWF0ID09ICdiZWFtZXJfcHJlc2VudGF0aW9uJ1xuICAgIGFyZ3MucHVzaCgnLXQnLCAnYmVhbWVyJylcblxuICAjIGRlc3RcbiAgaWYgb3V0cHV0Q29uZmlnIGFuZCBvdXRwdXRDb25maWdbJ3BhdGgnXVxuICAgIG91dHB1dEZpbGVQYXRoID0gb3V0cHV0Q29uZmlnWydwYXRoJ11cbiAgICBpZiBvdXRwdXRGaWxlUGF0aC5zdGFydHNXaXRoKCcvJylcbiAgICAgIG91dHB1dEZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKHByb2plY3REaXJlY3RvcnlQYXRoLCAnLicrb3V0cHV0RmlsZVBhdGgpXG4gICAgZWxzZVxuICAgICAgb3V0cHV0RmlsZVBhdGggPSBwYXRoLnJlc29sdmUoZmlsZURpcmVjdG9yeVBhdGgsIG91dHB1dEZpbGVQYXRoKVxuXG4gICAgaWYgZG9jdW1lbnRGb3JtYXQgIT0gJ2N1c3RvbV9kb2N1bWVudCcgYW5kIHBhdGguZXh0bmFtZShvdXRwdXRGaWxlUGF0aCkgIT0gJy4nICsgZXh0ZW5zaW9uXG4gICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdJbnZhbGlkIGV4dGVuc2lvbiBmb3IgJyArIGRvY3VtZW50Rm9ybWF0LCBkZXRhaWw6ICdyZXF1aXJlZCAuJyArIGV4dGVuc2lvbiArICcsIGJ1dCAnICsgcGF0aC5leHRuYW1lKG91dHB1dEZpbGVQYXRoKSArICcgd2FzIHByb3ZpZGVkLicpXG5cbiAgICBhcmdzLnB1c2ggJy1vJywgb3V0cHV0RmlsZVBhdGhcbiAgZWxzZVxuICAgIG91dHB1dEZpbGVQYXRoID0gc291cmNlRmlsZVBhdGhcbiAgICBvdXRwdXRGaWxlUGF0aCA9IG91dHB1dEZpbGVQYXRoLnNsaWNlKDAsIG91dHB1dEZpbGVQYXRoLmxlbmd0aCAtIHBhdGguZXh0bmFtZShvdXRwdXRGaWxlUGF0aCkubGVuZ3RoKSArICcuJyArIGV4dGVuc2lvblxuICAgIGFyZ3MucHVzaCAnLW8nLCBvdXRwdXRGaWxlUGF0aFxuXG4gICMgcmVzb2x2ZSBwYXRocyBpbiBmcm9udC1tYXR0ZXIoeWFtbClcbiAgcHJvY2Vzc0NvbmZpZ1BhdGhzIGNvbmZpZywgZmlsZURpcmVjdG9yeVBhdGgsIHByb2plY3REaXJlY3RvcnlQYXRoXG5cbiAgaWYgb3V0cHV0Q29uZmlnXG4gICAgcHJvY2Vzc091dHB1dENvbmZpZyBvdXRwdXRDb25maWcsIGFyZ3NcblxuICAjIGFkZCBmcm9udC1tYXR0ZXIoeWFtbCkgdG8gdGV4dFxuICB0ZXh0ID0gbWF0dGVyLnN0cmluZ2lmeSh0ZXh0LCBjb25maWcpXG5cbiAgIyBpbXBvcnQgZXh0ZXJuYWwgZmlsZXNcbiAgdGV4dCA9IGZpbGVJbXBvcnQodGV4dCwge2ZpbGVEaXJlY3RvcnlQYXRoLCBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgdXNlQWJzb2x1dGVJbWFnZVBhdGg6IGZhbHNlfSkub3V0cHV0U3RyaW5nXG5cbiAgIyBjaGFuZ2UgbGluayBwYXRoIHRvIHJlbGF0aXZlIHBhdGhcbiAgdGV4dCA9IHByb2Nlc3NQYXRocyB0ZXh0LCBmaWxlRGlyZWN0b3J5UGF0aCwgcHJvamVjdERpcmVjdG9yeVBhdGhcblxuICAjIGNoYW5nZSB3b3JraW5nIGRpcmVjdG9yeVxuICBjd2QgPSBwcm9jZXNzLmN3ZCgpXG4gIHByb2Nlc3MuY2hkaXIoZmlsZURpcmVjdG9yeVBhdGgpXG5cbiAgIyBjaXRhdGlvblxuICBpZiBjb25maWdbJ2JpYmxpb2dyYXBoeSddIG9yIGNvbmZpZ1sncmVmZXJlbmNlcyddXG4gICAgYXJncy5wdXNoKCctLWZpbHRlcicsICdwYW5kb2MtY2l0ZXByb2MnKVxuXG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdZb3VyIGRvY3VtZW50IGlzIGJlaW5nIHByZXBhcmVkJywgZGV0YWlsOiAnOiknKVxuXG4gICMgbWVybWFpZCAvIHZpeiAvIHdhdmVkcm9tIGdyYXBoXG4gIHByb2Nlc3NHcmFwaHMgdGV4dCwge2ZpbGVEaXJlY3RvcnlQYXRoLCBwcm9qZWN0RGlyZWN0b3J5UGF0aCwgaW1hZ2VEaXJlY3RvcnlQYXRoOiBmaWxlRGlyZWN0b3J5UGF0aH0sICh0ZXh0LCBpbWFnZVBhdGhzPVtdKS0+XG4gICAgIyBjb25zb2xlLmxvZyBhcmdzLmpvaW4oJyAnKVxuICAgICNcbiAgICAjIHBhbmRvYyB3aWxsIGNhdXNlIGVycm9yIGlmIGRpcmVjdG9yeSBkb2Vzbid0IGV4aXN0LFxuICAgICMgdGhlcmVmb3JlIEkgd2lsbCBjcmVhdGUgZGlyZWN0b3J5IGZpcnN0LlxuICAgIGRpcmVjdG9yeSA9IG5ldyBEaXJlY3RvcnkocGF0aC5kaXJuYW1lKG91dHB1dEZpbGVQYXRoKSlcbiAgICBkaXJlY3RvcnkuY3JlYXRlKCkudGhlbiAoZmxhZyktPlxuICAgICAgcGFuZG9jUGF0aCA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wYW5kb2NQYXRoJylcbiAgICAgIHByb2dyYW0gPSBleGVjRmlsZSBwYW5kb2NQYXRoLCBhcmdzLCAoZXJyKS0+XG4gICAgICAgIGlmIGRlbGV0ZUltYWdlc1xuICAgICAgICAgICMgcmVtb3ZlIGltYWdlc1xuICAgICAgICAgIGltYWdlUGF0aHMuZm9yRWFjaCAocCktPlxuICAgICAgICAgICAgZnMudW5saW5rKHApXG5cbiAgICAgICAgcHJvY2Vzcy5jaGRpcihjd2QpICMgY2hhbmdlIGN3ZCBiYWNrXG4gICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIsIG91dHB1dEZpbGVQYXRoKSBpZiBjYWxsYmFja1xuICAgICAgcHJvZ3JhbS5zdGRpbi5lbmQodGV4dClcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHBhbmRvY0NvbnZlcnQsXG4gIHBhbmRvY1JlbmRlclxufSJdfQ==
