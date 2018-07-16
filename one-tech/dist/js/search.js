class Coza {
    constructor(dataURL) {
        this.minCharacterCount = 3;// minimum number of characters after which the search functionality should work
        this.productData = null; // will contain json data
        this.templateData = {}; // html template
        this.productLength = 0; // size of the JSON data
        this.pageSize = 4; // number of products to be shown once load more is clicked
        this.initialPageSize = 12; // initial number of products to be shown
        this.currentProduct = -1; // check for if initial render page should happen
        this.loadMoreCalled = false; // to check if load more has been clicked

        if(dataURL) {
            var that = this;
            this.ajax({
                httpMethod: 'GET',
                url: dataURL,
                type: 'json'
            }).then(function(data) {
                    /*console.log(data);*/
                that.productData = (data instanceof Array) ? data : JSON.parse(data);
                that.productLength = that.productData.length;
                    /*console.log(that.productData);
                    console.log(that.productLength);*/
            });     // promise function for doing an AJAX call to the JSON data
            
            this.ajax({
                httpMethod: 'GET',
                url: 'search-result.html'
            }).then(function(data) {
                that.templateData.productContent = data;
                /*console.log(data);*/
            }); // promise function for doing an AJAX call to the JSON data
        }
    }
    
    /*
    a common ajax layer for all the files to be prepared
    */
    ajax(settings) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.open(settings.httpMethod, settings.url, true);
            xhr.responseType = settings.type || 'text';

            xhr.onload = function() {
                if(xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(new Error(xhr.statusText));
                }
            };
            
            xhr.onerror = function() {
                reject(new Error("Error fetching URL: " + settings.url));
            }
            
            xhr.send();
        });
    }

    /*
        // Renders one card
        // Grab the product card template
        // replace the values from JSON
        // return the HTML DOM object
    */
    renderCard(productObj) {
        /*console.log(productObj);*/
        if(!productObj) //
            return;
        /*console.log(productObj);*/ // gets a single data object from json 

        //getting relevant fields form json
        var productId_ = productObj.id;
        /*console.log(productName_);*/
        var productCode_ = productObj.code;
        /*console.log(productImage_);*/
        var productBrand_ = productObj.brand;
        var productPrice_ = productObj.unitPrice;
        var productActive_ = productObj.active;
        var productQuantity_ = productObj.quantity;
        var productCat_ = productObj.categoryId;
        var productSupplier_ = productObj.supplierId;
        var productSold_ = productObj.purchases;
        var productViews_ = productObj.views;
        /*console.log(productPrice_);*/

        //replacing template data from JSON data
        //Process template and replace the placeholders with appropriate data

        var template_ = this.templateData.productContent.replace(/\{\{PRODUCT_ID\}\}/g, productId_)
        .replace(/\{\{PRODUCT_CODE\}\}/g, productCode_)
        .replace(/\{\{PRODUCT_ACTIVE\}\}/g, productActive_)
        .replace(/\{\{PRODUCT_PRICE\}\}/g, productPrice_)
        .replace(/\{\{PRODUCT_BRAND\}\}/g, productBrand_)
        .replace(/\{\{PRODUCT_QUANTITY\}\}/g, productQuantity_)
        .replace(/\{\{PRODUCT_CATEGORY\}\}/g, productCat_)
        .replace(/\{\{PRODUCT_SUPPLIER\}\}/g, productSupplier_)
        .replace(/\{\{PRODUCT_SOLD\}\}/g, productSold_)
        .replace(/\{\{PRODUCT_VIEWS\}\}/g, productViews_);
        
        
        // returns the HTML DOM object
        /* console.log(template_)*/
        return template_;
    }
    
    /*
        // Calculate the range
        // update this.currentProduct
        // update this.loadMoreCalled 
        // set the display style for load more button
        // return the range 
    */
    calcPageRange() {
        var start_;
        var end_;
        
        if(this.currentProduct === -1) {
            start_ = 0;
            end_ = this.initialPageSize;
            this.currentProduct = end_;
        }
        else {
            start_ = this.currentProduct;
            end_ = start_ + this.pageSize;
            this.currentProduct = end_;
            this.loadMoreCalled = true;
            /*console.log(this.productLength);
            console.log(this.currentProduct);*/
        }

        return {
            start: start_,
            end: end_
        }
    }
    
    /*
        //get the page range 
        //push the initial productData
        //return the array formed
    */
    paginate() {
        var pageRange = this.calcPageRange();
        var thisPage = [];

        for(var i = pageRange.start; i < pageRange.end; i++) {
            thisPage.push(this.productData[i]);
        }
        
        /*console.log(thisPage);*/
        return thisPage;
    }

    /*
        // call the paginate function to get the relevant data
        // get the id of the parent container
        // check if load more button has been clicked
        // clear the parent container
        // create a document fragment
        // append the product cards to the document fragment
        // append the document fragment to the parent container
    */
    renderPage() {
        var productsToRender = this.paginate();
        var container = document.getElementById('parent-data'); // the parent container
        var docFrag = document.createDocumentFragment(); // created so that we dont directly manipulate the DOM
        /*console.log(productsToRender);*/
        
        if(!(this.loadMoreCalled)) {
            /*console.log("cleared");*/
            while(container.firstChild)
                  container.firstChild.remove();
        }
        
        for(var i=0; i<productsToRender.length; i++) {
            var thisCard = document.createElement("table");
            thisCard.classList.add("table");
            thisCard.innerHTML = this.renderCard(productsToRender[i]);
            docFrag.appendChild(thisCard); // acts as virtual DOM
        }

        /*console.log(docFrag);*/
        container.appendChild(docFrag);
        /*console.log(this.currentProduct);*/
    }
    
    /*
        //gets the filtered products
        // get the id of the parent container
        // clear the parent container
        // create a document fragment
        // append the product cards to the document fragment
        // append the document fragment to the parent container
    */
    searchRenderPage(filteredProducts) {
        console.log("search render page");
        var container = document.getElementById('parent-data'); // the result container
        var docFrag = document.createDocumentFragment();
            
        while(container.firstChild)
            container.firstChild.remove();

        for(var i=0; i<filteredProducts.length; i++) {
            var thisCard = document.createElement("table");
            thisCard.innerHTML = this.renderCard(filteredProducts[i]);
            docFrag.appendChild(thisCard); // acts as virtual DOM
        }

        /*console.log(docFrag);*/
        container.appendChild(docFrag);
    }
    
    /*
        // get the relevant criteria
        // push the relevant data from JSON into a temporary array
        // get the unique data into another array
        // call searchRenderPage()
    */
    filterProduct(criteria) {
        console.log("filter product");
        var tempFilteredData = [];
        var distinct = [];
        var distIdArray = [];
        /*console.error(criteria);*/
        
        for(var i=0; i < this.productData.length; i++) {
            for(var k in criteria) {
                if(this.productData[i].hasOwnProperty(k)) {
                    var regEx = new RegExp(criteria[k], 'gi');

                    if(this.productData[i].brand.match(regEx)) { 
                        tempFilteredData.push(this.productData[i]);
                    }
                   
                }
            }
        }
        console.log(tempFilteredData);
        for (var i = 0; i < tempFilteredData.length; i++) {
            if (distIdArray.indexOf(tempFilteredData[i].id) < 0 ) {
                distIdArray.push(tempFilteredData[i].id);
                distinct.push(tempFilteredData[i]);
            }
        }
        
        console.log(distinct);
        this.searchRenderPage(distinct);
    }
    
    /*
        // get the keyword from the input search box
        // set the properties of the search criteria
        // call filterProduct()
    */
    searchProduct(keyword) {
        console.log("search product");
        /*console.log(keyword);*/
        var searchCriteria = {
            "id": keyword,
            "code": keyword,
            "brand": keyword
        };
        
        console.log(searchCriteria);
        this.filterProduct(searchCriteria);
    }
    /*
        // get the value from the input search field
        // calculate the length of the input
        // define a check for the minimum character count
        // call the appropriate functions
        // reset the values
    */
    sendInputs(event) {
        console.log("send input");
        var searchInput = document.getElementById("search-products-input").value;
  //      var searchInputLength = document.getElementById("search-products-input").value.length;
        console.log(searchInput);
        this.searchProduct(searchInput);
    } 
}

/*
    // define the object of the class
*/
var obj = new Coza("../data/product.json");

/*
    // call the renderPage() on the load of the window
*/


/*
    // call the renderPage() on clicking the load more button
*/
/*
    // call the sendInputs() on the press of a key
*/
document.querySelector("#search-btn").addEventListener("click", function(event) {
    event.preventDefault();
    obj.sendInputs(event);
    }, false);
/*
    // navbar filtering
    // send the appropriate id
*/    


