// 'use_strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import {DocumentInfo} from './DocumentInfo';
import * as fs from 'fs';

let hasFinished:boolean = false;




// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('[GodotProjectBreakdown]: Extension activated');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.godotProjectBreakdown', () => {

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "[GodotProjectBreakdown]",
			cancellable: true
			// cancellable: false
		}, (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("Godot Project Breakdown was canceled");
				hasFinished = true;
				// return;
			});

		hasFinished = false;

		CheckGodotToolsVersion();

		progress.report({ increment: 5, message: "Loading configuration..." });
		
		let config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('godotProjectBreakdown');
		let documentsSeparator: string = config.get('separator.scripts') as string;
		let linesBetweenScripts: number = config.get('separator.linesBetweenScripts') as number;
		let fileName: string = config.get('file.name') as string;
		let fileExtension: string = config.get('file.extension') as string;
		if(!fileExtension.startsWith("."))
		{
			fileExtension = "." + fileExtension;
		}
		let filePath: string = config.get('file.path') as string;
		let overrideFile: boolean = config.get('file.override') as boolean;
		let scriptsSortType: string = config.get('file.sortScriptsBy') as string;
		
		progress.report({ increment: 10, message: "Getting .gd files" });
		
		// GetDocumentInfoArray()
		GetDocumentInfoArray(progress)
		.then(function(documentsArray){	
			documentsArray = SortDocuments(documentsArray, scriptsSortType);	

			let projectBreakdown = GetDocumentHeader([vscode.workspace.rootPath, documentsArray.length]);

			if(!overrideFile) 
			{		
				fileName = GetUniqueName(fileName);				
			}

			// progress.report({ increment: 50, message: "Analyzing .gd files" });
			progress.report({ increment: 10, message: "Analyzing .gd files" });

			for (let i = 0; i < documentsArray.length; i++) {
				const doc = documentsArray[i];
				vscode.window.setStatusBarMessage('Completed: '+ ((i/documentsArray.length)*100).toString());

				// progress.report({ increment: 50, message: "Analyzing "+doc.GetFileName() });
				// let percent = (i/documentsArray.length)*100;

				projectBreakdown += doc.PrintDocument();
				projectBreakdown += documentsSeparator + "\n".repeat(linesBetweenScripts + 1);
			}//for
														
			// progress.report({ increment: 75, message: "Writing file" });
			progress.report({ increment: 10, message: "Writing file" });			
			
			vscode.window.setStatusBarMessage('Writing file...');

			//for not creating and showing the file when is cancelled
			if(!hasFinished)
			{
				const newFile = vscode.Uri.parse('untitled:' + path.join((vscode.workspace.rootPath || "./") + filePath , fileName+fileExtension),true);
				
				if (fs.existsSync(newFile.path))
				{
					// console.log("The file exists");
					var filePath2 = path.join((vscode.workspace.rootPath || "./") + filePath , fileName+fileExtension);
					fs.writeFileSync(filePath2, projectBreakdown, 'utf8');

					const newFilee = vscode.Uri.parse(path.join((vscode.workspace.rootPath || "./") + filePath , fileName+fileExtension),true);				
					vscode.window.showTextDocument(vscode.Uri.file(newFile.path));
					vscode.window.setStatusBarMessage('');
					progress.report({ increment: 100, message: "File "+fileName+fileExtension+ " modified!" });

				}
				else
				{
					vscode.workspace.openTextDocument(newFile).then(document => {
						const edit = new vscode.WorkspaceEdit();
						edit.insert(newFile, new vscode.Position(0, 0), projectBreakdown);
						return vscode.workspace.applyEdit(edit).then(success => {
							if (success) {
								vscode.window.showTextDocument(document);
								// vscode.window.showInformationMessage("File "+fileName+fileExtension+ " created!");
								progress.report({ increment: 100, message: "File "+fileName+fileExtension+ " created!" });

								
							} else {							
								vscode.window.showErrorMessage('Error on vscode.workspace.applyEdit(edit)');
							}
							vscode.window.setStatusBarMessage('');
						});
					});

				}
			}
			

			hasFinished = true;
			
		});


		// https://stackoverflow.com/questions/43359528/javascript-async-await-not-working


			// var p = new Promise(resolve => {
			// 	setTimeout(() => {
			// 		// if(hasFinished)
			// 		resolve();
			// 		console.log("Resuelvo al final p1");
			// 		console.log("HAS FINISHED: "+hasFinished);
			// 	}, 2000);
			// });
			// return p;


			return EnsureHasFinished();
			// return ensureHasFinished(progress);
			// return ensureHasFinished(hasFinished);

		});


		


	});

	context.subscriptions.push(disposable);
}


