(function() {
  var $, $$$, AtomHtmlPreviewView, CompositeDisposable, Disposable, ScrollView, path, _, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ref1 = require('atom-space-pen-views'), $ = _ref1.$, $$$ = _ref1.$$$, ScrollView = _ref1.ScrollView;

  _ = require('underscore-plus');

  module.exports = AtomHtmlPreviewView = (function(_super) {
    __extends(AtomHtmlPreviewView, _super);

    atom.deserializers.add(AtomHtmlPreviewView);

    AtomHtmlPreviewView.prototype.editorSub = null;

    AtomHtmlPreviewView.prototype.onDidChangeTitle = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.prototype.onDidChangeModified = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.deserialize = function(state) {
      return new AtomHtmlPreviewView(state);
    };

    AtomHtmlPreviewView.content = function() {
      return this.div({
        "class": 'atom-html-preview native-key-bindings',
        tabindex: -1
      });
    };

    function AtomHtmlPreviewView(_arg) {
      var filePath;
      this.editorId = _arg.editorId, filePath = _arg.filePath;
      this.handleEvents = __bind(this.handleEvents, this);
      AtomHtmlPreviewView.__super__.constructor.apply(this, arguments);
      if (this.editorId != null) {
        this.resolveEditor(this.editorId);
      } else {
        if (atom.workspace != null) {
          this.subscribeToFilePath(filePath);
        } else {
          atom.packages.onDidActivatePackage((function(_this) {
            return function() {
              return _this.subscribeToFilePath(filePath);
            };
          })(this));
        }
      }
    }

    AtomHtmlPreviewView.prototype.serialize = function() {
      return {
        deserializer: 'AtomHtmlPreviewView',
        filePath: this.getPath(),
        editorId: this.editorId
      };
    };

    AtomHtmlPreviewView.prototype.destroy = function() {
      return this.editorSub.dispose();
    };

    AtomHtmlPreviewView.prototype.subscribeToFilePath = function(filePath) {
      this.trigger('title-changed');
      this.handleEvents();
      return this.renderHTML();
    };

    AtomHtmlPreviewView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var _ref2, _ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.trigger('title-changed');
            }
            return _this.handleEvents();
          } else {
            return (_ref2 = atom.workspace) != null ? (_ref3 = _ref2.paneForItem(_this)) != null ? _ref3.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return atom.packages.onDidActivatePackage((function(_this) {
          return function() {
            resolve();
            return _this.renderHTML();
          };
        })(this));
      }
    };

    AtomHtmlPreviewView.prototype.editorForId = function(editorId) {
      var editor, _i, _len, _ref2, _ref3;
      _ref2 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        editor = _ref2[_i];
        if (((_ref3 = editor.id) != null ? _ref3.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    AtomHtmlPreviewView.prototype.handleEvents = function() {
      var changeHandler;
      changeHandler = (function(_this) {
        return function() {
          var pane;
          _this.renderHTML();
          pane = atom.workspace.paneForURI(_this.getURI());
          if ((pane != null) && pane !== atom.workspace.getActivePane()) {
            return pane.activateItem(_this);
          }
        };
      })(this);
      this.editorSub = new CompositeDisposable;
      if (this.editor != null) {
        if (!atom.config.get("atom-html-preview.triggerOnSave")) {
          this.editorSub.add(this.editor.onDidChange(_.debounce(changeHandler, 700)));
        } else {
          this.editorSub.add(this.editor.onDidSave(changeHandler));
        }
        return this.editorSub.add(this.editor.onDidChangePath((function(_this) {
          return function() {
            return _this.trigger('title-changed');
          };
        })(this)));
      }
    };

    AtomHtmlPreviewView.prototype.renderHTML = function() {
      this.showLoading();
      if (this.editor != null) {
        return this.renderHTMLCode();
      }
    };

    AtomHtmlPreviewView.prototype.renderHTMLCode = function(text) {
      var iframe;
      if (!atom.config.get("atom-html-preview.triggerOnSave")) {
        this.editor.save();
      }
      iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
      iframe.src = this.getPath();
      this.html($(iframe));
      return atom.commands.dispatch('atom-html-preview', 'html-changed');
    };

    AtomHtmlPreviewView.prototype.getTitle = function() {
      if (this.editor != null) {
        return "" + (this.editor.getTitle()) + " Preview";
      } else {
        return "HTML Preview";
      }
    };

    AtomHtmlPreviewView.prototype.getURI = function() {
      return "html-preview://editor/" + this.editorId;
    };

    AtomHtmlPreviewView.prototype.getPath = function() {
      if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    AtomHtmlPreviewView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.html($$$(function() {
        this.h2('Previewing HTML Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      }));
    };

    AtomHtmlPreviewView.prototype.showLoading = function() {
      return this.html($$$(function() {
        return this.div({
          "class": 'atom-html-spinner'
        }, 'Loading HTML Preview\u2026');
      }));
    };

    return AtomHtmlPreviewView;

  })(ScrollView);

}).call(this);
