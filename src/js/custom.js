"use strict";

var emitter = window.top.jsEmailBuilderEmitter;

function dialogExportHTML() {
    swal({
            title: "Export to HTML",
            text: "Export template to single HTML file",
            type: "info",
            showCancelButton: true,
            showLoaderOnConfirm: true,
        },
        function () {
            setTimeout(function () {
                swal("Template has been exported successfully");
                $('#export-form [name="type"]').val('html');
                $('#export-form').submit();
            }, 1000);
        });
}

function dialogExportZip() {
    swal({
            title: "Export to ZIP",
            text: "Export template to zip-archive",
            type: "info",
            showCancelButton: true,
            showLoaderOnConfirm: true,
        },
        function () {
            setTimeout(function () {
                swal("Template has been exported successfully");
                $('#export-form [name="type"]').val('zip');
                $('#export-form').submit();
            }, 1000);
        });

}

function dialogCampaign(){
    var modalContainer = $('#campaignmodal');
    $.fancybox.open({
        src  : '#campaignmodal',
        type : 'inline',
        opts : {
            onComplete : function() {
                // Remove previous on-click event listeners
                $('.modal-btn-cancel', modalContainer).off('click');
                $('.modal-btn-ok', modalContainer).off('click');

                $('.modal-btn-cancel', modalContainer).on('click', function (event) {
                    // Close Modal
                    $.fancybox.close();
                });
                $('.modal-btn-ok', modalContainer).on('click', function(event){
                    var modalTitle = "Save" + ( $('input[name=send_campaign]').is( ":checked" ) ? ' and send' : '') + ' campaign?';
                    swal({
                            title: modalTitle,
                            type: "info",
                            showCancelButton: true,
                            closeOnConfirm: false,
                            showLoaderOnConfirm: true
                        },
                        function(){
                            var list_ids = [];
                            $(".list_ids:checked").each(function() {
                                list_ids.push(this.value);
                            });
                            $.ajax({
                                url     : '_ajax.php',
                                type    : 'POST',
                                dataType: 'json',
                                data    :  {
                                    'process_campaign' : 1,
                                    'from_name' : $('input[name=from_name]').val(),
                                    'from_email' : $('input[name=from_email]').val(),
                                    'reply_to' : $('input[name=reply_to]').val(),
                                    'subject' : $('input[name=subject]').val(),
                                    'plain_text' : $('input[name=plain_text]').val(),
                                    'html_text' : $('#templateHTML').val(),
                                    'brand_id' : $('#brand_id').val(),
                                    'send_campaign' : $('input[name=send_campaign]').is( ":checked" ) ? 1 : 0,
                                    'list_ids' : list_ids,
                                    'query_string' : $('input[name=query_string]').val()
                                },
                                success : function( data ) {

                                    if ( data['type'] == 'success' ) {
                                        var result = data['message'];
                                        if(result.status === true) {
                                            swal("Success", result.message, "success");
                                            // Reset campaign form
                                            $('input[name=from_name]').val('');
                                            $('input[name=from_email]').val('');
                                            $('input[name=reply_to]').val('');
                                            $('input[name=subject]').val('');
                                            $('input[name=plain_text]').val('');
                                            $('input[name=send_campaign]').prop('checked', false);
                                            $('input[name=query_string]').val('');
                                            // Close Modal
                                            $.fancybox.close();
                                        }else{
                                            swal("Error", result.message, "error");
                                        }



                                    }
                                },
                                error   : function( xhr, err ) {
                                    // Log errors if AJAX call is failed
                                    console.log(xhr);
                                    console.log(err);
                                }
                            });
                        });



                });
            }
        }
    });

    return false;
}

function dialogSendyHelpers(){
    $.fancybox.open({
        src  : '#sendyhelpers',
        type : 'inline'
    });

    return false;
}

emitter.on('init', function () {
    $('[data-action="export-html"]').on('click', function (event) {
        dialogExportHTML();
    });
    $('[data-action="export-zip"]').on('click', function (event) {
        dialogExportZip();
    });

    $('[data-action="campaign-settings"]').on('click', function (event) {
        dialogCampaign();
    });

    $('[data-action="sendy-helpers"]').on('click', function (event) {
        dialogSendyHelpers();
    });

    $('[data-action="expand-account"]').on('click', function (event) {
        var self = this;
        $(self).closest('.nav-item').find('.subnav').slideToggle();
    });

    // Events on Brand ID change
    $('#brand_id').on('change', function (event) {
        var brand_id = this.value;
        // Get Brand subscriber lists
        $.ajax({
            url     : '_ajax.php',
            type    : 'POST',
            dataType: 'json',
            data    :  {
                'get_lists' : 1,
                'brand_id' : brand_id
            },
            success : function( data ) {

                if ( data['type'] != 'success' ) {
                    // show error message
                    $('#subscribers-list-container').html(data['message']);
                }else{
                    // Update Lists
                    var lists = data['message']; // an array
                    var listsHTML = '';

                    if(lists instanceof Array ) {
                        $.each(lists, function (index, list) {
                            listsHTML += '<label><input class="list_ids" type="checkbox" name="list_ids[]" value="' + list.id + '">' + list.name + '</label>';
                        });
                    }else{
                        listsHTML = lists; // no subscribers list
                    }

                    $('#subscribers-list-container').html(listsHTML);

                }

            },
            error   : function( xhr, err ) {
                // Log errors if AJAX call is failed
                console.log(xhr);
                console.log(err);
            }
        });

        // Update From Name and From Email fields
        $.ajax({
            url     : '_ajax.php',
            type    : 'POST',
            dataType: 'json',
            data    :  {
                'get_brand_info' : 1,
                'brand_id' : brand_id
            },
            success : function( data ) {

                if ( data['type'] == 'success' ) {
                    var brand_info = data['message']; // an array
                    $('input[name=from_name]').val(brand_info.from_name);
                    $('input[name=from_email]').val(brand_info.from_email);
                    $('input[name=reply_to]').val(brand_info.reply_to);
                }
            },
            error   : function( xhr, err ) {
                // Log errors if AJAX call is failed
                console.log(xhr);
                console.log(err);
            }
        });
    });
});
