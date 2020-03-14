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
			// cancellable: true
			cancellable: false
		}, (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation");
				hasFinished = true;
				// return;
			});

		hasFinished = false;

		
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
		
		
		progress.report({ increment: 15, message: "Getting .gd files" });

		// FindFiles();
		GetDocumentInfoArray()
		.then(function(documentsArray){			
			documentsArray = SortDocuments(documentsArray, scriptsSortType);	

			let projectBreakdown = GetDocumentHeader([vscode.workspace.rootPath, documentsArray.length]);

			if(!overrideFile) 
			{		
				fileName = GetUniqueName(fileName);				
			}

			progress.report({ increment: 30, message: "Analyzing .gd files" });

			for (let i = 0; i < documentsArray.length; i++) {
				const doc = documentsArray[i];
				vscode.window.setStatusBarMessage('Completed: '+ ((i/documentsArray.length)*100).toString());

				progress.report({ increment: 40, message: "Analyzing "+doc.GetFileName() });

				let percent = (i/documentsArray.length)*100;

				projectBreakdown += doc.PrintDocument();
				projectBreakdown += documentsSeparator + "\n".repeat(linesBetweenScripts + 1);
			}//for
											
			progress.report({ increment: 75, message: "Writing file" });
			
			vscode.window.setStatusBarMessage('Writing file...');

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

				hasFinished = true;				
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
							vscode.window.showInformationMessage('Error!');
						}
						vscode.window.setStatusBarMessage('');

						hasFinished = true;
					});
				});

			}

			// hasFinished = true;
			
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



			return ensureHasFinished();
			// return ensureHasFinished(progress);
			// return ensureHasFinished(hasFinished);





		});


		


	});








	context.subscriptions.push(disposable);


















}


// https://stackoverflow.com/questions/30505960/use-promise-to-wait-until-polled-condition-is-satisfied
// function waitForFinished(resolve) {
//     if (!hasFinished) {
//         setTimeout(waitForFinished.bind(this, resolve), 30);
//     } else {
//         resolve();
//     }
// }


function v1ensureHasFinished() {
    return new Promise(function (resolve, reject) {
        (function waitForFoo(){
            if (hasFinished) return resolve();
            setTimeout(waitForFoo, 30);
        })();
    });
}

// https://stackoverflow.com/questions/30505960/use-promise-to-wait-until-polled-condition-is-satisfied
// function v2GLOBALHASFINISHEDensureHasFinished() {
//     return new Promise(function (resolve, reject) {
//         (function waitForFoo(){
// 			if (hasFinished) 
// 			{
// 				console.log("WAIT 5s to resolve");
// 				setTimeout(()=>{
// 					return resolve();
// 				}, 5000);
// 			}
//             setTimeout(waitForFoo, 30);
//         })();
//     });
// }

// https://stackoverflow.com/questions/30505960/use-promise-to-wait-until-polled-condition-is-satisfied
// function ensureHasFinished(progress: vscode.Progress<{ message?: string; increment?: number }>) 
// {
// 	let i = 1;
// 	let time = 5
//     return new Promise(function (resolve, reject) {
//         (function waitForFoo(){
// 			if (hasFinished) 
// 			{
// 				console.log("WAIT "+time+"s to resolve "+i.toString());
// 				i++;
// 				progress.report({ increment: i, message: "huevos "+i.toString() });
// 				progress.report({ increment: 50 });

// 				// let r;
// 				// setTimeout(()=>{
// 				let r = setTimeout(()=>{
// 				// let t = setTimeout(()=>{
// 					// progress.report({ increment: 100, message: "File "+fileName+fileExtension+ " created!" });
// 					// resolve(); //finish timeout
// 					// clearTimeout(t);
// 					// return resolve();

// 					// r = resolve();
// 					resolve();
// 				}, time*1000);
// 				// return resolve();
// 				return r;
// 			}
//             setTimeout(waitForFoo, 30);
//         })();
//         // });
//     });
// }


