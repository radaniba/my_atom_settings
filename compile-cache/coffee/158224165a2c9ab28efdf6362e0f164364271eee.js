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
    pandocMarkdownFlavor: {
      type: 'string',
      "default": 'markdown-raw_tex+tex_math_single_backslash',
      title: 'Pandoc Options: Markdown Flavor',
      description: 'Enter the pandoc markdown flavor you want',
      order: 19
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9jb25maWctc2NoZW1hLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxRQUFRLENBQUMsMkJBQWQsQ0FBQSxDQUFBLElBQStDOztFQUM5RCxZQUFBLEdBQWUsWUFBWSxDQUFDLE1BQWIsQ0FBb0IsU0FBQyxDQUFEO1dBQU0sQ0FBQyxDQUFDLEtBQUYsS0FBVztFQUFqQixDQUFwQjs7RUFDZixZQUFBLEdBQWUsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsU0FBQyxDQUFEO1dBQU0sQ0FBQyxDQUFDO0VBQVIsQ0FBakI7O0VBQ2YsSUFBRyxDQUFDLFlBQVksQ0FBQyxNQUFqQjtJQUNFLFlBQUEsR0FBZSxDQUFDLGtCQUFELEVBQXFCLG1CQUFyQixFQUEwQyxpQkFBMUMsRUFBNkQsa0JBQTdELEVBQWlGLHVCQUFqRixFQUEwRyx3QkFBMUcsRUFBb0ksNEJBQXBJLEVBQWtLLDZCQUFsSyxFQURqQjs7O0VBR0EsWUFBWSxDQUFDLElBQWIsQ0FBa0IsbUJBQWxCOztFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxhQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsd0JBRFQ7TUFFQSxXQUFBLEVBQWEsc0RBRmI7TUFHQSxLQUFBLEVBQU8sQ0FIUDtLQURGO0lBS0EsWUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGVBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsbUJBRlQ7TUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLFlBSE47TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQU5GO0lBV0EsZUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGtCQUFQO01BQ0EsSUFBQSxFQUFNLFNBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7TUFHQSxXQUFBLEVBQWEseUNBSGI7TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQVpGO0lBaUJBLG9CQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtNQUVBLFdBQUEsRUFBYSxtUEFGYjtNQUdBLEtBQUEsRUFBTyxFQUhQO0tBbEJGO0lBc0JBLGlCQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtNQUVBLFdBQUEsRUFBYSxnREFGYjtNQUdBLEtBQUEsRUFBTyxFQUhQO0tBdkJGO0lBMkJBLG1CQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8seUJBQVA7TUFDQSxJQUFBLEVBQU0sU0FETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtNQUdBLFdBQUEsRUFBYSxxQ0FIYjtNQUlBLEtBQUEsRUFBTyxFQUpQO0tBNUJGO0lBaUNBLGFBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxVQUFQO01BQ0EsSUFBQSxFQUFNLFNBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7TUFHQSxXQUFBLEVBQWEsMkJBSGI7TUFJQSxLQUFBLEVBQU8sRUFKUDtLQWxDRjtJQXVDQSxrQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLHFCQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLHlCQUZUO01BR0EsV0FBQSxFQUFhLHdGQUhiO01BSUEsS0FBQSxFQUFPLEVBSlA7S0F4Q0Y7SUE2Q0EsZUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG1CQUFQO01BQ0EsSUFBQSxFQUFNLFNBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7TUFHQSxXQUFBLEVBQWEsZ0pBSGI7TUFJQSxLQUFBLEVBQU8sRUFKUDtLQTlDRjtJQW1EQSxVQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sc0JBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsUUFGVDtNQUdBLFdBQUEsRUFBYSwyREFIYjtNQUlBLEtBQUEsRUFBTyxFQUpQO0tBcERGO0lBeURBLGVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyx1Q0FBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO01BR0EsV0FBQSxFQUFhLHFHQUhiO01BSUEsS0FBQSxFQUFPLEVBSlA7S0ExREY7SUErREEsb0JBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxRQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyw0Q0FEVDtNQUVBLEtBQUEsRUFBTyxpQ0FGUDtNQUdBLFdBQUEsRUFBYSwyQ0FIYjtNQUlBLEtBQUEsRUFBTyxFQUpQO0tBaEVGO0lBcUVBLG1CQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sUUFBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FEVDtNQUVBLFdBQUEsRUFBYSx1SEFGYjtNQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixPQURJLEVBRUosU0FGSSxFQUdKLE1BSEksQ0FITjtNQVFBLEtBQUEsRUFBTyxFQVJQO0tBdEVGO0lBK0VBLCtCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sa0JBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsa0JBRlQ7TUFHQSxXQUFBLEVBQWEsc2FBSGI7TUFJQSxLQUFBLEVBQU8sRUFKUDtLQWhGRjtJQXFGQSw4QkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGlCQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLG9CQUZUO01BR0EsV0FBQSxFQUFhLDZIQUhiO01BSUEsS0FBQSxFQUFPLEVBSlA7S0F0RkY7SUEyRkEsMEJBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyw2QkFBUDtNQUNBLElBQUEsRUFBTSxTQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUZUO01BR0EsV0FBQSxFQUFhLHFXQUhiO01BSUEsS0FBQSxFQUFPLEVBSlA7S0E1RkY7SUFpR0Esb0JBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyx5QkFBUDtNQUNBLElBQUEsRUFBTSxTQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO01BR0EsV0FBQSxFQUFhLDJIQUhiO01BSUEsS0FBQSxFQUFPLEVBSlA7S0FsR0Y7SUF1R0EscUJBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTywwQkFBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUZUO01BR0EsV0FBQSxFQUFhLDBEQUhiO01BSUEsS0FBQSxFQUFPLEVBSlA7S0F4R0Y7SUE2R0EsK0JBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxzQ0FBUDtNQUNBLElBQUEsRUFBTSxTQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO01BR0EsV0FBQSxFQUFhLGdQQUhiO01BSUEsS0FBQSxFQUFPLEVBSlA7S0E5R0Y7SUFtSEEsVUFBQSxFQUNFO01BQUEsSUFBQSxFQUFNLFNBQU47TUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7TUFFQSxXQUFBLEVBQWEsaVBBRmI7TUFHQSxLQUFBLEVBQU8sRUFIUDtLQXBIRjtJQXdIQSwwQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLCtCQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxXQUFBLEVBQWEsdUZBRmI7TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE9BSFQ7TUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQ0osT0FESSxFQUVKLFlBRkksRUFHSixNQUhJLENBSk47TUFTQSxLQUFBLEVBQU8sRUFUUDtLQXpIRjtJQW1JQSxVQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtNQUVBLFdBQUEsRUFBYSxtRkFGYjtNQUdBLEtBQUEsRUFBTyxFQUhQO0tBcElGO0lBd0lBLGNBQUEsRUFDRTtNQUFBLElBQUEsRUFBTSxRQUFOO01BQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO01BRUEsV0FBQSxFQUFhLDRHQUZiO01BR0EsS0FBQSxFQUFPLEVBSFA7S0F6SUY7SUE2SUEsa0JBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyw2QkFBUDtNQUNBLFdBQUEsRUFBYSxrR0FEYjtNQUVBLElBQUEsRUFBTSxRQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO01BSUEsS0FBQSxFQUFPLEVBSlA7S0E5SUY7SUFtSkEsbUJBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxpQkFBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxRQUZUO01BR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUNKLElBREksRUFFSixJQUZJLEVBR0osSUFISSxFQUlKLE9BSkksRUFLSixRQUxJLEVBTUosU0FOSSxDQUhOO01BV0EsS0FBQSxFQUFPLEVBWFA7S0FwSkY7SUFnS0EsV0FBQSxFQUNFO01BQUEsS0FBQSxFQUFPLHNCQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFVBRlQ7TUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQ0osVUFESSxFQUVKLFdBRkksQ0FITjtNQU9BLEtBQUEsRUFBTyxFQVBQO0tBaktGO0lBeUtBLFdBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxpQkFBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxnQkFGVDtNQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixnQkFESSxFQUVKLFdBRkksRUFHSixnQkFISSxDQUhOO01BUUEsS0FBQSxFQUFPLEdBUlA7S0ExS0Y7SUFtTEEsZUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLHNDQUFQO01BQ0EsSUFBQSxFQUFNLFNBRE47TUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7TUFHQSxXQUFBLEVBQWEsK0NBSGI7TUFJQSxLQUFBLEVBQU8sR0FKUDtLQXBMRjtJQXlMQSxZQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sc0NBQVA7TUFDQSxJQUFBLEVBQU0sU0FETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtNQUdBLFdBQUEsRUFBYSxtVEFIYjtNQUlBLEtBQUEsRUFBTyxHQUpQO0tBMUxGO0lBK0xBLG9CQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8saURBQVA7TUFDQSxJQUFBLEVBQU0sU0FETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtNQUdBLFdBQUEsRUFBYSxrSkFIYjtNQUlBLEtBQUEsRUFBTyxHQUpQO0tBaE1GO0lBcU1BLHVCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sNEJBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtNQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixLQURJLEVBRUosS0FGSSxFQUdKLE1BSEksQ0FITjtNQVFBLEtBQUEsRUFBTyxHQVJQO0tBdE1GO0lBK01BLGVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxtQkFBUDtNQUNBLFdBQUEsRUFBYSx3SkFEYjtNQUVBLElBQUEsRUFBTSxRQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO01BSUEsS0FBQSxFQUFPLEdBSlA7S0FoTkY7SUFxTkEsNEJBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyw4REFBUDtNQUNBLElBQUEsRUFBTSxTQUROO01BRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO01BR0EsS0FBQSxFQUFPLEdBSFA7S0F0TkY7SUEwTkEsZUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLHdCQUFQO01BQ0EsV0FBQSxFQUFhLDhHQURiO01BRUEsSUFBQSxFQUFNLFFBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBSFQ7TUFJQSxLQUFBLEVBQU8sR0FKUDtLQTNORjtJQWdPQSxhQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sZ0JBQVA7TUFDQSxXQUFBLEVBQWEsMERBRGI7TUFFQSxJQUFBLEVBQU0sUUFGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FIVDtNQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixPQURJLEVBRUosT0FGSSxDQUpOO01BUUEsS0FBQSxFQUFPLEdBUlA7S0FqT0Y7SUEwT0EsWUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGVBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsYUFGVDtNQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSixhQURJLEVBRUosa0JBRkksRUFHSixvQkFISSxDQUhOO01BUUEsS0FBQSxFQUFPLEdBUlA7S0EzT0Y7O0FBVEoiLCJzb3VyY2VzQ29udGVudCI6WyJzeW50YXhUaGVtZXMgPSBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VNZXRhZGF0YSgpIG9yIFtdXG5zeW50YXhUaGVtZXMgPSBzeW50YXhUaGVtZXMuZmlsdGVyIChzKS0+IHMudGhlbWUgPT0gJ3N5bnRheCdcbnN5bnRheFRoZW1lcyA9IHN5bnRheFRoZW1lcy5tYXAgKHMpLT4gcy5uYW1lXG5pZiAhc3ludGF4VGhlbWVzLmxlbmd0aFxuICBzeW50YXhUaGVtZXMgPSBbJ2F0b20tZGFyay1zeW50YXgnLCAnYXRvbS1saWdodC1zeW50YXgnLCAnb25lLWRhcmstc3ludGF4JywgJ29uZS1saWdodC1zeW50YXgnLCAnc29sYXJpemVkLWRhcmstc3ludGF4JywgJ3NvbGFyaXplZC1saWdodC1zeW50YXgnLCAnYmFzZTE2LXRvbW9ycm93LWRhcmstdGhlbWUnLCAnYmFzZTE2LXRvbW9ycm93LWxpZ2h0LXRoZW1lJ11cblxuc3ludGF4VGhlbWVzLnB1c2goJ21wZS1naXRodWItc3ludGF4JylcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGZpbGVFeHRlbnNpb246XG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIi5tZCwgLm1tYXJrLCAubWFya2Rvd25cIlxuICAgICAgZGVzY3JpcHRpb246IFwiWW91IG1heSBuZWVkIHJlc3RhcnQgQXRvbSBhZnRlciBtYWtpbmcgY2hhbmdlcyBoZXJlLlwiXG4gICAgICBvcmRlcjogMFxuICAgIHByZXZpZXdUaGVtZTpcbiAgICAgIHRpdGxlOiBcIlByZXZpZXcgVGhlbWVcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogJ21wZS1naXRodWItc3ludGF4J1xuICAgICAgZW51bTogc3ludGF4VGhlbWVzXG4gICAgICBvcmRlcjogMVxuICAgIHdoaXRlQmFja2dyb3VuZDpcbiAgICAgIHRpdGxlOiBcIldoaXRlIGJhY2tncm91bmRcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJVc2Ugd2hpdGUgYmFja2dyb3VuZCBjb2xvciBmb3IgcHJldmlldy5cIlxuICAgICAgb3JkZXI6IDJcbiAgICBicmVha09uU2luZ2xlTmV3bGluZTpcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbiBNYXJrZG93biwgYSBzaW5nbGUgbmV3bGluZSBjaGFyYWN0ZXIgZG9lc24ndCBjYXVzZSBhIGxpbmUgYnJlYWsgaW4gdGhlIGdlbmVyYXRlZCBIVE1MLiBJbiBHaXRIdWIgRmxhdm9yZWQgTWFya2Rvd24sIHRoYXQgaXMgbm90IHRydWUuIEVuYWJsZSB0aGlzIGNvbmZpZyBvcHRpb24gdG8gaW5zZXJ0IGxpbmUgYnJlYWtzIGluIHJlbmRlcmVkIEhUTUwgZm9yIHNpbmdsZSBuZXdsaW5lcyBpbiBNYXJrZG93biBzb3VyY2UuXCJcbiAgICAgIG9yZGVyOiAxMFxuICAgIGVuYWJsZVR5cG9ncmFwaGVyOlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJFbmFibGUgc21hcnR5cGFudHMgYW5kIG90aGVyIHN3ZWV0IHRyYW5zZm9ybXMuXCJcbiAgICAgIG9yZGVyOiAxMVxuICAgIHNob3dCYWNrVG9Ub3BCdXR0b246XG4gICAgICB0aXRsZTogXCJTaG93IGJhY2sgdG8gdG9wIGJ1dHRvblwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiU2hvdyBiYWNrIHRvIHRvcCBidXR0b24gaW4gcHJldmlldy5cIlxuICAgICAgb3JkZXI6IDEyXG4gICAgZW5hYmxlWmVuTW9kZTpcbiAgICAgIHRpdGxlOiBcIlplbiBtb2RlXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246IFwiRGlzdHJhY3Rpb24gZnJlZSB3cml0aW5nLlwiXG4gICAgICBvcmRlcjogMTNcbiAgICBwcm90b2NvbHNXaGl0ZUxpc3Q6XG4gICAgICB0aXRsZTogXCJQcm90b2NvbHMgV2hpdGVsaXN0XCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiaHR0cCwgaHR0cHMsIGF0b20sIGZpbGVcIlxuICAgICAgZGVzY3JpcHRpb246IFwiQWNjZXB0ZWQgcHJvdG9jb2xzIGZvbGxvd2VkIGJ5IGA6Ly9gIGZvciBsaW5rcy4gYChSZXN0YXJ0IGlzIHJlcXVpcmVkIHRvIHRha2UgZWZmZWN0KWBcIlxuICAgICAgb3JkZXI6IDE1XG4gICAgdXNlUGFuZG9jUGFyc2VyOlxuICAgICAgdGl0bGU6IFwiVXNlIFBhbmRvYyBQYXJzZXJcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246IFwiRW5hYmxlIHRoaXMgb3B0aW9uIHdpbGwgcmVuZGVyIG1hcmtkb3duIGJ5IHBhbmRvYyBpbnN0ZWFkIG9mIHJlbWFya2FibGUuIExpdmUgdXBkYXRlIHdpbGwgYmUgZGlzYWJsZWQgYXV0b21hdGljYWxseSBpZiB0aGlzIG9wdGlvbiBpcyBlbmFibGVkLlwiXG4gICAgICBvcmRlcjogMTZcbiAgICBwYW5kb2NQYXRoOlxuICAgICAgdGl0bGU6IFwiUGFuZG9jIE9wdGlvbnM6IFBhdGhcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJwYW5kb2NcIlxuICAgICAgZGVzY3JpcHRpb246IFwiUGxlYXNlIHNwZWNpZnkgdGhlIGNvcnJlY3QgcGF0aCB0byB5b3VyIHBhbmRvYyBleGVjdXRhYmxlXCJcbiAgICAgIG9yZGVyOiAxN1xuICAgIHBhbmRvY0FyZ3VtZW50czpcbiAgICAgIHRpdGxlOiBcIlBhbmRvYyBPcHRpb25zOiBDb21tYW5kbGluZSBBcmd1bWVudHNcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGRlZmF1bHQ6IFwiXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJDb21tYSBzZXBhcmF0ZWQgcGFuZG9jIGFyZ3VtZW50cyBlLmcuIGAtLXNtYXJ0LCAtLWZpbHRlcj0vYmluL2V4ZWAuIFBsZWFzZSB1c2UgbG9uZyBhcmd1bWVudCBuYW1lcy5cIlxuICAgICAgb3JkZXI6IDE4XG4gICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ21hcmtkb3duLXJhd190ZXgrdGV4X21hdGhfc2luZ2xlX2JhY2tzbGFzaCcgIyAnbWFya2Rvd24tcmF3X3RleCt0ZXhfbWF0aF9kb2xsYXJzJ1xuICAgICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogTWFya2Rvd24gRmxhdm9yJ1xuICAgICAgZGVzY3JpcHRpb246ICdFbnRlciB0aGUgcGFuZG9jIG1hcmtkb3duIGZsYXZvciB5b3Ugd2FudCdcbiAgICAgIG9yZGVyOiAxOVxuICAgIG1hdGhSZW5kZXJpbmdPcHRpb246XG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIkthVGVYXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNob29zZSB0aGUgTWF0aCBleHByZXNzaW9uIHJlbmRlcmluZyBtZXRob2QgaGVyZS4gWW91IGNhbiBhbHNvIGRpc2FibGUgbWF0aCByZW5kZXJpbmcgaWYgeW91IHdhbnQgYnkgY2hvb3NpbmcgJ05vbmUnLlwiXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwiS2FUZVhcIixcbiAgICAgICAgXCJNYXRoSmF4XCIsXG4gICAgICAgIFwiTm9uZVwiXG4gICAgICBdXG4gICAgICBvcmRlcjogMjBcbiAgICBpbmRpY2F0b3JGb3JNYXRoUmVuZGVyaW5nSW5saW5lOlxuICAgICAgdGl0bGU6IFwiSW5saW5lIEluZGljYXRvclwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIltbXFxcIiRcXFwiLCBcXFwiJFxcXCJdXVwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJVc2UgY3VzdG9taXplZCBNYXRoIGV4cHJlc3Npb24gaW5saW5lIGluZGljYXRvci4gQnkgZGVmYXVsdCBpdCBpcyAnW1tcXFwiJFxcXCIsIFxcXCIkXFxcIl1dJywgd2hpY2ggbWVhbnMgY29udGVudCB3aXRoaW4gJyoqJCoqJyBhbmQgJyoqJCoqJyB3aWxsIGJlIHJlbmRlcmVkIGluIGlubGluZSBtb2RlLiBZb3UgY2FuIGFsc28gZGVmaW5lIG11bHRpcGxlIGluZGljYXRvcnMgc2VwYXJhdGVkIGJ5IGNvbW1hLiBGb3IgZXhhbXBsZSwgJ1tbXFxcIiRcXFwiLCBcXFwiJFxcXCJdLCBbXFxcIlxcXFxcXFxcXFxcXFxcXFwoXFxcIiwgXFxcIlxcXFxcXFxcXFxcXFxcXFwpXFxcIl1dJyB3aWxsIHJlbmRlciBpbmxpbmUgbWF0aCBleHByZXNzaW9uIHdpdGhpbiAnKiokKionIGFuZCAnKiokKionLCAnKipcXFxcXFxcXCgqKicgYW5kICcqKlxcXFxcXFxcKSoqJy4gYChSZXN0YXJ0IGlzIHJlcXVpcmVkIHRvIHRha2UgZWZmZWN0KWBcIlxuICAgICAgb3JkZXI6IDIxXG4gICAgaW5kaWNhdG9yRm9yTWF0aFJlbmRlcmluZ0Jsb2NrOlxuICAgICAgdGl0bGU6IFwiQmxvY2sgSW5kaWNhdG9yXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiW1tcXFwiJCRcXFwiLCBcXFwiJCRcXFwiXV1cIlxuICAgICAgZGVzY3JpcHRpb246IFwiVXNlIGN1c3RvbWl6ZWQgTWF0aCBleHByZXNzaW9uIGJsb2NrIGluZGljYXRvci4gQnkgZGVmYXVsdCBpdCBpcyBbW1xcXCIkJFxcXCIsIFxcXCIkJFxcXCJdXS4gYChSZXN0YXJ0IGlzIHJlcXVpcmVkIHRvIHRha2UgZWZmZWN0KWBcIlxuICAgICAgb3JkZXI6IDIyXG4gICAgbWF0aEpheFByb2Nlc3NFbnZpcm9ubWVudHM6XG4gICAgICB0aXRsZTogXCJNYXRoSmF4IHByb2Nlc3NFbnZpcm9ubWVudHNcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogXCJOb3RlIHRoYXQsIGFzIG9wcG9zZWQgdG8gdHJ1ZSBMYVRlWCwgTWF0aEpheCBwcm9jZXNzZXMgYWxsIGVudmlyb25tZW50cyB3aGVuIHdyYXBwZWQgaW5zaWRlIG1hdGggZGVsaW1pdGVycy4gQnkgZGVmYXV0LCBNYXRoSmF4IHdpbGwgYWxzbyByZW5kZXIgYWxsIGVudmlyb25tZW50cyBvdXRzaWRlIG9mIGRlbGltaXRlcnM7IHRoaXMgY2FuIGJlIGNvbnRyb2xsZWQgdmlhIHRoZSBwcm9jZXNzRW52aXJvbm1lbnRzIG9wdGlvbi4gYExpdmUgVXBkYXRlYCBpcyByZWNvbW1lbmRlZCB0byBiZSBkaXNhYmxlZCB3aGVuIHRoaXMgb3B0aW9uIGlzIGVuYWJsZWQuIGAoUmVzdGFydCBpcyByZXF1aXJlZCB0byB0YWtlIGVmZmVjdClgXCJcbiAgICAgIG9yZGVyOiAyM1xuICAgIGVuYWJsZVdpa2lMaW5rU3ludGF4OlxuICAgICAgdGl0bGU6IFwiRW5hYmxlIFdpa2kgTGluayBzeW50YXhcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuYWJsZSBXaWtpIExpbmsgc3ludGF4IHN1cHBvcnQuIE1vcmUgaW5mb3JtYXRpb24gY2FuIGJlIGZvdW5kIGF0IGh0dHBzOi8vaGVscC5naXRodWIuY29tL2FydGljbGVzL2FkZGluZy1saW5rcy10by13aWtpcy9cIlxuICAgICAgb3JkZXI6IDMwXG4gICAgd2lraUxpbmtGaWxlRXh0ZW5zaW9uOlxuICAgICAgdGl0bGU6IFwiV2lraSBMaW5rIGZpbGUgZXh0ZW5zaW9uXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiLm1kXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkJ5IGRlZmF1bHQsIFtbdGVzdF1dIHdpbGwgZGlyZWN0IHRvIGZpbGUgcGF0aCBgdGVzdC5tZGAuXCJcbiAgICAgIG9yZGVyOiAzMVxuICAgIHVzZVN0YW5kYXJkQ29kZUZlbmNpbmdGb3JHcmFwaHM6XG4gICAgICB0aXRsZTogXCJVc2Ugc3RhbmRhcmQgY29kZSBmZW5jaW5nIGZvciBncmFwaHNcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSBzdGFuZGFyZCBjb2RlIGZlbmNpbmcgZm9yIGdyYXBocy4gRm9yIGV4YW1wbGUsIGNvZGUgYmxvY2sgYG1lcm1haWRgIG9yIGBAbWVybWFpZGAgd2lsbCByZW5kZXIgbWVybWFpZCBncmFwaHMuIElmIHRoaXMgb3B0aW9uIGlzIGRpc2FibGVkLCB0aGVuIG9ubHkgYEBtZXJtYWlkYCB3aWxsIHJlbmRlciBtZXJtYWlkIGdyYXBocy4gV29ya3MgZm9yIG1lcm1haWQsIHZpeiwgcGxhbnR1bWwsIGFuZCB3YXZlZHJvbS5cIlxuICAgICAgb3JkZXI6IDM1XG4gICAgbGl2ZVVwZGF0ZTpcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJSZS1yZW5kZXIgdGhlIHByZXZpZXcgYXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBzb3VyY2UgY2hhbmdlcywgd2l0aG91dCByZXF1aXJpbmcgdGhlIHNvdXJjZSBidWZmZXIgdG8gYmUgc2F2ZWQuIElmIGRpc2FibGVkLCB0aGUgcHJldmlldyBpcyByZS1yZW5kZXJlZCBvbmx5IHdoZW4gdGhlIGJ1ZmZlciBpcyBzYXZlZCB0byBkaXNrLiBEaXNhYmxlIGxpdmUgdXBkYXRlIHdpbGwgYWxzbyBkaXNhYmxlIHNjcm9sbCBzeW5jLlwiXG4gICAgICBvcmRlcjogNjBcbiAgICBmcm9udE1hdHRlclJlbmRlcmluZ09wdGlvbjpcbiAgICAgIHRpdGxlOiBcIkZyb250IE1hdHRlciByZW5kZXJpbmcgb3B0aW9uXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIllvdSBjYW4gY2hvb3NlIGhvdyB0byByZW5kZXIgZnJvbnQgbWF0dGVyIGhlcmUuICdub25lJyBvcHRpb24gd2lsbCBoaWRlIGZyb250IG1hdHRlci5cIlxuICAgICAgZGVmYXVsdDogXCJ0YWJsZVwiXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwidGFibGVcIixcbiAgICAgICAgXCJjb2RlIGJsb2NrXCIsXG4gICAgICAgIFwibm9uZVwiXG4gICAgICBdLFxuICAgICAgb3JkZXI6IDcwXG4gICAgc2Nyb2xsU3luYzpcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCIyIHdheSBzY3JvbGwgc3luYy4gU3luYyBib3RoIG1hcmtkb3duIHNvdXJjZSBhbmQgbWFya2Rvd24gcHJldmlldyB3aGVuIHNjcm9sbGluZy5cIlxuICAgICAgb3JkZXI6IDc1XG4gICAgc2Nyb2xsRHVyYXRpb246XG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIjEyMFwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJTY3JvbGwgZHVyYXRpb24gaXMgZGVmaW5lZCBpbiBtaWxsaXNlY29uZHMuIExvd2VyIHZhbHVlIGluZGljYXRlcyBmYXN0ZXIgc2Nyb2xsaW5nIHNwZWVkLiBEZWZhdWx0IGlzIDEyMG1zXCJcbiAgICAgIG9yZGVyOiA3NlxuICAgIGRvY3VtZW50RXhwb3J0UGF0aDpcbiAgICAgIHRpdGxlOiBcImRvY3VtZW50IGV4cG9ydCBmb2xkZXIgcGF0aFwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJXaGVuIGV4cG9ydGluZyBkb2N1bWVudCB0byBkaXNrLCBieSBkZWZhdWx0IHRoZSBkb2N1bWVudCB3aWxsIGJlIGdlbmVyYXRlZCBhdCB0aGUgcm9vdCBwYXRoICcuLydcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCIuL1wiXG4gICAgICBvcmRlcjogNzdcbiAgICBleHBvcnRQREZQYWdlRm9ybWF0OlxuICAgICAgdGl0bGU6IFwiUGRmIFBhZ2UgRm9ybWF0XCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiTGV0dGVyXCJcbiAgICAgIGVudW06IFtcbiAgICAgICAgXCJBM1wiLFxuICAgICAgICBcIkE0XCIsXG4gICAgICAgIFwiQTVcIixcbiAgICAgICAgXCJMZWdhbFwiLFxuICAgICAgICBcIkxldHRlclwiLFxuICAgICAgICBcIlRhYmxvaWRcIlxuICAgICAgXVxuICAgICAgb3JkZXI6IDgwXG4gICAgb3JpZW50YXRpb246XG4gICAgICB0aXRsZTogXCJQZGYgUGFnZSBPcmllbnRhdGlvblwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcInBvcnRyYWl0XCJcbiAgICAgIGVudW06IFtcbiAgICAgICAgXCJwb3J0cmFpdFwiLFxuICAgICAgICBcImxhbmRzY2FwZVwiXG4gICAgICBdXG4gICAgICBvcmRlcjogOTBcbiAgICBtYXJnaW5zVHlwZTpcbiAgICAgIHRpdGxlOiBcIlBkZiBNYXJnaW4gdHlwZVwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcImRlZmF1bHQgbWFyZ2luXCJcbiAgICAgIGVudW06IFtcbiAgICAgICAgXCJkZWZhdWx0IG1hcmdpblwiLFxuICAgICAgICBcIm5vIG1hcmdpblwiLFxuICAgICAgICBcIm1pbmltdW0gbWFyZ2luXCJcbiAgICAgIF1cbiAgICAgIG9yZGVyOiAxMDBcbiAgICBwcmludEJhY2tncm91bmQ6XG4gICAgICB0aXRsZTogXCJQcmludCBCYWNrZ3JvdW5kIHdoZW4gZ2VuZXJhdGluZyBwZGZcIlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluY2x1ZGUgYmFja2dyb3VuZCBjb2xvciB3aGVuIGdlbmVyYXRpbmcgcGRmLlwiXG4gICAgICBvcmRlcjogMTEwXG4gICAgcGRmVXNlR2l0aHViOlxuICAgICAgdGl0bGU6IFwiVXNlIEdpdGh1YiBzdHlsZSB3aGVuIGdlbmVyYXRpbmcgcGRmXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiB5b3UgZW5hYmxlZCB0aGlzIG9wdGlvbiwgdGhlbiB0aGUgcGRmIHdpbGwgYmUgZ2VuZXJhdGVkIHVzaW5nIEdpdGh1YiBTdHlsZS4gSSBhZGQgdGhpcyBvcHRpb24gYmVjYXVzZSBpZiB0aGUgbWFya2Rvd24gcHJldmlldyBoYXMgYmxhY2sgY29sb3IgYmFja2dyb3VuZCwgdGhlbiB0aGUgZ2VuZXJhdGVkIHBkZiBtYXkgYWxzbyBoYXZlIGJsYWNrIGNvbG9yIGJhY2tncm91bmQgKGlmIHlvdSBlbmFibGVkIFByaW50IEJhY2tncm91bmQpLCB3aGljaCBtYXkgYWZmZWN0IHRoZSBhcHBlYXJhbmNlIG9mIHRoZSBnZW5lcmF0ZWQgcGRmLlwiXG4gICAgICBvcmRlcjogMTIwXG4gICAgcGRmT3BlbkF1dG9tYXRpY2FsbHk6XG4gICAgICB0aXRsZTogXCJPcGVuIHBkZiBmaWxlIGltbWVkaWF0ZWx5IGFmdGVyIGl0IGlzIGdlbmVyYXRlZFwiXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246IFwiSWYgeW91IGVuYWJsZWQgdGhpcyBvcHRpb24sIHRoZW4gd2hlbiBwZGYgaXMgZ2VuZXJhdGVkLCBpdCB3aWxsIGJlIG9wZW5lZCBieSBwZGYgdmlld2VyLiBGb3IgZXhhbXBsZSwgb24gTWFjIE9TIFgsIGl0IHdpbGwgYmUgb3BlbmVkIGJ5IFByZXZpZXcuXCJcbiAgICAgIG9yZGVyOiAxMzBcbiAgICBwaGFudG9tSlNFeHBvcnRGaWxlVHlwZTpcbiAgICAgIHRpdGxlOiBcIlBoYW50b21KUyBleHBvcnQgZmlsZSB0eXBlXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwicGRmXCJcbiAgICAgIGVudW06IFtcbiAgICAgICAgXCJwZGZcIixcbiAgICAgICAgXCJwbmdcIixcbiAgICAgICAgXCJqcGVnXCJcbiAgICAgIF0sXG4gICAgICBvcmRlcjogMTMxXG4gICAgcGhhbnRvbUpTTWFyZ2luOlxuICAgICAgdGl0bGU6IFwiUGhhbnRvbUpTIG1hcmdpbnNcIlxuICAgICAgZGVzY3JpcHRpb246IFwiRGVmYXVsdCBpcyAwLCB1bml0czogbW0sIGNtLCBpbiwgcHguIFlvdSBjYW4gYWxzbyBkZWZpbmUgJ3RvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCcgbWFyZ2lucyBpbiBvcmRlciBsaWtlICcxY20sIDFjbSwgMWNtLCAxY20nIHNlcGFyYXRlZCBieSBjb21tYSAnLCcuXCJcbiAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgIGRlZmF1bHQ6IFwiMWNtXCJcbiAgICAgIG9yZGVyOiAxMzJcbiAgICBvcGVuUHJldmlld1BhbmVBdXRvbWF0aWNhbGx5OlxuICAgICAgdGl0bGU6IFwiT3BlbiBwcmV2aWV3IHBhbmUgYXV0b21hdGljYWxseSB3aGVuIG9wZW5pbmcgYSBtYXJrZG93biBmaWxlXCJcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMTQwXG4gICAgaW1hZ2VGb2xkZXJQYXRoOlxuICAgICAgdGl0bGU6IFwiSW1hZ2Ugc2F2ZSBmb2xkZXIgcGF0aFwiXG4gICAgICBkZXNjcmlwdGlvbjogXCJXaGVuIHVzaW5nIEltYWdlIEhlbHBlciB0byBjb3B5IGltYWdlcywgYnkgZGVmYXVsdCBpbWFnZXMgd2lsbCBiZSBjb3BpZWQgdG8gcm9vdCBpbWFnZSBmb2xkZXIgcGF0aCAnL2Fzc2V0cydcIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCIvYXNzZXRzXCJcbiAgICAgIG9yZGVyOiAxNTBcbiAgICBpbWFnZVVwbG9hZGVyOlxuICAgICAgdGl0bGU6IFwiSW1hZ2UgVXBsb2FkZXJcIlxuICAgICAgZGVzY3JpcHRpb246IFwieW91IGNhbiBjaG9vc2UgZGlmZmVyZW50IGltYWdlIHVwbG9hZGVyIHRvIHVwbG9hZCBpbWFnZS5cIlxuICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgZGVmYXVsdDogXCJpbWd1clwiXG4gICAgICBlbnVtOiBbXG4gICAgICAgIFwiaW1ndXJcIixcbiAgICAgICAgXCJzbS5tc1wiXG4gICAgICBdXG4gICAgICBvcmRlcjogMTYwXG4gICAgbWVybWFpZFRoZW1lOlxuICAgICAgdGl0bGU6IFwiTWVybWFpZCBUaGVtZVwiXG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICBkZWZhdWx0OiBcIm1lcm1haWQuY3NzXCJcbiAgICAgIGVudW06IFtcbiAgICAgICAgXCJtZXJtYWlkLmNzc1wiLFxuICAgICAgICBcIm1lcm1haWQuZGFyay5jc3NcIixcbiAgICAgICAgXCJtZXJtYWlkLmZvcmVzdC5jc3NcIlxuICAgICAgXVxuICAgICAgb3JkZXI6IDE3MFxuIl19
