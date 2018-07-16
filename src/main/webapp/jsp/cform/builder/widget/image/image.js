/*
 * 表单--text,单行文本
 */
(function ($) {
    var overrides = {
        // 创建组件模板
        tpl: '<image id="{fieldId}" name="{fieldName}" type="image" value="" class="cfImage"'
        // 域长度
        + ' cf_fieldLength="100"'
        // 元素类型
        + ' cf_elementType="field"'
        // 自动生成ID
        + ' cf_isCreateId="{isCreateId}"'
        // 组件ID
        + ' cf_widgetId="{widgetId}">',
        // 初始化组件
        init: function (builder) {
            this.builder = builder;
            this.initEvent();
        },

        // 初始化事件
        initEvent: function () {
            // 注册放下事件
            this.builder.on(this.id + "_drop", $.proxy(this.drop, this));
            // 注册双击事件
            this.builder
                .on(this.id + "_dblClick", $.proxy(this.dblClick, this));
        },

        // 放下单行文本
        drop: function (e, target) {
            // 只能放在td里
            if (target.tagName != "TD") {
                $td = $(target).parent("td");
                if ($td.length <= 0) {
                    cfalert(L.getLocaleMessage("cf.widget.textincell", "单行文本只能放到单元格内！"));
                    return;
                }
                target = $td[0];
            }

            var textTpl = new $.XTemplate(this.tpl);
            var fieldId = CForm.generateId();
            var fieldName = L.getLocaleMessage("cf.widget.text", "单行文本");
            var widgetId = this.id;


            target.nextStep = function (attrObj) {
                if (!attrObj) {
                    return;
                }

                // 设置组件定义ID
                fieldId = attrObj.fieldId;
                // 设置组件名称
                fieldName = attrObj.fieldName;

                var $text = textTpl.append(target, {
                    "fieldId": fieldId,
                    "fieldName": fieldName,
                    "widgetId": widgetId,
                    // 是否自动根据组件名称生成ID
                    "isCreateId": attrObj.isCreateId
                }, true);

                // 动态生成业务模型
                if (CForm.isCreateTable == "1") {
                    // 业务模型项ID
                    $text.attr("cf_modelItemId", fieldId);
                    // 业务模型项名称
                    $text.attr("cf_modelItemName", fieldName);
                    //业务模型项长度
                    if (window.getModelItemLengthByFieldLength) {
                        var modelItemLength = getModelItemLengthByFieldLength(
                            $text.attr("cf_fieldLength"));
                        if ($.isNumeric(modelItemLength)) {
                            $text.attr("cf_modelItemLength", modelItemLength);
                        }
                    }
                }
            };

            // 获取组件的属性，如组件的名称和ID，如果目标TD前面的TD中有文本，则使用该文本
            // 作为组件的名称，并把该名称转化为拼音作为组件的ID
            CForm.getFieldAttr(target);
        },

        // 双击单行文本
        dblClick: function (e, target) {
            // 原属性值
            var oldProperty = {
                /**
                 * 基本属性
                 */
                // 域ID
                fieldId: $(target).attr("id"),
                // 域名称
                fieldName: $(target).attr("name"),
                // 是否自动生成ID
                isCreateId: $(target).attr("cf_isCreateId"),
                /**
                 * 数据绑定
                 */
                // 静态值
                value: $(target).val(),
                // 数据绑定类型
                dataBindType: $(target).attr("cf_dataBindType"),
                // 数据绑定参数
                dataBindParam: $(target).attr("cf_dataBindParam")
            };

            showWindow(L.getLocaleMessage("cf.widget.text", "单行文本"), "widget/image/textattr.jsp", 400, 400,
                oldProperty, handleReturn);

            /**
             * 处理返回值
             */
            function handleReturn(result) {
                if (!result) {
                    return;
                }

                // 新属性值
                var newProperty = {
                    /**
                     * 基本属性
                     */
                    // 域ID
                    id: result.fieldId,
                    // 域ID
                    name: result.fieldName,
                    // 是否自动生成ID
                    cf_isCreateId: result.isCreateId,
                    /**
                     * 数据绑定
                     */
                    // 静态值
                    value: result.value ? result.value : "",
                    // 数据绑定类型
                    cf_dataBindType: result.dataBindType ? result.dataBindType
                        : function () {
                            $(this).removeAttr("cf_databindtype");
                        },
                    // 数据绑定参数
                    cf_dataBindParam: result.dataBindParam ? result.dataBindParam
                        : function () {
                            $(this).removeAttr("cf_databindparam");
                        }
                };
                $(target).attr(newProperty);

                $(target).attr("src",L5.webPath+result.value);
                // 动态生成业务模型
                if (CForm.isCreateTable == "1") {
                    // 业务模型项ID
                    $(target).attr("cf_modelItemId", result.fieldId);
                    // 业务模型项名称
                    $(target).attr("cf_modelItemName", result.fieldName);
                }
            }
        }
    };

    CFImage = $.inherit(CFWidget, overrides);
    // 注册组件
    CForm.reg(CFImage);
})(jQuery);
