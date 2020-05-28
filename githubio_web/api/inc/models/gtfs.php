<?php
error_reporting(E_ERROR | E_PARSE);
ini_set('memory_limit', '-1');
ini_set('max_execution_time', 300);
set_time_limit(300);
class GTFS {
    private static function getDayServiceIds($ymd) {
        $day_of_week = DateTime::createFromFormat('Ymd', $ymd)->format('l');
        $day_of_week = strtolower($day_of_week);

        $calendar_rows = DB::getCalendarRows();
        $service_ids = array();
        foreach ($calendar_rows as $row) {
            if (($row['start_date'] <= $ymd) && ($ymd <= $row['end_date'])) {
                if ($row[$day_of_week] === 1) {
                    array_push($service_ids, $row['service_id']);
                }
//                if (($row['monday'] === 0) && ($row['tuesday'] === 0) && ($row['wednesday'] === 0) && ($row['thursday'] === 0) && ($row['friday'] === 0) && ($row['saturday'] === 0) && ($row['sunday'] === 0)) {
//                    array_push($service_ids, $row['service_id']);
//                }
            }
        }
        if (count($service_ids) === 0) {
            error_log('GTFS::getDayServiceIds no service_id found for ' . $ymd . ' dow: ' . $day_of_week);
        }
        return $service_ids;
    }


    private static function getNonDayServiceIds($ymd) {
        $calendar_rows = DB::getCalendarDayRows($ymd);
        $service_ids = array();
        foreach ($calendar_rows as $row) {
            array_push($service_ids, $row['service_id']);
        }
        return $service_ids;
    }
    private static function getNewDayServiceIds($ymd) {
        $calendar_rows = DB::getNewCalendarDayRows($ymd);
        $service_ids = array();
        foreach ($calendar_rows as $row) {
            array_push($service_ids, $row['service_id']);
        }
        return $service_ids;
    }
    private static function getAllServiceIds($ymd) {
        $service_ids = self::getDayServiceIds($ymd);
        $not_service_ids = self::getNonDayServiceIds($ymd);
        $new_service_ids = self::getNewDayServiceIds($ymd);
//        print_r ($service_ids);
//        echo (sizeof($service_ids)."\n");
        $service_ids = array_diff($service_ids, $not_service_ids);
        $service_ids = array_merge($service_ids,$new_service_ids);
        return $service_ids;
    }

    public static function getTripsByMinute($hhmm,$ymd) {
        $service_ids = self::getAllServiceIds($ymd);
        $trips = DB::getTripsByMinute($hhmm, $service_ids);
        $new_trips = array();
        foreach ($trips as $k => $row) {
            $stops = DB::getStopsByTripId($row['trip_id']);
            foreach ($stops as $k1 => $stop) {
                $stops[$k1]['arrival_time'] = self::renderTime($stop['arrival_time']);
                $stops[$k1]['departure_time'] = self::renderTime($stop['departure_time']);
            }
            $trips[$k]['stops'] = $stops;
            array_push($new_trips, $trips[$k]);
        }
        return $new_trips;
    }

    public static function getSpecificTripsByMinute($hhmm,$ymd,$vtype) {
        $service_ids = self::getAllServiceIds($ymd);
        $trips = DB::getSpecificTripsByMinute($hhmm, $service_ids,$vtype);
        $new_trips = array();
        foreach ($trips as $k => $row) {
            $stops = DB::getStopsByTripId($row['trip_id']);
            foreach ($stops as $k1 => $stop) {
                $stops[$k1]['arrival_time'] = self::renderTime($stop['arrival_time']);
                $stops[$k1]['departure_time'] = self::renderTime($stop['departure_time']);
            }
            $trips[$k]['stops'] = $stops;
            array_push($new_trips, $trips[$k]);
        }
        return $new_trips;
    }
    
    private static function renderTime($hms) {
        $time_sec = substr($hms, 0, 2) * 3600 + substr($hms, 3, 2) * 60 + substr($hms, 6);
        $day_full_sec = 24 * 3600;
        if ($time_sec < $day_full_sec) {
            return $hms;
        }
        
        $time_sec -= $day_full_sec;
        $time_hh = floor($time_sec / 3600);
        $time_mm = floor(($time_sec - $time_hh * 3600) / 60);
        $time_ss = $time_sec - $time_hh * 3600 - $time_mm * 60;
        
        return sprintf('%02d:%02d:%02d', $time_hh, $time_mm, $time_ss);
    }
}
