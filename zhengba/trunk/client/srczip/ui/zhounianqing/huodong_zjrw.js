/**
 * Created by LYF on 2018/10/10.
 */
(function () {
    //终极任务
    G.class.huodong_zjrw = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_scrollview.json");
        },
          setContents: function () {
            var me = this;

            me.setBanner();
            me.setTable();
        },
        setBanner: function () {
            var me = this;

            X.render({
                btn_jlyl:function(node){
                    node.show();
                    node.loadTextureNormal('img/public/btn/btn_bangzhu1.png',1);
                    node.click(function () {
                        G.frame.help.data({
                            intr:L('TS77')
                        }).show();
                    })
                },
                panel_banner: function (node) {
                    node.setBackGroundImage('img/2zhounian/wz_2.png', 1);
                },
                panel_txt: function (node) {
                    node.show();
                },
                txt_count: L("CHONGZHI"),
                txt_time: function (node) {
                    if(me.DATA.rtime - G.time > 24 * 3600 * 2) {
                        me.nodes.txt_count.hide();
                        node.setString(X.moment(me.DATA.rtime - G.time));
                    }else {
                        X.timeout(node,me.DATA.rtime, function () {
                             G.tip_NB.show(L("HUODONG_HD_OVER"));
                             me.parentNode.remove();
                        })
                    }
                },
                panel_title: function(node) {
                    // var rh = new X.bRichText({
                    //     size:22,
                    //     maxWidth:node.width + 60,
                    //     lineHeight:24,
                    //     family:G.defaultFNT,
                    //     color:G.gc.COLOR.n5,
                    //     eachText: function (node) {
                    //         X.enableOutline(node,'#000000');
                    //     },
                    // });
                    // rh.text(me._data.intr);
                    // rh.setAnchorPoint(0,1);
                    // rh.setPosition(0, node.height);
                    // node.addChild(rh);
                },
            },me.nodes);
          
        },
        setTable: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
          
            var taskData = JSON.parse(JSON.stringify(me.parentNode.conf.task));
            var taskArr = [];
            for(var key in taskData){
                taskData[key].idx  =  key;
                if(me.DATA.task[key] && me.DATA.task[key] >= taskData[key].pval && (!me.DATA.receive[key] || me.DATA.receive[key] < taskData[key].num )){//可领取
                    taskData[key].order = 2;
                }else if(me.DATA.receive[key] && me.DATA.receive[key] >= taskData[key].num ){//已领取
                    taskData[key].order = 0;
                }else {
                    taskData[key].order = 1;
                }
                taskArr.push(taskData[key])
            };
            taskArr.sort(function (a,b) {
                 if(a.order != b.order){
                     return a.order > b.order ? -1:1;
                 }else {
                     return a.idx < b.idx ? -1:1;
                 }
            });
            
            if(!me.table){
                scrollview.removeAllChildren();
                cc.enableScrollBar(scrollview);
                var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]+pos[1]);
                }, null, null, 1, 3);
                table.setData(taskArr);
                table.reloadDataWithScroll(true);
            }else{
                me.table.setData(taskArr);
                me.table.reloadDataWithScroll( false);
            }
            // table._table.tableView.setBounceable(false);
        },
        setItem: function (ui, data, idx) {
            var me = this;
            X.autoInitUI(ui);
            G.removeNewIco(ui.nodes.btn);
            ui.nodes.btn.show();


            if (me.DATA.receive[data.idx] >= data.num) {
                ui.nodes.btn_txt.setString(L('YLQ'));
                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                ui.nodes.btn.setEnableState(false);
            }else if(me.DATA.task[data.idx] >= data.pval){
                ui.nodes.btn_txt.setString(L('LQ'));
                ui.nodes.btn.setEnableState(true);
                ui.nodes.btn_txt.setTextColor(cc.color("#7b531a"));
                G.setNewIcoImg(ui.nodes.btn, .9);
            }else{
                ui.nodes.btn_txt.setString(L('LQ'));
                ui.nodes.btn.setEnableState(false);
                ui.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
            }
            X.render({
                btn: function (node) {
                    node.item = ui;
                    node.data = data;
                    node.click(function (sender, type) {
                        me.ajax('anniversary_taskreceive', [String(data.idx)], function (str, dd) {
                            if (dd.s == 1){
                                G.frame.jiangli.data({
                                    prize: dd.d.prize
                                }).show();
                                me.parentNode.refreshDataInfo(dd.d.data);
                                me.setTable();
                            }
                        },true);
                    })
                },
                panle_ico: function (node) {
                    node.removeAllChildren();
                    node.setTouchEnabled(false);
                    X.alignItems(node, data.prize, "left", {
                        touch: true,
                        callback: function () {
                        }
                    })
                },
                txt_title: function (node) {
                    var haveNum = me.DATA.task[data.idx] ? me.DATA.task[data.idx] : 0;
                    haveNum = me.DATA.receive[data.idx] ?(me.DATA.receive[data.idx] >= data.num ? data.pval : haveNum) : haveNum;
                    var color = haveNum >= data.pval? G.gc.COLOR[1] : G.gc.COLOR[5];
                    setTextWithColor(node, data.intr+"("+haveNum+"/"+data.pval+")", color);
                },
                txt_title2: function (node) {
                    if(data.num <=1){
                        node.hide(); 
                    }else{
                        node.show();
                        var str = X.STR(L("JINRIKELING"),data.num - (me.DATA.receive[data.idx] || 0),data.num);
                        node.setString(str);
                    }
                    
                    // var haveNum = me.DATA.task[data.idx] ? me.DATA.task[data.idx] : 0;
                    // var color = haveNum >=data.pval? G.gc.COLOR[1] : G.gc.COLOR[5];
                    // setTextWithColor(node, data.intr+"("+haveNum+"/"+data.pval+")", color);
                },
            }, ui.nodes);
            ui.show();
        },
        refreshPanel: function () {
            var me = this;

            
            me.DATA = me.parentNode.DATA;
            me.setContents();
            
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.viewCache.getView("event_list11.json", function (node) {
                me.list = node.nodes.panel_list;
                me.refreshPanel();
            });
        },
        onNodeShow: function () {
            var me = this;
            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        onRemove: function () {
            var me = this;
           
        },
    })
})();