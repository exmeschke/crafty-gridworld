<?php

		$p_file = 'participant_num.txt';
		$handle = fopen($p_file, 'r') or die('Cannot open file:  '.$p_file);
		$pnum = fgets($handle);
		fclose($handle);

		$data_file = 'p'. $pnum.'.txt';
		$handle = fopen($data_file, 'w') or die('Cannot open file:  '.$data_file);
		$data = 'This is the data';
		fwrite($handle, $data);
		fclose($handle);

		$p_file = 'participant_num.txt';
		$handle = fopen($p_file, 'w') or die('Cannot open file:  '.$p_file);
		$pnum = (int)$pnum + 1;
		fwrite($handle, $pnum);
		fclose($handle);

?>