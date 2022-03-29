/**
 * Created by wfq on 2015/12/9.
 */
(function () {
    //创建角色
    var ID = 'create';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id);
        },
        setContents: function(){
            var me = this;
            var view = me._view;

            X.arrayRand(me._flags).triggerTouch( ccui.Widget.TOUCH_ENDED );
            view.nodes.txt_srk.setString(me.createRandomName());
        },
        setInfo:function() {
            var me = this;
            var view = me._view;

            // var wid = G.class.shero({zzid:me.curJsType,ico:0});
            // wid.lv.hide();
            // wid.kuang.hide();
            // wid.setPosition(cc.p(me.crLayIco1.getContentSize().width / 2,me.crLayIco1.getContentSize().height / 2 - 2));
            // view.panel_rw.removeAllChildren();
            // view.panel_rw.addChild(wid);

            // var avatar = {
            //     1:'tx_dxc0.png',
            //     2:'tx_dxc1.png',
            //     3:'tx_rz0.png',
            //     4:'tx_rz1.png',
            //     5:'tx_wl0.png',
            //     6:'tx_wl1.png',
            // };
            // view.nodes.panel_rw.setBackGroundImage('avatar/' + avatar[me.curJsType], 0);

            // me.ui_panel_text.show();
            // me.ui_panel_text.setBackGroundImage('img/cjjs/' + ['wz_renzu.png','wz_wangling.png','wz_dixiacheng.png'][me.curJsType - 1],ccui.Widget.PLIST_TEXTURE);
        },
        //创建随机角色名
        createRandomName: function () {
            var firstName = _FIRSTNAME;
            var midName = _MIDNAME;
            var lastName = _LASTNAME;
            var name = X.arrayRand(firstName) + X.arrayRand(lastName);
            //var name = X.arrayRand(firstName) + X.arrayRand(midName) + X.arrayRand(lastName);

            return name;
        },
        bindUI: function () {
            var me = this;
            var view = me._view;
            me.nodes.ui_top_fh.hide();
            me.nodes.ui_top_wh.hide();
            me.nodes.ui_top_whbg.hide();
            me.ui.finds('ui_top_whbg1').hide();
            me.ui.finds('ui_top_bg').hide();
            // me.ui.nodes.ui_top_fh.click(function(){
            //     me.remove();
            // })

            me._flags = [view.nodes.btn_bb, view.nodes.btn_tk, view.nodes.btn_zsj];
            for (var i = 0; i < me._flags.length; i++){
                var flag = me._flags[i];
                flag.type = i+1;
                flag.click(function (sender, type) {
                    me.curJsType = sender.type;
                    sender.setBright(true);
                    for (var j = 0; j < me._flags.length; j++){
                        if (sender.type != j+1){
                            me._flags[j].setBright(false);
                        }
                    }
                    me.setInfo();
                });
            }

            //筛子随机角色名
            view.nodes.btn_sj.click(function (sender, type) {
                view.nodes.txt_srk.setString(me.createRandomName());
                // X.editbox.create( me.crWidName );
                X.LOG.add("随机取名按钮",{click:1});
            });

            view.nodes.btn_cjrw.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    var curJsName = view.nodes.txt_srk.getString();
                    if (me.curJsType == undefined){ // 当前阵营
                        G.tip_NB.show(L('JS_TIP'));
                        return;
                    }

                    curJsName = X.getValidName(curJsName);
                    if (curJsName != null) {
                        // curJsName 名字
                        // curJsType 阵营
                        // curIcoId 性别
                        var _sendData = [curJsName,me.curJsType,1001];
                        var extra = {};
                        if(G.CHANNEL && G.CHANNEL!="")extra['ext_channel'] = G.CHANNEL;
                        if(G.loginData && G.loginData['myu']!="")extra['ext_mybinduid'] = G.loginData['myu'];
                        if(G.channelId && G.channelId!="")extra['ext_channelId'] = G.channelId;
                        if(G.owner && G.owner!="")extra['ext_owner'] = G.owner;
                        if(G._SERVERNAME && G._SERVERNAME!="")extra['ext_servername'] = G._SERVERNAME;
                        _sendData.push(extra);

                        G.ajax.send('user_register',_sendData,function(data) {
                            if (!data || !me.isShow) return;
                            var data = X.toJSON(data);

                            if (data.s === 1) {
                                var login = me.DATA;
                                G.OPENTIME = data.d.opentime;
                                me.remove();
                                G.class.loginfun.toMain(login.u,login.t,login.k,data.d,login.callback);
                                G.event.emit('dologin',{});
                                G.event.emit('createrole',{});
                                G.push.regInit();

                                G.loginAllData = data.d;
                            }
                        },true);
                    }
                }
            });
        },
        onOpen: function () {
            var me = this;
        },
        onAniShow:function() {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.DATA = me.data();

            new X.bView('chuangjianrenwu.json', function (view) {
                me._view = view;
                me.ui.nodes.panel_nr.addChild(view);
                me.bindUI();
                me.setContents();
            });
        },
        onRemove: function () {
            var me = this;
            // me.releaseRes(['cjjs1.plist','cjjs1.png']);
        }
    });

    G.frame[ID] = new fun('ui_tymb_7.json', ID);
})();