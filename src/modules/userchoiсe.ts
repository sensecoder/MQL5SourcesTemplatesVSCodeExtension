//import { settings } from 'cluster';
import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Предоставляет пользователю возможность выбрать вариант
 * параметров шаблона для их применения.
 */
export class UserChoice {
   private settings: any;
   private extContext: vscode.ExtensionContext;
   private listener: any;
   private file: string = '';
   private currentPanel: vscode.WebviewPanel | undefined = undefined;
   
   /**
    * Предоставляет пользователю возможность выбрать вариант параметров шаблона для их применения.
    * @param options Возможные парамеры для выбора
    */
   constructor(options: any, context: vscode.ExtensionContext) {
      this.settings = options; // options, они те же settings - вот же ирония
      this.extContext = context;
   }

   /**
    * Запускает процедуру предоставления пользователю возможность выбрать шаблон для создания и его настройки
    */
   public chooseOption(listener: any, fileName: string): any {
      // Временная заглушка, поскольку не хочу заниматься пока проработкой этого:
      // return this.settings;
      this.listener = listener;
      this.file = fileName;

      let panel = vscode.window.createWebviewPanel(
                                 'userChooseView',
                                 'Select parameters of template:',
                                 vscode.ViewColumn.Beside,
                                 {
                                    enableScripts: true
                                 } 
                              );
      
      panel.webview.html = this.webViewContent(panel.webview);
      panel.webview.onDidReceiveMessage(
         message => {
            switch (message.command) {
               case 'accept':
                     this.settings = message.settings;
                     this.onUserAccept();
                     panel.dispose();
                     //listener(this.settings);
                     //return this.settings;
                  break;
               case 'cancel':
                     console.log(message.text);
                     panel.dispose();
                  break;
            
               default:
                  break;
            }
         },
         // undefined,
         // this.extContext.subscriptions
      );

      this.currentPanel = panel;
      this.showHeadToUserAndSetFile();
      this.setSettingsToPanel();
      return null;
   }

   private showHeadToUserAndSetFile() {
      let fileName = this.file.substr(this.file.lastIndexOf('\\')+1);
      // console.log(' fileName = ' + fileName);
      let strFileName = '{"FileNameFull":"'+fileName+'","FileName":"'+fileName.substr(0,fileName.lastIndexOf('.'))+'"}';
      // console.log('strFileName = ' + strFileName);
      // let command = '{"command":"SetFileName","content":'+strFileName+'}';
      this.currentPanel?.webview.postMessage({command:'SetFileName',content:strFileName});
   }
   
   private setSettingsToPanel(){
      if(!this.settings){
         console.error(this.errorHead() + ' No settigs here!');
      }
      let settingsStr = JSON.stringify(this.settings);
      this.currentPanel?.webview.postMessage({command:'SetTemplateSettings',content:settingsStr});
      // console.log(settingsStr);

   }

   private onUserAccept() {
      // vscode.window.showInformationMessage('message.text');
      // console.log('re');
      this.listener(this.settings, this.file);
      // console.log('redffe');
   }

   private webViewContent(webview: vscode.Webview): string {
      // let file = path.join(__dirname,'../res/UI/dialog.html');
      // NOT Use a nonce to only allow specific scripts to be run
		// const nonce = this.getNonce();
      
      // Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(this.extContext.extensionUri, 'out', 'res', 'UI', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this.extContext.extensionUri, 'out', 'res', 'UI', 'vscode.css');
      const stylesPath = vscode.Uri.joinPath(this.extContext.extensionUri, 'out', 'res', 'UI', 'style.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
      const stylesUri = webview.asWebviewUri(stylesPath);

      // Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this.extContext.extensionUri, 'out', 'res', 'UI', 'script.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

      // console.log('cspSource = ' + webview.cspSource + ' nonce = ' + nonce);
      // console.log('styleResetPath = ' + styleResetPath);
      // console.log('stylesResetUri = ' + stylesResetUri);
      
      let content = `<!DOCTYPE html>
      <html lang="en">
         <head>
            <meta charset="UTF-8">
             
            <!-- Fuck this shit! 
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src ${webview.cspSource};"> 
            -->

            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
            <link href="${stylesUri}" rel="stylesheet">
            
            
            <title>User dialog</title>
         </head>
         <body>
            <h1 class="head-text">Loose script handler... <h1>
               <div id="test">
               </div>
               <div class="canvas">
               </div>         
            <footer>
               <div class="btnDiv">
                  <button onclick="onCancel()" class="btnCancel" type="button">Cancel (leave blank)</button>
               </div>
            </footer>
            <script src="${scriptUri}">                      
            </script>
         </body>
      </html>`;
      //src="${scriptUri}"
      // try {
      //    content = readFileSync(file, 'utf8');
      // } catch (error) {
      //    console.error(__filename.substr(__filename.lastIndexOf('\\')+1)+': User dialog file read error occur! fileName = '+file);
      // }
      return(content);
   }

   private errorHead(): string {
      return __filename.substr(__filename.lastIndexOf('\\')+1);
   }

   // private getNonce() {
   //    let text = '';
   //    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   //    for (let i = 0; i < 32; i++) {
   //       text += possible.charAt(Math.floor(Math.random() * possible.length));
   //    }
   //    return text;
   // }
}