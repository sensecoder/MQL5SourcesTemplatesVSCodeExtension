//import { settings } from "cluster";
import { settings } from 'cluster';
import * as vscode from 'vscode';

/**
 * Предоставляет пользователю возможность выбрать вариант
 * параметров шаблона для их применения.
 */
export class UserChoice {
   private settings: any;
   
   /**
    * Предоставляет пользователю возможность выбрать вариант параметров шаблона для их применения.
    * @param options Возможные парамеры для выбора
    */
   constructor(options: any) {
      this.settings = options; // options, они те же settings - вот же ирония
   }

   /**
    * Запускает процедуру предоставления пользователю возможность выбрать шаблон для создания и его настройки
    */
   public chooseOption(): any {
      // Временная заглушка, поскольку не хочу заниматься пока проработкой этого:
      return this.settings;

      let panel = vscode.window.createWebviewPanel(
                                 'userChooseView',
                                 'Select parameters of template:',
                                 vscode.ViewColumn.Beside,
                                 {} 
                              );
      
      panel.webview.html = this.webViewContent();
      
      return null;
   }

   private webViewContent(): string {
      return( `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cat Coding</title>
      </head>
      <body>
          User accept settings here...
      </body>
      </html>`);
   }
}