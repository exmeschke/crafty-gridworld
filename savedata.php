<?php

		// update participant_num
		$p_file = 'participant_num.txt';
		$handle = fopen($p_file, 'r') or die('Cannot open file:  '.$p_file);
		$pnum = fgets($handle);
		fclose($handle);

		$p_file = 'participant_num.txt';
		$handle = fopen($p_file, 'w') or die('Cannot open file:  '.$p_file);
		// $pnum = (int)$pnum + 1;
		$pnum = 0;
		fwrite($handle, $pnum);
		fclose($handle);

		// save MDP data
		if (isset($_POST['mdp_data'])) {
			$mdp = json_decode($_POST['mdp_data']);

			$data_file = 'p'.$pnum.'_mdp.csv';
			$handle = fopen($data_file, 'w') or die('Cannot open file:  '.$data_file);

			foreach ($mdp as $fields) {
			    fputcsv($handle, $fields);
			}
			fclose($handle);
		}
		// save human state data
		if (isset($_POST['hstate_data'])) {
			$hstate = json_decode($_POST['hstate_data']);

			$data_file = 'p'.$pnum.'_hstate.csv';
			$handle = fopen($data_file, 'w') or die('Cannot open file:  '.$data_file);

			foreach ($hstate as $fields) {
			    fputcsv($handle, $fields);
			}
			fclose($handle);
		}
		// save robot state data
		if (isset($_POST['rstate_data'])) {
			$rstate = json_decode($_POST['rstate_data']);

			$data_file = 'p'.$pnum.'_states.txt';
			$handle = fopen($data_file, 'w') or die('Cannot open file:  '.$data_file);

			foreach ($rstate as $fields) {
			    fwrite($handle, $fields);
			    fwrite($handle, ',');
			}
			fclose($handle);
		}

?>