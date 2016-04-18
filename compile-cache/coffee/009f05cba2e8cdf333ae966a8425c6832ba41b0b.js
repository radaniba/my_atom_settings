(function() {
  var path;

  path = require('path');

  describe("JupyterPath", function() {
    var jupyterConfigDir, jupyterDataDir, jupyterPath, jupyterRuntimeDir, _ref;
    _ref = [], jupyterPath = _ref[0], jupyterConfigDir = _ref[1], jupyterDataDir = _ref[2], jupyterRuntimeDir = _ref[3];
    beforeEach(function() {
      var userHome, _ref1;
      return _ref1 = require('../lib/paths'), jupyterPath = _ref1.jupyterPath, jupyterConfigDir = _ref1.jupyterConfigDir, jupyterDataDir = _ref1.jupyterDataDir, jupyterRuntimeDir = _ref1.jupyterRuntimeDir, userHome = _ref1.userHome, _ref1;
    });
    describe("when jupyterPath is called", function() {
      return it("it returns an array of path strings", function() {
        var kernelspec, kernelspecs, parsed, _i, _len, _results;
        kernelspecs = jupyterPath();
        expect(Array.isArray(kernelspecs)).toBeTruthy();
        _results = [];
        for (_i = 0, _len = kernelspecs.length; _i < _len; _i++) {
          kernelspec = kernelspecs[_i];
          expect(typeof kernelspec).toBe('string');
          parsed = path.parse(kernelspec);
          expect(parsed.root).toBe('/');
          _results.push(expect(parsed.dir));
        }
        return _results;
      });
    });
    return describe("when jupyterPath is called with kernels", function() {
      return it("has 'kernels' at the end of each path", function() {
        var kernelspec, kernelspecs, parsed, _i, _len, _results;
        kernelspecs = jupyterPath('kernels');
        _results = [];
        for (_i = 0, _len = kernelspecs.length; _i < _len; _i++) {
          kernelspec = kernelspecs[_i];
          parsed = path.parse(kernelspec);
          _results.push(expect(parsed.base).toBe('kernels'));
        }
        return _results;
      });
    });
  });

  describe("JupyterPath mocked", function() {
    return describe("when on OS X", function() {
      return it("has OS X specific system directories", function() {
        var jupyterDataDir;
        spyOn(process, 'platform');
        process.platform = 'darwin';
        jupyterDataDir = require('../lib/paths').jupyterDataDir;
        return expect(jupyterDataDir()).toContain("/Library/Jupyter");
      });
    });
  });

  describe("Windows Path testing", function() {
    beforeEach(function() {
      Object.defineProperty(process, 'platform', {
        value: 'win32'
      });
      path.sep = path.win32.sep;
      Object.defineProperty(path, 'sep', {
        value: "\\"
      });
      path.separator = path.win32.separator;
      return Object.defineProperty(path, 'separator', {
        value: "\\"
      });
    });
    return describe("when on Windows", function() {
      return it("respects APPDATA", function() {
        var jupyterConfigDir, jupyterDataDir, jupyterPath, jupyterRuntimeDir, userHome, _ref;
        process.env['APPDATA'] = "C:\\USERS\\Jovyan\\AppData";
        _ref = require('../lib/paths'), jupyterPath = _ref.jupyterPath, jupyterConfigDir = _ref.jupyterConfigDir, jupyterDataDir = _ref.jupyterDataDir, jupyterRuntimeDir = _ref.jupyterRuntimeDir, userHome = _ref.userHome;
        return expect(jupyterDataDir()).toContain("C:\\USERS\\Jovyan\\AppData");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9zcGVjL3BhdGhzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBS0EsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQSxHQUFBO0FBRXRCLFFBQUEsc0VBQUE7QUFBQSxJQUFBLE9BQXFFLEVBQXJFLEVBQUMscUJBQUQsRUFBYywwQkFBZCxFQUFnQyx3QkFBaEMsRUFBZ0QsMkJBQWhELENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFFVCxVQUFBLGVBQUE7YUFBQSxRQUNnRCxPQUFBLENBQVEsY0FBUixDQURoRCxFQUFDLG9CQUFBLFdBQUQsRUFBYyx5QkFBQSxnQkFBZCxFQUNDLHVCQUFBLGNBREQsRUFDaUIsMEJBQUEsaUJBRGpCLEVBQ29DLGlCQUFBLFFBRHBDLEVBQUEsTUFGUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFPQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO2FBQ3JDLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsWUFBQSxtREFBQTtBQUFBLFFBQUEsV0FBQSxHQUFjLFdBQUEsQ0FBQSxDQUFkLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsT0FBTixDQUFjLFdBQWQsQ0FBUCxDQUFrQyxDQUFDLFVBQW5DLENBQUEsQ0FEQSxDQUFBO0FBR0E7YUFBQSxrREFBQTt1Q0FBQTtBQUNFLFVBQUEsTUFBQSxDQUFPLE1BQUEsQ0FBQSxVQUFQLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsUUFBaEMsQ0FBQSxDQUFBO0FBQUEsVUFFQSxNQUFBLEdBQVMsSUFBSSxD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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/spec/paths-spec.coffee
