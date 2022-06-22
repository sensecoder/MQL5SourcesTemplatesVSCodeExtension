//+------------------------------------------------------------------+
//|                               {{FileNameFull inMQLHeadStandard}} |
//|                                     {{Author inMQLHeadStandard}} |
//|                                       {{Link inMQLHeadStandard}} |
//+------------------------------------------------------------------+
#property copyright "{{Author}}"
#property link      "{{Link}}"
#property version   "{{Version = 1.00}}"
{{if InSeparateWindow}} 
#property indicator_separate_window
{{else}} 
#property indicator_chart_window
{{/else}}
{{/if}}
{{if Plots}}
#property indicator_buffers 1
#property indicator_plots   1
//--- plot {{Label}}
#property indicator_label1  "{{Label}}"
#property indicator_type1   {{Type}}
#property indicator_color1  {{Color}}
#property indicator_style1  STYLE_SOLID
#property indicator_width1  1
//--- indicator buffers
double         {{Label}}Buffer[];
 {{/if}}
{{if IncludeDescription}}{{Description inMQLCommentBlockStandard}}
 {{/if}}
//+------------------------------------------------------------------+
//| Custom indicator initialization function                         |
//+------------------------------------------------------------------+
int OnInit()
  {
//--- indicator buffers mapping
{{if Plots}}
   SetIndexBuffer(0,{{Label}}Buffer,INDICATOR_DATA);{{/if}}
   
//---
   return(INIT_SUCCEEDED);
  }
{{if OnCalculate1}} 
//+------------------------------------------------------------------+
//| Custom indicator iteration function                              |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
  {
//---
      
//--- return value of prev_calculated for next call
   return(rates_total);
  }
{{/if}}
{{if OnCalculate2}}
//+------------------------------------------------------------------+
//| Custom indicator iteration function                              |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const int begin,
                const double &price[])
  {
//---
   
//--- return value of prev_calculated for next call
   return(rates_total);
  }
{{/if}}
{{if OnTimer}} 
//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
//---
   
  }
{{/if}}
{{if OnChartEvent}} 
//+------------------------------------------------------------------+
//| ChartEvent function                                              |
//+------------------------------------------------------------------+
void OnChartEvent(const int id,
                  const long &lparam,
                  const double &dparam,
                  const string &sparam)
  {
//---
   
  }
{{/if}}
//+------------------------------------------------------------------+
