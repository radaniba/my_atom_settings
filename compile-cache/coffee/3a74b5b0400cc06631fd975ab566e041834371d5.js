(function() {
  var REQUIRE_CACHE, allowUnsafeEval, allowUnsafeNewFunction, async, clearCache, codeChunkAPI, fs, path, ref, request, run, spawn;

  path = require('path');

  fs = require('fs');

  spawn = require('child_process').spawn;

  ref = require('loophole'), allowUnsafeEval = ref.allowUnsafeEval, allowUnsafeNewFunction = ref.allowUnsafeNewFunction;

  request = require('request');

  async = require('async');

  REQUIRE_CACHE = {};

  run = function(content, fileDirectoryPath, cmd, options, callback) {
    var args, asyncFunctions, helper, i, len, requirePath, requires, savePath;
    if (fileDirectoryPath == null) {
      fileDirectoryPath = '';
    }
    if (options == null) {
      options = {};
    }
    args = options.args || [];
    if (typeof args === 'string') {
      args = [args];
    }
    savePath = path.resolve(fileDirectoryPath, Math.random().toString(36).substr(2, 9) + '_code_chunk');
    content = content.replace(/\u00A0/g, ' ');
    if (cmd.match(/(javascript|js)/)) {
      asyncFunctions = [];
      if (options.require) {
        requires = options.require;
        if (typeof requires === 'string') {
          requires = [requires];
        }
        for (i = 0, len = requires.length; i < len; i++) {
          requirePath = requires[i];
          requirePath = requirePath.trim();
          helper = function(requirePath) {
            if (requirePath.match(/^(http|https)\:\/\//)) {
              return asyncFunctions.push(function(cb) {
                return request(requirePath, function(error, response, body) {
                  if (error) {
                    return cb(error);
                  }
                  return cb(null, {
                    file: requirePath,
                    data: body.toString()
                  });
                });
              });
            } else {
              requirePath = path.resolve(fileDirectoryPath, requirePath);
              return asyncFunctions.push(function(cb) {
                return fs.readFile(requirePath, {
                  encoding: 'utf-8'
                }, function(error, data) {
                  if (error) {
                    return cb(error);
                  }
                  return cb(null, {
                    file: requirePath,
                    data: data.toString()
                  });
                });
              });
            }
          };
          helper(requirePath);
        }
      }
      return async.series(asyncFunctions, function(error, results) {
        var j, len1, result;
        if (error) {
          return callback(null, error.toString(), options);
        }
        for (j = 0, len1 = results.length; j < len1; j++) {
          result = results[j];
          if (REQUIRE_CACHE[result.file]) {
            continue;
          }
          try {
            allowUnsafeNewFunction(function() {
              return allowUnsafeEval(function() {

                /*
                if result.file.endsWith('.css') and document
                  head = document.getElementsByTagName('head')[0]
                  link = document.createElement 'link'
                  link.setAttribute 'rel', 'stylesheet'
                  link.setAttribute 'type', 'text/css'
                  link.setAttribute 'href', result.file
                  link.id = 'mpe_' + result.file
                  head.appendChild link
                else
                 */
                eval(result.data);
                return REQUIRE_CACHE[result.file] = true;
              });
            });
          } catch (error1) {
            error = error1;
            return callback(null, error.toString(), options);
          }
        }
        return allowUnsafeNewFunction(function() {
          return allowUnsafeEval(function() {
            var e;
            try {
              return typeof callback === "function" ? callback(null, eval(content), options) : void 0;
            } catch (error1) {
              e = error1;
              return typeof callback === "function" ? callback(null, e.toString(), options) : void 0;
            }
          });
        });
      });
    }
    if (cmd.match(/python/) && (options.matplotlib || options.mpl)) {
      content = "# -*- coding: utf-8 -*-\n# modify default matplotlib pyplot show function\ntry:\n    import matplotlib\n    matplotlib.use('Agg') # use Agg backend\n    import matplotlib.pyplot as plt\n    import sys\n    def new_plt_show():\n        plt.savefig(sys.stdout, format=\"svg\")\n    plt.show = new_plt_show # override old one\nexcept Exception:\n    pass\n\n# modify default mpld3 behavior\ntry:\n    import matplotlib.pyplot as plt, mpld3\n    import sys\n    def new_mpld3_show():\n        fig = plt.gcf() # get current figure\n        sys.stdout.write(mpld3.fig_to_html(fig))\n    mpld3.show = new_mpld3_show # override old one\n    mpld3.display = new_mpld3_show\nexcept Exception:\n    pass\n" + content;
      options.output = 'html';
    }
    return fs.writeFile(savePath, content, function(err) {
      var chunks, findInputFileMacro, task;
      if (err) {
        if (typeof callback === "function") {
          callback(true);
        }
        return;
      }
      findInputFileMacro = false;
      args = args.map(function(arg) {
        if (arg === '{input_file}') {
          findInputFileMacro = true;
          return savePath;
        } else {
          return arg;
        }
      });
      if (!findInputFileMacro && !options.stdin) {
        args.push(savePath);
      }
      task = spawn(cmd, args, {
        cwd: fileDirectoryPath
      });
      if (options.stdin) {
        task.stdin.write(content);
      }
      task.stdin.end();
      chunks = [];
      task.stdout.on('data', function(chunk) {
        return chunks.push(chunk);
      });
      task.stderr.on('data', function(chunk) {
        return chunks.push(chunk);
      });
      return task.on('close', function() {
        var data;
        fs.unlink(savePath);
        data = Buffer.concat(chunks).toString();
        return typeof callback === "function" ? callback(null, data, options) : void 0;
      });
    });
  };

  clearCache = function() {
    var key, results1;
    results1 = [];
    for (key in REQUIRE_CACHE) {
      results1.push(REQUIRE_CACHE[key] = false);
    }
    return results1;
  };

  codeChunkAPI = {
    run: run,
    clearCache: clearCache
  };

  module.exports = codeChunkAPI;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9jb2RlLWNodW5rLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDSixRQUFTLE9BQUEsQ0FBUSxlQUFSOztFQUNWLE1BQTRDLE9BQUEsQ0FBUSxVQUFSLENBQTVDLEVBQUMscUNBQUQsRUFBa0I7O0VBQ2xCLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBRVIsYUFBQSxHQUFnQjs7RUFLaEIsR0FBQSxHQUFNLFNBQUMsT0FBRCxFQUFVLGlCQUFWLEVBQWdDLEdBQWhDLEVBQXFDLE9BQXJDLEVBQWlELFFBQWpEO0FBQ0osUUFBQTs7TUFEYyxvQkFBa0I7OztNQUFTLFVBQVE7O0lBQ2pELElBQUEsR0FBTyxPQUFPLENBQUMsSUFBUixJQUFnQjtJQUN2QixJQUFJLE9BQU8sSUFBUCxLQUFnQixRQUFwQjtNQUNFLElBQUEsR0FBTyxDQUFDLElBQUQsRUFEVDs7SUFHQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxpQkFBYixFQUFnQyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxRQUFkLENBQXVCLEVBQXZCLENBQTBCLENBQUMsTUFBM0IsQ0FBa0MsQ0FBbEMsRUFBcUMsQ0FBckMsQ0FBQSxHQUEwQyxhQUExRTtJQUVYLE9BQUEsR0FBVSxPQUFPLENBQUMsT0FBUixDQUFnQixTQUFoQixFQUEyQixHQUEzQjtJQUVWLElBQUcsR0FBRyxDQUFDLEtBQUosQ0FBVSxpQkFBVixDQUFIO01BQ0UsY0FBQSxHQUFpQjtNQUNqQixJQUFHLE9BQU8sQ0FBQyxPQUFYO1FBQ0UsUUFBQSxHQUFXLE9B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QUFDWCxRQUFBO0FBQUE7U0FBQSxvQkFBQTtvQkFDRSxhQUFjLENBQUEsR0FBQSxDQUFkLEdBQXFCO0FBRHZCOztFQURXOztFQU1iLFlBQUEsR0FBZTtJQUFDLEtBQUEsR0FBRDtJQUFNLFlBQUEsVUFBTjs7O0VBQ2YsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF2SmpCIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xue3NwYXdufSA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG57YWxsb3dVbnNhZmVFdmFsLCBhbGxvd1Vuc2FmZU5ld0Z1bmN0aW9ufSA9IHJlcXVpcmUgJ2xvb3Bob2xlJ1xucmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKVxuYXN5bmMgPSByZXF1aXJlKCdhc3luYycpXG5cblJFUVVJUkVfQ0FDSEUgPSB7fVxuXG4jXG4jXG4jXG5ydW4gPSAoY29udGVudCwgZmlsZURpcmVjdG9yeVBhdGg9JycsIGNtZCwgb3B0aW9ucz17fSwgY2FsbGJhY2spLT5cbiAgYXJncyA9IG9wdGlvbnMuYXJncyB8fCBbXVxuICBpZiAodHlwZW9mKGFyZ3MpID09ICdzdHJpbmcnKVxuICAgIGFyZ3MgPSBbYXJnc11cblxuICBzYXZlUGF0aCA9IHBhdGgucmVzb2x2ZShmaWxlRGlyZWN0b3J5UGF0aCwgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpICsgJ19jb2RlX2NodW5rJylcblxuICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXHUwMEEwL2csICcgJyk7XG5cbiAgaWYgY21kLm1hdGNoIC8oamF2YXNjcmlwdHxqcykvICMganVzdCBqYXZhc2NyaXB0LCBub3Qgbm9kZWpzXG4gICAgYXN5bmNGdW5jdGlvbnMgPSBbXVxuICAgIGlmIG9wdGlvbnMucmVxdWlyZVxuICAgICAgcmVxdWlyZXMgPSBvcHRpb25zLnJlcXVpcmVcbiAgICAgIGlmIHR5cGVvZihyZXF1aXJlcykgPT0gJ3N0cmluZydcbiAgICAgICAgcmVxdWlyZXMgPSBbcmVxdWlyZXNdXG5cbiAgICAgIGZvciByZXF1aXJlUGF0aCBpbiByZXF1aXJlc1xuICAgICAgICByZXF1aXJlUGF0aCA9IHJlcXVpcmVQYXRoLnRyaW0oKVxuXG4gICAgICAgIGhlbHBlciA9IChyZXF1aXJlUGF0aCktPlxuICAgICAgICAgIGlmIHJlcXVpcmVQYXRoLm1hdGNoKC9eKGh0dHB8aHR0cHMpXFw6XFwvXFwvLylcbiAgICAgICAgICAgIGFzeW5jRnVuY3Rpb25zLnB1c2ggKGNiKS0+XG4gICAgICAgICAgICAgIHJlcXVlc3QgcmVxdWlyZVBhdGgsIChlcnJvciwgcmVzcG9uc2UsIGJvZHkpLT5cbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyb3IpIGlmIGVycm9yXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiKG51bGwsIHtmaWxlOiByZXF1aXJlUGF0aCwgZGF0YTogYm9keS50b1N0cmluZygpfSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXF1aXJlUGF0aCA9IHBhdGgucmVzb2x2ZShmaWxlRGlyZWN0b3J5UGF0aCwgcmVxdWlyZVBhdGgpXG4gICAgICAgICAgICBhc3luY0Z1bmN0aW9ucy5wdXNoIChjYiktPlxuICAgICAgICAgICAgICBmcy5yZWFkRmlsZSByZXF1aXJlUGF0aCwge2VuY29kaW5nOiAndXRmLTgnfSwgKGVycm9yLCBkYXRhKS0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycm9yKSBpZiBlcnJvclxuICAgICAgICAgICAgICAgIHJldHVybiBjYihudWxsLCB7ZmlsZTogcmVxdWlyZVBhdGgsIGRhdGE6IGRhdGEudG9TdHJpbmcoKX0pXG4gICAgICAgIGhlbHBlcihyZXF1aXJlUGF0aClcblxuICAgICMgcmVxdWlyZSBmaWxlc1xuICAgIHJldHVybiBhc3luYy5zZXJpZXMgYXN5bmNGdW5jdGlvbnMsIChlcnJvciwgcmVzdWx0cyktPlxuICAgICAgaWYgZXJyb3JcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGVycm9yLnRvU3RyaW5nKCksIG9wdGlvbnMpXG4gICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHNcbiAgICAgICAgY29udGludWUgaWYgUkVRVUlSRV9DQUNIRVtyZXN1bHQuZmlsZV1cbiAgICAgICAgdHJ5ICMgVE9ETzogY3NzXG4gICAgICAgICAgYWxsb3dVbnNhZmVOZXdGdW5jdGlvbiAtPiBhbGxvd1Vuc2FmZUV2YWwgLT5cbiAgICAgICAgICAgICMgLmNzcyB3aWxsIGNhdXNlIGBSZWZ1c2VkIHRvIGxvYWQgdGhlIHN0eWxlc2hlZXRgIHNlY3VyaXR5IGVycm9yLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBpZiByZXN1bHQuZmlsZS5lbmRzV2l0aCgnLmNzcycpIGFuZCBkb2N1bWVudFxuICAgICAgICAgICAgICBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXVxuICAgICAgICAgICAgICBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnbGluaydcbiAgICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUgJ3JlbCcsICdzdHlsZXNoZWV0J1xuICAgICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSAndHlwZScsICd0ZXh0L2NzcydcbiAgICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUgJ2hyZWYnLCByZXN1bHQuZmlsZVxuICAgICAgICAgICAgICBsaW5rLmlkID0gJ21wZV8nICsgcmVzdWx0LmZpbGVcbiAgICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZCBsaW5rXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGV2YWwocmVzdWx0LmRhdGEpXG4gICAgICAgICAgICBSRVFVSVJFX0NBQ0hFW3Jlc3VsdC5maWxlXSA9IHRydWUgIyBzYXZlIHRvIGNhY2hlXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGVycm9yLnRvU3RyaW5nKCksIG9wdGlvbnMpXG5cbiAgICAgICMgcnVuIGphdmFzY3JpcHQgY29kZVxuICAgICAgcmV0dXJuIGFsbG93VW5zYWZlTmV3RnVuY3Rpb24gLT4gYWxsb3dVbnNhZmVFdmFsIC0+XG4gICAgICAgIHRyeVxuICAgICAgICAgIGNhbGxiYWNrPyhudWxsLCBldmFsKGNvbnRlbnQpLCBvcHRpb25zKVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgY2FsbGJhY2s/KG51bGwsIGUudG9TdHJpbmcoKSwgb3B0aW9ucylcblxuXG4gIGlmIGNtZC5tYXRjaCgvcHl0aG9uLykgYW5kIChvcHRpb25zLm1hdHBsb3RsaWIgb3Igb3B0aW9ucy5tcGwpXG4gICAgY29udGVudCA9IFwiXCJcIlxuIyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbiMgbW9kaWZ5IGRlZmF1bHQgbWF0cGxvdGxpYiBweXBsb3Qgc2hvdyBmdW5jdGlvblxudHJ5OlxuICAgIGltcG9ydCBtYXRwbG90bGliXG4gICAgbWF0cGxvdGxpYi51c2UoJ0FnZycpICMgdXNlIEFnZyBiYWNrZW5kXG4gICAgaW1wb3J0IG1hdHBsb3RsaWIucHlwbG90IGFzIHBsdFxuICAgIGltcG9ydCBzeXNcbiAgICBkZWYgbmV3X3BsdF9zaG93KCk6XG4gICAgICAgIHBsdC5zYXZlZmlnKHN5cy5zdGRvdXQsIGZvcm1hdD1cInN2Z1wiKVxuICAgIHBsdC5zaG93ID0gbmV3X3BsdF9zaG93ICMgb3ZlcnJpZGUgb2xkIG9uZVxuZXhjZXB0IEV4Y2VwdGlvbjpcbiAgICBwYXNzXG5cbiMgbW9kaWZ5IGRlZmF1bHQgbXBsZDMgYmVoYXZpb3JcbnRyeTpcbiAgICBpbXBvcnQgbWF0cGxvdGxpYi5weXBsb3QgYXMgcGx0LCBtcGxkM1xuICAgIGltcG9ydCBzeXNcbiAgICBkZWYgbmV3X21wbGQzX3Nob3coKTpcbiAgICAgICAgZmlnID0gcGx0LmdjZigpICMgZ2V0IGN1cnJlbnQgZmlndXJlXG4gICAgICAgIHN5cy5zdGRvdXQud3JpdGUobXBsZDMuZmlnX3RvX2h0bWwoZmlnKSlcbiAgICBtcGxkMy5zaG93ID0gbmV3X21wbGQzX3Nob3cgIyBvdmVycmlkZSBvbGQgb25lXG4gICAgbXBsZDMuZGlzcGxheSA9IG5ld19tcGxkM19zaG93XG5leGNlcHQgRXhjZXB0aW9uOlxuICAgIHBhc3NcblxuXCJcIlwiICsgY29udGVudFxuICAgIG9wdGlvbnMub3V0cHV0ID0gJ2h0bWwnICMgY2hhbmdlIHRvIGh0bWwgc28gdGhhdCBzdmcgY2FuIGJlIHJlbmRlcmVkXG5cbiAgZnMud3JpdGVGaWxlIHNhdmVQYXRoLCBjb250ZW50LCAoZXJyKS0+XG4gICAgaWYgKGVycilcbiAgICAgIGNhbGxiYWNrPyh0cnVlKVxuICAgICAgcmV0dXJuXG5cbiAgICAjIGNoZWNrIG1hY3Jvc1xuICAgIGZpbmRJbnB1dEZpbGVNYWNybyA9IGZhbHNlXG4gICAgYXJncyA9IGFyZ3MubWFwIChhcmcpLT5cbiAgICAgIGlmIGFyZyA9PSAne2lucHV0X2ZpbGV9J1xuICAgICAgICBmaW5kSW5wdXRGaWxlTWFjcm8gPSB0cnVlXG4gICAgICAgIHNhdmVQYXRoXG4gICAgICBlbHNlXG4gICAgICAgIGFyZ1xuXG4gICAgaWYgIWZpbmRJbnB1dEZpbGVNYWNybyBhbmQgIW9wdGlvbnMuc3RkaW5cbiAgICAgIGFyZ3MucHVzaCBzYXZlUGF0aFxuXG4gICAgdGFzayA9IHNwYXduIGNtZCwgYXJncywge2N3ZDogZmlsZURpcmVjdG9yeVBhdGh9XG4gICAgaWYgb3B0aW9ucy5zdGRpbiAjIHBhc3MgY29udGVudCBhcyBzdGRpblxuICAgICAgdGFzay5zdGRpbi53cml0ZShjb250ZW50KVxuICAgIHRhc2suc3RkaW4uZW5kKClcblxuICAgIGNodW5rcyA9IFtdXG4gICAgdGFzay5zdGRvdXQub24gJ2RhdGEnLCAoY2h1bmspLT5cbiAgICAgIGNodW5rcy5wdXNoKGNodW5rKVxuXG4gICAgdGFzay5zdGRlcnIub24gJ2RhdGEnLCAoY2h1bmspLT5cbiAgICAgIGNodW5rcy5wdXNoKGNodW5rKVxuXG4gICAgdGFzay5vbiAnY2xvc2UnLCAoKS0+XG4gICAgICBmcy51bmxpbmsoc2F2ZVBhdGgpXG5cbiAgICAgIGRhdGEgPSBCdWZmZXIuY29uY2F0KGNodW5rcykudG9TdHJpbmcoKVxuICAgICAgY2FsbGJhY2s/KG51bGwsIGRhdGEsIG9wdGlvbnMpXG5cblxuY2xlYXJDYWNoZSA9ICgpLT5cbiAgZm9yIGtleSBvZiBSRVFVSVJFX0NBQ0hFXG4gICAgUkVRVUlSRV9DQUNIRVtrZXldID0gZmFsc2VcbiAgICAjIGlmIGtleS5lbmRzV2l0aCgnLmNzcycpIGFuZCBkb2N1bWVudFxuICAgICMgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcGVfJyArIGtleSk/LnJlbW92ZSgpXG5cbmNvZGVDaHVua0FQSSA9IHtydW4sIGNsZWFyQ2FjaGV9XG5tb2R1bGUuZXhwb3J0cyA9IGNvZGVDaHVua0FQSSJdfQ==
