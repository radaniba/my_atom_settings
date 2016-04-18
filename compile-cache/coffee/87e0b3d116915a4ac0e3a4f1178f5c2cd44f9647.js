(function() {
  var Path;

  Path = require('path');

  describe('auto-detect-indentation', function() {
    var activationPromise, editor, workspace, _ref;
    _ref = [], editor = _ref[0], workspace = _ref[1], activationPromise = _ref[2];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("auto-detect-indentation");
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-c");
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage("language-sass");
      });
    });
    describe('when a file is opened with 4 spaces', function() {
      beforeEach(function() {
        atom.config.set("editor.tabLength", 2);
        atom.config.set("editor.softTabs", false);
        waitsForPromise(function() {
          return atom.workspace.open(Path.join(__dirname, './fixtures/4-spaces.rb'));
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("will report 4 spaces", function() {
        return expect(editor.getTabLength()).toBe(4);
      });
      return it("will report soft tabs", function() {
        return expect(editor.getSoftTabs()).toBe(true);
      });
    });
    describe('when a file is opened with 2 spaces', function() {
      beforeEach(function() {
        atom.config.set("editor.tabLength", 4);
        atom.config.set("editor.softTabs", false);
        waitsForPromise(function() {
          return atom.workspace.open(Path.join(__dirname, './fixtures/2-spaces.py'));
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("will report 2 spaces", function() {
        return expect(editor.getTabLength()).toBe(2);
      });
      return it("will report soft tabs", function() {
        return expect(editor.getSoftTabs()).toBe(true);
      });
    });
    describe('when a file is opened with 4 spaces but first spacing is longer', function() {
      beforeEach(function() {
        atom.config.set("editor.tabLength", 2);
        atom.config.set("editor.softTabs", false);
        waitsForPromise(function() {
          return atom.workspace.open(Path.join(__dirname, './fixtures/lined-up-params.py'));
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("will report 4 spaces", function() {
        return expect(editor.getTabLength()).toBe(4);
      });
      return it("will report soft tabs", function() {
        return expect(editor.getSoftTabs()).toBe(true);
      });
    });
    describe('when a file is opened with tabs', function() {
      beforeEach(function() {
        atom.config.set("editor.tabLength", 4);
        atom.config.set("editor.softTabs", true);
        waitsForPromise(function() {
          return atom.workspace.open(Path.join(__dirname, './fixtures/tabs.rb'));
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("will report hard tabs", function() {
        return expect(editor.getSoftTabs()).toBe(false);
      });
      return it("will report tab length of 4", function() {
        return expect(editor.getTabLength()).toBe(4);
      });
    });
    describe('when a file is opened with mostly tabs but has one line with spaces', function() {
      beforeEach(function() {
        atom.config.set("editor.tabLength", 2);
        atom.config.set("editor.softTabs", true);
        waitsForPromise(function() {
          return atom.workspace.open(Path.join(__dirname, './fixtures/mostly-tabs.rb'));
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("will report hard tabs", function() {
        return expect(editor.getSoftTabs()).toBe(false);
      });
      return it("will report tab length of 2", function() {
        return expect(editor.getTabLength()).toBe(2);
      });
    });
    describe('when a file is opened with mostly spaces but a couple lines have tabs', function() {
      beforeEach(function() {
        atom.config.set("editor.tabLength", 2);
        atom.config.set("editor.softTabs", false);
        waitsForPromise(function() {
          return atom.workspace.open(Path.join(__dirname, './fixtures/mostly-spaces.rb'));
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("will report 6 spaces", function() {
        return expect(editor.getTabLength()).toBe(6);
      });
      return it("will report soft tabs", function() {
        return expect(editor.getSoftTabs()).toBe(true);
      });
    });
    describe('when a file is opened with c style block comments', function() {
      beforeEach(function() {
        atom.config.set("editor.tabLength", 4);
        atom.config.set("editor.softTabs", false);
        waitsForPromise(function() {
          return atom.workspace.open(Path.join(__dirname, './fixtures/c-style-block-comments.c'));
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("will report 2 spaces", function() {
        return expect(editor.getTabLength()).toBe(2);
      });
      return it("will report soft tabs", function() {
        return expect(editor.getSoftTabs()).toBe(true);
      });
    });
    describe('when a file is opened with c style block comments near the end or line 100', function() {
      beforeEach(function() {
        atom.config.set("editor.tabLength", 4);
        atom.config.set("editor.softTabs", false);
        waitsForPromise(function() {
          return atom.workspace.open(Path.join(__dirname, './fixtures/c-style-block-comments-at-end.c'));
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("will report 2 spaces", function() {
        return expect(editor.getTabLength()).toBe(2);
      });
      return it("will report soft tabs", function() {
        return expect(editor.getSoftTabs()).toBe(true);
      });
    });
    return describe('when a file is opened only comments', function() {
      beforeEach(function() {
        atom.config.set("editor.tabLength", 4);
        atom.config.set("editor.softTabs", false);
        waitsForPromise(function() {
          return atom.workspace.open(Path.join(__dirname, './fixtures/only-comments.scss'));
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
      it("will pass this test because it didn't infinite loop", function() {
        return expect(true).toBe(true);
      });
      it("will report 4 spaces", function() {
        return expect(editor.getTabLength()).toBe(4);
      });
      return it("will report tabs", function() {
        return expect(editor.getSoftTabs()).toBe(false);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdXRvLWRldGVjdC1pbmRlbnRhdGlvbi9zcGVjL2F1dG8tZGV0ZWN0LWluZGVudGF0aW9uLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxRQUFBLDBDQUFBO0FBQUEsSUFBQSxPQUF5QyxFQUF6QyxFQUFDLGdCQUFELEVBQVMsbUJBQVQsRUFBb0IsMkJBQXBCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFFVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHlCQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO0FBQUEsTUFJQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixZQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FKQSxDQUFBO2FBT0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUIsRUFEYztNQUFBLENBQWhCLEVBVFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBY0EsUUFBQSxDQUFTLHFDQUFULEVBQWdELFNBQUEsR0FBQTtBQUU5QyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsRUFBb0MsQ0FBcEMsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdB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

//# sourceURL=/Users/Rad/.atom/packages/auto-detect-indentation/spec/auto-detect-indentation-spec.coffee
