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
      },
      error: function(err){
        console.log(err);
      }
    })
  })
});
