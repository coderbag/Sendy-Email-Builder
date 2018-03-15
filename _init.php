<?php
// Start session
session_start();

// Include config variables
require_once '_config.php';

// Include App class
require_once'_app.php';

// Exit if Sendy API Key or installation URL aren't defined
if(!SENDY_API_KEY || !SENDY_URL){
    die('SENDY_API_KEY and SENDY_URL are not defined');
}
// Init App
App::getInstance();
App::DBConnect($dbName ,$dbUser, $dbPass, $dbHost );

