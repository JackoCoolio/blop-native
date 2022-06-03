# Task
`blop-native` uses [Task](https://github.com/go-task/task)
for build scripts, which searches for Taskfiles in the following order:
- Taskfile.yaml
- Taskfile.dist.yaml

*Source:* [Task - Supported file names](https://taskfile.dev/usage/#supported-file-names)

So, the distributed Taskfile can be overridden with a
Taskfile named `Taskfile.yaml`.
Creating `Taskfile.yaml` will effectively shadow all of the
scripts defined in `Taskfile.dist.yaml`, so it needs to be
included, like so:
```yaml
version: "3"

includes:
  <prefix>:
    taskfile: ./Taskfile.dist.yaml
    required: true # not necessary, but why not?
```

Usually, tasks are run like so: `task client:run` or `task
bootstrap`, but by adding a local Taskfile, all tasks will
be prefixed by the value `<prefix>` chosen above.
I personally use `:` (a colon) because it makes running tasks
easy.
This means every command will be prefixed by `::`.

Variables can be overridden like so:
```yaml
...
    taskfile: ./Taskfile.dist.yaml
    ...
    vars:
      <variable>: <value>
```

For more information, see [Task - Usage](https://taskfile.dev/usage/).