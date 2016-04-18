# flake8 validation for Atom

flake8 is an atom package that let you run flake8 validation on your current Python file.

![preview](https://raw.github.com/julozi/atom-flake8/master/preview.png)

## Installation

Use the Atom package manager, which can be found in the Settings view or
run `apm install flake8` from the command line.

The package requires the flake8 program to be installed on your system. To install `flake8`, run `pip install flake8` or `easy_install flake8` from the command line.

The flake8 package has been tested against flake8 version 2.1.0.

For more information about flake8 see [the official documentation page](http://flake8.readthedocs.org/en/2.0/)

## Settings

- Flake8 path : path of the flake8 binary (defaults to /usr/local/bin/flake8)
- Ignore errors : a comma separated list of ignored errors (this setting is passed to the --ignore flake8 command line option)
- McCabe complexity threshold : max complexity of the script
- Use Fold Mode as Default : fold the message panel by default
- Validate on save : trigger flake8 validation automatically when a Python file is saved

## Licence

[MIT](http://opensource.org/licenses/MIT)
