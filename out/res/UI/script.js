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

/**
 * Display block with general template settings
 */
function showGeneral() {
   if(templateSettings.General){
      const canvas = document.getElementsByClassName('canvas');
      // var focused = false;
      var generalArea = document.createElement('div');
      generalArea.innerText = 'General settings:';
      var table = document.createElement('table');
      table.setAttribute('class','general');
      generalArea.appendChild(table);
      canvas[0].appendChild(generalArea);
      for (const key in templateSettings.General) {
         if (Object.hasOwnProperty.call(templateSettings.General, key)) {
            const element = templateSettings.General[key];
            var tr = document.createElement('tr');
            var tdKey = document.createElement('td',);
            tdKey.className = 'keyColumn';
            var tdValue = document.createElement('td');
            tdValue.className = 'valueColumn';
            var tdEqual = document.createElement('td');
            tdEqual.className = 'equalColumn';
            tdKey.innerText = key.toString();
            //tdValue.innerText = element.toString();
            tdEqual.innerText = '=';
            var inputValue = document.createElement('input');
            inputValue.id = key.toString();
            inputValue.type = 'text';
            inputValue.value = element.toString();
            // if (!focused) {
            //    inputValue.focus();
            //    focused = true;
            // }
            tdValue.appendChild(inputValue);
            tr.appendChild(tdKey);
            tr.appendChild(tdEqual);
            tr.appendChild(tdValue);
            table.appendChild(tr);
         }
      }
   }
}

/**
 * Display menu with buttons to choose action about next step of template applying
 */
function showTemplatesMenu() {
   if(templateSettings.Templates){
      const canvas = document.getElementsByClassName('canvas');
      var templatesMenuArea = document.createElement('div');
      templatesMenuArea.id = 'templatesMenuArea';
      templatesMenuArea.innerText = 'Select template type:';
      canvas[0].appendChild(templatesMenuArea);
      for (const key in templateSettings.Templates) {
         var div = document.createElement('div');
         div.className = 'btnDiv';
         var button = document.createElement('button');
         button.innerText = key.toString();
         button.addEventListener('click',() => {
            onTemplateSelected(key.toString());
         });
         div.appendChild(button);
         templatesMenuArea.appendChild(div);
         // button.addEventListener(onclick,onTemplateSelected());
      }
   }   
}

/**
 * Onclick templates menu button event handler
 * @param {*} templateName 
 */
function onTemplateSelected(templateName) {
   const elem = document.getElementById('templatesMenuArea');
   elem.remove();
   if(templateSettings.Templates){
      const canvas = document.getElementsByClassName('canvas');
      var templateSetupArea = document.createElement('div');
      templateSetupArea.id = 'templateSetupArea';
      templateSetupArea.innerText = templateName + ':';
      var table = document.createElement('table');
      table.setAttribute('class','templateSet');
      templateSetupArea.appendChild(table);
      canvas[0].appendChild(templateSetupArea);
      const templateSet = templateSettings.Templates[templateName]; 
      for (const key in templateSet) {
         if (Object.hasOwnProperty.call(templateSet, key)) {
            const element = templateSet[key];
            var tr = document.createElement('tr');
            var tdKey = document.createElement('td',);
            tdKey.className = 'keyColumn';
            var tdValue = document.createElement('td');
            tdValue.className = 'valueColumn';
            var tdEqual = document.createElement('td');
            tdEqual.className = 'equalColumn';
            tdKey.innerText = key.toString();
            //tdValue.innerText = element.toString();
            tdEqual.innerText = '=';
            var inputValue = document.createElement('input');
            inputValue.id = key.toString();
            inputValue.type = 'text';
            inputValue.value = element.toString();
            // if (!focused) {
            //    inputValue.focus();
            //    focused = true;
            // }
            tdValue.appendChild(inputValue);
            tr.appendChild(tdKey);
            tr.appendChild(tdEqual);
            tr.appendChild(tdValue);
            table.appendChild(tr);
         }
      }
   }
}

/**
 * Handle the message inside the webview
*/ 
window.addEventListener('message', event => {

      const message = event.data; // The JSON data our extension sent

      switch (message.command) {
         case 'SetFileName':
               this.showHeader(message.content);
            break;
         case 'SetTemplateSettings':
               this.setTemplateSettings(message.content);
               //this.showFileName('');
               this.showGeneral();
               this.showTemplatesMenu();
            break;
      }
});

function onCancel() {
   vscode.postMessage({
      command: 'cancel',
      text: 'Action cancelled!'
   });
}