<?php
require_once(ROOT."./inc/appin.php");
$channel = r('channel');
$owner = r('owner');
$versincode = r('versincode');

if(isn($owner) || isn($versincode) || $versincode*1<6984){
	we('{"data":{"0":{"idx":0,"sid":"0","name":"敬请期待","ips":"homm1.legu.cc:999","ipw":["homm1.legu.cc:999"],"starttime":'. (time()+9999999) .',"s":1}},"now":'. time() .',"order":[0]}');
}

$IP = getip();
$specIP = array('59.173.26.178','58.49.93.1791');

$isSpecIP = in_array($IP, $specIP);
//***************************筛选指定服务商区服列表**********************************
if(isn($owner))$owner="cz";
if($channel=='BUSINESS')$owner="business";

$svrallList=getListArray();

$ownerList = array();
$nt=(int)time();
foreach($svrallList as $k=>$v){
	$tmpv=$v;
	$vowner = ','.$tmpv['owner'].',';
	if(indexOf($vowner,','. $owner .',')==-1)continue;

	//if ($tmpv['owner'] != $owner)continue;
	if ($tmpv['opentime']=="")continue;
	$openTime = strtotime($tmpv['opentime']);
	
	/*
	if ($openTime > $nt+24*60*60 && !$isSpecIP){
		continue;
	}else if($openTime > $nt){
		//即将开放
		$tmpv['servername'] = '即将开放';
	}else{

	}
	*/

	if ($openTime > $nt && !$isSpecIP){
		continue;
	}

	$ownerList[ $tmpv['serverid'] ] = $tmpv;
}
//排序
krsort($ownerList);

$res = array(
	"data" => array(),
	'now' => time(),
);

$idx=0;
$len = count($ownerList);
foreach($ownerList as $sid=>$conf){
	$sid = (string)$sid;
	$opentime = strtotime($conf['opentime']);
	if($isSpecIP)$opentime = time()-1;
	
	$state = 0;

	if($idx==0){
		$state = 1;
	}else if($idx<5){
		$state = 2;
	}
	#if($conf['running']=='0')$state=3;

	$d = array(
		"idx" => $idx,
		"sid" => $sid,
		"name" => 'S'.($len-$idx).' '.$conf['servername'],
		"ips" => $conf['port2'],
		"ipw" => explode(',',$conf['port3']),
		'starttime' => $opentime,
		"s" => $state
	);
	$idx++;
	$res['data'][$sid] = $d;
}
$res['order'] = array_keys($res['data']);
returnData($res);
?>