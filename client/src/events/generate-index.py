import os
import sys

HEADER_COMMENT = "// Automatically generated. Do not manually edit.\n\n"
TAURI_IMPORTS = 'import { EventCallback, UnlistenFn } from "@tauri-apps/api/event"\n'
TAURI_MODULE_OPEN = 'declare module "@tauri-apps/api/event" {\n'
TAURI_MODULE_CLOSE = '}\n'


def get_name_from_file(filename: str) -> str:
  return filename.split(".")[0]


def is_dts_file(filename: str) -> str:
  return filename.endswith(".d.ts") and not "index.d.ts" in filename


def generate_export_statement(type: str) -> str:
  return f'export * from "./{type}"\n'


def generate_import_statement(type: str) -> str:
  return f'import {{ {type}EventPayload }} from "./{type}"\n'


def generate_function_declaration(type: str) -> str:
  return f'  export function listen<T>(event: "{type.lower()}", handler: EventCallback<{type}EventPayload>): Promise<UnlistenFn>\n'


def main():
  print("Generating index.d.ts for events")
  directory = sys.argv[1]

  types = list(map(get_name_from_file, filter(is_dts_file, os.listdir(directory))))

  print("Found events:")
  for typ in types:
    print(f"\t{typ}")

  with open(f"{directory}/index.d.ts", "w+") as file:
    file.write(HEADER_COMMENT)

    for statement in map(generate_export_statement, types):
      file.write(statement)
    file.write("\n")

    file.write(TAURI_IMPORTS)
    for statement in map(generate_import_statement, types):
      file.write(statement)
    file.write("\n")

    file.write(TAURI_MODULE_OPEN)
    for func_decl in map(generate_function_declaration, types):
      file.write(func_decl)
    file.write(TAURI_MODULE_CLOSE)

  print("Done!")


if __name__ == "__main__":
  main()