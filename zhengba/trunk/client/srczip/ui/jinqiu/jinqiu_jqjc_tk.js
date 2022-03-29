(function(){
    var ID = 'jinqiu_jqjc_tk';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            this._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.DATA.jinqiu;
            me.ui.finds('mask').click(function () {
                me.remove();
            });
            me.nodes.btn_1.setTouchEnabled(true);
            me.nodes.btn_1.click(function () {
                me.changeNum(-1);
            });
            me.nodes.btn_4.setTouchEnabled(true);
            me.nodes.btn_4.click(function () {
                me.changeNum(-10);
            });
            me.nodes.btn_2.setTouchEnabled(true);
            me.nodes.btn_2.click(function () {
                me.changeNum(1);
            });
            me.nodes.btn_3.setTouchEnabled(true);
            me.nodes.btn_3.click(function () {
                me.changeNum(10);
            });
            me.ui.finds('bg_1').setTouchEnabled(true);
            me.isdx=false;
            me.nodes.btn_5.click(function (sender) {
                me.ajax('midautumn2_lottery',[G.frame.jinqiu_qrjc.selectIndex,me.addNum],function (str,d) {
                    if(d.s == 1){
                        me.DATA.myinfo = d.d.myinfo;
                        me.DATA.lotterynum = d.d.lotterynum;
                        me.isdx=true;
                        G.frame.jinqiu_qrjc.cjCallback=function(){
                            G.frame.jiangli.data({
                                prize:d.d.prize
                            }).show();
                            G.frame.jinqiu_qrjc.setContents();
                        }
                        me.remove();
                    }
                })
            })
        },
        onShow: function () {
            var me = this;
            var num = me.DATA.lotterynum[G.frame.jinqiu_qrjc.selectIndex] || 0;
            var conf = G.gc.midautumn2.lotteryprize[G.frame.jinqiu_qrjc.selectIndex];
            var cjNum = (parseInt(num / conf.needval) + 1);
            var pool = me.DATA.myinfo.lottery[G.frame.jinqiu_qrjc.selectIndex] || {};
            var mynum = me.DATA.myinfo.lottery[G.frame.jinqiu_qrjc.selectIndex];
            var needval=G.gc.midautumn2.lotteryprize[G.frame.jinqiu_qrjc.selectIndex].needval;
            var cs = (Math.floor(num % needval / needval )+1)*needval*G.gc.midautumn2.lotterypro - (mynum || 0);
            X.render({
                text_1: X.STR(L('JQHD_2')),
                text_2: X.STR(L('double_jojoinNum'), mynum|| 0, cs),
                panel_1: function (node) {
                    X.alignCenter(node, [].concat(conf.prize[0], conf.prize[1]), {
                        touch: true
                    });
                }
            }, me.nodes);


            var hasNum = G.class.getOwnNum(G.gc.midautumn2.lotteryneed[0].t, G.gc.midautumn2.lotteryneed[0].a);
            me.addNum = 1;
            me.maxNum = conf.needval;
            if (hasNum < me.maxNum) {
                me.maxNum = hasNum || 1;
            }
            me.showBuyNum();
            me.nodes.textfield_5.setTouchEnabled(false);
            me.setButtonState();
            me.nodes.textfield_5.setTextHorizontalAlignment(1);
            me.nodes.textfield_5.setTextVerticalAlignment(1);
        },
        changeNum: function (num) {
            if (num + this.addNum < 1) {
                this.addNum = 1;
            } else if (num + this.addNum > this.maxNum) {
                this.addNum = this.maxNum;
            } else {
                this.addNum += num;
            }
            this.showBuyNum();
            this.setButtonState();
        },
        setButtonState: function () {
            var me = this;

            me.nodes.btn_1.setEnableState(me.addNum > 1);
            me.nodes.btn_3.setEnableState(me.addNum >= 1);
            me.nodes.btn_2.setEnableState(me.addNum >= 1);
            me.nodes.btn_4.setEnableState(me.addNum > 1);
        },
        showBuyNum: function () {
            var me = this;
            var need = G.gc.midautumn2.lotteryneed[0];
            var str = X.STR(L("JQHD_1"),X.fmtValue(me.addNum * need.n) + '/' + X.fmtValue(G.class.getOwnNum(need.t, need.a)));
            var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
            img.setScale(0.7);
            var rh = X.setRichText({
                parent:me.nodes.txt_3,
                str:str,
                color:"#d44f21",
                node:img,
            });
            me.nodes.textfield_5.setString(me.addNum);
        }
    });
    G.frame[ID] = new fun("qiurijiangchi_cj.json", ID);
})();