
//BADGE MODULES
var badge = (function () {

  var badge_conf = {
      'doi': {
  			'citation-count': {
  					'name': 'oc_api',
  					'call': 'https://opencitations.net/index/api/v1/citation-count/[[VAR]]',
  					'format': 'json',
  		      'field': 'count',
  					'label': 'Citations',
  		      "respects": [],
  			},

        //when highlighting the badge
        'onhighlighting': null,
        //when clicking on the badge
        //'onclick_link': 'https://doi.org/[[VAR]]'
        'onclick_link':'https://opencitations.net/index/search?text=[[VAR]]'
      }
  }

	var ocbadge_list = [];
	var badge_calls = {};

	function init_badge_index(this_script) {

    var script_id = this_script.dataset.id;
    console.log(script_id);
    if ((script_id == "") || (script_id == undefined)){
      script_id = "0";
    }
    //data inputs
    var input_value = this_script.dataset.value;
    var input_type = this_script.dataset.type;
    var input_return = this_script.dataset.return;
    var input_style = this_script.dataset.style;

    style_index = {};
    style_index["size"] = "110px";
    if ((input_style == "") || (input_style == undefined)){
      input_style.split(";");
      for (var i = 0; i < input_style.length; i++) {
        parts = input_style[i].split(":");
        style_index[parts[0]] = parts[1];
      }

    }

    var badgehtml_id = script_id+"__badge";
    this_script.insertAdjacentHTML('afterend', '<span id="'+badgehtml_id+'" class="__oc_badge__" data-value="'+input_value+'" data-type="'+input_type+'" data-size="'+style_index["size"]+'" data-return="'+input_return+'"></span>')
    var ocbadge_container = [document.getElementById(badgehtml_id)];

		//init badge dict
    //var ocbadge_container = document.getElementsByClassName("__oc_badge__");
		for (var i = 0; i < ocbadge_container.length; i++) {
			var ocbadge_obj = ocbadge_container[i];
      ocbadge_list.push({
					'input': ocbadge_obj.dataset.value,
          'type': ocbadge_obj.dataset.type,
					'preview': ocbadge_obj.dataset.return,
          'id': badgehtml_id
			})
		}
	}

	function get_preview_data() {
		for (var i = 0; i < ocbadge_list.length; i++) {
			var ocbadge_obj = ocbadge_list[i];
			var badge_cat = badge_conf[ocbadge_obj.type];
      var preview_part = badge_cat[ocbadge_obj.preview];

			var text_query = badge_util.build_text_query({},preview_part.call, ocbadge_obj.input);
			var href_onclick = badge_util.build_text_query({},badge_cat.onclick_link, ocbadge_obj.input);

			var text_query_key = text_query+"[["+preview_part.field+"]]";
			badge_calls[text_query_key] = {
				'data': null,
				'type': ocbadge_obj.type,
				'input': ocbadge_obj.input,
				'preview': ocbadge_obj.preview,
				'label': preview_part.label,
				'name': preview_part.name,
				'format': preview_part.format,
				'respects': preview_part.respects,
				'field': preview_part.field,
				'onhighlighting': badge_cat.onhighlighting,
				'onclick_link': href_onclick
			};

			//execute the calls
			call_service(text_query, text_query_key, ocbadge_obj);

		}
	}

	function call_service(call_url, key, ocbadge_obj, def_callbk = badge_callbk) {
		badge_util.httpGetAsync(call_url, key, ocbadge_obj, badge_callbk);
	}

	function badge_callbk(result_obj, ocbadge_obj){

		var call_obj = null;
		if (result_obj.key in badge_calls) {
			call_obj = badge_calls[result_obj.key];
		}

		if (call_obj == null) {
			return -1;
		}

		//insert the data retrieved
		badge_calls[result_obj.key].data = badge_util.get_values_with_rist(
																result_obj.data,
																call_obj.field,
																call_obj.respects);

		//build the html dom now
    //console.log(badge_calls);
		badge_htmldom.build_badge(badge_calls[result_obj.key], ocbadge_obj);
	}

	return {
		//test_func: test_func
		init_badge_index: init_badge_index,
		get_preview_data: get_preview_data
	}
})();
var badge_util = (function () {

	function get_all_elements_with_attribute(attribute, value)
	{
	  var matchingElements = [];
	  var allElements = document.getElementsByTagName('*');
	  for (var i = 0, n = allElements.length; i < n; i++)
	  {
	    if (allElements[i].getAttribute(attribute) !== null)
	    {
				if (allElements[i].getAttribute(attribute) == value) {
					// Element exists with attribute. Add to array.
		      matchingElements.push(allElements[i]);
				}
	    }
	  }
	  return matchingElements;
	}

	function get_list_elem(list, field, value) {
		for (var i = 0; i < list.length; i++) {
			if(list[i][field] == value){
				return list[i];
			}
		}
		return -1;
	}

	function httpGetAsync(theUrl, key, ocbadge_obj, callback){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', theUrl);
		xhr.onload = function() {
		    if (xhr.status === 200) {
						var result = {};
						result['call_url'] = theUrl;
						result['key'] = key;
						result['data'] = JSON.parse(xhr.responseText);
						Reflect.apply(callback,undefined,[result, ocbadge_obj]);
		    }
		    else {
		        console.log("Error: "+xhr.status);
		    }
		};
		xhr.send();
	}
	function build_text_query(one_result, query_text, def = null) {
			var myRegexp = /\[\[(.*)\]\]/g;
			var match = myRegexp.exec(query_text);

			//get all values
			var index = [];
			for (var i = 1; i <= match.length; i++) {
				if (def != null) {
					index.push(
						{
							'name': match[i],
							'value': def
						}
					)
				}
				else if (one_result[match[i]] != undefined) {
					index.push(
						{
							'name': match[i],
							'value': one_result[match[i]].value
						}
					)
				}
			}

			//rebuild the query
			var matched_query = query_text;
			for (var i = 0; i < index.length; i++) {
				matched_query = matched_query.replace("[["+index[i].name+"]]", index[i].value);
			}

			return matched_query;
		}
	function get_values_with_rist(dataarr_obj, field, respects, innervalue = false) {

			var ret_vals = {};
			var respects_index = {};

			//init both dict
			ret_vals[field] = [];

			for (var i = 0; i < respects.length; i++) {
				if (respects[i].param in respects_index) {
					respects_index[respects[i].param].push(respects[i].func);
				}else {
					respects_index[respects[i].param] = [respects[i].func];
				}
			}

			// check if all fields respect restrictions
			for (var i = 0; i < dataarr_obj.length; i++) {
				var dataobj = dataarr_obj[i];
				var addit = true;
				for (var key_field in dataobj) {
						if (key_field in respects_index) {
							for (var j = 0; j < respects_index[key_field].length; j++) {
								var func_i = respects_index[key_field][j];
								if (innervalue) {
									addit = addit && Reflect.apply(func_i,undefined,[dataobj[key_field].value]);
								}else {
									addit = addit && Reflect.apply(func_i,undefined,[dataobj[key_field]]);
								}
							}
						}
				}

				//add all row
				if (addit) {
					for (var key_field in dataobj) {
						if (key_field in ret_vals) {
							if (innervalue) {
								ret_vals[key_field].push(dataobj[key_field].value);
							}else {
								ret_vals[key_field].push(dataobj[key_field]);
							}
						}
					}
				}
			}

			return ret_vals;
	}
	return {
		//test_func: test_func
		get_all_elements_with_attribute: get_all_elements_with_attribute,
		get_list_elem: get_list_elem,
		httpGetAsync: httpGetAsync,
		build_text_query: build_text_query,
		get_values_with_rist: get_values_with_rist
	}
})();


