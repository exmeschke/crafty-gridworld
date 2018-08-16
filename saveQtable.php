<?php
	if (isset($_POST['data'])) {
		$q = json_decode($_POST['data']);


		$fp = fopen('q_table.csv', 'w');

		foreach ($q as $fields) {
		    fputcsv($fp, $fields);
		}

		fclose($fp);


	}
?>