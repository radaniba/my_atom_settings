(function() {
  module.exports = {
    deactivate: function() {
      var _ref;
      return (_ref = this.toolBar) != null ? _ref.removeItems() : void 0;
    },
    consumeToolBar: function(toolBar) {
      this.toolBar = toolBar('tool-bar-atom');
      this.toolBar.addButton({
        icon: 'document-text',
        callback: 'application:open-file',
        tooltip: 'Open File',
        iconset: 'ion'
      });
      this.toolBar.addButton({
        'icon': 'folder',
        'callback': 'application:open-folder',
        'tooltip': 'Open Folder',
        'iconset': 'ion'
      });
      this.toolBar.addButton({
        'icon': 'archive',
        'callback': 'core:save',
        'tooltip': 'Save File',
        'iconset': 'ion'
      });
      if (atom.packages.loadedPackages['project-manager']) {
        this.toolBar.addButton({
          'icon': 'file-submodule',
          'tooltip': 'List projects',
          'callback': 'project-manager:list-projects'
        });
      }
      this.toolBar.addSpacer();
      this.toolBar.addButton({
        'icon': 'columns',
        'iconset': 'fa',
        'tooltip': 'Split screen - Horizontally',
        'callback': 'pane:split-right'
      });
      this.toolBar.addButton({
        'icon': 'columns fa-rotate-270',
        'iconset': 'fa',
        'tooltip': 'Split screen - Vertically',
        'callback': 'pane:split-down'
      });
      this.toolBar.addSpacer();
      this.toolBar.addButton({
        'iconset': 'fa',
        'icon': 'arrows-alt',
        'tooltip': 'Toggle Fullscreen',
        'callback': 'window:toggle-full-screen'
      });
      this.toolBar.addButton({
        'icon': 'sitemap',
        'callback': 'tree-view:toggle',
        'tooltip': 'Toggle Sidebar',
        'iconset': 'fa'
      });
      this.toolBar.addSpacer();
      this.toolBar.addButton({
        'icon': 'indent',
        'callback': 'editor:auto-indent',
        'tooltip': 'Auto indent (selection)',
        'iconset': 'fa'
      });
      this.toolBar.addButton({
        'icon': 'level-up',
        'callback': 'editor:fold-all',
        'tooltip': 'Fold all',
        'iconset': 'fa'
      });
      this.toolBar.addButton({
        'icon': 'level-down',
        'callback': 'editor:unfold-all',
        'tooltip': 'Unfold all',
        'iconset': 'fa'
      });
      if (atom.packages.loadedPackages['term3']) {
        this.toolBar.addSpacer();
        this.toolBar.addButton({
          'icon': 'terminal',
          'callback': 'term3:open-split-down',
          'tooltip': 'Term3 Split Down'
        });
      } else if (atom.packages.loadedPackages['term2']) {
        this.toolBar.addSpacer();
        this.toolBar.addButton({
          'icon': 'terminal',
          'callback': 'term2:open-split-down',
          'tooltip': 'Term2 Split Down'
        });
      }
      if (atom.inDevMode()) {
        this.toolBar.addSpacer();
        this.toolBar.addButton({
          'icon': 'refresh',
          'callback': 'window:reload',
          'tooltip': 'Reload Window',
          'iconset': 'ion'
        });
        this.toolBar.addButton({
          'icon': 'bug',
          'callback': 'window:toggle-dev-tools',
          'tooltip': 'Toggle Developer Tools'
        });
      }
      this.toolBar.addSpacer();
      if (atom.packages.loadedPackages['git-plus']) {
        this.toolBar.addButton({
          'icon': 'git-plain',
          'callback': 'git-plus:menu',
          'tooltip': 'Git plus',
          'iconset': 'devicon'
        });
      }
      return this.toolBar.addButton({
        'icon': 'gear-a',
        'callback': 'settings-view:open',
        'tooltip': 'Open Settings View',
        'iconset': 'ion'
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy90b29sLWJhci1hdG9tL2xpYi90b29sLWJhci1hdG9tLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxJQUFBO2lEQUFRLENBQUUsV0FBVixDQUFBLFdBRFU7SUFBQSxDQUFaO0FBQUEsSUFHQSxjQUFBLEVBQWdCLFNBQUMsT0FBRCxHQUFBO0FBQ2QsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLE9BQUEsQ0FBUSxlQUFSLENBQVgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxlQUFOO0FBQUEsUUFDQSxRQUFBLEVBQVUsdUJBRFY7QUFBQSxRQUVBLE9BQUEsRUFBUyxXQUZUO0FBQUEsUUFHQSxPQUFBLEVBQVMsS0FIVDtPQURGLENBRkEsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUSxRQUFSO0FBQUEsUUFDQSxVQUFBLEVBQVkseUJBRFo7QUFBQSxRQUVBLFNBQUEsRUFBVyxhQUZYO0FBQUEsUUFHQSxTQUFBLEVBQVcsS0FIWDtPQURGLENBUkEsQ0FBQTtBQUFBLE1BY0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQ0U7QUFBQSxRQUFBLE1BQUEsRUFBUSxTQUFSO0FBQUEsUUFDQSxVQUFBLEVBQVksV0FEWjtBQUFBLFFBRUEsU0FBQSxFQUFXLFdBRlg7QUFBQSxRQUdBLFNBQUEsRUFBVyxLQUhYO09BREYsQ0FkQSxDQUFBO0FBb0JBLE1BQUEsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWUsQ0FBQSxpQkFBQSxDQUFoQztBQUNFLFFBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQ0U7QUFBQSxVQUFBLE1BQUEsRUFBUSxnQkFBUjtBQUFBLFVBQ0EsU0FBQSxFQUFXLGVBRFg7QUFBQSxVQUVBLFVBQUEsRUFBWSwrQkFGWjtTQURGLENBQUEsQ0FERjtPQXBCQTtBQUFBLE1BMEJBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFBLENBMUJBLENBQUE7QUFBQSxNQTRCQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLFNBQVI7QUFBQSxRQUNBLFNBQUEsRUFBVyxJQURYO0FBQUEsUUFFQSxTQUFBLEVBQVcsNkJBRlg7QUFBQSxRQUdBLFVBQUEsRUFBWSxrQkFIWjtPQURGLENBNUJBLENBQUE7QUFBQSxNQWtDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLHVCQUFSO0FBQUEsUUFDQSxTQUFBLEVBQVcsSUFEWDtBQUFBLFFBRUEsU0FBQSxFQUFXLDJCQUZYO0FBQUEsUUFHQSxVQUFBLEVBQVksaUJBSFo7T0FERixDQWxDQSxDQUFBO0FBQUEsTUF3Q0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUEsQ0F4Q0EsQ0FBQTtBQUFBLE1BMENBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUNFO0FBQUEsUUFBQSxTQUFBLEVBQVcsSUFBWDtBQUFBLFFBQ0EsTUFBQSxFQUFRLFlBRFI7QUFBQSxRQUVBLFNBQUEsRUFBVyxtQkFGWDtBQUFBLFFBR0EsVUFBQSxFQUFZLDJCQUhaO09BREYsQ0ExQ0EsQ0FBQTtBQUFBLE1BZ0RBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUNFO0FBQUEsUUFBQSxNQUFBLEVBQVEsU0FBUjtBQUFBLFFBQ0EsVUFBQSxFQUFZLGtCQURaO0FBQUEsUUFFQSxTQUFBLEVBQVcsZ0JBRlg7QUFBQSxRQUdBLFNBQUEsRUFBVyxJQUhYO09BREYsQ0FoREEsQ0FBQTtBQUFBLE1Bc0RBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFBLENBdERBLENBQUE7QUFBQSxNQXdEQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLFFBQVI7QUFBQSxRQUNBLFVBQUEsRUFBWSxvQkFEWjtBQUFBLFFBRUEsU0FBQSxFQUFXLHlCQUZYO0FBQUEsUUFHQSxTQUFBLEVBQVcsSUFIWDtPQURGLENBeERBLENBQUE7QUFBQSxNQThEQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLFVBQVI7QUFBQSxRQUNBLFVBQUEsRUFBWSxpQkFEWjtBQUFBLFFBRUEsU0FBQSxFQUFXLFVBRlg7QUFBQSxRQUdBLFNBQUEsRUFBVyxJQUhYO09BREYsQ0E5REEsQ0FBQTtBQUFBLE1Bb0VBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUNFO0FBQUEsUUFBQSxNQUFBLEVBQVEsWUFBUjtBQUFBLFFBQ0EsVUFBQSxFQUFZLG1CQURaO0FBQUEsUUFFQSxTQUFBLEVBQVcsWUFGWDtBQUFBLFFBR0EsU0FBQSxFQUFXLElBSFg7T0FERixDQXBFQSxDQUFBO0FBMEVBLE1BQUEsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWUsQ0FBQSxPQUFBLENBQWhDO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUNFO0FBQUEsVUFBQSxNQUFBLEVBQVEsVUFBUjtBQUFBLFVBQ0EsVUFBQSxFQUFZLHVCQURaO0FBQUEsVUFFQSxTQUFBLEVBQVcsa0JBRlg7U0FERixDQURBLENBREY7T0FBQSxNQU1LLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFlLENBQUEsT0FBQSxDQUFoQztBQUNILFFBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLFVBQVI7QUFBQSxVQUNBLFVBQUEsRUFBWSx1QkFEWjtBQUFBLFVBRUEsU0FBQSxFQUFXLGtCQUZYO1NBREYsQ0FEQSxDQURHO09BaEZMO0FBdUZBLE1BQUEsSUFBRyxJQUFJLENBQUMsU0FBTCxDQUFBLENBQUg7QUFFRSxRQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQ0U7QUFBQSxVQUFBLE1BQUEsRUFBUSxTQUFSO0FBQUEsVUFDQSxVQUFBLEVBQVksZUFEWjtBQUFBLFVBRUEsU0FBQSxFQUFXLGVBRlg7QUFBQSxVQUdBLFNBQUEsRUFBVyxLQUhYO1NBREYsQ0FGQSxDQUFBO0FBQUEsUUFRQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLEtBQVI7QUFBQSxVQUNBLFVBQUEsRUFBWSx5QkFEWjtBQUFBLFVBRUEsU0FBQSxFQUFXLHdCQUZYO1NBREYsQ0FSQSxDQUZGO09BdkZBO0FBQUEsTUFzR0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQUEsQ0F0R0EsQ0FBQTtBQXdHQSxNQUFBLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFlLENBQUEsVUFBQSxDQUFoQztBQUNFLFFBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQ0U7QUFBQSxVQUFBLE1BQUEsRUFBUyxXQUFUO0FBQUEsVUFDQSxVQUFBLEVBQWEsZUFEYjtBQUFBLFVBRUEsU0FBQSxFQUFZLFVBRlo7QUFBQSxVQUdBLFNBQUEsRUFBWSxTQUhaO1NBREYsQ0FBQSxDQURGO09BeEdBO2FBK0dBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUNFO0FBQUEsUUFBQSxNQUFBLEVBQVEsUUFBUjtBQUFBLFFBQ0EsVUFBQSxFQUFZLG9CQURaO0FBQUEsUUFFQSxTQUFBLEVBQVcsb0JBRlg7QUFBQSxRQUdBLFNBQUEsRUFBVyxLQUhYO09BREYsRUFoSGM7SUFBQSxDQUhoQjtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/Rad/.atom/packages/tool-bar-atom/lib/tool-bar-atom.coffee
