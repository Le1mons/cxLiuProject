G.frame.yingxiongtiaozhan.on('show',function() {
    var me = G.frame.yingxiongtiaozhan;
    G.frame.yingxiongtiaozhan.ui.finds('panel').touch(function (sender, type) {
        if (type == ccui.Widget.TOUCH_ENDED) {
            var start = sender.getTouchBeganPosition(), end = sender.getTouchEndPosition();
            if (end.x > start.x + 20) {
                if (me._jdid > 1) {
                    me.doMove(-1);
                    me.ui_panel_rw.setTouchEnabled(false);
                } else {
                    G.tip_NB.show(L('YDDYG'));
                }
            } else if (end.x < start.x - 20) {
                if (me._jdid < me.DATA.jd + 1) {
                    me.doMove(1);
                    me.ui_panel_rw.setTouchEnabled(false);
                } else {
                    G.tip_NB.show(L('QXTG'));
                }
            }
            me.ui.setTimeout(function () {
                me.ui_panel_rw.setTouchEnabled(true);
            }, 0, 0, 0.3);
        }
    });
});

G.frame.shouchong2.addBtnAni = function () {
	var me = this;

	me.btnCz.getChildByTag(12345) && me.btnCz.getChildByTag(12345).removeFromParent(true);
	G.class.ani.show({
		addTo: me.btnCz,
		json: 'ani_saoguang2',
		x: me.btnCz.width / 2,
		y: me.btnCz.height / 2 + 2,
		repeat: true,
		autoRemove: false,
		onload: function (node) {
			node.setTag(12345);
		}
	});
};