(function() {
  var Toc,
    __hasProp = {}.hasOwnProperty;

  module.exports = Toc = (function() {
    function Toc(editor) {
      var at;
      this.editor = editor;
      this.lines = [];
      this.list = [];
      this.options = {
        depthFrom: 1,
        depthTo: 6,
        withLinks: 1,
        updateOnSave: 1,
        orderedList: 0
      };
      this.create();
      at = this;
      this.editor.getBuffer().onWillSave(function() {
        if (at.options.updateOnSave === 1) {
          if (at._hasToc()) {
            at._deleteToc();
            return at.editor.setTextInBufferRange([[at.open, 0], [at.open, 0]], at._createToc());
          }
        }
      });
    }

    Toc.prototype.create = function() {
      if (this._hasToc()) {
        this._deleteToc();
        this.editor.setTextInBufferRange([[this.open, 0], [this.open, 0]], this._createToc());
      }
      return this.editor.insertText(this._createToc());
    };

    Toc.prototype.update = function() {
      if (this._hasToc()) {
        this._deleteToc();
        return this.editor.setTextInBufferRange([[this.open, 0], [this.open, 0]], this._createToc());
      } else {
        return this.editor.insertText(this._createToc());
      }
    };

    Toc.prototype["delete"] = function() {
      if (this._hasToc()) {
        return this._deleteToc();
      }
    };

    Toc.prototype.autosave = function() {
      if (this._hasToc()) {
        this._deleteToc();
        return this.editor.setTextInBufferRange([[this.open, 0], [this.open, 0]], this._createToc());
      }
    };

    Toc.prototype._hasToc = function() {
      var i, line, options;
      this.___updateLines();
      if (this.lines.length > 0) {
        this.open = false;
        this.close = false;
        options = void 0;
        for (i in this.lines) {
          line = this.lines[i];
          if (this.open === false) {
            if (line.match(/^<!--(.*)TOC(.*)-->$/g)) {
              this.open = parseInt(i);
              options = line;
            }
          } else {
            if (line.match(/^<!--(.*)\/TOC(.*)-->$/g)) {
              this.close = parseInt(i);
              break;
            }
          }
        }
        if (this.open !== false && this.close !== false) {
          if (options !== void 0) {
            this.__updateOptions(options);
            return true;
          }
        }
      }
      return false;
    };

    Toc.prototype._createToc = function() {
      var list, text;
      this.__updateList();
      if (Object.keys(this.list).length > 0) {
        text = [];
        text.push("<!-- TOC depthFrom:" + this.options.depthFrom + " depthTo:" + this.options.depthTo + " withLinks:" + this.options.withLinks + " updateOnSave:" + this.options.updateOnSave + " orderedList:" + this.options.orderedList + " -->\n");
        list = this.__createList();
        if (list !== false) {
          Array.prototype.push.apply(text, list);
        }
        text.push("\n<!-- /TOC -->");
        return text.join("\n");
      }
      return "";
    };

    Toc.prototype._deleteToc = function() {
      return this.editor.setTextInBufferRange([[this.open, 0], [this.close, 14]], "");
    };

    Toc.prototype.__updateList = function() {
      var depthFrom, depthTo, i, line, result, _results;
      this.___updateLines();
      this.list = [];
      _results = [];
      for (i in this.lines) {
        line = this.lines[i];
        result = line.match(/^\#{1,6}/);
        if (result) {
          depthFrom = this.options.depthFrom !== void 0 ? this.options.depthFrom : 1;
          depthTo = this.options.depthTo !== void 0 ? this.options.depthTo : 6;
          if ((result[0].length <= parseInt(depthTo)) && (result[0].length >= parseInt(depthFrom))) {
            _results.push(this.list.push({
              depth: result[0].length,
              line: new String(line)
            }));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Toc.prototype.__createList = function() {
      var depthFrom, depthTo, i, indicesOfDepth, item, line, list, row, tab, _i, _ref, _ref1;
      list = [];
      depthFrom = this.options.depthFrom !== void 0 ? this.options.depthFrom : 1;
      depthTo = this.options.depthTo !== void 0 ? this.options.depthTo : 6;
      indicesOfDepth = Array.apply(null, new Array(depthTo - depthFrom)).map(Number.prototype.valueOf, 0);
      _ref = this.list;
      for (i in _ref) {
        if (!__hasProp.call(_ref, i)) continue;
        item = _ref[i];
        row = [];
        for (tab = _i = depthFrom, _ref1 = item.depth; depthFrom <= _ref1 ? _i <= _ref1 : _i >= _ref1; tab = depthFrom <= _ref1 ? ++_i : --_i) {
          if (tab > depthFrom) {
            row.push("\t");
          }
        }
        if (this.options.orderedList === 1) {
          row.push(++indicesOfDepth[item.depth - 1] + ". ");
          indicesOfDepth = indicesOfDepth.map(function(value, index) {
            if (index < item.depth) {
              return value;
            } else {
              return 0;
            }
          });
        } else {
          row.push("- ");
        }
        line = item.line.substr(item.depth);
        line = line.trim();
        if (this.options.withLinks === 1) {
          row.push(this.___createLink(line));
        } else {
          row.push(line);
        }
        list.push(row.join(""));
      }
      if (list.length > 0) {
        return list;
      }
      return false;
    };

    Toc.prototype.__updateOptions = function(line) {
      var i, key, option, options, value, _results;
      options = line.match(/(\w+(=|:)(\d|yes|no))+/g);
      if (options) {
        this.options = {};
        _results = [];
        for (i in options) {
          option = options[i];
          key = option.match(/^(\w+)/g);
          key = new String(key[0]);
          value = option.match(/(\d|yes|no)$/g);
          value = new String(value[0]);
          if (value.length > 1) {
            if (value.toLowerCase().valueOf() === new String("yes").valueOf()) {
              value = 1;
            } else {
              value = 0;
            }
          }
          if (key.toLowerCase().valueOf() === new String("depthfrom").valueOf()) {
            _results.push(this.options.depthFrom = parseInt(value));
          } else if (key.toLowerCase().valueOf() === new String("depthto").valueOf()) {
            _results.push(this.options.depthTo = parseInt(value));
          } else if (key.toLowerCase().valueOf() === new String("withlinks").valueOf()) {
            _results.push(this.options.withLinks = parseInt(value));
          } else if (key.toLowerCase().valueOf() === new String("updateonsave").valueOf()) {
            _results.push(this.options.updateOnSave = parseInt(value));
          } else if (key.toLowerCase().valueOf() === new String("orderedlist").valueOf()) {
            _results.push(this.options.orderedList = parseInt(value));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    Toc.prototype.___updateLines = function() {
      if (this.editor !== void 0) {
        return this.lines = this.editor.getBuffer().getLines();
      } else {
        return this.lines = [];
      }
    };

    Toc.prototype.___createLink = function(name) {
      var hash, link;
      hash = new String(name);
      hash = hash.toLowerCase().replace(/\s/g, "-");
      hash = hash.replace(/[^a-z0-9\u4e00-\u9fa5äüö\-]/g, "");
      if (hash.indexOf("--") > -1) {
        hash = hash.replace(/(-)+/g, "-");
      }
      if (name.indexOf(":-") > -1) {
        hash = hash.replace(/:-/g, "-");
      }
      link = [];
      link.push("[");
      link.push(name);
      link.push("](#");
      link.push(hash);
      link.push(")");
      return link.join("");
    };

    return Toc;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi10b2MvbGliL1RvYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsR0FBQTtJQUFBLDZCQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUdTLElBQUEsYUFBRSxNQUFGLEdBQUE7QUFDWCxVQUFBLEVBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFULENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsRUFEUixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBRCxHQUNFO0FBQUEsUUFBQSxTQUFBLEVBQVcsQ0FBWDtBQUFBLFFBQ0EsT0FBQSxFQUFTLENBRFQ7QUFBQSxRQUVBLFNBQUEsRUFBVyxDQUZYO0FBQUEsUUFHQSxZQUFBLEVBQWMsQ0FIZDtBQUFBLFFBSUEsV0FBQSxFQUFhLENBSmI7T0FIRixDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBUkEsQ0FBQTtBQUFBLE1BVUEsRUFBQSxHQUFLLElBVkwsQ0FBQTtBQUFBLE1BV0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUEsQ0FBbUIsQ0FBQyxVQUFwQixDQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxJQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWCxLQUEyQixDQUE5QjtBQUNFLFVBQUEsSUFBRyxFQUFFLENBQUMsT0FBSCxDQUFBLENBQUg7QUFDRSxZQUFBLEVBQUUsQ0FBQyxVQUFILENBQUEsQ0FBQSxDQUFBO21CQUNBLEVBQUUsQ0FBQyxNQUFNLENBQUMsb0JBQVYsQ0FBK0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFKLEVBQVMsQ0FBVCxDQUFELEVB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

//# sourceURL=/Users/Rad/.atom/packages/markdown-toc/lib/Toc.coffee