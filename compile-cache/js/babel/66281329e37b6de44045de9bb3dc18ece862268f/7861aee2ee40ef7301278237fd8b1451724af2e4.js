function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('./helpers/workspace');

var _libMinimap = require('../lib/minimap');

var _libMinimap2 = _interopRequireDefault(_libMinimap);

var _libMinimapElement = require('../lib/minimap-element');

var _libMinimapElement2 = _interopRequireDefault(_libMinimapElement);

'use babel';

describe('Minimap package', function () {
  var _ref = [];
  var editor = _ref[0];
  var minimap = _ref[1];
  var editorElement = _ref[2];
  var minimapElement = _ref[3];
  var workspaceElement = _ref[4];
  var minimapPackage = _ref[5];

  beforeEach(function () {
    atom.config.set('minimap.autoToggle', true);

    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    _libMinimapElement2['default'].registerViewProvider(_libMinimap2['default']);

    waitsForPromise(function () {
      return atom.workspace.open('sample.coffee');
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('minimap').then(function (pkg) {
        minimapPackage = pkg.mainModule;
      });
    });

    waitsFor(function () {
      return workspaceElement.querySelector('atom-text-editor');
    });

    runs(function () {
      editor = atom.workspace.getActiveTextEditor();
      editorElement = atom.views.getView(editor);
    });

    waitsFor(function () {
      return workspaceElement.querySelector('atom-text-editor::shadow atom-text-editor-minimap');
    });
  });

  it('registers the minimap views provider', function () {
    var textEditor = atom.workspace.buildTextEditor({});
    minimap = new _libMinimap2['default']({ textEditor: textEditor });
    minimapElement = atom.views.getView(minimap);

    expect(minimapElement).toExist();
  });

  describe('when an editor is opened', function () {
    it('creates a minimap model for the editor', function () {
      expect(minimapPackage.minimapForEditor(editor)).toBeDefined();
    });

    it('attaches a minimap element to the editor view', function () {
      expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).toExist();
    });
  });

  describe('::observeMinimaps', function () {
    var _ref2 = [];
    var spy = _ref2[0];

    beforeEach(function () {
      spy = jasmine.createSpy('observeMinimaps');
      minimapPackage.observeMinimaps(spy);
    });

    it('calls the callback with the existing minimaps', function () {
      expect(spy).toHaveBeenCalled();
    });

    it('calls the callback when a new editor is opened', function () {
      waitsForPromise(function () {
        return atom.workspace.open('other-sample.js');
      });

      runs(function () {
        expect(spy.calls.length).toEqual(2);
      });
    });
  });

  describe('::deactivate', function () {
    beforeEach(function () {
      minimapPackage.deactivate();
    });

    it('destroys all the minimap models', function () {
      expect(minimapPackage.editorsMinimaps).toBeUndefined();
    });

    it('destroys all the minimap elements', function () {
      expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).not.toExist();
    });
  });

  describe('service', function () {
    it('returns the minimap main module', function () {
      expect(minimapPackage.provideMinimapServiceV1()).toEqual(minimapPackage);
    });

    it('creates standalone minimap with provided text editor', function () {
      var textEditor = atom.workspace.buildTextEditor({});
      var standaloneMinimap = minimapPackage.standAloneMinimapForEditor(textEditor);
      expect(standaloneMinimap.getTextEditor()).toEqual(textEditor);
    });
  });

  //    ########  ##       ##     ##  ######   #### ##    ##  ######
  //    ##     ## ##       ##     ## ##    ##   ##  ###   ## ##    ##
  //    ##     ## ##       ##     ## ##         ##  ####  ## ##
  //    ########  ##       ##     ## ##   ####  ##  ## ## ##  ######
  //    ##        ##       ##     ## ##    ##   ##  ##  ####       ##
  //    ##        ##       ##     ## ##    ##   ##  ##   ### ##    ##
  //    ##        ########  #######   ######   #### ##    ##  ######

  describe('plugins', function () {
    var _ref3 = [];
    var registerHandler = _ref3[0];
    var unregisterHandler = _ref3[1];
    var plugin = _ref3[2];

    beforeEach(function () {
      atom.config.set('minimap.displayPluginsControls', true);
      atom.config.set('minimap.plugins.dummy', undefined);

      plugin = {
        active: false,
        activatePlugin: function activatePlugin() {
          this.active = true;
        },
        deactivatePlugin: function deactivatePlugin() {
          this.active = false;
        },
        isActive: function isActive() {
          return this.active;
        }
      };

      spyOn(plugin, 'activatePlugin').andCallThrough();
      spyOn(plugin, 'deactivatePlugin').andCallThrough();

      registerHandler = jasmine.createSpy('register handler');
      unregisterHandler = jasmine.createSpy('unregister handler');
    });

    describe('when registered', function () {
      beforeEach(function () {
        minimapPackage.onDidAddPlugin(registerHandler);
        minimapPackage.onDidRemovePlugin(unregisterHandler);
        minimapPackage.registerPlugin('dummy', plugin);
      });

      it('makes the plugin available in the minimap', function () {
        expect(minimapPackage.plugins['dummy']).toBe(plugin);
      });

      it('emits an event', function () {
        expect(registerHandler).toHaveBeenCalled();
      });

      it('creates a default config for the plugin', function () {
        expect(minimapPackage.config.plugins.properties.dummy).toBeDefined();
        expect(minimapPackage.config.plugins.properties.dummyDecorationsZIndex).toBeDefined();
      });

      it('sets the corresponding config', function () {
        expect(atom.config.get('minimap.plugins.dummy')).toBeTruthy();
        expect(atom.config.get('minimap.plugins.dummyDecorationsZIndex')).toEqual(0);
      });

      describe('triggering the corresponding plugin command', function () {
        beforeEach(function () {
          atom.commands.dispatch(workspaceElement, 'minimap:toggle-dummy');
        });

        it('receives a deactivation call', function () {
          expect(plugin.deactivatePlugin).toHaveBeenCalled();
        });
      });

      describe('and then unregistered', function () {
        beforeEach(function () {
          minimapPackage.unregisterPlugin('dummy');
        });

        it('has been unregistered', function () {
          expect(minimapPackage.plugins['dummy']).toBeUndefined();
        });

        it('emits an event', function () {
          expect(unregisterHandler).toHaveBeenCalled();
        });

        describe('when the config is modified', function () {
          beforeEach(function () {
            atom.config.set('minimap.plugins.dummy', false);
          });

          it('does not activates the plugin', function () {
            expect(plugin.deactivatePlugin).not.toHaveBeenCalled();
          });
        });
      });

      describe('on minimap deactivation', function () {
        beforeEach(function () {
          expect(plugin.active).toBeTruthy();
          minimapPackage.deactivate();
        });

        it('deactivates all the plugins', function () {
          expect(plugin.active).toBeFalsy();
        });
      });
    });

    describe('when the config for it is false', function () {
      beforeEach(function () {
        atom.config.set('minimap.plugins.dummy', false);
        minimapPackage.registerPlugin('dummy', plugin);
      });

      it('does not receive an activation call', function () {
        expect(plugin.activatePlugin).not.toHaveBeenCalled();
      });
    });

    describe('the registered plugin', function () {
      beforeEach(function () {
        minimapPackage.registerPlugin('dummy', plugin);
      });

      it('receives an activation call', function () {
        expect(plugin.activatePlugin).toHaveBeenCalled();
      });

      it('activates the plugin', function () {
        expect(plugin.active).toBeTruthy();
      });

      describe('when the config is modified after registration', function () {
        beforeEach(function () {
          atom.config.set('minimap.plugins.dummy', false);
        });

        it('receives a deactivation call', function () {
          expect(plugin.deactivatePlugin).toHaveBeenCalled();
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9SYWQvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL21pbmltYXAtbWFpbi1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O1FBRU8scUJBQXFCOzswQkFDUixnQkFBZ0I7Ozs7aUNBQ1Qsd0JBQXdCOzs7O0FBSm5ELFdBQVcsQ0FBQTs7QUFNWCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsWUFBTTthQUN5RCxFQUFFO01BQXRGLE1BQU07TUFBRSxPQUFPO01BQUUsYUFBYTtNQUFFLGNBQWM7TUFBRSxnQkFBZ0I7TUFBRSxjQUFjOztBQUVyRixZQUFVLENBQUMsWUFBTTtBQUNmLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFBOztBQUUzQyxvQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDckQsV0FBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBOztBQUVyQyxtQ0FBZSxvQkFBb0IseUJBQVMsQ0FBQTs7QUFFNUMsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7S0FDNUMsQ0FBQyxDQUFBOztBQUVGLG1CQUFlLENBQUMsWUFBTTtBQUNwQixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUM1RCxzQkFBYyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUE7T0FDaEMsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLFlBQVEsQ0FBQyxZQUFNO0FBQ2IsYUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtLQUMxRCxDQUFDLENBQUE7O0FBRUYsUUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLEdBQUcs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QUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO09BQ2pELENBQUMsQ0FBQTs7QUFFRixRQUFFLENBQUMsc0JBQXNCLEVBQUUsWUFBTTtBQUMvQixjQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO09BQ25DLENBQUMsQ0FBQTs7QUFFRixjQUFRLENBQUMsZ0RBQWdELEVBQUUsWUFBTTtBQUMvRCxrQkFBVSxDQUFDLFlBQU07QUFDZixjQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQTtTQUNoRCxDQUFDLENBQUE7O0FBRUYsVUFBRSxDQUFDLDhCQUE4QixFQUFFLFlBQU07QUFDdkMsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO1NBQ25ELENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvUmFkLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvc3BlYy9taW5pbWFwLW1haW4tc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCAnLi9oZWxwZXJzL3dvcmtzcGFjZSdcbmltcG9ydCBNaW5pbWFwIGZyb20gJy4uL2xpYi9taW5pbWFwJ1xuaW1wb3J0IE1pbmltYXBFbGVtZW50IGZyb20gJy4uL2xpYi9taW5pbWFwLWVsZW1lbnQnXG5cbmRlc2NyaWJlKCdNaW5pbWFwIHBhY2thZ2UnLCAoKSA9PiB7XG4gIGxldCBbZWRpdG9yLCBtaW5pbWFwLCBlZGl0b3JFbGVtZW50LCBtaW5pbWFwRWxlbWVudCwgd29ya3NwYWNlRWxlbWVudCwgbWluaW1hcFBhY2thZ2VdID0gW11cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYXV0b1RvZ2dsZScsIHRydWUpXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudClcblxuICAgIE1pbmltYXBFbGVtZW50LnJlZ2lzdGVyVmlld1Byb3ZpZGVyKE1pbmltYXApXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oJ3NhbXBsZS5jb2ZmZWUnKVxuICAgIH0pXG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdtaW5pbWFwJykudGhlbigocGtnKSA9PiB7XG4gICAgICAgIG1pbmltYXBQYWNrYWdlID0gcGtnLm1haW5Nb2R1bGVcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3InKVxuICAgIH0pXG5cbiAgICBydW5zKCgpID0+IHtcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgfSlcblxuICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3I6OnNoYWRvdyBhdG9tLXRleHQtZWRpdG9yLW1pbmltYXAnKVxuICAgIH0pXG4gIH0pXG5cbiAgaXQoJ3JlZ2lzdGVycyB0aGUgbWluaW1hcCB2aWV3cyBwcm92aWRlcicsICgpID0+IHtcbiAgICBsZXQgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7fSlcbiAgICBtaW5pbWFwID0gbmV3IE1pbmltYXAoe3RleHRFZGl0b3J9KVxuICAgIG1pbmltYXBFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KG1pbmltYXApXG5cbiAgICBleHBlY3QobWluaW1hcEVsZW1lbnQpLnRvRXhpc3QoKVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aGVuIGFuIGVkaXRvciBpcyBvcGVuZWQnLCAoKSA9PiB7XG4gICAgaXQoJ2NyZWF0ZXMgYSBtaW5pbWFwIG1vZGVsIGZvciB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLm1pbmltYXBGb3JFZGl0b3IoZWRpdG9yKSkudG9CZURlZmluZWQoKVxuICAgIH0pXG5cbiAgICBpdCgnYXR0YWNoZXMgYSBtaW5pbWFwIGVsZW1lbnQgdG8gdGhlIGVkaXRvciB2aWV3JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdhdG9tLXRleHQtZWRpdG9yLW1pbmltYXAnKSkudG9FeGlzdCgpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnOjpvYnNlcnZlTWluaW1hcHMnLCAoKSA9PiB7XG4gICAgbGV0IFtzcHldID0gW11cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIHNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdvYnNlcnZlTWluaW1hcHMnKVxuICAgICAgbWluaW1hcFBhY2thZ2Uub2JzZXJ2ZU1pbmltYXBzKHNweSlcbiAgICB9KVxuXG4gICAgaXQoJ2NhbGxzIHRoZSBjYWxsYmFjayB3aXRoIHRoZSBleGlzdGluZyBtaW5pbWFwcycsICgpID0+IHtcbiAgICAgIGV4cGVjdChzcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgIH0pXG5cbiAgICBpdCgnY2FsbHMgdGhlIGNhbGxiYWNrIHdoZW4gYSBuZXcgZWRpdG9yIGlzIG9wZW5lZCcsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7IHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKCdvdGhlci1zYW1wbGUuanMnKSB9KVxuXG4gICAgICBydW5zKCgpID0+IHsgZXhwZWN0KHNweS5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMikgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCc6OmRlYWN0aXZhdGUnLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBtaW5pbWFwUGFja2FnZS5kZWFjdGl2YXRlKClcbiAgICB9KVxuXG4gICAgaXQoJ2Rlc3Ryb3lzIGFsbCB0aGUgbWluaW1hcCBtb2RlbHMnLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UuZWRpdG9yc01pbmltYXBzKS50b0JlVW5kZWZpbmVkKClcbiAgICB9KVxuXG4gICAgaXQoJ2Rlc3Ryb3lzIGFsbCB0aGUgbWluaW1hcCBlbGVtZW50cycsICgpID0+IHtcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvci1taW5pbWFwJykpLm5vdC50b0V4aXN0KClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdzZXJ2aWNlJywgKCkgPT4ge1xuICAgIGl0KCdyZXR1cm5zIHRoZSBtaW5pbWFwIG1haW4gbW9kdWxlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLnByb3ZpZGVNaW5pbWFwU2VydmljZVYxKCkpLnRvRXF1YWwobWluaW1hcFBhY2thZ2UpXG4gICAgfSlcblxuICAgIGl0KCdjcmVhdGVzIHN0YW5kYWxvbmUgbWluaW1hcCB3aXRoIHByb3ZpZGVkIHRleHQgZWRpdG9yJywgKCkgPT4ge1xuICAgICAgbGV0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG4gICAgICBsZXQgc3RhbmRhbG9uZU1pbmltYXAgPSBtaW5pbWFwUGFja2FnZS5zdGFuZEFsb25lTWluaW1hcEZvckVkaXRvcih0ZXh0RWRpdG9yKVxuICAgICAgZXhwZWN0KHN0YW5kYWxvbmVNaW5pbWFwLmdldFRleHRFZGl0b3IoKSkudG9FcXVhbCh0ZXh0RWRpdG9yKVxuICAgIH0pXG4gIH0pXG5cbiAgLy8gICAgIyMjIyMjIyMgICMjICAgICAgICMjICAgICAjIyAgIyMjIyMjICAgIyMjIyAjIyAgICAjIyAgIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgIyMgICAjIyAgIyMjICAgIyMgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAgICMjICAjIyMjICAjIyAjI1xuICAvLyAgICAjIyMjIyMjIyAgIyMgICAgICAgIyMgICAgICMjICMjICAgIyMjIyAgIyMgICMjICMjICMjICAjIyMjIyNcbiAgLy8gICAgIyMgICAgICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAjIyAgICMjICAjIyAgIyMjIyAgICAgICAjI1xuICAvLyAgICAjIyAgICAgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjICAgIyMgICMjICAgIyMjICMjICAgICMjXG4gIC8vICAgICMjICAgICAgICAjIyMjIyMjIyAgIyMjIyMjIyAgICMjIyMjIyAgICMjIyMgIyMgICAgIyMgICMjIyMjI1xuXG4gIGRlc2NyaWJlKCdwbHVnaW5zJywgKCkgPT4ge1xuICAgIGxldCBbcmVnaXN0ZXJIYW5kbGVyLCB1bnJlZ2lzdGVySGFuZGxlciwgcGx1Z2luXSA9IFtdXG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgdHJ1ZSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgdW5kZWZpbmVkKVxuXG4gICAgICBwbHVnaW4gPSB7XG4gICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH0sXG4gICAgICAgIGRlYWN0aXZhdGVQbHVnaW4gKCkgeyB0aGlzLmFjdGl2ZSA9IGZhbHNlIH0sXG4gICAgICAgIGlzQWN0aXZlICgpIHsgcmV0dXJuIHRoaXMuYWN0aXZlIH1cbiAgICAgIH1cblxuICAgICAgc3B5T24ocGx1Z2luLCAnYWN0aXZhdGVQbHVnaW4nKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihwbHVnaW4sICdkZWFjdGl2YXRlUGx1Z2luJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICByZWdpc3RlckhhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgncmVnaXN0ZXIgaGFuZGxlcicpXG4gICAgICB1bnJlZ2lzdGVySGFuZGxlciA9IGphc21pbmUuY3JlYXRlU3B5KCd1bnJlZ2lzdGVyIGhhbmRsZXInKVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiByZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIG1pbmltYXBQYWNrYWdlLm9uRGlkQWRkUGx1Z2luKHJlZ2lzdGVySGFuZGxlcilcbiAgICAgICAgbWluaW1hcFBhY2thZ2Uub25EaWRSZW1vdmVQbHVnaW4odW5yZWdpc3RlckhhbmRsZXIpXG4gICAgICAgIG1pbmltYXBQYWNrYWdlLnJlZ2lzdGVyUGx1Z2luKCdkdW1teScsIHBsdWdpbilcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdtYWtlcyB0aGUgcGx1Z2luIGF2YWlsYWJsZSBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBQYWNrYWdlLnBsdWdpbnNbJ2R1bW15J10pLnRvQmUocGx1Z2luKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2VtaXRzIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocmVnaXN0ZXJIYW5kbGVyKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdjcmVhdGVzIGEgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBwbHVnaW4nLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwUGFja2FnZS5jb25maWcucGx1Z2lucy5wcm9wZXJ0aWVzLmR1bW15KS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChtaW5pbWFwUGFja2FnZS5jb25maWcucGx1Z2lucy5wcm9wZXJ0aWVzLmR1bW15RGVjb3JhdGlvbnNaSW5kZXgpLnRvQmVEZWZpbmVkKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdzZXRzIHRoZSBjb3JyZXNwb25kaW5nIGNvbmZpZycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JykpLnRvQmVUcnV0aHkoKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXlEZWNvcmF0aW9uc1pJbmRleCcpKS50b0VxdWFsKDApXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgndHJpZ2dlcmluZyB0aGUgY29ycmVzcG9uZGluZyBwbHVnaW4gY29tbWFuZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnbWluaW1hcDp0b2dnbGUtZHVtbXknKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZWNlaXZlcyBhIGRlYWN0aXZhdGlvbiBjYWxsJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChwbHVnaW4uZGVhY3RpdmF0ZVBsdWdpbikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHRoZW4gdW5yZWdpc3RlcmVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS51bnJlZ2lzdGVyUGx1Z2luKCdkdW1teScpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2hhcyBiZWVuIHVucmVnaXN0ZXJlZCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcFBhY2thZ2UucGx1Z2luc1snZHVtbXknXSkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2VtaXRzIGFuIGV2ZW50JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdCh1bnJlZ2lzdGVySGFuZGxlcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGNvbmZpZyBpcyBtb2RpZmllZCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5wbHVnaW5zLmR1bW15JywgZmFsc2UpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdkb2VzIG5vdCBhY3RpdmF0ZXMgdGhlIHBsdWdpbicsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChwbHVnaW4uZGVhY3RpdmF0ZVBsdWdpbikubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnb24gbWluaW1hcCBkZWFjdGl2YXRpb24nLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChwbHVnaW4uYWN0aXZlKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICBtaW5pbWFwUGFja2FnZS5kZWFjdGl2YXRlKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnZGVhY3RpdmF0ZXMgYWxsIHRoZSBwbHVnaW5zJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChwbHVnaW4uYWN0aXZlKS50b0JlRmFsc3koKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIGNvbmZpZyBmb3IgaXQgaXMgZmFsc2UnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXknLCBmYWxzZSlcbiAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15JywgcGx1Z2luKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2RvZXMgbm90IHJlY2VpdmUgYW4gYWN0aXZhdGlvbiBjYWxsJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2YXRlUGx1Z2luKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgndGhlIHJlZ2lzdGVyZWQgcGx1Z2luJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIG1pbmltYXBQYWNrYWdlLnJlZ2lzdGVyUGx1Z2luKCdkdW1teScsIHBsdWdpbilcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZWNlaXZlcyBhbiBhY3RpdmF0aW9uIGNhbGwnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChwbHVnaW4uYWN0aXZhdGVQbHVnaW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2FjdGl2YXRlcyB0aGUgcGx1Z2luJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocGx1Z2luLmFjdGl2ZSkudG9CZVRydXRoeSgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgY29uZmlnIGlzIG1vZGlmaWVkIGFmdGVyIHJlZ2lzdHJhdGlvbicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZHVtbXknLCBmYWxzZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVjZWl2ZXMgYSBkZWFjdGl2YXRpb24gY2FsbCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocGx1Z2luLmRlYWN0aXZhdGVQbHVnaW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/Users/Rad/.atom/packages/minimap/spec/minimap-main-spec.js
