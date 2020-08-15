// Override Settings
var bcSfFilterSettings = {
	general: {
		limit: bcSfFilterConfig.custom.products_per_page,
		/* Optional */
		loadProductFirst: true,
		numberFilterTree: 2,
		refineByStyle: 'style2',
      	sortingList: ['manual', 'price-ascending', 'price-descending', 'created-descending'],
      	activeScrollToTop: false,
      	showLoading: false,
      	paginationType: 'load_more',
      	paginationTypeAdvanced: false,
        showPlaceholderProductList: true,
        placeholderImageRatio: 1.4, //It is used for ratio of image area of Skeleton product item. (height / width)
        placeholderProductGridItemClass: 'prod_grid grid__item grid__item_12 grid-product small--one-half medium-up--one-quarter aos-init aos-animate',
        placeholderProductPerRow: 12
	},
    selector: {
      	//products: '#infiniteloop',
    }
};

var isFirstLoad = bcSfFilterSettings.general.loadProductFirst;
var numberQuickViewModalLoaded = 0;

// Declare Templates
var bcSfFilterTemplate = {
	// Grid Template
	'productGridItemHtml': '<div id="{{itemHandle}}" class="prod_grid grid__item grid__item_12 grid-product ' + bcSfFilterConfig.custom.grid_item_width + ' {{itemQuickShopClass}}" data-aos="row-of-' + bcSfFilterConfig.custom.products_per_row + '">' +
								'<div class="grid-product__content">' +
// 									'{{itemLabel}}' +
  									'<div class="wishlist_icon">{{itemWishlist}}</div>'+
									'<a href="{{itemUrl}}" class="grid-product__link {{itemSoldOutClass}}">' +
										'<div class="grid-product__image-mask">'+
											'{{itemQuickShopButton}}' +
											'{{itemImages}}'+
// 											'{{itemSwatchHoverImages}}' +
										'</div>' +
										'<div class="grid-product__meta">' +
  											'{{itemVendor}}' +
											'<div class="grid-product__title">{{itemTitle}}</div>' +
											'<div class="grid-product__price">{{itemPrice}}</div>' +
											'{{reviewHtml}}'+
										'</div>' +
									'</a>' +
								'</div>' +
								'{{itemSwatch}}'+
							'</div>',

	// Pagination Template
	'previousActiveHtml': '<span class="prev"><a href="{{itemUrl}}" title=""><svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-chevron-left" viewBox="0 0 284.49 498.98"><defs><style>.cls-1{fill:#231f20}</style></defs><path class="cls-1" d="M249.49 0a35 35 0 0 1 24.75 59.75L84.49 249.49l189.75 189.74a35.002 35.002 0 1 1-49.5 49.5L10.25 274.24a35 35 0 0 1 0-49.5L224.74 10.25A34.89 34.89 0 0 1 249.49 0z"></path></svg><span class="icon__fallback-text">Previous</span></a></span>',
	'previousDisabledHtml': '',
	'nextActiveHtml': '<span class="next"><a href="{{itemUrl}}" title=""><svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-chevron-right" viewBox="0 0 284.49 498.98"><defs><style>.cls-1{fill:#231f20}</style></defs><path class="cls-1" d="M35 498.98a35 35 0 0 1-24.75-59.75l189.74-189.74L10.25 59.75a35.002 35.002 0 0 1 49.5-49.5l214.49 214.49a35 35 0 0 1 0 49.5L59.75 488.73A34.89 34.89 0 0 1 35 498.98z"></path></svg><span class="icon__fallback-text">Next</span></a></span>',
	'nextDisabledHtml': '',
	'pageItemHtml': '<span class="page"><a href="{{itemUrl}}" title="">{{itemTitle}}</a></span>',
	'pageItemSelectedHtml': '<span class="page current">{{itemTitle}}</span>',
	'pageItemRemainHtml': '<span class="deco">...</span>',
	'paginateHtml': '{{previous}}{{pageItems}}{{next}}',

	// Sorting Template
	'sortingHtml': '<ul>{{sortingItems}}</ul>',
};

/************************** BUILD PRODUCT LIST **************************/

// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index, totalProduct) {
	/*** Prepare data ***/
	var images = data.images_info;
	 // Displaying price base on the policy of Shopify, have to multiple by 100
	var soldOut = !data.available; // Check a product is out of stock
	var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
	var priceVaries = data.price_min != data.price_max; // Check a product has many prices
	// Get First Variant (selected_or_first_available_variant)
	var firstVariant = data['variants'][0];
	if (getParam('variant') !== null && getParam('variant') != '') {
		var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
		if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
	} else {
		for (var i = 0; i < data['variants'].length; i++) {
			if (data['variants'][i].available) {
				firstVariant = data['variants'][i];
				break;
			}
		}
	}
	/*** End Prepare data ***/

	// Get Template
	var itemHtml = bcSfFilterTemplate.productGridItemHtml;

	// Add Thumbnail
	var aspectRatio = images.length > 0 ? images[0]['width'] / images[0]['height'] : '';
	var paddingBottom = images.length > 0 ? 100 / aspectRatio : '100';
	var thumb = images.length > 0 ? images[0] : bcSfFilterConfig.general.no_image_url;
	var bgset = buildBgSet(thumb);
	var itemImagesHtml = '';
