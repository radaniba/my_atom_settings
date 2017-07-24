(function() {
  var Config, KernelManager, fs, path;

  Config = require('../lib/config');

  KernelManager = require('../lib/kernel-manager');

  path = require('path');

  fs = require('fs');

  describe('Atom config', function() {
    it('should read config values', function() {
      atom.config.set('Hydrogen.read', JSON.stringify('bar'));
      return expect(Config.getJson('read')).toEqual('bar');
    });
    return it('should return {} for broken config', function() {
      atom.config.set('Hydrogen.broken', 'foo');
      return expect(Config.getJson('broken')).toEqual({});
    });
  });

  describe('Kernel manager', function() {
    var firstKernelSpec, firstKernelSpecString, kernelManager, kernelSpecs, kernelSpecsString, secondKernelSpec, secondKernelSpecString;
    firstKernelSpecString = '{\n    "kernelspecs": {\n        "ijavascript": {\n            "spec": {\n                "display_name": "IJavascript",\n                "env": {},\n                "argv": [\n                    "node",\n                    "/home/user/node_modules/ijavascript/lib/kernel.js",\n                    "--protocol=5.0",\n                    "{connection_file}"\n                ],\n                    "language": "javascript"\n            },\n            "resource_dir": "/home/user/node_modules/ijavascript/images"\n        }\n    }\n}';
    secondKernelSpecString = '{\n    "kernelspecs": {\n        "python2": {\n            "spec": {\n                "language": "python",\n                "display_name": "Python 2",\n                "env": {},\n                "argv": [\n                    "/usr/local/opt/python/bin/python2.7",\n                    "-m",\n                    "ipykernel",\n                    "-f",\n                    "{connection_file}"\n                ]\n            }\n        }\n    }\n}';
    firstKernelSpec = JSON.parse(firstKernelSpecString);
    secondKernelSpec = JSON.parse(secondKernelSpecString);
    kernelSpecs = JSON.parse(firstKernelSpecString);
    kernelSpecs.kernelspecs.python2 = secondKernelSpec.kernelspecs.python2;
    kernelSpecsString = JSON.stringify(kernelSpecs);
    kernelManager = null;
    beforeEach(function() {
      kernelManager = new KernelManager();
      return atom.config.set('Hydrogen.kernelspec', '');
    });
    describe('getKernelSpecsFromSettings', function() {
      it('should parse kernelspecs from settings', function() {
        var parsed;
        atom.config.set('Hydrogen.kernelspec', firstKernelSpecString);
        parsed = kernelManager.getKernelSpecsFromSettings();
        return expect(parsed).toEqual(firstKernelSpec.kernelspecs);
      });
      it('should return {} if no kernelspec is set', function() {
        return expect(kernelManager.getKernelSpecsFromSettings()).toEqual({});
      });
      return it('should return {} if invalid kernelspec is set', function() {
        atom.config.set('Hydrogen.kernelspec', 'invalid');
        return expect(kernelManager.getKernelSpecsFromSettings()).toEqual({});
      });
    });
    describe('mergeKernelSpecs', function() {
      return it('should merge kernelspecs', function() {
        var specs;
        kernelManager._kernelSpecs = firstKernelSpec.kernelspecs;
        kernelManager.mergeKernelSpecs(secondKernelSpec.kernelspecs);
        specs = kernelManager._kernelSpecs;
        return expect(specs).toEqual(kernelSpecs.kernelspecs);
      });
    });
    describe('getAllKernelSpecs', function() {
      return it('should return an array with specs', function() {
        return waitsForPromise(function() {
          return new Promise(function(resolve, reject) {
            kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
            return kernelManager.getAllKernelSpecs(function(specs) {
              expect(specs.length).toEqual(2);
              expect(specs[0]).toEqual(kernelSpecs.kernelspecs.ijavascript.spec);
              expect(specs[1]).toEqual(kernelSpecs.kernelspecs.python2.spec);
              return resolve();
            });
          });
        });
      });
    });
    describe('getAllKernelSpecsFor', function() {
      it('should return an array with specs for given language', function() {
        return waitsForPromise(function() {
          return new Promise(function(resolve, reject) {
            kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
            return kernelManager.getAllKernelSpecsFor('python', function(specs) {
              expect(specs.length).toEqual(1);
              expect(specs[0]).toEqual(kernelSpecs.kernelspecs.python2.spec);
              return resolve();
            });
          });
        });
      });
      return it('should return an empty array', function() {
        return waitsForPromise(function() {
          return new Promise(function(resolve, reject) {
            kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
            return kernelManager.getAllKernelSpecsFor('julia', function(specs) {
              expect(specs).toEqual([]);
              return resolve();
            });
          });
        });
      });
    });
    describe('getKernelSpecFor', function() {
      it('should return spec for given language', function() {
        return waitsForPromise(function() {
          return new Promise(function(resolve, reject) {
            kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
            return kernelManager.getKernelSpecFor('python', function(kernelSpec) {
              expect(kernelSpec).toEqual(kernelSpecs.kernelspecs.python2.spec);
              return resolve();
            });
          });
        });
      });
      return it('should return undefined', function() {
        return waitsForPromise(function() {
          return new Promise(function(resolve, reject) {
            kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
            return kernelManager.getKernelSpecFor('julia', function(kernelSpecForJulia) {
              expect(kernelSpecForJulia).toBeUndefined();
              return resolve();
            });
          });
        });
      });
    });
    it('should read lower case name from grammar', function() {
      var grammar;
      grammar = atom.grammars.getGrammars()[0];
      return expect(kernelManager.getLanguageFor(grammar)).toEqual('null grammar');
    });
    return it('should update kernelspecs', function() {
      return waitsForPromise(function() {
        return new Promise(function(resolve, reject) {
          return kernelManager.getKernelSpecsFromJupyter(function(err, specs) {
            if (!err) {
              expect(specs instanceof Object).toEqual(true);
            }
            return resolve();
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9zcGVjL2h5ZHJvZ2VuLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtCQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHVCQUFSLENBRGhCLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBSkwsQ0FBQTs7QUFBQSxFQU1BLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUNwQixJQUFBLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBLEdBQUE7QUFDNUIsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZUFBaEIsRUFBaUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFmLENBQWpDLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWYsQ0FBUCxDQUE2QixDQUFDLE9BQTlCLENBQXNDLEtBQXRDLEVBRjRCO0lBQUEsQ0FBaEMsQ0FBQSxDQUFBO1dBSUEsRUFBQSxDQUFHLG9DQUFILEVBQXlDLFNBQUEsR0FBQTtBQUNyQyxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQkFBaEIsRUFBbUMsS0FBbkMsQ0FBQSxDQUFBO2FBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZixDQUFQLENBQStCLENBQUMsT0FBaEMsQ0FBd0MsRUFBeEMsRUFGcUM7SUFBQSxDQUF6QyxFQUxvQjtFQUFBLENBQXhCLENBTkEsQ0FBQTs7QUFBQSxFQWVBLFFBQUEs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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/spec/hydrogen-spec.coffee
