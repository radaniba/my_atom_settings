Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _atomSpacePenViews = require('atom-space-pen-views');

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _scriptInputView = require('./script-input-view');

var _scriptInputView2 = _interopRequireDefault(_scriptInputView);

'use babel';

var ScriptOptionsView = (function (_View) {
  _inherits(ScriptOptionsView, _View);

  function ScriptOptionsView() {
    _classCallCheck(this, ScriptOptionsView);

    _get(Object.getPrototypeOf(ScriptOptionsView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ScriptOptionsView, [{
    key: 'initialize',
    value: function initialize(runOptions) {
      var _this = this;

      this.runOptions = runOptions;
      this.emitter = new _atom.Emitter();

      this.subscriptions = new _atom.CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:cancel': function coreCancel() {
          return _this.hide();
        },
        'core:close': function coreClose() {
          return _this.hide();
        },
        'script:close-options': function scriptCloseOptions() {
          return _this.hide();
        },
        'script:run-options': function scriptRunOptions() {
          return _this.panel.isVisible() ? _this.hide() : _this.show();
        },
        'script:save-options': function scriptSaveOptions() {
          return _this.saveOptions();
        }
      }));

      // handling focus traversal and run on enter
      this.find('atom-text-editor').on('keydown', function (e) {
        if (e.keyCode !== 9 && e.keyCode !== 13) return true;

        switch (e.keyCode) {
          case 9:
            {
              e.preventDefault();
              e.stopPropagation();
              var row = _this.find(e.target).parents('tr:first').nextAll('tr:first');
              if (row.length) {
                return row.find('atom-text-editor').focus();
              }
              return _this.buttonCancel.focus();
            }
          case 13:
            return _this.run();
        }
        return null;
      });

      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.hide();
    }
  }, {
    key: 'splitArgs',
    value: function splitArgs(element) {
      var args = element.get(0).getModel().getText().trim();

      if (args.indexOf('"') === -1 && args.indexOf("'") === -1) {
        // no escaping, just split
        return args.split(' ').filter(function (item) {
          return item !== '';
        }).map(function (item) {
          return item;
        });
      }

      var replaces = {};

      var regexps = [/"[^"]*"/ig, /'[^']*'/ig];

      var matches = undefined;
      // find strings in arguments
      regexps.forEach(function (regex) {
        matches = (!matches ? matches : []).concat(args.match(regex) || []);
      });

      // format replacement as bash comment to avoid replacing valid input
      matches.forEach(function (match) {
        replaces['`#match' + (Object.keys(replaces).length + 1) + '`'] = match;
      });

      // replace strings
      for (var match in replaces) {
        var part = replaces[match];
        args = args.replace(new RegExp(part, 'g'), match);
      }
      var split = args.split(' ').filter(function (item) {
        return item !== '';
      }).map(function (item) {
        return item;
      });

      var replacer = function replacer(argument) {
        for (var match in replaces) {
          var replacement = replaces[match];
          argument = argument.replace(match, replacement);
        }
        return argument;
      };

      // restore strings, strip quotes
      return split.map(function (argument) {
        return replacer(argument).replace(/"|'/g, '');
      });
    }
  }, {
    key: 'getOptions',
    value: function getOptions() {
      return {
        workingDirectory: this.inputCwd.get(0).getModel().getText(),
        cmd: this.inputCommand.get(0).getModel().getText(),
        cmdArgs: this.splitArgs(this.inputCommandArgs),
        env: this.inputEnv.get(0).getModel().getText(),
        scriptArgs: this.splitArgs(this.inputScriptArgs)
      };
    }
  }, {
    key: 'saveOptions',
    value: function saveOptions() {
      var options = this.getOptions();
      for (var option in options) {
        var value = options[option];
        this.runOptions[option] = value;
      }
    }
  }, {
    key: 'onProfileSave',
    value: function onProfileSave(callback) {
      return this.emitter.on('on-profile-save', callback);
    }

    // Saves specified options as new profile
  }, {
    key: 'saveProfile',
    value: function saveProfile() {
      var _this2 = this;

      this.hide();

      var options = this.getOptions();

      var inputView = new _scriptInputView2['default']({ caption: 'Enter profile name:' });
      inputView.onCancel(function () {
        return _this2.show();
      });
      inputView.onConfirm(function (profileName) {
        if (!profileName) return;
        _underscore2['default'].forEach(_this2.find('atom-text-editor'), function (editor) {
          editor.getModel().setText('');
        });

        // clean up the options
        _this2.saveOptions();

        // add to global profiles list
        _this2.emitter.emit('on-profile-save', { name: profileName, options: options });
      });

      inputView.show();
    }
  }, {
    key: 'close',
    value: function close() {
      this.hide();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.subscriptions) this.subscriptions.dispose();
    }
  }, {
    key: 'show',
    value: function show() {
      this.panel.show();
      this.inputCwd.focus();
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'run',
    value: function run() {
      this.saveOptions();
      this.hide();
      atom.commands.dispatch(this.workspaceView(), 'script:run');
    }
  }, {
    key: 'workspaceView',
    value: function workspaceView() {
      atom.views.getView(atom.workspace);
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this3 = this;

      this.div({ 'class': 'options-view' }, function () {
        _this3.div({ 'class': 'panel-heading' }, 'Configure Run Options');
        _this3.table(function () {
          _this3.tr(function () {
            _this3.td({ 'class': 'first' }, function () {
              return _this3.label('Current Working Directory:');
            });
            _this3.td({ 'class': 'second' }, function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputCwd' });
            });
          });
          _this3.tr(function () {
            _this3.td(function () {
              return _this3.label('Command');
            });
            _this3.td(function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputCommand' });
            });
          });
          _this3.tr(function () {
            _this3.td(function () {
              return _this3.label('Command Arguments:');
            });
            _this3.td(function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputCommandArgs' });
            });
          });
          _this3.tr(function () {
            _this3.td(function () {
              return _this3.label('Program Arguments:');
            });
            _this3.td(function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputScriptArgs' });
            });
          });
          _this3.tr(function () {
            _this3.td(function () {
              return _this3.label('Environment Variables:');
            });
            _this3.td(function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputEnv' });
            });
          });
        });
        _this3.div({ 'class': 'block buttons' }, function () {
          var css = 'btn inline-block-tight';
          _this3.button({ 'class': 'btn ' + css + ' cancel', outlet: 'buttonCancel', click: 'close' }, function () {
            return _this3.span({ 'class': 'icon icon-x' }, 'Cancel');
          });
          _this3.span({ 'class': 'right-buttons' }, function () {
            _this3.button({ 'class': 'btn ' + css + ' save-profile', outlet: 'buttonSaveProfile', click: 'saveProfile' }, function () {
              return _this3.span({ 'class': 'icon icon-file-text' }, 'Save as profile');
            });
            _this3.button({ 'class': 'btn ' + css + ' run', outlet: 'buttonRun', click: 'run' }, function () {
              return _this3.span({ 'class': 'icon icon-playback-play' }, 'Run');
            });
          });
        });
      });
    }
  }]);

  return ScriptOptionsView;
})(_atomSpacePenViews.View);

