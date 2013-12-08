# ng2 – minimalistic, modular angular.js app generator

### Motivation

I started this project because I wanted something like `rails g` but for Angular, and I didn't want the bloat that most generators out there have. So far this does the job alright in being very lean, extendable and fast enough for my slowest computer not to complain. Everyone is invited to collaborate and make this a tool we can all enjoy using.

`ng2` is aimed at AngularJS only, so there's no need to compromise for generality, and it makes some choices for you:

* Your app will be composed of discrete CommonJS modules you install with [component.io](https://github.com/component) or that you scaffold using ng2

* Your app gets concatenated and served altogether from a single pair of .js and .css files

* You want to reuse as much code possible from others, share all you can code with others, and write the least amount of code possible to make something work

It's the rough equivalent to rails generators (far less sophisticated yet, but we'll get there eventually) that uses a package manager (component) similar to npm (in some ways), and lets you use a synchronous require call (thus no more ugly AMD/UMD definitions and such).

## Installation 
As a regular node cli tool, you can install this with `npm --global install ng2`. It requires `component` as a `peerDep`.

## Getting started

Let's make a sample app here:

```
$ ng2 sampleApp
$ cd sampleApp
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
$ ng2 login script config
$ ng2 login script routes
$ ng2 login controller login logout
$ ng2 login view login-form register-form

$ ng2 navbar controller main
$ ng2 navbar view navbar

$ ng2 comments script config
$ ng2 comments script routes
$ ng2 comments controller list edit
$ ng2 comments view list edit
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
      |-- controllers
         |-- login.js
      |-- views
         |-- login-form.html
      |-- component.json
      |-- index.js
      |-- config.js
      |-- routes.js
   |-- navbar
      |-- controllers
         |-- navbar.js
      |-- views
         |-- navbar.html
      |-- component.json
      |-- index.js

```

Where each of the modules you have in your application (under the app branch in that tree) are perfectly reusable and shareable CommonJS, `component` compatible modules. Something as easy as 

```
$ cd app/comments
$ git init .
$ git remote add origin https://github.com/<your-username>/<repo-name>.git
$ git commit -am "Woo lets share!"
$ git push
```

(Provviding your github repo exists) Will get you a module you can install directly with a simple 

```
component install <your-username>/<repo-name>
```

in any other `component` project you have and since the repo is public, anyone can use it too! Isn't that neat?

Ok, proceeding. now that you have all this stuff, you can just build it doing

```
component build
```

If you get an error like this one:
> error : ENOENT, open '/Users/leostera/repos/ng2/test/test_7/modules/contact/views/form.js'

that means you haven't compiled the html templates into javascript. You can do that by running

```
ng2 html2js
```

Now a regular `component build` should do it's work in a couple tens of milliseconds and the app is ready to be served by your webserver of choice, or just locally by running `ng2 server`.

Notice there's a lot of functionality bundled with `ng2`, thou it's not really tied to it. Read more about this in the [Plugins](#plugins) section.

## Usage
If you find yourself in trouble, running `ng2 --help` is always useful.

```
○ ng2 --help
log:  It worked if it ends with OK
log:  Usage:
log:
log:    ng2 <app-name> [options]
log:
log:      Create a folder <app-name> and start a new application inside.
log:      If a <path> is specified then it will start it in such path
log:      and the application name will be the name of the last directory.
log:
log:
log:    ng2 [options] module <module-name>
log:
log:      Scaffold a new module named <module-name>.
log:
log:
log:    ng2 <module-name> [options] [generator] [params [, more params]]
log:
log:      It will use one of the following generators within the specified
log:      module named <module-name>.
log:
log:
log:  Generators:
log:      * controller
log:
log:  Plugins: (generators are plugins, too)
log:      * controller
log:      * module
log:      * server
log:
log:  For additional help on any plugin, use the --help flag
log:  like this: ng2 <plugin-name> --help
log:
log:  OK

```

Regularly you would use this as described in the [Getting Started](#getting-started) section.

## Plugins
The plugin system is very simple, it looks for binaries named `ng2-` and allows you to run them thru `ng2 <name>`. Some examples of this are:

* `ng2-server` – callable as `ng2 server`.
* `ng2-scaffolder` – the default scaffolder.
* `ng2-module` – the module generator

As you can see, there is also a `ng2-controller` binary. This is because  I want `ng2` to be easily extendable and customizable. Any generator will override the default `scaffolder`. You can still access the `scaffolder` as `ng2 scaffolder <template> [params]`. This way you can specify your very own `ng2 controller` behavior but fallback to the original `scaffolder` if need be.

The current bundled plugins are listed in the `./bin` folder in this very repo. Eventually, if necessary, they will be taken out of `ng2` and required as `peerDeps` or simply external modules.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/ng2/ng2/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

