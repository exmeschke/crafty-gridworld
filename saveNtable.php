<?php
	if (isset($_POST['n_data'])) {
		$n = json_decode($_POST['n_data']);
		$fp = fopen('n.csv', 'w');

		foreach ($n as $fields) {
		    fputcsv($fp, $fields);
		}

		fclose($fp);
	}
?>