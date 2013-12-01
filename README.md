# ng2 – minimalistic, modular angular.js app generator

### Motivation

I started this project because I wanted something like `rails g` but for Angular but I didn't want the bloat that most generators out there have. So far this does the job alright in being very lean, extendable and fast enough for my slowest computer not to complain. Everyone is invited to collaborate and make this a tool we can all enjoy using.

## Installation 
As a regular node cli tool, you can install this with `npm --global install ng2`.

## Getting started

Let's make a sample app here:

```
$ ng2 sampleApp
$ cd sampleApp
$ npm install
$ component install
```

Now you can start creating modules and after that, resources, like this:

```
$ ng2 module leostera/login
$ ng2 module --owner=leostera navbar comments
```

The `--owner` option is a shortcut so you don't have to add the prefix to every module when creating more than one.

And you already have 3 modules created for you. Scaffolding resources is just as easy:

```
$ ng2 login config
$ ng2 login routes
$ ng2 login controller login,logout
$ ng2 login view login-form,register-form

$ ng2 navbar controller main
$ ng2 navbar view navbar

$ ng2 comments config
$ ng2 comments routes
$ ng2 comments controller list,edit
$ ng2 comments view list,edit
$ ng2 comments filter search
$ ng2 comments provider comments
```

This will generate the following structure:

```
sampleApp
|-- component.json
|-- components
|-- app
   |-- index.html
   |-- comments
      |-- controllers
         |-- list.js
         |-- edit.js
      |-- views
         |-- list.html
         |-- edit.html
      |-- filters
         |-- search.js
      |-- provider
         |-- comments.js
      |-- component.json
      |-- index.js
      |-- config.js
      |-- routes.js
   |-- login
      |-- login.js
      |-- login-form.html
      |-- component.json
      |-- index.js
      |-- config.js
      |-- routes.js
   |-- navbar
      |-- navbar.js
      |-- navbar.html
      |-- component.json
      |-- index.js

```

Where each of the modules you have in your application (under the app branch in that tree) are perfectly reusable and shareable CommonJS, component-io compatible modules. Something as easy as 

```
$ cd app/comments
$ git init .
$ git remote add origin https://github.com/<your-username>/<repo-name>.git
$ git commit -am "Woo lets share!"
$ git push
```

Will get you a module you can install directly with a simple 

```
component install <your-username>/<repo-name>
```

in any other component.io project you have and since the repo is public, anyone can use it too! Isn't that neat?


## Usage

```
○ ng2 --help

  Usage:
  
  ng2 <app-name> [options]
  
      Create a folder <app-name> and start a new application inside.
  
      If a <path> is specified then it will start it in such path
      and the application name will be the name of the last directory.
  
  ng2 [options] module <module-name>
  
      Scaffold a new module named <module-name>.
  
  ng2 <module-name> [options] [generator] [params [, more params]]
  
      It will use one of the following generators within the specified
      module named <module-name>:

  Generators:

    controller <name>           scaffold a controller
    service    <name>           scaffold a service
    view       <name>           scaffold a view

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -v, --verbose  verbose mode

```
