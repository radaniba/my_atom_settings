(function() {
  var syntaxThemes;

  syntaxThemes = atom.packages.getAvailablePackageMetadata() || [];

  syntaxThemes = syntaxThemes.filter(function(s) {
    return s.theme === 'syntax';
  });

  syntaxThemes = syntaxThemes.map(function(s) {
    return s.name;
  });

  if (!syntaxThemes.length) {
    syntaxThemes = ['atom-dark-syntax', 'atom-light-syntax', 'one-dark-syntax', 'one-light-syntax', 'solarized-dark-syntax', 'solarized-light-syntax', 'base16-tomorrow-dark-theme', 'base16-tomorrow-light-theme'];
  }

  syntaxThemes.push('mpe-github-syntax');

  module.exports = {
    fileExtension: {
      type: "string",
      "default": ".md, .mmark, .markdown",
      description: "You may need restart Atom after making changes here.",
      order: 0
    },
    previewTheme: {
      title: "Preview Theme",
      type: "string",
      "default": 'mpe-github-syntax',
      "enum": syntaxThemes,
      order: 1
    },
    whiteBackground: {
      title: "White background",
      type: "boolean",
      "default": false,
      description: "Use white background color for preview.",
      order: 2
    },
    breakOnSingleNewline: {
      type: "boolean",
      "default": true,
      description: "In Markdown, a single newline character doesn't cause a line break in the generated HTML. In GitHub Flavored Markdown, that is not true. Enable this config option to insert line breaks in rendered HTML for single newlines in Markdown source.",
      order: 10
    },
    enableTypographer: {
      type: "boolean",
      "default": false,
      description: "Enable smartypants and other sweet transforms.",
      order: 11
    },
    showBackToTopButton: {
      title: "Show back to top button",
      type: "boolean",
      "default": true,
      description: "Show back to top button in preview.",
      order: 12
    },
    enableZenMode: {
      title: "Zen mode",
      type: "boolean",
      "default": false,
      description: "Distraction free writing.",
      order: 13
    },
    protocolsWhiteList: {
      title: "Protocols Whitelist",
      type: "string",
      "default": "http, https, atom, file",
      description: "Accepted protocols followed by `://` for links. `(Restart is required to take effect)`",
      order: 15
    },
    usePandocParser: {
      title: "Use Pandoc Parser",
      type: "boolean",
      "default": false,
      description: "Enable this option will render markdown by pandoc instead of remarkable. Live update will be disabled automatically if this option is enabled.",
      order: 16
    },
    pandocPath: {
      title: "Pandoc Options: Path",
      type: "string",
      "default": "pandoc",
      description: "Please specify the correct path to your pandoc executable",
      order: 17
    },
    pandocArguments: {
      title: "Pandoc Options: Commandline Arguments",
      type: "string",
      "default": "",
      description: "Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.",
      order: 18
    },
    mathRenderingOption: {
      type: "string",
      "default": "KaTeX",
      description: "Choose the Math expression rendering method here. You can also disable math rendering if you want by choosing 'None'.",
      "enum": ["KaTeX", "MathJax", "None"],
      order: 20
    },
    indicatorForMathRenderingInline: {
      title: "Inline Indicator",
      type: "string",
      "default": "[[\"$\", \"$\"]]",
      description: "Use customized Math expression inline indicator. By default it is '[[\"$\", \"$\"]]', which means content within '**$**' and '**$**' will be rendered in inline mode. You can also define multiple indicators separated by comma. For example, '[[\"$\", \"$\"], [\"\\\\\\\\(\", \"\\\\\\\\)\"]]' will render inline math expression within '**$**' and '**$**', '**\\\\(**' and '**\\\\)**'. `(Restart is required to take effect)`",
      order: 21
    },
    indicatorForMathRenderingBlock: {
      title: "Block Indicator",
      type: "string",
      "default": "[[\"$$\", \"$$\"]]",
      description: "Use customized Math expression block indicator. By default it is [[\"$$\", \"$$\"]]. `(Restart is required to take effect)`",
      order: 22
    },
    mathJaxProcessEnvironments: {
      title: "MathJax processEnvironments",
      type: "boolean",
      "default": false,
      description: "Note that, as opposed to true LaTeX, MathJax processes all environments when wrapped inside math delimiters. By defaut, MathJax will also render all environments outside of delimiters; this can be controlled via the processEnvironments option. `Live Update` is recommended to be disabled when this option is enabled. `(Restart is required to take effect)`",
      order: 23
    },
    enableWikiLinkSyntax: {
      title: "Enable Wiki Link syntax",
      type: "boolean",
      "default": true,
      description: "Enable Wiki Link syntax support. More information can be found at https://help.github.com/articles/adding-links-to-wikis/",
      order: 30
    },
    wikiLinkFileExtension: {
      title: "Wiki Link file extension",
      type: "string",
      "default": ".md",
      description: "By default, [[test]] will direct to file path `test.md`.",
      order: 31
    },
    useStandardCodeFencingForGraphs: {
      title: "Use standard code fencing for graphs",
      type: "boolean",
      "default": true,
      description: "Use standard code fencing for graphs. For example, code block `mermaid` or `@mermaid` will render mermaid graphs. If this option is disabled, then only `@mermaid` will render mermaid graphs. Works for mermaid, viz, plantuml, and wavedrom.",
      order: 35
    },
    liveUpdate: {
      type: "boolean",
      "default": true,
      description: "Re-render the preview as the contents of the source changes, without requiring the source buffer to be saved. If disabled, the preview is re-rendered only when the buffer is saved to disk. Disable live update will also disable scroll sync.",
      order: 60
    },
    frontMatterRenderingOption: {
      title: "Front Matter rendering option",
      type: "string",
      description: "You can choose how to render front matter here. 'none' option will hide front matter.",
      "default": "table",
      "enum": ["table", "code block", "none"],
      order: 70
    },
    scrollSync: {
      type: "boolean",
      "default": true,
      description: "2 way scroll sync. Sync both markdown source and markdown preview when scrolling.",
      order: 75
    },
    scrollDuration: {
      type: "string",
      "default": "120",
      description: "Scroll duration is defined in milliseconds. Lower value indicates faster scrolling speed. Default is 120ms",
      order: 76
    },
    documentExportPath: {
      title: "document export folder path",
      description: "When exporting document to disk, by default the document will be generated at the root path './'",
      type: "string",
      "default": "./",
      order: 77
    },
    exportPDFPageFormat: {
      title: "Pdf Page Format",
      type: "string",
      "default": "Letter",
      "enum": ["A3", "A4", "A5", "Legal", "Letter", "Tabloid"],
      order: 80
    },
    orientation: {
      title: "Pdf Page Orientation",
      type: "string",
      "default": "portrait",
      "enum": ["portrait", "landscape"],
      order: 90
    },
    marginsType: {
      title: "Pdf Margin type",
      type: "string",
      "default": "default margin",
      "enum": ["default margin", "no margin", "minimum margin"],
      order: 100
    },
    printBackground: {
      title: "Print Background when generating pdf",
      type: "boolean",
      "default": true,
      description: "Include background color when generating pdf.",
      order: 110
    },
    pdfUseGithub: {
      title: "Use Github style when generating pdf",
      type: "boolean",
      "default": true,
      description: "If you enabled this option, then the pdf will be generated using Github Style. I add this option because if the markdown preview has black color background, then the generated pdf may also have black color background (if you enabled Print Background), which may affect the appearance of the generated pdf.",
      order: 120
    },
    pdfOpenAutomatically: {
      title: "Open pdf file immediately after it is generated",
      type: "boolean",
      "default": true,
      description: "If you enabled this option, then when pdf is generated, it will be opened by pdf viewer. For example, on Mac OS X, it will be opened by Preview.",
      order: 130
    },
    phantomJSExportFileType: {
      title: "PhantomJS export file type",
      type: "string",
      "default": "pdf",
      "enum": ["pdf", "png", "jpeg"],
      order: 131
    },
    phantomJSMargin: {
      title: "PhantomJS margins",
      description: "Default is 0, units: mm, cm, in, px. You can also define 'top, right, bottom, left' margins in order like '1cm, 1cm, 1cm, 1cm' separated by comma ','.",
      type: "string",
      "default": "1cm",
      order: 132
    },
    openPreviewPaneAutomatically: {
      title: "Open preview pane automatically when opening a markdown file",
      type: "boolean",
      "default": true,
      order: 140
    },
    imageFolderPath: {
      title: "Image save folder path",
      description: "When using Image Helper to copy images, by default images will be copied to root image folder path '/assets'",
      type: "string",
      "default": "/assets",
      order: 150
    },
    imageUploader: {
      title: "Image Uploader",
      description: "you can choose different image uploader to upload image.",
      type: "string",
      "default": "imgur",
      "enum": ["imgur", "sm.ms"],
      order: 160
    },
    mermaidTheme: {
      title: "Mermaid Theme",
      type: "string",
      "default": "mermaid.css",
      "enum": ["mermaid.css", "mermaid.dark.css", "mermaid.forest.css"],
      order: 170
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9jb25maWctc2NoZW1hLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxRQUFRLENBQUMsMkJBQWQsQ0FBQSxDQUFBLElBQStDOztFQUM5RCxZQUFBLEdBQWUsWUFBWSxDQUFDLE1BQWIsQ0FBb0IsU0FBQyxDQUFEO1dBQU0sQ0FBQyxDQUFDLEtBQUYsS0FBVztFQUFqQixDQUFwQjs7RUFDZixZQUFBLEdBQWUsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsU0FBQyxDQUFEO1dBQU0sQ0FBQyxDQUFDO0VBQVIsQ0FBakI7O0VBQ2YsSUFBRyxDQUFDLFlBQVksQ0FBQyxNQUFqQjtJQUNFLFlBQUEsR0FBZSxDQUFDLGtCQUFELEVBQXFCLG1CQUFyQixFQUEwQyxpQkFBMUMsRUFBNkQsa0JBQTdELEVBQWlGLHVCQUFqRixFQUEwRyx3QkFBMUcsRUFBb0ksNEJBQXBJLEVBQWtLLDZCQUFsSyxFQURqQjs7O0VBR0EsWUFBWSxDQUFDLElBQWIsQ0FBa0IsbUJBQWxCOztFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxhQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsd0JBRFQ7TUFFQSxXQUFBLEVBQWEsc0RBRmI7TUFHQSxLQUFBLEVBQU8sQ0FIUDtLQURGO0lBS0EsWUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGVBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsbUJBRlQ7TUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLFlBSE47TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQU5GO0lBV0EsZUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGtCQUFQO01BQ0EsSUFBQSxF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LElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxhQUZUO01BR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUNKLGFBREksRUFFSixrQkFGSSxFQUdKLG9CQUhJLENBSE47TUFRQSxLQUFBLEVBQU8sR0FSUDtLQXJPRjs7QUFUSiIsInNvdXJjZXNDb250ZW50IjpbInN5bnRheFRoZW1lcyA9IGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU1ldGFkYXRhKCkgb3IgW11cbnN5bnRheFRoZW1lcyA9IHN5bnRheFRoZW1lcy5maWx0ZXIgKHMpLT4gcy50aGVtZSA9PSAnc3ludGF4J1xuc3ludGF4VGhlbWVzID0gc3ludGF4VGhlbWVzLm1hcCAocyktPiBzLm5hbWVcbmlmICFzeW50YXhUaGVtZXMubGVuZ3RoXG4gIHN5bnRheFRoZW1lcyA9IFsnYXRvbS1kYXJrLXN5bnRheCcsICdhdG9tLWxpZ2h0LXN5bnRheCcsICdvbmUtZGFyay1zeW50YXgnLCAnb25lLWxpZ2h0LXN5bnRheCcsICdzb2xhcml6ZWQtZGFyay1zeW50YXgnLCAnc29sYXJpemVkLWxpZ2h0LXN5bnRheCcsICdiYXNlMTYtdG9tb3Jyb3ctZGFyay10aGVtZScsICdiYXNlMTYtdG9tb3Jyb3ctbGlnaHQtdGhlbWUnXVxuXG5zeW50YXhUaGVtZXMucHVzaCgnbXBlLWdpdGh1Yi1zeW50YXgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgZmlsZUV4dGVuc2lvbjpcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiLm1kLCAubW1hcmssIC5tYXJrZG93blwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJZb3UgbWF5IG5lZWQgcmVzdGFydCBBdG9tIGFmdGVyIG1ha2luZyBjaGFuZ2VzIGhlcmUuXCJcbiAgICAgIG9yZGVyOiAwXG4gICAgcHJldmlld1RoZW1lOlxuICAgICAgdGl0bGU6IFwiUHJldmlldyBUaGVtZVwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiAnbXBlLWdpdGh1Yi1zeW50YXgnXG4gICAgICBlbnVtOiBzeW50YXhUaGVtZXNcbiAgICAgIG9yZGVyOiAxXG4gICAgd2hpdGVCYWNrZ3JvdW5kOlxuICAgICAgdGl0bGU6IFwiV2hpdGUgYmFja2dyb3VuZFwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSB3aGl0ZSBiYWNrZ3JvdW5kIGNvbG9yIGZvciBwcmV2aWV3LlwiXG4gICAgICBvcmRlcjogMlxuICAgIGJyZWFrT25TaW5nbGVOZXdsaW5lOlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluIE1hcmtkb3duLCBhIHNpbmdsZSBuZXdsaW5lIGNoYXJhY3RlciBkb2Vzbid0IGNhdXNlIGEgbGluZSBicmVhayBpbiB0aGUgZ2VuZXJhdGVkIEhUTUwuIEluIEdpdEh1YiBGbGF2b3JlZCBNYXJrZG93biwgdGhhdCBpcyBub3QgdHJ1ZS4gRW5hYmxlIHRoaXMgY29uZmlnIG9wdGlvbiB0byBpbnNlcnQgbGluZSBicmVha3MgaW4gcmVuZGVyZWQgSFRNTCBmb3Igc2luZ2xlIG5ld2xpbmVzIGluIE1hcmtkb3duIHNvdXJjZS5cIlxuICAgICAgb3JkZXI6IDEwXG4gICAgZW5hYmxlVHlwb2dyYXBoZXI6XG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuYWJsZSBzbWFydHlwYW50cyBhbmQgb3RoZXIgc3dlZXQgdHJhbnNmb3Jtcy5cIlxuICAgICAgb3JkZXI6IDExXG4gICAgc2hvd0JhY2tUb1RvcEJ1dHRvbjpcbiAgICAgIHRpdGxlOiBcIlNob3cgYmFjayB0byB0b3AgYnV0dG9uXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJTaG93IGJhY2sgdG8gdG9wIGJ1dHRvbiBpbiBwcmV2aWV3LlwiXG4gICAgICBvcmRlcjogMTJcbiAgICBlbmFibGVaZW5Nb2RlOlxuICAgICAgdGl0bGU6IFwiWmVuIG1vZGVcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJEaXN0cmFjdGlvbiBmcmVlIHdyaXRpbmcuXCJcbiAgICAgIG9yZGVyOiAxM1xuICAgIHByb3RvY29sc1doaXRlTGlzdDpcbiAgICAgIHRpdGxlOiBcIlByb3RvY29scyBXaGl0ZWxpc3RcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJodHRwLCBodHRwcywgYXRvbSwgZmlsZVwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJBY2NlcHRlZCBwcm90b2NvbHMgZm9sbG93ZWQgYnkgYDovL2AgZm9yIGxpbmtzLiBgKFJlc3RhcnQgaXMgcmVxdWlyZWQgdG8gdGFrZSBlZmZlY3QpYFwiXG4gICAgICBvcmRlcjogMTVcbiAgICB1c2VQYW5kb2NQYXJzZXI6XG4gICAgICB0aXRsZTogXCJVc2UgUGFuZG9jIFBhcnNlclwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogXCJFbmFibGUgdGhpcyBvcHRpb24gd2lsbCByZW5kZXIgbWFya2Rvd24gYnkgcGFuZG9jIGluc3RlYWQgb2YgcmVtYXJrYWJsZS4gTGl2ZSB1cGRhdGUgd2lsbCBiZSBkaXNhYmxlZCBhdXRvbWF0aWNhbGx5IGlmIHRoaXMgb3B0aW9uIGlzIGVuYWJsZWQuXCJcbiAgICAgIG9yZGVyOiAxNlxuICAgIHBhbmRvY1BhdGg6XG4gICAgICB0aXRsZTogXCJQYW5kb2MgT3B0aW9uczogUGF0aFwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcInBhbmRvY1wiXG4gICAgICBkZXNjcmlwdGlvbjogXCJQbGVhc2Ugc3BlY2lmeSB0aGUgY29ycmVjdCBwYXRoIHRvIHlvdXIgcGFuZG9jIGV4ZWN1dGFibGVcIlxuICAgICAgb3JkZXI6IDE3XG4gICAgcGFuZG9jQXJndW1lbnRzOlxuICAgICAgdGl0bGU6IFwiUGFuZG9jIE9wdGlvbnM6IENvbW1hbmRsaW5lIEFyZ3VtZW50c1wiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZGVmYXVsdDogXCJcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbW1hIHNlcGFyYXRlZCBwYW5kb2MgYXJndW1lbnRzIGUuZy4gYC0tc21hcnQsIC0tZmlsdGVyPS9iaW4vZXhlYC4gUGxlYXNlIHVzZSBsb25nIGFyZ3VtZW50IG5hbWVzLlwiXG4gICAgICBvcmRlcjogMThcbiAgICBtYXRoUmVuZGVyaW5nT3B0aW9uOlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJLYVRlWFwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJDaG9vc2UgdGhlIE1hdGggZXhwcmVzc2lvbiByZW5kZXJpbmcgbWV0aG9kIGhlcmUuIFlvdSBjYW4gYWxzbyBkaXNhYmxlIG1hdGggcmVuZGVyaW5nIGlmIHlvdSB3YW50IGJ5IGNob29zaW5nICdOb25lJy5cIlxuICAgICAgZW51bTogW1xuICAgICAgICBcIkthVGVYXCIsXG4gICAgICAgIFwiTWF0aEpheFwiLFxuICAgICAgICBcIk5vbmVcIlxuICAgICAgXVxuICAgICAgb3JkZXI6IDIwXG4gICAgaW5kaWNhdG9yRm9yTWF0aFJlbmRlcmluZ0lubGluZTpcbiAgICAgIHRpdGxlOiBcIklubGluZSBJbmRpY2F0b3JcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJbW1xcXCIkXFxcIiwgXFxcIiRcXFwiXV1cIlxuICAgICAgZGVzY3JpcHRpb246IFwiVXNlIGN1c3RvbWl6ZWQgTWF0aCBleHByZXNzaW9uIGlubGluZSBpbmRpY2F0b3IuIEJ5IGRlZmF1bHQgaXQgaXMgJ1tbXFxcIiRcXFwiLCBcXFwiJFxcXCJdXScsIHdoaWNoIG1lYW5zIGNvbnRlbnQgd2l0aGluICcqKiQqKicgYW5kICcqKiQqKicgd2lsbCBiZSByZW5kZXJlZCBpbiBpbmxpbmUgbW9kZS4gWW91IGNhbiBhbHNvIGRlZmluZSBtdWx0aXBsZSBpbmRpY2F0b3JzIHNlcGFyYXRlZCBieSBjb21tYS4gRm9yIGV4YW1wbGUsICdbW1xcXCIkXFxcIiwgXFxcIiRcXFwiXSwgW1xcXCJcXFxcXFxcXFxcXFxcXFxcKFxcXCIsIFxcXCJcXFxcXFxcXFxcXFxcXFxcKVxcXCJdXScgd2lsbCByZW5kZXIgaW5saW5lIG1hdGggZXhwcmVzc2lvbiB3aXRoaW4gJyoqJCoqJyBhbmQgJyoqJCoqJywgJyoqXFxcXFxcXFwoKionIGFuZCAnKipcXFxcXFxcXCkqKicuIGAoUmVzdGFydCBpcyByZXF1aXJlZCB0byB0YWtlIGVmZmVjdClgXCJcbiAgICAgIG9yZGVyOiAyMVxuICAgIGluZGljYXRvckZvck1hdGhSZW5kZXJpbmdCbG9jazpcbiAgICAgIHRpdGxlOiBcIkJsb2NrIEluZGljYXRvclwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIltbXFxcIiQkXFxcIiwgXFxcIiQkXFxcIl1dXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSBjdXN0b21pemVkIE1hdGggZXhwcmVzc2lvbiBibG9jayBpbmRpY2F0b3IuIEJ5IGRlZmF1bHQgaXQgaXMgW1tcXFwiJCRcXFwiLCBcXFwiJCRcXFwiXV0uIGAoUmVzdGFydCBpcyByZXF1aXJlZCB0byB0YWtlIGVmZmVjdClgXCJcbiAgICAgIG9yZGVyOiAyMlxuICAgIG1hdGhKYXhQcm9jZXNzRW52aXJvbm1lbnRzOlxuICAgICAgdGl0bGU6IFwiTWF0aEpheCBwcm9jZXNzRW52aXJvbm1lbnRzXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiTm90ZSB0aGF0LCBhcyBvcHBvc2VkIHRvIHRydWUgTGFUZVgsIE1hdGhKYXggcHJvY2Vzc2VzIGFsbCBlbnZpcm9ubWVudHMgd2hlbiB3cmFwcGVkIGluc2lkZSBtYXRoIGRlbGltaXRlcnMuIEJ5IGRlZmF1dCwgTWF0aEpheCB3aWxsIGFsc28gcmVuZGVyIGFsbCBlbnZpcm9ubWVudHMgb3V0c2lkZSBvZiBkZWxpbWl0ZXJzOyB0aGlzIGNhbiBiZSBjb250cm9sbGVkIHZpYSB0aGUgcHJvY2Vzc0Vudmlyb25tZW50cyBvcHRpb24uIGBMaXZlIFVwZGF0ZWAgaXMgcmVjb21tZW5kZWQgdG8gYmUgZGlzYWJsZWQgd2hlbiB0aGlzIG9wdGlvbiBpcyBlbmFibGVkLiBgKFJlc3RhcnQgaXMgcmVxdWlyZWQgdG8gdGFrZSBlZmZlY3QpYFwiXG4gICAgICBvcmRlcjogMjNcbiAgICBlbmFibGVXaWtpTGlua1N5bnRheDpcbiAgICAgIHRpdGxlOiBcIkVuYWJsZSBXaWtpIExpbmsgc3ludGF4XCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJFbmFibGUgV2lraSBMaW5rIHN5bnRheCBzdXBwb3J0LiBNb3JlIGluZm9ybWF0aW9uIGNhbiBiZSBmb3VuZCBhdCBodHRwczovL2hlbHAuZ2l0aHViLmNvbS9hcnRpY2xlcy9hZGRpbmctbGlua3MtdG8td2lraXMvXCJcbiAgICAgIG9yZGVyOiAzMFxuICAgIHdpa2lMaW5rRmlsZUV4dGVuc2lvbjpcbiAgICAgIHRpdGxlOiBcIldpa2kgTGluayBmaWxlIGV4dGVuc2lvblwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIi5tZFwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJCeSBkZWZhdWx0LCBbW3Rlc3RdXSB3aWxsIGRpcmVjdCB0byBmaWxlIHBhdGggYHRlc3QubWRgLlwiXG4gICAgICBvcmRlcjogMzFcbiAgICB1c2VTdGFuZGFyZENvZGVGZW5jaW5nRm9yR3JhcGhzOlxuICAgICAgdGl0bGU6IFwiVXNlIHN0YW5kYXJkIGNvZGUgZmVuY2luZyBmb3IgZ3JhcGhzXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJVc2Ugc3RhbmRhcmQgY29kZSBmZW5jaW5nIGZvciBncmFwaHMuIEZvciBleGFtcGxlLCBjb2RlIGJsb2NrIGBtZXJtYWlkYCBvciBgQG1lcm1haWRgIHdpbGwgcmVuZGVyIG1lcm1haWQgZ3JhcGhzLiBJZiB0aGlzIG9wdGlvbiBpcyBkaXNhYmxlZCwgdGhlbiBvbmx5IGBAbWVybWFpZGAgd2lsbCByZW5kZXIgbWVybWFpZCBncmFwaHMuIFdvcmtzIGZvciBtZXJtYWlkLCB2aXosIHBsYW50dW1sLCBhbmQgd2F2ZWRyb20uXCJcbiAgICAgIG9yZGVyOiAzNVxuICAgIGxpdmVVcGRhdGU6XG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiUmUtcmVuZGVyIHRoZSBwcmV2aWV3IGFzIHRoZSBjb250ZW50cyBvZiB0aGUgc291cmNlIGNoYW5nZXMsIHdpdGhvdXQgcmVxdWlyaW5nIHRoZSBzb3VyY2UgYnVmZmVyIHRvIGJlIHNhdmVkLiBJZiBkaXNhYmxlZCwgdGhlIHByZXZpZXcgaXMgcmUtcmVuZGVyZWQgb25seSB3aGVuIHRoZSBidWZmZXIgaXMgc2F2ZWQgdG8gZGlzay4gRGlzYWJsZSBsaXZlIHVwZGF0ZSB3aWxsIGFsc28gZGlzYWJsZSBzY3JvbGwgc3luYy5cIlxuICAgICAgb3JkZXI6IDYwXG4gICAgZnJvbnRNYXR0ZXJSZW5kZXJpbmdPcHRpb246XG4gICAgICB0aXRsZTogXCJGcm9udCBNYXR0ZXIgcmVuZGVyaW5nIG9wdGlvblwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZXNjcmlwdGlvbjogXCJZb3UgY2FuIGNob29zZSBob3cgdG8gcmVuZGVyIGZyb250IG1hdHRlciBoZXJlLiAnbm9uZScgb3B0aW9uIHdpbGwgaGlkZSBmcm9udCBtYXR0ZXIuXCJcbiAgICAgIGRlZmF1bHQ6IFwidGFibGVcIlxuICAgICAgZW51bTogW1xuICAgICAgICBcInRhYmxlXCIsXG4gICAgICAgIFwiY29kZSBibG9ja1wiLFxuICAgICAgICBcIm5vbmVcIlxuICAgICAgXSxcbiAgICAgIG9yZGVyOiA3MFxuICAgIHNjcm9sbFN5bmM6XG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiMiB3YXkgc2Nyb2xsIHN5bmMuIFN5bmMgYm90aCBtYXJrZG93biBzb3VyY2UgYW5kIG1hcmtkb3duIHByZXZpZXcgd2hlbiBzY3JvbGxpbmcuXCJcbiAgICAgIG9yZGVyOiA3NVxuICAgIHNjcm9sbER1cmF0aW9uOlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCIxMjBcIlxuICAgICAgZGVzY3JpcHRpb246IFwiU2Nyb2xsIGR1cmF0aW9uIGlzIGRlZmluZWQgaW4gbWlsbGlzZWNvbmRzLiBMb3dlciB2YWx1ZSBpbmRpY2F0ZXMgZmFzdGVyIHNjcm9sbGluZyBzcGVlZC4gRGVmYXVsdCBpcyAxMjBtc1wiXG4gICAgICBvcmRlcjogNzZcbiAgICBkb2N1bWVudEV4cG9ydFBhdGg6XG4gICAgICB0aXRsZTogXCJkb2N1bWVudCBleHBvcnQgZm9sZGVyIHBhdGhcIlxuICAgICAgZGVzY3JpcHRpb246IFwiV2hlbiBleHBvcnRpbmcgZG9jdW1lbnQgdG8gZGlzaywgYnkgZGVmYXVsdCB0aGUgZG9jdW1lbnQgd2lsbCBiZSBnZW5lcmF0ZWQgYXQgdGhlIHJvb3QgcGF0aCAnLi8nXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiLi9cIlxuICAgICAgb3JkZXI6IDc3XG4gICAgZXhwb3J0UERGUGFnZUZvcm1hdDpcbiAgICAgIHRpdGxlOiBcIlBkZiBQYWdlIEZvcm1hdFwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIkxldHRlclwiXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwiQTNcIixcbiAgICAgICAgXCJBNFwiLFxuICAgICAgICBcIkE1XCIsXG4gICAgICAgIFwiTGVnYWxcIixcbiAgICAgICAgXCJMZXR0ZXJcIixcbiAgICAgICAgXCJUYWJsb2lkXCJcbiAgICAgIF1cbiAgICAgIG9yZGVyOiA4MFxuICAgIG9yaWVudGF0aW9uOlxuICAgICAgdGl0bGU6IFwiUGRmIFBhZ2UgT3JpZW50YXRpb25cIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJwb3J0cmFpdFwiXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwicG9ydHJhaXRcIixcbiAgICAgICAgXCJsYW5kc2NhcGVcIlxuICAgICAgXVxuICAgICAgb3JkZXI6IDkwXG4gICAgbWFyZ2luc1R5cGU6XG4gICAgICB0aXRsZTogXCJQZGYgTWFyZ2luIHR5cGVcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJkZWZhdWx0IG1hcmdpblwiXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwiZGVmYXVsdCBtYXJnaW5cIixcbiAgICAgICAgXCJubyBtYXJnaW5cIixcbiAgICAgICAgXCJtaW5pbXVtIG1hcmdpblwiXG4gICAgICBdXG4gICAgICBvcmRlcjogMTAwXG4gICAgcHJpbnRCYWNrZ3JvdW5kOlxuICAgICAgdGl0bGU6IFwiUHJpbnQgQmFja2dyb3VuZCB3aGVuIGdlbmVyYXRpbmcgcGRmXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmNsdWRlIGJhY2tncm91bmQgY29sb3Igd2hlbiBnZW5lcmF0aW5nIHBkZi5cIlxuICAgICAgb3JkZXI6IDExMFxuICAgIHBkZlVzZUdpdGh1YjpcbiAgICAgIHRpdGxlOiBcIlVzZSBHaXRodWIgc3R5bGUgd2hlbiBnZW5lcmF0aW5nIHBkZlwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiSWYgeW91IGVuYWJsZWQgdGhpcyBvcHRpb24sIHRoZW4gdGhlIHBkZiB3aWxsIGJlIGdlbmVyYXRlZCB1c2luZyBHaXRodWIgU3R5bGUuIEkgYWRkIHRoaXMgb3B0aW9uIGJlY2F1c2UgaWYgdGhlIG1hcmtkb3duIHByZXZpZXcgaGFzIGJsYWNrIGNvbG9yIGJhY2tncm91bmQsIHRoZW4gdGhlIGdlbmVyYXRlZCBwZGYgbWF5IGFsc28gaGF2ZSBibGFjayBjb2xvciBiYWNrZ3JvdW5kIChpZiB5b3UgZW5hYmxlZCBQcmludCBCYWNrZ3JvdW5kKSwgd2hpY2ggbWF5IGFmZmVjdCB0aGUgYXBwZWFyYW5jZSBvZiB0aGUgZ2VuZXJhdGVkIHBkZi5cIlxuICAgICAgb3JkZXI6IDEyMFxuICAgIHBkZk9wZW5BdXRvbWF0aWNhbGx5OlxuICAgICAgdGl0bGU6IFwiT3BlbiBwZGYgZmlsZSBpbW1lZGlhdGVseSBhZnRlciBpdCBpcyBnZW5lcmF0ZWRcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIklmIHlvdSBlbmFibGVkIHRoaXMgb3B0aW9uLCB0aGVuIHdoZW4gcGRmIGlzIGdlbmVyYXRlZCwgaXQgd2lsbCBiZSBvcGVuZWQgYnkgcGRmIHZpZXdlci4gRm9yIGV4YW1wbGUsIG9uIE1hYyBPUyBYLCBpdCB3aWxsIGJlIG9wZW5lZCBieSBQcmV2aWV3LlwiXG4gICAgICBvcmRlcjogMTMwXG4gICAgcGhhbnRvbUpTRXhwb3J0RmlsZVR5cGU6XG4gICAgICB0aXRsZTogXCJQaGFudG9tSlMgZXhwb3J0IGZpbGUgdHlwZVwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcInBkZlwiXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwicGRmXCIsXG4gICAgICAgIFwicG5nXCIsXG4gICAgICAgIFwianBlZ1wiXG4gICAgICBdLFxuICAgICAgb3JkZXI6IDEzMVxuICAgIHBoYW50b21KU01hcmdpbjpcbiAgICAgIHRpdGxlOiBcIlBoYW50b21KUyBtYXJnaW5zXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRlZmF1bHQgaXMgMCwgdW5pdHM6IG1tLCBjbSwgaW4sIHB4LiBZb3UgY2FuIGFsc28gZGVmaW5lICd0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQnIG1hcmdpbnMgaW4gb3JkZXIgbGlrZSAnMWNtLCAxY20sIDFjbSwgMWNtJyBzZXBhcmF0ZWQgYnkgY29tbWEgJywnLlwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIjFjbVwiXG4gICAgICBvcmRlcjogMTMyXG4gICAgb3BlblByZXZpZXdQYW5lQXV0b21hdGljYWxseTpcbiAgICAgIHRpdGxlOiBcIk9wZW4gcHJldmlldyBwYW5lIGF1dG9tYXRpY2FsbHkgd2hlbiBvcGVuaW5nIGEgbWFya2Rvd24gZmlsZVwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDE0MFxuICAgIGltYWdlRm9sZGVyUGF0aDpcbiAgICAgIHRpdGxlOiBcIkltYWdlIHNhdmUgZm9sZGVyIHBhdGhcIlxuICAgICAgZGVzY3JpcHRpb246IFwiV2hlbiB1c2luZyBJbWFnZSBIZWxwZXIgdG8gY29weSBpbWFnZXMsIGJ5IGRlZmF1bHQgaW1hZ2VzIHdpbGwgYmUgY29waWVkIHRvIHJvb3QgaW1hZ2UgZm9sZGVyIHBhdGggJy9hc3NldHMnXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiL2Fzc2V0c1wiXG4gICAgICBvcmRlcjogMTUwXG4gICAgaW1hZ2VVcGxvYWRlcjpcbiAgICAgIHRpdGxlOiBcIkltYWdlIFVwbG9hZGVyXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcInlvdSBjYW4gY2hvb3NlIGRpZmZlcmVudCBpbWFnZSB1cGxvYWRlciB0byB1cGxvYWQgaW1hZ2UuXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiaW1ndXJcIlxuICAgICAgZW51bTogW1xuICAgICAgICBcImltZ3VyXCIsXG4gICAgICAgIFwic20ubXNcIlxuICAgICAgXVxuICAgICAgb3JkZXI6IDE2MFxuICAgIG1lcm1haWRUaGVtZTpcbiAgICAgIHRpdGxlOiBcIk1lcm1haWQgVGhlbWVcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJtZXJtYWlkLmNzc1wiXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwibWVybWFpZC5jc3NcIixcbiAgICAgICAgXCJtZXJtYWlkLmRhcmsuY3NzXCIsXG4gICAgICAgIFwibWVybWFpZC5mb3Jlc3QuY3NzXCJcbiAgICAgIF1cbiAgICAgIG9yZGVyOiAxNzBcbiJdfQ==
