(function() {
  var meta;

  meta = {
    define: "https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/metaKey",
    key: (function() {
      switch (process.platform) {
        case "darwin":
          return "⌘";
        case "linux":
          return "Super";
        case "win32":
          return "❖";
      }
    })()
  };

  module.exports = {
    general: {
      order: 1,
      type: "object",
      properties: {
        gitPath: {
          order: 1,
          title: "Git Path",
          type: "string",
          "default": "git",
          description: "If git is not in your PATH, specify where the executable is"
        },
        enableStatusBarIcon: {
          order: 2,
          title: "Status-bar Pin Icon",
          type: "boolean",
          "default": true,
          description: "The pin icon in the bottom-right of the status-bar toggles the output view above the status-bar"
        },
        newBranchKey: {
          order: 3,
          title: "Status-bar New Branch modifier key",
          type: "string",
          "default": "alt",
          description: "Status-bar branch list modifier key to alternatively create a new branch if held on click. Note that _[`meta`](" + meta.define + ")_ is <kbd>" + meta.key + "</kbd>",
          "enum": ["alt", "shift", "meta", "ctrl"]
        },
        openInPane: {
          order: 4,
          title: "Allow commands to open new panes",
          type: "boolean",
          "default": true,
          description: "Commands like `Commit`, `Log`, `Show`, `Diff` can be split into new panes"
        },
        splitPane: {
          order: 5,
          title: "Split pane direction",
          type: "string",
          "default": "Down",
          description: "Where should new panes go?",
          "enum": ["Up", "Right", "Down", "Left"]
        },
        messageTimeout: {
          order: 6,
          title: "Output view timeout",
          type: "integer",
          "default": 5,
          description: "For how many seconds should the output view above the status-bar stay open?"
        },
        showFormat: {
          order: 7,
          title: "Format option for 'Git Show'",
          type: "string",
          "default": "full",
          "enum": ["oneline", "short", "medium", "full", "fuller", "email", "raw", "none"],
          description: "Which format to use for `git show`? (`none` will use your git config default)"
        }
      }
    },
    commits: {
      order: 2,
      type: "object",
      properties: {
        verboseCommits: {
          title: "Verbose Commits",
          description: "Show diffs in commit pane?",
          type: "boolean",
          "default": false
        }
      }
    },
    diffs: {
      order: 3,
      type: "object",
      properties: {
        includeStagedDiff: {
          order: 1,
          title: "Include staged diffs?",
          type: "boolean",
          "default": true
        },
        wordDiff: {
          order: 2,
          title: "Word diff",
          type: "boolean",
          "default": false,
          description: "Should diffs be generated with the `--word-diff` flag?"
        },
        syntaxHighlighting: {
          order: 3,
          title: "Enable syntax highlighting in diffs?",
          type: "boolean",
          "default": true
        }
      }
    },
    logs: {
      order: 4,
      type: "object",
      properties: {
        numberOfCommitsToShow: {
          order: 1,
          title: "Number of commits to load",
          type: "integer",
          "default": 25,
          minimum: 1,
          description: "Initial amount of commits to load when running the `Log` command"
        }
      }
    },
    remoteInteractions: {
      order: 5,
      type: "object",
      properties: {
        pullRebase: {
          order: 1,
          title: "Pull Rebase",
          type: "boolean",
          "default": false,
          description: "Pull with `--rebase` flag?"
        },
        pullBeforePush: {
          order: 2,
          title: "Pull Before Pushing",
          type: "boolean",
          "default": false,
          description: "Pull from remote before pushing"
        },
        promptForBranch: {
          order: 3,
          title: "Prompt for branch selection when pulling/pushing",
          type: "boolean",
          "default": false,
          description: "If false, it defaults to current branch upstream"
        }
      }
    },
    tags: {
      order: 6,
      type: "object",
      properties: {
        signTags: {
          title: "Sign git tags with GPG",
          type: "boolean",
          "default": false,
          description: "Use a GPG key to sign Git tags"
        }
      }
    },
    experimental: {
      order: 7,
      type: "object",
      properties: {
        stageFilesBeta: {
          order: 1,
          title: "Stage Files Beta",
          type: "boolean",
          "default": true,
          description: "Stage and unstage files in a single command"
        },
        customCommands: {
          order: 2,
          title: "Custom Commands",
          type: "boolean",
          "default": false,
          description: "Declared custom commands in your `init` file that can be run from the Git-plus command palette"
        },
        diffBranches: {
          order: 3,
          title: "Show diffs across branches",
          type: "boolean",
          "default": false,
          description: "Diffs will be shown for the current branch against a branch you choose. The `Diff branch files` command will allow choosing which file to compare. The file feature requires the 'split-diff' package to be installed."
        },
        useSplitDiff: {
          order: 4,
          title: "Split diff",
          type: "boolean",
          "default": false,
          description: "Use the split-diff package to show diffs for a single file. Only works with `Diff` command when a file is open."
        },
        autoFetch: {
          order: 5,
          title: "Auto-fetch",
          type: "integer",
          "default": 0,
          maximum: 60,
          description: "Automatically fetch remote repositories every `x` minutes (`0` will disable this feature)"
        },
        autoFetchNotify: {
          order: 6,
          title: "Auto-fetch notification",
          type: "boolean",
          "default": false,
          description: "Show notifications while running `fetch --all`?"
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvY29uZmlnLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUNFO0lBQUEsTUFBQSxFQUFRLHFFQUFSO0lBQ0EsR0FBQTtBQUNFLGNBQU8sT0FBTyxDQUFDLFFBQWY7QUFBQSxhQUNPLFFBRFA7aUJBQ3FCO0FBRHJCLGFBRU8sT0FGUDtpQkFFb0I7QUFGcEIsYUFHTyxPQUhQO2lCQUdvQjtBQUhwQjtRQUZGOzs7RUFPRixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsT0FBQSxFQUNFO01BQUEsS0FBQSxFQUFPLENBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLFVBQUEsRUFDRTtRQUFBLE9BQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLFVBRFA7VUFFQSxJQUFBLEVBQU0sUUFGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSw2REFKYjtTQURGO1FBTUEsbUJBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLHFCQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7VUFJQSxXQUFBLEVBQWEsaUdBSmI7U0FQRjtRQVlBLFlBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLG9DQURQO1VBRUEsSUFBQSxFQUFNLFFBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7VUFJQSxXQUFBLEVBQWEsaUhBQUEsR0FBa0gsSUFBSSxDQUFDLE1BQXZILEdBQThILGFBQTlILEdBQTJJLElBQUksQ0FBQyxHQUFoSixHQUFvSixRQUpqSztVQUtBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxLQUFELEVBQVEsT0FBUixFQUFp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O1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7VUFJQSxXQUFBLEVBQWEsd05BSmI7U0FiRjtRQWtCQSxZQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxZQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7VUFJQSxXQUFBLEVBQWEsaUhBSmI7U0FuQkY7UUF3QkEsU0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sWUFEUDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUhUO1VBSUEsT0FBQSxFQUFTLEVBSlQ7VUFLQSxXQUFBLEVBQWEsMkZBTGI7U0F6QkY7UUErQkEsZUFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8seUJBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSxpREFKYjtTQWhDRjtPQUhGO0tBekhGOztBQVRGIiwic291cmNlc0NvbnRlbnQiOlsibWV0YSA9ICNLZXlcbiAgZGVmaW5lOiBcImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Nb3VzZUV2ZW50L21ldGFLZXlcIlxuICBrZXk6XG4gICAgc3dpdGNoIHByb2Nlc3MucGxhdGZvcm1cbiAgICAgIHdoZW4gXCJkYXJ3aW5cIiB0aGVuIFwi4oyYXCJcbiAgICAgIHdoZW4gXCJsaW51eFwiIHRoZW4gXCJTdXBlclwiXG4gICAgICB3aGVuIFwid2luMzJcIiB0aGVuIFwi4p2WXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZW5lcmFsOlxuICAgIG9yZGVyOiAxXG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBnaXRQYXRoOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJHaXQgUGF0aFwiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJnaXRcIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJJZiBnaXQgaXMgbm90IGluIHlvdXIgUEFUSCwgc3BlY2lmeSB3aGVyZSB0aGUgZXhlY3V0YWJsZSBpc1wiXG4gICAgICBlbmFibGVTdGF0dXNCYXJJY29uOlxuICAgICAgICBvcmRlcjogMlxuICAgICAgICB0aXRsZTogXCJTdGF0dXMtYmFyIFBpbiBJY29uXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGUgcGluIGljb24gaW4gdGhlIGJvdHRvbS1yaWdodCBvZiB0aGUgc3RhdHVzLWJhciB0b2dnbGVzIHRoZSBvdXRwdXQgdmlldyBhYm92ZSB0aGUgc3RhdHVzLWJhclwiXG4gICAgICBuZXdCcmFuY2hLZXk6XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIlN0YXR1cy1iYXIgTmV3IEJyYW5jaCBtb2RpZmllciBrZXlcIlxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICAgIGRlZmF1bHQ6IFwiYWx0XCJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiU3RhdHVzLWJhciBicmFuY2ggbGlzdCBtb2RpZmllciBrZXkgdG8gYWx0ZXJuYXRpdmVseSBjcmVhdGUgYSBuZXcgYnJhbmNoIGlmIGhlbGQgb24gY2xpY2suIE5vdGUgdGhhdCBfW2BtZXRhYF0oI3ttZXRhLmRlZmluZX0pXyBpcyA8a2JkPiN7bWV0YS5rZXl9PC9rYmQ+XCJcbiAgICAgICAgZW51bTogW1wiYWx0XCIsIFwic2hpZnRcIiwgXCJtZXRhXCIsIFwiY3RybFwiXVxuICAgICAgb3BlbkluUGFuZTpcbiAgICAgICAgb3JkZXI6IDRcbiAgICAgICAgdGl0bGU6IFwiQWxsb3cgY29tbWFuZHMgdG8gb3BlbiBuZXcgcGFuZXNcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbW1hbmRzIGxpa2UgYENvbW1pdGAsIGBMb2dgLCBgU2hvd2AsIGBEaWZmYCBjYW4gYmUgc3BsaXQgaW50byBuZXcgcGFuZXNcIlxuICAgICAgc3BsaXRQYW5lOlxuICAgICAgICBvcmRlcjogNVxuICAgICAgICB0aXRsZTogXCJTcGxpdCBwYW5lIGRpcmVjdGlvblwiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJEb3duXCJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiV2hlcmUgc2hvdWxkIG5ldyBwYW5lcyBnbz9cIlxuICAgICAgICBlbnVtOiBbXCJVcFwiLCBcIlJpZ2h0XCIsIFwiRG93blwiLCBcIkxlZnRcIl1cbiAgICAgIG1lc3NhZ2VUaW1lb3V0OlxuICAgICAgICBvcmRlcjogNlxuICAgICAgICB0aXRsZTogXCJPdXRwdXQgdmlldyB0aW1lb3V0XCJcbiAgICAgICAgdHlwZTogXCJpbnRlZ2VyXCJcbiAgICAgICAgZGVmYXVsdDogNVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJGb3IgaG93IG1hbnkgc2Vjb25kcyBzaG91bGQgdGhlIG91dHB1dCB2aWV3IGFib3ZlIHRoZSBzdGF0dXMtYmFyIHN0YXkgb3Blbj9cIlxuICAgICAgc2hvd0Zvcm1hdDpcbiAgICAgICAgb3JkZXI6IDdcbiAgICAgICAgdGl0bGU6IFwiRm9ybWF0IG9wdGlvbiBmb3IgJ0dpdCBTaG93J1wiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJmdWxsXCJcbiAgICAgICAgZW51bTogW1wib25lbGluZVwiLCBcInNob3J0XCIsIFwibWVkaXVtXCIsIFwiZnVsbFwiLCBcImZ1bGxlclwiLCBcImVtYWlsXCIsIFwicmF3XCIsIFwibm9uZVwiXVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJXaGljaCBmb3JtYXQgdG8gdXNlIGZvciBgZ2l0IHNob3dgPyAoYG5vbmVgIHdpbGwgdXNlIHlvdXIgZ2l0IGNvbmZpZyBkZWZhdWx0KVwiXG4gIGNvbW1pdHM6XG4gICAgb3JkZXI6IDJcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHZlcmJvc2VDb21taXRzOlxuICAgICAgICB0aXRsZTogXCJWZXJib3NlIENvbW1pdHNcIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTaG93IGRpZmZzIGluIGNvbW1pdCBwYW5lP1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gIGRpZmZzOlxuICAgIG9yZGVyOiAzXG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBpbmNsdWRlU3RhZ2VkRGlmZjpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiSW5jbHVkZSBzdGFnZWQgZGlmZnM/XCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgd29yZERpZmY6XG4gICAgICAgIG9yZGVyOiAyXG4gICAgICAgIHRpdGxlOiBcIldvcmQgZGlmZlwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlNob3VsZCBkaWZmcyBiZSBnZW5lcmF0ZWQgd2l0aCB0aGUgYC0td29yZC1kaWZmYCBmbGFnP1wiXG4gICAgICBzeW50YXhIaWdobGlnaHRpbmc6XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIkVuYWJsZSBzeW50YXggaGlnaGxpZ2h0aW5nIGluIGRpZmZzP1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgbG9nczpcbiAgICBvcmRlcjogNFxuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgbnVtYmVyT2ZDb21taXRzVG9TaG93OlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJOdW1iZXIgb2YgY29tbWl0cyB0byBsb2FkXCJcbiAgICAgICAgdHlwZTogXCJpbnRlZ2VyXCJcbiAgICAgICAgZGVmYXVsdDogMjVcbiAgICAgICAgbWluaW11bTogMVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJJbml0aWFsIGFtb3VudCBvZiBjb21taXRzIHRvIGxvYWQgd2hlbiBydW5uaW5nIHRoZSBgTG9nYCBjb21tYW5kXCJcbiAgcmVtb3RlSW50ZXJhY3Rpb25zOlxuICAgIG9yZGVyOiA1XG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBwdWxsUmViYXNlOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJQdWxsIFJlYmFzZVwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlB1bGwgd2l0aCBgLS1yZWJhc2VgIGZsYWc/XCJcbiAgICAgIHB1bGxCZWZvcmVQdXNoOlxuICAgICAgICBvcmRlcjogMlxuICAgICAgICB0aXRsZTogXCJQdWxsIEJlZm9yZSBQdXNoaW5nXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiUHVsbCBmcm9tIHJlbW90ZSBiZWZvcmUgcHVzaGluZ1wiXG4gICAgICBwcm9tcHRGb3JCcmFuY2g6XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIlByb21wdCBmb3IgYnJhbmNoIHNlbGVjdGlvbiB3aGVuIHB1bGxpbmcvcHVzaGluZ1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIklmIGZhbHNlLCBpdCBkZWZhdWx0cyB0byBjdXJyZW50IGJyYW5jaCB1cHN0cmVhbVwiXG4gIHRhZ3M6XG4gICAgb3JkZXI6IDZcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHNpZ25UYWdzOlxuICAgICAgICB0aXRsZTogXCJTaWduIGdpdCB0YWdzIHdpdGggR1BHXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVXNlIGEgR1BHIGtleSB0byBzaWduIEdpdCB0YWdzXCJcbiAgZXhwZXJpbWVudGFsOlxuICAgIG9yZGVyOiA3XG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBzdGFnZUZpbGVzQmV0YTpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiU3RhZ2UgRmlsZXMgQmV0YVwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb246IFwiU3RhZ2UgYW5kIHVuc3RhZ2UgZmlsZXMgaW4gYSBzaW5nbGUgY29tbWFuZFwiXG4gICAgICBjdXN0b21Db21tYW5kczpcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgdGl0bGU6IFwiQ3VzdG9tIENvbW1hbmRzXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiRGVjbGFyZWQgY3VzdG9tIGNvbW1hbmRzIGluIHlvdXIgYGluaXRgIGZpbGUgdGhhdCBjYW4gYmUgcnVuIGZyb20gdGhlIEdpdC1wbHVzIGNvbW1hbmQgcGFsZXR0ZVwiXG4gICAgICBkaWZmQnJhbmNoZXM6XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIlNob3cgZGlmZnMgYWNyb3NzIGJyYW5jaGVzXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiRGlmZnMgd2lsbCBiZSBzaG93biBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoIGFnYWluc3QgYSBicmFuY2ggeW91IGNob29zZS4gVGhlIGBEaWZmIGJyYW5jaCBmaWxlc2AgY29tbWFuZCB3aWxsIGFsbG93IGNob29zaW5nIHdoaWNoIGZpbGUgdG8gY29tcGFyZS4gVGhlIGZpbGUgZmVhdHVyZSByZXF1aXJlcyB0aGUgJ3NwbGl0LWRpZmYnIHBhY2thZ2UgdG8gYmUgaW5zdGFsbGVkLlwiXG4gICAgICB1c2VTcGxpdERpZmY6XG4gICAgICAgIG9yZGVyOiA0XG4gICAgICAgIHRpdGxlOiBcIlNwbGl0IGRpZmZcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJVc2UgdGhlIHNwbGl0LWRpZmYgcGFja2FnZSB0byBzaG93IGRpZmZzIGZvciBhIHNpbmdsZSBmaWxlLiBPbmx5IHdvcmtzIHdpdGggYERpZmZgIGNvbW1hbmQgd2hlbiBhIGZpbGUgaXMgb3Blbi5cIlxuICAgICAgYXV0b0ZldGNoOlxuICAgICAgICBvcmRlcjogNVxuICAgICAgICB0aXRsZTogXCJBdXRvLWZldGNoXCJcbiAgICAgICAgdHlwZTogXCJpbnRlZ2VyXCJcbiAgICAgICAgZGVmYXVsdDogMFxuICAgICAgICBtYXhpbXVtOiA2MFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJBdXRvbWF0aWNhbGx5IGZldGNoIHJlbW90ZSByZXBvc2l0b3JpZXMgZXZlcnkgYHhgIG1pbnV0ZXMgKGAwYCB3aWxsIGRpc2FibGUgdGhpcyBmZWF0dXJlKVwiXG4gICAgICBhdXRvRmV0Y2hOb3RpZnk6XG4gICAgICAgIG9yZGVyOiA2XG4gICAgICAgIHRpdGxlOiBcIkF1dG8tZmV0Y2ggbm90aWZpY2F0aW9uXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiU2hvdyBub3RpZmljYXRpb25zIHdoaWxlIHJ1bm5pbmcgYGZldGNoIC0tYWxsYD9cIlxuIl19
