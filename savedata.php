<?php
		// update participant_num
		$p_file = 'participant_num.txt';
		$handle = fopen($p_file, 'w') or die('Cannot open file:  '.$p_file);
		$pnum = (int)$pnum + 1;
		fwrite($handle, $pnum);
		fclose($handle);

		// save MDP data
		if (isset($_POST['mdp_data'])) {
			// get participant_num
			$p_file = 'participant_num.txt';
			$handle = fopen($p_file, 'r') or die('Cannot open file:  '.$p_file);
			$pnum = fgets($handle);
			fclose($handle);

			$mdp = json_decode($_POST['mdp_data']);

			$data_file = 'p'.$pnum.'_mdp.csv';
			$handle = fopen($data_file, 'w') or die('Cannot open file:  '.$data_file);

			foreach ($mdp as $fields) {
			    fputcsv($handle, $fields);
			}
			fclose($handle);
		}

?>