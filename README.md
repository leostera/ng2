# ntropy
> the beginning of a modular angular.js app generator

### installation

it can be installed with npm: `npm --global install ntropy`

### usage

```
○ ntropy --help

  Usage: ntropy [options] [command]

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

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -v, --verbose  verbose mode
```

Craft a module, cd into it, scaffold some resources. Throw in a few component dependencies. Go back to the root of your project and do a build.