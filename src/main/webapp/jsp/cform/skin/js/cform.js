/**
 * 运行时表单静态类
 * 
 */
(function($) {
	if (typeof CForm == "undefined") {
		CForm = {};
	}

	/**
	 * 注册事件
	 */
	CForm.on = function(eventName, func) {
		$(CForm).on.apply($(CForm), arguments);
	};
	
	/**
	 * 触发事件
	 */
	CForm.trigger = function(eventName, args) {
		$(CForm).trigger.apply($(CForm), arguments);
	};
	
	/**
	 * 获得页面上所有的表单数据
	 * 
	 * @returns CForm.List，每一项为一个CForm.Map
	 */
	CForm.getAllFormData = function() {
		var list = new CForm.List();

		$.each($("[cf_elementType=form]"), function() {
			var map = CForm.getFormData(this);
			map.put("formId", $(this).attr("id"));

			list.add(map);
		});

		return list;
	};

	/**
	 * 获得指定表单数据
	 * 
	 * @param form
	 *            表单
	 * @returns CForm.Map key为fieldId,value为fieldValue
	 *          若表单中含有动态行，则key为动态行定义ID，value为CForm.List
	 */
	CForm.getFormData = function(form) {
		var $form = form ? $(form) : $("[cf_elementType=form]").eq(0);
		if (!$form.length) {
			alert("请指定要获得数据的表单!");
			return;
		}
		var map = new CForm.Map();

		// 动态行
		var $dynRows = $form.find(".cfDynRow[cf_modelId]");
		// 动态表格
		var $dynTables = $form.find('.cfDynTable[cf_modelId]');
		// 具有modelItemId的所有域
		var fields = $form.find("[cf_modelItemId]");

		// 组装主表单数据
		$.each(fields, function(i, field) {
			if ($dynRows.find(field).length || $dynTables.find(field).length
					|| $(field).closest("[cf_elementType=form]").attr("id")!=$form.attr("id")) {
				return;
			}
			
			var fieldValue = CForm.getFieldValue(field);
			// 若已有数据，则用","间隔各个数据
			var preFieldValue = map.get(field.id);
			if (preFieldValue) {
				fieldValue = $.trim(fieldValue) ? preFieldValue + "," + fieldValue : preFieldValue;
			}
			
			map.put(field.id, fieldValue);
		});

		// 组装动态行数据
		$.each($dynRows, function(i, dynRow) {
			if($(dynRow).closest("[cf_elementType=form]").attr("id") != $form.attr("id"))
				return;
			// 存放动态行的各行数据
			var recordsLst = new CForm.List();
			// 存放动态行的数据，以及是否分页等信息
			var dynDataMap = new CForm.Map();
			//分页信息
			var pageInfo = new CForm.Map();
			
			var isPaging = $(dynRow).attr("cf_isPaging");
			if(isPaging == "true"){
				// 获取当前页数
				var start = $(dynRow).find(".pageBarContainer .curPageNum").val();
				// 每页显示条数
				var limit = $(dynRow).find(".pageBarContainer .pageSize option:selected").val();
				
				pageInfo.put("isPaging","true");
				pageInfo.put("start",start);
				pageInfo.put("limit",limit);
			}else{
				pageInfo.put("isPaging","false");
			}
			
			// 查找除模板行外，所有有状态的行
			var $trs = $('tbody tr[cf_recordState][cf_recordState!=temp]', dynRow);
			
			$.each($trs, function(j, tr) {
				// 数据状态
				var recordState = $(tr).attr("cf_recordState");
				// 行号
				var subTblNum = $(tr).find("td:first label").text();
				var record = new CForm.Map();
				record.put("cf_recordState",recordState);
				record.put("SUB_TBL_NUM",subTblNum);
				var $fields = $(tr).find('[cf_modelItemId]');
				
				$.each($fields, function(k, field) {
					var fieldValue = CForm.getFieldValue(field);
					
					// 若已有数据，则用","间隔各个数据
					var preFieldValue = record.get(field.id);
					if (preFieldValue) {
						fieldValue = $.trim(fieldValue) ? preFieldValue + "," + fieldValue : preFieldValue;
					}
					record.put(field.id, fieldValue);
				});

				recordsLst.add(record);
			});
			dynDataMap.put("pageInfo",pageInfo)
			dynDataMap.put("zoneData",recordsLst)
			
			map.put(dynRow.id, dynDataMap);
		});

		// 组装动态表格数据
		$.each($dynTables, function(i, dynTable) {
			if($(dynTable).closest("[cf_elementType=form]").attr("id") != $form.attr("id"))
				return;
			// 存放动态表格的各表格数据
			var recordsLst = new CForm.List();
			
			var datas = map.get(dynTable.id);
			if (datas && datas.size()) {
				recordsLst = datas;
			}
			
			var $table = $('table', dynTable);
			$.each($table, function(j, table) {
				
				var record = new CForm.Map();
				
				var $fields = $(table).find('[cf_modelItemId]');
				
				$.each($fields, function(k, field) {
					var fieldValue = CForm.getFieldValue(field);
					
					// 若已有数据，则用","间隔各个数据
					var preFieldValue = rowData.get(field.id);
					if (preFieldValue) {
						fieldValue = $.trim(fieldValue) ? preFieldValue + "," + fieldValue : preFieldValue;
					}
					record.put(field.id, fieldValue);
				});
				
				recordsLst.add(rowData);
			});
			
			var dynTableDataMap = new CForm.Map();
			dynTableDataMap.put("isPaging","false");
			dynTableDataMap.put("zoneData",dynTableRows);
			
			map.put(dynTable.id, dynTableDataMap);
		});

		return map;
	};
	
	/**
	 * 获取表单组数据
	 * @returns CForm.Map key为fieldId,value为fieldValue
	 *          若表单中含有动态行，则key为动态行定义ID，value为CForm.List
	 */
	CForm.getFormsData = function() {
		var forms = $("[cf_elementType=form]");
		var formsMap = new CForm.Map();
		var mainFormMap = new CForm.Map();
		var subFormsMap = new CForm.Map();
		
		// 组装表单组的主表单数据
		var mainFormData = CForm.getFormData(forms.eq(0));
		/*if(window.formDataId){
			mainFormData.put("formDataId", formDataId);
		}*/
		mainFormMap.put(forms.eq(0).attr("id"),mainFormData);
		formsMap.put("M",mainFormMap);
		
		// 组装表单组的子表单数据
		for(var i = 1;i<forms.length;i++){
			var subFormData = CForm.getFormData(forms.eq(i));
			subFormsMap.put(forms.eq(i).attr("id"),subFormData);
		}
		formsMap.put("S",subFormsMap);
		
		return formsMap
	}

	/**
	 * 控制变量：标识表单是否已初始化，用于控制是否触发子表单数据加载完成事件
	 * 只在首次调用CForm.setFormData接口初始化表单时触发事件
	 */
	CForm.isInitialized = false;
	// 有表单组的情况下，setFormData会被执行多次，mainFormNum用于记录setFormData被执行的次数
	CForm.mainFormNum = 0;
	// 记录setSubFormData被执行的次数
	CForm.subFormNum = 0;
	
	/**
	 * 向指定的表单里设置实际数据
	 * 
	 * @param form
	 *            表单
	 * @param data
	 *            数据
	 * @param byAttr
	 *            赋值属性
	 */
	CForm.setFormData = function(form, data, byAttr) {
		CForm.mainFormNum++;
		var type = byAttr ? 'cf_alias' : 'cf_modelId';
		byAttr = byAttr ? byAttr : 'cf_modelItemId';
		
		var $form = $(form);
		
		// 动态行Map，缓存动态行
		var dynRowMap = new CForm.Map();
		var $dynRows = $form.find(".cfDynRow");
		$.each($dynRows, function() {
			var typeValue = $(this).attr(type);
			dynRowMap.put(typeValue, $(this));
			// 如果当前主表单存在表单实例ID，即非新增，
			// 并且当前遍历的动态行没有数据的情况下，默认放入一个空数组，用于处理首行的隐藏
			if (formDataId && !data[typeValue]) {
				data[typeValue] = [];
			}
		});
		
		// 动态表格Map，缓存动态表格
		var dynTableMap = new CForm.Map();
		var $dynTables = $form.find(".cfDynTable");
		$.each($dynTables, function() {
			var typeValue = $(this).attr(type);
			dynTableMap.put(typeValue, $(this));
		});
		
		// 设置子表数据
		function _setSubFormData(dynRowMap, dynTableMap, dynValueMap, byAttr) {
			return function() {
				CForm.setSubFormData(dynRowMap, dynTableMap, dynValueMap, byAttr);
			};
		}
		
		// 缓存子表单数据
		var dynValueMap = new CForm.Map();
		
		// 为每个域赋值
		for (var key in data) {
			var value = data[key];
			// 过滤空值
			if (!value) {
				continue;
			}
			
			// 动态行
			if (dynRowMap.get(key)) {
				dynValueMap.put(key, value);
				continue;
			}
			
			// 动态表格
			if (dynTableMap.get(key)) {
				dynValueMap.put(key, value);
				continue;
			}
			
			// 主表单
			var $field = $form.find("[" + byAttr + "=" + key + "]");
			$.each($field, function(idx, input) {
				CForm.setFieldValue(input, value);
			});
		}
		// 异步加载子表单数据
		setTimeout(_setSubFormData(dynRowMap, dynTableMap, dynValueMap, byAttr), 0);
	};

	/**
	 * 初始化子表单实际数据
	 * 
	 * @param dynRowMap
	 *            动态行
	 * @param dynTableMap
	 *            动态表格
	 * @param dynValueMap
	 *            子表单数据
	 * @param byAttr
	 *            赋值属性
	 */
	CForm.setSubFormData = function(dynRowMap, dynTableMap, dynValueMap, byAttr) {
		CForm.subFormNum++;
		if (dynValueMap.length) {
			for (var drKey in dynRowMap.map) {
				var $dynRow = dynRowMap.get(drKey);
				var dynRowValues = dynValueMap.get(drKey);
				if (dynRowValues) {
					CForm.setDynRowData($dynRow, dynRowValues, byAttr);
				}
			}
			
			for (var dtKey in dynTableMap.map) {
				var $dynTable = dynTableMap.get(dtKey);
				var dynTableValues = dynValueMap.get(dtKey);
				if (dynTableValues) {
					CForm.setDynTableData($dynTable, dynTableValues, byAttr);
				}
			}
		}
		
		// 当CForm.subFormNum=CForm.mainFormNum时才说明所有的子表单已经设置完毕
		if (!CForm.isInitialized && CForm.subFormNum == CForm.mainFormNum) {
			// 触发子表单数据加载完成事件，用于控制域权限加载时机
			CForm.trigger("afterLoadSubFormData");
			// 设置表单已初始化
			CForm.isInitialized = true;
		}
		
	};
	
	/**
	 * 向指定的动态行里设置实际数据，如果要设置的动态行有数据，则先将数据删除
	 * 
	 * @param $dynRow
	 *            动态行
	 * @param value
	 *            数据
	 * @param byAttr
	 *            赋值属性
	 */
	CForm.setDynRowData = function($dynRow, value, byAttr) {
		if ((value!=null&&value.length==0)||(value.zoneData!=null&&!value.zoneData.length)) {
			// 如果表单已经初始化过，则此方法被执行说明是业务上在自行调用此函数，
			// 这种情况下云表单不应该对页面上的动态行做任何处理
			if(!CForm.isInitialized){
				$dynRow.find(".cfDynRowTable tbody tr[cf_recordState=1]").each(function(i,curTr){
					CForm.delRow($dynRow,$(curTr));
				});
				return;
			}
			return;
		}
		// 获取第一行（可能是隐藏状态）
		var $firstRow = $dynRow.find("tbody tr:first");
		// 克隆第一行作为模板
		var $tr = $firstRow.clone(true).show();
		// 将模板行的状态设置为3
		$tr.attr("cf_recordState","3");
		// 将第一行的状态设置为temp，方便以后使用
		$firstRow.attr("cf_recordState","temp");
		// 隐藏第一行
		$firstRow.hide();
		
		// th中可能会有“增加”按钮，需要移除
		$dynRow.find("th:last .cfAddRow").remove();
		// 清空动态行的数据
		$dynRow.find(".cfDynRowTable tbody tr[cf_recordState][cf_recordState!=temp]").remove();
		
		CForm.addRows($dynRow, $tr, byAttr, value);
		
		// 触发列合计单击事件，计算合计值
		$dynRow.find(".cfColSum").trigger("click");
	};
	
	/**
	 * 向指定的动态表格里设置实际数据
	 * 
	 * @param $dynTable
	 *            动态表格
	 * @param value
	 *            数据
	 * @param byAttr
	 *            赋值属性
	 */
	CForm.setDynTableData = function($dynTable, value, byAttr) {
		if (!value.length) {
			return;
		}
		// 第一个表格
		var $table = $dynTable.find('table:first').clone(true);
		// 第一个表格数据
		var firstTableData = value[0];
		
		// 设置第一个表格中的所有域
		var $fieldsTable = $dynTable.find('table:first [' + byAttr + ']');
		$.each($fieldsTable, function(i, field) {
			var val = firstTableData[$(field).attr(byAttr)];
			if (val) {
				CForm.setFieldValue(field, val);
			}
		});
		
		// 设置动态表格的其他表格数据
		if (value.length < 2) {
			return;
		}
		
		CForm.addTables($dynTable, $table, byAttr, value);
	};
	
	/**
	 * 根据业务含义向指定的表单里设置实际数据
	 * 
	 * @param form
	 *            表单
	 * @param data
	 *            数据
	 */
	CForm.setFormDataByBizMean = function(form, data) {
		CForm.setFormData(form, data, "cf_bizMean");
	};
	
	/**
	 * 向指定的表单里，设置数据绑定
	 * 
	 * @param form
	 *            表单
	 * @param data
	 *            数据
	 */
	CForm.setDataBind = function(form, data) {
		var $form = $(form);
		// 为每个域赋值
		for ( var key in data) {
			var value = data[key];
			// 主表单
			var $field = $form.find("[cf_modelItemId=" + key + "]");

			$.each($field, function(i, field) {
				CForm.setFieldDataBind(field, value);
			});
		}
	};

	/**
	 * 向指定的表单里，根据域ID设置数据绑定
	 * 
	 * @param form
	 *            表单
	 * @param data
	 *            数据
	 */
	CForm.setDataBindByFieldId = function(form, data) {
		var $form = $(form);
		// 为每个域赋值
		for (var key in data) {
			var value = data[key];
			// 主表单
			var $field = $form.find("[id="+key+"]");

			$.each($field, function(i, field) {
				CForm.setFieldDataBind(field, value);
			});
			
			// 设置可编辑列表中编辑域的绑定值
			var editFieldId = $("#"+key).attr("cf_editfieldid");
			if(editFieldId){
				$("#"+editFieldId).empty();
				CForm.setFieldDataBind($("#"+editFieldId)[0], value);
			}
		}
	};

	/**
	 * 获得域值
	 * 
	 * @param field
	 *            域
	 */
	CForm.getFieldValue = function(field) {
		var fieldValue = "";

		switch (field.type) {
		// 列表框
		case "select-multiple":
			// 选中项
			$options = $("option:selected", $(field));
			if ($options.length) {
				var valArray = [];
				$.each($options, function(i, option) {
					valArray.push($(option).val());
				});
				fieldValue = valArray.join(",");
			}

			break;
		// 单选按钮
		case "radio":
			if (!field.checked) {
				break;
			}
		// 复选框
		case "checkbox":
			if (!field.checked) {
				break;
			}
		// 隐藏域
		case "hidden":
		// 多行文本框
		case "textarea":
		// 单行文本框
		case "text":
			if($(field).parent().hasClass("cfFileField")&&$(field).parent().find("input[type=file]").length!=0){
				var $filelist = $(field).parents('.cfFile').find(".cfFileContainer>li");
				var files = "";
				$filelist.each(function(){
					var uuid = this.id;
					var filename = $(this).find('.filename').text();
					files+=uuid+"@"+filename+","
				});
				fieldValue = $.trim(files.substring(0,files.length-1))
			}else{
				fieldValue = $.trim($(field).val());
			}
			break;
		// 下拉框
		case "select-one":
			fieldValue = $(field).val() == ' ' ? ' ' : $.trim($(field).val());
			break;
		case "password":
		case "button":
		case "file":
		case "image":
		case "reset":
		case "submit":
		default:
			break;
		}

		return fieldValue;
	};
	/**
	 * 设置域值
	 * 
	 * @param field
	 *            域
	 * @param value
	 *            域数据
	 */
	CForm.setFieldValue = function(field, value) {
		switch (field.type) {
			// 按钮不设置值
			case "button":
				break;
			// 列表框
			case "select-multiple":
				// 实际值
				if (value) {
					var valArray = value.split(",");
					var $options = $(field).find("option");
					$.each($options, function(i, option) {
						// 判断选项值是否在数组中
						if ($.inArray($(option).val(),valArray) == -1) {
							$(option).attr("selected", false);
						}else {
							$(option).attr("selected", true);
						}
					});
				}
				break;
			case "select-one":
				if (value) {
					$(field).val(value);
					if($(field).hasClass("cfDynQuery")){
						$(field).nextAll("input").val($(field).find("option:selected").text());
					}
					//适配级联下拉框
					if($(field).hasClass("cfDynSelect")){
						$(field).attr("cf_databindchildparam",value);
					}
				}
				break;
			case "radio":
				if (value && value == $(field).val()) {
					$(field).attr("checked", true);
				}else {
					$(field).attr("checked", false);
				}
				break;
			case "checkbox":
				if (value) {
					var valArray = value.split(",");
					var fieldVal = $(field).val();
					if($.inArray(fieldVal,valArray) == -1) {
						$(field).attr("checked", false);
					}else {
						$(field).attr("checked", true);
					}
				}
				break;
			// 将textarea中的"[br]"替换为"\r\n"
			case "textarea":
				if (value) {
					$(field).val(value.replace(/\[br\]/g, "\r\n"));
					// 高度自适应
					$(field).trigger("autosize.resize");
				}
				break;
			// 隐藏域
			case "hidden":
			case "file":
			case "text":
				if($(field).parent().hasClass("cfFileField")&&$(field).parent().find("input[type=file]").length!=0){
					var fileArr = value.split(",");
					for(var i=0;i<fileArr.length;i++){
						var file = fileArr[i].split("@");
						var $fileContainer = $(field).parents(".cfFile").find(".cfFileContainer");
						$fileContainer.append($('<li id='+file[0]+'><div class="filename">'+file[1]+'</div><div class="filedel">×</div></li>'))
					}
				}else if($(field).parent().hasClass("cfFiles")&&$(field).parent().find("input[type=file]").length!=0){
					$(field).val(value);
					var filesInfo = eval ("(" + value + ")");
					for(var i=0;i<filesInfo.length;i++){
						var file = filesInfo[i];
						for(var key in file){
							fileName = file[key];
							//var $fileInfo = $('<li class="cfFilesField" id='+key+'><div class="cfFilelinkIcon"></div><div class="cfFilelink">'+fileName+'</div><div class="cfFileDelIcon"></div></li>');
							var $fileInfo = $('<li class="cfFilesField" id='+key+'><div class="cfFilelinkIcon"></div><div class="cfFilelink">'+fileName+'</div></li>');
							$(field).parent().find(".cfFilesFields").append($fileInfo);
						}
					}
					
				}else{
					$(field).val(value);
				}
				break;
			default:
				$(field).val(value);
				break;
		}
		//触发域动态关联事件
		$(field).trigger("dyncheck");
	};

	/**
	 * 设置域绑定
	 * 
	 * @param field
	 *            域
	 * @param value
	 *            值
	 */
	CForm.setFieldDataBind = function(field, value) {
		switch (field.type) {
			case "select-one":
			case "select-multiple":
				$(field).append(value);
				//加载动态查询
				if($(field).hasClass("cfDynQuery")){
					$(field).comboSelect();
				}
				break;
			default:
				$(field).val(value);
				break;
		}
		//触发域动态关联事件
		$(field).trigger("dyncheck");
	};

	/**
	 * 提交数据时校验
	 */
	CForm.validate = function() {
		// 校验结果
		var isValid = true;

		// 非空校验
		$(".cfIsRequired[type!=hidden]").not("[style*='display: none']").each(
				function(i, field) {
					// 如果是动态行中被隐藏的行，则不需要校验
					if($(field).closest("tr").css("display") == "none"){
						return true;
					}
					var $field = $(field);
					switch (field.type) {
					// 列表框
					case "select-multiple":
						// 至少选中一项
						$options = $field.find("option:selected");
						if (!$options.length) {
							isValid = false;
						}

						break;
					// 单选按钮
					case "radio":
						// 同一组中至少有一个选中
						$radios = $("input[type=radio][name="
								+ $field.attr("name") + "]:checked");
						if (!$radios.length) {
							isValid = false;
						}

						break;
					// 复选框
					case "checkbox":
						// 同一组中至少有一个选中
						$checkboxes = $("input[type=checkbox][name="
								+ $field.attr("name") + "]:checked");
						if (!$checkboxes.length) {
							isValid = false;
						}

						break;
					case "text":
						if($(field).parent().hasClass("cfFileField")&&$(field).parent().find("input[type=file]").length!=0){
							var $fileContainer = $(field).parents(".cfFile").find(".cfFileContainer");
							if($fileContainer.find("li").length<=0){
								isValid = false;
							}
						}else{
							if (!$.trim($field.val())) {
								isValid = false;
							}
						}
						
						break;
					default:
						if (!$.trim($field.val())) {
							isValid = false;
						}

						break;
					}

					if (!isValid) {
						CForm.showTips($field, "cfIsRequired");
						return false;
					}
				});

		if(!isValid) {
			return false;
		}
		
		// 数据类型校验
		$('.cfIsInteger').each(function(i, field) {
			var $field = $(field);
			var val = $.trim($field.val());
			if (val && !CForm.isInteger(val)) {
				CForm.showTips($field, "cfIsInteger");
				isValid = false;
				return false;
			}
		});
		
		if(!isValid) {
			return false;
		}
		
		// 小数校验
		$('.cfIsFloat').each(function(i, field) {
			var $field = $(field);
			var val = $.trim($field.val());
			if (val) {
				if (!CForm.isFloat(val)) {
					// 不是小数，校验是否整数
					if (!CForm.isInteger(val)) {
						CForm.showTips($field, "cfIsFloat");
						isValid = false;
						return false;
					}					
				}else {
					// 精确度校验
					var precision = $field.attr("cf_fieldPrecision");
					if (precision) {
						var floatLength = val.toString().split(".")[1].length;
						if (floatLength > precision) {
							CForm.showTips($field, "cfIsFloat", precision);
							isValid = false;
							return false;
						}
					}
				}
			}
		});
		
		if(!isValid) {
			return false;
		}
		
		// 邮政编码校验
		$('.cfIsZipCode').each(function(i, field) {
			var $field = $(field);
			var val = $.trim($field.val());
			if (val && !CForm.isZipCode(val)) {
				CForm.showTips($field, "cfIsZipCode");
				isValid = false;
				return false;
			}
		});
		
		if(!isValid) {
			return false;
		}
		
		// 电子邮件校验
		$('.cfIsEmail').each(function(i, field) {
			var $field = $(field);
			var val = $.trim($field.val());
			if (val && !CForm.isEmail(val)) {
				CForm.showTips($field, "cfIsEmail");
				isValid = false;
				return false;
			}
		});
		
		if(!isValid) {
			return false;
		}
		
		// 身份证号校验
		$('.cfIsIdCard').each(function(i, field) {
			var $field = $(field);
			var val = $.trim($field.val());
			var result = L5.checkIdCard(val);
			if (val && result != true) {
				CForm.showTips($field, "cfIsIdCard", result);
				isValid = false;
				return false;
			}
		});
		
		if(!isValid) {
			return false;
		}
		
		// 固定电话校验
		$('.cfIsPhoneNum').each(function(i, field) {
			var $field = $(field);
			var val = $.trim($field.val());
			if (val && !CForm.cfIsPhoneNum(val)) {
				CForm.showTips($field, "cfIsPhoneNum");
				isValid = false;
				return false;
			}
		});
		
		if(!isValid) {
			return false;
		}
		
		// 手机号码校验
		$('.cfIsMobileNum').each(function(i, field) {
			var $field = $(field);
			var val = $.trim($field.val());
			if (val && !CForm.cfIsMobileNum(val)) {
				CForm.showTips($field, "cfIsMobileNum");
				isValid = false;
				return false;
			}
		});
		
		if(!isValid) {
			return false;
		}
		
		// 正则表达式校验
		$('.cfIsRegExp').each(function(i, field){
			var $field = $(field);
			var reg = $field.attr("cf_regExp");
			if (reg) {
				var val = $.trim($field.val());
				if(val && !eval(reg).test(val)) {
					CForm.showTips($field, "cfIsRegExp");
					isValid = false;
					return false;
				}
			}
		});

		return isValid;
	};
	
	/**
	 * 提示校验信息
	 */
	CForm.showTips = function($field, className, param) {
		var msg  = "";
		
		// 动态行域判断
		var $dynRows = $field.parents(".cfDynRow");
		if ($dynRows.length) {
			var $dynRow = $dynRows.eq(0);
			var dName = $dynRow.attr("name");
			var rowNum = $field.parents("tr").find("td:first label").text();
			var colNum = $field.parent("td").index() + 1;
			msg  = "动态行[" + dName + "]第" + rowNum + "行，第"+ colNum + "列中";
		}
		
		var fName = $field.attr("name");
		
		switch (className) {
		// 必填
		case "cfIsRequired":
			msg += "域[" + fName + "]不能为空！";
			break;
		// 整数
		case "cfIsInteger":
			msg += "域[" + fName + "]只能输入整数！";
			break;
		// 小数
		case "cfIsFloat":
			if (param) {
				msg += "域[" + fName + "]的精确度大于" + param + "！";
			} else {
				msg += "域[" + fName + "]只能输入小数！";
			}
			break;
		// 邮件编码
		case "cfIsZipCode":
			msg += "域[" + fName + "]的值不符合邮政编码格式！";
			break;
		// 电子邮件
		case "cfIsEmail":
			msg += "域[" + fName + "]的值不符合电子邮件格式！";
			break;
		// 正则表达式
		case "cfIsRegExp":
			msg += "域[" + fName + "]的值不符合正则表达式规则！";
			break;
		case "cfIsIdCard":
			msg += "域[" + fName + "]:" + param;
			break;
		case "cfIsPhoneNum":
			msg += "域[" + fName + "]的值不符合固定电话格式！\r如果有区号，请使用[区号-座机号]的形式。";
			break;
		case "cfIsMobileNum":
			msg += "域[" + fName + "]的值不符合手机号码格式！";
			break;
		default:
			msg += "域[" + fName + "]的值不合法！";
			break;
		}
		// 弹出框
		alert(msg);
		// 聚焦
		$field.focus();
	}

	/**
	 * 验证值是否为整数
	 */
	CForm.isInteger = function(val) {
		return /^(?:-?|\+?)\d+$/g.test(val);
	};

	/**
	 * 判断值是否为小数
	 */
	CForm.isFloat = function(val) {
		return /^(?:-?|\+?)\d*\.\d+$/g.test(val);
	};

	/**
	 * 判断值是否为邮政编码
	 */
	CForm.isZipCode = function(val) {
		return /^\d{6}$/g.test(val);
	};

	/**
	 * 判断值是否为电子邮件
	 */
	CForm.isEmail = function(val) {
		return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/g.test(val);
	};
	
	/**
	 * 判断值是否为固定电话号码
	 */
	CForm.cfIsPhoneNum = function(val) {
		return /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/g.test(val);
	};
	
	/**
	 * 判断值是否为手机号码
	 */
	CForm.cfIsMobileNum = function(val) {
		return /^((\(\d{2,3}\))|(\d{3}\-))?0{0,1}1[3|5|6|8][0-9]{9}$/g.test(val);
	};
	
	/**
	 * 将域设置为只读
	 */
	CForm.setFieldReadOnly = function(field) {
		
		var $field = $(field);
		// 设置背景颜色
		var td = $field.parent("td");
		if (td) {
			td.addClass("cfIsReadonly");
			// 去掉必填符号
			td.find("font.isRequiredSign").remove();
		}
		
		var fieldValue = "";
		// 根据域类型获取域值
		switch (field.type) {
			// 列表框
			case "select-multiple":
			// 下拉框
			case "select-one":
				// 选中项
				var $options = $("option:selected", $field);
				if ($options.length) {
					var valArray = [];
					$.each($options, function() {
						if ($(this).val()) {
							valArray.push($(this).text());
						}
					});
					fieldValue = valArray.join(",");
				}
				break;
			// 多行文本框
			case "textarea":
			// 单行文本框
			case "text":
				if($(field).parent().hasClass("cfFileField")&&$(field).parent().find("input[type=file]").length!=0){
					$(field).parent().hide()
					.siblings(".cfFileUpload").hide()
					.siblings(".cfFileContainer").css("margin",0)
					.find("li").mouseenter(function(){
						$(this).find(".filedel").hide();
					});
				}else if($(field).parent().hasClass("cfFiles")&&$(field).parent().find("input[type=file]").length!=0){
					$(field).parent().find(".cfFilesSelect").parent().hide();
				}else{
					fieldValue = $.trim($field.val());
				}
				break;
			// 单选按钮
			case "radio":
				if (!field.checked) {
					$field.attr("value",field.nextSibling.nodeValue);
					// 用""替换后面的文本
					field.nextSibling.nodeValue = "";
				}
				break;
			// 复选框
			case "checkbox":
				var nodeValue = field.nextSibling.nodeValue;
				field.nextSibling.nodeValue = "";
				if(!field.checked) {
					if($field.closest("td").find("font")) {
						fieldValue = $field.closest("td").find("font").text();
					}
				} else {
					if($field.closest("td").find(":checked").index(field) == 0) {
						fieldValue = nodeValue;
					} else {
						fieldValue = $field.closest("td").find("font").text()+","+nodeValue;
					}
				}
				break;
			// 按钮
			case "button":
				fieldValue = "";
				break;
		}
		// 正则表达式替换是为了处理多行文本框的换行
		var reg = new RegExp("\n", "g");
		fieldValue = fieldValue.replace(reg, "<br/>")
		// 隐藏
		$field.hide();
		// 处理下拉框动态查询隐藏
		if($field.hasClass("cfDynQuery")){
			$field.parent().hide();
		}
		if(!fieldValue) {
			return;
		}
		// 添加显示值
		var $font = $field.siblings(".readOnlyFieldVal");
		if($font.length) {
			$font.text(fieldValue);
		} else {
			// 处理下拉框动态查询隐藏
			if($field.hasClass("cfDynQuery")){
				$field.parent().after("<font class='readOnlyFieldVal'>" + fieldValue + "</font>");
			}else{
				$field.after("<font class='readOnlyFieldVal'>" + fieldValue + "</font>");
			}
			
		}
	};

	/**
	 * 将指定的区域设置成只读，可以是整个表单，也可以是表单中的一部分
	 */
	CForm.setFormReadOnly = function(form) {
		var $form = form ? $(form) : $("[cf_elementType=form]").eq(0);
		if (!$form.length) {
			alert("未获取到要操作的表单！");
			return;
		}
		
		// 将所有可见域设置成只读
		var fields = $form.find("[cf_elementType=field]:visible");
		$.each(fields, function(i,field) {
			// 设置域只读
			CForm.setFieldReadOnly(field);
		});
		
		// 设置动态行和可编辑列表序号列的背景色、隐藏操作列
		$form.find(".cfDynRow").each(function(i,dynRow){
			// 处理序号列
			$(dynRow).find("tbody tr").each(function(i,tr){
				$(tr).find("td:first").addClass("cfIsReadonly");
			});
			
			// 隐藏操作列
			$(dynRow).find("th:last").hide();
			$(dynRow).find(".cfAddAndDelTd").hide();
		});
		
		// 处理可编辑列表
		if($form.hasClass("cfEditGrid")){
			setEditGridReadOnly($form);
			return;
		}
		
		$form.find(".cfEditGrid").each(function(i,editGrid){
			setEditGridReadOnly(editGrid);
		});
		
		function setEditGridReadOnly(editGrid){
			// 隐藏可编辑列表的“增加”按钮
			$(editGrid).find(".cfAddEditGrid").hide();
			// 设置可编辑列表的的背景颜色
			$(editGrid).find("tbody tr td").each(function(i,td){
				$(td).addClass("cfIsReadonly");
			});
			// 显示可编辑列表右侧的“查看”按钮，为兼容有tab页的情况，不使用tr:visible选择
			if($(editGrid).find("tr[cf_recordState=1],tr[cf_recordState=3]").length){
				$(editGrid).find("th:last").show();
				$(editGrid).find("tbody .cfAddAndDelTd").show().addClass("cfIsReadonly");
				$(editGrid).find("tbody .cfAddAndDelTd input").hide();
				$(editGrid).find("tbody .cfAddAndDelTd .cfCheckRow").show();
			}
		};
	};
	
	/**
	 * 将所有域替换为标签(为兼容保留)
	 */
	CForm.setToLabel = CForm.setFormReadOnly;

	/**
	 * 获取行（列）合计关联的表单域
	 */
	CForm.getSumFieldRefs = function(sumField) {
		// 返回值
		var refFields = [];
		// 合计域
		var $sumField = $(sumField);
		// 如果是行合计
		if ($sumField.hasClass("cfRowSum")) {
			var sumRule = $sumField.attr("cf_sumRule");
			if (sumRule){
				var sumRuleArr = sumRule.split("#");
				var operation = "+-*/()";
				for (var i = 0; i < sumRuleArr.length; i++) {
					var sumRuleItem = sumRuleArr[i];
					// 判断sumRuleItem是否为操作符
					if (operation.indexOf(sumRuleItem) == -1) {
						// 域ID放入返回值
						refFields.push(sumRuleItem);
					}
				}
			}
		}
		// 列合计
		else if ($sumField.hasClass("cfColSum")) {
			var index = $sumField.parent().prevAll().length;
			var $tbody = $sumField.parents("tfoot").next();
			var $td = $("tr:first td:eq(" + index + ")", $tbody);
			var refFieldId = $("[cf_elementType=field]", $td).attr("id");
			if (refFieldId) {
				refFields.push(refFieldId);
			}
		}
		
		return refFields;
	};
	
	/**
	 * 构建初始化动态行数据
	 */
	CForm.addRows = function($dynRow, $tr, byAttr, dataInfo) {
		var value = dataInfo.zoneData;
		var isEditGrid = false;
		var fragment = document.createDocumentFragment();
		if($dynRow.hasClass("cfEditGrid")){
			isEditGrid = true;
			$dynRow.find(".cfDynRowTable tbody tr:visible").remove();
		}
		var num = value.length;
		
		// 设置分页信息
		if(!CForm.isInitialized && $dynRow.attr("cf_isPaging") == "true"){
			var limit = $dynRow.find(".pageBarContainer .pageSize option:first").val();
			if(!limit)
				limit = 10;
			// 总页数
			$dynRow.find(".pageBarContainer .totalPage").html(Math.ceil(dataInfo.pageInfo.total/limit));
			// 总条数
			$dynRow.find(".pageBarContainer .totalNum").html(dataInfo.pageInfo.total);
		}
		for ( var i = 0; i < num; i++) {
			// 第（i+1）行数据
			var record = value[i];
			
			var $cloneTr = $tr.clone(true);
			
			// 修改单选按钮name属性，否则会与其他行的单选按钮成一组
			$cloneTr.find(":radio").attr({
				name: "r_" + new Date().getTime()
			});
			
			// 设置序号
			var rowNum = record["SUB_TBL_NUM"];
			if(!rowNum){
				rowNum = i+1;
			}
			$cloneTr.find("td:first label").text(rowNum);
			
			// 产生一个32位随机数，赋给id为SUB_TBL_PK的域
			var pk = CForm.createUUID();
			$cloneTr.find("#SUB_TBL_PK").val(pk);
			
			var $fields = $cloneTr.find("[" + byAttr + "]");
			$.each($fields, function(idx, field) {
				var val = record[$(field).attr(byAttr)];
				if (val) {
					if($(field).attr("id")!="SUB_TBL_PK"){
						CForm.setFieldValue(field, val);
					}else{
						CForm.setFieldValue(field, CForm.createUUID());
					}
					// 在分页的情况下，如果在流程定义中将域设置成只读状态，则需要将域重新设置成只读
					if($(field).parent().hasClass("cfIsReadonly")){
						CForm.setFieldReadOnly(field);
					}
				}
				if(isEditGrid && field.type != "hidden"){
					CForm.setFieldReadOnly(field);
					$(field).parent().removeClass("cfIsReadonly");
				}
			});
			
			fragment.appendChild($cloneTr[0]);
		}
		
		// 一次性添加到DOM
		$dynRow.find(".cfDynRowTable tbody").append(fragment);
	};
	
	/**
	 * 动态行-新增行
	 */
	CForm.addRow = function($dynRow, $curRow) {
		var $cloneTr = $curRow.clone(true);
		// 将数据状态设置为新增
		$cloneTr.attr("cf_recordState","1");

		// 清空输入域的值(按钮、单选、复选、隐藏域的值不能清空)
		$cloneTr.find(":input[type!=button][type!=radio][type!=checkbox][type!=hidden]").val('');
		// 移除只读时设置的值
		$cloneTr.find(".readOnlyFieldVal").remove();
		// 产生一个32位随机数，赋给id为SUB_TBL_PK的域
		var pk = CForm.createUUID();
		$cloneTr.find("#SUB_TBL_PK").val(pk);
		
		// 设置单选按钮为未选中状态，并修改name属性，否则会与其他行的单选按钮成一组
		$cloneTr.find(":radio").attr({
			checked: false,
			name: "r_" + new Date().getTime()
		});
		
		// 设置复选框为未选中状态
		$cloneTr.find(":checkbox").attr("checked", false);
		
		$curRow.after($cloneTr);
		
		// 序号重排
		// 获取当前行的行号
		var curNum = parseInt($curRow.find("td:first label").text());
		// 只有当前行之后的行才需要重新设置行号
		var $trs = $curRow.nextAll("tr[cf_recordState]:visible");
		$trs.each(function(i,tr){
			$(tr).find("td:first label").text(i+1+curNum);
		});
		
		return $cloneTr;
	};

	/**
	 * 动态行-删除行
	 */
	CForm.delRow = function($dynRow, $curRow) {
		// 序号重排
		// 获取当前行的行号
		var curNum = parseInt($curRow.find("td:first label").text());
		// 只有当前行之后的行才需要重新设置行号
		var $nextAllTrs = $curRow.nextAll("tr[cf_recordState]:visible");
		$nextAllTrs.each(function(i,tr){
			$(tr).find("td:first label").text(i+curNum);
		});
		
		// 动态行中所有可见行，即状态为1或3的行(为了兼容有tab页的情况，所以不用tr:visible)
		var $allTrs = $dynRow.find("tr[cf_recordState=1],tr[cf_recordState=3]");
		var $ftr = $allTrs.first();
		var $ltr = $allTrs.last();
		var curRecordState = $curRow.attr("cf_recordState");
		// 最后一行可见行的情况
		if ($ftr.is($ltr)) {
			// 模板行
			var $tempTr = $dynRow.find("tbody tr[cf_recordState=temp]");
			if ($tempTr.length) {// 有模板行
				if(curRecordState == "1"){
					$curRow.remove();
				}else{
					$curRow.attr("cf_recordState","2");
					$curRow.hide();
				}
			} else {// 没有模板行
				var $cloneCurRow = $curRow.clone(true);
				// 还原初始状态
				$curRow.find(':input[type!=button][type!=radio][type!=checkbox][type!=hidden]').val('');
				// 设置单选按钮、复选框为未选中状态
				$curRow.find(':radio, :checkbox').attr('checked', false);
				$curRow.attr("cf_recordState","temp");
				$curRow.hide();
				
				if(curRecordState != "1"){
					$cloneCurRow.attr("cf_recordState","2");
					$cloneCurRow.hide();
					$dynRow.find("tbody").append($cloneCurRow);
				}
			}
			// 可编辑列表不需要添加“增加”按钮
			if($dynRow.hasClass("cfEditGrid"))
				return;
			// 添加新增按钮
			$dynRow.find('th:last').append(
					$('<input type="button" value="增加" class="cfAddRow" style="margin-left: 10px;" />')
						.click(function(){
							// 获取模板行，显示，并重新设置主键
							var $tempRow = $dynRow.find("tbody tr[cf_recordState=temp]").eq(0);
							$tempRow.attr("cf_recordState","1");
							$tempRow.find("#SUB_TBL_PK").val(CForm.createUUID());
							$tempRow.show();
							// 移除当前按钮
							$(this).remove();
						})
					);
			return;
		}
		// 不是最后一行
		if(curRecordState == "1"){
			$curRow.remove();
		}else{
			$curRow.attr("cf_recordState","2");
			$curRow.hide();
		}
		
	};

	/**
	 * 构建初始化动态表格数据
	 */
	CForm.addTables = function($dynTable, $table, byAttr, value) {
		var fragment = document.createDocumentFragment();
		
		for ( var i = 1; i < value.length; i++) {
			// 第（i+1）个表格数据
			var iData = value[i];
			
			var $cloneTable = $dynTable.clone(true);
			
			// 修改单选按钮name属性，否则会与其他表格的单选按钮成一组
			$cloneTable.find(":radio").attr({
				name: "r_" + new Date().getTime()
			});
			
			// 产生一个32位随机数，赋给id为SUB_TBL_PK的域
			var pk = CForm.createUUID();
			$cloneTable.find("#SUB_TBL_PK").val(pk);
			
			var $fields = $cloneTable.find("[" + byAttr + "]");
			$.each($fields, function(idx, field) {
				var val = iData[$(field).attr(byAttr)];
				if (val) {
					if($(field).attr("id")!="SUB_TBL_PK"){
						CForm.setFieldValue(field, val);
					}else{
						CForm.setFieldValue(field, CForm.createUUID());
					}
				}
			});
			
			fragment.appendChild($cloneTable[0]);
		}
		
		// 一次性添加到DOM
		$dynTable.after($(fragment));
	};
	
	/**
	 * 动态表格-新增表格
	 */
	CForm.addTable = function($dynTable) {
		var $cloneTable = $dynTable.clone(true);
		
		// 清空输入域的值(按钮、单选、复选、隐藏域的值不能清空)
		$cloneTable.find(":input[type!=button][type!=radio][type!=checkbox][type!=hidden]").val('');
		
		// 产生一个32位随机数，赋给id为SUB_TBL_PK的域
		var pk = CForm.createUUID();
		$cloneTable.find("#SUB_TBL_PK").val(pk);
		
		// 设置单选按钮为未选中状态，并修改name属性，否则会与其他表格的单选按钮成一组
		$cloneTable.find(":radio").attr({
			checked: false,
			name: "r_" + new Date().getTime()
		});
		
		// 设置复选框为未选中状态
		$cloneTable.find(":checkbox").attr("checked", false);
		
		$dynTable.after($cloneTable);
		
		return $cloneTable;
	};

	/**
	 * 动态表格-删除表格
	 */
	CForm.delTable = function($dynTable) {
		var length = $('[id=' + $dynTable.attr("id") + '][class=cfDynTable]').length;
		// 最后一个表格的情况
		if (length == 1) {
			// 还原初始状态
			$dynTable.find(':input[type!=button][type!=radio][type!=checkbox][type!=hidden]').val('');
			// 设置单选按钮、复选框为未选中状态
			$dynTable.find(':radio, :checkbox').attr('checked', false);
			
			// 重新设置主键值，再次编辑时相当于一条新记录
			$dynTable.find("#SUB_TBL_PK").val(CForm.createUUID());
			
			return;
		}
		// 不是最后一个表格，移除当前表格
		$dynTable.remove();
	};
	
	/**
	 * 新建动态行序号列、主键域
	 */
	CForm.loadDynRowNum = function(form) {
		var $form = form ? $(form) : $('[cf_elementType=form]').eq(0);
		if (!$form.length) {
			alert('未获取到要操作的表单！');
			return;
		}
		
		// 动态行
		var $drs = $form.find(".cfDynRow[cf_modelId]");
		if ($drs.length) {
			// 添加设置换行框
			$form.append("<div class='cfChangeRowDiv'>"
							+ "<label>输入行号&nbsp;(<font class='firstRowNum'></font>-<font class='lastRowNum'></font>)：</label>"
							+ "<input type='text' id='cfRowNumIn' name='cfRowNumIn'/>"
							+ "<label class='cfTipLabel'></label>"
							+ "<a href='javascript:;' id='cancelBtn' class='cfCancelBtn'>取消</a>"
							+ "<a href='javascript:;' id='confirmBtn' class='cfConfirmBtn'>确定</a>"
							+ "</div>");
			$.each($drs, function(){
				var $dr = $(this);
				var $numThs = $dr.find("th.cfNumCol");
				var $numTd = $dr.find(".cfDynRowTable tbody td:first");
				var uuid = CForm.createUUID();
				// 判断动态行定义期是否有序号列，兼容已有动态行
				if ($numThs.length) {
					$numTd.prepend("<input type='hidden' id='SUB_TBL_PK' name='主键' " 
							+ "cf_modelItemId='SUB_TBL_PK' cf_modelItemName='主键' " 
							+ "cf_elementType='field' value='" 
							+ uuid 
							+ "'/>");
				} else {
					// 添加序号列
					$("<th style='width:50px;'>序号</th>").insertBefore($("th:first", $dr));
					
					// 添加序号和主键隐藏域
					$("<td style='text-align:center;'>" 
							+ "<input type='hidden' id='SUB_TBL_PK' name='主键' cf_modelItemId='SUB_TBL_PK' cf_modelItemName='主键' "
							+ "cf_elementType='field' value='" 
							+ uuid 
							+ "'/>" 
							+ "<label>1</label>" 
							+ "</td>").insertBefore($numTd);
				}
			});
		}
	};
	
	/**
	 * 处理动态行分页按钮事件
	 */
	CForm.loadDynRowPageBtn = function(dynRow){
		var formId = $(dynRow).closest("[cf_elementType=form]").attr("id");
		var zoneId = dynRow.id;
		
		// 总条数
		var $totalNum = $(dynRow).find(".pageBarContainer .totalNum");
		// 总页数
		var $totalPage = $(dynRow).find(".pageBarContainer .totalPage");
		// 每页显示条数
		var $pageSize = $(dynRow).find(".pageBarContainer .pageSize");
		// 当前页数
		var $curPageNum = $(dynRow).find(".pageBarContainer .curPageNum");
		
		var limit = $pageSize.find("option:first").val();
		// 首页
		$(dynRow).find(".pageBarContainer .firstPage").click(function(){
			// 将当前页数设置为1
			$curPageNum.val(1);
			// 请求数据
			CForm.queryDynData(formId,zoneId,formDataId,1,limit,dynRow);
		});
		
		// 上一页
		$(dynRow).find(".pageBarContainer .dynPageUp").click(function(){
			// 当前页数
			var curPageNum = parseInt($curPageNum.val());
			
			var start = curPageNum-1;
			if(start < 1)
				start = 1;
			if(start > parseInt($totalPage.html()))
				start = parseInt($totalPage.html());
			// 设置当前页数
			$curPageNum.val(start);
			// 请求数据
			CForm.queryDynData(formId,zoneId,formDataId,start,limit,dynRow);
		});
		
		// 下一页
		$(dynRow).find(".pageBarContainer .dynPageDown").click(function(){
			// 当前页数
			var curPageNum = $curPageNum.val();
			// 总页数
			var totalPage = parseInt($totalPage.html());
			
			var start = parseInt(curPageNum)+1;
			if(start > totalPage)
				start = totalPage;
			// 设置当前页数
			$curPageNum.val(start);
			
			CForm.queryDynData(formId,zoneId,formDataId,start,limit,dynRow);
		});
		
		// 尾页
		$(dynRow).find(".pageBarContainer .endPage").click(function(){
			// 总页数
			var totalPage = parseInt($totalPage.html());
			// 设置当前页数
			$curPageNum.val(totalPage);
			
			CForm.queryDynData(formId,zoneId,formDataId,totalPage,limit,dynRow);
		});
		
		// 选择每页显示条数
		$pageSize.change(function(){
			limit=$(this).children("option:selected").val();
			$curPageNum.val(1);
			$totalPage.html(Math.ceil($totalNum.html()/limit));
			if($totalNum.html() == 0){
				$totalPage.html(1);
			}
			CForm.queryDynData(formId,zoneId,formDataId,1,limit,dynRow);
		});
		
		// 跳转页数
		$curPageNum.bind('keypress',function(event){
			if(event.keyCode != "13"){
				return;
			}
			var totalPage = parseInt($totalPage.html());
			var start = parseInt($(this).val());
			var re = /^[1-9]+[0-9]*]*$/;
			if(!re.test(start) || start>totalPage){
				alert("请输入1至"+totalPage+"的整数！");
				$(this).val(1);
				return;
			}
			CForm.queryDynData(formId,zoneId,formDataId,start,limit,dynRow);
		});
	}
	
	/**
	 * 分页查询动态行数据
	 */
	CForm.queryDynData = function(formId,zoneId,formDataId,start,limit,dynRow){
		var queryDynDataUrl = L5.webPath+"/command/dispatcher/"+
							  "org.loushang.cform.formdata.cmd.FormDataDispatcherCmd/queryDynData";
		
		var dynDataCfg = {
				url : queryDynDataUrl,
				data :"formId="+formId+"&zoneId="+zoneId+"&formDataId="+formDataId+"&start="+start+"&limit="+limit,
				dataType : "json",
				async : false,
				cache : false,
				success : function(dynData){
					CForm.setDynRowData($(dynRow),dynData[zoneId],"cf_modelItemId");
					if (taskType == '2' || taskType == '3' || taskType == '4') {
						// 将动态行所有可见域设置为只读
						CForm.setFormReadOnly(dynRow);
					}
				},
				error : function(){
					alert("请求数据出错");
				}
			};

		$.ajax(dynDataCfg);
	}
	
	/**
	 * 新建动态表格主键域
	 */
	CForm.loadDynTableNum = function(form) {
		var $form = form ? $(form) : $('[cf_elementType=form]').eq(0);
		if (!$form.length) {
			alert('未获取到要操作的表单！');
			return;
		}
		
		// 动态表格
		var $dts = $form.find(".cfDynTable[cf_modelId]");
		if ($dts.length) {
			$.each($dts, function(){
				var $dt = $(this);
				var uuid = CForm.createUUID();
				// 添加主键隐藏域
				$("td:first", $dt).append("<input type='hidden' id='SUB_TBL_PK' name='主键' " 
						+ "cf_modelItemId='SUB_TBL_PK' cf_modelItemName='主键' " 
						+ "cf_elementType='field' value='" 
						+ uuid 
						+ "'/>");
			});
		}
	};
	
	/**
	 * tab组件初始化
	 */
	CForm.initTab = function() {
		// Tab页组件
		$(".cfTab li").click(function() {
			var lis = $(this).parent().children("li");
			var panels = $(".cfTabBody");
			var index =$(this).index();
			
			if (panels.eq(index)[0]) {
				// 移除所有li的选中
				lis.removeClass("selected");
				// 移除li的左圆角以及右圆角选中状态
				lis.find('span').removeClass('tabLeftSelected').removeClass(
						'tabRightSelected');

				// 当前选中的li
				var selectedLi = lis.eq(index);
				selectedLi.addClass("selected");

				// 显示当前选中li的左圆角
				selectedLi.find('span').eq(0).addClass('tabLeftSelected');
				// 显示当前选中li的右圆角
				selectedLi.find('span').eq(2).addClass('tabRightSelected');

				// 显示体部
				panels.addClass("hide").eq(index).removeClass("hide");
			}
			if (taskType == '2' || taskType == '3' || taskType == '4') {
				var $curPanel = panels.eq(index);
				// 当前tab页中的可见域，排除可编辑列表的“查看”按钮
				var visibleField= $curPanel.find("[cf_elementType=field][class!=cfCheckRow]:visible");
				if(visibleField.length){
					// 将当前tab页设置成只读
					CForm.setFormReadOnly($curPanel);
				}
			}
		});
	};
	
	/**
	 * 日期、日期时间组件初始化
	 */
	CForm.initDate = function() {
		// 日期时间框组件
		window.CFormDateTime && window.CFormDateTime();

		// 日期框组件
		window.CFormDate && window.CFormDate();
	};
	
	/**
	 * 动态行初始化
	 */
	CForm.initDynRow = function() {
		// 加载序号列
		CForm.loadDynRowNum();
		$(".cfDynRow").each(function(i,dynRow){
			// 将默认行的状态设置为新增
			$(this).find(".cfDynRowTable tbody tr").attr("cf_recordState","1");
			
			if(typeof(formDataId) == "undefined" || !formDataId 
					|| $(this).attr("cf_isPaging") != "true"){
				// 首环节(即没有实例数据时)，将动态行的分页按钮隐藏
				$(this).find(".pageBarContainer").hide();
				return true;
			}
			
			// 分页
			CForm.loadDynRowPageBtn(this);
		});
		// 当前动态行
		var $curDynRow = null;
		// 动态行当前行
		var $curTr = null;
		
		// 可编辑列表的编辑区dialog
		var gridDialogMap = new CForm.Map();
		// 标识当前dialog的状态，1：新增 2：修改 3：查看
		var dialogState = 0;
		// 监听动态行单击事件，解析行（列）合计关联表单域
		$(".cfDynRow").click(function(evt) {
			/**
			 * 解析行（列）合计关联的表单域，绑定表单域change事件
			 */							
			// 记录已绑定的表单域ID，避免重复绑定
			var bindedField = new Object();
			// 行合计
			$(".cfRowSum").each(function() {
				var refFields = CForm.getSumFieldRefs(this);
				if(refFields.length) {
					for(var i = 0; i < refFields.length; i++){
						var fieldId = refFields[i];
						if(!bindedField[fieldId]){
							$("#" + fieldId).on("change", function(){
								$(this).parents("tr")
									.find(".cfRowSum").trigger("click");
							});
							bindedField[fieldId] = fieldId;
						}										
					}
				}
			});
			// 列合计
			$(".cfColSum").each(function(){
				var globalObj = this;
				var refFields = CForm.getSumFieldRefs(globalObj);
				if(refFields.length) {
					for(var i = 0; i < refFields.length; i++){
						var fieldId = refFields[i];
						$("#" + fieldId).on("change", function(){
							// 校验数字
							if(!$.isNumeric($(this).val())){
								alert("合计域只能输入数字！");
								return false;
							}
							// 列合计
							$(globalObj).trigger("click");
						});
					}
				}
			});
			// 取消绑定
			$(".cfDynRow").unbind("click");
		});
		
		// 增加一行按钮
		$(".cfAddRow").click(
				function() {
					var $dynRow = $(this).parents(
							".cfDynRow[cf_elementType=zone]").eq(0);
					var $curRow = $(this).parents("tr").eq(0);
					CForm.addRow($dynRow, $curRow);
				});

		// 删除一行按钮
		$(".cfDelRow").click(
				function() {
					var $dynRow = $(this).parents(
							".cfDynRow[cf_elementType=zone]").eq(0);
					var $curRow = $(this).parents("tr").eq(0);
					CForm.delRow($dynRow, $curRow);
				});
		
		// 换行
		$(".cfChangeRow").click(
				function(e) {
					$curDynRow = $(this).parents("tbody").eq(0);
					var totalRow = $("tr:visible", $curDynRow).length;
					if (totalRow == 1) {
						alert("只有一行，不能换行！");
						return false;
					}
					$curTr = $(this).parents("tr").eq(0);
					// 清空已有值
					$(".cfChangeRowDiv input").val("");
					// 第一行的行号
					var firstRowNum = $curDynRow.find("tr:visible:first td:first label").text();
					// 最后一行的行号
					var lastRowNum = $curDynRow.find("tr:visible:last td:first label").text();
					// 提示信息
					$(".cfChangeRowDiv .firstRowNum").text(firstRowNum);
					$(".cfChangeRowDiv .lastRowNum").text(lastRowNum);
					$(".cfChangeRowDiv").css({
								"left" : e.pageX - 175 + "px",
								"top" : e.pageY - 100 + "px"
							}).show();
				});
		
		// 取消换行
		$(".cfCancelBtn").click(
				function() {
					$(".cfChangeRowDiv label:eq(1)").text("");
					$(".cfChangeRowDiv").hide();
				});
		
		// 确定换行(将当前行移动到目标行处，并重新设置序号)
		$(".cfConfirmBtn").click(
				function() {
					// 目标行序号(即输入的序号)
					var targetRowNum = parseInt($("#cfRowNumIn").val());
					// 当前页第一行的序号
					var firstRowNum = parseInt($(".cfChangeRowDiv .firstRowNum").text());
					// 当前页最后一行的序号
					var lastRowNum = parseInt($(".cfChangeRowDiv .lastRowNum").text());
					// 目标行号必须介于第一行的序号和最后一行的序号之间
					var $label = $(".cfChangeRowDiv label:eq(1)");
					if(!targetRowNum || targetRowNum < firstRowNum || targetRowNum > lastRowNum) {
						$label.text("请输入" + firstRowNum + "到" + lastRowNum + "之间的整数！");
						return false;
					}
					// 清空提示
					$label.text("");
					// 隐藏设置序号框
					$(".cfChangeRowDiv").hide();
					
					var curRowNum = parseInt($curTr.find("td:first label").text());
					var curRowIndex = curRowNum-firstRowNum;
					
					if(targetRowNum == curRowNum) {
						return;
					}
					
					var targetIndex = targetRowNum-firstRowNum;
					// 记录开始行的索引和结束行的索引，用于序号重排
					var startIndex;
					var endIndex;
					// 换行
					if(targetRowNum < curRowNum) {
						startIndex = targetIndex;
						endIndex = curRowIndex;
						$curTr.insertBefore($("tr:visible:eq(" + targetIndex + ")", $curDynRow));
					} else {
						startIndex = curRowIndex;
						endIndex = targetIndex;
						$curTr.insertAfter($("tr:visible:eq(" + targetIndex + ")", $curDynRow));
					}
					
					// 序号重排，只排列序号发生变动的行，即当前行与目标行之间的行
					$curDynRow.find("tr:visible").slice(startIndex,endIndex+1).each(function(i,tr){
						$(tr).find("td:first label").text(firstRowNum+i+startIndex);
					});
				});
		
		// 行合计
		$(".cfRowSum").click(function(evt) {
			var sumRule = $(this).attr("cf_sumRule");
			if(sumRule){
				var sumRuleArr = sumRule.split("#");
				var operation = "+-*/()";
				for(var i = 0; i < sumRuleArr.length; i++) {
					var sumRuleItem = sumRuleArr[i];
					// sumRuleItem不是操作符
					if(operation.indexOf(sumRuleItem) == -1){
						// 获取同行中该域的值
						var curTr = $(this).parents("tr").eq(0);
						// 校验合计域是否存在
						var $sumF = $("#" + sumRuleItem, curTr);
						if (!$sumF.length) {
							alert("合计域[" + sumRuleItem + "]不存在！");
							sumRuleArr = [];
							return false;
						}
						var fieldValue = CForm.getFieldValue($("#" + sumRuleItem, curTr)[0]);
						if (!fieldValue) {
							fieldValue = 0;
						}
						sumRuleArr[i] = fieldValue;
					}
				}
				var valueExp = sumRuleArr.join("");
				var val = null;
				try {
					val = eval(valueExp);
				} catch (e) {
					alert("合计发生异常！请检查表达式及域值是否合法！");
					return false;
				}
				$(this).val(val);
			}			
		});
		
		// 列合计
		$(".cfColSum").click(function(evt) {
			var sumValue = 0;
			var index = $(this).parent().prevAll().length;
			var $tbody = $(this).parents("table").find("tbody");
			$("tr",$tbody).each(function(){
				var $td = $(this).children().eq(index);
				var fieldValue = $("[cf_elementType=field]", $td).val();
				if(fieldValue){
					sumValue += parseFloat(fieldValue);
				}				
			});
			$(this).val(sumValue);
			
			// 如果是只读模式，需将值显示到页面上
			if($(this).parent().hasClass("cfIsReadonly")){
				$(this).siblings(".readOnlyFieldVal").text(sumValue);
			}
		});
		
		// 增加一行按钮(可编辑列表)
		$(".cfAddEditGrid").click(
			function(){
				dialogState = 1;
				$curDynRow = $(this).parents(".cfEditGrid[cf_elementType=zone]").eq(0);
				gridDialogMap.get($curDynRow.attr("id"))
								.dialog({title: "列表编辑区--新增"});
				gridDialogMap.get($curDynRow.attr("id")).dialog("open");
			});
		
		// 修改一行按钮(可编辑列表)
		$(".cfModifyRow").click(
			function(){
				dialogState = 2;
				$curDynRow = $(this).parents(".cfEditGrid[cf_elementType=zone]").eq(0);
				$curTr = $(this).parents("tr").eq(0);
				var rowData = CForm.getRowData($curTr);
				CForm.setEditData(rowData);
				gridDialogMap.get($curDynRow.attr("id"))
								.dialog({title: "列表编辑区--修改"});
				gridDialogMap.get($curDynRow.attr("id")).dialog("open");
			});
		
		// 查看(用于可编辑列表在只读模式下时查看数据)
		$(".cfCheckRow").click(
			function(){
				dialogState = 3;
				$curDynRow = $(this).parents(".cfEditGrid[cf_elementType=zone]").eq(0);
				$curTr = $(this).parents("tr").eq(0);
				var rowData = CForm.getRowData($curTr);
				CForm.setEditData(rowData);
				gridDialogMap.get($curDynRow.attr("id"))
								.dialog({title: "列表编辑区--查看"});
				gridDialogMap.get($curDynRow.attr("id"))
								.dialog({buttons: {}});
				var checkDialog = gridDialogMap.get($curDynRow.attr("id"));
				checkDialog.dialog("open");
			});
			
		// 处理可编辑列表
		$(".cfEditGrid").each(function(){
			var $grid = $(this);
			// 将第一行隐藏起来，并将状态设置为temp，做为设置实例数据时的模板
			$grid.find("tbody tr:first").hide().attr("cf_recordState","temp");
			
			// 将可编辑列表中的编辑区缓存起来
			var $editDialog = $grid.find(".cfEditGridDialog");
			// 初始化dialog
			var dialog = $editDialog.dialog({
				autoOpen : false,
				width : "auto",
				modal : true,
				close : function(){CForm.resetEditTable()},
				closeText : "关闭",
				buttons : {
					"确定" : function(){
						var datajson = CForm.getEditData();
						// 如果datajson为false，则说明数据校验未通过
						if(!datajson) {
							return false;
						}
						if(dialogState == 1){
							// 找到当前动态行的最后一行，做为模板，以及追加新行的位置
							var $curLastTr = $curDynRow.find(".cfDynRowTable tr").last();
							$curTr = CForm.addRow($curDynRow, $curLastTr).show();
						}
						CForm.setRowData(datajson);
						
						dialog.dialog("close");
					},
					"取消" : function(){
						dialog.dialog("close");
					}
				}
			});
			// 缓存
			gridDialogMap.put($grid.attr("id"),dialog);
		});
		
		// 获取列表区当前行的值
		// 返回值的结构为{编辑域ID：列表域值}
		CForm.getRowData = function(){
			var dataJson = {};
			
			// 获取当前行中，所有与编辑区有映射关系的域
			$curTr.find("[cf_editfieldid]").each(function(i,field){
				// 编辑区的域ID
				var editfieldid = $(field).attr("cf_editfieldid");
				var fieldValue = CForm.getFieldValue(field);
				
				// 组装域值
				if(editfieldid){
					dataJson[editfieldid] = fieldValue;
				}
			});
			
			return dataJson;
		};
		
		// 设置列表区当前行的值
		CForm.setRowData = function(jsonObj){
			$curTr.find("[cf_editfieldid]").each(function(i,field){
				// 将以前设置只读时加上的<font>value</font>值去掉，否则会重复显示
				$(field).next("font.readOnlyFieldVal").remove();
				// 获取域值
				var editFieldId = $(field).attr("cf_editfieldid");
				var editFieldValue = jsonObj[editFieldId];
				// 设置域值
				CForm.setFieldValue(field,editFieldValue);
				
				if(field.type == "hidden"){
					return true;
				}
				
				// 可编辑列表中列表区的域都要设置成只读，防止在列表区直接修改数据
				CForm.setFieldReadOnly(field);
				$(this).parent().removeClass("cfIsReadonly");
			});
		};
		
		// 获取编辑区的值
		CForm.getEditData = function() {
			var dataJson = {};
			
			// 当前可编辑列表的编辑区ID为当前可编辑列表的ID后面加上"_dialog"
			var curDialogId = $curDynRow.attr("id")+"_dialog";
			// 编辑区中的所有域
			var $curEditfields = $("#"+curDialogId).find("[cf_elementtype=editField]");
			$curEditfields.each(function(){
				var editFieldId = $(this).attr("id");
				var editFieldValue = $("#"+editFieldId)[0].value;
				
				// 校验数据
				var isVal = CForm.valEditData(editFieldId, editFieldValue);
				if(!isVal) {
					dataJson = false;
					return false;
				}
				dataJson[editFieldId] = editFieldValue;
			})
			
			return dataJson;
		};
		
		// 数据校验
		CForm.valEditData = function(editFieldId, value) {
			var $field = $curDynRow.find("[cf_editfieldid="+editFieldId+"]:first");
			value = $.trim(value);
			var fieldName = $field.attr("name");
			
			// 非空
			if($field.hasClass("cfIsRequired")) {
				var isValid = true;
				switch ($field.attr("type")) {
					// 列表框
					case "select-multiple":
						// 至少选中一项
						$options = $field.find("option:selected");
						if (!$options.length) {
							isValid = false;
						}
	
						break;
					// 单选按钮
					case "radio":
						// 同一组中至少有一个选中
						$radios = $(":radio[name=" + fieldName + "]:checked");
						if (!$radios.length) {
							isValid = false;
						}
	
						break;
					// 复选框
					case "checkbox":
						// 同一组中至少有一个选中
						$checkboxes = $(":checkbox[name=" + fieldName + "]:checked");
						if (!$checkboxes.length) {
							isValid = false;
						}
	
						break;
					default:
						if (!value) {
							isValid = false;
						}
	
						break;
				}
				
				if(!isValid) {
					alert("[" + fieldName + "]不能为空！");
					return false;
				}
			}
			
			// 整数
			if($field.hasClass("cfIsInteger")) {
				if (value && !CForm.isInteger(value)) {
					alert("[" + fieldName + "]必须为整数！");
					return false;
				}
			}
			
			// 小数
			if($field.hasClass("cfIsFloat")) {
				if (value) {
					if (!CForm.isFloat(value)) {
						alert("[" + fieldName + "]必须为小数！");
						return false;				
					}else {
						// 精确度校验
						var precision = $field.attr("cf_fieldPrecision");
						if (precision) {
							var floatLength = value.toString().split(".")[1].length;
							if (floatLength > precision) {
								alert("[" + fieldName + "]最多"+precision+"位小数！");
								return false;
							}
						}
					}
				}
			}
			
			// 邮政编码校验
			if($field.hasClass("cfIsZipCode")){
				if (value && !CForm.isZipCode(value)) {
					alert("域[" + fieldName + "]的值不符合电子邮件格式！");
					return false;	
				}
			}
			
			// 电子邮件校验
			if($field.hasClass("cfIsEmail")){
				if (value && !CForm.isEmail(value)) {
					alert("域[" + fieldName + "]的值不符合正则表达式规则！");
					return false;
				}
			}
			
			// 身份证号校验
			if($field.hasClass("cfIsIdCard")){
				var result = L5.checkIdCard(value);
				if (value && result != true) {
					alert("域[" + fieldName + "]:" + result);
					return false;
				}
			}
			
			// 固定电话校验
			if($field.hasClass("cfIsPhoneNum")){
				if (value && !CForm.cfIsPhoneNum(value)) {
					alert("域[" + fieldName + "]的值不符合固定电话格式！\r如果有区号，请使用[区号-座机号]的形式。");
					return false;
				}
			}
		
			// 手机号码校验
			if($field.hasClass("cfIsMobileNum")){
				if (value && !CForm.cfIsMobileNum(value)) {
					alert("域[" + fieldName + "]的值不符合手机号码格式！");
					return false;
				}
			}
			
			// 正则表达式校验
			if($field.hasClass("cfIsRegExp")){
				var reg = $field.attr("cf_regExp");
				if (reg) {
					var val = $.trim(value);
					if(val && !eval(reg).test(val)) {
						alert("域[" + fieldName + "]的值不合法！");
						return false;
					}
				}
			}
			
			return true;
		}
		
		// 设置编辑区的值
		CForm.setEditData = function(jsonObj){
			// 当前可编辑列表的编辑区ID为当前可编辑列表的ID后面加上"_dialog"
			var curDialogId = $curDynRow.attr("id")+"_dialog";
			
			for(var key in jsonObj){
				$("#"+key).val(jsonObj[key]);
			}
			
			// 如果当前编辑区的状态为3，则表示“查看”状态
			if(dialogState == 3){
				var fields = $("#"+curDialogId).find("[cf_elementType=editField]");
				$.each(fields, function() {
					// 设置域只读
					CForm.setFieldReadOnly(this);
				});
			}
		};
		
		// 清空编辑区
		CForm.resetEditTable = function(){
			// 当前编辑区
			var $curDialog = $("#"+$curDynRow.attr("id")+"_dialog");
			// 清空输入域的值(单选、复选、按钮的值不能清空)
			$curDialog.find(":input[type!=radio][type!=checkbox][type!=button]").val("");
			// 设置单选按钮为未选中状态，并修改name属性
			$curDialog.find(":radio").attr({checked: false});
			// 设置复选框为未选中状态
			$curDialog.find(":checkbox").attr("checked", false);
			
			// 只读状态下，TD中会有文本，需要移除
			if(dialogState == 3){
				$curDialog.find("font.readOnlyFieldVal").remove();
			}
		}
	};
	
	/**
	 * 动态表格初始化
	 */
	CForm.initDynTable = function() {
		// 加载序号列
		CForm.loadDynTableNum();
		
		// 增加一个表格
		$('.cfAddTable').click(
				function() {
					var $dynTable = $(this).parents(
							".cfDynTable[cf_elementType=zone]").eq(0);
					CForm.addTable($dynTable);
				});

		// 删除一个表格
		$('.cfDelTable').click(
				function() {
					var $dynTable = $(this).parents(
							".cfDynTable[cf_elementType=zone]").eq(0);
					CForm.delTable($dynTable);
				});
	};
	
	/**
	 * 域长度控制初始化
	 */
	CForm.initFieldLengthCtr = function() {
		// 控制text的长度
		$(".cfText").keyup(function(event) {
			var len = parseInt($(this).attr("cf_fieldLength"));
			if(!len) {
				len = 100;
			}		

			var strVal = $(this).val().toString()+"";
		    //预期计数：中文2字节，英文1字节 
		    var a = 0; 
		    //临时字串
		    var temp = ''; 
		    for (var i = 0;i < strVal.length;i ++) 
		    { 
		        if (strVal.charCodeAt(i) > 255)  
		        {
		            //按照预期计数增加2 
		             a+=2; 
		        } 
		        else 
		        { 
		             a++; 
		        } 
		        //如果增加计数后长度大于限定长度，就直接返回临时字符串 
		        if(a > len) { $(this).val(temp); return false;} 
		        //将当前内容加到临时字符串 
		        temp += strVal.charAt(i); 
		    } 
		});

		// 控制textarea的长度
		$(".cfTextArea").keyup(function(event) {
			var len = parseInt($(this).attr("cf_fieldLength"));
			if(!len) {
				len = 500;
			}		

			var strVal = $(this).val().toString()+"";
		    //预期计数：中文2字节，英文1字节 
		    var a = 0; 
		    //临时字串
		    var temp = ''; 
		    for (var i = 0;i < strVal.length;i ++) 
		    { 
		        if (strVal.charCodeAt(i) > 255)  
		        {
		            //按照预期计数增加2 
		             a+=2; 
		        } 
		        else 
		        { 
		             a++; 
		        } 
		        //如果增加计数后长度大于限定长度，就直接返回临时字符串 
		        if(a > len) { $(this).val(temp); return false;} 
		        //将当前内容加到临时字符串 
		        temp += strVal.charAt(i); 
		    }
		});
	};
	
	/**
	 * 多行文本框高度自适应
	 */
	CForm.initAutoHeight = function() {
		$("textarea[cf_elementType=field]").css({
			minHeight: 5,
			maxHeight: 300
		}).autosize({resizeDelay:0});
	};
	/**
	 * 组织通用帮助
	 * @param {String} selectType 选择类型
	 * @param {String} isUseDataPermit 是否启用数据权限控制
	 */
	function selectOrgan(selectType, isUseDataPermit) {
		var L5_webPath = bspAppPath + "/service/bsp/organHelp";
		var url = "";
		switch (selectType) {
		//选择人员(单选)
		case "80":
			if (isUseDataPermit == "1") {
				//进行数据权限控制
				url = L5_webPath 
				+ "?isChkbox=0&selType=8&struType=00&isDataPermitControl=1"
			} else {
				//不进行数据权限控制
				url = L5_webPath
				+ "?isChkbox=0&selType=8&struType=00&isDataPermitControl=0";
			}
			break;
		//选择人员(复选)
		case "81":
			if (isUseDataPermit == "1") {
				//进行数据权限控制
				url = L5_webPath
				+ "?isChkbox=1&selType=8&struType=00&isDataPermitControl=1"
			} else {
				//不进行数据权限控制
				url = L5_webPath
				+ "?isChkbox=1&selType=8&struType=00&isDataPermitControl=0";
			}
			break;
		//选择部门(单选)
		case "60":

			if (isUseDataPermit == "1") {
				//进行数据权限控制
				url = L5_webPath
				+ "&?isChkbox=0&selType=2&struType=00&isDataPermitControl=1&showableType=1;2"
			} else {
				//不进行数据权限控制
				url = L5_webPath
				+ "?isChkbox=0&selType=2&struType=00&isDataPermitControl=0&showableType=1;2";
			}
			break;
		//选择部门(复选)
		case "61":

			if (isUseDataPermit == "1") {
				//进行数据权限控制
				url = L5_webPath
				+ "?isChkbox=1&selType=2&struType=00&isDataPermitControl=1&showableType=1;2"
			} else {
				//不进行数据权限控制
				url = L5_webPath
				+ "?isChkbox=1&selType=2&struType=00&isDataPermitControl=0&showableType=1;2";
			}
			break;
		}
		return url;
	}
	/**
	 * 通用帮助初始化
	 */
	CForm.initCommonHelp = function() {
		// 组织通用帮助
		$(".cfOrganCommonHelp").click(function(evt) {
			// 选择类型
			var selectType = $(this).attr('cf_selectType');
			// 是否启用数据权限
			var isUseDataPermit = $(this).attr('cf_isUseDataPermit');
			
			var organIdField = $(this).attr('cf_organIdField');
			var organNameField = $(this).attr('cf_organNameField');
			var curTd = $(this).parent();
			// 调用BSP组织通用帮助
			var rtnUrl = selectOrgan(selectType, isUseDataPermit);
			$.dialog({
		        type: 'iframe',
		        url: rtnUrl,
		        title: L.getLocaleMessage("cf.selectorganization", "组织通用帮助"),
		        width: 260,
		        height: 400,
		        onclose: function () {
		            var struData = this.returnValue;
		            // 返回值
		        	var rtnObj = {
		        		organId : [],
		        		organName : []
		        	};
		            if(struData.length>0){
		            	for ( var i = 0; i < struData.length; i++) {
		            		rtnObj.organId.push(struData[i].organId);
		            		rtnObj.organName.push(struData[i].organName);
		            	}
		            }
		            var organIdStr = rtnObj.organId.join(',');
					var organNameStr = rtnObj.organName.join(',');
					if (!(organIdStr && organIdStr != ',,,,,,,')) {
						organIdStr = organNameStr = '';
					}
					$('#' + organIdField, curTd).val(organIdStr);
					$('#' + organNameField, curTd).val(organNameStr);
		        },
		    });
		});
	};
	/*
	 * 文件上传
	 */
	CForm.initFile = function(){
		//控制同一文件不能连续上传
		var canUp = false;
		//点击文本框打开文件选择框
		$(document).on("click",".cfFile>.cfFileField>input[type=text]",function(){
			canUp = true;
			$(this).parent().find("input[type=file]").click();
		});
		//选择文件后再文本框中显示文件名
		$(document).on("change",".cfFile>.cfFileField>input[type=file]",function(){
			$(this).parent().find("input[type=text]").val(this.files[0].name);
		})
		//点击上传按钮
		$(document).on("click",".cfFile>.cfFileUpload",function(){
			var $file = $(this).parent().find("input[type=file]");
			var $fileText = $(this).parent().find("input[type=text]");
			var $fileContainer = $(this).parents(".cfFile").find(".cfFileContainer");
			var fileurl = $file.val();
			if(fileurl!=""&&canUp){
				$.ajaxFileUpload({
			        url: L5.webPath + "/service/cform/file/upload", 
			        type: 'post',
			        secureuri: false,
			        fileElementId: 'file',
			        dataType: 'text',
			        async:false,
			        success: function(data, status){
			        	canUp = false;
			        	if(data!=""){
			        		data = data.split("@");
			        		$fileContainer.append($('<li id='+data[0]+'><div class="filename">'+data[1]+'</div><div class="filedel">×</div></li>'))
			        	}
			        },
			        error: function(data, status, e){ 
			        }
			    });
			}
		})
		//点击下载
		$(document).on("click",".cfFile>.cfFileContainer .filename",function(){
			var uuid = $(this).parent().attr('id');
			var fileName = $(this).text();
			window.location.href = L5.webPath + "/service/cform/file/download?uuid="+uuid+"&fileName="+fileName; 
		});
		//点击删除
		$(document).on("click",".cfFile>.cfFileContainer .filedel",function(){
			var $file = $(this).parent();
			var uuid = $file[0].id;
			var fileName = $file.find(".filename").text();
			var url = L5.webPath + "/service/cform/file/delete"
			$.ajax({
				url:url,
				data:JSON.stringify({"uuid":uuid,"fileName":fileName}),
				contentType: "application/json",  
				type:"POST",
				success:function(data){
					if(data){
						$file.remove();
					}
				}
			})
		});
	};
	/**
	 * 文件批量上传
	 */
	CForm.initFiles = function(){
		var fileFormat = ""
		var fileSize = 	""
		//增加按钮事件
		$(document).on("click",".cfFiles>.cfFilesFields>.cfFilesField>.cfFileAdd",function(){
			var $cfFileInfo = $(this).parents(".cfFiles").find(".cfFileInfo");
			//剩余可增加数量
			var fileNumber = $cfFileInfo.attr("cf_number");	
			if(fileNumber>1){
				//复制本身为模板
				var $tpl = $(this).parents(".cfFilesField").clone();
				//修改按钮
				$tpl.find(".cfFileAdd")
				.addClass("cfFileDel")
				.removeClass("cfFileAdd")
				.text("删除");
				//文件选择框清空值
				$tpl.find(".cfFilesSelect")
				.val("")
				.removeClass("hasFile")
				.removeAttr("id");
				//增加文件选择框
				$(this).parents(".cfFilesFields").append($tpl);
				$cfFileInfo.attr("cf_number",(Number(fileNumber)-1))
			}
		});
		//删除按钮事件
		$(document).on("click",".cfFiles>.cfFilesFields>.cfFilesField>.cfFileDel",function(){
			var $cfFileInfo = $(this).parents(".cfFiles").find(".cfFileInfo");
			var fileNumber = $cfFileInfo.attr("cf_number");	
			$(this).parents(".cfFilesField").remove();
			$cfFileInfo.attr("cf_number",(Number(fileNumber)+1));	
		});
		//对文件选择框绑定值改变事件
		$(document).on("change",".cfFilesSelect",function(){
			var $cfFileInfo = $(this).parents(".cfFiles").find(".cfFileInfo");
			var formatStr = $cfFileInfo.attr("cf_format");
			var formatRegex = "("+formatStr.split(",").join('|')+")$";
			var re=new RegExp(formatRegex);  
			var fileSize = $cfFileInfo.attr("cf_size");
			var $file = $(this);
			var val = $file.val();
			if(val!=""){
				var fileExt = val.substring(val.lastIndexOf("."))
				curFileSize = this.files[0].size
				if(!(curFileSize / (1024 * 1024) < fileSize) ){
					alert("文件大小超出限制！");
					$file.val("");
					return false;
				}
				if(!(re.test(fileExt))){
					alert("文件类型超出限制！");
					$file.val("");
					return false;
				}
				var uuid = CForm.createUUID();
				$file.attr("id",uuid);
				$file.addClass("hasFile");
			}else{
				$file.removeAttr("id");
				$file.removeClass("hasFile");
			}
		});
		//点击下载
		$(document).on("click",".cfFiles>.cfFilesFields .cfFilelink",function(){
			var uuid = $(this).parent().attr('id');
			var fileName = $(this).text();
			window.location.href = L5.webPath + "/service/cform/file/download?uuid="+uuid+"&fileName="+fileName; 
		});
		//删除文件
		$(document).on("click",".cfFiles>.cfFilesFields .cfFileDelIcon",function(){
			var $file = $(this).parent();
			var uuid = $file[0].id;
			var fileName = $file.find(".cfFilelink").text();
			var url = L5.webPath + "/service/cform/file/delete"
			$.ajax({
				url:url,
				data:JSON.stringify({"uuid":uuid,"fileName":fileName}),
				contentType: "application/json",  
				type:"POST",
				success:function(data){
					if(data){
						$file.remove();
					    var $files = $(".cfFilesFields").find(".hasFile[type=file]"); //获取所有有值的上传附件框
					    var $oldfiles = $(".cfFilesFields").find(".cfFilelink");//兼容编辑环节若不设置只读则可以继续上传
					    var list = [];
					    if($files.length>0){
					    	$files.each(function(){
					    		var uuid = $(this).attr('id');
					    		var name = this.files[0].name;
					    		var obj = {
					    				[uuid]:name
				    			}
				    			list.push(obj);
					    	});
					    	
					    }
					    if($oldfiles.length>0){
				    		$oldfiles.each(function(){
				    			var uuid = $(this).parent().attr('id');
					    		var name = $(this).text();
					    		var obj = {
					    				[uuid]:name
				    			}
				    			list.push(obj);
				    		});
				    	}
					    $(".cfFiles>input").val(JSON.stringify(list));
					}
				}
			})
		});
	};
	/*
	 * 执行文件批量上传
	 */
	CForm.uploadFiles = function(){
		var dtd = $.Deferred();
	    var $files = $(".cfFilesFields").find(".hasFile[type=file]"); //获取所有有值的上传附件框
	    var $oldfiles = $(".cfFilesFields").find(".cfFilelink");//兼容编辑环节若不设置只读则可以继续上传
	    if($files.length>0){
	    	var ids = [];
	    	var list = [];
	    	$files.each(function(){
	    		var uuid = $(this).attr('id');
	    		var name = this.files[0].name;
	    		ids.push(uuid);
	    		var obj = {
	    				[uuid]:name
    			}
    			list.push(obj);
	    	});
	    	if($oldfiles.length>0){
	    		$oldfiles.each(function(){
	    			var uuid = $(this).parent().attr('id');
		    		var name = $(this).text();
		    		var obj = {
		    				[uuid]:name
	    			}
	    			list.push(obj);
	    		});
	    	}
	    	$(".cfFiles>input").val(JSON.stringify(list));
	    	CForm.uploadEvent(ids,dtd);
	    }else{
	    	dtd.resolve();
	    }
		return dtd.promise();
	};
	CForm.uploadEvent = function(ids,dtd){
		$.ajaxFileUpload({
			url: L5.webPath + "/service/cform/file/upload?uuid="+ids[0], 
			type: 'post',
			secureuri: false,
			fileElementId: ids[0],
			dataType: 'text',
			async: false,
			success: function(data, status){
				ids.splice(0,1);//将已经上传的文件id在数组中移除，splice会同时改变数组长度
				if(ids.length!=0){
					CForm.uploadEvent(ids,dtd);
				}else{
					dtd.resolve();
				}
			},
			error: function(data, status, e){ 
				var cf = confirm($("#"+ids[0])[0].files[0].name + "文件上传失败，是否重新上传");
				if(cf==true){
					CForm.uploadEvent(ids,dtd);
				}
			}
		});
	};
	//初始化级联查询
	CForm.initDynSelect = function(){
		//所有关联子级的父级
		var $dynSelect = $("select[cf_databindchild]");
		
		//对父级绑定值改变事件
		$dynSelect.on("change",function(){
			//将父级下拉框的值显式存储
			$(this).attr("cf_databindchildparam",$(this).val());
			//清空子孙级下拉框选项
			$(this).trigger("removechildselectoption");
			//更新子级选项
			$(this).trigger("updatechildselectoption");
			//初始化子孙级查询插件
			$(this).trigger("updatechildselectdynquery");
			
		});
		
		//递归清空子孙级下拉框选择项
		$("select[cf_databindchild]").on("removechildselectoption",function(){
			var $self = $(this);
			var childselectid = $self.attr("cf_databindchild");
			if(childselectid != "" && childselectid != null){
				$("#"+childselectid).empty().append('<option value="">--请选择--</option>')
				.trigger("removechildselectoption");
			}else{
				return;
			}
		});
		
		//初始化子孙级查询插件
		$("select[cf_databindchild]").on("updatechildselectdynquery",function(){
			var $self = $(this);
			var childselectid = $self.attr("cf_databindchild");
			if(childselectid != "" && childselectid != null){
				var $childselect = $("#"+childselectid);
				if($childselect.hasClass("cfDynQuery")){
					$childselect.comboSelect()
				}
				$childselect.trigger("updatechildselectdynquery");
			}else{
				return;
			}
		});
		
		//更新子级选项
		$("select[cf_databindchild]").on("updatechildselectoption",function(){
			var $self = $(this);
			//子级id
			var childselectid = $self.attr("cf_databindchild");
			//子级数据绑定参数，该值即父级值
			var childselectparam = $self.attr("cf_databindchildparam");
			//父级Id
			var parentselectid = $self.attr("id");
			//表单id
			var formId = $self.closest("[cf_elementType=form]").attr("id");
			
			if(childselectparam != "" && childselectparam != null){
				//组装用于获取子级数据绑定的参数
				var databindparam = {
						"formId":formId,//用于获取父级数据绑定参数
						"fieldId":parentselectid,//用于获取父级数据绑定参数
						"param":childselectparam//用于获取二级字典项
				};
				//获取子级下拉框选项值
				$.ajax({
					url:L5.webPath + "/service/cform/dynselect/update",
					data:JSON.stringify(databindparam),
					contentType: "application/json",  
					type:"POST",
					async:false,
					success:function(data){
						$("#"+childselectid).empty()//清空子级下拉框原选择项
						.append($(data))//更新选择项
					}
				});
			}
		});
		//绑定子孙级下拉框选项值
		$("select[cf_databindchild]").on("updatechildselectedoption",function(){
			var $self = $(this);
			//子级id
			var childselectid = $self.attr("cf_databindchild");
			//子级
			var $childselect = $("#"+childselectid);
			//子级值
			var childselectval = $childselect.attr("cf_databindchildparam");
			//绑定子级值
			$childselect.val(childselectval);
			//判断是否有孙子级
			var databindchildid = $childselect.attr("cf_databindchild");
			if(databindchildid!=""&&databindchildid!=null){
				$childselect.trigger("updatechildselectedoption");
			}else{
				return;
			}
			
		});
		
		//在表单数据加载完成，表单环节控制事件之前触发
		CForm.on('dynSelectUpdate', function(){
			var $dynselect = $("select[cf_databindchild]");
			//清空子孙级下拉框选项
			$dynselect.trigger("removechildselectoption");
			//更新子孙级下拉框选项
			$dynselect.trigger("updatechildselectoption");
			//绑定子孙级下拉框选项
			$dynselect.trigger("updatechildselectedoption");
			//初始化子孙级查询插件
			$dynselect.trigger("updatechildselectdynquery");
		});
	};
	//初始化域关联
	CForm.initDynCheck = function() {
		var $dyncheck = $(".cfDynCheck");
		$(document).on("dyncheck",".cfDynCheck",function(){
			var $self = $(this);
			var p = JSON.parse($self.attr('cf_dyncheckparam'));
			var condition = p.c;
			var value = p.v;
			var action = p.a;
			var target = p.t;
			var $target = $("#"+target)
			var isMatching  = false;
			switch(condition){
				case "contains":
					if($self.val().indexOf(value)>=0){
						isMatching = true;
					}
					break;
				case "uncontains":
					if($self.val().indexOf(value)<0){
						isMatching = true;
					}
					break;
				case "matches":
					var val = $.trim($self.val());
					if(val && eval(value).test(val)) {
						isMatching = true;
					}
					break;
				case ">":
					if($self.val() > value){
						isMatching = true;
					}
					break;
				case ">=":
					if($self.val() >= value){
						isMatching = true;
					}
					break;
				case "==":
					if($self.val() == value){
						isMatching = true;
					}
					break;
				case "<=":
					if($self.val() <= value){
						isMatching = true;
					}
					break;
				case "<":
					if($self.val() < value){
						isMatching = true;
					}
					break;
				case "!=":
					if($self.val() != value){
						isMatching = true;
					}
					break;
			}
			switch(action){
				case "isReadOnly":
					if(isMatching){
						$target.attr('readonly','readonly').addClass('cfIsReadonly')
					}else{
						$target.removeAttr('readonly').removeClass('cfIsReadonly');
					}
					break;
				case "isHidden":
					var $td = $target.parent("td");
					if(isMatching){
						$target.hide();
						// 如果当前单元格内的域全部隐藏
						if (!$td.find(":input[type!=hidden]").not("[style*='display: none']").length) {
							// 1、隐藏当前单元格，并添加空单元格
							var $newNullTd = $td.clone().empty().addClass($target.attr("id"));
							$td.hide().after($newNullTd);
							// 2、非动态行的情况下，判断是否需要隐藏前一单元格
							if (!$td.parents(".cfDynRow").length) {
								var $pTd = $target.parent("td").prev("td");
								if ($pTd.length) {
									var $vInputs = $pTd.find(":input[type!=hidden]").not("[style*='display: none']");
									if (!$vInputs.length) {
										var $newNullPTd = $pTd.clone().empty().addClass($target.attr("id"));
										$pTd.addClass("relatedto"+$target.attr("id")).hide().after($newNullPTd);
									}
								}
							}
						}
						var $tr = $target.parents("tr").eq(0);
						var $trField = $tr.find(":input[type!=hidden]").not("[style*='display: none']");
						if (!$trField.length) {
							$tr.hide();
							// 解决ie多余线条问题
							$tr.children().hide();
						}
					}else{
						//去除因为隐藏操作添加的空单元格
						$("."+$target.attr("id")).remove();
						//域显示
						$target.show();
						//域父级单元格显示
						$td.show();
						//关联单元格显示
						$(".relatedto"+$target.attr("id")).show().removeClass("relatedto"+$target.attr("id"));
						$td.parents("tr").show();
						$td.parents("tr").children("td:empty").show();
					}
					break;
				case "isRequired":
					if(isMatching){
						$("#"+target).addClass('cfIsRequired');
					}else{
						$("#"+target).removeClass('cfIsRequired');
					}
					break;
			}
			
		});
		$dyncheck.on("change",function(){
			$(this).trigger("dyncheck");
		});
	}


    CForm.initQRCodeImage=function(){
        $(".cfImage").attr("src",L5.webPath + "/service/tools/getQRCode?content=2018070822");
	};
	/**
	 * 云表单加载完毕后需要执行的初始化操作
	 */
	CForm.init = function() {
		// 初始化域长度控制
		CForm.initFieldLengthCtr();
		
		// 多行文本框高度自适应
		CForm.initAutoHeight();
		
		// 初始化tab
		if ($(".cfTab li").length) {
			CForm.initTab();
		}

		// 初始化日期、日期时间
		if ($(".cfDateTime,.cfDate").length) {
			CForm.initDate();
		}
		
		// 初始化通用帮助
		if ($(".cfOrganCommonHelp").length) {
			CForm.initCommonHelp();
		}
		
		// 初始化动态行
		if ($(".cfDynRow").length) {
			CForm.initDynRow();
		}
		
		// 初始化动态表格
		if ($(".cfDynTable").length) {
			CForm.initDynTable();
		}
		
		//初始化文件上传下载
		if($(".cfFile").length){
			CForm.initFile();
		}
		
		//初始化多文件上传下载
		if($(".cfFiles").length){
			CForm.initFiles();
		}
		//初始化级联查询
		if($("select[cf_databindchild]").length){
			CForm.initDynSelect();
		}
		//初始化域关联
		if($(".cfDynCheck").length){
			CForm.initDynCheck();
		}
        //初始化二维码
        if($(".cfImage").length){
            CForm.initQRCodeImage();
        }

	};
	
})(jQuery);