// https://stackoverflow.com/questions/30505960/use-promise-to-wait-until-polled-condition-is-satisfied
function ensureHasFinished() 
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


// function ensureHasFinished(variableToCheck:boolean) {
//     return new Promise(function (resolve, reject) {
//         (function waitForFoo(){
// 			if (variableToCheck) 
// 			{
// 				console.log("WAIT 5s to resolve");
// 				setTimeout(()=>{
// 					return resolve();
// 				}, 5000);
// 			}
//             setTimeout(waitForFoo, 30);
//         })();
//     });
// }






// function GetDocumentHeader(params:[]):string
// function GetDocumentHeader(...params: any[]):string
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

	// let prefix = "|";
	let prefix = "│";
	// let sufix = "|";
	let sufix = "│";
	
	let centerHeader = CenterString(headerText, maxSize);
	let centerWorkspace = CenterString(workspace, maxSize);
	let centerDateText = CenterString(dateText, maxSize);
	let centerScript = CenterString(scriptsText, maxSize);
	
	let min = Math.min(centerDateText.length,centerHeader.length, centerWorkspace.length, centerScript.length);
	





	// return "_".repeat(maxSize)+"\n"+
	// return " "+"_".repeat(maxSize-1)+"\n"+
	return "┌─"+"─".repeat(maxSize-2)+"┐\n"+
	// prefix + CenterString(headerText, maxSize)+sufix+"\n"+
	// prefix + CenterString(workspace, maxSize)+sufix+"\n"+
	// prefix + CenterString(dateText, maxSize)+sufix+"\n"+
	// prefix + CenterString(scriptsText, maxSize)+sufix+"\n"+

	// prefix + centerHeader+sufix+"\n"+
	// prefix + centerWorkspace+sufix+"\n"+
	// prefix + centerDateText+sufix+"\n"+
	// prefix + centerScript+sufix+"\n"+

	// prefix + centerHeader+"\n"+
	// prefix + centerWorkspace+"\n"+
	// prefix + centerDateText+"\n"+
	// prefix + centerScript+"\n"+

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
┌──────────────────────────────────────────────────────┐
|                   Project Breakdown                  │
|  c:\SampleDirectory  │
|                   10/3/2020   20:19                  │
|                   Total Scripts: 10                  |
└──────────────────────────────────────────────────────┘
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
	let components = [
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds(),
		date.getMilliseconds()
	];
	// let id = components.join("");											
	// return components.join("");		
	return originalName + " " + components.join("");				

	// fileName = fileName + " " + id;		
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


// this method is called when your extension is deactivated
export function deactivate() {}





