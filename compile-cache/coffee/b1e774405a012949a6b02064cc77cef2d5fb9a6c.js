(function() {
  module.exports = {
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
        command: "python",
        args: function(code) {
          return ['-c', code];
        }
      },
      "File Based": {
        command: "python",
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
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR0E7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGVBQUEsRUFDRTtBQUFBLE1BQUEsWUFBQSxFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsT0FBVDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBQUMsUUFBRCxHQUFBO2lCQUFjLENBQUMsUUFBRCxFQUFXLFFBQVgsRUFBZDtRQUFBLENBRE47T0FERjtLQURGO0FBQUEsSUFLQSxZQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxRQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFELEdBQUE7aUJBQVcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFYO1FBQUEsQ0FETjtPQURGO0FBQUEsTUFHQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxRQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxRQUFELEdBQUE7aUJBQWMsQ0FBQyxRQUFELEVBQWQ7UUFBQSxDQUROO09BSkY7S0FORjtBQUFBLElBYUEseUJBQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLFFBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLElBQUQsR0FBQTtpQkFBVyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQVg7UUFBQSxDQUROO09BREY7QUFBQSxNQUdBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLFFBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLFFBQUQsRUFBZDtRQUFBLENBRE47T0FKRjtLQWRGO0FBQUEsSUFxQkEsTUFBQSxFQUNFO0FBQUEsTUFBQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsUUFBVDtB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O09BREY7QUFBQSxNQUdBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLE9BQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLFFBQUQsRUFBZDtRQUFBLENBRE47T0FKRjtLQTFFRjtBQUFBLElBaUZBLEdBQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLEtBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLElBQUQsR0FBQTtpQkFBVyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQVg7UUFBQSxDQUROO09BREY7QUFBQSxNQUdBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLEtBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLFFBQUQsRUFBZDtRQUFBLENBRE47T0FKRjtLQWxGRjtBQUFBLElBeUZBLE9BQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLFNBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLElBQUQsR0FBQTtpQkFBVSxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQVY7UUFBQSxDQUROO09BREY7QUFBQSxNQUdBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLFNBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLFFBQUQsRUFBZDtRQUFBLENBRE47T0FKRjtLQTFGRjtBQUFBLElBaUdBLEdBQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLEtBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLElBQUQsR0FBQTtpQkFBVyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQVg7UUFBQSxDQUROO09BREY7QUFBQSxNQUdBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLEtBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLFFBQUQsRUFBZDtRQUFBLENBRE47T0FKRjtLQWxHRjtBQUFBLElBeUdBLElBQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLE1BQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLElBQUQsR0FBQTtpQkFBVyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQVg7UUFBQSxDQUROO09BREY7QUFBQSxNQUdBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLE1BQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLFFBQUQsRUFBZDtRQUFBLENBRE47T0FKRjtLQTFHRjtBQUFBLElBaUhBLE1BQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLFFBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLElBQUQsR0FBQTtpQkFBVyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQVg7UUFBQSxDQUROO09BREY7QUFBQSxNQUdBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLFFBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLFFBQUQsRUFBZDtRQUFBLENBRE47T0FKRjtLQWxIRjtBQUFBLElBeUhBLEtBQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLE1BQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLElBQUQsR0FBQTtpQkFBVyxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQVg7UUFBQSxDQUROO09BREY7QUFBQSxNQUdBLFlBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFTLE9BQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUFDLFFBQUQsR0FBQTtpQkFBYyxDQUFDLE9BQUQsRUFBVSxTQUFWLEVBQXFCLFFBQXJCLEVBQWQ7UUFBQSxDQUROO09BSkY7S0ExSEY7QUFBQSxJQWlJQSxJQUFBLEVBQ0U7QUFBQSxNQUFBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxNQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFELEdBQUE7aUJBQVcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFYO1FBQUEsQ0FETjtPQURGO0FBQUEsTUFHQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBUyxNQUFUO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FBQyxRQUFELEdBQUE7aUJBQWMsQ0FBQyxRQUFELEVBQWQ7UUFBQSxDQUROO09BSkY7S0FsSUY7QUFBQSxJQXlJQSxxQkFBQSxFQUNFO0FBQUEsTUFBQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsTUFBVDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBQUMsSUFBRCxHQUFBO2lCQUFXLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBWDtRQUFBLENBRE47T0FERjtBQUFBLE1BR0EsWUFBQSxFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsTUFBVDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBQUMsUUFBRCxHQUFBO2lCQUFjLENBQUMsUUFBRCxFQUFkO1FBQUEsQ0FETjtPQUpGO0tBMUlGO0FBQUEsSUFpSkEsS0FBQSxFQUNFO0FBQUEsTUFBQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsT0FBVDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBQUMsSUFBRCxHQUFBO2lCQUFXLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBWDtRQUFBLENBRE47T0FERjtBQUFBLE1BR0EsWUFBQSxFQUNFO0FBQUEsUUFBQSxPQUFBLEVBQVMsT0FBVDtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBQUMsUUFBRCxHQUFBO2lCQUFjLENBQUMsUUFBRCxFQUFkO1FBQUEsQ0FETjtPQUpGO0tBbEpGO0dBREYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/Rad/.atom/packages/script/lib/grammars.coffee