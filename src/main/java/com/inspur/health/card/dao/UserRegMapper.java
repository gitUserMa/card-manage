package com.inspur.health.card.dao;

import com.inspur.health.card.data.RegInfo;

public interface UserRegMapper {
	// ����ע����Ϣ
	void saveInfo(RegInfo info);

	// �޸�ע����Ϣ
	void updateInfo(RegInfo info);
}
