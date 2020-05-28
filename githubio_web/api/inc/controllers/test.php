<?php
//error_reporting(E_ERROR | E_PARSE);
ini_set('memory_limit', '-1');
ini_set('max_execution_time', 300);
set_time_limit(300);

define('APP_FOLDER_PATH', dirname(__FILE__) . '/../..');
include(APP_FOLDER_PATH . '/inc/init.php');

$trip_rows = GTFS::test();
JsonView::dump($trip_rows);