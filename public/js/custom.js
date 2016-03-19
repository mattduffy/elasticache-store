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
});

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
