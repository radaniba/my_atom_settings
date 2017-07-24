(function() {
  var ColorProjectElement, CompositeDisposable, EventsDelegation, SpacePenDSL, capitalize, registerOrUpdateElement, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-utils'), SpacePenDSL = _ref.SpacePenDSL, EventsDelegation = _ref.EventsDelegation, registerOrUpdateElement = _ref.registerOrUpdateElement;

  CompositeDisposable = null;

  capitalize = function(s) {
    return s.replace(/^./, function(m) {
      return m.toUpperCase();
    });
  };

  ColorProjectElement = (function(_super) {
    __extends(ColorProjectElement, _super);

    function ColorProjectElement() {
      return ColorProjectElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(ColorProjectElement);

    EventsDelegation.includeInto(ColorProjectElement);

    ColorProjectElement.content = function() {
      var arrayField, booleanField, selectField;
      arrayField = (function(_this) {
        return function(name, label, setting, description) {
          var settingName;
          settingName = "pigments." + name;
          return _this.div({
            "class": 'control-group array'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.label({
                "class": 'control-label'
              }, function() {
                return _this.span({
                  "class": 'setting-title'
                }, label);
              });
              return _this.div({
                "class": 'control-wrapper'
              }, function() {
                _this.tag('atom-text-editor', {
                  mini: true,
                  outlet: name,
                  type: 'array',
                  property: name
                });
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  _this.div(function() {
                    _this.raw("Global config: <code>" + (atom.config.get(setting != null ? setting : settingName).join(', ')) + "</code>");
                    if (description != null) {
                      return _this.p(function() {
                        return _this.raw(description);
                      });
                    }
                  });
                  return booleanField("ignoreGlobal" + (capitalize(name)), 'Ignore Global', null, true);
                });
              });
            });
          });
        };
      })(this);
      selectField = (function(_this) {
        return function(name, label, _arg) {
          var description, options, setting, settingName, useBoolean, _ref1;
          _ref1 = _arg != null ? _arg : {}, options = _ref1.options, setting = _ref1.setting, description = _ref1.description, useBoolean = _ref1.useBoolean;
          settingName = "pigments." + name;
          return _this.div({
            "class": 'control-group array'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.label({
                "class": 'control-label'
              }, function() {
                return _this.span({
                  "class": 'setting-title'
                }, label);
              });
              return _this.div({
                "class": 'control-wrapper'
              }, function() {
                _this.select({
                  outlet: name,
                  "class": 'form-control',
                  required: true
                }, function() {
                  return options.forEach(function(option) {
                    if (option === '') {
                      return _this.option({
                        value: option
                      }, 'Use global config');
                    } else {
                      return _this.option({
                        value: option
                      }, capitalize(option));
                    }
                  });
                });
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  _this.div(function() {
                    _this.raw("Global config: <code>" + (atom.config.get(setting != null ? setting : settingName)) + "</code>");
                    if (description != null) {
                      return _this.p(function() {
                        return _this.raw(description);
                      });
                    }
                  });
                  if (useBoolean) {
                    return booleanField("ignoreGlobal" + (capitalize(name)), 'Ignore Global', null, true);
                  }
                });
              });
            });
          });
        };
      })(this);
      booleanField = (function(_this) {
        return function(name, label, description, nested) {
          return _this.div({
            "class": 'control-group boolean'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.input({
                type: 'checkbox',
                id: "pigments-" + name,
                outlet: name
              });
              _this.label({
                "class": 'control-label',
                "for": "pigments-" + name
              }, function() {
                return _this.span({
                  "class": (nested ? 'setting-description' : 'setting-title')
                }, label);
              });
              if (description != null) {
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  return _this.raw(description);
                });
              }
            });
          });
        };
      })(this);
      return this.section({
        "class": 'settings-view pane-item'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'settings-wrapper'
          }, function() {
            _this.div({
              "class": 'header'
            }, function() {
              _this.div({
                "class": 'logo'
              }, function() {
                return _this.img({
                  src: 'atom://pigments/resources/logo.svg',
                  width: 140,
                  height: 35
                });
              });
              return _this.p({
                "class": 'setting-description'
              }, "These settings apply on the current project only and are complementary\nto the package settings.");
            });
            return _this.div({
              "class": 'fields'
            }, function() {
              var themes;
              themes = atom.themes.getActiveThemeNames();
              arrayField('sourceNames', 'Source Names');
              arrayField('ignoredNames', 'Ignored Names');
              arrayField('supportedFiletypes', 'Supported Filetypes');
              arrayField('ignoredScopes', 'Ignored Scopes');
              arrayField('searchNames', 'Extended Search Names', 'pigments.extendedSearchNames');
              selectField('sassShadeAndTintImplementation', 'Sass Shade And Tint Implementation', {
                options: ['', 'compass', 'bourbon'],
                setting: 'pigments.sassShadeAndTintImplementation',
                description: "Sass doesn't provide any implementation for shade and tint function, and Compass and Bourbon have different implementation for these two methods. This setting allow you to chose which implementation use."
              });
              return booleanField('includeThemes', 'Include Atom Themes Stylesheets', "The variables from <code>" + themes[0] + "</code> and\n<code>" + themes[1] + "</code> themes will be automatically added to the\nproject palette.");
            });
          });
        };
      })(this));
    };

    ColorProjectElement.prototype.createdCallback = function() {
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      return this.subscriptions = new CompositeDisposable;
    };

    ColorProjectElement.prototype.setModel = function(project) {
      this.project = project;
      return this.initializeBindings();
    };

    ColorProjectElement.prototype.initializeBindings = function() {
      var grammar;
      grammar = atom.grammars.grammarForScopeName('source.js.regexp');
      this.ignoredScopes.getModel().setGrammar(grammar);
      this.initializeTextEditor('sourceNames');
      this.initializeTextEditor('searchNames');
      this.initializeTextEditor('ignoredNames');
      this.initializeTextEditor('ignoredScopes');
      this.initializeTextEditor('supportedFiletypes');
      this.initializeCheckbox('includeThemes');
      this.initializeCheckbox('ignoreGlobalSourceNames');
      this.initializeCheckbox('ignoreGlobalIgnoredNames');
      this.initializeCheckbox('ignoreGlobalIgnoredScopes');
      this.initializeCheckbox('ignoreGlobalSearchNames');
      this.initializeCheckbox('ignoreGlobalSupportedFiletypes');
      return this.initializeSelect('sassShadeAndTintImplementation');
    };

    ColorProjectElement.prototype.initializeTextEditor = function(name) {
      var capitalizedName, editor, _ref1;
      capitalizedName = capitalize(name);
      editor = this[name].getModel();
      editor.setText(((_ref1 = this.project[name]) != null ? _ref1 : []).join(', '));
      return this.subscriptions.add(editor.onDidStopChanging((function(_this) {
        return function() {
          var array;
          array = editor.getText().split(/\s*,\s*/g).filter(function(s) {
            return s.length > 0;
          });
          return _this.project["set" + capitalizedName](array);
        };
      })(this)));
    };

    ColorProjectElement.prototype.initializeSelect = function(name) {
      var capitalizedName, optionValues, select;
      capitalizedName = capitalize(name);
      select = this[name];
      optionValues = [].slice.call(select.querySelectorAll('option')).map(function(o) {
        return o.value;
      });
      if (this.project[name]) {
        select.selectedIndex = optionValues.indexOf(this.project[name]);
      }
      return this.subscriptions.add(this.subscribeTo(select, {
        change: (function(_this) {
          return function() {
            var value, _ref1;
            value = (_ref1 = select.selectedOptions[0]) != null ? _ref1.value : void 0;
            return _this.project["set" + capitalizedName](value === '' ? null : value);
          };
        })(this)
      }));
    };

    ColorProjectElement.prototype.initializeCheckbox = function(name) {
      var capitalizedName, checkbox;
      capitalizedName = capitalize(name);
      checkbox = this[name];
      checkbox.checked = this.project[name];
      return this.subscriptions.add(this.subscribeTo(checkbox, {
        change: (function(_this) {
          return function() {
            return _this.project["set" + capitalizedName](checkbox.checked);
          };
        })(this)
      }));
    };

    ColorProjectElement.prototype.getTitle = function() {
      return 'Project Settings';
    };

    ColorProjectElement.prototype.getURI = function() {
      return 'pigments://settings';
    };

    ColorProjectElement.prototype.getIconName = function() {
      return "pigments";
    };

    ColorProjectElement.prototype.serialize = function() {
      return {
        deserializer: 'ColorProjectElement'
      };
    };

    return ColorProjectElement;

  })(HTMLElement);

  module.exports = ColorProjectElement = registerOrUpdateElement('pigments-color-project', ColorProjectElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItcHJvamVjdC1lbGVtZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrSEFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBMkQsT0FBQSxDQUFRLFlBQVIsQ0FBM0QsRUFBQyxtQkFBQSxXQUFELEVBQWMsd0JBQUEsZ0JBQWQsRUFBZ0MsK0JBQUEsdUJBQWhDLENBQUE7O0FBQUEsRUFDQSxtQkFBQSxHQUFzQixJQUR0QixDQUFBOztBQUFBLEVBR0EsVUFBQSxHQUFhLFNBQUMsQ0FBRCxHQUFBO1dBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLFNBQUMsQ0FBRCxHQUFBO2FBQU8sQ0FBQyxDQUFDLFdBQUYsQ0FBQSxFQUFQO0lBQUEsQ0FBaEIsRUFBUDtFQUFBLENBSGIsQ0FBQTs7QUFBQSxFQUtNO0FBQ0osMENBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBVyxDQUFDLFdBQVosQ0FBd0IsbUJBQXhCLENBQUEsQ0FBQTs7QUFBQSxJQUNBLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLG1CQUE3QixDQURBLENBQUE7O0FBQUEsSUFHQSxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7QUFDUixVQUFBLHFDQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxPQUFkLEVBQXVCLFdBQXZCLEdBQUE7QUFDWCxjQUFBLFdBQUE7QUFBQSxVQUFBLFdBQUEsR0FBZSxXQUFBLEdBQVcsSUFBMUIsQ0FBQTtpQkFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8scUJBQVA7V0FBTCxFQUFtQyxTQUFBLEdBQUE7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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/color-project-element.coffee
