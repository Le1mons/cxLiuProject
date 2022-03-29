<?php
require_once(ROOT."./inc/common.php");
require_once(ROOT.'./inc/filedb.php');
require_once(ROOT.'./version.php');

//服务器前缀
function HTTP(){
	$url='http://'.$_SERVER['SERVER_NAME'].$_SERVER["REQUEST_URI"]; 
	return dirname($url);	
}
//根据f_t版本生成文件名
function zipName($from,$to,$pre=''){
	global $plat;
	return $pre . $from.'_'.$to.'.zip';
}
?>