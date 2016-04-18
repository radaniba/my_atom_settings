# python-jedi package

Python Jedi based autocompletion plugin.

## Features
  - Autocomplete
  - Goto Definition.

## Installation
Either use Atoms package manager or `apm install python-jedi`. Install autocomplete-plus before installing this package.

### Usage

python-jedi uses python3 interpreter in your path by default.

For python2 autocomplete go to settings -> check Enable Python2 and uncheck to use Python3.

#### To Use virtualenv/pyvenv
  - Add virtualenv path or pyvenv path in the settings(Pathtopython field).(eg:/home/user/py3pyenv/bin/python3 or /home/user/py2virtualenv/bin/python).

  - Check 'Enable Pathtopython' option in package settings.

  - Make sure you are giving the correct virtualenv/pyvenv path. Otherwise autocomplete won't work. Also for python2 virtualenv path to work, you must have checked 'Enable Python2' option.

#### To Use Goto Definition
  - Use the keyboard shortcut `ctrl-alt-j`.

### Note

- If you are not using virtualenv path, please uncheck 'Enable Pathtopython'.

- The completion daemon is started on port 7777 - please make sure no
other service is using this port.

- The completion daemon is stopped appropriately, which was fully tested in linux
environment. The package has not been tested under windows environment. It might
be buggy.

### Warning

Do not use it along with autocomplete-plus-jedi. Since it is originally forked
from it, python-jedi may malfunction.
