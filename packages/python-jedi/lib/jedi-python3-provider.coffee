{$} = require 'atom-space-pen-views'

errorStatus = false

resetJedi= (newValue) ->
  try
    atom.packages.disablePackage('python-jedi')
  catch error
    console.log error

  atom.packages.enablePackage('python-jedi')

module.exports =
class JediProvider
  id: 'python-jedi'
  selector: '.source.python'
  providerblacklist: null

  constructor: ->
    @providerblacklist =
      'autocomplete-plus-fuzzyprovider': '.source.python'
      'autocomplete-plus-symbolprovider': '.source.python'


#This function is used to kill the jedi which is running background
  kill_Jedi : (cp,isWin, @jediServer) ->
    if not isWin
      try
        @jediServer.kill();
      catch error
        errorStatus = true
    else
      try
        win_Command = 'taskkill /F /PID ' + @jediServer.pid
        cp.exec win_Command
      catch error
        errorStatus = true
    return errorStatus

  goto_def:(source, row, column, path)->

    payload =
      source: source
      line: row
      column: column
      path: path
      type: "goto"

    # console.log payload
    $.ajax

      url: 'http://127.0.0.1:7777'
      type: 'POST'
      data: JSON.stringify payload

      success: (data) ->

        #definitions from goto_def
        for key,value of data
          if value['module_path'] != null && value['line'] != null
            atom.workspace.open(value['module_path'],({'initialLine':(value['line']-1),'searchAllPanes':true}))
          else if value['is_built_in'] && value['type'] = ("module" || "class" || "function")
            atom.notifications.addInfo("Built In "+value['type'],
            ({dismissable: true,'detail':"Description: "+value['description']+
            ".\nThis is a builtin "+value['type']+". Doesn't have module path"}))

      error: (jqXHR, textStatus, errorThrown) ->
        console.log textStatus, errorThrown

  requestHandler: (options) ->
    return new Promise (resolve) ->

      suggestions = []

      bufferPosition = options.cursor.getBufferPosition()

      text = options.editor.getText()
      row = options.cursor.getBufferPosition().row
      column = options.cursor.getBufferPosition().column
      path = options.editor.getPath()

      resolve(suggestions) unless column isnt 0

      payload =
        source: text
        line: row
        column: column
        path: path
        type:'autocomplete'

      prefixRegex = /\b((\w+[\w-]*)|([.:;[{(< ]+))$/g

      prefix = options.prefix.match(prefixRegex)?[0] or ''

      if prefix is " "
        prefix = prefix.replace(/\s/g,'')

      tripleQuotes = (/(\'\'\')/g).test(options.cursor.getCurrentWordPrefix())
      line = options.editor.getTextInRange([[bufferPosition.row, 0], bufferPosition])
      hash = line.search(/(\#)/g)

      if hash < 0 && not tripleQuotes
        $.ajax

          url: 'http://127.0.0.1:7777'
          type: 'POST'
          data: JSON.stringify payload

          success: (data) ->

            # build suggestions
            if data.length isnt 0
              for index of data

                label = data[index].description
                type = data[index].type

                if label.length > 80
                  label = label.substr(0, 80)
                suggestions.push
                  text: data[index].name
                  replacementPrefix: prefix
                  label: label
                  type: type

            resolve(suggestions)
          error: (jqXHR, textStatus, errorThrown) ->
            console.log textStatus, errorThrown
      else
        suggestions =[]
        resolve(suggestions)

  error: (data) ->
    console.log "Error communicating with server"
    console.log data

#observe settings
atom.config.onDidChange 'python-jedi.Pathtopython', (newValue, oldValue) ->
  isPathtopython = atom.config.get('python-jedi.enablePathtopython')
  if isPathtopython
    atom.config.set('python-jedi.Pathtopython', newValue)
    resetJedi(newValue)

atom.config.onDidChange 'python-jedi.enablePython2', ({newValue, oldValue}) ->
#  console.log 'My configuration changed:', newValue, oldValue
  resetJedi(newValue)

atom.config.onDidChange 'python-jedi.enablePathtopython', ({newValue, oldValue}) ->
  resetJedi(newValue)
