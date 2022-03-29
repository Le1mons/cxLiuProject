<?php
header('Access-Control-Allow-Origin: *');
$act = r('act');

//创建支付订单
function creatOrder(){
	$gameid = r('gameid');
	$owner = r('owner');
	$uid = r('uid');
	$proid = r('proid');
	$role = r('role');
	$serverid = r('serverid');
	$paytype = r('paytype');
	$clidata = _r('clidata');
	$channel = r('channel');
	$money = r('money');
	$rolelv = r('rolelv');
	$binduid = r('binduid');
	
	//这几个渠道客户端传递的参数有误
	$orderid = uniqid();
	$sql = DB::insert("paylist",array(
		'game'=>$gameid,
		'owner'=>$owner,
		'uid'=>$uid,
		'orderid'=>$orderid,
		'proid'=>$proid,
		'paytype'=>$paytype,
		'role'=>$role,
		'money'=>$money,
		'ctime' => time(),
		'serverid'=>$serverid,
		'rolelv'=>$rolelv,
		'binduid' => $binduid,
		'data1'=>$clidata
	));
	try{
		DB::exe($sql);
		echo json_encode(array(
			's'=>1,
			'd'=>$orderid
		));
	}catch(Exception $e){
		echo json_encode(array(
			's'=>0
		));	
	}
}

//设置易接订单
function setyjorder(){
	$orderid = r('orderid');
	$yijieorder = r('yijieorder');

	$sql = DB::update("paylist",array(
		'yijieorder'=>$yijieorder,
		),"orderid='". $orderid ."'");
	try{
		DB::exe($sql);
		echo json_encode(array(
			's'=>1,
			'd'=>$yijieorder
		));
	}catch(Exception $e){
		echo json_encode(array(
			's'=>0
		));	
	}

}

if($act=='create'){
	creatOrder();
}else if($act=='setyjorder'){
	setyjorder();
}
?>