var badge_htmldom = (function () {

	//CSS RULES GLOB
  var box_size = "110";
  var static_style = `
          border-top: 1px solid;
          border-bottom: 1px solid;
          color: #2e5cb8;
          min-width:`+box_size+`px;
          max-width:`+box_size+`px;
        `;
        //color: #2e5cb8;
	var onmouseover = `
        this.style.opacity='1';
        `;
	var onmouseout = `
				 this.style.opacity='0.5';
				`;


	function build_badge(obj_call, ocbadge_obj) {

				var div_c = document.createElement("div");
				var lbl = lbl = obj_call.label;

        var logo_size = box_size * 0.38;

				div_c.innerHTML =
				`
				<table id="badge_content" style="display:block; opacity: 0.5;" onmouseover="`+onmouseover+`" onmouseout="`+onmouseout+`">
					<tr style="">
					<td style="border: transparent;"> <img class="logo-img-oc" id="`+ocbadge_obj.id+`" src="https://ivanhb.github.io/badge/img/logo.png" width="`+logo_size+`" height="`+logo_size+`" style="margin-left:4%;"> </td>
					<td style="`+static_style+` text-align: center;" class="badge_text">
							<a id="`+ocbadge_obj.id+`" style="" class="btn btn-outline-light btn-lg" href="`+obj_call.onclick_link+`">
							<div style="font-size: 1.45rem; display: inline-block; padding-left:2%; color: #2e5cb8;">`+lbl+`</div></br><div style="padding-right: 5%; display: inline-block;"><span class="" style="font-size: 2.1rem; color: #2e5cb8;">`+obj_call.data[obj_call.field]+`</span></div>
							</a>
					</td>
					</tr>
				</table>
				`;

				//create it inside the tag
				document.getElementById(ocbadge_obj.id).appendChild(div_c);
	}

	return {
		//test_func: test_func
		build_badge: build_badge
	}
})();

badge.init_badge_index(document.currentScript);
badge.get_preview_data();
