<?php

// Handle logout
if ( isset( $_GET['action'] ) && ( $_GET['action'] == 'logout' ) ) {
    App::doUserLogout();
}

// Check if user is not authenticated
if ( !App::isUserLoggedIn() && (App::getPage() != 'login') ) {
    header('Location: login.php');
    die();
}

// Redirect user if user is logged in and on login page
if ( App::isUserLoggedIn() && (App::getPage() == 'login') ) {
    header('Location: index.php');
    die();
}

// Redirect to choose a template theme if it isn't selected yet
if( App::getPage() == 'builder' ){
    if(!isset($_GET['theme'])) {
        header('Location: theme.php');
        die();
    }
}