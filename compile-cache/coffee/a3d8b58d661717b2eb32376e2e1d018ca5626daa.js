(function() {
  var CodeContext;

  module.exports = CodeContext = (function() {
    CodeContext.prototype.filename = null;

    CodeContext.prototype.filepath = null;

    CodeContext.prototype.lineNumber = null;

    CodeContext.prototype.textSource = null;

    function CodeContext(filename, filepath, textSource) {
      this.filename = filename;
      this.filepath = filepath;
      this.textSource = textSource != null ? textSource : null;
    }

    CodeContext.prototype.fileColonLine = function(fullPath) {
      var fileColonLine;
      if (fullPath == null) {
        fullPath = true;
      }
      if (fullPath) {
        fileColonLine = this.filepath;
      } else {
        fileColonLine = this.filename;
      }
      if (!this.lineNumber) {
        return fileColonLine;
      }
      return "" + fileColonLine + ":" + this.lineNumber;
    };

    CodeContext.prototype.getCode = function(prependNewlines) {
      var code, newlineCount, newlines, _ref;
      if (prependNewlines == null) {
        prependNewlines = true;
      }
      code = (_ref = this.textSource) != null ? _ref.getText() : void 0;
      if (!(prependNewlines && this.lineNumber)) {
        return code;
      }
      newlineCount = Number(this.lineNumber);
      newlines = Array(newlineCount).join("\n");
      return "" + newlines + code;
    };

    return CodeContext;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osMEJBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFBQSwwQkFDQSxRQUFBLEdBQVUsSUFEVixDQUFBOztBQUFBLDBCQUVBLFVBQUEsR0FBWSxJQUZaLENBQUE7O0FBQUEsMEJBR0EsVUFBQSxHQUFZLElBSFosQ0FBQTs7QUFZYSxJQUFBLHFCQUFFLFFBQUYsRUFBYSxRQUFiLEVBQXdCLFVBQXhCLEdBQUE7QUFBNEMsTUFBM0MsSUFBQyxDQUFBLFdBQUEsUUFBMEMsQ0FBQTtBQUFBLE1BQWhDLElBQUMsQ0FBQSxXQUFBLFFBQStCLENBQUE7QUFBQSxNQUFyQixJQUFDLENBQUEsa0NBQUEsYUFBYSxJQUFPLENBQTVDO0lBQUEsQ0FaYjs7QUFBQSwwQkFtQkEsYUFBQSxHQUFlLFNBQUMsUUFBRCxHQUFBO0FBQ2IsVUFBQSxhQUFBOztRQURjLFdBQVc7T0FDekI7QUFBQSxNQUFBLElBQUcsUUFBSDtBQUNFLFFBQUEsYUFBQSxHQUFnQixJQUFDLENBQUEsUUFBakIsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLFFBQWpCLENBSEY7T0FBQTtBQUtBLE1BQUEsSUFBQSxDQUFBLElBQTZCLENBQUEsVUFBN0I7QUFBQSxlQUFPLGFBQVAsQ0FBQTtPQUxBO2FBTUEsRUFBQSxHQUFFLGFBQUYsR0FBaUIsR0FBakIsR0FBbUIsSUFBQyxDQUFBLFdBUFA7SUFBQSxDQW5CZixDQUFBOztBQUFBLDBCQWlDQSxPQUFBLEdBQVMsU0FBQyxlQUFELEdBQUE7QUFDUCxVQUFBLGtDQUFBOztRQURRLGtCQUFrQjtPQUMxQjtBQUFBLE1BQUEsSUFBQSwwQ0FBa0IsQ0FBRSxPQUFiLENBQUEsVUFBUCxDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsQ0FBbUIsZUFBQSxJQUFvQixJQUFDLENBQUEsVUFBeEMsQ0FBQTtBQUFBLGVBQU8sSUFBUCxDQUFBO09BREE7QUFBQSxNQUdBLFlBQUEsR0FBZSxNQUFBLENBQU8sSUFBQyxDQUFBLFVBQVIsQ0FIZixDQUFBO0FBQUEsTUFJQSxRQUFBLEdBQVcsS0FBQSxDQUFNLFlBQU4sQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixJQUF6QixDQUpYLENBQUE7YUFLQSxFQUFBLEdBQUUsUUFBRixHQUFhLEtBTk47SUFBQSxDQWpDVCxDQUFBOzt1QkFBQTs7TUFGRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/Rad/.atom/packages/script/lib/code-context.coffee