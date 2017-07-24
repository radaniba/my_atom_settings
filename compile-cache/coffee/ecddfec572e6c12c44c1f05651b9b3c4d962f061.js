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

    PythonYAPF.prototype.getFileRoot = function() {
      return atom.project.relativizePath(this.getFilePath())[0];
    };

    PythonYAPF.prototype.checkCode = function() {
      return this.runYapf('check');
    };

    PythonYAPF.prototype.formatCode = function() {
      return this.runYapf('format');
    };

    PythonYAPF.prototype.runYapf = function(mode) {
      var options, output, params, proc, yapfPath, yapfStyle;
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
      options = {
        cwd: this.getFileRoot()
      };
      proc = process.spawn(yapfPath, params, options);
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
          if (exit_code === 127) {
            return _this.updateStatusbarText('?', false);
          } else if ((mode === 'check' && exit_code !== 0) || (mode === 'format' && exit_code === 1)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9weXRob24teWFwZi9saWIvcHl0aG9uLXlhcGYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsZUFBUjs7RUFDVixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O3lCQUNKLFlBQUEsR0FBYzs7eUJBRWQsZUFBQSxHQUFpQixTQUFDLE1BQUQ7TUFDZixJQUFPLGNBQVA7QUFDRSxlQUFPLE1BRFQ7O0FBRUEsYUFBTyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBcEIsS0FBaUM7SUFIekI7O3lCQUtqQixlQUFBLEdBQWlCLFNBQUMsTUFBRDthQUNmLElBQUMsQ0FBQSxZQUFELEdBQWdCO0lBREQ7O3lCQUdqQixtQkFBQSxHQUFxQixTQUFBO0FBQ25CLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRkU7O3lCQUlyQixtQkFBQSxHQUFxQixTQUFDLE9BQUQsRUFBVSxPQUFWO2FBQ25CLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixPQUFyQixFQUE4QixPQUE5QjtJQURtQjs7eUJBR3JCLFdBQUEsR0FBYSxTQUFBO0FBQ1gsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBb0MsQ0FBQyxPQUFyQyxDQUFBO0lBREk7O3lCQUdiLFdBQUEsR0FBYSxTQUFBO0FBQ1gsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBNEIsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUE1QixDQUE0QyxDQUFBLENBQUE7SUFEeEM7O3lCQUdiLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFUO0lBRFM7O3lCQUdYLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFUO0lBRFU7O3lCQUdaLE9BQUEsR0FBUyxTQUFDLElBQUQ7QUFDUCxVQUFBO01BQUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFqQixDQUFQO0FBQ0UsZUFERjs7TUFHQSxRQUFBLEdBQVcsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLENBQWI7TUFDWCxJQUFHLENBQUksRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLENBQUosSUFBZ0MsQ0FBSSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosQ0FBdkM7UUFDRSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsaUJBQUEsR0FBb0IsUUFBekMsRUFBbUQsS0FBbkQ7QUFDQSxlQUZGOztNQUlBLElBQUcsSUFBQSxLQUFRLFFBQVg7UUFDRSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsR0FBckIsRUFBMEIsSUFBMUI7UUFDQSxNQUFBLEdBQVMsQ0FBQyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUQsRUFBaUIsSUFBakIsRUFGWDtPQUFBLE1BR0ssSUFBRyxJQUFBLEtBQVEsT0FBWDtRQUNILE1BQUEsR0FBUyxDQUFDLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBRCxFQUFpQixJQUFqQixFQUROO09BQUEsTUFBQTtBQUdILGVBSEc7O01BS0wsU0FBQSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEI7TUFDWixJQUFHLFNBQVMsQ0FBQyxNQUFiO1FBQ0UsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxTQUFELEVBQVksU0FBWixDQUFkLEVBRFg7O01BR0EsT0FBQSxHQUFVO1FBQUMsR0FBQSxFQUFLLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBTjs7TUFFVixJQUFBLEdBQU8sT0FBTyxDQUFDLEtBQVIsQ0FBYyxRQUFkLEVBQXdCLE1BQXhCLEVBQWdDLE9BQWhDO01BQ1AsTUFBQSxHQUFTO01BQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLE1BQXhCO01BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFaLENBQWUsTUFBZixFQUF1QixTQUFDLEtBQUQ7ZUFDckIsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaO01BRHFCLENBQXZCO01BRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFaLENBQWUsS0FBZixFQUFzQixTQUFDLEtBQUQ7ZUFDcEIsTUFBTSxDQUFDLElBQVAsQ0FBQTtNQURvQixDQUF0QjthQUVBLElBQUksQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFnQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRCxFQUFZLE1BQVo7VUFDZCxJQUFHLFNBQUEsS0FBYSxHQUFoQjttQkFDRSxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsR0FBckIsRUFBMEIsS0FBMUIsRUFERjtXQUFBLE1BRUssSUFBSSxDQUFDLElBQUEsS0FBUSxPQUFSLElBQW9CLFNBQUEsS0FBYSxDQUFsQyxDQUFBLElBQ0wsQ0FBQyxJQUFBLEtBQVEsUUFBUixJQUFxQixTQUFBLEtBQWEsQ0FBbkMsQ0FEQzttQkFFSCxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsR0FBckIsRUFBMEIsS0FBMUIsRUFGRztXQUFBLE1BQUE7bUJBSUgsS0FBQyxDQUFBLG1CQUFELENBQXFCLEdBQXJCLEVBQTBCLElBQTFCLEVBSkc7O1FBSFM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO0lBOUJPOzs7OztBQXBDWCIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbiQgPSByZXF1aXJlICdqcXVlcnknXG5wcm9jZXNzID0gcmVxdWlyZSAnY2hpbGRfcHJvY2Vzcydcbmhhc2JpbiA9IHJlcXVpcmUgJ2hhc2JpbidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUHl0aG9uWUFQRlxuICBzdGF0dXNEaWFsb2c6IG51bGxcblxuICBpc1B5dGhvbkNvbnRleHQ6IChlZGl0b3IpIC0+XG4gICAgaWYgbm90IGVkaXRvcj9cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSA9PSAnc291cmNlLnB5dGhvbidcblxuICBzZXRTdGF0dXNEaWFsb2c6IChkaWFsb2cpIC0+XG4gICAgQHN0YXR1c0RpYWxvZyA9IGRpYWxvZ1xuXG4gIHJlbW92ZVN0YXR1c2Jhckl0ZW06IC0+XG4gICAgQHN0YXR1c0JhclRpbGU/LmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gbnVsbFxuXG4gIHVwZGF0ZVN0YXR1c2JhclRleHQ6IChtZXNzYWdlLCBzdWNjZXNzKSAtPlxuICAgIEBzdGF0dXNEaWFsb2cudXBkYXRlIG1lc3NhZ2UsIHN1Y2Nlc3NcblxuICBnZXRGaWxlUGF0aDogLT5cbiAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFBhdGgoKVxuXG4gIGdldEZpbGVSb290OiAtPlxuICAgIHJldHVybiBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoQGdldEZpbGVQYXRoKCkpWzBdXG5cbiAgY2hlY2tDb2RlOiAtPlxuICAgIEBydW5ZYXBmICdjaGVjaydcblxuICBmb3JtYXRDb2RlOiAtPlxuICAgIEBydW5ZYXBmICdmb3JtYXQnXG5cbiAgcnVuWWFwZjogKG1vZGUpIC0+XG4gICAgaWYgbm90IEBpc1B5dGhvbkNvbnRleHQgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICByZXR1cm5cblxuICAgIHlhcGZQYXRoID0gZnMubm9ybWFsaXplIGF0b20uY29uZmlnLmdldCAncHl0aG9uLXlhcGYueWFwZlBhdGgnXG4gICAgaWYgbm90IGZzLmV4aXN0c1N5bmMoeWFwZlBhdGgpIGFuZCBub3QgaGFzYmluLnN5bmMoeWFwZlBhdGgpXG4gICAgICBAdXBkYXRlU3RhdHVzYmFyVGV4dCAndW5hYmxlIHRvIG9wZW4gJyArIHlhcGZQYXRoLCBmYWxzZVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBtb2RlID09ICdmb3JtYXQnXG4gICAgICBAdXBkYXRlU3RhdHVzYmFyVGV4dCAn4qeXJywgdHJ1ZVxuICAgICAgcGFyYW1zID0gW0BnZXRGaWxlUGF0aCgpLCAnLWknXVxuICAgIGVsc2UgaWYgbW9kZSA9PSAnY2hlY2snXG4gICAgICBwYXJhbXMgPSBbQGdldEZpbGVQYXRoKCksICctZCddXG4gICAgZWxzZVxuICAgICAgcmV0dXJuXG5cbiAgICB5YXBmU3R5bGUgPSBhdG9tLmNvbmZpZy5nZXQgJ3B5dGhvbi15YXBmLnlhcGZTdHlsZSdcbiAgICBpZiB5YXBmU3R5bGUubGVuZ3RoXG4gICAgICBwYXJhbXMgPSBwYXJhbXMuY29uY2F0IFsnLS1zdHlsZScsIHlhcGZTdHlsZV1cblxuICAgIG9wdGlvbnMgPSB7Y3dkOiBAZ2V0RmlsZVJvb3QoKX1cblxuICAgIHByb2MgPSBwcm9jZXNzLnNwYXduIHlhcGZQYXRoLCBwYXJhbXMsIG9wdGlvbnNcbiAgICBvdXRwdXQgPSBbXVxuICAgIHByb2Muc3Rkb3V0LnNldEVuY29kaW5nICd1dGY4J1xuICAgIHByb2Muc3Rkb3V0Lm9uICdkYXRhJywgKGNodW5rKSAtPlxuICAgICAgb3V0cHV0LnB1c2ggY2h1bmtcbiAgICBwcm9jLnN0ZG91dC5vbiAnZW5kJywgKGNodW5rKSAtPlxuICAgICAgb3V0cHV0LmpvaW4oKVxuICAgIHByb2Mub24gJ2V4aXQnLCAoZXhpdF9jb2RlLCBzaWduYWwpID0+XG4gICAgICBpZiBleGl0X2NvZGUgPT0gMTI3XG4gICAgICAgIEB1cGRhdGVTdGF0dXNiYXJUZXh0ICc/JywgZmFsc2VcbiAgICAgIGVsc2UgaWYgKChtb2RlID09ICdjaGVjaycgYW5kIGV4aXRfY29kZSAhPSAwKSBvclxuICAgICAgICAgIChtb2RlID09ICdmb3JtYXQnIGFuZCBleGl0X2NvZGUgPT0gMSkpXG4gICAgICAgIEB1cGRhdGVTdGF0dXNiYXJUZXh0ICd4JywgZmFsc2VcbiAgICAgIGVsc2VcbiAgICAgICAgQHVwZGF0ZVN0YXR1c2JhclRleHQgJ+KImicsIHRydWVcbiJdfQ==
