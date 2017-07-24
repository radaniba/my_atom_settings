(function() {
  var $, PythonYAPF, fs, hasbin, process;

  fs = require('fs-plus');

  $ = require('jquery');

  process = require('child_process');

  hasbin = require('hasbin');

  module.exports = PythonYAPF = (function() {
    function PythonYAPF() {}

    PythonYAPF.prototype.statusDialog = null;

    PythonYAPF.prototype.isPythonContext = function(editor) {
      if (editor == null) {
        return false;
      }
      return editor.getGrammar().scopeName === 'source.python';
    };

    PythonYAPF.prototype.setStatusDialog = function(dialog) {
      return this.statusDialog = dialog;
    };

    PythonYAPF.prototype.removeStatusbarItem = function() {
      var ref;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      return this.statusBarTile = null;
    };

    PythonYAPF.prototype.updateStatusbarText = function(message, success) {
      return this.statusDialog.update(message, success);
    };

    PythonYAPF.prototype.getFilePath = function() {
      return atom.workspace.getActiveTextEditor().getPath();
    };

    PythonYAPF.prototype.checkCode = function() {
      return this.runYapf('check');
    };

    PythonYAPF.prototype.formatCode = function() {
      return this.runYapf('format');
    };

    PythonYAPF.prototype.runYapf = function(mode) {
      var output, params, proc, yapfPath, yapfStyle;
      if (!this.isPythonContext(atom.workspace.getActiveTextEditor())) {
        return;
      }
      yapfPath = fs.normalize(atom.config.get('python-yapf.yapfPath'));
      if (!fs.existsSync(yapfPath) && !hasbin.sync(yapfPath)) {
        this.updateStatusbarText('unable to open ' + yapfPath, false);
        return;
      }
      if (mode === 'format') {
        this.updateStatusbarText('⧗', true);
        params = [this.getFilePath(), '-i'];
      } else if (mode === 'check') {
        params = [this.getFilePath(), '-d'];
      } else {
        return;
      }
      yapfStyle = atom.config.get('python-yapf.yapfStyle');
      if (yapfStyle.length) {
        params = params.concat(['--style', yapfStyle]);
      }
      proc = process.spawn(yapfPath, params);
      output = [];
      proc.stdout.setEncoding('utf8');
      proc.stdout.on('data', function(chunk) {
        return output.push(chunk);
      });
      proc.stdout.on('end', function(chunk) {
        return output.join();
      });
      return proc.on('exit', (function(_this) {
        return function(exit_code, signal) {
          if ((mode === 'check' && exit_code !== 0) || (mode === 'format' && exit_code === 1)) {
            return _this.updateStatusbarText('x', false);
          } else {
            return _this.updateStatusbarText('√', true);
          }
        };
      })(this));
    };

    return PythonYAPF;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24teWFwZi9saWIvcHl0aG9uLXlhcGYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsZUFBUjs7RUFDVixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O3lCQUNKLFlBQUEsR0FBYzs7eUJBRWQsZUFBQSxHQUFpQixTQUFDLE1BQUQ7TUFDZixJQUFPLGNBQVA7QUFDRSxlQUFPLE1BRFQ7O0FBRUEsYUFBTyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBcEIsS0FBaUM7SUFIekI7O3lCQUtqQixlQUFBLEdBQWlCLFNBQUMsTUFBRDthQUNmLElBQUMsQ0FBQSxZQUFELEdBQWdCO0lBREQ7O3lCQUdqQixtQkFBQSxHQUFxQixTQUFBO0FBQ25CLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRkU7O3lCQUlyQixtQkFBQSxHQUFxQixTQUFDLE9BQUQsRUFBVSxPQUFWO2FBQ25CLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixPQUFyQixFQUE4QixPQUE5QjtJQURtQjs7eUJBR3JCLFdBQUEsR0FBYSxTQUFBO0FBQ1gsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBb0MsQ0FBQyxPQUFyQyxDQUFBO0lBREk7O3lCQUdiLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFUO0lBRFM7O3lCQUdYLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFUO0lBRFU7O3lCQUdaLE9BQUEsR0FBUyxTQUFDLElBQUQ7QUFDUCxVQUFBO01BQUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFqQixDQUFQO0FBQ0UsZUFERjs7TUFHQSxRQUFBLEdBQVcsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLENBQWI7TUFDWCxJQUFHLENBQUksRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLENBQUosSUFBZ0MsQ0FBSSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosQ0FBdkM7UUFDRSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsaUJBQUEsR0FBb0IsUUFBekMsRUFBbUQsS0FBbkQ7QUFDQSxlQUZGOztNQUlBLElBQUcsSUFBQSxLQUFRLFFBQVg7UUFDRSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsR0FBckIsRUFBMEIsSUFBMUI7UUFDQSxNQUFBLEdBQVMsQ0FBQyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUQsRUFBaUIsSUFBakIsRUFGWDtPQUFBLE1BR0ssSUFBRyxJQUFBLEtBQVEsT0FBWDtRQUNILE1BQUEsR0FBUyxDQUFDLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBRCxFQUFpQixJQUFqQixFQUROO09BQUEsTUFBQTtBQUdILGVBSEc7O01BS0wsU0FBQSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEI7TUFDWixJQUFHLFNBQVMsQ0FBQyxNQUFiO1FBQ0UsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxTQUFELEVBQVksU0FBWixDQUFkLEVBRFg7O01BR0EsSUFBQSxHQUFPLE9BQU8sQ0FBQyxLQUFSLENBQWMsUUFBZCxFQUF3QixNQUF4QjtNQUNQLE1BQUEsR0FBUztNQUNULElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixNQUF4QjtNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBWixDQUFlLE1BQWYsRUFBdUIsU0FBQyxLQUFEO2VBQ3JCLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWjtNQURxQixDQUF2QjtNQUVBLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBWixDQUFlLEtBQWYsRUFBc0IsU0FBQyxLQUFEO2VBQ3BCLE1BQU0sQ0FBQyxJQUFQLENBQUE7TUFEb0IsQ0FBdEI7YUFFQSxJQUFJLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQsRUFBWSxNQUFaO1VBQ2QsSUFBSSxDQUFDLElBQUEsS0FBUSxPQUFSLElBQW9CLFNBQUEsS0FBYSxDQUFsQyxDQUFBLElBQ0EsQ0FBQyxJQUFBLEtBQVEsUUFBUixJQUFxQixTQUFBLEtBQWEsQ0FBbkMsQ0FESjttQkFFRSxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsR0FBckIsRUFBMEIsS0FBMUIsRUFGRjtXQUFBLE1BQUE7bUJBSUUsS0FBQyxDQUFBLG1CQUFELENBQXFCLEdBQXJCLEVBQTBCLElBQTFCLEVBSkY7O1FBRGM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO0lBNUJPOzs7OztBQWpDWCIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbiQgPSByZXF1aXJlICdqcXVlcnknXG5wcm9jZXNzID0gcmVxdWlyZSAnY2hpbGRfcHJvY2Vzcydcbmhhc2JpbiA9IHJlcXVpcmUgJ2hhc2JpbidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUHl0aG9uWUFQRlxuICBzdGF0dXNEaWFsb2c6IG51bGxcblxuICBpc1B5dGhvbkNvbnRleHQ6IChlZGl0b3IpIC0+XG4gICAgaWYgbm90IGVkaXRvcj9cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSA9PSAnc291cmNlLnB5dGhvbidcblxuICBzZXRTdGF0dXNEaWFsb2c6IChkaWFsb2cpIC0+XG4gICAgQHN0YXR1c0RpYWxvZyA9IGRpYWxvZ1xuXG4gIHJlbW92ZVN0YXR1c2Jhckl0ZW06IC0+XG4gICAgQHN0YXR1c0JhclRpbGU/LmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gbnVsbFxuXG4gIHVwZGF0ZVN0YXR1c2JhclRleHQ6IChtZXNzYWdlLCBzdWNjZXNzKSAtPlxuICAgIEBzdGF0dXNEaWFsb2cudXBkYXRlIG1lc3NhZ2UsIHN1Y2Nlc3NcblxuICBnZXRGaWxlUGF0aDogLT5cbiAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFBhdGgoKVxuXG4gIGNoZWNrQ29kZTogLT5cbiAgICBAcnVuWWFwZiAnY2hlY2snXG5cbiAgZm9ybWF0Q29kZTogLT5cbiAgICBAcnVuWWFwZiAnZm9ybWF0J1xuXG4gIHJ1bllhcGY6IChtb2RlKSAtPlxuICAgIGlmIG5vdCBAaXNQeXRob25Db250ZXh0IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgcmV0dXJuXG5cbiAgICB5YXBmUGF0aCA9IGZzLm5vcm1hbGl6ZSBhdG9tLmNvbmZpZy5nZXQgJ3B5dGhvbi15YXBmLnlhcGZQYXRoJ1xuICAgIGlmIG5vdCBmcy5leGlzdHNTeW5jKHlhcGZQYXRoKSBhbmQgbm90IGhhc2Jpbi5zeW5jKHlhcGZQYXRoKVxuICAgICAgQHVwZGF0ZVN0YXR1c2JhclRleHQgJ3VuYWJsZSB0byBvcGVuICcgKyB5YXBmUGF0aCwgZmFsc2VcbiAgICAgIHJldHVyblxuXG4gICAgaWYgbW9kZSA9PSAnZm9ybWF0J1xuICAgICAgQHVwZGF0ZVN0YXR1c2JhclRleHQgJ+KnlycsIHRydWVcbiAgICAgIHBhcmFtcyA9IFtAZ2V0RmlsZVBhdGgoKSwgJy1pJ11cbiAgICBlbHNlIGlmIG1vZGUgPT0gJ2NoZWNrJ1xuICAgICAgcGFyYW1zID0gW0BnZXRGaWxlUGF0aCgpLCAnLWQnXVxuICAgIGVsc2VcbiAgICAgIHJldHVyblxuXG4gICAgeWFwZlN0eWxlID0gYXRvbS5jb25maWcuZ2V0ICdweXRob24teWFwZi55YXBmU3R5bGUnXG4gICAgaWYgeWFwZlN0eWxlLmxlbmd0aFxuICAgICAgcGFyYW1zID0gcGFyYW1zLmNvbmNhdCBbJy0tc3R5bGUnLCB5YXBmU3R5bGVdXG5cbiAgICBwcm9jID0gcHJvY2Vzcy5zcGF3biB5YXBmUGF0aCwgcGFyYW1zXG4gICAgb3V0cHV0ID0gW11cbiAgICBwcm9jLnN0ZG91dC5zZXRFbmNvZGluZyAndXRmOCdcbiAgICBwcm9jLnN0ZG91dC5vbiAnZGF0YScsIChjaHVuaykgLT5cbiAgICAgIG91dHB1dC5wdXNoIGNodW5rXG4gICAgcHJvYy5zdGRvdXQub24gJ2VuZCcsIChjaHVuaykgLT5cbiAgICAgIG91dHB1dC5qb2luKClcbiAgICBwcm9jLm9uICdleGl0JywgKGV4aXRfY29kZSwgc2lnbmFsKSA9PlxuICAgICAgaWYgKChtb2RlID09ICdjaGVjaycgYW5kIGV4aXRfY29kZSAhPSAwKSBvclxuICAgICAgICAgIChtb2RlID09ICdmb3JtYXQnIGFuZCBleGl0X2NvZGUgPT0gMSkpXG4gICAgICAgIEB1cGRhdGVTdGF0dXNiYXJUZXh0ICd4JywgZmFsc2VcbiAgICAgIGVsc2VcbiAgICAgICAgQHVwZGF0ZVN0YXR1c2JhclRleHQgJ+KImicsIHRydWVcbiJdfQ==
