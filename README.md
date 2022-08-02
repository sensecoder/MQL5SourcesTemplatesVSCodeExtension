# MQL5 Files Template Wizard

Create files for MQL5 programs like in the original MetaEditor. This template wizard will help you create the skeleton files of the used modules with all the necessary constructs. The style of the original templates is observed (almost), but if you wish, you can edit the template blanks to your liking.

## Usage

When you create a new file in VS Code explorer with a `".mq5"` or `".mqh"` extention this triggered a wizard dialog in splitted view area. Next, you need to choose which module you want to create and define the parameters of its designs. Click the accept button and enjoy! 

![Basic demo](https://github.com/sensecoder/MQL5SourcesTemplatesVSCodeExtension/blob/master/raw/demo.gif?raw=true)

## Customization

Extention have full tune up capabilities. By editing the settings file, you can add a new file extension to apply the new template type and define its substitution variables. Also modify and create new template blanks with substitution macros.

### Files location

Look for files in: `"<extension folder>\out\res\"`. There are some with `".tpl"` extension it is a template blanks. And `"template_settings.json"` is a discribes all parameters of templates like a variables values and a presentation type in a wizard dialogue.
