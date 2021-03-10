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
            if (element.toString() === '[object Object]') {
               var presentation = makePresentationElement(element);
               if (presentation !== null) {
                  table.appendChild(presentation);  
               }
            } else {
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
               tdValue.appendChild(inputValue);
               tr.appendChild(tdKey);
               tr.appendChild(tdEqual);
               tr.appendChild(tdValue);
               table.appendChild(tr);
            }
            // if (!focused) {
            //    inputValue.focus();
            //    focused = true;
            // }
         }
      }
   }
}

function makePresentationElement(element) {
   let presentation = null;
   let data = [];
   for (const key in element) {
      if (Object.hasOwnProperty.call(element, key)) {
         if (key.toString() === 'UserPresentation') {
            presentation = element[key];
         } else {
            data.push({key:key.toString(),value:element[key]});
         }         
      }
   }

   if (presentation === null) {
      return null;
   }

   let text = '';

   for (const key in presentation) {
      if (Object.hasOwnProperty.call(presentation, key)) {
         const element = presentation[key];
         keyStr = key.toString();
         switch (keyStr) {
            case 'hide':
                  return null;
               break;
            case 'checkBoxField':
                  return makeCheckBoxField(element,data);
               break;
            default:
                  text = text + keyStr;
               break;
         }
      }
   }

   var tr = document.createElement('tr');
   tr.innerText = text;
   return tr;

   // return null;
}

/**
 * For TEST!!!
 * @param {*} text 
 */
function toTest(text) {
   let test = document.getElementById('test');
   var div = document.createElement('div');
   div.innerText = text;
   test.appendChild(div);
}

function getValue(key,arrKeyVal) {
   let value = '';
   arrKeyVal.forEach(element => {
      if(key === element.key.toString()) {
         value = element.value.toString();
      }
   });
   return value;
}

function makeCheckBoxField(element,params) {
   var tr = document.createElement('tr');
   var td = document.createElement('td',);
   //td.className = 'checkBoxColumn';
   td.setAttribute('colspan','3');
   var divChecker = document.createElement('div');
   var divValue = document.createElement('div');
   divValue.id = element.checker+'Value';
   divValue.className = 'checkersAreaValue';
   
   checkBox = document.createElement('input');
   checkBox.type = 'checkbox';
   checkBox.id = element.checker;
   // checkBox.addEventListener('click',() => {
   //    onCheckBoxClick(element.checker,divValue.id);
   // });
   label = document.createElement('label');
   label.setAttribute('for',element.checker);
   label.innerText = element.caption;
   divChecker.appendChild(checkBox);
   divChecker.appendChild(label);

   element.content.forEach(element => {
      var content = null;
      switch (element.container) {
         case 'textarea':
               content = document.createElement('textarea');
               content.rows = 3;
               let text = getValue(element.value,params);
               content.innerText = text;
            break;
      
         default:
            divValue.innerText = 'value';
            break;
      }
      if(content !== null) {
         divValue.appendChild(content);
      }
   });

   td.appendChild(divChecker);
   td.appendChild(divValue);
   //divValue.innerText = 'value';
   tr.appendChild(td);
   
   return tr;
}

/**
 * Handler of check box click event
 * @param {*} checkerId CheckBox element id
 * @param {*} dependedElemIdsArr Array of depended elements id
 */
function onCheckBoxClick(checkerId, dependedElemIdsArr) {

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