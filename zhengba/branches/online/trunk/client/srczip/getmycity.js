(function(){

function getCity(callback){
    var url = 'http://ip.taobao.com/service/getIpInfo.php?ip=myip';
    var xhr = new XMLHttpRequest();
    C.log('ajax='+ url);
    
    xhr.open('POST', url);

    xhr.onreadystatechange = function() {
        C.log(xhr.statusText);
        C.log('responseData='+xhr.responseText);
        if(xhr.responseText.length>0){
            try{
                var json = JSON.parse(xhr.responseText);
                if(json.code==0){
                    var c = json.data.city;
                    if(c.length==0)c=json.data.country;
                    if(c.length>0){
                        callback && callback(c)
                    }
                }
            }catch(e){}
        }
    }
    if(sys.os.toLowerCase()=='windows'){
        xhr.send('_@_from_@_=winexe');
    }else{
        xhr.send();
    }
}

function updateMyCity(){
    getCity(function(city){
        G.ajax.send("user_setcity", [city], function (d) {});
    });
}

//登陆完毕后获取离线消息
if(C.isJSB){
    G.event.on('loginOver',function(){
        updateMyCity();
    });
}


})();