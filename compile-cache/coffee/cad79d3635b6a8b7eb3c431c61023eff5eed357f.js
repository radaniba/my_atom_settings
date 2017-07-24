(function() {
  var BufferedProcess, Point, Q, TagGenerator, path, ref;

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, Point = ref.Point;

  Q = require('q');

  path = require('path');

  module.exports = TagGenerator = (function() {
    function TagGenerator(path1, scopeName) {
      this.path = path1;
      this.scopeName = scopeName;
    }

    TagGenerator.prototype.parseTagLine = function(line) {
      var sections, tag;
      sections = line.split('\t');
      if (sections.length > 3) {
        tag = {
          position: new Point(parseInt(sections[2]) - 1),
          name: sections[0],
          type: sections[3],
          parent: null
        };
        if (sections.length > 4 && sections[4].search('signature:') === -1) {
          tag.parent = sections[4];
        }
        if (this.getLanguage() === 'Python' && tag.type === 'member') {
          tag.type = 'function';
        }
        return tag;
      } else {
        return null;
      }
    };

    TagGenerator.prototype.getLanguage = function() {
      var ref1;
      if ((ref1 = path.extname(this.path)) === '.cson' || ref1 === '.gyp') {
        return 'Cson';
      }
      return {
        'source.c': 'C',
        'source.cpp': 'C++',
        'source.clojure': 'Lisp',
        'source.coffee': 'CoffeeScript',
        'source.css': 'Css',
        'source.css.less': 'Css',
        'source.css.scss': 'Css',
        'source.gfm': 'Markdown',
        'source.go': 'Go',
        'source.java': 'Java',
        'source.js': 'JavaScript',
        'source.js.jsx': 'JavaScript',
        'source.jsx': 'JavaScript',
        'source.json': 'Json',
        'source.makefile': 'Make',
        'source.objc': 'C',
        'source.objcpp': 'C++',
        'source.python': 'Python',
        'source.ruby': 'Ruby',
        'source.sass': 'Sass',
        'source.yaml': 'Yaml',
        'text.html': 'Html',
        'text.html.php': 'Php',
        'source.livecodescript': 'LiveCode',
        'source.c++': 'C++',
        'source.objc++': 'C++'
      }[this.scopeName];
    };

    TagGenerator.prototype.generate = function() {
      var args, command, defaultCtagsFile, deferred, exit, language, stderr, stdout, tags;
      deferred = Q.defer();
      tags = [];
      command = path.resolve(__dirname, '..', 'vendor', "universal-ctags-" + process.platform);
      defaultCtagsFile = require.resolve('./.ctags');
      args = ["--options=" + defaultCtagsFile, '--fields=KsS'];
      if (atom.config.get('symbols-view.useEditorGrammarAsCtagsLanguage')) {
        if (language = this.getLanguage()) {
          args.push("--language-force=" + language);
        }
      }
      args.push('-nf', '-', this.path);
      stdout = (function(_this) {
        return function(lines) {
          var i, len, line, ref1, results, tag;
          ref1 = lines.split('\n');
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            line = ref1[i];
            if (tag = _this.parseTagLine(line.trim())) {
              results.push(tags.push(tag));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this);
      stderr = function(lines) {};
      exit = function() {
        return deferred.resolve(tags);
      };
      new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
      return deferred.promise;
    };

    return TagGenerator;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zeW1ib2xzLXRyZWUtdmlldy9saWIvdGFnLWdlbmVyYXRvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTJCLE9BQUEsQ0FBUSxNQUFSLENBQTNCLEVBQUMscUNBQUQsRUFBa0I7O0VBQ2xCLENBQUEsR0FBSSxPQUFBLENBQVEsR0FBUjs7RUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDUTtJQUNTLHNCQUFDLEtBQUQsRUFBUSxTQUFSO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsWUFBRDtJQUFSOzsyQkFFYixZQUFBLEdBQWMsU0FBQyxJQUFEO0FBQ1osVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVg7TUFDWCxJQUFHLFFBQVEsQ0FBQyxNQUFULEdBQWtCLENBQXJCO1FBQ0UsR0FBQSxHQUFNO1VBQ0osUUFBQSxFQUFjLElBQUEsS0FBQSxDQUFNLFFBQUEsQ0FBUyxRQUFTLENBQUEsQ0FBQSxDQUFsQixDQUFBLEdBQXdCLENBQTlCLENBRFY7VUFFSixJQUFBLEVBQU0sUUFBUyxDQUFBLENBQUEsQ0FGWDtVQUdKLElBQUEsRUFBTSxRQUFTLENBQUEsQ0FBQSxDQUhYO1VBSUosTUFBQSxFQUFRLElBSko7O1FBTU4sSUFBRyxRQUFRLENBQUMsTUFBVCxHQUFrQixDQUFsQixJQUF3QixRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBWixDQUFtQixZQUFuQixDQUFBLEtBQW9DLENBQUMsQ0FBaEU7VUFDRSxHQUFHLENBQUMsTUFBSixHQUFhLFFBQVMsQ0FBQSxDQUFBLEVBRHhCOztRQUVBLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLEtBQWtCLFFBQWxCLElBQStCLEdBQUcsQ0FBQyxJQUFKLEtBQVks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QTNEZCIsInNvdXJjZXNDb250ZW50IjpbIntCdWZmZXJlZFByb2Nlc3MsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5RID0gcmVxdWlyZSAncSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNsYXNzIFRhZ0dlbmVyYXRvclxuICAgIGNvbnN0cnVjdG9yOiAoQHBhdGgsIEBzY29wZU5hbWUpIC0+XG5cbiAgICBwYXJzZVRhZ0xpbmU6IChsaW5lKSAtPlxuICAgICAgc2VjdGlvbnMgPSBsaW5lLnNwbGl0KCdcXHQnKVxuICAgICAgaWYgc2VjdGlvbnMubGVuZ3RoID4gM1xuICAgICAgICB0YWcgPSB7XG4gICAgICAgICAgcG9zaXRpb246IG5ldyBQb2ludChwYXJzZUludChzZWN0aW9uc1syXSkgLSAxKVxuICAgICAgICAgIG5hbWU6IHNlY3Rpb25zWzBdXG4gICAgICAgICAgdHlwZTogc2VjdGlvbnNbM11cbiAgICAgICAgICBwYXJlbnQ6IG51bGxcbiAgICAgICAgfVxuICAgICAgICBpZiBzZWN0aW9ucy5sZW5ndGggPiA0IGFuZCBzZWN0aW9uc1s0XS5zZWFyY2goJ3NpZ25hdHVyZTonKSA9PSAtMVxuICAgICAgICAgIHRhZy5wYXJlbnQgPSBzZWN0aW9uc1s0XVxuICAgICAgICBpZiBAZ2V0TGFuZ3VhZ2UoKSA9PSAnUHl0aG9uJyBhbmQgdGFnLnR5cGUgPT0gJ21lbWJlcidcbiAgICAgICAgICB0YWcudHlwZSA9ICdmdW5jdGlvbidcbiAgICAgICAgcmV0dXJuIHRhZ1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gbnVsbFxuXG4gICAgZ2V0TGFuZ3VhZ2U6IC0+XG4gICAgICByZXR1cm4gJ0Nzb24nIGlmIHBhdGguZXh0bmFtZShAcGF0aCkgaW4gWycuY3NvbicsICcuZ3lwJ11cblxuICAgICAge1xuICAgICAgICAnc291cmNlLmMnICAgICAgICAgICAgICA6ICdDJ1xuICAgICAgICAnc291cmNlLmNwcCcgICAgICAgICAgICA6ICdDKysnXG4gICAgICAgICdzb3VyY2UuY2xvanVyZScgICAgICAgIDogJ0xpc3AnXG4gICAgICAgICdzb3VyY2UuY29mZmVlJyAgICAgICAgIDogJ0NvZmZlZVNjcmlwdCdcbiAgICAgICAgJ3NvdXJjZS5jc3MnICAgICAgICAgICAgOiAnQ3NzJ1xuICAgICAgICAnc291cmNlLmNzcy5sZXNzJyAgICAgICA6ICdDc3MnXG4gICAgICAgICdzb3VyY2UuY3NzLnNjc3MnICAgICAgIDogJ0NzcydcbiAgICAgICAgJ3NvdXJjZS5nZm0nICAgICAgICAgICAgOiAnTWFya2Rvd24nXG4gICAgICAgICdzb3VyY2UuZ28nICAgICAgICAgICAgIDogJ0dvJ1xuICAgICAgICAnc291cmNlLmphdmEnICAgICAgICAgICA6ICdKYXZhJ1xuICAgICAgICAnc291cmNlLmpzJyAgICAgICAgICAgICA6ICdKYXZhU2NyaXB0J1xuICAgICAgICAnc291cmNlLmpzLmpzeCcgICAgICAgICA6ICdKYXZhU2NyaXB0J1xuICAgICAgICAnc291cmNlLmpzeCcgICAgICAgICAgICA6ICdKYXZhU2NyaXB0J1xuICAgICAgICAnc291cmNlLmpzb24nICAgICAgICAgICA6ICdKc29uJ1xuICAgICAgICAnc291cmNlLm1ha2VmaWxlJyAgICAgICA6ICdNYWtlJ1xuICAgICAgICAnc291cmNlLm9iamMnICAgICAgICAgICA6ICdDJ1xuICAgICAgICAnc291cmNlLm9iamNwcCcgICAgICAgICA6ICdDKysnXG4gICAgICAgICdzb3VyY2UucHl0aG9uJyAgICAgICAgIDogJ1B5dGhvbidcbiAgICAgICAgJ3NvdXJjZS5ydWJ5JyAgICAgICAgICAgOiAnUnVieSdcbiAgICAgICAgJ3NvdXJjZS5zYXNzJyAgICAgICAgICAgOiAnU2FzcydcbiAgICAgICAgJ3NvdXJjZS55YW1sJyAgICAgICAgICAgOiAnWWFtbCdcbiAgICAgICAgJ3RleHQuaHRtbCcgICAgICAgICAgICAgOiAnSHRtbCdcbiAgICAgICAgJ3RleHQuaHRtbC5waHAnICAgICAgICAgOiAnUGhwJ1xuICAgICAgICAnc291cmNlLmxpdmVjb2Rlc2NyaXB0JyA6ICdMaXZlQ29kZSdcblxuICAgICAgICAjIEZvciBiYWNrd2FyZC1jb21wYXRpYmlsaXR5IHdpdGggQXRvbSB2ZXJzaW9ucyA8IDAuMTY2XG4gICAgICAgICdzb3VyY2UuYysrJyAgICAgICAgICAgIDogJ0MrKydcbiAgICAgICAgJ3NvdXJjZS5vYmpjKysnICAgICAgICAgOiAnQysrJ1xuICAgICAgfVtAc2NvcGVOYW1lXVxuXG4gICAgZ2VuZXJhdGU6IC0+XG4gICAgICBkZWZlcnJlZCA9IFEuZGVmZXIoKVxuICAgICAgdGFncyA9IFtdXG4gICAgICBjb21tYW5kID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ3ZlbmRvcicsIFwidW5pdmVyc2FsLWN0YWdzLSN7cHJvY2Vzcy5wbGF0Zm9ybX1cIilcbiAgICAgIGRlZmF1bHRDdGFnc0ZpbGUgPSByZXF1aXJlLnJlc29sdmUoJy4vLmN0YWdzJylcbiAgICAgIGFyZ3MgPSBbXCItLW9wdGlvbnM9I3tkZWZhdWx0Q3RhZ3NGaWxlfVwiLCAnLS1maWVsZHM9S3NTJ11cblxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW1ib2xzLXZpZXcudXNlRWRpdG9yR3JhbW1hckFzQ3RhZ3NMYW5ndWFnZScpXG4gICAgICAgIGlmIGxhbmd1YWdlID0gQGdldExhbmd1YWdlKClcbiAgICAgICAgICBhcmdzLnB1c2goXCItLWxhbmd1YWdlLWZvcmNlPSN7bGFuZ3VhZ2V9XCIpXG5cbiAgICAgIGFyZ3MucHVzaCgnLW5mJywgJy0nLCBAcGF0aClcblxuICAgICAgc3Rkb3V0ID0gKGxpbmVzKSA9PlxuICAgICAgICBmb3IgbGluZSBpbiBsaW5lcy5zcGxpdCgnXFxuJylcbiAgICAgICAgICBpZiB0YWcgPSBAcGFyc2VUYWdMaW5lKGxpbmUudHJpbSgpKVxuICAgICAgICAgICAgdGFncy5wdXNoKHRhZylcbiAgICAgIHN0ZGVyciA9IChsaW5lcykgLT5cbiAgICAgIGV4aXQgPSAtPlxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRhZ3MpXG5cbiAgICAgIG5ldyBCdWZmZXJlZFByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgc3RkZXJyLCBleGl0fSlcblxuICAgICAgZGVmZXJyZWQucHJvbWlzZVxuIl19
