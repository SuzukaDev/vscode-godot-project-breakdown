// const vscode = require('vscode');
// import { workspace, languages, window, commands, ExtensionContext, Disposable } from 'vscode';

'use strict';

import * as vscode from 'vscode';
import { workspace, window } from 'vscode';



enum ScriptElement {
    NodeReferences = "n",
    Signals = "s",
    Variables = "v",
    Methods = "m",
    Path = "p",
    FileName = "f",
    Space = " "    
};

// class DocumentInfo implements vscode.TextDocumentContentProvider   
// class DocumentInfo
// https://stackoverflow.com/questions/41058522/how-to-use-a-class-as-a-type-for-properties-of-another-class-in-typescript
// export default class DocumentInfo
export class DocumentInfo //https://stackoverflow.com/questions/47876790/how-to-use-a-compiled-typescript-class-in-javascript
{



static config: vscode.WorkspaceConfiguration = workspace.getConfiguration('godotProjectBreakdown');

static documentOrder: string = (DocumentInfo.config.get('file.order') as string);
//Separators
static signalsSeparator: string = (DocumentInfo.config.get('separator.signals') as string) + "\n";
static nodesSeparator: string = (DocumentInfo.config.get('separator.nodeReferences') as string) + "\n";
static variablesSeparator: string = (DocumentInfo.config.get('separator.variables') as string) + "\n";
static methodsSeparator: string = (DocumentInfo.config.get('separator.methods') as string) + "\n";



static separateVariables: boolean = (DocumentInfo.config.get('separator.publicAndPrivateVariables') as boolean);
static separateMethods: boolean = (DocumentInfo.config.get('separator.publicAndPrivateMethods') as boolean);

static showConstants: boolean = (DocumentInfo.config.get('file.showConstants') as boolean);


//prefixes
static signalPrefix: string = (DocumentInfo.config.get('prefix.signals') as string);
static nodePrefix: string = (DocumentInfo.config.get('prefix.nodeReferences') as string);
static variablePrefix: string = (DocumentInfo.config.get('prefix.variables') as string);
static methodPrefix: string = (DocumentInfo.config.get('prefix.methods') as string);
static constantPrefix: string = (DocumentInfo.config.get('prefix.constants') as string);


// https://github.com/qrti/funcList/blob/master/src/functionsDocument.ts
private _document: vscode.TextDocument;    
private _symbols: vscode.DocumentSymbol[];    //it also could be a SymbolInformation, but (I think that) DocumentSymbol is more practical
private _name: string;    
private _extends: string;
private _text: string;
// private _document: string;    
// private _symbols: string;    //it also could be a SymbolInformation, but (I think that) DocumentSymbol is more practical
    // constructor(document: vscode.TextDocument, symbols: vscode.DocumentSymbol, filter, uri: vscode.Uri)
    constructor(document: vscode.TextDocument, symbols: vscode.DocumentSymbol[])
    {
        this._document = document;                                                    
        this._symbols = symbols;      
        
        let splitName = this._document.fileName.split("\\");        
        this._name = splitName[splitName.length-1];

        this._extends = this.FindExtend();

        // TODO Hacer una variable con el texto SIN COMENTARIOS (hacer un replace)
        //           \s*#.*
        //Elimina lineas que empiecen por # (incluso si están tabuladas)
        //HERE MEJOR ESTE
        // (?<!["']\s*)\s*#.*(?!["'])
        // str.replace(/(?<!["']\s*)\s*#.*(?!["'])/g, "");

        //   (?<=""")(.*)(?=""")
        // Elimina comentarios en una sola linea (entre """ """)

        // TODO checkear si en settings tenemos el bool de ignoreComments
        this._text = this.RemoveCommentsFromText(this._document.getText());

	}





    public GetFileName(): string
    {
        return this._name;
    }

    public GetFilePath(): string
    {
        return this._document.fileName;
    }

    public GetExtend():string
    {
        return this._extends;
    }


