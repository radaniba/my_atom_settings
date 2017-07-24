Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _tildify = require('tildify');

var _tildify2 = _interopRequireDefault(_tildify);

var _uuidV4 = require('uuid/v4');

var _uuidV42 = _interopRequireDefault(_uuidV4);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _jupyterJsServicesShim = require('./jupyter-js-services-shim');

var services = _interopRequireWildcard(_jupyterJsServicesShim);

var _wsKernel = require('./ws-kernel');

var _wsKernel2 = _interopRequireDefault(_wsKernel);

'use babel';

var CustomListView = (function (_SelectListView) {
  _inherits(CustomListView, _SelectListView);

  function CustomListView() {
    _classCallCheck(this, CustomListView);

    _get(Object.getPrototypeOf(CustomListView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CustomListView, [{
    key: 'initialize',
    value: function initialize(emptyMessage, onConfirmed) {
      this.emptyMessage = emptyMessage;
      this.onConfirmed = onConfirmed;
      _get(Object.getPrototypeOf(CustomListView.prototype), 'initialize', this).apply(this, arguments);
      this.storeFocusedElement();
      if (!this.panel) {
        this.panel = atom.workspace.addModalPanel({ item: this });
      }
      this.panel.show();
      this.focusFilterEditor();
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
    }
  }, {
    key: 'confirmed',
    value: function confirmed(item) {
      if (this.onConfirmed) this.onConfirmed(item);
      this.cancel();
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage() {
      return this.emptyMessage;
    }
  }]);

  return CustomListView;
})(_atomSpacePenViews.SelectListView);

var WSKernelPicker = (function () {
  function WSKernelPicker(onChosen) {
    _classCallCheck(this, WSKernelPicker);

    this._onChosen = onChosen;
  }

  _createClass(WSKernelPicker, [{
    key: 'toggle',
    value: function toggle(_grammar, _kernelSpecFilter) {
      this._grammar = _grammar;
      this._kernelSpecFilter = _kernelSpecFilter;
      var gateways = _config2['default'].getJson('gateways', []);
      if (_lodash2['default'].isEmpty(gateways)) {
        atom.notifications.addError('No remote kernel gateways available', {
          description: 'Use the Hydrogen package settings to specify the list of remote servers. Hydrogen can use remote kernels on either a Jupyter Kernel Gateway or Jupyter notebook server.'
        });
        return;
      }

      this._path = atom.workspace.getActiveTextEditor().getPath() + '-' + (0, _uuidV42['default'])();
      var gatewayListing = new CustomListView('No gateways available', this.onGateway.bind(this));
      this.previouslyFocusedElement = gatewayListing.previouslyFocusedElement;
      gatewayListing.setItems(gateways);
      gatewayListing.setError('Select a gateway'); // TODO(nikita): maybe don't misuse error
    }
  }, {
    key: 'onGateway',
    value: function onGateway(gatewayInfo) {
      var _this = this;

      services.Kernel.getSpecs(gatewayInfo.options).then(function (specModels) {
        var kernelSpecs = _lodash2['default'].filter(specModels.kernelspecs, function (spec) {
          return _this._kernelSpecFilter(spec);
        });

        var kernelNames = _lodash2['default'].map(kernelSpecs, function (specModel) {
          return specModel.name;
        });

        var sessionListing = new CustomListView('No sessions available', _this.onSession.bind(_this));
        sessionListing.previouslyFocusedElement = _this.previouslyFocusedElement;
        sessionListing.setLoading('Loading sessions...');

        services.Session.listRunning(gatewayInfo.options).then(function (sessionModels) {
          sessionModels = sessionModels.filter(function (model) {
            var name = model.kernel ? model.kernel.name : null;
            return name ? kernelNames.includes(name) : true;
          });
          var items = sessionModels.map(function (model) {
            var name = undefined;
            if (model.notebook && model.notebook.path) {
              name = (0, _tildify2['default'])(model.notebook.path);
            } else {
              name = 'Session ' + model.id;
            }
            return {
              name: name,
              model: model,
              options: gatewayInfo.options
            };
          });
          items.unshift({
            name: '[new session]',
            model: null,
            options: gatewayInfo.options,
            kernelSpecs: kernelSpecs
          });
          return sessionListing.setItems(items);
        }, function () {
          return(
            // Gateways offer the option of never listing sessions, for security
            // reasons.
            // Assume this is the case and proceed to creating a new session.
            _this.onSession({
              name: '[new session]',
              model: null,
              options: gatewayInfo.options,
              kernelSpecs: kernelSpecs
            })
          );
        });
      }, function () {
        return atom.notifications.addError('Connection to gateway failed');
      });
    }
  }, {
    key: 'onSession',
    value: function onSession(sessionInfo) {
      var _this2 = this;

      if (!sessionInfo.model) {
        var kernelListing = new CustomListView('No kernel specs available', this.startSession.bind(this));
        kernelListing.previouslyFocusedElement = this.previouslyFocusedElement;

        var items = _lodash2['default'].map(sessionInfo.kernelSpecs, function (spec) {
          var options = Object.assign({}, sessionInfo.options);
          options.kernelName = spec.name;
          options.path = _this2._path;
          return {
            name: spec.display_name,
            options: options
          };
        });
        kernelListing.setItems(items);
        if (!sessionInfo.name) {
          kernelListing.setError('This gateway does not support listing sessions');
        }
      } else {
        services.Session.connectTo(sessionInfo.model.id, sessionInfo.options).then(this.onSessionChosen.bind(this));
      }
    }
  }, {
    key: 'startSession',
    value: function startSession(sessionInfo) {
      services.Session.startNew(sessionInfo.options).then(this.onSessionChosen.bind(this));
    }
  }, {
    key: 'onSessionChosen',
    value: function onSessionChosen(session) {
      var _this3 = this;

      session.kernel.getSpec().then(function (kernelSpec) {
        var kernel = new _wsKernel2['default'](kernelSpec, _this3._grammar, session);
        _this3._onChosen(kernel);
      });
    }
  }]);

  return WSKernelPicker;
})();

exports['default'] = WSKernelPicker;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3dzLWtlcm5lbC1waWNrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztpQ0FFK0Isc0JBQXNCOztzQkFDdkMsUUFBUTs7Ozt1QkFDRixTQUFTOzs7O3NCQUNkLFNBQVM7Ozs7c0JBRUwsVUFBVTs7OztxQ0FDSCw0QkFBNEI7O0lBQTFDLFFBQVE7O3dCQUNDLGFBQWE7Ozs7QUFUbEMsV0FBVyxDQUFDOztJQVdOLGNBQWM7WUFBZCxjQUFjOztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7K0JBQWQsY0FBYzs7O2VBQWQsY0FBYzs7V0FDUixvQkFBQyxZQUFZLEVBQUUsV0FBVyxFQUFFO0FBQ3BDLFVBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQy9CLGlDQUpFLGNBQWMsNkNBSUksU0FBUyxFQUFFO0FBQy9CLFVBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQUUsWUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO09BQUU7QUFDL0UsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQixVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUMxQjs7O1dBRVcsd0JBQUc7QUFDYixhQUFPLE1BQU0sQ0FBQztLQUNmOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0FFVSxxQkFBQyxJQUFJLEVBQUU7QUFDaEIsVUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxhQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FB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LENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUMxQzs7O1dBRWMseUJBQUMsT0FBTyxFQUFFOzs7QUFDdkIsYUFBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxVQUFVLEVBQUs7QUFDNUMsWUFBTSxNQUFNLEdBQUcsMEJBQWEsVUFBVSxFQUFFLE9BQUssUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hFLGVBQUssU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3hCLENBQUMsQ0FBQztLQUNKOzs7U0E5R2tCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3dzLWtlcm5lbC1waWNrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgU2VsZWN0TGlzdFZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHRpbGRpZnkgZnJvbSAndGlsZGlmeSc7XG5pbXBvcnQgdjQgZnJvbSAndXVpZC92NCc7XG5cbmltcG9ydCBDb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0ICogYXMgc2VydmljZXMgZnJvbSAnLi9qdXB5dGVyLWpzLXNlcnZpY2VzLXNoaW0nO1xuaW1wb3J0IFdTS2VybmVsIGZyb20gJy4vd3Mta2VybmVsJztcblxuY2xhc3MgQ3VzdG9tTGlzdFZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0VmlldyB7XG4gIGluaXRpYWxpemUoZW1wdHlNZXNzYWdlLCBvbkNvbmZpcm1lZCkge1xuICAgIHRoaXMuZW1wdHlNZXNzYWdlID0gZW1wdHlNZXNzYWdlO1xuICAgIHRoaXMub25Db25maXJtZWQgPSBvbkNvbmZpcm1lZDtcbiAgICBzdXBlci5pbml0aWFsaXplKC4uLmFyZ3VtZW50cyk7XG4gICAgdGhpcy5zdG9yZUZvY3VzZWRFbGVtZW50KCk7XG4gICAgaWYgKCF0aGlzLnBhbmVsKSB7IHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcyB9KTsgfVxuICAgIHRoaXMucGFuZWwuc2hvdygpO1xuICAgIHRoaXMuZm9jdXNGaWx0ZXJFZGl0b3IoKTtcbiAgfVxuXG4gIGdldEZpbHRlcktleSgpIHtcbiAgICByZXR1cm4gJ25hbWUnO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbmNlbCgpO1xuICB9XG5cbiAgdmlld0Zvckl0ZW0oaXRlbSkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBpdGVtLm5hbWU7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICBjYW5jZWxsZWQoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwpIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICB9XG5cbiAgY29uZmlybWVkKGl0ZW0pIHtcbiAgICBpZiAodGhpcy5vbkNvbmZpcm1lZCkgdGhpcy5vbkNvbmZpcm1lZChpdGVtKTtcbiAgICB0aGlzLmNhbmNlbCgpO1xuICB9XG5cbiAgZ2V0RW1wdHlNZXNzYWdlKCkge1xuICAgIHJldHVybiB0aGlzLmVtcHR5TWVzc2FnZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXU0tlcm5lbFBpY2tlciB7XG4gIGNvbnN0cnVjdG9yKG9uQ2hvc2VuKSB7XG4gICAgdGhpcy5fb25DaG9zZW4gPSBvbkNob3NlbjtcbiAgfVxuXG4gIHRvZ2dsZShfZ3JhbW1hciwgX2tlcm5lbFNwZWNGaWx0ZXIpIHtcbiAgICB0aGlzLl9ncmFtbWFyID0gX2dyYW1tYXI7XG4gICAgdGhpcy5fa2VybmVsU3BlY0ZpbHRlciA9IF9rZXJuZWxTcGVjRmlsdGVyO1xuICAgIGNvbnN0IGdhdGV3YXlzID0gQ29uZmlnLmdldEpzb24oJ2dhdGV3YXlzJywgW10pO1xuICAgIGlmIChfLmlzRW1wdHkoZ2F0ZXdheXMpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ05vIHJlbW90ZSBrZXJuZWwgZ2F0ZXdheXMgYXZhaWxhYmxlJywge1xuICAgICAgICBkZXNjcmlwdGlvbjogJ1VzZSB0aGUgSHlkcm9nZW4gcGFja2FnZSBzZXR0aW5ncyB0byBzcGVjaWZ5IHRoZSBsaXN0IG9mIHJlbW90ZSBzZXJ2ZXJzLiBIeWRyb2dlbiBjYW4gdXNlIHJlbW90ZSBrZXJuZWxzIG9uIGVpdGhlciBhIEp1cHl0ZXIgS2VybmVsIEdhdGV3YXkgb3IgSnVweXRlciBub3RlYm9vayBzZXJ2ZXIuJyxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3BhdGggPSBgJHthdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0UGF0aCgpfS0ke3Y0KCl9YDtcbiAgICBjb25zdCBnYXRld2F5TGlzdGluZyA9IG5ldyBDdXN0b21MaXN0VmlldygnTm8gZ2F0ZXdheXMgYXZhaWxhYmxlJywgdGhpcy5vbkdhdGV3YXkuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBnYXRld2F5TGlzdGluZy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ7XG4gICAgZ2F0ZXdheUxpc3Rpbmcuc2V0SXRlbXMoZ2F0ZXdheXMpO1xuICAgIGdhdGV3YXlMaXN0aW5nLnNldEVycm9yKCdTZWxlY3QgYSBnYXRld2F5Jyk7IC8vIFRPRE8obmlraXRhKTogbWF5YmUgZG9uJ3QgbWlzdXNlIGVycm9yXG4gIH1cblxuICBvbkdhdGV3YXkoZ2F0ZXdheUluZm8pIHtcbiAgICBzZXJ2aWNlcy5LZXJuZWwuZ2V0U3BlY3MoZ2F0ZXdheUluZm8ub3B0aW9ucylcbiAgICAgIC50aGVuKChzcGVjTW9kZWxzKSA9PiB7XG4gICAgICAgIGNvbnN0IGtlcm5lbFNwZWNzID0gXy5maWx0ZXIoc3BlY01vZGVscy5rZXJuZWxzcGVjcywgc3BlYyA9PlxuICAgICAgICAgIHRoaXMuX2tlcm5lbFNwZWNGaWx0ZXIoc3BlYykpO1xuXG4gICAgICAgIGNvbnN0IGtlcm5lbE5hbWVzID0gXy5tYXAoa2VybmVsU3BlY3MsIHNwZWNNb2RlbCA9PiBzcGVjTW9kZWwubmFtZSk7XG5cbiAgICAgICAgY29uc3Qgc2Vzc2lvbkxpc3RpbmcgPSBuZXcgQ3VzdG9tTGlzdFZpZXcoJ05vIHNlc3Npb25zIGF2YWlsYWJsZScsIHRoaXMub25TZXNzaW9uLmJpbmQodGhpcykpO1xuICAgICAgICBzZXNzaW9uTGlzdGluZy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudDtcbiAgICAgICAgc2Vzc2lvbkxpc3Rpbmcuc2V0TG9hZGluZygnTG9hZGluZyBzZXNzaW9ucy4uLicpO1xuXG4gICAgICAgIHNlcnZpY2VzLlNlc3Npb24ubGlzdFJ1bm5pbmcoZ2F0ZXdheUluZm8ub3B0aW9ucylcbiAgICAgICAgICAudGhlbigoc2Vzc2lvbk1vZGVscykgPT4ge1xuICAgICAgICAgICAgc2Vzc2lvbk1vZGVscyA9IHNlc3Npb25Nb2RlbHMuZmlsdGVyKChtb2RlbCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gKG1vZGVsLmtlcm5lbCkgPyBtb2RlbC5rZXJuZWwubmFtZSA6IG51bGw7XG4gICAgICAgICAgICAgIHJldHVybiAobmFtZSkgPyBrZXJuZWxOYW1lcy5pbmNsdWRlcyhuYW1lKSA6IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gc2Vzc2lvbk1vZGVscy5tYXAoKG1vZGVsKSA9PiB7XG4gICAgICAgICAgICAgIGxldCBuYW1lO1xuICAgICAgICAgICAgICBpZiAobW9kZWwubm90ZWJvb2sgJiYgbW9kZWwubm90ZWJvb2sucGF0aCkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSB0aWxkaWZ5KG1vZGVsLm5vdGVib29rLnBhdGgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBgU2Vzc2lvbiAke21vZGVsLmlkfWA7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIG1vZGVsLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGdhdGV3YXlJbmZvLm9wdGlvbnMsXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZW1zLnVuc2hpZnQoe1xuICAgICAgICAgICAgICBuYW1lOiAnW25ldyBzZXNzaW9uXScsXG4gICAgICAgICAgICAgIG1vZGVsOiBudWxsLFxuICAgICAgICAgICAgICBvcHRpb25zOiBnYXRld2F5SW5mby5vcHRpb25zLFxuICAgICAgICAgICAgICBrZXJuZWxTcGVjcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHNlc3Npb25MaXN0aW5nLnNldEl0ZW1zKGl0ZW1zKTtcbiAgICAgICAgICB9LCAoKSA9PlxuICAgICAgICAgICAgICAvLyBHYXRld2F5cyBvZmZlciB0aGUgb3B0aW9uIG9mIG5ldmVyIGxpc3Rpbmcgc2Vzc2lvbnMsIGZvciBzZWN1cml0eVxuICAgICAgICAgICAgICAvLyByZWFzb25zLlxuICAgICAgICAgICAgICAvLyBBc3N1bWUgdGhpcyBpcyB0aGUgY2FzZSBhbmQgcHJvY2VlZCB0byBjcmVhdGluZyBhIG5ldyBzZXNzaW9uLlxuICAgICAgICAgICAgICAgdGhpcy5vblNlc3Npb24oe1xuICAgICAgICAgICAgICAgICBuYW1lOiAnW25ldyBzZXNzaW9uXScsXG4gICAgICAgICAgICAgICAgIG1vZGVsOiBudWxsLFxuICAgICAgICAgICAgICAgICBvcHRpb25zOiBnYXRld2F5SW5mby5vcHRpb25zLFxuICAgICAgICAgICAgICAgICBrZXJuZWxTcGVjcyxcbiAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICk7XG4gICAgICB9LCAoKSA9PiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0Nvbm5lY3Rpb24gdG8gZ2F0ZXdheSBmYWlsZWQnKSk7XG4gIH1cblxuXG4gIG9uU2Vzc2lvbihzZXNzaW9uSW5mbykge1xuICAgIGlmICghc2Vzc2lvbkluZm8ubW9kZWwpIHtcbiAgICAgIGNvbnN0IGtlcm5lbExpc3RpbmcgPSBuZXcgQ3VzdG9tTGlzdFZpZXcoJ05vIGtlcm5lbCBzcGVjcyBhdmFpbGFibGUnLCB0aGlzLnN0YXJ0U2Vzc2lvbi5iaW5kKHRoaXMpKTtcbiAgICAgIGtlcm5lbExpc3RpbmcucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ7XG5cbiAgICAgIGNvbnN0IGl0ZW1zID0gXy5tYXAoc2Vzc2lvbkluZm8ua2VybmVsU3BlY3MsIChzcGVjKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBzZXNzaW9uSW5mby5vcHRpb25zKTtcbiAgICAgICAgb3B0aW9ucy5rZXJuZWxOYW1lID0gc3BlYy5uYW1lO1xuICAgICAgICBvcHRpb25zLnBhdGggPSB0aGlzLl9wYXRoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IHNwZWMuZGlzcGxheV9uYW1lLFxuICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGtlcm5lbExpc3Rpbmcuc2V0SXRlbXMoaXRlbXMpO1xuICAgICAgaWYgKCFzZXNzaW9uSW5mby5uYW1lKSB7XG4gICAgICAgIGtlcm5lbExpc3Rpbmcuc2V0RXJyb3IoJ1RoaXMgZ2F0ZXdheSBkb2VzIG5vdCBzdXBwb3J0IGxpc3Rpbmcgc2Vzc2lvbnMnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2VydmljZXMuU2Vzc2lvbi5jb25uZWN0VG8oc2Vzc2lvbkluZm8ubW9kZWwuaWQsIHNlc3Npb25JbmZvLm9wdGlvbnMpXG4gICAgICAgIC50aGVuKHRoaXMub25TZXNzaW9uQ2hvc2VuLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0U2Vzc2lvbihzZXNzaW9uSW5mbykge1xuICAgIHNlcnZpY2VzLlNlc3Npb24uc3RhcnROZXcoc2Vzc2lvbkluZm8ub3B0aW9ucylcbiAgICAgIC50aGVuKHRoaXMub25TZXNzaW9uQ2hvc2VuLmJpbmQodGhpcykpO1xuICB9XG5cbiAgb25TZXNzaW9uQ2hvc2VuKHNlc3Npb24pIHtcbiAgICBzZXNzaW9uLmtlcm5lbC5nZXRTcGVjKCkudGhlbigoa2VybmVsU3BlYykgPT4ge1xuICAgICAgY29uc3Qga2VybmVsID0gbmV3IFdTS2VybmVsKGtlcm5lbFNwZWMsIHRoaXMuX2dyYW1tYXIsIHNlc3Npb24pO1xuICAgICAgdGhpcy5fb25DaG9zZW4oa2VybmVsKTtcbiAgICB9KTtcbiAgfVxufVxuIl19