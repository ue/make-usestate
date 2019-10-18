const vscode = require("vscode");

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    "extension.stateToUseState",
    function() {
      let editor = vscode.window.activeTextEditor;
      let lines = [];
      let selectionLength;

      const selection = editor.selection;
      const startPoint = selection.start.line;
      const endPoint = selection.end.line;
      const isSingleLine = selection.isSingleLine;

      selectionLength = editor.document.lineAt(endPoint).text.length;
      for (let i = startPoint; i <= endPoint; i++) {
        const pureLine = editor.document.lineAt(i).text;
        const selectedText = editor.document.lineAt(i).text.trim();
        const whiteSpaceCount = pureLine.substr(0, pureLine.indexOf(selectedText.charAt(0)));

        if (selectedText && !selectedText.includes('this.state') && selectedText !== '};') {
          const dividedLine = selectedText.split(':');
          const stateName = dividedLine[0] && dividedLine[0].trim();
          let initialState = dividedLine[1] && dividedLine[1].trim().replace(',', '');
          const camelCaseStateName = stateName.charAt(0).toUpperCase() + stateName.slice(1);

          if (initialState.includes('props.')) {
            initialState = initialState.replace('props.', '');
          }

          if (dividedLine[0].includes(',')) initialState.replace(',', "");
          const whiteSpace = new Array(whiteSpaceCount).join(" ");
          const prepareValue = `${whiteSpace}const [${stateName}, set${camelCaseStateName}] = useState(${initialState});`

          lines.push(prepareValue);
        };
      }

      editor.edit(editBuilder => {
        isSingleLine
          ? editBuilder.replace(selection, lines.join(", "))
          : editBuilder.replace(
              new vscode.Range(startPoint, 0, endPoint, selectionLength),
              lines.join("\n")
            );
      });
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;