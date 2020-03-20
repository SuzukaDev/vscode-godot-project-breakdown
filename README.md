
# Godot Project Breakdown
<p align="center">
	<img width="256" height="256" src="https://github.com/SuzukaDev/vscode-godot-project-breakdown/blob/master/images/icon.png?raw=true">
</p>


## Overview
This is an vscode extension that gets all **.gd** files in your project (**works only with .gd**), analyze them and gives a overview of all of them in a single file.

For each .gd file, it shows its private or public* variables and methods, defined signals, node references and enums.

>\* *Private and public fields do not exist (at least at the moment) in gd script, but if you use the prefix "\_" to differentiate private fields (using "\_") from public (without "\_"), it will take it into account.*


## But... Why? For what?

I made this extension for myself, to easily track and update every change in my project, so I could easily manage/update my project documentation (in my case, an UML diagram for my game).
Instead of keeping track of every change manually, I just generate a new file, compare it to the previous version (using version control), 
and effectively update my documentation.

I released the extension just in case is helpful for somebody else. :four_leaf_clover:

## Usage :wrench:
>**Prerequisites**: this extension requires [Godot tools](https://marketplace.visualstudio.com/items?itemName=geequlim.godot-tools)

1. [Download latest version](https://github.com/SuzukaDev/vscode-godot-project-breakdown/releases) and install it
2. Open command palette (<kbd>F1</kbd>)
3. Type **`Generate breakdown file`**
4. Execute command
5. Enjoy :dancer: (optional)
<p align="center">
	<img width="715" height="588" src="https://github.com/SuzukaDev/vscode-godot-project-breakdown/blob/master/images/demo.gif?raw=true">
</p>

## Extension options
The result file is **highly customizable** to suit your needs.
You can specify wich data to show, in wich order, and how.

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

### `godotProjectBreakdown.separator.{...}`

## Possible future improvements
- Analyze all the .tscn files in the project for getting more information, like... signals connected via editor.

- Maybe I'll upload the extension into the vscode marketplace in the future.

## FAQ 
##### Why the name of the extension is that bad?
Because I couldn't think of a better name :D

## Logo license
The extension logo uses and modifies the original Godot logo by Andrea Calabró.

Its License:
Godot Logo (C) Andrea Calabró
Distributed under the terms of the Creative Commons Attribution License
version 3.0 (CC-BY 3.0) <https://creativecommons.org/licenses/by/3.0/legalcode>.

## Contact
[@chocoboflo](https://twitter.com/chocoboflo) :wolf:


