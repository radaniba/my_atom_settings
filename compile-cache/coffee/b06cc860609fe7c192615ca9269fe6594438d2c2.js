(function() {
  var ColorBuffer, ColorBufferElement, ColorMarker, ColorMarkerElement, ColorProject, ColorProjectElement, ColorResultsElement, ColorSearch, Disposable, Palette, PaletteElement, PigmentsAPI, PigmentsProvider, VariablesCollection, uris, url, _ref;

  _ref = [], Palette = _ref[0], PaletteElement = _ref[1], ColorSearch = _ref[2], ColorResultsElement = _ref[3], ColorProject = _ref[4], ColorProjectElement = _ref[5], ColorBuffer = _ref[6], ColorBufferElement = _ref[7], ColorMarker = _ref[8], ColorMarkerElement = _ref[9], VariablesCollection = _ref[10], PigmentsProvider = _ref[11], PigmentsAPI = _ref[12], Disposable = _ref[13], url = _ref[14], uris = _ref[15];

  module.exports = {
    activate: function(state) {
      var convertMethod, copyMethod;
      if (ColorProject == null) {
        ColorProject = require('./color-project');
      }
      this.patchAtom();
      this.project = state.project != null ? ColorProject.deserialize(state.project) : new ColorProject();
      atom.commands.add('atom-workspace', {
        'pigments:find-colors': (function(_this) {
          return function() {
            return _this.findColors();
          };
        })(this),
        'pigments:show-palette': (function(_this) {
          return function() {
            return _this.showPalette();
          };
        })(this),
        'pigments:project-settings': (function(_this) {
          return function() {
            return _this.showSettings();
          };
        })(this),
        'pigments:reload': (function(_this) {
          return function() {
            return _this.reloadProjectVariables();
          };
        })(this),
        'pigments:report': (function(_this) {
          return function() {
            return _this.createPigmentsReport();
          };
        })(this)
      });
      convertMethod = (function(_this) {
        return function(action) {
          return function(event) {
            var colorBuffer, editor;
            if (_this.lastEvent != null) {
              action(_this.colorMarkerForMouseEvent(_this.lastEvent));
            } else {
              editor = atom.workspace.getActiveTextEditor();
              colorBuffer = _this.project.colorBufferForEditor(editor);
              editor.getCursors().forEach(function(cursor) {
                var marker;
                marker = colorBuffer.getColorMarkerAtBufferPosition(cursor.getBufferPosition());
                return action(marker);
              });
            }
            return _this.lastEvent = null;
          };
        };
      })(this);
      copyMethod = (function(_this) {
        return function(action) {
          return function(event) {
            var colorBuffer, cursor, editor, marker;
            if (_this.lastEvent != null) {
              action(_this.colorMarkerForMouseEvent(_this.lastEvent));
            } else {
              editor = atom.workspace.getActiveTextEditor();
              colorBuffer = _this.project.colorBufferForEditor(editor);
              cursor = editor.getLastCursor();
              marker = colorBuffer.getColorMarkerAtBufferPosition(cursor.getBufferPosition());
              action(marker);
            }
            return _this.lastEvent = null;
          };
        };
      })(this);
      atom.commands.add('atom-text-editor', {
        'pigments:convert-to-hex': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHex();
          }
        }),
        'pigments:convert-to-rgb': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToRGB();
          }
        }),
        'pigments:convert-to-rgba': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToRGBA();
          }
        }),
        'pigments:convert-to-hsl': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHSL();
          }
        }),
        'pigments:convert-to-hsla': convertMethod(function(marker) {
          if (marker != null) {
            return marker.convertContentToHSLA();
          }
        }),
        'pigments:copy-as-hex': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsHex();
          }
        }),
        'pigments:copy-as-rgb': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsRGB();
          }
        }),
        'pigments:copy-as-rgba': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsRGBA();
          }
        }),
        'pigments:copy-as-hsl': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsHSL();
          }
        }),
        'pigments:copy-as-hsla': copyMethod(function(marker) {
          if (marker != null) {
            return marker.copyContentAsHSLA();
          }
        })
      });
      atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var host, protocol, _ref1;
          url || (url = require('url'));
          _ref1 = url.parse(uriToOpen), protocol = _ref1.protocol, host = _ref1.host;
          if (protocol !== 'pigments:') {
            return;
          }
          switch (host) {
            case 'search':
              return _this.project.findAllColors();
            case 'palette':
              return _this.project.getPalette();
            case 'settings':
              return atom.views.getView(_this.project);
          }
        };
      })(this));
      return atom.contextMenu.add({
        'atom-text-editor': [
          {
            label: 'Pigments',
            submenu: [
              {
                label: 'Convert to hexadecimal',
                command: 'pigments:convert-to-hex'
              }, {
                label: 'Convert to RGB',
                command: 'pigments:convert-to-rgb'
              }, {
                label: 'Convert to RGBA',
                command: 'pigments:convert-to-rgba'
              }, {
                label: 'Convert to HSL',
                command: 'pigments:convert-to-hsl'
              }, {
                label: 'Convert to HSLA',
                command: 'pigments:convert-to-hsla'
              }, {
                type: 'separator'
              }, {
                label: 'Copy as hexadecimal',
                command: 'pigments:copy-as-hex'
              }, {
                label: 'Copy as RGB',
                command: 'pigments:copy-as-rgb'
              }, {
                label: 'Copy as RGBA',
                command: 'pigments:copy-as-rgba'
              }, {
                label: 'Copy as HSL',
                command: 'pigments:copy-as-hsl'
              }, {
                label: 'Copy as HSLA',
                command: 'pigments:copy-as-hsla'
              }
            ],
            shouldDisplay: (function(_this) {
              return function(event) {
                return _this.shouldDisplayContextMenu(event);
              };
            })(this)
          }
        ]
      });
    },
    deactivate: function() {
      var _ref1;
      return (_ref1 = this.getProject()) != null ? typeof _ref1.destroy === "function" ? _ref1.destroy() : void 0 : void 0;
    },
    provideAutocomplete: function() {
      if (PigmentsProvider == null) {
        PigmentsProvider = require('./pigments-provider');
      }
      return new PigmentsProvider(this);
    },
    provideAPI: function() {
      if (PigmentsAPI == null) {
        PigmentsAPI = require('./pigments-api');
      }
      return new PigmentsAPI(this.getProject());
    },
    consumeColorPicker: function(api) {
      if (Disposable == null) {
        Disposable = require('atom').Disposable;
      }
      this.getProject().setColorPickerAPI(api);
      return new Disposable((function(_this) {
        return function() {
          return _this.getProject().setColorPickerAPI(null);
        };
      })(this));
    },
    consumeColorExpressions: function(options) {
      var handle, name, names, priority, regexpString, registry, scopes;
      if (options == null) {
        options = {};
      }
      if (Disposable == null) {
        Disposable = require('atom').Disposable;
      }
      registry = this.getProject().getColorExpressionsRegistry();
      if (options.expressions != null) {
        names = options.expressions.map(function(e) {
          return e.name;
        });
        registry.createExpressions(options.expressions);
        return new Disposable(function() {
          var name, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(registry.removeExpression(name));
          }
          return _results;
        });
      } else {
        name = options.name, regexpString = options.regexpString, handle = options.handle, scopes = options.scopes, priority = options.priority;
        registry.createExpression(name, regexpString, priority, scopes, handle);
        return new Disposable(function() {
          return registry.removeExpression(name);
        });
      }
    },
    consumeVariableExpressions: function(options) {
      var handle, name, names, priority, regexpString, registry, scopes;
      if (options == null) {
        options = {};
      }
      if (Disposable == null) {
        Disposable = require('atom').Disposable;
      }
      registry = this.getProject().getVariableExpressionsRegistry();
      if (options.expressions != null) {
        names = options.expressions.map(function(e) {
          return e.name;
        });
        registry.createExpressions(options.expressions);
        return new Disposable(function() {
          var name, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = names.length; _i < _len; _i++) {
            name = names[_i];
            _results.push(registry.removeExpression(name));
          }
          return _results;
        });
      } else {
        name = options.name, regexpString = options.regexpString, handle = options.handle, scopes = options.scopes, priority = options.priority;
        registry.createExpression(name, regexpString, priority, scopes, handle);
        return new Disposable(function() {
          return registry.removeExpression(name);
        });
      }
    },
    deserializePalette: function(state) {
      if (Palette == null) {
        Palette = require('./palette');
      }
      return Palette.deserialize(state);
    },
    deserializeColorSearch: function(state) {
      if (ColorSearch == null) {
        ColorSearch = require('./color-search');
      }
      return ColorSearch.deserialize(state);
    },
    deserializeColorProject: function(state) {
      if (ColorProject == null) {
        ColorProject = require('./color-project');
      }
      return ColorProject.deserialize(state);
    },
    deserializeColorProjectElement: function(state) {
      var element, subscription;
      if (ColorProjectElement == null) {
        ColorProjectElement = require('./color-project-element');
      }
      element = new ColorProjectElement;
      if (this.project != null) {
        element.setModel(this.getProject());
      } else {
        subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              return element.setModel(_this.getProject());
            }
          };
        })(this));
      }
      return element;
    },
    deserializeVariablesCollection: function(state) {
      if (VariablesCollection == null) {
        VariablesCollection = require('./variables-collection');
      }
      return VariablesCollection.deserialize(state);
    },
    pigmentsViewProvider: function(model) {
      var element;
      element = model instanceof (ColorBuffer != null ? ColorBuffer : ColorBuffer = require('./color-buffer')) ? (ColorBufferElement != null ? ColorBufferElement : ColorBufferElement = require('./color-buffer-element'), element = new ColorBufferElement) : model instanceof (ColorMarker != null ? ColorMarker : ColorMarker = require('./color-marker')) ? (ColorMarkerElement != null ? ColorMarkerElement : ColorMarkerElement = require('./color-marker-element'), element = new ColorMarkerElement) : model instanceof (ColorSearch != null ? ColorSearch : ColorSearch = require('./color-search')) ? (ColorResultsElement != null ? ColorResultsElement : ColorResultsElement = require('./color-results-element'), element = new ColorResultsElement) : model instanceof (ColorProject != null ? ColorProject : ColorProject = require('./color-project')) ? (ColorProjectElement != null ? ColorProjectElement : ColorProjectElement = require('./color-project-element'), element = new ColorProjectElement) : model instanceof (Palette != null ? Palette : Palette = require('./palette')) ? (PaletteElement != null ? PaletteElement : PaletteElement = require('./palette-element'), element = new PaletteElement) : void 0;
      if (element != null) {
        element.setModel(model);
      }
      return element;
    },
    shouldDisplayContextMenu: function(event) {
      this.lastEvent = event;
      setTimeout(((function(_this) {
        return function() {
          return _this.lastEvent = null;
        };
      })(this)), 10);
      return this.colorMarkerForMouseEvent(event) != null;
    },
    colorMarkerForMouseEvent: function(event) {
      var colorBuffer, colorBufferElement, editor;
      editor = atom.workspace.getActiveTextEditor();
      colorBuffer = this.project.colorBufferForEditor(editor);
      colorBufferElement = atom.views.getView(colorBuffer);
      return colorBufferElement != null ? colorBufferElement.colorMarkerForMouseEvent(event) : void 0;
    },
    serialize: function() {
      return {
        project: this.project.serialize()
      };
    },
    getProject: function() {
      return this.project;
    },
    findColors: function() {
      var pane;
      if (uris == null) {
        uris = require('./uris');
      }
      pane = atom.workspace.paneForURI(uris.SEARCH);
      pane || (pane = atom.workspace.getActivePane());
      return atom.workspace.openURIInPane(uris.SEARCH, pane, {});
    },
    showPalette: function() {
      if (uris == null) {
        uris = require('./uris');
      }
      return this.project.initialize().then(function() {
        var pane;
        pane = atom.workspace.paneForURI(uris.PALETTE);
        pane || (pane = atom.workspace.getActivePane());
        return atom.workspace.openURIInPane(uris.PALETTE, pane, {});
      })["catch"](function(reason) {
        return console.error(reason);
      });
    },
    showSettings: function() {
      if (uris == null) {
        uris = require('./uris');
      }
      return this.project.initialize().then(function() {
        var pane;
        pane = atom.workspace.paneForURI(uris.SETTINGS);
        pane || (pane = atom.workspace.getActivePane());
        return atom.workspace.openURIInPane(uris.SETTINGS, pane, {});
      })["catch"](function(reason) {
        return console.error(reason);
      });
    },
    reloadProjectVariables: function() {
      return this.project.reload();
    },
    createPigmentsReport: function() {
      return atom.workspace.open('pigments-report.json').then((function(_this) {
        return function(editor) {
          return editor.setText(_this.createReport());
        };
      })(this));
    },
    createReport: function() {
      var o;
      o = {
        atom: atom.getVersion(),
        pigments: atom.packages.getLoadedPackage('pigments').metadata.version,
        platform: require('os').platform(),
        config: atom.config.get('pigments'),
        project: {
          config: {
            sourceNames: this.project.sourceNames,
            searchNames: this.project.searchNames,
            ignoredNames: this.project.ignoredNames,
            ignoredScopes: this.project.ignoredScopes,
            includeThemes: this.project.includeThemes,
            ignoreGlobalSourceNames: this.project.ignoreGlobalSourceNames,
            ignoreGlobalSearchNames: this.project.ignoreGlobalSearchNames,
            ignoreGlobalIgnoredNames: this.project.ignoreGlobalIgnoredNames,
            ignoreGlobalIgnoredScopes: this.project.ignoreGlobalIgnoredScopes
          },
          paths: this.project.getPaths(),
          variables: {
            colors: this.project.getColorVariables().length,
            total: this.project.getVariables().length
          }
        }
      };
      return JSON.stringify(o, null, 2).replace(RegExp("" + (atom.project.getPaths().join('|')), "g"), '<root>');
    },
    patchAtom: function() {
      var HighlightComponent, TextEditorPresenter, requireCore, _buildHighlightRegions, _updateHighlightRegions;
      requireCore = function(name) {
        return require(Object.keys(require.cache).filter(function(s) {
          return s.indexOf(name) > -1;
        })[0]);
      };
      HighlightComponent = requireCore('highlights-component');
      TextEditorPresenter = requireCore('text-editor-presenter');
      if (TextEditorPresenter.getTextInScreenRange == null) {
        TextEditorPresenter.prototype.getTextInScreenRange = function(screenRange) {
          if (this.displayLayer != null) {
            return this.model.getTextInRange(this.displayLayer.translateScreenRange(screenRange));
          } else {
            return this.model.getTextInRange(this.model.bufferRangeForScreenRange(screenRange));
          }
        };
        _buildHighlightRegions = TextEditorPresenter.prototype.buildHighlightRegions;
        TextEditorPresenter.prototype.buildHighlightRegions = function(screenRange) {
          var regions;
          regions = _buildHighlightRegions.call(this, screenRange);
          if (regions.length === 1) {
            regions[0].text = this.getTextInScreenRange(screenRange);
          } else {
            regions[0].text = this.getTextInScreenRange([screenRange.start, [screenRange.start.row, Infinity]]);
            regions[regions.length - 1].text = this.getTextInScreenRange([[screenRange.end.row, 0], screenRange.end]);
            if (regions.length > 2) {
              regions[1].text = this.getTextInScreenRange([[screenRange.start.row + 1, 0], [screenRange.end.row - 1, Infinity]]);
            }
          }
          return regions;
        };
        _updateHighlightRegions = HighlightComponent.prototype.updateHighlightRegions;
        return HighlightComponent.prototype.updateHighlightRegions = function(id, newHighlightState) {
          var i, newRegionState, regionNode, _i, _len, _ref1, _ref2, _results;
          _updateHighlightRegions.call(this, id, newHighlightState);
          if ((_ref1 = newHighlightState["class"]) != null ? _ref1.match(/^pigments-native-background\s/) : void 0) {
            _ref2 = newHighlightState.regions;
            _results = [];
            for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
              newRegionState = _ref2[i];
              regionNode = this.regionNodesByHighlightId[id][i];
              if (newRegionState.text != null) {
                _results.push(regionNode.textContent = newRegionState.text);
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvcGlnbWVudHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtPQUFBOztBQUFBLEVBQUEsT0FTSSxFQVRKLEVBQ0UsaUJBREYsRUFDVyx3QkFEWCxFQUVFLHFCQUZGLEVBRWUsNkJBRmYsRUFHRSxzQkFIRixFQUdnQiw2QkFIaEIsRUFJRSxxQkFKRixFQUllLDRCQUpmLEVBS0UscUJBTEYsRUFLZSw0QkFMZixFQU1FLDhCQU5GLEVBTXVCLDJCQU52QixFQU15QyxzQkFOekMsRUFPRSxxQkFQRixFQVFFLGNBUkYsRUFRTyxlQVJQLENBQUE7O0FBQUEsRUFXQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixVQUFBLHlCQUFBOztRQUFBLGVBQWdCLE9BQUEsQ0FBUSxpQkFBUjtPQUFoQjtBQUFBLE1BRUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxPQUFELEdBQWMscUJBQUgsR0FDVCxZQUFZLENBQUMsV0FBYixDQUF5QixLQUFLLENBQUMsT0FBL0IsQ0FEUyxHQUdMLElBQUEsWUFBQSxDQUFBLENBUE4sQ0FBQTtBQUFBLE1BU0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNFO0FBQUEsUUFBQSxzQkFBQSxFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtBQUFBLFFBQ0EsdUJBQUEsRUFBeUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7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

//# sourceURL=/Users/Rad/.atom/packages/pigments/lib/pigments.coffee
