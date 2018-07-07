package com.inspur.health.card.service;

import com.inspur.health.card.data.RegInfo;

public interface IUserRegService {
	
	final static String AUDIT_STATUS_PASS = "1";
	final static String AUDIT_STATUS_NO_PASS = "0";
	
	// �û�ע��
	String regUser(RegInfo info);

	// �û����
	String auditUser(String id, String auditStatus);
}
