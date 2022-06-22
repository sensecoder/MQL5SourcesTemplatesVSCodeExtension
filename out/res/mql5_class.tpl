//+------------------------------------------------------------------+
//|                               {{FileNameFull inMQLHeadStandard}} |
//|                                     {{Author inMQLHeadStandard}} |
//|                                       {{Link inMQLHeadStandard}} |
//+------------------------------------------------------------------+
#property copyright "{{Author}}"
#property link      "{{Link}}"
#property version   "{{Version = 1.00}}"

{{if Extend}}#include "{{RootClassPath}}"
 {{/if}}
{{if NameSpaceEnable}}namespace {{NameSpace}} {{{/if}}
{{if IncludeDescription}}{{Description inMQLCommentBlockStandard}}{{/if}}
{{if TemplateEnable}}template<{{TemplateTypeName}}>{{/if}}
class {{ClassName}} {{if Extend}}: {{Modifier}} {{RootClassName}} {{/if}}
{
   public:
      {{ClassName}}();
     ~{{ClassName}}();

   private:
};

//+------------------------------------------------------------------+
//| Constructor(s):                                                  |
//+------------------------------------------------------------------+
{{if TemplateEnable}}template<{{TemplateTypeName}}>{{/if}}
{{ClassName}}::{{ClassName}}() 
{

}

//+------------------------------------------------------------------+
//| Destructor:                                                      |
//+------------------------------------------------------------------+
{{if TemplateEnable}}template<{{TemplateTypeName}}>{{/if}}
{{ClassName}}::~{{ClassName}}() 
{

}
{{if NameSpaceEnable}} 
} // end of namespace{{/if}}
//+------------------------------------------------------------------+