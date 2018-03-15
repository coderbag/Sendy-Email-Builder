<?php require_once '_init.php';


// Handle Login Form Submission
if ( isset( $_POST['action'] ) && ( $_POST['action'] == 'do-login' ) ) {
    $statusMsg = '';
    $hasError = false;

    $user_email = isset( $_POST['email'] ) ? $_POST['email'] : '';
    $user_password = isset( $_POST['password'] ) ? $_POST['password'] : '';
    $honeypot =  $_POST['login']; //Honey pot (anti-spam) field

    /*
     * Check form data for errors
     */
    if ( !$user_email || !$user_password ) {
        $statusMsg="Please, enter your email and password.";
        $hasError=true;
    }
    // Anti-spam: if invisible field is not empty then message is spam
    if ( $honeypot ) {
        $statusMsg = '';
        $hasError = true;
    }

    // Validate email address
    if ( !$hasError ) {
        if ( !filter_var($user_email, FILTER_VALIDATE_EMAIL) ) {
            $statusMsg="Invalid email, please, try again.";
            $hasError=true;
        }
    }

    // Check if user exists & validate the password
    if ( !$hasError ) {
        $result = App::DBQuery('SELECT * FROM `login` where `username`= "' . $user_email . '" LIMIT 1')->fetch();
        if(!is_array($result) || (hash('sha512', $user_password.'PectGtma') !== $result['password']) ){
            $statusMsg = "Incorrect email or password, please, try again.";
            $hasError = true;
        }
    }


    // Write User ID to Session in case of success
    if ( !$hasError ) {
        $_SESSION['user_id'] = $result['id'];
        header('Location: index.php');
        die();
    }
}


App::setPage('login');

require_once '_security.php';

require_once '_header.php';
?>

<div class="main-form-container">
    <div class="form-login-container"><a href='index.php' title="<?php echo APP_NAME; ?>"><img src="dist/images/logo_login.png"></a></div>
    <form action="" method="post">
        <input type="hidden" name="action" value="do-login">
        <h3>Authorization</h3>
        <p>Please, login using your Sendy email and password</p>

        <?php if ( isset( $statusMsg ) ) {?>
            <div class="alert bg-danger">
                <?php echo $statusMsg;?>
            </div>
        <?php } ?>
        <div class="form-group ">
            <input type="text" class="form-control" placeholder="Email" name="email" value="<?php echo isset( $_POST['email'] ) ? $_POST['email'] : '';?>">
        </div>

        <div class="form-group">
            <input type="password" class="form-control" placeholder="Password" name="password" value="<?php echo isset( $_POST['password'] ) ? $_POST['password'] : '';?>">
        </div>

        <div class="form-group1">
            <button type="submit" class="btn btn-primary">Login</button>
            <input type="text" class="input-honeypot" style="visibility:hidden;width:1px;height:1px;" name="login" value=""/>
        </div>

    </form>
</div>


<?php require_once '_footer.php'; ?>