/**
 * 工具类--Map
 */
(function($) {
	/**
	 * 模拟后台的Map，可构造前台Map对象
	 */
	CForm.Map = function(classname, data) {
		this.javaClass = classname ? classname : "HashMap";// short name
		this.map = data ? data : new Object();
		this.length = this.size();
	};

	CForm.Map.prototype = {

		length : null,
		/**
		 * 把值放入map对象中，比如：data.put(key,value);
		 * 
		 * @method put
		 * @param {String}
		 *            key 键值
		 * @param {Oject}
		 *            value 值
		 */
		put : function(key, value) {
			if (!(this.map[key] || this.map[key] == "")) {
				this.length++;
			}
			this.map[key] = value;
		},
		/**
		 * 根据键值从map对象中取值，比如：var val = data.get(key);
		 * 
		 * @method get
		 * @param {String}
		 *            key 键值
		 * @return {Oject} 值
		 */
		get : function(key) {
			return this.map[key];
		},
		/**
		 * 从map对象中移除指定键值的值，比如：data.remove(key);
		 * 
		 * @method remove
		 * @param {String}
		 *            key 键值
		 * @return {Oject} 移除的对象
		 */
		remove : function(key) {
			var ret = this.map[key];
			if (ret || ret == "") {
				this.length--;
			}
			delete this.map[key];
			
			return ret;
		},
		/**
		 * 获得map对象中值的个数
		 * 
		 * @method size
		 * @return {Int} 长度
		 */
		size : function() {
			if (this.length !== null)
				return this.length;
			this.length = 0;
			for ( var i in this.map) {
				this.length++;
			}
			return this.length;
		},
		/**
		 * 将map对象中所有的值组装为字符串返回
		 * 
		 * @method toString
		 * @return {String} 数据
		 */
		toString : function() {
			var ret = "{";
			var j = 0;
			for ( var i in this.map) {
				ret += i.toString() + ":" + this.get(i).toString();
				if (j++ < this.size() - 1)
					ret += ",";
			}
			ret += "}";
			return ret;
		}
	};
})(jQuery);

