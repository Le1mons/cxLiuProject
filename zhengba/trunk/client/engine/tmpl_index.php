<?php
//判断屏幕方向
$orientation = ($designSize[0]>$designSize[1]?'landscape':'portrait');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title><?=$proName?></title>
    <meta name="viewport" content="width=device-width,initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="full-screen" content="yes"/>
    <meta name="screen-orientation" content="<?=$orientation?>"/>
    <meta name="x5-fullscreen" content="true"/>
    <meta name="360-fullscreen" content="true"/>
    <meta name="x5-orientation" content="<?=$orientation?>"/>
    <style>
        body, canvas, div {
            -moz-user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
            -khtml-user-select: none;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }
        html,body{width:100%;height:100%;  overflow: hidden;}
        #legu{ width:100%;height:100%;background:#000 url(res/legu.jpg) center 30% no-repeat;background-size:50%; position:absolute;z-index:100}
    </style>
	
</head>
<body style="padding:0; margin: 0; background: #333 url(res/canvasbg.jpg);">
<div id="legu"><div style="position: absolute;bottom: 50px;color: #fff;width: 100%;text-align: center;color:#999; font-size:15px;" id="tips">好嘞，开足马力开始加载啦<br/>(●'◡'●)ﾉ♥</div></div>
<canvas id="gameCanvas" width="<?=$designSize[0]?>" height="<?=$designSize[1]?>"></canvas>
<script>
var start = new Date().getTime(),timer;

function $id(s){
    return document.getElementById(s);
}

function onGameStart(){
    var end = new Date().getTime();
    clearTimeout(timer);

    var diff = end-start;
    if(diff>2000){
        $id('legu').style.display="none";
    }else{
        setTimeout(function(){
            $id('legu').style.display="none";
        },2000-diff);
    }
}

timer = setTimeout(function(){
    $id('tips').innerHTML = "您的网速不是太给力噢，咱再等等看？<br/> (⊙□⊙) ";
    $id('tips').style.display="";
    timer = setTimeout(function(){
        $id('tips').innerHTML = "还没加载好呢？说好了不许砸手机噢！<br/> (/≡ _ ≡)/~┴┴ ";
         timer = setTimeout(function(){
            $id('tips').innerHTML = "再不行的话，要不咱刷新一次吧 <br/>(╬￣皿￣)凸";
            timer = setTimeout(function(){
                $id('tips').innerHTML = "求你了，刷新一下吧 要不然我帮你啦<br/> ( ＿ ＿)ノ｜";

                timer = setTimeout(function(){
                    location.reload();
                 },5000);
             },30000);
         },12000);
    },6000);
},4000);
</script>
<script src="frameworks/cocos2d-html5/CCBoot.js?_=<?=filemtime('frameworks/cocos2d-html5/CCBoot.js')?>"></script>
<script src="src/cocos.min.js?_=<?=filemtime('src/cocos.min.js')?>"></script>
<?php
//if(is_file('./srczip/myLoaderScene.js'))echo '<script src="srczip/myLoaderScene.js"></script>';
?>
<script cocos src="main.js?_=<?=filemtime('main.js')?>"></script>
</body>
</html>
<?php
$temp=ob_get_contents();
ob_end_clean();
setFile('game.html',$temp);
include 'game.html';
?>