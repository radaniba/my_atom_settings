(function() {
  var $, $$$, CompositeDisposable, Directory, Emitter, ImageHelperView, TextEditorView, View, fs, imgur, path, ref, ref1, smAPI,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, View = ref1.View, TextEditorView = ref1.TextEditorView;

  Directory = require('atom').Directory;

  imgur = require('imgur');

  path = require('path');

  fs = require('fs');

  smAPI = require('./sm');

  ImageHelperView = (function(superClass) {
    extend(ImageHelperView, superClass);

    function ImageHelperView() {
      return ImageHelperView.__super__.constructor.apply(this, arguments);
    }

    ImageHelperView.prototype.subscriptions = new CompositeDisposable;

    ImageHelperView.prototype.initialize = function() {
      this.bindEvents();
      return this.subscriptions.add(atom.commands.add(this.element, {
        'core:cancel': (function(_this) {
          return function() {
            return _this.hidePanel();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function() {
            return _this.insertImageURL();
          };
        })(this)
      }));
    };

    ImageHelperView.prototype.destroy = function() {
      var ref2;
      this.subscriptions.dispose();
      if ((ref2 = this.panel) != null) {
        ref2.destroy();
      }
      this.panel = null;
      return this.editor = null;
    };

    ImageHelperView.content = function() {
      return this.div({
        "class": 'image-helper-view'
      }, (function(_this) {
        return function() {
          _this.h4('Image Helper');
          _this.div({
            "class": 'upload-div'
          }, function() {
            _this.label('Link');
            _this.subview("urlEditor", new TextEditorView({
              mini: true,
              placeholderText: 'enter image URL here, then press \'Enter\' to insert.'
            }));
            _this.div({
              "class": 'splitter'
            });
            _this.label({
              "class": 'copy-label'
            }, 'Copy image to root /assets folder');
            _this.div({
              "class": 'drop-area paster'
            }, function() {
              _this.p({
                "class": 'paster'
              }, 'Drop image file here or click me');
              return _this.input({
                "class": 'file-uploader paster',
                type: 'file',
                style: 'display: none;',
                multiple: "multiple"
              });
            });
            _this.div({
              "class": 'splitter'
            });
            _this.label('Upload');
            _this.div({
              "class": 'drop-area uploader'
            }, function() {
              _this.p({
                "class": 'uploader'
              }, 'Drop image file here or click me');
              return _this.input({
                "class": 'file-uploader uploader',
                type: 'file',
                style: 'display: none;',
                multiple: "multiple"
              });
            });
            return _this.div({
              "class": 'uploader-choice'
            }, function() {
              _this.span('use');
              _this.select({
                "class": 'uploader-select'
              }, function() {
                _this.option('imgur');
                return _this.option('sm.ms');
              });
              return _this.span('to upload images');
            });
          });
          return _this.div({
            "class": 'close-btn btn'
          }, 'close');
        };
      })(this));
    };

    ImageHelperView.prototype.bindEvents = function() {
      var addBtn, closeBtn, dropArea, fileUploader, uploaderSelect;
      closeBtn = $('.close-btn', this.element);
      closeBtn.click((function(_this) {
        return function() {
          return _this.hidePanel();
        };
      })(this));
      addBtn = $('.add-btn', this.element);
      addBtn.click((function(_this) {
        return function() {
          return _this.insertImageURL();
        };
      })(this));
      dropArea = $('.drop-area', this.element);
      fileUploader = $('.file-uploader', this.element);
      uploaderSelect = $('.uploader-select', this.element);
      dropArea.on("drop dragend dragstart dragenter dragleave drag dragover", (function(_this) {
        return function(e) {
          var file, j, k, len, len1, ref2, ref3, results, results1;
          e.preventDefault();
          e.stopPropagation();
          if (e.type === "drop") {
            if (e.target.className.indexOf('paster') >= 0) {
              ref2 = e.originalEvent.dataTransfer.files;
              results = [];
              for (j = 0, len = ref2.length; j < len; j++) {
                file = ref2[j];
                results.push(_this.pasteImageFile(file));
              }
              return results;
            } else {
              ref3 = e.originalEvent.dataTransfer.files;
              results1 = [];
              for (k = 0, len1 = ref3.length; k < len1; k++) {
                file = ref3[k];
                results1.push(_this.uploadImageFile(file));
              }
              return results1;
            }
          }
        };
      })(this));
      dropArea.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return $(this).find('input[type="file"]').click();
      });
      fileUploader.on('click', function(e) {
        return e.stopPropagation();
      });
      fileUploader.on('change', (function(_this) {
        return function(e) {
          var file, j, k, len, len1, ref2, ref3, results, results1;
          if (e.target.className.indexOf('paster') >= 0) {
            ref2 = e.target.files;
            results = [];
            for (j = 0, len = ref2.length; j < len; j++) {
              file = ref2[j];
              results.push(_this.pasteImageFile(file));
            }
            return results;
          } else {
            ref3 = e.target.files;
            results1 = [];
            for (k = 0, len1 = ref3.length; k < len1; k++) {
              file = ref3[k];
              results1.push(_this.uploadImageFile(file));
            }
            return results1;
          }
        };
      })(this));
      return uploaderSelect.on('change', function(e) {
        return atom.config.set('markdown-preview-enhanced.imageUploader', this.value);
      });
    };

    ImageHelperView.prototype.replaceHint = function(editor, lineNo, hint, withStr) {
      var line;
      if (editor && editor.buffer && editor.buffer.lines[lineNo].indexOf(hint) >= 0) {
        line = editor.buffer.lines[lineNo];
        editor.buffer.setTextInRange([[lineNo, 0], [lineNo + 1, 0]], line.replace(hint, withStr + '\n'));
        return true;
      }
      return false;
    };

    ImageHelperView.prototype.pasteImageFile = function(file) {
      var assetDirectory, editor, editorDirectoryPath, editorPath, imageFolderPath, j, len, projectDirectory, projectDirectoryPath, ref2;
      this.hidePanel();
      editor = this.editor;
      editorPath = editor.getPath();
      editorDirectoryPath = editor.getDirectoryPath();
      imageFolderPath = atom.config.get('markdown-preview-enhanced.imageFolderPath');
      if (imageFolderPath[imageFolderPath.length - 1] === '/') {
        imageFolderPath = imageFolderPath.slice(0, imageFolderPath.length - 1);
      }
      if (file) {
        if (imageFolderPath[0] === '/') {
          projectDirectoryPath = null;
          ref2 = atom.project.rootDirectories;
          for (j = 0, len = ref2.length; j < len; j++) {
            projectDirectory = ref2[j];
            if (projectDirectory.contains(editorPath)) {
              projectDirectoryPath = projectDirectory.getPath();
              break;
            }
          }
          if (!projectDirectoryPath) {
            atom.notifications.addError('You have to \'Add Project Folder\' first', {
              detail: 'project directory path not found'
            });
            return;
          }
          assetDirectory = new Directory(path.resolve(projectDirectoryPath, "." + imageFolderPath));
        } else {
          assetDirectory = new Directory(path.resolve(editorDirectoryPath, imageFolderPath));
        }
        return assetDirectory.create().then((function(_this) {
          return function(flag) {
            var destPath, fileName;
            fileName = file.name;
            destPath = path.resolve(assetDirectory.path, fileName);
            return fs.stat(destPath, function(err, stat) {
              var description, lastDotOffset, uid, url;
              if (err === null) {
                lastDotOffset = fileName.lastIndexOf('.');
                uid = '_' + Math.random().toString(36).substr(2, 9);
                if (lastDotOffset > 0) {
                  description = fileName.slice(0, lastDotOffset);
                  fileName = fileName.slice(0, lastDotOffset) + uid + fileName.slice(lastDotOffset, fileName.length);
                } else {
                  description = fileName;
                  fileName = fileName + uid;
                }
                fs.createReadStream(file.path).pipe(fs.createWriteStream(path.resolve(assetDirectory.path, fileName)));
              } else if (err.code === 'ENOENT') {
                fs.createReadStream(file.path).pipe(fs.createWriteStream(destPath));
                if (fileName.lastIndexOf('.')) {
                  description = fileName.slice(0, fileName.lastIndexOf('.'));
                } else {
                  description = fileName;
                }
              } else {
                atom.notifications.addError("Error: " + err);
                return;
              }
              atom.notifications.addSuccess("Finish copying image", {
                detail: file.name + " has been copied to folder " + assetDirectory.path
              });
              url = imageFolderPath + "/" + fileName;
              if (url.indexOf(' ') >= 0) {
                url = "<" + url + ">";
              }
              return editor.insertText("![" + description + "](" + url + ")");
            });
          };
        })(this));
      }
    };

    ImageHelperView.prototype.setUploadedImageURL = function(fileName, url, editor, hint, curPos) {
      var buffer, description, i, line, results, withStr;
      if (fileName.lastIndexOf('.')) {
        description = fileName.slice(0, fileName.lastIndexOf('.'));
      } else {
        description = fileName;
      }
      buffer = editor.buffer;
      line = editor.buffer.lines[curPos.row];
      withStr = "![" + description + "](" + url + ")";
      if (!this.replaceHint(editor, curPos.row, hint, withStr)) {
        i = curPos.row - 20;
        results = [];
        while (i <= curPos.row + 20) {
          if (this.replaceHint(editor, i, hint, withStr)) {
            break;
          }
          results.push(i++);
        }
        return results;
      }
    };

    ImageHelperView.prototype.uploadImageFile = function(file) {
      var curPos, editor, fileName, hint, uid, uploader;
      fileName = file.name;
      this.hidePanel();
      editor = this.editor;
      uid = Math.random().toString(36).substr(2, 9);
      hint = "![Uploading " + fileName + "… (" + uid + ")]()";
      curPos = editor.getCursorBufferPosition();
      uploader = atom.config.get('markdown-preview-enhanced.imageUploader');
      editor.insertText(hint);
      atom.views.getView(editor).focus();
      if (uploader === 'imgur') {
        return imgur.uploadFile(file.path).then((function(_this) {
          return function(json) {
            return _this.setUploadedImageURL(fileName, json.data.link, editor, hint, curPos);
          };
        })(this))["catch"]((function(_this) {
          return function(err) {
            return atom.notifications.addError(err.message);
          };
        })(this));
      } else {
        return smAPI.uploadFile(file.path, (function(_this) {
          return function(err, url) {
            if (err) {
              return atom.notifications.addError(err);
            } else {
              return _this.setUploadedImageURL(fileName, url, editor, hint, curPos);
            }
          };
        })(this));
      }
    };

    ImageHelperView.prototype.insertImageURL = function() {
      var curPos, url;
      url = this.urlEditor.getText().trim();
      if (url.indexOf(' ') >= 0) {
        url = "<" + url + ">";
      }
      if (url.length) {
        this.hidePanel();
        curPos = this.editor.getCursorBufferPosition();
        this.editor.insertText("![enter image description here](" + url + ")");
        this.editor.setSelectedBufferRange([[curPos.row, curPos.column + 2], [curPos.row, curPos.column + 30]]);
        return atom.views.getView(this.editor).focus();
      }
    };

    ImageHelperView.prototype.hidePanel = function() {
      var ref2;
      if (!((ref2 = this.panel) != null ? ref2.isVisible() : void 0)) {
        return;
      }
      return this.panel.hide();
    };

    ImageHelperView.prototype.display = function(editor) {
      var copyLabel, imageFolderPath, uploader;
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.panel.show();
      this.urlEditor.focus();
      this.editor = editor;
      this.urlEditor.setText('');
      $(this.element).find('input[type="file"]').val('');
      copyLabel = $(this.element).find('.copy-label');
      imageFolderPath = atom.config.get('markdown-preview-enhanced.imageFolderPath');
      if (imageFolderPath[imageFolderPath.length - 1] === '/') {
        imageFolderPath = imageFolderPath.slice(0, imageFolderPath.length - 1);
      }
      copyLabel.html("Copy image to " + (imageFolderPath[0] === '/' ? 'root' : 'relative') + " <a>" + imageFolderPath + "</a> folder");
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
      uploader = atom.config.get('markdown-preview-enhanced.imageUploader');
      return $(this.element).find('.uploader-select').val(uploader);
    };

    return ImageHelperView;

  })(View);

  module.exports = ImageHelperView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9pbWFnZS1oZWxwZXItdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlIQUFBO0lBQUE7OztFQUFBLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMscUJBQUQsRUFBVTs7RUFDVixPQUFrQyxPQUFBLENBQVEsc0JBQVIsQ0FBbEMsRUFBQyxVQUFELEVBQUksY0FBSixFQUFTLGdCQUFULEVBQWU7O0VBQ2QsWUFBYSxPQUFBLENBQVEsTUFBUjs7RUFDZCxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxLQUFBLEdBQVEsT0FBQSxDQUFRLE1BQVI7O0VBRUY7Ozs7Ozs7OEJBQ0osYUFBQSxHQUFlLElBQUk7OzhCQUVuQixVQUFBLEdBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxVQUFELENBQUE7YUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUNqQjtRQUFBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtRQUNBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsY0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRGhCO09BRGlCLENBQW5CO0lBSFU7OzhCQU9aLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFhLENB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WUFHTTttQkFDSixLQUFDLENBQUEsU0FBRCxDQUFBLEVBSkY7O1FBRDhCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQztNQU9BLFFBQUEsR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUNBQWhCO2FBQ1gsQ0FBQSxDQUFFLElBQUMsQ0FBQSxPQUFILENBQVcsQ0FBQyxJQUFaLENBQWlCLGtCQUFqQixDQUFvQyxDQUFDLEdBQXJDLENBQXlDLFFBQXpDO0lBMUJPOzs7O0tBM05tQjs7RUF1UDlCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBaFFqQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgJCQkLCBWaWV3LCBUZXh0RWRpdG9yVmlld30gID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG57RGlyZWN0b3J5fSA9IHJlcXVpcmUgJ2F0b20nXG5pbWd1ciA9IHJlcXVpcmUgJ2ltZ3VyJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuXG5zbUFQSSA9IHJlcXVpcmUgJy4vc20nXG5cbmNsYXNzIEltYWdlSGVscGVyVmlldyBleHRlbmRzIFZpZXdcbiAgc3Vic2NyaXB0aW9uczogbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBpbml0aWFsaXplOiAoKS0+XG4gICAgQGJpbmRFdmVudHMoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgJ2NvcmU6Y2FuY2VsJzogPT4gQGhpZGVQYW5lbCgpLFxuICAgICAgJ2NvcmU6Y29uZmlybSc6ID0+IEBpbnNlcnRJbWFnZVVSTCgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAcGFuZWw/LmRlc3Ryb3koKVxuICAgIEBwYW5lbCA9IG51bGxcbiAgICBAZWRpdG9yID0gbnVsbFxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdpbWFnZS1oZWxwZXItdmlldycsID0+XG4gICAgICBAaDQgJ0ltYWdlIEhlbHBlcidcbiAgICAgIEBkaXYgY2xhc3M6ICd1cGxvYWQtZGl2JywgPT5cbiAgICAgICAgQGxhYmVsICdMaW5rJ1xuICAgICAgICBAc3VidmlldyBcInVybEVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiAnZW50ZXIgaW1hZ2UgVVJMIGhlcmUsIHRoZW4gcHJlc3MgXFwnRW50ZXJcXCcgdG8gaW5zZXJ0LicpXG5cbiAgICAgICAgQGRpdiBjbGFzczogJ3NwbGl0dGVyJ1xuXG4gICAgICAgIEBsYWJlbCBjbGFzczogJ2NvcHktbGFiZWwnLCAnQ29weSBpbWFnZSB0byByb290IC9hc3NldHMgZm9sZGVyJ1xuICAgICAgICBAZGl2IGNsYXNzOiAnZHJvcC1hcmVhIHBhc3RlcicsID0+XG4gICAgICAgICAgQHAgY2xhc3M6ICdwYXN0ZXInLCAnRHJvcCBpbWFnZSBmaWxlIGhlcmUgb3IgY2xpY2sgbWUnXG4gICAgICAgICAgQGlucHV0IGNsYXNzOiAnZmlsZS11cGxvYWRlciBwYXN0ZXInLCB0eXBlOidmaWxlJywgc3R5bGU6ICdkaXNwbGF5OiBub25lOycsIG11bHRpcGxlOiBcIm11bHRpcGxlXCJcblxuICAgICAgICBAZGl2IGNsYXNzOiAnc3BsaXR0ZXInXG5cbiAgICAgICAgQGxhYmVsICdVcGxvYWQnXG4gICAgICAgIEBkaXYgY2xhc3M6ICdkcm9wLWFyZWEgdXBsb2FkZXInLCA9PlxuICAgICAgICAgIEBwIGNsYXNzOiAndXBsb2FkZXInLCAnRHJvcCBpbWFnZSBmaWxlIGhlcmUgb3IgY2xpY2sgbWUnXG4gICAgICAgICAgQGlucHV0IGNsYXNzOiAnZmlsZS11cGxvYWRlciB1cGxvYWRlcicsIHR5cGU6J2ZpbGUnLCBzdHlsZTogJ2Rpc3BsYXk6IG5vbmU7JywgbXVsdGlwbGU6IFwibXVsdGlwbGVcIlxuICAgICAgICBAZGl2IGNsYXNzOiAndXBsb2FkZXItY2hvaWNlJywgPT5cbiAgICAgICAgICBAc3BhbiAndXNlJ1xuICAgICAgICAgIEBzZWxlY3QgY2xhc3M6ICd1cGxvYWRlci1zZWxlY3QnLCA9PlxuICAgICAgICAgICAgQG9wdGlvbiAnaW1ndXInXG4gICAgICAgICAgICBAb3B0aW9uICdzbS5tcydcbiAgICAgICAgICBAc3BhbiAndG8gdXBsb2FkIGltYWdlcydcbiAgICAgIEBkaXYgY2xhc3M6ICdjbG9zZS1idG4gYnRuJywgJ2Nsb3NlJ1xuXG4gIGJpbmRFdmVudHM6IC0+XG4gICAgY2xvc2VCdG4gPSAkKCcuY2xvc2UtYnRuJywgQGVsZW1lbnQpXG4gICAgY2xvc2VCdG4uY2xpY2sgKCk9PlxuICAgICAgQGhpZGVQYW5lbCgpXG5cbiAgICBhZGRCdG4gPSAkKCcuYWRkLWJ0bicsIEBlbGVtZW50KVxuICAgIGFkZEJ0bi5jbGljayAoKT0+XG4gICAgICBAaW5zZXJ0SW1hZ2VVUkwoKVxuXG4gICAgZHJvcEFyZWEgPSAkKCcuZHJvcC1hcmVhJywgQGVsZW1lbnQpXG4gICAgZmlsZVVwbG9hZGVyID0gJCgnLmZpbGUtdXBsb2FkZXInLCBAZWxlbWVudClcblxuICAgIHVwbG9hZGVyU2VsZWN0ID0gJCgnLnVwbG9hZGVyLXNlbGVjdCcsIEBlbGVtZW50KVxuXG4gICAgZHJvcEFyZWEub24gXCJkcm9wIGRyYWdlbmQgZHJhZ3N0YXJ0IGRyYWdlbnRlciBkcmFnbGVhdmUgZHJhZyBkcmFnb3ZlclwiLCAoZSk9PlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBpZiBlLnR5cGUgPT0gXCJkcm9wXCJcbiAgICAgICAgaWYgZS50YXJnZXQuY2xhc3NOYW1lLmluZGV4T2YoJ3Bhc3RlcicpID49IDAgIyBwYXN0ZVxuICAgICAgICAgIGZvciBmaWxlIGluIGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXNcbiAgICAgICAgICAgIEBwYXN0ZUltYWdlRmlsZSBmaWxlXG4gICAgICAgIGVsc2UgIyB1cGxvYWRcbiAgICAgICAgICBmb3IgZmlsZSBpbiBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzXG4gICAgICAgICAgICBAdXBsb2FkSW1hZ2VGaWxlIGZpbGVcblxuICAgIGRyb3BBcmVhLm9uICdjbGljaycsIChlKS0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICQodGhpcykuZmluZCgnaW5wdXRbdHlwZT1cImZpbGVcIl0nKS5jbGljaygpXG5cbiAgICBmaWxlVXBsb2FkZXIub24gJ2NsaWNrJywgKGUpLT5cbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIGZpbGVVcGxvYWRlci5vbiAnY2hhbmdlJywgKGUpPT5cbiAgICAgIGlmIGUudGFyZ2V0LmNsYXNzTmFtZS5pbmRleE9mKCdwYXN0ZXInKSA+PSAwICMgcGFzdGVcbiAgICAgICAgZm9yIGZpbGUgaW4gZS50YXJnZXQuZmlsZXNcbiAgICAgICAgICBAcGFzdGVJbWFnZUZpbGUgZmlsZVxuICAgICAgZWxzZSAjIHVwbG9hZFxuICAgICAgICBmb3IgZmlsZSBpbiBlLnRhcmdldC5maWxlc1xuICAgICAgICAgIEB1cGxvYWRJbWFnZUZpbGUgZmlsZVxuXG4gICAgdXBsb2FkZXJTZWxlY3Qub24gJ2NoYW5nZScsIChlKS0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuaW1hZ2VVcGxvYWRlcicsIHRoaXMudmFsdWUpXG5cbiAgcmVwbGFjZUhpbnQ6IChlZGl0b3IsIGxpbmVObywgaGludCwgd2l0aFN0ciktPlxuICAgIGlmIGVkaXRvciAmJiBlZGl0b3IuYnVmZmVyICYmIGVkaXRvci5idWZmZXIubGluZXNbbGluZU5vXS5pbmRleE9mKGhpbnQpID49IDBcbiAgICAgIGxpbmUgPSBlZGl0b3IuYnVmZmVyLmxpbmVzW2xpbmVOb11cbiAgICAgIGVkaXRvci5idWZmZXIuc2V0VGV4dEluUmFuZ2UoW1tsaW5lTm8sIDBdLCBbbGluZU5vKzEsIDBdXSwgbGluZS5yZXBsYWNlKGhpbnQsIHdpdGhTdHIgKyAnXFxuJykpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHBhc3RlSW1hZ2VGaWxlOiAoZmlsZSktPlxuICAgIEBoaWRlUGFuZWwoKVxuXG4gICAgZWRpdG9yID0gQGVkaXRvclxuICAgIGVkaXRvclBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgZWRpdG9yRGlyZWN0b3J5UGF0aCA9IGVkaXRvci5nZXREaXJlY3RvcnlQYXRoKClcbiAgICBpbWFnZUZvbGRlclBhdGggPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuaW1hZ2VGb2xkZXJQYXRoJ1xuXG4gICAgaWYgaW1hZ2VGb2xkZXJQYXRoW2ltYWdlRm9sZGVyUGF0aC5sZW5ndGggLSAxXSA9PSAnLydcbiAgICAgIGltYWdlRm9sZGVyUGF0aCA9IGltYWdlRm9sZGVyUGF0aC5zbGljZSgwLCBpbWFnZUZvbGRlclBhdGgubGVuZ3RoIC0gMSlcblxuICAgIGlmIGZpbGVcbiAgICAgIGlmIGltYWdlRm9sZGVyUGF0aFswXSA9PSAnLycgIyByb290IGZvbGRlclxuICAgICAgICBwcm9qZWN0RGlyZWN0b3J5UGF0aCA9IG51bGxcbiAgICAgICAgZm9yIHByb2plY3REaXJlY3RvcnkgaW4gYXRvbS5wcm9qZWN0LnJvb3REaXJlY3Rvcmllc1xuICAgICAgICAgIGlmIHByb2plY3REaXJlY3RvcnkuY29udGFpbnMoZWRpdG9yUGF0aClcbiAgICAgICAgICAgIHByb2plY3REaXJlY3RvcnlQYXRoID0gcHJvamVjdERpcmVjdG9yeS5nZXRQYXRoKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGlmICFwcm9qZWN0RGlyZWN0b3J5UGF0aFxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignWW91IGhhdmUgdG8gXFwnQWRkIFByb2plY3QgRm9sZGVyXFwnIGZpcnN0JywgZGV0YWlsOiAncHJvamVjdCBkaXJlY3RvcnkgcGF0aCBub3QgZm91bmQnKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICBhc3NldERpcmVjdG9yeSA9IG5ldyBEaXJlY3RvcnkocGF0aC5yZXNvbHZlKHByb2plY3REaXJlY3RvcnlQYXRoLCBcIi4je2ltYWdlRm9sZGVyUGF0aH1cIikpXG4gICAgICBlbHNlICMgcmVsYXRpdmUgZm9sZGVyXG4gICAgICAgIGFzc2V0RGlyZWN0b3J5ID0gbmV3IERpcmVjdG9yeShwYXRoLnJlc29sdmUoZWRpdG9yRGlyZWN0b3J5UGF0aCwgaW1hZ2VGb2xkZXJQYXRoKSlcblxuICAgICAgYXNzZXREaXJlY3RvcnkuY3JlYXRlKCkudGhlbiAoZmxhZyk9PlxuICAgICAgICBmaWxlTmFtZSA9IGZpbGUubmFtZVxuICAgICAgICBkZXN0UGF0aCA9IHBhdGgucmVzb2x2ZShhc3NldERpcmVjdG9yeS5wYXRoLCBmaWxlTmFtZSlcblxuICAgICAgICBmcy5zdGF0IGRlc3RQYXRoLCAoZXJyLCBzdGF0KT0+XG4gICAgICAgICAgaWYgZXJyID09IG51bGwgIyBmaWxlIGV4aXN0ZWRcbiAgICAgICAgICAgIGxhc3REb3RPZmZzZXQgPSBmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpXG4gICAgICAgICAgICB1aWQgPSAnXycgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSlcblxuICAgICAgICAgICAgaWYgbGFzdERvdE9mZnNldCA+IDBcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBmaWxlTmFtZS5zbGljZSgwLCBsYXN0RG90T2Zmc2V0KVxuICAgICAgICAgICAgICBmaWxlTmFtZSA9IGZpbGVOYW1lLnNsaWNlKDAsIGxhc3REb3RPZmZzZXQpICsgdWlkICsgZmlsZU5hbWUuc2xpY2UobGFzdERvdE9mZnNldCwgZmlsZU5hbWUubGVuZ3RoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IGZpbGVOYW1lXG4gICAgICAgICAgICAgIGZpbGVOYW1lID0gZmlsZU5hbWUgKyB1aWRcblxuICAgICAgICAgICAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlLnBhdGgpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0ocGF0aC5yZXNvbHZlKGFzc2V0RGlyZWN0b3J5LnBhdGgsIGZpbGVOYW1lKSkpXG5cbiAgICAgICAgICBlbHNlIGlmIGVyci5jb2RlID09ICdFTk9FTlQnICMgZmlsZSBkb2VzIG5vdCBleGlzdFxuICAgICAgICAgICAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlLnBhdGgpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdFBhdGgpKVxuXG4gICAgICAgICAgICBpZiBmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gZmlsZU5hbWUuc2xpY2UoMCwgZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBmaWxlTmFtZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIkVycm9yOiAje2Vycn1cIilcbiAgICAgICAgICAgIHJldHVyblxuXG5cbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcIkZpbmlzaCBjb3B5aW5nIGltYWdlXCIsIGRldGFpbDogXCIje2ZpbGUubmFtZX0gaGFzIGJlZW4gY29waWVkIHRvIGZvbGRlciAje2Fzc2V0RGlyZWN0b3J5LnBhdGh9XCIpXG5cbiAgICAgICAgICB1cmwgPSBcIiN7aW1hZ2VGb2xkZXJQYXRofS8je2ZpbGVOYW1lfVwiXG4gICAgICAgICAgaWYgdXJsLmluZGV4T2YoJyAnKSA+PSAwXG4gICAgICAgICAgICB1cmwgPSBcIjwje3VybH0+XCJcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiFbI3tkZXNjcmlwdGlvbn1dKCN7dXJsfSlcIilcblxuICBzZXRVcGxvYWRlZEltYWdlVVJMOiAoZmlsZU5hbWUsIHVybCwgZWRpdG9yLCBoaW50LCBjdXJQb3MpLT5cbiAgICBpZiBmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpXG4gICAgICBkZXNjcmlwdGlvbiA9IGZpbGVOYW1lLnNsaWNlKDAsIGZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJykpXG4gICAgZWxzZVxuICAgICAgZGVzY3JpcHRpb24gPSBmaWxlTmFtZVxuXG4gICAgYnVmZmVyID0gZWRpdG9yLmJ1ZmZlclxuICAgIGxpbmUgPSBlZGl0b3IuYnVmZmVyLmxpbmVzW2N1clBvcy5yb3ddXG5cbiAgICB3aXRoU3RyID0gXCIhWyN7ZGVzY3JpcHRpb259XSgje3VybH0pXCJcblxuICAgIGlmIG5vdCBAcmVwbGFjZUhpbnQoZWRpdG9yLCBjdXJQb3Mucm93LCBoaW50LCB3aXRoU3RyKVxuICAgICAgaSA9IGN1clBvcy5yb3cgLSAyMFxuICAgICAgd2hpbGUgaSA8PSBjdXJQb3Mucm93ICsgMjBcbiAgICAgICAgaWYgKEByZXBsYWNlSGludChlZGl0b3IsIGksIGhpbnQsIHdpdGhTdHIpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGkrK1xuXG4gIHVwbG9hZEltYWdlRmlsZTogKGZpbGUpLT5cbiAgICBmaWxlTmFtZSA9IGZpbGUubmFtZVxuXG4gICAgQGhpZGVQYW5lbCgpXG5cbiAgICBlZGl0b3IgPSBAZWRpdG9yXG4gICAgdWlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpXG4gICAgaGludCA9IFwiIVtVcGxvYWRpbmcgI3tmaWxlTmFtZX3igKYgKCN7dWlkfSldKClcIlxuICAgIGN1clBvcyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgdXBsb2FkZXIgPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuaW1hZ2VVcGxvYWRlcidcblxuICAgIGVkaXRvci5pbnNlcnRUZXh0KGhpbnQpXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcikuZm9jdXMoKVxuXG4gICAgaWYgdXBsb2FkZXIgPT0gJ2ltZ3VyJ1xuICAgICAgIyBBIHNpbmdsZSBpbWFnZVxuICAgICAgaW1ndXIudXBsb2FkRmlsZShmaWxlLnBhdGgpXG4gICAgICAgICAgIC50aGVuIChqc29uKT0+XG4gICAgICAgICAgICAgQHNldFVwbG9hZGVkSW1hZ2VVUkwgZmlsZU5hbWUsIGpzb24uZGF0YS5saW5rLCBlZGl0b3IsIGhpbnQsIGN1clBvc1xuICAgICAgICAgICAuY2F0Y2ggKGVycik9PlxuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyLm1lc3NhZ2UpXG4gICAgZWxzZSAjIHNtLm1zXG4gICAgICBzbUFQSS51cGxvYWRGaWxlIGZpbGUucGF0aCxcbiAgICAgICAgKGVyciwgdXJsKT0+XG4gICAgICAgICAgaWYgZXJyXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRVcGxvYWRlZEltYWdlVVJMIGZpbGVOYW1lLCB1cmwsIGVkaXRvciwgaGludCwgY3VyUG9zXG5cbiAgaW5zZXJ0SW1hZ2VVUkw6ICgpLT5cbiAgICB1cmwgPSBAdXJsRWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICBpZiB1cmwuaW5kZXhPZignICcpID49IDBcbiAgICAgIHVybCA9IFwiPCN7dXJsfT5cIlxuICAgIGlmICh1cmwubGVuZ3RoKVxuICAgICAgQGhpZGVQYW5lbCgpXG4gICAgICBjdXJQb3MgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChcIiFbZW50ZXIgaW1hZ2UgZGVzY3JpcHRpb24gaGVyZV0oI3t1cmx9KVwiKVxuICAgICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKFtbY3VyUG9zLnJvdywgY3VyUG9zLmNvbHVtbiArIDJdLCBbY3VyUG9zLnJvdywgY3VyUG9zLmNvbHVtbiArIDMwXV0pXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoQGVkaXRvcikuZm9jdXMoKVxuXG4gIGhpZGVQYW5lbDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwYW5lbD8uaXNWaXNpYmxlKClcbiAgICBAcGFuZWwuaGlkZSgpXG5cbiAgZGlzcGxheTogKGVkaXRvciktPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMsIHZpc2libGU6IGZhbHNlKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAdXJsRWRpdG9yLmZvY3VzKClcblxuICAgIEBlZGl0b3IgPSBlZGl0b3JcblxuICAgIEB1cmxFZGl0b3Iuc2V0VGV4dCgnJylcbiAgICAkKEBlbGVtZW50KS5maW5kKCdpbnB1dFt0eXBlPVwiZmlsZVwiXScpLnZhbCgnJylcblxuICAgIGNvcHlMYWJlbCA9ICQoQGVsZW1lbnQpLmZpbmQoJy5jb3B5LWxhYmVsJylcbiAgICBpbWFnZUZvbGRlclBhdGggPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuaW1hZ2VGb2xkZXJQYXRoJ1xuXG4gICAgaWYgaW1hZ2VGb2xkZXJQYXRoW2ltYWdlRm9sZGVyUGF0aC5sZW5ndGggLSAxXSA9PSAnLydcbiAgICAgIGltYWdlRm9sZGVyUGF0aCA9IGltYWdlRm9sZGVyUGF0aC5zbGljZSgwLCBpbWFnZUZvbGRlclBhdGgubGVuZ3RoIC0gMSlcblxuICAgIGNvcHlMYWJlbC5odG1sICBcIkNvcHkgaW1hZ2UgdG8gI3tpZiBpbWFnZUZvbGRlclBhdGhbMF0gPT0gJy8nIHRoZW4gJ3Jvb3QnIGVsc2UgJ3JlbGF0aXZlJ30gPGE+I3tpbWFnZUZvbGRlclBhdGh9PC9hPiBmb2xkZXJcIlxuXG4gICAgY29weUxhYmVsLmZpbmQoJ2EnKS5vbiAnY2xpY2snLCAoKT0+XG4gICAgICB0cnlcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignYXRvbTovL2NvbmZpZy9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkJywge3NwbGl0OiAncmlnaHQnfSlcbiAgICAgICAgQGhpZGVQYW5lbCgpXG4gICAgICBjYXRjaCBlXG4gICAgICAgIEBoaWRlUGFuZWwoKVxuXG4gICAgdXBsb2FkZXIgPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctZW5oYW5jZWQuaW1hZ2VVcGxvYWRlcidcbiAgICAkKEBlbGVtZW50KS5maW5kKCcudXBsb2FkZXItc2VsZWN0JykudmFsKHVwbG9hZGVyKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlSGVscGVyVmlld1xuIl19
