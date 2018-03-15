<?php require_once '_init.php';

App::setPage('theme');

require_once '_security.php';

require_once '_header.php';
?>

<div class="main-form-container">
    <form action="builder.php" method="get">
        <h3>Create new campaign</h3>
        <p>Please, choose email template</p>

        <div class="form-group ">
            <select class="form-control" name="theme">
                <option value="" disabled selected>Please select..</option>
                <?php
                $templates = App::getTemplates();
                foreach($templates as $template) { ?>
                    <option value="<?php echo $template['slug']; ?>"><?php echo $template['name']; ?></option>
                <?php } ?>
            </select>
        </div>

        <div class="form-group1">
            <button type="submit" class="btn btn-primary">Continue..</button>
        </div>

    </form>
    <a class="btn-form-action" href="index.php?action=logout">Logout</a>
</div>


<?php require_once '_footer.php'; ?>
