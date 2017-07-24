(function() {
  var AnnotationManager, AutocompletionManager, GotoManager, StatusInProgress, TooltipManager, config, parser, plugins, proxy;

  GotoManager = require("./goto/goto-manager.coffee");

  TooltipManager = require("./tooltip/tooltip-manager.coffee");

  AnnotationManager = require("./annotation/annotation-manager.coffee");

  AutocompletionManager = require("./autocompletion/autocompletion-manager.coffee");

  StatusInProgress = require("./services/status-in-progress.coffee");

  config = require('./config.coffee');

  proxy = require('./services/php-proxy.coffee');

  parser = require('./services/php-file-parser.coffee');

  plugins = require('./services/plugin-manager.coffee');

  module.exports = {
    config: {
      binComposer: {
        title: 'Command to use composer',
        description: 'This plugin depends on composer in order to work. Specify the path to your composer bin (e.g : bin/composer, composer.phar, composer)',
        type: 'string',
        "default": '/usr/local/bin/composer',
        order: 1
      },
      binPhp: {
        title: 'Command php',
        description: 'This plugin use php CLI in order to work. Please specify your php command ("php" on UNIX systems)',
        type: 'string',
        "default": 'php',
        order: 2
      },
      autoloadPaths: {
        title: 'Autoloader file',
        description: 'Relative path to the files of autoload.php from composer (or an other one). You can specify multiple paths (comma separated) if you have different paths for some projects.',
        type: 'array',
        "default": ['vendor/autoload.php', 'autoload.php'],
        order: 3
      },
      classMapFiles: {
        title: 'Classmap files',
        description: 'Relative path to the files that contains a classmap (array with "className" => "fileName"). By default on composer it\'s vendor/composer/autoload_classmap.php',
        type: 'array',
        "default": ['vendor/composer/autoload_classmap.php', 'autoload/ezp_kernel.php'],
        order: 4
      },
      insertNewlinesForUseStatements: {
        title: 'Insert newlines for use statements.',
        description: 'When enabled, the plugin will add additional newlines before or after an automatically added use statement when it can\'t add them nicely to an existing group. This results in more cleanly separated use statements but will create additional vertical whitespace.',
        type: 'boolean',
        "default": false,
        order: 5
      },
      verboseErrors: {
        title: 'Errors on file saving showed',
        description: 'When enabled, you\'ll have a notification once an error occured on autocomplete. Otherwise, the message will just be logged in developer console',
        type: 'boolean',
        "default": false,
        order: 6
      }
    },
    activate: function() {
      config.testConfig();
      config.init();
      this.autocompletionManager = new AutocompletionManager();
      this.autocompletionManager.init();
      this.gotoManager = new GotoManager();
      this.gotoManager.init();
      this.tooltipManager = new TooltipManager();
      this.tooltipManager.init();
      this.annotationManager = new AnnotationManager();
      this.annotationManager.init();
      return proxy.init();
    },
    deactivate: function() {
      this.gotoManager.deactivate();
      this.tooltipManager.deactivate();
      this.annotationManager.deactivate();
      return this.autocompletionManager.deactivate();
    },
    consumeStatusBar: function(statusBar) {
      config.statusInProgress.initialize(statusBar);
      config.statusInProgress.attach();
      config.statusErrorAutocomplete.initialize(statusBar);
      return config.statusErrorAutocomplete.attach();
    },
    consumePlugin: function(plugin) {
      return plugins.plugins.push(plugin);
    },
    provideAutocompleteTools: function() {
      this.services = {
        proxy: proxy,
        parser: parser
      };
      return this.services;
    },
    getProvider: function() {
      return this.autocompletionManager.getProviders();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9hdG9tLWF1dG9jb21wbGV0ZS1waHAvbGliL3BlZWttby1waHAtYXRvbS1hdXRvY29tcGxldGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLDRCQUFSOztFQUNkLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGtDQUFSOztFQUNqQixpQkFBQSxHQUFvQixPQUFBLENBQVEsd0NBQVI7O0VBQ3BCLHFCQUFBLEdBQXdCLE9BQUEsQ0FBUSxnREFBUjs7RUFDeEIsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNDQUFSOztFQUNuQixNQUFBLEdBQVMsT0FBQSxDQUFRLGlCQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsNkJBQVI7O0VBQ1IsTUFBQSxHQUFTLE9BQUEsQ0FBUSxtQ0FBUjs7RUFDVCxPQUFBLEdBQVUsT0FBQSxDQUFRLGtDQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7TUFBQSxXQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8seUJBQVA7UUFDQSxXQUFBLEVBQWEsdUlBRGI7UUFHQSxJQUFBLEVBQU0sUUFITjtRQUlBLENBQUEsT0FBQSxDQUFBLEVBQVMseUJBSlQ7UUFLQSxLQUFBLEVBQU8sQ0FMUDtPQURKO01BUUEsTUFBQSxFQUNJO1FBQUEsS0FBQSxFQUFPLGFBQVA7UUFDQSxXQUFBLEVBQWEsbUdBRGI7UUFHQSxJQUFBLEVBQU0sUUFITjtRQUlBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FKVDtRQUtBLEtBQUEsRUFBTyxDQUxQO09BVEo7TUFnQkEsYUFBQSxFQUNJO1FBQUEsS0FBQSxFQUFPLGlCQUFQO1FBQ0EsV0FBQSxFQUFhLDZLQURiO1FBR0EsSUFBQSxFQUFNLE9BSE47UUFJQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQUMscUJBQUQsRUFBd0IsY0FBeEIsQ0FKVDtRQUtBLEtBQUEsRUFBTyxDQUxQO09BakJKO01Bd0JBLGFBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTyxnQkFBUDtRQUNBLFdBQUEsRUFBYSxnS0FEYjtRQUdBLElBQUEsRUFBTSxPQUhOO1FBSUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLHVDQUFELEVBQTBDLHlCQUExQyxDQUpUO1FBS0EsS0FBQSxFQUFPLENBTFA7T0F6Qko7TUFnQ0EsOEJBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTyxxQ0FBUDtRQUNBLFdBQUEsRUFBYSx1UUFEYjtRQUlBLElBQUEsRUFBTSxTQUpOO1FBS0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUxUO1FBTUEsS0FBQSxFQUFPLENBTlA7T0FqQ0o7TUF5Q0EsYUFBQSxFQUNJO1FBQUEsS0FBQSxFQUFPLDhCQUFQO1FBQ0EsV0FBQSxFQUFhLGtKQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7UUFJQSxLQUFBLEVBQU8sQ0FKUDtPQTFDSjtLQURKO0lBaURBLFFBQUEsRUFBVSxTQUFBO01BQ04sTUFBTSxDQUFDLFVBQVAsQ0FBQTtNQUNBLE1BQU0sQ0FBQyxJQUFQLENBQUE7TUFFQSxJQUFDLENBQUEscUJBQUQsR0FBNkIsSUFBQSxxQkFBQSxDQUFBO01BQzdCLElBQUMsQ0FBQSxxQkFBcUIsQ0FBQyxJQUF2QixDQUFBO01BRUEsSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxXQUFBLENBQUE7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQUE7TUFFQSxJQUFDLENBQUEsY0FBRCxHQUFzQixJQUFBLGNBQUEsQ0FBQTtNQUN0QixJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQUE7TUFFQSxJQUFDLENBQUEsaUJBQUQsR0FBeUIsSUFBQSxpQkFBQSxDQUFBO01BQ3pCLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUFBO2FBRUEsS0FBSyxDQUFDLElBQU4sQ0FBQTtJQWhCTSxDQWpEVjtJQW1FQSxVQUFBLEVBQVksU0FBQTtNQUNSLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBYixDQUFBO01BQ0EsSUFBQyxDQUFBLGNBQWMsQ0FBQyxVQUFoQixDQUFBO01BQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLFVBQW5CLENBQUE7YUFDQSxJQUFDLENBQUEscUJBQXFCLENBQUMsVUFBdkIsQ0FBQTtJQUpRLENBbkVaO0lBeUVBLGdCQUFBLEVBQWtCLFNBQUMsU0FBRDtNQUNkLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUF4QixDQUFtQyxTQUFuQztNQUNBLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUF4QixDQUFBO01BRUEsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFVBQS9CLENBQTBDLFNBQTFDO2FBQ0EsTUFBTSxDQUFDLHVCQUF1QixDQUFDLE1BQS9CLENBQUE7SUFMYyxDQXpFbEI7SUFnRkEsYUFBQSxFQUFlLFNBQUMsTUFBRDthQUNYLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBaEIsQ0FBcUIsTUFBckI7SUFEVyxDQWhGZjtJQW1GQSx3QkFBQSxFQUEwQixTQUFBO01BQ3RCLElBQUMsQ0FBQSxRQUFELEdBQ0k7UUFBQSxLQUFBLEVBQU8sS0FBUDtRQUNBLE1BQUEsRUFBUSxNQURSOztBQUdKLGFBQU8sSUFBQyxDQUFBO0lBTGMsQ0FuRjFCO0lBMEZBLFdBQUEsRUFBYSxTQUFBO0FBQ1QsYUFBTyxJQUFDLENBQUEscUJBQXFCLENBQUMsWUFBdkIsQ0FBQTtJQURFLENBMUZiOztBQVhKIiwic291cmNlc0NvbnRlbnQiOlsiR290b01hbmFnZXIgPSByZXF1aXJlIFwiLi9nb3RvL2dvdG8tbWFuYWdlci5jb2ZmZWVcIlxuVG9vbHRpcE1hbmFnZXIgPSByZXF1aXJlIFwiLi90b29sdGlwL3Rvb2x0aXAtbWFuYWdlci5jb2ZmZWVcIlxuQW5ub3RhdGlvbk1hbmFnZXIgPSByZXF1aXJlIFwiLi9hbm5vdGF0aW9uL2Fubm90YXRpb24tbWFuYWdlci5jb2ZmZWVcIlxuQXV0b2NvbXBsZXRpb25NYW5hZ2VyID0gcmVxdWlyZSBcIi4vYXV0b2NvbXBsZXRpb24vYXV0b2NvbXBsZXRpb24tbWFuYWdlci5jb2ZmZWVcIlxuU3RhdHVzSW5Qcm9ncmVzcyA9IHJlcXVpcmUgXCIuL3NlcnZpY2VzL3N0YXR1cy1pbi1wcm9ncmVzcy5jb2ZmZWVcIlxuY29uZmlnID0gcmVxdWlyZSAnLi9jb25maWcuY29mZmVlJ1xucHJveHkgPSByZXF1aXJlICcuL3NlcnZpY2VzL3BocC1wcm94eS5jb2ZmZWUnXG5wYXJzZXIgPSByZXF1aXJlICcuL3NlcnZpY2VzL3BocC1maWxlLXBhcnNlci5jb2ZmZWUnXG5wbHVnaW5zID0gcmVxdWlyZSAnLi9zZXJ2aWNlcy9wbHVnaW4tbWFuYWdlci5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBjb25maWc6XG4gICAgICAgIGJpbkNvbXBvc2VyOlxuICAgICAgICAgICAgdGl0bGU6ICdDb21tYW5kIHRvIHVzZSBjb21wb3NlcidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhpcyBwbHVnaW4gZGVwZW5kcyBvbiBjb21wb3NlciBpbiBvcmRlciB0byB3b3JrLiBTcGVjaWZ5IHRoZSBwYXRoXG4gICAgICAgICAgICAgdG8geW91ciBjb21wb3NlciBiaW4gKGUuZyA6IGJpbi9jb21wb3NlciwgY29tcG9zZXIucGhhciwgY29tcG9zZXIpJ1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcvdXNyL2xvY2FsL2Jpbi9jb21wb3NlcidcbiAgICAgICAgICAgIG9yZGVyOiAxXG5cbiAgICAgICAgYmluUGhwOlxuICAgICAgICAgICAgdGl0bGU6ICdDb21tYW5kIHBocCdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhpcyBwbHVnaW4gdXNlIHBocCBDTEkgaW4gb3JkZXIgdG8gd29yay4gUGxlYXNlIHNwZWNpZnkgeW91ciBwaHBcbiAgICAgICAgICAgICBjb21tYW5kIChcInBocFwiIG9uIFVOSVggc3lzdGVtcyknXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgZGVmYXVsdDogJ3BocCdcbiAgICAgICAgICAgIG9yZGVyOiAyXG5cbiAgICAgICAgYXV0b2xvYWRQYXRoczpcbiAgICAgICAgICAgIHRpdGxlOiAnQXV0b2xvYWRlciBmaWxlJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZWxhdGl2ZSBwYXRoIHRvIHRoZSBmaWxlcyBvZiBhdXRvbG9hZC5waHAgZnJvbSBjb21wb3NlciAob3IgYW4gb3RoZXIgb25lKS4gWW91IGNhbiBzcGVjaWZ5IG11bHRpcGxlXG4gICAgICAgICAgICAgcGF0aHMgKGNvbW1hIHNlcGFyYXRlZCkgaWYgeW91IGhhdmUgZGlmZmVyZW50IHBhdGhzIGZvciBzb21lIHByb2plY3RzLidcbiAgICAgICAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgICAgICAgIGRlZmF1bHQ6IFsndmVuZG9yL2F1dG9sb2FkLnBocCcsICdhdXRvbG9hZC5waHAnXVxuICAgICAgICAgICAgb3JkZXI6IDNcblxuICAgICAgICBjbGFzc01hcEZpbGVzOlxuICAgICAgICAgICAgdGl0bGU6ICdDbGFzc21hcCBmaWxlcydcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVsYXRpdmUgcGF0aCB0byB0aGUgZmlsZXMgdGhhdCBjb250YWlucyBhIGNsYXNzbWFwIChhcnJheSB3aXRoIFwiY2xhc3NOYW1lXCIgPT4gXCJmaWxlTmFtZVwiKS4gQnkgZGVmYXVsdFxuICAgICAgICAgICAgIG9uIGNvbXBvc2VyIGl0XFwncyB2ZW5kb3IvY29tcG9zZXIvYXV0b2xvYWRfY2xhc3NtYXAucGhwJ1xuICAgICAgICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgICAgICAgZGVmYXVsdDogWyd2ZW5kb3IvY29tcG9zZXIvYXV0b2xvYWRfY2xhc3NtYXAucGhwJywgJ2F1dG9sb2FkL2V6cF9rZXJuZWwucGhwJ11cbiAgICAgICAgICAgIG9yZGVyOiA0XG5cbiAgICAgICAgaW5zZXJ0TmV3bGluZXNGb3JVc2VTdGF0ZW1lbnRzOlxuICAgICAgICAgICAgdGl0bGU6ICdJbnNlcnQgbmV3bGluZXMgZm9yIHVzZSBzdGF0ZW1lbnRzLidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiBlbmFibGVkLCB0aGUgcGx1Z2luIHdpbGwgYWRkIGFkZGl0aW9uYWwgbmV3bGluZXMgYmVmb3JlIG9yIGFmdGVyIGFuIGF1dG9tYXRpY2FsbHkgYWRkZWRcbiAgICAgICAgICAgICAgICB1c2Ugc3RhdGVtZW50IHdoZW4gaXQgY2FuXFwndCBhZGQgdGhlbSBuaWNlbHkgdG8gYW4gZXhpc3RpbmcgZ3JvdXAuIFRoaXMgcmVzdWx0cyBpbiBtb3JlIGNsZWFubHlcbiAgICAgICAgICAgICAgICBzZXBhcmF0ZWQgdXNlIHN0YXRlbWVudHMgYnV0IHdpbGwgY3JlYXRlIGFkZGl0aW9uYWwgdmVydGljYWwgd2hpdGVzcGFjZS4nXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICBvcmRlcjogNVxuXG4gICAgICAgIHZlcmJvc2VFcnJvcnM6XG4gICAgICAgICAgICB0aXRsZTogJ0Vycm9ycyBvbiBmaWxlIHNhdmluZyBzaG93ZWQnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1doZW4gZW5hYmxlZCwgeW91XFwnbGwgaGF2ZSBhIG5vdGlmaWNhdGlvbiBvbmNlIGFuIGVycm9yIG9jY3VyZWQgb24gYXV0b2NvbXBsZXRlLiBPdGhlcndpc2UsIHRoZSBtZXNzYWdlIHdpbGwganVzdCBiZSBsb2dnZWQgaW4gZGV2ZWxvcGVyIGNvbnNvbGUnXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICBvcmRlcjogNlxuXG4gICAgYWN0aXZhdGU6IC0+XG4gICAgICAgIGNvbmZpZy50ZXN0Q29uZmlnKClcbiAgICAgICAgY29uZmlnLmluaXQoKVxuXG4gICAgICAgIEBhdXRvY29tcGxldGlvbk1hbmFnZXIgPSBuZXcgQXV0b2NvbXBsZXRpb25NYW5hZ2VyKClcbiAgICAgICAgQGF1dG9jb21wbGV0aW9uTWFuYWdlci5pbml0KClcblxuICAgICAgICBAZ290b01hbmFnZXIgPSBuZXcgR290b01hbmFnZXIoKVxuICAgICAgICBAZ290b01hbmFnZXIuaW5pdCgpXG5cbiAgICAgICAgQHRvb2x0aXBNYW5hZ2VyID0gbmV3IFRvb2x0aXBNYW5hZ2VyKClcbiAgICAgICAgQHRvb2x0aXBNYW5hZ2VyLmluaXQoKVxuXG4gICAgICAgIEBhbm5vdGF0aW9uTWFuYWdlciA9IG5ldyBBbm5vdGF0aW9uTWFuYWdlcigpXG4gICAgICAgIEBhbm5vdGF0aW9uTWFuYWdlci5pbml0KClcblxuICAgICAgICBwcm94eS5pbml0KClcblxuICAgIGRlYWN0aXZhdGU6IC0+XG4gICAgICAgIEBnb3RvTWFuYWdlci5kZWFjdGl2YXRlKClcbiAgICAgICAgQHRvb2x0aXBNYW5hZ2VyLmRlYWN0aXZhdGUoKVxuICAgICAgICBAYW5ub3RhdGlvbk1hbmFnZXIuZGVhY3RpdmF0ZSgpXG4gICAgICAgIEBhdXRvY29tcGxldGlvbk1hbmFnZXIuZGVhY3RpdmF0ZSgpXG5cbiAgICBjb25zdW1lU3RhdHVzQmFyOiAoc3RhdHVzQmFyKSAtPlxuICAgICAgICBjb25maWcuc3RhdHVzSW5Qcm9ncmVzcy5pbml0aWFsaXplKHN0YXR1c0JhcilcbiAgICAgICAgY29uZmlnLnN0YXR1c0luUHJvZ3Jlc3MuYXR0YWNoKClcblxuICAgICAgICBjb25maWcuc3RhdHVzRXJyb3JBdXRvY29tcGxldGUuaW5pdGlhbGl6ZShzdGF0dXNCYXIpXG4gICAgICAgIGNvbmZpZy5zdGF0dXNFcnJvckF1dG9jb21wbGV0ZS5hdHRhY2goKVxuXG4gICAgY29uc3VtZVBsdWdpbjogKHBsdWdpbikgLT5cbiAgICAgICAgcGx1Z2lucy5wbHVnaW5zLnB1c2gocGx1Z2luKVxuXG4gICAgcHJvdmlkZUF1dG9jb21wbGV0ZVRvb2xzOiAtPlxuICAgICAgICBAc2VydmljZXMgPVxuICAgICAgICAgICAgcHJveHk6IHByb3h5XG4gICAgICAgICAgICBwYXJzZXI6IHBhcnNlclxuXG4gICAgICAgIHJldHVybiBAc2VydmljZXNcblxuICAgIGdldFByb3ZpZGVyOiAtPlxuICAgICAgICByZXR1cm4gQGF1dG9jb21wbGV0aW9uTWFuYWdlci5nZXRQcm92aWRlcnMoKVxuIl19