    public PrintDocument():string
    {
        let documentBreakdown = "";        
        DocumentInfo.documentOrder.split("").forEach(c => {            
            documentBreakdown += this.GetTextFrom(c as ScriptElement);
        });

        return documentBreakdown;
    }

    private StartsWithMultilineComment(text: string): boolean
    {
        return (text[0] == '"' && text[1] == '"' && text[2] == '"')? true: false;
    }

    private RemoveCommentsFromText(text: string): string
    {
        let noCommentsText: string = "";

        /*
        estaba aqui
        (?<!;\s*)#.*
        (?<=[\);]\s*)#.*

        //ESTE DE ABAJO!
        (?<!["']\s*)#.*
        (?<!["']\s*)#.*(?![^'"])
        (?<!["']\s*)#.*(?!['"])

        casi
        (?<!["'][\s\w]*)#.*(?!['"])
        (?<!["'][\s\w]*)#.*(?![\s\w]*['"])
        (?<!["'][\s\w]*)#.*


        POR TROZOS
        Elimina lineas y al lado (obvia comentarios):
        (?<!['"].*)#.*
        Elimina comentarios al lado de funciones
        (?<=[\);].*)#.*



        (?<!["']\s*)#.*(?!.*["'])
        (?<=[^\n])#.*

        #[^"']+(?![^'"]*\n)
        (?<!["'][^#]*)#.*(?![^'"])
        */

        //Removes comments after functions (respect the # in between get_node)
        // (?<=[\);]\s*)#.*
        // get_node    ( "#asjdfljsasdflksjd "); #asdfjsjfdg
        // get_node    ( "#asjdfljsasdflksjd ") # asdfjsadlkfj


        /*
        POR TROZOS
        Elimina lineas y al lado (obvia comentarios):
        (?<!['"].*)#.*
        Elimina comentarios al lado de funciones
        (?<=[\);].*)#.*
        */
       // Remove lines with # (but ignores those preceded by 'or" (for # used in strings))
       // noCommentsText = text.replace(/(?<!["']\s*)\s*#.*(?!["'])/g, "");
        noCommentsText = text.replace(/(?<!["'].*)\s*#.*(?!["'])/g, "");

        /*
        POR TROZOS
        Elimina lineas y al lado (obvia comentarios):
        (?<!['"].*)#.*
        Elimina comentarios al lado de funciones
        (?<=[\);].*)#.*

        Mejora?
        (?<=[\);].*)#[^"']**(?!["'])
        */
       noCommentsText = noCommentsText.replace(/(?<=[\);].*)#.*/g, "");








        //Delete multi-line comments
        // Since godot multi-line comments beggins and ends with the same string ("""), first, 
        // we replace odd """ results with """-, and even results with -"""
        // To be able to detect in between text
        // https://stackoverflow.com/questions/1958347/using-javascript-regexp-to-replace-each-match-with-an-iterating-number
        

        /*
        esta regexp se corta en el punto
        """[^.]*"""

        este se corta con "
        """[^"""]*"""

        (?<=This is)(.*)(?=sentence)


        ASI!
        /""".*"""/gmUs
        NECESITA EL LAZY FLAG
        // https://stackoverflow.com/questions/6109882/regex-match-all-characters-between-two-strings
        https://stackoverflow.com/questions/2824302/how-to-make-regular-expression-into-non-greedy
        ASI
        /""".*?"""/gms
        */

        /*
        let splitArray:string[] = noCommentsText.split('"""');

        noCommentsText = "";
        
        let index = this.StartsWithMultilineComment(noCommentsText)? 0:1;
        splitArray.forEach(str => {
            if(index%2 == 1)
                noCommentsText += str;
            index++;            
        });
        */
        noCommentsText = noCommentsText.replace(/""".*?"""/gms, "");


        // console.error("\n\n\n\n\n\n\n\n"+this._name+"\n"+noCommentsText);
        console.error("\n\n\n\n\n\n\n\n"+this._name+"\n");
        console.log(noCommentsText);
        return noCommentsText;
    }


    private FindExtend():string
    {
        let reg = /(?<=extends)(?:\s*)(\S+)/g;
        // let docText: string = this._document.getText();
        let docText: string = this._text;
        let match = reg.exec(docText);
        if(match)
            return match[0].trim();
        else
            return "";
    }
    

    private GetSignals(): Array<string>
    {
        // let reg = /(?<=\nsignal)(?:\s*)(\S+)/g;
        let reg = /(?<=signal )(?:\s*)(\S+)/g;

        // let docText: string = this._document.getText();
        let docText: string = this._text;

        let regexp: Array<string> = [];
        regexp = docText.match(reg) as string[];

        return regexp;        
    }

    private PrintSignals(): string
    {
        let concatenationString = "";
        let signals: string[] = this.SortAlphabetically( this.GetSignals());

        if(signals == []){
            return "";
        }

        signals.forEach(aSignal => {
            concatenationString += DocumentInfo.signalPrefix + 
                aSignal.replace(/\s/g, "") + 
                "\n";
        });

        return concatenationString;
    }


    
    private GetConstants(): string[]
    {
        let constants: string[] = [];
        for(const symb of this._symbols){
            if(symb.kind == vscode.SymbolKind.Constant)
            {
                constants.push(symb.name);
            }          
        }
        return constants;
    }
    private PrintConstants(): string
    {
        let concatenationString: string = "";
        let constants: string[] = this.SortAlphabetically( this.GetConstants() );
        if(constants.length == 0)
        {
            return "";
        }
        constants.forEach(cons => {
            concatenationString += DocumentInfo.constantPrefix + cons + "\n";            
        });
        return concatenationString + "\n";
    }

    private GetInstanceVariables(): string[]
    {
        let variables: string[] = [];
        
        for(const symb of this._symbols){
            if(symb.kind == vscode.SymbolKind.Variable)
            {
                variables.push(symb.name);
            }
            else if(symb.kind == vscode.SymbolKind.Function)
            {
                break;
            }            
        }
        return variables;
    }

    private PrintInstanceVariables(): string
    {
        let concatenationString = "";
        if(DocumentInfo.showConstants)
        {
            concatenationString = this.PrintConstants();
        }

        let instanceVariables: string[] = this.SortAlphabetically( this.GetInstanceVariables() );
        let lastVar = "a";
        let watchForSeparation = true;

        instanceVariables.forEach(aVar => {
            if(watchForSeparation && DocumentInfo.separateVariables && aVar[0] == "_" && lastVar[0] != "_")
            {
                concatenationString += "\n";   
                watchForSeparation = false;             
            }
            concatenationString += DocumentInfo.variablePrefix + aVar + "\n";

            lastVar = aVar;
        });

        return concatenationString;
    }

    private GetMethods(): string[]
    {
        let methods: string[] = [];
        for(const symb of this._symbols){
            if(symb.kind == vscode.SymbolKind.Function)
            {
                methods.push(symb.name.replace(/\s/g, ""));
            }       
        }
        return methods;
    }
    private PrintMethods(): string
    {
        let concatenationString = "";        
        let methods: string[] =this.SortAlphabetically( this.GetMethods() );
        let lastMethod = "a";

        let watchForSeparation = true;

        methods.forEach(method => {
            if(watchForSeparation && DocumentInfo.separateMethods && method[0] == "_" && lastMethod[0] != "_")
            {                
                concatenationString += "\n";   
                watchForSeparation = false;             
            }            
            concatenationString += DocumentInfo.methodPrefix + method + "\n";

            lastMethod = method;
        });

        return concatenationString;
    }




    private GetTextFrom(element: ScriptElement) :string
    {
        let text:string = "";
        let separatorText:string = "";

        switch (element) {
            case ScriptElement.FileName:
                // text = this._name + "\n";
                text = this._name;
                if(this._extends != "")
                    text += "\n(extends "+this._extends+")";
                text += "\n";
                break;
            case ScriptElement.Methods:
                text = this.PrintMethods();
                separatorText = DocumentInfo.methodsSeparator;
                break;
            case ScriptElement.NodeReferences:                
                text = this.PrintNodeReferences();
                separatorText = DocumentInfo.nodesSeparator;
                break;
            case ScriptElement.Path:
                text = "Path: "+ this._document.fileName + "\n";
                break;
            case ScriptElement.Signals:
                text = this.PrintSignals();                                
                separatorText = DocumentInfo.signalsSeparator;                                        
                break;
            case ScriptElement.Variables:
                text = this.PrintInstanceVariables();
                separatorText = DocumentInfo.variablesSeparator;
                break;
            case ScriptElement.Space:
                text = "\n";                
                break;
        
            default:
                break;
        }

        if(text != "")
        {
            return separatorText + text;
        }
        return "";
    }

    

    private GetNodeReferences(): string[]
    {
        // return [];
        let result : string[] = [];
        // let reg = /^(?!#).*(?<=get_node\(["'])(?:\s*)(\S+)(["']\))/gm;
        
        // (?<=get_node\s*\(\s*["']).*[^\S"']*[^\S'"]
        // (?<=get_node\s*\(\s*["'])[^"'.]*
        // let reg = /(?<=get_node\s*\(\s*["'])[^"'.]*/gm; //Dont use the dot! (for things like ""../NodeName")
        // let reg = /(?<=get_node\s*\(\s*["'])[^"']*/gm;
        let reg = /(?<=get_node\s*\(\s*["'])[^"']*/gm;

        // let docText: string = this._document.getText();
        let docText: string = this._text;

        // const matches = docText.matchAll(regexp);
        // for (const match of matches) {
        //     console.log(match);
        //     console.log(match.index)
        // }
        // https://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression
        let match = reg.exec(docText);
        while (match != null) {
            // console.log("get_node: "+match[1]);
            // console.log("get_node: "+match[0]);

            // result.push(match[1]);
            result.push(match[0]);
            match = reg.exec(docText);
        }
        
        //NOTE cant ignore results in long comments, since the start and end of a long comment in Godot is the same (""")

        //Find $ references
        // let regDollar = /^(?!#).*(?<=\$)(?:\s*)(\S+)/gm //this one avoided comments
        // let regDollar = /(?<=\$)[^\s,.\]]*/gm //Doesnt avoid comments (Is not necessary, the text is free of comments) (DOT PROBLEM!)
        // let regDollar = /(?<=\$)[^\s,\]]*/gm //Doesnt avoid comments (Is not necessary, the text is free of comments)
        let regDollar = /(?<=\$).?.?[^.\s,\]]*/gm //Matches strings like $../Node.position, without the ".position"
        let matchDollar = regDollar.exec(docText);
        while (matchDollar != null) {
            // console.log("dollar: "+matchDollar[1]);
            // console.log("dollar: "+matchDollar[0]);
            // result.push(matchDollar[1]);
            result.push(matchDollar[0]);
            matchDollar = regDollar.exec(docText);
        }

        return result;
    }

    private PrintNodeReferences(): string
    {
        let concatenationString = "";        
        let refNodes: string[] =this.SortAlphabetically( this.GetNodeReferences() );
        refNodes.forEach(refNode => {                        
            concatenationString += DocumentInfo.nodePrefix + refNode + "\n";
        });
        return concatenationString;
    }






    private SortAlphabetically(array: string[]): string[]
    {

        // if(!array)
        if(!array || array.length == 0 || array == [])
        {
            return [];
        }

        return array.sort((n1,n2) => {
            n1 = n1.toLowerCase();
            n2 = n2.toLowerCase();

            if((n1[0] != "_" && n2[0] != "_") || (n1[0] == "_" && n2[0] == "_") )
            {            
                if (n1 > n2) {
                    return 1;
                }            
                if (n1 < n2) {
                    return -1;
                }
           }
           else{
                if (n1 > n2) {
                    return -1;
                }
                if (n1 < n2) {
                    return 1;
                }                
           }        
            return 0;
        });        
    }

}
