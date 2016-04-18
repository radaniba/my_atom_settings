(function() {
  var fs, path, yaml;

  fs = require('fs');

  path = require('path');

  yaml = require('js-yaml');

  module.exports = {
    Main: null,
    setMainModule: function(Main) {
      this.Main = Main;
    },
    waitForConfig: function(cb) {
      if (process.jekyllAtom.config) {
        return cb(process.jekyllAtom.config);
      } else {
        return this.Main.disposables.push(this.Main.Emitter.on('config-loaded', (function(_this) {
          return function(conf) {
            return cb(conf);
          };
        })(this)));
      }
    },
    getConfigFromSite: function() {
      return fs.open(path.join(atom.project.getPaths()[0], '_config.yml'), 'r', (function(_this) {
        return function(err, fd) {
          return _this.handleConfigFileOpen(err, fd);
        };
      })(this));
    },
    handleConfigFileOpen: function(err, fd) {
      if (!err) {
        process.jekyllAtom.config = yaml.safeLoad(fs.readFileSync(path.join(atom.project.getPaths()[0], '_config.yml')));
        if (!process.jekyllAtom.config.layouts_dir) {
          process.jekyllAtom.config.layouts_dir = './_layouts';
        }
        if (!process.jekyllAtom.config.includes_dir) {
          process.jekyllAtom.config.includes_dir = './_includes';
        }
        if (!process.jekyllAtom.config.data_dir) {
          process.jekyllAtom.config.data_dir = './_data';
        }
        if (!process.jekyllAtom.config.destination) {
          process.jekyllAtom.config.destination = './_site';
        }
        return this.Main.Emitter.emit('config-loaded', process.jekyllAtom.config);
      }
    },
    generateFileName: function(title) {
      var titleString;
      titleString = title.toLowerCase().replace(/[^\w\s]|_/g, "").replace(RegExp(" ", 'g'), "-");
      return this.generateDateString() + '-' + titleString;
    },
    generateDateString: function(currentTime, showTime) {
      var string, timezoneOffset;
      if (currentTime == null) {
        currentTime = new Date();
      }
      if (showTime == null) {
        showTime = false;
      }
      string = currentTime.getFullYear() + "-" + ("0" + (currentTime.getMonth() + 1)).slice(-2) + "-" + ("0" + currentTime.getDate()).slice(-2);
      if (showTime) {
        string += " " + ("0" + currentTime.getHours()).slice(-2) + ":" + ("0" + currentTime.getMinutes()).slice(-2) + ":" + ("0" + currentTime.getSeconds()).slice(-2);
        timezoneOffset = currentTime.getTimezoneOffset();
        string += " " + (timezoneOffset <= 0 ? "+" : "-") + ("0" + Math.floor(Math.abs(timezoneOffset) / 60)).slice(-2) + ("0" + Math.abs(timezoneOffset) % 60).slice(-2);
      }
      return string;
    },
    scan: function(string, pattern) {
      var matches, results;
      matches = [];
      results = [];
      while (matches = pattern.exec(string)) {
        matches.shift();
        results.push(matches);
      }
      return results;
    },
    getPostTitle: function(editor) {
      var contents, title;
      contents = editor.getText();
      return title = this.scan(contents, /title: (.*?)[\r\n|\n\r|\r|\n]/g)[0][0];
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9qZWt5bGwvbGliL2pla3lsbC91dGlscy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsY0FBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsSUFFQSxhQUFBLEVBQWUsU0FBRSxJQUFGLEdBQUE7QUFBUyxNQUFSLElBQUMsQ0FBQSxPQUFBLElBQU8sQ0FBVDtJQUFBLENBRmY7QUFBQSxJQUlBLGFBQUEsRUFBZSxTQUFDLEVBQUQsR0FBQTtBQUNiLE1BQUEsSUFBRyxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQXRCO2VBQ0UsRUFBQSxDQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBdEIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFsQixDQUF1QixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFkLENBQWlCLGVBQWpCLEVBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxJQUFELEdBQUE7bUJBQVUsRUFBQSxDQUFHLElBQUgsRUFBVjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQXZCLEVBSEY7T0FEYTtJQUFBLENBSmY7QUFBQSxJQVVBLGlCQUFBLEVBQW1CLFNBQUEsR0FBQTthQUNqQixFQUFFLENBQUMsSUFBSCxDQUNFLElBQUksQ0FBQyxJQUFMLENB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

//# sourceURL=/Users/Rad/.atom/packages/jekyll/lib/jekyll/utils.coffee
