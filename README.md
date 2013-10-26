# ng2
> the beginning of a modular angular.js app generator

## Disclaimer: this is just a proof of concept.
> An early-stage project.
I'm working on a revamp that I'll publish as soon as it's usable.
Very likely under the same name.

## Shut up and show me how it works
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

Make sure you have `ng2` already installed.

1. start a barebones app using `ng2 start <appName>`
2. `cd <appName>`
3. `component install`
4. `ng2 server`

Your modular angular app will be watched, built upon changes and always running at `localhost:9000`.
