package com.inspur.health.card.dao;

import com.inspur.health.card.data.RegInfo;

public interface UserRegMapper {
	// 保存注册信息
	void saveInfo(RegInfo info);

	// 修改注册信息
	void updateInfo(RegInfo info);
}
