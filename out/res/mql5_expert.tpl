//+------------------------------------------------------------------+
//|                               {{FileNameFull inMQLHeadStandard}} |
//|                                     {{Author inMQLHeadStandard}} |
//|                                       {{Link inMQLHeadStandard}} |
//+------------------------------------------------------------------+
#property copyright "{{Author}}"
#property link      "{{Link}}"
#property version   "{{Version = 1.00}}"

{{if IncludeDescription}}{{Description inMQLCommentBlockStandard}}
 {{/if}}
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit() 
{
{{if OnTimer}}
//--- create timer
   EventSetTimer({{TimerSetting = 60}});
{{/if}}   
//---
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason) 
{
{{if OnTimer}}
//--- destroy timer
   EventKillTimer();
{{/if}}   
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick() 
{
   
}

{{if OnTimer}}
//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer() 
{

}
 {{/if}}
{{if OnTrade}}
//+------------------------------------------------------------------+
//| Trade function                                                   |
//+------------------------------------------------------------------+
void OnTrade() 
{

}
 {{/if}}
{{if OnTradeTransaction}}
//+------------------------------------------------------------------+
//| TradeTransaction function                                        |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result) 
{

}
 {{/if}}
{{if OnTester}}
//+------------------------------------------------------------------+
//| Tester function                                                  |
//+------------------------------------------------------------------+
double OnTester() 
{
   double ret=0.0;

   return(ret);
}
 {{/if}}
{{if OnTesterInit}}
//+------------------------------------------------------------------+
//| TesterInit function                                              |
//+------------------------------------------------------------------+
void OnTesterInit() 
{
   
}
 {{/if}}
{{if OnTesterPass}}
//+------------------------------------------------------------------+
//| TesterPass function                                              |
//+------------------------------------------------------------------+
void OnTesterPass() 
{
   
}
 {{/if}}
{{if OnTesterDeinit}}
//+------------------------------------------------------------------+
//| TesterDeinit function                                            |
//+------------------------------------------------------------------+
void OnTesterDeinit() 
{
   
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
   
}
 {{/if}}
{{if OnBookEvent}}
//+------------------------------------------------------------------+
//| BookEvent function                                               |
//+------------------------------------------------------------------+
void OnBookEvent(const string &symbol) 
{
   
}
 {{/if}}
//+------------------------------------------------------------------+