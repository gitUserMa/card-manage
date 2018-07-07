package com.inspur.health.card.service.impl;

import java.util.HashMap;
import java.util.Map;

import org.loushang.bsp.api.user.IUserService;
import org.loushang.bsp.api.user.UserServiceFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inspur.health.card.dao.UserRegMapper;
import com.inspur.health.card.data.RegInfo;
import com.inspur.health.card.service.IUserRegService;

@Service("userRegService")
public class UserRegServiceImpl implements IUserRegService {

	@Autowired
	private UserRegMapper userRegMapper;

	@Override
	@Transactional
	public String regUser(RegInfo info) {
		// TODO 企业信息写入数据库
		userRegMapper.saveInfo(info);
		// TODO 发起审核流程
		// TODO 1. 根据预置Organ信息查询流程
		// TODO 2. 根据流程信息填写表单
		// TODO 3. 发起流程

		return null;
	}

	@Override
	public String auditUser(String id, String auditStatus) {
		RegInfo info = new RegInfo();
		info.setId(id);
		info.setAuditStatus(auditStatus);
		userRegMapper.updateInfo(info);

		if (AUDIT_STATUS_PASS.equalsIgnoreCase(auditStatus)) {
			IUserService bspUserService = UserServiceFactory.getUserService();
			Map<String, String> userMap = new HashMap<String, String>();
			bspUserService.addUser(userMap);
		}
		return auditStatus;
	}

}
