<?php
	if (isset($_POST['data'])) {
		$n = json_decode($_POST['data']);


		$fp = fopen('n.csv', 'w');

		foreach ($n as $fields) {
		    fputcsv($fp, $fields);
		}

		fclose($fp);


	}
?>