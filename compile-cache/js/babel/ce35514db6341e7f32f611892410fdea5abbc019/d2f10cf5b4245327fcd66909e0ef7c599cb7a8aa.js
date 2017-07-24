Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _wsKernel = require('./ws-kernel');

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

// View to display a list of grammars to apply to the current editor.
'use babel';

var SignalListView = (function (_SelectListView) {
  _inherits(SignalListView, _SelectListView);

  function SignalListView() {
    _classCallCheck(this, SignalListView);

    _get(Object.getPrototypeOf(SignalListView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SignalListView, [{
    key: 'initialize',
    value: function initialize(kernelManager) {
      this.kernelManager = kernelManager;
      _get(Object.getPrototypeOf(SignalListView.prototype), 'initialize', this).apply(this, arguments);

      this.basicCommands = [{
        name: 'Interrupt',
        value: 'interrupt-kernel'
      }, {
        name: 'Restart',
        value: 'restart-kernel'
      }, {
        name: 'Shut Down',
        value: 'shutdown-kernel'
      }];

      this.wsKernelCommands = [{
        name: 'Rename session for',
        value: 'rename-kernel'
      }, {
        name: 'Disconnect from',
        value: 'disconnect-kernel'
      }];

      this.onConfirmed = null;
      this.list.addClass('mark-active');
      this.setItems([]);
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      if (this.panel) {
        this.cancel();
      } else if (atom.workspace.getActiveTextEditor()) {
        this.editor = atom.workspace.getActiveTextEditor();
        this.attach();
      }
    }
  }, {
    key: 'attach',
    value: function attach() {
      var _this = this;

      // get language from editor
      this.storeFocusedElement();
      if (!this.panel) {
        this.panel = atom.workspace.addModalPanel({ item: this });
      }
      this.focusFilterEditor();
      var grammar = this.editor.getGrammar();
      var language = this.kernelManager.getLanguageFor(grammar);

      // disable all commands if no kernel is running
      var kernel = this.kernelManager.getRunningKernelFor(language);
      if (!kernel) {
        this.setItems([]);
      }

      // add basic commands for the current grammar language
      var basicCommands = this.basicCommands.map(function (command) {
        return {
          name: _this._getCommandName(command.name, kernel.kernelSpec),
          command: command.value,
          grammar: grammar,
          language: language,
          kernel: kernel
        };
      });

      if (kernel instanceof _wsKernel2['default']) {
        var wsKernelCommands = this.wsKernelCommands.map(function (command) {
          return {
            name: _this._getCommandName(command.name, kernel.kernelSpec),
            command: command.value,
            grammar: grammar,
            language: language,
            kernel: kernel
          };
        });
        this.setItems(_lodash2['default'].union(basicCommands, wsKernelCommands));
      } else {
        // add commands to switch to other kernels
        this.kernelManager.getAllKernelSpecsFor(language, function (kernelSpecs) {
          _lodash2['default'].pull(kernelSpecs, kernel.kernelSpec);

          var switchCommands = kernelSpecs.map(function (kernelSpec) {
            return {
              name: _this._getCommandName('Switch to', kernelSpec),
              command: 'switch-kernel',
              grammar: grammar,
              language: language,
              kernelSpec: kernelSpec
            };
          });

          _this.setItems(_lodash2['default'].union(basicCommands, switchCommands));
        });
      }
    }
  }, {
    key: '_getCommandName',
    value: function _getCommandName(name, kernelSpec) {
      return name + ' ' + kernelSpec.display_name + ' kernel';
    }
  }, {
    key: 'confirmed',
    value: function confirmed(item) {
      (0, _log2['default'])('Selected command:', item);
      if (this.onConfirmed) this.onConfirmed(item);
      this.cancel();
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage() {
      return 'No running kernels for this file type.';
    }
  }, {
    key: 'getFilterKey',
    value: function getFilterKey() {
      return 'name';
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.cancel();
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(item) {
      var element = document.createElement('li');
      element.textContent = item.name;
      return element;
    }
  }, {
    key: 'cancelled',
    value: function cancelled() {
      if (this.panel) this.panel.destroy();
      this.panel = null;
      this.editor = null;
    }
  }]);

  return SignalListView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = SignalListView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3NpZ25hbC1saXN0LXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7aUNBRStCLHNCQUFzQjs7c0JBQ3ZDLFFBQVE7Ozs7d0JBRUQsYUFBYTs7OzttQkFDbEIsT0FBTzs7Ozs7QUFOdkIsV0FBVyxDQUFDOztJQVNTLGNBQWM7WUFBZCxjQUFjOztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7K0JBQWQsY0FBYzs7O2VBQWQsY0FBYzs7V0FDdkIsb0JBQUMsYUFBYSxFQUFFO0FBQ3hCLFVBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ25DLGlDQUhpQixjQUFjLDZDQUdYLFNBQVMsRUFBRTs7QUFFL0IsVUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDO0FBQ3BCLFlBQUksRUFBRSxXQUFXO0FBQ2pCLGFBQUssRUFBRSxrQkFBa0I7T0FDMUIsRUFBRTtBQUNELFlBQUksRUFBRSxTQUFTO0FBQ2YsYUFBSyxFQUFFLGdCQUFnQjtPQUN4QixFQUFFO0FBQ0QsWUFBSSxFQUFFLFdBQVc7QUFDakIsYUFBSyxFQUFFLGlCQUFpQjtPQUN6QixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUM7QUFDdkIsWUFBSSxFQUFFLG9CQUFvQjtBQUMxQixhQUFLLEVBQUUsZUFBZTtPQUN2QixFQUFFO0FBQ0QsWUFBSSxFQUFFLGlCQUFpQjtBQUN2QixhQUFLLEVBQUUsbUJBQW1CO09BQzNCLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNsQyxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ25COzs7V0FHSyxrQkFBRztBQUNQLFVBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNkLFlBQUksQ0FBQyxN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QUFFO0FBQ2QsNEJBQUksbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0IsVUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2Y7OztXQUdjLDJCQUFHO0FBQ2hCLGFBQU8sd0NBQXdDLENBQUM7S0FDakQ7OztXQUdXLHdCQUFHO0FBQ2IsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1dBR00sbUJBQUc7QUFDUixVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBR1UscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLFVBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsYUFBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ2hDLGFBQU8sT0FBTyxDQUFDO0tBQ2hCOzs7V0FHUSxxQkFBRztBQUNWLFVBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0tBQ3BCOzs7U0FqSWtCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3NpZ25hbC1saXN0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgU2VsZWN0TGlzdFZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgV1NLZXJuZWwgZnJvbSAnLi93cy1rZXJuZWwnO1xuaW1wb3J0IGxvZyBmcm9tICcuL2xvZyc7XG5cbi8vIFZpZXcgdG8gZGlzcGxheSBhIGxpc3Qgb2YgZ3JhbW1hcnMgdG8gYXBwbHkgdG8gdGhlIGN1cnJlbnQgZWRpdG9yLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2lnbmFsTGlzdFZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0VmlldyB7XG4gIGluaXRpYWxpemUoa2VybmVsTWFuYWdlcikge1xuICAgIHRoaXMua2VybmVsTWFuYWdlciA9IGtlcm5lbE1hbmFnZXI7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSguLi5hcmd1bWVudHMpO1xuXG4gICAgdGhpcy5iYXNpY0NvbW1hbmRzID0gW3tcbiAgICAgIG5hbWU6ICdJbnRlcnJ1cHQnLFxuICAgICAgdmFsdWU6ICdpbnRlcnJ1cHQta2VybmVsJyxcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnUmVzdGFydCcsXG4gICAgICB2YWx1ZTogJ3Jlc3RhcnQta2VybmVsJyxcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnU2h1dCBEb3duJyxcbiAgICAgIHZhbHVlOiAnc2h1dGRvd24ta2VybmVsJyxcbiAgICB9XTtcblxuICAgIHRoaXMud3NLZXJuZWxDb21tYW5kcyA9IFt7XG4gICAgICBuYW1lOiAnUmVuYW1lIHNlc3Npb24gZm9yJyxcbiAgICAgIHZhbHVlOiAncmVuYW1lLWtlcm5lbCcsXG4gICAgfSwge1xuICAgICAgbmFtZTogJ0Rpc2Nvbm5lY3QgZnJvbScsXG4gICAgICB2YWx1ZTogJ2Rpc2Nvbm5lY3Qta2VybmVsJyxcbiAgICB9XTtcblxuICAgIHRoaXMub25Db25maXJtZWQgPSBudWxsO1xuICAgIHRoaXMubGlzdC5hZGRDbGFzcygnbWFyay1hY3RpdmUnKTtcbiAgICB0aGlzLnNldEl0ZW1zKFtdKTtcbiAgfVxuXG5cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLmNhbmNlbCgpO1xuICAgIH0gZWxzZSBpZiAoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKSB7XG4gICAgICB0aGlzLmVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgfVxuICB9XG5cblxuICBhdHRhY2goKSB7XG4gICAgLy8gZ2V0IGxhbmd1YWdlIGZyb20gZWRpdG9yXG4gICAgdGhpcy5zdG9yZUZvY3VzZWRFbGVtZW50KCk7XG4gICAgaWYgKCF0aGlzLnBhbmVsKSB7IHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcyB9KTsgfVxuICAgIHRoaXMuZm9jdXNGaWx0ZXJFZGl0b3IoKTtcbiAgICBjb25zdCBncmFtbWFyID0gdGhpcy5lZGl0b3IuZ2V0R3JhbW1hcigpO1xuICAgIGNvbnN0IGxhbmd1YWdlID0gdGhpcy5rZXJuZWxNYW5hZ2VyLmdldExhbmd1YWdlRm9yKGdyYW1tYXIpO1xuXG4gICAgLy8gZGlzYWJsZSBhbGwgY29tbWFuZHMgaWYgbm8ga2VybmVsIGlzIHJ1bm5pbmdcbiAgICBjb25zdCBrZXJuZWwgPSB0aGlzLmtlcm5lbE1hbmFnZXIuZ2V0UnVubmluZ0tlcm5lbEZvcihsYW5ndWFnZSk7XG4gICAgaWYgKCFrZXJuZWwpIHtcbiAgICAgIHRoaXMuc2V0SXRlbXMoW10pO1xuICAgIH1cblxuICAgIC8vIGFkZCBiYXNpYyBjb21tYW5kcyBmb3IgdGhlIGN1cnJlbnQgZ3JhbW1hciBsYW5ndWFnZVxuICAgIGNvbnN0IGJhc2ljQ29tbWFuZHMgPSB0aGlzLmJhc2ljQ29tbWFuZHMubWFwKGNvbW1hbmQgPT4gKHtcbiAgICAgIG5hbWU6IHRoaXMuX2dldENvbW1hbmROYW1lKGNvbW1hbmQubmFtZSwga2VybmVsLmtlcm5lbFNwZWMpLFxuICAgICAgY29tbWFuZDogY29tbWFuZC52YWx1ZSxcbiAgICAgIGdyYW1tYXIsXG4gICAgICBsYW5ndWFnZSxcbiAgICAgIGtlcm5lbCxcbiAgICB9KSk7XG5cbiAgICBpZiAoa2VybmVsIGluc3RhbmNlb2YgV1NLZXJuZWwpIHtcbiAgICAgIGNvbnN0IHdzS2VybmVsQ29tbWFuZHMgPSB0aGlzLndzS2VybmVsQ29tbWFuZHMubWFwKGNvbW1hbmQgPT4gKHtcbiAgICAgICAgbmFtZTogdGhpcy5fZ2V0Q29tbWFuZE5hbWUoY29tbWFuZC5uYW1lLCBrZXJuZWwua2VybmVsU3BlYyksXG4gICAgICAgIGNvbW1hbmQ6IGNvbW1hbmQudmFsdWUsXG4gICAgICAgIGdyYW1tYXIsXG4gICAgICAgIGxhbmd1YWdlLFxuICAgICAgICBrZXJuZWwsXG4gICAgICB9KSk7XG4gICAgICB0aGlzLnNldEl0ZW1zKF8udW5pb24oYmFzaWNDb21tYW5kcywgd3NLZXJuZWxDb21tYW5kcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhZGQgY29tbWFuZHMgdG8gc3dpdGNoIHRvIG90aGVyIGtlcm5lbHNcbiAgICAgIHRoaXMua2VybmVsTWFuYWdlci5nZXRBbGxLZXJuZWxTcGVjc0ZvcihsYW5ndWFnZSwgKGtlcm5lbFNwZWNzKSA9PiB7XG4gICAgICAgIF8ucHVsbChrZXJuZWxTcGVjcywga2VybmVsLmtlcm5lbFNwZWMpO1xuXG4gICAgICAgIGNvbnN0IHN3aXRjaENvbW1hbmRzID0ga2VybmVsU3BlY3MubWFwKGtlcm5lbFNwZWMgPT4gKHtcbiAgICAgICAgICBuYW1lOiB0aGlzLl9nZXRDb21tYW5kTmFtZSgnU3dpdGNoIHRvJywga2VybmVsU3BlYyksXG4gICAgICAgICAgY29tbWFuZDogJ3N3aXRjaC1rZXJuZWwnLFxuICAgICAgICAgIGdyYW1tYXIsXG4gICAgICAgICAgbGFuZ3VhZ2UsXG4gICAgICAgICAga2VybmVsU3BlYyxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuc2V0SXRlbXMoXy51bmlvbihiYXNpY0NvbW1hbmRzLCBzd2l0Y2hDb21tYW5kcykpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuICBfZ2V0Q29tbWFuZE5hbWUobmFtZSwga2VybmVsU3BlYykge1xuICAgIHJldHVybiBgJHtuYW1lfSAke2tlcm5lbFNwZWMuZGlzcGxheV9uYW1lfSBrZXJuZWxgO1xuICB9XG5cblxuICBjb25maXJtZWQoaXRlbSkge1xuICAgIGxvZygnU2VsZWN0ZWQgY29tbWFuZDonLCBpdGVtKTtcbiAgICBpZiAodGhpcy5vbkNvbmZpcm1lZCkgdGhpcy5vbkNvbmZpcm1lZChpdGVtKTtcbiAgICB0aGlzLmNhbmNlbCgpO1xuICB9XG5cblxuICBnZXRFbXB0eU1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuICdObyBydW5uaW5nIGtlcm5lbHMgZm9yIHRoaXMgZmlsZSB0eXBlLic7XG4gIH1cblxuXG4gIGdldEZpbHRlcktleSgpIHtcbiAgICByZXR1cm4gJ25hbWUnO1xuICB9XG5cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gIH1cblxuXG4gIHZpZXdGb3JJdGVtKGl0ZW0pIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBlbGVtZW50LnRleHRDb250ZW50ID0gaXRlbS5uYW1lO1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cblxuICBjYW5jZWxsZWQoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwpIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIHRoaXMuZWRpdG9yID0gbnVsbDtcbiAgfVxufVxuIl19