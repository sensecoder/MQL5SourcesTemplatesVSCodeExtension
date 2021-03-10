vscode = acquireVsCodeApi();
function onCancel() {
   vscode.postMessage({
      command: 'cancel',
      text: 'Action cancelled!'
   });
}