/**
 * 工具类--List
 */
(function($) {
	CForm.List = function(classname, data) {
		this.javaClass = classname ? classname : "ArrayList";
		this.list = data ? data : new Array();
	};

	CForm.List.prototype = {
		/**
		 * 把对象添加到list对象中
		 * 
		 * @method add
		 * @param {Oject}
		 *            obj 对象
		 */
		add : function(obj) {
			this.list.push(obj);
		},
		/**
		 * 根据索引得到对象
		 * 
		 * @method get
		 * @param {String}
		 *            index 索引
		 * @return {Oject} 对象
		 */
		get : function(index) {
			var val = this.list[index];
			return val;
		},
		/**
		 * 得到list对象的长度
		 * 
		 * @method size
		 * @return {Int} 长度
		 */
		size : function() {
			return this.list.length
		},
		/**
		 * 将list对象中的数据转换组装成字符串返回
		 * 
		 * @method toString
		 * @return {String} 数据
		 */
		toString : function() {
			var ret = "[";
			for ( var i = 0; i < this.size(); i++) {
				ret += this.get(i).toString();
				if (i < this.size() - 1)
					ret += ",";
			}
			ret += "]";
			return ret;
		}
	};
})(jQuery);
/**
 * 生成UUID
 * CForm.createUUID()
 * 
*/
(function($){
	function UUID(){
	    this.id = this.createUUID();
	}
	 
	UUID.prototype.valueOf = function(){ return this.id; };
	UUID.prototype.toString = function(){ return this.id; };
	 
	UUID.prototype.createUUID = function(){
	    var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
	    var dc = new Date();
	    var t = dc.getTime() - dg.getTime();
	    var tl = UUID.getIntegerBits(t,0,31);
	    var tm = UUID.getIntegerBits(t,32,47);
	    var thv = UUID.getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
	    var csar = UUID.getIntegerBits(UUID.rand(4095),0,7);
	    var csl = UUID.getIntegerBits(UUID.rand(4095),0,7);
	    var n = UUID.getIntegerBits(UUID.rand(8191),0,7) +
	            UUID.getIntegerBits(UUID.rand(8191),8,15) +
	            UUID.getIntegerBits(UUID.rand(8191),0,7) +
	            UUID.getIntegerBits(UUID.rand(8191),8,15) +
	            UUID.getIntegerBits(UUID.rand(8191),0,15); // this last number is two octets long
	    return tl + tm  + thv  + csar + csl + n;
	};
	UUID.getIntegerBits = function(val,start,end){
	 var base16 = UUID.returnBase(val,16);
	 var quadArray = new Array();
	 var quadString = '';
	 var i = 0;
	 for(i=0;i<base16.length;i++){
	     quadArray.push(base16.substring(i,i+1));   
	 }
	 for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){
	     if(!quadArray[i] || quadArray[i] == '') quadString += '0';
	     else quadString += quadArray[i];
	 }
	 return quadString;
	};
	UUID.returnBase = function(number, base){
	 return (number).toString(base).toUpperCase();
	};
	 
	UUID.rand = function(max){
	 return Math.floor(Math.random() * (max + 1));
	};
	CForm.createUUID=function(){
		return new UUID();
	}
})(jQuery)