exports['default'] = ScriptOptionsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9zY3JpcHQtb3B0aW9ucy12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUU2QyxNQUFNOztpQ0FDOUIsc0JBQXNCOzswQkFDN0IsWUFBWTs7OzsrQkFDRSxxQkFBcUI7Ozs7QUFMakQsV0FBVyxDQUFDOztJQU9TLGlCQUFpQjtZQUFqQixpQkFBaUI7O1dBQWpCLGlCQUFpQjswQkFBakIsaUJBQWlCOzsrQkFBakIsaUJBQWlCOzs7ZUFBakIsaUJBQWlCOztXQTRDMUIsb0JBQUMsVUFBVSxFQUFFOzs7QUFDckIsVUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDN0IsVUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDOztBQUU3QixVQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDO0FBQy9DLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELHFCQUFhLEVBQUU7aUJBQU0sTUFBSyxJQUFJLEVBQUU7U0FBQTtBQUNoQyxvQkFBWSxFQUFFO2lCQUFNLE1BQUssSUFBSSxFQUFFO1NBQUE7QUFDL0IsOEJBQXNCLEVBQUU7aUJBQU0sTUFBSyxJQUFJLEVBQUU7U0FBQTtBQUN6Qyw0QkFBb0IsRUFBRTtpQkFBTyxNQUFLLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxNQUFLLElBQUksRUFBRSxHQUFHLE1BQUssSUFBSSxFQUFFO1NBQUM7QUFDaEYsNkJBQXFCLEVBQUU7aUJBQU0sTUFBSyxXQUFXLEVBQUU7U0FBQTtPQUNoRCxDQUFDLENBQUMsQ0FBQzs7O0FBR0osVUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDakQsWUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLENB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cy9zY3JpcHQvbGliL3NjcmlwdC1vcHRpb25zLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHsgVmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuaW1wb3J0IFNjcmlwdElucHV0VmlldyBmcm9tICcuL3NjcmlwdC1pbnB1dC12aWV3JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NyaXB0T3B0aW9uc1ZpZXcgZXh0ZW5kcyBWaWV3IHtcblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICB0aGlzLmRpdih7IGNsYXNzOiAnb3B0aW9ucy12aWV3JyB9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7IGNsYXNzOiAncGFuZWwtaGVhZGluZycgfSwgJ0NvbmZpZ3VyZSBSdW4gT3B0aW9ucycpO1xuICAgICAgdGhpcy50YWJsZSgoKSA9PiB7XG4gICAgICAgIHRoaXMudHIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudGQoeyBjbGFzczogJ2ZpcnN0JyB9LCAoKSA9PiB0aGlzLmxhYmVsKCdDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5OicpKTtcbiAgICAgICAgICB0aGlzLnRkKHsgY2xhc3M6ICdzZWNvbmQnIH0sICgpID0+IHRoaXMudGFnKCdhdG9tLXRleHQtZWRpdG9yJywgeyBtaW5pOiAnJywgY2xhc3M6ICdlZGl0b3IgbWluaScsIG91dGxldDogJ2lucHV0Q3dkJyB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnRkKCgpID0+IHRoaXMubGFiZWwoJ0NvbW1hbmQnKSk7XG4gICAgICAgICAgdGhpcy50ZCgoKSA9PiB0aGlzLnRhZygnYXRvbS10ZXh0LWVkaXRvcicsIHsgbWluaTogJycsIGNsYXNzOiAnZWRpdG9yIG1pbmknLCBvdXRsZXQ6ICdpbnB1dENvbW1hbmQnIH0pKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudGQoKCkgPT4gdGhpcy5sYWJlbCgnQ29tbWFuZCBBcmd1bWVudHM6JykpO1xuICAgICAgICAgIHRoaXMudGQoKCkgPT4gdGhpcy50YWcoJ2F0b20tdGV4dC1lZGl0b3InLCB7IG1pbmk6ICcnLCBjbGFzczogJ2VkaXRvciBtaW5pJywgb3V0bGV0OiAnaW5wdXRDb21tYW5kQXJncycgfSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50cigoKSA9PiB7XG4gICAgICAgICAgdGhpcy50ZCgoKSA9PiB0aGlzLmxhYmVsKCdQcm9ncmFtIEFyZ3VtZW50czonKSk7XG4gICAgICAgICAgdGhpcy50ZCgoKSA9PiB0aGlzLnRhZygnYXRvbS10ZXh0LWVkaXRvcicsIHsgbWluaTogJycsIGNsYXNzOiAnZWRpdG9yIG1pbmknLCBvdXRsZXQ6ICdpbnB1dFNjcmlwdEFyZ3MnIH0pKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudGQoKCkgPT4gdGhpcy5sYWJlbCgnRW52aXJvbm1lbnQgVmFyaWFibGVzOicpKTtcbiAgICAgICAgICB0aGlzLnRkKCgpID0+IHRoaXMudGFnKCdhdG9tLXRleHQtZWRpdG9yJywgeyBtaW5pOiAnJywgY2xhc3M6ICdlZGl0b3IgbWluaScsIG91dGxldDogJ2lucHV0RW52JyB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmRpdih7IGNsYXNzOiAnYmxvY2sgYnV0dG9ucycgfSwgKCkgPT4ge1xuICAgICAgICBjb25zdCBjc3MgPSAnYnRuIGlubGluZS1ibG9jay10aWdodCc7XG4gICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6IGBidG4gJHtjc3N9IGNhbmNlbGAsIG91dGxldDogJ2J1dHRvbkNhbmNlbCcsIGNsaWNrOiAnY2xvc2UnIH0sICgpID0+XG4gICAgICAgICAgdGhpcy5zcGFuKHsgY2xhc3M6ICdpY29uIGljb24teCcgfSwgJ0NhbmNlbCcpLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnNwYW4oeyBjbGFzczogJ3JpZ2h0LWJ1dHRvbnMnIH0sICgpID0+IHtcbiAgICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiBgYnRuICR7Y3NzfSBzYXZlLXByb2ZpbGVgLCBvdXRsZXQ6ICdidXR0b25TYXZlUHJvZmlsZScsIGNsaWNrOiAnc2F2ZVByb2ZpbGUnIH0sICgpID0+XG4gICAgICAgICAgICB0aGlzLnNwYW4oeyBjbGFzczogJ2ljb24gaWNvbi1maWxlLXRleHQnIH0sICdTYXZlIGFzIHByb2ZpbGUnKSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6IGBidG4gJHtjc3N9IHJ1bmAsIG91dGxldDogJ2J1dHRvblJ1bicsIGNsaWNrOiAncnVuJyB9LCAoKSA9PlxuICAgICAgICAgICAgdGhpcy5zcGFuKHsgY2xhc3M6ICdpY29uIGljb24tcGxheWJhY2stcGxheScgfSwgJ1J1bicpLFxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKHJ1bk9wdGlvbnMpIHtcbiAgICB0aGlzLnJ1bk9wdGlvbnMgPSBydW5PcHRpb25zO1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4gdGhpcy5oaWRlKCksXG4gICAgICAnY29yZTpjbG9zZSc6ICgpID0+IHRoaXMuaGlkZSgpLFxuICAgICAgJ3NjcmlwdDpjbG9zZS1vcHRpb25zJzogKCkgPT4gdGhpcy5oaWRlKCksXG4gICAgICAnc2NyaXB0OnJ1bi1vcHRpb25zJzogKCkgPT4gKHRoaXMucGFuZWwuaXNWaXNpYmxlKCkgPyB0aGlzLmhpZGUoKSA6IHRoaXMuc2hvdygpKSxcbiAgICAgICdzY3JpcHQ6c2F2ZS1vcHRpb25zJzogKCkgPT4gdGhpcy5zYXZlT3B0aW9ucygpLFxuICAgIH0pKTtcblxuICAgIC8vIGhhbmRsaW5nIGZvY3VzIHRyYXZlcnNhbCBhbmQgcnVuIG9uIGVudGVyXG4gICAgdGhpcy5maW5kKCdhdG9tLXRleHQtZWRpdG9yJykub24oJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5Q29kZSAhPT0gOSAmJiBlLmtleUNvZGUgIT09IDEzKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSA5OiB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgY29uc3Qgcm93ID0gdGhpcy5maW5kKGUudGFyZ2V0KS5wYXJlbnRzKCd0cjpmaXJzdCcpLm5leHRBbGwoJ3RyOmZpcnN0Jyk7XG4gICAgICAgICAgaWYgKHJvdy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiByb3cuZmluZCgnYXRvbS10ZXh0LWVkaXRvcicpLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLmJ1dHRvbkNhbmNlbC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgMTM6IHJldHVybiB0aGlzLnJ1bigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG5cbiAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMgfSk7XG4gICAgdGhpcy5wYW5lbC5oaWRlKCk7XG4gIH1cblxuICBzcGxpdEFyZ3MoZWxlbWVudCkge1xuICAgIGxldCBhcmdzID0gZWxlbWVudC5nZXQoMCkuZ2V0TW9kZWwoKS5nZXRUZXh0KCkudHJpbSgpO1xuXG4gICAgaWYgKGFyZ3MuaW5kZXhPZignXCInKSA9PT0gLTEgJiYgYXJncy5pbmRleE9mKFwiJ1wiKSA9PT0gLTEpIHtcbiAgICAgIC8vIG5vIGVzY2FwaW5nLCBqdXN0IHNwbGl0XG4gICAgICByZXR1cm4gKGFyZ3Muc3BsaXQoJyAnKS5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSAnJykubWFwKGl0ZW0gPT4gaXRlbSkpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcGxhY2VzID0ge307XG5cbiAgICBjb25zdCByZWdleHBzID0gWy9cIlteXCJdKlwiL2lnLCAvJ1teJ10qJy9pZ107XG5cbiAgICBsZXQgbWF0Y2hlcztcbiAgICAvLyBmaW5kIHN0cmluZ3MgaW4gYXJndW1lbnRzXG4gICAgcmVnZXhwcy5mb3JFYWNoKChyZWdleCkgPT4ge1xuICAgICAgbWF0Y2hlcyA9ICghbWF0Y2hlcyA/IG1hdGNoZXMgOiBbXSkuY29uY2F0KChhcmdzLm1hdGNoKHJlZ2V4KSkgfHwgW10pO1xuICAgIH0pO1xuXG4gICAgLy8gZm9ybWF0IHJlcGxhY2VtZW50IGFzIGJhc2ggY29tbWVudCB0byBhdm9pZCByZXBsYWNpbmcgdmFsaWQgaW5wdXRcbiAgICBtYXRjaGVzLmZvckVhY2goKG1hdGNoKSA9PiB7XG4gICAgICByZXBsYWNlc1tgXFxgI21hdGNoJHtPYmplY3Qua2V5cyhyZXBsYWNlcykubGVuZ3RoICsgMX1cXGBgXSA9IG1hdGNoO1xuICAgIH0pO1xuXG4gICAgLy8gcmVwbGFjZSBzdHJpbmdzXG4gICAgZm9yIChjb25zdCBtYXRjaCBpbiByZXBsYWNlcykge1xuICAgICAgY29uc3QgcGFydCA9IHJlcGxhY2VzW21hdGNoXTtcbiAgICAgIGFyZ3MgPSBhcmdzLnJlcGxhY2UobmV3IFJlZ0V4cChwYXJ0LCAnZycpLCBtYXRjaCk7XG4gICAgfVxuICAgIGNvbnN0IHNwbGl0ID0gKGFyZ3Muc3BsaXQoJyAnKS5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSAnJykubWFwKGl0ZW0gPT4gaXRlbSkpO1xuXG4gICAgY29uc3QgcmVwbGFjZXIgPSAoYXJndW1lbnQpID0+IHtcbiAgICAgIGZvciAoY29uc3QgbWF0Y2ggaW4gcmVwbGFjZXMpIHtcbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSByZXBsYWNlc1ttYXRjaF07XG4gICAgICAgIGFyZ3VtZW50ID0gYXJndW1lbnQucmVwbGFjZShtYXRjaCwgcmVwbGFjZW1lbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFyZ3VtZW50O1xuICAgIH07XG5cbiAgICAvLyByZXN0b3JlIHN0cmluZ3MsIHN0cmlwIHF1b3Rlc1xuICAgIHJldHVybiBzcGxpdC5tYXAoYXJndW1lbnQgPT4gcmVwbGFjZXIoYXJndW1lbnQpLnJlcGxhY2UoL1wifCcvZywgJycpKTtcbiAgfVxuXG4gIGdldE9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IHRoaXMuaW5wdXRDd2QuZ2V0KDApLmdldE1vZGVsKCkuZ2V0VGV4dCgpLFxuICAgICAgY21kOiB0aGlzLmlucHV0Q29tbWFuZC5nZXQoMCkuZ2V0TW9kZWwoKS5nZXRUZXh0KCksXG4gICAgICBjbWRBcmdzOiB0aGlzLnNwbGl0QXJncyh0aGlzLmlucHV0Q29tbWFuZEFyZ3MpLFxuICAgICAgZW52OiB0aGlzLmlucHV0RW52LmdldCgwKS5nZXRNb2RlbCgpLmdldFRleHQoKSxcbiAgICAgIHNjcmlwdEFyZ3M6IHRoaXMuc3BsaXRBcmdzKHRoaXMuaW5wdXRTY3JpcHRBcmdzKSxcbiAgICB9O1xuICB9XG5cbiAgc2F2ZU9wdGlvbnMoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuICAgIGZvciAoY29uc3Qgb3B0aW9uIGluIG9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gb3B0aW9uc1tvcHRpb25dO1xuICAgICAgdGhpcy5ydW5PcHRpb25zW29wdGlvbl0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBvblByb2ZpbGVTYXZlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb24tcHJvZmlsZS1zYXZlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gU2F2ZXMgc3BlY2lmaWVkIG9wdGlvbnMgYXMgbmV3IHByb2ZpbGVcbiAgc2F2ZVByb2ZpbGUoKSB7XG4gICAgdGhpcy5oaWRlKCk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XG5cbiAgICBjb25zdCBpbnB1dFZpZXcgPSBuZXcgU2NyaXB0SW5wdXRWaWV3KHsgY2FwdGlvbjogJ0VudGVyIHByb2ZpbGUgbmFtZTonIH0pO1xuICAgIGlucHV0Vmlldy5vbkNhbmNlbCgoKSA9PiB0aGlzLnNob3coKSk7XG4gICAgaW5wdXRWaWV3Lm9uQ29uZmlybSgocHJvZmlsZU5hbWUpID0+IHtcbiAgICAgIGlmICghcHJvZmlsZU5hbWUpIHJldHVybjtcbiAgICAgIF8uZm9yRWFjaCh0aGlzLmZpbmQoJ2F0b20tdGV4dC1lZGl0b3InKSwgKGVkaXRvcikgPT4ge1xuICAgICAgICBlZGl0b3IuZ2V0TW9kZWwoKS5zZXRUZXh0KCcnKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBjbGVhbiB1cCB0aGUgb3B0aW9uc1xuICAgICAgdGhpcy5zYXZlT3B0aW9ucygpO1xuXG4gICAgICAvLyBhZGQgdG8gZ2xvYmFsIHByb2ZpbGVzIGxpc3RcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvbi1wcm9maWxlLXNhdmUnLCB7IG5hbWU6IHByb2ZpbGVOYW1lLCBvcHRpb25zIH0pO1xuICAgIH0pO1xuXG4gICAgaW5wdXRWaWV3LnNob3coKTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuaGlkZSgpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc2hvdygpIHtcbiAgICB0aGlzLnBhbmVsLnNob3coKTtcbiAgICB0aGlzLmlucHV0Q3dkLmZvY3VzKCk7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMucGFuZWwuaGlkZSgpO1xuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIHRoaXMuc2F2ZU9wdGlvbnMoKTtcbiAgICB0aGlzLmhpZGUoKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRoaXMud29ya3NwYWNlVmlldygpLCAnc2NyaXB0OnJ1bicpO1xuICB9XG5cbiAgd29ya3NwYWNlVmlldygpIHtcbiAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICB9XG59XG4iXX0=