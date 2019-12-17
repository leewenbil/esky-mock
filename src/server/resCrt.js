/**
 * response响应生成器
 * rule = {
 * 	isOk: true,
 * 	delay: 500,
 * 	response: Object/Function
 * }
 */
"use strict";
const Mockjs = require("mockjs");
const apiAdapter = require("./apiAdapter");
const PathToRegexpLib = require("path-to-regexp");

function findRule(path) {
  // 若文件变动，需更新模块缓存
  console.log(path)
  let data = require(global.__mockDataDir);
  let rule = data[path] || data["/" + path];
  if (rule === undefined) {
	let keys = Object.keys(data);
    keys.some(key => {
	  let keyRegexp = PathToRegexpLib.pathToRegexp(key);
      if (keyRegexp.test(path)) {
		rule = data[key];
		return true;
      }
    });
  }

  return rule;
}
module.exports = function(path, req, res) {
  let rule = findRule(path);
  let rs = {
    isOk: false,
    useMockjs: true
  };
  if (!rule) return rs;
  if (typeof rule === "string" || !rule.response) {
    rs.response = rule;
  }
  rs.isOk = true;
  rs = Object.assign(rs, rule);
  if (typeof rs.response === "function") {
    rs.response = rs.response(req, res);
  }
  // 使用Mock解析
  if (rs.useMockjs && rs.response) {
    rs.response = apiAdapter(rs.response, req, res);
    rs.response = Mockjs.mock(rs.response);
  }
  return rs;
};