// ESTO ERA UN TEST PARA APRENDER
// function FindFiles(){
async function FindFiles(){
	vscode.window.showInformationMessage('FIND FILES!');

	console.log("SOY FIND FILES");
	// vscode.workspace.findFiles('*.gd');
	// let filesPromise = vscode.workspace.findFiles('*.gd');
	//TODO el glob pattern tiene toda la pinta de que tengo que hacerlo una variable del workspace
	// https://github.com/ev3dev/vscode-ev3dev-browser/wiki/Glob-Patterns
	// https://stackoverflow.com/questions/46589598/how-to-search-for-just-a-specific-file-type-in-visual-studio-code	
	// let filesPromise = vscode.workspace.findFiles('*.{gd,cpp}'); 
	// let filesPromise = vscode.workspace.findFiles('**/*.{gd,cpp}'); //match all files, including those in ANY SUBDIRECTORY
	let filesPromise = vscode.workspace.findFiles('**/*.{gd}'); //match all files, including those in ANY SUBDIRECTORY

	filesPromise.then(function(value) {
		console.log("=======THEN:======")
		console.log(value);
		value.forEach(file => {
			console.log(file.path);
		});
		// expected output: 123
	  });

	// console.log(vscode.workspace.workspaceFolders);

	// vscode.workspace.workspaceFolders.forEach(e => {
	// 	console.log(e.name);
	// 	console.log(e.uri);
	// 	console.log("----------");
		
	// });

	vscode.workspace.textDocuments.forEach(e => {
		console.log(e.fileName);
		console.log(e.uri);
		console.log(e.languageId);
		console.log("----------");
		
	});




	//TEST coger simbolos de 1 documento
	// let testDocument = 
	// esto tiene las uris de los documentos
	filesPromise.then(function(textDocuments) {
		console.log("THEN numero 2!!!!!!! (Path del Documento[0]:");
		// RESOURCE IDENTIFIER (URI)
		console.log(textDocuments[0].path);
		// console.log(textDocuments[0].fsPath);

		// vscode.workspace.openTextDocument(textDocuments[0].path).then(function(aTextDocument){
		vscode.workspace.openTextDocument(textDocuments[0].path).then(async function(aTextDocument){
			console.log("Estoy en el THEN (ABRIENDO EL DOCUMENTO)");
			console.log(aTextDocument.fileName);
			// result.fileName
			// https://code.visualstudio.com/api/references/commands
			// vscode.executeDocumentSymbolProvider -> (returns) - A promise that resolves to an array of SymbolInformation and DocumentSymbol instances.
			/*
			let symbolsPromise = vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', aTextDocument.uri);
			
			symbolsPromise.then(function(theSymbols){
			// symbolsPromise.then(function(theSymbols: vscode.SymbolInformation[]){
			// symbolsPromise.then(function(theSymbols: vscode.SymbolInformation[]){
				console.log("HE OBTENIDO LOS SIMBOLOS");
				theSymbols.forEach(symb => {
					//symbol Information
					// https://code.visualstudio.com/api/references/vscode-api#SymbolInformation
					// console.log(symb.name +"\tKind: "+ symb.kind + "\tContainer name:" + symb.containerName + "\tLocation"+symb.location);

					// DocumenSymbol
					// https://code.visualstudio.com/api/references/vscode-api#DocumentSymbol
					// console.log(symb.name +"\tKind: "+ symb.kind + "\tContainer name:" + symb.containerName + "\tLocation"+symb.location);
					console.log(symb);
				});
			});
			*/


			console.log("EOOOO???");
			// https://github.com/search?q=vscode.commands.executeCommand%28%27vscode.executeDocumentSymbolProvider%27%2C&type=Code
			// let symbolsPromise = vscode.commands.executeCommand<vscode.SymbolInformation[]>('vscode.executeDocumentSymbolProvider', aTextDocument.uri);
			let symbolsPromise = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', aTextDocument.uri) as vscode.SymbolInformation[];
			// NOTE ya no es una promesa, al hacer el await, ahora tengo los symbolos
			let j = 0;
			symbolsPromise.forEach(symb => {
				console.log("IMPRIMO SIMBOLO "+j++);
			});


			
			

			// https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Usar_promesas
			// symbolsPromise.then(nuevoResultado[]: vscode.SymbolInformation => TestPromise(nuevoResultado));


			// console.log(symbols);
			// vscode.DocumentSybolProvider.
			// vscode.provideDocumentSymbols()
		});
	});

	// TODO
	// DocumentInfo tt = new DocumentInfo(null, null);
	// let doc = new DocumentInfo(null, null);
}


function TestPromise(arraySymbols: vscode.SymbolInformation[])
// function TestPromise(arraySymbols)
{
	arraySymbols.forEach(symbol => {
		console.log(symbol);
	});
}





// Promises.all
// https://stackoverflow.com/questions/38362231/how-to-use-promise-in-foreach-loop-of-array-to-populate-an-object/38362312











/*
PROCEDURE:
1º Find files
2º For each file, get symbols
3º Create an array of DocumentInfo objects (DocumentInfo stores the document and its symbols)
4º Iterate on the DocumentInfo objects arrays and extract an STRING of its text, and concatenate with the rest of DocumentInfo objects (adding a custom separation between objects/files)
5º Create new file and add the STRING to the file



GetDocumentInfoArray

*/

