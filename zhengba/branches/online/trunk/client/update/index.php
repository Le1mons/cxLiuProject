<?php
header("Content-type: text/html;charset=utf-8");
header("Access-Control-Allow-Origin: *");
define('APPIN',true);
define('DEBUG',true); 
define('ROOT', dirname(__FILE__).DIRECTORY_SEPARATOR);
require(ROOT."./inc/bll.php");

//统一入口模式
//使用?app=folder.file模式指定文件
$getApp = rq('app');
if(strlen($getApp)==0){
	we('working...');
}

$file = str_replace('.',DIRECTORY_SEPARATOR,$getApp).'.php';
require(ROOT.$file);
@DB::closeall();
?>
