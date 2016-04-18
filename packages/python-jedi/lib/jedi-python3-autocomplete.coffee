{CompositeDisposable} = require 'atom'

cp = require 'child_process'
JediProvider = require './jedi-python3-provider'
isWin = /^win/.test(process.platform)
errorStatus = false

module.exports =

  subscriptions: null
  # python-jedi config schema
  config:
    enablePython2:
      description: 'Check to enable autocomplete for Python2 (AutoComplete for Python3 will be disabled)'
      type: 'boolean'
      default: false
    enablePathtopython:
        description: 'Check to enable above Pathtopython field to work'
        type: 'boolean'
        default: false
    Pathtopython:
      description:'Python virtual environment path (eg:/home/user/py3pyenv/bin/python3 or home/user/py2virtualenv/bin/python)'
      type: 'string'
      default: 'python3'

  provider: null

  jediServer: null

  activate: ->
    if !@jediServer
      projectPath = atom.project.getPaths()
      isPy2 = atom.config.get('python-jedi.enablePython2')
      isPathtopython = atom.config.get('python-jedi.enablePathtopython')
      env = process.env
      if isWin
      else
        _path_env = (env.PATH).split ':'
        path_list =['/usr/local/sbin','/usr/local/bin','/usr/sbin','/usr/bin','/sbin','/bin']
        _path_env.push item for item in path_list when item not in _path_env
        new_path_env = _path_env.filter (p)-> p isnt ""
        env.PATH = new_path_env.join ":"

      if isPy2
        jedipy_filename = '/jedi-python2-complete.py'
        command = if isPathtopython then atom.config.get('python-jedi.Pathtopython') else "python"
      else
        jedipy_filename = '/jedi-python3-complete.py'
        command = if isPathtopython then atom.config.get('python-jedi.Pathtopython') else "python3"

      spawn = cp.spawn
      @jediServer = spawn(command,[__dirname + jedipy_filename],env: env);
      @jediServer.on 'error', (err) ->
        console.log err

    @provider = new JediProvider()
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-workspace',
      'jedi-python3-autocomplete:goto_definitions': => @goto_definitions()

  serialize: ->
     @provider.kill_Jedi(cp, isWin, @jediServer)

  deactivate: ->
     errorStatus = @provider.kill_Jedi(cp, isWin, @jediServer)
     @jediServer = null

  getProvider: ->
    return {providers: [@provider]}

  goto_definitions: ->
     if editor = atom.workspace.getActiveTextEditor()
       title =  editor.getTitle().slice(-2)
       if title == 'py'
         source = editor.getText()
         row = editor.getCursorBufferPosition().row + 1
         column = editor.getCursorBufferPosition().column + 1
         path = editor.getPath()
         @provider.goto_def(source, row, column, path)
