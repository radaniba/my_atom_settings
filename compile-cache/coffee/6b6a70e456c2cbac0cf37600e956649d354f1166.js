(function() {
  var Dom, Headers, Utility;

  Dom = require('./dom');

  Utility = require('./utility');

  Headers = require('./headers');

  module.exports = {
    init: function(state) {
      var self;
      self = this;
      self.tabSize(atom.config.get('seti-ui.compactView'));
      self.ignoredFiles(atom.config.get('seti-ui.displayIgnored'));
      self.fileIcons(atom.config.get('seti-ui.fileIcons'));
      self.hideTabs(atom.config.get('seti-ui.hideTabs'));
      self.setTheme(atom.config.get('seti-ui.themeColor'), false, false);
      self.font(atom.config.get('seti-ui.font'), false);
      self.animate(atom.config.get('seti-ui.disableAnimations'));
      atom.config.onDidChange('seti-ui.font', function(value) {
        return self.font(atom.config.get('seti-ui.font'), true);
      });
      return atom.config.onDidChange('seti-ui.themeColor', function(value) {
        return self.setTheme(value.newValue, value.oldValue, true);
      });
    },
    "package": atom.packages.getLoadedPackage('seti-ui'),
    refresh: function() {
      var self;
      self = this;
      self["package"].deactivate();
      return setImmediate(function() {
        return self["package"].activate();
      });
    },
    font: function(val, reload) {
      var el, self;
      self = this;
      el = Dom.query('atom-workspace');
      if (val === 'Roboto') {
        return el.classList.add('seti-roboto');
      } else {
        return el.classList.remove('seti-roboto');
      }
    },
    setTheme: function(theme, previous, reload) {
      var el, fs, path, pkg, self, themeData;
      self = this;
      el = Dom.query('atom-workspace');
      fs = require('fs');
      path = require('path');
      pkg = atom.packages.getLoadedPackage('seti-ui');
      themeData = '@seti-primary: @' + theme.toLowerCase() + ';';
      themeData = themeData + '@seti-primary-text: @' + theme.toLowerCase() + '-text;';
      themeData = themeData + '@seti-primary-highlight: @' + theme.toLowerCase() + '-highlight;';
      atom.config.set('seti-ui.themeColor', theme);
      return fs.writeFile(pkg.path + '/styles/user-theme.less', themeData, function(err) {
        if (!err) {
          if (previous) {
            el.classList.remove('seti-theme-' + previous.toLowerCase());
            el.classList.add('seti-theme-' + theme.toLowerCase());
          }
          if (reload) {
            return self.refresh();
          }
        }
      });
    },
    animate: function(val) {
      return Utility.applySetting({
        action: 'addWhenFalse',
        config: 'seti-ui.disableAnimations',
        el: ['atom-workspace'],
        className: 'seti-animate',
        val: val,
        cb: this.animate
      });
    },
    tabSize: function(val) {
      return Utility.applySetting({
        action: 'addWhenTrue',
        config: 'seti-ui.compactView',
        el: ['atom-workspace'],
        className: 'seti-compact',
        val: val,
        cb: this.tabSize
      });
    },
    hideTabs: function(val) {
      Utility.applySetting({
        action: 'addWhenTrue',
        config: 'seti-ui.hideTabs',
        el: ['atom-workspace'],
        className: 'seti-hide-tabs',
        val: val,
        cb: this.hideTabs
      });
    },
    fileIcons: function(val) {
      Utility.applySetting({
        action: 'addWhenTrue',
        config: 'seti-ui.fileIcons',
        el: ['atom-workspace'],
        className: 'seti-icons',
        val: val,
        cb: this.fileIcons
      });
    },
    ignoredFiles: function(val) {
      return Utility.applySetting({
        action: 'addWhenFalse',
        config: 'seti-ui.displayIgnored',
        el: ['.file.entry.list-item.status-ignored', '.directory.entry.list-nested-item.status-ignored'],
        className: 'seti-hide',
        val: val,
        cb: this.ignoredFiles
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zZXRpLXVpL2xpYi9zZXR0aW5ncy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUJBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FBTixDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVBLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUixDQUZWLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxJQUFBLEVBQU0sU0FBQyxLQUFELEdBQUE7QUFFSixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxNQUdBLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFCQUFoQixDQUFiLENBSEEsQ0FBQTtBQUFBLE1BS0EsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixDQUFsQixDQUxBLENBQUE7QUFBQSxNQU9BLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQixDQUFmLENBUEEsQ0FBQTtBQUFBLE1BU0EsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLENBQWQsQ0FUQSxDQUFBO0FBQUEsTUFXQSxJQUFJLENBQUMsUUFBTCxDQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsQ0FBZCxFQUFxRCxLQUFyRCxFQUE0RCxLQUE1RCxDQVhBLENBQUE7QUFBQSxNQWNBLElBQUksQ0FBQyxJQUFMLENB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

//# sourceURL=/Users/Rad/.atom/packages/seti-ui/lib/settings.coffee