// this method is called when your extension is deactivated
export function deactivate() {}


// https://stackoverflow.com/questions/30505960/use-promise-to-wait-until-polled-condition-is-satisfied
function EnsureHasFinished() 
{
	let time = 5
    return new Promise(function (resolve, reject) {
        (function waitForFinish(){
			if (hasFinished) 
			{
				// let r;
				// setTimeout(()=>{
				let r = setTimeout(()=>{
					// return resolve();

					// r = resolve();
					resolve();
				}, time*1000);
				// return resolve();
				return r;
			}
            setTimeout(waitForFinish, 30);
        })();        
    });
}




function CenterString(text:string, len:number):string
{
	if (len <= text.length)
		return text.substring(0, len);
	let before = (len - text.length)/2;
	if (before == 0)
		return " ".repeat(before)+text+" ".repeat(before);
	return " ".repeat(before)+text+" ".repeat(before);
}

function GetUniqueName(originalName: string): string
{
	let date = new Date();
	let components = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
	return originalName + " " + components.join("");					
}

function SortDocuments(documents: DocumentInfo[], sortType: string)
{
	documents = documents.sort((a,b)=>{

		let aa:string = "";
		let bb:string = "";

		switch (sortType) {
			case "name":
				aa = a.GetFileName().toLowerCase();
				bb = b.GetFileName().toLowerCase();
				break;
			case "path":
				aa = a.GetFilePath().toLowerCase();
				bb = b.GetFilePath().toLowerCase();
				break;
			case "extends":
				aa = a.GetExtend().toLowerCase();
				bb = b.GetExtend().toLowerCase();
				break;
		
			default:
				break;
		}


		// TODO if there is a reverse option.... changes aa and bb previously

		if(aa > bb){
			return 1;
		}
		if(aa < bb){
			return -1;
		}
		return 0;
	});

	return documents;
}

function CreateNewDocument(fileUri: vscode.Uri, textInDocument:string)
{
	vscode.workspace.openTextDocument(fileUri).then(document => {
		const edit = new vscode.WorkspaceEdit();
		edit.insert(fileUri, new vscode.Position(0, 0), textInDocument);
		return vscode.workspace.applyEdit(edit).then(success => {
			if (success) {
				vscode.window.showTextDocument(document);
			} else {
				vscode.window.showInformationMessage('Error!');
			}
		});
	});
}

function CheckGodotToolsVersion(): void
{
	let gtVersion = vscode.extensions.getExtension("geequlim.godot-tools")?.packageJSON.version.toString().split(".")[0] as number;
	if(gtVersion<1)
	{
		let errorMsg = "You are using Godot tools version "  + vscode.extensions.getExtension("geequlim.godot-tools")?.packageJSON.version.toString() + " (below 1.X.X). Extension won't work as expected.\nUpdate to Godot tools 1.X.X (or above) or download a Godot Project Breakdown version 1.X.X"
		vscode.window.showErrorMessage(errorMsg);
		console.error(errorMsg);
	}
}

// async function GetDocumentInfoArray() :Promise<DocumentInfo[]>
async function GetDocumentInfoArray(progress: vscode.Progress<{increment: number, message: string}>) :Promise<DocumentInfo[]>
{	
	// progress.report({increment:60, message: "kopanitoooo"});

	let documentsInfoArray: DocumentInfo[] = [];	
	let excludeFolders = vscode.workspace.getConfiguration('godotProjectBreakdown').get('file.ignoreFolders') as string;
	// https://code.visualstudio.com/api/references/vscode-api
	// https://code.visualstudio.com/api/references/vscode-api#GlobPattern
	// https://globster.xyz
	let filesUri: vscode.Uri[] = await vscode.workspace.findFiles('**/*.{gd}',excludeFolders);

	// Problem with foreach loop and async!
	// https://stackoverflow.com/questions/37576685/are-there-any-issues-with-using-async-await-in-a-foreach-loop
	// filesUri.forEach(async anUri => {

	var i = 0;
	// https://code.visualstudio.com/api/references/vscode-api#Progress
	// "Each call with a increment value will be SUMMED UP and reflected as overall progress until 100% is reached"
	let incrementValue = 55 / filesUri.length;

	let gtVersion = vscode.extensions.getExtension("geequlim.godot-tools")?.packageJSON.version.toString().split(".")[0] as number;


	for (const anUri of filesUri) {

		//Progress stuff
		let fileName = anUri.toString().split("/").pop();				
		progress.report({increment: incrementValue, message: "Opening "+fileName});	
		i++;

		const theDocument = await vscode.workspace.openTextDocument(anUri);

		let docSymbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', theDocument.uri) as vscode.DocumentSymbol[];		
 
		let docInfo:DocumentInfo;
		

		
		//Code chunk originally created for support all godot-tools versions
		if(gtVersion >= 1)
		{
			// When using Godot tools version 1.0.0 and above, symbolKind must be offseted +1
			let offsetedSymbols = docSymbols[0].children;
			offsetedSymbols.forEach(symb => {
				symb.kind += 1;
			});
			docInfo = new DocumentInfo(theDocument, offsetedSymbols);			
		}
		else //if its a version below 1.x.x (0.x.x) (symbolKinds remains the same)
		{
			docInfo = new DocumentInfo(theDocument, docSymbols); //original (Godot tools version below 1.0.0)
		}
		

		// let offsetedSymbols = docSymbols[0].children;
		// 	offsetedSymbols.forEach(symb => {
		// 		symb.kind += 1;
		// 	});
		// docInfo = new DocumentInfo(theDocument, offsetedSymbols);




		documentsInfoArray.push(docInfo);
	}

	return documentsInfoArray;
}