// 	if(bcSfFilterConfig.custom.product_grid_image_size == 'natural'){
// 		itemImagesHtml += '<div class="image-wrap" style="height: 0; padding-bottom: ' + paddingBottom + '%;">' +
// 							'<img ' +
// 								'class="grid-product__image lazyload" ' +
// 								'data-src="' + this.getFeaturedImage(images, '{width}x') + '" ' +
// 								'data-widths="[180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 2048]" ' +
// 								'data-aspectratio="' + aspectRatio + '" ' +
// 								'data-sizes="auto" ' +
// 								'alt="{{itemTitle}}">' +
// 						'</div>';
// 	} else {
// 		itemImagesHtml += '<div ' +
// 							  'class="grid__image-ratio grid__image-ratio--' + bcSfFilterConfig.custom.product_grid_image_size + ' lazyload"' +
// 							  'data-bgset="' + bgset +'"' +
// 							  'data-sizes="auto">' +
// 						  '</div>';
// 	}

// 	if (!soldOut) {
// 		if (bcSfFilterConfig.custom.product_hover_image && images.length > 1) {
// 			bgset = buildBgSet(images[1]);
// 			itemImagesHtml += '<div ' +
// 								'class="grid-product__secondary-image small--hide lazyload"' +
// 								'data-bgset="' + bgset + '"' +
// 								'data-sizes="auto">' +
// 							  '</div>';
// 		}
// 	}
  	itemImagesHtml += '<div class="image-wrap"><img class="grid-product__image" src="' + this.getFeaturedImage(images, '400x') + '" alt="{{itemTitle}}"></div>';

	itemHtml = itemHtml.replace(/{{itemImages}}/g, itemImagesHtml);

	// Add Price
	var itemPriceHtml = '';
	if (onSale) {
		itemPriceHtml += '<span class="visually-hidden">' + bcSfFilterConfig.label.regular_price + '</span>';
		itemPriceHtml += '<span class="grid-product__price--original">' + this.formatMoney(data.compare_at_price_min) + '</span>';
		itemPriceHtml += '<span class="visually-hidden">' + bcSfFilterConfig.label.sale_price + '</span>';
	}
// 	if (priceVaries) {
// 		itemPriceHtml += bcSfFilterConfig.label.from_text_html.replace(/{{ price }}/g, this.formatMoney(data.price_min));
// 	} else {
// 		itemPriceHtml += this.formatMoney(data.price_min);
// 	}
  	itemPriceHtml += this.formatMoney(data.price_min);
	if (onSale && bcSfFilterConfig.custom.product_save_amount){
		var savePrice = '';
		if (bcSfFilterConfig.custom.product_save_type == 'dollar'){
			savePrice = this.formatMoney(data.compare_at_price_min - data.price_min);
		} else {
			savePrice = Math.round((data.compare_at_price_min - data.price_min) * 100 / data.compare_at_price_min);
			savePrice += '%';
		}
		var savePriceText = bcSfFilterConfig.label.save_html.replace(/{{ saved_amount }}/g, savePrice);;
		itemPriceHtml += '<span class="grid-product__price--savings">' + savePriceText + '</span>';
	}
	itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

	// Add soldOut class
	var itemSoldOutClass = soldOut ? 'grid-product__link--disabled' : '';
	itemHtml = itemHtml.replace(/{{itemSoldOutClass}}/g, itemSoldOutClass);

	// Add label
	var customLabel = '';
	data.tags.forEach(function(tag){
		if (tag.startsWith('_label_')) {
			if (!customLabel) {
				customLabel = tag.replace('_label_', '');
			}			
		}
	});
	var itemLabelHtml = '';
	if (customLabel){
		itemLabelHtml = '<div class="grid-product__tag grid-product__tag--custom">' + customLabel + '</div>';
	} else {
		// soldOut Label
		if (soldOut){
			itemLabelHtml = '<div class="grid-product__tag grid-product__tag--sold-out">' + bcSfFilterConfig.label.sold_out + '</div>';
		} else if (onSale){
			itemLabelHtml = '<div class="grid-product__tag grid-product__tag--sale">' + bcSfFilterConfig.label.sale + '</div>';
		}	
	}
	itemHtml = itemHtml.replace(/{{itemLabel}}/g, itemLabelHtml);

	// Add Vendor
	var itemVendorHtml = bcSfFilterConfig.custom.vendor_enable ? '<div class="grid-product__vendor">' + data.vendor + '</div>' : '';
	itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

	// Add Quick shop
	var itemQuickShopClass = '';
	var itemQuickShopButtonHtml = '';
	if (bcSfFilterConfig.custom.quick_shop_enable && !soldOut) {
		itemQuickShopClass = 'grid-product__has-quick-shop';
		itemQuickShopButtonHtml = '<div class="quick-product__btn js-modal-open-quick-modal-{{itemId}} small--hide ' + (isFirstLoad ? '' : 'bc-hide') + '" data-product-id="{{itemId}}">' +
										'<span class="quick-product__label">' + bcSfFilterConfig.label.quick_shop + '</span>' +
									'</div>';
	}
	itemHtml = itemHtml.replace(/{{itemQuickShopClass}}/g, itemQuickShopClass);
	itemHtml = itemHtml.replace(/{{itemQuickShopButton}}/g, itemQuickShopButtonHtml);

	// Review
	var reviewHtml = '';
	if(bcSfFilterConfig.custom.enable_product_reviews){
		reviewHtml = '<span class="shopify-product-reviews-badge" data-id="'+ data.id +'"></span>';
	}
	itemHtml = itemHtml.replace(/{{reviewHtml}}/g, reviewHtml);

	// Color swatch
	var swatchHtml = buildSwatch(data, this);
	itemHtml = itemHtml.replace(/{{itemSwatch}}/g, swatchHtml.itemSwatch);
	itemHtml = itemHtml.replace(/{{itemSwatchHoverImages}}/g, swatchHtml.itemSwatchHoverImages);
  
  	// Add ssw wishlist
    var itemWishlistHtml = '';
    if (bcSfFilterConfig.custom.customer_accounts_enabled) {
        var ssw_fave_enabled = bcSfFilterConfig.custom.fave_enabled;
        if (ssw_fave_enabled == 1) {
            itemWishlistHtml += '<div class="ssw-faveiticon sswfaveicon{{itemId}}">' +
                                    '<i data-product-id="{{itemId}}" data-count="0" class="ssw-icon-heart-o ssw-fave-icon ssw-wishlist-element ssw-not-synch"' +
                                    'title="' + bcSfFilterConfig.label.fave + '"' +
                                    'data-params=\'{"product_id":"{{itemId}}","event":"fave_button","page":"product_profile"}\'></i>' +
                                    '<span class="faves-count">...</span>' +
                                '</div>';
        }
    }
    itemHtml = itemHtml.replace(/{{itemWishlist}}/g, itemWishlistHtml);

	// Add main attribute (Always put at the end of this function)
	itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
	itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
	itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
	itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

	return itemHtml;
};

