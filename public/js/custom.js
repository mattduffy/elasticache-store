$(function(){

  $('#search').keyup(function(e){
    var search_term = $(this).val();
    $.ajax({
      method: 'POST',
      url: '/api/search',
      data: { search_term },
      dataType: 'json',
      success: function(json){
        var data = json.hits.hits.map((hit)=>{
          return hit;
        });
        console.log(data);
        var originalContent = $('#searchResults').html();
        $('#searchResults').empty();
        var html = '';
        for(var i=0; i<data.length; i++){
          html += '<div class="col-md-4">';
          html += '<a href="/product/'+ data[i]._id +'">';
          html += '<div class="thumbnail">';
          html += '<img src='+ data[i]._source.image +'>';
          html += '<div class="caption">';
          html += '<h3>'+ data[i]._source.name +'</h3>';
          html += '<p>' + data[i]._source.category.name +'</p>';
          html += '<p>$' + data[i]._source.price +'</p>';
          html += '</div></div></a></div>';
        }
        $('#searchResults').append(html);
      },
      error: function(err){
        console.log(err);
      }
    })
  })

  // Update item quantities in shopping cart
  $(document).on('click', '#plus', function(e){
    e.preventDefault();
    var priceValue = parseFloat($('#priceValue').val());
    var quantity = parseInt($('#quantity').val());
    priceValue += parseFloat($('#priceHidden').val());
    quantity += 1;
    $('#quantity').val(quantity);
    $('#priceValue').val(parseFloat(priceValue).toFixed(2));
    $('#total').html(quantity);
  });
  $(document).on('click', '#minus', function(e){
    e.preventDefault();
    var quantity = parseInt($('#quantity').val());
    if(1 == quantity) {
      console.log("can't order negative number of product");
      return;
    }
    var priceValue = parseFloat($('#priceValue').val());
    priceValue -= parseFloat($('#priceHidden').val());
    quantity -= 1;
    $('#quantity').val(quantity);
    $('#priceValue').val(parseFloat(priceValue).toFixed(2));
    $('#total').html(quantity);
  });

  // Stripe custom payment form cvCode// Stripe payement scripts
    $('#payment-form').submit(function(event) {
      var $form = $(this);

      // Disable the submit button to prevent repeated clicks
      $form.find('button').prop('disabled', true);

      Stripe.card.createToken($form, stripeResponseHandler);

      // Prevent the form from submitting with the default action
      return false;
    });

  function stripeResponseHandler(status, response) {
    var $form = $('#payment-form');

    if (response.error) {
      // Show the errors on the form
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    } else {
      // response contains id and card, which contains additional card details
      var token = response.id;
      // Insert the token into the form so it gets submitted to the server
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
      // and submit
      $form.get(0).submit();
    }
  };

  //var $form = $('#payment-form');
  //$form.on('submit', payWithStripe);

  /* If you're using Stripe for payments */
  // function payWithStripe(e) {
  //     e.preventDefault();
  //
  //     /* Visual feedback */
  //     $form.find('[type=submit]').html('Validating <i class="fa fa-spinner fa-pulse"></i>');
  //
  //     var PublishableKey = 'pk_test_TxRnauTMocqLmGm2KSakml7N'; // Replace with your API publishable key
  //     Stripe.setPublishableKey(PublishableKey);
  //     //Stripe.card.createToken($form, function stripeResponseHandler(status, response) {
  //     Stripe.card.createToken($form, function stripeResponseHandler(status, response) {
  //         console.log("createToken res: ", response);
  //         if (response.error) {
  //             /* Visual feedback */
  //             $form.find('[type=submit]').html('Try again');
  //             /* Show Stripe errors on the form */
  //             $form.find('.payment-errors').text(response.error.message);
  //             $form.find('.payment-errors').closest('.row').show();
  //         } else {
  //             /* Visual feedback */
  //             $form.find('[type=submit]').html('Processing <i class="fa fa-spinner fa-pulse"></i>');
  //             /* Hide Stripe errors on the form */
  //             $form.find('.payment-errors').closest('.row').hide();
  //             $form.find('.payment-errors').text("");
  //             // response contains id and card, which contains additional card details
  //             var token = response.id;
  //             console.log(token);
  //             // AJAX
  //             $.post('/account/stripe_card_token', {
  //             //$.post('/payment', {
  //                     token: token,
  //                     stripeToken: token,
  //                     stripeMoney: $form.find('input[name="stripeMoney"][type="hidden"]').val()
  //                 })
  //                 // Assign handlers immediately after making the request,
  //                 .done(function(data, textStatus, jqXHR) {
  //                     $form.find('[type=submit]').html('Payment successful <i class="fa fa-check"></i>').prop('disabled', true);
  //                 })
  //                 .fail(function(jqXHR, textStatus, errorThrown) {
  //                   console.log("fail: ", errorThrown);
  //                   console.log('stripe error: ', textStatus);
  //                     $form.find('[type=submit]').html('There was a problem').removeClass('success').addClass('error');
  //                     /* Show Stripe errors on the form */
  //                     $form.find('.payment-errors').text('Try refreshing the page and trying again.');
  //                     $form.find('.payment-errors').closest('.row').show();
  //                 });
  //         }
  //     });
  // }

  // /* Form validation */
  // jQuery.validator.addMethod("month", function(value, element) {
  //   return this.optional(element) || /^(01|02|03|04|05|06|07|08|09|10|11|12)$/.test(value);
  // }, "Please specify a valid 2-digit month.");
  //
  // jQuery.validator.addMethod("year", function(value, element) {
  //   return this.optional(element) || /^[0-9]{2}$/.test(value);
  // }, "Please specify a valid 2-digit year.");
  //
  // validator = $form.validate({
  //     rules: {
  //         cardNumber: {
  //             required: true,
  //             creditcard: true,
  //             digits: true
  //         },
  //         expMonth: {
  //             required: true,
  //             month: true
  //         },
  //         expYear: {
  //             required: true,
  //             year: true
  //         },
  //         cvCode: {
  //             required: true,
  //             digits: true
  //         }
  //     },
  //     highlight: function(element) {
  //         $(element).closest('.form-control').removeClass('success').addClass('error');
  //     },
  //     unhighlight: function(element) {
  //         $(element).closest('.form-control').removeClass('error').addClass('success');
  //     },
  //     errorPlacement: function(error, element) {
  //         $(element).closest('.form-group').append(error);
  //     }
  // });
  //
  // paymentFormReady = function() {
  //     if ($form.find('[name=cardNumber]').hasClass("success") &&
  //         $form.find('[name=expMonth]').hasClass("success") &&
  //         $form.find('[name=expYear]').hasClass("success") &&
  //         $form.find('[name=cvCode]').val().length > 1) {
  //         return true;
  //     } else {
  //         return false;
  //     }
  // }
  //
  // $form.find('[type=submit]').prop('disabled', true);
  // var readyInterval = setInterval(function() {
  //     if (paymentFormReady()) {
  //         $form.find('[type=submit]').prop('disabled', false);
  //         clearInterval(readyInterval);
  //     }
  // }, 250);


});
