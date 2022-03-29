<?php
$d = array(
	"s1" =>array(
		"idx" => 0,
		"sid" => "s1",
		"name" => "商务测试",
		"ips" => "homm1.legu.cc:6287",
		"ipw" => array("homm1.legu.cc:6288","homm1.legu.cc:6289","homm1.legu.cc:6290","homm1.legu.cc:6291"),
		"s" => 1
	),
	"s2" => array(
		"idx" => 1,
		"sid" => "s2",
		"name" => "内网测试【唐】",
		"ips" => "10.0.0.36:7287",
		"ipw" => array("10.0.0.36:7288","10.0.0.36:7288"),
		"s" => 2
	),
	"s3" => array(
		"idx" => 2,
		"sid" => "s3",
		"name" => "内网测试【吴】",
		"ips" => "10.0.0.69:6287",
		"ipw" => array("10.0.0.69:6288","10.0.0.69:6289","10.0.0.69:6310","10.0.0.69:6312"),
		"s" => 3
	)
);

$order = array("s1","s2","s3");

$res = array(
	"data" => $d,
	"order" => $order
);

echo json_encode($res);
?>