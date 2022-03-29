<?php
require_once(ROOT."./inc/common.php");
require_once(ROOT.'./inc/filedb.php');

//返回服务端数据
function returnData($arr){
	$d = json_encode($arr);
	$callback = r('callback');
	if(!isn($callback))  $d = $callback.'(' . $d .');';
	we( $d );
}
//获取订单信息
function getOrder($orderid){
	$sql = "select * from paylist where orderid='".$orderid."'";
	$res = DB::getone($sql);
	if(count($res)==0)return false;
	return DB::getone($sql);
}
//更新订单状态
//1=成功 -1失败 -2建议retry
function completeOrderByOrderId($order_id,$out_order_id){
	global $APICONFIG;

	$sql = "select * from paylist where payorder='".$out_order_id."' and state=2";
	$tradeinfo = DB::getarray($sql);
	if (is_array($tradeinfo) && count($tradeinfo)>0){
		//已处理的订单
		return 1;
	}

	$payinfo = getOrder($order_id);
	if (!$payinfo){
		//订单信息不存在
		return -1;
	}

	if ($payinfo['state']==2){
		//该笔订单已充值过
		return 1;
	}

	//如果订单状态已为0则更新
	if ($payinfo['state']==0){
		//更新订单信息为1证明支付成功
		$sqlArr[] = DB::update("paylist",array('state'=>1,'payorder'=>$out_order_id),"id=".$payinfo['id']."");
		$res = DB::exesql($sqlArr);
		if(!$res){
			//订单付款状态更新失败
			return -2;
		}
	}
	//当状态为1时调用python端接口信息进行订单充值
	$outStr="";
	$payArr=array();
	#根据金额判断是否月卡充值
	$payArr[]=$payinfo['uid'];
	$payArr[]=$payinfo['proid'];
	$payArr[]=$payinfo['orderid'];
	$payArr[]=$payinfo['money'];

	$chkkey=md5((implode('',$payArr)) . SERVER_KEY);
	$payArr[] = $chkkey;

	$gameAPI=$APICONFIG[$payinfo['serverid']];
	//$gameAPIArr = explode(',',$gameAPI);
	//$gameAPI = $gameAPIArr[0];
	
	$serverInfo=explode(':',$gameAPI);
	$host=$serverInfo[0];
	$port=$serverInfo[1];

	$result = json_decode(sendHttpMsg($host,$port,'chongzhi_pay',json_encode($payArr),1),true);
	if ((int)$result["s"]==1){
		//调用成功后更新订单状态为2证明充值成功
		$res = DB::exesql(DB::update("paylist",array('state'=>2),"id=".$payinfo['id'].""));
		if ($res){
			//订单充值成功
			return 1;
		}else{
			//订单充值状态更新失败
			return -2;
		}
	}else{
		if ((int)$result["s"]==-3 && $payinfo['state']==1) {
			//防止订单状态更新失败但是已充值成功的订单更新状态
			$res = DB::exesql(DB::update("paylist",array('state'=>2),"id=".$payinfo['id'].""));
			return 1;
		}
		return -2;
	}
}

//HTTP链接方式
function sendHttpMsg($host='127.0.0.1',$port='9999',$a,$d,$back=0){
	$url = "http://{$host}:{$port}/?a=". $a ."&d=". urlEncode($d);
	$res = getHttpPage($url);
	if(isn($res)){
		$res = '{"s":0}';
	}
	$res = str_replace(array(chr(1),chr(2),chr(3),chr(4),chr(5),chr(6)),"",$res);
	return $res;
}
?>