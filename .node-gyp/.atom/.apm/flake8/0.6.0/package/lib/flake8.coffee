process = require 'child_process'
byline = require 'byline'
fs = require 'fs'

validate = ->
  editor = atom.workspace.getActiveEditor()
  return unless editor?
  return unless editor.getGrammar().name == 'Python'

  filePath = editor.getPath()

  flake filePath, (errors) ->
    msgPanel = require 'atom-message-panel'

    if atom.workspaceView.find('.am-panel').length != 1
      msgPanel.init('<span class="icon-bug"></span> Flake8 report')
      atom.config.observe 'flake8.useFoldModeAsDefault', {callNow: true}, (value) ->
        if value == true
          msgPanel.fold(0);
    else
      msgPanel.clear()

    if errors.length == 0
      msgPanel.append.header('√ No errors were found!', 'text-success')
      atom.workspaceView.find('.line-number').removeClass('text-error')
    else
      lines = []
      for error in errors
        if error.type
          message = error.type + " " + error.message
        else
          message = error.message
        msgPanel.append.lineMessage(error.line, error.position, message, error.evidence, 'text-error')
        lines.push(error.line)
      msgPanel.append.lineIndicators(lines, 'text-error');

    atom.workspaceView.on 'pane-container:active-pane-item-changed destroyed', ->
      msgPanel.destroy()
      atom.workspaceView.find('.line-number').removeClass('text-error')


flake = (filePath, callback) ->
  line_expr = /:(\d+):(\d+): ([CEFW]\d{3}) (.*)/
  errors = []
  currentIndex = -1
  skipLine = false

  params = ["--show-source", filePath]
  ignoreErrors = atom.config.get "flake8.ignoreErrors"
  mcCabeComplexityThreshold = atom.config.get "flake8.mcCabeComplexityThreshold"
  flake8Path = atom.config.get "flake8.flake8Path"

  if not fs.existsSync(flake8Path)
    errors.push {
      "message": "Unable to get report, please check flake8 bin path",
      "evidence": flake8Path,
      "position": 1,
      "line": 1
    }
    callback errors
    return

  if not not ignoreErrors
    params.push("--ignore=#{ ignoreErrors }")

  if not not mcCabeComplexityThreshold
    params.push("--max-complexity=#{ mcCabeComplexityThreshold }")

  proc = process.spawn flake8Path, params

  # Watch for flake8 errors
  output = byline(proc.stdout)
  output.on 'data', (line) =>
    line = line.toString().replace filePath, ""
    matches = line_expr.exec(line)

    if matches
      [_, line, position, type, message] = matches

      errors.push {
        "message": message,
        "type": type,
        "position": parseInt(position),
        "line": parseInt(line)
      }
      currentIndex += 1
      skipLine = false
    else
      if not skipLine
        errors[currentIndex].evidence = line.toString().trim()
        skipLine = true

  # Watch for the exit code
  proc.on 'exit', (exit_code, signal) ->
      if exit_code == 1 and errors.length == 0
        errors.push {
          "message": "flake8 is crashing, please check flake8 bin path or reinstall flake8",
          "evidence": flake8Path,
          "position": 1,
          "line": 1
        }
      callback errors



module.exports =

  configDefaults:
    flake8Path: "/usr/local/bin/flake8"
    ignoreErrors: ""
    mcCabeComplexityThreshold: ""
    useFoldModeAsDefault: false
    validateOnSave: true

  activate: (state) ->
    atom.workspaceView.command "flake8:run", => @run()

    atom.config.observe 'flake8.validateOnSave', {callNow: true}, (value) ->
      if value == true
        atom.workspace.eachEditor (editor) ->
          editor.buffer.on 'saved', validate
      else
        atom.workspace.eachEditor (editor) ->
          editor.buffer.off 'saved', validate

  run: ->
    validate()
