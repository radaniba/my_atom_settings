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
      "default": syntaxThemes[0],
      "enum": syntaxThemes,
      order: 1
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
    useStandardCodeFencingForGraphs: {
      title: "Use standard code fencing for graphs",
      type: "boolean",
      "default": true,
      description: "Use standard code fencing for graphs. For example, code block `mermaid` or `@mermaid` will render mermaid graphs. If this option is disabled, then only `@mermaid` will render mermaid graphs. Works for mermaid, viz, plantuml, and wavedrom.",
      order: 31
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9jb25maWctc2NoZW1hLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxRQUFRLENBQUMsMkJBQWQsQ0FBQSxDQUFBLElBQStDOztFQUM5RCxZQUFBLEdBQWUsWUFBWSxDQUFDLE1BQWIsQ0FBb0IsU0FBQyxDQUFEO1dBQU0sQ0FBQyxDQUFDLEtBQUYsS0FBVztFQUFqQixDQUFwQjs7RUFDZixZQUFBLEdBQWUsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsU0FBQyxDQUFEO1dBQU0sQ0FBQyxDQUFDO0VBQVIsQ0FBakI7O0VBQ2YsSUFBRyxDQUFDLFlBQVksQ0FBQyxNQUFqQjtJQUNFLFlBQUEsR0FBZSxDQUFDLGtCQUFELEVBQXFCLG1CQUFyQixFQUEwQyxpQkFBMUMsRUFBNkQsa0JBQTdELEVBQWlGLHVCQUFqRixFQUEwRyx3QkFBMUcsRUFBb0ksNEJBQXBJLEVBQWtLLDZCQUFsSyxFQURqQjs7O0VBR0EsWUFBWSxDQUFDLElBQWIsQ0FBa0IsbUJBQWxCOztFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxhQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsd0JBRFQ7TUFFQSxXQUFBLEVBQWEsc0RBRmI7TUFHQSxLQUFBLEVBQU8sQ0FIUDtLQURGO0lBS0EsWUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGVBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsWUFBYSxDQUFBLENBQUEsQ0FGdEI7TUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLFlBSE47TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQU5GO0lBV0Esb0JBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxT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QUdKLE1BSEksQ0FITjtNQVFBLEtBQUEsRUFBTyxHQVJQO0tBcExGO0lBNkxBLGVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxtQkFBUDtNQUNBLFdBQUEsRUFBYSx3SkFEYjtNQUVBLElBQUEsRUFBTSxRQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO01BSUEsS0FBQSxFQUFPLEdBSlA7S0E5TEY7SUFtTUEsNEJBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyw4REFBUDtNQUNBLElBQUEsRUFBTSxTQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO01BR0EsS0FBQSxFQUFPLEdBSFA7S0FwTUY7SUF3TUEsZUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLHdCQUFQO01BQ0EsV0FBQSxFQUFhLDhHQURiO01BRUEsSUFBQSxFQUFNLFFBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBSFQ7TUFJQSxLQUFBLEVBQU8sR0FKUDtLQXpNRjtJQThNQSxhQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sZ0JBQVA7TUFDQSxXQUFBLEVBQWEsMERBRGI7TUFFQSxJQUFBLEVBQU0sUUFGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FIVDtNQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixPQURJLEVBRUosT0FGSSxDQUpOO01BUUEsS0FBQSxFQUFPLEdBUlA7S0EvTUY7SUF3TkEsWUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGVBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsYUFGVDtNQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixhQURJLEVBRUosa0JBRkksRUFHSixvQkFISSxDQUhOO01BUUEsS0FBQSxFQUFPLEdBUlA7S0F6TkY7O0FBVEoiLCJzb3VyY2VzQ29udGVudCI6WyJzeW50YXhUaGVtZXMgPSBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VNZXRhZGF0YSgpIG9yIFtdXG5zeW50YXhUaGVtZXMgPSBzeW50YXhUaGVtZXMuZmlsdGVyIChzKS0+IHMudGhlbWUgPT0gJ3N5bnRheCdcbnN5bnRheFRoZW1lcyA9IHN5bnRheFRoZW1lcy5tYXAgKHMpLT4gcy5uYW1lXG5pZiAhc3ludGF4VGhlbWVzLmxlbmd0aFxuICBzeW50YXhUaGVtZXMgPSBbJ2F0b20tZGFyay1zeW50YXgnLCAnYXRvbS1saWdodC1zeW50YXgnLCAnb25lLWRhcmstc3ludGF4JywgJ29uZS1saWdodC1zeW50YXgnLCAnc29sYXJpemVkLWRhcmstc3ludGF4JywgJ3NvbGFyaXplZC1saWdodC1zeW50YXgnLCAnYmFzZTE2LXRvbW9ycm93LWRhcmstdGhlbWUnLCAnYmFzZTE2LXRvbW9ycm93LWxpZ2h0LXRoZW1lJ11cblxuc3ludGF4VGhlbWVzLnB1c2goJ21wZS1naXRodWItc3ludGF4JylcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGZpbGVFeHRlbnNpb246XG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIi5tZCwgLm1tYXJrLCAubWFya2Rvd25cIlxuICAgICAgZGVzY3JpcHRpb246IFwiWW91IG1heSBuZWVkIHJlc3RhcnQgQXRvbSBhZnRlciBtYWtpbmcgY2hhbmdlcyBoZXJlLlwiXG4gICAgICBvcmRlcjogMFxuICAgIHByZXZpZXdUaGVtZTpcbiAgICAgIHRpdGxlOiBcIlByZXZpZXcgVGhlbWVcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogc3ludGF4VGhlbWVzWzBdXG4gICAgICBlbnVtOiBzeW50YXhUaGVtZXNcbiAgICAgIG9yZGVyOiAxXG4gICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6XG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiSW4gTWFya2Rvd24sIGEgc2luZ2xlIG5ld2xpbmUgY2hhcmFjdGVyIGRvZXNuJ3QgY2F1c2UgYSBsaW5lIGJyZWFrIGluIHRoZSBnZW5lcmF0ZWQgSFRNTC4gSW4gR2l0SHViIEZsYXZvcmVkIE1hcmtkb3duLCB0aGF0IGlzIG5vdCB0cnVlLiBFbmFibGUgdGhpcyBjb25maWcgb3B0aW9uIHRvIGluc2VydCBsaW5lIGJyZWFrcyBpbiByZW5kZXJlZCBIVE1MIGZvciBzaW5nbGUgbmV3bGluZXMgaW4gTWFya2Rvd24gc291cmNlLlwiXG4gICAgICBvcmRlcjogMTBcbiAgICBlbmFibGVUeXBvZ3JhcGhlcjpcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiRW5hYmxlIHNtYXJ0eXBhbnRzIGFuZCBvdGhlciBzd2VldCB0cmFuc2Zvcm1zLlwiXG4gICAgICBvcmRlcjogMTFcbiAgICBzaG93QmFja1RvVG9wQnV0dG9uOlxuICAgICAgdGl0bGU6IFwiU2hvdyBiYWNrIHRvIHRvcCBidXR0b25cIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlNob3cgYmFjayB0byB0b3AgYnV0dG9uIGluIHByZXZpZXcuXCJcbiAgICAgIG9yZGVyOiAxMlxuICAgIGVuYWJsZVplbk1vZGU6XG4gICAgICB0aXRsZTogXCJaZW4gbW9kZVwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRpc3RyYWN0aW9uIGZyZWUgd3JpdGluZy5cIlxuICAgICAgb3JkZXI6IDEzXG4gICAgcHJvdG9jb2xzV2hpdGVMaXN0OlxuICAgICAgdGl0bGU6IFwiUHJvdG9jb2xzIFdoaXRlbGlzdFwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcImh0dHAsIGh0dHBzLCBhdG9tLCBmaWxlXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFjY2VwdGVkIHByb3RvY29scyBmb2xsb3dlZCBieSBgOi8vYCBmb3IgbGlua3MuIGAoUmVzdGFydCBpcyByZXF1aXJlZCB0byB0YWtlIGVmZmVjdClgXCJcbiAgICAgIG9yZGVyOiAxNVxuICAgIHVzZVBhbmRvY1BhcnNlcjpcbiAgICAgIHRpdGxlOiBcIlVzZSBQYW5kb2MgUGFyc2VyXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuYWJsZSB0aGlzIG9wdGlvbiB3aWxsIHJlbmRlciBtYXJrZG93biBieSBwYW5kb2MgaW5zdGVhZCBvZiByZW1hcmthYmxlLiBMaXZlIHVwZGF0ZSB3aWxsIGJlIGRpc2FibGVkIGF1dG9tYXRpY2FsbHkgaWYgdGhpcyBvcHRpb24gaXMgZW5hYmxlZC5cIlxuICAgICAgb3JkZXI6IDE2XG4gICAgcGFuZG9jUGF0aDpcbiAgICAgIHRpdGxlOiBcIlBhbmRvYyBPcHRpb25zOiBQYXRoXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwicGFuZG9jXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBsZWFzZSBzcGVjaWZ5IHRoZSBjb3JyZWN0IHBhdGggdG8geW91ciBwYW5kb2MgZXhlY3V0YWJsZVwiXG4gICAgICBvcmRlcjogMTdcbiAgICBwYW5kb2NBcmd1bWVudHM6XG4gICAgICB0aXRsZTogXCJQYW5kb2MgT3B0aW9uczogQ29tbWFuZGxpbmUgQXJndW1lbnRzXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OiBcIlwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBhcmd1bWVudHMgZS5nLiBgLS1zbWFydCwgLS1maWx0ZXI9L2Jpbi9leGVgLiBQbGVhc2UgdXNlIGxvbmcgYXJndW1lbnQgbmFtZXMuXCJcbiAgICAgIG9yZGVyOiAxOFxuICAgIG1hdGhSZW5kZXJpbmdPcHRpb246XG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIkthVGVYXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNob29zZSB0aGUgTWF0aCBleHByZXNzaW9uIHJlbmRlcmluZyBtZXRob2QgaGVyZS4gWW91IGNhbiBhbHNvIGRpc2FibGUgbWF0aCByZW5kZXJpbmcgaWYgeW91IHdhbnQgYnkgY2hvb3NpbmcgJ05vbmUnLlwiXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwiS2FUZVhcIixcbiAgICAgICAgXCJNYXRoSmF4XCIsXG4gICAgICAgIFwiTm9uZVwiXG4gICAgICBdXG4gICAgICBvcmRlcjogMjBcbiAgICBpbmRpY2F0b3JGb3JNYXRoUmVuZGVyaW5nSW5saW5lOlxuICAgICAgdGl0bGU6IFwiSW5saW5lIEluZGljYXRvclwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIltbXFxcIiRcXFwiLCBcXFwiJFxcXCJdXVwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJVc2UgY3VzdG9taXplZCBNYXRoIGV4cHJlc3Npb24gaW5saW5lIGluZGljYXRvci4gQnkgZGVmYXVsdCBpdCBpcyAnW1tcXFwiJFxcXCIsIFxcXCIkXFxcIl1dJywgd2hpY2ggbWVhbnMgY29udGVudCB3aXRoaW4gJyoqJCoqJyBhbmQgJyoqJCoqJyB3aWxsIGJlIHJlbmRlcmVkIGluIGlubGluZSBtb2RlLiBZb3UgY2FuIGFsc28gZGVmaW5lIG11bHRpcGxlIGluZGljYXRvcnMgc2VwYXJhdGVkIGJ5IGNvbW1hLiBGb3IgZXhhbXBsZSwgJ1tbXFxcIiRcXFwiLCBcXFwiJFxcXCJdLCBbXFxcIlxcXFxcXFxcXFxcXFxcXFwoXFxcIiwgXFxcIlxcXFxcXFxcXFxcXFxcXFwpXFxcIl1dJyB3aWxsIHJlbmRlciBpbmxpbmUgbWF0aCBleHByZXNzaW9uIHdpdGhpbiAnKiokKionIGFuZCAnKiokKionLCAnKipcXFxcXFxcXCgqKicgYW5kICcqKlxcXFxcXFxcKSoqJy4gYChSZXN0YXJ0IGlzIHJlcXVpcmVkIHRvIHRha2UgZWZmZWN0KWBcIlxuICAgICAgb3JkZXI6IDIxXG4gICAgaW5kaWNhdG9yRm9yTWF0aFJlbmRlcmluZ0Jsb2NrOlxuICAgICAgdGl0bGU6IFwiQmxvY2sgSW5kaWNhdG9yXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiW1tcXFwiJCRcXFwiLCBcXFwiJCRcXFwiXV1cIlxuICAgICAgZGVzY3JpcHRpb246IFwiVXNlIGN1c3RvbWl6ZWQgTWF0aCBleHByZXNzaW9uIGJsb2NrIGluZGljYXRvci4gQnkgZGVmYXVsdCBpdCBpcyBbW1xcXCIkJFxcXCIsIFxcXCIkJFxcXCJdXS4gYChSZXN0YXJ0IGlzIHJlcXVpcmVkIHRvIHRha2UgZWZmZWN0KWBcIlxuICAgICAgb3JkZXI6IDIyXG4gICAgbWF0aEpheFByb2Nlc3NFbnZpcm9ubWVudHM6XG4gICAgICB0aXRsZTogXCJNYXRoSmF4IHByb2Nlc3NFbnZpcm9ubWVudHNcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJOb3RlIHRoYXQsIGFzIG9wcG9zZWQgdG8gdHJ1ZSBMYVRlWCwgTWF0aEpheCBwcm9jZXNzZXMgYWxsIGVudmlyb25tZW50cyB3aGVuIHdyYXBwZWQgaW5zaWRlIG1hdGggZGVsaW1pdGVycy4gQnkgZGVmYXV0LCBNYXRoSmF4IHdpbGwgYWxzbyByZW5kZXIgYWxsIGVudmlyb25tZW50cyBvdXRzaWRlIG9mIGRlbGltaXRlcnM7IHRoaXMgY2FuIGJlIGNvbnRyb2xsZWQgdmlhIHRoZSBwcm9jZXNzRW52aXJvbm1lbnRzIG9wdGlvbi4gYExpdmUgVXBkYXRlYCBpcyByZWNvbW1lbmRlZCB0byBiZSBkaXNhYmxlZCB3aGVuIHRoaXMgb3B0aW9uIGlzIGVuYWJsZWQuIGAoUmVzdGFydCBpcyByZXF1aXJlZCB0byB0YWtlIGVmZmVjdClgXCJcbiAgICAgIG9yZGVyOiAyM1xuICAgIGVuYWJsZVdpa2lMaW5rU3ludGF4OlxuICAgICAgdGl0bGU6IFwiRW5hYmxlIFdpa2kgTGluayBzeW50YXhcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuYWJsZSBXaWtpIExpbmsgc3ludGF4IHN1cHBvcnQuIE1vcmUgaW5mb3JtYXRpb24gY2FuIGJlIGZvdW5kIGF0IGh0dHBzOi8vaGVscC5naXRodWIuY29tL2FydGljbGVzL2FkZGluZy1saW5rcy10by13aWtpcy9cIlxuICAgICAgb3JkZXI6IDMwXG4gICAgdXNlU3RhbmRhcmRDb2RlRmVuY2luZ0ZvckdyYXBoczpcbiAgICAgIHRpdGxlOiBcIlVzZSBzdGFuZGFyZCBjb2RlIGZlbmNpbmcgZm9yIGdyYXBoc1wiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiVXNlIHN0YW5kYXJkIGNvZGUgZmVuY2luZyBmb3IgZ3JhcGhzLiBGb3IgZXhhbXBsZSwgY29kZSBibG9jayBgbWVybWFpZGAgb3IgYEBtZXJtYWlkYCB3aWxsIHJlbmRlciBtZXJtYWlkIGdyYXBocy4gSWYgdGhpcyBvcHRpb24gaXMgZGlzYWJsZWQsIHRoZW4gb25seSBgQG1lcm1haWRgIHdpbGwgcmVuZGVyIG1lcm1haWQgZ3JhcGhzLiBXb3JrcyBmb3IgbWVybWFpZCwgdml6LCBwbGFudHVtbCwgYW5kIHdhdmVkcm9tLlwiXG4gICAgICBvcmRlcjogMzFcbiAgICBsaXZlVXBkYXRlOlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlJlLXJlbmRlciB0aGUgcHJldmlldyBhcyB0aGUgY29udGVudHMgb2YgdGhlIHNvdXJjZSBjaGFuZ2VzLCB3aXRob3V0IHJlcXVpcmluZyB0aGUgc291cmNlIGJ1ZmZlciB0byBiZSBzYXZlZC4gSWYgZGlzYWJsZWQsIHRoZSBwcmV2aWV3IGlzIHJlLXJlbmRlcmVkIG9ubHkgd2hlbiB0aGUgYnVmZmVyIGlzIHNhdmVkIHRvIGRpc2suIERpc2FibGUgbGl2ZSB1cGRhdGUgd2lsbCBhbHNvIGRpc2FibGUgc2Nyb2xsIHN5bmMuXCJcbiAgICAgIG9yZGVyOiA2MFxuICAgIGZyb250TWF0dGVyUmVuZGVyaW5nT3B0aW9uOlxuICAgICAgdGl0bGU6IFwiRnJvbnQgTWF0dGVyIHJlbmRlcmluZyBvcHRpb25cIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVzY3JpcHRpb246IFwiWW91IGNhbiBjaG9vc2UgaG93IHRvIHJlbmRlciBmcm9udCBtYXR0ZXIgaGVyZS4gJ25vbmUnIG9wdGlvbiB3aWxsIGhpZGUgZnJvbnQgbWF0dGVyLlwiXG4gICAgICBkZWZhdWx0OiBcInRhYmxlXCJcbiAgICAgIGVudW06IFtcbiAgICAgICAgXCJ0YWJsZVwiLFxuICAgICAgICBcImNvZGUgYmxvY2tcIixcbiAgICAgICAgXCJub25lXCJcbiAgICAgIF0sXG4gICAgICBvcmRlcjogNzBcbiAgICBzY3JvbGxTeW5jOlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIjIgd2F5IHNjcm9sbCBzeW5jLiBTeW5jIGJvdGggbWFya2Rvd24gc291cmNlIGFuZCBtYXJrZG93biBwcmV2aWV3IHdoZW4gc2Nyb2xsaW5nLlwiXG4gICAgICBvcmRlcjogNzVcbiAgICBzY3JvbGxEdXJhdGlvbjpcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiMTIwXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlNjcm9sbCBkdXJhdGlvbiBpcyBkZWZpbmVkIGluIG1pbGxpc2Vjb25kcy4gTG93ZXIgdmFsdWUgaW5kaWNhdGVzIGZhc3RlciBzY3JvbGxpbmcgc3BlZWQuIERlZmF1bHQgaXMgMTIwbXNcIlxuICAgICAgb3JkZXI6IDc2XG4gICAgZG9jdW1lbnRFeHBvcnRQYXRoOlxuICAgICAgdGl0bGU6IFwiZG9jdW1lbnQgZXhwb3J0IGZvbGRlciBwYXRoXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIldoZW4gZXhwb3J0aW5nIGRvY3VtZW50IHRvIGRpc2ssIGJ5IGRlZmF1bHQgdGhlIGRvY3VtZW50IHdpbGwgYmUgZ2VuZXJhdGVkIGF0IHRoZSByb290IHBhdGggJy4vJ1wiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIi4vXCJcbiAgICAgIG9yZGVyOiA3N1xuICAgIGV4cG9ydFBERlBhZ2VGb3JtYXQ6XG4gICAgICB0aXRsZTogXCJQZGYgUGFnZSBGb3JtYXRcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJMZXR0ZXJcIlxuICAgICAgZW51bTogW1xuICAgICAgICBcIkEzXCIsXG4gICAgICAgIFwiQTRcIixcbiAgICAgICAgXCJBNVwiLFxuICAgICAgICBcIkxlZ2FsXCIsXG4gICAgICAgIFwiTGV0dGVyXCIsXG4gICAgICAgIFwiVGFibG9pZFwiXG4gICAgICBdXG4gICAgICBvcmRlcjogODBcbiAgICBvcmllbnRhdGlvbjpcbiAgICAgIHRpdGxlOiBcIlBkZiBQYWdlIE9yaWVudGF0aW9uXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwicG9ydHJhaXRcIlxuICAgICAgZW51bTogW1xuICAgICAgICBcInBvcnRyYWl0XCIsXG4gICAgICAgIFwibGFuZHNjYXBlXCJcbiAgICAgIF1cbiAgICAgIG9yZGVyOiA5MFxuICAgIG1hcmdpbnNUeXBlOlxuICAgICAgdGl0bGU6IFwiUGRmIE1hcmdpbiB0eXBlXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiZGVmYXVsdCBtYXJnaW5cIlxuICAgICAgZW51bTogW1xuICAgICAgICBcImRlZmF1bHQgbWFyZ2luXCIsXG4gICAgICAgIFwibm8gbWFyZ2luXCIsXG4gICAgICAgIFwibWluaW11bSBtYXJnaW5cIlxuICAgICAgXVxuICAgICAgb3JkZXI6IDEwMFxuICAgIHByaW50QmFja2dyb3VuZDpcbiAgICAgIHRpdGxlOiBcIlByaW50IEJhY2tncm91bmQgd2hlbiBnZW5lcmF0aW5nIHBkZlwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiSW5jbHVkZSBiYWNrZ3JvdW5kIGNvbG9yIHdoZW4gZ2VuZXJhdGluZyBwZGYuXCJcbiAgICAgIG9yZGVyOiAxMTBcbiAgICBwZGZVc2VHaXRodWI6XG4gICAgICB0aXRsZTogXCJVc2UgR2l0aHViIHN0eWxlIHdoZW4gZ2VuZXJhdGluZyBwZGZcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIklmIHlvdSBlbmFibGVkIHRoaXMgb3B0aW9uLCB0aGVuIHRoZSBwZGYgd2lsbCBiZSBnZW5lcmF0ZWQgdXNpbmcgR2l0aHViIFN0eWxlLiBJIGFkZCB0aGlzIG9wdGlvbiBiZWNhdXNlIGlmIHRoZSBtYXJrZG93biBwcmV2aWV3IGhhcyBibGFjayBjb2xvciBiYWNrZ3JvdW5kLCB0aGVuIHRoZSBnZW5lcmF0ZWQgcGRmIG1heSBhbHNvIGhhdmUgYmxhY2sgY29sb3IgYmFja2dyb3VuZCAoaWYgeW91IGVuYWJsZWQgUHJpbnQgQmFja2dyb3VuZCksIHdoaWNoIG1heSBhZmZlY3QgdGhlIGFwcGVhcmFuY2Ugb2YgdGhlIGdlbmVyYXRlZCBwZGYuXCJcbiAgICAgIG9yZGVyOiAxMjBcbiAgICBwZGZPcGVuQXV0b21hdGljYWxseTpcbiAgICAgIHRpdGxlOiBcIk9wZW4gcGRmIGZpbGUgaW1tZWRpYXRlbHkgYWZ0ZXIgaXQgaXMgZ2VuZXJhdGVkXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiB5b3UgZW5hYmxlZCB0aGlzIG9wdGlvbiwgdGhlbiB3aGVuIHBkZiBpcyBnZW5lcmF0ZWQsIGl0IHdpbGwgYmUgb3BlbmVkIGJ5IHBkZiB2aWV3ZXIuIEZvciBleGFtcGxlLCBvbiBNYWMgT1MgWCwgaXQgd2lsbCBiZSBvcGVuZWQgYnkgUHJldmlldy5cIlxuICAgICAgb3JkZXI6IDEzMFxuICAgIHBoYW50b21KU0V4cG9ydEZpbGVUeXBlOlxuICAgICAgdGl0bGU6IFwiUGhhbnRvbUpTIGV4cG9ydCBmaWxlIHR5cGVcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJwZGZcIlxuICAgICAgZW51bTogW1xuICAgICAgICBcInBkZlwiLFxuICAgICAgICBcInBuZ1wiLFxuICAgICAgICBcImpwZWdcIlxuICAgICAgXSxcbiAgICAgIG9yZGVyOiAxMzFcbiAgICBwaGFudG9tSlNNYXJnaW46XG4gICAgICB0aXRsZTogXCJQaGFudG9tSlMgbWFyZ2luc1wiXG4gICAgICBkZXNjcmlwdGlvbjogXCJEZWZhdWx0IGlzIDAsIHVuaXRzOiBtbSwgY20sIGluLCBweC4gWW91IGNhbiBhbHNvIGRlZmluZSAndG9wLCByaWdodCwgYm90dG9tLCBsZWZ0JyBtYXJnaW5zIGluIG9yZGVyIGxpa2UgJzFjbSwgMWNtLCAxY20sIDFjbScgc2VwYXJhdGVkIGJ5IGNvbW1hICcsJy5cIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCIxY21cIlxuICAgICAgb3JkZXI6IDEzMlxuICAgIG9wZW5QcmV2aWV3UGFuZUF1dG9tYXRpY2FsbHk6XG4gICAgICB0aXRsZTogXCJPcGVuIHByZXZpZXcgcGFuZSBhdXRvbWF0aWNhbGx5IHdoZW4gb3BlbmluZyBhIG1hcmtkb3duIGZpbGVcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAxNDBcbiAgICBpbWFnZUZvbGRlclBhdGg6XG4gICAgICB0aXRsZTogXCJJbWFnZSBzYXZlIGZvbGRlciBwYXRoXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIldoZW4gdXNpbmcgSW1hZ2UgSGVscGVyIHRvIGNvcHkgaW1hZ2VzLCBieSBkZWZhdWx0IGltYWdlcyB3aWxsIGJlIGNvcGllZCB0byByb290IGltYWdlIGZvbGRlciBwYXRoICcvYXNzZXRzJ1wiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIi9hc3NldHNcIlxuICAgICAgb3JkZXI6IDE1MFxuICAgIGltYWdlVXBsb2FkZXI6XG4gICAgICB0aXRsZTogXCJJbWFnZSBVcGxvYWRlclwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJ5b3UgY2FuIGNob29zZSBkaWZmZXJlbnQgaW1hZ2UgdXBsb2FkZXIgdG8gdXBsb2FkIGltYWdlLlwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcImltZ3VyXCJcbiAgICAgIGVudW06IFtcbiAgICAgICAgXCJpbWd1clwiLFxuICAgICAgICBcInNtLm1zXCJcbiAgICAgIF1cbiAgICAgIG9yZGVyOiAxNjBcbiAgICBtZXJtYWlkVGhlbWU6XG4gICAgICB0aXRsZTogXCJNZXJtYWlkIFRoZW1lXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwibWVybWFpZC5jc3NcIlxuICAgICAgZW51bTogW1xuICAgICAgICBcIm1lcm1haWQuY3NzXCIsXG4gICAgICAgIFwibWVybWFpZC5kYXJrLmNzc1wiLFxuICAgICAgICBcIm1lcm1haWQuZm9yZXN0LmNzc1wiXG4gICAgICBdXG4gICAgICBvcmRlcjogMTcwXG4iXX0=
