<?php
error_reporting(E_ERROR | E_PARSE);
ini_set('memory_limit', '-1');
ini_set('max_execution_time', 300);
set_time_limit(300);

define('APP_FOLDER_PATH', dirname(__FILE__) . '/../..');
include(APP_FOLDER_PATH . '/inc/init.php');

//$trip_rows = GTFS::getTripsByMinute($_GET['hhmm'], $_GET['ymd']);
$trip_rows = GTFS::getSpecificTripsByMinute($_GET['hhmm'], $_GET['ymd'],$_GET['vtype']); // vtype 1 for other, 2 for trains, else all
JsonView::dump($trip_rows);