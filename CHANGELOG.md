# Change Log 
Godot Project Breakdown
## 3.2.1
9/5/2020
### Fixed
- Bug showing spaces on connected nodes.
- Bug on node references.
- Bug with the snippets


## 3.2.0
7/5/2020
### Added
- **Class comments** <br>
It's possible to show a description, notes or whatever you need to show in the file for each class.<br>
Just type the text you want to show in between `###\` and `/###`. For example:<br>
`###\ (Yor comment here) /###`
<br>
<br>
**NOTE**: This will only show the first occurrence of text bewtween the ###\ and /###. In case of be more than one, it will show the first one.

- **Snippet** for adding class comments easily.<br>
Just type "##" to show the snippet.
### Fixed
- Bug when getting node references that were not between " or '. Like, for example: `get_node(PathsReference.input_text)`
- Bug when getting the node that calls the `connect()` function when looking for connected signals on complex calls like:
Like, for example: `get_node(AFunctionThatReturnsANode()).connect("a_signal", self, "_OnASignal")` <br>
Previously it returned `self`, instead of `get_node(AFunctionThatReturnsANode())`



## 2.0.1
9/4/2020
### Added
- Possibility for looking connected signals via code.
- Option for showing or not the arguments on methods
### Fixed
- Solved bug when initializing booleans on package.json
- If you executed the extension on a project with an empty file, or a file with an error, that caused to freeze the extension.
Now, instead of that, it just prints a warning for that specific file, to warn you that maybe there is something wrong with it.
- Showing arguments on methods (they were missing with Godot Tools 1.0.X)

## 2.0.0
22/3/2020<br>
I made the extension using Godot 3.1 & Godot Tools 0.3.X. Current Godot Tools versions (1.X.X) changes the some things with the symbols and added more functionality, so I've updated the extension to work with latest Godot Tools versions.
#### Added
- Support for Godot 3.2 & Godot Tools v1.X.X and above.
:bangbang:**NOTE:** If you are using a previous Godot Tools version (under 1.X.X), use Godot Project Breakdown 1.0.1)

## 1.0.1 
20/3/2020
#### Added
- Now is possible to get enum info from files
- Allows excluding files/folders (Added glob pattern setting (godotProjectBreakdown.file.ignoreFolders))
- Cancelling option for clossing dialog
#### Fixed
- Solved bug: extension crashed when a file only contained enum(s)
- Bug when getting the extend of a file


## 1.0.0
- Initial release


