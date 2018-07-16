package com.inspur.health.card.controller;

import com.inspur.health.card.utils.QRCodeUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by ma.liang on 2018/7/7.
 *
 * @author ma.liang
 */
@Controller
@RequestMapping("/tools")
public class QRCodeController {

    /**
     * 生成二维码，返回到页面上
     *
     * @param response
     */
    @RequestMapping(value = "/getQRCode", method = {RequestMethod.POST, RequestMethod.GET})
    public void getErWeiCode(HttpServletResponse response) {
        String content="2018071234";
        ServletOutputStream stream = null;
        try {
            if (content != null && !"".equals(content)) {
                QRCodeUtil.createImage(content, response);
                stream = response.getOutputStream();
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (stream != null) {
                try {
                    stream.flush();
                    stream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
