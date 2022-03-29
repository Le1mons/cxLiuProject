/**
 * Created by zhangming on 2017-12-21
 */
(function () {

    G.event.on('itemchange_over', function (o) {
        if(G.DATA.attr2) {
            for (var i in o) {
                if(G.DATA.attr2.t == o[i].itemid) {
                    G.view.toper.updateAttr();
                    break;
                }
            }
        }
    });

    G.class.toper = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super('toper.json', null); // , {action:true}
            me._bind2Frameid=null; //当前绑定到哪个frame
            G.view.toper = me;
            G.event.on('uiChange',me.uiChange,me);
            G.view.mainView.event.on('visiableChangeByFullScreen',me.checkAutoVisiable,me);
        },
        checkAutoVisiable : function(){
            //跟随mainView的显隐状态
            cc.log('toper checkAutoVisiable',this._bind2Frameid,G.view.mainView.isVisible());
            if(this._bind2Frameid=='main' && cc.isNode(G.view.mainView) && G.view.mainView.isVisible()==false){
                this.hide();
            }else{
                this.show();
            }
        },
        uiChange : function(data){
            if(data.frameid=='loading')return;

            //按zindex排序后，找到第一个有needShowToper属性的bui
            var openedFrames = X.uiMana.getOpenFrameOrderByZindex();
            var _bind2;
            for(var i=0;i<openedFrames.length;i++){
                var _fid = openedFrames[i].frameid;
                if(G.frame[_fid] && G.frame[_fid].needShowToper ){
                    _bind2 = openedFrames[i];
                    break;
                }
            }

            //如果找到，则放置于该bui上一层，否则重置回默认值
            var _bind2id;
            if(_bind2){
                this.zIndex = _bind2.zIndex + 1;
                _bind2id = _bind2.frameid;
            }else{
                this.zIndex = G.gc.zIndex.toper;
                _bind2id = "main";
            }

            if(this._bind2Frameid != _bind2id){
                //如果有变化，则触发事件
                this.showWith && this.showWith( _bind2id );
            }
            this._bind2Frameid = _bind2id;
        },
        showWith: function (frameid) {
            var me = this;
            if(X.keysOfObject(me.nodes).length == 0) return;
            cc.log('toper showWith',frameid);

            // if (frameid == 'world') {
            //     me.nodes.panel_1.hide();
            //     me.nodes.panel_2.show();
            // } else {
            //     me.nodes.panel_1.show();
            //     me.nodes.panel_2.hide();
            // }
            cc.isNode(this) && this.setVisible(true);
        },
        updateData: function () {
            var me = this;

            me.render({
                // txt_jb: X.fmtValue(P.gud.jinbi),
                // txt_zs: X.fmtValue(P.gud.rmbmoney),
                // panel_tx: function (node) {
                //     // 头像数据目前不可换
                //     // node.setBackGroundImage('img/img_tx_r.png', 0);
                // },
                txt_lv:P.gud.lv,
                txt_name: P.gud.name.indexOf('temp')!=-1?L('SMR'):P.gud.name,
                // sz_vip:'V' + '.' + P.gud.vip,
                sz_vip:P.gud.vip,
                img_vip: function (node) {
                    node.loadTexture(X.getVipIcon(P.gud.vip), 0);
                }
            });

            me.updateHead();
            me.updateAttr();
        },
        //更新货币信息
        updateAttr: function () {
            var me = this;

            var attr1 = G.DATA.attr1 =  me.showAttr1 || {a:'attr',t:'jinbi'};
            var attr2 = G.DATA.attr2 || {a:'attr',t:'rmbmoney'};

            var ownNum1 = G.class.getOwnNum(attr1.t,attr1.a);
            var ownNum2 = G.class.getOwnNum(attr2.t,attr2.a);

            me.render({
                token_jb: function (node) {
                    node.loadTexture(G.class.getItemIco(attr1.t), 1);
                },
                txt_jb: X.fmtValue_new(ownNum1),
                btn_jia1: function (node) {
                    node.hide();
                    if (attr1.t == 'jinbi') {
                        node.show();
                    }
                },
                token_zs: function (node) {
                    node.loadTexture(G.class.getItemIco(attr2.t), 1);
                },
                txt_zs: X.fmtValue(ownNum2),
                btn_jia2: function (node) {
                    node.hide();
                    if (attr2.t == 'rmbmoney') {
                        node.show();
                    }
                }
            });
        },
        changeAttr: function (obj) {
            var me = this;

            obj = obj || {};

            me.showAttr1 = obj.attr1;
            G.DATA.attr2 = obj.attr2;

            me.updateAttr();
        },
        updateZhanli: function(){
            var me = this;
            var lay = me.nodes.fnt_zl;
            lay.removeAllChildren();

            var img = new ccui.ImageView();
            img.loadTexture('img/public/ico/ico_zl.png',1);
            // img.setScale(0.65);
            img.setAnchorPoint(0, 0.5);
            lay.addChild(img);

            // var label = new cc.LabelBMFont();
            // label.setString(X.fmtValue(P.gud.zhanli));
            // label.setFntFile("img/fnt/sz_zdl.fnt");
            // label.setScale(0.65);
            // label.setAnchorPoint(0, 0.5);
            // lay.addChild(label);

            var label = new ccui.Text();
            label.setFontName(G.defaultFNT);
            label.setString(X.fmtValue(P.gud.zhanli));
            label.setAnchorPoint(0, 0.5);
            label.setFontSize(20);
            label.setTextColor(cc.color('#46241c'));
            // txt_xxs.enableShadow(cc.color(0, 0, 0, 255), cc.size(1, -1));
            // X.enableOutline(txt_xxs,cc.color('#240700'),1);
            // txt_xxs.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            lay.addChild(label);

            var img_width = img.width; // *0.65
            var labWidth = label.width; //31*0.65*(P.gud.zhanli + '').length; // 31 单个fnt字的宽度
            // label.setContentSize(cc.size(labWidth, 45));
            var x = (lay.width - (img_width + labWidth))*0.5; // img.width*0.65

            img.setPosition(cc.p(x, lay.height*0.5));
            label.setPosition(cc.p(x+img_width, lay.height*0.5)); // img.width*0.65
            // label.setPosition(cc.p(x+img.width*0.65, cc.sys.isNative ? 10 : lay.height*0.5-2));
        },
        updateHead: function () {
            var me = this;

            me.nodes.panel_tx.removeAllChildren();
            var widget = G.class.shead(P.gud);
            widget.lv.hide();
            X.addCenterChild(me.nodes.panel_tx,widget);
        },
        bindBTN: function () {
            var me = this;

            var btnJbAdd = me.nodes.btn_jia1;
            var btnZsAdd = me.nodes.btn_jia2;
            var btnJbAdd1 = me.finds("panel_db1");
            var btnZsAdd1 = me.finds("panel_db2");
            btnJbAdd1.setTouchEnabled(true);
            btnZsAdd1.setTouchEnabled(true);
            //点金
            btnJbAdd.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // G.tip_NB.show(L('COMING_SOON'));
                    G.frame.dianjin.show();

                }
            });
            btnJbAdd1.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // G.tip_NB.show(L('COMING_SOON'));
                    if(!G.DATA.attr1 || G.DATA.attr1.t != "jinbi") return;
                    G.frame.dianjin.show();

                }
            });            

            btnZsAdd.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // G.frame.shop.data({type: "1", name: "yxsd"}).show();
                    G.frame.chongzhi.show();
                }
            });
            btnZsAdd1.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // G.frame.shop.data({type: "1", name: "yxsd"}).show();
                    if(G.DATA.attr2 && G.DATA.attr2.t != "rmbmoney") return;
                    G.frame.chongzhi.show();
                }
            });


            me.nodes.panel_tx.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.setting.show();
                }
            });
            
            me.ui.finds("panel_vip").touch(function (sender, type) {
                G.frame.chongzhi.data({is: true}).show();
            })
        },
        onOpen: function () {
            var me = this;
            X.autoInitUI(this);
            me.bindBTN();

            me.ui.setAnchorPoint(0, 0);
            me.ui.y = C.WS.height - me.ui.height;
            me.zIndex = G.gc.zIndex.toper;

            G.event.on('attrchange', function () {
                G.view.toper.updateData();
            });
        },
        onShow: function () {
            var me = this;

            // me.action.play('in', false);
            me.updateData();
            
            // G.frame.dianjin.once("show", function () {
            //     me.isShowRed(false);
            // });
            // G.frame.dianjin.once("hide", function () {
            //     me.isShowRed(true);
            // })
            me.ui.finds("panel_up").setTouchEnabled(false);

            if(G.tiShenIng){
                me.finds('bg_toper_ui').hide();
            }
        },
        isShowRed: function(isShow){
            var me = this;

            // if(cc.isNode(me.nodes.btn_jia1.getChildByName("redPoint"))){
            //     me.nodes.btn_jia1.getChildByName("redPoint").setVisible(isShow);
            // }
            // if(cc.isNode(me.nodes.btn_jia2.getChildByName("redPoint"))){
            //     me.nodes.btn_jia2.getChildByName("redPoint").setVisible(isShow);
            // }
        },
        onRemove: function () {
            var me = this;
            delete G.view.toper;
            G.event.removeListener('uiChange',me.uiChange);
        },
    });
})();

