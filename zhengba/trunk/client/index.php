<?php
define('APPIN',true);
define('DEBUG',true);
define('ROOT', str_replace('\\','/',dirname(__FILE__)).'/');
require(ROOT."./proConfig.php");
require(ROOT."./engine/bll.php");
require(ROOT."./engine/jifeng.php");
//统一入口模式
//使用?app=folder.file模式指定文件
$getApp = rq('app');
if(strlen($getApp)==0){
	$getApp="engine.tmpl_index";
}
$file = str_replace('.','/',$getApp).'.php';
require(ROOT.$file);
DB::closeall();
?>
