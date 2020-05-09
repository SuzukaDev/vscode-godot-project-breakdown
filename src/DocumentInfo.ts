// const vscode = require('vscode');
// import { workspace, languages, window, commands, ExtensionContext, Disposable } from 'vscode';

'use strict';

import * as vscode from 'vscode';
import { workspace, window } from 'vscode';
// import { Script } from 'vm';

/* NOTE 
The problem of making different separators without being asociated to a field (signals, vars, methods, etc)
is that they will always be printed, no matter if the fields they preceed are EMPTY.

Per example:
s1 = separator1 = "------ This is a separator example for signals -----"
s1s v -> this wil print the separator1, the signals, space, and then the variables

if s is empty (there is no signals), it will print the separator and then the signals.
I would be confusing:

------ This is a separator example for signals -----

var1
var2Example
var3


*/
// TODO hacer lo de los prefijos
const prefixSeparator: string = ">";

enum ScriptElement {
    NodeReferences = "n",
    Signals = "s",
    ConnectedSignals = "c", //NOTE
    Variables = "v",
    Methods = "m",
    Path = "p",
    FileName = "f",
    Enums = "e",
    Space = " ",
    ClassComment = "#"
};

// class DocumentInfo implements vscode.TextDocumentContentProvider   
// class DocumentInfo
// https://stackoverflow.com/questions/41058522/how-to-use-a-class-as-a-type-for-properties-of-another-class-in-typescript
// export default class DocumentInfo
export class DocumentInfo //https://stackoverflow.com/questions/47876790/how-to-use-a-compiled-typescript-class-in-javascript
{



static config: vscode.WorkspaceConfiguration = workspace.getConfiguration('godotProjectBreakdown');

static documentOrder: string = (DocumentInfo.config.get('file.order') as string);
// static documentOrderClean: string = DocumentInfo.RemovePrefixes(DocumentInfo.documentOrder);
//Separators
static signalsSeparator: string = (DocumentInfo.config.get('separator.signals') as string) + "\n";
static connectedSignalsSeparator: string = (DocumentInfo.config.get('separator.connectedSignals') as string) + "\n";
static nodesSeparator: string = (DocumentInfo.config.get('separator.nodeReferences') as string) + "\n";
static variablesSeparator: string = (DocumentInfo.config.get('separator.variables') as string) + "\n";
static methodsSeparator: string = (DocumentInfo.config.get('separator.methods') as string) + "\n";
static enumsSeparator: string = (DocumentInfo.config.get('separator.enums') as string) + "\n";



static separateVariables: boolean = (DocumentInfo.config.get('separator.publicAndPrivateVariables') as boolean);
static separateMethods: boolean = (DocumentInfo.config.get('separator.publicAndPrivateMethods') as boolean);

static showConstants: boolean = (DocumentInfo.config.get('file.showConstants') as boolean);
static showEnumValues: boolean = (DocumentInfo.config.get('file.showEnumValues') as boolean);
static showMethodArguments: boolean = (DocumentInfo.config.get('file.showMethodArguments') as boolean);


//prefixes //NOTE maybe change this
static signalPrefix: string = (DocumentInfo.config.get('prefix.signals') as string);
static enumPrefix: string = (DocumentInfo.config.get('prefix.enums') as string);
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
        if(symbols != null)                                                   
            this._symbols = symbols;      
        else
            this._symbols = [];
        
        let splitName = this._document.fileName.split("\\");        
        this._name = splitName[splitName.length-1];

