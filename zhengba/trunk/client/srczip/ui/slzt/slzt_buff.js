(function () {
    var ID = 'slzt_buff';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var data = me.data();
            var buffArr = data.data.bid;
            me.nodearr = [];
            buffArr.forEach(function name(item, idx) {
                var conf = G.class.slzt.getBuff()[item];
                var node = me.nodes["panel_" + (idx + 1)];
                var clnode = me.nodes.list.clone();
                X.autoInitUI(clnode);
                clnode.show();
                node.addChild(clnode);
                clnode.setPosition(node.width / 2, node.height / 2);
                clnode.nodes.txt_buff.setString(conf.name);
                var buff =  X.fmtBuff(conf.parameter.buff)
                clnode.nodes.txt_1.setString(conf.parameter.intro);
                clnode.nodes.txt_2.setString(buff[0].sz);
                X.enableOutline(clnode.nodes.txt_buff,cc.color("#4a3932"),1)
                clnode.nodes.txt_1.width += 30;
                // clnode.nodes.txt_2.hide();
                clnode.setTouchEnabled(true);
                clnode.id = idx;
                clnode.click(function(sender){
                    if(me.choose == sender.id)return;
                    if(me.choose != undefined){
                        me.nodearr[me.choose].nodes.panel_zz.hide()
                    };
                    sender.nodes.panel_zz.show();
                    me.choose = sender.id;
                })
                me.nodearr.push(clnode);

            })
            me.nodes.btn_qw.click(function (sender) {
                if (me.choose == undefined) {
                    G.tip_NB.show(L("slzt_tip9"))
                    return
                }
                G.ajax.send('shilianzt_event', [me.data().idx, me.choose], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.tip_NB.show(L("slzt_tip10"));
                        G.frame.slzt.DATA.mydata = d.d.mydata;
                        me.remove();
                    }
                }, true);
            })
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
    G.frame[ID] = new fun('shilianzhita_tk7.json', ID);
})();