<?php
$vername = r('vername');
$channel = r('channel');
$callback = r('callback');

$js = getFile('./hotupdate_hunfu.js');
$js = str_replace(array("\r","\n","\t"),'',$js);
$json = json_encode(array('js'=>$js));

if(!isn($callback)){
	we($callback.'('. $json .');;');
}else{
	we($json);
}
?>
