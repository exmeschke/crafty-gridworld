<?php
	$row = 0;
	$q_array = array(array());

	if (($handle1 = fopen("q_table.csv", "r")) !== FALSE) {
	  while (($data = fgetcsv($handle1, 1000, ",")) !== FALSE) {
	  	$num = count($data);
	    for ($c=0; $c < $num; $c++) {
	        $q_array[$row][$c] = $data[$c];
	    }
	    $row++;
	  }
	  fclose($handle1);
	}
?>