<?php
$DATA = $_REQUEST;
//$DATA = json_decode('{"M":"homm.notify_yijie","app":"cd785f132925eb5c","cbi":"56dfb96f9a3f8","ct":"1457502605214","fee":"1","pt":"1457502576409","sdk":"5d103574c928ca46","ssid":"","st":"1","tcd":"32a77b81df754f819f974d13db6cc52a","uid":"cpd11095336","ver":"1","sign":"ced0d179429f1ebe727877ac95364acb"}',true);

setFile('paylog.txt',json_encode($DATA));

$saleid = $DATA['cbi'];
if(!$saleid)we('SUCCESS');
if($DATA['st']!=1)we('SUCCESS');
//验证订单状态
$order = getOrder($saleid);
if(!$order) we('SUCCESS');
if($order['state']==2) we('SUCCESS');

//更新data1
try {   
	DB::exesql(DB::update("paylist",array('data2'=> json_encode($DATA)),"orderid='".$saleid."'"));
}catch(Exception $e){} 


function checkYiJie(){
	global $DATA;
	$sKey = array('app','cbi','ct','fee','pt','sdk','ssid','st','tcd','uid','ver');
	$d=array();
	foreach($sKey as $v){
		$d[] = $v.'='.$DATA[$v];
	}
	$str = implode('&',$d).'HXQWTTRH4E30QNHR80KN6D07I69T2PL4';
	$mySign = md5($str);
	if($mySign == $DATA['sign']){
		return true;	
	}else{
		return false;	
	}
}

if(!checkYiJie()){
	we('SUCCESS');
}
//产品正确，则更新价格和钻石
DB::exesql(DB::update("paylist",array(
	'money'=>$DATA['fee']
),"orderid='".$saleid."'"));

//通知游戏接口记录订单信息
$result=completeOrderByOrderId($saleid,$DATA['tcd']);

$result = (int)$result;

if ($result==1){
	we('SUCCESS');
}else{
	we($result);
}
?>