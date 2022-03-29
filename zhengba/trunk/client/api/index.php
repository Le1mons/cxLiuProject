<?php
header("Content-type: text/html;charset=utf-8");
header("Access-Control-Allow-Origin: *");
define('APPIN',true);
define('DEBUG',true); 
define('ROOT', dirname(__FILE__).DIRECTORY_SEPARATOR);
require(ROOT."./srvlist.php");
require(ROOT."./inc/bll.php");
require(ROOT."./v.php");

//统一入口模式
//使用?app=folder.file模式指定文件
$getApp = r('M');
if(isn($getApp))$getApp=rq('app');
if(strlen($getApp)==0){
	we('working...');
}

if(isset($V[$getApp]))$getApp=$V[$getApp];
$file = str_replace('.',DIRECTORY_SEPARATOR,$getApp).'.php';
require(ROOT.$file);
@DB::closeall();
?>
