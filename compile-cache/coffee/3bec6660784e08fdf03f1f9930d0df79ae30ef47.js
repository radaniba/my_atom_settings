(function() {
  var Config, CustomListView, SelectListView, WSKernel, WSKernelPicker, services, tildify, uuid, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  SelectListView = require('atom-space-pen-views').SelectListView;

  _ = require('lodash');

  tildify = require('tildify');

  Config = require('./config');

  services = require('./jupyter-js-services-shim');

  WSKernel = require('./ws-kernel');

  uuid = require('uuid');

  CustomListView = (function(_super) {
    __extends(CustomListView, _super);

    function CustomListView() {
      return CustomListView.__super__.constructor.apply(this, arguments);
    }

    CustomListView.prototype.initialize = function(emptyMessage, onConfirmed) {
      this.emptyMessage = emptyMessage;
      this.onConfirmed = onConfirmed;
      CustomListView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.focusFilterEditor();
    };

    CustomListView.prototype.getFilterKey = function() {
      return 'name';
    };

    CustomListView.prototype.destroy = function() {
      return this.cancel();
    };

    CustomListView.prototype.viewForItem = function(item) {
      var element;
      element = document.createElement('li');
      element.textContent = item.name;
      return element;
    };

    CustomListView.prototype.cancelled = function() {
      var _ref;
      if ((_ref = this.panel) != null) {
        _ref.destroy();
      }
      return this.panel = null;
    };

    CustomListView.prototype.confirmed = function(item) {
      if (typeof this.onConfirmed === "function") {
        this.onConfirmed(item);
      }
      return this.cancel();
    };

    CustomListView.prototype.getEmptyMessage = function() {
      return this.emptyMessage;
    };

    return CustomListView;

  })(SelectListView);

  module.exports = WSKernelPicker = (function() {
    function WSKernelPicker(onChosen) {
      this._onChosen = onChosen;
    }

    WSKernelPicker.prototype.toggle = function(_grammar, _kernelSpecFilter) {
      var gatewayListing, gateways;
      this._grammar = _grammar;
      this._kernelSpecFilter = _kernelSpecFilter;
      gateways = Config.getJson('gateways', []);
      if (_.isEmpty(gateways)) {
        atom.notifications.addError('No remote kernel gateways available', {
          description: 'Use the Hydrogen package settings to specify the list of remote servers. Hydrogen can use remote kernels on either a Jupyter Kernel Gateway or Jupyter notebook server.'
        });
        return;
      }
      this._path = atom.workspace.getActiveTextEditor().getPath() + '-' + uuid.v4();
      gatewayListing = new CustomListView('No gateways available', this.onGateway.bind(this));
      this.previouslyFocusedElement = gatewayListing.previouslyFocusedElement;
      gatewayListing.setItems(gateways);
      return gatewayListing.setError('Select a gateway');
    };

    WSKernelPicker.prototype.onGateway = function(gatewayInfo) {
      return services.getKernelSpecs(gatewayInfo.options).then((function(_this) {
        return function(specModels) {
          var kernelNames, kernelSpecs, sessionListing;
          kernelSpecs = _.filter(specModels.kernelspecs, function(specModel) {
            return _this._kernelSpecFilter(specModel.spec);
          });
          kernelNames = _.map(kernelSpecs, function(specModel) {
            return specModel.name;
          });
          sessionListing = new CustomListView('No sessions available', _this.onSession.bind(_this));
          sessionListing.previouslyFocusedElement = _this.previouslyFocusedElement;
          sessionListing.setLoading('Loading sessions...');
          return services.listRunningSessions(gatewayInfo.options).then(function(sessionModels) {
            var items;
            sessionModels = sessionModels.filter(function(model) {
              var name, _ref;
              name = (_ref = model.kernel) != null ? _ref.name : void 0;
              if (name != null) {
                return __indexOf.call(kernelNames, name) >= 0;
              } else {
                return true;
              }
            });
            items = sessionModels.map(function(model) {
              var name, _ref;
              if (((_ref = model.notebook) != null ? _ref.path : void 0) != null) {
                name = tildify(model.notebook.path);
              } else {
                name = "Session " + model.id;
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
          }, function(err) {
            return _this.onSession({
              name: '[new session]',
              model: null,
              options: gatewayInfo.options,
              kernelSpecs: kernelSpecs
            });
          });
        };
      })(this), function(err) {
        return atom.notifications.addError('Connection to gateway failed');
      });
    };

    WSKernelPicker.prototype.onSession = function(sessionInfo) {
      var items, kernelListing;
      if (sessionInfo.model == null) {
        kernelListing = new CustomListView('No kernel specs available', this.startSession.bind(this));
        kernelListing.previouslyFocusedElement = this.previouslyFocusedElement;
        items = _.map(sessionInfo.kernelSpecs, (function(_this) {
          return function(specModel) {
            var options;
            options = Object.assign({}, sessionInfo.options);
            options.kernelName = specModel.name;
            options.path = _this._path;
            return {
              name: specModel.spec.display_name,
              options: options
            };
          };
        })(this));
        kernelListing.setItems(items);
        if (sessionInfo.name == null) {
          return kernelListing.setError('This gateway does not support listing sessions');
        }
      } else {
        return services.connectToSession(sessionInfo.model.id, sessionInfo.options).then(this.onSessionChosen.bind(this));
      }
    };

    WSKernelPicker.prototype.startSession = function(sessionInfo) {
      return services.startNewSession(sessionInfo.options).then(this.onSessionChosen.bind(this));
    };

    WSKernelPicker.prototype.onSessionChosen = function(session) {
      return session.kernel.getKernelSpec().then((function(_this) {
        return function(kernelSpec) {
          var kernel;
          kernel = new WSKernel(kernelSpec, _this._grammar, session);
          return _this._onChosen(kernel);
        };
      })(this));
    };

    return WSKernelPicker;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvd3Mta2VybmVsLXBpY2tlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNEZBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSLEVBQWxCLGNBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FGVixDQUFBOztBQUFBLEVBSUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBSlQsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsNEJBQVIsQ0FMWCxDQUFBOztBQUFBLEVBTUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBTlgsQ0FBQTs7QUFBQSxFQU9BLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQVBQLENBQUE7O0FBQUEsRUFTTTtBQUNGLHFDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw2QkFBQSxVQUFBLEdBQVksU0FBRSxZQUFGLEVBQWlCLFdBQWpCLEdBQUE7QUFDUixNQURTLElBQUMsQ0FBQSxlQUFBLFlBQ1YsQ0FBQTtBQUFBLE1BRHdCLElBQUMsQ0FBQSxjQUFBLFdBQ3pCLENBQUE7QUFBQSxNQUFBLGdEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQURBLENBQUE7O1FBRUEsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QjtPQUZWO0FBQUEsTUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQUhBLENBQUE7YUFJQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUxRO0lBQUEsQ0FBWixDQUFBOztBQUFBLDZCQU9BLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDVixPQURVO0lBQUEsQ0FQZCxDQUFBOztBQUFBLDZCQVVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREs7SUFBQSxDQVZULENBQUE7O0FBQUEsNkJBYUEsV0FBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO0FBQ1QsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkIsQ0FBVixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsV0FBUixHQUFzQixJQUFJLENBQUMsSUFEM0IsQ0FBQTthQUVBLFFBSFM7SUFBQSxDQWJiLENBQUE7O0FBQUEsNkJBa0JBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQUE7O1lBQU0sQ0FBRSxPQUFSLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FGRjtJQUFBLENBbEJYLENBQUE7O0FBQUEsNkJBc0JBLFNBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTs7UUFDUCxJQUFDLENBQUEsWUFBYTtPQUFkO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUZPO0lBQUEsQ0F0QlgsQ0FBQTs7QUFBQSw2QkEwQkEsZUFBQSxHQUFpQixTQUFBLEdBQUE7YUFDYixJQUFDLENBQUEsYUFEWTtJQUFBLENBMUJqQixDQUFBOzswQkFBQTs7S0FEeUIsZUFUN0IsQ0FBQTs7QUFBQSxFQXVDQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1csSUFBQSx3QkFBQyxRQUFELEdBQUE7QUFDVCxNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsUUFBYixDQURTO0lBQUEsQ0FBYjs7QUFBQSw2QkFHQSxNQUFBLEdBQVEsU0FBRSxRQUFGLEVBQWEsaUJBQWIsR0FBQTtBQUNKLFVBQUEsd0JBQUE7QUFBQSxNQURLLElBQUMsQ0FBQSxXQUFBLFFBQ04sQ0FBQTtBQUFBLE1BRGdCLElBQUMsQ0FBQSxvQkFBQSxpQkFDakIsQ0FBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQWUsVUFBZixFQUEyQixFQUEzQixDQUFYLENBQUE7QUFDQSxNQUFBLElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQUFWLENBQUg7QUFDSSxRQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIscUNBQTVCLEVBQ0k7QUFBQSxVQUFBLFdBQUEsRUFBYSx5S0FBYjtTQURKLENBQUEsQ0FBQTtBQUlBLGNBQUEsQ0FMSjtPQURBO0FBQUEsTUFRQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFvQyxDQUFDLE9BQXJDLENBQUEsQ0FBQSxHQUFpRCxHQUFqRCxHQUF1RCxJQUFJLENBQUMsRUFBTCxDQUFBLENBUmhFLENBQUE7QUFBQSxNQVNBLGNBQUEsR0FBcUIsSUFBQSxjQUFBLENBQWUsdUJBQWYsRUFBd0MsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQXhDLENBVHJCLENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSx3QkFBRCxHQUE0QixjQUFjLENBQUMsd0JBVjNDLENBQUE7QUFBQSxNQVdBLGNBQWMsQ0FBQyxRQUFmLENBQXdCLFFBQXhCLENBWEEsQ0FBQTthQVlBLGNBQWMsQ0FBQyxRQUFmLENBQXdCLGtCQUF4QixFQWJJO0lBQUEsQ0FIUixDQUFBOztBQUFBLDZCQWtCQSxTQUFBLEdBQVcsU0FBQyxXQUFELEdBQUE7YUFDUCxRQUFRLENBQUMsY0FBVCxDQUF3QixXQUFXLENBQUMsT0FBcEMsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxVQUFELEdBQUE7QUFDRixjQUFBLHdDQUFBO0FBQUEsVUFBQSxXQUFBLEdBQWMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxVQUFVLENBQUMsV0FBcEIsRUFBaUMsU0FBQyxTQUFELEdBQUE7bUJBQzNDLEtBQUMsQ0FBQSxpQkFBRCxDQUFtQixTQUFTLENBQUMsSUFBN0IsRUFEMkM7VUFBQSxDQUFqQyxDQUFkLENBQUE7QUFBQSxVQUdBLFdBQUEsR0FBYyxDQUFDLENBQUMsR0FBRixDQUFNLFdBQU4sRUFBbUIsU0FBQyxTQUFELEdBQUE7bUJBQzdCLFNBQVMsQ0FBQyxLQURtQjtVQUFBLENBQW5CLENBSGQsQ0FBQTtBQUFBLFVBTUEsY0FBQSxHQUFxQixJQUFBLGNBQUEsQ0FBZSx1QkFBZixFQUF3QyxLQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsS0FBaEIsQ0FBeEMsQ0FOckIsQ0FBQTtBQUFBLFVBT0EsY0FBYyxDQUFDLHdCQUFmLEdBQTBDLEtBQUMsQ0FBQSx3QkFQM0MsQ0FBQTtBQUFBLFVBUUEsY0FBYyxDQUFDLFVBQWYsQ0FBMEIscUJBQTFCLENBUkEsQ0FBQTtpQkFVQSxRQUFRLENBQUMsbUJBQVQsQ0FBNkIsV0FBVyxDQUFDLE9BQXpDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxhQUFELEdBQUE7QUFDRixnQkFBQSxLQUFBO0FBQUEsWUFBQSxhQUFBLEdBQWdCLGFBQWEsQ0FBQyxNQUFkLENBQXFCLFNBQUMsS0FBRCxHQUFBO0FBQ2pDLGtCQUFBLFVBQUE7QUFBQSxjQUFBLElBQUEsdUNBQW1CLENBQUUsYUFBckIsQ0FBQTtBQUNBLGNBQUEsSUFBRyxZQUFIO0FBQ0ksdUJBQU8sZUFBUSxXQUFSLEVBQUEsSUFBQSxNQUFQLENBREo7ZUFBQSxNQUFBO0FBR0ksdUJBQU8sSUFBUCxDQUhKO2VBRmlDO1lBQUEsQ0FBckIsQ0FBaEIsQ0FBQTtBQUFBLFlBTUEsS0FBQSxHQUFRLGFBQWEsQ0FBQyxHQUFkLENBQWtCLFNBQUMsS0FBRCxHQUFBO0FBQ3RCLGtCQUFBLFVBQUE7QUFBQSxjQUFBLElBQUcsOERBQUg7QUFDSSxnQkFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBdkIsQ0FBUCxDQURKO2VBQUEsTUFBQTtBQUdJLGdCQUFBLElBQUEsR0FBUSxVQUFBLEdBQVUsS0FBSyxDQUFDLEVBQXhCLENBSEo7ZUFBQTtBQUlBLHFCQUFPO0FBQUEsZ0JBQ0gsSUFBQSxFQUFNLElBREg7QUFBQSxnQkFFSCxLQUFBLEVBQU8sS0FGSjtBQUFBLGdCQUdILE9BQUEsRUFBUyxXQUFXLENBQUMsT0FIbEI7ZUFBUCxDQUxzQjtZQUFBLENBQWxCLENBTlIsQ0FBQTtBQUFBLFlBZ0JBLEtBQUssQ0FBQyxPQUFOLENBQ0k7QUFBQSxjQUFBLElBQUEsRUFBTSxlQUFOO0FBQUEsY0FDQSxLQUFBLEVBQU8sSUFEUDtBQUFBLGNBRUEsT0FBQSxFQUFTLFdBQVcsQ0FBQyxPQUZyQjtBQUFBLGNBR0EsV0FBQSxFQUFhLFdBSGI7YUFESixDQWhCQSxDQUFBO21CQXFCQSxjQUFjLENBQUMsUUFBZixDQUF3QixLQUF4QixFQXRCRTtVQUFBLENBRE4sRUF5QkUsU0FBQyxHQUFELEdBQUE7bUJBSUUsS0FBQyxDQUFBLFNBQUQsQ0FDSTtBQUFBLGNBQUEsSUFBQSxFQUFNLGVBQU47QUFBQSxjQUNBLEtBQUEsRUFBTyxJQURQO0FBQUEsY0FFQSxPQUFBLEVBQVMsV0FBVyxDQUFDLE9BRnJCO0FBQUEsY0FHQSxXQUFBLEVBQWEsV0FIYjthQURKLEVBSkY7VUFBQSxDQXpCRixFQVhFO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixFQThDRSxTQUFDLEdBQUQsR0FBQTtlQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsOEJBQTVCLEVBREY7TUFBQSxDQTlDRixFQURPO0lBQUEsQ0FsQlgsQ0FBQTs7QUFBQSw2QkFxRUEsU0FBQSxHQUFXLFNBQUMsV0FBRCxHQUFBO0FBQ1AsVUFBQSxvQkFBQTtBQUFBLE1BQUEsSUFBTyx5QkFBUDtBQUNJLFFBQUEsYUFBQSxHQUFvQixJQUFBLGNBQUEsQ0FBZSwyQkFBZixFQUE0QyxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsQ0FBNUMsQ0FBcEIsQ0FBQTtBQUFBLFFBQ0EsYUFBYSxDQUFDLHdCQUFkLEdBQXlDLElBQUMsQ0FBQSx3QkFEMUMsQ0FBQTtBQUFBLFFBR0EsS0FBQSxHQUFRLENBQUMsQ0FBQyxHQUFGLENBQU0sV0FBVyxDQUFDLFdBQWxCLEVBQStCLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxTQUFELEdBQUE7QUFDbkMsZ0JBQUEsT0FBQTtBQUFBLFlBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxNQUFQLENBQWMsRUFBZCxFQUFrQixXQUFXLENBQUMsT0FBOUIsQ0FBVixDQUFBO0FBQUEsWUFDQSxPQUFPLENBQUMsVUFBUixHQUFxQixTQUFTLENBQUMsSUFEL0IsQ0FBQTtBQUFBLFlBRUEsT0FBTyxDQUFDLElBQVIsR0FBZSxLQUFDLENBQUEsS0FGaEIsQ0FBQTtBQUdBLG1CQUFPO0FBQUEsY0FDSCxJQUFBLEVBQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxZQURsQjtBQUFBLGNBRUgsT0FBQSxFQUFTLE9BRk47YUFBUCxDQUptQztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9CLENBSFIsQ0FBQTtBQUFBLFFBV0EsYUFBYSxDQUFDLFFBQWQsQ0FBdUIsS0FBdkIsQ0FYQSxDQUFBO0FBWUEsUUFBQSxJQUFPLHdCQUFQO2lCQUNJLGFBQWEsQ0FBQyxRQUFkLENBQXVCLGdEQUF2QixFQURKO1NBYko7T0FBQSxNQUFBO2VBZ0JJLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixXQUFXLENBQUMsS0FBSyxDQUFDLEVBQTVDLEVBQWdELFdBQVcsQ0FBQyxPQUE1RCxDQUFvRSxDQUFDLElBQXJFLENBQTBFLElBQUMsQ0FBQSxlQUFlLENBQUMsSUFBakIsQ0FBc0IsSUFBdEIsQ0FBMUUsRUFoQko7T0FETztJQUFBLENBckVYLENBQUE7O0FBQUEsNkJBd0ZBLFlBQUEsR0FBYyxTQUFDLFdBQUQsR0FBQTthQUNWLFFBQVEsQ0FBQyxlQUFULENBQXlCLFdBQVcsQ0FBQyxPQUFyQyxDQUE2QyxDQUFDLElBQTlDLENBQW1ELElBQUMsQ0FBQSxlQUFlLENBQUMsSUFBakIsQ0FBc0IsSUFBdEIsQ0FBbkQsRUFEVTtJQUFBLENBeEZkLENBQUE7O0FBQUEsNkJBMkZBLGVBQUEsR0FBaUIsU0FBQyxPQUFELEdBQUE7YUFDYixPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWYsQ0FBQSxDQUE4QixDQUFDLElBQS9CLENBQW9DLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFVBQUQsR0FBQTtBQUNoQyxjQUFBLE1BQUE7QUFBQSxVQUFBLE1BQUEsR0FBYSxJQUFBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLEtBQUMsQ0FBQSxRQUF0QixFQUFnQyxPQUFoQyxDQUFiLENBQUE7aUJBQ0EsS0FBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBRmdDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEMsRUFEYTtJQUFBLENBM0ZqQixDQUFBOzswQkFBQTs7TUF6Q0osQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/ws-kernel-picker.coffee
