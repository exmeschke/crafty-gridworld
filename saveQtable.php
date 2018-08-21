<?php
	if (isset($_POST['data'])) {
		$q = json_decode($_POST['data']);

		$gen_file = fopen('q_table.csv', 'w');
		$sub = 'p'.$pnum.'_qtable.csv';
		$sub_file = fopen($sub, 'w') or die('Cannot open file:  '.$data_file);

		foreach ($q as $fields) {
		    fputcsv($gen_file, $fields);
		    fputcsv($sub_file, $fields);
		}

		fclose($fp);
	}
?>