function GetDocumentHeader(params: any[]):string
{
	let workspace = params[0];
	let nScripts = params[1];
	let date = new Date();	
	let mins = ('0'+date.getMinutes()).slice(-2);

	let headerText = "Project Breakdown";	
	let dateText = date.toLocaleDateString()+"   "+date.getHours() +":"+ mins;
	let scriptsText = "Total Scripts: "+ nScripts;
	let offset = 5;
	let maxSize = Math.max(headerText.length, dateText.length, scriptsText.length, workspace.length) + offset;

	//|
	let prefix = "│";	
	let sufix = "│";
	
	let centerHeader = CenterString(headerText, maxSize);
	let centerWorkspace = CenterString(workspace, maxSize);
	let centerDateText = CenterString(dateText, maxSize);
	let centerScript = CenterString(scriptsText, maxSize);
	
	let min = Math.min(centerDateText.length,centerHeader.length, centerWorkspace.length, centerScript.length);
	

	// return "_".repeat(maxSize)+"\n"+
	// return " "+"_".repeat(maxSize-1)+"\n"+
	return "┌─"+"─".repeat(maxSize-2)+"┐\n"+


	prefix + centerHeader.substring(0,min)+sufix+"\n"+
	prefix + centerWorkspace.substring(0,min)+sufix+"\n"+
	prefix + centerDateText.substring(0,min)+sufix+"\n"+
	prefix + centerScript.substring(0,min)+sufix+"\n"+



	// prefix + "·".repeat(maxSize)+"\n".repeat(5);
	// "·".repeat(maxSize)+"\n".repeat(5);
	// "└"+"·".repeat(maxSize-1)+"┘"+"\n".repeat(5);
	"└"+"─".repeat(maxSize-1)+"┘"+"\n".repeat(5);
	// "└"+"■".repeat(maxSize-1)+"┘"+"\n".repeat(5);



	/*
	EXAMPLES
┌──────────────────────────────────────────────────────┐
|                   Project Breakdown                  │
|  c:\SampleDirectory                                  │
|                   10/3/2020   20:19                  │
|                   Total Scripts: 10                  |
└──────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────┐
|                   Project Breakdown                  │
|  c:\SampleDirectory                                  │
|                   10/3/2020   20:19                  │
|                   Total Scripts: 10                  |
└──────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
┌──────────────────────────────────────────────────────┐
|                   Project Breakdown                  │
|  c:\SampleDirectory  │
|                   10/3/2020   20:19                  │
|                   Total Scripts: 10                  |
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■┐
|                   Project Breakdown                  │
|  c:\SampleDirectory  │
|                   10/3/2020   20:19                  │
|                   Total Scripts: 10                  │
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
┌──────────────────────────────────────────────────────┐
|                   Project Breakdown                  │
|  c:\SampleDirectory  │
|                   10/3/2020   20:19                  │
|                   Total Scripts: 10                  |
└■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■┘
┌──────────────────────────────────────────────────────┐
|                   Project Breakdown                  │
|  c:\SampleDirectory  │
|                   10/3/2020   20:19                  │
|                   Total Scripts: 10                  |
└■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■┘
 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░


■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

	*/
}










