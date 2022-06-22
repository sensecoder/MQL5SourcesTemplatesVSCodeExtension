//+------------------------------------------------------------------+
//|                               {{FileNameFull inMQLHeadStandard}} |
//|                                     {{Author inMQLHeadStandard}} |
//|                                       {{Link inMQLHeadStandard}} |
//+------------------------------------------------------------------+
#property copyright "{{Author}}"
#property link      "{{Link}}"
#property version   "{{Version = 1.00}}"

{{if Extend}}#include "{{RootInterfacePath}}"
 {{/if}}
{{if NameSpaceEnable}}namespace {{NameSpace}} {{{/if}}
{{if IncludeDescription}}{{Description inMQLCommentBlockStandard}}{{/if}}
interface {{InterfaceName}} {{if Extend}}: {{Modifier}} {{RootInterfaceName}} {{/if}}
{
	
};
{{if NameSpaceEnable}}
} // end of namespace{{/if}}
//+------------------------------------------------------------------+