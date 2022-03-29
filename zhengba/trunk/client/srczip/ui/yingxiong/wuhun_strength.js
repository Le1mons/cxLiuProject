/**
 * Created by  on 2019//.
 */
(function () {
    //武魂强化
    var ID = 'wuhun_strength';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.whtid = me.data().whtid;
            me.maxlv = G.gc.wuhuncom.base.maxlevel;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_ts.click(function () {
                if(me.needmoney){//金币不够
                    G.frame.alert.data({
                        cancelCall: null,
                        okCall: function () {
                            G.frame.dianjin.once('willClose',function(){
                                me.setCost();
                            }).show();
                        },
                        richText: L("WUHUN9"),
                        sizeType: 3
                    }).show();
                }else if(me.needhun){//武魂本体和武魂精华不够
                    G.frame.alert.data({
                        cancelCall: null,
                        okCall: function () {
                            //跳转到武魂商店
                            G.frame.shop.data({type:"12"}).show();
                        },
                        richText: X.STR(L("WUHUN5"), G.gc.hero[me.conf.hero].name),
                        sizeType: 3
                    }).show();
                }else {
                    if(G.frame.yingxiong_xxxx.isShow){
                        G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[G.frame.yingxiong_xxxx.curXbId]));
                    }
                    me.ajax("wuhun_upgrade",[me.whtid],function(str,data){
                        if(data.s == 1){
                            G.tip_NB.show(L("WUHUN7"));
                            if(G.DATA.wuhun[me.whtid].lv >= me.maxlv){//升到最后一级关闭界面
                                me.remove();
                            }else {
                                me.setContents();
                            }
                            if(G.frame.yingxiong_xxxx.isShow){
                                G.frame.yingxiong_xxxx.showWuhun();
                                G.frame.yingxiong_xxxx.updateInfo();
                            }
                        }
                    })
                }
            },500);
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            var wuhundata = G.DATA.wuhun[me.whtid];
            var wuhunitem = G.class.wuhun(wuhundata,true);
            var conf = me.conf = G.gc.wuhun[wuhundata.id][wuhundata.lv];
            var nextconf = G.gc.wuhun[wuhundata.id][wuhundata.lv+1];
            wuhunitem.setAnchorPoint(0,0);
            me.nodes.panel_dw.removeAllChildren();
            me.nodes.panel_dw.addChild(wuhunitem);
            //名字
            me.nodes.txt_name.setString(conf.name);
            me.nodes.txt_name.setTextColor(cc.color(G.gc.COLOR[conf.color]));
            //当前等级
            me.nodes.txt_dj.setString(wuhundata.lv);
            //下一等级
            me.nodes.txt_dj2.setString(wuhundata.lv+1);
            //属性
            var buffarr = X.keysOfObject(conf.buff);
            me.nodes.panel_gj.finds('txt2').setString(L(buffarr[0]));
            me.nodes.panel_gj2.finds('txt2').setString(L(buffarr[0]));
            me.nodes.panel_sm.finds('txt3').setString(L(buffarr[1]));
            me.nodes.panel_sm2.finds('txt3').setString(L(buffarr[1]));
            me.nodes.txt_gj.setString(conf.buff[buffarr[0]]);
            me.nodes.txt_gj2.setString(nextconf.buff[buffarr[0]]);
            me.nodes.txt_sm.setString(conf.buff[buffarr[1]]);
            me.nodes.txt_sm2.setString(nextconf.buff[buffarr[1]]);

            var jihuoconf,jihuolv;
            for(var k in G.gc.wuhun[wuhundata.id]){
                var con = G.gc.wuhun[wuhundata.id][k];
                if(k > wuhundata.lv && k <= G.gc.wuhuncom.base.maxlevel && (con.skillintro || X.keysOfObject(con.exbuffshow).length > 0)){
                    jihuoconf = con;
                    jihuolv = k;
                    break;
                }
            }
            if(jihuoconf){//是否有可激活属性
                var str1 = X.STR(L("WUHUN2"),jihuolv);
                var str2 = "";
                var str3 = "";
                if(jihuoconf.skillintro){//激活专属属性
                    str2 = L("WUHUN3");
                    str3 = jihuoconf.skillintro;
                }else {//激活特殊属性
                    str2 = L("WUHUN4");
                    for(var i in jihuoconf.exbuffshow){
                        if(i.indexOf("pro") != -1){
                            str3 += L(i) + "+" + jihuoconf.exbuffshow[i] / 10 + "%";
                        }else {
                            str3 += L(i) + "+" + jihuoconf.exbuffshow[i];
                        }
                    }
                }
                me.ui.finds('Text_12').setString(str1 + str2 + str3);
            }else {
                me.ui.finds('Text_12').setString(L("WUHUN13"));
            }
            me.setCost();
        },
        //消耗
        setCost:function(){
            var me = this;
            me.ui.finds('panel_wp').removeAllChildren();
            var wuhundata = G.DATA.wuhun[me.whtid];
            var whcom = G.gc.wuhuncom.base.need[wuhundata.lv];
            var needarr = [];
            //消耗武魂本体
            var list1 = me.nodes.ico.clone();
            list1.show();
            X.autoInitUI(list1);
            var self = G.class.wuhun(wuhundata,true,{nolv:true});
            self.setAnchorPoint(0,0);
            list1.nodes.wp.removeAllChildren();
            list1.nodes.wp.addChild(self);
            var hunnum = 0;//拥有的同名武魂数量（除去自己和已被别人穿戴的)
            var needhun = whcom.num;//需要的同名武魂数量
            for(var k in G.DATA.wuhun){
                if(G.DATA.wuhun[k].id == wuhundata.id && k != wuhundata.tid && !G.DATA.wuhun[k].wearer && G.DATA.wuhun[k].lv <= 1) {
                    hunnum++;
                }
            }
            var st1 = X.STR('<font color={1}>{2}</font>/{3}', hunnum >= needhun? '#43dc00' : '#f63f3f', X.fmtValue(hunnum), X.fmtValue(needhun));
            var rh1 = X.setRichText({
                parent:list1.nodes.wz_sl,
                str:st1,
                maxWidth:200,
                color:"#ffffff",
                outline:"#000000"
            });
            list1.nodes.mingzi.setString(G.gc.wuhun[wuhundata.id][wuhundata.lv].name);
            list1.nodes.mingzi.setTextColor(cc.color(G.gc.COLOR[G.gc.wuhun[wuhundata.id][wuhundata.lv].color]));
            needarr.push(list1);
            //消耗其他道具
            for(var i = 0; i < whcom.need.length; i++){
                var ownnum = G.class.getOwnNum(whcom.need[i].t,whcom.need[i].a);//拥有的道具
                me.nodes.wz1.setString(X.fmtValue(whcom.need[i].n));
                me.nodes.wz1.setTextColor(cc.color(ownnum >= whcom.need[i].n? '#05A023' : '#C92E37'));
            }

            var hasjhnum = G.class.getOwnNum(G.gc.wuhuncom.base.item,"item");//拥有的武魂精华
            var needjhnum;//需要武魂精华的数量
            if(hunnum < needhun){
                needjhnum = needhun - hunnum;
                me.ui.finds('txt_13').show();//只要武魂不够就显示可用精华代替的那句话
                if(hasjhnum >= needjhnum){//有足够的精华
                    var jh = {a:"item",t:G.gc.wuhuncom.base.item,n:1};
                    var item = G.class.sitem(jh);
                    item.setAnchorPoint(0,0);
                    var list3 = me.nodes.ico.clone();
                    list3.show();
                    X.autoInitUI(list3);
                    list3.nodes.wp.removeAllChildren();
                    list3.nodes.wp.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                    item.num.hide();
                    var st3 = X.STR('<font color={1}>{2}</font>/{3}', hasjhnum >= needjhnum? '#43dc00' : '#f63f3f', X.fmtValue(hasjhnum), X.fmtValue(needjhnum));
                    var rh3 = X.setRichText({
                        parent:list3.nodes.wz_sl,
                        str:st3,
                        color:"#ffffff",
                        maxWidth:200,
                        outline:"#000000"
                    });
                    list3.nodes.mingzi.setString(G.class.getItem(G.gc.wuhuncom.base.item,"item").name);
                    list3.nodes.mingzi.setTextColor(cc.color(G.gc.COLOR[G.class.getItem(G.gc.wuhuncom.base.item,"item").color]));
                    needarr.push(list3);
                }
            }else {
                me.ui.finds('txt_13').hide();
            }
            // X.center(needarr,me.ui.finds('panel_wp'));
            X.left(me.ui.finds('panel_wp'),needarr,1,0,0);

            me.needmoney = ownnum < whcom.need[0].n;//金币是否足够
            me.needhun = (hunnum+G.class.getOwnNum(G.gc.wuhuncom.base.item,"item")) < needhun;//判断武魂是否足够
        }
    });
    G.frame[ID] = new fun('shengwu_qh.json', ID);
})();