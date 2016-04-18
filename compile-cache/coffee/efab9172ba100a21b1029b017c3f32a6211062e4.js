(function() {
  describe('Tool Bar package', function() {
    var buildClickEvent, getGlyph, toolBarAPI, toolBarService, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], toolBarService = _ref[1], toolBarAPI = _ref[2];
    getGlyph = function(elm) {
      return window.getComputedStyle(elm, ':before').getPropertyValue('content').charCodeAt(1).toString(16).toLowerCase();
    };
    buildClickEvent = function(_arg) {
      var altKey, ctrlKey, event, shiftKey, _ref1;
      _ref1 = _arg != null ? _arg : {}, altKey = _ref1.altKey, ctrlKey = _ref1.ctrlKey, shiftKey = _ref1.shiftKey;
      event = new MouseEvent('click');
      if (altKey != null) {
        Object.defineProperty(event, 'altKey', {
          get: function() {
            return altKey;
          }
        });
      }
      if (ctrlKey != null) {
        Object.defineProperty(event, 'ctrlKey', {
          get: function() {
            return ctrlKey;
          }
        });
      }
      if (shiftKey != null) {
        Object.defineProperty(event, 'shiftKey', {
          get: function() {
            return shiftKey;
          }
        });
      }
      return event;
    };
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('tool-bar').then(function(pack) {
          return toolBarService = pack.mainModule.provideToolBar();
        });
      });
    });
    describe('@activate', function() {
      return it('appends only one tool bar', function() {
        expect(workspaceElement.querySelectorAll('.tool-bar').length).toBe(1);
        atom.workspace.getActivePane().splitRight({
          copyActiveItem: true
        });
        return expect(workspaceElement.querySelectorAll('.tool-bar').length).toBe(1);
      });
    });
    describe('@deactivate', function() {
      it('removes the tool bar view', function() {
        atom.packages.deactivatePackage('tool-bar');
        return expect(workspaceElement.querySelector('.tool-bar')).toBeNull();
      });
      return it('notifies on destroy', function() {
        var spy;
        toolBarAPI = toolBarService('specs-tool-bar');
        toolBarAPI.onDidDestroy(spy = jasmine.createSpy());
        atom.packages.deactivatePackage('tool-bar');
        return expect(spy).toHaveBeenCalled();
      });
    });
    describe('provides a service API', function() {
      it('for others to use', function() {
        expect(toolBarService).toBeDefined();
        return expect(typeof toolBarService).toBe('function');
      });
      describe('which can add a button', function() {
        var toolBar;
        toolBar = [][0];
        beforeEach(function() {
          toolBarAPI = toolBarService('specs-tool-bar');
          return toolBar = workspaceElement.querySelector('.tool-bar');
        });
        it('by third-party packages', function() {
          expect(toolBarAPI).toBeDefined();
          return expect(toolBarAPI.group).toBe('specs-tool-bar');
        });
        it('with minimum settings', function() {
          toolBarAPI.addButton({
            icon: 'octoface',
            callback: 'application:about'
          });
          expect(toolBar.children.length).toBe(1);
          return expect(toolBar.firstChild.classList.contains('icon-octoface')).toBe(true);
        });
        it('with tooltip', function() {
          toolBarAPI.addButton({
            icon: 'octoface',
            callback: 'application:about',
            tooltip: 'About Atom'
          });
          expect(toolBar.children.length).toBe(1);
          return expect(toolBar.firstChild.dataset.originalTitle).toBe('About Atom');
        });
        it('using default iconset', function() {
          jasmine.attachToDOM(toolBar);
          toolBarAPI.addButton({
            icon: 'octoface',
            callback: 'application:about'
          });
          expect(toolBar.firstChild.classList.contains('icon-octoface')).toBe(true);
          return expect(getGlyph(toolBar.firstChild)).toBe('f008');
        });
        it('using Ionicons iconset', function() {
          jasmine.attachToDOM(toolBar);
          toolBarAPI.addButton({
            icon: 'ionic',
            callback: 'application:about',
            iconset: 'ion'
          });
          expect(toolBar.firstChild.classList.contains('ion')).toBe(true);
          expect(toolBar.firstChild.classList.contains('ion-ionic')).toBe(true);
          return expect(getGlyph(toolBar.firstChild)).toBe('f14b');
        });
        it('using Font Awesome iconset', function() {
          jasmine.attachToDOM(toolBar);
          toolBarAPI.addButton({
            icon: 'fort-awesome',
            callback: 'application:about',
            iconset: 'fa'
          });
          expect(toolBar.firstChild.classList.contains('fa')).toBe(true);
          expect(toolBar.firstChild.classList.contains('fa-fort-awesome')).toBe(true);
          return expect(getGlyph(toolBar.firstChild)).toBe('f286');
        });
        it('using Foundation iconset', function() {
          jasmine.attachToDOM(toolBar);
          toolBarAPI.addButton({
            icon: 'foundation',
            callback: 'application:about',
            iconset: 'fi'
          });
          expect(toolBar.firstChild.classList.contains('fi')).toBe(true);
          expect(toolBar.firstChild.classList.contains('fi-foundation')).toBe(true);
          return expect(getGlyph(toolBar.firstChild)).toBe('f152');
        });
        it('using Icomoon iconset', function() {
          jasmine.attachToDOM(toolBar);
          toolBarAPI.addButton({
            icon: 'IcoMoon',
            callback: 'application:about',
            iconset: 'icomoon'
          });
          expect(toolBar.firstChild.classList.contains('icomoon')).toBe(true);
          expect(toolBar.firstChild.classList.contains('icomoon-IcoMoon')).toBe(true);
          return expect(getGlyph(toolBar.firstChild)).toBe('eaea');
        });
        it('using Devicon iconset', function() {
          jasmine.attachToDOM(toolBar);
          toolBarAPI.addButton({
            icon: 'atom-original',
            callback: 'application:about',
            iconset: 'devicon'
          });
          expect(toolBar.firstChild.classList.contains('devicon')).toBe(true);
          expect(toolBar.firstChild.classList.contains('devicon-atom-original')).toBe(true);
          return expect(getGlyph(toolBar.firstChild)).toBe('e624');
        });
        it('using Material Design Icons iconset', function() {
          jasmine.attachToDOM(toolBar);
          toolBarAPI.addButton({
            icon: 'material-ui',
            callback: 'application:about',
            iconset: 'mdi'
          });
          expect(toolBar.firstChild.classList.contains('mdi')).toBe(true);
          expect(toolBar.firstChild.classList.contains('mdi-material-ui')).toBe(true);
          return expect(getGlyph(toolBar.firstChild)).toBe('f449');
        });
        it('and disabling it', function() {
          var button;
          button = toolBarAPI.addButton({
            icon: 'octoface',
            callback: 'application:about'
          });
          button.setEnabled(false);
          expect(toolBar.children.length).toBe(1);
          return expect(toolBar.firstChild.classList.contains('disabled')).toBe(true);
        });
        it('clicking button with command callback', function() {
          var button, spy;
          button = toolBarAPI.addButton({
            icon: 'octoface',
            callback: 'application:about'
          });
          jasmine.attachToDOM(toolBar);
          atom.commands.onWillDispatch(spy = jasmine.createSpy());
          toolBar.firstChild.click();
          expect(spy).toHaveBeenCalled();
          return expect(spy.mostRecentCall.args[0].type).toEqual('application:about');
        });
        it('clicking button with function callback', function() {
          var button, spy;
          button = toolBarAPI.addButton({
            icon: 'octoface',
            callback: spy = jasmine.createSpy()
          });
          jasmine.attachToDOM(toolBar);
          toolBar.firstChild.click();
          return expect(spy).toHaveBeenCalled();
        });
        it('clicking button with function callback containing data', function() {
          var button, spy;
          button = toolBarAPI.addButton({
            icon: 'octoface',
            callback: spy = jasmine.createSpy(),
            data: 'foo'
          });
          toolBar.firstChild.click();
          expect(spy).toHaveBeenCalled();
          return expect(spy.mostRecentCall.args[0]).toEqual('foo');
        });
        it('and restores focus after click', function() {
          var previouslyFocusedElement;
          toolBarAPI.addButton({
            icon: 'octoface',
            callback: 'editor:select-line',
            tooltip: 'Select line'
          });
          previouslyFocusedElement = document.activeElement;
          toolBar.firstChild.dispatchEvent(new Event('mouseover'));
          toolBar.firstChild.focus();
          toolBar.firstChild.click();
          return expect(document.activeElement).toBe(previouslyFocusedElement);
        });
        return describe('by clicking', function() {
          return describe('with modifiers', function() {
            describe('and command callback', function() {
              var spy;
              spy = null;
              beforeEach(function() {
                return toolBarAPI.addButton({
                  icon: 'octoface',
                  callback: {
                    '': 'tool-bar:modifier-default',
                    'alt': 'tool-bar:modifier-alt',
                    'ctrl': 'tool-bar:modifier-ctrl',
                    'shift': 'tool-bar:modifier-shift',
                    'shift+alt': 'tool-bar:modifier-shift-alt',
                    'alt+shift': 'tool-bar:modifier-alt-shift',
                    'ctrl+shift': 'tool-bar:modifier-ctrl-shift',
                    'alt ctrl-shift': 'tool-bar:modifier-alt-ctrl-shift'
                  }
                }, jasmine.attachToDOM(toolBar), atom.commands.onWillDispatch(spy = jasmine.createSpy()));
              });
              it('works without modifiers', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent());
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-default');
              });
              it('works with alt key', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  altKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-alt');
              });
              it('works with ctrl key', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  ctrlKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-ctrl');
              });
              it('works with shift key', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  shiftKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-shift');
              });
              it('works with alt & shift key', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  altKey: true,
                  shiftKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-alt-shift');
              });
              it('works with ctrl & shift key', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  ctrlKey: true,
                  shiftKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-ctrl-shift');
              });
              it('works with alt & ctrl & shift key', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  altKey: true,
                  ctrlKey: true,
                  shiftKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-alt-ctrl-shift');
              });
              it('works when modifier callback isn\'t defined', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  altKey: true,
                  ctrlKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-default');
              });
              it('works with last defined modifiers when there are duplicates', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  altKey: true,
                  shiftKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-alt-shift');
              });
              return it('works with any seperator between modifiers', function() {
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  altKey: true,
                  ctrlKey: true,
                  shiftKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0].type).toEqual('tool-bar:modifier-alt-ctrl-shift');
              });
            });
            return describe('and function callback', function() {
              it('executes', function() {
                var button, spy;
                button = toolBarAPI.addButton({
                  icon: 'octoface',
                  callback: {
                    '': 'tool-bar:modifier-default',
                    'alt': spy = jasmine.createSpy()
                  }
                });
                jasmine.attachToDOM(toolBar);
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  altKey: true
                }));
                return expect(spy).toHaveBeenCalled();
              });
              return it('executes with data', function() {
                var button, spy;
                button = toolBarAPI.addButton({
                  icon: 'octoface',
                  callback: {
                    '': 'tool-bar:modifier-default',
                    'alt': spy = jasmine.createSpy()
                  },
                  data: 'foo'
                });
                toolBar.firstChild.dispatchEvent(buildClickEvent({
                  altKey: true
                }));
                expect(spy).toHaveBeenCalled();
                return expect(spy.mostRecentCall.args[0]).toEqual('foo');
              });
            });
          });
        });
      });
      return describe('which can add a spacer', function() {
        var toolBar;
        toolBar = [][0];
        beforeEach(function() {
          toolBarAPI = toolBarService('specs-tool-bar');
          return toolBar = workspaceElement.querySelector('.tool-bar');
        });
        return it('with no settings', function() {
          toolBarAPI.addSpacer();
          expect(toolBar.children.length).toBe(1);
          return expect(toolBar.firstChild.nodeName).toBe('HR');
        });
      });
    });
    describe('when tool-bar:toggle is triggered', function() {
      return it('hides or shows the tool bar', function() {
        atom.commands.dispatch(workspaceElement, 'tool-bar:toggle');
        expect(workspaceElement.querySelector('.tool-bar')).toBeNull();
        atom.commands.dispatch(workspaceElement, 'tool-bar:toggle');
        return expect(workspaceElement.querySelectorAll('.tool-bar').length).toBe(1);
      });
    });
    return describe('when tool-bar position is changed', function() {
      var bottomPanelElement, leftPanelElement, rightPanelElement, topPanelElement, _ref1;
      _ref1 = [], topPanelElement = _ref1[0], rightPanelElement = _ref1[1], bottomPanelElement = _ref1[2], leftPanelElement = _ref1[3];
      beforeEach(function() {
        topPanelElement = atom.views.getView(atom.workspace.panelContainers.top);
        rightPanelElement = atom.views.getView(atom.workspace.panelContainers.right);
        bottomPanelElement = atom.views.getView(atom.workspace.panelContainers.bottom);
        return leftPanelElement = atom.views.getView(atom.workspace.panelContainers.left);
      });
      describe('by triggering tool-bar:position-top', function() {
        return it('the tool bar view is added to top pane', function() {
          atom.commands.dispatch(workspaceElement, 'tool-bar:position-top');
          expect(topPanelElement.querySelectorAll('.tool-bar').length).toBe(1);
          expect(rightPanelElement.querySelector('.tool-bar')).toBeNull();
          expect(bottomPanelElement.querySelector('.tool-bar')).toBeNull();
          return expect(leftPanelElement.querySelector('.tool-bar')).toBeNull();
        });
      });
      describe('by triggering tool-bar:position-right', function() {
        return it('the tool bar view is added to right pane', function() {
          atom.commands.dispatch(workspaceElement, 'tool-bar:position-right');
          expect(topPanelElement.querySelector('.tool-bar')).toBeNull();
          expect(rightPanelElement.querySelectorAll('.tool-bar').length).toBe(1);
          expect(bottomPanelElement.querySelector('.tool-bar')).toBeNull();
          return expect(leftPanelElement.querySelector('.tool-bar')).toBeNull();
        });
      });
      describe('by triggering tool-bar:position-bottom', function() {
        return it('the tool bar view is added to bottom pane', function() {
          atom.commands.dispatch(workspaceElement, 'tool-bar:position-bottom');
          expect(topPanelElement.querySelector('.tool-bar')).toBeNull();
          expect(rightPanelElement.querySelector('.tool-bar')).toBeNull();
          expect(bottomPanelElement.querySelectorAll('.tool-bar').length).toBe(1);
          return expect(leftPanelElement.querySelector('.tool-bar')).toBeNull();
        });
      });
      return describe('by triggering tool-bar:position-left', function() {
        return it('the tool bar view is added to left pane', function() {
          atom.commands.dispatch(workspaceElement, 'tool-bar:position-left');
          expect(topPanelElement.querySelector('.tool-bar')).toBeNull();
          expect(rightPanelElement.querySelector('.tool-bar')).toBeNull();
          expect(bottomPanelElement.querySelector('.tool-bar')).toBeNull();
          return expect(leftPanelElement.querySelectorAll('.tool-bar').length).toBe(1);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90b29sLWJhci9zcGVjL3Rvb2wtYmFyLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsUUFBQSw2RUFBQTtBQUFBLElBQUEsT0FBaUQsRUFBakQsRUFBQywwQkFBRCxFQUFtQix3QkFBbkIsRUFBbUMsb0JBQW5DLENBQUE7QUFBQSxJQUNBLFFBQUEsR0FBVyxTQUFDLEdBQUQsR0FBQTthQUNULE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixHQUF4QixFQUE2QixTQUE3QixDQUNFLENBQUMsZ0JBREgsQ0FDb0IsU0FEcEIsQ0FFRSxDQUFDLFVBRkgsQ0FFYyxDQUZkLENBR0UsQ0FBQyxRQUhILENBR1ksRUFIWixDQUlFLENBQUMsV0FKSCxDQUFBLEVBRFM7SUFBQSxDQURYLENBQUE7QUFBQSxJQU9BLGVBQUEsR0FBa0IsU0FBQyxJQUFELEdBQUE7QUFDaEIsVUFBQSx1Q0FBQTtBQUFBLDZCQURpQixPQUE0QixJQUEzQixlQUFBLFFBQVEsZ0JBQUEsU0FBUyxpQkFBQSxRQUNuQyxDQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVksSUFBQSxVQUFBLENBQVcsT0FBWCxDQUFaLENBQUE7QUFDQSxNQUFBLElBQTBELGNBQTFEO0FBQUEsUUFBQSxNQUFNLENBQUMsY0FBUCxDQUFzQixLQUF0QixFQUE2QixRQUE3QixFQUF1QztBQUFBLFVBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTttQkFBRyxPQUFIO1VBQUEsQ0FBTDtTQUF2QyxDQUFBLENBQUE7T0FEQTtBQUVBLE1BQUEsSUFBNEQsZUFBNUQ7QUFBQSxRQUFBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLFNBQTdCLEVBQXdDO0FBQUEsVUFBQSxHQUFB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

//# sourceURL=/Users/Rad/.atom/packages/tool-bar/spec/tool-bar-spec.coffee
