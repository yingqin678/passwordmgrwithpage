CREATE TABLE `account` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL COMMENT '应用名，明文',
  `password` VARCHAR(128) NOT NULL COMMENT '密码，密文',
  `accountTempcol` VARCHAR(128) NOT NULL COMMENT '账号名，密文',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);
