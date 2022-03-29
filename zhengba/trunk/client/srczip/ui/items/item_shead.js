(function () {

    //设置头像数据
    G.class.shead = function (data, showName, item, isAni) {
        item = item || G.class.itemTemplate(cc.size(100,100));
        item.setLv = function(v) {
            var lv = item.lv = new ccui.Text();
            lv.setFontName(G.defaultFNT);
            lv.setString(v);
            lv.setAnchorPoint(1, 0);
            lv.setPosition(cc.p(item.width-5, 5));
            lv.setFontSize(18);
            lv.setFontName(G.defaultFNT);
            lv.setVisible(true);
            X.enableOutline(lv);
            item.addChild(lv);
        };
        if (data == null) {
            item.icon.loadTextureNormal('ico/itemico/15036.png', 0);
            return item;
        }
        item.data = data;
        var ico;
        var zxConf;

        var head_txt = data.head.toString();
        if(head_txt.split("_").length > 1) {
            var head = data.head.split("_")[0];
            head = head.substring(0, head.length - 1);
            head += 'a.png';
            ico = head;
        } else {
            zxConf = G.class.zaoxing.getHeadById(data.head) || G.class.zaoxing.getHeadById('25075');
            ico = zxConf.img;
        }

        if(data.head == "gmtx") ico = "gmtx.png";
        if(data.isyang) ico = "head_yang.png";
        item.icon.removeAllChildren();
        if(data.head == 1000) {
            G.class.ani.show({
                x: item.icon.width / 2,
                y: item.icon.height / 2,
                json: "ani_viptouxiangkuang",
                addTo: item.icon,
                repeat: true,
                releaseRes:false,
                autoRemove: false,
            })
        } else {
            item.icon.loadTextureNormal('ico/itemico/' + G.class.fmtItemICON(ico), ccui.Widget.LOCAL_TEXTURE);
        }


        if (data.lv) {
            item.setLv(data.lv);
        }

        item.background.loadTexture('img/public/ico/ico_bg0.png', 1);

        if(data.headborder && !isAni){
            item.kuang.loadTexture('img/public/head_0'+ data.headborder + '.png', 1);

            if(data.vip && data.vip >= 9 && !isAni && data.headborder < 4) {
                X.addHeadAni(item, data.headborder == 2 ? "ani_vip12zhuanshu" : (data.headborder == 3 ? "ani_wangzekuang" : "ani_viptouxiang"));
            }else{
                if(data.headborder == '4') {
                    X.addHeadAni(item, "touxiangkuang_wukong", cc.p(50, 55));
                } else if (data.headborder == '5') {
                    X.addHeadAni(item, "ani_zhanqi_txk", cc.p(50, 46));
                } else if (data.headborder == '6') {
                    X.addHeadAni(item, "ani_touxiangkuang_guangci", cc.p(50, 53));
                } else if (data.headborder == '7') {
                    X.addHeadAni(item, "ani_touxiangkuang_heifeng", cc.p(50, 48));
                } else if (data.headborder == '8') {
                    X.addHeadAni(item, "ani_touxiangkuang_anci", cc.p(52, 53));
                } else if (data.headborder == '9') {
                    X.addHeadAni(item, "ani_zhounianqing_touxiangkuang");
                } else if (data.headborder == '10') {
                    X.addHeadAni(item, "ani_zhangyu_touxiangkuang");
                } else if (data.headborder == '11') {
                    X.addHeadAni(item, "ani_zhounianqing_touxiangkuang2", cc.p(50, 43));
                } else if (data.headborder == '12') {
                    X.addHeadAni(item, 'ani_dasheng_touxiangkuang_dh');
                } else if (data.headborder == '13') {
                    X.addHeadAni(item, 'ani_touxiangkuang_yx');
                } else if (data.headborder == '14') {
                    X.addHeadAni(item, 'ani_touxiangkuang_rh');
                } else if (data.headborder == '15') {
                    X.addHeadAni(item, 'ani_touxiangkuang_sq');
                } else if (data.headborder == '16') {
                    X.addHeadAni(item, 'ani_touxiangkuang_jw');
                } else if (data.headborder == '17') {
                    X.addHeadAni(item, 'touxiangkuang_guangda_dh');
                } else if (data.headborder == "18") {
                    X.addHeadAni(item, "ani_touxiangkuang_ailin_dh");
                } else if (data.headborder == "19") {
                    X.addHeadAni(item, "ani_touxiangkuang_jiansheng");
                } else if (data.headborder == "20") {
                    X.addHeadAni(item, "ani_touxiangkuang_guangyoupf");
                } else if (data.headborder == "21") {
                    X.addHeadAni(item, "ani_touxiangkuang_shirenmopf");
                } else if (data.headborder == "22") {
                    X.addHeadAni(item, "ani_touxiangkuang_diyuquanshipf");
                } else if (data.headborder == "23") {
                    X.addHeadAni(item, "ani_touxiangkuang_guangci_pf");
                } else if (data.headborder == "24") {
                    X.addHeadAni(item, "ani_touxiangkuang_jugg_pf");
                } else if (data.headborder == "25") {
                    X.addHeadAni(item, "ani_touxiangkuang_niutou_pf");
                } else if (data.headborder == "26") {
                    X.addHeadAni(item, "ani_touxiangkuang_jumo");
                } else if (data.headborder == "27") {
                    X.addHeadAni(item, "ani_touxiangkuang_ym");
                } else if (data.headborder == "28") {
                    X.addHeadAni(item, "ani_touxiangkuang_mw");
                } else if (data.headborder == "29") {
                    X.addHeadAni(item, "ani_touxiangkuang_xz");
                } else if (data.headborder == "30") {
                    X.addHeadAni(item, "ani_touxiangkuang_tt");
                } else if (data.headborder == "31") {
                    X.addHeadAni(item, "ani_touxiangkuang_lw");
                } else if (data.headborder == "32") {
                    X.addHeadAni(item, "ani_touxiangkuang_swpf");
                } else if (data.headborder == "33") {
                    X.addHeadAni(item, "ani_guangmu_touxiangkuang_dh");
                }else if (data.headborder == "34") {
                    X.addHeadAni(item, "ani_touxiangkuang_wuya");
                }else if (data.headborder == "35") {
                    X.addHeadAni(item, "ani_touxiangkuang_guangfa_dh");
                }else if (data.headborder == "36") {
                    X.addHeadAni(item, "ani_touxiangkuang_znq_dh");
                }else if (data.headborder == "37") {
                    X.addHeadAni(item, "ani_touxiangkuang_acpf2");
                }else if (data.headborder == "38") {
                    X.addHeadAni(item, "ani_touxiangkuang_wsj");
                }else if (data.headborder == "39") {
                    X.addHeadAni(item, "ani_touxiangkuang_heilong");
                }else if (G.gc.zaoxing.headborder[data.headborder] && G.gc.zaoxing.headborder[data.headborder].ani) {
                    X.addHeadAni(item, G.gc.zaoxing.headborder[data.headborder].ani);
                }else {
                    if(cc.isNode(item) && cc.isNode(item.getChildByTag(12312897))){
                        item.removeChildByTag(12312897);
                    }
                }
            }
        }

        if(data.wzyj) {
            //显示王者印记
            item.panel_zz.zIndex = 999;
            item.panel_zz.setBackGroundImage("img/public/img_wzyj.png", 1);

            var txt = new ccui.Text(data.wzyj, G.defaultFNT, 16);
            txt.setAnchorPoint(0.5, 0.5);
            txt.setPosition(item.panel_zz.width / 2 + 1, item.panel_zz.height / 2 + 3);
            X.enableOutline(txt, "#4e1e00", 2);
            item.panel_zz.addChild(txt);
        }


        //数量默认隐藏
        item.num.hide();

        if (showName) {
            setTextWithColor(item.title, data.name, G.gc.COLOR[data.headborder * 1 || 0]);
        }
        return item;
    };
    
    X.addHeadAni = function (item, jsonFile, pos) {
        pos = pos || cc.p(item.width / 2, item.height / 2);

        G.class.ani.show({
            json: jsonFile,
            addTo: item,
            x: pos.x,
            y: pos.y,
            repeat: true,
            releaseRes:false,
            autoRemove: false,
            onload: function (node, action) {
                node.setTag(12312897);
                item.tx = node;
            }
        })
    }

})();
