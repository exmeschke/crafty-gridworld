<?php
	if (isset($_POST['data'])) {
		// get participant_num
		$p_file = 'participant_num.txt';
		$handle = fopen($p_file, 'r') or die('Cannot open file:  '.$p_file);
		$pnum = fgets($handle);
		fclose($handle);

		$q = json_decode($_POST['data']);

		$gen_file = fopen('q_table.csv', 'w');
		$sub = 'p'.$pnum.'_qtable.csv';
		$sub_file = fopen($sub, 'w') or die('Cannot open file:  '.$sub);

		foreach ($q as $fields) {
		    fputcsv($gen_file, $fields);
		    fputcsv($sub_file, $fields);
		}

		fclose($fp);
	}
?>