        // TODO checkear si en settings tenemos el bool de ignoreComments
        this._text = this.RemoveCommentsFromText(this._document.getText());
        this._extends = this.FindExtend();
	}

    
    /*
    private zGetElementFromDocumentOrder(enumValue:ScriptElement): string{
        // https://stackoverflow.com/questions/39372804/typescript-how-to-loop-through-enum-values-for-display-in-radio-buttons
        // https://stackoverflow.com/questions/18111657/how-to-get-names-of-enum-entries
        // https://stackoverflow.com/questions/48276105/get-typescript-enum-name-from-instance
        // let enumKey = Object.keys(ScriptElement).find(key => ScriptElement[key] === enumValue);
        // console.log(Object.keys(ScriptElement).find(key => ScriptElement[key] === enumValue));
        // console.log(ScriptElement[enumValue]);
        // let val = Object.keys(ScriptElement).find(k => k === enumValue);
        let vals = Object.values(ScriptElement);
        console.error("VAL: "+vals);
        // for (const e in ScriptElement) {
        // for (const e in Object.values(ScriptElement)) {
        for (const e in vals) {
            // if (ScriptElement.hasOwnProperty(e)) {
            if (1==1) {
                // console.error(ScriptElement[ScriptElement.e]);
                // console.log("enum: "+e+ "enum.toString(): "+e.toString()+ "    arg Enum = "+enumValue + "     enumName: "+ ScriptElement[enumValue]);
                // console.log("enum: "+e+ "enum.valueOf: "+ScriptElement.valueOf(e)+ " enum.toString(): "+e.toString()+ "    arg Enum = "+enumValue + "     enumName: " );
                console.log("vals[e]= "+vals[e] + " enum: "+e+ " enum.toString(): "+e.toString()+ "    arg Enum = "+enumValue + "     enumName: " );
                // console.log(Object.keys(ScriptElement).map(k => ScriptElement[k]).filter(v => typeof v === "number")

                let index:number = parseInt(e);
                // if(e==enumValue)
                if(vals[e]==enumValue)
                // if(ScriptElement[e:number]==enumValue)
                // if(ScriptElement[index]==enumValue)
                {
                    console.error("ES IGUAL! --> "+e);
                }
                
            }
        }
        return "";
    }

    private GetElementFromDocumentOrder(enumValue:ScriptElement): string{
        let pattern1 = ',?([^,]*)';
        let pattern2 = ',?';
        let reg = new RegExp(pattern1 + enumValue + pattern2);

        let text = DocumentInfo.documentOrder;
        let result = text.match(reg);
        if(result)
        {
            let res = result[0].replace(/,/g,"");
            return res;
        }
        else{
                return "";
        }
    }

    private GetPrefix(enumValue:ScriptElement): string{
        let element = this.GetElementFromDocumentOrder(enumValue);
        let split = element.split(prefixSeparator);
        return split.length == 1? "" : split[0];   
    }

    private static RemovePrefixes(text:string): string
    {
        // let reg = new RegExp('(?:,)?([^,]*)' + prefixSeparator + '(?:,)?');        

        // https://regex101.com/r/7KA7ba/8
        // (?<=,?)([^, ]*)>(?:,)?        
        let reg = new RegExp('(?<=,?)([^, ]*)' + prefixSeparator + '(?:,)?');        
        return text.replace(reg,"");
    }
    */


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
        // if(this._symbols == [])
        if(!this._symbols[0])
        {
            let msg = "### WARNING: Symbols are null on '"+this._name+"' (Path: "+this._document.uri.path+")\n";
            console.warn(msg+ ". This COULD be due because there is an error on that file or the file is empty.");
            // console.error(msg);
            documentBreakdown += msg;
        }
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
        // console.error("\n\n\n\n\n\n\n\n"+this._name+"\n");
        // console.log(noCommentsText);
        return noCommentsText;
    }


    private FindExtend():string
    {
        // let reg = /(?<=extends)(?:\s*)(\S+)/g;
        let reg = /(?<=extends)(?:\s*)(.*)/;
        let docText: string = this._text;
        let match = reg.exec(docText);
        if(match)
            return match[0];
        else
            return "";
    }

    private GetClassComment():string
    {
        let reg = /(?<=###\\)(.)*?(?=\/###)/ms;
        let textWithComments:string = this._document.getText()
        let match = reg.exec(textWithComments);

        // return reg.exec(textWithComments)!=""?:"";
        return match != null? match[0] + "\n":"";
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

    private GetConnectedSignals(): string[]
    {
        // let reg = /(?<=connect\s*\()\s*.*(?=\))/g;
        // let reg = /(?:(\w*)\.)?(?:connect\s*\()(.*)\)/g;
        let reg = /(?:(.*)\.)?(?:connect\s*\()(.*)\)/g;
        let docText: string = this._text;
        let regexp: Array<string> = [];
        // regexp = docText.match(reg) as string[];
        // return regexp;   

        let results:string[] = [];

        let match = reg.exec(docText);
        while (match != null) {
            let node:string = match[1]?  match[1].replace(/\s/g,"") : "self";
            let signalSplit = match[2].replace(/\s/g,"").split(",");

            let signalName = signalSplit[0];
            let targetNode = signalSplit[1];
            let func = signalSplit[2];

            // let str = signalName + " ("+ node + "), function: " + func + " (" + targetNode + ")";
            let str = `${signalName} (${node}), function: ${func} (${targetNode})`;

            results.push(str);
            match = reg.exec(docText);

            // let enumName: string = match[1].trim();
            // let enumValues = match[2].replace(/\s*/gms, "").replace(/,/gm, ", ");
        }

        return results;

    }

    private PrintConnectedSignals(): string
    {
        let concatenationString = "";
        let connectedSignals: string[] = this.SortAlphabetically( this.GetConnectedSignals());

        if(connectedSignals == []){
            return "";
        }

        // connectedSignals.forEach(aConnectedSignal => {
        //     let signalSplit = aConnectedSignal.replace(/['"\s]/g, "").split(",");
        //     let signalName = signalSplit[0];
        //     let targetNode = signalSplit[1];
        //     let func = signalSplit[2];
        //     // concatenationString += DocumentInfo.signalPrefix + 
        //     // TODO Add custom prefix?
        //     concatenationString += "CONNECTED SIGNAL: " + 
        //         signalName + " on "+targetNode + " ("+func+")"
        //         "\n";
        // });
        connectedSignals.forEach(aConnectedSignal => {
            // concatenationString += DocumentInfo.signalPrefix + 
            // TODO Add custom prefix?
            concatenationString += aConnectedSignal + "\n";
        });

        return concatenationString;

    }


    private GetEnums(): string[]
    {
        let result: string[] = [];
        let reg = /(?<=enum\s*)(\w*)\s*{(.*?)(?=})/gsm;        
        let docText: string = this._text;

        let regexp: Array<string> = [];
        regexp = docText.match(reg) as string[];
        
        let match = reg.exec(docText);
        while (match != null) {
            let enumName: string = match[1].trim();
            let enumValues = match[2].replace(/\s*/gms, "").replace(/,/gm, ", ");
            result.push(enumName+"..."+enumValues);// "..." is a custom separator
            match = reg.exec(docText);
        }

        return result;
    }

    private PrintEnums(): string
    {
        let concatenationString = "";
        let enums: string[] = this.SortAlphabetically( this.GetEnums());       

        if(enums == []){
            return "";
        }

        enums.forEach(anEnum => {            
            let split = anEnum.split("..."); // "..." is the separator between the name and the values
            let enumName = split[0];
            let valuesString = "";
            if(DocumentInfo.showEnumValues)
            {
                let enumValues = split[1];
                valuesString = " ["+enumValues+"]"
            }

            concatenationString += DocumentInfo.enumPrefix + 
                enumName + valuesString + "\n";
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
            // godot tools below 1.x.x
            // else if(symb.kind == vscode.SymbolKind.Function)
            // {
            //     break;
            // }            
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
                let args:string = DocumentInfo.showMethodArguments? "(" + this.GetMethodArguments(symb) + ")" : "";                

                methods.push(symb.name.replace(/\s/g, "") + args);
            }     
        }
        return methods;
    }

    //Lastest godot tools wasn't showing the args for the methods, so this is the fix:
    private GetMethodArguments(symb:vscode.DocumentSymbol):string
    {
        // let methodLine = symb.range._start._line;
        let methodLine = symb.range.start.line;
        let result = "";
        for (let i = 0; i < symb.children.length; i++) {
            const child = symb.children[i];
            let childLine = child.range.start.line;
            if(childLine != methodLine)
            {
                break;
            }            
            
            result += " " + child.name + ",";
            
        }        

        if(result != "")
        {
            if(result[0] == " ")
            {
                result = result.substring(1);            
            }
            if(result[result.length - 1] == ",")
            {
                result = result.substring(0, result.length - 1);
            }
        }
        return result;
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
            case ScriptElement.ConnectedSignals:
                //TODO separador conected signals           
                text = this.PrintConnectedSignals();                                
                separatorText = DocumentInfo.connectedSignalsSeparator;                                        
                // separatorText = "¿¿¿¿¿¿¿¿¿¿¿¿¿CONNECTED SIGNALS?????????????\n";                                        

                break;
            case ScriptElement.Signals:
                text = this.PrintSignals();                     
                separatorText = DocumentInfo.signalsSeparator;                                        
                break;
            case ScriptElement.Variables:
                text = this.PrintInstanceVariables();
                separatorText = DocumentInfo.variablesSeparator;
                break;
            case ScriptElement.Enums:
                text = this.PrintEnums();
                separatorText = DocumentInfo.enumsSeparator;
                break;
            case ScriptElement.ClassComment:
                text = this.GetClassComment();                
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

    private GetTextBetweenParentheses(text:string):string
    {
        // text = text.replace(/get_element\s*\(/,"");
        let counter = 1;
        let charCounter = 0
        let charArray = text.split("");        
        do {
            let c = charArray[charCounter]
            if(c=="(")
                counter++;
            else if(c==")")
                counter--;
            charCounter++;
        } while (counter > 0 && charCounter<charArray.length);   
        return text.substr(0,charCounter-1);
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
        // let reg = /(?<=get_node\s*\(\s*["'])[^"']*/gm;
        let reg = /(?<=get_node\s*\(\s*).*(?=\))/gm;


        // SERIA ESTO:
        // (?<=get_node\s*\(\s*).*(?=\))


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

            
            // result.push(match[0]);

            // If the text contains a ")" means that get_node is being called in a "more complex" line of code, like, for example -> get_node(PathsReference.character_list).connect("pre_text_added_on_list", self, "_OnTextPreAddedOnList") ----- wich makes it return until the last ), so we need to extract only the text between the get_node parentheses:
            let node = match[0].includes(")")? this.GetTextBetweenParentheses(match[0]) : match[0];
            // result.push(match[0]);
            // result.push(this.GetTextBetweenParentheses(match[0]));
            result.push(node);
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