// Build Swatch
function buildSwatch(data, _this) {
	var itemSwatchHtml = '';
	var itemSwatchHoverImagesHtml = '';
	if (bcSfFilterConfig.custom.collection_color_swatches) {
		var swatchItems = [];
		var swatchHoverImages = [];
		data.options_with_values.forEach(function (option, index) {
			var option_name = option.name.toLowerCase();
			if (option_name.indexOf('color') != -1 || option_name.indexOf('colour') != -1) {
				var option_index = index;
				var values = [];
				data.variants.forEach(function (variant) {
					var value = variant.merged_options[option_index].split(':')[1];
					if (values.indexOf(value) == -1) {						
						values.push(value);
						var colorValueSlugify = _this.slugify(value);
						var colorImage = _this.optimizeImage(bcSfFilterMainConfig.general.asset_url.replace('bc-sf-filter.js', colorValueSlugify + '.png'), '50x');
						var variantImage =  _this.optimizeImage(variant.image, '400x');

						var swatchItem = '<a href="{{itemUrl}}?variant={{variantId}}" ' +
												'class="color-swatch color-swatch--small color-swatch--{{colorValueSlugify}} {{swatchClass}}" '+
												'data-variant-id="{{variantId}}" ' +
												'data-variant-image="{{variantImage}}" ' +
												'style="background-image: url({{colorImage}}); background-color: {{backgroundColor}};"> ' +
											'</a>';

						swatchItem = swatchItem.replace(/{{variantId}}/g, variant.id);
						swatchItem = swatchItem.replace(/{{colorValueSlugify}}/g, colorValueSlugify);
						swatchItem = swatchItem.replace(/{{swatchClass}}/g, variant.image ? 'color-swatch--with-image' : '');
						swatchItem = swatchItem.replace(/{{variantImage}}/g, variantImage);
						swatchItem = swatchItem.replace(/{{colorImage}}/g, colorImage);
						swatchItem = swatchItem.replace(/{{backgroundColor}}/g, colorValueSlugify.split('-').pop());					

						var swatchHoverImage = '<div class="grid-product__color-image grid-product__color-image--'+ variant.id +' small--hide"></div>';

						swatchItems.push(swatchItem);
						swatchHoverImages.push(swatchHoverImage);
					}
				});
			}
		});
		if (swatchItems.length > 1) {
			itemSwatchHtml = ' <div class="grid-product__colors grid-product__colors--{{itemId}}" >' + swatchItems.join('') + '</div>';
			itemSwatchHoverImagesHtml = swatchHoverImages.join('');
		}
	}
	return {
		itemSwatch: itemSwatchHtml,
		itemSwatchHoverImages: itemSwatchHoverImagesHtml
	};
}