// function GetDocumentInfoArray(): DocumentInfo[]
// async function GetDocumentInfoArray()
// {
// 	// let documentsInfoArray: DocumentInfo[];

// 	let documentsInfoArray: Array<DocumentInfo>;
// 	// TODO cambiar el glob pattern de abajo por una variable
// 	let filesUri: vscode.Uri[] = await vscode.workspace.findFiles('**/*.{gd}');
// 	filesUri.forEach(async anUri => {
// 		// let doc: vscode.TextDocument = vscode.workspace.openTextDocument(anUri).then(async function(theDocument){
// 		const theDocument = await vscode.workspace.openTextDocument(anUri);
// 		// return theDocument;
// 		//Get the symbols from the document
// 		let docSymbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', theDocument.uri) as vscode.DocumentSymbol[];
// 		let docInfo: DocumentInfo = new DocumentInfo(theDocument, docSymbols);
// 		// Adds the object to the array
// 		documentsInfoArray.push(docInfo);
// 		console.log("-ADDED TO ARRAY-");
// 	});

// 	console.log("GetDocumentInfoArray END =======================================================================")
// 	// console.log(documentsInfoArray);
// 	// return documentsInfoArray;

// }


async function GetDocumentInfoArray() :Promise<DocumentInfo[]>
{	
	// let documentsInfoArray: DocumentInfo[];
	// let documentsInfoArray: Array<DocumentInfo>;
	let documentsInfoArray: DocumentInfo[] = [];

	// TODO cambiar el glob pattern de abajo por una variable
	let filesUri: vscode.Uri[] = await vscode.workspace.findFiles('**/*.{gd}');

	// console.log(filesUri);
	// let promises: Array<Promise>;
	// let promises: Promises[];


	let promises: Promise<void>[] = [];

	// let p = new Promise(function(resolve, reject){
	// 	resolve("caca");
	// });

	// p.then(function(fromResolve){
	// 	console.log("texto from resolve: "+fromResolve);
	// });



	// POR FIN: Aqui el problema 
	// https://stackoverflow.com/questions/37576685/are-there-any-issues-with-using-async-await-in-a-foreach-loop
	// filesUri.forEach(async anUri => {

	for (const anUri of filesUri) {




		// console.log(anUri.path);
		// let doc: vscode.TextDocument = vscode.workspace.openTextDocument(anUri).then(async function(theDocument){
		const theDocument = await vscode.workspace.openTextDocument(anUri);
		// console.log(theDocument.fileName);
		// return theDocument;
		//Get the symbols from the document
		// let docSymbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', theDocument.uri) as vscode.DocumentSymbol[];


		// let docSymbols = vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', theDocument.uri);
		// docSymbols.then(function(symbols){
		// 	console.log("docSymbolsçççççççççççççççççççççççççççççççççççççççççççççççççççççççççççççç");
		// 	let docInfo: DocumentInfo = new DocumentInfo(theDocument, symbols as vscode.DocumentSymbol[]);
		// 	documentsInfoArray.push(docInfo);
		// 	console.log("-ADDED TO ARRAY-");
		// });


		let docSymbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', theDocument.uri) as vscode.DocumentSymbol[];
		let docInfo: DocumentInfo = new DocumentInfo(theDocument, docSymbols);
		documentsInfoArray.push(docInfo);


		// Adds the object to the array
		// console.log("-ADDED TO ARRAYYYYYYYYYY- " + theDocument.fileName);		
	// });
	}


	// Promise.all(promises){
	// 	console.log("TODAS LAS PROMESAS SE HAN COMPLETADO");
	// };

	// console.log("GetDocumentInfoArray END =======================================================================")
	// console.log(documentsInfoArray);
	// return documentsInfoArray;
	return documentsInfoArray;
}