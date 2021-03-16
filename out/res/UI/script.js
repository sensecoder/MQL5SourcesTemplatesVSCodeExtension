vscode = acquireVsCodeApi();
fileNameObj = {};
templateSettings = {};
data = {};

function btnAcceptClick() {   
   //let data = {};
   let elements = document.getElementsByClassName('Data');
   
   for (i = 0; i < elements.length; i++) {
      let typeName = elements[i].nodeName;
      switch (typeName) {
         case 'INPUT':
               let type = elements[i].type;
               switch (type) {
                  // case 'text':
                  //       data[elements[i].id] = elements[i].value;
                  //    break;
                  case 'checkbox':
                        data[elements[i].id] = elements[i].checked;
                     break;
               
                  default:
                        data[elements[i].id] = elements[i].value;
                     break;
               }
            break;

         // case 'TEXTAREA':
         //       data[elements[i].id] = elements[i].value;
         //    break;
               
         case 'OPTION':
               if (elements[i].selected) {
                  data[elements[i].id] = elements[i].value;
               }
            break;

         default:
               data[elements[i].id] = elements[i].value;
            break;
      }
   }

      // let inputType = '';
      // let id = elements[i].id;
      // if (typeName === 'INPUT') {
      //    inputType = elements[i].type;
      // }
      // if (typeName === 'OPTION') {
      //    if (elements[i].selected) {
      //       inputType = elements[i].value;
      //    }
      // }
      // toTest(typeName + ' ' + inputType + ' ' + id);
   
   // // Need prototype filename
   // JSON.stringify(templateSettings, (key, value) => {
   //    if(value !== '{}') {
   //       if (key === 'PrototypeFileName') {
   //          data[key] = value;
   //       }
   //    }
   //    return value;
   // });

   // let testStr = JSON.stringify(data);
   // toTest(testStr);

   vscode.postMessage({
      command: 'accept',
      text: 'Settings accepted!',
      settings: data
   });
}

/**
 * Show header to user with created file
 * @param {*} fileName 
 */
function showHeader(fileName) {
   const header = document.getElementsByClassName('head-text');
   //header.textContent = 'Detect';
   // let fileStruct = JSON.parse(fileName);
   fileNameObj = fileName;
   header[0].textContent = 'Detect new created file: '+fileNameObj.FileNameFull;
   // templateSettings.fileName = fileStruct;
   //this.showFileName(fileStruct.FileNameFull);
}

/**
 * Recieves and stored settings of template
 * @param {JSON} settings 
 */
function setTemplateSettings(settings) {
   // let fileName = {};
   // if (templateSettings.fileName) {
   //    fileName = templateSettings.fileName;
   // }
   templateSettings = settings;
   // templateSettings.fileName = fileName;
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
            inputValue.className = 'Data';
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
 * Add data from one object to another
 * @param {*} toObj 
 * @param {*} fromObj 
 */
function concatTemplateDataObj(toObj,fromObj) {
   for (const key in fromObj) {
      if (fromObj[key].toString() === '[object Object]') {
         let objSet = fromObj[key];
         if (Object.hasOwnProperty.call(objSet,'UserPresentation')) {
            for (const key in objSet) {
               if (objSet[key].toString() !== '[object Object]') {
                  toObj[key] = objSet[key];
                  // toTest(key+" + "+objSet[key]);      
               }
            }
         }
      } else {
         toObj[key] = fromObj[key];
         // toTest(key+" + "+fromObj[key]);
      }
   }
}

/**
 * Generate data object with all needed params
 * @param {*} templateName 
 */
function generateData(templateName) {
   data = {};
   concatTemplateDataObj(data,fileNameObj);
   concatTemplateDataObj(data,templateSettings.General);
   let tempSet = templateSettings.Templates[templateName];
   concatTemplateDataObj(data,tempSet);
}

function getPrimalValue(key) {
   if (Object.hasOwnProperty.call(data, key)) {
      let value = data[key].toString();
      // let value = '';
      let pos = 0;
      while (pos >= 0) {
         pos = value.indexOf('$',pos);
         if (pos >= 0) {
            let start = pos;
            pos = value.indexOf(' ',pos);
            let possibleKey = '';
            if(pos > 0) {
               possibleKey = value.substr(start+1,pos-(start+1));
            } else {
               possibleKey = value.substr(start+1);
            }
            let substituteValue = possibleKey;
            if (Object.hasOwnProperty.call(data, possibleKey)) {
               substituteValue = data[possibleKey];
            }
            let begStr = value.substr(0,start);
            let endStr = '';
            if(pos > 0) {
               endStr = value.substr(pos);
            }
            value = begStr + substituteValue + endStr;
            if(pos > 0) {
               pos = start + 1;
            }
         }  
      }
      return value;
   }
   else {
      return '';
   }
}

/**
 * Onclick templates menu button event handler
 * @param {*} templateName 
 */
function onTemplateSelected(templateName) {
   const elem = document.getElementById('templatesMenuArea');
   elem.remove();
   generateData(templateName);
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
               inputValue.className = 'Data';
               inputValue.type = 'text';
               inputValue.value = getPrimalValue(key); //element.toString();
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
      let btnDiv = document.createElement('div');
      btnDiv.className = 'btnDiv';
      let btnAccept = document.createElement('button');
      btnAccept.innerText = 'Accept!';
      btnAccept.addEventListener('click',() => {
         btnAcceptClick();
      });
      btnDiv.appendChild(btnAccept);
      templateSetupArea.appendChild(btnDiv);
   }
}

