/*
 * XPaging分页插件 v2.0.1
 * 
 * Copyright (c) 2019 XLeng
 *
 * email: 820846748@qq.com
 * 
 * Date: 2019-05-04
 * 
 * 说明：本插件是根据Vue框架编写，使用时必须引用Vue.js和jQuery;
 * 特点：统一通过json文件配置页面大小，且会记录用户设置的页面大小，二次加载时自动选中，外部CSS文件更加便于自定义样式。
 * 
 * 示例：页面插入标签 <x-paging v-bind:codelist="codelist" v-bind:total="total" v-bind:pagelist="pagelist"></x-paging>
 *          codelist：页面大小的数据集合；total：总记录数；pagelist：页码集合。
 *       初始化时执行 XPaging.config({ DataBindFunc: "方法名" }).init(total, VueObj);
 *          DataBindFunc：加载页面数据的方法名称，用于跳转页面和重新设置页面大小时使用；VueObj：Vue对象，用于更新页码集合；
 *          另外还可设置 ContinNO：显示连续页码的个数；CurrentPageIndex：页面索引；ConfigUrl：配置文件路径。
 *          
 * 提供外部调用方法：XPaging.GetCurrentPageIndex() 获取当前页索引；
 *                   XPaging.GetPageSize() 获取页面大小
 * 
 * 注：DataBindFunc对应的方法中需要执行 XPaging.init(total, VueObj);不然控件无法更新。
 */

//注册Vue组件
Vue.component('x-paging', {
    props: ['codelist', 'total', 'pagelist'],
    template: '<div id="xpaging" class="pagenum"><span class="pagemsg">每页 '
        + '<select id="pagesize" name="pagesize" onchange="XPaging.Api.ChangePageSize(this)">'
        + '<option v-bind:selected="code.selected?\'selected\':\'\'" v-for="code in codelist">{{code.pagesize}}</option>'
        + '</select>条 '
        + '共<span class="number">{{total}}</span>条记录</span>'
        + '<a v-bind:class="page.ClassName" href="javascript:;" v-for="page in pagelist" v-on:click="XPaging.Api.PageTurn(page.Value)">{{page.Code}}</a></div>'
});

