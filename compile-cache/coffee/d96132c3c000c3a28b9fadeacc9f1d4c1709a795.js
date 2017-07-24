(function() {
  var execFile, path, princeConvert;

  path = require('path');

  execFile = require('child_process').execFile;

  princeConvert = function(src, dest, callback) {
    return execFile('prince', [src, '--javascript', '-o', dest], callback);
  };

  module.exports = princeConvert;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9wcmluY2UtY29udmVydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixXQUFZLE9BQUEsQ0FBUSxlQUFSOztFQUViLGFBQUEsR0FBZ0IsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLFFBQVo7V0FDZCxRQUFBLENBQVMsUUFBVCxFQUFtQixDQUFDLEdBQUQsRUFBTSxjQUFOLEVBQXNCLElBQXRCLEVBQTRCLElBQTVCLENBQW5CLEVBQXNELFFBQXREO0VBRGM7O0VBR2hCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBTmpCIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57ZXhlY0ZpbGV9ID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcblxucHJpbmNlQ29udmVydCA9IChzcmMsIGRlc3QsIGNhbGxiYWNrKS0+XG4gIGV4ZWNGaWxlICdwcmluY2UnLCBbc3JjLCAnLS1qYXZhc2NyaXB0JywgJy1vJywgZGVzdF0sIGNhbGxiYWNrXG5cbm1vZHVsZS5leHBvcnRzID0gcHJpbmNlQ29udmVydCJdfQ==
