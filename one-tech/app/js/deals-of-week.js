class DealsOfWeek {
  constructor(dataURL) {
    this.productData = null;
    this.productLength = 0;
    this.templateData = {};
    this.pageSize = 1;
    this.initialPageSize = 1; 
    this.currentProduct = -1;
    if(dataURL) {
        this.loadData();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "card-component.html", true);
        xhr.responseType = 'text';
        xhr.send();
        xhr.onload = function() {
            if(xhr.status === 200) {
                this.templateData.cardContent = xhr.responseText;
            }
        }.bind(this);
      }
  }

  loadData() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "data/deals-of-week.json", true);
    xhr.responseType = 'text';
    xhr.send();

    xhr.onload = function() {
        if(xhr.status === 200) {
            this.productData = JSON.parse(xhr.responseText);
            this.productLength = this.productData.length;
        }
    }.bind(this);
  }

  renderCard(productObj) {
    if(!productObj) //
        return;

    var productImg_ = productObj.img;
    var productCat_ = productObj.cat;
    var productPrice_ = productObj.price;
    var productBrand_ = productObj.brand;
    var productDis_ = productObj.discountedPrice;
    var productAvail_ = productObj.available;
    var productSold_ = productObj.sold;
    var productOffer_ = productObj.offerExpires;


    var template_ = this.templateData.cardContent.replace(/\{\{PRODUCTIMAGE\}\}/g, productImg_)
                .replace(/\{\{PRODUCTCAT\}\}/g, productCat_)
                .replace(/\{\{PRODUCTPRICE\}\}/g, productPrice_)
                .replace(/\{\{PRODUCTBRAND\}\}/g, productBrand_)
                .replace(/\{\{PRODUCTDIS\}\}/g, productDis_)
                .replace(/\{\{PRODUCTAVAIL\}\}/g, productAvail_)
                .replace(/\{\{PRODUCTSOLD\}\}/g, productSold_)
                .replace(/\{\{PRODUCTDATE\}\}/g, productOffer_);

    return template_;

  }

  calcPageRange() {
        var start_, end_;
        if(this.currentProduct === -1) {
            start_ = 0;
            end_ = this.initialPageSize;
            this.currentProduct = end_;
        } else {
            start_ = this.currentProduct;
            end_ = start_ + this.pageSize;
            this.currentProduct = end_;
            if(this.productLength === this.currentProduct) {
                document.getElementById("loadMore").style.display="none";
            }
        }

        return {
            start: start_,
            end: end_
        };
  }

  paginate() {
    var pageRange = this.calcPageRange();

    var thisPage = [];

    for(var i = pageRange.start; i < pageRange.end; i++) {
        thisPage.push(this.productData[i]);
    }

    return thisPage;
  }

  renderPage() {
    var productsToRender = this.paginate();
    var container = document.getElementById('parentProduct-card'); 
    var docFrag = document.createDocumentFragment();
    
    for(var i = 0; i < productsToRender.length; i++) {
      var thisCard = document.createElement("div");
      thisCard.innerHTML = this.renderCard(productsToRender[i]);
      docFrag.appendChild(thisCard.firstChild);
      container.appendChild(docFrag);    
    }
  }
}


var dealsOfWeek = new DealsOfWeek("../data/deals-of-week.json");

window.onload = function() {
    dealsOfWeek.renderPage();
};