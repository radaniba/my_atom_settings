(function() {
  var Config, ConfigManager, KernelManager, fs, path, portfinder;

  Config = require('../lib/config');

  ConfigManager = require('../lib/config-manager');

  portfinder = require('../lib/find-port');

  KernelManager = require('../lib/kernel-manager');

  path = require('path');

  fs = require('fs');

  describe('Atom config', function() {
    it('should set config value', function() {
      Config.setJson('set', 'foo');
      return expect(JSON.parse(atom.config.get('Hydrogen.set'))).toEqual('foo');
    });
    it('should read config values', function() {
      atom.config.set('Hydrogen.read', JSON.stringify('bar'));
      return expect(Config.getJson('read')).toEqual('bar');
    });
    return it('should return {} for broken config', function() {
      atom.config.set('Hydrogen.broken', 'foo');
      return expect(Config.getJson('broken')).toEqual({});
    });
  });

  describe('Port config manager', function() {
    it('should build port config', function() {
      var config, ports;
      ports = [60000, 60001, 60002, 60003];
      config = ConfigManager.buildConfiguration(ports);
      expect(config.version).toEqual(5);
      expect(config.key.length).toEqual(36);
      expect(config.signature_scheme).toEqual('hmac-sha256');
      expect(config.transport).toEqual('tcp');
      expect(config.ip).toEqual('127.0.0.1');
      expect(config.hb_port).toEqual(ports[0]);
      expect(config.control_port).toEqual(ports[1]);
      expect(config.shell_port).toEqual(ports[2]);
      expect(config.stdin_port).toEqual(ports[3]);
      return expect(config.iopub_port).toEqual(ports[4]);
    });
    return it('should write a port config file', function() {
      var fileNumberBefore, fileStoragePath;
      fileStoragePath = path.join(__dirname, '..', 'kernel-configs');
      try {
        fileNumberBefore = fs.readdirSync(fileStoragePath).length;
      } catch (_error) {
        fileNumberBefore = 0;
      }
      return ConfigManager.writeConfigFile(function() {
        var fileNumberAfter;
        fileNumberAfter = fs.readdirSync(fileStoragePath).length;
        return expect(fileNumberAfter).toEqual(fileNumberBefore + 1);
      });
    });
  });

  describe('Port finder', function() {
    it('should find a free port', function() {
      return portfinder.find(function(port) {
        return expect(port).toMatch(/\d{1,}/);
      });
    });
    it('should find 3 free ports', function() {
      return portfinder.findMany(3, function(ports) {
        expect(ports.length).toEqual(3);
        expect(ports[0]).toMatch(/\d{1,}/);
        expect(ports[1]).toMatch(/\d{1,}/);
        return expect(ports[2]).toMatch(/\d{1,}/);
      });
    });
    return it('should find 2 additional free ports', function() {
      return portfinder.findManyHelper(2, [60000], function(ports) {
        expect(ports.length).toEqual(3);
        expect(ports[0]).toEqual(60000);
        expect(ports[1]).toMatch(/\d{1,}/);
        return expect(ports[2]).toMatch(/\d{1,}/);
      });
    });
  });

  describe('Kernel manager', function() {
    var firstKernelSpec, firstKernelSpecString, kernelSpecs, kernelSpecsString, secondKernelSpec, secondKernelSpecString;
    firstKernelSpecString = '{\n    "kernelspecs": {\n        "ijavascript": {\n            "spec": {\n                "display_name": "IJavascript",\n                "env": {},\n                "argv": [\n                    "node",\n                    "/home/user/node_modules/ijavascript/lib/kernel.js",\n                    "--protocol=5.0",\n                    "{connection_file}"\n                ],\n                    "language": "javascript"\n            },\n            "resource_dir": "/home/user/node_modules/ijavascript/images"\n        }\n    }\n}';
    secondKernelSpecString = '{\n    "kernelspecs": {\n        "python2": {\n            "resource_dir": "/usr/local/lib/python2.7/site-packages/ipykernel/resources",\n            "spec": {\n                "language": "python",\n                "display_name": "Python 2",\n                "env": {},\n                "argv": [\n                    "/usr/local/opt/python/bin/python2.7",\n                    "-m",\n                    "ipykernel",\n                    "-f",\n                    "{connection_file}"\n                ]\n            }\n        }\n    }\n}';
    firstKernelSpec = JSON.parse(firstKernelSpecString);
    secondKernelSpec = JSON.parse(secondKernelSpecString);
    kernelSpecs = JSON.parse(firstKernelSpecString);
    kernelSpecs.kernelspecs.python2 = secondKernelSpec.kernelspecs.python2;
    kernelSpecsString = JSON.stringify(kernelSpecs);
    beforeEach(function() {
      this.kernelManager = new KernelManager();
      return atom.config.set('Hydrogen.kernelspec', '');
    });
    describe('getKernelSpecsFromSettings', function() {
      it('should parse kernelspecs from settings', function() {
        var parsed;
        atom.config.set('Hydrogen.kernelspec', firstKernelSpecString);
        parsed = this.kernelManager.getKernelSpecsFromSettings();
        return expect(parsed).toEqual(firstKernelSpec.kernelspecs);
      });
      it('should return {} if no kernelspec is set', function() {
        return expect(this.kernelManager.getKernelSpecsFromSettings()).toEqual({});
      });
      return it('should return {} if invalid kernelspec is set', function() {
        atom.config.set('Hydrogen.kernelspec', 'invalid');
        return expect(this.kernelManager.getKernelSpecsFromSettings()).toEqual({});
      });
    });
    describe('mergeKernelSpecs', function() {
      return it('should merge kernelspecs', function() {
        var specs;
        this.kernelManager._kernelSpecs = firstKernelSpec.kernelspecs;
        this.kernelManager.mergeKernelSpecs(secondKernelSpec.kernelspecs);
        specs = this.kernelManager._kernelSpecs;
        return expect(specs).toEqual(kernelSpecs.kernelspecs);
      });
    });
    describe('getAllKernelSpecs', function() {
      return it('should return an array with specs', function() {
        var specs;
        this.kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
        specs = this.kernelManager.getAllKernelSpecs();
        expect(specs.length).toEqual(2);
        expect(specs[0]).toEqual(kernelSpecs.kernelspecs.ijavascript.spec);
        return expect(specs[1]).toEqual(kernelSpecs.kernelspecs.python2.spec);
      });
    });
    describe('getAllKernelSpecsFor', function() {
      it('should return an array with specs for given language', function() {
        var allKernelSpecsForPython;
        this.kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
        allKernelSpecsForPython = this.kernelManager.getAllKernelSpecsFor('python');
        expect(allKernelSpecsForPython.length).toEqual(1);
        return expect(allKernelSpecsForPython[0]).toEqual(kernelSpecs.kernelspecs.python2.spec);
      });
      return it('should return an empty array', function() {
        var allKernelSpecsForJulia;
        this.kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
        allKernelSpecsForJulia = this.kernelManager.getAllKernelSpecsFor('julia');
        return expect(allKernelSpecsForJulia).toEqual([]);
      });
    });
    describe('getKernelSpecFor', function() {
      it('should return spec for given language', function() {
        var kernelSpecForPython;
        this.kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
        kernelSpecForPython = this.kernelManager.getKernelSpecFor('python');
        return expect(kernelSpecForPython).toEqual(kernelSpecs.kernelspecs.python2.spec);
      });
      return it('should return undefined', function() {
        var kernelSpecForJulia;
        this.kernelManager._kernelSpecs = kernelSpecs.kernelspecs;
        kernelSpecForJulia = this.kernelManager.getKernelSpecFor('julia');
        return expect(kernelSpecForJulia).toBeUndefined();
      });
    });
    it('should read lower case name from grammar', function() {
      var grammar;
      grammar = atom.grammars.getGrammars()[0];
      return expect(this.kernelManager.getLanguageFor(grammar)).toEqual('null grammar');
    });
    return it('should update kernelspecs', function(done) {
      return this.kernelManager.getKernelSpecsFromJupyter(function(err, specs) {
        expect(specs).toEqual(jasmine.any(Object));
        return done;
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9zcGVjL2h5ZHJvZ2VuLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBEQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHVCQUFSLENBRGhCLENBQUE7O0FBQUEsRUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGtCQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHVCQUFSLENBSGhCLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FMUCxDQUFBOztBQUFBLEVBTUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBTkwsQ0FBQTs7QUFBQSxFQVFBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUNwQixJQUFBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDMUIsTUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLEtBQWYsRUFBc0IsS0FBdEIsQ0FBQSxDQUFBO2FBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGNBQWhCLENBQVgsQ0FBUCxDQUFpRCxDQUFDLE9BQWxELENBQTBELEtBQTFELEVBRjBCO0lBQUEsQ0FBOUIsQ0FBQSxDQUFBO0FBQUEsSUFJQSxFQUFBLENBQUcsMkJBQUgsRUFBZ0MsU0FBQSxHQUFBO0FBQzVCLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGVBQWhCLEVBQWlDLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBZixDQUFqQyxDQUFBLENBQUE7YUFDQSxNQUFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/spec/hydrogen-spec.coffee
