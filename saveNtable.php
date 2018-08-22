<?php
	if (isset($_POST['n_data'])) {
		$p_file = 'participant_num.txt';
		$handle = fopen($p_file, 'w') or die('Cannot open file:  '.$p_file);
		$pnum = (int)$pnum + 1;
		fwrite($handle, $pnum);
		fclose($handle);

		$n = json_decode($_POST['n_data']);
		$fp = fopen('n.csv', 'w');

		foreach ($n as $fields) {
		    fputcsv($fp, $fields);
		}

		fclose($fp);
	}
?>