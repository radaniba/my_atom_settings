(function() {
  var Config, ConfigManager, KernelManager, fs, path, portfinder;

  Config = require('../lib/config');

  ConfigManager = require('../lib/config-manager');

  portfinder = require('../lib/find-port');

  KernelManager = require('../lib/kernel-manager');

  path = require('path');

  fs = require('fs');

  describe("Atom config", function() {
    it("should set config value", function() {
      Config.setJson("set", "foo");
      return expect(JSON.parse(atom.config.get("Hydrogen.set"))).toEqual("foo");
    });
    it("should read config values", function() {
      atom.config.set("Hydrogen.read", JSON.stringify("bar"));
      return expect(Config.getJson("read")).toEqual("bar");
    });
    return it("should return {} for broken config", function() {
      atom.config.set("Hydrogen.broken", "foo");
      return expect(Config.getJson("broken")).toEqual({});
    });
  });

  describe("Port config manager", function() {
    it("should build port config", function() {
      var config, ports;
      ports = [60000, 60001, 60002, 60003];
      config = ConfigManager.buildConfiguration(ports);
      expect(config.version).toEqual(5);
      expect(config.key.length).toEqual(36);
      expect(config.signature_scheme).toEqual("hmac-sha256");
      expect(config.transport).toEqual("tcp");
      expect(config.ip).toEqual("127.0.0.1");
      expect(config.hb_port).toEqual(ports[0]);
      expect(config.control_port).toEqual(ports[1]);
      expect(config.shell_port).toEqual(ports[2]);
      expect(config.stdin_port).toEqual(ports[3]);
      return expect(config.iopub_port).toEqual(ports[4]);
    });
    return it("should write a port config file", function() {
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

  describe("Port finder", function() {
    it("should find a free port", function() {
      return portfinder.find(function(port) {
        return expect(port).toMatch(/\d{1,}/);
      });
    });
    it("should find 3 free ports", function() {
      return portfinder.findMany(3, function(ports) {
        expect(ports.length).toEqual(3);
        expect(ports[0]).toMatch(/\d{1,}/);
        expect(ports[1]).toMatch(/\d{1,}/);
        return expect(ports[2]).toMatch(/\d{1,}/);
      });
    });
    return it("should find 2 additional free ports", function() {
      return portfinder.findManyHelper(2, [60000], function(ports) {
        expect(ports.length).toEqual(3);
        expect(ports[0]).toEqual(60000);
        expect(ports[1]).toMatch(/\d{1,}/);
        return expect(ports[2]).toMatch(/\d{1,}/);
      });
    });
  });

  describe("Kernel manager", function() {
    var firstKernelSpec, firstKernelSpecString, kernelSpecs, secondKernelSpec, secondKernelSpecString;
    firstKernelSpecString = "{\n    \"kernelspecs\": {\n        \"ijavascript\": {\n            \"spec\": {\n                \"display_name\": \"IJavascript\",\n                \"env\": {},\n                \"argv\": [\n                    \"node\",\n                    \"/home/user/node_modules/ijavascript/lib/kernel.js\",\n                    \"--protocol=5.0\",\n                    \"{connection_file}\"\n                ],\n                    \"language\": \"javascript\"\n            },\n            \"resource_dir\": \"/home/user/node_modules/ijavascript/images\"\n        }\n    }\n}";
    secondKernelSpecString = "{\n    \"kernelspecs\": {\n        \"python2\": {\n            \"resource_dir\": \"/usr/local/lib/python2.7/site-packages/ipykernel/resources\",\n            \"spec\": {\n                \"language\": \"python\",\n                \"display_name\": \"Python 2\",\n                \"env\": {},\n                \"argv\": [\n                    \"/usr/local/opt/python/bin/python2.7\",\n                    \"-m\",\n                    \"ipykernel\",\n                    \"-f\",\n                    \"{connection_file}\"\n                ]\n            }\n        }\n    }\n}";
    firstKernelSpec = JSON.parse(firstKernelSpecString);
    secondKernelSpec = JSON.parse(secondKernelSpecString);
    kernelSpecs = JSON.parse(firstKernelSpecString);
    kernelSpecs.kernelspecs.python2 = secondKernelSpec.kernelspecs.python2;
    beforeEach(function() {
      return atom.config.set("Hydrogen.kernelspec", "");
    });
    describe("parseKernelSpecSettings", function() {
      it("should parse kernelspecs from settings", function() {
        var parsed;
        atom.config.set("Hydrogen.kernelspec", firstKernelSpecString);
        parsed = KernelManager.parseKernelSpecSettings();
        return expect(parsed).toEqual(firstKernelSpec.kernelspecs);
      });
      it("should return {} if no kernelspec is set", function() {
        return expect(KernelManager.parseKernelSpecSettings()).toEqual({});
      });
      return it("should return {} if invalid kernelspec is set", function() {
        atom.config.set("Hydrogen.kernelspec", "invalid");
        return expect(KernelManager.parseKernelSpecSettings()).toEqual({});
      });
    });
    describe("saveKernelSpecs", function() {
      it("should not write invalid json strings to settings", function() {
        KernelManager.saveKernelSpecs("invalid");
        return expect(atom.config.get("Hydrogen.kernelspec")).toEqual("");
      });
      it("should not write invalid kernelspecs to json", function() {
        KernelManager.saveKernelSpecs('{"invalid": "kernel"}');
        return expect(atom.config.get("Hydrogen.kernelspec")).toEqual("");
      });
      it("should save kernelspecs to settings", function() {
        var config;
        KernelManager.saveKernelSpecs(firstKernelSpecString);
        config = JSON.parse(atom.config.get("Hydrogen.kernelspec"));
        return expect(config).toEqual(firstKernelSpec);
      });
      return it("should add kernelspecs to settings", function() {
        var config;
        atom.config.set("Hydrogen.kernelspec", firstKernelSpecString);
        KernelManager.saveKernelSpecs(secondKernelSpecString);
        config = JSON.parse(atom.config.get("Hydrogen.kernelspec"));
        expect(config.kernelspecs.ijavascript).toEqual(firstKernelSpec.kernelspecs.ijavascript);
        return expect(config.kernelspecs.python2).toEqual(secondKernelSpec.kernelspecs.python2);
      });
    });
    describe("getAllKernelSpecs", function() {
      return it("should return an array with specs", function() {
        var allKernelSpecs;
        atom.config.set("Hydrogen.kernelspec", JSON.stringify(kernelSpecs));
        allKernelSpecs = KernelManager.getAllKernelSpecs();
        expect(allKernelSpecs.length).toEqual(2);
        expect(allKernelSpecs[0]).toEqual(kernelSpecs.kernelspecs.ijavascript.spec);
        return expect(allKernelSpecs[1]).toEqual(kernelSpecs.kernelspecs.python2.spec);
      });
    });
    describe("getAllKernelSpecsFor", function() {
      it("should return an array with specs for given language", function() {
        var allKernelSpecsForPython;
        atom.config.set("Hydrogen.kernelspec", JSON.stringify(kernelSpecs));
        allKernelSpecsForPython = KernelManager.getAllKernelSpecsFor("python");
        expect(allKernelSpecsForPython.length).toEqual(1);
        return expect(allKernelSpecsForPython[0]).toEqual(kernelSpecs.kernelspecs.python2.spec);
      });
      return it("should return an empty array", function() {
        var allKernelSpecsForJulia;
        atom.config.set("Hydrogen.kernelspec", JSON.stringify(kernelSpecs));
        allKernelSpecsForJulia = KernelManager.getAllKernelSpecsFor("julia");
        return expect(allKernelSpecsForJulia).toEqual([]);
      });
    });
    describe("getKernelSpecFor", function() {
      it("should return spec for given language", function() {
        var kernelSpecForPython;
        atom.config.set("Hydrogen.kernelspec", JSON.stringify(kernelSpecs));
        kernelSpecForPython = KernelManager.getKernelSpecFor("python");
        console.log(kernelSpecForPython);
        return expect(kernelSpecForPython).toEqual(kernelSpecs.kernelspecs.python2.spec);
      });
      return it("should return undefined", function() {
        var kernelSpecForJulia;
        atom.config.set("Hydrogen.kernelspec", JSON.stringify(kernelSpecs));
        kernelSpecForJulia = KernelManager.getKernelSpecFor("julia");
        return expect(kernelSpecForJulia).toBeUndefined();
      });
    });
    it("should read lower case name from grammar", function() {
      var grammar;
      grammar = atom.grammars.getGrammars()[0];
      return expect(KernelManager.getGrammarLanguageFor(grammar)).toEqual("null grammar");
    });
    return it("should update kernelspecs", function() {
      KernelManager.updateKernelSpecs();
      waits(3000);
      return runs(function() {
        var kernelspec;
        kernelspec = JSON.parse(atom.config.get("Hydrogen.kernelspec"));
        expect(kernelspec).not.toBeUndefined();
        return expect(kernelspec.kernelspecs).not.toBeUndefined();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi9zcGVjL2h5ZHJvZ2VuLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBEQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHVCQUFSLENBRGhCLENBQUE7O0FBQUEsRUFFQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGtCQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHVCQUFSLENBSGhCLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FMUCxDQUFBOztBQUFBLEVBTUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBTkwsQ0FBQTs7QUFBQSxFQVFBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUNwQixJQUFBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDMUIsTUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLEtBQWYsRUFBc0IsS0FBdEIsQ0FBQSxDQUFBO2FBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGNBQWhCLENBQVgsQ0FBUCxDQUFpRCxDQUFDLE9BQWxELENBQTBELEtBQTFELEVBRjBCO0lBQUEsQ0FBOUIsQ0FBQSxDQUFBO0FBQUEsSUFJQSxFQUFBLENBQUcsMkJBQUgsRUFBZ0MsU0FBQSxHQUFBO0FBQzVCLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGVBQWhCLEVBQWlDLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBZixDQUFqQyxDQUFBLENBQUE7YUFDQSxNQUFB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

//# sourceURL=/Users/Rad/.atom/packages/hydrogen/spec/hydrogen-spec.coffee
