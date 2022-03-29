<?php
require_once(ROOT."./inc/appin.php");
$owner = r('owner');
if(isn($owner))$owner="cz";

$svrallList=getListArray();

$ownerList = array();
$nt=(int)time();
foreach($svrallList as $k=>$v){
	$tmpv=$v;
	$vowner = ','.$tmpv['owner'].',';
	if(indexOf($vowner,','. $owner .',')==-1)continue;
	if($tmpv['servername']=='开发版')continue;

	if ($tmpv['opentime']=="")continue;
	$openTime = strtotime($tmpv['opentime']);

	if ($openTime > $nt && !$isSpecIP){
		//continue;
	}

	$ownerList[ $tmpv['serverid'] ] = $tmpv;
}
//排序
krsort($ownerList);
$res = array();

$idx=0;
$len = count($ownerList);
foreach($ownerList as $sid=>$conf){
	$sid = (string)$sid;
	$opentime = $conf['opentime'];

	$d = array(
		"sid" => $sid,
		"name" => 'S'.($len-$idx).''.$conf['servername'],
		'opentime' => $opentime,
		'owner' => $conf['owner']
	);
	$idx++;
	$res[] = implode("&nbsp;&nbsp;",$d);
}
we(implode("<br/>",$res));
?>