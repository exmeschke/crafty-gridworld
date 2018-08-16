<?php
	$row = 0;
	$num_array = array(array());

	if (($handle = fopen("n.csv", "r")) !== FALSE) {
	  while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
	  	$num = count($data);
	    for ($c=0; $c < $num; $c++) {
	        $num_array[$row][$c] = $data[$c];
	    }
	    $row++;
	  }
	  fclose($handle);
	}
?>