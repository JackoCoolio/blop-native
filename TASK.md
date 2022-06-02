# Task
`blop-native` uses [Task](https://github.com/go-task/task) for build scripts, which searches for Taskfiles in the following order:
- Taskfile.yaml
- Taskfile.dist.yaml

*Source:* [Task - Supported file names](https://taskfile.dev/usage/#supported-file-names)

So, the distributed Taskfile can be overridden with a Taskfile named `Taskfile.yaml`.
Creating `Taskfile.yaml` will shadow all of the scripts defined in `Taskfile.dist.yaml`, so it needs to be included, like so:
```yaml
version: "3"

includes:
  ::
    taskfile: ./Taskfile.dist.yaml
    required: true # not necessary, but why not?
```

Variables can be overridden like so:
```yaml
...
    taskfile: ./Taskfile.dist.yaml
    ...
    vars:
      <variable>: <value>
```

For more information, see [Task - Usage](https://taskfile.dev/usage/).