function buildBgSet(image) {
	var html = '';
	if (typeof image !== 'undefined' && image.hasOwnProperty('src')) {
		var aspectRatio = image.width / image.height;
		if (image.width <= 180) html += bcsffilter.optimizeImage(image['src'], '180x') + ' 180w ' + Math.round(180 / aspectRatio) + 'h,';
		if (image.width > 180) html += bcsffilter.optimizeImage(image['src'], '180x') + ' 180w ' + Math.round(180 / aspectRatio) + 'h,';
		if (image.width > 360) html += bcsffilter.optimizeImage(image['src'], '360x') + ' 360w ' + Math.round(360 / aspectRatio) + 'h,';
		if (image.width > 540) html += bcsffilter.optimizeImage(image['src'], '540x') + ' 540w ' + Math.round(540 / aspectRatio) + 'h,';
		if (image.width > 720) html += bcsffilter.optimizeImage(image['src'], '720x') + ' 720w ' + Math.round(720 / aspectRatio) + 'h,';
		if (image.width > 900) html += bcsffilter.optimizeImage(image['src'], '900x') + ' 900w ' + Math.round(900 / aspectRatio) + 'h,';
		if (image.width > 1080) html += bcsffilter.optimizeImage(image['src'], '1080x') + ' 1080w ' + Math.round(1080 / aspectRatio) + 'h,';
		if (image.width > 1296) html += bcsffilter.optimizeImage(image['src'], '1296x') + ' 1296w ' + Math.round(1296 / aspectRatio) + 'h,';
		if (image.width > 1512) html += bcsffilter.optimizeImage(image['src'], '1512x') + ' 1512w ' + Math.round(1512 / aspectRatio) + 'h,';
		if (image.width > 1728) html += bcsffilter.optimizeImage(image['src'], '1728x') + ' 1728w ' + Math.round(1728 / aspectRatio) + 'h,';
	}
	return html;
}

/************************** END BUILD PRODUCT LIST **************************/

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
	if (this.getSettingValue('general.paginationType') == 'default') {
		// Get page info
		var currentPage = parseInt(this.queryParams.page);
		var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

		// If it has only one page, clear Pagination
		if (totalPage == 1) {
			jQ(this.selector.pagination).html('');
			return false;
		}

		if (this.getSettingValue('general.paginationType') == 'default') {
			var paginationHtml = bcSfFilterTemplate.paginateHtml;

			// Build Previous
			var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
			previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
			paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

			// Build Next
			var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml :  bcSfFilterTemplate.nextDisabledHtml;
			nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
			paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

			// Create page items array
			var beforeCurrentPageArr = [];
			for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
				beforeCurrentPageArr.unshift(iBefore);
			}
			if (currentPage - 4 > 0) {
				beforeCurrentPageArr.unshift('...');
			}
			if (currentPage - 4 >= 0) {
				beforeCurrentPageArr.unshift(1);
			}
			beforeCurrentPageArr.push(currentPage);

			var afterCurrentPageArr = [];
			for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
				afterCurrentPageArr.push(iAfter);
			}
			if (currentPage + 3 < totalPage) {
				afterCurrentPageArr.push('...');
			}
			if (currentPage + 3 <= totalPage) {
				afterCurrentPageArr.push(totalPage);
			}

			// Build page items
			var pageItemsHtml = '';
			var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
			for (var iPage = 0; iPage < pageArr.length; iPage++) {
				if (pageArr[iPage] == '...') {
					pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
				} else {
					pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
				}
				pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
				pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
			}
			paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

			paginationHtml = jQ.parseHTML(paginationHtml);
			jQ(this.selector.pagination).html(paginationHtml);
		}
	}
};

/************************** BUILD TOOLBAR **************************/

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
	if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
		jQ(this.selector.topSorting).html('');
		var sortingArr = this.getSortingList();
        sortingArr = {	

          "manual": "Recommended",
          "price-descending": "Price High – Low",
          "price-ascending": "Price Low – High",
          "created-descending": "Newest Arrivals",
        };
		if (sortingArr) {
			// Build content
			var sortingItemsHtml = '';
			for (var k in sortingArr) {
				sortingItemsHtml += '<li><a href="#sort" data-select="' + k +'">' + sortingArr[k] + '</a></li>';
			}
			var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
          	var htmlMobile = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
			html = jQ.parseHTML(html);
          	htmlMobile = jQ.parseHTML(htmlMobile);
			jQ(this.selector.topSorting).html(html);
          	jQ('#bc-sf-filter-top-sorting-mobile').html(htmlMobile);

			// Set current value
			jQ(this.selector.topSorting + ' a[data-select="' + this.queryParams.sort + '"]').parent().addClass('active');
          	jQ('#bc-sf-filter-top-sorting-mobile a[data-select="' + this.queryParams.sort + '"]').parent().addClass('active');
		}
	}
};

BCSfFilter.prototype.buildSortingEvent = function() {
  var self = this;
  jQ(self.getSelector('topSorting') + ' a').on('click', function(e) {
    e.preventDefault();
    var sort = jQ(this).data('select');
    jQ(self.getSelector('topSorting') + ' li').removeClass('active');
    jQ(this).parent().addClass('active');
    onInteractWithToolbar(e, 'sort', self.queryParams.sort, sort);
  });
  
  jQ('#bc-sf-filter-top-sorting-mobile a').on('click', function(e) {
    e.preventDefault();
    var sort = jQ(this).data('select');
    jQ('#bc-sf-filter-top-sorting-mobile li').removeClass('active');
    jQ(this).parent().addClass('active');
    onInteractWithToolbar(e, 'sort', self.queryParams.sort, sort);
  });
};

BCSfFilter.prototype.setDefaultParams = function(params) {
  var self = this;
  params.shop = params.hasOwnProperty('shop') ? params.shop : this.shopDomain;
  params.page = params.hasOwnProperty('page') ? parseInt(params.page) : 1;  

  // Products per page
  var settingLimit = this.getSettingValue('general.limit');
  if (this.getSettingValue('general.paginationType') == 'default' || this.getSettingValue('general.paginationTypeAdvanced')) {
    params.limit = params.hasOwnProperty('limit') ? params.limit : settingLimit;
  } else {
    params.limit = (params.hasOwnProperty('limit') ? params.limit : settingLimit) * params.page;
  }
  // Sorting
  if (this.isSearchPage()) this.defaultSorting = 'created-descending';
  params.sort = params.hasOwnProperty('sort') ? params.sort : this.defaultSorting;
  // Display type
  params.display = params.hasOwnProperty('display') ? params.display : this.getSettingValue('general.defaultDisplay');

  /**
   * Prepare the params for the third-party app
   */
  //params = self.setThirdPartyAppParams(params);

  return params;
};

/************************** END BUILD TOOLBAR **************************/

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data, eventType) {
  if (typeof DoublyGlobalCurrency !== 'undefined' && jQuery('[name=doubly-currencies]').length > 0) {
    DoublyGlobalCurrency.convertAll(jQuery('[name=doubly-currencies]').val());
  }
};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {
	
	// Build total products text
	var totalProductText = '';
	if (data.total_product == 1) {
		totalProductText = bcSfFilterConfig.label.items_with_count_one.replace(/{{ count }}/g, data.total_product);
	} else {
		totalProductText = bcSfFilterConfig.label.items_with_count_other.replace(/{{ count }}/g, data.total_product);
	}
	totalProductText = jQ.parseHTML(totalProductText);
	jQ('.bc-sf-filter-total-product').html(totalProductText);

	// Build filter button text on mobile
	var numSelectedFilter = jQ('#bc-sf-filter-tree .bc-sf-filter-selected-items .bc-sf-filter-option-label').length;
	var label = '';
	if (numSelectedFilter){
		label = jQ.parseHTML(bcSfFilterConfig.label.filter + ' (' + numSelectedFilter + ')');
		jQ('.js-drawer-open-collection-filters').addClass('btn--tertiary-active');
		jQ('.js-drawer-open-collection-filters > span').html(label);
	} else {
		label = jQ.parseHTML(bcSfFilterConfig.label.filter);
		jQ('.js-drawer-open-collection-filters').removeClass('btn--tertiary-active');
		jQ('.js-drawer-open-collection-filters > span').html(label);
	}

	// Call theme init function
	if (window.theme){
		theme.reinitSection('collection-template');
        AOS.refreshHard();

        // Setup page transition classes
        theme.pageTransitions();

        // Reload quick shop buttons
        theme.initQuickShop(true);

        // Reload products inside each quick shop
        sections.register('product-template', theme.Product);
		if (window.$ && typeof $ == 'function'){
			$(window).off('popstate');
	  	}
	}
	
	// Build quick view modals	
	var isReinitQuickview = !isFirstLoad || bcsffilter.isSearchPage() || bcsffilter.queryParams.hasOwnProperty('_');
	if (!this.isMobile() && bcSfFilterConfig.custom.quick_shop_enable && isReinitQuickview) {
		jQ('#bc-sf-quick-shop-modal-container').html('');

		data.products.forEach(function(product){
			var quickUrl = bcsffilter.buildProductItemUrl(product) + '?view=bc-sf-quickview';
			jQ.ajax({url: quickUrl, success: function(result) {
				numberQuickViewModalLoaded++;
				var result = jQ.parseHTML(result);
				jQ('#bc-sf-quick-shop-modal-container').append(result);
				if (numberQuickViewModalLoaded == data.products.length) {
					theme.reinitSection('collection-template');
                    AOS.refreshHard();

                    // Setup page transition classes
                    theme.pageTransitions();

                    // Reload quick shop buttons
                    theme.initQuickShop(true);

                    // Reload products inside each quick shop
                    sections.register('product-template', theme.Product);
					numberQuickViewModalLoaded = 0;
					jQ('.quick-product__btn').removeClass('bc-hide');
				}
			}});
		});		
	}

	if (isFirstLoad) {
		isFirstLoad = false;
	}
  
//   	if (this.isInfiniteLoadingPaginationType() || this.isLoadMorePaginationType()) {
//       	jQ('body').find('div.collection-filter').removeClass('collection-filter');
// 	}
	
	jQ('.js-drawer-open-collection-filters').on('click', function(){
		jQ('.' + self.class.filterOption).each(function() {
			var showMoreType = jQ(this).data('show-more-type');
			if (showMoreType && jQ(this).data('display-type') != 'range') {
				self.buildFilterShowMore(jQ(this).find('.' + self.class.filterBlockContent), showMoreType);
			}
		});
	});
};

BCSfFilter.prototype.afterBuildFilterTree = function(data, filterTreeId) {
    // Wrap all filter option blocks for styling
    jQ(this.getSelector('filterTree') + filterTreeId).children().wrapAll('<div id="bc-sf-filter-options-wrapper"></div>');
    // Box Style
    this.buildFilterOptionBoxStyle(null, filterTreeId);
    // Add scroll bar for block has long content, except the filter option which is range
    this.buildFilterShowMore();
  
  	var selectionOptions = jQ('#bc-sf-filter-tree').find('a.selected').length;
  	if (this.isMobile()) {
      if (selectionOptions > 0) {
        jQ('#bc-sf-filter-tree').parents('.filter_item').find('.filter__title span').html('FILTER BY (' + selectionOptions + ')');
        jQ('#bc-sf-filter-tree2').parents('.drawer__contents').find('.filter__title span').html('FILTER BY (' + selectionOptions + ')');
        jQ('#bc-sf-filter-tree2').parents('.drawer__contents').find('.filter__title .bc-sf-filter-clear-all').show();
      } else {
        jQ('#bc-sf-filter-tree').parents('.filter_item').find('.filter__title span').html('FILTER BY');
        jQ('#bc-sf-filter-tree2').parents('.drawer__contents').find('.filter__title span').html('FILTER BY');
        jQ('#bc-sf-filter-tree2').parents('.drawer__contents').find('.filter__title .bc-sf-filter-clear-all').hide();
      }
    } else {
      if (selectionOptions > 0) {
        jQ('#bc-sf-filter-tree').parents('.filter_item').find('.filter__title span').html('FILTER BY (' + selectionOptions + ')');
        jQ('#bc-sf-filter-tree').parents('.filter_item').find('.filter__title .bc-sf-filter-clear-all').show();
      } else {
        jQ('#bc-sf-filter-tree').parents('.filter_item').find('.filter__title span').html('FILTER BY');
        jQ('#bc-sf-filter-tree').parents('.filter_item').find('.filter__title .bc-sf-filter-clear-all').hide();
      }
    }
  	
  
  	jQ('#bc-sf-filter-tree, #bc-sf-filter-tree2').find('.bc-sf-filter-option-block').each(function(){
      var $this = jQ(this);
      var options = $this.find('a.selected').length;
      if (options > 0) {
        $this.find('.bc-sf-filter-block-title h3 span').html($this.data('title') + ' (' + options + ')');
      } else {
        $this.find('.bc-sf-filter-block-title h3 span').html($this.data('title'));
      }
    });
    // Collapse all filter options by default
    if (!this.checkIsFullWidthMobile()) this.collapseFilterOption();

    // Hide filter tree and fix the product list style when the filter has no data
    this.buildFilterTreeStyleNoFilterData(data, filterTreeId);
};

// Build Default layout
BCSfFilter.prototype.buildDefaultElements=function(){var isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,isSafari=/Safari/.test(navigator.userAgent),isBackButton=window.performance&&window.performance.navigation&&2==window.performance.navigation.type;if(!(isiOS&&isSafari&&isBackButton)){var self=this,url=window.location.href.split("?")[0],searchQuery=self.isSearchPage()&&self.queryParams.hasOwnProperty("q")?"&q="+self.queryParams.q:"";window.location.replace(url+"?view=bc-original"+searchQuery)}};

function customizeJsonProductData(data) {for (var i = 0; i < data.variants.length; i++) {var variant = data.variants[i];var featureImage = data.images.filter(function(e) {return e.src == variant.image;});if (featureImage.length > 0) {variant.featured_image = {"id": featureImage[0]['id'],"product_id": data.id,"position": featureImage[0]['position'],"created_at": "","updated_at": "","alt": null,"width": featureImage[0]['width'], "height": featureImage[0]['height'], "src": featureImage[0]['src'], "variant_ids": [variant.id]}} else {variant.featured_image = '';};};var self = bcsffilter;var itemJson = {"id": data.id,"title": data.title,"handle": data.handle,"vendor": data.vendor,"variants": data.variants,"url": self.buildProductItemUrl(data),"options_with_values": data.options_with_values,"images": data.images,"images_info": data.images_info,"available": data.available,"price_min": data.price_min,"price_max": data.price_max,"compare_at_price_min": data.compare_at_price_min,"compare_at_price_max": data.compare_at_price_max};return itemJson;};
BCSfFilter.prototype.prepareProductData=function(data){var self=this;var countData=data.length;for(var k=0;k<countData;k++){data[k]["images"]=data[k]["images_info"];if(data[k]["images"].length>0){data[k]["featured_image"]=data[k]["images"][0]}else{data[k]["featured_image"]={src:bcSfFilterConfig.general.no_image_url,width:"",height:"",aspect_ratio:0}}data[k]["url"]="/products/"+data[k].handle;var optionsArr=[];var countOptionsWithValues=data[k]["options_with_values"].length;for(var i=0;i<countOptionsWithValues;i++){optionsArr.push(data[k]["options_with_values"][i]["name"])}data[k]["options"]=optionsArr;var firstVariant=data[k]["variants"][0];var isRoundedPrice=true;if(firstVariant.hasOwnProperty("fulfillment_service")&&firstVariant.fulfillment_service=="gift_card"){isRoundedPrice=false}if(typeof self.convertPriceBasedOnActiveCurrency!=="undefined"){data[k].price_min=self.convertPriceBasedOnActiveCurrency(data[k].price_min,isRoundedPrice);data[k].price_max=self.convertPriceBasedOnActiveCurrency(data[k].price_max,isRoundedPrice);data[k].compare_at_price_min=self.convertPriceBasedOnActiveCurrency(data[k].compare_at_price_min,isRoundedPrice);data[k].compare_at_price_max=self.convertPriceBasedOnActiveCurrency(data[k].compare_at_price_max,isRoundedPrice)}data[k]["price_min"]*=100,data[k]["price_max"]*=100;if(data[k]["compare_at_price_min"]!=null){data[k]["compare_at_price_min"]*=100}if(data[k]["compare_at_price_max"]!=null){data[k]["compare_at_price_max"]*=100}data[k]["price"]=data[k]["price_min"];data[k]["compare_at_price"]=data[k]["compare_at_price_min"];data[k]["price_varies"]=data[k]["price_min"]!=data[k]["price_max"];if(getParam("variant")!==null&&getParam("variant")!=""){var paramVariant=data[k]["variants"].filter(function(e){return e.id==getParam("variant")});if(typeof paramVariant[0]!=="undefined")firstVariant=paramVariant[0]}else{var countVariants=data[k]["variants"].length;for(var i=0;i<countVariants;i++){if(data[k]["variants"][i].available){firstVariant=data[k]["variants"][i];break}}}data[k]["selected_or_first_available_variant"]=firstVariant;var countVariants=data[k]["variants"].length;for(var i=0;i<countVariants;i++){var variantOptionArr=[];var count=1;var variant=data[k]["variants"][i];var variantOptions=variant["merged_options"];if(Array.isArray(variantOptions)){var countVariantOptions=variantOptions.length;for(var j=0;j<countVariantOptions;j++){var temp=variantOptions[j].split(":");data[k]["variants"][i]["option"+(parseInt(j)+1)]=temp[1];data[k]["variants"][i]["option_"+temp[0]]=temp[1];variantOptionArr.push(temp[1])}data[k]["variants"][i]["options"]=variantOptionArr}if(data[k]["variants"][i]["compare_at_price"]!=null){var variantCompareAtPrice=parseFloat(data[k]["variants"][i]["compare_at_price"]);if(typeof self.convertPriceBasedOnActiveCurrency!=="undefined"){variantCompareAtPrice=self.convertPriceBasedOnActiveCurrency(variantCompareAtPrice,isRoundedPrice)}data[k]["variants"][i]["compare_at_price"]=variantCompareAtPrice*100}var variantPrice=parseFloat(data[k]["variants"][i]["price"]);if(typeof self.convertPriceBasedOnActiveCurrency!=="undefined"){variantPrice=self.convertPriceBasedOnActiveCurrency(variantPrice,isRoundedPrice)}data[k]["variants"][i]["price"]=variantPrice*100}data[k]["description"]=data[k]["content"]=data[k]["body_html"];if(data[k].hasOwnProperty("original_tags")&&data[k]["original_tags"].length>0){data[k]["tags"]=data[k]["original_tags"].slice(0)}data[k]["json"]=customizeJsonProductData(data[k])}return data};

