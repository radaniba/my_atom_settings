(function() {
  module.exports = {
    AppleScript: {
      'Selection Based': {
        command: 'osascript',
        args: function(code) {
          return ['-e', code];
        }
      },
      'File Based': {
        command: 'osascript',
        args: function(filename) {
          return [filename];
        }
      }
    },
    'Behat Feature': {
      "File Based": {
        command: "behat",
        args: function(filename) {
          return ['--ansi', filename];
        }
      }
    },
    CoffeeScript: {
      "Selection Based": {
        command: "coffee",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "coffee",
        args: function(filename) {
          return [filename];
        }
      }
    },
    'CoffeeScript (Literate)': {
      "Selection Based": {
        command: "coffee",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "coffee",
        args: function(filename) {
          return [filename];
        }
      }
    },
    Elixir: {
      "Selection Based": {
        command: "elixir",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "elixir",
        args: function(filename) {
          return ['-r', filename];
        }
      }
    },
    Erlang: {
      "Selection Based": {
        command: "erl",
        args: function(code) {
          return ['-noshell', '-eval', code + ', init:stop().'];
        }
      }
    },
    'F#': {
      "File Based": {
        command: "fsharpi",
        args: function(filename) {
          return ['--exec', filename];
        }
      }
    },
    Gherkin: {
      "File Based": {
        command: "cucumber",
        args: function(filename) {
          return ['--color', filename];
        }
      }
    },
    Go: {
      "File Based": {
        command: "go",
        args: function(filename) {
          return ['run', filename];
        }
      }
    },
    Groovy: {
      "Selection Based": {
        command: "groovy",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "groovy",
        args: function(filename) {
          return [filename];
        }
      }
    },
    Haskell: {
      "File Based": {
        command: "runhaskell",
        args: function(filename) {
          return [filename];
        }
      },
      "Selection Based": {
        command: "ghc",
        args: function(code) {
          return ['-e', code];
        }
      }
    },
    IcedCoffeeScript: {
      "Selection Based": {
        command: "iced",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "iced",
        args: function(filename) {
          return [filename];
        }
      }
    },
    JavaScript: {
      "Selection Based": {
        command: "node",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "node",
        args: function(filename) {
          return [filename];
        }
      }
    },
    Julia: {
      "Selection Based": {
        command: "julia",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "julia",
        args: function(filename) {
          return [filename];
        }
      }
    },
    Lua: {
      "Selection Based": {
        command: "lua",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "lua",
        args: function(filename) {
          return [filename];
        }
      }
    },
    newLISP: {
      "Selection Based": {
        command: "newlisp",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "newlisp",
        args: function(filename) {
          return [filename];
        }
      }
    },
    PHP: {
      "Selection Based": {
        command: "php",
        args: function(code) {
          return ['-r', code];
        }
      },
      "File Based": {
        command: "php",
        args: function(filename) {
          return [filename];
        }
      }
    },
    Perl: {
      "Selection Based": {
        command: "perl",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "perl",
        args: function(filename) {
          return [filename];
        }
      }
    },
    Python: {
      "Selection Based": {
        command: "/Users/Rad/anaconda/bin/python",
        args: function(code) {
          return ['-c', code];
        }
      },
      "File Based": {
        command: "/Users/Rad/anaconda/bin/python",
        args: function(filename) {
          return [filename];
        }
      }
    },
    R: {
      "File Based": {
        command: "Rscript",
        args: function(filename) {
          return [filename];
        }
      }
    },
    RSpec: {
      "Selection Based": {
        command: "ruby",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "rspec",
        args: function(filename) {
          return ['--tty', '--color', filename];
        }
      }
    },
    Ruby: {
      "Selection Based": {
        command: "ruby",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "ruby",
        args: function(filename) {
          return [filename];
        }
      }
    },
    'Shell Script (Bash)': {
      "Selection Based": {
        command: "bash",
        args: function(code) {
          return ['-c', code];
        }
      },
      "File Based": {
        command: "bash",
        args: function(filename) {
          return [filename];
        }
      }
    },
    Scala: {
      "Selection Based": {
        command: "scala",
        args: function(code) {
          return ['-e', code];
        }
      },
      "File Based": {
        command: "scala",
        args: function(filename) {
          return [filename];
        }
      }
    },
    Scheme: {
      "Selection Based": {
        command: "guile",
        args: function(code) {
          return ['-c', code];
        }
      },
      "File Based": {
        command: "guile",
        args: function(filename) {
          return [filename];
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR0E7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFdBQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLFdBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLElBQUQsR0FBQTtpQkFBVyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQVg7UUFBQSxDQUROO09BREY7QUFBQSxNQUdBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLFdBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLFFBQUQsRUFBZDtRQUFBLENBRE47T0FKRjtLQURGO0FBQUEsSUFRQSxlQUFBLEVBQ0U7QUFBQSxNQUFBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLE9BQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLFFBQUQsRUFBVyxRQUFYLEVBQWQ7UUFBQSxDQUROO09BREY7S0FURjtBQUFBLElBYUEsWUFBQSxFQUNFO0FBQUEsTUFBQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsUUFBVDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBQUMsSUFBRCxHQUFBO2lCQUFXLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBWDtRQUFBLENBRE47T0FERjtBQUFBLE1BR0EsWUFBQSxFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsUUFBVDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBQUMsUUFBRCxHQUFBO2lCQUFjLENBQUMsUUFBRCxFQUFkO1FBQUEsQ0FETjtPQUpGO0tBZEY7QUFBQSxJQXFCQSx5QkFBQSxFQUNFO0FBQUEsTUFBQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsUUFBVDtB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TjtPQURGO0FBQUEsTUFHQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxNQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxRQUFELEdBQUE7aUJBQWMsQ0FBQyxRQUFELEVBQWQ7UUFBQSxDQUROO09BSkY7S0ExRUY7QUFBQSxJQWlGQSxVQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxNQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFELEdBQUE7aUJBQVcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFYO1FBQUEsQ0FETjtPQURGO0FBQUEsTUFHQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxNQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxRQUFELEdBQUE7aUJBQWMsQ0FBQyxRQUFELEVBQWQ7UUFBQSxDQUROO09BSkY7S0FsRkY7QUFBQSxJQXlGQSxLQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxPQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFELEdBQUE7aUJBQVcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFYO1FBQUEsQ0FETjtPQURGO0FBQUEsTUFHQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxPQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxRQUFELEdBQUE7aUJBQWMsQ0FBQyxRQUFELEVBQWQ7UUFBQSxDQUROO09BSkY7S0ExRkY7QUFBQSxJQWlHQSxHQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxLQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFELEdBQUE7aUJBQVcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFYO1FBQUEsQ0FETjtPQURGO0FBQUEsTUFHQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxLQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxRQUFELEdBQUE7aUJBQWMsQ0FBQyxRQUFELEVBQWQ7UUFBQSxDQUROO09BSkY7S0FsR0Y7QUFBQSxJQXlHQSxPQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxTQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFELEdBQUE7aUJBQVUsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFWO1FBQUEsQ0FETjtPQURGO0FBQUEsTUFHQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxTQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxRQUFELEdBQUE7aUJBQWMsQ0FBQyxRQUFELEVBQWQ7UUFBQSxDQUROO09BSkY7S0ExR0Y7QUFBQSxJQWlIQSxHQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxLQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFELEdBQUE7aUJBQVcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFYO1FBQUEsQ0FETjtPQURGO0FBQUEsTUFHQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxLQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxRQUFELEdBQUE7aUJBQWMsQ0FBQyxRQUFELEVBQWQ7UUFBQSxDQUROO09BSkY7S0FsSEY7QUFBQSxJQXlIQSxJQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxNQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFELEdBQUE7aUJBQVcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFYO1FBQUEsQ0FETjtPQURGO0FBQUEsTUFHQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxNQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxRQUFELEdBQUE7aUJBQWMsQ0FBQyxRQUFELEVBQWQ7UUFBQSxDQUROO09BSkY7S0ExSEY7QUFBQSxJQWlJQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFB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
//# sourceURL=/Users/Rad/.atom/packages/script/lib/grammars.coffee