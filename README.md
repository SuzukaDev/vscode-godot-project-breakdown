
# Godot Project Breakdown :robot::bookmark_tabs:
<p align="center">
	<img width="256" height="256" src="https://github.com/SuzukaDev/vscode-godot-project-breakdown/blob/master/images/icon.png?raw=true">
</p>


## Overview :mag:
This is an vscode extension that gets all **.gd** files in your project (**works only with .gd**), analyze them and gives a overview of all of them in a single file.

For each .gd file, it shows its private or public* variables and methods, defined signals, node references and enums.

>\* *Private and public fields do not exist (at least at the moment) in gd script, but if you use the prefix "\_" to differentiate private fields (using "\_") from public (without "\_"), it will take it into account.*


## But... Why? For what? :dog2:

I made this extension for myself, to easily track and update every change in my project, so I could easily manage/update my project documentation (in my case, an UML diagram for my game).
Instead of keeping track of every change manually, I just generate a new file, compare it to the previous version (using version control), and effectively update my documentation.

I released the extension just in case is helpful for somebody else. :four_leaf_clover:

## Usage :wrench:
>**Prerequisites**: this extension requires [Godot tools](https://marketplace.visualstudio.com/items?itemName=geequlim.godot-tools)

1. [Download latest version](https://github.com/SuzukaDev/vscode-godot-project-breakdown/releases) and install it
>:bangbang:If you are using a Godot Tools version below 1.X.X, [download version 1.0.1](https://github.com/SuzukaDev/vscode-godot-project-breakdown/releases/tag/v1.0.1)<br>
If you are using Godot 3.2 or above and a Godot tools version equal or above 1.X.X [download latest version](https://github.com/SuzukaDev/vscode-godot-project-breakdown/releases)
2. Open command palette (<kbd>F1</kbd>)
3. Type **`Generate breakdown file`**
4. Execute command
5. Enjoy :dancer: (optional)
<p align="center">
	<img width="715" height="588" src="https://github.com/SuzukaDev/vscode-godot-project-breakdown/blob/master/images/demo.gif?raw=true">
</p>

## Extension options :pencil:
The result file is **highly customizable** to suit your needs.
You can specify wich data to show, in wich order, and how.

Most options are self explanatory with its setting's description. But **some** of them:

### `godotProjectBreakdown.file.order`
This is one of the most important settings. Is a `string` that specifies the data to show and the order. Its default value is `fp ne svm`


>Each character stands for a data in file:
`n` - Node references<br>
`s` - Signals<br>
`v` - Variables<br>
`m` - Methods<br>
`p` - Path of the file<br>
`f` - File Name<br>
`e` - Enums<br>
`(Empty space)` - Line separation (equals to \\n)<br>
### `godotProjectBreakdown.file.sortScriptsBy`
Allows you to sort the scripts by their path, name or extended node/script.
### `godotProjectBreakdown.separator.{...}`
A `string` that allows you to add a custom header for each property.
### `godotProjectBreakdown.prefix.{...}`
Allows you to add a custom prefix for each property.
### `godotProjectBreakdown.file.ignoreFolders`
A [Glob Pattern](https://code.visualstudio.com/api/references/vscode-api#GlobPattern) for ignoring folders/files that you don't want to show in the breakdown file.

Its default value is `"/addons/**"`, wich means that will ignore files on the addons folder.
> If [Glob Patterns](https://code.visualstudio.com/api/references/vscode-api#GlobPattern) are new to you, [this tool](https://globster.xyz) is very useful to ensure your glob pattern is correct :dog:

### `godotProjectBreakdown.file.showEnumValues`
A `bool` for showing (true) or not (false) the enum values for each enum.


## Possible future improvements :boom:
- Analyze all the .tscn files in the project for getting more information, like... signals connected via editor.

- Maybe I'll upload the extension into the vscode marketplace in the future.

## FAQ :question:
##### Why the name of the extension is that bad?
Because I couldn't think of a better name :D

## Logo license :copyright:
The extension logo uses and modifies the original Godot logo by Andrea Calabró.

Its License:
Godot Logo (C) Andrea Calabró
Distributed under the terms of the Creative Commons Attribution License
version 3.0 (CC-BY 3.0) <https://creativecommons.org/licenses/by/3.0/legalcode>.

## Contact :dog:
[@chocoboflo](https://twitter.com/chocoboflo) :wolf:


