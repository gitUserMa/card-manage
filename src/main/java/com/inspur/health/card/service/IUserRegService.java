package com.inspur.health.card.service;

import com.inspur.health.card.data.RegInfo;

public interface IUserRegService {
	
	final static String AUDIT_STATUS_PASS = "1";
	final static String AUDIT_STATUS_NO_PASS = "0";
	
	// 用户注册
	String regUser(RegInfo info);

	// 用户审核
	String auditUser(String id, String auditStatus);
}
