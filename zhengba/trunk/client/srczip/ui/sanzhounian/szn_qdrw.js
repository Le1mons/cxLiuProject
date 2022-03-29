(function () {
    var ID = 'szn_qdrw';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.DATA.szn;
            me.bindBtn();
         
            me.setContents()
            me.setTime()
        },
        setTime: function () {
            var me = this;
            var strNode = new ccui.Text();
            strNode.setName('txtJdt');
            strNode.setFontName(G.defaultFNT);
            strNode.setFontSize(20);
            strNode.setTextColor(cc.color("#5adb3c"));
            var rh = X.setRichText({
                str: L('szn_20'),
                parent: me.nodes.panel_sxsj,
                node: strNode,
                anchor: { x: 0.5, y: 0.5 },
                pos: { x: me.nodes.panel_sxsj.width / 2, y: me.nodes.panel_sxsj.height / 2 }
            });
            X.timeout(strNode, X.getTodayZeroTime() + 24 * 3600, function () {
                G.frame.szn_main.getData(function () {
                    me.setContents();
                })
            },function(){
                rh.x =  me.nodes.panel_sxsj.width - rh.trueWidth()-25;
            });
        },
        setContents: function () {
            var me = this;
            var data = me.getData();
            if (me.table) {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            } else {
                cc.enableScrollBar(me.nodes.scrollview, false);
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null);
                table.setData(data);

                table.reloadDataWithScroll(true);
            }
            me.setJf()
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var got = me.DATA.task.data[data.key] || 0;
            var isgot = me.DATA.task.rec;

            X.render({
                libao_mz: function (node) {
                    node.removeAllChildren();
                    var rh1 = new X.bRichText({
                        size: 20,
                        maxWidth: node.width,
                        lineHeight: 20,
                        family: G.defaultFNT,
                        color: "#804326",
                    });
                    var color = got >= data.pval ? "#5adb3c" : "#804326";
                    rh1.text(data.desc + X.STR(L('szn_2'), color, got, data.pval));
                    node.addChild(rh1);
                    rh1.setPosition(0, node.height / 2 - rh1.trueHeight() / 2);

                },
                ico_nr: function (node) {
                    node.setTouchEnabled(false);
                    var arr = [{"a":"item","t":5089,"n":data.addjifen}].concat(data.prize)
                    X.alignItems(node, arr, "left", {
                        touch: true,
                        scale: .8
                    });
                },
                zs_wz: function (node) {
                    node.setVisible(!X.inArray(isgot, data.key))
                    node.setString(L("LQ"))
                    if(!X.inArray(isgot, data.key) && got >= data.pval){

                        node.setTextColor(cc.color("#2f5719"))
                    }else{
                        node.setTextColor(cc.color("#6c6c6c"))

                    }
                },
                img_ylq: function (node) {
                    node.zIndex = 99;
                    node.setVisible(X.inArray(isgot, data.key))
                },
                btn_lq: function (node) {
                    node.setVisible(!X.inArray(isgot, data.key));
                    node.setBright(!X.inArray(isgot, data.key) && got >= data.pval)
                    node.setTouchEnabled(!X.inArray(isgot, data.key) && got >= data.pval);
                    node.click(function (sender) {
                        if (got >= data.pval) {
                            G.ajax.send('zhounian3_receive', [data.key], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {

                                    me.DATA.task = d.d.myinfo.task;
                                    me.DATA.val = d.d.myinfo.val
                                    G.frame.jiangli.data({
                                        prize: d.d.prize
                                    }).show();
                                    me.setContents();
                                }
                            }, true);
                        } 
                    })

                },
            }, ui.nodes)
        },
        setJf: function () {
            var me = this;
            var rh1 = new X.bRichText({
                size: 20,
                maxWidth: me.nodes.panel_dqjf.width,
                lineHeight: 20,
                family: G.defaultFNT,
                color: "#804326",
            });
            rh1.text(X.STR(L('szn_19'), me.DATA.val));
            me.nodes.panel_dqjf.removeAllChildren();
            me.nodes.panel_dqjf.addChild(rh1);
            rh1.setPosition(0, me.nodes.panel_dqjf.height / 2 - rh1.trueHeight() / 2);

        },
        getData: function () {
            var me = this;
            var conf = X.clone(G.class.szn.getqdTask());
            var arr = [];
            var got = me.DATA.task.rec;
            for (var k in conf) {
                conf[k].key = k;
                arr.push(conf[k])
            }
            arr.sort(function (a, b) {
                return X.inArray(got, a.key) - X.inArray(got, b.key);
            });
            return arr
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove()
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhounianqing_tip_rw.json', ID);
})();