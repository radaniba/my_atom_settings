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
              "class": 'document-type document-prince'
            }, 'PRINCE (PDF)');
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
            _this.label('Use relative image path');
            _this.br();
            _this.input({
              "class": 'embed-local-images-checkbox',
              type: 'checkbox'
            });
            return _this.label('Embed local images');
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
            "class": 'prince-div'
          }, function() {
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
      this.initPrincePageEvent();
      this.initPhantomJSPageEvent();
      this.initEBookPageEvent();
      return $('.export-btn', this.element).click((function(_this) {
        return function() {
          var dest, embedLocalImages, isCDN, relativeImagePath;
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
            embedLocalImages = $('.embed-local-images-checkbox', _this.element)[0].checked;
            return _this.markdownPreview.saveAsHTML(dest, !isCDN, relativeImagePath, embedLocalImages);
          } else if ($('.document-phantomjs', _this.element).hasClass('selected')) {
            atom.notifications.addInfo('Your document is being prepared', {
              detail: ':)'
            });
            return _this.markdownPreview.phantomJSExport(dest);
          } else if ($('.document-ebook', _this.element).hasClass('selected')) {
            return _this.markdownPreview.generateEbook(dest);
          } else if ($('.document-prince', _this.element).hasClass('selected')) {
            return _this.markdownPreview.princeExport(dest);
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
          $('.prince-div', _this.element).hide();
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
          $('.prince-div', _this.element).hide();
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

    ExporterView.prototype.initPrincePageEvent = function() {
      $('.document-prince', this.element).on('click', (function(_this) {
        return function(e) {
          var $el, filePath;
          $el = $(e.target);
          if (!$el.hasClass('selected')) {
            $('.selected', _this.element).removeClass('selected');
            $el.addClass('selected');
            _this.fileNameInput.focus();
          }
          $('.html-div', _this.element).hide();
          $('.pdf-div', _this.element).hide();
          $('.ebook-div', _this.element).hide();
          $('.phantomjs-div', _this.element).hide();
          $('.prince-div', _this.element).show();
          filePath = path.resolve(_this.documentExportPath, _this.markdownPreview.editor.getFileName());
          filePath = filePath.slice(0, filePath.length - path.extname(filePath).length) + '.pdf';
          _this.fileNameInput.setText(filePath);
          $('.prince-div .github-style-checkbox', _this.element)[0].checked = atom.config.get('markdown-preview-enhanced.pdfUseGithub');
          return $('.prince-div .pdf-auto-open-checkbox', _this.element)[0].checked = atom.config.get('markdown-preview-enhanced.pdfOpenAutomatically');
        };
      })(this));
      $('.prince-div .github-style-checkbox', this.element).on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.pdfUseGithub', e.target.checked);
      });
      return $('.prince-div .pdf-auto-open-checkbox', this.element).on('change', function(e) {
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
          $('.prince-div', _this.element).hide();
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
          $('.ebook-div', _this.element).show();
          return $('.prince-div', _this.element).hide();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9leHBvcnRlci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUZBQUE7SUFBQTs7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUNWLE9BQWtDLE9BQUEsQ0FBUSxzQkFBUixDQUFsQyxFQUFDLFVBQUQsRUFBSSxjQUFKLEVBQVMsZ0JBQVQsRUFBZTs7RUFDZixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRUQ7Ozs7Ozs7MkJBQ0osYUFBQSxHQUFlLElBQUk7OzJCQUVuQixVQUFBLEdBQVksU0FBQTtNQUVWLElBQUMsQ0FBQSxlQUFELEdBQW1CO01BQ25CLElBQUMsQ0FBQSxrQkFBRCxHQUFzQjtNQUV0QixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUNqQjtRQUFBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtPQURpQixDQUFuQjthQUdBLElBQUMsQ0FBQSxVQUFELENBQUE7SUFSVTs7MkJBVVosT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7O1lBQ00sQ0FBRSxPQUFSLENBQUE7O2FBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUhGOztJQUtULFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7T0FBTCxFQUE2QixDQUFBLFNBQUEs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QyxDQUFBLE9BQWhCLENBQXdCLENBQUMsS0FBekIsQ0FBQTtJQXpCTzs7OztLQTdWZ0I7O0VBd1gzQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTVYakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xueyQsICQkJCwgVmlldywgVGV4dEVkaXRvclZpZXd9ICA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbmNsYXNzIEV4cG9ydGVyVmlldyBleHRlbmRzIFZpZXdcbiAgc3Vic2NyaXB0aW9uczogbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBpbml0aWFsaXplOiAoKS0+XG5cbiAgICBAbWFya2Rvd25QcmV2aWV3ID0gbnVsbFxuICAgIEBkb2N1bWVudEV4cG9ydFBhdGggPSBudWxsXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgQGVsZW1lbnQsXG4gICAgICAnY29yZTpjYW5jZWwnOiA9PiBAaGlkZVBhbmVsKClcblxuICAgIEBiaW5kRXZlbnRzKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBwYW5lbD8uZGVzdHJveSgpXG4gICAgQHBhbmVsID0gbnVsbFxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdleHBvcnRlci12aWV3JywgPT5cbiAgICAgIEBoNCAnRXhwb3J0IHRvIGRpc2snXG4gICAgICBAZGl2IGNsYXNzOiAnZG9jdW1lbnQtdHlwZS1kaXYgY2xlYXJmaXgnLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnZG9jdW1lbnQtdHlwZSBkb2N1bWVudC1odG1sIHNlbGVjdGVkJywgXCJIVE1MXCJcbiAgICAgICAgQGRpdiBjbGFzczogJ2RvY3VtZW50LXR5cGUgZG9jdW1lbnQtcGRmJywgXCJQREZcIlxuICAgICAgICBAZGl2IGNsYXNzOiAnZG9jdW1lbnQtdHlwZSBkb2N1bWVudC1wcmluY2UnLCAnUFJJTkNFIChQREYpJ1xuICAgICAgICBAZGl2IGNsYXNzOiAnZG9jdW1lbnQtdHlwZSBkb2N1bWVudC1waGFudG9tanMnLCBcIlBIQU5UT01KU1wiXG4gICAgICAgIEBkaXYgY2xhc3M6ICdkb2N1bWVudC10eXBlIGRvY3VtZW50LWVib29rJywgJ0VCT09LJ1xuXG4gICAgICBAbGFiZWwgY2xhc3M6ICdzYXZlLWFzLWxhYmVsJywgJ1NhdmUgYXMnXG4gICAgICBAc3VidmlldyAnZmlsZU5hbWVJbnB1dCcsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6ICdlbnRlciBmaWxlbmFtZSBoZXJlJylcbiAgICAgIEBsYWJlbCBjbGFzczogJ2NvcHktbGFiZWwnLCAnRXhwb3J0IGRvY3VtZW50IHRvIC4vIGZvbGRlcidcbiAgICAgIEBkaXYgY2xhc3M6ICdzcGxpdHRlcidcblxuICAgICAgQGRpdiBjbGFzczogJ2h0bWwtZGl2JywgPT5cbiAgICAgICAgQGlucHV0IGNsYXNzOiAnY2RuLWNoZWNrYm94JywgdHlwZTogJ2NoZWNrYm94J1xuICAgICAgICBAbGFiZWwgJ1VzZSBDRE4gaG9zdGVkIHJlc291cmNlcydcbiAgICAgICAgQGJyKClcbiAgICAgICAgQGlucHV0IGNsYXNzOiAncmVsYXRpdmUtaW1hZ2UtcGF0aC1jaGVja2JveCcsIHR5cGU6ICdjaGVja2JveCdcbiAgICAgICAgQGxhYmVsICdVc2UgcmVsYXRpdmUgaW1hZ2UgcGF0aCdcbiAgICAgICAgQGJyKClcbiAgICAgICAgQGlucHV0IGNsYXNzOiAnZW1iZWQtbG9jYWwtaW1hZ2VzLWNoZWNrYm94JywgdHlwZTogJ2NoZWNrYm94J1xuICAgICAgICBAbGFiZWwgJ0VtYmVkIGxvY2FsIGltYWdlcydcblxuICAgICAgQGRpdiBjbGFzczogJ3BkZi1kaXYnLCA9PlxuICAgICAgICBAbGFiZWwgJ0Zvcm1hdCdcbiAgICAgICAgQHNlbGVjdCBjbGFzczogJ2Zvcm1hdC1zZWxlY3QnLCA9PlxuICAgICAgICAgIEBvcHRpb24gJ0EzJ1xuICAgICAgICAgIEBvcHRpb24gJ0E0J1xuICAgICAgICAgIEBvcHRpb24gJ0E1J1xuICAgICAgICAgIEBvcHRpb24gJ0xlZ2FsJ1xuICAgICAgICAgIEBvcHRpb24gJ0xldHRlcidcbiAgICAgICAgICBAb3B0aW9uICdUYWJsb2lkJ1xuICAgICAgICBAYnIoKVxuICAgICAgICBAbGFiZWwgJ09yaWVudGF0aW9uJ1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnb3JpZW50YXRpb24tc2VsZWN0JywgPT5cbiAgICAgICAgICBAb3B0aW9uICdwb3J0cmFpdCdcbiAgICAgICAgICBAb3B0aW9uICdsYW5kc2NhcGUnXG4gICAgICAgIEBicigpXG4gICAgICAgIEBsYWJlbCAnTWFyZ2luJ1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnbWFyZ2luLXNlbGVjdCcsID0+XG4gICAgICAgICAgQG9wdGlvbiAnZGVmYXVsdCBtYXJnaW4nXG4gICAgICAgICAgQG9wdGlvbiAnbm8gbWFyZ2luJ1xuICAgICAgICAgIEBvcHRpb24gJ21pbmltdW0gbWFyZ2luJ1xuICAgICAgICBAYnIoKVxuICAgICAgICBAbGFiZWwgJ1ByaW50IGJhY2tncm91bmQnXG4gICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLCBjbGFzczogJ3ByaW50LWJhY2tncm91bmQtY2hlY2tib3gnXG4gICAgICAgIEBicigpXG4gICAgICAgIEBsYWJlbCAnR2l0aHViIHN0eWxlJ1xuICAgICAgICBAaW5wdXQgdHlwZTogJ2NoZWNrYm94JywgY2xhc3M6ICdnaXRodWItc3R5bGUtY2hlY2tib3gnXG4gICAgICAgIEBicigpXG4gICAgICAgIEBsYWJlbCAnT3BlbiBQREYgYWZ0ZXIgZ2VuZXJhdGlvbidcbiAgICAgICAgQGlucHV0IHR5cGU6ICdjaGVja2JveCcsIGNsYXNzOiAncGRmLWF1dG8tb3Blbi1jaGVja2JveCdcbiAgICAgICAgIyBAZGl2ICdzcGxpdHRlcidcbiAgICAgICAgIyBAbGFiZWwgJ2hlYWRlcidcbiAgICAgICAgIyBAbGFiZWwgJ2ltYWdlIHF1YWxpdHknXG4gICAgICAgICMgQGlucHV0IHR5cGU6ICd0ZXh0JywgY2xhc3M6ICdpbWFnZS1xdWFsaXR5LWlucHV0J1xuICAgICAgQGRpdiBjbGFzczogJ3ByaW5jZS1kaXYnLCA9PlxuICAgICAgICBAbGFiZWwgJ0dpdGh1YiBzdHlsZSdcbiAgICAgICAgQGlucHV0IHR5cGU6ICdjaGVja2JveCcsIGNsYXNzOiAnZ2l0aHViLXN0eWxlLWNoZWNrYm94J1xuICAgICAgICBAYnIoKVxuICAgICAgICBAbGFiZWwgJ09wZW4gUERGIGFmdGVyIGdlbmVyYXRpb24nXG4gICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLCBjbGFzczogJ3BkZi1hdXRvLW9wZW4tY2hlY2tib3gnXG5cbiAgICAgIEBkaXYgY2xhc3M6ICdwaGFudG9tanMtZGl2JywgPT5cbiAgICAgICAgQGxhYmVsICdGaWxlIFR5cGUnXG4gICAgICAgIEBzZWxlY3QgY2xhc3M6ICdmaWxlLXR5cGUtc2VsZWN0JywgPT5cbiAgICAgICAgICBAb3B0aW9uICdwZGYnXG4gICAgICAgICAgQG9wdGlvbiAncG5nJ1xuICAgICAgICAgIEBvcHRpb24gJ2pwZWcnXG4gICAgICAgIEBicigpXG4gICAgICAgIEBsYWJlbCAnRm9ybWF0J1xuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnZm9ybWF0LXNlbGVjdCcsID0+XG4gICAgICAgICAgQG9wdGlvbiAnQTMnXG4gICAgICAgICAgQG9wdGlvbiAnQTQnXG4gICAgICAgICAgQG9wdGlvbiAnQTUnXG4gICAgICAgICAgQG9wdGlvbiAnTGVnYWwnXG4gICAgICAgICAgQG9wdGlvbiAnTGV0dGVyJ1xuICAgICAgICAgIEBvcHRpb24gJ1RhYmxvaWQnXG4gICAgICAgIEBicigpXG4gICAgICAgIEBsYWJlbCAnT3JpZW50YXRpb24nXG4gICAgICAgIEBzZWxlY3QgY2xhc3M6ICdvcmllbnRhdGlvbi1zZWxlY3QnLCA9PlxuICAgICAgICAgIEBvcHRpb24gJ3BvcnRyYWl0J1xuICAgICAgICAgIEBvcHRpb24gJ2xhbmRzY2FwZSdcbiAgICAgICAgQGJyKClcbiAgICAgICAgQGxhYmVsICdNYXJnaW4nXG4gICAgICAgIEBzdWJ2aWV3ICdtYXJnaW5JbnB1dCcsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6ICcxY20nKVxuICAgICAgICBAYnIoKVxuICAgICAgICBAYSBjbGFzczogJ2hlYWRlci1mb290ZXItY29uZmlnJywgJ2NsaWNrIG1lIHRvIG9wZW4gaGVhZGVyIGFuZCBmb290ZXIgY29uZmlnJ1xuICAgICAgICBAYnIoKVxuICAgICAgICBAYnIoKVxuICAgICAgICBAbGFiZWwgJ0dpdGh1YiBzdHlsZSdcbiAgICAgICAgQGlucHV0IHR5cGU6ICdjaGVja2JveCcsIGNsYXNzOiAnZ2l0aHViLXN0eWxlLWNoZWNrYm94J1xuICAgICAgICBAYnIoKVxuICAgICAgICBAbGFiZWwgJ09wZW4gUERGIGFmdGVyIGdlbmVyYXRpb24nXG4gICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLCBjbGFzczogJ3BkZi1hdXRvLW9wZW4tY2hlY2tib3gnXG5cbiAgICAgIEBkaXYgY2xhc3M6ICdlYm9vay1kaXYnLCA9PlxuICAgICAgICBAc2VsZWN0IGNsYXNzOiAnZWJvb2stZm9ybWF0LXNlbGVjdCcsID0+XG4gICAgICAgICAgQG9wdGlvbiAnZXB1YidcbiAgICAgICAgICBAb3B0aW9uICdtb2JpJ1xuICAgICAgICAgIEBvcHRpb24gJ3BkZidcbiAgICAgICAgICBAb3B0aW9uICdodG1sJ1xuXG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9uLWdyb3VwJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2Nsb3NlLWJ0biBidG4nLCAnY2xvc2UnXG4gICAgICAgIEBkaXYgY2xhc3M6ICdleHBvcnQtYnRuIGJ0bicsICdleHBvcnQnXG5cbiAgYmluZEV2ZW50czogLT5cbiAgICAkKCcuY2xvc2UtYnRuJywgQGVsZW1lbnQpLmNsaWNrICgpPT4gQGhpZGVQYW5lbCgpXG5cbiAgICBAaW5pdEhUTUxQYWdlRXZlbnQoKVxuICAgIEBpbml0UERGUGFnZUV2ZW50KClcbiAgICBAaW5pdFByaW5jZVBhZ2VFdmVudCgpXG4gICAgQGluaXRQaGFudG9tSlNQYWdlRXZlbnQoKVxuICAgIEBpbml0RUJvb2tQYWdlRXZlbnQoKVxuXG4gICAgJCgnLmV4cG9ydC1idG4nLCBAZWxlbWVudCkuY2xpY2sgKCk9PlxuICAgICAgZGVzdCA9IEBmaWxlTmFtZUlucHV0LmdldFRleHQoKS50cmltKClcbiAgICAgIGlmICFAbWFya2Rvd25QcmV2aWV3IG9yICFkZXN0Lmxlbmd0aFxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCB0byBleHBvcnQgZG9jdW1lbnQnKVxuICAgICAgICByZXR1cm5cblxuICAgICAgQGhpZGVQYW5lbCgpXG4gICAgICBpZiAkKCcuZG9jdW1lbnQtcGRmJywgQGVsZW1lbnQpLmhhc0NsYXNzKCdzZWxlY3RlZCcpICMgcGRmXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdZb3VyIGRvY3VtZW50IGlzIGJlaW5nIHByZXBhcmVkJywgZGV0YWlsOiAnOiknKVxuICAgICAgICBAbWFya2Rvd25QcmV2aWV3LnNhdmVBc1BERiBkZXN0XG4gICAgICBlbHNlIGlmICQoJy5kb2N1bWVudC1odG1sJywgQGVsZW1lbnQpLmhhc0NsYXNzKCdzZWxlY3RlZCcpICMgaHRtbFxuICAgICAgICBpc0NETiA9ICQoJy5jZG4tY2hlY2tib3gnLCBAZWxlbWVudClbMF0uY2hlY2tlZFxuICAgICAgICByZWxhdGl2ZUltYWdlUGF0aCA9ICQoJy5yZWxhdGl2ZS1pbWFnZS1wYXRoLWNoZWNrYm94JywgQGVsZW1lbnQpWzBdLmNoZWNrZWRcbiAgICAgICAgZW1iZWRMb2NhbEltYWdlcyA9ICQoJy5lbWJlZC1sb2NhbC1pbWFnZXMtY2hlY2tib3gnLCBAZWxlbWVudClbMF0uY2hlY2tlZFxuICAgICAgICBAbWFya2Rvd25QcmV2aWV3LnNhdmVBc0hUTUwgZGVzdCwgIWlzQ0ROLCByZWxhdGl2ZUltYWdlUGF0aCwgZW1iZWRMb2NhbEltYWdlc1xuICAgICAgZWxzZSBpZiAkKCcuZG9jdW1lbnQtcGhhbnRvbWpzJywgQGVsZW1lbnQpLmhhc0NsYXNzKCdzZWxlY3RlZCcpICMgcGhhbnRvbWpzXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdZb3VyIGRvY3VtZW50IGlzIGJlaW5nIHByZXBhcmVkJywgZGV0YWlsOiAnOiknKVxuICAgICAgICBAbWFya2Rvd25QcmV2aWV3LnBoYW50b21KU0V4cG9ydCBkZXN0XG4gICAgICBlbHNlIGlmICQoJy5kb2N1bWVudC1lYm9vaycsIEBlbGVtZW50KS5oYXNDbGFzcygnc2VsZWN0ZWQnKSAjIGVib29rXG4gICAgICAgIEBtYXJrZG93blByZXZpZXcuZ2VuZXJhdGVFYm9vayBkZXN0XG4gICAgICBlbHNlIGlmICQoJy5kb2N1bWVudC1wcmluY2UnLCBAZWxlbWVudCkuaGFzQ2xhc3MoJ3NlbGVjdGVkJykgIyBwcmluY2VcbiAgICAgICAgQG1hcmtkb3duUHJldmlldy5wcmluY2VFeHBvcnQgZGVzdFxuXG4gIGluaXRIVE1MUGFnZUV2ZW50OiAtPlxuICAgICQoJy5kb2N1bWVudC1odG1sJywgQGVsZW1lbnQpLm9uICdjbGljaycsIChlKT0+XG4gICAgICAkZWwgPSAkKGUudGFyZ2V0KVxuICAgICAgaWYgISRlbC5oYXNDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAkKCcuc2VsZWN0ZWQnLCBAZWxlbW5ldCkucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgJGVsLmFkZENsYXNzKCdzZWxlY3RlZCcpXG5cbiAgICAgICAgQGZpbGVOYW1lSW5wdXQuZm9jdXMoKVxuXG4gICAgICAkKCcucGRmLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5waGFudG9tanMtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLmVib29rLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5odG1sLWRpdicsIEBlbGVtZW50KS5zaG93KClcbiAgICAgICQoJy5wcmluY2UtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuXG4gICAgICBmaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShAZG9jdW1lbnRFeHBvcnRQYXRoLCBAbWFya2Rvd25QcmV2aWV3LmVkaXRvci5nZXRGaWxlTmFtZSgpKVxuICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zbGljZSgwLCBmaWxlUGF0aC5sZW5ndGgtcGF0aC5leHRuYW1lKGZpbGVQYXRoKS5sZW5ndGgpICsgJy5odG1sJ1xuICAgICAgQGZpbGVOYW1lSW5wdXQuc2V0VGV4dChmaWxlUGF0aClcblxuICBpbml0UERGUGFnZUV2ZW50OiAtPlxuICAgICQoJy5kb2N1bWVudC1wZGYnLCBAZWxlbWVudCkub24gJ2NsaWNrJywgKGUpPT5cbiAgICAgICRlbCA9ICQoZS50YXJnZXQpXG4gICAgICBpZiAhJGVsLmhhc0NsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICQoJy5zZWxlY3RlZCcsIEBlbGVtbmV0KS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAkZWwuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICBAZmlsZU5hbWVJbnB1dC5mb2N1cygpXG5cbiAgICAgICQoJy5odG1sLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5waGFudG9tanMtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLmVib29rLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5wZGYtZGl2JywgQGVsZW1lbnQpLnNob3coKVxuICAgICAgJCgnLnByaW5jZS1kaXYnLCBAZWxlbWVudCkuaGlkZSgpXG5cbiAgICAgIGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKEBkb2N1bWVudEV4cG9ydFBhdGgsIEBtYXJrZG93blByZXZpZXcuZWRpdG9yLmdldEZpbGVOYW1lKCkpXG4gICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnNsaWNlKDAsIGZpbGVQYXRoLmxlbmd0aC1wYXRoLmV4dG5hbWUoZmlsZVBhdGgpLmxlbmd0aCkgKyAnLnBkZidcbiAgICAgIEBmaWxlTmFtZUlucHV0LnNldFRleHQoZmlsZVBhdGgpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5mb3JtYXQtc2VsZWN0JywgQGVsZW1lbnQpLnZhbCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZXhwb3J0UERGUGFnZUZvcm1hdCcpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5vcmllbnRhdGlvbi1zZWxlY3QnLCBAZWxlbWVudCkudmFsIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5vcmllbnRhdGlvbicpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5tYXJnaW4tc2VsZWN0JywgQGVsZW1lbnQpLnZhbCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQubWFyZ2luc1R5cGUnKVxuXG4gICAgICAkKCcucGRmLWRpdiAucHJpbnQtYmFja2dyb3VuZC1jaGVja2JveCcsIEBlbGVtZW50KVswXS5jaGVja2VkID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnByaW50QmFja2dyb3VuZCcpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5naXRodWItc3R5bGUtY2hlY2tib3gnLCBAZWxlbWVudClbMF0uY2hlY2tlZCA9ICAgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZlVzZUdpdGh1YicpXG5cbiAgICAgICQoJy5wZGYtZGl2IC5wZGYtYXV0by1vcGVuLWNoZWNrYm94JywgQGVsZW1lbnQpWzBdLmNoZWNrZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGRmT3BlbkF1dG9tYXRpY2FsbHknKVxuXG4gICAgIyMgc2VsZWN0XG4gICAgJCgnLnBkZi1kaXYgLmZvcm1hdC1zZWxlY3QnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuZXhwb3J0UERGUGFnZUZvcm1hdCcsIHRoaXMudmFsdWUpXG5cbiAgICAkKCcucGRmLWRpdiAub3JpZW50YXRpb24tc2VsZWN0JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSktPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm9yaWVudGF0aW9uJywgdGhpcy52YWx1ZSlcblxuICAgICQoJy5wZGYtZGl2IC5tYXJnaW4tc2VsZWN0JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSktPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm1hcmdpbnNUeXBlJywgdGhpcy52YWx1ZSlcblxuICAgICMjIGNoZWNrYm94XG4gICAgJCgnLnBkZi1kaXYgLnByaW50LWJhY2tncm91bmQtY2hlY2tib3gnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucHJpbnRCYWNrZ3JvdW5kJywgZS50YXJnZXQuY2hlY2tlZClcblxuICAgICQoJy5wZGYtZGl2IC5naXRodWItc3R5bGUtY2hlY2tib3gnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGRmVXNlR2l0aHViJywgZS50YXJnZXQuY2hlY2tlZClcblxuICAgICQoJy5wZGYtZGl2IC5wZGYtYXV0by1vcGVuLWNoZWNrYm94JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSktPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZk9wZW5BdXRvbWF0aWNhbGx5JywgZS50YXJnZXQuY2hlY2tlZClcblxuICBpbml0UHJpbmNlUGFnZUV2ZW50OiAtPlxuICAgICQoJy5kb2N1bWVudC1wcmluY2UnLCBAZWxlbWVudCkub24gJ2NsaWNrJywgKGUpPT5cbiAgICAgICRlbCA9ICQoZS50YXJnZXQpXG4gICAgICBpZiAhJGVsLmhhc0NsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICQoJy5zZWxlY3RlZCcsIEBlbGVtZW50KS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICAkZWwuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcblxuICAgICAgICBAZmlsZU5hbWVJbnB1dC5mb2N1cygpXG5cbiAgICAgICQoJy5odG1sLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5wZGYtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLmVib29rLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5waGFudG9tanMtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLnByaW5jZS1kaXYnLCBAZWxlbWVudCkuc2hvdygpXG5cbiAgICAgIGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKEBkb2N1bWVudEV4cG9ydFBhdGgsIEBtYXJrZG93blByZXZpZXcuZWRpdG9yLmdldEZpbGVOYW1lKCkpXG4gICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnNsaWNlKDAsIGZpbGVQYXRoLmxlbmd0aC1wYXRoLmV4dG5hbWUoZmlsZVBhdGgpLmxlbmd0aCkgKyAnLnBkZidcbiAgICAgIEBmaWxlTmFtZUlucHV0LnNldFRleHQoZmlsZVBhdGgpXG5cbiAgICAgICQoJy5wcmluY2UtZGl2IC5naXRodWItc3R5bGUtY2hlY2tib3gnLCBAZWxlbWVudClbMF0uY2hlY2tlZCA9ICAgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZlVzZUdpdGh1YicpXG5cbiAgICAgICQoJy5wcmluY2UtZGl2IC5wZGYtYXV0by1vcGVuLWNoZWNrYm94JywgQGVsZW1lbnQpWzBdLmNoZWNrZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGRmT3BlbkF1dG9tYXRpY2FsbHknKVxuXG4gICAgJCgnLnByaW5jZS1kaXYgLmdpdGh1Yi1zdHlsZS1jaGVja2JveCcsIEBlbGVtZW50KS5vbiAnY2hhbmdlJywgKGUpLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wZGZVc2VHaXRodWInLCBlLnRhcmdldC5jaGVja2VkKVxuXG4gICAgJCgnLnByaW5jZS1kaXYgLnBkZi1hdXRvLW9wZW4tY2hlY2tib3gnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGRmT3BlbkF1dG9tYXRpY2FsbHknLCBlLnRhcmdldC5jaGVja2VkKVxuXG4gIGluaXRQaGFudG9tSlNQYWdlRXZlbnQ6IC0+XG4gICAgJCgnLmRvY3VtZW50LXBoYW50b21qcycsIEBlbGVtZW50KS5vbiAnY2xpY2snLCAoZSk9PlxuICAgICAgJGVsID0gJChlLnRhcmdldClcbiAgICAgIGlmICEkZWwuaGFzQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgJCgnLnNlbGVjdGVkJywgQGVsZW1lbnQpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICRlbC5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuXG4gICAgICAgIEBmaWxlTmFtZUlucHV0LmZvY3VzKClcblxuICAgICAgJCgnLmh0bWwtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLnBkZi1kaXYnLCBAZWxlbWVudCkuaGlkZSgpXG4gICAgICAkKCcuZWJvb2stZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLnBoYW50b21qcy1kaXYnLCBAZWxlbWVudCkuc2hvdygpXG4gICAgICAkKCcucHJpbmNlLWRpdicsIEBlbGVtZW50KS5oaWRlKClcblxuICAgICAgZmlsZVBhdGggPSBwYXRoLnJlc29sdmUoQGRvY3VtZW50RXhwb3J0UGF0aCwgQG1hcmtkb3duUHJldmlldy5lZGl0b3IuZ2V0RmlsZU5hbWUoKSlcbiAgICAgIGV4dGVuc2lvbiA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5waGFudG9tSlNFeHBvcnRGaWxlVHlwZScpXG4gICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnNsaWNlKDAsIGZpbGVQYXRoLmxlbmd0aC1wYXRoLmV4dG5hbWUoZmlsZVBhdGgpLmxlbmd0aCkgKyAnLicgKyBleHRlbnNpb25cbiAgICAgIEBmaWxlTmFtZUlucHV0LnNldFRleHQoZmlsZVBhdGgpXG4gICAgICBAbWFyZ2luSW5wdXQuc2V0VGV4dChhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGhhbnRvbUpTTWFyZ2luJykpXG5cbiAgICAgICQoJy5waGFudG9tanMtZGl2IC5maWxlLXR5cGUtc2VsZWN0JywgQGVsZW1lbnQpLnZhbCBleHRlbnNpb25cblxuICAgICAgJCgnLnBoYW50b21qcy1kaXYgLmZvcm1hdC1zZWxlY3QnLCBAZWxlbWVudCkudmFsIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5leHBvcnRQREZQYWdlRm9ybWF0JylcblxuICAgICAgJCgnLnBoYW50b21qcy1kaXYgLm9yaWVudGF0aW9uLXNlbGVjdCcsIEBlbGVtZW50KS52YWwgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLm9yaWVudGF0aW9uJylcblxuICAgICAgJCgnLnBoYW50b21qcy1kaXYgLmdpdGh1Yi1zdHlsZS1jaGVja2JveCcsIEBlbGVtZW50KVswXS5jaGVja2VkID0gICBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGRmVXNlR2l0aHViJylcblxuICAgICAgJCgnLnBoYW50b21qcy1kaXYgLnBkZi1hdXRvLW9wZW4tY2hlY2tib3gnLCBAZWxlbWVudClbMF0uY2hlY2tlZCA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wZGZPcGVuQXV0b21hdGljYWxseScpXG5cbiAgICAjIyBzZWxlY3RcbiAgICAkKCcucGhhbnRvbWpzLWRpdiAuZmlsZS10eXBlLXNlbGVjdCcsIEBlbGVtZW50KS5vbiAnY2hhbmdlJywgKGUpPT5cbiAgICAgIGV4dGVuc2lvbiA9IGUudGFyZ2V0LnZhbHVlXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQucGhhbnRvbUpTRXhwb3J0RmlsZVR5cGUnLCBleHRlbnNpb24pXG5cbiAgICAgIGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKEBkb2N1bWVudEV4cG9ydFBhdGgsIEBtYXJrZG93blByZXZpZXcuZWRpdG9yLmdldEZpbGVOYW1lKCkpXG4gICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnNsaWNlKDAsIGZpbGVQYXRoLmxlbmd0aC1wYXRoLmV4dG5hbWUoZmlsZVBhdGgpLmxlbmd0aCkgKyAnLicgKyBleHRlbnNpb25cbiAgICAgIEBmaWxlTmFtZUlucHV0LnNldFRleHQoZmlsZVBhdGgpXG5cbiAgICAkKCcucGhhbnRvbWpzLWRpdiAuZm9ybWF0LXNlbGVjdCcsIEBlbGVtZW50KS5vbiAnY2hhbmdlJywgKGUpLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5leHBvcnRQREZQYWdlRm9ybWF0JywgdGhpcy52YWx1ZSlcblxuICAgICQoJy5waGFudG9tanMtZGl2IC5vcmllbnRhdGlvbi1zZWxlY3QnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQub3JpZW50YXRpb24nLCB0aGlzLnZhbHVlKVxuXG4gICAgIyMgaW5wdXRcbiAgICBAbWFyZ2luSW5wdXQubW9kZWwub25EaWRTdG9wQ2hhbmdpbmcgKGUpPT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5waGFudG9tSlNNYXJnaW4nLCBAbWFyZ2luSW5wdXQuZ2V0VGV4dCgpKVxuXG4gICAgIyMgY2hlY2tib3hcbiAgICAkKCcucGhhbnRvbWpzLWRpdiAuZ2l0aHViLXN0eWxlLWNoZWNrYm94JywgQGVsZW1lbnQpLm9uICdjaGFuZ2UnLCAoZSktPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLnBkZlVzZUdpdGh1YicsIGUudGFyZ2V0LmNoZWNrZWQpXG5cbiAgICAkKCcucGhhbnRvbWpzLWRpdiAucGRmLWF1dG8tb3Blbi1jaGVja2JveCcsIEBlbGVtZW50KS5vbiAnY2hhbmdlJywgKGUpLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWFya2Rvd24tcHJldmlldy1lbmhhbmNlZC5wZGZPcGVuQXV0b21hdGljYWxseScsIGUudGFyZ2V0LmNoZWNrZWQpXG5cbiAgICAjIyBjb25maWdcbiAgICBjb25maWcgPSAkKCcuaGVhZGVyLWZvb3Rlci1jb25maWcnLCBAZWxlbWVudClcbiAgICBjb25maWcub24gJ2NsaWNrJywgKCk9PlxuICAgICAgQGhpZGVQYW5lbCgpXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgucmVzb2x2ZShhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoLCAnLi9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL3BoYW50b21qc19oZWFkZXJfZm9vdGVyX2NvbmZpZy5qcycpLCB7c3BsaXQ6ICdsZWZ0J30pXG5cbiAgaW5pdEVCb29rUGFnZUV2ZW50OiAtPlxuICAgICQoJy5kb2N1bWVudC1lYm9vaycsIEBlbGVtZW50KS5vbiAnY2xpY2snLCAoZSk9PlxuICAgICAgJGVsID0gJChlLnRhcmdldClcbiAgICAgIGlmICEkZWwuaGFzQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgJCgnLnNlbGVjdGVkJywgQGVsZW1uZXQpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgICRlbC5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuXG4gICAgICBmaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShAZG9jdW1lbnRFeHBvcnRQYXRoLCBAbWFya2Rvd25QcmV2aWV3LmVkaXRvci5nZXRGaWxlTmFtZSgpKVxuICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zbGljZSgwLCBmaWxlUGF0aC5sZW5ndGgtcGF0aC5leHRuYW1lKGZpbGVQYXRoKS5sZW5ndGgpICsgJy4nICsgJCgnLmVib29rLWRpdiAuZWJvb2stZm9ybWF0LXNlbGVjdCcsIEBlbGVtZW50KVswXS52YWx1ZVxuICAgICAgQGZpbGVOYW1lSW5wdXQuc2V0VGV4dChmaWxlUGF0aClcbiAgICAgIEBmaWxlTmFtZUlucHV0LmZvY3VzKClcblxuICAgICAgJCgnLmh0bWwtZGl2JywgQGVsZW1lbnQpLmhpZGUoKVxuICAgICAgJCgnLnBkZi1kaXYnLCBAZWxlbWVudCkuaGlkZSgpXG4gICAgICAkKCcucGhhbnRvbWpzLWRpdicsIEBlbGVtZW50KS5oaWRlKClcbiAgICAgICQoJy5lYm9vay1kaXYnLCBAZWxlbWVudCkuc2hvdygpXG4gICAgICAkKCcucHJpbmNlLWRpdicsIEBlbGVtZW50KS5oaWRlKClcblxuICAgICMjIHNlbGVjdFxuICAgICQoJy5lYm9vay1kaXYgLmVib29rLWZvcm1hdC1zZWxlY3QnLCBAZWxlbWVudCkub24gJ2NoYW5nZScsIChlKT0+XG4gICAgICBmaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShAZG9jdW1lbnRFeHBvcnRQYXRoLCBAbWFya2Rvd25QcmV2aWV3LmVkaXRvci5nZXRGaWxlTmFtZSgpKVxuICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5zbGljZSgwLCBmaWxlUGF0aC5sZW5ndGgtcGF0aC5leHRuYW1lKGZpbGVQYXRoKS5sZW5ndGgpICsgJy4nICsgZS50YXJnZXQudmFsdWVcbiAgICAgIEBmaWxlTmFtZUlucHV0LnNldFRleHQoZmlsZVBhdGgpXG5cbiAgaGlkZVBhbmVsOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHBhbmVsPy5pc1Zpc2libGUoKVxuICAgIEBwYW5lbC5oaWRlKClcblxuICBkaXNwbGF5OiAobWFya2Rvd25QcmV2aWV3KS0+XG4gICAgQG1hcmtkb3duUHJldmlldyA9IG1hcmtkb3duUHJldmlld1xuXG4gICAgaWYgIUBtYXJrZG93blByZXZpZXcuZWRpdG9yXG4gICAgICByZXR1cm5cblxuXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgQHBhbmVsLnNob3coKVxuXG4gICAgY29weUxhYmVsID0gJCgnLmNvcHktbGFiZWwnLCBAZWxlbWVudClcbiAgICBAZG9jdW1lbnRFeHBvcnRQYXRoID0gYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmRvY3VtZW50RXhwb3J0UGF0aCdcbiAgICBjb3B5TGFiZWwuaHRtbCBcIjxpPkV4cG9ydCBkb2N1bWVudCB0byA8YT4je0Bkb2N1bWVudEV4cG9ydFBhdGh9PC9hPiBmb2xkZXI8L2k+XCJcbiAgICBjb3B5TGFiZWwuZmluZCgnYScpLm9uICdjbGljaycsICgpPT5cbiAgICAgIHRyeVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdhdG9tOi8vY29uZmlnL3BhY2thZ2VzL21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQnLCB7c3BsaXQ6ICdyaWdodCd9KVxuICAgICAgICBAaGlkZVBhbmVsKClcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgQGhpZGVQYW5lbCgpXG4gICAgaWYgQGRvY3VtZW50RXhwb3J0UGF0aC5zdGFydHNXaXRoKCcvJylcbiAgICAgIEBkb2N1bWVudEV4cG9ydFBhdGggPSBwYXRoLnJlc29sdmUobWFya2Rvd25QcmV2aWV3LnByb2plY3REaXJlY3RvcnlQYXRoLCAnLicrQGRvY3VtZW50RXhwb3J0UGF0aClcbiAgICBlbHNlXG4gICAgICBAZG9jdW1lbnRFeHBvcnRQYXRoID0gcGF0aC5yZXNvbHZlKG1hcmtkb3duUHJldmlldy5maWxlRGlyZWN0b3J5UGF0aCwgQGRvY3VtZW50RXhwb3J0UGF0aClcblxuICAgIEBmaWxlTmFtZUlucHV0LmZvY3VzKClcbiAgICAkKCcuc2VsZWN0ZWQnLCBAZWxlbWVudCkuY2xpY2soKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEV4cG9ydGVyVmlldyJdfQ==
