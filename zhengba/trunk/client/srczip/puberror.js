(function(){
    //服务端公共错误处理
    G.event.on('puberror',function(d){
        if(d.s=='-102'){
            if(!G.class.loginfun.otherClientlogin){
                var scene = cc.director.getRunningScene();
                if(scene._reloginTimer){
                    scene.clearTimeout(scene._reloginTimer);
                    delete scene._reloginTimer;
                }
                scene._reloginTimer = scene.setTimeout(function(){
                    G.class.loginfun.reDoLogin();
                },2000);
            }
        }else if (d.s == '-100'){
            G.tip_NB.show(G.class.attricon.getById(d.attr).name + L('buzu'));
        }else if(d.s == '-104'){
            if(d.equip){
                G.tip_NB.show(L("ZBCLBZ"));
            }else{
                var conf;
                if (d.pet) {
                    conf = G.class.getItem(d.pet || 5001, 'pet');
                    G.tip_NB.show(conf.name + L('buzu'));
                }else if(d.wenwu){
                    G.tip_NB.show(L("KAOGU56"));
                } else {
                    conf = G.class.getItem(d.item || 1001, 'item');
                    G.tip_NB.show(conf.name + L('buzu'));
                }
            }
        } else if (d.s == -108) {

            if (d.shipin) {
                if (G.gc.shipin[d.shipin]) {
                    G.tip_NB.show(G.gc.shipin[d.shipin].name + L("buzu"));
                }
            } else {
                G.tip_NB.show(L("SPSJSXCLBZ"));
            }
        }
        if(G.DATA && G.DATA.noClick) G.DATA.noClick = false;
    });

    G.getError = function(e){
        var info=[];
        return;
        info.push("信息：" + e.message||'unkonw');
        if(e.lineNumber)info.push("行号：" + e.lineNumber||'unkonw');
        if(e.columnNumber)info.push("列号：" + e.columnNumber||'unkonw');
        if(e.name)info.push("详情：" + e.name||'unkonw');

        cc.log(info);
    };

    //JS逻辑错误处理
    //window.onerror = function(errorMessage, scriptURI, lineNumber,columnNumber,errorObj) {
    //    G.getError && G.getError({
    //        message:errorMessage,
    //        lineNumber:lineNumber,
    //        columnNumber:columnNumber,
    //        name:errorObj
    //    });
    //};

})();