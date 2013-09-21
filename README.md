# ntropy
> the beginning of a modular angularjs app generator

### installation

it can be installed with npm: `npm --global install ntropy`

### usage

Currently all generator work. `build` is not implemented yet.

```
○ ntropy --help
ntropy v0.1.0

  Usage: ntropy [options] [command]

  Commands:

    module <username/name>    scaffold a module
    controller <name>         scaffold a controller
    directive <name>          scaffold a directive
    filter <name>             scaffold a filter
    provider <name>           scaffold a provider
    service <name>            scaffold a service
    test <type> <name>        scaffold a test
    view <name>               scaffold a view
    resource <name>           scaffold a full resource
    build                     build the project

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -v, --verbose  verbose mode
```

Craft a module, cd into it, scaffold some resources.