function makePresentationElement(element) {
   let presentation = null;
   let dataElem = [];
   for (const key in element) {
      if (Object.hasOwnProperty.call(element, key)) {
         if (key.toString() === 'UserPresentation') {
            presentation = element[key];
         } else {
            dataElem.push({key:key.toString(),value:element[key]});
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
                  return makeCheckBoxField(element,dataElem);
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
   let value;
   arrKeyVal.forEach(element => {
      if(key === element.key.toString()) {
         value = element.value; // getPrimalValue(key);
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
   checkBox.className = 'Data';
   checkBox.addEventListener('click',() => {
      onCheckBoxClick(element.checker,element.checker+'Value');
   });
   label = document.createElement('label');
   label.setAttribute('for',element.checker);
   label.innerText = element.caption;
   divChecker.appendChild(checkBox);
   divChecker.appendChild(label);

   if (Object.hasOwnProperty.call(element, 'content')) {
      element.content.forEach(element => {
         var content = null;
         switch (element.container) {
            case 'textarea':
                  content = document.createElement('textarea');
                  content.rows = 3;
                  let text = getPrimalValue(element.value); // getValue(element.value,params);
                  content.innerText = text;
                  content.id = element.value;
                  content.className = 'Data';
               break;
            case 'valueEdit':
                  content = document.createElement('table');
                  let trVE = document.createElement('tr');
                  var tdKey = document.createElement('td',);
                  tdKey.className = 'keyColumn';
                  var tdValue = document.createElement('td');
                  tdValue.className = 'valueColumn';
                  var tdEqual = document.createElement('td');
                  tdEqual.className = 'equalColumn';
                  tdKey.innerText = element.value;
                  //tdValue.innerText = element.toString();
                  tdEqual.innerText = '=';
                  var inputValue = document.createElement('input');
                  inputValue.id = element.value;
                  inputValue.className = 'Data';
                  inputValue.type = 'text';
                  inputValue.value = getPrimalValue(element.value); // getValue(element.value,params);
                  tdValue.appendChild(inputValue);
                  trVE.appendChild(tdKey);
                  trVE.appendChild(tdEqual);
                  trVE.appendChild(tdValue);
                  content.appendChild(trVE);
               break;
            case 'select':
                  content = document.createElement('table');
                  content.className = 'select';
                  let trS = document.createElement('tr');
                  let tdCaption = document.createElement('td');
                  tdCaption.className = 'caption';
                  let tdSelect = document.createElement('td');
                  // tdSelect.className = 'select';
                  if(Object.hasOwnProperty.call(element, 'caption')) {
                     tdCaption.innerText = element.caption;
                  }
                  let sel = document.createElement('select');
                  sel.name = element.value;
                  let options = getValue(element.value,params);
                  let selectedVal = getPrimalValue(element.selectedValue); // getValue(element.selectedValue,params);
                  options.forEach(val => {
                     let option = document.createElement('option');
                     option.value = val;
                     option.id = element.selectedValue;
                     option.className = 'Data';
                     option.innerText = val;
                     if(val === selectedVal) {
                        option.selected = true;
                     }
                     sel.appendChild(option);
                  });
                  //toTest(getValue(element.value,params));
                  tdSelect.appendChild(sel);
                  trS.appendChild(tdCaption);
                  trS.appendChild(tdSelect);
                  content.appendChild(trS);
               break;
         
            default:
               //divValue.innerText = 'value';
               break;
         }
         if(content !== null) {
            divValue.appendChild(content);
            if (!getValue(element.checker,params)) {
               divValue.style.display = 'none';
            }
         }
      });
   } else {
      divValue.id = '';
   }
   td.appendChild(divChecker);
   td.appendChild(divValue);
   //divValue.innerText = 'value';
   tr.appendChild(td);
   
   return tr;
}

/**
 * Handler of check box click event
 * @param {*} checkerId CheckBox element id
 * @param {*} valueDivId Id of block with documents element need to hide or show
 */
function onCheckBoxClick(checkerId, valueDivId) {
   // toTest('here! checkerId='+checkerId+' valueDivId='+valueDivId);
   checker = document.getElementById(checkerId);
   valueDiv = document.getElementById(valueDivId);
   if (checker.checked) {
      valueDiv.style.display = 'block';
   } else {
      valueDiv.style.display = 'none';
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