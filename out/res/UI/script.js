vscode = acquireVsCodeApi();
templateSettings = {};

function btnAcceptClick() {   
   vscode.postMessage({
      command: 'accept',
      text: 'Settings accepted!'
   });
}

/**
 * Show header to user with created file
 * @param {*} fileName 
 */
function showHeader(fileName) {
   const header = document.getElementsByClassName('head-text');
   //header.textContent = 'Detect';
   let fileStruct = JSON.parse(fileName);
   header[0].textContent = 'Detect new created file: '+fileStruct.FileNameFull;
   templateSettings.fileName = fileStruct;
   //this.showFileName(fileStruct.FileNameFull);
}

/**
 * Recieves and stored settings of template
 * @param {JSON} settings 
 */
function setTemplateSettings(settings) {
   let fileName = {};
   if (templateSettings.fileName) {
      fileName = templateSettings.fileName;
   }
   templateSettings = JSON.parse(settings);
   templateSettings.fileName = fileName;
}

/**
 * Temporary for test
 */
function showFileName(name) {
   const canvas = document.getElementsByClassName('canvas');
   var par = document.createElement('p');
   if(name === '') {
      par.innerText = 'FileName = ' + templateSettings.fileName.FileName;
   } else {
      par.innerText = 'FileName = ' + name;
   }
   var par2 = document.createElement('p');
   par2.innerText = templateSettings.General.Copyright;
   canvas[0].appendChild(par);
   canvas[0].appendChild(par2);
}

function showGeneral() {
   if(templateSettings.General){
      const canvas = document.getElementsByClassName('canvas');
      var div = document.createElement('div');
      div.setAttribute('class','general');
      canvas[0].appendChild(div);
      for (const key in templateSettings.General) {
         if (Object.hasOwnProperty.call(templateSettings.General, key)) {
            const element = templateSettings.General[key];
            var p = document.createElement('p');
            p.innerText = key.toString() + ' = ' + element.toString();
            div.appendChild(p);
         }
      }
   }
}

// Handle the message inside the webview
window.addEventListener('message', event => {

      const message = event.data; // The JSON data our extension sent

      switch (message.command) {
         case 'SetFileName':
               this.showHeader(message.content);
            break;
         case 'SetTemplateSettings':
               this.setTemplateSettings(message.content);
               this.showFileName('');
               this.showGeneral();
            break;
      }
});