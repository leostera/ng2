# ng2
> the beginning of a modular angular.js app generator
#### Disclaimer: this is an early-stage project that needs your collaboration! Try it out, file an issue, shape it! :)

### Installation

it can be installed with npm: `npm --global install ng2`

### Usage

```
○ ng2 --help

  Usage: ng2 [options] [command]

  Commands:

    start <name>                scaffold a barebones app
    module <username/name>      scaffold a module
    controller <name>           scaffold a controller
    directive <name>            scaffold a directive
    filter <name>               scaffold a filter
    provider <name>             scaffold a provider
    service <name>              scaffold a service
    test <type> <name>          scaffold a test
    view <name>                 scaffold a view
    style <name>                scaffold a stylesheet
    resource <name>             scaffold a full resource
    build                       build the project
    watch                       continuous watch and build
    server                      run a local webserver

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -v, --verbose  verbose mode
    -p, --port     the server port

```

### Let's get started!

0. make sure you have `component` installed globally: `npm -g i component` (you might need to use `sudo` for this)
1. install `ng2` with `npm` globally: `npm -g i ng2` (you might need to use `sudo` for this too)
2. start a barebones app using `ng2 start <appName>` (appName can be `.` to scaffold within the current folder)
3. `cd <appName>`
4. `component install`
5. `ng2 server` and open `localhost:9000` to see your modular angular app working.