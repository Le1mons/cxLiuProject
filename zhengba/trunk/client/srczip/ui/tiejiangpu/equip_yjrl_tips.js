/**
 * Created by  on 2019//.
 */
(function () {
    //一键熔炼tips
    var ID = 'equip_yjrl_tips';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.type = me.data().type;
            me.DATA = me.data().data;
            me.list = new ccui.Layout();
            me.list.setContentSize(100,100);
            me.ui.addChild(me.list);
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_01.click(function () {
                me.ajax('equip_yjhecheng',[me.type,0],function (str,data) {
                    if(data.s == 1){
                        G.frame.jiangli.data({
                            prize:me.DATA.prize
                        }).show();
                        G.frame.tiejiangpu.topMenu.changeMenu(me.type);
                        try{
                          var need = [].concat(me.DATA.need);
                          G.event.emit("leguXevent", {
                              type: 'track',
                              event: 'equip_hehceng',
                              data: {
                                  equip_need: X.arrPirze(need.splice(0,need.length -1)),
                                  equip_prize:  X.arrPirze(me.DATA.prize),
                                  equip_jinbi: X.arrPirze(need),
                              }
                          });
                        }catch(e){
                            cc.error(e);
                        }
                        me.remove();
                    }
                })
            });
            me.nodes.btn_02.click(function () {
                me.remove();
            });
            me.nodes.panel_wp.setTouchEnabled(false);
            me.nodes.listview.setSwallowTouches(false);
            cc.enableScrollBar(me.nodes.listview);
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
        setContents:function(){
            var me = this;

            var needjb = 0;
            for(var i = 0; i < me.DATA.need.length;i++){
                if(me.DATA.need[i].t == 'jinbi'){
                    needjb = me.DATA.need[i].n;
                    break;
                }
            }
            var str = X.STR(L('TJPYJRL'),X.fmtValue(needjb));
            X.setRichText({
                parent:me.nodes.txt_fhsdj1,
                str:str,
                color:"#F6EBCD",
            });
            var prize = [].concat(me.DATA.prize);
            for(var i = 0; i < prize.length; i++){
                prize[i].color = G.class.getItem(prize[i].t,prize[i].a).color;
                prize[i].star = G.class.getItem(prize[i].t,prize[i].a).star || 0;
            }
            prize.sort(function (a,b) {
                if(a.color != b.color){
                    return a.color > b.color ? -1:1;
                }else if(a.star != b.star){
                    return a.star > b.star ? -1:1;
                }
            });
            if(prize.length <= 4){

                X.alignItems(me.nodes.panel_wp,prize,'center',{
                    touch:true
                });
            }else {
                me.nodes.listview.removeAllChildren();
                for(var i = 0; i < prize.length;i++){
                    var list = me.list.clone();
                    X.autoInitUI(list);
                    list.show();
                    list.removeAllChildren();
                    var item = G.class.sitem(prize[i]);
                    G.frame.iteminfo.showItemInfo(item);
                    item.setAnchorPoint(0,0);
                    item.setPosition(0,0);
                    list.addChild(item);
                    me.nodes.listview.pushBackCustomItem(list);
                }
            }
        }
    });
    G.frame[ID] = new fun('zhaugnbei_tips_rlyl.json', ID);
})();