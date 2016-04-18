(function() {
  module.exports = {
    config: {
      iconsPlus: {
        type: 'boolean',
        "default": false,
        description: 'Use additional and enhanced icons.'
      },
      noColor: {
        type: 'boolean',
        "default": false,
        description: 'Display icons without color.'
      }
    },
    activate: function(state) {
      atom.config.onDidChange('seti-icons.iconsPlus', (function(_this) {
        return function(_arg) {
          var newValue;
          newValue = _arg.newValue;
          return _this.iconsPlus(newValue);
        };
      })(this));
      atom.config.onDidChange('seti-icons.noColor', (function(_this) {
        return function(_arg) {
          var newValue;
          newValue = _arg.newValue;
          return _this.noColor(newValue);
        };
      })(this));
      this.iconsPlus(atom.config.get('seti-icons.iconsPlus'));
      return this.noColor(atom.config.get('seti-icons.noColor'));
    },
    update: function(enable, text) {
      var body;
      body = document.querySelector('body');
      if (enable) {
        return body.className = "" + body.className + " " + text;
      } else {
        return body.className = body.className.replace(" " + text, '');
      }
    },
    iconsPlus: function(enable) {
      return this.update(enable, 'seti-icons-plus');
    },
    noColor: function(enable) {
      return this.update(enable, 'seti-icons-no-color');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9zZXRpLWljb25zL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsb0NBRmI7T0FERjtBQUFBLE1BSUEsT0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSw4QkFGYjtPQUxGO0tBREY7QUFBQSxJQVVBLFFBQUEsRUFBVSxTQUFFLEtBQUYsR0FBQTtBQUNSLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLHNCQUF4QixFQUFnRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDOUMsY0FBQSxRQUFBO0FBQUEsVUFEaUQsV0FBRixLQUFFLFFBQ2pELENBQUE7aUJBQUEsS0FBQyxDQUFBLFNBQUQsQ0FBVyxRQUFYLEVBRDhDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEQsQ0FBQSxDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0Isb0JBQXhCLEVBQThDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLElBQUQsR0FBQTtBQUM1QyxjQUFBLFFBQUE7QUFBQSxVQUQrQyxXQUFGLEtBQUUsUUFDL0MsQ0FBQTtpQkFBQSxLQUFDLENBQUEsT0FBRCxDQUFTLFFBQVQsRUFENEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QyxDQUhBLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixDQUFYLENBTkEsQ0FBQTthQU9BLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixDQUFULEVBUlE7SUFBQSxDQVZWO0FBQUEsSUFvQkEsTUFBQSxFQUFRLFNBQUUsTUFBRixFQUFVLElBQVYsR0FBQTtBQUNOLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBQVAsQ0FBQTtBQUVBLE1BQUEsSUFBRyxNQUFIO2VBQ0UsSUFBSSxDQUFDLFNBQUwsR0FBaUIsRUFBQSxHQUFHLElBQUksQ0FBQyxTQUFSLEdBQWtCLEdBQWxCLEdBQXFCLEtBRHhDO09BQUEsTUFBQTtlQUdFLElBQUksQ0FBQyxTQUFMLEdBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBZixDQUF3QixHQUFBLEdBQUcsSUFBM0IsRUFBbUMsRUFBbkMsRUFIbkI7T0FITTtJQUFBLENBcEJSO0FBQUEsSUE0QkEsU0FBQSxFQUFXLFNBQUUsTUFBRixHQUFBO2FBQ1QsSUFBQyxDQUFBLE1BQUQsQ0FBUSxNQUFSLEVBQWdCLGlCQUFoQixFQURTO0lBQUEsQ0E1Qlg7QUFBQSxJQStCQSxPQUFBLEVBQVMsU0FBRSxNQUFGLEdBQUE7YUFDUCxJQUFDLENBQUEsTUFBRCxDQUFRLE1BQVIsRUFBZ0IscUJBQWhCLEVBRE87SUFBQSxDQS9CVDtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/seti-icons/index.coffee