// f5MapName : function(){
//     //刷新地图名字
//     var me = this;

//     me.ui.finds('wz_mrsp').setString( G.gc.map[P.gud.mapid].name );
//     var panel = me.m_lay_top.find('panel_2');
//     var tj = G.class.formula.getTanXianTongJi(P.gud.mapid);
//     panel.finds('jinbi1').setString(X.STR(L('PER_HOUR'), X.fmtValue(Math.floor(tj.jinbi))));
//     panel.finds('exp1').setString(X.STR(L('PER_HOUR'), X.fmtValue(Math.floor(tj.exp))));
//     panel.finds('sjjl1').setString(X.STR(L('WORLD_PER'), Math.floor(tj.event*10000)/100));
// },
// updateData:function() {
//     var me = this;

//     me.m_head_loading.setPercent(P.gud.nexp / P.gud.maxexp * 100);
//     //me.m_head_loading.setString('1/1');
//     me.m_head_lv.setString(P.gud.lv);

//     me.m_zhandouli.setString(P.gud.zhanli);
//     me.m_img_mc_value.setString(X.fmtValue(P.gud.mucai));
//     me.m_img_st_value.setString(X.fmtValue(P.gud.kuangshi));
//     me.m_img_jb_value.setString(X.fmtValue(P.gud.jinbi));
//     me.m_img_zs_value.setString(X.fmtValue(P.gud.rmbmoney));
//     //me.m_img_sj_value.setString(X.fmtValue(P.gud.shuijing));
//     me.m_vip.setString(X.STR('v{1}', P.gud.vip));

//     me.updateHead();
// },
// updateHead: function () {
//     var me = this;
//     var widget = G.class.shead(P.gud);
//     widget.setPosition(cc.p(me.m_head_headImg.getContentSize().width / 2,me.m_head_headImg.getContentSize().height / 2));
//     me.m_head_headImg.removeAllChildren();
//     me.m_head_headImg.addChild(widget);
// },
// bindBTN:function() {
//     var me = this;

// }