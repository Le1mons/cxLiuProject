/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-排行列表
    G.class.gonghui_ghph = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('gonghui_ghph.json');
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            })
        },
        bindBTN: function () {
            var me = this;

            // 加5
            me.nodes.btn_you.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (me.curType < me.DATA.maxpage) {
                        if (me.curType + 5 <= me.DATA.maxpage) {
                            me.curType += 5;
                        } else {
                            me.curType = me.DATA.maxpage;
                        }
                        me.refreshPanel();
                    }

                }
            });

            // 加2
            me.nodes.btn_you1.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (me.curType < me.DATA.maxpage) {
                        me.curType++;
                        me.refreshPanel();
                    }
                }
            });

            // 减5
            me.nodes.btn_zuo.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (me.curType > 1) {
                        if (me.curType - 5 >= 1) {
                            me.curType -= 5;
                        } else {
                            me.curType = 1;
                        }
                        me.refreshPanel();
                    }
                }
            });

            // 减1
            me.nodes.btn_zuo1.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (me.curType > 1) {
                        me.curType--;
                        me.refreshPanel();
                    }

                }
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
            me.DATA = G.frame.gonghui_list.data() || G.frame.gonghui_paihangbang.data();
            me.curType = 1;
            me.setContents();
        },
        onShow: function () {
            var me = this;

            me.ui.setTimeout(function(){
            	G.guidevent.emit('gonghui_ghphOpenOver');
            },200);

        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            // me.DATA = me.DATA || {};
            //
            // me.DATA = {
            //     maxpage:12,
            //     0:[
            //         {ghname:1,lv:1,member:1,cond:1,id:111,flag:1}
            //     ]
            // };
            // callback && callback();

            G.ajax.send('gonghui_getlist',[me.curType],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = me.DATA || {};
                    me.DATA.applylist = [];
                    if (d.d.maxpage) {
                        me.DATA.maxpage = d.d.maxpage;
                    }
                    if (d.d.applylist) {
                        me.DATA.applylist = d.d.applylist;
                    }
                    me.DATA[me.curType] = d.d.list;

                    callback && callback();
                }
            },true);
        },
        setContents: function () {
            var me = this;

            me.setPageNum(me.curType);

            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();

            var data = [].concat(me.DATA[me.curType]);

            if (data.length < 1) {
                cc.isNode(me.nodes.img_zwnr) && me.nodes.img_zwnr.show();
                return;
            } else {
                cc.isNode(me.nodes.img_zwnr) && me.nodes.img_zwnr.hide();
            }

            var maxNumPerPage = G.class.gonghui.getMaxNumPerPage();
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                d.rank = maxNumPerPage * (me.curType - 1) + (i + 1);
            }

            for (var i = 0; i < data.length; i++) {
                var dd = data[i];
                var list = me.nodes.list_lb.clone();
                me.setItem(list,dd);
                listview.pushBackCustomItem(list);
                list.show();
            }
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);

            X.render({
                sz_ph: function (node) {
                    node.show();
                    node.setString(data.rank);
                },
                //旗帜
                panel_qz: function (node) {
                    node.setBackGroundImage(G.class.gonghui.getFlagImgById(data.flag),1);
                },
                text_dj:data.lv,
                text_mz:data.name,
                // 申请
                btn_sq: function (node) {
                    node.hide();
                    if (me._type == 'phb') {
                        return;
                    }

                    if (!X.inArray(me.DATA.applylist, data.ghid)) {
                        node.show();
                    }

                    node.data = data;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if(P.gud.lv < data.joinlv) {
                                G.tip_NB.show(L('DJBZ'));
                                return;
                            }
                            G.frame.gonghui_main.gonghuiApply(sender.data.ghid,function(){
                                if(!P.gud.ghid || P.gud.ghid == ''){
                                    me.DATA.applylist.push(sender.data.ghid);
                                    me.setItem(sender.getParent(), data);
                                }else{
                                    G.frame.gonghui_main.once('show', function () {
                                        X.uiMana.closeAllFrame(true, function (frame) {
                                            if (frame.ID() == 'gonghui_main') {
                                                return false;
                                            }
                                            G.view.mainMenu.lowerIndex();
                                        });
                                        try{
                                            var _data = G.frame.gonghui_main.DATA.ghdata;
                                            G.event.emit("leguXevent", {
                                                type: 'track',
                                                event: "join_guild",
                                                data: {
                                                    guild_id: P.gud.ghid,
                                                    guild_name: _data.name,
                                                    guild_level: _data.lv,
                                                    guild_people_num: _data.usernum,
                                                    guild_fighting_capacity: 0,
                                                    guild_create_time: _data.ctime
                                                    //这里填写excel里对应事件所需记录的数据
                                                }
                                            });
                                        }catch(e){
                                            cc.error(e);
                                        }
                                    }).checkShow();
                                    G.frame.gonghui_list.remove();
                                }
                            }, sender.data);
                        }
                    });
                },
                //成员数量
                text_rs1: function (node) {
                    node.setString(data.usernum + '/' + data.maxusernum);
                },
                //限制等级
                text_mz2: function (node) {
                    node.hide();
                    if (me._type == 'phb') {
                        node.setString('等级:');
                        node.show();
                        return;
                    }

                    node.show();
                },
                text_rs2: function (node) {
                    node.setString('');
                    if (me._type == 'phb') {
                        node.setString(data.lv);
                        return;
                    }

                    node.setString(data.joinlv);
                },
                //已申请
                img_ysq: function (node) {
                    node.hide();

                    if (me._type == 'phb') {
                        return;
                    }

                    if (X.inArray(me.DATA.applylist, data.ghid)) {
                        node.show();
                    }
                }
            },ui.nodes);

            if(me._type == "phb") {
                ui.finds("text_huizhang").show();
                ui.nodes.text_huizhang.show();
                ui.nodes.text_huizhang.setString(data.hzname);
            }

            ui.show();
        },
        setPageNum: function (page) {
            var me = this;

            me.nodes.text_ys.setString(X.STR(L('D_X_YE'),page));

            me.nodes.btn_you.setTouchEnabled(false);
            me.nodes.btn_you.setEnableState(false);
            me.nodes.btn_you1.setTouchEnabled(false);
            me.nodes.btn_you1.setEnableState(false);
            me.nodes.btn_zuo.setTouchEnabled(false);
            me.nodes.btn_zuo.setEnableState(false);
            me.nodes.btn_zuo1.setTouchEnabled(false);
            me.nodes.btn_zuo1.setEnableState(false);
            if (me.curType !== 1) {
                me.nodes.btn_zuo.setTouchEnabled(true);
                me.nodes.btn_zuo.setEnableState(true);
                me.nodes.btn_zuo1.setTouchEnabled(true);
                me.nodes.btn_zuo1.setEnableState(true);
            }
            if (me.curType < me.DATA.maxpage) {
                me.nodes.btn_you.setTouchEnabled(true);
                me.nodes.btn_you.setEnableState(true);
                me.nodes.btn_you1.setTouchEnabled(true);
                me.nodes.btn_you1.setEnableState(true);
            }
        }
    });

})();