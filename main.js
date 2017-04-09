$.ajax({
    url: 'http://localhost:3000/PurchaseOrders',
    xhrFields: {}
}).done(function( data ) {

    var firstN = 10;

    var revenues = _.map(_.flatten(_.map(data, function(stores){
        return stores.products;
    })), function(product){
        return _.extend(product, {
            revenue: product.order_count * (product.vendor_price.value / product.vendor_price.scale)
        });
    });

    // get a list of the unique products in order to merge revenues of dups
    var unique = _.uniqBy(revenues, 'name');

    // merge the revenues of the duplicate products, note: other fields are not updated
    var mappedUnique = _.map(unique, function(uniq){
        var copies = _.filter(revenues, { 'name': uniq.name });
        var revenueSums = _.sumBy(copies, function(allProducts) { return allProducts.revenue; });
        // we are overwriting the old revenue properties
        return _.extend(uniq, {revenue: revenueSums});
    });

    // sort the list by revenue, high to low
    var sorted = _.orderBy(mappedUnique, ['revenue'], ['desc']);

    // return the first N values as specified in the input parameters
    if (typeof firstN === 'number' && firstN <= sorted.length) {
        sorted =  sorted.slice(0, firstN);
    }

    for (var i = 0; i < sorted.length; i++) {
        var revenue = '$' + sorted[i].revenue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        var name = sorted[i].name;
        $("#salesList").append('<li class="vAlignParent"> <span class="circle">' + (i+1) + '</span> <div class="vAlign"> <div class="title">' + name +'</div> <div class="subTitle">' + revenue + '</div> </div> </li>');
    }

});