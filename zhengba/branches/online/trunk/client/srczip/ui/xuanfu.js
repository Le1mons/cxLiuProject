(function () {
    var ID = 'xuanfu';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes=['public.png','public.plist'];
            me.preLoadRes = ['fuwuqi.plist', 'fuwuqi.png'];
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;

            me.layUI = me.ui.nodes.scrollview_fwq;
            cc.enableScrollBar(me.layUI);
            cc.enableScrollBar(me.ui.finds('listview_fuwuqi'));
            cc.enableScrollBar(me.nodes.listview_btn);
            me.listNode = me.ui.nodes.list_fuwuqi;
            me.ui.nodes.mask.click(function (sender, type) {
                me.remove();
            });
        },
        setLatelyList: function () {
            var me = this;

            var lastSvrs = G.frame.login.lastAllSvr;

            me.setTable(me.layUI, lastSvrs, true);
        },
        setTable: function (scrollview, d, zuijin) {
            var me = this;
            scrollview.removeAllChildren();

            if (!cc.isArray(d)) {
                var arr = [];
                var keys = X.keysOfObject(d);
                keys.sort(function (a, b) {
                    return (a * 1) > (b * 1) ? -1 : 1;
                });

                zuijin && keys.reverse();
                for (var i = 0; i < keys.length; i ++) {
                    arr.push(d[keys[i]]);
                }
                d = arr;
            }

            if (!d || d.length < 1) {
                me.ui.finds("zwnr").show();
                return;
            }else {
                me.ui.finds("zwnr").hide();
            }

            var table = new cc.myTableView({
                type: 'fill',
                rownum: 1,
                lineheight: me.listNode.height + 1
            });
            table.data(d);
            table.setDelegate(this);
            table.bindScrollView(scrollview);
            table.tableView.reloadData();
        },
        setList: function (node, d) {
            var me = this;

            node.finds("txt_qf").setString(G.frame.login.fmtServerNameByData(d));
            node.finds("txt_qf").setTextColor(cc.color(G.gc.COLOR.n4));
            var btn = node;
            btn.setTouchEnabled(true);
            btn.sid = d.sid;
            btn._data = d;
            btn.setTouchEnabled(true);
            btn.setSwallowTouches(false);
            btn.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    me.onListClick(sender.sid, sender._data);
                }
            });

            // if(G.frame.login.lastSvr && G.frame.login.lastSvr.sid == d.sid){
            //     // 当前选中的服务器
            //     btn.setBright(false);
            // }

            var imgState = node.nodes.panel_zt;
            var txt_zt = node.nodes.txt_zt;
            imgState.hide();
            if (d.s != null) {
                var c = {
                    // 1:[L('serverState1'),'#4eec00'], // 新服
                    // 2:[L('serverState2'),'#ff3000'], // 爆满
                    // 3:[L('serverState3'),'#cccccc'] // 维护
                    0: 'img/fuwuqi/img_fuwuqi_zt1.png',
                    1: 'img/fuwuqi/img_fuwuqi_zt1.png',
                    2: 'img/fuwuqi/img_fuwuqi_zt1.png',
                    3: 'img/fuwuqi/img_fuwuqi_zt3.png',
                    4: "img/fuwuqi/img_fuwuqi_zt3.png"
                };
                var t = {
                    0: L('serverState2'),
                    1: L('serverState2'),
                    2: L('serverState2'),
                    3: L('serverState3'),
                };
                var t_color = {
                   0: cc.color(G.gc.COLOR[5]),
                   1: cc.color(G.gc.COLOR[5]),
                   2: cc.color(G.gc.COLOR[5]),
                   3: cc.color(G.gc.COLOR.n15), 
                };

                // imgState.setString((c[d.s] ? c[d.s][0] : ""));
                // imgState.color = c[d.s] ? cc.color(c[d.s][1]) : cc.color("#ffffff");

                if(d.s < 4){
                    imgState.setBackGroundImage(c[d.s], 1);
                    txt_zt.setString(t[d.s]);
                    txt_zt.setTextColor(t_color[d.s]);
                }else{
                    imgState.removeBackGroundImage();
                    txt_zt.setString("");
                }
                //node.setBackGroundImage( d.s == 3 ? 'img/fuwuqi/bg_fuwuqi_list2.png' : 'img/fuwuqi/bg_fuwuqi_list1.png',ccui.Widget.PLIST_TEXTURE);
                if (d.starttime && d.starttime != null) {
                    G.time = G.SERVERLIST.now;
                    var time_gap = G.time - d.starttime;
                    var day_gap = Math.floor(time_gap / 86400);
                    if (day_gap < 3) {
                        txt_zt.setString(L('serverState1'));
                        txt_zt.setTextColor(cc.color(G.gc.COLOR[1]));
                    } else if (day_gap < 7) {
                        txt_zt.setString(L('serverState2'));
                        txt_zt.setTextColor(cc.color(G.gc.COLOR[5]));
                    }
                }
                if (d.s == 3) {
                    btn.hide();
                    txt_zt.setString(L('serverState3'));
                    txt_zt.setTextColor(cc.color(G.gc.COLOR.n15));
                }
            }

            if (!d.noShowState) {
                imgState.show();
            }
            return node;
        },
        onListClick: function (sid, data) {
            var me = this;
            if (!G.DATA.PROJECT_DEBUG) {
                G.frame.login.changeServer(sid);
            } else {
                G.frame.login.changeServerByData(data);
            }
            me.remove();
        },
        onShow: function () {
            var me = this;
            var btnArr = [];
            var index = 1;
            var arr = [];
            var BTN = [];
            var num = 0;

            var data = G.SERVERLIST.order;
            data.sort(function (a, b) {
                return a < b ? -1 : 1;
            });

            var btn = me.nodes.list_btn_wodequfu;
            btn.isOld = true;
            btnArr.push(btn);
            
            for (var i = 0; i < data.length; i ++) {
                if(index % 11 == 0) {
                    var button = me.nodes.list_btn.clone();
                    button.sever = arr;
                    button.finds("text_tjfwq$").setString((num * 10 + 1) + "-" + ((num + 1) * 10) + L("QU"));
                    arr = [];
                    index = 1;
                    BTN.push(button);
                    num ++;
                }
                arr.push(data[i]);
                index ++;
            }
            if(arr.length > 0) {
                var button = me.nodes.list_btn.clone();
                button.sever = arr;
                button.finds("text_tjfwq$").setString((num * 10 + 1) + "-" + ((num + 1) * 10) + L("QU"));
                BTN.push(button);
            }
            for (var i = BTN.length - 1; i >= 0; i --) {
                btnArr.push(BTN[i]);
            }
            for (var i = 0; i < btnArr.length; i ++) {
                btnArr[i].show();
                if(i == 0) continue;
                me.nodes.listview_btn.pushBackCustomItem(btnArr[i]);
            }
            X.radio(btnArr, function (sender) {
                me.selectedSever(sender);
            }, {
                callback1: function (sender) {
                    sender.finds("img_arrow").show();
                    sender.finds("text_tjfwq$").setTextColor(cc.color("#cd732a"));
                },
                callback2: function (sender) {
                    sender.finds("img_arrow").hide();
                    sender.finds("text_tjfwq$").setTextColor(cc.color("#a7765d"))
                }
            });
            btnArr[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        selectedSever: function(sender) {
            var me = this;
            if(sender.isOld) {
                me.setLatelyList();
            }else {
                me.setTable(me.layUI, sender.sever);
            }
        },
        onRemove: function () {
            var me = this;
        },
        // setTableViewData: function (scrollview, d) {
        //     var me = this;

        //     scrollview.data(d);
        // },
        /**
         * 数据模板
         * @returns {*}
         */
        cellDataTemplate: function () {
            var me = this;

            return me.listNode.clone();
        },
        /**
         * 数据初始化
         * @param ui
         * @param data
         * @param pos [row,col]
         */
        cellDataInit: function (ui, data, pos) {
            var me = this;
            ui.setName('scrollview' + (pos[0] * 1 + pos[1]));

            if (!data) {
                ui.hide();
                return;
            }

            X.autoInitUI(ui);
            var d = X.instanceOf(data, 'Object') ? data : G.SERVERLIST.data[data];
            if(X.instanceOf(data, 'Object') && G.SERVERLIST.data[d.sid]){
                d.s = G.SERVERLIST.data[d.sid].s;
            }
            d && me.setList(ui, d);
            ui.show();
        },
    });

    G.frame[ID] = new fun('fuwuqi.json', ID);
})();