# XPaging
# 基于Vue和jQuery的分页组件

源码在目录wwwroot\lib\XPaging中

测试页为Pages\Index.cshtml默认启动页

版本号v2.0.1

版权所有（c）2019 XLeng

电子邮件：820846748@qq.com

日期：2019 - 05 - 04

说明：本插件是根据Vue框架编写，使用时必须引用Vue.js和jQuery;

特点：统一通过json文件配置页面大小，且会记录用户设置的页面大小，二次加载时自动选中，外部CSS文件更加便于自定义样式。
 
示例：

      页面插入标签 
      
      <x-paging v-bind:codelist="codelist" v-bind:total="total" v-bind:pagelist="pagelist"></x-paging>

      codelist：页面大小的数据集合； 
      
      total：总记录数；
      
      pagelist：页码集合。

      初始化时执行 XPaging.config({ DataBindFunc："方法名" }).init(VueObj);

      DataBindFunc：加载页面数据的方法名称，用于跳转页面和重新设置页面大小时使用;
      
      VueObj：Vue对象，用于更新页码集合;
      
      另外还可设置ContinNO：显示连续页码的个数; CurrentPageIndex：页面索引; ConfigUrl：配置文件路径。
         
      提供外部调用方法：
      
          XPaging.GetCurrentPageIndex()获取当前页索引; 

          XPaging.GetPageSize()获取页面大小

注：DataBindFunc对应的方法中需要执行XPaging.init(VueObj); 不然控件无法更新。
