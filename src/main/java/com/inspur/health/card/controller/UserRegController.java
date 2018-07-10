package com.inspur.health.card.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.inspur.health.card.data.RegInfo;
import com.inspur.health.card.service.IUserRegService;

@Controller
@RequestMapping("/users")
public class UserRegController {

	@Autowired
	private IUserRegService userRegService;

	@RequestMapping(method = RequestMethod.POST)
	@ResponseBody
	public String regUser(@RequestBody RegInfo info) {
		return userRegService.regUser(info);
	}
}