BCSfFilter.prototype.buildToggleEvent = function(data) {
    var self = this;
    var openListClass = this.class.filterOptionOpenList,
        closeListClass = this.class.filterOptionCloseList,
        filterOptionClass = this.class.filterOption;
  	var openList = jQ('.' + openListClass).length > 0 ? (jQ('.' + openListClass).val() == '') ? [] : jQ('.' + openListClass).val().split(',') : [];
    var closeList = jQ('.' + closeListClass).length > 0 ? (jQ('.' + closeListClass).val() == '') ? [] : jQ('.' + closeListClass).val().split(',') : [];
  	var originalCloseList = closeList;

    // Fix collapse/expand function for ADA
    jQ('.' + this.class.filterBlockTitle + ' h3').on('keypress', function(event) {
        if (event.keyCode == 13) {
			jQ(this).trigger('click');
        }
    })

    jQ('.' + this.class.filterBlockTitle + ' h3').on('click', function(e) {
        e.preventDefault();
        var filterOptionId = jQ(this).closest('.' + filterOptionClass).attr('data-id');
        // Open state
        if (jQ(this).children().hasClass('up')) {
          
            if (openList.length > 0 && openList[0] != '') {
              	if (self.isMobile()) {
                  	jQ('#bc-sf-filter-tree2 .' + self.class.filterOption + '[data-id="' + openList[0] + '"]').find('h3').trigger('click');
                } else {
                  	jQ('#bc-sf-filter-tree .' + self.class.filterOption + '[data-id="' + openList[0] + '"]').find('h3').trigger('click');
                }
              	
            }
            if (self.getSettingValue('general.keepToggleState')) {
                if (openList.length > 0 && openList[0] != '') {
                    closeList = closeList.concat(openList);
                    openList = [];
                }
                openList.push(filterOptionId);
                if (closeList.length > 0 && closeList.indexOf(filterOptionId) > -1) {
                    closeList.splice(closeList.indexOf(filterOptionId), 1);
                }
            }
            jQ(this).children().removeClass('up');
          	jQ(this).attr('aria-expanded', 'true');
            jQ(this).parent().siblings().slideDown(function() {
                if (jQ(this).parent().attr('data-display-type') != 'range') {
                    self.buildFilterOptionBoxStyle(jQ(this));
                    self.buildFilterScrollbar(this);
                }
            });
        }
        // Collapse state
        else {
            if (self.getSettingValue('general.keepToggleState')) {
                closeList.push(filterOptionId);
                if (openList.length > 0 && openList.indexOf(filterOptionId) > -1) {
                    openList.splice(openList.indexOf(filterOptionId), 1);
                }
            }
            jQ(this).children().addClass('up');
          	jQ(this).attr('aria-expanded', 'false');
            jQ(this).parent().siblings().slideUp();
        }
        jQ('.' + openListClass).val(openList.join(','));
        jQ('.' + closeListClass).val(closeList.join(','));
    });

    if (this.getSettingValue('general.collapseSubCategory')) {
        jQ('.' + this.class.filterOption + '.bc-sf-filter-option-block-sub_category .bc-sf-filter-option-single-list li span.sub-icon').on('click', function(e) {
            if (jQ(this).hasClass('sub-up')) {
                jQ(this).removeClass('sub-up');
              	jQ(this).attr('aria-expanded', 'true');
                jQ(this).parent().siblings().slideDown();
            } else {
                jQ(this).addClass('sub-up');
              	jQ(this).attr('aria-expanded', 'false');
                jQ(this).parent().siblings().slideUp();
            }
        });
    }
};

BCSfFilter.prototype.prepareFilterParams = function(params, eventType) {
    // Get collection id
    if (!this.queryParams.hasOwnProperty('collection_scope')) {
        if (!this.isSearchPage()) {
            params.collection_scope = parseInt(this.collectionId);
            if (eventType == 'history') {
                var historyData = History.getState().data;
                if (historyData.hasOwnProperty('param') && historyData.param.hasOwnProperty('collection_scope')) {
                    params.collection_scope = this.collectionId = parseInt(historyData.param.collection_scope);
                } else {
                    params.collection_scope = this.collectionId = parseInt(bcSfFilterConfig.general.collection_id);
                }
            }
        } else {
            params.collection_scope = 0;
        }
    } else {
        params.collection_scope = Array.isArray(this.queryParams.collection_scope) ? this.queryParams['collection_scope'][0] : this.queryParams['collection_scope'];
    }
    // Get product/variant available or not
    if (this.getSettingValue('general.availableAfterFiltering') == true) {
        params.product_available = this.checkExistFilterOptionParam() === true ? true : this.productAvailable;
        params.variant_available = this.checkExistFilterOptionParam() === true ? true : this.variantAvailable;
    } else {
        params.product_available = this.productAvailable;
        params.variant_available = this.variantAvailable;
    }
    // Get Tag value
    if (typeof this.collectionTags !== 'undefined' && this.collectionTags !== null) params.tag = this.collectionTags;
    // Display filter option items even they return no product
    if (this.getSettingValue('general.showOutOfStockOption')) params.zero_options = true;
    // Build Filter tree or not
    params.build_filter_tree = (typeof eventType !== 'undefined' && this.imutableFilterTree.indexOf(eventType) > -1) ? false : true; // Except events of elements in filter tree, all remaining events do not rebuild filter tree
    // Enable cache when request params doest not have filter option values, "page" param equal to 1 and "sort" param equal to default sorting
    params.check_cache = (this.checkExistFilterOptionParam() === false && params['page'] == 1 && params['sort'] == this.defaultSorting && params['limit'] == this.getSettingValue('general.limit') && !this.isSearchPage() && !this.isVendorPage() && !this.isTypePage()) ? true : false;
    // Turn on price mode
    if (this.getSettingValue('general.priceMode') != '') params['price_mode'] = this.getSettingValue('general.priceMode');
    // Tag mode
    if (this.getSettingValue('general.tagMode') != '') params['tag_mode'] = this.getSettingValue('general.tagMode');
    // Availability Sorting
    if (this.getSettingValue('general.sortingAvailableFirst')) params.sort_first = 'available';
  	if (params.sort == "manual") params.sort_first = 'extra_sort2';
    // Vendor page: Get Vendor param
    if (this.isVendorPage() && params.hasOwnProperty('q')) {
        var vendorParam = this.getSettingValue('general.vendorParam');
        // params[vendorParam] = [params['q'].replace(/\+/g, ' ')];
        params[vendorParam] = [params['q']];
        delete params['q'];
    }
    // Type page: Get Type param
    if (this.isTypePage() && params.hasOwnProperty('q')) {
        var typeParam = this.getSettingValue('general.typeParam');
        params[typeParam] = [params['q']];
        delete params['q'];
    }
    return params;
};