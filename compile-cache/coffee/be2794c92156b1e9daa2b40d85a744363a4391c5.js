(function() {
  var Os, Path, commitPane, currentPane, fs, git, mockRepoWithSubmodule, mockSubmodule, notifier, pathToRepoFile, pathToSubmoduleFile, repo, textEditor, _ref;

  Path = require('path');

  Os = require('os');

  fs = require('fs-plus');

  git = require('../lib/git');

  notifier = require('../lib/notifier');

  _ref = require('./fixtures'), repo = _ref.repo, pathToRepoFile = _ref.pathToRepoFile, textEditor = _ref.textEditor, commitPane = _ref.commitPane, currentPane = _ref.currentPane;

  pathToSubmoduleFile = Path.join(Os.homedir(), "some/submodule/file");

  mockSubmodule = {
    getWorkingDirectory: function() {
      return Path.join(Os.homedir(), "some/submodule");
    },
    relativize: function(path) {
      if (path === pathToSubmoduleFile) {
        return "file";
      }
    }
  };

  mockRepoWithSubmodule = Object.create(repo);

  mockRepoWithSubmodule.repo = {
    submoduleForPath: function(path) {
      if (path === pathToSubmoduleFile) {
        return mockSubmodule;
      }
    }
  };

  describe("Git-Plus git module", function() {
    describe("git.getConfig", function() {
      var args;
      args = ['config', '--get', 'user.name'];
      describe("when a repo file path isn't specified", function() {
        return it("spawns a command querying git for the given global setting", function() {
          spyOn(git, 'cmd').andReturn(Promise.resolve('akonwi'));
          waitsForPromise(function() {
            return git.getConfig('user.name');
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(args, {
              cwd: Os.homedir()
            });
          });
        });
      });
      describe("when a repo file path is specified", function() {
        return it("checks for settings in that repo", function() {
          spyOn(git, 'cmd').andReturn(Promise.resolve('akonwi'));
          waitsForPromise(function() {
            return git.getConfig('user.name', repo.getWorkingDirectory());
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(args, {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      describe("when the command fails without an error message", function() {
        return it("resolves to ''", function() {
          spyOn(git, 'cmd').andReturn(Promise.reject(''));
          waitsForPromise(function() {
            return git.getConfig('user.name', repo.getWorkingDirectory()).then(function(result) {
              return expect(result).toEqual('');
            });
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(args, {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      return describe("when the command fails with an error message", function() {
        return it("rejects with the error message", function() {
          spyOn(git, 'cmd').andReturn(Promise.reject('getConfig error'));
          spyOn(notifier, 'addError');
          return waitsForPromise(function() {
            return git.getConfig('user.name', 'bad working dir').then(function(result) {
              return fail("should have been rejected");
            })["catch"](function(error) {
              return expect(notifier.addError).toHaveBeenCalledWith('getConfig error');
            });
          });
        });
      });
    });
    describe("git.getRepo", function() {
      return it("returns a promise resolving to repository", function() {
        spyOn(atom.project, 'getRepositories').andReturn([repo]);
        return waitsForPromise(function() {
          return git.getRepo().then(function(actual) {
            return expect(actual.getWorkingDirectory()).toEqual(repo.getWorkingDirectory());
          });
        });
      });
    });
    describe("git.dir", function() {
      return it("returns a promise resolving to absolute path of repo", function() {
        spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
        spyOn(atom.project, 'getRepositories').andReturn([repo]);
        return git.dir().then(function(dir) {
          return expect(dir).toEqual(repo.getWorkingDirectory());
        });
      });
    });
    describe("git.getSubmodule", function() {
      it("returns undefined when there is no submodule", function() {
        return expect(git.getSubmodule(pathToRepoFile)).toBe(void 0);
      });
      return it("returns a submodule when given file is in a submodule of a project repo", function() {
        spyOn(atom.project, 'getRepositories').andCallFake(function() {
          return [mockRepoWithSubmodule];
        });
        return expect(git.getSubmodule(pathToSubmoduleFile).getWorkingDirectory()).toEqual(mockSubmodule.getWorkingDirectory());
      });
    });
    describe("git.relativize", function() {
      return it("returns relativized filepath for files in repo", function() {
        spyOn(atom.project, 'getRepositories').andCallFake(function() {
          return [repo, mockRepoWithSubmodule];
        });
        expect(git.relativize(pathToRepoFile)).toBe('directory/file');
        return expect(git.relativize(pathToSubmoduleFile)).toBe("file");
      });
    });
    describe("git.cmd", function() {
      it("returns a promise", function() {
        return waitsForPromise(function() {
          var promise;
          promise = git.cmd();
          expect(promise["catch"]).toBeDefined();
          expect(promise.then).toBeDefined();
          return promise["catch"](function(output) {
            return expect(output).toContain('usage');
          });
        });
      });
      it("returns a promise that is fulfilled with stdout on success", function() {
        return waitsForPromise(function() {
          return git.cmd(['--version']).then(function(output) {
            return expect(output).toContain('git version');
          });
        });
      });
      it("returns a promise that is rejected with stderr on failure", function() {
        return waitsForPromise(function() {
          return git.cmd(['help', '--bogus-option'])["catch"](function(output) {
            return expect(output).toContain('unknown option');
          });
        });
      });
      return it("returns a promise that is fulfilled with stderr on success", function() {
        var cloneDir, initDir;
        initDir = 'git-plus-test-dir' + Math.random();
        cloneDir = initDir + '-clone';
        return waitsForPromise(function() {
          return git.cmd(['init', initDir]).then(function() {
            return git.cmd(['clone', '--progress', initDir, cloneDir]);
          }).then(function(output) {
            fs.removeSync(initDir);
            fs.removeSync(cloneDir);
            return expect(output).toContain('Cloning');
          });
        });
      });
    });
    describe("git.add", function() {
      it("calls git.cmd with ['add', '--all', {fileName}]", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(repo, {
            file: pathToSubmoduleFile
          }).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--all', pathToSubmoduleFile], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      it("calls git.cmd with ['add', '--all', '.'] when no file is specified", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(repo).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--all', '.'], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      it("calls git.cmd with ['add', '--update'...] when update option is true", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(repo, {
            update: true
          }).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--update', '.'], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      return describe("when it fails", function() {
        return it("notifies of failure", function() {
          spyOn(git, 'cmd').andReturn(Promise.reject('git.add error'));
          spyOn(notifier, 'addError');
          return waitsForPromise(function() {
            return git.add(repo).then(function(result) {
              return fail("should have been rejected");
            })["catch"](function(error) {
              return expect(notifier.addError).toHaveBeenCalledWith('git.add error');
            });
          });
        });
      });
    });
    describe("git.reset", function() {
      return it("resets and unstages all files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.reset(repo).then(function() {
            return expect(git.cmd).toHaveBeenCalledWith(['reset', 'HEAD'], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
    });
    describe("git.stagedFiles", function() {
      return it("returns an empty array when there are no staged files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('');
        });
        return waitsForPromise(function() {
          return git.stagedFiles(repo).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
      });
    });
    describe("git.unstagedFiles", function() {
      return it("returns an empty array when there are no unstaged files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('');
        });
        return waitsForPromise(function() {
          return git.unstagedFiles(repo).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
      });
    });
    describe("git.status", function() {
      return it("calls git.cmd with 'status' as the first argument", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          var args;
          args = git.cmd.mostRecentCall.args;
          if (args[0][0] === 'status') {
            return Promise.resolve(true);
          }
        });
        return git.status(repo).then(function() {
          return expect(true).toBeTruthy();
        });
      });
    });
    describe("git.refresh", function() {
      describe("when no arguments are passed", function() {
        return it("calls repo.refreshStatus for each repo in project", function() {
          spyOn(atom.project, 'getRepositories').andCallFake(function() {
            return [repo];
          });
          spyOn(repo, 'refreshStatus');
          git.refresh();
          return expect(repo.refreshStatus).toHaveBeenCalled();
        });
      });
      return describe("when a GitRepository object is passed", function() {
        return it("calls repo.refreshStatus for each repo in project", function() {
          spyOn(repo, 'refreshStatus');
          git.refresh(repo);
          return expect(repo.refreshStatus).toHaveBeenCalled();
        });
      });
    });
    return describe("git.diff", function() {
      return it("calls git.cmd with ['diff', '-p', '-U1'] and the file path", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve("string");
        });
        git.diff(repo, pathToRepoFile);
        return expect(git.cmd).toHaveBeenCalledWith(['diff', '-p', '-U1', pathToRepoFile], {
          cwd: repo.getWorkingDirectory()
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL2dpdC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1SkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxPQUFBLENBQVEsWUFBUixDQUhOLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSLENBSlgsQ0FBQTs7QUFBQSxFQUtBLE9BTUksT0FBQSxDQUFRLFlBQVIsQ0FOSixFQUNFLFlBQUEsSUFERixFQUVFLHNCQUFBLGNBRkYsRUFHRSxrQkFBQSxVQUhGLEVBSUUsa0JBQUEsVUFKRixFQUtFLG1CQUFBLFdBVkYsQ0FBQTs7QUFBQSxFQVlBLG1CQUFBLEdBQXNCLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFWLEVBQXdCLHFCQUF4QixDQVp0QixDQUFBOztBQUFBLEVBY0EsYUFBQSxHQUNFO0FBQUEsSUFBQSxtQkFBQSxFQUFxQixTQUFBLEdBQUE7YUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FBVixFQUF3QixnQkFBeEIsRUFBSDtJQUFBLENBQXJCO0FBQUEsSUFDQSxVQUFBLEVBQVksU0FBQyxJQUFELEdBQUE7QUFBVSxNQUFBLElBQVUsSUFBQSxLQUFRLG1CQUFsQjtlQUFBLE9BQUE7T0FBVjtJQUFBLENBRFo7R0FmRixDQUFBOztBQUFBLEVBa0JBLHFCQUFBLEdBQXdCLE1BQU0sQ0FBQyxNQUFQ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

//# sourceURL=/Users/Rad/.atom/packages/git-plus/spec/git-spec.coffee
