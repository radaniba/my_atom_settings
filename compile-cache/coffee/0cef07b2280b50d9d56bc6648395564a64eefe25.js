(function() {
  var requirejs, ws, xhr;

  ws = require('ws');

  xhr = require('xmlhttprequest');

  requirejs = require('requirejs');

  global.requirejs = requirejs;

  global.XMLHttpRequest = xhr.XMLHttpRequest;

  global.WebSocket = ws;

  module.exports = require('jupyter-js-services');

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9saWIvanVweXRlci1qcy1zZXJ2aWNlcy1zaGltLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQVNBO0FBQUEsTUFBQSxrQkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGdCQUFSLENBRE4sQ0FBQTs7QUFBQSxFQUVBLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUixDQUZaLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsU0FBUCxHQUFtQixTQUhuQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLGNBQVAsR0FBd0IsR0FBRyxDQUFDLGNBSjVCLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsU0FBUCxHQUFtQixFQUxuQixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsT0FBQSxDQUFRLHFCQUFSLENBUGpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/lib/jupyter-js-services-shim.coffee
