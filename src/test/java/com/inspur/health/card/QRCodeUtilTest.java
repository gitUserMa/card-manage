package com.inspur.health.card;

import com.inspur.health.card.utils.QRCodeUtil;
import org.junit.Assert;

import java.io.File;

/**
 * 测试二维码工具类
 * Created by ma.liang on 2018/7/7.
 *
 * @author ma.liang
 */
public class QRCodeUtilTest {

    @org.junit.Test
    public void createImageTest() {
        try {
            String content = "2018060201";
            String filePath = "F://myQRImage.jpg";
            QRCodeUtil.createImage(content, filePath);
            File myFile = new File(filePath);
            Assert.assertTrue(myFile.exists());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
