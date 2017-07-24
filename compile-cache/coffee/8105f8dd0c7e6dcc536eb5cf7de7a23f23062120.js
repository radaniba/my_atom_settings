(function() {
  var $, $$$, CompositeDisposable, Emitter, ExporterView, TextEditorView, View, path, ref, ref1,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, View = ref1.View, TextEditorView = ref1.TextEditorView;

  path = require('path');

  ExporterView = (function(superClass) {
    extend(ExporterView, superClass);

    function ExporterView() {
      return ExporterView.__super__.constructor.apply(this, arguments);
    }

    ExporterView.prototype.subscriptions = new CompositeDisposable;

    ExporterView.prototype.initialize = function() {
      this.markdownPreview = null;
      this.documentExportPath = null;
      this.subscriptions.add(atom.commands.add(this.element, {
        'core:cancel': (function(_this) {
          return function() {
            return _this.hidePanel();
          };
        })(this)
      }));
      return this.bindEvents();
    };

    ExporterView.prototype.destroy = function() {
      var ref2;
      this.subscriptions.dispose();
      if ((ref2 = this.panel) != null) {
        ref2.destroy();
      }
      return this.panel = null;
    };

    ExporterView.content = function() {
      return this.div({
        "class": 'exporter-view'
      }, (function(_this) {
        return function() {
          _this.h4('Export to disk');
          _this.div({
            "class": 'document-type-div clearfix'
          }, function() {
            _this.div({
              "class": 'document-type document-html selected'
            }, "HTML");
            _this.div({
              "class": 'document-type document-pdf'
            }, "PDF");
            _this.div({
              "class": 'document-type document-phantomjs'
            }, "PHANTOMJS");
            return _this.div({
              "class": 'document-type document-ebook'
            }, 'EBOOK');
          });
          _this.label({
            "class": 'save-as-label'
          }, 'Save as');
          _this.subview('fileNameInput', new TextEditorView({
            mini: true,
            placeholderText: 'enter filename here'
          }));
          _this.label({
            "class": 'copy-label'
          }, 'Export document to ./ folder');
          _this.div({
            "class": 'splitter'
          });
          _this.div({
            "class": 'html-div'
          }, function() {
            _this.input({
              "class": 'cdn-checkbox',
              type: 'checkbox'
            });
            _this.label('Use CDN hosted resources');
            _this.br();
            _this.input({
              "class": 'relative-image-path-checkbox',
              type: 'checkbox'
            });
            return _this.label('Use relative image path');
          });
          _this.div({
            "class": 'pdf-div'
          }, function() {
            _this.label('Format');
            _this.select({
              "class": 'format-select'
            }, function() {
              _this.option('A3');
              _this.option('A4');
              _this.option('A5');
              _this.option('Legal');
              _this.option('Letter');
              return _this.option('Tabloid');
            });
            _this.br();
            _this.label('Orientation');
            _this.select({
              "class": 'orientation-select'
            }, function() {
              _this.option('portrait');
              return _this.option('landscape');
            });
            _this.br();
            _this.label('Margin');
            _this.select({
              "class": 'margin-select'
            }, function() {
              _this.option('default margin');
              _this.option('no margin');
              return _this.option('minimum margin');
            });
            _this.br();
            _this.label('Print background');
            _this.input({
              type: 'checkbox',
              "class": 'print-background-checkbox'
            });
            _this.br();
            _this.label('Github style');
            _this.input({
              type: 'checkbox',
              "class": 'github-style-checkbox'
            });
            _this.br();
            _this.label('Open PDF after generation');
            return _this.input({
              type: 'checkbox',
              "class": 'pdf-auto-open-checkbox'
            });
          });
          _this.div({
            "class": 'phantomjs-div'
          }, function() {
            _this.label('File Type');
            _this.select({
              "class": 'file-type-select'
            }, function() {
              _this.option('pdf');
              _this.option('png');
              return _this.option('jpeg');
            });
            _this.br();
            _this.label('Format');
            _this.select({
              "class": 'format-select'
            }, function() {
              _this.option('A3');
              _this.option('A4');
              _this.option('A5');
              _this.option('Legal');
              _this.option('Letter');
              return _this.option('Tabloid');
            });
            _this.br();
            _this.label('Orientation');
            _this.select({
              "class": 'orientation-select'
            }, function() {
              _this.option('portrait');
              return _this.option('landscape');
            });
            _this.br();
            _this.label('Margin');
            _this.subview('marginInput', new TextEditorView({
              mini: true,
              placeholderText: '1cm'
            }));
            _this.br();
            _this.a({
              "class": 'header-footer-config'
            }, 'click me to open header and footer config');
            _this.br();
            _this.br();
            _this.label('Github style');
            _this.input({
              type: 'checkbox',
              "class": 'github-style-checkbox'
            });
            _this.br();
            _this.label('Open PDF after generation');
            return _this.input({
              type: 'checkbox',
              "class": 'pdf-auto-open-checkbox'
            });
          });
          _this.div({
            "class": 'ebook-div'
          }, function() {
            return _this.select({
              "class": 'ebook-format-select'
            }, function() {
              _this.option('epub');
              _this.option('mobi');
              _this.option('pdf');
              return _this.option('html');
            });
          });
          return _this.div({
            "class": 'button-group'
          }, function() {
            _this.div({
              "class": 'close-btn btn'
            }, 'close');
            return _this.div({
              "class": 'export-btn btn'
            }, 'export');
          });
        };
      })(this));
    };

    ExporterView.prototype.bindEvents = function() {
      $('.close-btn', this.element).click((function(_this) {
        return function() {
          return _this.hidePanel();
        };
      })(this));
      this.initHTMLPageEvent();
      this.initPDFPageEvent();
      this.initPhantomJSPageEvent();
      this.initEBookPageEvent();
      return $('.export-btn', this.element).click((function(_this) {
        return function() {
          var dest, isCDN, relativeImagePath;
          dest = _this.fileNameInput.getText().trim();
          if (!_this.markdownPreview || !dest.length) {
            atom.notifications.addError('Failed to export document');
            return;
          }
          _this.hidePanel();
          if ($('.document-pdf', _this.element).hasClass('selected')) {
            atom.notifications.addInfo('Your document is being prepared', {
              detail: ':)'
            });
            return _this.markdownPreview.saveAsPDF(dest);
          } else if ($('.document-html', _this.element).hasClass('selected')) {
            isCDN = $('.cdn-checkbox', _this.element)[0].checked;
            relativeImagePath = $('.relative-image-path-checkbox', _this.element)[0].checked;
            return _this.markdownPreview.saveAsHTML(dest, !isCDN, relativeImagePath);
          } else if ($('.document-phantomjs', _this.element).hasClass('selected')) {
            atom.notifications.addInfo('Your document is being prepared', {
              detail: ':)'
            });
            return _this.markdownPreview.phantomJSExport(dest);
          } else if ($('.document-ebook', _this.element).hasClass('selected')) {
            return _this.markdownPreview.generateEbook(dest);
          }
        };
      })(this));
    };

    ExporterView.prototype.initHTMLPageEvent = function() {
      return $('.document-html', this.element).on('click', (function(_this) {
        return function(e) {
          var $el, filePath;
          $el = $(e.target);
          if (!$el.hasClass('selected')) {
            $('.selected', _this.elemnet).removeClass('selected');
            $el.addClass('selected');
            _this.fileNameInput.focus();
          }
          $('.pdf-div', _this.element).hide();
          $('.phantomjs-div', _this.element).hide();
          $('.ebook-div', _this.element).hide();
          $('.html-div', _this.element).show();
          filePath = path.resolve(_this.documentExportPath, _this.markdownPreview.editor.getFileName());
          filePath = filePath.slice(0, filePath.length - path.extname(filePath).length) + '.html';
          return _this.fileNameInput.setText(filePath);
        };
      })(this));
    };

    ExporterView.prototype.initPDFPageEvent = function() {
      $('.document-pdf', this.element).on('click', (function(_this) {
        return function(e) {
          var $el, filePath;
          $el = $(e.target);
          if (!$el.hasClass('selected')) {
            $('.selected', _this.elemnet).removeClass('selected');
            $el.addClass('selected');
            _this.fileNameInput.focus();
          }
          $('.html-div', _this.element).hide();
          $('.phantomjs-div', _this.element).hide();
          $('.ebook-div', _this.element).hide();
          $('.pdf-div', _this.element).show();
          filePath = path.resolve(_this.documentExportPath, _this.markdownPreview.editor.getFileName());
          filePath = filePath.slice(0, filePath.length - path.extname(filePath).length) + '.pdf';
          _this.fileNameInput.setText(filePath);
          $('.pdf-div .format-select', _this.element).val(atom.config.get('markdown-preview-enhanced.exportPDFPageFormat'));
          $('.pdf-div .orientation-select', _this.element).val(atom.config.get('markdown-preview-enhanced.orientation'));
          $('.pdf-div .margin-select', _this.element).val(atom.config.get('markdown-preview-enhanced.marginsType'));
          $('.pdf-div .print-background-checkbox', _this.element)[0].checked = atom.config.get('markdown-preview-enhanced.printBackground');
          $('.pdf-div .github-style-checkbox', _this.element)[0].checked = atom.config.get('markdown-preview-enhanced.pdfUseGithub');
          return $('.pdf-div .pdf-auto-open-checkbox', _this.element)[0].checked = atom.config.get('markdown-preview-enhanced.pdfOpenAutomatically');
        };
      })(this));
      $('.pdf-div .format-select', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.exportPDFPageFormat', this.value);
      });
      $('.pdf-div .orientation-select', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.orientation', this.value);
      });
      $('.pdf-div .margin-select', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.marginsType', this.value);
      });
      $('.pdf-div .print-background-checkbox', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.printBackground', e.target.checked);
      });
      $('.pdf-div .github-style-checkbox', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.pdfUseGithub', e.target.checked);
      });
      return $('.pdf-div .pdf-auto-open-checkbox', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.pdfOpenAutomatically', e.target.checked);
      });
    };

    ExporterView.prototype.initPhantomJSPageEvent = function() {
      var config;
      $('.document-phantomjs', this.element).on('click', (function(_this) {
        return function(e) {
          var $el, extension, filePath;
          $el = $(e.target);
          if (!$el.hasClass('selected')) {
            $('.selected', _this.element).removeClass('selected');
            $el.addClass('selected');
            _this.fileNameInput.focus();
          }
          $('.html-div', _this.element).hide();
          $('.pdf-div', _this.element).hide();
          $('.ebook-div', _this.element).hide();
          $('.phantomjs-div', _this.element).show();
          filePath = path.resolve(_this.documentExportPath, _this.markdownPreview.editor.getFileName());
          extension = atom.config.get('markdown-preview-enhanced.phantomJSExportFileType');
          filePath = filePath.slice(0, filePath.length - path.extname(filePath).length) + '.' + extension;
          _this.fileNameInput.setText(filePath);
          _this.marginInput.setText(atom.config.get('markdown-preview-enhanced.phantomJSMargin'));
          $('.phantomjs-div .file-type-select', _this.element).val(extension);
          $('.phantomjs-div .format-select', _this.element).val(atom.config.get('markdown-preview-enhanced.exportPDFPageFormat'));
          $('.phantomjs-div .orientation-select', _this.element).val(atom.config.get('markdown-preview-enhanced.orientation'));
          $('.phantomjs-div .github-style-checkbox', _this.element)[0].checked = atom.config.get('markdown-preview-enhanced.pdfUseGithub');
          return $('.phantomjs-div .pdf-auto-open-checkbox', _this.element)[0].checked = atom.config.get('markdown-preview-enhanced.pdfOpenAutomatically');
        };
      })(this));
      $('.phantomjs-div .file-type-select', this.element).on('change', (function(_this) {
        return function(e) {
          var extension, filePath;
          extension = e.target.value;
          atom.config.set('markdown-preview-enhanced.phantomJSExportFileType', extension);
          filePath = path.resolve(_this.documentExportPath, _this.markdownPreview.editor.getFileName());
          filePath = filePath.slice(0, filePath.length - path.extname(filePath).length) + '.' + extension;
          return _this.fileNameInput.setText(filePath);
        };
      })(this));
      $('.phantomjs-div .format-select', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.exportPDFPageFormat', this.value);
      });
      $('.phantomjs-div .orientation-select', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.orientation', this.value);
      });
      this.marginInput.model.onDidStopChanging((function(_this) {
        return function(e) {
          return atom.config.set('markdown-preview-enhanced.phantomJSMargin', _this.marginInput.getText());
        };
      })(this));
      $('.phantomjs-div .github-style-checkbox', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.pdfUseGithub', e.target.checked);
      });
      $('.phantomjs-div .pdf-auto-open-checkbox', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.pdfOpenAutomatically', e.target.checked);
      });
      config = $('.header-footer-config', this.element);
      return config.on('click', (function(_this) {
        return function() {
          _this.hidePanel();
          return atom.workspace.open(path.resolve(atom.config.configDirPath, './markdown-preview-enhanced/phantomjs_header_footer_config.js'), {
            split: 'left'
          });
        };
      })(this));
    };

    ExporterView.prototype.initEBookPageEvent = function() {
      $('.document-ebook', this.element).on('click', (function(_this) {
        return function(e) {
          var $el, filePath;
          $el = $(e.target);
          if (!$el.hasClass('selected')) {
            $('.selected', _this.elemnet).removeClass('selected');
            $el.addClass('selected');
          }
          filePath = path.resolve(_this.documentExportPath, _this.markdownPreview.editor.getFileName());
          filePath = filePath.slice(0, filePath.length - path.extname(filePath).length) + '.' + $('.ebook-div .ebook-format-select', _this.element)[0].value;
          _this.fileNameInput.setText(filePath);
          _this.fileNameInput.focus();
          $('.html-div', _this.element).hide();
          $('.pdf-div', _this.element).hide();
          $('.phantomjs-div', _this.element).hide();
          return $('.ebook-div', _this.element).show();
        };
      })(this));
      return $('.ebook-div .ebook-format-select', this.element).on('change', (function(_this) {
        return function(e) {
          var filePath;
          filePath = path.resolve(_this.documentExportPath, _this.markdownPreview.editor.getFileName());
          filePath = filePath.slice(0, filePath.length - path.extname(filePath).length) + '.' + e.target.value;
          return _this.fileNameInput.setText(filePath);
        };
      })(this));
    };

    ExporterView.prototype.hidePanel = function() {
      var ref2;
      if (!((ref2 = this.panel) != null ? ref2.isVisible() : void 0)) {
        return;
      }
      return this.panel.hide();
    };

    ExporterView.prototype.display = function(markdownPreview) {
      var copyLabel;
      this.markdownPreview = markdownPreview;
      if (!this.markdownPreview.editor) {
        return;
      }
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.panel.show();
      copyLabel = $('.copy-label', this.element);
      this.documentExportPath = atom.config.get('markdown-preview-enhanced.documentExportPath');
      copyLabel.html("<i>Export document to <a>" + this.documentExportPath + "</a> folder</i>");
      copyLabel.find('a').on('click', (function(_this) {
        return function() {
          var e;
          try {
            atom.workspace.open('atom://config/packages/markdown-preview-enhanced', {
              split: 'right'
            });
            return _this.hidePanel();
          } catch (error) {
            e = error;
            return _this.hidePanel();
          }
        };
      })(this));
      if (this.documentExportPath.startsWith('/')) {
        this.documentExportPath = path.resolve(markdownPreview.projectDirectoryPath, '.' + this.documentExportPath);
      } else {
        this.documentExportPath = path.resolve(markdownPreview.fileDirectoryPath, this.documentExportPath);
      }
      this.fileNameInput.focus();
      return $('.selected', this.element).click();
    };

    return ExporterView;

  })(View);

  module.exports = ExporterView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9leHBvcnRlci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUZBQUE7SUFBQTs7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUNWLE9BQWtDLE9BQUEsQ0FBUSxzQkFBUixDQUFsQyxFQUFDLFVBQUQsRUFBSSxjQUFKLEVBQVMsZ0JBQVQsRUFBZTs7RUFDZixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRUQ7Ozs7Ozs7MkJBQ0osYUFBQSxHQUFlLElBQUk7OzJCQUVuQixVQUFBLEdBQVksU0FBQTtNQUVWLElBQUMsQ0FBQSxlQUFELEdBQW1CO01BQ25CLElBQUMsQ0FBQSxrQkFBRCxHQUFzQjtNQUV0QixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUNqQjtRQUFBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtPQURpQixDQUFuQjthQUdBLElBQUMsQ0FBQSxVQUFELENBQUE7SUFSVTs7MkJBVVosT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7O1lBQ00sQ0FBRSxPQUFSLENBQUE7O2FBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUhGOztJQUtULFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7T0FBTCxFQUE2QixDQUFBLFNBQUEs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QUFDLEtBQWYsQ0FBQTthQUNBLENBQUEsQ0FBRSxXQUFGLEVBQWUsSUFBQyxDQUFBLE9BQWhCLENBQXdCLENBQUMsS0FBekIsQ0FBQTtJQXpCTzs7OztLQWhUZ0I7O0VBMlUzQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQS9VakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xueyQsICQkJCwgVmlldywgVGV4dEVkaXRvclZpZXd9ICA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbmNsYXNzIEV4cG9ydGVyVmlldyBleHRlbmRzIFZpZXdcbiAgc3Vic2NyaXB0aW9uczogbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBpbml0aWFsaXplOiAoKS0+XG5cbiAgICBAbWFya2Rvd25QcmV2aWV3ID0gbnVsbFxuICAgIEBkb2N1bWVudEV4cG9ydFBhdGggPSBudWxsXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgQGVsZW1lbnQsXG4gICAgICAnY29yZTpjYW5jZWwnOiA9PiBAaGlkZVBhbmVsKClcblxuICAgIEBiaW5kRXZlbnRzKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBwYW5lbD8uZGVzdHJveSgpXG4gICAgQHBhbmVsID0gbnVsbFxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdleHBvcnRlci12aWV3JywgPT5cbiAgICAgIEBoNCAnRXhwb3J0IHRvIGRpc2snXG4gICAgICBAZGl2IGNsYXNzOiAnZG9jdW1lbnQtdHlwZS1kaXYgY2xlYXJmaXgnLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnZG9jdW1lbnQtdHlwZSBkb2N1bWVudC1odG1sIHNlbGVjdGVkJywgXCJIVE1MXCJcbiAgICAgICAgQGRpdiBjbGFzczogJ2RvY3VtZW50LXR5cGUgZG9jdW1lbnQtcGRmJywgXCJQREZcIlxuICAgICAgICBAZGl2IGNsYXNzOiAnZG9jdW1lbnQtdHlwZSBkb2N1bWVudC1waGFudG9tanMnLCBcIlBIQU5UT01KU1wiXG4gICAgICAgIEBkaXYgY2xhc3M6ICdkb2N1bWVudC10eXBlIGRvY3VtZW50LWVib29rJywgJ0VCT09LJ1xuXG4gICAgICBAbGFiZWwgY2xhc3M6ICdzYXZlLWFzLWxhYmVsJywgJ1NhdmUgYXMnXG4gICAgICBAc3VidmlldyAnZmlsZU5hbWVJbnB1dCcsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6ICdlbnRlciBmaWxlbmFtZSBoZXJlJylcbiAgICAgIEBsYWJlbCBjbGFzczogJ2NvcHktbGFiZWwnLCAnRXhwb3J0IGRvY3VtZW50IHRvIC4vIGZvbGRlcidcbiAgICAgIEBkaXYgY2xhc3M6ICdzcGxpdHRlcidcblxuICAgICAgQGRpdiBjbGFzczogJ2h0bWwtZGl2JywgPT5cbiAgICAgICAgQGlucHV0IGNsYXNzOiAnY2RuLWNoZWNrYm94JywgdHlwZTogJ2NoZWNrYm94J1xuICAgICAgICBAbGFiZWwgJ1VzZSBDRE4gaG9zdGVkIHJlc291cmNlcydcbiAgICAgICAgQGJyKClcbiAgICAgICAgQGlucHV0IGNsYXNzOiAncmVsYXRpdmUtaW1hZ2UtcGF0aC1jaGVja2JveCcsIHR5cGU6ICdjaGVja2JveCdcbiAgICAgICAgQGxhYmVsICdVc2UgcmVsYXRpdmUgaW1hZ2UgcGF0aCdcblxuICAgICAgQGRpdiBjbGFzczogJ3BkZi1kaXYnLCA9PlxuICAgICAgICBAbGFiZWwgJ0Zvcm1hdCdcbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ2Zvcm1hdC1zZWxlY3QnLCA9PlxuICAgICAgICAgIEBvcHRpb24gJ0EzJ1xuICAgICAgICAgIEBvcHRpb24gJ0E0J1xuICAgICAgICAgIEBvcHRpb24gJ0E1J1xuICAgICAgICAgIEBvcHRpb24gJ0xlZ2FsJ1xuICAgICAgICAgIEBvcHRpb24gJ0xldHRlcidcbiAgICAgICAgICBAb3B0aW9uICdUYWJsb2lkJ1xuICAgICAgICBAYnIoKVxuICAgICAgICBAbGFiZWwgJ09yaWVudGF0aW9uJ1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnb3JpZW50YXRpb24tc2VsZWN0JywgPT5cbiAgICAgICAgICBAb3B0aW9uICdwb3J0cmFpdCdcbiAgICAgICAgICBAb3B0aW9uICdsYW5kc2NhcGUnXG4gICAgICAgIEBicigpXG4gICAgICAgIEBsYWJlbCAnTWFyZ2luJ1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnbWFyZ2luLXNlbGVjdCcsID0+XG4gICAgICAgICAgQG9wdGlvbiAnZGVmYXVsdCBtYXJnaW4nXG4gICAgICAgICAgQG9wdGlvbiAnbm8gbWFyZ2luJ1xuICAgICAgICAgIEBvcHRpb24gJ21pbmltdW0gbWFyZ2luJ1xuICAgICAgICBAYnIoKVxuICAgICAgICBAbGFiZWwgJ1ByaW50IGJhY2tncm91bmQnXG4gICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLCBjbGFzczogJ3ByaW50LWJhY2tncm91bmQtY2hlY2tib3gnXG4gICAgICAgIEBicigpXG4gICAgICAgIEBsYWJlbCAnR2l0aHViIHN0eWxlJ1xuICAgICAgICBAaW5wdXQgdHlwZTogJ2NoZWNrYm94JywgY2xhc3M6ICdnaXRodWItc3R5bGUtY2hlY2tib3gnXG4gICAgICAgIEBicigpXG4gICAgICAgIEBsYWJlbCAnT3BlbiBQREYgYWZ0ZXIgZ2VuZXJhdGlvbidcbiAgICAgICAgQGlucHV0IHR5cGU6ICdjaGVja2JveCcsIGNsYXNzOiAncGRmLWF1dG8tb3Blbi1jaGVja2JveCdcbiAgICAgICAgIyBAZGl2ICdzcGxpdHRlcidcbiAgICAgICAgIyBAbGFiZWwgJ2hlYWRlcidcbiAgICAgICAgIyBAbGFiZWwgJ2ltYWdlIHF1YWxpdHknXG4gICAgICAgICMgQGlucHV0IHR5cGU6ICd0ZXh0JywgY2xhc3M6ICdpbWFnZS1xdWFsaXR5LWlucHV0J1xuXG4gICAgICBAZGl2IGNsYXNzOiAncGhhbnRvbWpzLWRpdicsID0+XG4gICAgICAgIEBsYWJlbCAnRmlsZSBUeXBlJ1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnZmlsZS10eXBlLXNlbGVjdCcsID0+XG4gICAgICAgICAgQG9wdGlvbiAncGRmJ1xuICAgICAgICAgIEBvcHRpb24gJ3BuZydcbiAgICAgICAgICBAb3B0aW9uICdqcGVnJ1xuICAgICAgICBAYnIoKVxuICAgICAgICBAbGFiZWwgJ0Zvcm1hdCdcbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ2Zvcm1hdC1zZWxlY3QnLCA9PlxuICAgICAgICAgIEBvcHRpb24gJ0EzJ1xuICAgICAgICAgIEBvcHRpb24gJ0E0J1xuICAgICAgICAgIEBvcHRpb24gJ0E1J1xuICAgICAgICAgIEBvcHRpb24gJ0xlZ2FsJ1xuICAgICAgICAgIEBvcHRpb24gJ0xldHRlcidcbiAgICAgICAgICBAb3B0aW9uICdUYWJsb2lkJ1xuICAgICAgICBAYnIoKVxuICAgICAgICBAbGFiZWwgJ09yaWVudGF0aW9uJ1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnb3JpZW50YXRpb24tc2VsZWN0JywgPT5cbiAgICAgICAgICBAb3B0aW9uICdwb3J0cmFpdCdcbiAgICAgICAgICBAb3B0aW9uICdsYW5kc2NhcGUnXG4gICAgICAgIEBicigpXG4gICAgICAgIEBsYWJlbCAnTWFyZ2luJ1xuICAgICAgICBAc3VidmlldyAnbWFyZ2luSW5wdXQnLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiAnMWNtJylcbiAgICAgICAgQGJyKClcbiAgICAgICAgQGEgY2xhc3M6ICdoZWFkZXItZm9vdGVyLWNvbmZpZycsICdjbGljayBtZSB0byBvcGVuIGhlYWRlciBhbmQgZm9vdGVyIGNvbmZpZydcbiAgICAgICAgQGJyKClcbiAgICAgICAgQGJyKClcbiAgICAgICAgQGxhYmVsICdHaXRodWIgc3R5bGUnXG4gICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLCBjbGFzczogJ2dpdGh1Yi1zdHlsZS1jaGVja2JveCdcbiAgICAgICAgQGJyKClcbiAgICAgICAgQGxhYmVsICdPcGVuIFBERiBhZnRlciBnZW5lcmF0aW9uJ1xuICAgICAgICBAaW5wdXQgdHlwZTogJ2NoZWNrYm94JywgY2xhc3M6ICdwZGYtYXV0by1vcGVuLWNoZWNrYm94J1xuXG4gICAgICBAZGl2IGNsYXNzOiAnZWJvb2stZGl2JywgPT5cbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ2Vib29rLWZvcm1hdC1zZWxlY3QnLCA9PlxuICAgICAgICAgIEBvcHRpb24gJ2VwdWInXG4gICAgICAgICAgQG9wdGlvbiAnbW9iaSdcbiAgICAgICAgICBAb3B0aW9uICdwZGYnXG4gICAgICAgICAgQG9wdGlvbiAnaHRtbCdcblxuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbi1ncm91cCcsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdjbG9zZS1idG4gYnRuJywgJ2Nsb3NlJ1xuICAgICAgICBAZGl2IGNsYXNzOiAnZXhwb3J0LWJ0biBidG4nLCAnZXhwb3J0J1xuXG4gIGJpbmRFdmVudHM6IC0+XG4gICAgJCgnLmNsb3NlLWJ0bicsIEBlbGVtZW50KS5jbGljayAoKT0+IEBoaWRlUGFuZWwoKVxuXG4gICAgQGluaXRIVE1MUGFnZUV2ZW50KClcbiAgICBAaW5pdFBERlBhZ2VFdmVudCgpXG4gICAgQGluaXRQaGFudG9tSlNQYWdlRXZlbnQoKVxuICAgIEBpbml0RUJvb2tQYWdlRXZlbnQoKVxuXG4gICAgJCgnLmV4cG9ydC1idG4nLCBAZWxlbWVudCkuY2xpY2sgKCk9PlxuICAgICAgZGVzdCA9IEBmaWxlTmFtZUlucHV0LmdldFRleHQoKS50cmltKClcbiAgICAgIGlmICFAbWFya2Rvd25QcmV2aWV3IG9yICFkZXN0Lmxlbmd0aFxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCB0byBleHBvcnQgZG9jdW1lbnQnKVxuICAgICAgICByZXR1cm5cblxuICAgICAgQGhpZGVQYW5lbCgpXG4gICAgICBpZiAkKCcuZG9jdW1lbnQtcGRmJywgQGVsZW1lbnQpLmhhc0NsYXNzKCdzZWxlY3RlZCcpICMgcGRmXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdZb3VyIGRvY3VtZW50IGlzIGJlaW5nIHByZXBhcmVkJywgZGV0YWlsOiAnOiknKVxuICAgICAgICBAbWFya2Rvd25QcmV2aWV3LnNhdmVBc1BERiBkZXN0XG4gICAgICBlbHNlIGlmICQoJy5kb2N1bWVudC1odG1sJywgQGVsZW1lbnQpLmhhc0NsYXNzKCdzZWxlY3RlZCcpICMgaHRtbFxuICAgICAgICBpc0NETiA9ICQoJy5jZG4tY2hlY2tib3gnLCBAZWxlbWVudClbMF0uY2hlY2tlZFxuICAgICAgICByZWxhdGl2ZUltYWdlUGF0aCA9ICQoJy5yZWxhdGl2ZS1pbWFnZS1wYXRoLWNoZWNrYm94JywgQGVsZW1lbnQpWzBdLmNoZWNrZWRcbiAgICAgICAgQG1hcmtkb3duUHJldmlldy5zYXZlQXNIVE1MIGRlc3QsICFpc0NETiwgcmVsYXRpdmVJbWFnZVBhdGhcbiAgICAgIGVsc2UgaWYgJCgnLmRvY3VtZW50LXBoYW50b21qcycsIEBlbGVtZW50KS5oYXNDbGFzcygnc2VsZWN0ZWQnKSAjIHBoYW50b21qc1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnWW91ciBkb2N1bWVudCBpcyBiZWluZyBwcmVwYXJlZCcsIGRldGFpbDogJzopJylcbiAgICAgICAgQG1hcmtkb3duUHJldmlldy5waGFudG9tSlNFeHBvcnQgZGVzdFxuICAgICAgZWxzZSBpZiAkKCcuZG9jdW1lbnQtZWJvb2snLCBAZWxlbWVudCkuaGFzQ2xhc3MoJ3NlbGVjdGVkJykgIyBlYm9va1xuICAgICAgICBAbWFya2Rvd25QcmV2aWV3LmdlbmVyYXRlRWJvb2sgZGVzdFxuXG4gIGluaXRIVE1MUGFnZUV2ZW50OiAtPlxuICAgICQoJy5kb2N1bWVudC1odG1sJywgQGVsZW1lbnQpLm9uICdjbGljaycsIChlKT0+XG4gICAgICAkZWwgPSAkKGUudGFyZ2V0KVxuICAgICAgaWYgISRlbC5oYXNDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAkKCcuc2VsZWN0ZWQnLCBAZWxlbW5ldCkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgJGVsLmFkZENsYXNzKCdzZWxlY3RlZCcpXG5cbiAgICAgICAgQGZpbGVOYW1lSW5wdXQuZm9jdXMoKVxuXG4gICAgICAkKCcucGRmLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5waGFudG9tanMtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLmVib29rLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5odG1sLWRpdicsIEBlbGVtZW50KS5zaG93KClcblxuICAgICAgZmlsZVBhdGggPSBwYXRoLnJlc29sdmUoQGRvY3VtZW50RXhwb3J0UGF0aCwgQG1hcmtkb3duUHJldmlldy5lZGl0b3IuZ2V0RmlsZU5hbWUoKSlcbiAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGguc2xpY2UoMCwgZmlsZVBhdGgubGVuZ3RoLXBhdGguZXh0bmFtZShmaWxlUGF0aCkubGVuZ3RoKSArICcuaHRtbCdcbiAgICAgIEBmaWxlTmFtZUlucHV0LnNldFRleHQoZmlsZVBhdGgpXG5cblxuXG4gIGluaXRQREZQYWdlRXZlbnQ6IC0+XG4gICAgJCgnLmRvY3VtZW50LXBkZicsIEBlbGVtZW50KS5vbiAnY2xpY2snLCAoZSk9PlxuICAgICAgJGVsID0gJChlLnRhcmdldClcbiAgICAgIGlmICEkZWwuaGFzQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgJCgnLnNlbGVjdGVkJywgQGVsZW1uZXQpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICRlbC5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuXG4gICAgICAgIEBmaWxlTmFtZUlucHV0LmZvY3VzKClcblxuICAgICAgJCgnLmh0bWwtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLnBoYW50b21qcy1kaXYnLCBAZWxlbWVudCkuaGlkZSgpXG4gICAgICAkKCcuZWJvb2stZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLnBkZi1kaXYnLCBAZWxlbWVudCkuc2hvdygpXG5cbiAgICAgIGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKEBkb2N1bWVudEV4cG9ydFBhdGgsIEBtYXJrZG93blByZXZpZXcuZWRpdG9yLmdldEZpbGVOYW1lKCkpXG4gICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnNsaWNlKDAsIGZpbGVQYXRoLmxlbmd0aC1wYXRoLmV4dG5hbWUoZmlsZVBhdGgpLmxlbmd0aCkgKyAnLnBkZidcbiAgICAgIEBmaWxlTmFtZUlucHV0LnNldFRleHQoZmlsZVBhdGgpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5mb3JtYXQtc2VsZWN0JywgQGVsZW1lbnQpLnZhbCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZXhwb3J0UERGUGFnZUZvcm1hdCcpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5vcmllbnRhdGlvbi1zZWxlY3QnLCBAZWxlbWVudCkudmFsIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5vcmllbnRhdGlvbicpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5tYXJnaW4tc2VsZWN0JywgQGVsZW1lbnQpLnZhbCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWFyZ2luc1R5cGUnKVxuXG4gICAgICAkKCcucGRmLWRpdiAucHJpbnQtYmFja2dyb3VuZC1jaGVja2JveCcsIEBlbGVtZW50KVswXS5jaGVja2VkID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnByaW50QmFja2dyb3VuZCcpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5naXRodWItc3R5bGUtY2hlY2tib3gnLCBAZWxlbWVudClbMF0uY2hlY2tlZCA9ICAgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZlVzZUdpdGh1YicpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5wZGYtYXV0by1vcGVuLWNoZWNrYm94JywgQGVsZW1lbnQpWzBdLmNoZWNrZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGRmT3BlbkF1dG9tYXRpY2FsbHknKVxuXG4gICAgIyMgc2VsZWN0XG4gICAgJCgnLnBkZi1kaXYgLmZvcm1hdC1zZWxlY3QnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZXhwb3J0UERGUGFnZUZvcm1hdCcsIHRoaXMudmFsdWUpXG5cbiAgICAkKCcucGRmLWRpdiAub3JpZW50YXRpb24tc2VsZWN0JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSktPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm9yaWVudGF0aW9uJywgdGhpcy52YWx1ZSlcblxuICAgICQoJy5wZGYtZGl2IC5tYXJnaW4tc2VsZWN0JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSktPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm1hcmdpbnNUeXBlJywgdGhpcy52YWx1ZSlcblxuICAgICMjIGNoZWNrYm94XG4gICAgJCgnLnBkZi1kaXYgLnByaW50LWJhY2tncm91bmQtY2hlY2tib3gnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucHJpbnRCYWNrZ3JvdW5kJywgZS50YXJnZXQuY2hlY2tlZClcblxuICAgICQoJy5wZGYtZGl2IC5naXRodWItc3R5bGUtY2hlY2tib3gnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGRmVXNlR2l0aHViJywgZS50YXJnZXQuY2hlY2tlZClcblxuICAgICQoJy5wZGYtZGl2IC5wZGYtYXV0by1vcGVuLWNoZWNrYm94JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSktPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZk9wZW5BdXRvbWF0aWNhbGx5JywgZS50YXJnZXQuY2hlY2tlZClcblxuICBpbml0UGhhbnRvbUpTUGFnZUV2ZW50OiAtPlxuICAgICQoJy5kb2N1bWVudC1waGFudG9tanMnLCBAZWxlbWVudCkub24gJ2NsaWNrJywgKGUpPT5cbiAgICAgICRlbCA9ICQoZS50YXJnZXQpXG4gICAgICBpZiAhJGVsLmhhc0NsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICQoJy5zZWxlY3RlZCcsIEBlbGVtZW50KS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAkZWwuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICBAZmlsZU5hbWVJbnB1dC5mb2N1cygpXG5cbiAgICAgICQoJy5odG1sLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5wZGYtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLmVib29rLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5waGFudG9tanMtZGl2JywgQGVsZW1lbnQpLnNob3coKVxuXG4gICAgICBmaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShAZG9jdW1lbnRFeHBvcnRQYXRoLCBAbWFya2Rvd25QcmV2aWV3LmVkaXRvci5nZXRGaWxlTmFtZSgpKVxuICAgICAgZXh0ZW5zaW9uID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBoYW50b21KU0V4cG9ydEZpbGVUeXBlJylcbiAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGguc2xpY2UoMCwgZmlsZVBhdGgubGVuZ3RoLXBhdGguZXh0bmFtZShmaWxlUGF0aCkubGVuZ3RoKSArICcuJyArIGV4dGVuc2lvblxuICAgICAgQGZpbGVOYW1lSW5wdXQuc2V0VGV4dChmaWxlUGF0aClcbiAgICAgIEBtYXJnaW5JbnB1dC5zZXRUZXh0KGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5waGFudG9tSlNNYXJnaW4nKSlcblxuICAgICAgJCgnLnBoYW50b21qcy1kaXYgLmZpbGUtdHlwZS1zZWxlY3QnLCBAZWxlbWVudCkudmFsIGV4dGVuc2lvblxuXG4gICAgICAkKCcucGhhbnRvbWpzLWRpdiAuZm9ybWF0LXNlbGVjdCcsIEBlbGVtZW50KS52YWwgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmV4cG9ydFBERlBhZ2VGb3JtYXQnKVxuXG4gICAgICAkKCcucGhhbnRvbWpzLWRpdiAub3JpZW50YXRpb24tc2VsZWN0JywgQGVsZW1lbnQpLnZhbCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQub3JpZW50YXRpb24nKVxuXG4gICAgICAkKCcucGhhbnRvbWpzLWRpdiAuZ2l0aHViLXN0eWxlLWNoZWNrYm94JywgQGVsZW1lbnQpWzBdLmNoZWNrZWQgPSAgIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wZGZVc2VHaXRodWInKVxuXG4gICAgICAkKCcucGhhbnRvbWpzLWRpdiAucGRmLWF1dG8tb3Blbi1jaGVja2JveCcsIEBlbGVtZW50KVswXS5jaGVja2VkID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZk9wZW5BdXRvbWF0aWNhbGx5JylcblxuICAgICMjIHNlbGVjdFxuICAgICQoJy5waGFudG9tanMtZGl2IC5maWxlLXR5cGUtc2VsZWN0JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSk9PlxuICAgICAgZXh0ZW5zaW9uID0gZS50YXJnZXQudmFsdWVcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5waGFudG9tSlNFeHBvcnRGaWxlVHlwZScsIGV4dGVuc2lvbilcblxuICAgICAgZmlsZVBhdGggPSBwYXRoLnJlc29sdmUoQGRvY3VtZW50RXhwb3J0UGF0aCwgQG1hcmtkb3duUHJldmlldy5lZGl0b3IuZ2V0RmlsZU5hbWUoKSlcbiAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGguc2xpY2UoMCwgZmlsZVBhdGgubGVuZ3RoLXBhdGguZXh0bmFtZShmaWxlUGF0aCkubGVuZ3RoKSArICcuJyArIGV4dGVuc2lvblxuICAgICAgQGZpbGVOYW1lSW5wdXQuc2V0VGV4dChmaWxlUGF0aClcblxuICAgICQoJy5waGFudG9tanMtZGl2IC5mb3JtYXQtc2VsZWN0JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSktPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmV4cG9ydFBERlBhZ2VGb3JtYXQnLCB0aGlzLnZhbHVlKVxuXG4gICAgJCgnLnBoYW50b21qcy1kaXYgLm9yaWVudGF0aW9uLXNlbGVjdCcsIEBlbGVtZW50KS5vbiAnY2hhbmdlJywgKGUpLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5vcmllbnRhdGlvbicsIHRoaXMudmFsdWUpXG5cbiAgICAjIyBpbnB1dFxuICAgIEBtYXJnaW5JbnB1dC5tb2RlbC5vbkRpZFN0b3BDaGFuZ2luZyAoZSk9PlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBoYW50b21KU01hcmdpbicsIEBtYXJnaW5JbnB1dC5nZXRUZXh0KCkpXG5cbiAgICAjIyBjaGVja2JveFxuICAgICQoJy5waGFudG9tanMtZGl2IC5naXRodWItc3R5bGUtY2hlY2tib3gnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGRmVXNlR2l0aHViJywgZS50YXJnZXQuY2hlY2tlZClcblxuICAgICQoJy5waGFudG9tanMtZGl2IC5wZGYtYXV0by1vcGVuLWNoZWNrYm94JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSktPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZk9wZW5BdXRvbWF0aWNhbGx5JywgZS50YXJnZXQuY2hlY2tlZClcblxuICAgICMjIGNvbmZpZ1xuICAgIGNvbmZpZyA9ICQoJy5oZWFkZXItZm9vdGVyLWNvbmZpZycsIEBlbGVtZW50KVxuICAgIGNvbmZpZy5vbiAnY2xpY2snLCAoKT0+XG4gICAgICBAaGlkZVBhbmVsKClcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aC5yZXNvbHZlKGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGgsICcuL21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQvcGhhbnRvbWpzX2hlYWRlcl9mb290ZXJfY29uZmlnLmpzJyksIHtzcGxpdDogJ2xlZnQnfSlcblxuICBpbml0RUJvb2tQYWdlRXZlbnQ6IC0+XG4gICAgJCgnLmRvY3VtZW50LWVib29rJywgQGVsZW1lbnQpLm9uICdjbGljaycsIChlKT0+XG4gICAgICAkZWwgPSAkKGUudGFyZ2V0KVxuICAgICAgaWYgISRlbC5oYXNDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAkKCcuc2VsZWN0ZWQnLCBAZWxlbW5ldCkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgJGVsLmFkZENsYXNzKCdzZWxlY3RlZCcpXG5cbiAgICAgIGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKEBkb2N1bWVudEV4cG9ydFBhdGgsIEBtYXJrZG93blByZXZpZXcuZWRpdG9yLmdldEZpbGVOYW1lKCkpXG4gICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnNsaWNlKDAsIGZpbGVQYXRoLmxlbmd0aC1wYXRoLmV4dG5hbWUoZmlsZVBhdGgpLmxlbmd0aCkgKyAnLicgKyAkKCcuZWJvb2stZGl2IC5lYm9vay1mb3JtYXQtc2VsZWN0JywgQGVsZW1lbnQpWzBdLnZhbHVlXG4gICAgICBAZmlsZU5hbWVJbnB1dC5zZXRUZXh0KGZpbGVQYXRoKVxuICAgICAgQGZpbGVOYW1lSW5wdXQuZm9jdXMoKVxuXG4gICAgICAkKCcuaHRtbC1kaXYnLCBAZWxlbWVudCkuaGlkZSgpXG4gICAgICAkKCcucGRmLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5waGFudG9tanMtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLmVib29rLWRpdicsIEBlbGVtZW50KS5zaG93KClcblxuICAgICMjIHNlbGVjdFxuICAgICQoJy5lYm9vay1kaXYgLmVib29rLWZvcm1hdC1zZWxlY3QnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKT0+XG4gICAgICBmaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShAZG9jdW1lbnRFeHBvcnRQYXRoLCBAbWFya2Rvd25QcmV2aWV3LmVkaXRvci5nZXRGaWxlTmFtZSgpKVxuICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zbGljZSgwLCBmaWxlUGF0aC5sZW5ndGgtcGF0aC5leHRuYW1lKGZpbGVQYXRoKS5sZW5ndGgpICsgJy4nICsgZS50YXJnZXQudmFsdWVcbiAgICAgIEBmaWxlTmFtZUlucHV0LnNldFRleHQoZmlsZVBhdGgpXG5cbiAgaGlkZVBhbmVsOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHBhbmVsPy5pc1Zpc2libGUoKVxuICAgIEBwYW5lbC5oaWRlKClcblxuICBkaXNwbGF5OiAobWFya2Rvd25QcmV2aWV3KS0+XG4gICAgQG1hcmtkb3duUHJldmlldyA9IG1hcmtkb3duUHJldmlld1xuXG4gICAgaWYgIUBtYXJrZG93blByZXZpZXcuZWRpdG9yXG4gICAgICByZXR1cm5cblxuXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgQHBhbmVsLnNob3coKVxuXG4gICAgY29weUxhYmVsID0gJCgnLmNvcHktbGFiZWwnLCBAZWxlbWVudClcbiAgICBAZG9jdW1lbnRFeHBvcnRQYXRoID0gYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmRvY3VtZW50RXhwb3J0UGF0aCdcbiAgICBjb3B5TGFiZWwuaHRtbCBcIjxpPkV4cG9ydCBkb2N1bWVudCB0byA8YT4je0Bkb2N1bWVudEV4cG9ydFBhdGh9PC9hPiBmb2xkZXI8L2k+XCJcbiAgICBjb3B5TGFiZWwuZmluZCgnYScpLm9uICdjbGljaycsICgpPT5cbiAgICAgIHRyeVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdhdG9tOi8vY29uZmlnL3BhY2thZ2VzL21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQnLCB7c3BsaXQ6ICdyaWdodCd9KVxuICAgICAgICBAaGlkZVBhbmVsKClcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgQGhpZGVQYW5lbCgpXG4gICAgaWYgQGRvY3VtZW50RXhwb3J0UGF0aC5zdGFydHNXaXRoKCcvJylcbiAgICAgIEBkb2N1bWVudEV4cG9ydFBhdGggPSBwYXRoLnJlc29sdmUobWFya2Rvd25QcmV2aWV3LnByb2plY3REaXJlY3RvcnlQYXRoLCAnLicrQGRvY3VtZW50RXhwb3J0UGF0aClcbiAgICBlbHNlXG4gICAgICBAZG9jdW1lbnRFeHBvcnRQYXRoID0gcGF0aC5yZXNvbHZlKG1hcmtkb3duUHJldmlldy5maWxlRGlyZWN0b3J5UGF0aCwgQGRvY3VtZW50RXhwb3J0UGF0aClcblxuICAgIEBmaWxlTmFtZUlucHV0LmZvY3VzKClcbiAgICAkKCcuc2VsZWN0ZWQnLCBAZWxlbWVudCkuY2xpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEV4cG9ydGVyVmlldyJdfQ==