//方法
(function ($) {
    //插件默认参数
    var options = {
        //连续页码显示个数（必须是奇数）
        ContinNO: 5,
        //索引页
        CurrentPageIndex: 1,
        //总页数
        PageCount: 0,
        //页面显示记录数
        PaseSize: 0,
        //绑定数据方法名
        DataBindFunc: "",
        //JSON配置文件路径
        ConfigUrl: "../lib/XPaging/XPaingConfig.json"
    };

    //用户调用接口
    var XPagingInit = {
        //配置信息
        config: function (opts) {
            //没有参数传入，直接返回默认参数
            if (!opts) return options;
            //有参数传入，通过key将options的值更新为用户的值
            for (var key in opts) {
                options[key] = opts[key];
            }
            return this;
        },
        //初始化插件
        init: function (vueObj) {
            $.ajax({
                type: "GET",
                url: options.ConfigUrl,
                async: false,
                dataType: 'Json',
                success: function (result) {
                    options.ContinNO = result.XCodeNum;
                    Xdata.SetPageSize(result.XPageSize, vueObj);
                    Xdata.GetPageCount(vueObj.total);
                    Xdata.GetPageList(vueObj);
                },
                error: function (data, XMLHttpRequest, textStatus, errorThrown) {
                    alert("分页控件初始化失败，返回信息：" + JSON.stringify(data));
                }
            });
            return this;
        },
        //获取当前页索引
        GetCurrentPageIndex: function () {
            return options.CurrentPageIndex;
        },
        //获取页面大小
        GetPageSize: function () {
            return options.PaseSize;
        }
    };

    //私有方法
    var Xdata = {
        //设置页面记录数
        SetPageSize: function (PageSizeList, vueObj) {
            //获取客户设置的页面记录数
            var userpagesize = localStorage.getItem("XPageSize");
            if (userpagesize == null || userpagesize == undefined) {
                $.each(PageSizeList, function (n, module) {
                    if (module.selected) {
                        userpagesize = module.pagesize;
                    }
                });
            }
            options.PaseSize = userpagesize;
            $.each(PageSizeList, function (n, module) {
                if (module.selected) {
                    module.selected = false;
                }
                if (module.pagesize == userpagesize) {
                    module.selected = true;
                }
            });
            vueObj.codelist = PageSizeList;
        },
        //计算总页数
        GetPageCount: function (total) {
            var pageIndex = parseInt(total / options.PaseSize);
            options.PageCount = (Math.round(total % options.PaseSize) == 0 ? pageIndex : pageIndex + 1);
        },
        //页码生成
        GetPageList: function (vueObj) {
            var pageCodelist = [];

            //确定连续的页码个数为奇数
            if (Math.round(options.ContinNO % 2) == 0)
                options.ContinNO = options.ContinNO + 1;
            var half = parseInt(options.ContinNO / 2);

            //应显示的页码格子的个数
            var lattice = 0;
            //总页数小于规定页码格子个数
            if (options.PageCount <= options.ContinNO) {
                lattice = options.PageCount;
            }
            else {
                //为了显示点和最后一页
                lattice = options.ContinNO + 2;
                //索引到达连续个数末尾时
                if (options.CurrentPageIndex >= options.ContinNO && options.CurrentPageIndex + half < options.PageCount)
                    lattice = options.ContinNO + 4;
            }

            var middlelist = [];//中间连续页码集合
            var middlemin = options.CurrentPageIndex - half > 0 ? options.CurrentPageIndex - half : 1;//最小页码
            var middlemax = options.CurrentPageIndex + half >= options.PageCount ? options.PageCount : options.CurrentPageIndex + half;//最大页码

            //当前索引和最大页差值小于应显示个数的一半时，最小值向前移
            var diff = options.PageCount - options.CurrentPageIndex;
            if (diff < half) {
                middlemin = middlemin - half + diff;
                middlemin = middlemin <= 0 ? 1 : middlemin;
            }

            //最大值小于格子数应显示的最大值
            var showmax = middlemin + options.ContinNO - 1;
            if (middlemax < showmax) {
                middlemax = showmax > options.PageCount ? options.PageCount : showmax;
            }
            //索引页小于连续页码个数时，最大值应是连续页码个数
            middlemax = options.CurrentPageIndex < options.ContinNO ? options.ContinNO : middlemax;

            var clsname = "";//样式名称

            //添加连续页码
            for (var i = middlemin; i <= middlemax; i++) {
                clsname = i == options.CurrentPageIndex ? "currindex" : "waitpage";
                middlelist.push({ "Code": i, "ClassName": clsname, "Value": i });
            }

            //添加页码集合
            if (middlelist.length < lattice) {
                //连续页码最小值不是第一页
                if (middlemin != 1) {
                    clsname = 1 == options.CurrentPageIndex ? "currindex" : "waitpage";
                    pageCodelist.push({ "Code": 1, "ClassName": clsname, "Value": 1 });
                }
                //页数超过规定页码格子个数，并且索引大于等于规定页码格子个数，显示靠近最小页的点
                if ((lattice == options.ContinNO + 2 || lattice == options.ContinNO + 4) && options.CurrentPageIndex >= options.ContinNO) {
                    pageCodelist.push({ "Code": "···", "ClassName": "waitpage", "Value": "-" });
                }
                //插入连续页码
                pageCodelist = pageCodelist.concat(middlelist);
                //页数超过规定页码格子个数，并且索引加上规定页码格子个数一半小于最大页时，显示靠近最大页的点
                if ((lattice == options.ContinNO + 2 || lattice == options.ContinNO + 4) && options.CurrentPageIndex + half < options.PageCount) {
                    pageCodelist.push({ "Code": "···", "ClassName": 'waitpage', "Value": "+" });
                }
                //页码格子没有全部插入
                if (pageCodelist.length < lattice) {
                    clsname = options.PageCount == options.CurrentPageIndex ? "currindex" : "waitpage";
                    pageCodelist.push({ "Code": options.PageCount, "ClassName": clsname, "Value": options.PageCount });
                }
            }
            else if (middlelist.length > lattice) {
                pageCodelist = middlelist.slice(0, lattice);
            }
            else {
                pageCodelist = middlelist;
            }
            //生成页码
            vueObj.pagelist = pageCodelist;
        },
        //执行用户自定义获取数据方法
        GetData: function () {
            if (typeof (eval(options.DataBindFunc)) == "function") {
                eval(options.DataBindFunc + "();");
            }
            else {
                alert("获取数据的函数不存在");
            }
        }
    };

    //外部调用函数
    var api = {
        //修改页面显示记录数
        ChangePageSize: function (e) {
            var ups = e.value;
            options.CurrentPageIndex = 1;
            options.PaseSize = ups;
            localStorage.setItem("XPageSize", ups);
            Xdata.GetData();
        },
        //翻页
        PageTurn: function (pageindex) {
            if (pageindex == "-") {
                if (options.CurrentPageIndex >= options.PageCount - parseInt(options.ContinNO / 2))
                    options.CurrentPageIndex = options.PageCount - options.ContinNO - parseInt(options.ContinNO / 2) > 0 ? (options.PageCount - options.ContinNO - parseInt(options.ContinNO / 2)) : 1;
                else
                    options.CurrentPageIndex = options.CurrentPageIndex - options.ContinNO > 0 ? options.CurrentPageIndex - options.ContinNO : 1;
            }
            else if (pageindex == "+") {
                if (options.CurrentPageIndex < options.ContinNO)
                    options.CurrentPageIndex = options.ContinNO + parseInt(options.ContinNO / 2) + 1 > options.PageCount ? options.PageCount : (options.ContinNO + parseInt(options.ContinNO / 2) + 1);
                else
                    options.CurrentPageIndex = options.CurrentPageIndex + options.ContinNO > options.PageCount ? options.PageCount : options.CurrentPageIndex + options.ContinNO;
            }
            else {
                options.CurrentPageIndex = pageindex;
            }
            Xdata.GetData();
        }
    };

    this.XPaging = XPagingInit;
    this.XPaging.Api = api;
})(jQuery);
