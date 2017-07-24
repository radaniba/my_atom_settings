(function() {
  module.exports = "// check markdown-preview-enhanced.coffee loadPreviewTheme function.\n.markdown-preview-enhanced {\n  @fg-accent: @syntax-cursor-color;\n  @fg-strong: contrast(@bg, darken(@fg, 32%), lighten(@fg, 32%));\n  @fg-subtle: contrast(@fg, lighten(@fg, 16%), darken(@fg, 16%));\n\n  @border: contrast(@bg, lighten(@bg, 16%), darken(@bg, 16%));\n\n  @margin: 16px;\n\n  font-family: \"Helvetica Neue\", Helvetica, \"Segoe UI\", Arial, freesans, sans-serif;\n  // font-size: 1.2em;\n  font-size: 16px;\n  line-height: 1.6;\n  color: @fg;\n  background-color: @bg;\n  overflow: initial;\n  margin: 10px 13px 10px 13px;\n  padding: 2em;\n  box-sizing: border-box;\n  word-wrap: break-word;\n\n  & > :first-child {\n    margin-top: 0;\n  }\n\n  &[is=\"space-pen-div\"] {\n    width: 100%;\n    // height: 100%;\n    margin: 0;\n    z-index: 999;\n    overflow: scroll;\n    font-size: 16px;\n    display: block;\n    position: absolute;\n  }\n\n\n  // Headings --------------------\n  h1, h2, h3, h4, h5, h6 {\n    line-height: 1.2;\n    margin-top: 1em;\n    margin-bottom: @margin;\n    color: @fg-strong;\n  }\n\n  h1 { font-size: 2.25em; font-weight: 300; padding-bottom: 0.3em; border-bottom: 1px solid @border;}\n  h2 { font-size: 1.75em; font-weight: 400; padding-bottom: 0.3em; border-bottom: 1px solid @border;}\n  h3 { font-size: 1.5em; font-weight: 500; }\n  h4 { font-size: 1.25em; font-weight: 600; }\n  h5 { font-size: 1.1em; font-weight: 600; }\n  h6 { font-size: 1.0em; font-weight: 600; }\n\n  h1, h2, h3, h4, h5 { font-weight: 600; }\n  h5 { font-size: 1em; }\n  h6 { color: @fg-subtle; }\n\n  h1, h2 {\n    border-bottom: 1px solid @border;\n  }\n\n  // Emphasis --------------------\n\n  strong {\n    color: @fg-strong;\n  }\n\n  del {\n    color: @fg-subtle;\n  }\n\n\n  // Link --------------------\n  a:not([href]) {\n    color: inherit;\n    text-decoration: none;\n  }\n\n  a {\n    color: #08c;\n    text-decoration: none;\n  }\n\n  a:hover {\n    color: #0050a3;\n    text-decoration: none;\n  }\n\n\n  // Images --------------------\n  img, svg {\n    max-width: 100%;\n  }\n\n\n  // Paragraph --------------------\n\n  & > p {\n    margin-top: 0;\n    margin-bottom: @margin;\n    word-wrap: break-word;\n  }\n\n  // List --------------------\n\n  & > ul,\n  & > ol {\n    margin-bottom: @margin;\n  }\n\n  ul,\n  ol {\n    padding-left: 2em;\n\n    &.no-list {\n      padding: 0;\n      list-style-type: none;\n    }\n  }\n\n  ul ul,\n  ul ol,\n  ol ol,\n  ol ul {\n    margin-top: 0;\n    margin-bottom: 0;\n  }\n\n  li {\n    margin-bottom: 0;\n\n    &.task-list-item {\n      list-style: none;\n    }\n  }\n\n\n  li > p {\n    // margin-top: @margin;\n    margin-top: 0;\n    margin-bottom: 0;\n  }\n\n  .task-list-item-checkbox {\n    margin: 0 0.2em 0.25em -1.6em;\n    vertical-align: middle;\n\n    &:hover {\n      cursor: pointer;\n    }\n  }\n\n\n  // Blockquotes --------------------\n\n  blockquote {\n    margin: @margin 0;\n    font-size: inherit;\n    padding: 0 15px;\n    color: @fg-subtle;\n    border-left: 4px solid @border;\n\n    > :first-child {\n      margin-top: 0;\n    }\n\n    > :last-child {\n      margin-bottom: 0;\n    }\n  }\n\n  // HR --------------------\n  hr {\n    height: 4px;\n    margin: @margin*2 0;\n    background-color: @border;\n    border: 0 none;\n  }\n\n  // Table --------------------\n  table {\n    margin: 10px 0 15px 0;\n  	border-collapse: collapse;\n    border-spacing: 0;\n\n    display: block;\n    width: 100%;\n    overflow: auto;\n    word-break: normal;\n    word-break: keep-all;\n\n    th {\n      font-weight: bold;\n      color: @fg-strong;\n    }\n\n    td, th {\n    	border: 1px solid @border;\n    	padding: 6px 13px;\n    }\n  }\n\n  // Definition List\n  dl {\n    padding: 0;\n\n    dt {\n      padding: 0;\n      margin-top: 16px;\n      font-size: 1em;\n      font-style: italic;\n      font-weight: bold;\n    }\n\n    dd {\n      padding: 0 16px;\n      margin-bottom: 16px;\n    }\n  }\n\n  // Code --------------------\n  code {\n    font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;\n    font-size: 0.85em !important;\n    color: @fg-strong;\n    background-color: contrast(@bg, lighten(@bg, 8%), darken(@bg, 6%));\n\n    border-radius: 3px;\n    padding: 0.2em 0;\n\n    &::before, &::after {\n      letter-spacing: -0.2em;\n      content: \"\\00a0\";\n    }\n  }\n\n  // YIYI add this\n  // Code tags within code blocks (<pre>s)\n  pre > code {\n    padding: 0;\n    margin: 0;\n    font-size: 0.85em !important;\n    word-break: normal;\n    white-space: pre;\n    background: transparent;\n    border: 0;\n  }\n\n  .highlight {\n    margin-bottom: @margin;\n  }\n\n  .highlight pre,\n  pre {\n    font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;\n    padding: @margin;\n    overflow: auto;\n    font-size: 0.85em !important;\n    line-height: 1.45;\n\n    color: @syntax-text-color;\n    background-color: contrast(@syntax-background-color, lighten(@syntax-background-color, 4%), darken(@syntax-background-color, 6%)) !important;\n\n    border: @border;\n    border-radius: 3px;\n  }\n\n  .highlight pre {\n    margin-bottom: 0;\n    word-break: normal;\n  }\n\n  pre {\n    word-wrap: break-word;\n    white-space: normal;\n    word-break: break-all;\n\n    .section {\n      opacity: 1;\n    }\n  }\n\n  pre code,\n  pre tt {\n    display: inline;\n    max-width: initial;\n    padding: 0;\n    margin: 0;\n    overflow: initial;\n    line-height: inherit;\n    word-wrap: normal;\n    background-color: transparent;\n    border: 0;\n\n    &:before,\n    &:after {\n      content: normal;\n    }\n  }\n\n  p,\n  blockquote,\n  ul, ol, dl,\n  pre {\n    margin-top: 0;\n    margin-bottom: @margin;\n    // word-wrap: break-word;\n  }\n\n  // KBD --------------------\n  kbd {\n    color: @fg-strong;\n    border: 1px solid @border;\n    border-bottom: 2px solid darken(@border, 6%);\n    padding: 2px 4px;\n    background-color: contrast(@bg, lighten(@bg, 8%), darken(@bg, 6%));\n    border-radius: 3px;\n    // box-shadow: inset 0 -1px 0 #bbb;\n  }\n\n  .pagebreak, .newpage {\n    page-break-before: always;\n  }\n\n  @media screen and (min-width: 914px) {\n    width: 980px;\n    margin:10px auto;\n    background: @bg;\n  }\n\n  // mobile\n  @media screen and (max-width: 400px) {\n    font-size: 14px;\n    margin: 0 auto;\n    padding: 15px;\n  }\n\n  // very nice tutorial & intro\n  // https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/\n  @media print{\n    background-color: @bg;\n\n    h1, h2, h3, h4, h5, h6 {\n      color: @fg-strong;\n      page-break-after: avoid;\n    }\n\n    blockquote {\n      color: @fg-subtle;\n    }\n\n    /*table,*/ pre {\n       page-break-inside: avoid;\n    }\n\n    table {\n      display: table;\n    }\n\n    img {\n        display: block;\n        max-width: 100%;\n        max-height: 100%;\n    }\n\n    pre, code {\n        word-wrap: break-word;\n        white-space: normal;\n    }\n  }\n\n  // code chunk\n  &[is=\"space-pen-div\"] {\n    .code-chunk {\n      position: relative;\n\n      .output-div {\n        overflow-x: auto;\n\n        svg {\n          display: block;\n        }\n      }\n\n      pre {\n        cursor: text;\n      }\n\n      .btn-group {\n        position: absolute;\n        right: 0;\n        top: 0;\n        display: none;\n\n        .run-btn, .run-all-btn {\n          float: right;\n          margin-left: 4px;\n          border-radius: 3px;\n          font-size: 0.8em;\n          color: #eee;\n          background-color: #528bff;\n          background-image: none;\n          border: none;\n\n          &:hover {\n            background-color: #4b7fe8;\n            cursor: pointer;\n          }\n        }\n      }\n\n      &:hover {\n        .btn-group {\n          display: block;\n        }\n      }\n\n      .status {\n        position: absolute;\n        right: 0;\n        top: 0;\n        font-size: 0.85em;\n        color: inherit;\n        padding: 2px 6px;\n        background-color: rgba(0, 0, 0, 0.04);\n        display: none;\n      }\n\n      &.running {\n        .btn-group {\n          display: none;\n        }\n        .status {\n          display: block;\n        }\n      }\n    }\n\n    .back-to-top-btn, .refresh-btn {\n      position: fixed;\n      display: none;\n      right: 24px;\n      top: 54px;\n    }\n\n    .back-to-top-btn {\n      right: 72px;\n    }\n\n    &:hover {\n      .back-to-top-btn, .refresh-btn {\n        display: block;\n        opacity: 0.4;\n\n        &:hover {\n          opacity: 1.0;\n        }\n      }\n    }\n  }\n\n  &:not([is=\"space-pen-div\"]) {\n    .code-chunk {\n      .btn-group {\n        display: none;\n      }\n      .status {\n        display: none;\n      }\n    }\n\n    .back-to-top-btn {\n      display: none;\n    }\n  }\n}\n\n/*\n * Reveal.js styles\n */\n[data-presentation-preview-mode] {\n  background-color: #f4f4f4;\n\n  .preview-slides {\n    width: 100%;\n\n    .slide {\n      position: relative;\n      background-color: @bg !important;\n\n      //width: 100%; # need to be set later\n      //height: 100%;\n\n      padding: 2em !important;\n      margin-bottom: 12px;\n      text-align: left !important;\n      display: flex;\n      align-items:center;\n\n      border: 1px solid #e6e6e6;\n\n      box-shadow: 0px 0px 16px 4px #eeeeee;\n\n      font-size: 24px;\n\n      h1, h2, h3, h4, h5, h6 {\n        margin-top: 0;\n      }\n\n      .background-video {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n      }\n\n      .background-iframe, .background-iframe-overlay {\n        position: absolute;\n        width: 100%;\n        height: 100%;\n        left: 0;\n        top: 0;\n        border: none;\n        z-index: 1;\n      }\n\n      .background-iframe-overlay {\n        z-index: 2;\n      }\n    }\n  }\n\n  section {\n    display: block;\n    width: 100%;\n    transform-style: preserve-3d;\n    font-size: 100%;\n    font: inherit;\n    z-index: 100;\n  }\n}\n\n.markdown-preview-enhanced[data-presentation-mode] {\n  font-size: 24px;\n  width: 100%;\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n\n  h1, h2, h3, h4, h5, h6 {\n    margin-top: 0;\n  }\n  strong {\n    font-weight: bold; // without this line, the output <strong> doesn't have wrong effect.\n  }\n\n  &::-webkit-scrollbar {\n    display: none;\n  }\n}\n\n.markdown-preview-enhanced {\n  .slides {\n    text-align: left !important;\n  }\n}\n";

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL1JhZC8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkL2xpYi9zdHlsZS10ZW1wbGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gXCJcIlwiXG4vLyBjaGVjayBtYXJrZG93bi1wcmV2aWV3LWVuaGFuY2VkLmNvZmZlZSBsb2FkUHJldmlld1RoZW1lIGZ1bmN0aW9uLlxuLm1hcmtkb3duLXByZXZpZXctZW5oYW5jZWQge1xuICBAZmctYWNjZW50OiBAc3ludGF4LWN1cnNvci1jb2xvcjtcbiAgQGZnLXN0cm9uZzogY29udHJhc3QoQGJnLCBkYXJrZW4oQGZnLCAzMiUpLCBsaWdodGVuKEBmZywgMzIlKSk7XG4gIEBmZy1zdWJ0bGU6IGNvbnRyYXN0KEBmZywgbGlnaHRlbihAZmcsIDE2JSksIGRhcmtlbihAZmcsIDE2JSkpO1xuXG4gIEBib3JkZXI6IGNvbnRyYXN0KEBiZywgbGlnaHRlbihAYmcsIDE2JSksIGRhcmtlbihAYmcsIDE2JSkpO1xuXG4gIEBtYXJnaW46IDE2cHg7XG5cbiAgZm9udC1mYW1pbHk6IFwiSGVsdmV0aWNhIE5ldWVcIiwgSGVsdmV0aWNhLCBcIlNlZ29lIFVJXCIsIEFyaWFsLCBmcmVlc2Fucywgc2Fucy1zZXJpZjtcbiAgLy8gZm9udC1zaXplOiAxLjJlbTtcbiAgZm9udC1zaXplOiAxNnB4O1xuICBsaW5lLWhlaWdodDogMS42O1xuICBjb2xvcjogQGZnO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiBAYmc7XG4gIG92ZXJmbG93OiBpbml0aWFsO1xuICBtYXJnaW46IDEwcHggMTNweCAxMHB4IDEzcHg7XG4gIHBhZGRpbmc6IDJlbTtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgd29yZC13cmFwOiBicmVhay13b3JkO1xuXG4gICYgPiA6Zmlyc3QtY2hpbGQge1xuICAgIG1hcmdpbi10b3A6IDA7XG4gIH1cblxuICAmW2lzPVwic3BhY2UtcGVuLWRpdlwiXSB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgLy8gaGVpZ2h0OiAxMDAlO1xuICAgIG1hcmdpbjogMDtcbiAgICB6LWluZGV4OiA5OTk7XG4gICAgb3ZlcmZsb3c6IHNjcm9sbDtcbiAgICBmb250LXNpemU6IDE2cHg7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICB9XG5cblxuICAvLyBIZWFkaW5ncyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoMSwgaDIsIGgzLCBoNCwgaDUsIGg2IHtcbiAgICBsaW5lLWhlaWdodDogMS4yO1xuICAgIG1hcmdpbi10b3A6IDFlbTtcbiAgICBtYXJnaW4tYm90dG9tOiBAbWFyZ2luO1xuICAgIGNvbG9yOiBAZmctc3Ryb25nO1xuICB9XG5cbiAgaDEgeyBmb250LXNpemU6IDIuMjVlbTsgZm9udC13ZWlnaHQ6IDMwMDsgcGFkZGluZy1ib3R0b206IDAuM2VtOyBib3JkZXItYm90dG9tOiAxcHggc29saWQgQGJvcmRlcjt9XG4gIGgyIHsgZm9udC1zaXplOiAxLjc1ZW07IGZvbnQtd2VpZ2h0OiA0MDA7IHBhZGRpbmctYm90dG9tOiAwLjNlbTsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIEBib3JkZXI7fVxuICBoMyB7IGZvbnQtc2l6ZTogMS41ZW07IGZvbnQtd2VpZ2h0OiA1MDA7IH1cbiAgaDQgeyBmb250LXNpemU6IDEuMjVlbTsgZm9udC13ZWlnaHQ6IDYwMDsgfVxuICBoNSB7IGZvbnQtc2l6ZTogMS4xZW07IGZvbnQtd2VpZ2h0OiA2MDA7IH1cbiAgaDYgeyBmb250LXNpemU6IDEuMGVtOyBmb250LXdlaWdodDogNjAwOyB9XG5cbiAgaDEsIGgyLCBoMywgaDQsIGg1IHsgZm9udC13ZWlnaHQ6IDYwMDsgfVxuICBoNSB7IGZvbnQtc2l6ZTogMWVtOyB9XG4gIGg2IHsgY29sb3I6IEBmZy1zdWJ0bGU7IH1cblxuICBoMSwgaDIge1xuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCBAYm9yZGVyO1xuICB9XG5cbiAgLy8gRW1waGFzaXMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBzdHJvbmcge1xuICAgIGNvbG9yOiBAZmctc3Ryb25nO1xuICB9XG5cbiAgZGVsIHtcbiAgICBjb2xvcjogQGZnLXN1YnRsZTtcbiAgfVxuXG5cbiAgLy8gTGluayAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhOm5vdChbaHJlZl0pIHtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gIH1cblxuICBhIHtcbiAgICBjb2xvcjogIzA4YztcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gIH1cblxuICBhOmhvdmVyIHtcbiAgICBjb2xvcjogIzAwNTBhMztcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gIH1cblxuXG4gIC8vIEltYWdlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpbWcsIHN2ZyB7XG4gICAgbWF4LXdpZHRoOiAxMDAlO1xuICB9XG5cblxuICAvLyBQYXJhZ3JhcGggLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAmID4gcCB7XG4gICAgbWFyZ2luLXRvcDogMDtcbiAgICBtYXJnaW4tYm90dG9tOiBAbWFyZ2luO1xuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcbiAgfVxuXG4gIC8vIExpc3QgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAmID4gdWwsXG4gICYgPiBvbCB7XG4gICAgbWFyZ2luLWJvdHRvbTogQG1hcmdpbjtcbiAgfVxuXG4gIHVsLFxuICBvbCB7XG4gICAgcGFkZGluZy1sZWZ0OiAyZW07XG5cbiAgICAmLm5vLWxpc3Qge1xuICAgICAgcGFkZGluZzogMDtcbiAgICAgIGxpc3Qtc3R5bGUtdHlwZTogbm9uZTtcbiAgICB9XG4gIH1cblxuICB1bCB1bCxcbiAgdWwgb2wsXG4gIG9sIG9sLFxuICBvbCB1bCB7XG4gICAgbWFyZ2luLXRvcDogMDtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xuICB9XG5cbiAgbGkge1xuICAgIG1hcmdpbi1ib3R0b206IDA7XG5cbiAgICAmLnRhc2stbGlzdC1pdGVtIHtcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG4gICAgfVxuICB9XG5cblxuICBsaSA+IHAge1xuICAgIC8vIG1hcmdpbi10b3A6IEBtYXJnaW47XG4gICAgbWFyZ2luLXRvcDogMDtcbiAgICBtYXJnaW4tYm90dG9tOiAwO1xuICB9XG5cbiAgLnRhc2stbGlzdC1pdGVtLWNoZWNrYm94IHtcbiAgICBtYXJnaW46IDAgMC4yZW0gMC4yNWVtIC0xLjZlbTtcbiAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xuXG4gICAgJjpob3ZlciB7XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgfVxuICB9XG5cblxuICAvLyBCbG9ja3F1b3RlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGJsb2NrcXVvdGUge1xuICAgIG1hcmdpbjogQG1hcmdpbiAwO1xuICAgIGZvbnQtc2l6ZTogaW5oZXJpdDtcbiAgICBwYWRkaW5nOiAwIDE1cHg7XG4gICAgY29sb3I6IEBmZy1zdWJ0bGU7XG4gICAgYm9yZGVyLWxlZnQ6IDRweCBzb2xpZCBAYm9yZGVyO1xuXG4gICAgPiA6Zmlyc3QtY2hpbGQge1xuICAgICAgbWFyZ2luLXRvcDogMDtcbiAgICB9XG5cbiAgICA+IDpsYXN0LWNoaWxkIHtcbiAgICAgIG1hcmdpbi1ib3R0b206IDA7XG4gICAgfVxuICB9XG5cbiAgLy8gSFIgLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaHIge1xuICAgIGhlaWdodDogNHB4O1xuICAgIG1hcmdpbjogQG1hcmdpbioyIDA7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogQGJvcmRlcjtcbiAgICBib3JkZXI6IDAgbm9uZTtcbiAgfVxuXG4gIC8vIFRhYmxlIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRhYmxlIHtcbiAgICBtYXJnaW46IDEwcHggMCAxNXB4IDA7XG4gIFx0Ym9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcbiAgICBib3JkZXItc3BhY2luZzogMDtcblxuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIG92ZXJmbG93OiBhdXRvO1xuICAgIHdvcmQtYnJlYWs6IG5vcm1hbDtcbiAgICB3b3JkLWJyZWFrOiBrZWVwLWFsbDtcblxuICAgIHRoIHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgY29sb3I6IEBmZy1zdHJvbmc7XG4gICAgfVxuXG4gICAgdGQsIHRoIHtcbiAgICBcdGJvcmRlcjogMXB4IHNvbGlkIEBib3JkZXI7XG4gICAgXHRwYWRkaW5nOiA2cHggMTNweDtcbiAgICB9XG4gIH1cblxuICAvLyBEZWZpbml0aW9uIExpc3RcbiAgZGwge1xuICAgIHBhZGRpbmc6IDA7XG5cbiAgICBkdCB7XG4gICAgICBwYWRkaW5nOiAwO1xuICAgICAgbWFyZ2luLXRvcDogMTZweDtcbiAgICAgIGZvbnQtc2l6ZTogMWVtO1xuICAgICAgZm9udC1zdHlsZTogaXRhbGljO1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gICAgZGQge1xuICAgICAgcGFkZGluZzogMCAxNnB4O1xuICAgICAgbWFyZ2luLWJvdHRvbTogMTZweDtcbiAgICB9XG4gIH1cblxuICAvLyBDb2RlIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvZGUge1xuICAgIGZvbnQtZmFtaWx5OiBNZW5sbywgTW9uYWNvLCBDb25zb2xhcywgJ0NvdXJpZXIgTmV3JywgbW9ub3NwYWNlO1xuICAgIGZvbnQtc2l6ZTogMC44NWVtICFpbXBvcnRhbnQ7XG4gICAgY29sb3I6IEBmZy1zdHJvbmc7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogY29udHJhc3QoQGJnLCBsaWdodGVuKEBiZywgOCUpLCBkYXJrZW4oQGJnLCA2JSkpO1xuXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICAgIHBhZGRpbmc6IDAuMmVtIDA7XG5cbiAgICAmOjpiZWZvcmUsICY6OmFmdGVyIHtcbiAgICAgIGxldHRlci1zcGFjaW5nOiAtMC4yZW07XG4gICAgICBjb250ZW50OiBcIlxcXFwwMGEwXCI7XG4gICAgfVxuICB9XG5cbiAgLy8gWUlZSSBhZGQgdGhpc1xuICAvLyBDb2RlIHRhZ3Mgd2l0aGluIGNvZGUgYmxvY2tzICg8cHJlPnMpXG4gIHByZSA+IGNvZGUge1xuICAgIHBhZGRpbmc6IDA7XG4gICAgbWFyZ2luOiAwO1xuICAgIGZvbnQtc2l6ZTogMC44NWVtICFpbXBvcnRhbnQ7XG4gICAgd29yZC1icmVhazogbm9ybWFsO1xuICAgIHdoaXRlLXNwYWNlOiBwcmU7XG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgYm9yZGVyOiAwO1xuICB9XG5cbiAgLmhpZ2hsaWdodCB7XG4gICAgbWFyZ2luLWJvdHRvbTogQG1hcmdpbjtcbiAgfVxuXG4gIC5oaWdobGlnaHQgcHJlLFxuICBwcmUge1xuICAgIGZvbnQtZmFtaWx5OiBNZW5sbywgTW9uYWNvLCBDb25zb2xhcywgJ0NvdXJpZXIgTmV3JywgbW9ub3NwYWNlO1xuICAgIHBhZGRpbmc6IEBtYXJnaW47XG4gICAgb3ZlcmZsb3c6IGF1dG87XG4gICAgZm9udC1zaXplOiAwLjg1ZW0gIWltcG9ydGFudDtcbiAgICBsaW5lLWhlaWdodDogMS40NTtcblxuICAgIGNvbG9yOiBAc3ludGF4LXRleHQtY29sb3I7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogY29udHJhc3QoQHN5bnRheC1iYWNrZ3JvdW5kLWNvbG9yLCBsaWdodGVuKEBzeW50YXgtYmFja2dyb3VuZC1jb2xvciwgNCUpLCBkYXJrZW4oQHN5bnRheC1iYWNrZ3JvdW5kLWNvbG9yLCA2JSkpICFpbXBvcnRhbnQ7XG5cbiAgICBib3JkZXI6IEBib3JkZXI7XG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICB9XG5cbiAgLmhpZ2hsaWdodCBwcmUge1xuICAgIG1hcmdpbi1ib3R0b206IDA7XG4gICAgd29yZC1icmVhazogbm9ybWFsO1xuICB9XG5cbiAgcHJlIHtcbiAgICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XG4gICAgd2hpdGUtc3BhY2U6IG5vcm1hbDtcbiAgICB3b3JkLWJyZWFrOiBicmVhay1hbGw7XG5cbiAgICAuc2VjdGlvbiB7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cbiAgfVxuXG4gIHByZSBjb2RlLFxuICBwcmUgdHQge1xuICAgIGRpc3BsYXk6IGlubGluZTtcbiAgICBtYXgtd2lkdGg6IGluaXRpYWw7XG4gICAgcGFkZGluZzogMDtcbiAgICBtYXJnaW46IDA7XG4gICAgb3ZlcmZsb3c6IGluaXRpYWw7XG4gICAgbGluZS1oZWlnaHQ6IGluaGVyaXQ7XG4gICAgd29yZC13cmFwOiBub3JtYWw7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gICAgYm9yZGVyOiAwO1xuXG4gICAgJjpiZWZvcmUsXG4gICAgJjphZnRlciB7XG4gICAgICBjb250ZW50OiBub3JtYWw7XG4gICAgfVxuICB9XG5cbiAgcCxcbiAgYmxvY2txdW90ZSxcbiAgdWwsIG9sLCBkbCxcbiAgcHJlIHtcbiAgICBtYXJnaW4tdG9wOiAwO1xuICAgIG1hcmdpbi1ib3R0b206IEBtYXJnaW47XG4gICAgLy8gd29yZC13cmFwOiBicmVhay13b3JkO1xuICB9XG5cbiAgLy8gS0JEIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGtiZCB7XG4gICAgY29sb3I6IEBmZy1zdHJvbmc7XG4gICAgYm9yZGVyOiAxcHggc29saWQgQGJvcmRlcjtcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgZGFya2VuKEBib3JkZXIsIDYlKTtcbiAgICBwYWRkaW5nOiAycHggNHB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IGNvbnRyYXN0KEBiZywgbGlnaHRlbihAYmcsIDglKSwgZGFya2VuKEBiZywgNiUpKTtcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgLy8gYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgI2JiYjtcbiAgfVxuXG4gIC5wYWdlYnJlYWssIC5uZXdwYWdlIHtcbiAgICBwYWdlLWJyZWFrLWJlZm9yZTogYWx3YXlzO1xuICB9XG5cbiAgQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogOTE0cHgpIHtcbiAgICB3aWR0aDogOTgwcHg7XG4gICAgbWFyZ2luOjEwcHggYXV0bztcbiAgICBiYWNrZ3JvdW5kOiBAYmc7XG4gIH1cblxuICAvLyBtb2JpbGVcbiAgQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAwcHgpIHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgbWFyZ2luOiAwIGF1dG87XG4gICAgcGFkZGluZzogMTVweDtcbiAgfVxuXG4gIC8vIHZlcnkgbmljZSB0dXRvcmlhbCAmIGludHJvXG4gIC8vIGh0dHBzOi8vd3d3LnNtYXNoaW5nbWFnYXppbmUuY29tLzIwMTUvMDEvZGVzaWduaW5nLWZvci1wcmludC13aXRoLWNzcy9cbiAgQG1lZGlhIHByaW50e1xuICAgIGJhY2tncm91bmQtY29sb3I6IEBiZztcblxuICAgIGgxLCBoMiwgaDMsIGg0LCBoNSwgaDYge1xuICAgICAgY29sb3I6IEBmZy1zdHJvbmc7XG4gICAgICBwYWdlLWJyZWFrLWFmdGVyOiBhdm9pZDtcbiAgICB9XG5cbiAgICBibG9ja3F1b3RlIHtcbiAgICAgIGNvbG9yOiBAZmctc3VidGxlO1xuICAgIH1cblxuICAgIC8qdGFibGUsKi8gcHJlIHtcbiAgICAgICBwYWdlLWJyZWFrLWluc2lkZTogYXZvaWQ7XG4gICAgfVxuXG4gICAgdGFibGUge1xuICAgICAgZGlzcGxheTogdGFibGU7XG4gICAgfVxuXG4gICAgaW1nIHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIG1heC13aWR0aDogMTAwJTtcbiAgICAgICAgbWF4LWhlaWdodDogMTAwJTtcbiAgICB9XG5cbiAgICBwcmUsIGNvZGUge1xuICAgICAgICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XG4gICAgICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7XG4gICAgfVxuICB9XG5cbiAgLy8gY29kZSBjaHVua1xuICAmW2lzPVwic3BhY2UtcGVuLWRpdlwiXSB7XG4gICAgLmNvZGUtY2h1bmsge1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuXG4gICAgICAub3V0cHV0LWRpdiB7XG4gICAgICAgIG92ZXJmbG93LXg6IGF1dG87XG5cbiAgICAgICAgc3ZnIHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcmUge1xuICAgICAgICBjdXJzb3I6IHRleHQ7XG4gICAgICB9XG5cbiAgICAgIC5idG4tZ3JvdXAge1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG5cbiAgICAgICAgLnJ1bi1idG4sIC5ydW4tYWxsLWJ0biB7XG4gICAgICAgICAgZmxvYXQ6IHJpZ2h0O1xuICAgICAgICAgIG1hcmdpbi1sZWZ0OiA0cHg7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xuICAgICAgICAgIGZvbnQtc2l6ZTogMC44ZW07XG4gICAgICAgICAgY29sb3I6ICNlZWU7XG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzUyOGJmZjtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiBub25lO1xuICAgICAgICAgIGJvcmRlcjogbm9uZTtcblxuICAgICAgICAgICY6aG92ZXIge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzRiN2ZlODtcbiAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgJjpob3ZlciB7XG4gICAgICAgIC5idG4tZ3JvdXAge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC5zdGF0dXMge1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGZvbnQtc2l6ZTogMC44NWVtO1xuICAgICAgICBjb2xvcjogaW5oZXJpdDtcbiAgICAgICAgcGFkZGluZzogMnB4IDZweDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjA0KTtcbiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgIH1cblxuICAgICAgJi5ydW5uaW5nIHtcbiAgICAgICAgLmJ0bi1ncm91cCB7XG4gICAgICAgICAgZGlzcGxheTogbm9uZTtcbiAgICAgICAgfVxuICAgICAgICAuc3RhdHVzIHtcbiAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC5iYWNrLXRvLXRvcC1idG4sIC5yZWZyZXNoLWJ0biB7XG4gICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgcmlnaHQ6IDI0cHg7XG4gICAgICB0b3A6IDU0cHg7XG4gICAgfVxuXG4gICAgLmJhY2stdG8tdG9wLWJ0biB7XG4gICAgICByaWdodDogNzJweDtcbiAgICB9XG5cbiAgICAmOmhvdmVyIHtcbiAgICAgIC5iYWNrLXRvLXRvcC1idG4sIC5yZWZyZXNoLWJ0biB7XG4gICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICBvcGFjaXR5OiAwLjQ7XG5cbiAgICAgICAgJjpob3ZlciB7XG4gICAgICAgICAgb3BhY2l0eTogMS4wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgJjpub3QoW2lzPVwic3BhY2UtcGVuLWRpdlwiXSkge1xuICAgIC5jb2RlLWNodW5rIHtcbiAgICAgIC5idG4tZ3JvdXAge1xuICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgfVxuICAgICAgLnN0YXR1cyB7XG4gICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLmJhY2stdG8tdG9wLWJ0biB7XG4gICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgfVxufVxuXG4vKlxuICogUmV2ZWFsLmpzIHN0eWxlc1xuICovXG5bZGF0YS1wcmVzZW50YXRpb24tcHJldmlldy1tb2RlXSB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmNGY0ZjQ7XG5cbiAgLnByZXZpZXctc2xpZGVzIHtcbiAgICB3aWR0aDogMTAwJTtcblxuICAgIC5zbGlkZSB7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiBAYmcgIWltcG9ydGFudDtcblxuICAgICAgLy93aWR0aDogMTAwJTsgIyBuZWVkIHRvIGJlIHNldCBsYXRlclxuICAgICAgLy9oZWlnaHQ6IDEwMCU7XG5cbiAgICAgIHBhZGRpbmc6IDJlbSAhaW1wb3J0YW50O1xuICAgICAgbWFyZ2luLWJvdHRvbTogMTJweDtcbiAgICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBhbGlnbi1pdGVtczpjZW50ZXI7XG5cbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNlNmU2ZTY7XG5cbiAgICAgIGJveC1zaGFkb3c6IDBweCAwcHggMTZweCA0cHggI2VlZWVlZTtcblxuICAgICAgZm9udC1zaXplOiAyNHB4O1xuXG4gICAgICBoMSwgaDIsIGgzLCBoNCwgaDUsIGg2IHtcbiAgICAgICAgbWFyZ2luLXRvcDogMDtcbiAgICAgIH1cblxuICAgICAgLmJhY2tncm91bmQtdmlkZW8ge1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgIH1cblxuICAgICAgLmJhY2tncm91bmQtaWZyYW1lLCAuYmFja2dyb3VuZC1pZnJhbWUtb3ZlcmxheSB7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICBib3JkZXI6IG5vbmU7XG4gICAgICAgIHotaW5kZXg6IDE7XG4gICAgICB9XG5cbiAgICAgIC5iYWNrZ3JvdW5kLWlmcmFtZS1vdmVybGF5IHtcbiAgICAgICAgei1pbmRleDogMjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZWN0aW9uIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICB3aWR0aDogMTAwJTtcbiAgICB0cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkO1xuICAgIGZvbnQtc2l6ZTogMTAwJTtcbiAgICBmb250OiBpbmhlcml0O1xuICAgIHotaW5kZXg6IDEwMDtcbiAgfVxufVxuXG4ubWFya2Rvd24tcHJldmlldy1lbmhhbmNlZFtkYXRhLXByZXNlbnRhdGlvbi1tb2RlXSB7XG4gIGZvbnQtc2l6ZTogMjRweDtcbiAgd2lkdGg6IDEwMCU7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcblxuICBoMSwgaDIsIGgzLCBoNCwgaDUsIGg2IHtcbiAgICBtYXJnaW4tdG9wOiAwO1xuICB9XG4gIHN0cm9uZyB7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7IC8vIHdpdGhvdXQgdGhpcyBsaW5lLCB0aGUgb3V0cHV0IDxzdHJvbmc+IGRvZXNuJ3QgaGF2ZSB3cm9uZyBlZmZlY3QuXG4gIH1cblxuICAmOjotd2Via2l0LXNjcm9sbGJhciB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxufVxuXG4ubWFya2Rvd24tcHJldmlldy1lbmhhbmNlZCB7XG4gIC5zbGlkZXMge1xuICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDtcbiAgfVxufVxuXG5cIlwiXCIiXX0=